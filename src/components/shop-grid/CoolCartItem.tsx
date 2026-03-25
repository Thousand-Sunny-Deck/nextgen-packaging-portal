"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CatalogQuantityControl } from "./CatalogQuantityControl";
import { CartItem } from "@/lib/store/product-store";

interface CoolCartItemProps {
	item: CartItem;
	imageUrl?: string | null;
	onQuantityChange: (handle: string, quantity: number) => void;
	onDelete: (handle: string) => void;
}

const MAX_QUANTITY = 999;
const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

export const CoolCartItem = ({
	item,
	imageUrl,
	onQuantityChange,
	onDelete,
}: CoolCartItemProps) => {
	const handleDecrement = () => {
		onQuantityChange(item.handle, Math.max(0, item.quantity - 1));
	};

	const handleIncrement = () => {
		onQuantityChange(item.handle, Math.min(MAX_QUANTITY, item.quantity + 1));
	};

	return (
		<article className="rounded-lg border border-border bg-white p-3">
			<div className="flex items-start gap-3">
				<div className="h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-muted">
					{imageUrl ? (
						<img
							src={imageUrl}
							alt={item.description}
							className="h-full w-full object-cover"
						/>
					) : (
						<div className="flex h-full w-full items-center justify-center text-[10px] text-muted-foreground">
							No image
						</div>
					)}
				</div>

				<div className="min-w-0 flex-1">
					<p className="line-clamp-2 text-sm font-medium text-gray-900">
						{item.description}
					</p>
					<p className="mt-1 text-xs text-gray-500">{item.sku}</p>
					<p className="mt-1 text-xs font-semibold text-gray-700">
						Unit: {formatCurrency(item.unitCost)}
					</p>
				</div>

				<Button
					type="button"
					size="icon-sm"
					variant="ghost"
					onClick={() => onDelete(item.handle)}
					aria-label="Remove item from cart"
					className="text-red-600 hover:bg-red-50 hover:text-red-700"
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>

			<div className="mt-3">
				<CatalogQuantityControl
					quantity={item.quantity}
					max={MAX_QUANTITY}
					onDecrement={handleDecrement}
					onIncrement={handleIncrement}
					onChange={(next) => onQuantityChange(item.handle, next)}
				/>
			</div>
		</article>
	);
};
