"use client";

import { CartItem } from "@/lib/store/product-store";
import { CoolCartItem } from "./CoolCartItem";

interface CoolCartListProps {
	items: CartItem[];
	imageByHandle: Map<string, string | null>;
	onQuantityChange: (handle: string, quantity: number) => void;
	onDelete: (handle: string) => void;
}

export const CoolCartList = ({
	items,
	imageByHandle,
	onQuantityChange,
	onDelete,
}: CoolCartListProps) => {
	if (items.length === 0) {
		return (
			<div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
				Your cart is empty. Add products from the catalog.
			</div>
		);
	}

	return (
		<div className="space-y-3">
			{items.map((item) => (
				<CoolCartItem
					key={item.handle}
					item={item}
					imageUrl={imageByHandle.get(item.handle) ?? null}
					onQuantityChange={onQuantityChange}
					onDelete={onDelete}
				/>
			))}
		</div>
	);
};
