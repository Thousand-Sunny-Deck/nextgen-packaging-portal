"use client";

import {
	ColumnDef,
	ColumnFiltersState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
	VisibilityState,
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { usePaginationContext } from "@/hooks/use-pagination-context";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
}

export function AllInvoicesDataTable<TData, TValue>({
	columns,
	data,
}: DataTableProps<TData, TValue>) {
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 5,
	});
	const [sorting, setSorting] = useState<SortingState>([]);

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),
		onColumnVisibilityChange: setColumnVisibility,
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),
		state: {
			columnFilters,
			columnVisibility,
			pagination,
			sorting,
		},
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
		<div>
			<div className="flex items-center py-2">
				<Input
					placeholder="Filter invoices..."
					onChange={(event) =>
						table.getColumn("invoiceId")?.setFilterValue(event.target.value)
					}
					className="max-w-sm bg-white"
				/>
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="outline" className="ml-auto">
							Filter
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						{table
							.getAllColumns()
							.filter((column) => column.getCanHide())
							.map((column) => {
								return (
									<DropdownMenuCheckboxItem
										key={column.id}
										className="capitalize"
										checked={column.getIsVisible()}
										onCheckedChange={(value) =>
											column.toggleVisibility(!!value)
										}
									>
										{column.id === "invoiceId" ? "Invoice" : column.id}
									</DropdownMenuCheckboxItem>
								);
							})}
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
			<div className="overflow-hidden rounded-sm border bg-white">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											style={{ width: `${header.getSize()}%` }}
											className="p-4"
										>
											{header.isPlaceholder
												? null
												: flexRender(
														header.column.columnDef.header,
														header.getContext(),
													)}
										</TableHead>
									);
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && "selected"}
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											style={{ width: `${cell.column.getSize()}%` }}
											className="p-4"
										>
											{flexRender(
												cell.column.columnDef.cell,
												cell.getContext(),
											)}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell
									colSpan={columns.length}
									className="h-24 text-center"
								>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
			<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 py-4">
				<div className="text-sm text-gray-600">
					Showing {startRow} to {endRow} of {totalRows} invoices
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
}
