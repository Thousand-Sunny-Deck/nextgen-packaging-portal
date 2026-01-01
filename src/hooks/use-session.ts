import { auth } from "@/lib/config/auth";
import { authClient } from "@/lib/config/auth-client";
import { headers } from "next/headers";

class UnauthorizedError extends Error {
	private redirectUrl: string;
	public message: string;

	constructor(message: string, redirectUrl?: string) {
		super(message);
		this.redirectUrl = redirectUrl || "";
		this.message = message;
	}

	public getRedirectUrl(): string {
		return this.redirectUrl;
	}

	public getMessage(): string {
		return this.message;
	}
}

export type SessionType = typeof authClient.$Infer.Session;

type GetUserSessionResponse = {
	session: SessionType;
	error?: UnauthorizedError;
};

export const getUserSession = async (): Promise<GetUserSessionResponse> => {
	const redirectUrl = "/auth/login";

	const session = (await auth.api.getSession({
		headers: await headers(),
	})) as SessionType;

	if (!session) {
		return {
			session,
			error: new UnauthorizedError("Unauthorized", redirectUrl),
		};
	}

	return {
		session,
	};
};
