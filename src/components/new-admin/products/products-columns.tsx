import type { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import type { AdminTableColumn } from "@/components/new-admin/ui/admin-data-table";
import type { SpikeAdminProduct } from "@/actions/spike/products-actions";

function formatCurrency(value: number) {
	return value.toLocaleString("en-AU", {
		style: "currency",
		currency: "AUD",
		currencyDisplay: "code",
	});
}

function formatDate(isoString: string) {
	return new Date(isoString).toLocaleDateString("en-AU", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export type ProductEditDraft = {
	sku: string;
	description: string;
	unitCost: number;
};

type ProductColumnsOptions = {
	editingRowId: string | null;
	editDraft: ProductEditDraft;
	setEditDraft: Dispatch<SetStateAction<ProductEditDraft>>;
};

export function getProductColumns({
	editingRowId,
	editDraft,
	setEditDraft,
}: ProductColumnsOptions): AdminTableColumn<SpikeAdminProduct>[] {
	return [
		{
			key: "sku",
			header: "SKU",
			render: (product) =>
				editingRowId === product.id ? (
					<Input
						className="h-8 font-mono text-xs"
						value={editDraft.sku}
						onChange={(event) =>
							setEditDraft((prev) => ({ ...prev, sku: event.target.value }))
						}
					/>
				) : (
					<span className="font-mono text-xs text-slate-700">
						{product.sku}
					</span>
				),
		},
		{
			key: "description",
			header: "Description",
			render: (product) =>
				editingRowId === product.id ? (
					<Input
						className="h-8 text-sm"
						value={editDraft.description}
						onChange={(event) =>
							setEditDraft((prev) => ({
								...prev,
								description: event.target.value,
							}))
						}
					/>
				) : (
					<span className="font-medium text-slate-900">
						{product.description}
					</span>
				),
		},
		{
			key: "handle",
			header: "Handle",
			render: (product) => (
				<span className="text-slate-500">{product.handle}</span>
			),
		},
		{
			key: "unitCost",
			header: "Unit Cost",
			render: (product) =>
				editingRowId === product.id ? (
					<Input
						type="number"
						step="0.01"
						className="h-8 w-32 text-sm"
						value={editDraft.unitCost}
						onChange={(event) =>
							setEditDraft((prev) => ({
								...prev,
								unitCost: Number.parseFloat(event.target.value || "0"),
							}))
						}
					/>
				) : (
					<span className="text-slate-700">
						{formatCurrency(product.unitCost)}
					</span>
				),
		},
		{
			key: "created",
			header: "Created",
			render: (product) => formatDate(product.createdAt),
		},
	];
}
