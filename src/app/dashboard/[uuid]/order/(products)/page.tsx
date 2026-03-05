import { notFound, redirect } from "next/navigation";
import { getUserSession } from "@/hooks/use-session";
import { verifyOrgId } from "@/hooks/use-org-id";
import { fetchProductsForUser } from "@/actions/products/fetch-products-action";
import DynamicBreadcrumb from "@/components/dynamic-breadcrumbs";
import { CheckoutButton } from "@/components/CheckoutButton";
import { CatalogGrid } from "@/components/shop-grid/CatalogGrid";
import { CatalogPagination } from "@/components/shop-grid/CatalogPagination";
import { CatalogSearch } from "@/components/shop-grid/CatalogSearch";

interface OrdersPageProps {
	params: Promise<{ uuid: string }>;
	searchParams: Promise<{ q?: string }>;
}

const OrdersPage = async ({ params, searchParams }: OrdersPageProps) => {
	const { error, session } = await getUserSession();

	if (error) {
		redirect(error.getRedirectUrl());
	}

	if (!session) {
		redirect("/auth/login");
	}

	const [slug, { q }] = await Promise.all([params, searchParams]);
	const { error: orgIdError } = await verifyOrgId(session, slug);

	if (orgIdError) {
		notFound();
	}

	const products = await fetchProductsForUser(slug.uuid, q);

	return (
		<div className="flex justify-center mt-16 h-full pb-20 px-4 md:px-6">
			<div className="w-full md:w-11/12 lg:w-9/12 xl:w-8/12 max-w-7xl">
				<DynamicBreadcrumb />
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mt-5 mb-8">
					<div>
						<h1 className="text-2xl md:text-3xl">Quick Order</h1>
						<p className="mt-1 text-xs md:text-sm text-gray-400">
							Select desired quantity (max. 999) and proceed to checkout below.
						</p>
					</div>
					<CatalogSearch defaultValue={q} />
				</div>
				<CatalogGrid products={products} />
				<CatalogPagination
					page={1}
					totalPages={Math.ceil(products.length / 24)}
					total={products.length}
					pageSize={24}
				/>
				<CheckoutButton />
			</div>
		</div>
	);
};

export default OrdersPage;
