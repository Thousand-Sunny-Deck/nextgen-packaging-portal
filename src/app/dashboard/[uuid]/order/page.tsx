import { notFound, redirect } from "next/navigation";
import { getUserSession } from "@/hooks/use-session";
import { verifyOrgId } from "@/hooks/use-org-id";
import { fetchProducts } from "@/lib/products/products";
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
	const { error: orgIdError } = verifyOrgId(session, slug);

	if (orgIdError) {
		notFound();
	}

	const products = await fetchProducts(); // This is the slow part

	return (
		<div className="ml-80 mt-15 w-7/12 h-full pb-20">
			<DynamicBreadcrumb />
			<h1 className="mt-5 text-3xl">Orders</h1>
			<h1 className="mt-1 text-xs text-gray-400">
				Select desired quantity (max. 999) and proceed to checkout below.
			</h1>
			<Suspense fallback={<Loading />}>
				<ProductTable products={products} />
			</Suspense>
			<CheckoutButton />
		</div>
	);
};

export default OrdersPage;
