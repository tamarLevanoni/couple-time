# 📁 Game Rental System - כל הקבצים

## 📄 schema.prisma
```prisma
// schema.prisma - Final Schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ===== USERS =====
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  phone     String?
  image     String?
  roles     String[] @default(["USER"]) // ['USER', 'CENTER_COORDINATOR', 'SUPER_COORDINATOR', 'ADMIN']
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  isActive  Boolean  @default(true)

  // Google OAuth
  googleId String? @unique

  // Relations
  rentals              Rental[]
  approvedRentals      Rental[]       @relation("ApprovedRentals")
  managedCenters       Center[]       @relation("CenterCoordinator")
  supervisedCenters    Center[]       @relation("CenterSuperCoordinator")
  notifications        Notification[]
  feedback             Feedback[]
  auditLogs            AuditLog[]

  @@map("users")
}

// ===== CENTERS =====
model Center {
  id        String   @id @default(cuid())
  name      String
  city      String
  area      String   // 'NORTH', 'CENTER', 'SOUTH', 'JERUSALEM', 'JUDEA_SAMARIA'
  address   String?
  phone     String?
  email     String?
  latitude  Float?
  longitude Float?
  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  coordinatorId      String?
  coordinator        User? @relation("CenterCoordinator", fields: [coordinatorId], references: [id])
  
  superCoordinatorId String?
  superCoordinator   User? @relation("CenterSuperCoordinator", fields: [superCoordinatorId], references: [id])
  
  gameInstances GameInstance[]

  @@map("centers")
}

// ===== GAMES =====
model Game {
  id              String   @id @default(cuid())
  name            String
  description     String?
  longDescription String?
  imageUrl        String?
  category        String?  // 'COMMUNICATION', 'INTIMACY', 'FUN', 'THERAPY'
  targetAudience  String   // 'SINGLES', 'MARRIED', 'GENERAL'
  minAge          Int?
  maxAge          Int?
  duration        String?  // '30-60 minutes'
  isActive        Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  // Relations
  gameInstances GameInstance[]
  feedback      Feedback[]

  @@map("games")
}

// ===== GAME INSTANCES (עותקים במוקדים) =====
model GameInstance {
  id        String   @id @default(cuid())
  status    String   @default("AVAILABLE") // 'AVAILABLE', 'BORROWED', 'MAINTENANCE', 'LOST'
  condition String?  @default("GOOD")      // 'NEW', 'GOOD', 'FAIR', 'POOR'
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  gameId   String
  game     Game   @relation(fields: [gameId], references: [id], onDelete: Cascade)
  
  centerId String
  center   Center @relation(fields: [centerId], references: [id], onDelete: Cascade)

  rentals Rental[]

  // כל משחק יכול להיות רק פעם אחת בכל מוקד
  @@unique([gameId, centerId])
  @@map("game_instances")
}

// ===== RENTALS (השאלות) =====
model Rental {
  id                 String    @id @default(cuid())
  status             String    @default("PENDING") // 'PENDING', 'APPROVED', 'ACTIVE', 'RETURNED', 'REJECTED', 'CANCELLED'
  requestDate        DateTime  @default(now())
  approvedDate       DateTime?
  borrowDate         DateTime?
  expectedReturnDate DateTime?
  actualReturnDate   DateTime?
  rejectionReason    String?
  notes              String?   // הערות המשתמש
  coordinatorNotes   String?   // הערות הרכז
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  // Relations
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  gameInstanceId String
  gameInstance   GameInstance @relation(fields: [gameInstanceId], references: [id], onDelete: Cascade)

  // מי אישר את ההשאלה
  approvedById String?
  approvedBy   User?   @relation("ApprovedRentals", fields: [approvedById], references: [id])

  notifications Notification[]

  @@map("rentals")
}

// ===== FEEDBACK (משובים) =====
model Feedback {
  id          String   @id @default(cuid())
  rating      Int      // 1-5
  comment     String?
  isAnonymous Boolean  @default(false)
  createdAt   DateTime @default(now())

  // Relations
  userId String?
  user   User?   @relation(fields: [userId], references: [id])

  gameId String
  game   Game   @relation(fields: [gameId], references: [id], onDelete: Cascade)

  @@map("feedback")
}

// ===== NOTIFICATIONS (התראות) =====
model Notification {
  id        String   @id @default(cuid())
  type      String   // 'NEW_RENTAL', 'RENTAL_APPROVED', 'RENTAL_REJECTED', 'RENTAL_REMINDER', 'RENTAL_OVERDUE'
  title     String
  message   String
  isRead    Boolean  @default(false)
  sentAt    DateTime @default(now())

  // Relations
  userId String
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  rentalId String?
  rental   Rental? @relation(fields: [rentalId], references: [id])

  @@map("notifications")
}

// ===== SYSTEM SETTINGS (הגדרות מערכת) =====
model SystemSetting {
  id          String   @id @default(cuid())
  key         String   @unique
  value       String
  description String?
  updatedAt   DateTime @updatedAt

  @@map("system_settings")
}

// ===== AUDIT LOG (מעקב פעולות) =====
model AuditLog {
  id        String   @id @default(cuid())
  action    String   // 'CREATE', 'UPDATE', 'DELETE'
  entity    String   // 'User', 'Rental', 'GameInstance', etc.
  entityId  String
  oldValues Json?
  newValues Json?
  timestamp DateTime @default(now())

  // Relations
  userId String?
  user   User?   @relation(fields: [userId], references: [id])

  @@map("audit_logs")
}
```

## 📄 prisma/seed.ts
```typescript
// prisma/seed.ts - נתונים ראשוניים

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // ===== משחקים לדוגמה =====
  const games = [
    {
      name: 'שאלות זוגיות - התחלות',
      description: 'משחק שאלות לזוגות מתחילים',
      longDescription: 'משחק קלפים עם שאלות שיעזרו לזוגות חדשים להכיר אחד את השני טוב יותר',
      category: 'COMMUNICATION',
      targetAudience: 'GENERAL',
      minAge: 18,
      duration: '30-45 דקות'
    },
    {
      name: 'זוגיות יצירתית',
      description: 'פעילויות יצירתיות לזוגות',
      longDescription: 'משחק שמעודד זוגות לבטא יצירתיות משותפת ולחזק את הקשר',
      category: 'FUN',
      targetAudience: 'MARRIED',
      minAge: 20,
      duration: '45-60 דקות'
    },
    {
      name: 'תקשורת עמוקה',
      description: 'כלים לתקשורת איכותית בזוגיות',
      longDescription: 'משחק מתקדם שעוזר לזוגות לפתח כלי תקשורת עמוקים ומשמעותיים',
      category: 'THERAPY',
      targetAudience: 'MARRIED',
      minAge: 22,
      duration: '60-90 דקות'
    },
    {
      name: 'רווקים בדרך',
      description: 'משחק לרווקים הבונים זהות',
      longDescription: 'משחק שעוזר לרווקים לחקור את עצמם ולהכין עצמם לזוגיות עתידית',
      category: 'COMMUNICATION', 
      targetAudience: 'SINGLES',
      minAge: 18,
      duration: '30-60 דקות'
    },
    {
      name: 'אינטימיות וקרבה',
      description: 'משחק לחיזוק האינטימיות בזוגיות',
      longDescription: 'משחק עדין ומכבד שעוזר לזוגות לחזק את הקרבה הפיזית והרגשית',
      category: 'INTIMACY',
      targetAudience: 'MARRIED',
      minAge: 23,
      duration: '45-75 דקות'
    }
  ];

  // יצירת משחקים
  console.log('📚 Creating games...');
  const createdGames = [];
  for (const gameData of games) {
    const game = await prisma.game.create({
      data: gameData
    });
    createdGames.push(game);
    console.log(`✅ Created game: ${game.name}`);
  }

  // ===== מוקדים לדוגמה =====
  const centers = [
    {
      name: 'מוקד ירושלים מרכז',
      city: 'ירושלים',
      area: 'JERUSALEM',
      address: 'רחוב יפו 50',
      phone: '02-5551234',
      email: 'jerusalem@couples.org.il',
      latitude: 31.7767,
      longitude: 35.2345
    },
    {
      name: 'מוקד תל אביב',
      city: 'תל אביב',
      area: 'CENTER',
      address: 'רחוב דיזנגוף 100',
      phone: '03-5551234',
      email: 'telaviv@couples.org.il',
      latitude: 32.0809,
      longitude: 34.7806
    },
    {
      name: 'מוקד חיפה',
      city: 'חיפה',
      area: 'NORTH',
      address: 'שדרות הנשיא 25',
      phone: '04-5551234',
      email: 'haifa@couples.org.il',
      latitude: 32.7940,
      longitude: 34.9896
    },
    {
      name: 'מוקד באר שבע',
      city: 'באר שבע',
      area: 'SOUTH',
      address: 'רחוב רגר 15',
      phone: '08-5551234',
      email: 'beersheva@couples.org.il',
      latitude: 31.2518,
      longitude: 34.7915
    }
  ];

  // יצירת מוקדים
  console.log('🏢 Creating centers...');
  const createdCenters = [];
  for (const centerData of centers) {
    const center = await prisma.center.create({
      data: centerData
    });
    createdCenters.push(center);
    console.log(`✅ Created center: ${center.name}`);
  }

  // ===== משתמש אדמין ראשוני =====
  console.log('👤 Creating admin user...');
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@couples.org.il',
      name: 'מנהל מערכת',
      phone: '050-1234567',
      roles: ['USER', 'ADMIN'],
      googleId: null
    }
  });
  console.log(`✅ Created admin user: ${adminUser.email}`);

  // יצירת עותקי משחקים במוקדים
  console.log('🎮 Creating game instances...');
  for (const center of createdCenters) {
    const gamesToAdd = createdGames.slice(0, Math.floor(Math.random() * 2) + 3);
    
    for (const game of gamesToAdd) {
      await prisma.gameInstance.create({
        data: {
          gameId: game.id,
          centerId: center.id,
          status: 'AVAILABLE',
          condition: 'GOOD'
        }
      });
      console.log(`✅ Added ${game.name} to ${center.name}`);
    }
  }

  console.log('✨ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

## 📄 package.json
```json
{
  "name": "game-rental-system",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build", 
    "start": "next start",
    "lint": "next lint",
    "db:migrate": "prisma migrate dev",
    "db:generate": "prisma generate",
    "db:push": "prisma db push",
    "db:seed": "tsx prisma/seed.ts",
    "db:reset": "prisma migrate reset --force",
    "db:studio": "prisma studio",
    "db:deploy": "prisma migrate deploy"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18",
    "react-dom": "^18",
    "prisma": "^5.6.0",
    "@prisma/client": "^5.6.0"
  },
  "devDependencies": {
    "typescript": "^5",
    "@types/node": "^20", 
    "@types/react": "^18",
    "@types/react-dom": "^18",
    "tsx": "^4.0.0",
    "eslint": "^8",
    "eslint-config-next": "14.0.0"
  }
}
```

## 📄 .env.example
```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/gamerentals"

# Auth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-oauth-client-id"
GOOGLE_CLIENT_SECRET="your-google-oauth-client-secret"
JWT_SECRET="your-jwt-secret"

# External Services
SENDGRID_API_KEY="your-sendgrid-key"
TWILIO_ACCOUNT_SID="your-twilio-sid"
TWILIO_AUTH_TOKEN="your-twilio-token"
```

## 🚀 פקודות התחלה
```bash
# יצירת פרויקט
npx create-next-app@latest game-rental --typescript
cd game-rental

# התקנת תלויות
npm install prisma @prisma/client tsx

# הקמת Prisma
npx prisma init

# [העתק את הקבצים למקומות המתאימים]

# יצירת מיגרציה
npx prisma migrate dev --name init

# הרצת seed
npm run db:seed

# הפעלת הפרויקט
npm run dev

# פתיחת Prisma Studio
npm run db:studio
```