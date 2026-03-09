import { requireSuperAdmin } from "@/lib/auth/admin-guard";
import { AdminShell } from "./admin-shell";

interface NewAdminLayoutProps {
	children: React.ReactNode;
}

export default async function NewAdminLayout({
	children,
}: NewAdminLayoutProps) {
	await requireSuperAdmin();
	return <AdminShell>{children}</AdminShell>;
}
