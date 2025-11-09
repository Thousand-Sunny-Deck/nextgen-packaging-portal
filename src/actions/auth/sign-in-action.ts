"use server";

import { auth } from "@/lib/config/auth";
import { LoginFormSchemaT } from "@/lib/schemas/auth";
import { AuthOperationState } from "./types";
import { APIError } from "better-auth/api";

const fetchUserIdFromResponse = async (res: Response): Promise<string> => {
	const body = await res.json();

	if (body && body.user) {
		return body.user.id as string;
	}

	throw Error("Something went wrong");
};

export const SignInUser = async (
	data: LoginFormSchemaT,
): Promise<AuthOperationState> => {
	try {
		const res = await auth.api.signInEmail({
			body: {
				email: data.email,
				password: data.password,
			},
			asResponse: true,
		});

		const uuid = await fetchUserIdFromResponse(res);

		return {
			success: true,
			user: {
				uuid,
			},
		};
	} catch (e: unknown) {
		if (e instanceof APIError) {
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
		if (e instanceof APIError) {
			return {
				error: e.message,
			};
		}

		return { error: "Internal Server Error. Something went wrong." };
	}
};
