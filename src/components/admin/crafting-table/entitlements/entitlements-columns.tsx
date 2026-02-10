"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	ArrowUpDown,
	Pencil,
	CircleCheck,
	CircleX,
	Trash2,
	Undo2,
} from "lucide-react";
import { UserEntitledProduct } from "@/actions/admin/entitlements-actions";
import { PendingEdit } from "@/lib/store/entitlement-changes-store";

// Types for table meta passed from the data table
export interface EntitlementsTableMeta {
	editingRowId: string | null;
	editDraft: PendingEdit;
	startEditing: (row: UserEntitledProduct) => void;
	cancelEditing: () => void;
	saveEditing: () => void;
	setEditDraft: (draft: Partial<PendingEdit>) => void;
	hasDraftChanged: () => boolean;
	isEdited: (id: string) => boolean;
	isRevoked: (id: string) => boolean;
	addRevocation: (id: string) => void;
	removeRevocation: (id: string) => void;
}

export const entitlementsColumns: ColumnDef<UserEntitledProduct>[] = [
	{
		accessorKey: "product.sku",
		id: "sku",
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
			const meta = table.options.meta as EntitlementsTableMeta;
			const isEditing = meta.editingRowId === row.original.id;
			const revoked = meta.isRevoked(row.original.id);
			const edited = meta.isEdited(row.original.id);

			if (isEditing) {
				return (
					<Input
						className="h-8 font-mono text-sm"
						value={meta.editDraft.customSku ?? ""}
						placeholder={row.original.product.sku}
						onChange={(e) =>
							meta.setEditDraft({
								customSku: e.target.value || null,
							})
						}
					/>
				);
			}

			const customSku = row.original.customSku;
			const baseSku = row.original.product.sku;
			return (
				<div
					className={`font-mono font-medium ${revoked ? "line-through opacity-50" : ""}`}
				>
					{customSku || baseSku}
					{customSku && (
						<span className="ml-1 text-xs text-muted-foreground">
							(base: {baseSku})
						</span>
					)}
					{edited && (
						<span className="ml-1.5 inline-flex items-center rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800">
							edited
						</span>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "product.description",
		id: "description",
		header: "Description",
		cell: ({ row, table }) => {
			const meta = table.options.meta as EntitlementsTableMeta;
			const isEditing = meta.editingRowId === row.original.id;
			const revoked = meta.isRevoked(row.original.id);

			if (isEditing) {
				return (
					<Input
						className="h-8 text-sm"
						value={meta.editDraft.customDescription ?? ""}
						placeholder={row.original.product.description}
						onChange={(e) =>
							meta.setEditDraft({
								customDescription: e.target.value || null,
							})
						}
					/>
				);
			}

			const customDesc = row.original.customDescription;
			const baseDesc = row.original.product.description;
			return (
				<div
					className={`text-gray-600 max-w-md truncate ${revoked ? "line-through opacity-50" : ""}`}
				>
					{customDesc || baseDesc}
				</div>
			);
		},
	},
	{
		accessorKey: "product.unitCost",
		id: "unitCost",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Unit Cost
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row, table }) => {
			const meta = table.options.meta as EntitlementsTableMeta;
			const isEditing = meta.editingRowId === row.original.id;
			const revoked = meta.isRevoked(row.original.id);

			if (isEditing) {
				return (
					<Input
						className="h-8 text-sm w-28"
						type="number"
						step="0.01"
						value={meta.editDraft.customUnitCost ?? ""}
						placeholder={row.original.product.unitCost.toFixed(2)}
						onChange={(e) =>
							meta.setEditDraft({
								customUnitCost: e.target.value
									? parseFloat(e.target.value)
									: null,
							})
						}
					/>
				);
			}

			const customCost = row.original.customUnitCost;
			const baseCost = row.original.product.unitCost;
			const displayCost = customCost ?? baseCost;
			return (
				<div
					className={`font-medium ${revoked ? "line-through opacity-50" : ""}`}
				>
					${displayCost.toFixed(2)}
					{customCost !== null && customCost !== baseCost && (
						<span className="ml-1 text-xs text-muted-foreground">
							(base: ${baseCost.toFixed(2)})
						</span>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "grantedAt",
		header: ({ column }) => (
			<Button
				variant="ghost"
				onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
			>
				Granted At
				<ArrowUpDown className="ml-2 h-4 w-4" />
			</Button>
		),
		cell: ({ row, table }) => {
			const meta = table.options.meta as EntitlementsTableMeta;
			const revoked = meta.isRevoked(row.original.id);
			const date = row.getValue("grantedAt") as Date;
			return (
				<div
					className={`text-gray-600 ${revoked ? "line-through opacity-50" : ""}`}
				>
					{new Date(date).toLocaleDateString()}
				</div>
			);
		},
	},
	{
		id: "actions",
		header: "Actions",
		cell: ({ row, table }) => {
			const meta = table.options.meta as EntitlementsTableMeta;
			const isEditing = meta.editingRowId === row.original.id;
			const revoked = meta.isRevoked(row.original.id);

			// Row is currently being edited — show save / cancel
			if (isEditing) {
				return (
					<div className="flex items-center gap-1">
						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 disabled:opacity-30"
							onClick={meta.saveEditing}
							disabled={!meta.hasDraftChanged()}
						>
							<CircleCheck className="h-5 w-5" />
						</Button>
						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0 text-red-400 hover:text-red-600"
							onClick={meta.cancelEditing}
						>
							<CircleX className="h-5 w-5" />
						</Button>
					</div>
				);
			}

			// Row is pending revocation — show undo
			if (revoked) {
				return (
					<Button
						variant="ghost"
						size="sm"
						className="h-8 px-2 text-xs text-muted-foreground hover:text-foreground"
						onClick={() => meta.removeRevocation(row.original.id)}
					>
						<Undo2 className="h-3.5 w-3.5 mr-1" />
						Undo
					</Button>
				);
			}

			// Default — show edit / revoke
			return (
				<div className="flex items-center gap-1">
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0"
						onClick={() => meta.startEditing(row.original)}
					>
						<Pencil className="h-3.5 w-3.5" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
						onClick={() => meta.addRevocation(row.original.id)}
					>
						<Trash2 className="h-3.5 w-3.5" />
					</Button>
				</div>
			);
		},
	},
];
