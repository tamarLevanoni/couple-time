# Seed Data Documentation

This document describes the comprehensive seed data created for the Game Rental System.

## 🚀 Running the Seed

```bash
# Run seed only
npm run db:seed

# Reset database and run seed
npm run db:reset

# Alternative: use Prisma directly
npx prisma db seed
```

## 👥 User Accounts Created

### 🔐 Test Credentials

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **Admin** | admin@gamerental.co.il | Admin123! | System administrator |
| **Super Coordinator** | david.manager@gamerental.co.il | SuperCoord123! | Manages Jerusalem, Tel Aviv, Ariel |
| **Super Coordinator** | rachel.super@gamerental.co.il | SuperCoord123! | Manages Haifa, Beer Sheva |
| **Coordinator** | sarah.coord@gamerental.co.il | Coordinator123! | Jerusalem Center |
| **Coordinator** | yossi.coord@gamerental.co.il | Coordinator123! | Tel Aviv Center |
| **Coordinator** | miriam.coord@gamerental.co.il | Coordinator123! | Haifa Center |
| **Coordinator** | avi.coord@gamerental.co.il | Coordinator123! | Beer Sheva Center |
| **Coordinator** | tamar.coord@gamerental.co.il | Coordinator123! | Ariel Center |
| **User** | john.doe@email.com | User123! | Regular user with active rental |
| **User** | jane.smith@email.com | User123! | Regular user with pending rental |
| **User** | michael.brown@email.com | User123! | Regular user with overdue rental |
| **User** | emily.davis@email.com | User123! | Regular user with returned rental |
| **User (Google)** | david.wilson@email.com | N/A | OAuth user |
| **User (Google)** | sarah.johnson@email.com | N/A | OAuth user |

## 🏢 Centers Created

| Center | Area | Coordinator | Super Coordinator |
|--------|------|-------------|------------------|
| Jerusalem Community Center | Jerusalem | JERUSALEM | Sarah Cohen | David Ben-David |
| Tel Aviv Central Hub | Tel Aviv | CENTER | Yossi Goldberg | David Ben-David |
| Haifa Northern Center | Haifa | NORTH | Miriam Katz | Rachel Cohen-Levi |
| Beer Sheva Southern Hub | Beer Sheva | SOUTH | Avi Rosenberg | Rachel Cohen-Levi |
| Ariel Community Center | Ariel | JUDEA_SAMARIA | Tamar Shahar | David Ben-David |

## 🎮 Games Created

| Game | Categories | Target Audience | Description |
|------|------------|----------------|-------------|
| **Love Language Discovery Cards** | INTIMACY, COMMUNICATION | MARRIED, GENERAL | Interactive card game to discover partner's love language |
| **Communication Quest** | COMMUNICATION, FUN | MARRIED, GENERAL | Board game to improve couple communication |
| **Relationship Building Blocks** | THERAPY, PERSONAL_DEVELOPMENT | SINGLES, MARRIED | Activity cards for strengthening relationships |
| **Intimacy Connect** | INTIMACY | MARRIED | Game designed to deepen emotional intimacy |
| **Fun Date Night Box** | FUN | MARRIED, GENERAL | Creative date night ideas and activities |
| **Mindful Couples Journey** | THERAPY, PERSONAL_DEVELOPMENT | MARRIED | Guided mindfulness exercises for couples |
| **Single & Strong** | PERSONAL_DEVELOPMENT | SINGLES | Personal development for singles |
| **Family Communication Hub** | COMMUNICATION, THERAPY | GENERAL | Communication tools for families |

## 🎯 Game Distribution Across Centers

| Center | Total Instances | Available | Borrowed | Unavailable |
|--------|-----------------|-----------|----------|-------------|
| **Jerusalem** | 11 instances | 8 | 2 | 1 |
| **Tel Aviv** | 6 instances | 5 | 0 | 1 |
| **Haifa** | 4 instances | 4 | 0 | 0 |
| **Beer Sheva** | 3 instances | 3 | 0 | 0 |
| **Ariel** | 2 instances | 2 | 0 | 0 |

## 📋 Rental Scenarios Created

### Active Scenarios
1. **Active Rental** (John Doe)
   - Status: ACTIVE
   - Games: Love Language Cards + Communication Quest
   - Center: Jerusalem
   - Borrowed: Jan 16, 2024
   - Expected Return: Jan 30, 2024

2. **Overdue Rental** (Michael Brown)
   - Status: ACTIVE (OVERDUE)
   - Game: Relationship Building Blocks
   - Center: Jerusalem
   - Expected Return: Dec 16, 2023 (overdue)

### Pending Scenarios
3. **Pending Rental** (Jane Smith)
   - Status: PENDING
   - Game: Communication Quest
   - Center: Tel Aviv
   - Requested: Jan 20, 2024

4. **Another Pending** (Sarah Johnson)
   - Status: PENDING
   - Game: Intimacy Connect
   - Center: Jerusalem
   - Requested: Today

### Completed Scenarios
5. **Returned Rental** (Emily Davis)
   - Status: RETURNED
   - Game: Communication Quest
   - Center: Tel Aviv
   - Returned early: Jan 14, 2024

6. **Cancelled Rental** (David Wilson)
   - Status: CANCELLED
   - Game: Relationship Building Blocks
   - Center: Haifa
   - Cancelled after request

## 🔧 Game Instance Statuses

- **AVAILABLE**: Most game instances (ready for rental)
- **BORROWED**: 2 instances currently borrowed by active users
- **UNAVAILABLE**: 1 instance marked for maintenance

## 🧪 Testing Scenarios

The seed data provides complete scenarios for testing:

### User Testing
- **Login/Registration**: Test with any user credentials
- **Active Rentals**: John Doe has active rental to test user dashboard
- **Pending Requests**: Jane Smith has pending rental for approval testing
- **Overdue Handling**: Michael Brown has overdue rental for escalation testing

### Coordinator Testing
- **Dashboard**: Each coordinator has their center with various rental statuses
- **Approval Workflow**: Pending rentals waiting for coordinator approval
- **Game Management**: Different game distributions per center
- **Status Updates**: Test approve, return, cancel workflows

### Admin Testing
- **User Management**: Full range of users across all roles
- **Center Oversight**: Multiple centers with different activity levels
- **System Reports**: Mix of rental statuses for comprehensive reporting
- **Role Management**: Test role assignments and permissions

### Super Coordinator Testing
- **Multi-Center View**: David manages 3 centers, Rachel manages 2
- **Cross-Center Analytics**: Different rental patterns per center
- **Coordinator Oversight**: Monitor coordinator performance

## 🎯 Business Logic Testing

The seed data enables testing of key business rules:

1. **One-to-One Relations**: Each coordinator manages exactly one center
2. **Many-to-Many Relations**: Rentals can include multiple game instances
3. **Status Workflows**: Complete rental lifecycle represented
4. **Geographic Distribution**: Centers across all areas of Israel
5. **Game Categories**: Full range of relationship and personal development games
6. **User Types**: OAuth and password-based authentication
7. **Overdue Logic**: Past-due rental for testing escalation procedures

## 📊 Data Statistics

- **Total Users**: 14 (1 admin, 2 supers, 5 coordinators, 6 regular users)
- **Total Centers**: 5 (covering all geographic areas)
- **Total Games**: 8 (diverse categories and audiences)
- **Total Game Instances**: 26 (realistic distribution)
- **Total Rentals**: 6 (covering all status types)
- **Password Strength**: All test passwords use strong encryption (bcryptjs)

This seed data provides a comprehensive foundation for developing and testing the game rental system! 🚀