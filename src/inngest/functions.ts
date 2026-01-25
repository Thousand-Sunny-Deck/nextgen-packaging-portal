/* eslint-disable @typescript-eslint/no-unused-vars */
import {
	fetchOrderByUserAndOrderId,
	updateOrderWithEmail,
	updateOrderWithInvoice,
	updateStateForOrder,
} from "@/lib/store/orders-store";
import { inngest } from "./client";
import {
	createAdminDetailsForEmail,
	enrichInvoiceData,
	validateEventData,
} from "./utils";
import { NonRetriableError } from "inngest";
import { generateInvoicePdf } from "@/lib/pdf/generate-invoice";
import { OrderStatus } from "@/generated/prisma/enums";
import { S3Service } from "@/service/s3";
import { PostOffice } from "@/service/post-office";
import { EmailTemplate } from "@/lib/resend/template";

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

		// THIS IS WORKING NOW. I NEED TO CONFIGURE DNS and DOMAIN thing for emails.
		// from email needs to be congiured correctly
		// TODO: Design for Email and Domain config
		await step.run("send-email", async () => {
			const { orderId, userId, email } = event.data;
			const postOffice = new PostOffice(createAdminDetailsForEmail());
			const { data, error } = await postOffice.deliver(
				{
					to: ["pvyas1512@gmail.com"],
				},
				EmailTemplate({ firstName: userId }),
				Buffer.from(pdf.data),
			);

			console.log("parth data", data);
			console.log("parth error", error);

			await updateOrderWithEmail(orderId, userId, OrderStatus.EMAIL_SENT);
			return data;
		});
	},
);
