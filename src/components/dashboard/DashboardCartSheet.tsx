"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CoolCartSheet } from "@/components/shop-grid/CoolCartSheet";
import { CartItem, useCartStore } from "@/lib/store/product-store";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface DashboardCartSheetProps {
	uuid: string;
}

export const DashboardCartSheet = ({ uuid }: DashboardCartSheetProps) => {
	const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
	const router = useRouter();
	const {
		maybeSelectedProducts,
		selectedProductHandles,
		setQuantity,
		prepareCartForCheckout,
		clearCart,
		isCartSheetOpen,
		setCartSheetOpen,
	} = useCartStore();

	const cartItems = useMemo<CartItem[]>(
		() =>
			Array.from(selectedProductHandles)
				.map((handle) => maybeSelectedProducts.get(handle))
				.filter((item): item is CartItem => Boolean(item)),
		[selectedProductHandles, maybeSelectedProducts],
	);

	const cartSubtotal = useMemo(
		() =>
			cartItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0),
		[cartItems],
	);

	const imageByHandle = useMemo(
		() =>
			new Map(cartItems.map((item) => [item.handle, item.imageUrl ?? null])),
		[cartItems],
	);

	if (cartItems.length === 0) {
		return null;
	}

	const handleCartQuantityChange = (handle: string, quantity: number) => {
		const existing = maybeSelectedProducts.get(handle);
		if (!existing) return;

		const safeQuantity = Math.max(0, Math.min(999, Math.floor(quantity)));
		setQuantity({ ...existing, quantity: safeQuantity });
	};

	const handleRemoveFromCart = (handle: string) => {
		const existing = maybeSelectedProducts.get(handle);
		if (!existing) return;
		setQuantity({ ...existing, quantity: 0 });
	};

	const handleCheckout = () => {
		prepareCartForCheckout();
		setCartSheetOpen(false);
		router.push(`/dashboard/${uuid}/order/checkout`);
	};

	const handleClearCart = () => {
		setIsClearDialogOpen(true);
	};

	const handleConfirmClearCart = () => {
		clearCart();
		setIsClearDialogOpen(false);
		toast.success("Cart cleared.");
	};

	return (
		<>
			<CoolCartSheet
				isOpen={isCartSheetOpen}
				onOpenChange={setCartSheetOpen}
				cartItems={cartItems}
				cartSize={cartItems.length}
				cartSubtotal={cartSubtotal}
				imageByHandle={imageByHandle}
				onQuantityChange={handleCartQuantityChange}
				onDelete={handleRemoveFromCart}
				onCheckout={handleCheckout}
				onClearCart={handleClearCart}
			/>
			<Dialog open={isClearDialogOpen} onOpenChange={setIsClearDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Clear cart?</DialogTitle>
						<DialogDescription>
							This will remove all items from your cart. This action cannot be
							undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsClearDialogOpen(false)}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							onClick={handleConfirmClearCart}
						>
							Clear cart
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
};
