// components/ProductTable.tsx
"use client";

import { useMemo, useState } from "react";
import {
	useReactTable,
	getCoreRowModel,
	getSortedRowModel,
	flexRender,
	ColumnDef,
	RowSelectionState,
	getPaginationRowModel,
} from "@tanstack/react-table";
import { Minus, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { ProductTableStore, useCartStore } from "@/lib/store/product-store";
import { ProductData } from "@/lib/products/products";
import { Button } from "../ui/button";
import { usePaginationContext } from "@/hooks/use-pagination-context";

interface ProductTableProps {
	products: ProductData[];
}

export default function ProductTable({ products }: ProductTableProps) {
	const { items, setQuantity } = useCartStore();
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});

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
				header: ({ table }) => (
					<input
						type="checkbox"
						checked={table.getIsAllPageRowsSelected()}
						onChange={table.getToggleAllPageRowsSelectedHandler()}
						className="h-4 w-4 rounded"
					/>
				),
				cell: ({ row }) => (
					<input
						type="checkbox"
						checked={row.getIsSelected()}
						disabled={!row.getCanSelect()}
						onChange={row.getToggleSelectedHandler()}
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
					const qty = row.original.quantity;
					return (
						<div className="flex items-center justify-center gap-2">
							<button
								onClick={() => {
									const newQty = Math.max(0, qty - 1);
									setQuantity(row.original.sku, newQty);
									if (newQty === 0) row.toggleSelected(false);
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
									setQuantity(row.original.sku, newQty);
									if (qty === 0) row.toggleSelected(true);
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
		[setQuantity],
	);

	const table = useReactTable({
		data,
		columns,
		state: { rowSelection, pagination },
		enableRowSelection: (row) => row.original.quantity > 0,
		onRowSelectionChange: setRowSelection,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getRowId: (row) => row.sku,
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
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
}
