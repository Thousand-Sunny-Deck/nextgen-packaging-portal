import { ImageOff, Pencil, Trash2 } from "lucide-react";
import type { ProductDraftItem } from "@/lib/store/create-product-store";
import Image from "next/image";

interface ProductDraftCardProps {
	item: ProductDraftItem;
	isEditing?: boolean;
	onEdit?: (item: ProductDraftItem) => void;
	onRemove?: (localId: string) => void;
}

export function ProductDraftCard({
	item,
	isEditing,
	onEdit,
	onRemove,
}: ProductDraftCardProps) {
	return (
		<div
			className={`rounded-lg border overflow-hidden ${
				isEditing ? "border-orange-300" : "border-slate-200"
			}`}
		>
			{/* Top: image or placeholder */}
			{item.imagePreview ? (
				<Image
					src={item.imagePreview}
					alt={item.sku}
					className="w-full h-32 object-cover"
				/>
			) : (
				<div className="w-full h-32 bg-slate-50 flex items-center justify-center">
					<ImageOff className="h-8 w-8 text-slate-200" />
				</div>
			)}

			{/* Bottom: details */}
			<div className="px-3 py-2">
				<div className="flex items-start justify-between gap-1">
					<p className="text-xs font-medium text-slate-900 font-mono leading-tight truncate">
						{item.sku}
					</p>
					{(onEdit || onRemove) && (
						<div className="flex items-center gap-1.5 shrink-0">
							{onEdit && (
								<button
									type="button"
									onClick={() => onEdit(item)}
									className="text-slate-400 hover:text-slate-700 transition-colors"
								>
									<Pencil size={12} />
								</button>
							)}
							{onRemove && (
								<button
									type="button"
									onClick={() => onRemove(item.localId)}
									className="text-slate-400 hover:text-red-500 transition-colors"
								>
									<Trash2 size={12} />
								</button>
							)}
						</div>
					)}
				</div>
				<p className="text-xs text-slate-500 mt-0.5 line-clamp-2 leading-tight">
					{item.description}
				</p>
				<p className="text-xs text-slate-400 mt-1">
					${item.unitCost.toFixed(2)}
				</p>
			</div>
		</div>
	);
}
