import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "../config/prisma";
import { nextCookies } from "better-auth/next-js";
import { Resend } from "resend";
import { env } from "../env-validation/env";
import { PasswordResetEmail } from "../resend/password-reset-template";

const resend = new Resend(env.RESEND_API_KEY);

export const auth = betterAuth({
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	emailAndPassword: {
		enabled: true,
		autoSignIn: false,
		sendResetPassword: async ({ user, url }) => {
			// Don't await to prevent timing attacks (Better Auth recommendation)
			resend.emails.send({
				from: "NextGen Packaging <onboarding@resend.dev>",
				to: user.email,
				subject: "Reset your password",
				react: PasswordResetEmail({
					userName: user.name,
					resetUrl: url,
				}),
			});
		},
		resetPasswordTokenExpiresIn: 60 * 60, // 1 hour in seconds
	},
	advanced: {
		database: {
			generateId: false,
		},
	},
	plugins: [nextCookies()],
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 60 * 60 * 24, // Cache duration in seconds (24 hours)
		},
	},
});
