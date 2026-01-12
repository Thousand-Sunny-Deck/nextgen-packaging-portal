"use client";

import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import type { Order } from "@/generated/prisma/client";

interface OrdersListProps {
	orders: Order[];
	userId: string;
}

export default function OrdersList({ orders, userId }: OrdersListProps) {
	const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);

	const handleViewPDF = async (orderId: string) => {
		setLoadingOrderId(orderId);
		try {
			const response = await fetch("/api/pdf", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					userId,
					orderId,
				}),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.message || "Failed to generate PDF");
			}

			// Get the PDF blob
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);

			// Open PDF in new tab
			const newWindow = window.open(url, "_blank");
			if (!newWindow) {
				toast.error("Please allow pop-ups to view the PDF");
			}

			// Clean up the URL after a delay
			setTimeout(() => {
				window.URL.revokeObjectURL(url);
			}, 100);
		} catch (error) {
			console.error("Error generating PDF:", error);
			toast.error(
				error instanceof Error ? error.message : "Failed to generate PDF",
			);
		} finally {
			setLoadingOrderId(null);
		}
	};

	if (orders.length === 0) {
		return (
			<div className="text-gray-500 text-center py-8">
				No orders found. Create your first order to get started.
			</div>
		);
	}

	return (
		<div className="space-y-4">
			<h2 className="text-2xl font-semibold mb-4">Your Orders</h2>
			<div className="space-y-3">
				{orders.map((order) => (
					<div
						key={order.id}
						className="border rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
					>
						<div className="flex-1">
							<div className="flex items-center gap-4">
								<span className="font-semibold">{order.orderId}</span>
								<span
									className={`px-2 py-1 rounded text-xs ${
										order.status === "COMPLETED"
											? "bg-green-100 text-green-800"
											: order.status === "PENDING"
												? "bg-yellow-100 text-yellow-800"
												: order.status === "PROCESSING"
													? "bg-blue-100 text-blue-800"
													: "bg-red-100 text-red-800"
									}`}
								>
									{order.status}
								</span>
							</div>
							<div className="text-sm text-gray-600 mt-1">
								{order.createdAt instanceof Date
									? order.createdAt.toLocaleDateString()
									: new Date(order.createdAt).toLocaleDateString()}{" "}
								• ${order.totalOrderCost.toFixed(2)}
							</div>
						</div>
						<Button
							onClick={() => handleViewPDF(order.orderId)}
							disabled={loadingOrderId === order.orderId}
							variant="outline"
						>
							{loadingOrderId === order.orderId ? "Loading..." : "View PDF"}
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}
