"use client";

import {
	useAddEntitlementsStore,
	MAX_ENTITLEMENTS_DRAFT,
} from "@/lib/store/add-entitlements-store";
import { AvailableProductsTable } from "./available-products-table";
import { DraftQueue } from "./draft-queue";

interface AddEntitlementsDraftStepProps {
	userId: string;
	open: boolean;
}

export function AddEntitlementsDraftStep({
	userId,
	open,
}: AddEntitlementsDraftStepProps) {
	const { draft } = useAddEntitlementsStore();

	return (
		<div className="py-4 space-y-8">
			{/* Top zone — available products */}
			<div className="space-y-3">
				<div className="flex items-center justify-between">
					<div>
						<h4 className="text-sm font-semibold text-slate-900">
							Available Products
						</h4>
						<p className="text-xs text-slate-500">
							Select products to entitle. Already-entitled products are
							excluded.
						</p>
					</div>
					<span className="text-xs font-medium text-slate-500 shrink-0">
						{draft.size} / {MAX_ENTITLEMENTS_DRAFT} selected
					</span>
				</div>
				<AvailableProductsTable userId={userId} open={open} />
			</div>

			<div className="border-t border-slate-200" />

			{/* Bottom zone — draft queue */}
			<div className="space-y-3">
				<div>
					<h4 className="text-sm font-semibold text-slate-900">
						Draft — {draft.size} product{draft.size !== 1 ? "s" : ""}
					</h4>
					<p className="text-xs text-slate-500">
						Optionally override SKU, description, and unit cost per product.
						Leave blank to use product defaults.
					</p>
				</div>
				<DraftQueue />
			</div>
		</div>
	);
}
