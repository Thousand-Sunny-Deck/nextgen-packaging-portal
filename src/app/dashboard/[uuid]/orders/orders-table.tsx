"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ProductRow } from "./page";

interface OrdersTableProps {
	products: ProductRow[];
}

const ITEMS_PER_PAGE = 10;

export function OrdersTable({ products }: OrdersTableProps) {
	const [quantities, setQuantities] = React.useState<Record<number, number>>(
		{},
	);
	const [currentPage, setCurrentPage] = React.useState(1);

	const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
	const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
	const endIndex = startIndex + ITEMS_PER_PAGE;
	const paginatedProducts = products.slice(startIndex, endIndex);

	const getUnitCost = (product: ProductRow): number => {
		// Extract numeric value from price1 (e.g., "$43.75" -> 43.75)
		const priceStr = product.price1.replace(/[^0-9.]/g, "");
		return parseFloat(priceStr) || 0;
	};

	const getQuantity = (index: number): number => {
		return quantities[index] ?? 0;
	};

	const setQuantity = (index: number, qty: number) => {
		setQuantities((prev) => ({
			...prev,
			[index]: Math.max(0, qty),
		}));
	};

	const incrementQuantity = (index: number) => {
		setQuantity(index, getQuantity(index) + 1);
	};

	const decrementQuantity = (index: number) => {
		setQuantity(index, getQuantity(index) - 1);
	};

	const getTotal = (originalIndex: number): number => {
		const qty = getQuantity(originalIndex);
		const unitCost = getUnitCost(products[originalIndex]);
		return qty * unitCost;
	};

	const goToPage = (page: number) => {
		setCurrentPage(Math.max(1, Math.min(page, totalPages)));
	};

	return (
		<div className="mt-6">
			<div className="overflow-x-auto rounded-lg border border-gray-200 bg-stone-50/30">
				<table className="min-w-full border-collapse">
					<thead>
						<tr className="border-b border-gray-200">
							<th className="px-4 py-3 text-left text-sm font-normal text-gray-700">
								Item
							</th>
							<th className="px-4 py-3 text-left text-sm font-normal text-gray-700">
								Description
							</th>
							<th className="px-4 py-3 text-center text-sm font-normal text-gray-700">
								Quantity
							</th>
							<th className="px-4 py-3 text-right text-sm font-normal text-gray-700">
								Unit cost ($)
							</th>
							<th className="px-4 py-3 text-right text-sm font-normal text-gray-700">
								Total
							</th>
						</tr>
					</thead>
					<tbody>
						{paginatedProducts.map((product, paginatedIndex) => {
							// Use the original index from the full products array
							const originalIndex = startIndex + paginatedIndex;
							const unitCost = getUnitCost(product);
							const quantity = getQuantity(originalIndex);
							const total = getTotal(originalIndex);

							return (
								<tr
									key={originalIndex}
									className="border-b border-gray-200/50 bg-white/40 last:border-b-0"
								>
									<td className="px-4 py-3">
										<div className="flex items-center gap-3">
											<input
												type="checkbox"
												className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
											/>
											<span className="text-sm text-gray-900">
												{product.sku}
											</span>
										</div>
									</td>
									<td className="px-4 py-3">
										<span className="text-sm text-gray-700">
											{product.description}
										</span>
									</td>
									<td className="px-4 py-3">
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
									<td className="px-4 py-3 text-right text-sm text-gray-900">
										{unitCost > 0 ? unitCost.toFixed(2) : "-"}
									</td>
									<td className="px-4 py-3 text-right text-sm font-bold text-gray-900">
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
		</div>
	);
}
