"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/config/prisma";
import { UserRole } from "@/generated/prisma/enums";

// ============================================
// TYPES
// ============================================

export type BillingAddressInfo = {
	id: string;
	email: string;
	organization: string;
	address: string;
	ABN: string;
};

export type EntitlementUser = {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	createdAt: Date;
	billingAddresses: BillingAddressInfo[];
};

export type UserEntitlement = {
	id: string;
	grantedAt: Date;
	grantedBy: string | null;
	// Product base values
	productId: string;
	productSku: string;
	productDescription: string;
	productUnitCost: number;
	productImageUrl: string | null;
	// Custom overrides (null = use product default)
	customSku: string | null;
	customDescription: string | null;
	customUnitCost: number | null;
	customImageUrl: string | null;
};

// ============================================
// USER SEARCH & UPDATE
// ============================================

export async function searchUserByEmail(
	email: string,
): Promise<{ user: EntitlementUser | null }> {
	await requireAdmin();

	if (!email.trim()) {
		return { user: null };
	}

	const user = await prisma.user.findFirst({
		where: {
			email: {
				equals: email.trim().toLowerCase(),
				mode: "insensitive",
			},
		},
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			createdAt: true,
			billingAddresses: {
				select: {
					id: true,
					email: true,
					organization: true,
					address: true,
					ABN: true,
				},
				orderBy: { createdAt: "desc" },
			},
		},
	});

	if (!user) {
		return { user: null };
	}

	return {
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			createdAt: user.createdAt,
			billingAddresses: user.billingAddresses,
		},
	};
}

export type UpdateUserInput = {
	name?: string;
	role?: UserRole;
};

export type UpdateUserResult = {
	success: boolean;
	error?: string;
};

export async function updateUserDetails(
	userId: string,
	input: UpdateUserInput,
): Promise<UpdateUserResult> {
	await requireAdmin();

	try {
		await prisma.user.update({
			where: { id: userId },
			data: {
				...(input.name !== undefined && { name: input.name.trim() }),
				...(input.role !== undefined && { role: input.role }),
			},
		});

		return { success: true };
	} catch (error: unknown) {
		console.error("Failed to update user:", error);

		if (error instanceof Error) {
			if (error.message.includes("Record to update not found")) {
				return { success: false, error: "User not found" };
			}
			return { success: false, error: error.message };
		}

		return { success: false, error: "Failed to update user" };
	}
}

// ============================================
// ENTITLEMENTS
// ============================================

export async function getUserEntitlements(
	userId: string,
): Promise<{ entitlements: UserEntitlement[] }> {
	await requireAdmin();

	const entitlements = await prisma.userProductEntitlement.findMany({
		where: { userId },
		orderBy: { grantedAt: "desc" },
		select: {
			id: true,
			grantedAt: true,
			grantedBy: true,
			customSku: true,
			customDescription: true,
			customUnitCost: true,
			customImageUrl: true,
			product: {
				select: {
					id: true,
					sku: true,
					description: true,
					unitCost: true,
					imageUrl: true,
				},
			},
		},
	});

	return {
		entitlements: entitlements.map((e) => ({
			id: e.id,
			grantedAt: e.grantedAt,
			grantedBy: e.grantedBy,
			productId: e.product.id,
			productSku: e.product.sku,
			productDescription: e.product.description,
			productUnitCost: e.product.unitCost,
			productImageUrl: e.product.imageUrl,
			customSku: e.customSku,
			customDescription: e.customDescription,
			customUnitCost: e.customUnitCost,
			customImageUrl: e.customImageUrl,
		})),
	};
}

export type GrantEntitlementInput = {
	userId: string;
	productId: string;
	customSku?: string;
	customDescription?: string;
	customUnitCost?: number;
	customImageUrl?: string;
};

export type EntitlementResult = {
	success: boolean;
	error?: string;
};

export async function grantEntitlement(
	input: GrantEntitlementInput,
): Promise<EntitlementResult> {
	const adminSession = await requireAdmin();

	try {
		await prisma.userProductEntitlement.create({
			data: {
				userId: input.userId,
				productId: input.productId,
				grantedBy: adminSession.userId,
				customSku: input.customSku ?? null,
				customDescription: input.customDescription ?? null,
				customUnitCost: input.customUnitCost ?? null,
				customImageUrl: input.customImageUrl ?? null,
			},
		});

		return { success: true };
	} catch (error: unknown) {
		console.error("Failed to grant entitlement:", error);

		if (error instanceof Error) {
			if (error.message.includes("Unique constraint")) {
				return {
					success: false,
					error: "User already has this product entitlement",
				};
			}
			return { success: false, error: error.message };
		}

		return { success: false, error: "Failed to grant entitlement" };
	}
}

export async function revokeEntitlement(
	entitlementId: string,
): Promise<EntitlementResult> {
	await requireAdmin();

	try {
		await prisma.userProductEntitlement.delete({
			where: { id: entitlementId },
		});

		return { success: true };
	} catch (error: unknown) {
		console.error("Failed to revoke entitlement:", error);

		if (error instanceof Error) {
			if (error.message.includes("Record to delete does not exist")) {
				return { success: false, error: "Entitlement not found" };
			}
			return { success: false, error: error.message };
		}

		return { success: false, error: "Failed to revoke entitlement" };
	}
}

export type UpdateEntitlementInput = {
	customSku?: string | null;
	customDescription?: string | null;
	customUnitCost?: number | null;
	customImageUrl?: string | null;
};

export async function updateEntitlement(
	entitlementId: string,
	input: UpdateEntitlementInput,
): Promise<EntitlementResult> {
	await requireAdmin();

	try {
		await prisma.userProductEntitlement.update({
			where: { id: entitlementId },
			data: {
				...(input.customSku !== undefined && { customSku: input.customSku }),
				...(input.customDescription !== undefined && {
					customDescription: input.customDescription,
				}),
				...(input.customUnitCost !== undefined && {
					customUnitCost: input.customUnitCost,
				}),
				...(input.customImageUrl !== undefined && {
					customImageUrl: input.customImageUrl,
				}),
			},
		});

		return { success: true };
	} catch (error: unknown) {
		console.error("Failed to update entitlement:", error);

		if (error instanceof Error) {
			if (error.message.includes("Record to update not found")) {
				return { success: false, error: "Entitlement not found" };
			}
			return { success: false, error: error.message };
		}

		return { success: false, error: "Failed to update entitlement" };
	}
}
