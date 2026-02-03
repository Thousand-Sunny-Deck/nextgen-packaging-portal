"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignOutUser } from "@/actions/auth/sign-out-action";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { useCartStore } from "@/lib/store/product-store";
import { useBillingInfoStore } from "@/lib/store/billing-info-store";

export function SignOutButton() {
	const [isPending, setIsPending] = useState<boolean>(false);
	const { clearCart } = useCartStore();
	const { clearBillingInfo } = useBillingInfoStore();

	const handleSignOut = async () => {
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

	return (
		<Button
			variant="default"
			size="sm"
			onClick={handleSignOut}
			disabled={isPending}
			className="bg-white text-gray-800 hover:text-gray-200 rounded-md"
		>
			<LogOut />
			Log Out
		</Button>
	);
}
