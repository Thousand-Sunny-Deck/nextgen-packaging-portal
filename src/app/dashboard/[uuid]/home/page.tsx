import PortalContent from "@/components/portal-content";
import { verifyOrgId } from "@/hooks/use-org-id";
import { getUserSession } from "@/hooks/use-session";
import { redirect, notFound } from "next/navigation";

interface PortalPageProps {
	params: Promise<{ uuid: string }>;
}

const PortalPage = async ({ params }: PortalPageProps) => {
	const { error, session } = await getUserSession();

	if (error) {
		redirect(error.getRedirectUrl());
	}

	if (!session) {
		redirect("/auth/login");
	}

	const slug = await params;
	const { error: orgIdError, orgId } = verifyOrgId(session, slug);

	if (orgIdError) {
		// User is authenticated but trying to access another user's dashboard
		// Redirect to their own dashboard or show 404
		notFound();
	}

	return (
		<>
			<PortalContent session={session} />
			<div>My uuid: {orgId}</div>
		</>
	);
};

export default PortalPage;
