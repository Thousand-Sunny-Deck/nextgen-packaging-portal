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

export const productColumns: AdminTableColumn<SpikeAdminProduct>[] = [
	{
		key: "sku",
		header: "SKU",
		render: (product) => (
			<span className="font-mono text-xs text-slate-700">{product.sku}</span>
		),
	},
	{
		key: "description",
		header: "Description",
		render: (product) => (
			<span className="font-medium text-slate-900">{product.description}</span>
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
		render: (product) => (
			<span className="text-slate-700">{formatCurrency(product.unitCost)}</span>
		),
	},
	{
		key: "created",
		header: "Created",
		render: (product) => formatDate(product.createdAt),
	},
];
