import { AdminShell } from "./admin-shell";

interface NewAdminLayoutProps {
	children: React.ReactNode;
}

export default function NewAdminLayout({ children }: NewAdminLayoutProps) {
	return <AdminShell>{children}</AdminShell>;
}
