import {
	LayoutDashboard,
	Users,
	Package,
	ShieldCheck,
	Clock,
	FolderTree,
} from "lucide-react";

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
			{ label: "Categories", href: "/admin/categories", icon: FolderTree },
			{
				label: "Entitlements",
				href: "/admin/entitlements",
				icon: ShieldCheck,
			},
			{
				label: "Pending Approvals",
				href: "/admin/approvals",
				icon: Clock,
			},
		],
	},
];
