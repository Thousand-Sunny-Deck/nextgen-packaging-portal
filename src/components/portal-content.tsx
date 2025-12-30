"use client";

import { BetterAuthSessionModel as Session } from "@/lib/schemas/auth";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "./ui/button";

interface PortalContentProps {
	session: Session;
}

const PortalContent = ({ session }: PortalContentProps) => {
	const [isPending] = useState<boolean>(false);
	const router = useRouter();
	const pathname = usePathname();

	return (
		<div className="px-7 py-16 container mx-auto max-w-screen space-y-8">
			<pre className="text-smm overflow-clip">
				{JSON.stringify(session, null, 2)}
			</pre>
			<Button
				type="button"
				onClick={() => {
					// expected: /dashboard/[uuid]/home
					const uuid = pathname?.split("/")[2];
					if (!uuid) return;
					router.push(`/dashboard/${uuid}/orders`);
				}}
				disabled={isPending}
			>
				Orders
			</Button>
		</div>
	);
};

export default PortalContent;
