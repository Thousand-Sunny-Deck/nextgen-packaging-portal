"use client";

import { useCartStore } from "@/lib/store/product-store";
import { useMemo } from "react";
import { CartRow } from "./cart-row";

const CartSummary = () => {
	const { getCart } = useCartStore();
	const cart = useMemo(() => {
		return getCart();
	}, [getCart]);

	return (
		<div className="w-[60%] max-h-[600px] overflow-y-auto">
			{cart.map((item, id) => (
				<CartRow
					key={id}
					sku={item.sku}
					description={item.description}
					quantity={item.quantity}
					total={item.total}
					unitCost={item.unitCost}
				/>
			))}
		</div>
	);
};

export default CartSummary;
