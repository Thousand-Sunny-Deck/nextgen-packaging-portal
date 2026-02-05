import { requireAdmin } from "@/lib/auth/admin-guard";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";

interface AdminLayoutProps {
	children: React.ReactNode;
}

export default async function AdminLayout({ children }: AdminLayoutProps) {
	const admin = await requireAdmin();

	return (
		<div className="flex min-h-screen">
			<AdminSidebar adminName={admin.name} adminEmail={admin.email} />
			<main className="flex-1 bg-gray-50">{children}</main>
		</div>
	);
}
