/* eslint-disable @typescript-eslint/no-unused-vars */
import { inngest } from "./client";

export const helloWorld = inngest.createFunction(
	{ id: "generate-pdf-and-send-email" },
	{ event: "order/post" },
	async ({ event, step }) => {
		const pdf = await step.run("generate-pdf", async () => {
			// there is data in event.data
			/**
			 *
			 * event.data = userId, orderId, email
			 */
			/**
			 * 1. fetch orderData using orderId and userId from db.
			 * 		this will include the order status.
			 * 		this will also include the cart + billing info
			 * 2. use all data to generate a pdf
			 * 3. update db state
			 * 4. return pdf
			 *
			 */
		});

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
