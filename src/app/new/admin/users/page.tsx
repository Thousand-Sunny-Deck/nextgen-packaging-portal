import { UsersClient } from "../../../../components/new-admin/users/users-client";

interface PageProps {
	searchParams: Promise<{ q?: string; page?: string; pageSize?: string }>;
}

export default async function NewAdminUsersPage({ searchParams }: PageProps) {
	const params = await searchParams;

	const search = params.q?.trim() ?? "";
	const page = Number(params.page) || 1;
	const pageSize = Number(params.pageSize) || 20;

	return <UsersClient search={search} page={page} pageSize={pageSize} />;
}
