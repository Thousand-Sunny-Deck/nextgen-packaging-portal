"use client";

import { useState, useMemo } from "react";
import { Search, X, Loader2, PackageSearch, XCircle } from "lucide-react";
import type { SpikeAvailableProduct } from "@/actions/spike/entitlements-actions";
import {
	useAddEntitlementsStore,
	MAX_ENTITLEMENTS_DRAFT,
} from "@/lib/store/add-entitlements-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/new-admin/ui/empty-state";
import { CsvImportButton } from "./csv-importer/csv-import-button";

const PAGE_SIZE = 10;

function formatCurrency(value: number) {
	return value.toLocaleString("en-AU", {
		style: "currency",
		currency: "AUD",
		currencyDisplay: "code",
	});
}

interface AvailableProductsTableProps {
	products: SpikeAvailableProduct[];
	loading: boolean;
	error: string | null;
}

export function AvailableProductsTable({
	products,
	loading,
	error,
}: AvailableProductsTableProps) {
	const { draft, addItem, removeItem, isInDraft } = useAddEntitlementsStore();

	const [searchInput, setSearchInput] = useState("");
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [csvErrors, setCsvErrors] = useState<string[]>([]);

	const filtered = useMemo(() => {
		const q = search.toLowerCase();
		if (!q) return products;
		return products.filter(
			(p) =>
				p.sku.toLowerCase().includes(q) ||
				p.description.toLowerCase().includes(q),
		);
	}, [products, search]);

	const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
	const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

	const handleSearch = (e: React.FormEvent) => {
		e.preventDefault();
		setSearch(searchInput.trim());
		setPage(1);
	};

	const handleClearSearch = () => {
		setSearchInput("");
		setSearch("");
		setPage(1);
	};

	const handleToggle = (product: SpikeAvailableProduct) => {
		if (isInDraft(product.id)) {
			removeItem(product.id);
		} else {
			if (draft.size >= MAX_ENTITLEMENTS_DRAFT) return;
			addItem({
				productId: product.id,
				sku: product.sku,
				description: product.description,
				unitCost: product.unitCost,
				customSku: "",
				customDescription: "",
				customUnitCost: "",
				source: "manual",
			});
		}
	};

	const atLimit = draft.size >= MAX_ENTITLEMENTS_DRAFT;

	if (loading) {
		return (
			<div className="flex items-center justify-center py-10">
				<Loader2 className="h-5 w-5 animate-spin text-slate-400" />
				<span className="ml-2 text-sm text-slate-500">Loading products...</span>
			</div>
		);
	}

	if (error) {
		return (
			<div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
				{error}
			</div>
		);
	}

	return (
		<div className="space-y-3">
			<div className="space-y-2">
				<div className="flex items-center gap-2 flex-wrap">
					<form onSubmit={handleSearch} className="flex items-center gap-2">
						<div className="relative">
							<Input
								type="text"
								placeholder="Search SKU or description..."
								value={searchInput}
								onChange={(e) => setSearchInput(e.target.value)}
								className="w-72 pr-8"
							/>
							{searchInput && (
								<button
									type="button"
									onClick={handleClearSearch}
									className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
								>
									<X size={14} />
								</button>
							)}
						</div>
						<Button
							type="submit"
							variant="outline"
							size="sm"
							className="shrink-0"
						>
							<Search size={14} className="sm:hidden" />
							<span className="hidden sm:inline">Search</span>
						</Button>
					</form>
					<CsvImportButton
						products={products}
						loading={loading}
						onErrors={setCsvErrors}
					/>
					{atLimit && (
						<p className="text-xs font-medium text-amber-600">
							Max {MAX_ENTITLEMENTS_DRAFT} products reached
						</p>
					)}
				</div>
				{csvErrors.length > 0 && (
					<div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 space-y-1.5">
						<div className="flex items-center gap-1.5 text-red-700">
							<XCircle size={14} className="shrink-0" />
							<p className="text-xs font-semibold">
								{csvErrors.length} error{csvErrors.length > 1 ? "s" : ""} —
								nothing was imported
							</p>
						</div>
						<ul className="space-y-0.5">
							{csvErrors.map((err, i) => (
								<li key={i} className="text-xs text-red-700 flex gap-1.5">
									<span className="shrink-0">•</span>
									<span>{err}</span>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>

			{paged.length === 0 ? (
				<EmptyState
					icon={PackageSearch}
					heading={
						search ? "No products match your search" : "No available products"
					}
					description={
						search
							? `No products match "${search}". Try a different search.`
							: "All products are already entitled to this user."
					}
				/>
			) : (
				<>
					<div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full text-sm min-w-[500px]">
								<thead>
									<tr className="border-b border-slate-200 bg-slate-50">
										<th className="w-10 px-4 py-3" />
										<th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
											SKU
										</th>
										<th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
											Description
										</th>
										<th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
											Unit Cost
										</th>
									</tr>
								</thead>
								<tbody>
									{paged.map((product) => {
										const inDraft = isInDraft(product.id);
										const disabled = atLimit && !inDraft;
										return (
											<tr
												key={product.id}
												onClick={() => !disabled && handleToggle(product)}
												className={[
													"border-b border-slate-100 last:border-0 transition-colors",
													inDraft
														? "bg-slate-50"
														: disabled
															? "opacity-40 cursor-not-allowed"
															: "cursor-pointer hover:bg-slate-50/50",
												].join(" ")}
											>
												<td className="px-4 py-3">
													<input
														type="checkbox"
														checked={inDraft}
														disabled={disabled}
														onChange={() => !disabled && handleToggle(product)}
														onClick={(e) => e.stopPropagation()}
														className="h-4 w-4 rounded border-slate-300 cursor-pointer"
													/>
												</td>
												<td className="px-4 py-3 font-mono text-xs text-slate-700">
													{product.sku}
												</td>
												<td className="px-4 py-3 text-slate-700">
													{product.description}
												</td>
												<td className="px-4 py-3 text-slate-700">
													{formatCurrency(product.unitCost)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>

					{totalPages > 1 && (
						<div className="flex items-center justify-between text-sm text-slate-600 py-1">
							<span>
								Showing {(page - 1) * PAGE_SIZE + 1}–
								{Math.min(page * PAGE_SIZE, filtered.length)} of{" "}
								{filtered.length}
							</span>
							<div className="flex items-center gap-1">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1}
								>
									Previous
								</Button>
								<span className="px-2 text-xs">
									{page} / {totalPages}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
									disabled={page === totalPages}
								>
									Next
								</Button>
							</div>
						</div>
					)}
				</>
			)}
		</div>
	);
}
