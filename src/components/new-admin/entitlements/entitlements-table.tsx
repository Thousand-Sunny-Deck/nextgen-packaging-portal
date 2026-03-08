import { RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	AdminDataTable,
	type AdminTableColumn,
} from "@/components/new-admin/ui/admin-data-table";
import { AdminPagination } from "@/components/new-admin/ui/admin-pagination";
import { AdminSearch } from "@/components/new-admin/ui/admin-search";
import { EmptyState } from "@/components/new-admin/ui/empty-state";
import type { SpikeUserEntitlementRow } from "@/actions/spike/entitlements-actions";

interface EntitlementsTableProps {
	entitlements: SpikeUserEntitlementRow[];
	total: number;
	totalPages: number;
	loading: boolean;
	error: string | null;
	search: string;
	page: number;
	pageSize: number;
	onRefresh: () => void;
}

function formatCurrency(value: number) {
	return value.toLocaleString("en-AU", {
		style: "currency",
		currency: "AUD",
		currencyDisplay: "code",
	});
}

function formatDate(value: string) {
	return new Date(value).toLocaleDateString("en-AU", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

const entitlementColumns: AdminTableColumn<SpikeUserEntitlementRow>[] = [
	{
		key: "sku",
		header: "SKU",
		render: (row) => {
			const effectiveSku = row.customSku || row.product.sku;
			return (
				<div className="font-mono text-xs text-slate-700">
					<span>{effectiveSku}</span>
					{row.customSku && (
						<span className="ml-1 text-[11px] text-slate-400">
							(base: {row.product.sku})
						</span>
					)}
				</div>
			);
		},
	},
	{
		key: "description",
		header: "Description",
		render: (row) => {
			const effectiveDescription =
				row.customDescription || row.product.description;
			return (
				<div className="text-slate-700">
					<p className="font-medium text-slate-900">{effectiveDescription}</p>
					{row.customDescription && (
						<p className="text-xs text-slate-400">
							base: {row.product.description}
						</p>
					)}
				</div>
			);
		},
	},
	{
		key: "handle",
		header: "Handle",
		render: (row) => (
			<span className="text-slate-500">{row.product.handle}</span>
		),
	},
	{
		key: "unitCost",
		header: "Unit Cost",
		render: (row) => {
			const effectiveCost = row.customUnitCost ?? row.product.unitCost;
			return (
				<div className="text-slate-700">
					<span>{formatCurrency(effectiveCost)}</span>
					{row.customUnitCost !== null && (
						<span className="ml-1 text-xs text-slate-400">
							(base: {formatCurrency(row.product.unitCost)})
						</span>
					)}
				</div>
			);
		},
	},
	{
		key: "granted",
		header: "Granted",
		render: (row) => formatDate(row.grantedAt),
	},
];

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
					onClick={onRefresh}
					disabled={loading}
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
					loading={loading}
					minWidth="min-w-[920px]"
				/>
			)}

			<AdminPagination
				page={page}
				totalPages={totalPages}
				total={total}
				pageSize={pageSize}
				itemLabel="entitlements"
			/>
		</>
	);
}
