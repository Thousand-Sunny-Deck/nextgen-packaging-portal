import PortalContent from "@/components/portal-content";
import { verifyOrgId } from "@/hooks/use-org-id";
import { getUserSession } from "@/hooks/use-session";
// import { fetchOrdersForUser } from "@/lib/store/orders-store";
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

	// Fetch orders for the user
	// const orders = await fetchOrdersForUser(session.user.id);

	return (
		<>
			<PortalContent session={session} />
			{/* <div className="px-7 py-16 container mx-auto max-w-screen">
				<OrdersList orders={orders} userId={session.user.id} />
			</div> */}
			<div>myuuid: {orgId}</div>
		</>
	);
};

export default PortalPage;
