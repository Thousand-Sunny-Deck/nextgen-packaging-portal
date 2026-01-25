import { env } from "@/lib/env-validation/env";
import { InvoiceData } from "@/lib/pdf/types";
import { OrderDetailsForOrderId as OrderDetails } from "@/lib/store/orders-store";

interface EventData {
	orderId?: unknown;
	userId?: unknown;
	email?: unknown;
}

interface ParsedAddress {
	streetAddress: string;
	suburb: string;
	postcode: string;
	country: string;
}

/**
 * Parses an address string in the format: "Street Address, Suburb, State, Postcode, Country"
 * @param address - The address string to parse
 * @returns Parsed address object with separate fields
 */
function parseAddress(address: string): ParsedAddress {
	const parts = address.split(",").map((part) => part.trim());

	// Default values if parsing fails
	const defaultAddress: ParsedAddress = {
		streetAddress: address,
		suburb: "",
		postcode: "",
		country: "",
	};

	if (parts.length < 4) {
		return defaultAddress;
	}

	return {
		streetAddress: parts[0] || "",
		suburb: parts[1] || "",
		postcode: parts[2] || "",
		country: parts[3] || "",
	};
}

export const validateEventData = (data: unknown): boolean => {
	if (!data || typeof data !== "object") {
		return false;
	}

	const eventData = data as EventData;

	if (!eventData.orderId || typeof eventData.orderId !== "string") {
		return false;
	}

	if (!eventData.userId || typeof eventData.userId !== "string") {
		return false;
	}

	if (!eventData.email || typeof eventData.email !== "string") {
		return false;
	}

	return true;
};

export const enrichInvoiceData = (order: OrderDetails): InvoiceData => {
	const issueDate = new Date(order.createdAt).toLocaleDateString();
	const dueDate = new Date(
		order.createdAt.getTime() + 14 * 24 * 60 * 60 * 1000,
	).toLocaleDateString();

	const addressString = order.billingAddress?.address || "";
	const parsedAddress = parseAddress(addressString);

	const invoiceData: InvoiceData = {
		invoiceNumber: order.orderId,
		issueDate: issueDate,
		dueDate: dueDate,
		billTo: {
			name: order.customerEmail,
			company: order.billingAddress?.organization || "",
			streetAddress: parsedAddress.streetAddress,
			suburb: parsedAddress.suburb,
			postcode: parsedAddress.postcode,
			country: parsedAddress.country,
		},
		shipTo: {
			name: order.customerEmail,
			company: order.billingAddress?.organization || "",
			streetAddress: parsedAddress.streetAddress,
			suburb: parsedAddress.suburb,
			postcode: parsedAddress.postcode,
			country: parsedAddress.country,
		},
		items: order.items.map((item) => ({
			description: item.description,
			qty: item.quantity,
			unitPrice: item.unitCost,
			itemId: item.sku,
			amount: item.total,
		})),
		subtotal: order.cartSubTotal,
		tax: 0, // need to update this
		total: order.totalOrderCost,
		totalPaid: 0,
		balanceDue: order.totalOrderCost,
		bankDetails: {
			bank: "COMMONWEALTH BANK",
			name: "NEXTGEN PACKAGING",
			bsb: env.NGP_BSB,
			account: env.NGP_ACC,
			reference: order.orderId,
		},
	};

	return invoiceData;
};
