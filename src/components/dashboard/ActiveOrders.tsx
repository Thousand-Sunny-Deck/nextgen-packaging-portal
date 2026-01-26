"use client";

import ActiveOrderBox from "./ActiveOrderBox";
import { UserDetails } from "./MainHeader";

interface ActiveOrdersProps {
	userDetails: UserDetails;
	activeOrders: string[];
}

const ActiveOrders = (props: ActiveOrdersProps) => {
	return (
		<div className="w-full bg-orange-50 border-none rounded-lg flex flex-col gap-1 pt-2 pb-4 px-2">
			<div className="w-full items-start px-4 py-2">
				<p className="text-lg font-bold">Active</p>
			</div>
			<div className="px-2 gap-2 flex flex-col">
				{props.activeOrders.map((order, index) => {
					return <ActiveOrderBox key={order + index} />;
				})}
			</div>
		</div>
	);
};

export default ActiveOrders;
