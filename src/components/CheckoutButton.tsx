"use client";

import { useCartStore } from "@/lib/store/product-store";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";

export function CheckoutButton() {
	const { selectedProductHandles, prepareCartForCheckout } = useCartStore();
	const router = useRouter();
	const pathname = usePathname();

	const hasSelectedProducts = selectedProductHandles.size > 0;

	const handleCheckout = () => {
		prepareCartForCheckout();
		router.push(`${pathname}/checkout`);
	};

	return (
		<div className="w-full flex pt-6 md:pt-8 items-center justify-center">
			<Button
				size="sm"
				disabled={!hasSelectedProducts}
				onClick={handleCheckout}
			>
				Proceed to checkout
			</Button>
		</div>
	);
}
