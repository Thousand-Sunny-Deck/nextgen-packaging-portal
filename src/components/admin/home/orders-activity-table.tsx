"use client";

import { useMemo, useState } from "react";
import { Activity, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { AdminSearch } from "@/components/admin/ui/admin-search";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";
import { AdminDataTable } from "@/components/admin/ui/admin-data-table";
import type { OrderActivityRow } from "@/actions/spike/orders-actions";
import { getOrderActivityColumns } from "./orders-activity-columns";
import { OrderItemsSheet } from "./order-items-sheet";

interface OrdersActivityTableProps {
	activities: OrderActivityRow[];
	total: number;
	totalPages: number;
	loading: boolean;
	error: string | null;
	search: string;
	page: number;
	pageSize: number;
	onRefresh: () => void;
}

export function OrdersActivityTable({
	activities,
	total,
	totalPages,
	loading,
	error,
	search,
	page,
	pageSize,
	onRefresh,
}: OrdersActivityTableProps) {
	const [selectedOrder, setSelectedOrder] = useState<OrderActivityRow | null>(
		null,
	);
	const [sheetOpen, setSheetOpen] = useState(false);

	const columns = useMemo(
		() =>
			getOrderActivityColumns({
				onOpenItems: (row) => {
					setSelectedOrder(row);
					setSheetOpen(true);
				},
			}),
		[],
	);

	return (
		<>
			<div className="mb-4 flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center">
				<AdminSearch
					defaultValue={search}
					placeholder="Search name, organization, or order ID..."
				/>
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

			{error && (
				<div className="mb-3 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
					{error}
				</div>
			)}

			{activities.length === 0 && !loading ? (
				<EmptyState
					icon={Activity}
					heading="No order activity found"
					description={
						search
							? `No orders match "${search}". Try a different search.`
							: "No order activity is available yet."
					}
				/>
			) : (
				<AdminDataTable
					columns={columns}
					data={activities}
					getRowId={(row) => row.id}
					loading={loading}
					minWidth="min-w-[1120px]"
				/>
			)}

			<AdminPagination
				page={page}
				totalPages={totalPages}
				total={total}
				pageSize={pageSize}
				itemLabel="orders"
			/>

			<OrderItemsSheet
				order={selectedOrder}
				open={sheetOpen}
				onOpenChange={(open) => {
					setSheetOpen(open);
					if (!open) setSelectedOrder(null);
				}}
			/>
		</>
	);
}
