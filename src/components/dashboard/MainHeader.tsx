"use client";

import { cn } from "@/lib/utils";
import OrderButton from "./OrderButton";
import ActiveOrders from "./ActiveOrders";
import RecentOrders from "./RecentOrders";

const heading = "text-xl md:text-2xl lg:text-4xl";

export type UserDetails = {
	name: string;
	email: string;
	orgId: string;
};

interface MainHeaderProps {
	userDetails: UserDetails;
	activeOrders: string[];
}

const MainHeader = (props: MainHeaderProps) => {
	return (
		<>
			<div className="w-full flex flex-col h-full gap-8">
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

				<div className="flex flex-1 gap-4 px-6">
					<div className="flex flex-col w-full lg:w-[250px] xl:w-[350px] gap-4">
						<OrderButton />
						<ActiveOrders
							userDetails={props.userDetails}
							activeOrders={props.activeOrders}
						/>
					</div>
					<div className="flex-1">
						<RecentOrders />
					</div>
				</div>
			</div>
		</>
	);
};

export default MainHeader;
