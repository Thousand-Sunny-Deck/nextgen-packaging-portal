import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.url(),
		BETTER_AUTH_SECRET: z.string(),
		NGP_ACC: z.string(),
		NGP_BSB: z.string(),
	},
	client: {
		NEXT_PUBLIC_API_URL: z.url(),
		NEXT_PUBLIC_BETTER_AUTH_URL: z.url(),
	},
	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
		NGP_ACC: process.env.NGP_ACC as string,
		NGP_BSB: process.env.NGP_BSB as string,
	},
});
