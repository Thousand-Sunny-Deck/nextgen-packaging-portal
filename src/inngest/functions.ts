/* eslint-disable @typescript-eslint/no-unused-vars */
import { fetchOrderByUserAndOrderId } from "@/lib/store/orders-store";
import { inngest } from "./client";
import { enrichInvoiceData, validateEventData } from "./utils";
import { NonRetriableError } from "inngest";
import { generateInvoicePdf } from "@/lib/pdf/generate-invoice";

export const helloWorld = inngest.createFunction(
	{ id: "generate-pdf-and-send-email" },
	{ event: "invoice/generate" },
	async ({ event, step }) => {
		if (!validateEventData(event.data)) {
			return { success: false, message: "Cannot validate event." };
		}

		const pdf = await step.run("generate-pdf", async () => {
			const { orderId, userId, email } = event.data;
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

			const invoiceData = enrichInvoiceData(order);
			const pdfBuffer = await generateInvoicePdf(invoiceData);
			return pdfBuffer;
		});

		if (pdf) {
			return { success: true };
		}

		const s3Url = await step.run("upload-to-s3", async () => {
			/**
			 * get orderId, userId, email from db
			 *
			 * 1. use the pdf buffer returned from above to generate a s3 url
			 * 2. store in s3
			 * 3. update db with s3 url and state
			 * 3. return s3 url
			 */
		});

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
