"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { ProductData } from "@/lib/products/products";

interface OrdersTableProps {
	products: ProductData[];
}

const ITEMS_PER_PAGE = 10;

export function OrdersTable({ products }: OrdersTableProps) {
	const cart = useCart();
	const router = useRouter();
	const pathname = usePathname();
	const [currentPage, setCurrentPage] = React.useState(1);

	const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const endIndex = startIndex + ITEMS_PER_PAGE;
	const paginatedProducts = products.slice(startIndex, endIndex);

	// Track if products have been initialized
	const initializedRef = React.useRef<Set<number>>(new Set());
	const productsLengthRef = React.useRef<number>(0);

	// Initialize products in cart when component mounts or products length changes
	React.useEffect(() => {
		// If products length changed, reset the initialized set
		if (productsLengthRef.current !== products.length) {
			initializedRef.current.clear();
			productsLengthRef.current = products.length;
		}

		products.forEach((product, index) => {
			if (!initializedRef.current.has(index)) {
				cart.addItem(index, product);
				initializedRef.current.add(index);
			}
		});
		// Only depend on products.length to avoid array reference issues
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [products.length]);

	const getQuantity = (index: number): number => {
		const item = cart.getItem(index);
		return item?.quantity ?? 0;
	};

	const setQuantity = (index: number, qty: number) => {
		cart.updateQuantity(index, qty);
	};

	const incrementQuantity = (index: number) => {
		const currentQty = getQuantity(index);
		cart.updateQuantity(index, currentQty + 1);
	};

	const decrementQuantity = (index: number) => {
		const currentQty = getQuantity(index);
		cart.updateQuantity(index, Math.max(0, currentQty - 1));
	};

	const getTotal = (originalIndex: number): number => {
		const item = cart.getItem(originalIndex);
		const qty = item?.quantity ?? 0;
		const unitCost = products[originalIndex].unitCost;
		return qty * unitCost;
	};

	const handleCheckboxChange = (index: number) => {
		cart.toggleSelection(index);
	};

	const isSelected = (index: number): boolean => {
		const item = cart.getItem(index);
		return item?.selected ?? false;
	};

	const goToPage = (page: number) => {
		setCurrentPage(Math.max(1, Math.min(page, totalPages)));
	};

	return (
		<div className="mt-6">
			<div className="overflow-x-auto bg-stone-50/30">
				<table className="min-w-full border-separate border-spacing-y-2">
					<thead>
						<tr className="border-b-2 border-black">
							<th className="px-4 py-3 text-left text-sm font-normal text-gray-700 border-b-1 border-black">
								Item
							</th>
							<th className="px-4 py-3 text-left text-sm font-normal text-gray-700 border-b-1 border-black">
								Description
							</th>
							<th className="px-4 py-3 text-center text-sm font-normal text-gray-700 border-b-1 border-black">
								Quantity
							</th>
							<th className="px-4 py-3 text-right text-sm font-normal text-gray-700 border-b-1 border-black">
								Unit cost ($)
							</th>
							<th className="px-4 py-3 text-right text-sm font-normal text-gray-700 border-b-1 border-black">
								Total
							</th>
						</tr>
					</thead>
					<tbody>
						{paginatedProducts.map((product, paginatedIndex) => {
							// Use the original index from the full products array
							const originalIndex = startIndex + paginatedIndex;
							const quantity = getQuantity(originalIndex);
							const total = getTotal(originalIndex);
							const isFirstRow = paginatedIndex === 0;
							const isLastRow = paginatedIndex === paginatedProducts.length - 1;

							return (
								<tr key={originalIndex}>
									<td className="px-4 py-3 bg-orange-50 rounded-tl-2xl rounded-bl-2xl">
										<div className="flex items-center gap-3">
											<input
												type="checkbox"
												checked={isSelected(originalIndex)}
												onChange={() => handleCheckboxChange(originalIndex)}
												className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
											/>
											<span className="text-sm text-gray-900">
												{product.sku}
											</span>
										</div>
									</td>
									<td className="px-4 py-3 bg-orange-50">
										<span className="text-sm text-gray-700">
											{product.description}
										</span>
									</td>
									<td className="px-4 py-3 bg-orange-50">
										<div className="flex items-center justify-center gap-1.5">
											<Button
												type="button"
												variant="outline"
												size="sm"
												className="h-7 w-7 p-0 rounded border-gray-300 hover:bg-gray-100"
												onClick={() => decrementQuantity(originalIndex)}
												disabled={quantity === 0}
											>
												-
											</Button>
											<Input
												type="number"
												value={quantity || ""}
												onChange={(e) =>
													setQuantity(
														originalIndex,
														parseInt(e.target.value) || 0,
													)
												}
												className="h-8 w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
												min="0"
											/>
											<Button
												type="button"
												variant="outline"
												size="sm"
												className="h-7 w-7 p-0 rounded border-gray-300 hover:bg-gray-100"
												onClick={() => incrementQuantity(originalIndex)}
											>
												+
											</Button>
										</div>
									</td>
									<td className="px-4 py-3 bg-orange-50 text-right text-sm text-gray-900">
										{product.unitCost > 0 ? product.unitCost.toFixed(2) : "-"}
									</td>
									<td
										className={`px-4 py-3 bg-orange-50 text-right text-sm font-bold text-gray-900 ${isFirstRow ? "rounded-tr-md" : ""} ${isLastRow ? "rounded-br-md" : ""}`}
									>
										{total > 0 ? total.toFixed(2) : "0.00"}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{/* Pagination Controls */}
			{totalPages > 1 && (
				<div className="mt-4 flex items-center justify-between">
					<div className="text-sm text-gray-600">
						Showing {startIndex + 1} to {Math.min(endIndex, products.length)} of{" "}
						{products.length} products
					</div>
					<div className="flex items-center gap-2">
						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => goToPage(currentPage - 1)}
							disabled={currentPage === 1}
							className="h-8 px-3"
						>
							<ChevronLeft className="h-4 w-4" />
							<span className="ml-1">Previous</span>
						</Button>

						<div className="flex items-center gap-1">
							{Array.from({ length: totalPages }, (_, i) => i + 1).map(
								(page) => {
									// Show first page, last page, current page, and pages around current
									if (
										page === 1 ||
										page === totalPages ||
										(page >= currentPage - 1 && page <= currentPage + 1)
									) {
										return (
											<Button
												key={page}
												type="button"
												variant={currentPage === page ? "default" : "outline"}
												size="sm"
												onClick={() => goToPage(page)}
												className="h-8 w-8 p-0"
											>
												{page}
											</Button>
										);
									} else if (
										page === currentPage - 2 ||
										page === currentPage + 2
									) {
										return (
											<span key={page} className="px-2 text-gray-400">
												...
											</span>
										);
									}
									return null;
								},
							)}
						</div>

						<Button
							type="button"
							variant="outline"
							size="sm"
							onClick={() => goToPage(currentPage + 1)}
							disabled={currentPage === totalPages}
							className="h-8 px-3"
						>
							<span className="mr-1">Next</span>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				</div>
			)}

			{/* Checkout Button */}
			{cart.hasSelectedItems() && (
				<div className="mt-6 flex justify-end">
					<Button
						type="button"
						variant="default"
						size="lg"
						className="px-8 py-2 bg-primary text-primary-foreground hover:bg-primary/90"
						onClick={() => {
							const uuid = pathname?.split("/")[2];
							if (uuid) {
								router.push(`/dashboard/${uuid}/order/checkout`);
							}
						}}
					>
						Proceed to Checkout
					</Button>
				</div>
			)}
		</div>
	);
}
