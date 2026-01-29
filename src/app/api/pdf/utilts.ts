import { NextRequest, NextResponse } from "next/server";
import { fetchOrderByUserAndOrderId } from "@/lib/store/orders-store";
import { S3Service } from "@/service/s3";
import { auth } from "@/lib/config/auth";

type ValidationResult =
	| { success: true; s3Key: string; orderId: string }
	| { success: false; response: NextResponse; status: number };

/**
 * Checks if the request is from a browser based on Accept header.
 */
function isBrowserRequest(request: NextRequest): boolean {
	const acceptHeader = request.headers.get("accept") || "";
	return acceptHeader.includes("text/html");
}

/**
 * Returns appropriate error response based on client type.
 * Browsers get redirected to error page, API clients get JSON.
 */
function createErrorResponse(
	request: NextRequest,
	message: string,
	status: number,
): { success: false; response: NextResponse; status: number } {
	if (isBrowserRequest(request)) {
		// Browser request - redirect to appropriate error page
		const errorPage = status === 401 ? "/auth/login" : "/not-found";
		return {
			success: false,
			response: NextResponse.redirect(new URL(errorPage, request.url)),
			status,
		};
	}

	// API request - return JSON
	return {
		success: false,
		response: NextResponse.json({ success: false, message }, { status }),
		status,
	};
}

/**
 * Shared validation logic for PDF access.
 * Authenticates user, validates orderId, verifies ownership, and checks S3.
 * Returns appropriate response type based on client (browser vs API).
 */
async function validatePdfRequest(
	request: NextRequest,
	orderId: string | null,
): Promise<ValidationResult> {
	// Authenticate user from session - never trust userId from client
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	if (!session || !session.user) {
		return createErrorResponse(request, "Unauthorized", 401);
	}

	// Validate required fields
	if (!orderId || typeof orderId !== "string") {
		return createErrorResponse(request, "orderId is required", 400);
	}

	// Fetch the order - this verifies the user owns this order
	const order = await fetchOrderByUserAndOrderId(orderId, session.user.id);
	if (!order) {
		return createErrorResponse(request, "Order not found", 404);
	}

	// Check if PDF exists in S3
	const s3 = new S3Service();
	const s3Key = `invoices/${orderId}.pdf`;
	if (!(await s3.fileExists(s3Key))) {
		return createErrorResponse(request, "Invoice PDF not found", 404);
	}

	return { success: true, s3Key, orderId };
}

/**
 * Validates that the user can access the PDF without fetching the actual file.
 * Used for pre-flight checks (HEAD requests) before opening the PDF in a new tab.
 */
export async function validatePdfAccess(
	request: NextRequest,
	orderId: string | null,
): Promise<NextResponse> {
	const result = await validatePdfRequest(request, orderId);

	if (!result.success) {
		return result.response;
	}

	return NextResponse.json({ success: true }, { status: 200 });
}

/**
 * Fetches and returns the PDF invoice.
 * Authenticates the user and verifies they own the order before serving the file.
 */
export async function handlePdfRequest(
	request: NextRequest,
	orderId: string | null,
): Promise<NextResponse> {
	const result = await validatePdfRequest(request, orderId);

	if (!result.success) {
		return result.response;
	}

	// Fetch the PDF from S3
	const s3 = new S3Service();
	const pdfBuffer = await s3.getFile(result.s3Key);
	const pdfUint8Array = new Uint8Array(pdfBuffer);

	return new NextResponse(pdfUint8Array, {
		status: 200,
		headers: {
			"Content-Type": "application/pdf",
			"Content-Disposition": `inline; filename="invoice-${result.orderId}.pdf"`,
		},
	});
}
