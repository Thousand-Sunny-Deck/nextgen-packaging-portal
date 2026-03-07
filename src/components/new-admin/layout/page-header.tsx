import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageHeaderProps {
	title: string;
	subtitle?: string;
	cta?: { label: string; href?: string };
}

export function PageHeader({ title, subtitle, cta }: PageHeaderProps) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start mb-6 md:mb-8">
			<div>
				<h1 className="text-xl md:text-2xl font-bold text-slate-900">
					{title}
				</h1>
				{subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
			</div>
			{cta && (
				<div className="shrink-0">
					{cta.href ? (
						<Button asChild size="sm">
							<Link href={cta.href}>{cta.label}</Link>
						</Button>
					) : (
						<Button size="sm">{cta.label}</Button>
					)}
				</div>
			)}
		</div>
	);
}
