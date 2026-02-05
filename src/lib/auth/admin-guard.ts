"use server";

import { auth } from "@/lib/config/auth";
import { headers } from "next/headers";
import { prisma } from "@/lib/config/prisma";
import { redirect } from "next/navigation";
import { UserRole } from "@/generated/prisma/enums";

export type AdminSession = {
	userId: string;
	email: string;
	name: string;
	role: UserRole;
};

/**
 * Requires the user to be an ADMIN or SUPER_ADMIN.
 * Redirects to login if not authenticated, or to user dashboard if not admin.
 */
export async function requireAdmin(): Promise<AdminSession> {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/auth/login");
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { id: true, email: true, name: true, role: true },
	});

	if (!user) {
		redirect("/auth/login");
	}

	if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
		redirect(`/dashboard/${session.user.id}/home`);
	}

	return {
		userId: user.id,
		email: user.email,
		name: user.name,
		role: user.role,
	};
}

/**
 * Requires the user to be a SUPER_ADMIN.
 * Use for sensitive operations like managing other admins.
 */
export async function requireSuperAdmin(): Promise<AdminSession> {
	const session = await auth.api.getSession({
		headers: await headers(),
	});

	if (!session?.user) {
		redirect("/auth/login");
	}

	const user = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { id: true, email: true, name: true, role: true },
	});

	if (!user) {
		redirect("/auth/login");
	}

	if (user.role !== "SUPER_ADMIN") {
		redirect(`/dashboard/${session.user.id}/home`);
	}

	return {
		userId: user.id,
		email: user.email,
		name: user.name,
		role: user.role,
	};
}

/**
 * Check if a user is an admin (non-blocking, returns boolean)
 */
export async function isAdmin(userId: string): Promise<boolean> {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { role: true },
	});
	return user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";
}
