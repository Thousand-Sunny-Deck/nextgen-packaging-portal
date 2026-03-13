import type { AdminTableColumn } from "@/components/admin/ui/admin-data-table";
import type { OrderActivityRow } from "@/actions/spike/orders-actions";
import { Button } from "@/components/ui/button";
import { formatCurrency, formatDate } from "@/components/admin/home/common";

type PendingApprovalsColumnsOptions = {
	onOpenItems: (row: OrderActivityRow) => void;
	onAccept: (row: OrderActivityRow) => void;
	approvingId: string | null;
};

export function getPendingApprovalsColumns({
	onOpenItems,
	onAccept,
	approvingId,
}: PendingApprovalsColumnsOptions): AdminTableColumn<OrderActivityRow>[] {
	return [
		{
			key: "submitted",
			header: "Submitted",
			render: (row) => formatDate(row.createdAt),
		},
		{
			key: "user",
			header: "User",
			render: (row) => (
				<div className="flex flex-col">
					<span className="font-medium text-slate-900">
						{row.user?.name || "Unknown user"}
					</span>
					<span className="text-xs text-slate-500">
						{row.user?.email || "-"}
					</span>
				</div>
			),
		},
		{
			key: "organization",
			header: "Organization",
			render: (row) => (
				<span className="font-medium text-slate-800">
					{row.customerOrganization}
				</span>
			),
		},
		{
			key: "orderId",
			header: "Order ID",
			render: (row) => (
				<span className="font-mono text-xs text-slate-700">{row.orderId}</span>
			),
		},
		{
			key: "orderCost",
			header: "Order Cost",
			render: (row) => (
				<span className="font-medium text-slate-900">
					{formatCurrency(row.totalOrderCost)}
				</span>
			),
		},
		{
			key: "totalItems",
			header: "Total Items",
			render: (row) => row.cartSize,
		},
		{
			key: "items",
			header: "Items",
			render: (row) => (
				<Button
					type="button"
					onClick={() => onOpenItems(row)}
					className="inline-flex items-center rounded-xs bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700 hover:bg-slate-200 transition-colors"
				>
					View items
				</Button>
			),
		},
		{
			key: "actions",
			header: "Actions",
			render: (row) => {
				const isApproving = approvingId === row.id;
				return (
					<Button
						size="sm"
						onClick={() => onAccept(row)}
						disabled={approvingId !== null}
					>
						{isApproving ? "Accepting..." : "Accept"}
					</Button>
				);
			},
		},
	];
}
