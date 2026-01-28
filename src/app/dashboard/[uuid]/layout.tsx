"use client";

import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<DashboardNavbar />
			<main className="pt-12">{children}</main>
		</>
	);
}
