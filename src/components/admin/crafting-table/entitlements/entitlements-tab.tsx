"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, KeyRound, RefreshCw, Plus } from "lucide-react";
import {
	searchUserByEmail,
	getUserEntitlements,
	revokeEntitlement,
	updateEntitlement,
	EntitlementUser,
	UserEntitlement,
} from "@/actions/admin/entitlements-actions";
import { UserDetailsCard } from "./user-details-card";
import { EntitlementsDataTable } from "./entitlements-data-table";
import {
	entitlementsColumns,
	EditDraft,
	EntitlementTableMeta,
} from "./entitlements-columns";
import { AddEntitlementSheet } from "./add-entitlement-sheet";

export function EntitlementsTab() {
	const [email, setEmail] = useState("");
	const [user, setUser] = useState<EntitlementUser | null>(null);
	const [searching, setSearching] = useState(false);
	const [searched, setSearched] = useState(false);
	const [entitlements, setEntitlements] = useState<UserEntitlement[]>([]);
	const [loadingEntitlements, setLoadingEntitlements] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editDraft, setEditDraft] = useState<EditDraft>({
		customSku: "",
		customDescription: "",
		customUnitCost: "",
	});
	const [savingEdit, setSavingEdit] = useState(false);
	const [addSheetOpen, setAddSheetOpen] = useState(false);

	const handleSearch = async () => {
		if (!email.trim()) return;

		setSearching(true);
		setEntitlements([]);
		try {
			const result = await searchUserByEmail(email);
			setUser(result.user);
			setSearched(true);
			if (result.user) {
				await fetchEntitlements(result.user.id);
			}
		} catch (error) {
			console.error("Failed to search user:", error);
		} finally {
			setSearching(false);
		}
	};

	const fetchEntitlements = async (userId: string) => {
		setLoadingEntitlements(true);
		try {
			const result = await getUserEntitlements(userId);
			setEntitlements(result.entitlements);
		} catch (error) {
			console.error("Failed to fetch entitlements:", error);
		} finally {
			setLoadingEntitlements(false);
		}
	};

	const handleRevoke = async (entitlement: UserEntitlement) => {
		// TODO: this is bad UX. i dont want a window.confirm but something for later.
		if (
			!confirm(
				`Revoke entitlement for ${entitlement.customSku ?? entitlement.productSku}?`,
			)
		)
			return;

		const result = await revokeEntitlement(entitlement.id);
		if (result.success) {
			setEntitlements((prev) => prev.filter((e) => e.id !== entitlement.id));
		}
	};

	const handleEditStart = (entitlement: UserEntitlement) => {
		setEditingId(entitlement.id);
		setEditDraft({
			customSku: entitlement.customSku ?? "",
			customDescription: entitlement.customDescription ?? "",
			customUnitCost:
				entitlement.customUnitCost !== null
					? String(entitlement.customUnitCost)
					: "",
		});
	};

	const handleEditCancel = () => {
		setEditingId(null);
	};

	const handleEditSave = async () => {
		if (!editingId) return;
		setSavingEdit(true);

		const result = await updateEntitlement(editingId, {
			customSku: editDraft.customSku.trim() || null,
			customDescription: editDraft.customDescription.trim() || null,
			customUnitCost: editDraft.customUnitCost.trim()
				? parseFloat(editDraft.customUnitCost)
				: null,
		});

		if (result.success) {
			setEntitlements((prev) =>
				prev.map((e) =>
					e.id === editingId
						? {
								...e,
								customSku: editDraft.customSku.trim() || null,
								customDescription: editDraft.customDescription.trim() || null,
								customUnitCost: editDraft.customUnitCost.trim()
									? parseFloat(editDraft.customUnitCost)
									: null,
							}
						: e,
				),
			);
			setEditingId(null);
		}

		setSavingEdit(false);
	};

	const handleDraftChange = (field: keyof EditDraft, value: string) => {
		setEditDraft((prev) => ({ ...prev, [field]: value }));
	};

	const existingProductIds = useMemo(
		() => new Set(entitlements.map((e) => e.productId)),
		[entitlements],
	);

	const tableMeta: EntitlementTableMeta = {
		editingId,
		editDraft,
		saving: savingEdit,
		onEditStart: handleEditStart,
		onEditCancel: handleEditCancel,
		onEditSave: handleEditSave,
		onDraftChange: handleDraftChange,
		onRevoke: handleRevoke,
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "Enter") {
			handleSearch();
		}
	};

	return (
		<div className="space-y-6">
			{/* Search bar */}
			<div className="flex items-center gap-2 max-w-lg">
				<Input
					placeholder="Search user by email..."
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					onKeyDown={handleKeyDown}
				/>
				<Button onClick={handleSearch} disabled={searching || !email.trim()}>
					{searching ? (
						<Loader2 className="h-4 w-4 animate-spin" />
					) : (
						<Search className="h-4 w-4" />
					)}
				</Button>
			</div>

			{/* Content area */}
			{!searched ? (
				<div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg">
					<KeyRound className="h-12 w-12 text-gray-300 mb-4" />
					<p className="text-gray-500">
						Search for a user by email to manage their entitlements
					</p>
				</div>
			) : !user ? (
				<div className="flex flex-col items-center justify-center h-64 border border-dashed rounded-lg">
					<p className="text-gray-500">
						No user found for <span className="font-medium">{email}</span>
					</p>
				</div>
			) : (
				<div className="space-y-6">
					<UserDetailsCard
						user={user}
						onUserUpdated={(updated) =>
							setUser((prev) => (prev ? { ...prev, ...updated } : prev))
						}
					/>

					{/* Entitled Products */}
					<div className="space-y-2">
						<div className="flex items-center justify-between">
							<h3 className="font-medium text-sm">
								Entitled Products ({entitlements.length})
							</h3>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => fetchEntitlements(user.id)}
									disabled={loadingEntitlements}
								>
									{loadingEntitlements ? (
										<Loader2 className="h-3 w-3 mr-1 animate-spin" />
									) : (
										<RefreshCw className="h-3 w-3 mr-1" />
									)}
									Refresh
								</Button>
								<Button size="sm" onClick={() => setAddSheetOpen(true)}>
									<Plus className="h-3 w-3 mr-1" />
									Add Entitlement
								</Button>
							</div>
						</div>

						{loadingEntitlements ? (
							<div className="flex items-center justify-center h-32 border border-dashed rounded-lg">
								<Loader2 className="h-6 w-6 animate-spin text-gray-400" />
							</div>
						) : (
							<EntitlementsDataTable
								columns={entitlementsColumns}
								data={entitlements}
								meta={tableMeta}
							/>
						)}
					</div>

					<AddEntitlementSheet
						open={addSheetOpen}
						onOpenChange={setAddSheetOpen}
						userId={user.id}
						existingProductIds={existingProductIds}
						onEntitlementAdded={() => fetchEntitlements(user.id)}
					/>
				</div>
			)}
		</div>
	);
}
