"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/config/prisma";
import { auth } from "@/lib/config/auth";

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

// Generate a random password
function generateRandomPassword(length = 12): string {
	const chars =
		"abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
	let password = "";
	for (let i = 0; i < length; i++) {
		password += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return password;
}

export type CreateUserInput = {
	name: string;
	email: string;
	password?: string; // Optional - will be generated if not provided
};

export type CreateUserResult = {
	success: boolean;
	error?: string;
};

export async function createUser(
	input: CreateUserInput,
): Promise<CreateUserResult> {
	await requireAdmin();

	const password = input.password || generateRandomPassword();

	try {
		await auth.api.signUpEmail({
			body: {
				name: input.name,
				email: input.email,
				password: password,
			},
		});

		return {
			success: true,
		};
	} catch (error: unknown) {
		console.error("Failed to create user:", error);

		// Check for common errors
		if (error instanceof Error) {
			if (error.message.includes("already exists")) {
				return {
					success: false,
					error: "A user with this email already exists",
				};
			}
			return { success: false, error: error.message };
		}

		return { success: false, error: "Failed to create user" };
	}
}

// TODO: Implement these actions later
// export async function getUserDetails() {}
// export async function updateUserRole() {}
// export async function deleteUser() {}
