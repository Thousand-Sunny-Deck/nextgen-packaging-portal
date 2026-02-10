"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	ArrowUpDown,
	MoreHorizontal,
	Pencil,
	Trash2,
	Save,
	X,
	Loader2,
} from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserEntitlement } from "@/actions/admin/entitlements-actions";

export type EditDraft = {
	customSku: string;
	customDescription: string;
	customUnitCost: string;
};

export type EntitlementTableMeta = {
	editingId: string | null;
	editDraft: EditDraft;
	saving: boolean;
	onEditStart: (entitlement: UserEntitlement) => void;
	onEditCancel: () => void;
	onEditSave: () => void;
	onDraftChange: (field: keyof EditDraft, value: string) => void;
	onRevoke: (entitlement: UserEntitlement) => void;
};

export const entitlementsColumns: ColumnDef<UserEntitlement>[] = [
	{
		id: "effectiveSku",
		accessorFn: (row) => row.customSku ?? row.productSku,
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				SKU
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row, table }) => {
			const meta = table.options.meta as EntitlementTableMeta;
			const isEditing = meta.editingId === row.original.id;
			if (isEditing) {
				return (
					<Input
						value={meta.editDraft.customSku}
						onChange={(e) => meta.onDraftChange("customSku", e.target.value)}
						className="h-7 text-sm font-mono w-32"
						placeholder={row.original.productSku}
					/>
				);
			}
			const hasCustom = row.original.customSku !== null;
			return (
				<div className="font-mono font-medium">
					{row.original.customSku ?? row.original.productSku}
					{hasCustom && <span className="ml-1 text-xs text-blue-500">*</span>}
				</div>
			);
		},
	},
	{
		id: "effectiveDescription",
		accessorFn: (row) => row.customDescription ?? row.productDescription,
		header: "Description",
		cell: ({ row, table }) => {
			const meta = table.options.meta as EntitlementTableMeta;
			const isEditing = meta.editingId === row.original.id;
			if (isEditing) {
				return (
					<Input
						value={meta.editDraft.customDescription}
						onChange={(e) =>
							meta.onDraftChange("customDescription", e.target.value)
						}
						className="h-7 text-sm w-64"
						placeholder={row.original.productDescription}
					/>
				);
			}
			const hasCustom = row.original.customDescription !== null;
			return (
				<div className="text-gray-600 max-w-md truncate">
					{row.original.customDescription ?? row.original.productDescription}
					{hasCustom && <span className="ml-1 text-xs text-blue-500">*</span>}
				</div>
			);
		},
	},
	{
		accessorKey: "productUnitCost",
		header: "Base Cost",
		cell: ({ row }) => (
			<div className="text-gray-500">
				${row.original.productUnitCost.toFixed(2)}
			</div>
		),
	},
	{
		id: "effectiveCost",
		accessorFn: (row) => row.customUnitCost ?? row.productUnitCost,
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Effective Cost
			</Button>
		),
		cell: ({ row, table }) => {
			const meta = table.options.meta as EntitlementTableMeta;
			const isEditing = meta.editingId === row.original.id;
			if (isEditing) {
				return (
					<Input
						value={meta.editDraft.customUnitCost}
						onChange={(e) =>
							meta.onDraftChange("customUnitCost", e.target.value)
						}
						className="h-7 text-sm w-24"
						placeholder={row.original.productUnitCost.toFixed(2)}
					/>
				);
			}
			const hasCustom = row.original.customUnitCost !== null;
			const cost = row.original.customUnitCost ?? row.original.productUnitCost;
			return (
				<div
					className={hasCustom ? "font-medium text-blue-600" : "font-medium"}
				>
					${cost.toFixed(2)}
					{hasCustom && <span className="ml-1 text-xs text-blue-500">*</span>}
				</div>
			);
		},
	},
	{
		id: "actions",
		cell: ({ row, table }) => {
			const meta = table.options.meta as EntitlementTableMeta;
			const isEditing = meta.editingId === row.original.id;
			if (isEditing) {
				return (
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="sm"
							onClick={meta.onEditCancel}
							disabled={meta.saving}
						>
							<X className="h-3 w-3" />
						</Button>
						<Button size="sm" onClick={meta.onEditSave} disabled={meta.saving}>
							{meta.saving ? (
								<Loader2 className="h-3 w-3 animate-spin" />
							) : (
								<Save className="h-3 w-3" />
							)}
						</Button>
					</div>
				);
			}
			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0">
							<MoreHorizontal className="h-4 w-4" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<DropdownMenuItem onClick={() => meta.onEditStart(row.original)}>
							<Pencil className="mr-2 h-4 w-4" />
							Edit
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={() => meta.onRevoke(row.original)}
							className="text-red-600"
						>
							<Trash2 className="mr-2 h-4 w-4" />
							Revoke
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			);
		},
	},
];
