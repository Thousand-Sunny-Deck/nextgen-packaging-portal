import { NextRequest, NextResponse } from "next/server";
import { handlePdfRequest, validatePdfAccess } from "./utilts";

/**
 * HEAD /api/pdf?orderId=xxx
 * Lightweight validation check - verifies access without downloading the PDF.
 */
export async function HEAD(request: NextRequest) {
	try {
		const orderId = request.nextUrl.searchParams.get("orderId");
		const result = await validatePdfAccess(request, orderId);
		return new NextResponse(null, { status: result.status });
	} catch {
		return new NextResponse(null, { status: 500 });
	}
}

/**
 * GET /api/pdf?orderId=xxx
 * Opens PDF directly in browser with proper filename in tab title.
 */
export async function GET(request: NextRequest) {
	try {
		const orderId = request.nextUrl.searchParams.get("orderId");
		return await handlePdfRequest(request, orderId);
	} catch (err: unknown) {
		return NextResponse.json(
			{
				err,
				message: "Something went wrong",
			},
			{ status: 500 },
		);
	}
}

/**
 * POST /api/pdf
 * Alternative endpoint for programmatic access.
 */
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { orderId } = body;
		return await handlePdfRequest(request, orderId);
	} catch (err: unknown) {
		return NextResponse.json(
			{
				err,
				message: "Something went wrong",
			},
			{ status: 500 },
		);
	}
}
