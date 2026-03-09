"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { NewAdminSidebar } from "@/components/admin/layout/sidebar";

export function AdminShell({ children }: { children: React.ReactNode }) {
	const [mobileOpen, setMobileOpen] = useState(false);

	return (
		<div className="flex min-h-screen">
			<NewAdminSidebar
				isOpen={mobileOpen}
				onClose={() => setMobileOpen(false)}
			/>

			<div className="flex-1 flex flex-col bg-slate-50 min-w-0">
				{/* Mobile top bar */}
				<header className="md:hidden sticky top-0 z-30 bg-white border-b border-slate-200 px-4 h-14 flex items-center gap-3 shrink-0">
					<button
						onClick={() => setMobileOpen(true)}
						className="h-8 w-8 flex items-center justify-center rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
						aria-label="Open navigation"
					>
						<Menu className="h-5 w-5" />
					</button>
					<span className="text-base font-bold text-slate-900 tracking-tight">
						NextGen Packaging<span className="text-orange-500">.</span>
					</span>
				</header>

				<main className="flex-1">{children}</main>
			</div>
		</div>
	);
}
