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
} from "@tanstack/react-table";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { AvailableProduct } from "@/actions/admin/entitlements-actions";
import { ProductCustomization } from "./add-entitlement-sheet";
import { GrantProductsTableMeta } from "./grant-products-columns";

const emptyDraft: ProductCustomization = {
	customSku: null,
	customDescription: null,
	customUnitCost: null,
};

interface GrantProductsDataTableProps {
	columns: ColumnDef<AvailableProduct, unknown>[];
	data: AvailableProduct[];
	selections: Map<string, ProductCustomization>;
	toggleProduct: (id: string) => void;
	updateCustomization: (
		id: string,
		partial: Partial<ProductCustomization>,
	) => void;
}

export function GrantProductsDataTable({
	columns,
	data,
	selections,
	toggleProduct,
	updateCustomization,
}: GrantProductsDataTableProps) {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [globalFilter, setGlobalFilter] = useState("");
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 10,
	});

	// Inline editing state
	const [editingRowId, setEditingRowId] = useState<string | null>(null);
	const [editDraft, setEditDraftState] =
		useState<ProductCustomization>(emptyDraft);

	const isSelected = useCallback(
		(productId: string) => selections.has(productId),
		[selections],
	);

	const getCustomization = useCallback(
		(productId: string) => selections.get(productId),
		[selections],
	);

	const startEditing = useCallback(
		(product: AvailableProduct) => {
			const existing = selections.get(product.id);
			setEditingRowId(product.id);
			setEditDraftState(
				existing ?? {
					customSku: null,
					customDescription: null,
					customUnitCost: null,
				},
			);
		},
		[selections],
	);

	const cancelEditing = useCallback(() => {
		setEditingRowId(null);
		setEditDraftState(emptyDraft);
	}, []);

	const saveEditing = useCallback(() => {
		if (!editingRowId) return;
		updateCustomization(editingRowId, editDraft);
		setEditingRowId(null);
		setEditDraftState(emptyDraft);
	}, [editingRowId, editDraft, updateCustomization]);

	const setEditDraft = useCallback((partial: Partial<ProductCustomization>) => {
		setEditDraftState((prev) => ({ ...prev, ...partial }));
	}, []);

	const hasDraftChanged = useCallback(() => {
		if (!editingRowId) return false;
		const existing = selections.get(editingRowId);
		const base = existing ?? emptyDraft;
		return (
			editDraft.customSku !== base.customSku ||
			editDraft.customDescription !== base.customDescription ||
			editDraft.customUnitCost !== base.customUnitCost
		);
	}, [editingRowId, editDraft, selections]);

	const meta: GrantProductsTableMeta = {
		isSelected,
		toggleProduct,
		editingRowId,
		editDraft,
		startEditing,
		cancelEditing,
		saveEditing,
		setEditDraft,
		hasDraftChanged,
		getCustomization,
	};

	const table = useReactTable({
		data,
		columns,
		meta,
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		onPaginationChange: setPagination,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onGlobalFilterChange: setGlobalFilter,
		getSortedRowModel: getSortedRowModel(),
		globalFilterFn: "includesString",
		state: {
			pagination,
			sorting,
			columnFilters,
			globalFilter,
		},
	});

	const filteredRows = table.getFilteredRowModel().rows.length;
	const startRow =
		filteredRows > 0 ? pagination.pageIndex * pagination.pageSize + 1 : 0;
	const endRow = Math.min(
		(pagination.pageIndex + 1) * pagination.pageSize,
		filteredRows,
	);

	return (
		<div>
			{/* Search input */}
			<div className="flex items-center py-4">
				<div className="relative flex-1 max-w-sm">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
					<Input
						placeholder="Search products..."
						value={globalFilter}
						onChange={(e) => setGlobalFilter(e.target.value)}
						className="pl-10 bg-white"
					/>
				</div>
			</div>

			<div className="overflow-x-auto rounded-md border bg-white">
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id} className="p-4">
										{header.isPlaceholder
											? null
											: flexRender(
													header.column.columnDef.header,
													header.getContext(),
												)}
									</TableHead>
								))}
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
										<TableCell key={cell.id} className="p-4">
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
									No products found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			<div className="flex items-center justify-between py-4">
				<div className="text-sm text-gray-600">
					Showing {startRow} to {endRow} of {filteredRows} products
					{globalFilter && ` (filtered from ${data.length})`}
				</div>
				<div className="flex items-center gap-2">
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.previousPage()}
						disabled={!table.getCanPreviousPage()}
					>
						<ChevronLeft className="h-4 w-4" />
						Previous
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={() => table.nextPage()}
						disabled={!table.getCanNextPage()}
					>
						Next
						<ChevronRight className="h-4 w-4" />
					</Button>
				</div>
			</div>
		</div>
	);
}
