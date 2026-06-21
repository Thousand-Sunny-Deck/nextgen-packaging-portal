import {
	fetchOrderByUserAndOrderId,
	updateOrderWithEmail,
	updateOrderWithInvoice,
	updateStateForOrder,
} from "@/lib/store/orders-store";
import { inngest } from "./client";
import {
	createAdminDetailsForAdminEmail,
	createAdminEmailDetails,
	enrichInvoiceData,
	validateEventData,
} from "./utils";
import { NonRetriableError } from "inngest";
import { generateInvoicePdf } from "@/lib/pdf/generate-invoice";
import { OrderStatus } from "@/generated/prisma/enums";
import { S3Service } from "@/service/s3";
import { PostOffice } from "@/service/post-office";
import { AdminEmailTemplate } from "@/lib/resend/admin-template";

export const generatePdfAndSendEmailBackgroundJob = inngest.createFunction(
	{ id: "generate-pdf-and-send-email" },
	{ event: "invoice/generate" },
	async ({ event, step }) => {
		if (!validateEventData(event.data)) {
			return { success: false, message: "Cannot validate event." };
		}

		const { pdf } = await step.run("generate-pdf", async () => {
			const { orderId, userId } = event.data;
			const order = await fetchOrderByUserAndOrderId(orderId, userId);
			if (!order) {
				throw new NonRetriableError(
					`Order ${orderId} not found for user ${userId}.`,
				);
			}

			if (order.cartSize <= 0) {
				throw new NonRetriableError(
					`Order ${orderId} for user ${userId} has no items in cart.`,
				);
			}

			if (order.status !== "PENDING") {
				throw new NonRetriableError(
					`Order ${orderId} for user ${userId} - invoice already generated.`,
				);
			}

			await updateStateForOrder(orderId, userId, OrderStatus.PROCESSING);

			const invoiceData = enrichInvoiceData(order);
			const pdfBuffer = await generateInvoicePdf(invoiceData);

			await updateStateForOrder(orderId, userId, OrderStatus.PDF_GENERATED);
			return {
				pdf: pdfBuffer,
			};
		});

		await step.run("upload-to-s3", async () => {
			const { orderId, userId } = event.data;
			const s3Key = `invoices/${orderId}.pdf`;
			const pdfBuffer = Buffer.from(pdf.data);

			const s3 = new S3Service();
			const { url } = await s3.uploadFile(s3Key, pdfBuffer, "application/pdf");

			await updateOrderWithInvoice(orderId, userId, {
				invoiceS3Key: s3Key,
				invoiceS3Url: url,
				status: OrderStatus.PDF_STORED,
			});

			return {
				s3Key,
				s3Url: url,
			};
		});

		await step.run("send-email", async () => {
			const { orderId, userId } = event.data;

			// Customers are NOT emailed their invoice — they view it from the
			// portal (Past Orders) once it's generated. Admins still get a copy.
			const order = await fetchOrderByUserAndOrderId(orderId, userId);
			if (!order) {
				throw new NonRetriableError(`Order ${orderId} not found for email.`);
			}

			const customerName = order.billingOrganization || order.customerEmail;

			const adminPostOffice = new PostOffice(
				createAdminDetailsForAdminEmail(
					customerName,
					order.invoiceId,
					order.totalOrderCost,
				),
			);
			await adminPostOffice.deliver(
				{
					to: [
						"Manav.gohel@nextgenpackaging.com.au",
						"Manthan.gohel@nextgenpackaging.com.au",
					],
				},
				AdminEmailTemplate({ details: createAdminEmailDetails(order) }),
				Buffer.from(pdf.data),
			);

			// Marks the order complete so the invoice is viewable in the portal.
			await updateOrderWithEmail(orderId, userId, OrderStatus.EMAIL_SENT);
		});
	},
);
