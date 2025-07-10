import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
    const { email, password, name, phone } = await req.json();

    // Validate input
    if (!email || !password || !name || !phone) {
      return NextResponse.json(
        { error: 'חסרים פרטים נדרשים' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'הסיסמה חייבת להכיל לפחות 6 תווים' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'המשתמש כבר קיים במערכת' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        roles: [Role.USER],
        managedCenterIds: [],
        supervisedCenterIds: [],
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        roles: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: 'המשתמש נוצר בהצלחה',
      user,
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'שגיאה בהרשמה. נסה שוב מאוחר יותר' },
      { status: 500 }
    );
  }
}