import { prisma } from '@/lib/db';
import { Role } from '@prisma/client';
import { JWT } from 'next-auth/jwt';

export class AccessDeniedError extends Error {
  constructor(message = 'Access denied') {
    super(message);
    this.name = 'AccessDeniedError';
  }
}

export class ResourceNotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'ResourceNotFoundError';
  }
}

export async function assertAdminRole(token: JWT) {
  const user = await prisma.user.findFirst({
    where: { id: token.id },
    select: { id: true, roles: true, isActive: true },
  });
  
  if (!user) throw new AccessDeniedError('User not found');
  if (!user.isActive) throw new AccessDeniedError('User inactive');
  if (!user.roles.includes(Role.ADMIN)) throw new AccessDeniedError('Insufficient privileges');
}

export async function assertRentalAccess(rentalId: string, token: JWT, accessLevel: 'user' | 'coordinator' | 'super' | 'admin') {
  
  if (accessLevel === 'user') {
    const rental = await prisma.rental.findFirst({
      where: { id: rentalId },
      select: { id: true, userId: true, status: true },
    });
    if (!rental) throw new ResourceNotFoundError('Rental not found');
    if (rental.userId !== token.id) throw new AccessDeniedError();
    if (rental.status !== 'PENDING') throw new AccessDeniedError('Can only modify pending rentals');
    return;
  }
  
  if (accessLevel === 'coordinator') {
    if (token.role !== Role.CENTER_COORDINATOR) throw new AccessDeniedError();
    const rental = await prisma.rental.findFirst({
      where: { id: rentalId },
      select: { id: true, center: { select: { coordinatorId: true } } },
    });
    if (!rental) throw new ResourceNotFoundError('Rental not found');
    if (rental.center.coordinatorId !== token.id) throw new AccessDeniedError();
    return;
  }
  
  if (accessLevel === 'super') {
    if (token.role !== Role.SUPER_COORDINATOR) throw new AccessDeniedError();
    const rental = await prisma.rental.findFirst({
      where: { id: rentalId },
      select: { id: true, center: { select: { superCoordinatorId: true } } },
    });
    if (!rental) throw new ResourceNotFoundError('Rental not found');
    if (rental.center.superCoordinatorId !== token.id) throw new AccessDeniedError();
    return;
  }
  
  
  throw new AccessDeniedError();
}

export async function assertGameInstanceAccess(gameInstanceId: string, token: JWT, accessLevel: 'coordinator' | 'super') {
  
  if (accessLevel === 'coordinator') {
    if (token.role !== Role.CENTER_COORDINATOR) throw new AccessDeniedError();
    const gameInstance = await prisma.gameInstance.findFirst({
      where: { id: gameInstanceId },
      select: { id: true, center: { select: { coordinatorId: true } } },
    });
    if (!gameInstance) throw new ResourceNotFoundError('Game instance not found');
    if (gameInstance.center.coordinatorId !== token.id) throw new AccessDeniedError();
    return;
  }
  
  if (accessLevel === 'super') {
    if (token.role !== Role.SUPER_COORDINATOR) throw new AccessDeniedError();
    const gameInstance = await prisma.gameInstance.findFirst({
      where: { id: gameInstanceId },
      select: { id: true, center: { select: { superCoordinatorId: true } } },
    });
    if (!gameInstance) throw new ResourceNotFoundError('Game instance not found');
    if (gameInstance.center.superCoordinatorId !== token.id) throw new AccessDeniedError();
    return;
  }
  
  
  throw new AccessDeniedError();
}

export async function assertCenterAccess(centerId: string, token: JWT, accessLevel: 'super') {
  
  if (accessLevel === 'super') {
    if (token.role !== Role.SUPER_COORDINATOR) throw new AccessDeniedError();
    const center = await prisma.center.findFirst({
      where: { id: centerId },
      select: { id: true, superCoordinatorId: true },
    });
    if (!center) throw new ResourceNotFoundError('Center not found');
    if (center.superCoordinatorId !== token.id) throw new AccessDeniedError();
    return;
  }
  
  
  throw new AccessDeniedError();
}

export async function assertUserAccess(targetUserId: string, token: JWT, accessLevel: 'user' | 'coordinator' | 'super') {
  
  if (accessLevel === 'user') {
    if (targetUserId !== token.id) {
      throw new AccessDeniedError();
    }
    return;
  }
  
  if (accessLevel === 'coordinator') {
    if (token.role !== Role.CENTER_COORDINATOR) throw new AccessDeniedError();
    const user = await prisma.user.findFirst({
      where: { id: targetUserId },
      select: { id: true },
    });
    if (!user) throw new ResourceNotFoundError('User not found');
    
    const userRentals = await prisma.rental.findFirst({
      where: {
        userId: targetUserId,
        gameInstances: { some: { center: { coordinatorId: token.id } } }
      }
    });
    if (!userRentals) throw new AccessDeniedError();
    return;
  }
  
  if (accessLevel === 'super') {
    if (token.role !== Role.SUPER_COORDINATOR) throw new AccessDeniedError();
    const user = await prisma.user.findFirst({
      where: { id: targetUserId },
      select: { id: true },
    });
    if (!user) throw new ResourceNotFoundError('User not found');
    
    const userRentals = await prisma.rental.findFirst({
      where: {
        userId: targetUserId,
        gameInstances: { some: { center: { superCoordinatorId: token.id } } }
      }
    });
    if (!userRentals) throw new AccessDeniedError();
    return;
  }
  
  
  throw new AccessDeniedError();
}