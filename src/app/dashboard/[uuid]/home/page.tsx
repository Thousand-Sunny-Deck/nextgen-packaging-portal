import PortalContent from "@/components/portal-content";
import { verifyOrgId } from "@/hooks/use-org-id";
import { getUserSession } from "@/hooks/use-session";
import { redirect } from "next/navigation";

interface PortalPageProps {
	params: Promise<{ uuid: string }>;
}

const PortalPage = async ({ params }: PortalPageProps) => {
	const { error, session } = await getUserSession();

	if (error) {
		redirect(error.getRedirectUrl());
	}

	const slug = await params;
	const { error: orgIdError, orgId } = verifyOrgId(session, slug);
	if (orgIdError) {
		// this means that we have a session because we are logged in to some user Id
		// but that doesn't mean we can just access any users dashboard
		return <div>Unauthorized</div>;
	}

	return (
		<>
			<PortalContent session={session} />
			<div>My uuid: {orgId}</div>
		</>
	);
};

export default PortalPage;
