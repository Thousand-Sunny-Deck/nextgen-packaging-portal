"use server";

import { OrderSummaryInfo } from "@/components/checkout/order/order-summary";
import { BillingInfoItem as BillingInfoPayload } from "@/lib/store/billing-info-store";
import { CartItem } from "@/lib/store/product-store";
import { auth } from "@/lib/config/auth";
import { headers } from "next/headers";
import { orderPayloadSchema } from "@/app/api/orders/validate-request";
import {
	storePreparedOrderInDb,
	updateStateForOrder,
} from "@/lib/store/orders-store";
import { OrderStatus } from "@/generated/prisma/enums";
import { inngest } from "@/inngest/client";
import { features } from "@/config/features";
import { PostOffice } from "@/service/post-office";
import { AdminApprovalNotificationEmail } from "@/lib/resend/admin-approval-notification-template";

export type OrderPayload = {
	cart: CartPayload;
	billingInfo: BillingInfoPayload;
};

type CartPayload = {
	items: CartItem[];
	extraCartInfo: OrderSummaryInfo;
};

type FireResponse = {
	ok: boolean;
	error?: unknown;
	orderId?: string;
	pendingApproval?: boolean;
};

const ADMIN_EMAIL = "nextgenelitesupplies@gmail.com";
const FROM_EMAIL = "Invoice <invoices@nextgenpackaging-portal.site>";

export const preparePayloadAndFire = async (
	cart: CartPayload,
	billingInfo: BillingInfoPayload,
): Promise<FireResponse> => {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session || !session.user) {
			return {
				ok: false,
				error: "Unauthorized",
			};
		}

		const payload: OrderPayload = {
			cart: cart,
			billingInfo: billingInfo,
		};

		const validationResult = orderPayloadSchema.safeParse(payload);

		if (!validationResult.success) {
			const errors = validationResult.error.issues.map((err) => {
				const path = err.path.join(".");
				return path ? `${path}: ${err.message}` : err.message;
			});

			return {
				ok: false,
				error: errors.join(", "),
			};
		}

		const validatedPayload: OrderPayload = validationResult.data;

		const order = await storePreparedOrderInDb(
			validatedPayload,
			session.user.id,
		);

		if (features.adminApprovalRequired) {
			await updateStateForOrder(
				order.orderId,
				order.userId!,
				OrderStatus.AWAITING_APPROVAL,
			);

			try {
				const formattedTotal = new Intl.NumberFormat("en-AU", {
					style: "currency",
					currency: "AUD",
				}).format(order.totalOrderCost);

				const customerName = order.billingOrganization || order.customerEmail;

				const postOffice = new PostOffice({
					from: FROM_EMAIL,
					subject: `New order pending approval - ${order.invoiceId} (${customerName})`,
				});

				await postOffice.deliver(
					{ to: [ADMIN_EMAIL] },
					AdminApprovalNotificationEmail({
						details: {
							customerName,
							customerEmail: order.customerEmail,
							customerOrganisation: order.billingOrganization,
							orderId: order.orderId,
							invoiceId: order.invoiceId,
							totalFormatted: formattedTotal,
						},
					}),
				);
			} catch (emailError) {
				console.error(
					"Failed to send admin approval notification:",
					emailError,
				);
			}

			return {
				ok: true,
				orderId: order.orderId,
				pendingApproval: true,
			};
		}

		try {
			await inngest.send({
				name: "invoice/generate",
				data: {
					orderId: order.orderId,
					userId: order.userId,
					email: order.customerEmail,
				},
			});
		} catch (inngestError) {
			console.error("Failed to queue invoice generation:", inngestError);
			await updateStateForOrder(
				order.orderId,
				order.userId!,
				OrderStatus.FAILED,
			);
			return {
				ok: false,
				error: "Failed to process order. Please try again.",
			};
		}

		return {
			ok: true,
			orderId: order.orderId,
		};
	} catch (err: unknown) {
		console.error("Error in preparePayloadAndFire:", err);
		return {
			ok: false,
			error: "Something went wrong",
		};
	}
};
