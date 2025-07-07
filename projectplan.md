# Project Plan - Couple Time (זמן זוגי)

## 🎯 Project Overview
מערכת ניהול השאלת משחקי זוגיות מלאה עם לוחות בקרה מרובי-תפקידים, תמיכה ב-Google OAuth ואימות סיסמה/אימייל. ממשק בעברית בלבד עם Zustand לניהול state.

---

## 📋 Phase 1: Foundation & Infrastructure
**Timeline: Week 1-2**

### Checkpoint 1.1: Project Setup
- [ ] Initialize Next.js 14 project with TypeScript (name: couple-time)
- [ ] Configure ESLint and Prettier with RTL support
- [ ] Set up Git repository and branching strategy
- [ ] Configure environment variables structure
- [ ] Set up folder structure (features-based architecture)
- [ ] Install core dependencies (Prisma, NextAuth, Zustand, Tailwind, etc.)
- [ ] Configure project for Hebrew (RTL) layout
- [ ] Set up Hebrew fonts (Heebo, Assistant)

### Checkpoint 1.2: Database Setup
- [ ] Set up PostgreSQL database (local + production)
- [ ] Configure Prisma with complete schema
- [ ] Create all models (User, Center, Game, GameInstance, Rental, etc.)
- [ ] Set up database migrations
- [ ] Create seed script with initial data
- [ ] Test database connections and relations

### Checkpoint 1.3: Authentication System
- [ ] Configure NextAuth.js with dual providers
- [ ] Implement Google OAuth provider
- [ ] Implement Credentials provider for email/password
- [ ] Create registration flow with email verification
- [ ] Set up password hashing (bcrypt)
- [ ] Create JWT token management
- [ ] Implement role-based middleware
- [ ] Create auth context and hooks
- [ ] Build login/register UI components

### Checkpoint 1.4: Base UI Components & State Management
- [ ] Set up Tailwind CSS with RTL support and Hebrew typography
- [ ] Configure Zustand stores structure
- [ ] Create global app store (user, settings, notifications)
- [ ] Create feature-specific stores (rentals, games, centers)
- [ ] Set up Zustand devtools for development
- [ ] Create design system (colors, typography, spacing) - Hebrew focused
- [ ] Build reusable components (Button, Input, Card, Modal) with Hebrew labels
- [ ] Create layout components (Header, Footer, Sidebar) - RTL layout
- [ ] Implement responsive navigation with Hebrew menu items
- [ ] Create loading and error states in Hebrew
- [ ] Build notification system (toast/alerts) with Hebrew messages
- [ ] Set up Zustand persistence for critical data

---

## 📋 Phase 2: Public Features - ממשק ציבורי
**Timeline: Week 3-4**

### Checkpoint 2.1: Landing Page & Navigation - דף בית וניווט
- [ ] Create hero section with Hebrew CTAs ("השאל עכשיו", "מצא מוקד")
- [ ] Build feature showcase sections with Hebrew content
- [ ] Implement dynamic header with role-based navigation in Hebrew
- [ ] Create footer with Hebrew contact information
- [ ] Add Hebrew SEO optimization (meta tags, Hebrew sitemap)
- [ ] Implement analytics tracking with Hebrew event names
- [ ] Create Zustand store for navigation state

### Checkpoint 2.2: Game Catalog - קטלוג משחקים
- [ ] Build game listing page with Hebrew labels
- [ ] Create Zustand store for games state
- [ ] Implement center selection dropdown with Hebrew center names
- [ ] Create filtering system with Hebrew options (זמין, מושאל, לא זמין)
- [ ] Add Hebrew search functionality
- [ ] Build game detail page with Hebrew descriptions
- [ ] Implement availability checker with Hebrew status messages
- [ ] Add image optimization and lazy loading
- [ ] Create pagination with Hebrew navigation ("הבא", "הקודם")

### Checkpoint 2.3: Centers Map & Directory
- [ ] Integrate map library (Google Maps/Mapbox)
- [ ] Create interactive map with center markers
- [ ] Build center listing sidebar
- [ ] Implement geolocation for "near me" feature
- [ ] Add center detail popups
- [ ] Create center filtering (area, city)
- [ ] Build center detail pages
- [ ] Add navigation/directions integration

### Checkpoint 2.4: Rental Request Flow
- [ ] Create rental request form
- [ ] Implement guest checkout flow
- [ ] Build authenticated user fast checkout
- [ ] Add form validation and error handling
- [ ] Create confirmation page with coordinator details
- [ ] Implement WhatsApp message generator
- [ ] Send confirmation emails
- [ ] Store pending requests in database

---

## 📋 Phase 3: User Dashboard
**Timeline: Week 5**

### Checkpoint 3.1: User Profile Management
- [ ] Create user dashboard layout
- [ ] Build profile editing form
- [ ] Implement phone number verification
- [ ] Add profile picture upload
- [ ] Create account settings page
- [ ] Build notification preferences

### Checkpoint 3.2: Rental History & Management
- [ ] Create "My Rentals" page with tabs
- [ ] Build pending rentals view
- [ ] Implement active rentals tracking
- [ ] Create rental history table
- [ ] Add rental detail modal
- [ ] Implement rental cancellation
- [ ] Build rental status timeline
- [ ] Add export/download functionality

---

## 📋 Phase 4: Center Coordinator Dashboard
**Timeline: Week 6-7**

### Checkpoint 4.1: Coordinator Dashboard Layout
- [ ] Create role-based routing protection
- [ ] Build coordinator dashboard home
- [ ] Implement statistics widgets
- [ ] Create quick action buttons
- [ ] Add recent activity feed
- [ ] Display super coordinator info

### Checkpoint 4.2: Rental Request Management
- [ ] Build pending requests table
- [ ] Create request detail view
- [ ] Implement approve/reject actions
- [ ] Add rejection reason modal
- [ ] Create bulk actions
- [ ] Implement real-time updates
- [ ] Add notification system for new requests

### Checkpoint 4.3: Active Rentals Management
- [ ] Create active rentals table with filters
- [ ] Implement overdue highlighting
- [ ] Build return marking system
- [ ] Add rental extension feature
- [ ] Create reminder sending functionality
- [ ] Implement notes/comments system
- [ ] Add rental history per item

### Checkpoint 4.4: Inventory Management
- [ ] Build game inventory table
- [ ] Create add game to center flow
- [ ] Implement status updates (available/damaged/lost)
- [ ] Add bulk inventory updates
- [ ] Create inventory reports
- [ ] Build game condition tracking

### Checkpoint 4.5: Manual Rental Creation
- [ ] Create user search/selection interface
- [ ] Build quick rental form
- [ ] Implement guest rental option
- [ ] Add rental confirmation flow
- [ ] Create receipt generation

---

## 📋 Phase 5: Super Coordinator Dashboard
**Timeline: Week 8**

### Checkpoint 5.1: Multi-Center Overview
- [ ] Create center overview dashboard
- [ ] Build center statistics cards
- [ ] Implement center comparison views
- [ ] Add performance metrics
- [ ] Create coordinator contact list

### Checkpoint 5.2: Cross-Center Management
- [ ] Build unified pending requests view
- [ ] Create cross-center rental search
- [ ] Implement bulk approval system
- [ ] Add coordinator assistance tools
- [ ] Build overdue rentals report

### Checkpoint 5.3: Coordinator Support Tools
- [ ] Create coordinator performance dashboard
- [ ] Build task assignment system
- [ ] Implement coordinator communication tools
- [ ] Add training resources section

---

## 📋 Phase 6: Admin Dashboard
**Timeline: Week 9-10**

### Checkpoint 6.1: User Management
- [ ] Build user listing with advanced search
- [ ] Create user detail/edit pages
- [ ] Implement role assignment system
- [ ] Add bulk user operations
- [ ] Create user invitation system
- [ ] Build user activity logs
- [ ] Implement user suspension/activation

### Checkpoint 6.2: Center Management
- [ ] Create center CRUD operations
- [ ] Build coordinator assignment interface
- [ ] Implement center activation/deactivation
- [ ] Add center transfer functionality
- [ ] Create center performance metrics

### Checkpoint 6.3: Game Catalog Management
- [ ] Build global game management interface
- [ ] Create game adding/editing forms
- [ ] Implement bulk game operations
- [ ] Add game categorization tools
- [ ] Build game distribution to centers

### Checkpoint 6.4: Reports & Analytics
- [ ] Create comprehensive reporting dashboard
- [ ] Build custom report generator
- [ ] Implement data export (CSV, Excel, PDF)
- [ ] Add visualization charts
- [ ] Create scheduled reports
- [ ] Build performance analytics

### Checkpoint 6.5: System Configuration
- [ ] Create system settings interface
- [ ] Build notification template editor
- [ ] Implement email/SMS configuration
- [ ] Add system maintenance tools
- [ ] Create backup management
- [ ] Build audit log viewer

---

## 📋 Phase 7: Communication & Notifications
**Timeline: Week 11**

### Checkpoint 7.1: Email System
- [ ] Integrate email service (SendGrid/Resend)
- [ ] Create email templates
- [ ] Implement email queue system
- [ ] Add email tracking
- [ ] Build email preview/testing

### Checkpoint 7.2: WhatsApp Integration
- [ ] Implement WhatsApp message generation
- [ ] Create message templates
- [ ] Add click-to-WhatsApp buttons
- [ ] Build coordinator quick contact

### Checkpoint 7.3: In-App Notifications
- [ ] Create notification center
- [ ] Implement real-time notifications
- [ ] Add notification preferences
- [ ] Build notification history
- [ ] Create notification badges

### Checkpoint 7.4: Automated Reminders
- [ ] Build reminder scheduling system
- [ ] Create reminder templates
- [ ] Implement overdue notifications
- [ ] Add return reminders
- [ ] Create escalation system

---

## 📋 Phase 8: Mobile Optimization & PWA
**Timeline: Week 12**

### Checkpoint 8.1: Mobile UI Optimization
- [ ] Optimize all components for mobile
- [ ] Create mobile-specific navigation
- [ ] Implement touch gestures
- [ ] Optimize forms for mobile input
- [ ] Add mobile-specific features

### Checkpoint 8.2: PWA Implementation
- [ ] Configure service worker
- [ ] Implement offline functionality
- [ ] Add install prompts
- [ ] Create app manifest
- [ ] Implement push notifications

---

## 📋 Phase 9: Testing & Quality Assurance
**Timeline: Week 13**

### Checkpoint 9.1: Testing Implementation
- [ ] Write unit tests for utilities
- [ ] Create integration tests for API
- [ ] Build E2E tests for critical flows
- [ ] Implement visual regression tests
- [ ] Add performance testing

### Checkpoint 9.2: Security Hardening
- [ ] Implement rate limiting
- [ ] Add input sanitization
- [ ] Create security headers
- [ ] Implement CSRF protection
- [ ] Add activity monitoring

---

## 📋 Phase 10: Deployment & Launch
**Timeline: Week 14**

### Checkpoint 10.1: Production Setup
- [ ] Configure production database
- [ ] Set up hosting (Vercel/AWS)
- [ ] Configure CDN
- [ ] Set up monitoring (Sentry)
- [ ] Configure backups

### Checkpoint 10.2: Launch Preparation
- [ ] Create deployment pipeline
- [ ] Perform load testing
- [ ] Create user documentation
- [ ] Prepare support materials
- [ ] Final security audit

---

## 👥 Agent Instructions

### Marketing Background Agent - סוכן שיווק
**Mission**: Research Israeli market for couple/family games and create Hebrew-focused marketing strategy.

**Tasks**:
1. Analyze Israeli couple gaming culture and preferences
2. Research Hebrew terminology for gaming and relationships
3. Study Israeli family dynamics and game rental behaviors
4. Analyze competitors in the Israeli market (חנויות משחקים, ספריות)
5. Define Hebrew messaging that resonates with Israeli audiences
6. Create culturally appropriate onboarding flows
7. Plan community building for Israeli couples/families
8. Research Israeli holidays and seasonal patterns

**Deliverables**:
- פרסונות קהל יעד ישראלי
- ניתוח תחרותי בשוק הישראלי
- מדריך מסרים שיווקיים בעברית
- אסטרטגיית ערוצים ישראלית
- מפות מסע משתמש בהקשר ישראלי

### Researcher Agent - סוכן מחקר
**Mission**: Deep dive into Israeli user needs and Hebrew UI/UX best practices.

**Tasks**:
1. Research Israeli couple/family gaming behaviors
2. Study Hebrew UI/UX patterns and conventions
3. Analyze RTL design challenges and solutions
4. Research Israeli coordinator workflow preferences
5. Study WhatsApp usage patterns in Israel
6. Investigate Hebrew form design best practices
7. Research accessibility needs for Hebrew speakers
8. Study Israeli user expectations for rental systems

**Deliverables**:
- הערכת צרכי משתמש ישראלי
- ניתוח נקודות כאב בעברית
- המלצות עיצוב RTL
- דוח העדפות תקשורת ישראלית
- מדריך נגישות בעברית

### Feature Planning Agent
**Mission**: Create detailed feature roadmap and prioritization strategy.

**Tasks**:
1. Map features to user value and business impact
2. Create MVP vs full version comparison
3. Define success metrics for each feature
4. Plan A/B testing strategies
5. Create feature dependency map
6. Design progressive enhancement strategy
7. Plan post-launch feature pipeline

**Deliverables**:
- Feature roadmap with timelines
- MVP feature list
- Success metrics document
- A/B testing plan
- Post-launch feature backlog
- Integration possibilities report

---

## 🎯 Success Criteria

### Technical
- [ ] Page load time < 3 seconds
- [ ] Mobile responsiveness on all screens
- [ ] 99.9% uptime
- [ ] Support for 1000+ concurrent users

### Business
- [ ] 80% of rentals processed within 24 hours
- [ ] < 5% rental abandonment rate
- [ ] 90%+ user satisfaction rating
- [ ] Support for 50+ centers

### User Experience
- [ ] Intuitive navigation (< 3 clicks to any feature)
- [ ] Consistent UI/UX across all dashboards
- [ ] Full RTL support
- [ ] Accessible (WCAG 2.1 AA compliant)

---

## 🚀 Next Steps
1. Review and approve project plan
2. Set up development environment
3. Create detailed technical specifications
4. Begin Phase 1 implementation
5. Schedule weekly progress reviews