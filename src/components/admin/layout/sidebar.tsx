"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, LogOut, X } from "lucide-react";
import { navGroups } from "./nav-groups";
import { SignOutUser } from "@/actions/auth/sign-out-action";
import { toast } from "sonner";

interface AdminSidebarProps {
	isOpen: boolean;
	onClose: () => void;
	user: {
		userId: string;
		name: string;
		email: string;
	};
}

const getInitials = (name: string): string => {
	const trimmedName = name.trim();

	if (!trimmedName) {
		return "AD";
	}

	const nameParts = trimmedName
		.split(/\s+/)
		.map((part) => part.trim())
		.filter(Boolean);

	if (nameParts.length >= 2) {
		return `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase();
	}

	const firstPart = nameParts[0];
	return firstPart.slice(0, 2).toUpperCase();
};

export function AdminSidebar({ isOpen, onClose, user }: AdminSidebarProps) {
	const pathname = usePathname();
	const router = useRouter();
	const [isSigningOut, setIsSigningOut] = useState(false);

	const handleSignOut = async () => {
		if (isSigningOut) {
			return;
		}

		setIsSigningOut(true);
		const { error } = await SignOutUser();

		if (error) {
			setIsSigningOut(false);
			toast.error(error);
			return;
		}

		onClose();
		router.replace("/auth/login");
	};

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
							{getInitials(user.name)}
						</div>
						<div className="min-w-0">
							<p className="text-sm font-medium text-slate-900 truncate">
								{user.name}
							</p>
							<p className="text-xs text-slate-500 truncate">{user.email}</p>
						</div>
					</div>

					<Link
						href={`/dashboard/${user.userId}/home`}
						onClick={onClose}
						className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to Dashboard
					</Link>

					<button
						type="button"
						onClick={handleSignOut}
						disabled={isSigningOut}
						className="flex items-center gap-3 px-3 py-2 text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
					>
						<LogOut className="h-4 w-4" />
						{isSigningOut ? "Signing Out..." : "Sign Out"}
					</button>
				</div>
			</aside>
		</>
	);
}
