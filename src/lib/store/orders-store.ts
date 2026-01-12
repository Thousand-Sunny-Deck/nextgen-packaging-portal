import { OrderPayload } from "@/actions/order-delivery/deliver-order-action";
import { prisma } from "@/lib/config/prisma";
import { OrderStatus } from "@/generated/prisma/enums";
import { Order } from "@/generated/prisma/client";

/**
 * Generates a custom order ID in the format: ORD-YYYYMMDD-XXXXX
 * where XXXXX is a random 5-character alphanumeric string
 */
function generateOrderId(): string {
	const timestamp = new Date().toISOString().replace(/[-:T]/g, "").slice(0, 14);
	const randomStr = Math.random().toString(36).substring(2, 7).toUpperCase();
	return `ORD-${timestamp}-${randomStr}`;
}

/**
 * Stores a prepared order in the database with initial states.
 * Creates the Order, OrderItems, and BillingAddress records.
 *
 * @param payload - The order payload containing cart and billing info
 * @param userId - Optional user ID from the session
 * @returns The created Order record
 */
export async function storePreparedOrderInDb(
	payload: OrderPayload,
	userId?: string,
): Promise<Order> {
	const { cart, billingInfo } = payload;
	const { items, extraCartInfo } = cart;

	// Generate custom order ID
	const orderId = generateOrderId();

	// Calculate service fee (convert to Int as per schema)
	const serviceFee = Math.round(extraCartInfo.extraCost.serviceFee || 0);

	// Create order with all related data in a transaction
	const order = await prisma.order.create({
		data: {
			orderId,
			userId: userId || null,
			status: OrderStatus.PENDING,

			// Customer information
			customerEmail: billingInfo.email,
			customerOrganization: billingInfo.organization,

			// Order totals
			serviceFee,
			totalOrderCost: extraCartInfo.totalCost,
			cartSubTotal: extraCartInfo.subTotal,
			cartSize: extraCartInfo.cartSize,

			// Initial states (defaults are set in schema, but being explicit)
			invoiceGenerated: false,
			emailSent: false,

			// timestamps
			createdAt: new Date(),

			// Create related order items
			items: {
				create: items.map((item) => ({
					sku: item.sku,
					quantity: item.quantity,
					description: item.description,
					total: item.total,
					unitCost: item.unitCost,
				})),
			},

			// Create billing address
			billingAddress: {
				create: {
					email: billingInfo.email,
					organization: billingInfo.organization,
					address: billingInfo.address,
					ABN: billingInfo.ABN,
				},
			},
		},
		include: {
			items: true,
			billingAddress: true,
		},
	});

	return order;
}

/**
 * Fetches all orders for a given user.
 * Orders are returned with their related items and billing address.
 *
 * @param userId - The user ID to fetch orders for
 * @returns Array of Order records ordered by creation date (most recent first)
 */
export async function fetchOrdersForUser(userId: string) {
	const orders = await prisma.order.findMany({
		where: {
			userId,
		},
		include: {
			items: true,
			billingAddress: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return orders;
}

/**
 * Fetches a single order by orderId and userId.
 * Returns the order with its related items, billing address, and status.
 *
 * @param orderId - The order ID to fetch
 * @param userId - The user ID to verify ownership
 * @returns The Order record with items, billingAddress, and status, or null if not found
 */
export async function fetchOrderByUserAndOrderId(
	orderId: string,
	userId: string,
) {
	const order = await prisma.order.findFirst({
		where: {
			orderId,
			userId,
		},
		include: {
			items: true,
			billingAddress: true,
		},
	});

	return order;
}

export async function updateStateForOrder(
	orderId: string,
	userId: string,
	state: OrderStatus,
) {
	await prisma.order.update({
		where: {
			orderId,
			userId,
		},
		data: {
			status: state,
			updatedAt: new Date(),
		},
	});
}

export async function removeOrderFromDb(orderId: string, userId: string) {
	await prisma.order.delete({
		where: {
			orderId,
			userId,
		},
	});
}
