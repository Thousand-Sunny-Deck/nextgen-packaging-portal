"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/admin/layout/page-header";
import {
	getSpikeCategories,
	type SpikeAdminCategory,
} from "@/actions/spike/categories-actions";
import { LoadCategoriesPlaceholder } from "./load-categories-placeholder";
import { CategoriesTable } from "./categories-table";

interface CategoriesClientProps {
	search: string;
	page: number;
	pageSize: number;
}

export function CategoriesClient({
	search,
	page,
	pageSize,
}: CategoriesClientProps) {
	const [loaded, setLoaded] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [categories, setCategories] = useState<SpikeAdminCategory[]>([]);
	const [total, setTotal] = useState(0);
	const [totalPages, setTotalPages] = useState(0);

	const fetchCategories = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await getSpikeCategories({ page, pageSize, search });
			setCategories(result.categories);
			setTotal(result.total);
			setTotalPages(result.totalPages);
			setLoaded(true);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to load categories",
			);
		} finally {
			setLoading(false);
		}
	}, [page, pageSize, search]);

	useEffect(() => {
		if (!loaded) return;
		fetchCategories();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, search, pageSize]);

	return (
		<div className="p-4 md:p-8">
			<PageHeader
				title="Categories"
				subtitle="Group products into categories shown in the shop"
			/>

			{!loaded ? (
				<LoadCategoriesPlaceholder
					onLoad={fetchCategories}
					loading={loading}
					error={error}
				/>
			) : (
				<CategoriesTable
					categories={categories}
					total={total}
					totalPages={totalPages}
					loading={loading}
					error={error}
					search={search}
					page={page}
					pageSize={pageSize}
					onRefresh={fetchCategories}
				/>
			)}
		</div>
	);
}
