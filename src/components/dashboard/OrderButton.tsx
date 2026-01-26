"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const OrderButton = () => {
	const pathname = usePathname();
	const orderRoute = pathname.replace("home", "order");

	return (
		<Link href={orderRoute}>
			<button className="w-full bg-white border-2 border-gray-200 rounded-lg px-6 py-4 flex items-center justify-center gap-2 text-gray-900 font-semibold text-md hover:border-gray-300	hover:bg-gray-50 active:scale-[0.98] transition-all duration-150">
				<span className="text-lg font-semibold">+</span>
				<span>Create Order</span>
			</button>
		</Link>
	);
};

export default OrderButton;
