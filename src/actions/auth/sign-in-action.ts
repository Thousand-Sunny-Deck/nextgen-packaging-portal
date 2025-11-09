"use server";

import { auth } from "@/lib/config/auth";
import { LoginFormSchemaT } from "@/lib/schemas/auth";
import { AuthOperationState } from "./types";

export const SignInUser = async (
	data: LoginFormSchemaT,
): Promise<AuthOperationState> => {
	try {
		await auth.api.signInEmail({
			body: {
				email: data.email,
				password: data.password,
			},
		});
		return { success: true };
	} catch (e: unknown) {
		if (e instanceof Error) {
			return {
				error: e.message,
			};
		}

		return {
			error: "Internal Server Error. Something went wrong.",
		};
	}
};

export const SignUpUser = async (
	data: LoginFormSchemaT,
): Promise<AuthOperationState> => {
	try {
		await auth.api.signUpEmail({
			body: {
				name: "",
				email: data.email,
				password: data.password,
			},
		});

		return {
			success: true,
		};
	} catch (e: unknown) {
		if (e instanceof Error) {
			return {
				error: e.message,
			};
		}

		return { error: "Internal Server Error. Something went wrong." };
	}
};
