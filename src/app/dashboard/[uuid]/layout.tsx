import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
import { DashboardCartSheet } from "@/components/dashboard/DashboardCartSheet";

interface DashboardLayoutProps {
	children: React.ReactNode;
	params: Promise<{ uuid: string }>;
}

export default async function DashboardLayout({
	children,
	params,
}: DashboardLayoutProps) {
	const { uuid } = await params;

	return (
		<>
			<DashboardNavbar uuid={uuid} />
			<DashboardCartSheet uuid={uuid} />
			<main>{children}</main>
		</>
	);
}
