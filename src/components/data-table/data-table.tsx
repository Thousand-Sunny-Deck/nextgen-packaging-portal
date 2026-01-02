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
} from "@tanstack/react-table";
import { Minus, Plus } from "lucide-react";
import { useCartStore } from "@/lib/store/product-store";
import { ProductData } from "@/lib/products/products";

interface ProductTableProps {
	products: ProductData[];
}

export default function ProductTable({ products }: ProductTableProps) {
	const { items, setQuantity } = useCartStore();
	const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

	const data = useMemo(() => {
		return products.map((product) => ({
			...product,
			quantity: items.get(product.sku)?.quantity || 0,
			total: (items.get(product.sku)?.quantity || 0) * Number(product.unitCost),
		}));
	}, [products, items]);

	const columns = useMemo<ColumnDef<(typeof data)[0]>[]>(
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
				header: "Item Code",
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
				header: "Unit Cost ($)",
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
		state: { rowSelection },
		enableRowSelection: (row) => row.original.quantity > 0,
		onRowSelectionChange: setRowSelection,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getRowId: (row) => row.sku,
	});

	const selectedRows = table.getSelectedRowModel().rows;
	const selectedCount = selectedRows.length;
	const totalPrice = selectedRows.reduce(
		(sum, row) => sum + row.original.total,
		0,
	);
	const set = new Set<string>();
	table.getRowModel().rows.map((row) => {
		const id = row.id;
		if (set.has(id)) {
			console.log("parth's log", id);
		} else {
			set.add(id);
		}
	});

	return (
		<div className="w-full">
			<table className="w-full border-collapse">
				<thead>
					{table.getHeaderGroups().map((headerGroup) => (
						<tr key={headerGroup.id} className="border-b">
							{headerGroup.headers.map((header) => (
								<th key={header.id} className="px-4 py-3 text-left">
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

			{selectedCount > 0 && (
				<div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-lg p-4 min-w-[280px]">
					<div className="mb-3 font-semibold">
						{selectedCount} items selected
					</div>
					<div className="flex justify-between mb-4 pb-3 border-b">
						<span>Total:</span>
						<span className="text-xl font-bold">${totalPrice.toFixed(2)}</span>
					</div>
					<button className="w-full bg-blue-600 text-white rounded-lg py-2.5">
						Checkout
					</button>
				</div>
			)}
		</div>
	);
}
