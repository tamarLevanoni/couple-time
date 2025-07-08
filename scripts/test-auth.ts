import { prisma } from '../src/lib/db';
import bcrypt from 'bcryptjs';

async function testAuth() {
  try {
    console.log('🔐 Testing authentication system...');

    // Test 1: Create a test user with email/password
    console.log('\n1. Testing user registration...');
    const testEmail = 'test@example.com';
    const testPassword = 'test123';
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    if (existingUser) {
      console.log('   ⚠️  Test user already exists, skipping creation');
    } else {
      const hashedPassword = await bcrypt.hash(testPassword, 12);
      const newUser = await prisma.user.create({
        data: {
          email: testEmail,
          name: 'Test User',
          phone: '050-1234567',
          password: hashedPassword,
          roles: ['USER'],
          managedCenterIds: [],
          supervisedCenterIds: [],
          isActive: true,
        },
      });
      console.log(`   ✅ Created test user: ${newUser.email}`);
    }

    // Test 2: Verify password hashing
    console.log('\n2. Testing password verification...');
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    if (user && user.password) {
      const isValid = await bcrypt.compare(testPassword, user.password);
      console.log(`   ${isValid ? '✅' : '❌'} Password verification: ${isValid ? 'PASS' : 'FAIL'}`);
    }

    // Test 3: Check role system
    console.log('\n3. Testing role system...');
    const adminUser = await prisma.user.findUnique({
      where: { email: 'admin@gamerentals.org.il' },
    });

    if (adminUser) {
      console.log(`   ✅ Admin user roles: ${adminUser.roles.join(', ')}`);
      console.log(`   ✅ Managed centers: ${adminUser.managedCenterIds.length}`);
      console.log(`   ✅ Supervised centers: ${adminUser.supervisedCenterIds.length}`);
    }

    // Test 4: Test available game instances for rental
    console.log('\n4. Testing rental system readiness...');
    const availableGames = await prisma.gameInstance.findMany({
      where: { status: 'AVAILABLE' },
      include: {
        game: { select: { name: true } },
        center: { select: { name: true } },
      },
    });

    console.log(`   ✅ Available game instances: ${availableGames.length}`);
    if (availableGames.length > 0) {
      console.log(`   📋 Example: "${availableGames[0].game.name}" at ${availableGames[0].center.name}`);
    }

    console.log('\n✨ Authentication system test completed successfully!');
    console.log('\n📝 Ready for testing:');
    console.log('   - User registration: POST /api/auth/register');
    console.log('   - Login: NextAuth signin');
    console.log('   - Guest rental: POST /api/rentals/guest');
    console.log('   - Current user: GET /api/auth/me');

  } catch (error) {
    console.error('❌ Authentication test failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testAuth();