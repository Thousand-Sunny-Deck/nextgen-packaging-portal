"use server";

import { auth } from "@/lib/config/auth";
import { LoginFormSchemaT } from "@/lib/schemas/auth";
import { AuthOperationState } from "./types";
import { APIError } from "better-auth/api";

const GENERIC_ERROR = "Something went wrong. Please try again.";

type SignInErrorBody = {
	code?: string;
	message?: string;
};

type SignInSuccessBody = {
	user?: { id?: string };
};

/**
 * Turns a failed sign-in response into a message we're happy to show the user.
 *
 * better-auth reports bad credentials as a 401 rather than throwing, so without
 * this every wrong password used to surface as "Internal Server Error".
 */
const describeSignInFailure = (
	status: number,
	body: SignInErrorBody | null,
): string => {
	if (status === 401 || body?.code === "INVALID_EMAIL_OR_PASSWORD") {
		return "Incorrect email or password. Please try again.";
	}

	if (status === 429) {
		return "Too many sign-in attempts. Please wait a moment and try again.";
	}

	// Anything else better-auth described for us is more useful than a generic
	// message (e.g. "Email not verified"), so pass it through.
	return body?.message ?? GENERIC_ERROR;
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

		const body = (await res.json().catch(() => null)) as
			| (SignInErrorBody & SignInSuccessBody)
			| null;

		if (!res.ok) {
			return { error: describeSignInFailure(res.status, body) };
		}

		const uuid = body?.user?.id;
		if (!uuid) {
			return { error: GENERIC_ERROR };
		}

		return {
			success: true,
			user: {
				uuid,
			},
		};
	} catch (e: unknown) {
		if (e instanceof APIError) {
			return {
				error: describeSignInFailure(e.statusCode, e.body ?? null),
			};
		}

		return {
			error: GENERIC_ERROR,
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
