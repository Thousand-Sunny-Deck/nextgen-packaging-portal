// Orgs with early access to features, regardless of env flags
const CATALOG_V2_ORG_ALLOWLIST = [
	"6a2cfad8-cd69-4c0d-b4f7-8b1be83fa3e5",
	"92209940-8523-4fa3-ae24-5a02f8d1cf6e",
] as const;

// Dynamic flags (org-aware — env flag OR org allowlist)
export function getFeatureFlags(orgId: string) {
	return {
		catalogV2: (CATALOG_V2_ORG_ALLOWLIST as readonly string[]).includes(orgId),
	};
}
