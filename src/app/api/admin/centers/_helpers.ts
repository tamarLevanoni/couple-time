import { prisma } from '@/lib/db';
import { Role } from '@/types/schema';

/**
 * Validates that a coordinator exists, has the correct role, is active,
 * and doesn't already manage another center
 */
export async function validateCoordinator(coordinatorId: string) {
  const coordinator = await prisma.user.findFirst({
    where: {
      id: coordinatorId,
      roles: { has: Role.CENTER_COORDINATOR },
      isActive: true,
    },
    select: {
      managedCenter: { select: { name: true } },
    },
  });

  if (!coordinator) {
    throw new Error('Coordinator not found or invalid: must have CENTER_COORDINATOR role and be active');
  }

  if (coordinator.managedCenter) {
    throw new Error(`Coordinator already manages another center: "${coordinator.managedCenter.name}"`);
  }
}

/**
 * Validates that a super coordinator exists, has the correct role, and is active
 */
export async function validateSuperCoordinator(superCoordinatorId: string) {
  const superCoordinator = await prisma.user.findFirst({
    where: {
      id: superCoordinatorId,
      roles: { has: Role.SUPER_COORDINATOR },
      isActive: true,
    },
  });

  if (!superCoordinator) {
    throw new Error('Super coordinator not found or invalid: must have SUPER_COORDINATOR role and be active');
  }
}
