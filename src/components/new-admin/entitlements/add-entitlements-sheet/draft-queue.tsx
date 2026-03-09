"use client";

import { X } from "lucide-react";
import { useAddEntitlementsStore } from "@/lib/store/add-entitlements-store";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function DraftQueue() {
	const { draft, removeItem, updateItem } = useAddEntitlementsStore();
	const items = [...draft.values()];

	if (items.length === 0) {
		return (
			<p className="text-sm text-slate-500 italic">
				No products selected yet. Check products above to add them to the draft.
			</p>
		);
	}

	return (
		<div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
			<div className="overflow-x-auto">
				<table className="w-full text-sm min-w-[680px]">
					<thead>
						<tr className="border-b border-slate-200 bg-slate-50">
							<th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
								Product
							</th>
							<th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
								Custom SKU
							</th>
							<th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
								Custom Description
							</th>
							<th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
								Custom Cost
							</th>
							<th className="w-10 px-4 py-3" />
						</tr>
					</thead>
					<tbody>
						{items.map((item) => (
							<tr
								key={item.productId}
								className="border-b border-slate-100 last:border-0"
							>
								<td className="px-4 py-2">
									<p className="font-mono text-xs text-slate-700">{item.sku}</p>
									<p className="text-xs text-slate-500 truncate max-w-[140px]">
										{item.description}
									</p>
								</td>
								<td className="px-4 py-2">
									<Input
										value={item.customSku}
										onChange={(e) =>
											updateItem(item.productId, { customSku: e.target.value })
										}
										placeholder={item.sku}
										className="h-8 text-xs w-36"
									/>
								</td>
								<td className="px-4 py-2">
									<Input
										value={item.customDescription}
										onChange={(e) =>
											updateItem(item.productId, {
												customDescription: e.target.value,
											})
										}
										placeholder={item.description}
										className="h-8 text-xs w-52"
									/>
								</td>
								<td className="px-4 py-2">
									<Input
										type="number"
										step="0.01"
										min="0"
										value={item.customUnitCost}
										onChange={(e) =>
											updateItem(item.productId, {
												customUnitCost: e.target.value,
											})
										}
										placeholder={String(item.unitCost)}
										className="h-8 text-xs w-28"
									/>
								</td>
								<td className="px-4 py-2">
									<Button
										variant="ghost"
										size="sm"
										onClick={() => removeItem(item.productId)}
										className="h-7 w-7 p-0 text-slate-400 hover:text-red-500"
									>
										<X size={14} />
									</Button>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
