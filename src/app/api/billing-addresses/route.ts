import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/config/auth";
import {
	fetchBillingAddressesForUser,
	createBillingAddress,
} from "@/lib/store/billing-addresses-store";
import {
	billingAddressesRatelimit,
	billingAddressesCache,
} from "@/service/cache";
import { z } from "zod";
import { BillingAddress } from "@/generated/prisma/client";

const CACHE_TTL_SECONDS = 300; // 5 minutes

const billingAddressSchema = z.object({
	email: z.email("Please enter a valid email address"),
	organization: z.string().min(1, "Organization name is required"),
	address: z.string().min(1, "Address is required"),
	ABN: z.string().min(11, "ABN must be 11 digits").max(14),
});

function getCacheKey(userId: string): string {
	return `user:${userId}`;
}

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

		const userId = session.user.id;

		// Rate limiting
		const { success: withinLimit } =
			await billingAddressesRatelimit.limit(userId);

		if (!withinLimit) {
			return NextResponse.json(
				{
					success: false,
					message: "Too many requests. Please try again later.",
				},
				{ status: 429 },
			);
		}

		// Check cache first
		const cacheKey = getCacheKey(userId);
		const cached = await billingAddressesCache.get<BillingAddress[]>(cacheKey);
		if (cached) {
			return NextResponse.json({
				success: true,
				data: cached,
			});
		}

		// Cache miss - fetch from DB
		const addresses = await fetchBillingAddressesForUser(userId);

		// Store in cache
		await billingAddressesCache.set(cacheKey, addresses, CACHE_TTL_SECONDS);

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

		const userId = session.user.id;

		// Rate limiting
		const { success: withinLimit } =
			await billingAddressesRatelimit.limit(userId);
		if (!withinLimit) {
			return NextResponse.json(
				{
					success: false,
					message: "Too many requests. Please try again later.",
				},
				{ status: 429 },
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

		const address = await createBillingAddress(userId, validationResult.data);

		// Invalidate cache
		await billingAddressesCache.delete(getCacheKey(userId));

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
