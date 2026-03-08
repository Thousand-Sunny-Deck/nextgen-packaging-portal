import { EntitlementsClient } from "@/components/new-admin/entitlements/entitlements-client";

interface PageProps {
	searchParams: Promise<{
		email?: string;
		q?: string;
		page?: string;
		pageSize?: string;
		loaded?: string;
	}>;
}

export default async function NewAdminEntitlementsPage({
	searchParams,
}: PageProps) {
	const params = await searchParams;

	const email = params.email?.trim().toLowerCase() ?? "";
	const search = params.q?.trim() ?? "";
	const page = Number(params.page) || 1;
	const pageSize = Number(params.pageSize) || 20;
	const loaded = params.loaded === "1";

	return (
		<EntitlementsClient
			email={email}
			search={search}
			page={page}
			pageSize={pageSize}
			loaded={loaded}
		/>
	);
}
