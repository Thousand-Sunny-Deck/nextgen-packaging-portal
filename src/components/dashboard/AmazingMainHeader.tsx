"use client";

import { cn } from "@/lib/utils";
import ActiveOrderCard from "./ActiveOrderCard";
import RecentOrdersSection from "./RecentOrdersSection";
import OrderButton from "./OrderButton";

const heading = "text-xl md:text-2xl lg:text-4xl";

export type UserDetails = {
	name: string;
	email: string;
	orgId: string;
};

interface MainHeaderProps {
	userDetails: UserDetails;
	activeOrders: any[];
}

export const AmazingMainHeader = (props: MainHeaderProps) => {
	return (
		<>
			{/* OUTER CONTAINER - Contains everything */}
			<div className="space-y-8">
				{/* WELCOME HEADING - Large, bold, spans full width */}
				<div className="flex-none px-6 py-4">
					<p className={cn(heading, "text-gray-700")}>Welcome,</p>
					<p
						className={cn(
							heading,
							"font-semibold text-gray-900 flex items-center gap-2",
						)}
					>
						{props.userDetails.name ||
							props.userDetails.email ||
							props.userDetails.orgId}{" "}
						<span aria-hidden>📦</span>
					</p>
				</div>

				{/* MAIN GRID LAYOUT - Two columns for orders */}
				<div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
					{/* LEFT COLUMN - Fixed width ~400px */}
					<div className="flex flex-col gap-4">
						{/* CREATE ORDER BUTTON - Full width, prominent CTA */}
						<OrderButton />

						{/* ACTIVE ORDERS SECTION - Card with beige/cream background */}
						<div className="bg-orange-50 rounded-xl p-4">
							{/* Section header */}
							<h2 className="text-lg font-bold mb-6">Active</h2>

							{/* Order cards container - stacked vertically with spacing */}
							<div className="space-y-2">
								{props.activeOrders.length > 0 ? (
									props.activeOrders.map((order) => (
										<ActiveOrderCard
											key={order.id}
											orderNumber={order.orderNumber}
											price={order.price}
											status={order.status as "Order Placed" | "Processing"}
										/>
									))
								) : (
									/* Empty state */
									<div className="py-8 text-center">
										<p className="text-neutral-600 font-medium">
											No active orders
										</p>
										<p className="text-sm text-neutral-400 mt-1">
											Your current orders will appear here
										</p>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* RIGHT COLUMN - Takes remaining space, aligns top with left column */}
					<RecentOrdersSection />
				</div>
			</div>
		</>
	);
};
