"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LogOut, X } from "lucide-react";
import { navGroups } from "./nav-groups";

interface NewAdminSidebarProps {
	isOpen: boolean;
	onClose: () => void;
}

export function NewAdminSidebar({ isOpen, onClose }: NewAdminSidebarProps) {
	const pathname = usePathname();

	return (
		<>
			{/* Mobile backdrop */}
			<div
				className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 md:hidden ${
					isOpen
						? "opacity-100 pointer-events-auto"
						: "opacity-0 pointer-events-none"
				}`}
				onClick={onClose}
				aria-hidden="true"
			/>

			{/* Sidebar */}
			<aside
				className={`fixed md:static inset-y-0 left-0 z-50 w-60 bg-white border-r border-slate-200 flex flex-col min-h-screen
          transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}
			>
				{/* Logo + mobile close button */}
				<div className="p-6 border-b border-slate-200 flex items-center justify-between">
					<span className="text-lg font-bold text-slate-900 tracking-tight">
						NextGen Packaging<span className="text-orange-500">.</span>
					</span>
					<button
						onClick={onClose}
						className="md:hidden h-7 w-7 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
						aria-label="Close navigation"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				{/* Navigation */}
				<nav className="flex-1 p-4 space-y-6 overflow-y-auto">
					{navGroups.map((group) => (
						<div key={group.label}>
							<p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">
								{group.label}
							</p>
							<ul className="space-y-0.5">
								{group.items.map((item) => {
									const isActive = pathname === item.href;
									return (
										<li key={item.href}>
											<Link
												href={item.href}
												onClick={onClose}
												className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors ${
													isActive
														? "text-slate-900 font-medium border-l-2 border-orange-500 bg-slate-50 rounded-l-none pl-[10px]"
														: "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
												}`}
											>
												<item.icon className="h-4 w-4 shrink-0" />
												{item.label}
											</Link>
										</li>
									);
								})}
							</ul>
						</div>
					))}
				</nav>

				{/* Footer */}
				<div className="p-4 border-t border-slate-200 space-y-1">
					<div className="flex items-center gap-3 px-3 py-2 mb-2">
						<div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
							AD
						</div>
						<div className="min-w-0">
							{/* TODO: get user details and truncate the email if too big*/}
							<p className="text-sm font-medium text-slate-900 truncate">
								Admin User
							</p>
							<p className="text-xs text-slate-500 truncate">
								admin@company.io
							</p>
						</div>
					</div>

					{/* TODO: go back to dashbord using user information in session. */}
					<Link
						href="/dashboard"
						onClick={onClose}
						className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Dashboard
					</Link>
					{/* TODO: sign user out on onclick. */}
					<Link
						href="/auth/login"
						onClick={onClose}
						className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
					>
						<LogOut className="h-4 w-4" />
						Sign Out
					</Link>
				</div>
			</aside>
		</>
	);
}
