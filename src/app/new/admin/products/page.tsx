"use client";

import { useState } from "react";
import { PageHeader } from "@/components/new-admin/layout/page-header";
import { BulkActionBar } from "@/components/new-admin/ui/bulk-action-bar";
import { mockProducts } from "@/components/new-admin/mock-data";

export default function NewAdminProductsPage() {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	const allSelected =
		selectedIds.size === mockProducts.length && mockProducts.length > 0;

	const toggleAll = () => {
		if (allSelected) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(mockProducts.map((p) => p.id)));
		}
	};

	const toggleOne = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	return (
		<div className="p-4 md:p-8">
			<PageHeader
				title="Products"
				subtitle="Manage available products"
				cta={{ label: "Create Product" }}
			/>

			<div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-sm min-w-[480px]">
						<thead>
							<tr className="border-b border-slate-200 bg-slate-50">
								<th className="w-10 px-4 py-3 text-left">
									<input
										type="checkbox"
										checked={allSelected}
										onChange={toggleAll}
										className="rounded border-slate-300 accent-orange-500"
									/>
								</th>
								<th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
									Name
								</th>
								<th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs hidden sm:table-cell">
									SKU
								</th>
								<th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
									Price
								</th>
								<th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
									Status
								</th>
								<th className="w-10 px-4 py-3" />
							</tr>
						</thead>
						<tbody>
							{mockProducts.map((product) => {
								const isSelected = selectedIds.has(product.id);
								return (
									<tr
										key={product.id}
										className={`border-b border-slate-100 last:border-0 transition-colors ${
											isSelected ? "bg-orange-50" : "hover:bg-slate-50/50"
										}`}
									>
										<td className="px-4 py-3">
											<input
												type="checkbox"
												checked={isSelected}
												onChange={() => toggleOne(product.id)}
												className="rounded border-slate-300 accent-orange-500"
											/>
										</td>
										<td className="px-4 py-3 font-medium text-slate-900">
											{product.name}
										</td>
										<td className="px-4 py-3 text-slate-500 font-mono text-xs hidden sm:table-cell">
											{product.sku}
										</td>
										<td className="px-4 py-3 text-slate-700 font-medium">
											{product.price}
										</td>
										<td className="px-4 py-3">
											<span
												className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
													product.status === "Active"
														? "bg-green-50 text-green-600"
														: "bg-slate-100 text-slate-500"
												}`}
											>
												{product.status}
											</span>
										</td>
										<td className="px-4 py-3">
											<button className="text-slate-400 hover:text-slate-700 transition-colors">
												<svg
													className="h-4 w-4"
													fill="currentColor"
													viewBox="0 0 16 16"
												>
													<circle cx="8" cy="2" r="1.5" />
													<circle cx="8" cy="8" r="1.5" />
													<circle cx="8" cy="14" r="1.5" />
												</svg>
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

			<BulkActionBar
				selectedCount={selectedIds.size}
				onClearSelection={() => setSelectedIds(new Set())}
			/>

			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
				<p className="text-sm text-slate-500">
					Showing {mockProducts.length} of {mockProducts.length} products
				</p>
				<div className="flex items-center gap-1">
					<button className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
						Previous
					</button>
					<button className="px-3 py-1.5 text-sm bg-orange-500 text-white rounded-md">
						1
					</button>
					<button className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
						Next
					</button>
				</div>
			</div>
		</div>
	);
}
