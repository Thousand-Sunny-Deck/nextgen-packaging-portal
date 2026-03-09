import { Users, Package, ShoppingCart, Calendar } from "lucide-react";
import { PageHeader } from "@/components/new-admin/layout/page-header";
import { MetricCard } from "@/components/new-admin/ui/metric-card";
import { getAdminDashboardMetrics } from "@/actions/spike/dashboard-actions";

const numberFormatter = new Intl.NumberFormat("en-US");

export default async function NewAdminHomePage() {
	const metricsData = await getAdminDashboardMetrics();
	const metrics = [
		{
			icon: Users,
			label: "Total Users",
			value: numberFormatter.format(metricsData.totalUsers),
		},
		{
			icon: Package,
			label: "Total Products",
			value: numberFormatter.format(metricsData.totalProducts),
		},
		{
			icon: ShoppingCart,
			label: "Total Orders",
			value: numberFormatter.format(metricsData.totalOrders),
		},
		{
			icon: Calendar,
			label: "Total Orders This Month",
			value: numberFormatter.format(metricsData.totalOrdersThisMonth),
		},
	];

	return (
		<div className="p-4 md:p-8">
			<PageHeader title="Dashboard" subtitle="Overview of your platform" />

			<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
				{metrics.map((m) => (
					<MetricCard key={m.label} {...m} />
				))}
			</div>
		</div>
	);
}
