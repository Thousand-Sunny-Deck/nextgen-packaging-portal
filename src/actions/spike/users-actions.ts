"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/config/prisma";

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
