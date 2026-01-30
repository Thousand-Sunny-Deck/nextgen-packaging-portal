import { DashboardFooter } from "@/components/dashboard/DashboardFooter";
import { HashScrollHandler } from "@/components/dashboard/hash-scroll-handler";
import { WelcomeHeader } from "@/components/dashboard/WelcomeHeader";
import OrderButton from "@/components/dashboard/OrderButton";
import { verifyOrgId } from "@/hooks/use-org-id";
import { getUserSession, SessionType } from "@/hooks/use-session";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";
import ActiveOrdersServer from "@/components/dashboard/server/ActiveOrdersServer";
import RecentOrdersServer from "@/components/dashboard/server/RecentOrdersServer";
import AllInvoicesServer from "@/components/dashboard/server/AllInvoicesServer";
import ActiveOrdersSkeleton from "@/components/dashboard/skeletons/ActiveOrdersSkeleton";
import RecentOrdersSkeleton from "@/components/dashboard/skeletons/RecentOrdersSkeleton";
import AllInvoicesSkeleton from "@/components/dashboard/skeletons/AllInvoicesSkeleton";

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

	return (
		<div className="w-screen h-screen flex flex-col">
			<HashScrollHandler />
			{/* background image */}
			<div className="min-h-[20vh] w-full bg-gray-100"></div>
			{/* main content */}
			<div className="w-full flex flex-1 px-8 md:px-20 lg:px-32">
				{/* Welcome, active and recent orders component */}
				<div className="w-full flex flex-col p-1">
					<div className="space-y-8">
						<WelcomeHeader userDetails={userDetails} />

						{/* MAIN GRID LAYOUT - Two columns for orders */}
						<div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 items-start">
							{/* LEFT COLUMN - Fixed width ~400px */}
							<div className="flex flex-col gap-4">
								<OrderButton />
								<Suspense fallback={<ActiveOrdersSkeleton />}>
									<ActiveOrdersServer />
								</Suspense>
							</div>

							{/* RIGHT COLUMN - Takes remaining space */}
							<Suspense fallback={<RecentOrdersSkeleton />}>
								<RecentOrdersServer />
							</Suspense>
						</div>
					</div>
				</div>
			</div>
			{/* show orders and invoices table */}
			<div
				id="all-invoices"
				className="w-full bg-orange-50 flex flex-1 px-8 md:px-20 lg:px-32 mt-6"
			>
				<div className="w-full min-h-[200px] md:min-h-[450px] mb-24">
					<Suspense fallback={<AllInvoicesSkeleton />}>
						<AllInvoicesServer />
					</Suspense>
				</div>
			</div>

			{/* footer */}
			<DashboardFooter />
		</div>
	);
};

export default PortalPage;
