import { OrderPayload } from "@/actions/order-delivery/deliver-order-action";
import { NextRequest, NextResponse } from "next/server";
import { orderPayloadSchema } from "./validate-request";
import { auth } from "@/lib/config/auth";

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

		return NextResponse.json({
			success: true,
			data: payload,
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
