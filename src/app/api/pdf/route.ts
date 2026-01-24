import { NextRequest, NextResponse } from "next/server";
import { fetchOrderByUserAndOrderId } from "@/lib/store/orders-store";
import { generateInvoicePdf } from "@/lib/pdf/generate-invoice";
import { enrichInvoiceData } from "@/inngest/utils";

// THIS IS TEMP... purely for testing teh invoice template
export async function POST(request: NextRequest) {
	try {
		// Parse the request body
		const body = await request.json();
		const { userId, orderId } = body;

		// Validate required fields
		if (!userId || !orderId) {
			return NextResponse.json(
				{
					success: false,
					message: "userId and orderId are required",
				},
				{ status: 400 },
			);
		}

		// Fetch the order from the database
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

		// Generate PDF buffer
		const pdfBuffer = await generateInvoicePdf(enrichInvoiceData(order));

		// Convert Buffer to Uint8Array for NextResponse
		const pdfUint8Array = new Uint8Array(pdfBuffer);

		// Return PDF with proper headers to open in browser
		return new NextResponse(pdfUint8Array, {
			status: 200,
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `inline; filename="invoice-${orderId}.pdf"`,
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
