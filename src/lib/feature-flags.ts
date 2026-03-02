import { env } from "./env-validation/env";

export const featureFlags = {
	catalogV2: env.CATALOG_V2_ENABLED,
} as const;
