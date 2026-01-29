import { Invoice } from "@/components/dynamic-table/invoices/columns";
import { OrderDetailsForOrderId } from "@/lib/store/orders-store";
import { OrderStatus } from "@/generated/prisma/enums";
import { getPresignedUrlWithCache } from "./presigned-url-cache";
import { S3Service } from "@/service/s3";

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

export const prepareAllOrdersData = async (
	orders: OrderDetailsForOrderId[],
	userId: string,
): Promise<Invoice[]> => {
	const s3 = new S3Service();

	const promiseResults = await Promise.allSettled(
		orders.map(async (order) => {
			const status = mapOrderStatusToInvoiceStatus(order.status);

			// Generate presigned URL only for completed orders
			let pdfUrl: string | undefined;
			if (status === "Success") {
				pdfUrl = await getPresignedUrlWithCache(s3, userId, order.orderId);
			}

			return {
				invoiceId: order.orderId,
				amount: order.totalOrderCost,
				status,
				date: order.createdAt.toISOString().split("T")[0],
				pdfUrl,
			};
		}),
	);

	const invoices: Invoice[] = [];
	const failedOrderIds: string[] = [];

	promiseResults.forEach((result, index) => {
		if (result.status === "fulfilled") {
			invoices.push(result.value);
		} else {
			// Log the error for debugging
			console.error(
				`Failed to process order ${orders[index].orderId}:`,
				result.reason,
			);
			failedOrderIds.push(orders[index].orderId);
		}
	});

	// TODO: Consider returning { invoices, failedOrderIds } if you want to show failures in UI
	return invoices;
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
