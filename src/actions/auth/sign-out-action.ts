"use server";

import { auth } from "@/lib/config/auth";
import { headers } from "next/headers";
import { AuthOperationState } from "./types";

export const SignOutUser = async (): Promise<AuthOperationState> => {
	try {
		await auth.api.signOut({
			headers: await headers(),
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

		return {
			error: "Internal Server Error. Something went wrong",
		};
	}
};
