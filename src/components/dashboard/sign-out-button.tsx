"use client";

import { useState } from "react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SignOutUser } from "@/actions/auth/sign-out-action";
import { toast } from "sonner";
import { LogOut } from "lucide-react";
import { useCartStore } from "@/lib/store/product-store";
import { useBillingInfoStore } from "@/lib/store/billing-info-store";
import { cn } from "@/lib/utils";

interface SignOutButtonProps {
	className?: string;
}

export function SignOutButton({ className }: SignOutButtonProps) {
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
			variant="ghost"
			size="sm"
			onClick={handleSignOut}
			disabled={isPending}
			className={cn(
				"text-gray-800 hover:bg-white/60 hover:text-gray-800",
				className,
			)}
		>
			<LogOut className="size-4" />
			Log Out
		</Button>
	);
}
