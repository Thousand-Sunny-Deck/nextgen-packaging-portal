import type { Dispatch, SetStateAction } from "react";
import { Input } from "@/components/ui/input";
import type { AdminTableColumn } from "@/components/new-admin/ui/admin-data-table";
import type { SpikeUserEntitlementRow } from "@/actions/spike/entitlements-actions";

export type PendingEntitlementEdit = {
	customSku: string | null;
	customDescription: string | null;
	customUnitCost: number | null;
};

type EntitlementsColumnsOptions = {
	editingRowId: string | null;
	editDraft: PendingEntitlementEdit;
	setEditDraft: Dispatch<SetStateAction<PendingEntitlementEdit>>;
};

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

export function getEntitlementColumns({
	editingRowId,
	editDraft,
	setEditDraft,
}: EntitlementsColumnsOptions): AdminTableColumn<SpikeUserEntitlementRow>[] {
	return [
		{
			key: "sku",
			header: "SKU",
			render: (row) => {
				const effectiveSku =
					editingRowId === row.id
						? editDraft.customSku || row.product.sku
						: row.customSku || row.product.sku;
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
					editingRowId === row.id
						? editDraft.customDescription || row.product.description
						: row.customDescription || row.product.description;
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
			key: "customSku",
			header: "Custom SKU",
			render: (row) => {
				if (editingRowId === row.id) {
					return (
						<Input
							className="h-8 font-mono text-xs"
							value={editDraft.customSku ?? ""}
							placeholder={row.product.sku}
							onChange={(event) =>
								setEditDraft((prev) => ({
									...prev,
									customSku: event.target.value || null,
								}))
							}
						/>
					);
				}
				return row.customSku ? (
					<span className="font-mono text-xs text-slate-700">
						{row.customSku}
					</span>
				) : (
					<span className="text-slate-400">Not set</span>
				);
			},
		},
		{
			key: "customDescription",
			header: "Custom Description",
			render: (row) => {
				if (editingRowId === row.id) {
					return (
						<Input
							className="h-8 text-sm"
							value={editDraft.customDescription ?? ""}
							placeholder={row.product.description}
							onChange={(event) =>
								setEditDraft((prev) => ({
									...prev,
									customDescription: event.target.value || null,
								}))
							}
						/>
					);
				}
				return row.customDescription ? (
					<span className="text-slate-700">{row.customDescription}</span>
				) : (
					<span className="text-slate-400">Not set</span>
				);
			},
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
			key: "customUnitCost",
			header: "Custom Unit Cost",
			render: (row) => {
				if (editingRowId === row.id) {
					return (
						<Input
							type="number"
							step="0.01"
							className="h-8 w-32 text-sm"
							value={editDraft.customUnitCost ?? ""}
							placeholder={String(row.product.unitCost)}
							onChange={(event) =>
								setEditDraft((prev) => ({
									...prev,
									customUnitCost: event.target.value
										? Number.parseFloat(event.target.value)
										: null,
								}))
							}
						/>
					);
				}
				return row.customUnitCost !== null ? (
					<span className="text-slate-700">
						{formatCurrency(row.customUnitCost)}
					</span>
				) : (
					<span className="text-slate-400">Not set</span>
				);
			},
		},
		{
			key: "granted",
			header: "Granted",
			render: (row) => formatDate(row.grantedAt),
		},
	];
}
