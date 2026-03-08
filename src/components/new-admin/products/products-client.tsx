"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/new-admin/layout/page-header";
import {
	getSpikeProducts,
	type SpikeAdminProduct,
} from "@/actions/spike/products-actions";
import { LoadProductsPlaceholder } from "./load-products-placeholder";
import { ProductsTable } from "./products-table";

interface ProductsClientProps {
	search: string;
	page: number;
	pageSize: number;
}

export function ProductsClient({
	search,
	page,
	pageSize,
}: ProductsClientProps) {
	const [loaded, setLoaded] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [products, setProducts] = useState<SpikeAdminProduct[]>([]);
	const [total, setTotal] = useState(0);
	const [totalPages, setTotalPages] = useState(0);

	const fetchProducts = useCallback(async () => {
		setLoading(true);
		setError(null);
		try {
			const result = await getSpikeProducts({ page, pageSize, search });
			setProducts(result.products);
			setTotal(result.total);
			setTotalPages(result.totalPages);
			setLoaded(true);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load products");
		} finally {
			setLoading(false);
		}
	}, [page, pageSize, search]);

	useEffect(() => {
		if (!loaded) return;
		fetchProducts();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [page, search, pageSize]);

	return (
		<div className="p-4 md:p-8">
			<PageHeader title="Products" subtitle="Manage available products" />

			{!loaded ? (
				<LoadProductsPlaceholder
					onLoad={fetchProducts}
					loading={loading}
					error={error}
				/>
			) : (
				<ProductsTable
					products={products}
					total={total}
					totalPages={totalPages}
					loading={loading}
					error={error}
					search={search}
					page={page}
					pageSize={pageSize}
					onRefresh={fetchProducts}
				/>
			)}
		</div>
	);
}
