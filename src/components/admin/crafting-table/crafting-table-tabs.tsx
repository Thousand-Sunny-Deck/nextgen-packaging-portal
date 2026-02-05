"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Package, KeyRound, Zap } from "lucide-react";

export function CraftingTableTabs() {
	return (
		<Tabs defaultValue="users" className="w-full">
			<TabsList className="grid w-full max-w-2xl grid-cols-4">
				<TabsTrigger value="users" className="flex items-center gap-2">
					<Users className="h-4 w-4" />
					Users
				</TabsTrigger>
				<TabsTrigger value="products" className="flex items-center gap-2">
					<Package className="h-4 w-4" />
					Products
				</TabsTrigger>
				<TabsTrigger value="entitlements" className="flex items-center gap-2">
					<KeyRound className="h-4 w-4" />
					Entitlements
				</TabsTrigger>
				<TabsTrigger value="quick-actions" className="flex items-center gap-2">
					<Zap className="h-4 w-4" />
					Quick Actions
				</TabsTrigger>
			</TabsList>

			<TabsContent value="users" className="mt-6">
				<UsersTabPlaceholder />
			</TabsContent>

			<TabsContent value="products" className="mt-6">
				<ProductsTabPlaceholder />
			</TabsContent>

			<TabsContent value="entitlements" className="mt-6">
				<EntitlementsTabPlaceholder />
			</TabsContent>

			<TabsContent value="quick-actions" className="mt-6">
				<QuickActionsTabPlaceholder />
			</TabsContent>
		</Tabs>
	);
}

function UsersTabPlaceholder() {
	return (
		<div className="rounded-lg border border-dashed border-gray-300 p-8">
			<div className="text-center">
				<Users className="mx-auto h-12 w-12 text-gray-400" />
				<h3 className="mt-4 text-lg font-medium text-gray-900">
					Users Management
				</h3>
				<p className="mt-2 text-sm text-gray-500">
					Search users, view details, create new users, and manage roles.
				</p>
				<div className="mt-4 text-xs text-gray-400">
					{/* TODO: Implement UsersTab component with:
					    - Search input (debounced)
					    - Users data table with pagination
					    - Create user modal
					    - User details sheet
					    - Server actions: getUsers, createUser, updateUserRole, deleteUser
					*/}
					Coming in Phase 2
				</div>
			</div>
		</div>
	);
}

function ProductsTabPlaceholder() {
	return (
		<div className="rounded-lg border border-dashed border-gray-300 p-8">
			<div className="text-center">
				<Package className="mx-auto h-12 w-12 text-gray-400" />
				<h3 className="mt-4 text-lg font-medium text-gray-900">
					Products Management
				</h3>
				<p className="mt-2 text-sm text-gray-500">
					View all products, add new products, and update descriptions/pricing.
				</p>
				<div className="mt-4 text-xs text-gray-400">
					{/* TODO: Implement ProductsTab component with:
					    - Products data table with pagination
					    - Create product modal
					    - Edit product modal
					    - Server actions: getProducts, createProduct, updateProduct, deleteProduct
					*/}
					Coming in Phase 3
				</div>
			</div>
		</div>
	);
}

function EntitlementsTabPlaceholder() {
	return (
		<div className="rounded-lg border border-dashed border-gray-300 p-8">
			<div className="text-center">
				<KeyRound className="mx-auto h-12 w-12 text-gray-400" />
				<h3 className="mt-4 text-lg font-medium text-gray-900">
					Entitlements Management
				</h3>
				<p className="mt-2 text-sm text-gray-500">
					Manage which products each user can access and customize pricing.
				</p>
				<div className="mt-4 text-xs text-gray-400">
					{/* TODO: Implement EntitlementsTab component with:
					    - User selector (combobox with search)
					    - User's entitlements table
					    - Add entitlement modal
					    - Edit entitlement modal (custom pricing)
					    - Bulk operations (copy entitlements, grant to multiple)
					    - Server actions: getUserEntitlements, grantEntitlement, revokeEntitlement, etc.
					*/}
					Coming in Phase 4
				</div>
			</div>
		</div>
	);
}

function QuickActionsTabPlaceholder() {
	return (
		<div className="rounded-lg border border-dashed border-gray-300 p-8">
			<div className="text-center">
				<Zap className="mx-auto h-12 w-12 text-gray-400" />
				<h3 className="mt-4 text-lg font-medium text-gray-900">
					Quick Actions
				</h3>
				<p className="mt-2 text-sm text-gray-500">
					Export data, send emails, and perform bulk operations.
				</p>
				<div className="mt-4 text-xs text-gray-400">
					{/* TODO: Implement QuickActionsTab component with:
					    - Export buttons (users CSV, products CSV, orders CSV)
					    - Send email form
					    - System health checks
					    - Server actions: exportUsersCSV, exportProductsCSV, sendEmailToUser
					*/}
					Coming in Phase 5
				</div>
			</div>
		</div>
	);
}
