import { OrderPayload } from "@/actions/order-delivery/deliver-order-action";
import { NextRequest, NextResponse } from "next/server";
import { orderPayloadSchema } from "./validate-request";
import { auth } from "@/lib/config/auth";
import {
	fetchOrdersForUser,
	storePreparedOrderInDb,
} from "@/lib/store/orders-store";
import { inngest } from "@/inngest/client";
import { prepareAllOrdersData } from "./utils";

export async function POST(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session || !session.user) {
			return NextResponse.json(
				{
					success: false,
					message: "Unauthorized",
				},
				{ status: 401 },
			);
		}

		// Parse the request body
		const body = await request.json();

		// Validate the payload using Zod
		const validationResult = orderPayloadSchema.safeParse(body);

		if (!validationResult.success) {
			const errors = validationResult.error.issues.map((err) => {
				const path = err.path.join(".");
				return path ? `${path}: ${err.message}` : err.message;
			});

			return NextResponse.json(
				{
					success: false,
					message: "Validation failed",
					errors,
				},
				{ status: 400 },
			);
		}

		const payload: OrderPayload = validationResult.data;
		const order = await storePreparedOrderInDb(payload, session.user.id);

		await inngest.send({
			name: "invoice/generate",
			data: {
				orderId: order.orderId,
				userId: order.userId,
				email: order.customerEmail,
			},
		});

		return NextResponse.json({
			success: true,
			data: {
				orderId: order.orderId,
				id: order.id,
			},
		});
	} catch (err: unknown) {
		return NextResponse.json(
			{
				err,
				message: "Something went wrong",
			},
			{
				status: 500,
			},
		);
	}
}

export async function GET(request: NextRequest) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session || !session.user) {
			return NextResponse.json(
				{
					success: false,
					message: "Unauthorized",
				},
				{ status: 401 },
			);
		}

		const userId = session.user.id;
		const allOrdersResponse = await fetchOrdersForUser(userId);
		const allOrders = await prepareAllOrdersData(allOrdersResponse, userId);

		return NextResponse.json({
			success: true,
			data: allOrders,
		});
	} catch (err: unknown) {
		return NextResponse.json(
			{
				err,
				message: "Something went wrong",
			},
			{
				status: 500,
			},
		);
	}
}
