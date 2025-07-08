import { PrismaClient, Role, Area, GameCategory, TargetAudience, GameInstanceStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ===== Create Admin User =====
  console.log('👤 Creating admin user...');
  const hashedPassword = await bcrypt.hash('admin123', 12);
  
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@gamerentals.org.il',
      name: 'מנהל מערכת',
      phone: '050-1234567',
      roles: [Role.USER, Role.ADMIN],
      managedCenterIds: [],
      supervisedCenterIds: [],
      password: hashedPassword,
      googleId: null,
    },
  });
  console.log(`✅ Created admin user: ${adminUser.email}`);

  // ===== Create Centers =====
  console.log('🏢 Creating centers...');
  const centers = [
    {
      name: 'מוקד ירושלים מרכז',
      city: 'ירושלים',
      area: Area.JERUSALEM,
      location: { lat: 31.7767, lng: 35.2345 },
    },
    {
      name: 'מוקד תל אביב',
      city: 'תל אביב',
      area: Area.CENTER,
      location: { lat: 32.0809, lng: 34.7806 },
    },
    {
      name: 'מוקד חיפה',
      city: 'חיפה',
      area: Area.NORTH,
      location: { lat: 32.794, lng: 34.9896 },
    },
    {
      name: 'מוקד באר שבע',
      city: 'באר שבע',
      area: Area.SOUTH,
      location: { lat: 31.2518, lng: 34.7915 },
    },
  ];

  const createdCenters = [];
  for (const centerData of centers) {
    const center = await prisma.center.create({
      data: centerData,
    });
    createdCenters.push(center);
    console.log(`✅ Created center: ${center.name}`);
  }

  // ===== Create Games =====
  console.log('📚 Creating games...');
  const games = [
    {
      name: 'שאלות זוגיות - התחלות',
      description: 'משחק שאלות לזוגות מתחילים',
      category: GameCategory.COMMUNICATION,
      targetAudience: TargetAudience.GENERAL,
    },
    {
      name: 'זוגיות יצירתית',
      description: 'פעילויות יצירתיות לזוגות',
      category: GameCategory.FUN,
      targetAudience: TargetAudience.MARRIED,
    },
    {
      name: 'תקשורת עמוקה',
      description: 'כלים לתקשורת איכותית בזוגיות',
      category: GameCategory.THERAPY,
      targetAudience: TargetAudience.MARRIED,
    },
    {
      name: 'רווקים בדרך',
      description: 'משחק לרווקים הבונים זהות',
      category: GameCategory.COMMUNICATION,
      targetAudience: TargetAudience.SINGLES,
    },
    {
      name: 'אינטימיות וקרבה',
      description: 'משחק לחיזוק האינטימיות בזוגיות',
      category: GameCategory.INTIMACY,
      targetAudience: TargetAudience.MARRIED,
    },
  ];

  const createdGames = [];
  for (const gameData of games) {
    const game = await prisma.game.create({
      data: gameData,
    });
    createdGames.push(game);
    console.log(`✅ Created game: ${game.name}`);
  }

  // ===== Create Game Instances =====
  console.log('🎮 Creating game instances...');
  for (const center of createdCenters) {
    // Add 3-4 random games to each center
    const gamesToAdd = createdGames.slice(0, Math.floor(Math.random() * 2) + 3);

    for (const game of gamesToAdd) {
      await prisma.gameInstance.create({
        data: {
          gameId: game.id,
          centerId: center.id,
          status: GameInstanceStatus.AVAILABLE,
        },
      });
      console.log(`✅ Added ${game.name} to ${center.name}`);
    }
  }

  // ===== Create Sample Coordinator =====
  console.log('👥 Creating sample coordinator...');
  const coordinatorPassword = await bcrypt.hash('coordinator123', 12);
  
  const coordinator = await prisma.user.create({
    data: {
      email: 'coordinator@gamerentals.org.il',
      name: 'יוסי כהן',
      phone: '050-1234567',
      roles: [Role.USER, Role.CENTER_COORDINATOR],
      managedCenterIds: [],
      supervisedCenterIds: [],
      password: coordinatorPassword,
      googleId: null,
    },
  });

  // Assign coordinator to Jerusalem center
  await prisma.center.update({
    where: { id: createdCenters[0].id },
    data: { coordinatorId: coordinator.id },
  });

  console.log(`✅ Created coordinator: ${coordinator.email}`);
  console.log(`✅ Assigned coordinator to: ${createdCenters[0].name}`);

  // ===== Create Sample Regular User =====
  console.log('👤 Creating sample user...');
  const userPassword = await bcrypt.hash('user123', 12);
  
  const regularUser = await prisma.user.create({
    data: {
      email: 'user@example.com',
      name: 'דוד לוי',
      phone: '052-9876543',
      roles: [Role.USER],
      managedCenterIds: [],
      supervisedCenterIds: [],
      password: userPassword,
      googleId: null,
    },
  });

  console.log(`✅ Created regular user: ${regularUser.email}`);

  console.log('✨ Seed completed successfully!');
  console.log('');
  console.log('📝 Login credentials:');
  console.log('   Admin: admin@gamerentals.org.il / admin123');
  console.log('   Coordinator: coordinator@gamerentals.org.il / coordinator123');
  console.log('   User: user@example.com / user123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });