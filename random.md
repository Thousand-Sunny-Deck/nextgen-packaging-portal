# Admin Approval Feature — Master Plan

## Context

Currently, when a user places an order it immediately fires an Inngest background job that generates a PDF, uploads to S3, and sends emails. The goal is to introduce an **admin approval gate**: orders are held in a new `AWAITING_APPROVAL` state. Admins are notified immediately via email and can explicitly accept orders from their portal, at which point the full processing pipeline fires. While awaiting approval, users can effectively "edit" by using the reorder flow. Once approved, the order is locked.

Split into 4 PRs — each mergeable independently with the feature flag off (`false`), meaning zero behavior change until explicitly enabled.

---

## Feature Flag

**`src/config/features.ts`** (new file, created in PR 1)

```ts
export const features = {
	adminApprovalRequired: false,
} as const;
```

No env vars, no DB reads. Flip to `true` after all 4 PRs are merged to go live.

---

## PR 1 — Schema + Feature Flag

**Branch:** `feat/admin-approval-schema`
**Plan file:** `plan/01-schema-and-feature-flag.md`

### Files to change

- **`prisma/schema.prisma`**: Add `AWAITING_APPROVAL` to `OrderStatus` enum (between `PENDING` and `PROCESSING`). Add `approvedAt DateTime?` and `approvedBy String?` to `Order` model.
- **`src/config/features.ts`**: Create feature flag file.

### Migration

```
npx prisma migrate dev --name add_awaiting_approval_status
```

Purely additive — new enum value + 2 nullable columns. No data migration needed.

### Verify

- Migration applies cleanly, `prisma generate` succeeds
- `OrderStatus.AWAITING_APPROVAL` importable from `@/generated/prisma/enums`
- Placing an order still works identically (flag is `false`)

---

## PR 2 — Order Placement Gate + Admin Notification Email

**Branch:** `feat/admin-approval-gate`
**Plan file:** `plan/02-order-flow-gate.md`

### What happens when user places an order (flag ON)

1. Order saved to DB as `AWAITING_APPROVAL` (no Inngest fired)
2. Admin notification email sent immediately via `PostOffice`
3. A modal is shown to the user (not just a toast)

### Files to change

**`src/actions/order-delivery/deliver-order-action.ts`**

- Import `features` from `@/config/features`
- After `storePreparedOrderInDb()`, if `features.adminApprovalRequired`:
  - `updateStateForOrder(orderId, userId, OrderStatus.AWAITING_APPROVAL)`
  - Send admin notification email (see below)
  - Return `{ ok: true, orderId, pendingApproval: true }`
- Else: existing Inngest flow unchanged
- Add `pendingApproval?: boolean` to `FireResponse` type

**Admin notification email** (sent from `deliver-order-action.ts`):

- Uses existing `PostOffice` service (`src/service/post-office.ts`)
- To: `nextgenelitesupplies@gmail.com` (same as existing admin email)
- Subject: `"New order pending approval — {invoiceId} ({customerName})"`
- Content: customer name, organisation, order ID, total cost only (summary format — no item breakdown)
- NO attachment (no PDF yet — that's generated on approval)
- Template: `AdminApprovalNotificationEmail` — new React email template in `src/components/email/`

**`src/components/email/AdminApprovalNotificationEmail.tsx`** (new)

- New React email template (mirrors structure of existing `AdminEmailTemplate`)
- Shows order snapshot: customer details, item table, cost breakdown
- Clear CTA copy: "Log into the admin portal to review and approve this order"
- No actual link button needed for now (can be added later)

**`src/lib/store/orders-store.ts`**

- Add `OrderStatus.AWAITING_APPROVAL` to the `in: [...]` filter in `fetchActiveOrdersForUser`

**`src/actions/order-delivery/fetch-orders-action.ts`**

- Add `case "AWAITING_APPROVAL": return "Pending Approval"` to `mapOrderStatusToActiveOrder`
- Update `ActiveOrder["status"]` union type to include `"Pending Approval"`

**`src/components/dashboard/ActiveOrderCard.tsx`**

- Add `"Pending Approval": { color: "bg-yellow-400" }` to `statusConfig`

**`src/hooks/use-checkout-flow.ts`**

- When `response.pendingApproval === true`: set state to trigger modal (don't show success toast or confetti)
- Still call `clearCart()` and `clearBillingInfo()`
- Redirect to dashboard home after user dismisses modal

**New modal component: `src/components/checkout/OrderPendingApprovalModal.tsx`**

- Shown after order submission when `pendingApproval` is true
- Title: "Order Submitted"
- Body: "Your order has been submitted and is being reviewed by our team. You'll receive a confirmation email once it's approved — typically within 1–2 business days."
- Single CTA button: "Back to Dashboard" → navigates to `/home`
- Uses existing `Dialog` / modal primitive already in the project

### Verify

- Flag `false`: identical behavior to before
- Flag `true`: place order → modal shown (not success toast), admin gets notification email, DB row has `AWAITING_APPROVAL`, active order card shows yellow "Pending Approval" badge

---

## PR 3 — Admin Pending Approvals Page

**Branch:** `feat/admin-approval-page`
**Plan file:** `plan/03-admin-pending-orders-page.md`

### New files (all mirror `/admin/home` pattern)

- `src/app/admin/approvals/page.tsx` — server page component
- `src/actions/spike/pending-approvals-actions.ts` — `getPendingApprovals()` action, `requireAdmin()`, filters `status: AWAITING_APPROVAL`
- `src/components/admin/approvals/pending-approvals-client.tsx`
- `src/components/admin/approvals/pending-approvals-table.tsx` — reuses `AdminDataTable`, `AdminSearch`, `AdminPagination`, `EmptyState`, `OrderItemsSheet`
- `src/components/admin/approvals/pending-approvals-columns.tsx`

### Modified files

- `src/components/admin/layout/nav-groups.ts` — add `{ label: "Pending Approvals", href: "/admin/approvals", icon: Clock }` to MANAGE group

No Accept button yet (PR 4). Page is fully usable read-only.

### Verify

- `/admin/approvals` renders with PageHeader "Pending Approvals"
- Sidebar shows "Pending Approvals" with Clock icon
- Orders in AWAITING_APPROVAL appear in table with items viewable via sheet
- Search/pagination works, empty state renders correctly

---

## PR 4 — Accept Order Action + Edit/Lock UX

**Branch:** `feat/admin-approval-accept`
**Plan file:** `plan/04-accept-order-and-user-edit.md`

### New file: `src/actions/admin/approve-order-action.ts`

- `requireAdmin()`, fetch order, guard `status === AWAITING_APPROVAL`
- `prisma.order.update` → `status: PENDING`, `approvedAt: new Date()`, `approvedBy: admin.userId`
- `inngest.send({ name: "invoice/generate", data: { orderId, userId, email } })`
- Returns `{ success: true } | { success: false; error: string }`
- Key: transitioning to `PENDING` before Inngest means the existing idempotency guard in `functions.ts` (`status !== "PENDING"` → NonRetriableError) handles any double-fires gracefully

### Modified files

**`src/components/admin/approvals/pending-approvals-table.tsx`**

- Wire `renderRowActions` on `AdminDataTable` using existing `RowActionsMenu`
- "Accept Order" menu item → calls `approveOrderAction`, toast on success, calls `onRefresh()` (order disappears from list)
- `approvingId` state to disable button while in-flight

**`src/app/api/orders/utils.ts`**

- Add `case "AWAITING_APPROVAL": return "Pending"` to `mapOrderStatusToInvoiceStatus`

**`src/components/admin/home/common.ts`**

- Add `case "AWAITING_APPROVAL": return { appearence: "inprogress", label: "Awaiting Approval" }` to `getStatusLozenge`

**`src/actions/order-delivery/reorder-action.ts`**

- Guard: if `order.status === "AWAITING_APPROVAL"`, return early with message:
  `"This order is pending approval. If you need changes, contact support or wait for approval."`

### Verify

- Place order (flag `true`) → appears in `/admin/approvals`
- Click Accept → toast success, order disappears, Inngest fires, full processing runs
- Double-click Accept: second call returns "Order is not awaiting approval" error
- Trying to reorder an AWAITING_APPROVAL order shows error message
- `getStatusLozenge` shows "Awaiting Approval" badge in admin activity table

---

## File Reference Map

| File                                                         | PR  | Action                  |
| ------------------------------------------------------------ | --- | ----------------------- |
| `prisma/schema.prisma`                                       | 1   | Modify                  |
| `src/config/features.ts`                                     | 1   | Create                  |
| `src/actions/order-delivery/deliver-order-action.ts`         | 2   | Modify — gate + email   |
| `src/components/email/AdminApprovalNotificationEmail.tsx`    | 2   | Create — email template |
| `src/lib/store/orders-store.ts`                              | 2   | Modify                  |
| `src/actions/order-delivery/fetch-orders-action.ts`          | 2   | Modify                  |
| `src/components/dashboard/ActiveOrderCard.tsx`               | 2   | Modify                  |
| `src/hooks/use-checkout-flow.ts`                             | 2   | Modify — trigger modal  |
| `src/components/checkout/OrderPendingApprovalModal.tsx`      | 2   | Create — modal          |
| `src/app/admin/approvals/page.tsx`                           | 3   | Create                  |
| `src/actions/spike/pending-approvals-actions.ts`             | 3   | Create                  |
| `src/components/admin/approvals/*.tsx` (4 files)             | 3   | Create                  |
| `src/components/admin/layout/nav-groups.ts`                  | 3   | Modify                  |
| `src/actions/admin/approve-order-action.ts`                  | 4   | Create                  |
| `src/components/admin/approvals/pending-approvals-table.tsx` | 4   | Modify — Accept button  |
| `src/app/api/orders/utils.ts`                                | 4   | Modify                  |
| `src/components/admin/home/common.ts`                        | 4   | Modify                  |
| `src/actions/order-delivery/reorder-action.ts`               | 4   | Modify                  |

---

## Go-Live Step

After all 4 PRs merged, flip `features.adminApprovalRequired` to `true` in `src/config/features.ts` as a standalone commit/PR.

---

## Decided

- Admin notification email: summary only (name, org, order ID, total cost) — no item breakdown
- Modal copy: "Your order has been submitted and is being reviewed by our team. You'll receive a confirmation email once it's approved — typically within 1–2 business days."
