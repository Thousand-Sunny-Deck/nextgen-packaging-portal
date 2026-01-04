import { notFound, redirect } from "next/navigation";
import { getUserSession } from "@/hooks/use-session";
import { verifyOrgId } from "@/hooks/use-org-id";

import DynamicBreadcrumb from "@/components/dynamic-breadcrumbs";
import CartSummary from "@/components/checkout/cart-summary";
import CheckoutForm from "@/components/checkout/checkout-form";

interface CheckoutPageProps {
	params: Promise<{ uuid: string }>;
}

const OrdersPage = async ({ params }: CheckoutPageProps) => {
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

	return (
		<>
			<div className="ml-80 mt-15 w-7/12 h-full pb-20">
				<DynamicBreadcrumb />
				<p className="mt-15 text-3xl font-bold">Checkout</p>
				<p className="mt-1 text-sm text-gray-400">Review and confirm order.</p>

				{/* This is the main section */}

				<div className="w-full mt-10 flex justify-between gap-6">
					{/* Current Cart info*/}
					<CartSummary />
					{/* Summary Info and checkout */}
					<CheckoutForm />
				</div>
			</div>
		</>
	);
};

export default OrdersPage;
