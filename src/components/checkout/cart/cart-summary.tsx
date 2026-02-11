"use client";

import { CartItem } from "@/lib/store/product-store";
import { CartRow } from "./cart-row";

interface CartSummaryProps {
	cart: CartItem[];
}

const CartSummary = ({ cart }: CartSummaryProps) => {
	return (
		<div className="w-full border rounded-lg bg-white overflow-hidden md:w-[60%] md:max-h-[600px] md:overflow-y-auto md:border-0 md:rounded-none md:bg-transparent">
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
