import { notFound, redirect } from "next/navigation";
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";
import { DashboardCartSheet } from "@/components/dashboard/DashboardCartSheet";
import { getUserSession } from "@/hooks/use-session";
import { verifyOrgId } from "@/hooks/use-org-id";
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

	// Guarding here, not just in each page: this used to read session.user.id
	// straight off a possibly-null session, so an anonymous visitor got a 500
	// instead of the login page.
	const { error, session } = await getUserSession();
	if (error) {
		redirect(error.getRedirectUrl());
	}

	// Backstop for the ownership check. Every page under [uuid]/ also calls
	// this, but a new page that forgets to would otherwise serve one customer's
	// dashboard to another.
	const { error: orgIdError } = await verifyOrgId(session, { uuid });
	if (orgIdError) {
		notFound();
	}

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
