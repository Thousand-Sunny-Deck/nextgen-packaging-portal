/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	fetchOrderByUserAndOrderId,
	updateOrderWithInvoice,
	updateStateForOrder,
} from "@/lib/store/orders-store";
import { inngest } from "./client";
import { enrichInvoiceData, validateEventData } from "./utils";
import { NonRetriableError } from "inngest";
import { generateInvoicePdf } from "@/lib/pdf/generate-invoice";
import { OrderStatus } from "@/generated/prisma/enums";
import { S3Service } from "@/service/s3";

export const helloWorld = inngest.createFunction(
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

		const { s3Key, s3Url } = await step.run("upload-to-s3", async () => {
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

		if (s3Key || s3Url) {
			console.log(s3Key, s3Url);
			return true;
		}

		const email = await step.run("send-email", async () => {
			/**
			 *
			 * you have orderId, email, userId, s3 url, pdf buffer
			 *
			 * 1. we may/maynot need to generate a signedUrl.
			 * 2. use resend to send email with pdf buffer in the attachment.
			 * 3. update db state to be completed.
			 *
			 */
		});
	},
);
