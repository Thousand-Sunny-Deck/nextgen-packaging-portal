import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/config/auth";
import {
	updateBillingAddress,
	deleteBillingAddress,
} from "@/lib/store/billing-addresses-store";
import { z } from "zod";

const billingAddressSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	organization: z.string().min(1, "Organization name is required"),
	address: z.string().min(1, "Address is required"),
	ABN: z.string().min(11, "ABN must be 11 digits").max(14),
});

type RouteParams = {
	params: Promise<{ id: string }>;
};

export async function PUT(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session || !session.user) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 },
			);
		}

		const { id } = await params;
		const body = await request.json();
		const validationResult = billingAddressSchema.safeParse(body);

		if (!validationResult.success) {
			const errors = validationResult.error.issues.map((err) => {
				const path = err.path.join(".");
				return path ? `${path}: ${err.message}` : err.message;
			});

			return NextResponse.json(
				{ success: false, message: "Validation failed", errors },
				{ status: 400 },
			);
		}

		const address = await updateBillingAddress(
			id,
			session.user.id,
			validationResult.data,
		);

		if (!address) {
			return NextResponse.json(
				{ success: false, message: "Billing address not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			data: address,
		});
	} catch (err) {
		console.error("Error updating billing address:", err);
		return NextResponse.json(
			{ success: false, message: "Something went wrong" },
			{ status: 500 },
		);
	}
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
	try {
		const session = await auth.api.getSession({
			headers: request.headers,
		});

		if (!session || !session.user) {
			return NextResponse.json(
				{ success: false, message: "Unauthorized" },
				{ status: 401 },
			);
		}

		const { id } = await params;
		const deleted = await deleteBillingAddress(id, session.user.id);

		if (!deleted) {
			return NextResponse.json(
				{ success: false, message: "Billing address not found" },
				{ status: 404 },
			);
		}

		return NextResponse.json({
			success: true,
			message: "Billing address deleted",
		});
	} catch (err) {
		console.error("Error deleting billing address:", err);
		return NextResponse.json(
			{ success: false, message: "Something went wrong" },
			{ status: 500 },
		);
	}
}
