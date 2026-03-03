import { notFound, redirect } from "next/navigation";
import { getUserSession } from "@/hooks/use-session";
import { verifyOrgId } from "@/hooks/use-org-id";
import { fetchCatalog } from "@/actions/products/fetch-products-action";
import { getFeatureFlags } from "@/lib/feature-flags";
import { CatalogGrid } from "@/components/shop-grid/CatalogGrid";
import { CatalogPagination } from "@/components/shop-grid/CatalogPagination";
import DynamicBreadcrumb from "@/components/dynamic-breadcrumbs";

interface ShopPageProps {
	params: Promise<{ uuid: string }>;
	searchParams: Promise<{ q?: string; page?: string; pageSize?: string }>;
}

const ShopPage = async ({ params, searchParams }: ShopPageProps) => {
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

	if (!flags.catalogV2) {
		redirect(`/dashboard/${slug.uuid}/home`);
	}

	const result = await fetchCatalog({
		search: q,
		page: page ? Number(page) : undefined,
		pageSize: pageSize ? Number(pageSize) : undefined,
	});

	return (
		<div className="flex justify-center mt-16 h-full pb-20 px-4 md:px-6">
			<div className="w-full md:w-11/12 lg:w-9/12 xl:w-8/12 max-w-7xl">
				<DynamicBreadcrumb />
				<h1 className="mt-5 text-2xl md:text-3xl">Shop</h1>
				<p className="mt-1 text-xs md:text-sm text-gray-400">
					Select desired quantity (max. 999) and proceed to checkout below.
				</p>
				<CatalogGrid products={result.items} />
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
