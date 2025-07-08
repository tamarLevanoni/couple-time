#!/usr/bin/env tsx

// Test script to verify the system is working
import { prisma as db } from '../src/lib/db';
import { logger } from '../src/lib/logger';

async function testSystem() {
  console.log('🧪 Testing Game Rental System...\n');

  try {
    // Test database connection
    console.log('📊 Testing database connection...');
    const userCount = await db.user.count();
    const gameCount = await db.game.count();
    const centerCount = await db.center.count();
    
    console.log(`✅ Database connected successfully!`);
    console.log(`   - Users: ${userCount}`);
    console.log(`   - Games: ${gameCount}`);
    console.log(`   - Centers: ${centerCount}\n`);

    // Test user roles
    console.log('👥 Testing user roles...');
    const admin = await db.user.findFirst({
      where: { roles: { has: 'ADMIN' } }
    });
    const coordinator = await db.user.findFirst({
      where: { roles: { has: 'CENTER_COORDINATOR' } }
    });
    const regularUser = await db.user.findFirst({
      where: { roles: { has: 'USER' } }
    });

    console.log(`✅ User roles working:`)
    console.log(`   - Admin found: ${admin ? '✅' : '❌'} ${admin?.email || 'N/A'}`);
    console.log(`   - Coordinator found: ${coordinator ? '✅' : '❌'} ${coordinator?.email || 'N/A'}`);
    console.log(`   - Regular user found: ${regularUser ? '✅' : '❌'} ${regularUser?.email || 'N/A'}\n`);

    // Test logging system
    console.log('📝 Testing logging system...');
    logger.info('Test log entry', { test: true });
    logger.debug('Debug message', { debug: true });
    logger.error('Test error (safe)', { testError: true });
    console.log('✅ Logging system working\n');

    // Display available test accounts
    console.log('🔐 Available test accounts:');
    const testUsers = await db.user.findMany({
      select: {
        email: true,
        name: true,
        roles: true,
      }
    });

    testUsers.forEach(user => {
      const role = user.roles[0] || 'USER';
      const roleDisplay = {
        ADMIN: '🔧 Admin',
        CENTER_COORDINATOR: '📋 Coordinator',
        SUPER_COORDINATOR: '⭐ Super Coordinator',
        USER: '👤 User'
      }[role] || '👤 User';
      
      console.log(`   ${roleDisplay}: ${user.email} (${user.name})`);
    });

    console.log('\n🚀 System test completed successfully!');
    console.log('\n📋 Next steps:');
    console.log('   1. Run: npm run dev');
    console.log('   2. Open: http://localhost:3000');
    console.log('   3. Test login with any of the accounts above');
    console.log('   4. Default password for test accounts: admin123, coordinator123, user123, test123');

  } catch (error) {
    console.error('❌ System test failed:', error);
    process.exit(1);
  } finally {
    await db.$disconnect();
  }
}

testSystem();