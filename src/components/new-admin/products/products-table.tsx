"use client";

import { useState } from "react";
import { Package, RefreshCw, PackagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateProductsSheet } from "@/components/new-admin/products/create-product-sheet/create-products";
import { EmptyState } from "@/components/new-admin/ui/empty-state";
import { AdminSearch } from "@/components/new-admin/ui/admin-search";
import { AdminPagination } from "@/components/new-admin/ui/admin-pagination";
import { AdminDataTable } from "@/components/new-admin/ui/admin-data-table";
import {
	RowActionsMenu,
	type RowActionItem,
} from "@/components/new-admin/ui/row-actions-menu";
import type { SpikeAdminProduct } from "@/actions/spike/products-actions";
import { productColumns } from "./products-columns";

interface ProductsTableProps {
	products: SpikeAdminProduct[];
	total: number;
	totalPages: number;
	loading: boolean;
	error: string | null;
	search: string;
	page: number;
	pageSize: number;
	onRefresh: () => void;
}

export function ProductsTable({
	products,
	total,
	totalPages,
	loading,
	error,
	search,
	page,
	pageSize,
	onRefresh,
}: ProductsTableProps) {
	const [sheetOpen, setSheetOpen] = useState(false);
	const rowActions: RowActionItem<SpikeAdminProduct>[] = [
		{
			key: "edit-product",
			label: "Edit",
			disabled: true,
			onSelect: () => {},
		},
		{
			key: "delete-product",
			label: "Delete",
			variant: "destructive",
			disabled: true,
			onSelect: () => {},
		},
	];

	return (
		<>
			<CreateProductsSheet
				open={sheetOpen}
				onOpenChange={setSheetOpen}
				onProductsCreated={onRefresh}
			/>

			<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 mb-4">
				<AdminSearch defaultValue={search} placeholder="Search products..." />
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						onClick={() => setSheetOpen(true)}
						className="shrink-0"
					>
						<PackagePlus size={14} className="mr-1.5" />
						Create Products
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={onRefresh}
						disabled={loading}
						className="shrink-0"
					>
						<RefreshCw size={14} className={loading ? "animate-spin" : ""} />
						<span className="ml-1.5">Refresh</span>
					</Button>
				</div>
			</div>

			{error && (
				<div className="mb-3 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-600">
					{error}
				</div>
			)}

			{products.length === 0 && !loading ? (
				<EmptyState
					icon={Package}
					heading="No products found"
					description={
						search
							? `No products match "${search}". Try a different search.`
							: "No products in the database yet."
					}
				/>
			) : (
				<AdminDataTable
					columns={productColumns}
					data={products}
					getRowId={(p) => p.id}
					renderRowActions={(row) => (
						<RowActionsMenu
							row={row}
							items={rowActions}
							disabled={loading}
							triggerLabel="Open product actions"
						/>
					)}
					loading={loading}
					minWidth="min-w-[760px]"
				/>
			)}

			<AdminPagination
				page={page}
				totalPages={totalPages}
				total={total}
				pageSize={pageSize}
				itemLabel="products"
			/>
		</>
	);
}
