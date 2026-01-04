"use client";

import { usePaginationContext } from "@/hooks/use-pagination-context";
import { ProductData } from "@/lib/products/products";
import {
	CartItem,
	ProductTableStore,
	useCartStore,
} from "@/lib/store/product-store";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	Row,
	useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";

const ProductTable = ({ products }: { products: ProductData[] }) => {
	const {
		maybeSelectedProducts: items,
		setQuantity,
		getIsProductSelected,
		toggleProduct,
		canSelectProduct,
	} = useCartStore();
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const generateCartInfo = (row: Row<ProductTableStore>): CartItem => {
		return {
			sku: row.original.sku,
			description: row.original.description,
			quantity: row.original.quantity,
			total: row.original.total,
			unitCost: row.original.unitCost,
		};
	};

	const data = useMemo(() => {
		return products.map((product) => ({
			...product,
			quantity: items.get(product.sku)?.quantity || 0,
			total: (items.get(product.sku)?.quantity || 0) * Number(product.unitCost),
		}));
	}, [products, items]);

	const columns = useMemo<ColumnDef<ProductTableStore>[]>(
		() => [
			{
				id: "select",
				cell: ({ row }) => (
					<input
						type="checkbox"
						checked={isMounted ? getIsProductSelected(row.original.sku) : false}
						disabled={isMounted ? !canSelectProduct(row.original.sku) : false}
						onChange={() => toggleProduct(row.original.sku)}
						className="h-4 w-4 rounded"
					/>
				),
			},
			{
				accessorKey: "sku",
				header: "Code",
			},
			{
				accessorKey: "description",
				header: "Description",
			},
			{
				id: "quantity",
				header: "Quantity",
				cell: ({ row }) => {
					const productCartInfo = generateCartInfo(row);
					const { quantity: qty } = productCartInfo;
					return (
						<div className="flex items-center justify-center gap-2">
							<button
								onClick={() => {
									const newQty = Math.max(0, qty - 1);
									setQuantity({
										...productCartInfo,
										quantity: newQty,
									});
								}}
								disabled={qty <= 0}
								className="h-8 w-8 rounded border disabled:opacity-30"
							>
								<Minus className="h-4 w-4 mx-auto" />
							</button>
							<span className="w-10 text-center font-semibold">{qty}</span>
							<button
								onClick={() => {
									const newQty = qty + 1;
									setQuantity({
										...productCartInfo,
										quantity: newQty,
									});
								}}
								className="h-8 w-8 rounded border"
							>
								<Plus className="h-4 w-4 mx-auto" />
							</button>
						</div>
					);
				},
			},
			{
				accessorKey: "unitCost",
				header: "Unit Cost",
				cell: ({ row }) => `$${row.getValue("unitCost")}`,
			},
			{
				accessorKey: "total",
				header: "Total",
				cell: ({ row }) => (
					<span className="font-semibold">
						${row.original.total.toFixed(2)}
					</span>
				),
			},
		],
		[setQuantity, getIsProductSelected, toggleProduct, isMounted],
	);

	const table = useReactTable({
		data,
		columns,
		state: { pagination },
		getRowId: (row) => row.sku,
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
	});

	const {
		generatePageNumbers,
		currentPage,
		totalPages,
		totalRows,
		startRow,
		endRow,
	} = usePaginationContext({
		table,
		pagination,
	});

	return (
		<div className="w-full">
			<table className="w-full border-collapse">
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id} className="border-b">
							{headerGroup.headers.map((header) => (
								<th key={header.id} className="px-4 py-3 text-center">
									{flexRender(
										header.column.columnDef.header,
										header.getContext(),
									)}
								</th>
							))}
						</tr>
					))}
				</thead>
				<tbody>
					{table.getRowModel().rows.map((row) => (
						<tr
							key={row.id}
							className={`border-b ${row.getIsSelected() ? "bg-blue-50" : "hover:bg-gray-50"}`}
						>
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="px-4 py-4">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
			<div className="flex items-center justify-between py-4">
				<div className="text-sm text-gray-600">
					Showing {startRow} to {endRow} of {totalRows} products
				</div>
				{totalPages > 1 && (
					<div className="flex items-center gap-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
							className="h-8 px-3"
						>
							<ChevronLeft className="h-4 w-4" />
							<span className="ml-1">Previous</span>
						</Button>

						<div className="flex items-center gap-1">
							{generatePageNumbers().map((page, index) => {
								if (page === "ellipsis") {
									return (
										<span
											key={`ellipsis-${index}`}
											className="px-2 text-gray-400"
										>
											...
										</span>
									);
								}
								const pageNum = page as number;
								return (
									<Button
										key={pageNum}
										variant={currentPage === pageNum ? "default" : "outline"}
										size="sm"
										onClick={() => table.setPageIndex(pageNum - 1)}
										className="h-8 w-8 p-0"
									>
										{pageNum}
									</Button>
								);
							})}
						</div>

						<Button
							variant="outline"
							size="sm"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
							className="h-8 px-3"
						>
							<span className="mr-1">Next</span>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

export default ProductTable;
