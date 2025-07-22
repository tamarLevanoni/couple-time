import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Clear existing data in correct order (due to foreign key constraints)
  console.log('🧹 Cleaning existing data...')
  await prisma.rental.deleteMany()
  await prisma.gameInstance.deleteMany()
  await prisma.game.deleteMany()
  await prisma.center.deleteMany()
  await prisma.user.deleteMany()

  // 1. Create Games
  console.log('🎮 Creating games...')
  const games = await Promise.all([
    prisma.game.create({
      data: {
        name: 'Love Language Discovery Cards',
        description: 'Interactive card game to discover and understand your partner\'s love language through guided conversations and activities.',
        categories: ['INTIMACY', 'COMMUNICATION'],
        targetAudiences: ['MARRIED', 'GENERAL'],
        imageUrl: 'https://example.com/images/love-language-cards.jpg'
      }
    }),
    prisma.game.create({
      data: {
        name: 'Communication Quest',
        description: 'Board game designed to improve couple communication through fun challenges and meaningful conversations.',
        categories: ['COMMUNICATION', 'FUN'],
        targetAudiences: ['MARRIED', 'GENERAL'],
        imageUrl: 'https://example.com/images/communication-quest.jpg'
      }
    }),
    prisma.game.create({
      data: {
        name: 'Relationship Building Blocks',
        description: 'Activity cards focused on strengthening relationship foundations with practical exercises.',
        categories: ['THERAPY', 'PERSONAL_DEVELOPMENT'],
        targetAudiences: ['SINGLES', 'MARRIED'],
        imageUrl: 'https://example.com/images/building-blocks.jpg'
      }
    }),
    prisma.game.create({
      data: {
        name: 'Intimacy Connect',
        description: 'A thoughtful game designed to deepen emotional and physical intimacy between partners.',
        categories: ['INTIMACY'],
        targetAudiences: ['MARRIED'],
        imageUrl: 'https://example.com/images/intimacy-connect.jpg'
      }
    }),
    prisma.game.create({
      data: {
        name: 'Fun Date Night Box',
        description: 'Collection of creative and fun date night ideas and activities for couples.',
        categories: ['FUN'],
        targetAudiences: ['MARRIED', 'GENERAL'],
        imageUrl: 'https://example.com/images/date-night-box.jpg'
      }
    }),
    prisma.game.create({
      data: {
        name: 'Mindful Couples Journey',
        description: 'Guided mindfulness and meditation exercises designed specifically for couples.',
        categories: ['THERAPY', 'PERSONAL_DEVELOPMENT'],
        targetAudiences: ['MARRIED'],
        imageUrl: 'https://example.com/images/mindful-journey.jpg'
      }
    }),
    prisma.game.create({
      data: {
        name: 'Single & Strong',
        description: 'Personal development activities and reflection exercises for singles building self-awareness.',
        categories: ['PERSONAL_DEVELOPMENT'],
        targetAudiences: ['SINGLES'],
        imageUrl: 'https://example.com/images/single-strong.jpg'
      }
    }),
    prisma.game.create({
      data: {
        name: 'Family Communication Hub',
        description: 'Communication tools and activities designed for family dynamics and relationships.',
        categories: ['COMMUNICATION', 'THERAPY'],
        targetAudiences: ['GENERAL'],
        imageUrl: 'https://example.com/images/family-hub.jpg'
      }
    })
  ])

  // 2. Create Super Coordinators
  console.log('👥 Creating super coordinators...')
  const superCoordinators = await Promise.all([
    prisma.user.create({
      data: {
        name: 'David Ben-David',
        email: 'david.manager@gamerental.co.il',
        phone: '050-1111111',
        roles: ['SUPER_COORDINATOR'],
        password: await bcrypt.hash('SuperCoord123!', 10),
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Rachel Cohen-Levi',
        email: 'rachel.super@gamerental.co.il',
        phone: '050-2222222',
        roles: ['SUPER_COORDINATOR'],
        password: await bcrypt.hash('SuperCoord123!', 10),
        isActive: true
      }
    })
  ])

  // 3. Create Centers
  console.log('🏢 Creating centers...')
  const centers = await Promise.all([
    prisma.center.create({
      data: {
        name: 'Jerusalem Community Center',
        city: 'Jerusalem',
        area: 'JERUSALEM',
        superCoordinatorId: superCoordinators[0].id,
        location: { lat: 31.7683, lng: 35.2137 },
        isActive: true
      }
    }),
    prisma.center.create({
      data: {
        name: 'Tel Aviv Central Hub',
        city: 'Tel Aviv',
        area: 'CENTER',
        superCoordinatorId: superCoordinators[0].id,
        location: { lat: 32.0853, lng: 34.7818 },
        isActive: true
      }
    }),
    prisma.center.create({
      data: {
        name: 'Haifa Northern Center',
        city: 'Haifa',
        area: 'NORTH',
        superCoordinatorId: superCoordinators[1].id,
        location: { lat: 32.7940, lng: 34.9896 },
        isActive: true
      }
    }),
    prisma.center.create({
      data: {
        name: 'Beer Sheva Southern Hub',
        city: 'Beer Sheva',
        area: 'SOUTH',
        superCoordinatorId: superCoordinators[1].id,
        location: { lat: 31.2518, lng: 34.7915 },
        isActive: true
      }
    }),
    prisma.center.create({
      data: {
        name: 'Ariel Community Center',
        city: 'Ariel',
        area: 'JUDEA_SAMARIA',
        superCoordinatorId: superCoordinators[0].id,
        isActive: true
      }
    })
  ])

  // 4. Create Coordinators
  console.log('👤 Creating coordinators...')
  const coordinators = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Sarah Cohen',
        email: 'sarah.coord@gamerental.co.il',
        phone: '050-3333333',
        roles: ['CENTER_COORDINATOR'],
        managedCenterId: centers[0].id,
        password: await bcrypt.hash('Coordinator123!', 10),
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Yossi Goldberg',
        email: 'yossi.coord@gamerental.co.il',
        phone: '050-4444444',
        roles: ['CENTER_COORDINATOR'],
        managedCenterId: centers[1].id,
        password: await bcrypt.hash('Coordinator123!', 10),
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Miriam Katz',
        email: 'miriam.coord@gamerental.co.il',
        phone: '050-5555555',
        roles: ['CENTER_COORDINATOR'],
        managedCenterId: centers[2].id,
        password: await bcrypt.hash('Coordinator123!', 10),
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Avi Rosenberg',
        email: 'avi.coord@gamerental.co.il',
        phone: '050-6666666',
        roles: ['CENTER_COORDINATOR'],
        managedCenterId: centers[3].id,
        password: await bcrypt.hash('Coordinator123!', 10),
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Tamar Shahar',
        email: 'tamar.coord@gamerental.co.il',
        phone: '050-7777777',
        roles: ['CENTER_COORDINATOR'],
        managedCenterId: centers[4].id,
        password: await bcrypt.hash('Coordinator123!', 10),
        isActive: true
      }
    })
  ])

  // Update centers with coordinator IDs
  console.log('🔗 Linking coordinators to centers...')
  await Promise.all([
    prisma.center.update({
      where: { id: centers[0].id },
      data: { coordinatorId: coordinators[0].id }
    }),
    prisma.center.update({
      where: { id: centers[1].id },
      data: { coordinatorId: coordinators[1].id }
    }),
    prisma.center.update({
      where: { id: centers[2].id },
      data: { coordinatorId: coordinators[2].id }
    }),
    prisma.center.update({
      where: { id: centers[3].id },
      data: { coordinatorId: coordinators[3].id }
    }),
    prisma.center.update({
      where: { id: centers[4].id },
      data: { coordinatorId: coordinators[4].id }
    })
  ])

  // 5. Create Admin User
  console.log('👑 Creating admin user...')
  const admin = await prisma.user.create({
    data: {
      name: 'System Administrator',
      email: 'admin@gamerental.co.il',
      phone: '050-9999999',
      roles: ['ADMIN'],
      password: await bcrypt.hash('Admin123!', 10),
      isActive: true
    }
  })

  // 6. Create Regular Users
  console.log('👫 Creating regular users...')
  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john.doe@email.com',
        phone: '050-1234567',
        roles: [],
        password: await bcrypt.hash('User123!', 10),
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Jane Smith',
        email: 'jane.smith@email.com',
        phone: '050-2345678',
        roles: [],
        password: await bcrypt.hash('User123!', 10),
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Michael Brown',
        email: 'michael.brown@email.com',
        phone: '050-3456789',
        roles: [],
        password: await bcrypt.hash('User123!', 10),
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Emily Davis',
        email: 'emily.davis@email.com',
        phone: '050-4567890',
        roles: [],
        password: await bcrypt.hash('User123!', 10),
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'David Wilson',
        email: 'david.wilson@email.com',
        phone: '050-5678901',
        roles: [],
        googleId: 'google_oauth_123456',
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Sarah Johnson',
        email: 'sarah.johnson@email.com',
        phone: '050-6789012',
        roles: [],
        googleId: 'google_oauth_234567',
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        name: 'Test User (Inactive)',
        email: 'inactive@email.com',
        phone: '050-0000000',
        roles: [],
        password: await bcrypt.hash('User123!', 10),
        isActive: false
      }
    })
  ])

  // 7. Create Game Instances (distribute games across centers)
  console.log('🎯 Creating game instances...')
  const gameInstances = []

  // Jerusalem Center - Full range of games (one instance per game)
  for (let i = 0; i < games.length; i++) {
    const instance = await prisma.gameInstance.create({
      data: {
        gameId: games[i].id,
        centerId: centers[0].id,
        status: 'AVAILABLE',
        notes: 'Jerusalem center copy'
      }
    })
    gameInstances.push(instance)
  }

  // Tel Aviv Center - Popular games + unique selection
  for (let i = 0; i < 6; i++) {
    const instance = await prisma.gameInstance.create({
      data: {
        gameId: games[i].id,
        centerId: centers[1].id,
        status: i < 2 ? 'AVAILABLE' : 'AVAILABLE'
      }
    })
    gameInstances.push(instance)
  }

  // Haifa Center - Smaller selection
  for (let i = 0; i < 4; i++) {
    const instance = await prisma.gameInstance.create({
      data: {
        gameId: games[i].id,
        centerId: centers[2].id,
        status: 'AVAILABLE'
      }
    })
    gameInstances.push(instance)
  }

  // Beer Sheva Center - Basic selection
  for (let i = 0; i < 3; i++) {
    const instance = await prisma.gameInstance.create({
      data: {
        gameId: games[i].id,
        centerId: centers[3].id,
        status: 'AVAILABLE'
      }
    })
    gameInstances.push(instance)
  }

  // Ariel Center - Limited selection
  for (let i = 0; i < 2; i++) {
    const instance = await prisma.gameInstance.create({
      data: {
        gameId: games[i].id,
        centerId: centers[4].id,
        status: 'AVAILABLE'
      }
    })
    gameInstances.push(instance)
  }

  // 8. Create Rentals with Realistic Scenarios
  console.log('📋 Creating rental scenarios...')

  // Active Rental - User has borrowed games
  const activeRental = await prisma.rental.create({
    data: {
      userId: users[0].id,
      centerId: centers[0].id,
      status: 'ACTIVE',
      requestDate: new Date('2024-01-15'),
      borrowDate: new Date('2024-01-16'),
      expectedReturnDate: new Date('2024-01-30'),
      notes: 'Looking forward to trying these with my partner!',
      gameInstances: {
        connect: [
          { id: gameInstances[0].id },
          { id: gameInstances[1].id }
        ]
      }
    }
  })

  // Update game instances to borrowed status
  await prisma.gameInstance.updateMany({
    where: { id: { in: [gameInstances[0].id, gameInstances[1].id] } },
    data: { status: 'BORROWED' }
  })

  // Pending Rental - Waiting for approval
  const pendingRental = await prisma.rental.create({
    data: {
      userId: users[1].id,
      centerId: centers[1].id,
      status: 'PENDING',
      requestDate: new Date('2024-01-20'),
      notes: 'First time borrowing, excited to try these games!',
      gameInstances: {
        connect: [
          { id: gameInstances[6].id }
        ]
      }
    }
  })

  // Overdue Rental - Past expected return date
  const overdueRental = await prisma.rental.create({
    data: {
      userId: users[2].id,
      centerId: centers[0].id,
      status: 'ACTIVE',
      requestDate: new Date('2023-12-01'),
      borrowDate: new Date('2023-12-02'),
      expectedReturnDate: new Date('2023-12-16'),
      notes: 'Holiday rental',
      gameInstances: {
        connect: [
          { id: gameInstances[2].id }
        ]
      }
    }
  })

  // Update overdue game instance
  await prisma.gameInstance.update({
    where: { id: gameInstances[2].id },
    data: { status: 'BORROWED' }
  })

  // Returned Rental - Completed successfully
  const returnedRental = await prisma.rental.create({
    data: {
      userId: users[3].id,
      centerId: centers[1].id,
      status: 'RETURNED',
      requestDate: new Date('2024-01-01'),
      borrowDate: new Date('2024-01-02'),
      returnDate: new Date('2024-01-14'),
      expectedReturnDate: new Date('2024-01-16'),
      notes: 'Great games, thank you!',
      gameInstances: {
        connect: [
          { id: gameInstances[7].id }
        ]
      }
    }
  })

  // Cancelled Rental
  const cancelledRental = await prisma.rental.create({
    data: {
      userId: users[4].id,
      centerId: centers[2].id,
      status: 'CANCELLED',
      requestDate: new Date('2024-01-18'),
      notes: 'Changed my mind, maybe next time',
      gameInstances: {
        connect: [
          { id: gameInstances[11].id }
        ]
      }
    }
  })

  // Another Pending Rental for testing
  const anotherPendingRental = await prisma.rental.create({
    data: {
      userId: users[5].id,
      centerId: centers[0].id,
      status: 'PENDING',
      requestDate: new Date(),
      notes: 'Recommended by a friend',
      gameInstances: {
        connect: [
          { id: gameInstances[3].id }
        ]
      }
    }
  })

  // Mark one game instance as unavailable for maintenance
  await prisma.gameInstance.update({
    where: { id: gameInstances[4].id },
    data: { 
      status: 'UNAVAILABLE',
      notes: 'Under maintenance - missing pieces'
    }
  })

  console.log('✅ Seed completed successfully!')
  
  // Print summary
  console.log('\n📊 Seed Summary:')
  console.log(`👑 Admin Users: 1`)
  console.log(`👥 Super Coordinators: ${superCoordinators.length}`)
  console.log(`👤 Center Coordinators: ${coordinators.length}`)
  console.log(`👫 Regular Users: ${users.length}`)
  console.log(`🏢 Centers: ${centers.length}`)
  console.log(`🎮 Games: ${games.length}`)
  console.log(`🎯 Game Instances: ${gameInstances.length}`)
  console.log(`📋 Rentals: 6 (1 active, 2 pending, 1 overdue, 1 returned, 1 cancelled)`)
  
  console.log('\n🔐 Test Credentials:')
  console.log('Admin: admin@gamerental.co.il / Admin123!')
  console.log('Super Coordinator: david.manager@gamerental.co.il / SuperCoord123!')
  console.log('Coordinator: sarah.coord@gamerental.co.il / Coordinator123!')
  console.log('User: john.doe@email.com / User123!')
  console.log('Google User: david.wilson@email.com (OAuth)')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })