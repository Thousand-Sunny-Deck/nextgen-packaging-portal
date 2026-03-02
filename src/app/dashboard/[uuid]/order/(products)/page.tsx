import { notFound, redirect } from "next/navigation";
import { getUserSession } from "@/hooks/use-session";
import { verifyOrgId } from "@/hooks/use-org-id";
import {
	fetchCatalog,
	fetchProductsForUser,
	ProductData,
} from "@/actions/products/fetch-products-action";
import { getFeatureFlags } from "@/lib/feature-flags";
import DynamicBreadcrumb from "@/components/dynamic-breadcrumbs";
import ProductTable from "@/components/dynamic-table/product-table";
import { CheckoutButton } from "@/components/CheckoutButton";
import { Suspense } from "react";
import Loading from "./loading";
import { CatalogGrid } from "@/components/shop-grid/CatalogGrid";

interface OrdersPageProps {
	params: Promise<{ uuid: string }>;
	searchParams: Promise<{ q?: string; page?: string; pageSize?: string }>;
}

const OrdersPage = async ({ params, searchParams }: OrdersPageProps) => {
	const { error, session } = await getUserSession();

	if (error) {
		redirect(error.getRedirectUrl());
	}

	if (!session) {
		redirect("/auth/login");
	}

	const [slug, { q, page, pageSize }] = await Promise.all([
		params,
		searchParams,
	]);
	const { error: orgIdError } = await verifyOrgId(session, slug);

	if (orgIdError) {
		notFound();
	}

	const flags = getFeatureFlags(slug.uuid);
	const isCatalogV2Enabled = flags.catalogV2;
	let products: ProductData[];

	if (isCatalogV2Enabled) {
		const result = await fetchCatalog({
			search: q,
			page: page ? Number(page) : undefined,
			pageSize: pageSize ? Number(pageSize) : undefined,
		});
		products = result.items;
	} else {
		products = await fetchProductsForUser(session.user.id);
	}

	return (
		<div className="flex justify-center mt-16 h-full pb-20 px-4 md:px-6">
			<div className="w-full md:w-11/12 lg:w-9/12 xl:w-8/12 max-w-7xl">
				<DynamicBreadcrumb />
				<h1 className="mt-5 text-2xl md:text-3xl">Orders</h1>
				<h1 className="mt-1 text-xs md:text-sm text-gray-400">
					Select desired quantity (max. 999) and proceed to checkout below.
				</h1>
				<Suspense fallback={<Loading />}>
					{isCatalogV2Enabled ? (
						<CatalogGrid products={products} />
					) : (
						<ProductTable products={products} />
					)}
				</Suspense>
				<CheckoutButton />
			</div>
		</div>
	);
};

export default OrdersPage;
