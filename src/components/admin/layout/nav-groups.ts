import { LayoutDashboard, Users, Package, ShieldCheck } from "lucide-react";

export const navGroups = [
	{
		label: "OVERVIEW",
		items: [{ label: "Dashboard", href: "/admin/home", icon: LayoutDashboard }],
	},
	{
		label: "MANAGE",
		items: [
			{ label: "Users", href: "/admin/users", icon: Users },
			{ label: "Products", href: "/admin/products", icon: Package },
			{
				label: "Entitlements",
				href: "/admin/entitlements",
				icon: ShieldCheck,
			},
		],
	},
];
