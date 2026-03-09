import type { EntitlementDraftItem } from "@/lib/store/add-entitlements-store";

function formatCurrency(value: number) {
	return value.toLocaleString("en-AU", {
		style: "currency",
		currency: "AUD",
		currencyDisplay: "code",
	});
}

interface AddEntitlementsReviewStepProps {
	draft: EntitlementDraftItem[];
	userName: string;
	error: string | null;
}

export function AddEntitlementsReviewStep({
	draft,
	userName,
	error,
}: AddEntitlementsReviewStepProps) {
	return (
		<div className="py-4 space-y-4 max-w-3xl">
			<p className="text-sm text-slate-500">
				The following {draft.length} product{draft.length !== 1 ? "s" : ""} will
				be granted to{" "}
				<span className="font-medium text-slate-900">{userName}</span>. All
				succeed or none are granted.
			</p>

			<div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-sm min-w-[560px]">
						<thead>
							<tr className="border-b border-slate-200 bg-slate-50">
								<th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
									SKU
								</th>
								<th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
									Description
								</th>
								<th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
									Unit Cost
								</th>
								<th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
									Note
								</th>
							</tr>
						</thead>
						<tbody>
							{draft.map((item) => {
								const hasCustom =
									item.customSku.trim() ||
									item.customDescription.trim() ||
									item.customUnitCost.trim();
								const effectiveSku = item.customSku.trim() || item.sku;
								const effectiveDescription =
									item.customDescription.trim() || item.description;
								const effectiveCost = item.customUnitCost.trim()
									? parseFloat(item.customUnitCost)
									: item.unitCost;
								return (
									<tr
										key={item.productId}
										className="border-b border-slate-100 last:border-0"
									>
										<td className="px-4 py-3 font-mono text-xs text-slate-700">
											{effectiveSku}
										</td>
										<td className="px-4 py-3 text-slate-700">
											{effectiveDescription}
										</td>
										<td className="px-4 py-3 text-slate-700">
											{formatCurrency(effectiveCost)}
										</td>
										<td className="px-4 py-3">
											{hasCustom ? (
												<span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 border border-amber-200">
													customised
												</span>
											) : (
												<span className="text-xs text-slate-400">default</span>
											)}
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

			{error && (
				<div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
					{error}
				</div>
			)}
		</div>
	);
}
