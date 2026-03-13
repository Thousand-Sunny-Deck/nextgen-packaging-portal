import { PageHeader } from "@/components/admin/layout/page-header";
import { PendingApprovalsClient } from "@/components/admin/approvals/pending-approvals-client";

interface PageProps {
	searchParams: Promise<{ q?: string; page?: string; pageSize?: string }>;
}

export default async function PendingApprovalsPage({
	searchParams,
}: PageProps) {
	const params = await searchParams;
	const search = params.q?.trim() ?? "";
	const page = Number(params.page) || 1;
	const pageSize = Number(params.pageSize) || 20;

	return (
		<div className="p-4 md:p-8">
			<PageHeader
				title="Pending Approvals"
				subtitle="Orders awaiting your review before processing"
			/>
			<PendingApprovalsClient search={search} page={page} pageSize={pageSize} />
		</div>
	);
}
