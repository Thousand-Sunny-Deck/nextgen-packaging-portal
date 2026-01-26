import MainHeader from "@/components/dashboard/MainHeader";
import { verifyOrgId } from "@/hooks/use-org-id";
import { getUserSession, SessionType } from "@/hooks/use-session";
import { fetchActiveOrders } from "@/lib/dashboard/orders";
import { redirect, notFound } from "next/navigation";

interface PortalPageProps {
	params: Promise<{ uuid: string }>;
}

export const extractUserDetailsFromSession = (
	session: SessionType,
): {
	name: string;
	email: string;
	orgId: string;
} => {
	return {
		name: session.user.name,
		email: session.user.email,
		orgId: session.user.id,
	};
};

const PortalPage = async ({ params }: PortalPageProps) => {
	const { error, session } = await getUserSession();

	if (error) {
		redirect(error.getRedirectUrl());
	}

	if (!session) {
		redirect("/auth/login");
	}

	const slug = await params;
	const { error: orgIdError } = verifyOrgId(session, slug);

	if (orgIdError) {
		// User is authenticated but trying to access another user's dashboard
		// Redirect to their own dashboard or show 404
		notFound();
	}

	const userDetails = extractUserDetailsFromSession(session);
	const activeOrders = await fetchActiveOrders(userDetails.orgId);

	return (
		<div className="w-screen h-screen flex flex-col">
			{/* background image */}
			<div className="h-[20vh] w-full bg-gray-100"></div>
			{/* main content */}
			<div className="w-full flex flex-1 px-8 md:px-20 lg:px-32">
				{/* Welcome, active and recent orders component */}
				<div className="w-full flex flex-col p-1">
					<MainHeader userDetails={userDetails} activeOrders={activeOrders} />
				</div>
			</div>
			{/* show orders and invoices table */}
			<div className="w-full bg-orange-50 flex flex-1 px-8 md:px-20 lg:px-32 mt-6">
				<div className="w-full  flex"></div>
			</div>

			{/* footer */}
		</div>
	);
};

export default PortalPage;
