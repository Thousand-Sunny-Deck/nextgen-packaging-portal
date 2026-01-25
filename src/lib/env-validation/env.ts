import { createEnv } from "@t3-oss/env-nextjs";
import z from "zod";

export const env = createEnv({
	server: {
		DATABASE_URL: z.url(),
		BETTER_AUTH_SECRET: z.string(),
		NGP_ACC: z.string(),
		NGP_BSB: z.string(),
		AWS_REGION: z.string(),
		AWS_ACCESS_KEY_ID: z.string(),
		AWS_SECRET_ACCESS_KEY: z.string(),
		AWS_S3_BUCKET_NAME: z.string(),
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
		AWS_REGION: process.env.AWS_REGION as string,
		AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID as string,
		AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY as string,
		AWS_S3_BUCKET_NAME: process.env.AWS_S3_BUCKET_NAME as string,
	},
});
