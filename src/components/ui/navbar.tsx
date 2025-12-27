import * as React from "react";
import { Button } from "./button";
import { useState } from "react";
import { SignOutUser } from "@/actions/auth/sign-out-action";
import { redirect } from "next/navigation";
import { toast } from "sonner";
import { LogOut } from "lucide-react";

export function Navbar() {
	const [isPending, setIsPending] = useState<boolean>(false);

	const handleSignOutButton = async () => {
		setIsPending(true);
		const { error } = await SignOutUser();

		if (error) {
			setIsPending(false);
			toast.error(error);
		} else {
			redirect("/auth/login");
		}
	};

	return (
		<header className="fixed top-0 left-0 right-0 z-50 h-12 backdrop-blur bg-orange-50">
			<div className="grid h-full grid-cols-3 items-center px-4">
				<div />
				<h2 className="text-center text-lg font-bold tracking-wide">
					NEXTGEN PACKAGING
				</h2>
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
