import type { ProductDraftItem } from "@/lib/store/product-draft-store";

interface ReviewStepProps {
	draft: ProductDraftItem[];
	error: string | null;
}

export function ReviewStep({ draft, error }: ReviewStepProps) {
	return (
		<div className="space-y-4 py-4 max-w-lg mx-auto">
			<p className="text-sm text-slate-500">
				The following {draft.length} product{draft.length > 1 ? "s" : ""} will
				be created. All succeed or none are created.
			</p>

			<div className="space-y-2">
				{draft.map((item) => (
					<div
						key={item.localId}
						className="rounded-md border border-slate-200 px-4 py-3"
					>
						<div className="flex items-center justify-between">
							<p className="text-sm font-medium text-slate-900 font-mono">
								{item.sku}
							</p>
							<p className="text-sm font-medium text-slate-700">
								${item.unitCost.toFixed(2)}
							</p>
						</div>
						<p className="text-xs text-slate-500 mt-0.5">{item.description}</p>
					</div>
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
