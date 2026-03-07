import {
	LayoutDashboard,
	Users,
	Package,
	ShieldCheck,
	Zap,
} from "lucide-react";

export const navGroups = [
	{
		label: "OVERVIEW",
		items: [
			{ label: "Dashboard", href: "/new/admin/home", icon: LayoutDashboard },
		],
	},
	{
		label: "MANAGE",
		items: [
			{ label: "Users", href: "/new/admin/users", icon: Users },
			{ label: "Products", href: "/new/admin/products", icon: Package },
			{
				label: "Entitlements",
				href: "/new/admin/entitlements",
				icon: ShieldCheck,
			},
		],
	},
	{
		label: "TOOLS",
		items: [
			{ label: "Quick Actions", href: "/new/admin/quick-actions", icon: Zap },
		],
	},
];
