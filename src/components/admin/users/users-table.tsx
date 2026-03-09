"use client";

import { useMemo, useState } from "react";
import {
	Users,
	RefreshCw,
	UserPlus,
	Check,
	X,
	Pencil,
	Trash2,
	Loader2,
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
import { CreateUsersSheet } from "@/components/admin/users/create-user-sheet/create-users";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { AdminSearch } from "@/components/admin/ui/admin-search";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";
import { AdminDataTable } from "@/components/admin/ui/admin-data-table";
import {
	RowActionsMenu,
	type RowActionItem,
} from "@/components/admin/ui/row-actions-menu";
import {
	updateSpikeUserName,
	type SpikeAdminUser,
} from "@/actions/spike/users-actions";
import { getUserColumns } from "./users-columns";

interface UsersTableProps {
	users: SpikeAdminUser[];
	total: number;
	totalPages: number;
	loading: boolean;
	error: string | null;
	search: string;
	page: number;
	pageSize: number;
	onRefresh: () => void;
}

type ConfirmAction = {
	type: "edit";
	rowId: string;
	name: string;
};

export function UsersTable({
	users,
	total,
	totalPages,
	loading,
	error,
	search,
	page,
	pageSize,
	onRefresh,
}: UsersTableProps) {
	const [sheetOpen, setSheetOpen] = useState(false);
	const [editingRowId, setEditingRowId] = useState<string | null>(null);
	const [editNameDraft, setEditNameDraft] = useState("");
	const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
		null,
	);
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const userById = useMemo(
		() => new Map(users.map((user) => [user.id, user])),
		[users],
	);

	const userColumns = useMemo(
		() =>
			getUserColumns({
				editingRowId,
				editNameDraft,
				setEditNameDraft,
			}),
		[editingRowId, editNameDraft],
	);

	const startEditing = (row: SpikeAdminUser) => {
		if (submitting) return;
		setEditingRowId(row.id);
		setEditNameDraft(row.name);
		setSubmitError(null);
	};

	const cancelEditing = () => {
		setEditingRowId(null);
		setEditNameDraft("");
	};

	const hasDraftChanged = () => {
		if (!editingRowId) return false;
		const row = userById.get(editingRowId);
		if (!row) return false;
		return editNameDraft.trim() !== row.name;
	};

	const openEditConfirmation = () => {
		if (!editingRowId) return;
		const nextName = editNameDraft.trim();
		if (!nextName) return;
		if (!hasDraftChanged()) return;
		setSubmitError(null);
		setConfirmAction({
			type: "edit",
			rowId: editingRowId,
			name: nextName,
		});
	};

	const handleConfirmAction = async () => {
		if (!confirmAction) return;
		setSubmitting(true);
		setSubmitError(null);

		const result = await updateSpikeUserName({
			userId: confirmAction.rowId,
			name: confirmAction.name,
		});

		if (!result.success) {
			setSubmitting(false);
			setSubmitError(result.error || "Failed to update user.");
			return;
		}

		toast.success("User updated.");
		setConfirmAction(null);
		cancelEditing();
		onRefresh();
		setSubmitting(false);
	};

	const renderRowActions = (row: SpikeAdminUser) => {
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

		const rowActions: RowActionItem<SpikeAdminUser>[] = [
			{
				key: "edit-user",
				label: "Edit",
				icon: <Pencil className="h-4 w-4" />,
				onSelect: startEditing,
			},
			{
				key: "delete-user",
				label: "Delete",
				icon: <Trash2 className="h-4 w-4" />,
				variant: "destructive",
				disabled: true,
				onSelect: () => {},
			},
		];

		return (
			<RowActionsMenu
				row={row}
				items={rowActions}
				disabled={editingAnotherRow || loading || submitting}
				triggerLabel="Open user actions"
			/>
		);
	};

	return (
		<>
			<CreateUsersSheet
				open={sheetOpen}
				onOpenChange={setSheetOpen}
				onUsersCreated={onRefresh}
			/>

			<div className="mb-4 flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center">
				<AdminSearch defaultValue={search} placeholder="Search users..." />
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						onClick={() => setSheetOpen(true)}
						className="shrink-0"
					>
						<UserPlus size={14} className="mr-1.5" />
						Create Users
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={onRefresh}
						disabled={loading}
						className="shrink-0"
					>
						<RefreshCw size={14} className={loading ? "animate-spin" : ""} />
						<span className="ml-1.5">Refresh</span>
					</Button>
				</div>
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

			{users.length === 0 && !loading ? (
				<EmptyState
					icon={Users}
					heading="No users found"
					description={
						search
							? `No users match "${search}". Try a different search.`
							: "No users in the database yet."
					}
				/>
			) : (
				<AdminDataTable
					columns={userColumns}
					data={users}
					getRowId={(u) => u.id}
					renderRowActions={renderRowActions}
					loading={loading}
					minWidth="min-w-[760px]"
				/>
			)}

			<AdminPagination
				page={page}
				totalPages={totalPages}
				total={total}
				pageSize={pageSize}
				itemLabel="users"
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
						<DialogTitle>Confirm User Update</DialogTitle>
						<DialogDescription>
							This will update the selected user&apos;s name.
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
						<Button onClick={handleConfirmAction} disabled={submitting}>
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
