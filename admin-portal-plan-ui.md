# Admin Portal - UI/Frontend Plan

## Overview

Build a super admin portal with two main views:

1. **`/admin/home`** - Dashboard with business metrics
2. **`/admin/crafting-table`** - Control panel for managing users, products, and entitlements

---

## Route Structure

```
/admin
├── layout.tsx              # Admin layout with sidebar navigation
├── home/page.tsx           # Metrics dashboard
└── crafting-table/page.tsx # Management control panel
```

---

## 1. Admin Layout (`/admin/layout.tsx`)

### Components

- **AdminSidebar** - Navigation between admin pages
- **AdminHeader** - Shows admin name, sign out
- **AdminGuard** - Redirects non-admins to regular dashboard

### Navigation Items

- Home (metrics)
- Crafting Table (management)
- Back to User Dashboard (link)

### Design

- Dark sidebar (gray-900) with orange accent
- Collapsible on mobile
- Distinct from user dashboard to avoid confusion

---

## 2. Admin Home - Metrics Dashboard (`/admin/home/page.tsx`)

### Metrics Cards (4 key metrics)

| Metric                   | Description                                   | Visual                         |
| ------------------------ | --------------------------------------------- | ------------------------------ |
| **Total Users**          | Count of all registered users                 | Number + trend indicator       |
| **Total Orders**         | All-time order count                          | Number + this month comparison |
| **Revenue (This Month)** | Sum of `totalOrderCost` for current month     | Currency formatted             |
| **Order Success Rate**   | % of orders with status `EMAIL_SENT` vs total | Percentage + mini chart        |

### Additional Sections

#### Recent Activity Feed

- Last 10 orders across all users
- Shows: orderId, user email, amount, status, timestamp
- Click to view details

#### Orders by Status (Pie/Donut Chart)

- PENDING, PROCESSING, PDF_GENERATED, PDF_STORED, EMAIL_SENT, FAILED
- Color coded badges

#### Top Users (Table)

- Top 5 users by order count or revenue
- Columns: User, Email, Orders, Total Spent

### Components Needed

```
/src/components/admin/
├── metrics/
│   ├── MetricCard.tsx           # Reusable stat card
│   ├── MetricsGrid.tsx          # Grid of 4 metrics
│   ├── RecentActivityFeed.tsx   # Activity list
│   ├── OrderStatusChart.tsx     # Pie chart (use recharts)
│   └── TopUsersTable.tsx        # Simple table
```

---

## 3. Crafting Table - Control Panel (`/admin/crafting-table/page.tsx`)

### Layout

- **Tabbed interface** with 4 tabs:
  1. Users
  2. Products
  3. Entitlements
  4. Quick Actions

### Tab 1: Users Management

#### Features

- **Search users** by email or name (debounced input)
- **User list table** with columns:
  - Name
  - Email
  - Created Date
  - Orders Count
  - Entitlements Count
  - Actions (View, Edit, Delete)
- **Create user** button → opens modal
- **View user details** → slide-over panel showing:
  - User info
  - Their entitled products
  - Their orders
  - Quick actions (add entitlement, send email)

#### Components

```
/src/components/admin/users/
├── UserSearchInput.tsx
├── UsersDataTable.tsx          # TanStack React Table
├── CreateUserModal.tsx
├── UserDetailsSheet.tsx        # Slide-over panel
├── UserEntitlementsCard.tsx
└── UserOrdersCard.tsx
```

### Tab 2: Products Management

#### Features

- **Products table** with columns:
  - SKU
  - Description
  - Unit Cost
  - Image (thumbnail)
  - Entitled Users Count
  - Actions (Edit, Delete)
- **Create product** button → opens modal
- **Edit product** → modal with form:
  - SKU (readonly after creation)
  - Description (textarea)
  - Unit Cost (number input)
  - Image URL
- **Bulk import** button → CSV upload

#### Components

```
/src/components/admin/products/
├── ProductsDataTable.tsx
├── CreateProductModal.tsx
├── EditProductModal.tsx
├── ProductImagePreview.tsx
└── BulkImportModal.tsx
```

### Tab 3: Entitlements Management

#### Features

- **Two-panel view**:
  - Left: Select user (searchable dropdown)
  - Right: Manage their entitlements

- **User's entitlements table**:
  - Product SKU
  - Product Description
  - Custom SKU (if overridden)
  - Custom Unit Cost (if overridden)
  - Granted Date
  - Granted By
  - Actions (Edit Custom Fields, Remove)

- **Add entitlement**:
  - Select from products not yet entitled
  - Optional: Set custom SKU, description, unit cost
  - Submit grants access

- **Bulk operations**:
  - "Copy entitlements from user X to user Y"
  - "Grant product to multiple users"

#### Components

```
/src/components/admin/entitlements/
├── UserSelector.tsx            # Combobox with search
├── EntitlementsDataTable.tsx
├── AddEntitlementModal.tsx
├── EditEntitlementModal.tsx
├── BulkGrantModal.tsx
└── CopyEntitlementsModal.tsx
```

### Tab 4: Quick Actions

#### Features

- **Send email to user** - Select user, compose message
- **Export data** - Download CSVs:
  - All users
  - All products
  - All entitlements
  - All orders
- **System health** - Quick checks:
  - Database connection
  - Email service status
  - Background jobs status

#### Components

```
/src/components/admin/quick-actions/
├── SendEmailForm.tsx
├── ExportDataButtons.tsx
└── SystemHealthCard.tsx
```

---

## 4. Shared Admin Components

```
/src/components/admin/shared/
├── AdminPageHeader.tsx         # Page title + actions
├── ConfirmDeleteDialog.tsx     # Reusable delete confirmation
├── StatusBadge.tsx             # Order status badges
├── DataTablePagination.tsx     # Shared pagination
├── EmptyState.tsx              # No data placeholder
└── LoadingState.tsx            # Skeleton loaders
```

---

## 5. State Management

### Zustand Stores (if needed)

```typescript
// /src/lib/store/admin-store.ts
interface AdminStore {
	selectedUserId: string | null;
	setSelectedUserId: (id: string | null) => void;

	// For entitlements tab
	selectedUserForEntitlements: User | null;
	setSelectedUserForEntitlements: (user: User | null) => void;
}
```

### Server State

- Use React Server Components where possible
- Client components only for interactive parts (tables, modals)
- Server actions for mutations

---

## 6. UI/UX Guidelines

### Design System

- **Primary color**: Orange (consistent with existing)
- **Admin accent**: Darker tones (gray-800, gray-900)
- **Tables**: Use existing TanStack React Table patterns
- **Modals**: Use existing Radix UI Dialog pattern
- **Forms**: Use existing form patterns with Zod validation
- **Toasts**: Use existing toast system for feedback

### Accessibility

- Keyboard navigation for tables
- Focus management in modals
- Screen reader announcements for actions
- Loading states and error boundaries

### Responsive Design

- Mobile: Stack tabs vertically, full-width tables with horizontal scroll
- Tablet: Side-by-side panels where applicable
- Desktop: Full layout with sidebar

---

## 7. Page-by-Page Wireframes

### Admin Home

```
┌─────────────────────────────────────────────────────────┐
│ [Sidebar]  │  Dashboard Overview                        │
│            │                                            │
│ • Home     │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐
│ • Crafting │  │ Users    │ │ Orders   │ │ Revenue  │ │ Success  │
│   Table    │  │ 156      │ │ 1,234    │ │ $45,678  │ │ 94.2%    │
│            │  └──────────┘ └──────────┘ └──────────┘ └──────────┘
│ ─────────  │                                            │
│ Back to    │  Recent Activity          Orders by Status │
│ Dashboard  │  ┌─────────────────────┐  ┌──────────────┐│
│            │  │ • Order #123...     │  │   [PIE]      ││
│            │  │ • User joined...    │  │   CHART      ││
│            │  │ • Order #124...     │  │              ││
│            │  └─────────────────────┘  └──────────────┘│
└─────────────────────────────────────────────────────────┘
```

### Crafting Table

```
┌─────────────────────────────────────────────────────────┐
│ [Sidebar]  │  Crafting Table                            │
│            │                                            │
│            │  [Users] [Products] [Entitlements] [Quick] │
│            │  ─────────────────────────────────────────  │
│            │                                            │
│            │  Search: [________________] [+ Create User]│
│            │                                            │
│            │  ┌─────────────────────────────────────────┐
│            │  │ Name    │ Email      │ Orders │ Actions│
│            │  ├─────────┼────────────┼────────┼────────┤
│            │  │ John    │ j@test.com │ 12     │ [···]  │
│            │  │ Jane    │ jane@...   │ 8      │ [···]  │
│            │  └─────────────────────────────────────────┘
│            │                                            │
│            │  [< Prev] Page 1 of 10 [Next >]           │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Implementation Order

### Phase 1: Foundation

1. Add admin role to User model (backend)
2. Create admin layout with guard
3. Basic routing structure

### Phase 2: Metrics Dashboard

4. Implement MetricCard component
5. Build metrics data fetching (server actions)
6. Add recent activity feed
7. Add charts (optional, can use simple tables first)

### Phase 3: Users Management

8. Users data table
9. Create user modal
10. User details sheet

### Phase 4: Products Management

11. Products data table
12. Create/Edit product modals

### Phase 5: Entitlements Management

13. User selector component
14. Entitlements table
15. Add/Edit entitlement modals
16. Bulk operations

### Phase 6: Polish

17. Quick actions tab
18. Export functionality
19. Email sending
20. Error handling & edge cases

---

## 9. File Structure Summary

```
/src
├── app/
│   └── admin/
│       ├── layout.tsx
│       ├── home/
│       │   └── page.tsx
│       └── crafting-table/
│           └── page.tsx
├── components/
│   └── admin/
│       ├── layout/
│       │   ├── AdminSidebar.tsx
│       │   ├── AdminHeader.tsx
│       │   └── AdminGuard.tsx
│       ├── metrics/
│       │   └── ...
│       ├── users/
│       │   └── ...
│       ├── products/
│       │   └── ...
│       ├── entitlements/
│       │   └── ...
│       ├── quick-actions/
│       │   └── ...
│       └── shared/
│           └── ...
└── actions/
    └── admin/
        ├── metrics-actions.ts
        ├── users-actions.ts
        ├── products-actions.ts
        └── entitlements-actions.ts
```
