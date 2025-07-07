import { NextRequest } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/db';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';
import { requireCoordinator } from '@/lib/api-auth';
import { RentalStatus, GameInstanceStatus } from '@prisma/client';

const bulkActionSchema = z.object({
  rentalIds: z.array(z.string()).min(1, 'נדרש לפחות רנטל אחד'),
  action: z.enum(['approve', 'reject', 'return']),
  rejectionReason: z.string().optional(),
  expectedReturnDate: z.string().transform((str) => new Date(str)).optional(),
});

// POST /api/rentals/bulk - Bulk actions on rentals
export const POST = withErrorHandling(async (request: NextRequest) => {
  const user = await requireCoordinator(request);
  
  const body = await request.json();
  const { rentalIds, action, rejectionReason, expectedReturnDate } = bulkActionSchema.parse(body);
  
  // Get all rentals and validate permissions
  const rentals = await prisma.rental.findMany({
    where: {
      id: { in: rentalIds }
    },
    include: {
      gameInstance: {
        include: {
          center: true
        }
      }
    }
  });
  
  if (rentals.length !== rentalIds.length) {
    return ApiResponseHelper.error('חלק מההשאלות לא נמצאו');
  }
  
  // Check if user can access all these rentals
  if (!user.roles.includes('ADMIN') && !user.roles.includes('SUPER_COORDINATOR')) {
    const unauthorizedRentals = rentals.filter(rental => 
      rental.gameInstance.center.coordinatorId !== user.id
    );
    
    if (unauthorizedRentals.length > 0) {
      return ApiResponseHelper.forbidden('אין הרשאה לחלק מההשאלות');
    }
  }
  
  // Validate action based on current statuses
  for (const rental of rentals) {
    if (action === 'approve' && rental.status !== RentalStatus.PENDING) {
      return ApiResponseHelper.error(`לא ניתן לאשר השאלה שלא במצב ממתין: ${rental.id}`);
    }
    
    if (action === 'reject' && rental.status !== RentalStatus.PENDING) {
      return ApiResponseHelper.error(`לא ניתן לדחות השאלה שלא במצב ממתין: ${rental.id}`);
    }
    
    if (action === 'return' && rental.status !== RentalStatus.ACTIVE) {
      return ApiResponseHelper.error(`לא ניתן להחזיר השאלה שלא במצב פעיל: ${rental.id}`);
    }
  }
  
  if (action === 'reject' && !rejectionReason) {
    return ApiResponseHelper.error('נדרשת סיבת דחייה');
  }
  
  // Execute bulk action
  const results = await prisma.$transaction(async (tx) => {
    const updatedRentals = [];
    
    for (const rental of rentals) {
      let newStatus: RentalStatus;
      let updateData: any = {};
      
      switch (action) {
        case 'approve':
          newStatus = RentalStatus.ACTIVE;
          updateData = {
            status: newStatus,
            borrowDate: new Date(),
            expectedReturnDate: expectedReturnDate || rental.expectedReturnDate,
          };
          
          // Update game instance
          await tx.gameInstance.update({
            where: { id: rental.gameInstanceId },
            data: {
              status: GameInstanceStatus.BORROWED,
              expectedReturnDate: expectedReturnDate || rental.expectedReturnDate,
            }
          });
          break;
          
        case 'reject':
          newStatus = RentalStatus.REJECTED;
          updateData = {
            status: newStatus,
            rejectionReason,
          };
          break;
          
        case 'return':
          newStatus = RentalStatus.RETURNED;
          updateData = {
            status: newStatus,
            returnDate: new Date(),
          };
          
          // Update game instance
          await tx.gameInstance.update({
            where: { id: rental.gameInstanceId },
            data: {
              status: GameInstanceStatus.AVAILABLE,
              expectedReturnDate: null,
            }
          });
          break;
      }
      
      // Update rental
      const updated = await tx.rental.update({
        where: { id: rental.id },
        data: updateData,
      });
      
      // Create action log
      await tx.action.create({
        data: {
          rentalId: rental.id,
          userId: user.id,
          previousStatus: rental.status,
          newStatus,
          changeReason: rejectionReason || `פעולה קבוצתית: ${action}`,
        }
      });
      
      updatedRentals.push(updated);
    }
    
    return updatedRentals;
  });
  
  // TODO: Send bulk notifications
  
  return ApiResponseHelper.success({
    message: `${results.length} השאלות עודכנו בהצלחה`,
    updatedCount: results.length,
  });
});