# User Stories - Game Rental System

## 1. User Stories - Regular User

### US-1.1: Browse Game Catalog
**As a user**, I want to **see all games** so that **I can choose a game that suits me**

**Acceptance Criteria:**
- [ ] I can see a general catalog of recommended games (without availability)
- [ ] I can select a center and see only games available there
- [ ] I can filter by status (all/available/borrowed)
- [ ] I see for each game: image, name, short description, categories, target audience
- [ ] On mobile - the display is comfortable and readable

### US-1.2: Find Nearby Center
**As a user**, I want to **find a center close to me** so that **I know where to borrow from**

**Acceptance Criteria:**
- [ ] I see a map with all centers
- [ ] I can filter by region/city
- [ ] I see center details: name, city, phone
- [ ] I can go directly to that center's catalog

### US-1.3: Request Rental
**As a user**, I want to **request to borrow a game** so that **I can take it home**

**Acceptance Criteria:**
- [ ] I can fill out a form with: center, game, personal details
- [ ] If the game is borrowed - I see a warning but can continue
- [ ] On submission - registration is required (if not logged in): Google OAuth or email/password
- [ ] After submission - I get confirmation with coordinator details
- [ ] I can open WhatsApp with a ready message or make a call

### US-1.4: Manage My Rentals
**As a user**, I want to **see all my rentals** so that **I can track the status**

**Acceptance Criteria:**
- [ ] I see pending/active/history rentals
- [ ] I can cancel a pending request
- [ ] I can see full rental details
- [ ] I can contact the coordinator (WhatsApp/phone)

### US-1.5: Return Game and Give Feedback
**As a user**, I want to **return a game and give feedback** so that **I can help others**

**Acceptance Criteria:**
- [ ] I return physically to the coordinator
- [ ] I receive a message with a feedback request (not mandatory)
- [ ] I can fill out: select region → center → game → ratings → comments
- [ ] The feedback is anonymous

### US-1.6: Update Personal Details
**As a user**, I want to **update my details** so that **the coordinator can contact me**

**Acceptance Criteria:**
- [ ] I can edit: name, phone
- [ ] I cannot edit: email (protected field regardless of registration method)
- [ ] Changes are saved immediately

### US-1.7: User Registration Options
**As a user**, I want to **register with my preferred method** so that **I can access the system easily**

**Acceptance Criteria:**
- [ ] I can register with Google OAuth (quick, no password needed)
- [ ] I can register with email and password (traditional method)
- [ ] Both methods require: name, email, phone number
- [ ] Password registration requires minimum 8 characters
- [ ] After registration, I can immediately request rentals
- [ ] I can later link/unlink authentication methods in my profile

---

## 2. User Stories - Center Coordinator

### US-2.1: View Dashboard with All Current Rentals
**As a center coordinator**, I want to **see all pending and active rentals immediately** so that **I can get a complete overview when I log in**

**Acceptance Criteria:**
- [ ] On first login, I see both pending and active rentals in one API call
- [ ] I see tabs: "Pending" (new requests) and "Active" (current rentals)
- [ ] Pending shows: requester name, phone, game, request date
- [ ] Active shows: borrower name, game, borrow date, expected return date, overdue status
- [ ] Overdue items are highlighted in red/orange
- [ ] I receive alerts (email+WhatsApp) for every new request
- [ ] On mobile - I can view and manage easily
- [ ] Returned rentals are loaded separately with date range filters (not in initial load)

### US-2.2: Approve Rental
**As a center coordinator**, I want to **approve a rental** so that **I can document that the game was taken**

**Acceptance Criteria:**
- [ ] I click "approve" only after the user physically took the game
- [ ] Status changes to ACTIVE
- [ ] I can edit the return date (default: one week)
- [ ] The user receives an automatic notification

### US-2.3: Manage Active Rentals
**As a center coordinator**, I want to **track active rentals** so that **I can ensure timely return**

**Acceptance Criteria:**
- [ ] I see an "active" tab with all rentals
- [ ] Overdue items are highlighted in red/orange
- [ ] I can filter: all/on time/overdue
- [ ] I can mark "returned" when they return
- [ ] I can send a feedback request via WhatsApp

### US-2.4: update Game

**Acceptance Criteria:**
- [ ] I can update status to 'unavaliable' and notes

### US-2.5: Create Manual Rental
**As a center coordinator**, I want to **create a rental for someone** so that **I can help those who struggle with the system**

**Acceptance Criteria:**
- [ ] I can search for an existing user in the system (by name/phone/email)
- [ ] I select a game from my center and create a rental
- [ ] The rental is created directly in ACTIVE status (not PENDING)
- [ ] The existing user receives a notification

**Future Option** - rental without user:
- [ ] Create "anonymous rental" with basic contact details
- [ ] Separate management of such rentals (without automatic notifications)
- [ ] Fields: name, phone, game, return date
- [ ] These records are not linked to a user in the system

### US-2.6: View Center Statistics
**As a center coordinator**, I want to **see data about my center** so that **I can understand what works**

**Acceptance Criteria:**
- [ ] I see: number of rentals, popular games, percentage of delays
- [ ] I see my super coordinator's details
- [ ] I can see return history

---

## 3. User Stories - Super Coordinator

### US-3.1: Supervise Centers
**As a super coordinator**, I want to **see the status of all my centers** so that **I can identify problems**

**Acceptance Criteria:**
- [ ] I see a list of centers I supervise
- [ ] For each center: pending requests, active rentals, overdue items
- [ ] I can enter management of any center
- [ ] I see contact details of all my coordinators

### US-3.2: Assist with Request Management
**As a super coordinator**, I want to **help busy coordinators** so that **requests are handled on time**

**Acceptance Criteria:**
- [ ] I see all pending requests in my centers
- [ ] I can approve/reject requests instead of the coordinator
- [ ] Actions are recorded under my name

### US-3.3: Track Overdue Items
**As a super coordinator**, I want to **see a centralized overdue report** so that **I can handle problems**

**Acceptance Criteria:**
- [ ] I see a list of all overdue items in my centers
- [ ] I can filter by center/time period
- [ ] I can send reminders

---

## 4. User Stories - System Administrator (Admin)

### US-4.1: Manage Users
**As a system administrator**, I want to **manage all users** so that **I can control access**

**Acceptance Criteria:**
- [ ] I see a table of all users
- [ ] I can search/filter users
- [ ] I can change roles (coordinator/super coordinator/admin)
- [ ] I can block/unblock users
- [ ] I can assign a coordinator to a center

### US-4.2: Manage Centers
**As a system administrator**, I want to **manage all centers** so that **I can expand the network**

**Acceptance Criteria:**
- [ ] I can add a new center
- [ ] I can edit center details
- [ ] I can assign a coordinator to a center
- [ ] I can assign a super coordinator to centers
- [ ] I can deactivate/activate a center

### US-4.3: Global Game Management
**As a system administrator**, I want to **manage the game catalog** so that **I can maintain quality**

**Acceptance Criteria:**
- [ ] I see all games in the system
- [ ] I can edit/delete games
- [ ] I can mark games for "general catalog"
- [ ] I can add games to centers centrally

### US-4.4: Reports and Statistics
**As a system administrator**, I want to **see comprehensive reports** so that **I can make informed decisions**

**Acceptance Criteria:**
- [ ] I see a dashboard with general data
- [ ] I can generate reports: rentals, games, centers, coordinators
- [ ] I can filter by time period/center/region
- [ ] I can export to Excel/CSV
- [ ] I see graphs and trends

---

## 5. User Stories - Automated Processes

### US-5.1: Automatic Reminders
**As a system**, I want to **send automatic reminders** so that **I can prevent delays**

**Acceptance Criteria:**
- [ ] Reminder to user one day before return
- [ ] Reminder on return day
- [ ] Reminder after 3 days overdue
- [ ] Reminder after one week overdue
- [ ] Overdue report to coordinator after one week

### US-5.2: Event Notifications
**As a system**, I want to **alert about important events** so that **everyone stays updated**

**Acceptance Criteria:**
- [ ] Alert to coordinator about new request
- [ ] Alert to user about request acceptance
- [ ] Alert to user about rental approval
- [ ] Alert to coordinator about new feedback
- [ ] Notifications sent via email and WhatsApp link

---

## General Notes:

1. **Permissions**: Every user with a management role (coordinator/super coordinator/admin) can also borrow games as a regular user
2. **Centers**: Each coordinator manages only one center
3. **Notifications**: WhatsApp communication preferred, with email backup
4. **Feedback**: Anonymous and optional
5. **Availability**: Default return date is one week