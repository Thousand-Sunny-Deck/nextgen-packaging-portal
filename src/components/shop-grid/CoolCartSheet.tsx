"use client";

import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetFooter,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { CartItem } from "@/lib/store/product-store";
import { CoolCartList } from "./CoolCartList";

interface CoolCartSheetProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	cartItems: CartItem[];
	cartSize: number;
	cartSubtotal: number;
	imageByHandle: Map<string, string | null>;
	onQuantityChange: (handle: string, quantity: number) => void;
	onDelete: (handle: string) => void;
	onCheckout: () => void;
}

const formatCurrency = (amount: number) => `$${amount.toFixed(2)}`;

export const CoolCartSheet = ({
	isOpen,
	onOpenChange,
	cartItems,
	cartSize,
	cartSubtotal,
	imageByHandle,
	onQuantityChange,
	onDelete,
	onCheckout,
}: CoolCartSheetProps) => {
	return (
		<Sheet open={isOpen} onOpenChange={onOpenChange}>
			<SheetTrigger asChild>
				<Button
					type="button"
					size="lg"
					className="fixed right-6 bottom-6 z-40 rounded-full px-5 shadow-lg"
				>
					<ShoppingCart className="h-4 w-4" />
					Cart
					<span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-semibold">
						{cartSize}
					</span>
				</Button>
			</SheetTrigger>

			<SheetContent side="right" className="w-full p-0 sm:max-w-md">
				<SheetHeader className="border-b">
					<SheetTitle>Cart ({cartSize})</SheetTitle>
				</SheetHeader>

				<div className="flex-1 overflow-y-auto p-4">
					<CoolCartList
						items={cartItems}
						imageByHandle={imageByHandle}
						onQuantityChange={onQuantityChange}
						onDelete={onDelete}
					/>
				</div>

				<SheetFooter className="border-t">
					<div className="flex w-full items-center justify-between">
						<div>
							<p className="text-xs text-muted-foreground">Subtotal</p>
							<p className="text-base font-semibold">
								{formatCurrency(cartSubtotal)}
							</p>
						</div>
						<Button
							type="button"
							disabled={cartSize === 0}
							onClick={onCheckout}
						>
							Proceed to checkout
						</Button>
					</div>
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
};
