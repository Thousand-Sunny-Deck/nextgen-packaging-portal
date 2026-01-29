import { AmazingMainHeader } from "@/components/dashboard/AmazingMainHeader";
import AllInvoices from "@/components/dashboard/AllInvoices";
import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { HashScrollHandler } from "@/components/dashboard/hash-scroll-handler";
import { verifyOrgId } from "@/hooks/use-org-id";
import { getUserSession, SessionType } from "@/hooks/use-session";
import { redirect, notFound } from "next/navigation";
import { fetchOrdersForUser } from "@/actions/order-delivery/fetch-orders-action";
// import { getActiveOrdersFromInvoices } from "@/app/api/orders/utils";
import { Invoice } from "@/components/dynamic-table/invoices/columns";
import { ACTIVE_ORDERS } from "@/lib/mock-data/temp";

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

	// Fetch orders from API
	const ordersResponse = await fetchOrdersForUser();
	const invoices: Invoice[] = ordersResponse.ok ? ordersResponse.data : [];
	// const activeOrders = getActiveOrdersFromInvoices(invoices);

	return (
		<div className="w-screen h-screen flex flex-col">
			<HashScrollHandler />
			{/* background image */}
			<div className="min-h-[20vh] w-full bg-gray-100"></div>
			{/* main content */}
			<div className="w-full flex flex-1 px-8 md:px-20 lg:px-32">
				{/* Welcome, active and recent orders component */}
				<div className="w-full flex flex-col p-1">
					<AmazingMainHeader
						userDetails={userDetails}
						activeOrders={ACTIVE_ORDERS}
					/>
				</div>
			</div>
			{/* show orders and invoices table */}
			<div
				id="all-invoices"
				className="w-full bg-orange-50 flex flex-1 px-8 md:px-20 lg:px-32 mt-6"
			>
				<div className="w-full min-h-[200px] md:min-h-[450px] mb-24">
					{/* my amazing table */}
					<AllInvoices invoices={invoices} />
				</div>
			</div>

			{/* footer */}
			<DashboardFooter />
		</div>
	);
};

export default PortalPage;
