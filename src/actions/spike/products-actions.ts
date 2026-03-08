"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/config/prisma";

export type SpikeAdminProduct = {
	id: string;
	sku: string;
	handle: string;
	description: string;
	unitCost: number;
	createdAt: string;
};

export type GetProductsParams = {
	page?: number;
	pageSize?: number;
	search?: string;
};

export type GetProductsResult = {
	products: SpikeAdminProduct[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

const MAX_PAGE_SIZE = 100;

export async function getSpikeProducts(
	params: GetProductsParams = {},
): Promise<GetProductsResult> {
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
					{ sku: { contains: sanitizedSearch, mode: "insensitive" as const } },
					{
						description: {
							contains: sanitizedSearch,
							mode: "insensitive" as const,
						},
					},
				],
			}
		: {};

	const [total, rows] = await prisma.$transaction([
		prisma.product.count({ where }),
		prisma.product.findMany({
			where,
			skip,
			take: sanitizedPageSize,
			orderBy: { createdAt: "desc" },
			select: {
				id: true,
				sku: true,
				handle: true,
				description: true,
				unitCost: true,
				createdAt: true,
			},
		}),
	]);

	const products: SpikeAdminProduct[] = rows.map((product) => ({
		id: product.id,
		sku: product.sku,
		handle: product.handle,
		description: product.description,
		unitCost: Number(product.unitCost),
		createdAt: product.createdAt.toISOString(),
	}));

	return {
		products,
		total,
		page: sanitizedPage,
		pageSize: sanitizedPageSize,
		totalPages: Math.ceil(total / sanitizedPageSize),
	};
}
