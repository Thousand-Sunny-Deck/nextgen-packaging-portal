"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Users, Package, KeyRound, Zap } from "lucide-react";
import { UsersTab } from "./users/users-tab";
import { ProductsTab } from "./products/products-tab";

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
				<UsersTab />
			</TabsContent>

			<TabsContent value="products" className="mt-6">
				<ProductsTab />
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
