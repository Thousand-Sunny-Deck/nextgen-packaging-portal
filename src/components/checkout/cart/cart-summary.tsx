"use client";

import { CartItem, useCartStore } from "@/lib/store/product-store";
import { CartRow } from "./cart-row";
import { useEffect, useState } from "react";

const CartSummary = () => {
	const { getCart } = useCartStore();
	const [cart, setCart] = useState<CartItem[]>([]);
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
		setCart(getCart());
	}, [getCart]);

	if (!isClient) {
		return null; // or a loading skeleton
	}

	return (
		<div className="w-[60%] max-h-[600px] overflow-y-auto">
			{cart.map((item) => (
				<CartRow
					key={item.sku}
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
