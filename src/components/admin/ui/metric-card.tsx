import { type LucideIcon } from "lucide-react";

interface MetricCardProps {
	icon: LucideIcon;
	label: string;
	value: string;
}

export function MetricCard({ icon: Icon, label, value }: MetricCardProps) {
	return (
		<div className="bg-white rounded-lg border border-slate-200 p-6">
			<div className="flex items-center justify-between mb-4">
				<p className="text-sm text-slate-500 font-medium">{label}</p>
				<div className="h-9 w-9 rounded-md bg-slate-50 flex items-center justify-center">
					<Icon className="h-4 w-4 text-slate-600" />
				</div>
			</div>
			<p className="text-3xl font-bold text-slate-900">{value}</p>
		</div>
	);
}
