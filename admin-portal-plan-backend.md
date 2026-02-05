# Admin Portal - Backend Plan

## Overview

Backend implementation for the super admin portal, including:

1. Database schema changes (add admin role)
2. Authorization middleware
3. Server actions for admin operations
4. Data access layer updates

---

## 1. Database Schema Changes

### Add Role to User Model

```prisma
// schema.prisma

enum UserRole {
  USER
  ADMIN
  SUPER_ADMIN
}

model User {
  id              String    @id @default(cuid())
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt
  name            String
  email           String    @unique
  emailVerified   Boolean   @default(false)
  image           String?
  role            UserRole  @default(USER)  // NEW FIELD

  // ... existing relations
}
```

### Migration Steps

1. Create migration: `npx prisma migrate dev --name add-user-role`
2. Update your user to SUPER_ADMIN manually or via seed script
3. Deploy migration to production

### Set Super Admin

```sql
-- Manual SQL to set yourself as super admin
UPDATE "User" SET role = 'SUPER_ADMIN' WHERE email = 'your-email@example.com';
```

Or create a seed script:

```typescript
// prisma/set-super-admin.ts
import { prisma } from "../src/lib/config/prisma";

async function main() {
	await prisma.user.update({
		where: { email: process.env.SUPER_ADMIN_EMAIL },
		data: { role: "SUPER_ADMIN" },
	});
}
```

---

## 2. Authorization Layer

### Admin Check Utility

```typescript
// /src/lib/auth/admin-check.ts

import { auth } from "@/lib/config/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/config/prisma";
import { redirect } from "next/navigation";

export async function requireAdmin() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/auth/login");
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { role: true },
	});

	if (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN") {
		redirect(`/dashboard/${session.user.id}/home`);
	}

	return { session, user };
}

export async function requireSuperAdmin() {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/auth/login");
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { role: true },
	});

	if (user?.role !== "SUPER_ADMIN") {
		redirect(`/dashboard/${session.user.id}/home`);
	}

	return { session, user };
}

export async function isAdmin(userId: string): Promise<boolean> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { role: true },
	});
	return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
}
```

### Usage in Admin Layout

```typescript
// /src/app/admin/layout.tsx

import { requireAdmin } from "@/lib/auth/admin-check";

export default async function AdminLayout({ children }) {
  await requireAdmin(); // Redirects if not admin
  return <>{children}</>;
}
```

---

## 3. Server Actions

### File Structure

```
/src/actions/admin/
├── metrics-actions.ts      # Dashboard metrics
├── users-actions.ts        # User CRUD
├── products-actions.ts     # Product CRUD
└── entitlements-actions.ts # Entitlement management
```

### 3.1 Metrics Actions

```typescript
// /src/actions/admin/metrics-actions.ts
"use server";

import { requireAdmin } from "@/lib/auth/admin-check";
import { prisma } from "@/lib/config/prisma";

export async function getAdminMetrics() {
	await requireAdmin();

	const [totalUsers, totalOrders, monthlyRevenue, ordersByStatus] =
		await Promise.all([
			// Total users
			prisma.user.count(),

			// Total orders
			prisma.order.count(),

			// Revenue this month
			prisma.order.aggregate({
				_sum: { totalOrderCost: true },
				where: {
					createdAt: {
						gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
					},
					status: "EMAIL_SENT",
				},
			}),

			// Orders by status
			prisma.order.groupBy({
				by: ["status"],
				_count: { status: true },
			}),
		]);

	// Calculate success rate
	const totalCompleted =
		ordersByStatus.find((s) => s.status === "EMAIL_SENT")?._count.status || 0;
	const totalFailed =
		ordersByStatus.find((s) => s.status === "FAILED")?._count.status || 0;
	const successRate =
		totalOrders > 0
			? ((totalCompleted / (totalCompleted + totalFailed)) * 100).toFixed(1)
			: "0";

	return {
		totalUsers,
		totalOrders,
		monthlyRevenue: monthlyRevenue._sum.totalOrderCost || 0,
		successRate: parseFloat(successRate),
		ordersByStatus: ordersByStatus.map((s) => ({
			status: s.status,
			count: s._count.status,
		})),
	};
}

export async function getRecentActivity(limit = 10) {
	await requireAdmin();

	const recentOrders = await prisma.order.findMany({
		take: limit,
		orderBy: { createdAt: "desc" },
		select: {
			id: true,
			orderId: true,
			customerEmail: true,
			totalOrderCost: true,
			status: true,
			createdAt: true,
			user: {
				select: { name: true, email: true },
			},
		},
	});

	return recentOrders;
}

export async function getTopUsers(limit = 5) {
	await requireAdmin();

	const topUsers = await prisma.user.findMany({
		take: limit,
		orderBy: {
			orders: { _count: "desc" },
		},
		select: {
			id: true,
			name: true,
			email: true,
			_count: { select: { orders: true } },
			orders: {
				select: { totalOrderCost: true },
				where: { status: "EMAIL_SENT" },
			},
		},
	});

	return topUsers.map((user) => ({
		id: user.id,
		name: user.name,
		email: user.email,
		orderCount: user._count.orders,
		totalSpent: user.orders.reduce((sum, o) => sum + o.totalOrderCost, 0),
	}));
}
```

### 3.2 Users Actions

```typescript
// /src/actions/admin/users-actions.ts
"use server";

import { requireAdmin } from "@/lib/auth/admin-check";
import { prisma } from "@/lib/config/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

// Schema for creating users
const createUserSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.string().email("Invalid email"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	role: z.enum(["USER", "ADMIN"]).default("USER"),
});

export async function getUsers(params: {
	search?: string;
	page?: number;
	pageSize?: number;
}) {
	await requireAdmin();

	const { search = "", page = 1, pageSize = 20 } = params;
	const skip = (page - 1) * pageSize;

	const where = search
		? {
				OR: [
					{ name: { contains: search, mode: "insensitive" as const } },
					{ email: { contains: search, mode: "insensitive" as const } },
				],
			}
		: {};

	const [users, total] = await Promise.all([
		prisma.user.findMany({
			where,
			skip,
			take: pageSize,
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				createdAt: true,
				_count: {
					select: {
						orders: true,
						entitledProducts: true,
					},
				},
			},
		}),
		prisma.user.count({ where }),
	]);

	return {
		users,
		total,
		pages: Math.ceil(total / pageSize),
	};
}

export async function getUserDetails(userId: string) {
	await requireAdmin();

	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: {
			orders: {
				take: 10,
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					orderId: true,
					totalOrderCost: true,
					status: true,
					createdAt: true,
				},
			},
			entitledProducts: {
				include: {
					product: true,
				},
			},
			billingAddresses: true,
		},
	});

	return user;
}

export async function createUser(data: z.infer<typeof createUserSchema>) {
	const { session } = await requireAdmin();

	const validated = createUserSchema.parse(data);

	// Hash password using better-auth's method or bcrypt
	// Note: Better Auth may have its own user creation method
	const user = await prisma.user.create({
		data: {
			name: validated.name,
			email: validated.email,
			role: validated.role,
			// Password handling depends on Better Auth setup
		},
	});

	revalidatePath("/admin/crafting-table");
	return user;
}

export async function updateUserRole(userId: string, role: "USER" | "ADMIN") {
	await requireAdmin();

	// Prevent changing SUPER_ADMIN role
	const targetUser = await prisma.user.findUnique({
		where: { id: userId },
		select: { role: true },
	});

	if (targetUser?.role === "SUPER_ADMIN") {
		throw new Error("Cannot modify super admin role");
	}

	const user = await prisma.user.update({
		where: { id: userId },
		data: { role },
	});

	revalidatePath("/admin/crafting-table");
	return user;
}

export async function deleteUser(userId: string) {
	await requireAdmin();

	// Prevent deleting SUPER_ADMIN
	const targetUser = await prisma.user.findUnique({
		where: { id: userId },
		select: { role: true },
	});

	if (targetUser?.role === "SUPER_ADMIN") {
		throw new Error("Cannot delete super admin");
	}

	await prisma.user.delete({
		where: { id: userId },
	});

	revalidatePath("/admin/crafting-table");
}
```

### 3.3 Products Actions

```typescript
// /src/actions/admin/products-actions.ts
"use server";

import { requireAdmin } from "@/lib/auth/admin-check";
import { prisma } from "@/lib/config/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const productSchema = z.object({
	sku: z.string().min(1, "SKU is required"),
	description: z.string().min(1, "Description is required"),
	unitCost: z.number().positive("Unit cost must be positive"),
	imageUrl: z.string().url().optional().nullable(),
});

export async function getProducts(params: {
	search?: string;
	page?: number;
	pageSize?: number;
}) {
	await requireAdmin();

	const { search = "", page = 1, pageSize = 20 } = params;
	const skip = (page - 1) * pageSize;

	const where = search
		? {
				OR: [
					{ sku: { contains: search, mode: "insensitive" as const } },
					{ description: { contains: search, mode: "insensitive" as const } },
				],
			}
		: {};

	const [products, total] = await Promise.all([
		prisma.product.findMany({
			where,
			skip,
			take: pageSize,
			orderBy: { sku: "asc" },
			include: {
				_count: {
					select: { entitledUsers: true },
				},
			},
		}),
		prisma.product.count({ where }),
	]);

	return {
		products,
		total,
		pages: Math.ceil(total / pageSize),
	};
}

export async function createProduct(data: z.infer<typeof productSchema>) {
	await requireAdmin();

	const validated = productSchema.parse(data);

	const product = await prisma.product.create({
		data: validated,
	});

	revalidatePath("/admin/crafting-table");
	return product;
}

export async function updateProduct(
	productId: string,
	data: Partial<z.infer<typeof productSchema>>,
) {
	await requireAdmin();

	// Don't allow SKU changes after creation
	const { sku, ...updateData } = data;

	const product = await prisma.product.update({
		where: { id: productId },
		data: updateData,
	});

	revalidatePath("/admin/crafting-table");
	return product;
}

export async function deleteProduct(productId: string) {
	await requireAdmin();

	// Check if product has entitlements
	const entitlementCount = await prisma.userProductEntitlement.count({
		where: { productId },
	});

	if (entitlementCount > 0) {
		throw new Error(
			`Cannot delete product with ${entitlementCount} active entitlements. Remove entitlements first.`,
		);
	}

	await prisma.product.delete({
		where: { id: productId },
	});

	revalidatePath("/admin/crafting-table");
}

export async function getAllProductsForSelection() {
	await requireAdmin();

	return prisma.product.findMany({
		orderBy: { sku: "asc" },
		select: {
			id: true,
			sku: true,
			description: true,
			unitCost: true,
		},
	});
}
```

### 3.4 Entitlements Actions

```typescript
// /src/actions/admin/entitlements-actions.ts
"use server";

import { requireAdmin } from "@/lib/auth/admin-check";
import { prisma } from "@/lib/config/prisma";
import { z } from "zod";
import { revalidatePath } from "next/cache";

const entitlementSchema = z.object({
	userId: z.string().min(1),
	productId: z.string().min(1),
	customSku: z.string().optional().nullable(),
	customDescription: z.string().optional().nullable(),
	customUnitCost: z.number().positive().optional().nullable(),
	customImageUrl: z.string().url().optional().nullable(),
});

export async function getUserEntitlements(userId: string) {
	await requireAdmin();

	const entitlements = await prisma.userProductEntitlement.findMany({
		where: { userId },
		include: {
			product: true,
		},
		orderBy: { grantedAt: "desc" },
	});

	return entitlements;
}

export async function getAvailableProductsForUser(userId: string) {
	await requireAdmin();

	// Get products the user is NOT entitled to
	const entitledProductIds = await prisma.userProductEntitlement.findMany({
		where: { userId },
		select: { productId: true },
	});

	const entitledIds = entitledProductIds.map((e) => e.productId);

	const availableProducts = await prisma.product.findMany({
		where: {
			id: { notIn: entitledIds },
		},
		orderBy: { sku: "asc" },
	});

	return availableProducts;
}

export async function grantEntitlement(
	data: z.infer<typeof entitlementSchema>,
) {
	const { session } = await requireAdmin();

	const validated = entitlementSchema.parse(data);

	// Check if entitlement already exists
	const existing = await prisma.userProductEntitlement.findUnique({
		where: {
			userId_productId: {
				userId: validated.userId,
				productId: validated.productId,
			},
		},
	});

	if (existing) {
		throw new Error("User already has this entitlement");
	}

	const entitlement = await prisma.userProductEntitlement.create({
		data: {
			userId: validated.userId,
			productId: validated.productId,
			customSku: validated.customSku,
			customDescription: validated.customDescription,
			customUnitCost: validated.customUnitCost,
			customImageUrl: validated.customImageUrl,
			grantedAt: new Date(),
			grantedBy: session.user.id, // Track who granted it
		},
		include: { product: true },
	});

	revalidatePath("/admin/crafting-table");
	return entitlement;
}

export async function updateEntitlement(
	entitlementId: string,
	data: Partial<{
		customSku: string | null;
		customDescription: string | null;
		customUnitCost: number | null;
		customImageUrl: string | null;
	}>,
) {
	await requireAdmin();

	const entitlement = await prisma.userProductEntitlement.update({
		where: { id: entitlementId },
		data,
		include: { product: true },
	});

	revalidatePath("/admin/crafting-table");
	return entitlement;
}

export async function revokeEntitlement(entitlementId: string) {
	await requireAdmin();

	await prisma.userProductEntitlement.delete({
		where: { id: entitlementId },
	});

	revalidatePath("/admin/crafting-table");
}

export async function bulkGrantEntitlements(
	userIds: string[],
	productId: string,
	customFields?: {
		customSku?: string;
		customDescription?: string;
		customUnitCost?: number;
	},
) {
	const { session } = await requireAdmin();

	// Filter out users who already have this entitlement
	const existingEntitlements = await prisma.userProductEntitlement.findMany({
		where: {
			productId,
			userId: { in: userIds },
		},
		select: { userId: true },
	});

	const existingUserIds = new Set(existingEntitlements.map((e) => e.userId));
	const newUserIds = userIds.filter((id) => !existingUserIds.has(id));

	if (newUserIds.length === 0) {
		return { created: 0, skipped: userIds.length };
	}

	await prisma.userProductEntitlement.createMany({
		data: newUserIds.map((userId) => ({
			userId,
			productId,
			grantedAt: new Date(),
			grantedBy: session.user.id,
			...customFields,
		})),
	});

	revalidatePath("/admin/crafting-table");
	return { created: newUserIds.length, skipped: existingUserIds.size };
}

export async function copyEntitlements(
	sourceUserId: string,
	targetUserId: string,
) {
	const { session } = await requireAdmin();

	// Get source user's entitlements
	const sourceEntitlements = await prisma.userProductEntitlement.findMany({
		where: { userId: sourceUserId },
	});

	// Get target user's existing entitlements
	const targetExisting = await prisma.userProductEntitlement.findMany({
		where: { userId: targetUserId },
		select: { productId: true },
	});

	const targetExistingIds = new Set(targetExisting.map((e) => e.productId));

	// Filter to only copy new entitlements
	const toCopy = sourceEntitlements.filter(
		(e) => !targetExistingIds.has(e.productId),
	);

	if (toCopy.length === 0) {
		return { copied: 0, skipped: sourceEntitlements.length };
	}

	await prisma.userProductEntitlement.createMany({
		data: toCopy.map((e) => ({
			userId: targetUserId,
			productId: e.productId,
			customSku: e.customSku,
			customDescription: e.customDescription,
			customUnitCost: e.customUnitCost,
			customImageUrl: e.customImageUrl,
			grantedAt: new Date(),
			grantedBy: session.user.id,
		})),
	});

	revalidatePath("/admin/crafting-table");
	return { copied: toCopy.length, skipped: targetExistingIds.size };
}
```

---

## 4. Data Export Actions

```typescript
// /src/actions/admin/export-actions.ts
"use server";

import { requireAdmin } from "@/lib/auth/admin-check";
import { prisma } from "@/lib/config/prisma";

export async function exportUsersCSV() {
	await requireAdmin();

	const users = await prisma.user.findMany({
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			createdAt: true,
			_count: { select: { orders: true, entitledProducts: true } },
		},
	});

	const headers = [
		"ID",
		"Name",
		"Email",
		"Role",
		"Created",
		"Orders",
		"Entitlements",
	];
	const rows = users.map((u) => [
		u.id,
		u.name,
		u.email,
		u.role,
		u.createdAt.toISOString(),
		u._count.orders,
		u._count.entitledProducts,
	]);

	return [headers, ...rows].map((row) => row.join(",")).join("\n");
}

export async function exportProductsCSV() {
	await requireAdmin();

	const products = await prisma.product.findMany({
		include: { _count: { select: { entitledUsers: true } } },
	});

	const headers = ["ID", "SKU", "Description", "Unit Cost", "Entitled Users"];
	const rows = products.map((p) => [
		p.id,
		p.sku,
		`"${p.description.replace(/"/g, '""')}"`,
		p.unitCost,
		p._count.entitledUsers,
	]);

	return [headers, ...rows].map((row) => row.join(",")).join("\n");
}

export async function exportOrdersCSV(params?: {
	startDate?: Date;
	endDate?: Date;
}) {
	await requireAdmin();

	const where: any = {};
	if (params?.startDate) where.createdAt = { gte: params.startDate };
	if (params?.endDate)
		where.createdAt = { ...where.createdAt, lte: params.endDate };

	const orders = await prisma.order.findMany({
		where,
		include: { user: { select: { email: true } } },
		orderBy: { createdAt: "desc" },
	});

	const headers = ["Order ID", "User Email", "Status", "Total", "Created"];
	const rows = orders.map((o) => [
		o.orderId,
		o.user?.email || o.customerEmail,
		o.status,
		o.totalOrderCost,
		o.createdAt.toISOString(),
	]);

	return [headers, ...rows].map((row) => row.join(",")).join("\n");
}
```

---

## 5. Email Actions (Optional)

```typescript
// /src/actions/admin/email-actions.ts
"use server";

import { requireAdmin } from "@/lib/auth/admin-check";
import { Resend } from "resend";
import { z } from "zod";

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmailSchema = z.object({
	to: z.string().email(),
	subject: z.string().min(1),
	body: z.string().min(1),
});

export async function sendEmailToUser(data: z.infer<typeof sendEmailSchema>) {
	await requireAdmin();

	const validated = sendEmailSchema.parse(data);

	const result = await resend.emails.send({
		from: "NextGen Packaging <noreply@nextgenpackaging-portal.site>",
		to: validated.to,
		subject: validated.subject,
		text: validated.body,
	});

	return result;
}
```

---

## 6. Database Store Updates

### Update orders-store.ts

Add function for admin to fetch all orders:

```typescript
// Add to /src/lib/store/orders-store.ts

export async function fetchAllOrders(params: {
	page?: number;
	pageSize?: number;
	status?: OrderStatus;
	userId?: string;
}) {
	const { page = 1, pageSize = 20, status, userId } = params;

	const where: any = {};
	if (status) where.status = status;
	if (userId) where.userId = userId;

	const [orders, total] = await Promise.all([
		prisma.order.findMany({
			where,
			skip: (page - 1) * pageSize,
			take: pageSize,
			orderBy: { createdAt: "desc" },
			include: {
				user: { select: { name: true, email: true } },
				items: true,
			},
		}),
		prisma.order.count({ where }),
	]);

	return { orders, total, pages: Math.ceil(total / pageSize) };
}
```

---

## 7. Implementation Order

### Phase 1: Database & Auth (Day 1)

1. Add `role` enum and field to Prisma schema
2. Run migration
3. Set your user as SUPER_ADMIN
4. Create `requireAdmin()` utility
5. Test admin check works

### Phase 2: Metrics Backend (Day 1-2)

6. Implement `getAdminMetrics()`
7. Implement `getRecentActivity()`
8. Implement `getTopUsers()`

### Phase 3: Users Backend (Day 2)

9. Implement `getUsers()` with pagination/search
10. Implement `getUserDetails()`
11. Implement `createUser()`
12. Implement `updateUserRole()`
13. Implement `deleteUser()`

### Phase 4: Products Backend (Day 2-3)

14. Implement `getProducts()`
15. Implement `createProduct()`
16. Implement `updateProduct()`
17. Implement `deleteProduct()`

### Phase 5: Entitlements Backend (Day 3)

18. Implement `getUserEntitlements()`
19. Implement `getAvailableProductsForUser()`
20. Implement `grantEntitlement()`
21. Implement `updateEntitlement()`
22. Implement `revokeEntitlement()`
23. Implement `bulkGrantEntitlements()`
24. Implement `copyEntitlements()`

### Phase 6: Export & Email (Day 4)

25. Implement CSV exports
26. Implement email sending

---

## 8. Security Considerations

### Access Control

- All admin actions MUST call `requireAdmin()` first
- SUPER_ADMIN role cannot be modified via UI
- Audit trail via `grantedBy` field on entitlements

### Input Validation

- All inputs validated with Zod schemas
- Pagination limits enforced (max 100 per page)
- Search inputs sanitized

### Rate Limiting

- Consider adding rate limits to admin actions
- Especially for bulk operations and exports

### Logging

- Log admin actions for audit trail
- Consider Inngest for async logging

---

## 9. Testing Checklist

- [ ] Admin can access /admin routes
- [ ] Non-admin gets redirected
- [ ] Metrics display correctly
- [ ] User search works
- [ ] User CRUD works
- [ ] Product CRUD works
- [ ] Entitlement grant/revoke works
- [ ] Bulk operations work
- [ ] CSV exports download correctly
- [ ] Cannot modify SUPER_ADMIN
- [ ] Cannot delete SUPER_ADMIN

---

## 10. Environment Variables

No new environment variables required. Uses existing:

- `DATABASE_URL` - Prisma connection
- `RESEND_API_KEY` - For email sending

Optional (if you want to configure super admin email):

```
SUPER_ADMIN_EMAIL=your-email@example.com
```
