"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowUpDown, Pencil, CircleCheck, CircleX } from "lucide-react";
import { AvailableProduct } from "@/actions/admin/entitlements-actions";
import { ProductCustomization } from "./add-entitlement-sheet";

// Types for table meta
export interface GrantProductsTableMeta {
	// Selection
	isSelected: (productId: string) => boolean;
	toggleProduct: (productId: string) => void;
	// Inline editing
	editingRowId: string | null;
	editDraft: ProductCustomization;
	startEditing: (product: AvailableProduct) => void;
	cancelEditing: () => void;
	saveEditing: () => void;
	setEditDraft: (draft: Partial<ProductCustomization>) => void;
	hasDraftChanged: () => boolean;
	// Customization read
	getCustomization: (productId: string) => ProductCustomization | undefined;
}

export const grantProductsColumns: ColumnDef<AvailableProduct>[] = [
	{
		id: "select",
		header: "",
		cell: ({ row, table }) => {
			const meta = table.options.meta as GrantProductsTableMeta;
			const product = row.original;

			return (
				<Checkbox
					checked={product.alreadyEntitled || meta.isSelected(product.id)}
					disabled={product.alreadyEntitled}
					onCheckedChange={() => meta.toggleProduct(product.id)}
				/>
			);
		},
	},
	{
		accessorKey: "sku",
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
			const meta = table.options.meta as GrantProductsTableMeta;
			const product = row.original;
			const isEditing = meta.editingRowId === product.id;
			const custom = meta.getCustomization(product.id);

			if (isEditing) {
				return (
					<Input
						className="h-8 font-mono text-sm"
						value={meta.editDraft.customSku ?? ""}
						placeholder={product.sku}
						onChange={(e) =>
							meta.setEditDraft({ customSku: e.target.value || null })
						}
					/>
				);
			}

			return (
				<div
					className={`font-mono font-medium ${product.alreadyEntitled ? "opacity-50" : ""}`}
				>
					{product.sku}
					{custom?.customSku && (
						<span className="ml-1.5 inline-flex items-center rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-800">
							custom: {custom.customSku}
						</span>
					)}
					{product.alreadyEntitled && (
						<span className="ml-1.5 inline-flex items-center rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
							entitled
						</span>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "description",
		header: "Description",
		cell: ({ row, table }) => {
			const meta = table.options.meta as GrantProductsTableMeta;
			const product = row.original;
			const isEditing = meta.editingRowId === product.id;

			if (isEditing) {
				return (
					<Input
						className="h-8 text-sm"
						value={meta.editDraft.customDescription ?? ""}
						placeholder={product.description}
						onChange={(e) =>
							meta.setEditDraft({
								customDescription: e.target.value || null,
							})
						}
					/>
				);
			}

			const custom = meta.getCustomization(product.id);
			return (
				<div
					className={`text-gray-600 max-w-md truncate ${product.alreadyEntitled ? "opacity-50" : ""}`}
				>
					{product.description}
					{custom?.customDescription && (
						<span className="ml-1 text-xs text-blue-600">(custom set)</span>
					)}
				</div>
			);
		},
	},
	{
		accessorKey: "unitCost",
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
			const meta = table.options.meta as GrantProductsTableMeta;
			const product = row.original;
			const isEditing = meta.editingRowId === product.id;

			if (isEditing) {
				return (
					<Input
						className="h-8 text-sm w-28"
						type="number"
						step="0.01"
						value={meta.editDraft.customUnitCost ?? ""}
						placeholder={product.unitCost.toFixed(2)}
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

			const custom = meta.getCustomization(product.id);
			return (
				<div
					className={`font-medium ${product.alreadyEntitled ? "opacity-50" : ""}`}
				>
					${product.unitCost.toFixed(2)}
					{custom?.customUnitCost !== null &&
						custom?.customUnitCost !== undefined && (
							<span className="ml-1 text-xs text-blue-600">
								(custom: ${custom.customUnitCost.toFixed(2)})
							</span>
						)}
				</div>
			);
		},
	},
	{
		id: "actions",
		header: "",
		cell: ({ row, table }) => {
			const meta = table.options.meta as GrantProductsTableMeta;
			const product = row.original;
			const isEditing = meta.editingRowId === product.id;
			const isSelected = meta.isSelected(product.id);

			// Can only edit if selected and not already entitled
			if (product.alreadyEntitled || !isSelected) return null;

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

			return (
				<Button
					variant="ghost"
					size="sm"
					className="h-8 w-8 p-0"
					onClick={() => meta.startEditing(product)}
				>
					<Pencil className="h-3.5 w-3.5" />
				</Button>
			);
		},
	},
];
