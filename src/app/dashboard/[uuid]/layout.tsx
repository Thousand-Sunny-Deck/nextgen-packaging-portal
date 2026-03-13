import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
import { DashboardCartSheet } from "@/components/dashboard/DashboardCartSheet";
import { getUserSession } from "@/hooks/use-session";
import { prisma } from "@/lib/config/prisma";

interface DashboardLayoutProps {
	children: React.ReactNode;
	params: Promise<{ uuid: string }>;
}

export default async function DashboardLayout({
	children,
	params,
}: DashboardLayoutProps) {
	const { uuid } = await params;
	const { session } = await getUserSession();

	const currentUser = await prisma.user.findUnique({
		where: { id: session.user.id },
		select: { role: true },
	});

	const showAdminPortalLink = currentUser?.role === "SUPER_ADMIN";

	return (
		<>
			<DashboardNavbar uuid={uuid} showAdminPortalLink={showAdminPortalLink} />
			<DashboardCartSheet uuid={uuid} />
			<main>{children}</main>
		</>
	);
}
