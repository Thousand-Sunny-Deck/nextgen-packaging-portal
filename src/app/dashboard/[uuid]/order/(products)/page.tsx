import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getUserSession } from "@/hooks/use-session";
import { verifyOrgId } from "@/hooks/use-org-id";
import {
	countUncategorizedEntitledProducts,
	fetchEntitledProducts,
	fetchQuickOrderCategories,
	resolveShopCategoryByHandle,
} from "@/actions/products/fetch-products-action";
import DynamicBreadcrumb from "@/components/dynamic-breadcrumbs";
import { CatalogGrid } from "@/components/shop-grid/CatalogGrid";
import { CatalogSearch } from "@/components/shop-grid/CatalogSearch";
import { CategoryGrid } from "@/components/shop-grid/CategoryGrid";

interface OrdersPageProps {
	params: Promise<{ uuid: string }>;
	searchParams: Promise<{
		q?: string;
		category?: string;
		view?: string;
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

	const [slug, { q, category, view }] = await Promise.all([
		params,
		searchParams,
	]);
	const { error: orgIdError } = await verifyOrgId(session, slug);

	if (orgIdError) {
		notFound();
	}

	const orderBasePath = `/dashboard/${slug.uuid}/order`;

	// Landing view: no category selected → show category tiles (if any exist).
	if (!category) {
		const categories = await fetchQuickOrderCategories({ userId: slug.uuid });

		// Show all products directly when explicitly requested ("All products"
		// tile) or when there are no categories to group by.
		const showAllProducts = view === "all" || categories.length === 0;

		if (showAllProducts) {
			const result = await fetchEntitledProducts({
				userId: slug.uuid,
				search: q,
			});
			const showBackToCategories = categories.length > 0;

			return (
				<div className="flex justify-center mt-16 h-full pb-20 px-4 md:px-6">
					<div className="w-full md:w-11/12 lg:w-9/12 xl:w-8/12 max-w-7xl">
						<DynamicBreadcrumb />
						{showBackToCategories && (
							<Link
								href={orderBasePath}
								className="mt-5 inline-flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-800"
							>
								<ArrowLeft className="h-4 w-4" />
								All categories
							</Link>
						)}
						<div
							className={`flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mb-8 ${
								showBackToCategories ? "mt-3" : "mt-5"
							}`}
						>
							<div>
								<h1 className="text-2xl md:text-3xl">
									{showBackToCategories ? "All products" : "Quick Order"}
								</h1>
								<p className="mt-1 text-xs md:text-sm text-gray-400">
									Select desired quantity (max. 999) and proceed to checkout
									below.
								</p>
							</div>
							<CatalogSearch defaultValue={q} />
						</div>
						<CatalogGrid products={result.items} />
					</div>
				</div>
			);
		}

		// Only offer an "All products" tile when the user has entitled products
		// not covered by any category, so they remain reachable.
		const uncategorizedCount = await countUncategorizedEntitledProducts({
			userId: slug.uuid,
		});

		return (
			<div className="flex justify-center mt-16 h-full pb-20 px-4 md:px-6">
				<div className="w-full md:w-11/12 lg:w-9/12 xl:w-8/12 max-w-7xl">
					<DynamicBreadcrumb />
					<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between mt-5 mb-8">
						<div>
							<h1 className="text-2xl md:text-3xl">Quick Order</h1>
							<p className="mt-1 text-xs md:text-sm text-gray-400">
								Choose a category to view your products.
							</p>
						</div>
					</div>
					<CategoryGrid
						categories={categories}
						basePath={orderBasePath}
						includeAllTile={uncategorizedCount > 0}
					/>
				</div>
			</div>
		);
	}

	// Drill-down view: a category is selected → show its entitled products.
	const resolvedCategory = await resolveShopCategoryByHandle(category);

	if (!resolvedCategory) {
		redirect(orderBasePath);
	}

	const result = await fetchEntitledProducts({
		userId: slug.uuid,
		search: q,
		categoryId: resolvedCategory.id,
	});

	return (
		<div className="flex justify-center mt-16 h-full pb-20 px-4 md:px-6">
			<div className="w-full md:w-11/12 lg:w-9/12 xl:w-8/12 max-w-7xl">
				<DynamicBreadcrumb />
				<Link
					href={orderBasePath}
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
			</div>
		</div>
	);
};

export default OrdersPage;
