import { createAuthClient } from "better-auth/react";
import { env } from "./env-validation/env";

export const authClient = createAuthClient({
	baseURL: env.NEXT_PUBLIC_BETTER_AUTH_URL,
});

export const { signIn, signOut } = authClient;
