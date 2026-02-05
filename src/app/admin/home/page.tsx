import { LayoutDashboard } from "lucide-react";

export default function AdminHomePage() {
	return (
		<div className="p-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
				<p className="text-gray-500 mt-1">Overview of your platform metrics</p>
			</div>

			{/* Placeholder for metrics */}
			<div className="rounded-lg border border-dashed border-gray-300 p-8">
				<div className="text-center">
					<LayoutDashboard className="mx-auto h-12 w-12 text-gray-400" />
					<h3 className="mt-4 text-lg font-medium text-gray-900">
						Metrics Dashboard
					</h3>
					<p className="mt-2 text-sm text-gray-500">
						View total users, orders, revenue, and success rates.
					</p>
					<div className="mt-4 text-xs text-gray-400">
						{/* TODO: Implement metrics dashboard with:
						    - MetricCard components (Total Users, Total Orders, Revenue, Success Rate)
						    - Recent activity feed
						    - Orders by status chart
						    - Top users table
						    - Server actions: getAdminMetrics, getRecentActivity, getTopUsers
						*/}
						Coming soon - focusing on Crafting Table first
					</div>
				</div>
			</div>
		</div>
	);
}
