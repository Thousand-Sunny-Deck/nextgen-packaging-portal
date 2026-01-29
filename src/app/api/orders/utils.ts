import { Invoice } from "@/components/dynamic-table/invoices/columns";
import { OrderDetailsForOrderId } from "@/lib/store/orders-store";
import { OrderStatus } from "@/generated/prisma/enums";

const mapOrderStatusToInvoiceStatus = (
	status: OrderStatus,
): Invoice["status"] => {
	switch (status) {
		case "PENDING":
			return "Pending";
		case "PROCESSING":
		case "PDF_GENERATED":
		case "PDF_STORED":
			return "Processing";
		case "EMAIL_SENT":
			return "Success";
		case "FAILED":
			return "Failed";
		default:
			return "Pending";
	}
};

export const prepareAllOrdersData = (
	orders: OrderDetailsForOrderId[],
): Invoice[] => {
	return orders.map((order) => ({
		invoiceId: order.orderId,
		amount: order.totalOrderCost,
		status: mapOrderStatusToInvoiceStatus(order.status),
		date: order.createdAt.toISOString().split("T")[0],
	}));
};

export type ActiveOrder = {
	id: string;
	orderNumber: string;
	price: string;
	status: "Order Placed" | "Processing";
};

export const getActiveOrdersFromInvoices = (
	invoices: Invoice[],
): ActiveOrder[] => {
	return invoices
		.filter(
			(invoice) =>
				invoice.status === "Pending" || invoice.status === "Processing",
		)
		.map((invoice, index) => ({
			id: `${invoice.invoiceId}-${index}`,
			orderNumber: invoice.invoiceId,
			price: `AU$${invoice.amount.toFixed(2)}`,
			status: invoice.status === "Pending" ? "Order Placed" : "Processing",
		}));
};
