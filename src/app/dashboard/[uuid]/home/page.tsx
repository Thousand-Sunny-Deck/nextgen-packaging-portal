import PortalContent from "@/components/portal-content";
import { auth } from "@/lib/config/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

interface PortalPageProps {
	params: Promise<{ uuid: string }>;
}

const ALLOWED_ORGS = ["7e14cd73-cff9-44ae-8463-ba7d6d4deb03"];

const PortalPage = async ({ params }: PortalPageProps) => {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session) {
		redirect("/auth/login");
	}

	const slug = await params;

	// need to update this to call the DB. This is mocked right now
	const validOrgId = ALLOWED_ORGS.includes(slug.uuid);
	if (!validOrgId) {
		// this means that we have a session because we are logged in to some user Id
		// but that doesn't mean we can just access any users dashboard
		return <div>Unauthorized</div>;
	}

	return (
		<>
			<PortalContent session={session} />
			<div>My uuid: {slug.uuid}</div>
		</>
	);
};

export default PortalPage;
