import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getUserSession } from "@/hooks/use-session";
import { verifyOrgId } from "@/hooks/use-org-id";
import {
	fetchNonEntitledCatalogProducts,
	fetchShopCategories,
	resolveShopCategoryByHandle,
} from "@/actions/products/fetch-products-action";
import { CatalogGrid } from "@/components/shop-grid/CatalogGrid";
import { CatalogPagination } from "@/components/shop-grid/CatalogPagination";
import { CatalogSearch } from "@/components/shop-grid/CatalogSearch";
import { CategoryGrid } from "@/components/shop-grid/CategoryGrid";
import DynamicBreadcrumb from "@/components/dynamic-breadcrumbs";

interface ShopPageProps {
	params: Promise<{ uuid: string }>;
	searchParams: Promise<{
		q?: string;
		page?: string;
		pageSize?: string;
		category?: string;
	}>;
}

const ShopPage = async ({ params, searchParams }: ShopPageProps) => {
	const { error, session } = await getUserSession();

	if (error) {
		redirect(error.getRedirectUrl());
	}

	if (!session) {
		redirect("/auth/login");
	}

	const [slug, { q, page, pageSize, category }] = await Promise.all([
		params,
		searchParams,
	]);

	const { error: orgIdError } = await verifyOrgId(session, slug);

	if (orgIdError) {
		notFound();
	}

	const shopBasePath = `/dashboard/${slug.uuid}/shop`;

	// Landing view: no category selected → show the category tiles.
	if (!category) {
		const categories = await fetchShopCategories({ userId: slug.uuid });

		return (
			<div className="flex justify-center mt-16 h-full pb-20 px-4 md:px-6">
				<div className="w-full md:w-11/12 lg:w-9/12 xl:w-8/12 max-w-7xl">
					<DynamicBreadcrumb />
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mt-5 mb-8">
						<div>
							<h1 className="text-2xl md:text-3xl">Shop</h1>
							<p className="mt-1 text-xs md:text-sm text-gray-400">
								Choose a category to browse available products.
							</p>
						</div>
					</div>
					<CategoryGrid
						categories={categories}
						basePath={shopBasePath}
						emptyMessage="No categories available yet. Check back soon."
					/>
				</div>
			</div>
		);
	}

	// Drill-down view: a category is selected → show its products.
	const resolvedCategory = await resolveShopCategoryByHandle(category);

	if (!resolvedCategory) {
		// Stale or invalid category link → fall back to the landing view.
		redirect(shopBasePath);
	}

	const result = await fetchNonEntitledCatalogProducts({
		userId: slug.uuid,
		search: q,
		categoryId: resolvedCategory.id,
		page: page ? Number(page) : undefined,
		pageSize: pageSize ? Number(pageSize) : undefined,
	});

	return (
		<div className="flex justify-center mt-16 h-full pb-20 px-4 md:px-6">
			<div className="w-full md:w-11/12 lg:w-9/12 xl:w-8/12 max-w-7xl">
				<DynamicBreadcrumb />
				<Link
					href={shopBasePath}
					className="mt-5 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-800"
				>
					<ArrowLeft className="h-4 w-4" />
					All categories
				</Link>
				<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mt-3 mb-8">
					<div>
						<h1 className="text-2xl md:text-3xl">{resolvedCategory.name}</h1>
						<p className="mt-1 text-xs md:text-sm text-gray-400">
							Select desired quantity (max. 999) and proceed to checkout below.
						</p>
					</div>
					<CatalogSearch defaultValue={q} />
				</div>
				<CatalogGrid
					products={result.items}
					emptyMessage="No products found in this category."
				/>
				<CatalogPagination
					page={result.page}
					totalPages={result.totalPages}
					total={result.total}
					pageSize={result.pageSize}
				/>
			</div>
		</div>
	);
};

export default ShopPage;
