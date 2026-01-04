"use client";

import * as React from "react";
import { useCart } from "../../../../../../tmp/contexts/cart-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DynamicBreadcrumb from "@/components/dynamic-breadcrumbs";

function OrderProgress({ currentStep }: { currentStep: number }) {
	return (
		<div className="mb-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<div
						className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
							currentStep >= 1
								? "bg-black text-white"
								: "bg-gray-300 text-gray-600"
						}`}
					>
						1
					</div>
					<span
						className={`text-sm ${currentStep >= 1 ? "font-medium" : "text-gray-600"}`}
					>
						Review Order
					</span>
				</div>
				<div
					className={`h-0.5 flex-1 ${currentStep >= 2 ? "bg-black" : "bg-gray-300"}`}
				></div>
				<div className="flex items-center gap-2">
					<div
						className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
							currentStep >= 2
								? "bg-black text-white"
								: "bg-gray-300 text-gray-600"
						}`}
					>
						2
					</div>
					<span
						className={`text-sm ${currentStep >= 2 ? "font-medium" : "text-gray-600"}`}
					>
						Confirm details
					</span>
				</div>
				<div
					className={`h-0.5 flex-1 ${currentStep >= 3 ? "bg-black" : "bg-gray-300"}`}
				></div>
				<div className="flex items-center gap-2">
					<div
						className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
							currentStep >= 3
								? "bg-black text-white"
								: "bg-gray-300 text-gray-600"
						}`}
					>
						3
					</div>
					<span
						className={`text-sm ${currentStep >= 3 ? "font-medium" : "text-gray-600"}`}
					>
						Order Placement
					</span>
				</div>
			</div>
		</div>
	);
}

export default function CheckoutPage() {
	// this needs to be backed by session and org hooks. otherwise anyone with a session can put a random uuid and go in here.
	// small bug ^

	const cart = useCart();
	const [showBillingForm, setShowBillingForm] = React.useState(false);
	const [billingData, setBillingData] = React.useState({
		organisationName: "",
		billingAddress: "",
		abnNumber: "",
	});

	const selectedItems = cart.getSelectedItems();

	const getUnitCost = (priceStr: string): number => {
		const price = priceStr.replace(/[^0-9.]/g, "");
		return parseFloat(price) || 0;
	};

	const calculateSubtotal = (): number => {
		return selectedItems.reduce((sum, item) => {
			const unitCost = getUnitCost(item.product.price1);
			return sum + unitCost * item.quantity;
		}, 0);
	};

	const subtotal = calculateSubtotal();
	const shipping = 0;
	const tax = 0;
	const total = subtotal + shipping + tax;
	const totalItems = selectedItems.reduce(
		(sum, item) => sum + item.quantity,
		0,
	);

	if (selectedItems.length === 0) {
		return (
			<div className="ml-80 mt-15 w-7/12 h-full">
				<DynamicBreadcrumb />
				<div className="mt-8">
					<h1 className="text-4xl font-bold">Checkout</h1>
					<p className="mt-4 text-gray-600">
						No items selected. Please go back to orders to select items.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="ml-80 mt-15 w-7/12 h-full">
			<DynamicBreadcrumb />

			<div className="mt-8 grid grid-cols-3 gap-8">
				{/* Main Content - Left Section */}
				<div className="col-span-2">
					<h1 className="text-4xl font-bold">Checkout</h1>
					<p className="mt-2 text-gray-600">
						{showBillingForm
							? "Please provide your billing details."
							: "Review and confirm order."}
					</p>

					{/* Product List or Billing Form */}
					{!showBillingForm ? (
						<div className="mt-8 space-y-4">
							{selectedItems.map((item, index) => {
								const unitCost = getUnitCost(item.product.price1);
								const itemTotal = unitCost * item.quantity;

								return (
									<div
										key={index}
										className="flex items-start justify-between border-b border-gray-200 pb-4"
									>
										<div className="flex-1">
											<h3 className="text-md font-medium text-gray-900">
												{item.product.sku}
											</h3>
											<p className="mt-1 text-xs text-gray-500">
												{item.product.description ||
													"XXXXXXXXXXXXXXXXXXXXXXXXXXX"}
											</p>
										</div>
										<div className="ml-4 flex items-center gap-8">
											<div className="text-xs text-gray-600">
												Qty: {item.quantity}
											</div>
											<div className="text-md font-medium text-gray-900">
												${itemTotal.toFixed(2)}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					) : (
						<div className="mt-8">
							<form className="space-y-6">
								<div className="space-y-2">
									<Label htmlFor="organisationName">Organisation Name</Label>
									<Input
										id="organisationName"
										type="text"
										placeholder="Enter organisation name"
										value={billingData.organisationName}
										onChange={(e) =>
											setBillingData({
												...billingData,
												organisationName: e.target.value,
											})
										}
										className="w-full"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="billingAddress">Billing Address</Label>
									<Input
										id="billingAddress"
										type="text"
										placeholder="Enter billing address"
										value={billingData.billingAddress}
										onChange={(e) =>
											setBillingData({
												...billingData,
												billingAddress: e.target.value,
											})
										}
										className="w-full"
									/>
								</div>

								<div className="space-y-2">
									<Label htmlFor="abnNumber">ABN Number</Label>
									<Input
										id="abnNumber"
										type="text"
										placeholder="Enter ABN number"
										value={billingData.abnNumber}
										onChange={(e) =>
											setBillingData({
												...billingData,
												abnNumber: e.target.value,
											})
										}
										className="w-full"
									/>
								</div>
							</form>
						</div>
					)}
				</div>

				{/* Right Section - Order Summary */}
				<div className="col-span-1">
					<OrderProgress currentStep={showBillingForm ? 2 : 1} />

					{/* Order Summary Box */}
					<div className="rounded-lg border border-gray-300 bg-white p-6">
						<div className="mb-6 flex items-center justify-between">
							<h2 className="text-lg font-bold">Order Summary</h2>
							<span className="text-sm text-gray-600">
								{totalItems} Item(s)
							</span>
						</div>

						<div className="space-y-4 border-t border-gray-200 pt-4">
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Subtotal</span>
								<span className="font-medium">${subtotal.toFixed(2)}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Shipping</span>
								<span className="font-medium">${shipping.toFixed(2)}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Tax</span>
								<span className="font-medium">${tax.toFixed(2)}</span>
							</div>
							<div className="flex justify-between border-t border-gray-200 pt-4 text-base">
								<span className="font-bold">Total</span>
								<span className="font-bold">${total.toFixed(2)}</span>
							</div>
						</div>

						<Button
							type="button"
							variant="default"
							size="lg"
							className="mt-6 w-full bg-black text-white hover:bg-gray-800"
							onClick={() => {
								if (!showBillingForm) {
									setShowBillingForm(true);
								} else {
									// TODO: Handle order placement
									console.log("Place Order", {
										selectedItems,
										billingData,
									});
								}
							}}
						>
							{showBillingForm ? "Checkout" : "Confirm Details"}
						</Button>

						{showBillingForm && (
							<Button
								type="button"
								variant="outline"
								size="sm"
								className="mt-3 w-full"
								onClick={() => setShowBillingForm(false)}
							>
								Back
							</Button>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
