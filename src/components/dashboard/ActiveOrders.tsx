"use client";

import { UserDetails } from "./MainHeader";

interface ActiveOrdersProps {
	userDetails: UserDetails;
	activeOrders: string[];
}

const ActiveOrders = (props: ActiveOrdersProps) => {
	return (
		<div className="w-full bg-orange-50 border-none rounded-lg flex flex-col gap-2">
			<div className="w-full items-start px-4 py-2">
				<p className="text-lg font-bold">Active</p>
			</div>
			{props.activeOrders.map((order, index) => (
				<div key={index} className="px-4 py-2">
					<p>{order}</p>
				</div>
			))}
		</div>
	);
};

export default ActiveOrders;
