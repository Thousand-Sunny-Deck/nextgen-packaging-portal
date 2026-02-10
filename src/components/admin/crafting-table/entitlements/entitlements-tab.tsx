"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Search,
	Loader2,
	Save,
	KeyRound,
	Package,
	MapPin,
	RefreshCw,
} from "lucide-react";
import { EntitlementsDataTable } from "./entitlements-data-table";
import { entitlementsColumns } from "./entitlements-columns";
import { toast } from "sonner";
import {
	searchUserByEmail,
	updateUserDetails,
	getUserEntitledProducts,
	type EntitlementUser,
	type UserEntitledProduct,
} from "@/actions/admin/entitlements-actions";

export function EntitlementsTab() {
	// Search state
	const [emailQuery, setEmailQuery] = useState("");
	const [searching, setSearching] = useState(false);

	// User state
	const [user, setUser] = useState<EntitlementUser | null>(null);
	const [editName, setEditName] = useState("");
	const [editRole, setEditRole] = useState<"USER" | "ADMIN" | "SUPER_ADMIN">(
		"USER",
	);
	const [saving, setSaving] = useState(false);

	// Entitled products state
	const [entitledProducts, setEntitledProducts] = useState<
		UserEntitledProduct[]
	>([]);
	const [productsTotal, setProductsTotal] = useState(0);
	const [productsLoading, setProductsLoading] = useState(false);
	const [productsLoaded, setProductsLoaded] = useState(false);

	const fetchEntitledProducts = async (userId: string) => {
		setProductsLoading(true);
		try {
			const result = await getUserEntitledProducts(userId);
			setEntitledProducts(result.products);
			setProductsTotal(result.total);
			setProductsLoaded(true);
		} catch (error) {
			console.error("Failed to fetch entitled products:", error);
			toast.error("Failed to load entitled products");
		} finally {
			setProductsLoading(false);
		}
	};

	const handleSearch = async () => {
		if (!emailQuery.trim()) {
			toast.error("Please enter an email address");
			return;
		}

		setSearching(true);
		setUser(null);
		setEntitledProducts([]);
		setProductsTotal(0);
		setProductsLoaded(false);

		try {
			const result = await searchUserByEmail(emailQuery);

			if (!result.success || !result.user) {
				toast.error(result.error || "User not found");
				return;
			}

			setUser(result.user);
			setEditName(result.user.name);
			setEditRole(result.user.role);

			// Fetch entitled products on initial search
			await fetchEntitledProducts(result.user.id);

			toast.success(`Found user: ${result.user.name}`);
		} catch (error) {
			console.error("Search failed:", error);
			toast.error("Search failed");
		} finally {
			setSearching(false);
		}
	};

	const handleSaveUser = async () => {
		if (!user) return;

		setSaving(true);
		try {
			const result = await updateUserDetails({
				userId: user.id,
				name: editName,
				role: editRole,
			});

			if (!result.success) {
				toast.error(result.error || "Failed to update user");
				return;
			}

			setUser({ ...user, name: editName, role: editRole });
			toast.success("User updated successfully");
		} catch (error) {
			console.error("Update failed:", error);
			toast.error("Failed to update user");
		} finally {
			setSaving(false);
		}
	};

	const hasChanges = user && (editName !== user.name || editRole !== user.role);

	return (
		<div className="space-y-6">
			{/* ── Email Search Bar ── */}
			<div className="flex items-end gap-3">
				<div className="flex-1 max-w-md space-y-1.5">
					<Label htmlFor="email-search">Search by Email</Label>
					<Input
						id="email-search"
						type="email"
						placeholder="user@example.com"
						value={emailQuery}
						onChange={(e) => setEmailQuery(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") handleSearch();
						}}
					/>
				</div>
				<Button onClick={handleSearch} disabled={searching}>
					{searching ? (
						<Loader2 className="h-4 w-4 mr-2 animate-spin" />
					) : (
						<Search className="h-4 w-4 mr-2" />
					)}
					Search
				</Button>
			</div>

			{/* ── Empty State ── */}
			{!user && !searching && (
				<div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg">
					<KeyRound className="h-12 w-12 text-gray-300 mb-4" />
					<p className="text-gray-500">
						Search for a user by email to manage their entitlements
					</p>
				</div>
			)}

			{/* ── Section 1: User Details Card ── */}
			{user && (
				<div className="rounded-lg border p-6 space-y-6">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold">User Details</h3>
						<Button
							size="sm"
							onClick={handleSaveUser}
							disabled={saving || !hasChanges}
						>
							{saving ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : (
								<Save className="h-4 w-4 mr-2" />
							)}
							Save Changes
						</Button>
					</div>

					{/* Editable fields */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="space-y-1.5">
							<Label htmlFor="user-name">Name</Label>
							<Input
								id="user-name"
								value={editName}
								onChange={(e) => setEditName(e.target.value)}
							/>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="user-role">Role</Label>
							<Select
								value={editRole}
								onValueChange={(v) =>
									setEditRole(v as "USER" | "ADMIN" | "SUPER_ADMIN")
								}
							>
								<SelectTrigger id="user-role" className="w-full">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="USER">User</SelectItem>
									<SelectItem value="ADMIN">Admin</SelectItem>
									<SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-1.5">
							<Label>Email</Label>
							<Input value={user.email} disabled />
						</div>
					</div>

					{/* Billing Addresses */}
					<div className="space-y-3">
						<h4 className="text-sm font-medium flex items-center gap-2">
							<MapPin className="h-4 w-4" />
							Billing Addresses ({user.billingAddresses.length})
						</h4>
						{user.billingAddresses.length === 0 ? (
							<p className="text-sm text-gray-500">
								No billing addresses on file.
							</p>
						) : (
							<div className="grid grid-cols-1 md:grid-cols-2 gap-3">
								{user.billingAddresses.map((addr) => (
									<div
										key={addr.id}
										className="rounded-md border p-3 text-sm space-y-1"
									>
										<p className="font-medium">{addr.organization}</p>
										<p className="text-muted-foreground">{addr.address}</p>
										<p className="text-muted-foreground">{addr.email}</p>
										<p className="text-muted-foreground">ABN: {addr.ABN}</p>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			)}

			{/* ── Section 2: Entitled Products Table ── */}
			{user && (
				<div className="rounded-lg border p-6 space-y-4">
					<div className="flex items-center justify-between">
						<h3 className="text-lg font-semibold flex items-center gap-2">
							<Package className="h-5 w-5" />
							Entitled Products ({productsTotal})
						</h3>
						<Button
							variant="outline"
							size="sm"
							onClick={() => fetchEntitledProducts(user.id)}
							disabled={productsLoading}
						>
							{productsLoading ? (
								<Loader2 className="h-4 w-4 mr-2 animate-spin" />
							) : (
								<RefreshCw className="h-4 w-4 mr-2" />
							)}
							{productsLoaded ? "Refresh" : "Load Products"}
						</Button>
					</div>

					{entitledProducts.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-32 border border-dashed rounded-lg">
							<Package className="h-8 w-8 text-gray-300 mb-2" />
							<p className="text-sm text-gray-500">
								No products entitled to this user yet.
							</p>
						</div>
					) : (
						<EntitlementsDataTable
							columns={entitlementsColumns}
							data={entitledProducts}
						/>
					)}
				</div>
			)}
		</div>
	);
}
