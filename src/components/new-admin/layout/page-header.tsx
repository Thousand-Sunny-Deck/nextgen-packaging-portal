interface PageHeaderProps {
	title: string;
	subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
	return (
		<div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-start mb-6 md:mb-8">
			<div>
				<h1 className="text-xl md:text-2xl font-bold text-slate-900">
					{title}
				</h1>
				{subtitle && <p className="text-slate-500 text-sm mt-1">{subtitle}</p>}
			</div>
		</div>
	);
}
