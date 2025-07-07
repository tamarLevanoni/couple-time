import { prisma } from '../lib/db';

async function testDatabaseConnection() {
  console.log('🔗 Testing database connection...');
  
  try {
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test queries
    const userCount = await prisma.user.count();
    console.log(`👤 Users in database: ${userCount}`);
    
    const centerCount = await prisma.center.count();
    console.log(`🏢 Centers in database: ${centerCount}`);
    
    const gameCount = await prisma.game.count();
    console.log(`🎮 Games in database: ${gameCount}`);
    
    const gameInstanceCount = await prisma.gameInstance.count();
    console.log(`📦 Game instances in database: ${gameInstanceCount}`);
    
    // Test relations
    const centersWithCoordinators = await prisma.center.findMany({
      include: {
        coordinator: {
          select: {
            name: true,
            email: true,
          },
        },
        gameInstances: {
          include: {
            game: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    
    console.log('🔗 Centers with coordinators and games:');
    centersWithCoordinators.forEach((center) => {
      console.log(`  📍 ${center.name} (${center.city})`);
      console.log(`    👤 Coordinator: ${center.coordinator?.name || 'Not assigned'}`);
      console.log(`    🎮 Games: ${center.gameInstances.length}`);
      center.gameInstances.forEach((instance) => {
        console.log(`      - ${instance.game.name} (${instance.status})`);
      });
    });
    
    console.log('✅ Database test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabaseConnection();