#!/usr/bin/env tsx

/**
 * Script to clean up test users for Google OAuth testing
 */

import { prisma } from '../src/lib/db';

async function cleanTestUser() {
  const email = process.argv[2];
  
  if (!email) {
    console.log('Usage: npx tsx scripts/clean-test-user.ts <email>');
    console.log('Example: npx tsx scripts/clean-test-user.ts test@gmail.com');
    process.exit(1);
  }

  try {
    console.log(`🧹 Cleaning test user: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, firstName: true, lastName:true, email: true, googleId: true }
    });

    if (user) {
      // Delete user (this will cascade delete rentals due to FK constraints)
      await prisma.user.delete({
        where: { email }
      });
      
      console.log(`✅ Deleted user:`, {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        googleId: user.googleId
      });
    } else {
      console.log(`ℹ️ User not found: ${email}`);
    }
    
  } catch (error) {
    console.error('❌ Error cleaning user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  cleanTestUser();
}

export { cleanTestUser };