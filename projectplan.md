# Project Plan - מערכת השאלת משחקים לזוגות

## 📋 Executive Summary

Simple, focused game rental system for relationship centers across Israel. Built with Next.js, PostgreSQL, and Prisma - implementing specific user stories with clear acceptance criteria.

### Current State ✅
- **Authentication**: Google OAuth + email/password ✅
- **Database**: Schema implemented with all tables ✅
- **UI Foundation**: Basic components and layouts ✅
- **Public Features**: Game catalog and center locator ✅

---

## 🎯 Core User Types & Detailed Requirements

### 1. **Regular Users (USER)**
**Goal**: Find and rent games from centers

#### Key Features:
- **Browse Game Catalog (US-1.1)**
  - General catalog of recommended games (without availability)
  - Center-specific game filtering
  - Status filters (all/available/borrowed)
  - Display: image, name, description, category, target audience
  - Mobile-optimized display

- **Find Nearby Centers (US-1.2)**
  - Interactive map with all centers
  - Region/city filtering
  - Center details: name, address, phone
  - Direct link to center's catalog

- **Request Rental (US-1.3)**
  - Form with center, game, personal details
  - Warning if game is borrowed (but can continue)
  - registration required if not logged in
  - Confirmation with coordinator details
  - WhatsApp/phone contact integration

- **Manage My Rentals (US-1.4)**
  - View pending/active/history rentals
  - Cancel pending requests
  - Full rental details
  - Contact coordinator (WhatsApp/phone)

- **Return & Feedback (US-1.5)**
  - Physical return to coordinator
  - Optional anonymous feedback system
  - Feedback form: region → center → game → ratings → comments

- **Update Personal Details (US-1.6)**
  - Edit name, phone (email locked)
  - Immediate save functionality

### 2. **Center Coordinators (CENTER_COORDINATOR)**
**Goal**: Manage rentals for their assigned center

#### Key Features:
- **View New Requests (US-2.1)**
  - "Pending" tab with all new requests
  - Display: requester name, phone, game, request date
  - Email + WhatsApp alerts for new requests
  - Mobile-optimized management

- **Approve Rental (US-2.2)**
  - Approve only after physical pickup
  - Status changes to ACTIVE
  - Edit return date (default: one week)
  - Automatic user notification

- **Manage Active Rentals (US-2.3)**
  - "Active" tab with all rentals
  - Overdue items highlighted in red/orange
  - Filter: all/on time/overdue
  - Mark "returned" functionality
  - Send feedback request via WhatsApp

- **Add New Game (US-2.4)**
  - Add new game to general catalog
  - Form: name, description, category, target audience, image
  - Auto-add to center as "available"
  - Add existing games from catalog to center

- **Create Manual Rental (US-2.5)**
  - Search existing users (name/phone/email)
  - Select game from center and create rental
  - Direct ACTIVE status (not PENDING)
  - User notification
  - **Future**: Anonymous rentals with basic contact details

- **View Center Statistics (US-2.6)**
  - Number of rentals, popular games, delay percentages
  - Super coordinator details
  - Return history

- **Can also borrow games as regular users**

### 3. **Super Coordinators (SUPER_COORDINATOR)**
**Goal**: Oversee multiple centers and assist coordinators

#### Key Features:
- **Supervise Centers (US-3.1)**
  - List of supervised centers
  - Per center: pending requests, active rentals, overdue items
  - Enter management of any center
  - All coordinator contact details

- **Assist with Request Management (US-3.2)**
  - View all pending requests in supervised centers
  - Approve/reject requests instead of coordinator
  - Actions recorded under super coordinator name

- **Track Overdue Items (US-3.3)**
  - Centralized overdue report
  - Filter by center/time period
  - Send reminders

- **Can also borrow games as regular users**

### 4. **System Administrators (ADMIN)**
**Goal**: Manage the entire system and network expansion

#### Key Features:
- **Manage Users (US-4.1)**
  - Table of all users with search/filter
  - Change roles (coordinator/super coordinator/admin)
  - Block/unblock users
  - Assign coordinators to centers

- **Manage Centers (US-4.2)**
  - Add new centers
  - Edit center details
  - Assign coordinators to centers
  - Assign super coordinators to centers
  - Deactivate/activate centers

- **Global Game Management (US-4.3)**
  - View all games in system
  - Edit/delete games
  - Mark games for "general catalog"
  - Add games to centers centrally

- **Reports and Statistics (US-4.4)**
  - Dashboard with general data
  - Generate reports: rentals, games, centers, coordinators
  - Filter by time period/center/region
  - Export to Excel/CSV
  - Visual graphs and trends

- **Can also borrow games as regular users**

---

## 🤖 Automated Processes

### **Automatic Reminders (US-5.1)**
- Reminder to user one day before return
- Reminder on return day
- Reminder after 3 days overdue
- Reminder after one week overdue
- Overdue report to coordinator after one week

### **Event Notifications (US-5.2)**
- Alert to coordinator about new request
- Alert to user about request acceptance
- Alert to user about rental approval
- Alert to coordinator about new feedback
- Notifications sent via email and WhatsApp link

---

## 🏗️ Page Structure & Components

### **Public Pages**
- **Home Page** (`/`)
  - Hero section with search functionality
  - Quick links to working features only
  - Popular games section

- **Game Catalog** (`/games`)
  - General catalog + center-specific views
  - Filters: status, category, target audience
  - Mobile-optimized grid layout
  - Search functionality

- **Game Details** (`/games/[id]`)
  - Full game information with images
  - Availability across centers
  - Rental request button
  - Anonymous feedback display

- **Centers** (`/centers`)
  - Interactive map with all centers
  - Region/city filtering
  - Center cards with details

- **Center Details** (`/centers/[id]`)
  - Center information and contact
  - Available games listing
  - Direct catalog link

### **User Dashboard** (`/dashboard`)
- **Profile Tab**: Personal information editing
- **My Rentals Tab**: Pending/active/history with actions
- **Request Tab**: Quick rental request form

### **Coordinator Dashboard** (`/coordinator`)
- **Requests Tab**: Pending requests with approve/reject
- **Active Rentals Tab**: Active rentals with overdue highlighting
- **Inventory Tab**: Center game management
- **Statistics Tab**: Center performance data

### **Super Coordinator Dashboard** (`/super`)
- **Centers Overview**: All supervised centers status
- **Requests Management**: Cross-center request handling
- **Overdue Report**: Centralized overdue tracking

### **Admin Dashboard** (`/admin`)
- **Users Tab**: User management with role assignment
- **Centers Tab**: Center management and assignments
- **Games Tab**: Global game catalog management
- **Reports Tab**: System-wide analytics and exports

---

## 🔄 Core User Flows

### 1. **User Rental Flow**
```
Browse Games → Filter by Center → Select Game → Request Rental → 
Google Auth (if needed) → Confirmation → WhatsApp Contact → 
Physical Pickup → Active Status → Physical Return → Feedback (optional)
```

### 2. **Coordinator Approval Flow**
```
Email/WhatsApp Alert → View Request → User Contact → Physical Meeting → 
Approve in System → ACTIVE Status → Track Return → Mark Returned → 
Send Feedback Request
```

### 3. **Admin Management Flow**
```
User Management → Role Assignment → Center Assignment → 
Game Catalog Management → Reports Generation → System Monitoring
```

---

## 📊 Database Schema & Status Flows

### **Core Models**
```
User (multi-role support)
├── Rental (tracks full lifecycle)
│   └── GameInstance (center-specific games)
│       └── Game (global catalog)
└── Center (location & coordinators)
```

### **Status Flows**
- **Rental Status**: `PENDING → ACTIVE → RETURNED` (or `CANCELLED`)
- **Game Status**: `AVAILABLE → BORROWED → AVAILABLE`
- **User Status**: `ACTIVE → INACTIVE` (block/unblock)

---

## 🚀 Implementation Plan with Acceptance Criteria

### **Phase 1: User Features (Week 1)**
- [ ] **Clean Home Page** - Remove non-working links, add search
- [ ] **Enhanced Game Catalog** - Status filters, center-specific views
- [ ] **Improved Center Locator** - Interactive map, region filtering
- [ ] **Complete Rental Request Flow** - Form, Google auth, confirmation
- [ ] **User Dashboard** - Profile editing, rental management
- [ ] **WhatsApp Integration** - Pre-filled messages, contact links

### **Phase 2: Coordinator Features (Week 2)**
- [ ] **Coordinator Dashboard** - Requests, active rentals, inventory tabs
- [ ] **Request Management** - Approve/reject with email/WhatsApp alerts
- [ ] **Active Rental Tracking** - Overdue highlighting, return marking
- [ ] **Game Management** - Add games to catalog and center
- [ ] **Manual Rental Creation** - User search, direct ACTIVE status
- [ ] **Center Statistics** - Performance metrics, super coordinator info

### **Phase 3: Admin & Super Coordinator Features (Week 3)**
- [ ] **User Management** - Role assignment, center assignment, block/unblock
- [ ] **Center Management** - Add/edit centers, coordinator assignments
- [ ] **Global Game Catalog** - System-wide game management
- [ ] **Super Coordinator Dashboard** - Multi-center oversight
- [ ] **Basic Reporting** - User activity, rental reports
- [ ] **Cross-center Request Management** - Super coordinator assistance

### **Phase 4: Automation & Polish (Week 4)**
- [ ] **Automated Reminders** - Email system for overdue items
- [ ] **Event Notifications** - Request alerts, approval notifications
- [ ] **Advanced Reports** - Excel/CSV export, visual charts
- [ ] **Anonymous Feedback System** - Rating and comments
- [ ] **Mobile Optimization** - Touch-friendly interfaces
- [ ] **Performance Testing** - Load testing, optimization

---

## 📱 Technical Requirements

### **Frontend Stack**
- Next.js 15 (App Router)
- TypeScript (comprehensive type system)
- Tailwind CSS (RTL support)
- React Hook Form (validation)
- Zustand (state management)

### **Backend Stack**
- Next.js API Routes
- Prisma ORM
- PostgreSQL
- NextAuth.js 
- Email service (reminders)

### **Key Features**
- **WhatsApp Integration**: Pre-filled message links
- **Email Notifications**: Automated alerts and reminders
- **Anonymous Feedback**: Rating system without user identification
- **Multi-role Support**: Users can have multiple roles
- **Mobile-First**: Touch-friendly interfaces
- **Hebrew RTL**: Right-to-left layout support

---

## 🔐 Security & Permissions

### **Role-Based Access**
- **USER**: Own rentals, profile editing, public pages
- **CENTER_COORDINATOR**: Assigned center management + user permissions
- **SUPER_COORDINATOR**: Multiple center oversight + user permissions
- **ADMIN**: System-wide access + user permissions

### **Key Security Features**
- JWT session management (30-day expiration)
- Role-based API protection
- Input validation on all forms
- Secure password hashing
- Center-specific permission validation

---

## 📈 Success Metrics

### **User Adoption**
- Monthly active users per center
- Rental request completion rate
- User retention (repeat rentals)

### **Operational Efficiency**
- Request approval time (target: <24 hours)
- Return rate compliance (target: >90%)
- Coordinator response time (target: <2 hours)

### **System Performance**
- Page load speed (target: <3 seconds)
- API response times (target: <500ms)
- Error rates (target: <1%)

---

## 🚨 Simplified Approach

### **What's Included**
- All user stories with acceptance criteria
- WhatsApp/email notification system
- Anonymous feedback system
- Multi-role user support
- Mobile-optimized interfaces
- Basic reporting and analytics

### **What's NOT Included (Phase 1)**
- Real-time chat
- Push notifications
- Advanced analytics/ML
- Mobile app (PWA only)
- Calendar integration
- Payment processing

---

## 🎯 Definition of Done

### **Each Feature**
- [ ] All acceptance criteria met
- [ ] Mobile responsive (tested on devices)
- [ ] Role-based access control working
- [ ] Hebrew RTL support
- [ ] Error handling implemented
- [ ] WhatsApp/email integration working

### **Final Delivery**
- [ ] All user stories implemented
- [ ] Automated notifications working
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Documentation complete
- [ ] Production deployment ready

---

## 🔄 Next Steps

1. **Create comprehensive types system** - Ensure type safety across all components
2. **Implement user features** - Focus on rental request flow
3. **Build coordinator dashboard** - Request management and approval
4. **Add admin features** - User and center management
5. **Implement automation** - Reminders and notifications

---

*Focus: Implement all user stories with acceptance criteria, keep interfaces simple and mobile-friendly*