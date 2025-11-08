import PortalContent from "@/components/portal-content";
import { auth } from "@/lib/config/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

const PortalPage = async () => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/entry");
	}

	return <PortalContent session={session} />;
};

export default PortalPage;
