import { SignOutButton } from "@/components/sign-out-button";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const PortalPage = async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/entry");
	}

	return (
		<div className="px-7 py-16 container mx-auto max-w-screen space-y-8">
			<pre className="text-smm overflow-clip">
				{JSON.stringify(session, null, 2)}
			</pre>

			<SignOutButton />
		</div>
	);
};

export default PortalPage;
