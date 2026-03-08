"use server";

import { requireAdmin, requireSuperAdmin } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/config/prisma";
import { auth } from "@/lib/config/auth";

export type SpikeAdminUser = {
	id: string;
	name: string;
	email: string;
	role: "USER" | "ADMIN" | "SUPER_ADMIN";
	createdAt: string;
	ordersCount: number;
	entitlementsCount: number;
};

export type GetUsersParams = {
	page?: number;
	pageSize?: number;
	search?: string;
};

export type GetUsersResult = {
	users: SpikeAdminUser[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

const MAX_PAGE_SIZE = 100;

export async function getSpikeUsers(
	params: GetUsersParams = {},
): Promise<GetUsersResult> {
	await requireAdmin();

	const { page = 1, pageSize = 20, search } = params;

	const sanitizedPage = Number.isFinite(page)
		? Math.max(1, Math.floor(page))
		: 1;

	const sanitizedPageSize = Number.isFinite(pageSize)
		? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize)))
		: 20;

	const sanitizedSearch = search?.trim().slice(0, 100);

	const skip = (sanitizedPage - 1) * sanitizedPageSize;

	const where = sanitizedSearch
		? {
				OR: [
					{ name: { contains: sanitizedSearch, mode: "insensitive" as const } },
					{
						email: {
							contains: sanitizedSearch,
							mode: "insensitive" as const,
						},
					},
				],
			}
		: {};

	const [total, rows] = await prisma.$transaction([
		prisma.user.count({ where }),
		prisma.user.findMany({
			where,
			skip,
			take: sanitizedPageSize,
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				name: true,
				email: true,
				role: true,
				createdAt: true,
				_count: {
					select: {
						orders: true,
						entitledProducts: true,
					},
				},
			},
		}),
	]);

	const users: SpikeAdminUser[] = rows.map((user) => ({
		id: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
		createdAt: user.createdAt.toISOString(),
		ordersCount: user._count.orders,
		entitlementsCount: user._count.entitledProducts,
	}));

	return {
		users,
		total,
		page: sanitizedPage,
		pageSize: sanitizedPageSize,
		totalPages: Math.ceil(total / sanitizedPageSize),
	};
}

export type BulkCreateUserEntry = {
	name: string;
	email: string;
	password: string;
};

export type BulkCreateUsersResult =
	| { success: true }
	| { success: false; error: string };

export async function bulkCreateUsers(
	entries: BulkCreateUserEntry[],
): Promise<BulkCreateUsersResult> {
	await requireSuperAdmin();

	if (entries.length === 0 || entries.length > 5) {
		return { success: false, error: "Must provide between 1 and 5 users." };
	}

	// Pre-check: find any emails that already exist in one query
	const emails = entries.map((e) => e.email.trim().toLowerCase());
	const existing = await prisma.user.findMany({
		where: { email: { in: emails } },
		select: { email: true },
	});

	if (existing.length > 0) {
		const conflicts = existing.map((u) => u.email).join(", ");
		return {
			success: false,
			error: `Email${existing.length > 1 ? "s" : ""} already exist: ${conflicts}`,
		};
	}

	// Create sequentially — all-or-nothing intent; pre-check covers the common case
	for (const entry of entries) {
		try {
			await auth.api.signUpEmail({
				body: {
					name: entry.name.trim(),
					email: entry.email.trim(),
					password: entry.password,
				},
			});
		} catch (err) {
			const message =
				err instanceof Error ? err.message : "Unknown error during signup";
			console.error(`[bulkCreateUsers] Failed for ${entry.email}:`, err);
			return {
				success: false,
				error: `Failed to create user "${entry.email}": ${message}`,
			};
		}
	}

	return { success: true };
}
