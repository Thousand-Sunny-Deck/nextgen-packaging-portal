"use client";

import { useState, useEffect } from "react";
import {
	getSpikeAvailableProducts,
	type SpikeAvailableProduct,
} from "@/actions/spike/entitlements-actions";
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

	const [products, setProducts] = useState<SpikeAvailableProduct[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!open) return;
		let cancelled = false;
		setLoading(true);
		setError(null);
		getSpikeAvailableProducts(userId)
			.then((result) => {
				if (!cancelled) {
					setProducts(result.products);
					setLoading(false);
				}
			})
			.catch(() => {
				if (!cancelled) {
					setError("Failed to load available products.");
					setLoading(false);
				}
			});
		return () => {
			cancelled = true;
		};
	}, [userId, open]);

	return (
		<div className="py-4 space-y-8">
			{/* Top zone — available products */}
			<div className="space-y-3">
				<div className="flex items-center justify-between gap-4">
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
				<AvailableProductsTable
					products={products}
					loading={loading}
					error={error}
				/>
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
