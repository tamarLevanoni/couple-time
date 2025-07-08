import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { Role, RentalStatus } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { 
      email, 
      name, 
      phone, 
      gameInstanceId, 
      notes 
    } = await req.json();

    // Validate input
    if (!email || !name || !gameInstanceId) {
      return NextResponse.json(
        { error: 'חסרים פרטים נדרשים' },
        { status: 400 }
      );
    }

    // Check if game instance exists and is available
    const gameInstance = await prisma.gameInstance.findUnique({
      where: { id: gameInstanceId },
      include: {
        game: true,
        center: true,
      },
    });

    if (!gameInstance) {
      return NextResponse.json(
        { error: 'המשחק לא נמצא' },
        { status: 404 }
      );
    }

    if (gameInstance.status !== 'AVAILABLE') {
      return NextResponse.json(
        { error: 'המשחק אינו זמין כרגע' },
        { status: 400 }
      );
    }

    // Check if user already exists
    let user = await prisma.user.findUnique({
      where: { email },
    });

    // If user doesn't exist, create one
    if (!user) {
      // Generate a temporary password (user will need to reset it)
      const tempPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(tempPassword, 12);

      user = await prisma.user.create({
        data: {
          email,
          name,
          phone: phone || null,
          password: hashedPassword,
          roles: [Role.USER],
          managedCenterIds: [],
          supervisedCenterIds: [],
          isActive: true,
        },
      });
    }

    // Create rental request
    const rental = await prisma.rental.create({
      data: {
        userId: user.id,
        gameInstanceId,
        status: RentalStatus.PENDING,
        notes: notes || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        gameInstance: {
          include: {
            game: true,
            center: {
              include: {
                coordinator: {
                  select: {
                    id: true,
                    name: true,
                    phone: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // TODO: Send notification to coordinator
    // This would be implemented in the notification system

    return NextResponse.json({
      message: 'בקשת ההשאלה נשלחה בהצלחה',
      rental: {
        id: rental.id,
        status: rental.status,
        requestDate: rental.requestDate,
        game: rental.gameInstance.game,
        center: rental.gameInstance.center,
        coordinator: rental.gameInstance.center.coordinator,
      },
      userCreated: !await prisma.user.findFirst({
        where: { 
          email,
          createdAt: { lt: new Date(Date.now() - 1000) } // Check if created more than 1 second ago
        }
      }),
    });
  } catch (error) {
    console.error('Guest rental error:', error);
    return NextResponse.json(
      { error: 'שגיאה ביצירת בקשת השאלה' },
      { status: 500 }
    );
  }
}