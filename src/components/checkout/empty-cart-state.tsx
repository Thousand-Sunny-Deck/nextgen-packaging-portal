"use client";

import Link from "next/link";
import Image from "next/image";
import { useParams } from "next/navigation";

const EmptyCartState = () => {
	const params = useParams<{ uuid: string }>();
	const uuid = params?.uuid;

	return (
		<div className="flex-1 flex items-center justify-center p-8 mt-10">
			<div className="w-full max-w-md border-2 border-dashed border-gray-300 rounded-lg p-12 flex flex-col items-center justify-center text-center">
				<div className="mb-6">
					<Image
						src="/assets/empty-cart.png"
						alt="Empty cart"
						width={120}
						height={120}
						className="opacity-60"
					/>
				</div>
				<h3 className="text-lg font-semibold text-gray-700 mb-2">
					Your cart is empty
				</h3>
				<p className="text-sm text-gray-500 mb-6">
					Add some products to get started
				</p>
				<Link
					href={`/dashboard/${uuid}/order`}
					className="px-6 py-2 bg-orange-100 hover:bg-orange-200 font-md rounded-md transition-colors"
				>
					Browse Products
				</Link>
			</div>
		</div>
	);
};

export default EmptyCartState;
