"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wrench, ArrowLeft, LogOut } from "lucide-react";
import { authClient } from "@/lib/config/auth-client";
import { useRouter } from "next/navigation";

interface AdminSidebarProps {
	adminName: string;
	adminEmail: string;
}

const navItems = [
	{
		label: "Dashboard",
		href: "/admin/home",
		icon: LayoutDashboard,
	},
	{
		label: "Crafting Table",
		href: "/admin/crafting-table",
		icon: Wrench,
	},
];

export function AdminSidebar({ adminEmail }: AdminSidebarProps) {
	const pathname = usePathname();
	const router = useRouter();

	const handleSignOut = async () => {
		await authClient.signOut();
		router.push("/auth/login");
	};

	return (
		<aside className="w-64 bg-gray-900 text-white flex flex-col">
			{/* Header */}
			<div className="p-4 border-b border-gray-800">
				<h1 className="text-lg font-bold text-orange-400">Admin Portal</h1>
				<p className="text-sm text-gray-400 truncate">{adminEmail}</p>
			</div>

			{/* Navigation */}
			<nav className="flex-1 p-4 space-y-2">
				{navItems.map((item) => {
					const isActive = pathname === item.href;
					return (
						<Link
							key={item.href}
							href={item.href}
							className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
								isActive
									? "bg-orange-500 text-white"
									: "text-gray-300 hover:bg-gray-800 hover:text-white"
							}`}
						>
							<item.icon className="h-5 w-5" />
							{item.label}
						</Link>
					);
				})}
			</nav>

			{/* Footer */}
			<div className="p-4 border-t border-gray-800 space-y-2">
				<Link
					href="/dashboard"
					className="flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors"
				>
					<ArrowLeft className="h-5 w-5" />
					Back to Dashboard
				</Link>
				<button
					onClick={handleSignOut}
					className="w-full flex items-center gap-3 px-3 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-md transition-colors"
				>
					<LogOut className="h-5 w-5" />
					Sign Out
				</button>
			</div>
		</aside>
	);
}
