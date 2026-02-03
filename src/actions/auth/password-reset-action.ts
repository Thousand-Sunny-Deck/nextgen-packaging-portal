"use server";

import { auth } from "@/lib/config/auth";
import { APIError } from "better-auth/api";

export interface PasswordResetResult {
	success?: boolean;
	error?: string;
}

export async function requestPasswordReset(
	email: string,
): Promise<PasswordResetResult> {
	try {
		await auth.api.forgetPassword({
			body: {
				email,
				redirectTo: "/auth/reset-password",
			},
		});

		// Always return success to prevent email enumeration
		return { success: true };
	} catch (e: unknown) {
		// Log for debugging but don't expose to user
		console.error("Password reset request error:", e);

		// Always return success to prevent email enumeration
		return { success: true };
	}
}

export async function resetPassword(
	token: string,
	newPassword: string,
): Promise<PasswordResetResult> {
	try {
		await auth.api.resetPassword({
			body: {
				token,
				newPassword,
			},
		});

		return { success: true };
	} catch (e: unknown) {
		if (e instanceof APIError) {
			// Handle specific error cases
			if (e.message.includes("invalid") || e.message.includes("expired")) {
				return { error: "This reset link is invalid or has expired." };
			}
			return { error: e.message };
		}

		return { error: "Something went wrong. Please try again." };
	}
}
