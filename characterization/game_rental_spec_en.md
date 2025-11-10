# Game Rental System Specification - Updated Version

## 1. General Introduction

### 1.1 System Purpose
Game rental management system for a network of community centers, focusing on:
- **Simple user experience** - Each user sees only what's relevant to their role
- **Decentralized management** - Each center manages its own inventory independently
- **Centralized tracking** - System administrators see the complete picture

### 1.2 Target Audience
- **Borrowers** - End users who rent games
- **Center Coordinators** - Manage rentals in a specific center + can borrow from other centers
- **Super Coordinators** - Assist center coordinators + can borrow from other centers
- **System Administrators** - Responsible for overall management + can act as center coordinators + can borrow

### 1.3 Technologies
- **Frontend**: Next.js with React
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Google OAuth + Email/Password
- **Architecture**: Component-based, modular
- **Language**: English primary, Hebrew support

---

## 2. Core Data Structure

### 2.1 Main Entities
```
User (User)
├── id, name, email, phone
├── roles: ['CENTER_COORDINATOR', 'SUPER_COORDINATOR', 'ADMIN']
├── managedCenterIds[] (centers they manage as coordinator)
├── supervisedCenterIds[] (centers they supervise as super coordinator)
└── isActive: boolean

Center (Center)
├── id, name, area
├── coordinatorId (center coordinator)
├── superCoordinatorId (super coordinator)
├── coordinates (for map)
└── isActive: boolean

Game (Game - Global)
├── id, name, description, categories
├── targetAudiences: 'SINGLES' | 'MARRIED' | 'GENERAL'
└── imageUrl

GameInstance (Game copy in center)
├── gameId, centerId
├── status: 'AVAILABLE' | 'BORROWED' | 'UNAVAILABLE'
└── expectedReturnDate

Rental (Rental)
├── userId, gameInstanceId
├── status: 'PENDING' | 'ACTIVE' | 'RETURNED' | 'CANCELLED'
├── requestDate, approvedDate, borrowDate, returnDate
└── expectedReturnDate
```

### 2.2 Rental Status Flow
1. **PENDING** - Request awaiting coordinator approval
3. **ACTIVE** - Game taken and active
4. **RETURNED** - Returned on time
5. **CANCELLED** - Canceled while pending

---

## 3. Screens and Functionality

### 3.1 Dynamic Header (Fixed on all screens)
```
┌─ Logo ─┬─ Navigation ─┬─ User Area ─┐
│        │ Home        │             │
│        │ Games       │ [Not logged]│
│        │ Centers     │ Login       │
│        │             │             │
│        │             │ [Logged in] │
│        │             │ Username ▼  │
└────────┴─────────────┴─────────────┘
```

**Navigation varies by permissions:**
- **Regular user**: Home, Games, Centers
- **Center coordinator**: + Coordinator Dashboard, My Center Rentals
- **Super coordinator**: + Super Coordinator Dashboard, Supervised Centers
- **Admin**: + Admin Dashboard, System Management

**Important note**: Any user with management permissions (coordinator/super coordinator/admin) can also borrow as regular users from any center

### 3.2 Home Page
**Purpose**: Main entry point to the system

**Components:**
- Hero section with call-to-action
- Quick buttons: "Search Games", "Find Center", "Rent Now"
- System information
- Contact
- Footer with social links

### 3.3 Games Catalog
**Purpose**: Search and select games by center

**Filters:**
- Center selection (required)
- Categories: Singles/Married/General
- Availability: Available/Borrowed/Unavailable

**Game Display:**
```
┌─────────────────────────────────┐
│ [Image]  Game Name              │
│          Short description      │
│          🟢 Available / 🔴 Borrowed │
│          [Details] [Rent Now]   │
└─────────────────────────────────┘
```

### 3.4 Game Page
**Purpose**: Full details + rental request

**Components:**
- Large image and detailed description
- Center selection (Dropdown)
- Dynamic availability status per center
- "Request to Rent" button

### 3.5 Centers Map
**Purpose**: Find nearby center and navigate to games

**Components:**
- Interactive map with markers
- Center list with contact details
- Search by area/name
- Direct link to catalog for each center

### 3.6 Rental Form
**Purpose**: Create rental request

**Flow:**
1. **If logged in**: Only center and game selection
2. **If not logged in**: Also fill personal details + automatic registration

**Fields:**
- Center (Dropdown)
- Game (Dropdown or predefined)
- If not logged in: name, phone, email

**After submission:**
- Create rental in PENDING status
- Send notification to coordinator (email + WhatsApp)
- Show confirmation message to user

---

## 4. Management Areas

### 4.1 Regular User Area
**Tabs:**
1. **Personal Details**: Edit name and phone (email read-only)
2. **My Rentals**: History table with cancellation option
3. **My Reviews**: Reviews I've submitted (future)

### 4.2 Center Coordinator Dashboard
**Purpose**: Manage rentals in centers I manage

**Tabs:**
1. **Pending Requests** (in my center)
   - Table: name, date, game
   - Actions: approve/reject/expand

2. **Active Rentals** (in my center)
   - Table: name, rental date, game
   - Actions: reminder/mark returned/expand

3. **Returns** (in my center)
   - Table: name, return date, game
   - Action: expand

4. **Inventory Management** (my center)
   - Game availability table in center
   - Manual status updates

5. **Add Rental** (for my center)
   - Search existing user or create new
   - Create immediate rental

6. **My Center Details**
   - Show my super coordinator details
   - Center details (name, area, etc.)
   - Basic statistics

**Expand Popup:**
- Edit all rental details (dates, notes)
- Change history

### 4.3 Super Coordinator Dashboard
**Purpose**: Supervise and assist center coordinators I supervise

**Tabs:**
1. **Supervised Centers Overview**
   - List of my centers
   - Status of each center (open rentals, delays, etc.)
   - Quick link to manage each center

2. **Pending Rentals** (in all my centers)
   - Table with additional center column
   - Ability to handle requests instead of coordinator

3. **Delays Report** (in my centers)
   - List of delayed rentals
   - Tools for reminders and tracking

4. **Coordinator Management**
   - List of coordinators I supervise
   - Ability to replace coordinator or assist in management

5. **My Tasks** (future)
   - List of specific tasks from managers
   - Progress tracking

**Note**: Super coordinator can enter any center they supervise and act as center coordinator

### 4.4 Admin Dashboard
**Purpose**: Overall system management + ability to act as center coordinator (if assigned)

**Tabs:**
1. **User Management**
   - Table: name, email, roles, assigned centers, status
   - Edit permissions, assign to centers, block/unblock
   - Add coordinators and super coordinators

2. **Center Management**
   - Add/edit centers
   - Assign coordinators and super coordinators to centers
   - Transfer centers between coordinators

3. **Game Management**
   - Global game catalog
   - Add/edit/remove
   - Assign to centers (bulk operations)

4. **Reports and Statistics**
   - Filter by center/coordinator/dates
   - Metrics: rentals, returns, delays, coordinator activity
   - CSV export for all reports

5. **System Management**
   - General settings
   - Message templates
   - Logs and activity tracking

6. **My Coordinator Area** (if assigned to center)
   - Quick access to coordinator dashboard for my center
   - All functionality of regular center coordinator

**Note**: Admin can view and manage rentals in any center, not just their own

---

## 5. Notifications and Communication

### 5.1 Automatic Notifications
- **New request** → Coordinator (email + WhatsApp)
- **Rental approval** → Borrower (email + WhatsApp)
- **Return reminder** → Borrower (before due date + after delay)
- **Request rejection** → Borrower (email)

### 5.2 Message Templates
```
WhatsApp to borrower on approval:
"Hello [name], your request for '[game name]' has been approved! 
You can pick it up at [center name] from [coordinator name]: [phone]
Thank you!"

Email to coordinator on request:
"New rental request awaiting approval
Game: [name]
Borrower: [name] - [phone]
[Management link]"
```

---

## 6. Security and Programming

### 6.1 Permissions (based on roles array)
- **Guest**: View catalog and centers
- **USER**: + Create rental requests
- **CENTER_COORDINATOR**: + Manage rentals in managed centers + borrow from other centers
- **SUPER_COORDINATOR**: + Supervise multiple centers + assist coordinators + borrow from other centers
- **ADMIN**: + Overall system management + ability to act as coordinator + borrow from other centers

**Important notes:**
- User can have multiple roles (e.g., USER + CENTER_COORDINATOR + ADMIN)
- Coordinator can manage multiple centers
- Super coordinator can supervise multiple centers
- Admin can also be coordinator of specific center
- Everyone can borrow as regular users from any center

### 6.2 Data Security
- Session management with JWT
- Personal data protection (GDPR compliant)
- Audit log for sensitive operations

---

## 7. Suggested Development Phases

### 7.1 Phase 1 - MVP
- [ ] Basic data structure (Prisma schema)
- [ ] Authentication
- [ ] Game catalog with availability
- [ ] Basic rental form
- [ ] Simple coordinator dashboard

### 7.2 Phase 2 - Full Functionality
- [ ] Centers map
- [ ] Automatic notifications
- [ ] Admin dashboard
- [ ] Reports and statistics

### 7.3 Phase 3 - Improvements
- [ ] Progressive Web App (PWA)
- [ ] Review system
- [ ] Push notifications
- [ ] Calendar integration

---

## 8. Points for Clarification and Improvement

### 8.1 Open Questions
1. **Inventory management**: What happens when there's a conflict between rental data and availability?
2. **Coordinator flexibility**: How much freedom to give coordinators to update dates without restrictions?
3. **Popular games**: Should we add a waiting list or advance booking system?
4. **Super coordinator tasks**: What type of tasks will super coordinators receive from administrators?
5. **Integrated dashboard**: Should a coordinator who is also an admin see everything in one place or separately?

### 8.2 Possible Future Features
- Detailed rating and review system
- Smart notifications based on preferences
- Payment system integration
- Automatic inventory management with barcodes
- **Task system for super coordinators** - Task assignment and progress tracking
- **Advanced reports** - Performance comparisons between centers and trend identification
- **Mobile app** with push notifications for coordinators