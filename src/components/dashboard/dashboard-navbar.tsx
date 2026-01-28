"use client";

import * as React from "react";
import { useState } from "react";
import { useParams, usePathname, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignOutUser } from "@/actions/auth/sign-out-action";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { useCartStore } from "@/lib/store/product-store";
import { useBillingInfoStore } from "@/lib/store/billing-info-store";

export function DashboardNavbar() {
	const [isPending, setIsPending] = useState<boolean>(false);
	const params = useParams<{ uuid: string }>();
	const pathname = usePathname();
	const { clearCart } = useCartStore();
	const { clearBillingInfo } = useBillingInfoStore();

	const uuid = params?.uuid;
	const isOnHomePage = pathname === `/dashboard/${uuid}/home`;

	const handleSignOutButton = async () => {
		setIsPending(true);

		const { error } = await SignOutUser();

		if (error) {
			setIsPending(false);
			toast.error(error);
		} else {
			clearCart();
			clearBillingInfo();
			redirect("/auth/login");
		}
	};

	const handleInvoicesClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
		if (isOnHomePage) {
			e.preventDefault();
			const element = document.getElementById("all-invoices");
			if (element) {
				element.scrollIntoView({ behavior: "smooth" });
			}
		}
	};

	return (
		<header className="fixed top-0 left-0 right-0 z-50 h-12 backdrop-blur bg-orange-50">
			<div className="grid h-full grid-cols-3 items-center px-4">
				{/* Left: Navigation Links */}
				<div className="flex gap-6 px-6">
					<Link
						href={`/dashboard/${uuid}/order`}
						className="px-4 py-1.5 text-sm font-medium text-gray-800 hover:bg-white/60 rounded-md transition-all"
					>
						Place Order
					</Link>
					<Link
						href={`/dashboard/${uuid}/home#all-invoices`}
						onClick={handleInvoicesClick}
						className="px-4 py-1.5 text-sm font-medium text-gray-800 hover:bg-white/60 rounded-md transition-all"
					>
						Invoices
					</Link>
				</div>

				{/* Center: Branding */}
				<Link href={`/dashboard/${uuid}/home`} className="text-center">
					<h2 className="text-lg font-bold tracking-wide hover:text-gray-600 transition-colors cursor-pointer">
						NEXTGEN PACKAGING
					</h2>
				</Link>

				{/* Right: LogOut Button */}
				<div className="flex justify-end">
					<Button
						variant="default"
						size="sm"
						onClick={handleSignOutButton}
						disabled={isPending}
						className="bg-white text-gray-800 hover:text-gray-200 rounded-md"
					>
						<LogOut />
						Log Out
					</Button>
				</div>
			</div>
		</header>
	);
}
