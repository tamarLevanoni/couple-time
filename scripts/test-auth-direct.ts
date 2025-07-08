#!/usr/bin/env tsx

// Test authentication directly
import { prisma } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function testAuthDirect() {
  console.log('🔐 Testing authentication flow directly...\n');

  try {
    // Test finding a user
    const user = await prisma.user.findUnique({
      where: { email: 'admin@gamerentals.org.il' }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    console.log(`✅ User found: ${user.name} (${user.email})`);
    console.log(`   Roles: ${user.roles.join(', ')}`);
    console.log(`   Has password: ${user.password ? 'Yes' : 'No'}`);

    if (user.password) {
      // Test password comparison
      const isValid = await bcrypt.compare('admin123', user.password);
      console.log(`   Password valid: ${isValid ? 'Yes' : 'No'}`);
    }

    console.log('\n✅ Direct auth test completed successfully!');

  } catch (error) {
    console.error('❌ Direct auth test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testAuthDirect();