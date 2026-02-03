import z from "zod";
import { auth } from "../config/auth";

export const LoginFormSchema = z.object({
	email: z.email(),
	password: z.string().min(6),
});

export type LoginFormSchemaT = z.infer<typeof LoginFormSchema>;

export const ForgotPasswordSchema = z.object({
	email: z.email(),
});

export type ForgotPasswordSchemaT = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
	.object({
		password: z.string().min(6, "Password must be at least 6 characters"),
		confirmPassword: z.string().min(6),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

export type ResetPasswordSchemaT = z.infer<typeof ResetPasswordSchema>;

export type BetterAuthSessionModel = typeof auth.$Infer.Session;
