import { Users, Package, ShieldCheck, ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/new-admin/layout/page-header";
import { MetricCard } from "@/components/new-admin/ui/metric-card";
import { ActivityFeed } from "@/components/new-admin/ui/activity-feed";
import { mockActivityItems } from "@/components/new-admin/mock-data";

const metrics = [
	{
		icon: Users,
		label: "Total Users",
		value: "1,204",
		delta: "3%",
		deltaDirection: "up" as const,
	},
	{
		icon: Package,
		label: "Total Products",
		value: "38",
		delta: "1",
		deltaDirection: "up" as const,
	},
	{
		icon: ShieldCheck,
		label: "Active Entitlements",
		value: "4,891",
		delta: "7%",
		deltaDirection: "up" as const,
	},
	{
		icon: ShoppingCart,
		label: "Orders This Month",
		value: "823",
		delta: "2%",
		deltaDirection: "down" as const,
	},
];

export default function NewAdminHomePage() {
	return (
		<div className="p-4 md:p-8">
			<PageHeader title="Dashboard" subtitle="Overview of your platform" />

			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
				{metrics.map((m) => (
					<MetricCard key={m.label} {...m} />
				))}
			</div>

			<div className="mt-8 bg-white rounded-lg border border-slate-200 p-6">
				<h2 className="text-sm font-semibold text-slate-900 mb-6">
					Recent Activity
				</h2>
				<ActivityFeed items={mockActivityItems} />
			</div>
		</div>
	);
}
