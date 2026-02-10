"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/config/prisma";

// ─── Types ───────────────────────────────────────────────────────────────────

export type EntitlementUser = {
	id: string;
	name: string;
	email: string;
	role: "USER" | "ADMIN" | "SUPER_ADMIN";
	billingAddresses: {
		id: string;
		email: string;
		organization: string;
		address: string;
		ABN: string;
	}[];
};

export type UserEntitledProduct = {
	id: string;
	grantedAt: Date;
	grantedBy: string | null;
	customSku: string | null;
	customDescription: string | null;
	customUnitCost: number | null;
	customImageUrl: string | null;
	product: {
		id: string;
		sku: string;
		description: string;
		unitCost: number;
		imageUrl: string | null;
	};
};

// ─── Search User by Email ────────────────────────────────────────────────────

export async function searchUserByEmail(email: string): Promise<{
	success: boolean;
	user?: EntitlementUser;
	error?: string;
}> {
	await requireAdmin();

	if (!email || !email.trim()) {
		return { success: false, error: "Email is required" };
	}

	const user = await prisma.user.findUnique({
		where: { email: email.trim().toLowerCase() },
		select: {
			id: true,
			name: true,
			email: true,
			role: true,
			billingAddresses: {
				select: {
					id: true,
					email: true,
					organization: true,
					address: true,
					ABN: true,
				},
			},
		},
	});

	if (!user) {
		return { success: false, error: "No user found with this email" };
	}

	return {
		success: true,
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			billingAddresses: user.billingAddresses,
		},
	};
}

// ─── Update User Details ─────────────────────────────────────────────────────

export type UpdateUserInput = {
	userId: string;
	name: string;
	role: "USER" | "ADMIN" | "SUPER_ADMIN";
};

export async function updateUserDetails(input: UpdateUserInput): Promise<{
	success: boolean;
	error?: string;
}> {
	await requireAdmin();

	if (!input.name.trim()) {
		return { success: false, error: "Name is required" };
	}

	try {
		await prisma.user.update({
			where: { id: input.userId },
			data: {
				name: input.name.trim(),
				role: input.role,
			},
		});

		return { success: true };
	} catch (error: unknown) {
		console.error("Failed to update user:", error);
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to update user" };
	}
}

// ─── Get User Entitled Products ──────────────────────────────────────────────

export async function getUserEntitledProducts(userId: string): Promise<{
	products: UserEntitledProduct[];
	total: number;
}> {
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
		products: entitlements,
		total: entitlements.length,
	};
}

// ─── Batch Apply Changes (all-or-nothing transaction) ────────────────────────

export type EntitlementEdit = {
	entitlementId: string;
	customSku: string | null;
	customDescription: string | null;
	customUnitCost: number | null;
};

export async function applyEntitlementChanges(input: {
	edits: EntitlementEdit[];
	revocations: string[];
}): Promise<{ success: boolean; error?: string }> {
	await requireAdmin();

	const { edits, revocations } = input;

	if (edits.length === 0 && revocations.length === 0) {
		return { success: false, error: "No changes to apply" };
	}

	try {
		await prisma.$transaction([
			// Update custom fields for each edited entitlement
			...edits.map((edit) =>
				prisma.userProductEntitlement.update({
					where: { id: edit.entitlementId },
					data: {
						customSku: edit.customSku,
						customDescription: edit.customDescription,
						customUnitCost: edit.customUnitCost,
					},
				}),
			),
			// Delete revoked entitlements
			...revocations.map((id) =>
				prisma.userProductEntitlement.delete({
					where: { id },
				}),
			),
		]);

		return { success: true };
	} catch (error: unknown) {
		console.error("Failed to apply entitlement changes:", error);
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to apply changes" };
	}
}
