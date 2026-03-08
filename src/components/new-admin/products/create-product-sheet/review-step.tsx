import type { ProductDraftItem } from "@/lib/store/create-product-store";
import { ProductDraftCard } from "./product-draft-card";

interface ProductReviewStepProps {
	draft: ProductDraftItem[];
	error: string | null;
}

export function ProductReviewStep({ draft, error }: ProductReviewStepProps) {
	return (
		<div className="space-y-4 py-4 max-w-lg mx-auto">
			<p className="text-sm text-slate-500">
				The following {draft.length} product{draft.length > 1 ? "s" : ""} will
				be created. All succeed or none are created.
			</p>

			<div className="grid grid-cols-2 gap-3">
				{draft.map((item) => (
					<ProductDraftCard key={item.localId} item={item} />
				))}
			</div>

			{error && (
				<div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
					{error}
				</div>
			)}
		</div>
	);
}
