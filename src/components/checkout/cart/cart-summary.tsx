"use client";

import { CartItem } from "@/lib/store/product-store";
import { CartRow } from "./cart-row";

interface CartSummaryProps {
	cart: CartItem[];
}

const CartSummary = ({ cart }: CartSummaryProps) => {
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
