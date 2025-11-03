import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { env } from "./env-validation/env";

// this will not throw an error as we are accessing a server "env" in server component.
console.log(env.BETTER_AUTH_URL);

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
});
