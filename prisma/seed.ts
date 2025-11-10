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
  await prisma.game.createMany({
    data: [
      {
        name: "So do you (סו דו יו)",
        description: "משחק שאלות חווייתי המחולק ל־6 קטגוריות של שאלות – חלקן קלילות וחלקן עמוקות. מאפשר שיח עומק וגילוי הדדי בדרך מהנה. מושלם לדייטים או לזמן איכות.",
        targetAudiences: ["GENERAL"]
      },
      {
        name: "Link (לינק)",
        description: "משחק תגובות ספונטני וקליל שבו כל משתתף הופך עיגול שאלה, והשני צריך לנחש איזו תגובה מתאימה לו. מפתח הכרות הדדית בצורה מהנה.",
        targetAudiences: ["GENERAL"]
      },
      {
        name: "Time Out (טיים אאוט)",
        description: "משחק שאלות על עבר, הווה ועתיד. מאפשר להכיר את מסע חייו של בן או בת הזוג דרך שאלות אישיות ומצחיקות.",
        targetAudiences: ["GENERAL"]
      },
      {
        name: "תכירותי",
        description: "משחק שאלות וסיטואציות משעשע וכיפי. כל משתתף בתורו מרים שאלה ומזמין את השני לנחש את התשובה הנכונה לגביו. כולל קובייה, לוח משחק ו־4 סוגי שאלות. מעורר שיח וצחוק.",
        targetAudiences: ["SINGLES"]
      },
      {
        name: "כרטישיח",
        description: "ערכת קלפים עם 92 שאלות בנושאים שונים: מתנות, חינוך ילדים, עבודה, קריירה, מנהיגות, השפעה, מוזיקה ועוד. מעודד הבנה הדדית, חברות וקרבה זוגית.",
        targetAudiences: ["MARRIED"]
      },
      {
        name: "לראות את היחסים (לרא[ע]ות את היחסים)",
        description: "משחק שיח זוגי המבוסס על עקרונות CBT. כולל 90 קלפים ב־4 קטגוריות. עוזר לפתור קונפליקטים בצורה נעימה, מקרבת ונקייה. מנקה את הלב ופותח לרבדים חדשים.",
        targetAudiences: ["MARRIED"]
      },
      {
        name: "Points Of You (Functum)",
        description: "משחק פוטותרפיה צבעוני ודינמי המדבר על נושאים שונים בצורה עוצמתית ואפקטיבית. יוצר למידה והתפתחות אישית דרך תמונות ושאלות משמעותיות.",
        targetAudiences: ["GENERAL"]
      },
      {
        name: "פתאקים",
        description: "משחק קומפקטי עם 51 שאלות מקוריות בדרגות עומק שונות, לדייטים או ערבים זוגיים. פותח את הלב ומקרב, ומאפשר חוויה רומנטית משמעותית.",
        targetAudiences: ["MARRIED"]
      },
      {
        name: "זוגיות: המשימה",
        description: "משחק זוגי המאפשר לבני הזוג להתחבר, להתרגש ולצחוק. כולל משימות והנחיות שיאפשרו לזוגות ליהנות מהדרך ולחוות את הקשר בצורה ייחודית ומהנה.",
        targetAudiences: ["MARRIED"]
      },
      {
        name: "Let's talk",
        description: "משחק שאלות קלפים שבו עונים או ממציאים סיפור והאחרים מנחשים מה האמת. משחק של אינטואיציה, יצירתיות והנאה עם הרבה צחוקים.",
        targetAudiences: ["GENERAL"]
      },
      {
        name: "כרטיסדייט",
        description: "משחק הכרויות לדייטים, מחבר ומהנה. מסייע להכיר לעומק את הצד השני דרך 100 קלפי רביעיות ב־25 נושאים חשובים לבניית קשר. כולל טיפים לזוגיות בריאה.",
        targetAudiences: ["SINGLES"]
      },
      {
        name: "בארבע עיניים",
        description: "משחק רביעיות לזוגות שמאפשר לבדוק תיאום ציפיות על נושאים חשובים כמו דת, אידיאלים וערכים – בדרך קלילה ונעימה.",
        targetAudiences: ["MARRIED"]
      },
      {
        name: "בשניים",
        description: "משחק העצמה זוגי לשלום בית ותקשורת נכונה. כולל 50 קלפי פעילות ו־3 קלפי הדרכה. נבנה בשיתוף יועצים משפחתיים ופסיכותרפיסטים. מחזק קשר ומונע שחיקה.",
        targetAudiences: ["MARRIED"]
      },
      {
        name: "זוגיות",
        description: "משחק לזמן זוגי מחבר וכיפי הכולל 30 משימות ו־30 שאלות שיח לפתיחת הלב. נכתב בקפידה לזוגות שמחפשים ערב רומנטי ושמח בבית.",
        targetAudiences: ["MARRIED"]
      },
      {
        name: "חיבורים",
        description: "ערכת כרטיסיות זוגית לפיתוח אינטימיות מקרבת ושיח רגשי. כוללת 3 סוגי כרטיסיות לבחירה, ומעודדת הבנה, שמחה והנאה בזוגיות בכל שלביה.",
        targetAudiences: ["MARRIED"]
      },
      {
        name: "כרטישיח אינטימיות",
        description: "ערכת קלפים עם 14 שאלות על תחום האישות, לפתיחת שיח הדרגתי ונעים על רגשות, מחשבות וציפיות. מאפשרת השקעה בזוגיות בצורה רגישה ועדינה.",
        targetAudiences: ["MARRIED"]
      },
      {
        name: "הכל יחסים",
        description: "משחק לוח מקצועי ואפקטיבי לתקשורת זוגית ואינטימית. כולל 90 קלפים ב־4 קטגוריות (שאלה, משימה, פעילות, אתגר). מסייע לזוגות נשואים לפתח תקשורת מינית חיובית וחווייתית.",
        targetAudiences: ["MARRIED"]
      }
    ]
  })

  // Fetch all created games
  const games = await prisma.game.findMany()

  // 2. Create Super Coordinators
  console.log('👥 Creating super coordinators...')
  const superCoordinators = await Promise.all([
    prisma.user.create({
      data: {
        firstName: 'דוד',
        lastName: 'בן-דוד',
        email: 'david.manager@gamerental.co.il',
        phone: '050-1111111',
        roles: ['SUPER_COORDINATOR'],
        password: await bcrypt.hash('SuperCoord123!', 10),
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        firstName: 'רחל',
        lastName: 'כהן-לוי',
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
        name: 'ירושלים - בית ישראל',
        area: 'JERUSALEM',
        superCoordinatorId: superCoordinators[0].id,
        location: { lat: 31.7683, lng: 35.2137 },
        isActive: true
      }
    }),
    prisma.center.create({
      data: {
        name: 'תל אביב - צפון',
        area: 'CENTER',
        superCoordinatorId: superCoordinators[0].id,
        location: { lat: 32.0853, lng: 34.7818 },
        isActive: true
      }
    }),
    prisma.center.create({
      data: {
        name: 'חיפה',
        area: 'NORTH',
        superCoordinatorId: superCoordinators[1].id,
        location: { lat: 32.7940, lng: 34.9896 },
        isActive: true
      }
    }),
    prisma.center.create({
      data: {
        name: 'באר שבע',
        area: 'SOUTH',
        superCoordinatorId: superCoordinators[1].id,
        location: { lat: 31.2518, lng: 34.7915 },
        isActive: true
      }
    }),
    prisma.center.create({
      data: {
        name: 'אריאל',
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
        firstName: 'שרה',
        lastName: 'כהן',
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
        firstName: 'יוסי',
        lastName: 'גולדברג',
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
        firstName: 'מרים',
        lastName: 'כץ',
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
        firstName: 'אבי',
        lastName: 'רוזנברג',
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
        firstName: 'תמר',
        lastName: 'שחר',
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
      firstName: 'מנהל',
      lastName: 'מערכת',
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
        firstName: 'יוחנן',
        lastName: 'לוי',
        email: 'john.doe@email.com',
        phone: '050-1234567',
        roles: [],
        password: await bcrypt.hash('User123!', 10),
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        firstName: 'חנה',
        lastName: 'שמש',
        email: 'jane.smith@email.com',
        phone: '050-2345678',
        roles: [],
        password: await bcrypt.hash('User123!', 10),
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        firstName: 'מיכאל',
        lastName: 'בראון',
        email: 'michael.brown@email.com',
        phone: '050-3456789',
        roles: [],
        password: await bcrypt.hash('User123!', 10),
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        firstName: 'אמילי',
        lastName: 'דוד',
        email: 'emily.davis@email.com',
        phone: '050-4567890',
        roles: [],
        password: await bcrypt.hash('User123!', 10),
        isActive: true
      }
    }),
    prisma.user.create({
      data: {
        firstName: 'משתמש',
        lastName: 'בדיקה (לא פעיל)',
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
        status: 'AVAILABLE'
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
      gameInstances: {
        connect: [
          { id: gameInstances[11].id }
        ]
      }
    }
  })

  // Mark one game instance as unavailable for maintenance
  await prisma.gameInstance.update({
    where: { id: gameInstances[4].id },
    data: {
      status: 'UNAVAILABLE'
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
  console.log(`📋 Rentals: 5 (1 active, 1 pending, 1 overdue, 1 returned, 1 cancelled)`)

  console.log('\n🔐 Test Credentials:')
  console.log('Admin: admin@gamerental.co.il / Admin123!')
  console.log('Super Coordinator: david.manager@gamerental.co.il / SuperCoord123!')
  console.log('Coordinator: sarah.coord@gamerental.co.il / Coordinator123!')
  console.log('User: john.doe@email.com / User123!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })