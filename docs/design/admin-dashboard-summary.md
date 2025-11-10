# Admin Dashboard UI Specification - Quick Reference

## Overview
Complete design specification for upgrading the admin dashboard with enhanced modals, data tables, and improved UX.

**Full Specification:** `/docs/design/admin-dashboard-ui-spec.md`

---

## Key Components to Build

### 1. Modals (5 types)
- **UserModal** - Create/Edit/View users with role display
- **RoleAssignmentModal** - Assign roles with conditional center selection
- **CenterModal** - Create/Edit centers with coordinator assignment
- **GameModal** - Create/Edit games with categories and image upload
- **GameToCenterModal** - Bulk assign game instances to centers

### 2. Enhanced Data Tables (3 tables)
- **UsersDataTable** - Full data table with sorting, filtering, bulk actions
- **CentersDataTable** - Area filtering, coordinator info, game counts
- **GamesDataTable** - Category filters, instance tracking, availability status

### 3. Supporting Components
- **DataTable** - Reusable table component with @tanstack/react-table
- **DataTableToolbar** - Search, filters, and bulk actions bar
- **DataTablePagination** - Pagination controls
- **Skeleton** - Loading placeholders
- **Spinner** - Loading indicators

---

## Design System

### Colors
```typescript
Primary: #f15555 (brand red)
Hover: #dc3030
Success: #10b981
Warning: #f59e0b
Error: #ef4444

Roles:
- Admin: #ef4444
- Super Coordinator: #3b82f6
- Coordinator: #8b5cf6
```

### Spacing
- xs: 4px, sm: 8px, md: 16px, lg: 24px, xl: 32px

### Typography
- Font: Inter
- Sizes: xs (12px), sm (14px), base (16px), lg (18px), xl (20px), 2xl (24px)

---

## Key Features

### User Management
- Create/edit users with validation
- View user details and rental history
- Block/unblock users
- Assign multiple roles (with optional center)
- Bulk operations (block, unblock, export)
- Search by name/email
- Filter by role and status

### Center Management
- Create/edit centers
- Assign coordinators
- Track game instances per center
- Filter by area
- Search by name
- Show centers without coordinators

### Game Management
- Create/edit games with categories
- Image upload with preview
- Multi-category selection
- Target audience selection
- Bulk assign to centers
- Filter by category, audience, availability
- Track available vs. total instances

---

## Loading Strategy

1. **Progressive Loading:**
   - Stats first (fastest)
   - Users second (most used)
   - Centers third
   - Games last (lazy load)

2. **Loading States:**
   - Full page skeleton on initial load
   - Table skeletons during data fetch
   - Button spinners during actions
   - Progress indicator for multi-stage loads

3. **Error Handling:**
   - Inline field validation
   - Form-level errors with retry
   - Page-level errors with dismiss
   - Empty states with call-to-action

---

## Responsive Breakpoints

- **Mobile (<768px):** Single column, card lists, bottom sheets
- **Tablet (768-1024px):** 2 columns, side drawers, scrollable tables
- **Desktop (>1024px):** Full grid, centered modals, all columns visible

---

## Accessibility

- All WCAG 2.1 AA requirements met
- Full keyboard navigation
- ARIA labels and roles
- Color contrast ratios validated
- Screen reader support
- Focus management in modals

---

## Implementation Phases

### Week 1: Foundation
- DataTable component
- DataTableToolbar
- Modal updates
- Loading components

### Week 2: Users
- UsersDataTable
- UserModal
- RoleAssignmentModal
- Bulk actions

### Week 3: Centers
- CentersDataTable
- CenterModal
- Coordinator assignment

### Week 4: Games
- GamesDataTable
- GameModal
- GameToCenterModal
- Image handling

### Week 5: Enhancements
- Quick actions
- Recent activity
- Keyboard shortcuts
- Export functionality

### Week 6: Polish
- Testing
- Accessibility audit
- Performance optimization
- Error boundaries

---

## File Structure

```
src/components/
├── ui/
│   ├── data-table.tsx (NEW)
│   ├── data-table-toolbar.tsx (NEW)
│   ├── data-table-pagination.tsx (NEW)
│   └── skeleton.tsx (NEW)
│
└── admin/
    ├── users/
    │   ├── users-data-table.tsx (REPLACE)
    │   ├── user-modal.tsx (NEW)
    │   ├── role-assignment-modal.tsx (NEW)
    │   └── user-table-columns.tsx (NEW)
    │
    ├── centers/
    │   ├── centers-data-table.tsx (REPLACE)
    │   ├── center-modal.tsx (NEW)
    │   └── center-table-columns.tsx (NEW)
    │
    └── games/
        ├── games-data-table.tsx (REPLACE)
        ├── game-modal.tsx (NEW)
        ├── game-to-center-modal.tsx (NEW)
        └── game-table-columns.tsx (NEW)
```

---

## Quick Start

1. **Read full spec:** `/docs/design/admin-dashboard-ui-spec.md`
2. **Install dependencies:** `@tanstack/react-table` (if not already installed)
3. **Start with Phase 1:** Build foundation components
4. **Follow roadmap:** Complete phases sequentially
5. **Test continuously:** Write tests as you build

---

## Design Decisions

### Why DataTable over Card Lists?
- Better scalability for large datasets
- More efficient scanning
- Standard admin interface pattern
- Easier sorting and filtering
- Better desktop experience

### Why Progressive Loading?
- Faster perceived performance
- Users see stats immediately
- Reduces initial bundle size
- Better mobile experience

### Why Separate Modal Components?
- Clear separation of concerns
- Easier to test
- Reusable validation logic
- Better code organization

### Why @tanstack/react-table?
- Industry standard
- Excellent TypeScript support
- Headless (full control over UI)
- Great documentation
- Active maintenance

---

## Testing Strategy

### Unit Tests
- Modal validation logic
- Table filtering/sorting
- Form submission handlers
- Data transformations

### Integration Tests
- Complete CRUD workflows
- Role assignment flow
- Bulk operations
- Error handling

### Accessibility Tests
- Keyboard navigation
- Screen reader compatibility
- Color contrast
- Focus management

### Performance Tests
- Initial load time
- Table rendering with large datasets
- Modal open/close speed
- Search/filter responsiveness

---

## Notes

- All components follow existing patterns from SystemStats
- Uses existing UI components (Button, Badge, Card, etc.)
- Maintains brand color (#f15555)
- Follows CLAUDE.md development standards
- No emojis unless explicitly requested
- RTL support not required (Hebrew UI can be added later)

---

For detailed specifications, implementation examples, and complete component code, see:
**`/docs/design/admin-dashboard-ui-spec.md`**
