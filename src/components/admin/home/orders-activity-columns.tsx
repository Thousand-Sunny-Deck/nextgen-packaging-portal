import { Lozenge } from "@/components/Lozenge";
import type { AdminTableColumn } from "@/components/admin/ui/admin-data-table";
import type { OrderActivityRow } from "@/actions/spike/orders-actions";
import { Button } from "@/components/ui/button";

type OrderActivityColumnsOptions = {
	onOpenItems: (row: OrderActivityRow) => void;
};

function formatDate(isoString: string) {
	return new Date(isoString).toLocaleString("en-AU", {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function formatCurrency(value: number) {
	return value.toLocaleString("en-AU", {
		style: "currency",
		currency: "AUD",
		currencyDisplay: "code",
	});
}

function getStatusLozengeAppearance(status: OrderActivityRow["status"]) {
	switch (status) {
		case "EMAIL_SENT":
			return "success" as const;
		case "FAILED":
			return "removed" as const;
		default:
			return "inprogress" as const;
	}
}

function getStatusLabel(status: OrderActivityRow["status"]) {
	switch (status) {
		case "EMAIL_SENT":
			return "Completed";
		case "FAILED":
			return "Failed";
		default:
			return "In Progress";
	}
}

export function getOrderActivityColumns({
	onOpenItems,
}: OrderActivityColumnsOptions): AdminTableColumn<OrderActivityRow>[] {
	return [
		{
			key: "placed",
			header: "Placed",
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
			key: "status",
			header: "Status",
			render: (row) => (
				<Lozenge appearance={getStatusLozengeAppearance(row.status)}>
					{getStatusLabel(row.status)}
				</Lozenge>
			),
		},
	];
}
