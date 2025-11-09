"use client";

import { SignOutUser } from "@/actions/auth/sign-out-action";
import { BetterAuthSessionModel as Session } from "@/lib/schemas/auth";
import { redirect } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";

interface PortalContentProps {
	session: Session;
}

const PortalContent = ({ session }: PortalContentProps) => {
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
		<div className="px-7 py-16 container mx-auto max-w-screen space-y-8">
			<pre className="text-smm overflow-clip">
				{JSON.stringify(session, null, 2)}
			</pre>
			<Button type="button" onClick={handleSignOutButton} disabled={isPending}>
				Log out
			</Button>
		</div>
	);
};

export default PortalContent;
