"use client";

import { useMemo, useState } from "react";
import { Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/admin/ui/empty-state";
import { AdminSearch } from "@/components/admin/ui/admin-search";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";
import { AdminDataTable } from "@/components/admin/ui/admin-data-table";
import { OrderItemsSheet } from "@/components/admin/home/order-items-sheet";
import type { OrderActivityRow } from "@/actions/spike/orders-actions";
import { approveOrderAction } from "@/actions/spike/approve-order-action";
import { toast } from "sonner";
import { getPendingApprovalsColumns } from "./pending-approvals-columns";

interface PendingApprovalsTableProps {
	approvals: OrderActivityRow[];
	total: number;
	totalPages: number;
	loading: boolean;
	error: string | null;
	search: string;
	page: number;
	pageSize: number;
	onRefresh: () => void;
}

export function PendingApprovalsTable({
	approvals,
	total,
	totalPages,
	loading,
	error,
	search,
	page,
	pageSize,
	onRefresh,
}: PendingApprovalsTableProps) {
	const [selectedOrder, setSelectedOrder] = useState<OrderActivityRow | null>(
		null,
	);
	const [sheetOpen, setSheetOpen] = useState(false);
	const [approvingId, setApprovingId] = useState<string | null>(null);

	const handleAccept = async (row: OrderActivityRow) => {
		setApprovingId(row.id);
		try {
			const result = await approveOrderAction(row.orderId);
			if (result.success) {
				toast.success(`Order ${row.orderId} approved.`);
				onRefresh();
			} else {
				toast.error(result.error);
			}
		} finally {
			setApprovingId(null);
		}
	};

	const columns = useMemo(
		() =>
			getPendingApprovalsColumns({
				onOpenItems: (row) => {
					setSelectedOrder(row);
					setSheetOpen(true);
				},
				onAccept: handleAccept,
				approvingId,
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[approvingId],
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

			{approvals.length === 0 && !loading ? (
				<EmptyState
					icon={Clock}
					heading="No pending approvals"
					description={
						search
							? `No orders match "${search}". Try a different search.`
							: "There are no orders awaiting approval."
					}
				/>
			) : (
				<AdminDataTable
					columns={columns}
					data={approvals}
					getRowId={(row) => row.id}
					loading={loading}
					minWidth="min-w-[1100px]"
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
