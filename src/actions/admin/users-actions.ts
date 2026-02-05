"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/config/prisma";

export type AdminUser = {
	id: string;
	name: string;
	email: string;
	role: "USER" | "ADMIN" | "SUPER_ADMIN";
	createdAt: Date;
	ordersCount: number;
	entitlementsCount: number;
};

export async function getUsers(): Promise<{
	users: AdminUser[];
	total: number;
}> {
	await requireAdmin();

	// Fetch all users - filtering is done client-side with TanStack Table
	const users = await prisma.user.findMany({
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
	});

	return {
		users: users.map((user) => ({
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			createdAt: user.createdAt,
			ordersCount: user._count.orders,
			entitlementsCount: user._count.entitledProducts,
		})),
		total: users.length,
	};
}

// TODO: Implement these actions later
// export async function getUserDetails() {}
// export async function createUser() {}
// export async function updateUserRole() {}
// export async function deleteUser() {}
