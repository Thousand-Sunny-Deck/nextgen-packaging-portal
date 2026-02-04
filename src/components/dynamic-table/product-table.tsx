"use client";

import { usePaginationContext } from "@/hooks/use-pagination-context";
import { ProductData } from "@/actions/products/fetch-products-action";
import {
	CartItem,
	ProductTableStore,
	useCartStore,
} from "@/lib/store/product-store";
import {
	ColumnDef,
	ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	Row,
	useReactTable,
} from "@tanstack/react-table";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { RestartOrderButton } from "../RestartOrderButton";

const ProductTable = ({ products }: { products: ProductData[] }) => {
	// state management with zustand
	const {
		maybeSelectedProducts: items,
		setQuantity,
		getIsProductSelected,
		toggleProduct,
		toggleAllProducts,
		areAllProductsSelected,
		areSomeProductsSelected,
	} = useCartStore();

	// pagination with tanstack/table
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 50,
	});

	const [isMounted, setIsMounted] = useState(false);

	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

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

	// Sort products: non-SLEEVE first, then SLEEVE
	const sortBySleeveDescription = (
		a: { description: string },
		b: { description: string },
	) => {
		const aIsSleeve = a.description.toUpperCase().includes("SLEEVE");
		const bIsSleeve = b.description.toUpperCase().includes("SLEEVE");
		if (aIsSleeve === bIsSleeve) return 0;
		return aIsSleeve ? 1 : -1;
	};

	// table data
	const data = useMemo(() => {
		return products
			.map((product) => ({
				...product,
				quantity: items.get(product.sku)?.quantity || 0,
				total:
					(items.get(product.sku)?.quantity || 0) * Number(product.unitCost),
			}))
			.sort(sortBySleeveDescription);
	}, [products, items]);

	// table columns
	const columns = useMemo<ColumnDef<ProductTableStore>[]>(
		() => [
			{
				id: "select",
				header: () => {
					const allSelected = isMounted && areAllProductsSelected(products);
					const someSelected = isMounted && areSomeProductsSelected(products);

					return (
						<input
							type="checkbox"
							checked={allSelected}
							ref={(el) => {
								if (el) {
									el.indeterminate = someSelected;
								}
							}}
							onChange={() => {
								if (allSelected || someSelected) {
									toggleAllProducts(false, products);
								} else {
									toggleAllProducts(true, products);
								}
							}}
							className="h-4 w-4 rounded"
						/>
					);
				},
				cell: ({ row }) => (
					<input
						type="checkbox"
						checked={isMounted ? getIsProductSelected(row.original.sku) : false}
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
					const getNewQuantity = (value: string): number => {
						if (value.length > 3) {
							const trimmed = value.trim().slice(0, 3);
							return parseInt(trimmed, 10) || 0;
						}
						return parseInt(value) || 0;
					};
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
							<Input
								type="number"
								value={qty || ""}
								placeholder="0"
								onChange={(e) =>
									setQuantity({
										...productCartInfo,
										quantity: getNewQuantity(e.target.value),
									})
								}
								className="h-8 w-16 text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
								min="0"
							/>
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
				cell: ({ row }) =>
					`$${(row.getValue("unitCost") as number).toFixed(2)}`,
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
		[
			setQuantity,
			getIsProductSelected,
			toggleProduct,
			toggleAllProducts,
			areAllProductsSelected,
			areSomeProductsSelected,
			isMounted,
			products,
		],
	);

	// tanstack table
	const table = useReactTable({
		data,
		columns,
		state: { pagination, columnFilters },
		getRowId: (row) => row.sku,
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		autoResetPageIndex: false,
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
		<div className="w-full mt-4">
			<div className="w-full flex justify-between items-center pb-4 gap-4">
				<Input
					placeholder="Filter by item"
					value={
						(table.getColumn("description")?.getFilterValue() as string) ?? ""
					}
					onChange={(event) =>
						table.getColumn("description")?.setFilterValue(event.target.value)
					}
					className="w-full md:w-[50%] lg:w-[40%] rounded-sm"
				/>
				<RestartOrderButton />
			</div>
			<table className="w-full border-collapse">
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id} className="border-b">
							{headerGroup.headers.map((header) => (
								<th key={header.id} className="px-3 md:px-4 py-3 text-center">
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
							className={`border-b ${row.getIsSelected() ? "bg-blue-50" : "hover:bg-gray-50"} bg-orange-50`}
						>
							{row.getVisibleCells().map((cell) => (
								<td key={cell.id} className="px-3 md:px-4 py-4">
									{flexRender(cell.column.columnDef.cell, cell.getContext())}
								</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
			<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4">
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
							className="h-8 px-2 md:px-3"
						>
							<ChevronLeft className="h-4 w-4" />
							<span className="ml-1 hidden md:inline">Previous</span>
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
							className="h-8 px-2 md:px-3"
						>
							<span className="mr-1 hidden md:inline">Next</span>
							<ChevronRight className="h-4 w-4" />
						</Button>
					</div>
				)}
			</div>
		</div>
	);
};

export default ProductTable;
