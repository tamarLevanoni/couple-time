# Current Tasks - Couple-Time Project

## Active Task: UI Implementation Planning & Corrections

### Task Summary
Finalize UI implementation plan with corrections to rental process flow, authentication integration, coordinator dashboard functionality, and data flow patterns validation.

### Current Status: PLANNING

---

## ⚠️ BEFORE EXECUTION - MANDATORY VERIFICATION

**Before implementing any changes, thoroughly check:**

1. **API Route Analysis**
   - Review all `/api` relevant operations 
   - Check `/api` for complete flow

2. **Type System Review**
   - Check all types in `/types` and `lib/validations.ts` for operations
   - Verify data structures

3. **Store Implementation Check**
   - Analyze CoordinatorStore for missing operations
   - Check RentalsStore for complete user flow
   - Verify data flow between stores

4. **Current Component Analysis**
   - Understand current navigation and routing patterns

**Only proceed with implementation after confirming all current capabilities and limitations.**

---

## Priority Corrections to Implement

### 1. **Game Availability Display Logic**
**Issue**: Shows availability always  
**Fix**: Only show when center is selected
```
- Hide availability status by default
- Show availability only after center selection
- Filter games by selected center for availability
- Clear availability when center changes
```

### 2. **Rental Request Flow Simplification**
**Issue**: Complex guest form handling  
**Fix**: Auto-redirect to auth popup
```
OLD FLOW:
- Guest fills form → Submit → Redirect to auth → Complete

NEW FLOW: 
- Select center/game → Auth popup if not logged in → Submit rental after auth
- No guest form - direct auth integration
- Rental data preserved during auth flow
```

### 3. **CoordinatorDashboard Enhancement**
**Issue**: Limited rental management  
**Fix**: Complete rental lifecycle management
```
- Show ALL rentals (pending/active/returned/history)
- Add return rental functionality
- Handle rental status transitions
- Manage complete rental lifecycle
```

### 4. **Data Flow Pattern Validation**
**Issue**: Patterns may not match actual API capabilities  
**Fix**: Verify against real API routes and types
```
- Check each pattern against actual API endpoints
- Verify type usage matches implemented schemas
- Confirm store operations align with API capabilities
- Update patterns to reflect real implementation
```

---

## Revised Implementation Plan

### Phase 1: Core User Experience (US-1.1, US-1.2, US-1.3, US-1.4)

#### **Public Components**
- [ ] **Game Catalog Page**
  - Browse games with filtering/search
  - NO availability display initially
  - Show availability ONLY when center selected

- [ ] **Center Finder Page**
  - Find centers with area/city filtering
  - Integration with game availability

- [ ] **Add Rental Request Page** 
  - PUBLIC access but requires auth
  - Center + Game selection dropdowns
  - NO guest form - immediate auth popup if not logged in
  - Rental data preserved during auth flow

- [ ] **Rental Confirmation Page**
  - Success page with coordinator contact
  - WhatsApp integration with pre-filled message

#### **Protected Components**
- [ ] **My Rentals Page**
  - View/manage user rentals
  - Filter by status (pending/active/history)
  - Cancel pending rentals

- [ ] **User Profile Page**
  - View/edit profile details

### Phase 2: Authentication & User Management (US-1.6, US-1.7)

#### **Authentication Flow**
- [ ] **Login/Register Auth Popup**
  - Modal-based authentication
  - Email and Google OAuth options
  - Integrated with rental request flow

- [ ] **Auth Integration**
  - Seamless rental request → auth → rental completion
  - Rental data preservation across auth flow

### Phase 3: Management Dashboards (US-2.x, US-4.x)

#### **Enhanced Coordinator Dashboard**
- [ ] **Complete Rental Management**
  - ALL rentals view (pending/active/returned/history)
  - Approve/reject pending rentals
  - Mark rentals as returned/completed
  - Handle full rental lifecycle

- [ ] **Game Instance Management**
  - Update game status and notes
  - Handle game availability

- [ ] **Manual Rental Creation**
  - Create rentals for walk-in users

#### **Admin Dashboard**
- [ ] **System Administration**
  - User, center, and game management
  - Role assignments and system reports

---

## Corrected Data Flow Patterns

### **Pattern 1: Rental Request Flow (Revised)**
```typescript
// NEW SIMPLIFIED FLOW:
User selects game/center → 
Check if authenticated → 
If not: Auth popup → 
Complete auth → 
Submit rental with authenticated user → 
Rental confirmation page

// NO guest form, NO complex data preservation
// Auth popup handles user registration/login
// Rental submitted immediately after successful auth
```

### **Pattern 2: Coordinator Rental Management (Enhanced)**
```typescript
// ALL RENTAL STATES:
CoordinatorDashboard → 
Load ALL rentals (not just pending/active) → 
Tabs: Pending | Active | Returned | History → 
Actions: Approve/Reject/Return/View → 
Handle complete rental lifecycle
```

### **Pattern 3: Game Availability (Conditional)**
```typescript
// CONDITIONAL DISPLAY:
GameCatalogPage → 
Default: Show games WITHOUT availability → 
User selects center → 
Filter games by center → 
NOW show availability status → 
User can see which games available at selected center
```

---

## Implementation Notes

### Technical Requirements
- ✅ **API Routes**: All endpoints implemented and tested
- ✅ **Zustand Stores**: All 6 stores completed with data loading optimization
- ✅ **Authentication**: NextAuth configured with Google OAuth
- ✅ **Database**: Prisma schema and relationships established

### Success Metrics
- Users can browse games and centers with instant loading
- Rental request flow is simple and intuitive (no guest forms)  
- Coordinators can manage complete rental lifecycle
- Game availability shows only when relevant (center selected)

### Development Guidelines
- Follow existing `/types` and `lib/validations.ts` architecture for all type definitions
- Use optimized store patterns (atomic selectors, data loading strategy)
- Implement proper error handling and loading states
- Ensure mobile-responsive design
- Add comprehensive testing for all flows

---

*Last Updated: January 2025*