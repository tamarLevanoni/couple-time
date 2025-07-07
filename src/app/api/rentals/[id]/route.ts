import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';
import { requireAuth, requireCoordinator } from '@/lib/api-auth';
import { updateRentalSchema } from '@/lib/validations';
import { RentalStatus, GameInstanceStatus } from '@prisma/client';

// GET /api/rentals/[id] - Get single rental
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const user = await requireAuth(request);
  
  const rental = await prisma.rental.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
        }
      },
      gameInstance: {
        include: {
          game: {
            select: {
              id: true,
              name: true,
              description: true,
              imageUrl: true,
              categories: true,
              targetAudiences: true,
            }
          },
          center: {
            select: {
              id: true,
              name: true,
              city: true,
              area: true,
            }
          }
        }
      },
      actions: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
            }
          }
        },
        orderBy: {
          changedAt: 'desc'
        }
      }
    }
  });
  
  if (!rental) {
    return ApiResponseHelper.notFound('השאלה לא נמצאה');
  }
  
  // Check permissions
  const canAccess = 
    rental.userId === user.id || // User owns the rental
    user.roles.includes('ADMIN') ||
    user.roles.includes('SUPER_COORDINATOR') ||
    (user.roles.includes('CENTER_COORDINATOR') && rental.gameInstance.center.coordinatorId === user.id);
  
  if (!canAccess) {
    return ApiResponseHelper.forbidden('אין הרשאה לצפות בהשאלה זו');
  }
  
  return ApiResponseHelper.success(rental);
});

// PUT /api/rentals/[id] - Update rental (status changes, etc.)
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const user = await requireAuth(request);
  
  const body = await request.json();
  const data = updateRentalSchema.parse(body);
  
  const rental = await prisma.rental.findUnique({
    where: { id: params.id },
    include: {
      gameInstance: {
        include: {
          center: true
        }
      }
    }
  });
  
  if (!rental) {
    return ApiResponseHelper.notFound('השאלה לא נמצאה');
  }
  
  // Check permissions for status changes
  if (data.status) {
    const canChangeStatus = 
      user.roles.includes('ADMIN') ||
      user.roles.includes('SUPER_COORDINATOR') ||
      (user.roles.includes('CENTER_COORDINATOR') && rental.gameInstance.center.coordinatorId === user.id);
    
    if (!canChangeStatus) {
      return ApiResponseHelper.forbidden('אין הרשאה לשנות סטטוס השאלה');
    }
  }
  
  // Validate status transitions
  if (data.status && data.status !== rental.status) {
    const validTransitions: Record<RentalStatus, RentalStatus[]> = {
      [RentalStatus.PENDING]: [RentalStatus.ACTIVE, RentalStatus.REJECTED],
      [RentalStatus.ACTIVE]: [RentalStatus.RETURNED],
      [RentalStatus.RETURNED]: [], // No transitions from returned
      [RentalStatus.REJECTED]: [], // No transitions from rejected
    };
    
    if (!validTransitions[rental.status].includes(data.status)) {
      return ApiResponseHelper.error(
        'מעבר סטטוס לא תקין',
        400,
        'INVALID_STATUS_TRANSITION'
      );
    }
  }
  
  // Prepare update data
  const updateData: any = {};
  
  if (data.status) {
    updateData.status = data.status;
    
    // Set dates based on status
    if (data.status === RentalStatus.ACTIVE && !rental.borrowDate) {
      updateData.borrowDate = new Date();
    }
    
    if (data.status === RentalStatus.RETURNED && !rental.returnDate) {
      updateData.returnDate = new Date();
    }
  }
  
  if (data.expectedReturnDate) {
    updateData.expectedReturnDate = data.expectedReturnDate;
  }
  
  if (data.notes) {
    updateData.notes = data.notes;
  }
  
  if (data.rejectionReason) {
    updateData.rejectionReason = data.rejectionReason;
  }
  
  // Update rental
  const updatedRental = await prisma.$transaction(async (tx) => {
    const updated = await tx.rental.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        gameInstance: {
          include: {
            game: {
              select: {
                id: true,
                name: true,
                description: true,
                imageUrl: true,
              }
            },
            center: {
              select: {
                id: true,
                name: true,
                city: true,
              }
            }
          }
        }
      }
    });
    
    // Update game instance status
    if (data.status) {
      if (data.status === RentalStatus.ACTIVE) {
        await tx.gameInstance.update({
          where: { id: rental.gameInstanceId },
          data: {
            status: GameInstanceStatus.BORROWED,
            expectedReturnDate: data.expectedReturnDate || rental.expectedReturnDate,
          }
        });
      } else if (data.status === RentalStatus.RETURNED || data.status === RentalStatus.REJECTED) {
        await tx.gameInstance.update({
          where: { id: rental.gameInstanceId },
          data: {
            status: GameInstanceStatus.AVAILABLE,
            expectedReturnDate: null,
          }
        });
      }
    }
    
    // Create action log
    if (data.status && data.status !== rental.status) {
      await tx.action.create({
        data: {
          rentalId: params.id,
          userId: user.id,
          previousStatus: rental.status,
          newStatus: data.status,
          changeReason: data.rejectionReason || 'שינוי סטטוס',
        }
      });
    }
    
    return updated;
  });
  
  // TODO: Send notifications based on status change
  
  return ApiResponseHelper.success(updatedRental);
});

// DELETE /api/rentals/[id] - Cancel rental (only if pending)
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const user = await requireAuth(request);
  
  const rental = await prisma.rental.findUnique({
    where: { id: params.id },
    include: {
      gameInstance: {
        include: {
          center: true
        }
      }
    }
  });
  
  if (!rental) {
    return ApiResponseHelper.notFound('השאלה לא נמצאה');
  }
  
  // Check permissions
  const canCancel = 
    rental.userId === user.id || // User owns the rental
    user.roles.includes('ADMIN') ||
    user.roles.includes('SUPER_COORDINATOR') ||
    (user.roles.includes('CENTER_COORDINATOR') && rental.gameInstance.center.coordinatorId === user.id);
  
  if (!canCancel) {
    return ApiResponseHelper.forbidden('אין הרשאה לבטל השאלה זו');
  }
  
  // Can only cancel pending rentals
  if (rental.status !== RentalStatus.PENDING) {
    return ApiResponseHelper.error(
      'ניתן לבטל רק השאלות ממתינות',
      400,
      'CANNOT_CANCEL_NON_PENDING'
    );
  }
  
  await prisma.rental.delete({
    where: { id: params.id }
  });
  
  return ApiResponseHelper.success({ message: 'השאלה בוטלה בהצלחה' });
});