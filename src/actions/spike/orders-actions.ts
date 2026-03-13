"use server";

import { requireSuperAdmin } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/config/prisma";
import { OrderStatus } from "@/generated/prisma/enums";

export type OrderActivityItem = {
	id: string;
	sku: string;
	description: string;
	quantity: number;
	unitCost: number;
	total: number;
};

export type OrderActivityRow = {
	id: string;
	orderId: string;
	status: OrderStatus;
	totalOrderCost: number;
	cartSize: number;
	customerOrganization: string;
	createdAt: string;
	user: {
		id: string;
		name: string;
		email: string;
	} | null;
	items: OrderActivityItem[];
};

export type GetOrderActivitiesParams = {
	page?: number;
	pageSize?: number;
	search?: string;
};

export type GetOrderActivitiesResult = {
	activities: OrderActivityRow[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function getOrderActivities(
	params: GetOrderActivitiesParams = {},
): Promise<GetOrderActivitiesResult> {
	await requireSuperAdmin();

	const { page = 1, pageSize = DEFAULT_PAGE_SIZE, search } = params;

	const sanitizedPage = Number.isFinite(page)
		? Math.max(1, Math.floor(page))
		: 1;

	const sanitizedPageSize = Number.isFinite(pageSize)
		? Math.min(MAX_PAGE_SIZE, Math.max(1, Math.floor(pageSize)))
		: DEFAULT_PAGE_SIZE;

	const sanitizedSearch = search?.trim().slice(0, 100);
	const skip = (sanitizedPage - 1) * sanitizedPageSize;

	const where = sanitizedSearch
		? {
				OR: [
					{
						orderId: {
							contains: sanitizedSearch,
							mode: "insensitive" as const,
						},
					},
					{
						customerOrganization: {
							contains: sanitizedSearch,
							mode: "insensitive" as const,
						},
					},
					{
						user: {
							is: {
								name: {
									contains: sanitizedSearch,
									mode: "insensitive" as const,
								},
							},
						},
					},
				],
			}
		: {};

	const [total, rows] = await prisma.$transaction([
		prisma.order.count({ where }),
		prisma.order.findMany({
			where,
			skip,
			take: sanitizedPageSize,
			orderBy: [{ createdAt: "desc" }, { id: "desc" }],
			select: {
				id: true,
				orderId: true,
				status: true,
				totalOrderCost: true,
				cartSize: true,
				customerOrganization: true,
				createdAt: true,
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
				items: {
					select: {
						id: true,
						sku: true,
						description: true,
						quantity: true,
						unitCost: true,
						total: true,
					},
				},
			},
		}),
	]);

	const activities: OrderActivityRow[] = rows.map((row) => ({
		id: row.id,
		orderId: row.orderId,
		status: row.status,
		totalOrderCost: Number(row.totalOrderCost),
		cartSize: row.cartSize,
		customerOrganization: row.customerOrganization,
		createdAt: row.createdAt.toISOString(),
		user: row.user
			? {
					id: row.user.id,
					name: row.user.name,
					email: row.user.email,
				}
			: null,
		items: row.items.map((item) => ({
			id: item.id,
			sku: item.sku,
			description: item.description,
			quantity: item.quantity,
			unitCost: Number(item.unitCost),
			total: Number(item.total),
		})),
	}));

	return {
		activities,
		total,
		page: sanitizedPage,
		pageSize: sanitizedPageSize,
		totalPages: Math.ceil(total / sanitizedPageSize),
	};
}
