import { NextRequest, NextResponse } from "next/server";
import { fetchOrderByUserAndOrderId } from "@/lib/store/orders-store";
import { S3Service } from "@/service/s3";
import { auth } from "@/lib/config/auth";

/**
 * Shared logic for fetching and returning a PDF invoice.
 * Authenticates the user and verifies they own the order.
 */
export async function handlePdfRequest(
	request: NextRequest,
	orderId: string | null,
): Promise<NextResponse> {
	// Authenticate user from session - never trust userId from client
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

	// Validate required fields
	if (!orderId || typeof orderId !== "string") {
		return NextResponse.json(
			{
				success: false,
				message: "orderId is required",
			},
			{ status: 400 },
		);
	}

	// Fetch the order - this verifies the user owns this order
	const order = await fetchOrderByUserAndOrderId(orderId, userId);

	if (!order) {
		return NextResponse.json(
			{
				success: false,
				message: "Order not found",
			},
			{ status: 404 },
		);
	}

	const s3 = new S3Service();
	const key = `invoices/${orderId}.pdf`;
	if (!(await s3.fileExists(key))) {
		return NextResponse.json(
			{
				success: false,
				message: "pdf not found.",
			},
			{ status: 404 },
		);
	}

	const pdfBuffer = await s3.getFile(key);
	const pdfUint8Array = new Uint8Array(pdfBuffer);

	return new NextResponse(pdfUint8Array, {
		status: 200,
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `inline; filename="invoice-${orderId}.pdf"`,
		},
	});
}

/**
 * Validates that the user can access the PDF without fetching the actual file.
 * Used for pre-flight checks before opening the PDF in a new tab.
 */
export async function validatePdfAccess(
	request: NextRequest,
	orderId: string | null,
): Promise<NextResponse> {
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	if (!session || !session.user) {
		return NextResponse.json(
			{ success: false, message: "Unauthorized" },
			{ status: 401 },
		);
	}

	if (!orderId || typeof orderId !== "string") {
		return NextResponse.json(
			{ success: false, message: "orderId is required" },
			{ status: 400 },
		);
	}

	const order = await fetchOrderByUserAndOrderId(orderId, session.user.id);
	if (!order) {
		return NextResponse.json(
			{ success: false, message: "Order not found" },
			{ status: 404 },
		);
	}

	const s3 = new S3Service();
	const key = `invoices/${orderId}.pdf`;
	if (!(await s3.fileExists(key))) {
		return NextResponse.json(
			{ success: false, message: "Invoice PDF not found" },
			{ status: 404 },
		);
	}

	return NextResponse.json({ success: true }, { status: 200 });
}
