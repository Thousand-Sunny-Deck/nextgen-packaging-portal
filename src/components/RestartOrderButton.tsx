"use client";

import { useState, useEffect, useRef } from "react";
import { useCartStore } from "@/lib/store/product-store";
import { useBillingInfoStore } from "@/lib/store/billing-info-store";
import { Button } from "@/components/ui/button";
import { RotateCcw, X } from "lucide-react";
import { toast } from "sonner";

export function RestartOrderButton() {
	const [isOpen, setIsOpen] = useState(false);
	const modalRef = useRef<HTMLDivElement>(null);
	const { clearCart, maybeSelectedProducts } = useCartStore();
	const { clearBillingInfo, hasBillingInfo } = useBillingInfoStore();

	// Disable button if cart is empty and no billing info
	const hasCartItems = maybeSelectedProducts.size > 0;
	const hasBilling = hasBillingInfo();
	const isDisabled = !hasCartItems && !hasBilling;

	const handleRestartOrder = () => {
		clearCart();
		clearBillingInfo();
		toast.success("Order cleared successfully");
		setIsOpen(false);
	};

	const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (e.target === e.currentTarget) {
			setIsOpen(false);
		}
	};

	// Close modal on Escape key
	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isOpen) {
				setIsOpen(false);
			}
		};

		if (isOpen) {
			document.addEventListener("keydown", handleEscape);
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("keydown", handleEscape);
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	return (
		<>
			<Button
				variant="outline"
				size="sm"
				className="gap-2"
				onClick={() => setIsOpen(true)}
				disabled={isDisabled}
			>
				<RotateCcw className="h-4 w-4" />
				<span className="hidden sm:inline">Restart Order</span>
			</Button>

			{isOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs"
					onClick={handleBackdropClick}
				>
					<div
						ref={modalRef}
						className="relative bg-white rounded-lg shadow-lg w-full max-w-md mx-4 p-6 animate-in fade-in zoom-in-95 duration-200"
					>
						<button
							onClick={() => setIsOpen(false)}
							className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100"
						>
							<X className="h-4 w-4" />
							<span className="sr-only">Close</span>
						</button>

						<div className="space-y-4">
							<div className="space-y-2">
								<h2 className="text-lg font-semibold">Restart Order?</h2>
								<p className="text-sm text-gray-600">
									This will clear all selected products, quantities, and billing
									information. This action cannot be undone.
								</p>
							</div>

							<div className="flex justify-end gap-3 pt-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setIsOpen(false)}
								>
									Cancel
								</Button>
								<Button
									size="sm"
									onClick={handleRestartOrder}
									className="bg-red-600 hover:bg-red-700"
								>
									Clear Everything
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
