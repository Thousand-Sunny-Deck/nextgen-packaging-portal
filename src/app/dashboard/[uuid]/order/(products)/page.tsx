import { notFound, redirect } from "next/navigation";
import { getUserSession } from "@/hooks/use-session";
import { verifyOrgId } from "@/hooks/use-org-id";
import { fetchProductsForUser } from "@/actions/products/fetch-products-action";
import DynamicBreadcrumb from "@/components/dynamic-breadcrumbs";
import ProductTable from "@/components/dynamic-table/product-table";
import { CheckoutButton } from "@/components/CheckoutButton";
import { Suspense } from "react";
import Loading from "./loading"; // Import the loading component

interface OrdersPageProps {
	params: Promise<{ uuid: string }>;
}

const OrdersPage = async ({ params }: OrdersPageProps) => {
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

	const products = await fetchProductsForUser(session.user.id);

	return (
		<div className="flex justify-center mt-16 h-full pb-20 px-4 md:px-6">
			<div className="w-full md:w-11/12 lg:w-9/12 xl:w-8/12 max-w-7xl">
				<DynamicBreadcrumb />
				<h1 className="mt-5 text-2xl md:text-3xl">Orders</h1>
				<h1 className="mt-1 text-xs md:text-sm text-gray-400">
					Select desired quantity (max. 999) and proceed to checkout below.
				</h1>
				<Suspense fallback={<Loading />}>
					<ProductTable products={products} />
				</Suspense>
				<CheckoutButton />
			</div>
		</div>
	);
};

export default OrdersPage;
