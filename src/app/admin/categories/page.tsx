import { CategoriesClient } from "@/components/admin/categories/categories-client";

interface PageProps {
	searchParams: Promise<{ q?: string; page?: string; pageSize?: string }>;
}

export default async function AdminCategoriesPage({ searchParams }: PageProps) {
	const params = await searchParams;

	const search = params.q?.trim() ?? "";
	const page = Number(params.page) || 1;
	const pageSize = Number(params.pageSize) || 20;

	return <CategoriesClient search={search} page={page} pageSize={pageSize} />;
}
