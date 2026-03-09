interface ActivityItem {
	id: string;
	initials: string;
	action: string;
	timestamp: string;
	color?: string;
}

interface ActivityFeedProps {
	items: ActivityItem[];
}

export function ActivityFeed({ items }: ActivityFeedProps) {
	return (
		<div className="space-y-4">
			{items.map((item) => (
				<div key={item.id} className="flex items-start gap-3">
					<div
						className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 ${item.color ?? "bg-slate-400"}`}
					>
						{item.initials}
					</div>
					<div className="min-w-0 flex-1">
						<p className="text-sm text-slate-700">{item.action}</p>
						<p className="text-xs text-slate-400 mt-0.5">{item.timestamp}</p>
					</div>
				</div>
			))}
		</div>
	);
}

export type { ActivityItem };
