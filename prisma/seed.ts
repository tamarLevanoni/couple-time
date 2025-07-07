import { PrismaClient } from '@prisma/client';
import { 
  Role, 
  Area, 
  GameCategory, 
  TargetAudience, 
  GameInstanceStatus 
} from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Hash password for test users
  const hashedPassword = await bcrypt.hash('123456', 10);

  // Create sample users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@couple-time.com' },
    update: {},
    create: {
      name: 'מנהל המערכת',
      email: 'admin@couple-time.com',
      password: hashedPassword,
      emailVerified: new Date(),
      phone: '+972-50-1234567',
      roles: [Role.ADMIN],
      defaultDashboard: 'admin',
      isActive: true,
    },
  });

  const superCoordinator = await prisma.user.upsert({
    where: { email: 'super@couple-time.com' },
    update: {},
    create: {
      name: 'רכז על',
      email: 'super@couple-time.com',
      password: hashedPassword,
      emailVerified: new Date(),
      phone: '+972-50-2345678',
      roles: [Role.SUPER_COORDINATOR],
      defaultDashboard: 'super',
      isActive: true,
    },
  });

  const coordinator = await prisma.user.upsert({
    where: { email: 'coordinator@couple-time.com' },
    update: {},
    create: {
      name: 'רכז מוקד',
      email: 'coordinator@couple-time.com',
      password: hashedPassword,
      emailVerified: new Date(),
      phone: '+972-50-3456789',
      roles: [Role.CENTER_COORDINATOR],
      defaultDashboard: 'coordinator',
      isActive: true,
    },
  });

  const regularUser = await prisma.user.upsert({
    where: { email: 'user@couple-time.com' },
    update: {},
    create: {
      name: 'משתמש רגיל',
      email: 'user@couple-time.com',
      password: hashedPassword,
      emailVerified: new Date(),
      phone: '+972-50-4567890',
      roles: [Role.USER],
      defaultDashboard: 'user',
      isActive: true,
    },
  });

  // Create sample centers
  const centerTelAviv = await prisma.center.upsert({
    where: { id: 'center-tel-aviv' },
    update: {},
    create: {
      id: 'center-tel-aviv',
      name: 'מוקד תל אביב',
      city: 'תל אביב',
      area: Area.CENTER,
      coordinatorId: coordinator.id,
      superCoordinatorId: superCoordinator.id,
      location: { lat: 32.0853, lng: 34.7818 },
      isActive: true,
    },
  });

  const centerJerusalem = await prisma.center.upsert({
    where: { id: 'center-jerusalem' },
    update: {},
    create: {
      id: 'center-jerusalem',
      name: 'מוקד ירושלים',
      city: 'ירושלים',
      area: Area.JERUSALEM,
      coordinatorId: coordinator.id,
      superCoordinatorId: superCoordinator.id,
      location: { lat: 31.7683, lng: 35.2137 },
      isActive: true,
    },
  });

  // Create sample games
  const game1 = await prisma.game.upsert({
    where: { id: 'game-love-language' },
    update: {},
    create: {
      id: 'game-love-language',
      name: 'שפות האהבה',
      description: 'משחק לחיזוק התקשורת והאינטימיות בזוגיות',
      categories: [GameCategory.COMMUNICATION, GameCategory.INTIMACY],
      targetAudiences: [TargetAudience.MARRIED],
      imageUrl: '/games/love-language.jpg',
      isActive: true,
    },
  });

  const game2 = await prisma.game.upsert({
    where: { id: 'game-couple-therapy' },
    update: {},
    create: {
      id: 'game-couple-therapy',
      name: 'טיפול זוגי משחקי',
      description: 'כלים טיפוליים לחיזוק הזוגיות',
      categories: [GameCategory.THERAPY, GameCategory.PERSONAL_DEVELOPMENT],
      targetAudiences: [TargetAudience.MARRIED],
      imageUrl: '/games/couple-therapy.jpg',
      isActive: true,
    },
  });

  const game3 = await prisma.game.upsert({
    where: { id: 'game-fun-questions' },
    update: {},
    create: {
      id: 'game-fun-questions',
      name: 'שאלות כיף לזוגות',
      description: 'שאלות מהנות להכרות מעמיקה',
      categories: [GameCategory.FUN, GameCategory.COMMUNICATION],
      targetAudiences: [TargetAudience.GENERAL],
      imageUrl: '/games/fun-questions.jpg',
      isActive: true,
    },
  });

  // Create game instances
  await prisma.gameInstance.upsert({
    where: { 
      gameId_centerId: { 
        gameId: game1.id, 
        centerId: centerTelAviv.id 
      } 
    },
    update: {},
    create: {
      gameId: game1.id,
      centerId: centerTelAviv.id,
      status: GameInstanceStatus.AVAILABLE,
      notes: 'עותק חדש במצב מעולה',
    },
  });

  await prisma.gameInstance.upsert({
    where: { 
      gameId_centerId: { 
        gameId: game1.id, 
        centerId: centerJerusalem.id 
      } 
    },
    update: {},
    create: {
      gameId: game1.id,
      centerId: centerJerusalem.id,
      status: GameInstanceStatus.AVAILABLE,
      notes: 'עותק חדש במצב מעולה',
    },
  });

  await prisma.gameInstance.upsert({
    where: { 
      gameId_centerId: { 
        gameId: game2.id, 
        centerId: centerTelAviv.id 
      } 
    },
    update: {},
    create: {
      gameId: game2.id,
      centerId: centerTelAviv.id,
      status: GameInstanceStatus.AVAILABLE,
      notes: 'עותק חדש במצב מעולה',
    },
  });

  await prisma.gameInstance.upsert({
    where: { 
      gameId_centerId: { 
        gameId: game3.id, 
        centerId: centerTelAviv.id 
      } 
    },
    update: {},
    create: {
      gameId: game3.id,
      centerId: centerTelAviv.id,
      status: GameInstanceStatus.AVAILABLE,
      notes: 'עותק חדש במצב מעולה',
    },
  });

  await prisma.gameInstance.upsert({
    where: { 
      gameId_centerId: { 
        gameId: game3.id, 
        centerId: centerJerusalem.id 
      } 
    },
    update: {},
    create: {
      gameId: game3.id,
      centerId: centerJerusalem.id,
      status: GameInstanceStatus.AVAILABLE,
      notes: 'עותק חדש במצב מעולה',
    },
  });

  console.log('✅ Database seed completed!');
  console.log('👤 Created users:', { adminUser, superCoordinator, coordinator, regularUser });
  console.log('🏢 Created centers:', { centerTelAviv, centerJerusalem });
  console.log('🎮 Created games:', { game1, game2, game3 });
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });