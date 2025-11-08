import z from "zod";
import { auth } from "../config/auth";

export const LoginFormSchema = z.object({
	email: z.email(),
	password: z.string().min(6),
});

export type LoginFormSchemaT = z.infer<typeof LoginFormSchema>;

export type BetterAuthSessionModel = typeof auth.$Infer.Session;
