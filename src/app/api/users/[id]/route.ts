import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { ApiResponseHelper, withErrorHandling } from '@/lib/api-response';
import { requireAuth, requireAdmin } from '@/lib/api-auth';
import { updateUserSchema } from '@/lib/validations';

// GET /api/users/[id] - Get single user
export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const currentUser = await requireAuth(request);
  
  // Check permissions
  const canAccess = 
    params.id === currentUser.id || // User can see themselves
    currentUser.roles.includes('ADMIN') ||
    currentUser.roles.includes('SUPER_COORDINATOR');
  
  if (!canAccess) {
    return ApiResponseHelper.forbidden('אין הרשאה לצפות במשתמש זה');
  }
  
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      roles: true,
      managedCenterIds: true,
      supervisedCenterIds: true,
      defaultDashboard: true,
      isActive: true,
      emailVerified: true,
      phoneVerified: true,
      image: true,
      createdAt: true,
      updatedAt: true,
      // Include related data
      managedCenters: {
        select: {
          id: true,
          name: true,
          city: true,
          area: true,
        }
      },
      supervisedCenters: {
        select: {
          id: true,
          name: true,
          city: true,
          area: true,
        }
      },
      rentals: {
        select: {
          id: true,
          status: true,
          requestDate: true,
          borrowDate: true,
          returnDate: true,
          expectedReturnDate: true,
          gameInstance: {
            select: {
              game: {
                select: {
                  id: true,
                  name: true,
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
        },
        orderBy: {
          requestDate: 'desc'
        },
        take: 10, // Last 10 rentals
      },
      _count: {
        select: {
          rentals: true,
        }
      }
    }
  });
  
  if (!user) {
    return ApiResponseHelper.notFound('משתמש לא נמצא');
  }
  
  return ApiResponseHelper.success(user);
});

// PUT /api/users/[id] - Update user
export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const currentUser = await requireAuth(request);
  
  const body = await request.json();
  const data = updateUserSchema.parse(body);
  
  // Check permissions
  const isOwnProfile = params.id === currentUser.id;
  const isAdmin = currentUser.roles.includes('ADMIN');
  
  if (!isOwnProfile && !isAdmin) {
    return ApiResponseHelper.forbidden('אין הרשאה לעדכן משתמש זה');
  }
  
  // Regular users can only update limited fields
  if (isOwnProfile && !isAdmin) {
    const allowedFields = ['name', 'phone'];
    const restrictedFields = Object.keys(data).filter(key => !allowedFields.includes(key));
    
    if (restrictedFields.length > 0) {
      return ApiResponseHelper.forbidden(`אין הרשאה לעדכן שדות: ${restrictedFields.join(', ')}`);
    }
  }
  
  // Validate email uniqueness if email is being changed
  if (data.email) {
    const existingUser = await prisma.user.findFirst({
      where: {
        email: data.email,
        id: { not: params.id }
      }
    });
    
    if (existingUser) {
      return ApiResponseHelper.conflict('כתובת אימייל כבר בשימוש');
    }
  }
  
  // If roles are being changed, validate the centers assignment
  if (data.roles || data.managedCenterIds || data.supervisedCenterIds) {
    // Only admins can change roles and center assignments
    if (!isAdmin) {
      return ApiResponseHelper.forbidden('רק מנהל יכול לשנות תפקידים והקצאות מוקדים');
    }
    
    // Validate center assignments match roles
    if (data.managedCenterIds && data.managedCenterIds.length > 0) {
      const roles = data.roles || currentUser.roles;
      if (!roles.includes('CENTER_COORDINATOR')) {
        return ApiResponseHelper.error('רק רכזי מוקד יכולים להיות מוקצים למוקדים מנוהלים');
      }
    }
    
    if (data.supervisedCenterIds && data.supervisedCenterIds.length > 0) {
      const roles = data.roles || currentUser.roles;
      if (!roles.includes('SUPER_COORDINATOR') && !roles.includes('ADMIN')) {
        return ApiResponseHelper.error('רק רכזי על ומנהלים יכולים להיות מוקצים למוקדים מפוקחים');
      }
    }
  }
  
  const user = await prisma.user.update({
    where: { id: params.id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      roles: true,
      managedCenterIds: true,
      supervisedCenterIds: true,
      defaultDashboard: true,
      isActive: true,
      emailVerified: true,
      phoneVerified: true,
      image: true,
      updatedAt: true,
      managedCenters: {
        select: {
          id: true,
          name: true,
          city: true,
        }
      },
      supervisedCenters: {
        select: {
          id: true,
          name: true,
          city: true,
        }
      }
    }
  });
  
  return ApiResponseHelper.success(user);
});

// DELETE /api/users/[id] - Delete/deactivate user
export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  await requireAdmin(request);
  
  // Check if user has any active rentals
  const activeRentals = await prisma.rental.count({
    where: {
      userId: params.id,
      status: 'ACTIVE'
    }
  });
  
  if (activeRentals > 0) {
    return ApiResponseHelper.error(
      'לא ניתן למחוק משתמש עם השאלות פעילות',
      400,
      'USER_HAS_ACTIVE_RENTALS'
    );
  }
  
  // Check if user is managing any centers
  const managedCenters = await prisma.center.count({
    where: {
      coordinatorId: params.id
    }
  });
  
  if (managedCenters > 0) {
    return ApiResponseHelper.error(
      'לא ניתן למחוק משתמש שמנהל מוקדים. יש להקצות רכז אחר למוקדים תחילה.',
      400,
      'USER_MANAGES_CENTERS'
    );
  }
  
  // Instead of hard delete, deactivate the user
  await prisma.user.update({
    where: { id: params.id },
    data: { isActive: false }
  });
  
  return ApiResponseHelper.success({ message: 'משתמש הושבת בהצלחה' });
});