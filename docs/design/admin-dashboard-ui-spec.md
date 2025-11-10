# Admin Dashboard UI Specification

## Document Overview
**Project:** Couple-Time Game Rental Management System
**Component:** Admin Dashboard
**Version:** 1.0
**Last Updated:** 2025-11-10
**Tech Stack:** Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Zustand

## Table of Contents
1. [Design System Foundation](#design-system-foundation)
2. [Component Architecture](#component-architecture)
3. [Modal Specifications](#modal-specifications)
4. [Data Table Specifications](#data-table-specifications)
5. [Loading & Error States](#loading--error-states)
6. [Responsive Design](#responsive-design)
7. [Accessibility Requirements](#accessibility-requirements)
8. [Implementation Roadmap](#implementation-roadmap)

---

## Design System Foundation

### Color Palette

```typescript
// Primary Brand Color
const colors = {
  primary: {
    DEFAULT: '#f15555',      // Brand red
    hover: '#dc3030',        // Darker red for hover states
    light: '#fef2f2',        // Light background for info sections
    dark: '#991b1b',         // Dark red for critical actions
  },

  // Semantic Colors
  success: {
    DEFAULT: '#10b981',      // Green
    light: '#d1fae5',
    dark: '#047857',
  },
  warning: {
    DEFAULT: '#f59e0b',      // Orange
    light: '#fef3c7',
    dark: '#d97706',
  },
  error: {
    DEFAULT: '#ef4444',      // Red
    light: '#fee2e2',
    dark: '#dc2626',
  },

  // Role-based Colors
  roles: {
    admin: '#ef4444',         // Red
    super: '#3b82f6',         // Blue
    coordinator: '#8b5cf6',   // Purple
    user: '#6b7280',          // Gray
  },

  // Status Colors
  status: {
    active: '#10b981',
    inactive: '#6b7280',
    blocked: '#ef4444',
    pending: '#f59e0b',
  }
};
```

### Typography Scale

```typescript
const typography = {
  // Font Families
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['Fira Code', 'monospace'],
  },

  // Font Sizes
  fontSize: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
  },

  // Font Weights
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  // Line Heights
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.75,
  }
};
```

### Spacing System

```typescript
const spacing = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
  '3xl': '4rem',   // 64px
};
```

### Border Radius

```typescript
const borderRadius = {
  sm: '0.25rem',   // 4px
  md: '0.375rem',  // 6px
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  '2xl': '1rem',   // 16px
  full: '9999px',  // Full circle
};
```

### Shadows

```typescript
const shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
};
```

---

## Component Architecture

### Dashboard Structure

```
AdminDashboard
├── DashboardHeader
├── ErrorAlert (conditional)
├── Tabs Container
│   ├── Tab: Overview
│   │   ├── SystemStats
│   │   ├── QuickActions
│   │   └── RecentActivity
│   ├── Tab: Users
│   │   ├── DataTableToolbar (search, filter, actions)
│   │   ├── UsersDataTable
│   │   └── Pagination
│   ├── Tab: Centers
│   │   ├── DataTableToolbar
│   │   ├── CentersDataTable
│   │   └── Pagination
│   └── Tab: Games
│       ├── DataTableToolbar
│       ├── GamesDataTable
│       └── Pagination
└── Modals (Portal rendered)
    ├── UserModal (create/edit/view)
    ├── RoleAssignmentModal
    ├── CenterModal (create/edit)
    ├── GameModal (create/edit)
    └── GameToCenterModal
```

### Component Hierarchy

```typescript
// Component Props Types
interface AdminDashboardProps {
  initialTab?: 'overview' | 'users' | 'centers' | 'games';
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  searchKey: string;
  onRowClick?: (row: T) => void;
  enableRowSelection?: boolean;
  onSelectionChange?: (rows: T[]) => void;
}

interface DataTableToolbarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  filters?: FilterConfig[];
  actions?: ActionButton[];
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  data?: any;
  onSubmit?: (data: any) => Promise<void>;
}
```

---

## Modal Specifications

### 1. User Modal (Create/Edit/View)

**Purpose:** Create new users, edit existing users, or view user details.

#### Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  ✕                   User Details                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Personal Information                                   │
│  ┌─────────────────┐  ┌─────────────────┐             │
│  │ First Name   *  │  │ Last Name    *  │             │
│  └─────────────────┘  └─────────────────┘             │
│                                                         │
│  Contact Information                                    │
│  ┌───────────────────────────────────────────┐         │
│  │ Email *                                   │         │
│  └───────────────────────────────────────────┘         │
│  ┌───────────────────────────────────────────┐         │
│  │ Phone                                     │         │
│  └───────────────────────────────────────────┘         │
│                                                         │
│  Account Settings                                       │
│  ☐ Account is Active                                   │
│                                                         │
│  Current Roles: [COORDINATOR] [Remove]                 │
│  + Assign New Role                                      │
│                                                         │
│                                                         │
│                    [Cancel]  [Save User]               │
└─────────────────────────────────────────────────────────┘
```

#### Component Props

```typescript
interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  userId?: string;
  onSubmit: (data: CreateUserInput | UpdateUserInput) => Promise<void>;
}

interface UserFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  isActive: boolean;
}
```

#### Validation Rules

```typescript
const userValidationSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  isActive: z.boolean().default(true),
});
```

#### States & Interactions

- **Create Mode:**
  - Empty form with default values
  - Submit button: "Create User"
  - All fields editable

- **Edit Mode:**
  - Pre-filled with user data
  - Submit button: "Save Changes"
  - All fields editable
  - Show loading state during save

- **View Mode:**
  - Pre-filled with user data
  - All fields read-only
  - No submit button
  - Show "Edit" button instead
  - Display additional info: Created date, last login, rental history link

#### Error Handling

- Inline field validation on blur
- Form-level errors displayed at top
- API errors displayed with retry option
- Prevent duplicate email addresses

#### Implementation Example

```tsx
'use client';

import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useAdminStore } from '@/store/admin-store';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit' | 'view';
  userId?: string;
}

export function UserModal({ isOpen, onClose, mode, userId }: UserModalProps) {
  const { createUser, updateUser, users, isSubmitting } = useAdminStore();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (mode === 'edit' || mode === 'view') {
      const user = users.find(u => u.id === userId);
      if (user) {
        setFormData({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone || '',
          isActive: user.isActive,
        });
      }
    } else {
      // Reset form for create mode
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        isActive: true,
      });
    }
  }, [mode, userId, users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate
    const newErrors: Record<string, string> = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) newErrors.email = 'Email is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      if (mode === 'create') {
        await createUser(formData);
      } else if (mode === 'edit' && userId) {
        await updateUser(userId, formData);
      }
      onClose();
    } catch (err) {
      setErrors({ submit: 'Failed to save user' });
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="p-6">
        {/* Header */}
        <h2 className="text-2xl font-bold mb-6">
          {mode === 'create' && 'Create New User'}
          {mode === 'edit' && 'Edit User'}
          {mode === 'view' && 'User Details'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Personal Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First Name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                error={errors.firstName}
                disabled={isReadOnly}
                required
              />
              <Input
                label="Last Name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                error={errors.lastName}
                disabled={isReadOnly}
                required
              />
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">Contact Information</h3>
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                error={errors.email}
                disabled={isReadOnly}
                required
              />
              <Input
                label="Phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                disabled={isReadOnly}
              />
            </div>
          </div>

          {/* Account Settings */}
          {mode !== 'create' && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Account Settings</h3>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, isActive: checked as boolean })
                  }
                  disabled={isReadOnly}
                />
                <label htmlFor="isActive" className="text-sm text-gray-700">
                  Account is Active
                </label>
              </div>
            </div>
          )}

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          {!isReadOnly && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {mode === 'create' ? 'Create User' : 'Save Changes'}
              </Button>
            </div>
          )}

          {isReadOnly && (
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button variant="outline" onClick={onClose} type="button">
                Close
              </Button>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
}
```

---

### 2. Role Assignment Modal

**Purpose:** Assign or change user roles with optional center selection for coordinators.

#### Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  ✕              Assign Role to User                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  User: John Doe (john@example.com)                     │
│                                                         │
│  Current Roles:                                         │
│  [CENTER_COORDINATOR at Tel Aviv Center] [Remove]      │
│                                                         │
│  ─────────────────────────────────────────────────      │
│                                                         │
│  Assign New Role                                        │
│  ┌───────────────────────────────────────────┐         │
│  │ Select Role               ▼               │         │
│  │  ○ Center Coordinator                     │         │
│  │  ○ Super Coordinator                      │         │
│  │  ○ Admin                                  │         │
│  └───────────────────────────────────────────┘         │
│                                                         │
│  [Conditional: If Center Coordinator selected]         │
│  ┌───────────────────────────────────────────┐         │
│  │ Select Center             ▼               │         │
│  └───────────────────────────────────────────┘         │
│                                                         │
│                                                         │
│                    [Cancel]  [Assign Role]             │
└─────────────────────────────────────────────────────────┘
```

#### Component Props

```typescript
interface RoleAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  currentRoles: Array<{
    role: Role;
    centerId?: string;
    centerName?: string;
  }>;
  onAssign: (data: AssignRoleInput) => Promise<void>;
  onRemove: (role: Role, centerId?: string) => Promise<void>;
}

interface AssignRoleInput {
  userId: string;
  role: Role;
  centerId?: string;
}
```

#### Business Rules

- **CENTER_COORDINATOR:** MUST select a center
- **SUPER_COORDINATOR:** Center selection is optional
- **ADMIN:** No center selection
- User can have multiple roles (e.g., coordinator at different centers)
- Cannot assign duplicate role+center combination
- Admin cannot remove their own admin role (prevent lockout)

#### States & Interactions

1. **Initial State:**
   - Display current roles with remove buttons
   - Role selector disabled until previous assignment completes

2. **Role Selection:**
   - Radio buttons for role selection
   - Center selector appears only for CENTER_COORDINATOR
   - Center selector optional for SUPER_COORDINATOR

3. **Loading States:**
   - Disable all inputs during API call
   - Show spinner on submit button

4. **Success State:**
   - Update current roles list
   - Clear form
   - Show success message

#### Implementation Example

```tsx
'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminStore } from '@/store/admin-store';
import type { Role } from '@/types';

interface RoleAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function RoleAssignmentModal({ isOpen, onClose, userId }: RoleAssignmentModalProps) {
  const { users, centers, assignRole, isSubmitting } = useAdminStore();
  const [selectedRole, setSelectedRole] = useState<Role | ''>('');
  const [selectedCenter, setSelectedCenter] = useState<string>('');

  const user = users.find(u => u.id === userId);
  const roleOptions = [
    { value: 'CENTER_COORDINATOR', label: 'Center Coordinator' },
    { value: 'SUPER_COORDINATOR', label: 'Super Coordinator' },
    { value: 'ADMIN', label: 'Admin' },
  ];

  const centerOptions = centers.map(c => ({
    value: c.id,
    label: c.name,
  }));

  const handleAssign = async () => {
    if (!selectedRole) return;

    try {
      await assignRole({
        userId,
        role: selectedRole as Role,
        centerId: selectedCenter || undefined,
      });

      // Reset form
      setSelectedRole('');
      setSelectedCenter('');
    } catch (err) {
      // Error handled by store
    }
  };

  const requiresCenter = selectedRole === 'CENTER_COORDINATOR';
  const canSubmit = selectedRole && (!requiresCenter || selectedCenter);

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg">
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-6">Assign Role to User</h2>

        {/* User Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="font-medium">{user?.firstName} {user?.lastName}</p>
          <p className="text-sm text-gray-600">{user?.email}</p>
        </div>

        {/* Current Roles */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-2">Current Roles:</h3>
          {user?.roles && user.roles.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {user.roles.map((role, idx) => (
                <Badge key={idx} variant="outline">
                  {role}
                </Badge>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No roles assigned</p>
          )}
        </div>

        <div className="border-t pt-6 space-y-4">
          <h3 className="text-sm font-medium">Assign New Role</h3>

          <Select
            label="Select Role"
            options={roleOptions}
            placeholder="Choose a role..."
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value as Role)}
            fullWidth
          />

          {requiresCenter && (
            <Select
              label="Select Center"
              options={centerOptions}
              placeholder="Choose a center..."
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              fullWidth
            />
          )}

          {selectedRole === 'SUPER_COORDINATOR' && (
            <Select
              label="Select Center (Optional)"
              options={centerOptions}
              placeholder="Choose a center or leave empty..."
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              fullWidth
              helper="Super coordinators can optionally be assigned to a specific center"
            />
          )}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleAssign}
            loading={isSubmitting}
            disabled={!canSubmit}
          >
            Assign Role
          </Button>
        </div>
      </div>
    </Modal>
  );
}
```

---

### 3. Center Modal (Create/Edit)

**Purpose:** Create new centers or edit existing ones, with coordinator assignment.

#### Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  ✕                Center Details                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Basic Information                                      │
│  ┌───────────────────────────────────────────┐         │
│  │ Center Name *                             │         │
│  └───────────────────────────────────────────┘         │
│                                                         │
│  ┌───────────────────────────────────────────┐         │
│  │ Area *                    ▼               │         │
│  │  ○ North                                  │         │
│  │  ○ Center                                 │         │
│  │  ○ South                                  │         │
│  │  ○ Jerusalem                              │         │
│  │  ○ Judea & Samaria                        │         │
│  └───────────────────────────────────────────┘         │
│                                                         │
│  ┌───────────────────────────────────────────┐         │
│  │ Address                                   │         │
│  └───────────────────────────────────────────┘         │
│                                                         │
│  Coordinator Assignment                                 │
│  ┌───────────────────────────────────────────┐         │
│  │ Select Coordinator        ▼               │         │
│  └───────────────────────────────────────────┘         │
│                                                         │
│  Current Coordinator: Jane Smith                        │
│  [Change Coordinator]                                   │
│                                                         │
│                                                         │
│                    [Cancel]  [Save Center]             │
└─────────────────────────────────────────────────────────┘
```

#### Component Props

```typescript
interface CenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  centerId?: string;
  onSubmit: (data: CreateCenterInput | UpdateCenterInput) => Promise<void>;
}

interface CenterFormData {
  name: string;
  area: Area;
  address?: string;
  coordinatorId?: string;
}
```

#### Validation Rules

```typescript
const centerValidationSchema = z.object({
  name: z.string().min(2, 'Center name must be at least 2 characters'),
  area: z.enum(['NORTH', 'CENTER', 'SOUTH', 'JERUSALEM', 'JUDEA_SAMARIA']),
  address: z.string().optional(),
  coordinatorId: z.string().optional(),
});
```

#### Business Rules

- Center name must be unique
- Area is required and must be one of the enum values
- Coordinator is optional but recommended
- Can only assign users with COORDINATOR role
- When changing coordinator, show warning if center has active rentals

---

### 4. Game Modal (Create/Edit)

**Purpose:** Create new games or edit existing game information.

#### Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  ✕                  Game Details                        │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Basic Information                                      │
│  ┌───────────────────────────────────────────┐         │
│  │ Game Name *                               │         │
│  └───────────────────────────────────────────┘         │
│                                                         │
│  ┌───────────────────────────────────────────┐         │
│  │ Description                               │         │
│  │                                           │         │
│  │                                           │         │
│  └───────────────────────────────────────────┘         │
│                                                         │
│  Classification                                         │
│  Categories *                                           │
│  ☐ Communication  ☐ Intimacy  ☐ Fun                   │
│  ☐ Therapy        ☐ Personal Development              │
│                                                         │
│  Target Audience *                                      │
│  ○ Singles  ○ Married  ○ General                      │
│                                                         │
│  Media                                                  │
│  ┌───────────────────────────────────────────┐         │
│  │ Image URL                                 │         │
│  └───────────────────────────────────────────┘         │
│  [Preview]                                              │
│                                                         │
│  Game Properties                                        │
│  ┌──────┐  ┌──────┐  ┌──────┐                         │
│  │ Min  │  │ Max  │  │ Dura │                         │
│  │ Play │  │ Play │  │ tion │                         │
│  └──────┘  └──────┘  └──────┘                         │
│                                                         │
│                                                         │
│                    [Cancel]  [Save Game]               │
└─────────────────────────────────────────────────────────┘
```

#### Component Props

```typescript
interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  gameId?: string;
  onSubmit: (data: CreateGameInput | UpdateGameInput) => Promise<void>;
}

interface GameFormData {
  name: string;
  description?: string;
  categories: GameCategory[];
  targetAudience: TargetAudience;
  imageUrl?: string;
  minPlayers?: number;
  maxPlayers?: number;
  duration?: number;
}
```

#### Validation Rules

```typescript
const gameValidationSchema = z.object({
  name: z.string().min(2, 'Game name must be at least 2 characters'),
  description: z.string().optional(),
  categories: z.array(z.enum([
    'COMMUNICATION',
    'INTIMACY',
    'FUN',
    'THERAPY',
    'PERSONAL_DEVELOPMENT'
  ])).min(1, 'Select at least one category'),
  targetAudience: z.enum(['SINGLES', 'MARRIED', 'GENERAL']),
  imageUrl: z.string().url().optional().or(z.literal('')),
  minPlayers: z.number().min(1).optional(),
  maxPlayers: z.number().min(1).optional(),
  duration: z.number().min(1).optional(),
});
```

#### Business Rules

- At least one category must be selected
- Target audience is required
- Max players must be >= min players
- Image URL validation with preview
- Game name should be unique (warning, not blocking)

---

### 5. Game-to-Center Assignment Modal

**Purpose:** Bulk assign game instances to centers.

#### Visual Layout

```
┌─────────────────────────────────────────────────────────┐
│  ✕          Assign Games to Centers                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Selected Game: Couples Communication Cards             │
│                                                         │
│  Select Centers to Assign Game                          │
│  ┌───────────────────────────────────────────┐         │
│  │ ☐ Tel Aviv Center           [5 instances] │         │
│  │ ☐ Jerusalem Center          [3 instances] │         │
│  │ ☑ Haifa Center              [2 instances] │         │
│  │ ☐ Be'er Sheva Center        [4 instances] │         │
│  └───────────────────────────────────────────┘         │
│                                                         │
│  Number of Instances to Create                          │
│  ┌──────┐                                               │
│  │  1   │                                               │
│  └──────┘                                               │
│                                                         │
│  Summary                                                │
│  • 1 center selected                                    │
│  • 1 instance per center                                │
│  • Total: 1 new game instances                          │
│                                                         │
│                                                         │
│                    [Cancel]  [Create Instances]        │
└─────────────────────────────────────────────────────────┘
```

#### Component Props

```typescript
interface GameToCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameId: string;
  gameName: string;
  onAssign: (centerIds: string[], instanceCount: number) => Promise<void>;
}
```

#### Business Rules

- Must select at least one center
- Instance count must be >= 1
- Show current instance count per center
- Confirm before creating many instances (e.g., > 10)

---

## Data Table Specifications

### Enhanced Table Features

#### Core Table Structure

```typescript
interface DataTableProps<T> {
  // Data
  data: T[];
  columns: ColumnDef<T>[];

  // Search & Filter
  searchKey: string;
  searchPlaceholder?: string;
  filters?: FilterConfig[];

  // Selection
  enableRowSelection?: boolean;
  onSelectionChange?: (rows: T[]) => void;

  // Actions
  onRowClick?: (row: T) => void;
  rowActions?: RowAction<T>[];
  bulkActions?: BulkAction<T>[];

  // Pagination
  pageSize?: number;
  enablePagination?: boolean;

  // Sorting
  defaultSort?: { column: string; direction: 'asc' | 'desc' };

  // Loading & Empty States
  isLoading?: boolean;
  emptyState?: React.ReactNode;
}

interface FilterConfig {
  key: string;
  label: string;
  type: 'select' | 'checkbox' | 'date-range';
  options?: { value: string; label: string }[];
}

interface RowAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: 'default' | 'destructive';
  show?: (row: T) => boolean;
}

interface BulkAction<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (rows: T[]) => void;
  variant?: 'default' | 'destructive';
}
```

### Users Data Table

#### Column Definition

```typescript
const userColumns: ColumnDef<UserForAdmin>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{formatUserName(row.original.firstName, row.original.lastName)}</p>
        <p className="text-xs text-gray-500">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: 'roles',
    header: 'Roles',
    cell: ({ row }) => (
      <div className="flex gap-1 flex-wrap">
        {row.original.roles?.map((role, idx) => (
          <Badge key={idx} variant="outline">{role}</Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: 'phone',
    header: 'Phone',
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? 'default' : 'destructive'}>
        {row.original.isActive ? 'Active' : 'Blocked'}
      </Badge>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => handleView(row.original)}>
          View
        </Button>
        <Button
          size="sm"
          variant={row.original.isActive ? 'destructive' : 'default'}
          onClick={() => handleToggleActive(row.original)}
        >
          {row.original.isActive ? 'Block' : 'Unblock'}
        </Button>
      </div>
    ),
  },
];
```

#### Filters

```typescript
const userFilters: FilterConfig[] = [
  {
    key: 'role',
    label: 'Role',
    type: 'select',
    options: [
      { value: 'all', label: 'All Roles' },
      { value: 'ADMIN', label: 'Admin' },
      { value: 'SUPER_COORDINATOR', label: 'Super Coordinator' },
      { value: 'CENTER_COORDINATOR', label: 'Center Coordinator' },
    ],
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'all', label: 'All Users' },
      { value: 'active', label: 'Active Only' },
      { value: 'blocked', label: 'Blocked Only' },
    ],
  },
];
```

#### Bulk Actions

```typescript
const userBulkActions: BulkAction<UserForAdmin>[] = [
  {
    label: 'Block Selected',
    icon: <Ban className="w-4 h-4" />,
    onClick: (rows) => handleBulkBlock(rows),
    variant: 'destructive',
  },
  {
    label: 'Unblock Selected',
    icon: <CheckCircle className="w-4 h-4" />,
    onClick: (rows) => handleBulkUnblock(rows),
  },
  {
    label: 'Export Selected',
    icon: <Download className="w-4 h-4" />,
    onClick: (rows) => handleExport(rows),
  },
];
```

### Centers Data Table

#### Column Definition

```typescript
const centerColumns: ColumnDef<CenterWithCoordinator>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    accessorKey: 'name',
    header: 'Center Name',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.name}</p>
        {row.original.address && (
          <p className="text-xs text-gray-500">{row.original.address}</p>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'area',
    header: 'Area',
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.area}</Badge>
    ),
  },
  {
    accessorKey: 'coordinator',
    header: 'Coordinator',
    cell: ({ row }) => (
      row.original.coordinator ? (
        <div>
          <p className="text-sm">{formatUserName(row.original.coordinator.firstName, row.original.coordinator.lastName)}</p>
          <p className="text-xs text-gray-500">{row.original.coordinator.email}</p>
        </div>
      ) : (
        <span className="text-gray-400 text-sm">No coordinator</span>
      )
    ),
  },
  {
    id: 'games',
    header: 'Games',
    cell: ({ row }) => (
      <span className="text-sm">{row.original.gameInstances?.length || 0} instances</span>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => handleView(row.original)}>
          View
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleEdit(row.original)}>
          Edit
        </Button>
        <Button size="sm" variant="destructive" onClick={() => handleDelete(row.original)}>
          Delete
        </Button>
      </div>
    ),
  },
];
```

#### Filters

```typescript
const centerFilters: FilterConfig[] = [
  {
    key: 'area',
    label: 'Area',
    type: 'select',
    options: [
      { value: 'all', label: 'All Areas' },
      { value: 'NORTH', label: 'North' },
      { value: 'CENTER', label: 'Center' },
      { value: 'SOUTH', label: 'South' },
      { value: 'JERUSALEM', label: 'Jerusalem' },
      { value: 'JUDEA_SAMARIA', label: 'Judea & Samaria' },
    ],
  },
  {
    key: 'hasCoordinator',
    label: 'Coordinator',
    type: 'select',
    options: [
      { value: 'all', label: 'All Centers' },
      { value: 'assigned', label: 'With Coordinator' },
      { value: 'unassigned', label: 'Without Coordinator' },
    ],
  },
];
```

### Games Data Table

#### Column Definition

```typescript
const gameColumns: ColumnDef<GameWithInstances>[] = [
  {
    id: 'select',
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
      />
    ),
  },
  {
    accessorKey: 'image',
    header: '',
    cell: ({ row }) => (
      <div className="w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
        {row.original.imageUrl ? (
          <img src={row.original.imageUrl} alt={row.original.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            🎲
          </div>
        )}
      </div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: 'name',
    header: 'Game Name',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.name}</p>
        {row.original.description && (
          <p className="text-xs text-gray-500 line-clamp-1">{row.original.description}</p>
        )}
      </div>
    ),
  },
  {
    accessorKey: 'categories',
    header: 'Categories',
    cell: ({ row }) => (
      <div className="flex gap-1 flex-wrap max-w-xs">
        {row.original.categories.map((cat, idx) => (
          <Badge key={idx} variant="secondary" className="text-xs">{cat}</Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: 'targetAudience',
    header: 'Audience',
    cell: ({ row }) => (
      <Badge variant="outline">{row.original.targetAudience}</Badge>
    ),
  },
  {
    id: 'instances',
    header: 'Instances',
    cell: ({ row }) => {
      const total = row.original.instances?.length || 0;
      const available = row.original.instances?.filter(i => i.status === 'AVAILABLE').length || 0;
      return (
        <div className="text-sm">
          <span className="font-medium text-green-600">{available}</span>
          <span className="text-gray-400"> / {total}</span>
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={() => handleView(row.original)}>
          View
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleEdit(row.original)}>
          Edit
        </Button>
        <Button size="sm" variant="outline" onClick={() => handleAssignToCenters(row.original)}>
          Assign
        </Button>
        <Button size="sm" variant="destructive" onClick={() => handleDelete(row.original)}>
          Delete
        </Button>
      </div>
    ),
  },
];
```

#### Filters

```typescript
const gameFilters: FilterConfig[] = [
  {
    key: 'category',
    label: 'Category',
    type: 'checkbox',
    options: [
      { value: 'COMMUNICATION', label: 'Communication' },
      { value: 'INTIMACY', label: 'Intimacy' },
      { value: 'FUN', label: 'Fun' },
      { value: 'THERAPY', label: 'Therapy' },
      { value: 'PERSONAL_DEVELOPMENT', label: 'Personal Development' },
    ],
  },
  {
    key: 'audience',
    label: 'Target Audience',
    type: 'select',
    options: [
      { value: 'all', label: 'All Audiences' },
      { value: 'SINGLES', label: 'Singles' },
      { value: 'MARRIED', label: 'Married' },
      { value: 'GENERAL', label: 'General' },
    ],
  },
  {
    key: 'availability',
    label: 'Availability',
    type: 'select',
    options: [
      { value: 'all', label: 'All Games' },
      { value: 'available', label: 'Has Available Instances' },
      { value: 'rented', label: 'All Rented Out' },
    ],
  },
];
```

---

## Loading & Error States

### Loading States

#### 1. Initial Dashboard Load

```tsx
// Full page skeleton
<div className="container mx-auto px-4 py-8">
  <div className="mb-8">
    <Skeleton className="h-8 w-64 mb-2" />
    <Skeleton className="h-4 w-96" />
  </div>

  <div className="grid grid-cols-6 gap-4 mb-8">
    {Array.from({ length: 6 }).map((_, i) => (
      <Card key={i}>
        <CardContent className="p-6">
          <Skeleton className="h-4 w-20 mb-2" />
          <Skeleton className="h-8 w-16 mb-1" />
          <Skeleton className="h-3 w-24" />
        </CardContent>
      </Card>
    ))}
  </div>
</div>
```

#### 2. Table Loading

```tsx
// Table skeleton with rows
<div className="border rounded-lg">
  <div className="p-4 border-b">
    <Skeleton className="h-10 w-full" />
  </div>
  <div className="divide-y">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="p-4 flex items-center gap-4">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1">
          <Skeleton className="h-4 w-48 mb-2" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-20" />
      </div>
    ))}
  </div>
</div>
```

#### 3. Modal Loading

```tsx
// Spinner overlay in modal
<Modal isOpen={isOpen} onClose={onClose}>
  {isLoading ? (
    <div className="p-12 flex items-center justify-center">
      <div className="text-center">
        <Spinner className="w-8 h-8 mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  ) : (
    // Modal content
  )}
</Modal>
```

#### 4. Progressive Loading Strategy

```typescript
// Dashboard hydration strategy
const AdminDashboard = () => {
  const [loadingStage, setLoadingStage] = useState<'stats' | 'users' | 'centers' | 'games' | 'complete'>('stats');

  useEffect(() => {
    const loadData = async () => {
      // 1. Load critical stats first (fastest)
      setLoadingStage('stats');
      await loadSystemStats();

      // 2. Load user data (needed for most admin tasks)
      setLoadingStage('users');
      await loadUsers();

      // 3. Load centers (needed less frequently)
      setLoadingStage('centers');
      await loadCenters();

      // 4. Load games (can be lazy loaded)
      setLoadingStage('games');
      await loadGames();

      setLoadingStage('complete');
    };

    loadData();
  }, []);

  return (
    <div>
      {loadingStage !== 'complete' && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <Spinner className="w-4 h-4" />
            <span className="text-sm text-blue-700">
              Loading {loadingStage}...
            </span>
          </div>
        </div>
      )}

      {/* Dashboard content - show progressively */}
      <SystemStats loading={loadingStage === 'stats'} />
      <Tabs>
        <TabsContent value="users">
          <UsersTable loading={loadingStage === 'users'} />
        </TabsContent>
        {/* ... */}
      </Tabs>
    </div>
  );
};
```

### Error States

#### 1. Inline Field Errors

```tsx
<Input
  label="Email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errors.email}
  helper={!errors.email ? 'We\'ll never share your email' : undefined}
/>
```

#### 2. Form-Level Errors

```tsx
{errors.submit && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <h4 className="text-sm font-medium text-red-800">Failed to save</h4>
        <p className="text-sm text-red-700 mt-1">{errors.submit}</p>
      </div>
      <button
        onClick={() => setErrors({ ...errors, submit: undefined })}
        className="text-red-600 hover:text-red-800"
      >
        ✕
      </button>
    </div>
  </div>
)}
```

#### 3. Page-Level Errors

```tsx
{error && (
  <div className="mb-6 p-6 bg-red-50 border border-red-200 rounded-lg">
    <div className="flex items-start gap-4">
      <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-red-800">Something went wrong</h3>
        <p className="text-sm text-red-700 mt-2">{error}</p>
        <div className="flex gap-3 mt-4">
          <Button variant="outline" onClick={handleRetry}>
            Try Again
          </Button>
          <Button variant="ghost" onClick={() => setError(null)}>
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  </div>
)}
```

#### 4. Empty States

```tsx
// No data found
<div className="text-center py-12">
  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
    <Inbox className="w-8 h-8 text-gray-400" />
  </div>
  <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
  <p className="text-gray-500 mb-6">Get started by creating your first user.</p>
  <Button onClick={() => setShowCreateModal(true)}>
    Create User
  </Button>
</div>
```

---

## Responsive Design

### Breakpoints

```typescript
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
};
```

### Dashboard Layout Responsiveness

#### Mobile (< 768px)

- Single column layout
- Stacked KPI cards (1 column)
- Simplified table view (card-based list)
- Bottom sheet modals instead of centered
- Hamburger menu for tab navigation
- Reduced padding and spacing

```tsx
// Mobile-specific layout
<div className="container mx-auto px-4 py-4 md:py-8">
  {/* Header - Stack title and actions */}
  <div className="mb-4 md:mb-8">
    <h1 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h1>
    <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
      System administration and management tools
    </p>
  </div>

  {/* Stats - Single column on mobile, grid on desktop */}
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
    {/* KPI cards */}
  </div>

  {/* Tabs - Scrollable on mobile */}
  <Tabs className="mt-4 md:mt-6">
    <TabsList className="w-full overflow-x-auto flex md:grid md:grid-cols-4">
      <TabsTrigger value="overview" className="flex-shrink-0">Overview</TabsTrigger>
      <TabsTrigger value="users" className="flex-shrink-0">Users</TabsTrigger>
      <TabsTrigger value="centers" className="flex-shrink-0">Centers</TabsTrigger>
      <TabsTrigger value="games" className="flex-shrink-0">Games</TabsTrigger>
    </TabsList>
  </Tabs>
</div>
```

#### Tablet (768px - 1024px)

- 2 column KPI cards
- Table with horizontal scroll
- Side drawer modals
- Condensed action buttons

#### Desktop (> 1024px)

- Full 6 column KPI cards
- Full data tables with all columns
- Centered modals
- Full action button labels

### Table Responsiveness

```tsx
// Responsive table component
<div className="w-full">
  {/* Desktop: Full table */}
  <div className="hidden md:block overflow-x-auto">
    <Table>
      {/* Full table structure */}
    </Table>
  </div>

  {/* Mobile: Card list */}
  <div className="md:hidden space-y-3">
    {data.map((item) => (
      <Card key={item.id} className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-medium">{item.name}</h3>
            <p className="text-sm text-gray-500">{item.email}</p>
          </div>
          <Badge>{item.status}</Badge>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" fullWidth>View</Button>
          <Button size="sm" variant="outline" fullWidth>Edit</Button>
        </div>
      </Card>
    ))}
  </div>
</div>
```

### Modal Responsiveness

```tsx
// Responsive modal
<Modal
  isOpen={isOpen}
  onClose={onClose}
  className={cn(
    // Base styles
    "w-full",
    // Mobile: Full screen
    "h-full md:h-auto",
    "max-h-screen md:max-h-[90vh]",
    // Desktop: Centered with max width
    "md:max-w-2xl md:rounded-lg"
  )}
>
  <div className="p-4 md:p-6">
    {/* Content */}
  </div>
</Modal>
```

---

## Accessibility Requirements

### WCAG 2.1 Level AA Compliance

#### 1. Keyboard Navigation

- All interactive elements must be keyboard accessible
- Clear focus indicators (2px outline with primary color)
- Logical tab order
- Escape key closes modals
- Arrow keys navigate table rows
- Enter/Space activates buttons

```tsx
// Focus styles
const focusRingStyles = "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2";

// Keyboard shortcuts
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // Escape closes modal
    if (e.key === 'Escape' && isModalOpen) {
      closeModal();
    }

    // Ctrl/Cmd + N for new item
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
      e.preventDefault();
      openCreateModal();
    }
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, [isModalOpen]);
```

#### 2. ARIA Labels and Roles

```tsx
// Modal with proper ARIA
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">User Details</h2>
  <p id="modal-description">View and edit user information</p>
</div>

// Button with descriptive label
<button
  aria-label={`Delete ${userName}`}
  onClick={handleDelete}
>
  <Trash2 className="w-4 h-4" />
</button>

// Table with proper structure
<table role="table" aria-label="Users management table">
  <thead role="rowgroup">
    <tr role="row">
      <th role="columnheader" scope="col">Name</th>
    </tr>
  </thead>
  <tbody role="rowgroup">
    <tr role="row">
      <td role="cell">{userName}</td>
    </tr>
  </tbody>
</table>
```

#### 3. Color Contrast

All text must meet WCAG AA contrast ratios:
- Normal text: 4.5:1
- Large text (18px+): 3:1
- UI components: 3:1

```typescript
// Validated color combinations
const accessibleColors = {
  // Text on white background
  primaryText: '#111827',    // Gray 900 - 16:1 ratio
  secondaryText: '#6b7280',  // Gray 500 - 4.6:1 ratio

  // Brand color usage
  primaryOnWhite: '#f15555', // 3.5:1 - Use for large text/components only
  primaryDark: '#991b1b',    // 7:1 - Use for normal text

  // Status colors (on white)
  successText: '#047857',    // 4.5:1
  warningText: '#d97706',    // 4.5:1
  errorText: '#dc2626',      // 5:1
};
```

#### 4. Screen Reader Support

```tsx
// Loading state announcement
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {isLoading ? 'Loading users...' : 'Users loaded'}
</div>

// Form errors announcement
<div
  role="alert"
  aria-live="assertive"
  className="sr-only"
>
  {errors.email && `Error: ${errors.email}`}
</div>

// Success message
<div
  role="status"
  aria-live="polite"
  className="p-4 bg-green-50 border border-green-200 rounded-lg"
>
  <CheckCircle className="w-5 h-5 inline mr-2" aria-hidden="true" />
  User created successfully
</div>
```

#### 5. Form Accessibility

```tsx
<form onSubmit={handleSubmit} aria-label="Create user form">
  {/* Properly associated labels */}
  <label htmlFor="email" className="block text-sm font-medium">
    Email Address
    <span className="text-red-500" aria-label="required">*</span>
  </label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={!!errors.email}
    aria-describedby={errors.email ? 'email-error' : 'email-helper'}
  />
  {errors.email && (
    <p id="email-error" role="alert" className="text-sm text-red-600">
      {errors.email}
    </p>
  )}
  {!errors.email && (
    <p id="email-helper" className="text-sm text-gray-500">
      We'll never share your email
    </p>
  )}
</form>
```

#### 6. Focus Management

```tsx
// Modal focus trap
useEffect(() => {
  if (isOpen) {
    const focusableElements = modalRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements?.[0] as HTMLElement;
    const lastElement = focusableElements?.[focusableElements.length - 1] as HTMLElement;

    firstElement?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }
}, [isOpen]);
```

---

## Implementation Roadmap

### Phase 1: Foundation Components (Week 1)

#### Tasks:
1. Create base DataTable component with sorting and pagination
2. Implement DataTableToolbar with search and filters
3. Build reusable Modal component with responsive behavior
4. Create Skeleton and Spinner loading components
5. Implement ErrorAlert component with retry functionality

#### Deliverables:
- `/components/ui/data-table.tsx`
- `/components/ui/data-table-toolbar.tsx`
- `/components/ui/skeleton.tsx`
- `/components/ui/spinner.tsx`

#### Acceptance Criteria:
- All components pass accessibility audit
- Components work on mobile, tablet, and desktop
- Comprehensive Storybook stories for each component
- Unit tests for core functionality

---

### Phase 2: User Management (Week 2)

#### Tasks:
1. Convert UserManagementTable from card-based to data table
2. Implement UserModal with create/edit/view modes
3. Build RoleAssignmentModal with center selection
4. Add bulk actions (block, unblock, export)
5. Implement search and filter functionality

#### Deliverables:
- `/components/admin/users/users-data-table.tsx`
- `/components/admin/users/user-modal.tsx`
- `/components/admin/users/role-assignment-modal.tsx`
- `/components/admin/users/user-table-columns.tsx`

#### Acceptance Criteria:
- All CRUD operations work correctly
- Role assignment validation works
- Search and filters function properly
- Loading and error states display correctly
- Mobile responsive layout works

---

### Phase 3: Center Management (Week 3)

#### Tasks:
1. Convert CenterManagementTable to data table
2. Implement CenterModal with coordinator assignment
3. Add area filtering and search
4. Build coordinator assignment workflow
5. Add center details view with game instances

#### Deliverables:
- `/components/admin/centers/centers-data-table.tsx`
- `/components/admin/centers/center-modal.tsx`
- `/components/admin/centers/center-table-columns.tsx`

#### Acceptance Criteria:
- Center CRUD operations work
- Coordinator assignment functions correctly
- Area filtering works
- Validation prevents duplicate centers
- Shows game instances per center

---

### Phase 4: Game Management (Week 4)

#### Tasks:
1. Convert GameManagementTable to data table
2. Implement GameModal with category/audience selection
3. Build GameToCenterModal for bulk assignment
4. Add category and audience filters
5. Implement image upload/preview

#### Deliverables:
- `/components/admin/games/games-data-table.tsx`
- `/components/admin/games/game-modal.tsx`
- `/components/admin/games/game-to-center-modal.tsx`
- `/components/admin/games/game-table-columns.tsx`

#### Acceptance Criteria:
- Game CRUD operations work
- Multi-category selection works
- Image upload and preview function
- Bulk assignment to centers works
- Instance tracking displays correctly

---

### Phase 5: Dashboard Enhancements (Week 5)

#### Tasks:
1. Implement progressive loading strategy
2. Add quick actions panel to Overview tab
3. Build recent activity feed
4. Add dashboard-wide keyboard shortcuts
5. Implement export functionality

#### Deliverables:
- `/components/admin/dashboard/quick-actions.tsx`
- `/components/admin/dashboard/recent-activity.tsx`
- `/lib/admin/export-utils.ts`

#### Acceptance Criteria:
- Dashboard loads progressively
- Quick actions are functional
- Recent activity displays correctly
- Keyboard shortcuts work
- Export generates correct CSV/Excel files

---

### Phase 6: Testing & Optimization (Week 6)

#### Tasks:
1. Write comprehensive component tests
2. Add integration tests for modal workflows
3. Perform accessibility audit and fixes
4. Optimize bundle size and performance
5. Add error boundary for admin section

#### Deliverables:
- Test files for all components
- Accessibility compliance report
- Performance optimization report
- Error boundary implementation

#### Acceptance Criteria:
- 80%+ test coverage
- All WCAG AA requirements met
- Page load time < 2 seconds
- Bundle size optimized
- Error boundaries catch and display errors gracefully

---

## File Structure

```
src/
├── components/
│   ├── ui/
│   │   ├── data-table.tsx
│   │   ├── data-table-toolbar.tsx
│   │   ├── data-table-pagination.tsx
│   │   ├── skeleton.tsx
│   │   ├── spinner.tsx
│   │   └── [existing components]
│   │
│   └── admin/
│       ├── dashboard/
│       │   ├── admin-dashboard.tsx
│       │   ├── quick-actions.tsx
│       │   ├── recent-activity.tsx
│       │   └── system-stats.tsx
│       │
│       ├── users/
│       │   ├── users-data-table.tsx
│       │   ├── user-modal.tsx
│       │   ├── role-assignment-modal.tsx
│       │   ├── user-table-columns.tsx
│       │   └── user-filters.tsx
│       │
│       ├── centers/
│       │   ├── centers-data-table.tsx
│       │   ├── center-modal.tsx
│       │   ├── center-table-columns.tsx
│       │   └── center-filters.tsx
│       │
│       └── games/
│           ├── games-data-table.tsx
│           ├── game-modal.tsx
│           ├── game-to-center-modal.tsx
│           ├── game-table-columns.tsx
│           └── game-filters.tsx
│
├── lib/
│   └── admin/
│       ├── export-utils.ts
│       ├── table-utils.ts
│       └── validation-utils.ts
│
└── types/
    └── admin.ts
```

---

## Design Tokens Export

For easy implementation, here's a Tailwind config extension:

```javascript
// tailwind.config.js additions
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#f15555',
          hover: '#dc3030',
          light: '#fef2f2',
          dark: '#991b1b',
        },
        role: {
          admin: '#ef4444',
          super: '#3b82f6',
          coordinator: '#8b5cf6',
        },
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 0.2s ease-out',
        'slide-up': 'slide-up 0.3s ease-out',
      },
    },
  },
};
```

---

## Summary

This specification provides a complete blueprint for implementing a production-ready admin dashboard with:

1. **Comprehensive modal designs** for all CRUD operations
2. **Enhanced data tables** with sorting, filtering, and bulk actions
3. **Progressive loading strategy** for optimal user experience
4. **Full responsive design** for mobile, tablet, and desktop
5. **WCAG 2.1 AA accessibility** compliance
6. **Clear implementation roadmap** with deliverables and acceptance criteria

All components follow your existing patterns and use your established component library, ensuring consistency and maintainability.
