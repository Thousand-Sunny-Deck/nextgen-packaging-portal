import PortalContent from "@/components/portal-content";
import { auth } from "@/lib/config/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface PortalPageProps {
	params: Promise<{ uuid: string }>;
}

const PortalPage = async ({ params }: PortalPageProps) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/entry");
	}

	const slug = await params;

	return (
		<>
			<PortalContent session={session} />
			<div>My uuid: {slug.uuid}</div>
		</>
	);
};

export default PortalPage;
