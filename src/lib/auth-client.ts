import { createAuthClient } from "better-auth/react";
import { env } from "./env-validation/env";

export const authClient = createAuthClient({
	baseURL: env.BETTER_AUTH_URL,
});

export const { signIn, signOut, getSession } = authClient;
