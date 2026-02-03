import { Suspense } from "react";
import { redirect, notFound } from "next/navigation";
import { getUserSession } from "@/hooks/use-session";
import { verifyOrgId } from "@/hooks/use-org-id";
import BillingInfoServer from "@/components/account/billing-info-server";
import BillingInfoSkeleton from "@/components/account/billing-info-skeleton";

interface AccountPageProps {
	params: Promise<{ uuid: string }>;
}

const AccountPage = async ({ params }: AccountPageProps) => {
	const { error, session } = await getUserSession();

	if (error) {
		redirect(error.getRedirectUrl());
	}

	if (!session) {
		redirect("/auth/login");
	}

	const slug = await params;
	const { error: orgIdError } = await verifyOrgId(session, slug);

	if (orgIdError) {
		notFound();
	}

	return (
		<div className="w-full min-h-screen bg-white">
			<div className="w-full px-8 md:px-20 lg:px-32 py-8 flex flex-col gap-8">
				<div className="flex flex-col gap-2">
					<h1 className="text-2xl font-bold text-slate-800">
						Account Settings
					</h1>
					<p className="text-sm font-light text-gray-500">
						Manage all your billing addresses here.
					</p>
				</div>

				<Suspense fallback={<BillingInfoSkeleton />}>
					<BillingInfoServer />
				</Suspense>
			</div>
		</div>
	);
};

export default AccountPage;
