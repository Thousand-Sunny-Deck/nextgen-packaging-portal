import { type LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
	icon: LucideIcon;
	heading: string;
	description: string;
	cta?: { label: string; onClick?: () => void };
}

export function EmptyState({
	icon: Icon,
	heading,
	description,
	cta,
}: EmptyStateProps) {
	return (
		<div className="flex flex-col items-center justify-center py-16 text-center">
			<div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
				<Icon className="h-6 w-6 text-slate-300" />
			</div>
			<h3 className="text-sm font-semibold text-slate-900 mb-1">{heading}</h3>
			<p className="text-sm text-slate-500 max-w-sm">{description}</p>
			{cta && (
				<Button className="mt-4" onClick={cta.onClick}>
					{cta.label}
				</Button>
			)}
		</div>
	);
}
