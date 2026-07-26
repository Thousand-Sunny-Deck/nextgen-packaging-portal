import { notFound, redirect } from "next/navigation";
import { getUserSession } from "@/hooks/use-session";
import { verifyOrgId } from "@/hooks/use-org-id";
import {
	fetchEntitledProducts,
	fetchQuickOrderCategories,
	resolveShopCategoryByHandle,
} from "@/actions/products/fetch-products-action";
import DynamicBreadcrumb from "@/components/dynamic-breadcrumbs";
import { CatalogGrid } from "@/components/shop-grid/CatalogGrid";
import { CatalogSearch } from "@/components/shop-grid/CatalogSearch";
import { CategorySelect } from "@/components/shop-grid/CategorySelect";

interface OrdersPageProps {
	params: Promise<{ uuid: string }>;
	searchParams: Promise<{
		q?: string;
		category?: string;
	}>;
}

const OrdersPage = async ({ params, searchParams }: OrdersPageProps) => {
	const { error, session } = await getUserSession();

	if (error) {
		redirect(error.getRedirectUrl());
	}

	if (!session) {
		redirect("/auth/login");
	}

	const [slug, { q, category }] = await Promise.all([params, searchParams]);
	const { error: orgIdError } = await verifyOrgId(session, slug);

	if (orgIdError) {
		notFound();
	}

	const orderBasePath = `/dashboard/${slug.uuid}/order`;

	const categories = await fetchQuickOrderCategories({ userId: slug.uuid });

	// Resolve the selected category; stale or invalid links fall back to all
	// products.
	const resolvedCategory = category
		? await resolveShopCategoryByHandle(category)
		: null;

	if (category && !resolvedCategory) {
		redirect(orderBasePath);
	}

	const result = await fetchEntitledProducts({
		userId: slug.uuid,
		search: q,
		categoryId: resolvedCategory?.id,
	});

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
					<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
						{categories.length > 0 && (
							<CategorySelect
								categories={categories}
								selectedHandle={resolvedCategory?.handle}
							/>
						)}
						<CatalogSearch defaultValue={q} />
					</div>
				</div>
				<CatalogGrid
					products={result.items}
					emptyMessage={
						resolvedCategory ? "No products found in this category." : undefined
					}
				/>
			</div>
		</div>
	);
};

export default OrdersPage;
