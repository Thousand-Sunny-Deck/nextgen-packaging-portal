import { prisma } from "@/lib/config/prisma";
import { BillingAddress } from "@/generated/prisma/client";

export type BillingAddressInput = {
	email: string;
	organization: string;
	address: string;
	ABN: string;
};

/**
 * Fetches all billing addresses for a user
 */
export async function fetchBillingAddressesForUser(
	userId: string,
): Promise<BillingAddress[]> {
	const addresses = await prisma.billingAddress.findMany({
		where: { userId },
		orderBy: { createdAt: "desc" },
	});
	return addresses;
}

/**
 * Creates a new billing address for a user
 */
export async function createBillingAddress(
	userId: string,
	data: BillingAddressInput,
): Promise<BillingAddress> {
	const address = await prisma.billingAddress.create({
		data: {
			userId,
			email: data.email,
			organization: data.organization,
			address: data.address,
			ABN: data.ABN,
		},
	});
	return address;
}

/**
 * Updates an existing billing address
 * Verifies ownership by userId
 */
export async function updateBillingAddress(
	id: string,
	userId: string,
	data: BillingAddressInput,
): Promise<BillingAddress | null> {
	// First verify ownership
	const existing = await prisma.billingAddress.findFirst({
		where: { id, userId },
	});

	if (!existing) {
		return null;
	}

	const address = await prisma.billingAddress.update({
		where: { id },
		data: {
			email: data.email,
			organization: data.organization,
			address: data.address,
			ABN: data.ABN,
		},
	});
	return address;
}

/**
 * Deletes a billing address
 * Verifies ownership by userId
 */
export async function deleteBillingAddress(
	id: string,
	userId: string,
): Promise<boolean> {
	// First verify ownership
	const existing = await prisma.billingAddress.findFirst({
		where: { id, userId },
	});

	if (!existing) {
		return false;
	}

	await prisma.billingAddress.delete({
		where: { id },
	});
	return true;
}
