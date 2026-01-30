import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/config/auth";
import {
	fetchBillingAddressesForUser,
	createBillingAddress,
} from "@/lib/store/billing-addresses-store";
import { z } from "zod";

const billingAddressSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	organization: z.string().min(1, "Organization name is required"),
	address: z.string().min(1, "Address is required"),
	ABN: z.string().min(11, "ABN must be 11 digits").max(14),
});

export async function GET(request: NextRequest) {
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

		const addresses = await fetchBillingAddressesForUser(session.user.id);

		return NextResponse.json({
			success: true,
			data: addresses,
		});
	} catch (err) {
		console.error("Error fetching billing addresses:", err);
		return NextResponse.json(
			{ success: false, message: "Something went wrong" },
			{ status: 500 },
		);
	}
}

export async function POST(request: NextRequest) {
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

		const address = await createBillingAddress(
			session.user.id,
			validationResult.data,
		);

		return NextResponse.json({
			success: true,
			data: address,
		});
	} catch (err) {
		console.error("Error creating billing address:", err);
		return NextResponse.json(
			{ success: false, message: "Something went wrong" },
			{ status: 500 },
		);
	}
}
