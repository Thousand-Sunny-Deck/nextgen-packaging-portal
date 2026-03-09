"use client";

import { useMemo, useState } from "react";
import {
	Check,
	Loader2,
	Pencil,
	RefreshCw,
	ShieldCheck,
	Trash2,
	X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { AdminDataTable } from "@/components/new-admin/ui/admin-data-table";
import { AdminPagination } from "@/components/new-admin/ui/admin-pagination";
import { AdminSearch } from "@/components/new-admin/ui/admin-search";
import { EmptyState } from "@/components/new-admin/ui/empty-state";
import {
	RowActionsMenu,
	type RowActionItem,
} from "@/components/new-admin/ui/row-actions-menu";
import {
	applySpikeEntitlementChanges,
	type SpikeUserEntitlementRow,
} from "@/actions/spike/entitlements-actions";
import {
	getEntitlementColumns,
	type PendingEntitlementEdit,
} from "./entitlements-columns";

interface EntitlementsTableProps {
	entitlements: SpikeUserEntitlementRow[];
	total: number;
	totalPages: number;
	loading: boolean;
	error: string | null;
	search: string;
	page: number;
	pageSize: number;
	onRefresh: () => void | Promise<void>;
}

const emptyEditDraft: PendingEntitlementEdit = {
	customSku: null,
	customDescription: null,
	customUnitCost: null,
};

type ConfirmAction =
	| { type: "edit"; rowId: string; draft: PendingEntitlementEdit }
	| { type: "delete"; rowId: string };

function normalizeNullableString(value: string | null): string | null {
	if (value === null) return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

export function EntitlementsTable({
	entitlements,
	total,
	totalPages,
	loading,
	error,
	search,
	page,
	pageSize,
	onRefresh,
}: EntitlementsTableProps) {
	const [editingRowId, setEditingRowId] = useState<string | null>(null);
	const [editDraft, setEditDraft] =
		useState<PendingEntitlementEdit>(emptyEditDraft);
	const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
		null,
	);
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const entitlementById = useMemo(
		() =>
			new Map(entitlements.map((entitlement) => [entitlement.id, entitlement])),
		[entitlements],
	);

	const entitlementColumns = useMemo(
		() =>
			getEntitlementColumns({
				editingRowId,
				editDraft,
				setEditDraft,
			}),
		[editingRowId, editDraft],
	);

	const hasDraftChanged = () => {
		if (!editingRowId) return false;
		const row = entitlementById.get(editingRowId);
		if (!row) return false;
		return (
			normalizeNullableString(editDraft.customSku) !== row.customSku ||
			normalizeNullableString(editDraft.customDescription) !==
				row.customDescription ||
			editDraft.customUnitCost !== row.customUnitCost
		);
	};

	const cancelEditing = () => {
		setEditingRowId(null);
		setEditDraft(emptyEditDraft);
	};

	const startEditing = (row: SpikeUserEntitlementRow) => {
		if (submitting) return;
		setEditingRowId(row.id);
		setEditDraft({
			customSku: row.customSku,
			customDescription: row.customDescription,
			customUnitCost: row.customUnitCost,
		});
		setSubmitError(null);
	};

	const openEditConfirmation = () => {
		if (!editingRowId) return;
		const row = entitlementById.get(editingRowId);
		if (!row) return;

		const draft: PendingEntitlementEdit = {
			customSku: normalizeNullableString(editDraft.customSku),
			customDescription: normalizeNullableString(editDraft.customDescription),
			customUnitCost: editDraft.customUnitCost,
		};
		const changed =
			draft.customSku !== row.customSku ||
			draft.customDescription !== row.customDescription ||
			draft.customUnitCost !== row.customUnitCost;

		if (!changed) return;
		setSubmitError(null);
		setConfirmAction({ type: "edit", rowId: editingRowId, draft });
	};

	const openDeleteConfirmation = (rowId: string) => {
		setSubmitError(null);
		setConfirmAction({ type: "delete", rowId });
	};

	const handleConfirmAction = async () => {
		if (!confirmAction) return;
		setSubmitting(true);
		setSubmitError(null);

		try {
			const result =
				confirmAction.type === "edit"
					? await applySpikeEntitlementChanges({
							edits: [
								{
									entitlementId: confirmAction.rowId,
									customSku: confirmAction.draft.customSku,
									customDescription: confirmAction.draft.customDescription,
									customUnitCost: confirmAction.draft.customUnitCost,
								},
							],
							revocations: [],
						})
					: await applySpikeEntitlementChanges({
							edits: [],
							revocations: [confirmAction.rowId],
						});

			if (!result.success) {
				setSubmitError(result.error || "Failed to apply changes.");
				return;
			}

			toast.success(
				confirmAction.type === "edit"
					? "Entitlement updated."
					: "Entitlement removed.",
			);
			setConfirmAction(null);
			cancelEditing();
			await onRefresh();
		} catch (err) {
			setSubmitError(
				err instanceof Error ? err.message : "Failed to apply changes.",
			);
		} finally {
			setSubmitting(false);
		}
	};

	const renderRowActions = (row: SpikeUserEntitlementRow) => {
		const isEditing = editingRowId === row.id;
		const editingAnotherRow = editingRowId !== null && editingRowId !== row.id;

		if (isEditing) {
			return (
				<div className="flex items-center justify-end gap-1">
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
						onClick={openEditConfirmation}
						disabled={!hasDraftChanged() || submitting}
					>
						<Check className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
						onClick={cancelEditing}
						disabled={submitting}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			);
		}

		const rowActions: RowActionItem<SpikeUserEntitlementRow>[] = [
			{
				key: "edit-entitlement",
				label: "Edit",
				icon: <Pencil className="h-4 w-4" />,
				onSelect: startEditing,
			},
			{
				key: "delete-entitlement",
				label: "Delete",
				icon: <Trash2 className="h-4 w-4" />,
				variant: "destructive",
				onSelect: (selectedRow) => openDeleteConfirmation(selectedRow.id),
			},
		];

		return (
			<RowActionsMenu
				row={row}
				items={rowActions}
				disabled={editingAnotherRow || submitting}
				triggerLabel="Open entitlement actions"
			/>
		);
	};

	return (
		<>
			<div className="mb-4 flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center">
				<AdminSearch
					defaultValue={search}
					placeholder="Search entitled products..."
				/>
				<Button
					variant="outline"
					size="sm"
					onClick={() => {
						void onRefresh();
					}}
					disabled={loading || submitting}
					className="shrink-0"
				>
					<RefreshCw size={14} className={loading ? "animate-spin" : ""} />
					<span className="ml-1.5">Refresh</span>
				</Button>
			</div>

			{error && (
				<div className="mb-3 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
					{error}
				</div>
			)}

			{editingRowId && (
				<div className="mb-3 flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
					<p>
						You are editing, hit &quot;save&quot; to continue or
						&quot;cancel&quot;.
					</p>
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							onClick={openEditConfirmation}
							disabled={!hasDraftChanged() || submitting}
						>
							Save
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={cancelEditing}
							disabled={submitting}
						>
							Cancel
						</Button>
					</div>
				</div>
			)}

			{entitlements.length === 0 && !loading ? (
				<EmptyState
					icon={ShieldCheck}
					heading="No entitlements found"
					description={
						search
							? `No entitled products match "${search}". Try a different search.`
							: "This user has no entitled products yet."
					}
				/>
			) : (
				<AdminDataTable
					columns={entitlementColumns}
					data={entitlements}
					getRowId={(entitlement) => entitlement.id}
					renderRowActions={renderRowActions}
					loading={loading}
					minWidth="min-w-[1320px]"
				/>
			)}

			<AdminPagination
				page={page}
				totalPages={totalPages}
				total={total}
				pageSize={pageSize}
				itemLabel="entitlements"
			/>

			<Dialog
				open={confirmAction !== null}
				onOpenChange={(open) => {
					if (submitting) return;
					if (!open) {
						setConfirmAction(null);
						setSubmitError(null);
					}
				}}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{confirmAction?.type === "edit"
								? "Confirm Entitlement Update"
								: "Confirm Entitlement Deletion"}
						</DialogTitle>
						<DialogDescription>
							{confirmAction?.type === "edit"
								? "This will update custom fields for this entitlement."
								: "This will remove this entitlement from the user."}
						</DialogDescription>
					</DialogHeader>
					{submitError && (
						<div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
							{submitError}
						</div>
					)}
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setConfirmAction(null);
								setSubmitError(null);
							}}
							disabled={submitting}
						>
							Cancel
						</Button>
						<Button
							variant={
								confirmAction?.type === "delete" ? "destructive" : "default"
							}
							onClick={handleConfirmAction}
							disabled={submitting}
						>
							{submitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Applying...
								</>
							) : (
								"Confirm"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
