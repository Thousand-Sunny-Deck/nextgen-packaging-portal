"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/config/prisma";

export type SpikeEntitlementUser = {
	id: string;
	name: string;
	email: string;
	role: "USER" | "ADMIN" | "SUPER_ADMIN";
	createdAt: string;
	ordersCount: number;
	entitlementsCount: number;
	billingAddresses: {
		id: string;
		email: string;
		organization: string;
		address: string;
		ABN: string;
	}[];
};

export type SpikeUserEntitlementRow = {
	id: string;
	grantedAt: string;
	customSku: string | null;
	customDescription: string | null;
	customUnitCost: number | null;
	product: {
		id: string;
		sku: string;
		handle: string;
		description: string;
		unitCost: number;
	};
};

export type GetSpikeUserEntitledProductsParams = {
	userId: string;
	page?: number;
	pageSize?: number;
	search?: string;
};

export type GetSpikeUserEntitledProductsResult = {
	entitlements: SpikeUserEntitlementRow[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

export type SpikeEntitlementEditInput = {
	entitlementId: string;
	customSku: string | null;
	customDescription: string | null;
	customUnitCost: number | null;
};

export type ApplySpikeEntitlementChangesInput = {
	edits: SpikeEntitlementEditInput[];
	revocations: string[];
};

const MAX_PAGE_SIZE = 100;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function searchSpikeUserByEmail(email: string): Promise<{
	success: boolean;
	user?: SpikeEntitlementUser;
	error?: string;
	notFound?: boolean;
}> {
	await requireAdmin();

	const normalizedEmail = email.trim().toLowerCase();

	if (!normalizedEmail) {
		return { success: false, error: "Email is required." };
	}

	if (!EMAIL_REGEX.test(normalizedEmail)) {
		return { success: false, error: "Enter a valid email address." };
	}

	const user = await prisma.user.findUnique({
		where: { email: normalizedEmail },
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
			},
			_count: {
				select: {
					orders: true,
					entitledProducts: true,
				},
			},
		},
	});

	if (!user) {
		return {
			success: false,
			notFound: true,
			error: "No user found for this email.",
		};
	}

	return {
		success: true,
		user: {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			createdAt: user.createdAt.toISOString(),
			ordersCount: user._count.orders,
			entitlementsCount: user._count.entitledProducts,
			billingAddresses: user.billingAddresses,
		},
	};
}

export async function updateSpikeUserDetails(input: {
	userId: string;
	name: string;
	role: "USER" | "ADMIN" | "SUPER_ADMIN";
}): Promise<{ success: boolean; error?: string }> {
	await requireAdmin();

	const name = input.name.trim();
	if (!name) {
		return { success: false, error: "Name is required." };
	}

	try {
		await prisma.user.update({
			where: { id: input.userId },
			data: {
				name,
				role: input.role,
			},
		});
		return { success: true };
	} catch (error: unknown) {
		console.error("Failed to update spike entitlement user:", error);
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to update user." };
	}
}

export type SpikeAvailableProduct = {
	id: string;
	sku: string;
	description: string;
	unitCost: number;
};

export async function getSpikeAvailableProducts(userId: string): Promise<{
	products: SpikeAvailableProduct[];
	total: number;
}> {
	await requireAdmin();

	const [products, entitlements] = await Promise.all([
		prisma.product.findMany({
			orderBy: { sku: "asc" },
			select: { id: true, sku: true, description: true, unitCost: true },
		}),
		prisma.userProductEntitlement.findMany({
			where: { userId },
			select: { productId: true },
		}),
	]);

	const entitledIds = new Set(entitlements.map((e) => e.productId));
	const available = products
		.filter((p) => !entitledIds.has(p.id))
		.map((p) => ({ ...p, unitCost: Number(p.unitCost) }));

	return { products: available, total: available.length };
}

// ─── Batch Grant Entitlements (all-or-nothing transaction) ───────────────────

export type GrantEntitlementEntry = {
	productId: string;
	customSku: string | null;
	customDescription: string | null;
	customUnitCost: number | null;
};

export async function _batchGrantEntitlements(input: {
	userId: string;
	entries: GrantEntitlementEntry[];
}): Promise<{ success: boolean; error?: string }> {
	const admin = await requireAdmin();

	const { userId, entries } = input;

	if (entries.length === 0) {
		return { success: false, error: "No products selected" };
	}

	try {
		await prisma.$transaction(
			entries.map((entry) =>
				prisma.userProductEntitlement.create({
					data: {
						userId,
						productId: entry.productId,
						grantedBy: admin.userId,
						customSku: entry.customSku,
						customDescription: entry.customDescription,
						customUnitCost: entry.customUnitCost,
					},
				}),
			),
		);

		return { success: true };
	} catch (error: unknown) {
		console.error("Failed to grant entitlements:", error);
		if (error instanceof Error) {
			if (error.message.includes("Unique constraint")) {
				return {
					success: false,
					error: "One or more products are already entitled to this user",
				};
			}
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to grant entitlements" };
	}
}

export async function getSpikeUserEntitledProducts(
	params: GetSpikeUserEntitledProductsParams,
): Promise<GetSpikeUserEntitledProductsResult> {
	await requireAdmin();

	const sanitizedPage = Number.isFinite(params.page)
		? Math.max(1, Math.floor(params.page as number))
		: 1;
	const sanitizedPageSize = Number.isFinite(params.pageSize)
		? Math.min(
				MAX_PAGE_SIZE,
				Math.max(1, Math.floor(params.pageSize as number)),
			)
		: 20;
	const sanitizedSearch = params.search?.trim().slice(0, 100);
	const skip = (sanitizedPage - 1) * sanitizedPageSize;

	const where = {
		userId: params.userId,
		...(sanitizedSearch
			? {
					OR: [
						{
							product: {
								sku: {
									contains: sanitizedSearch,
									mode: "insensitive" as const,
								},
							},
						},
						{
							product: {
								description: {
									contains: sanitizedSearch,
									mode: "insensitive" as const,
								},
							},
						},
						{
							product: {
								handle: {
									contains: sanitizedSearch,
									mode: "insensitive" as const,
								},
							},
						},
						{
							customSku: {
								contains: sanitizedSearch,
								mode: "insensitive" as const,
							},
						},
						{
							customDescription: {
								contains: sanitizedSearch,
								mode: "insensitive" as const,
							},
						},
					],
				}
			: {}),
	};

	const [total, rows] = await prisma.$transaction([
		prisma.userProductEntitlement.count({ where }),
		prisma.userProductEntitlement.findMany({
			where,
			skip,
			take: sanitizedPageSize,
			orderBy: { grantedAt: "desc" },
			select: {
				id: true,
				grantedAt: true,
				customSku: true,
				customDescription: true,
				customUnitCost: true,
				product: {
					select: {
						id: true,
						sku: true,
						handle: true,
						description: true,
						unitCost: true,
					},
				},
			},
		}),
	]);

	return {
		entitlements: rows.map((row) => ({
			id: row.id,
			grantedAt: row.grantedAt.toISOString(),
			customSku: row.customSku,
			customDescription: row.customDescription,
			customUnitCost: row.customUnitCost,
			product: {
				id: row.product.id,
				sku: row.product.sku,
				handle: row.product.handle,
				description: row.product.description,
				unitCost: Number(row.product.unitCost),
			},
		})),
		total,
		page: sanitizedPage,
		pageSize: sanitizedPageSize,
		totalPages: Math.ceil(total / sanitizedPageSize),
	};
}

function normalizeNullableString(value: string | null): string | null {
	if (value === null) return null;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : null;
}

export async function applySpikeEntitlementChanges(
	input: ApplySpikeEntitlementChangesInput,
): Promise<{ success: boolean; error?: string }> {
	await requireAdmin();

	const edits = input.edits.map((entry) => ({
		entitlementId: entry.entitlementId,
		customSku: normalizeNullableString(entry.customSku),
		customDescription: normalizeNullableString(entry.customDescription),
		customUnitCost: entry.customUnitCost,
	}));
	const revocations = Array.from(new Set(input.revocations));

	if (edits.length === 0 && revocations.length === 0) {
		return { success: false, error: "No changes to apply." };
	}

	try {
		await prisma.$transaction([
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
			...revocations.map((id) =>
				prisma.userProductEntitlement.delete({
					where: { id },
				}),
			),
		]);

		return { success: true };
	} catch (error: unknown) {
		console.error("Failed to apply spike entitlement changes:", error);
		if (error instanceof Error) {
			return { success: false, error: error.message };
		}
		return { success: false, error: "Failed to apply entitlement changes." };
	}
}
