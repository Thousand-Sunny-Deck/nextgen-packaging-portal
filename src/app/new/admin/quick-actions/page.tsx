import { Download, Mail } from "lucide-react";
import { PageHeader } from "@/components/new-admin/layout/page-header";
import { Button } from "@/components/ui/button";

const actions = [
	{
		icon: Download,
		title: "Export Users CSV",
		description:
			"Download a full CSV export of all user accounts including roles and order counts.",
	},
	{
		icon: Download,
		title: "Export Products CSV",
		description:
			"Download a full CSV export of all products including SKUs, prices, and statuses.",
	},
	{
		icon: Mail,
		title: "Send Email to User",
		description:
			"Send a one-off transactional email to a specific user account.",
	},
];

export default function NewAdminQuickActionsPage() {
	return (
		<div className="p-4 md:p-8">
			<PageHeader
				title="Quick Actions"
				subtitle="Bulk operations and exports"
			/>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{actions.map((action) => (
					<div
						key={action.title}
						className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col gap-4"
					>
						<div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center">
							<action.icon className="h-5 w-5 text-slate-600" />
						</div>
						<div>
							<h3 className="font-semibold text-slate-900 text-sm">
								{action.title}
							</h3>
							<p className="text-slate-500 text-sm mt-1">
								{action.description}
							</p>
						</div>
						<Button disabled className="w-full mt-auto" variant="outline">
							{action.title}
						</Button>
					</div>
				))}
			</div>
		</div>
	);
}
