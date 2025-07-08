import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...');
    
    // Simple connection test
    await prisma.$connect();
    console.log('✅ Database connection successful');
    
    // Test basic query
    const userCount = await prisma.user.count();
    console.log(`📊 Current users in database: ${userCount}`);
    
    const centerCount = await prisma.center.count();
    console.log(`🏢 Current centers in database: ${centerCount}`);
    
    const gameCount = await prisma.game.count();
    console.log(`🎮 Current games in database: ${gameCount}`);
    
    console.log('✅ Database test completed successfully');
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();