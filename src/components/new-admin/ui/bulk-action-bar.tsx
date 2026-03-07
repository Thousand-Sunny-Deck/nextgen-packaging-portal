"use client";

interface BulkActionBarProps {
	selectedCount: number;
	onClearSelection: () => void;
}

export function BulkActionBar({
	selectedCount,
	onClearSelection,
}: BulkActionBarProps) {
	return (
		<div
			className={`transition-all duration-200 overflow-hidden ${
				selectedCount > 0 ? "max-h-20 opacity-100 mt-3" : "max-h-0 opacity-0"
			}`}
		>
			<div className="bg-slate-900 text-white rounded-lg px-4 py-3 flex items-center gap-4">
				<span className="text-sm font-medium">{selectedCount} selected</span>
				<div className="flex items-center gap-2 ml-auto">
					<button className="text-sm px-3 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-md transition-colors flex items-center gap-1">
						Change Role
						<svg
							className="h-3 w-3 ml-0.5"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>
					<button className="text-sm px-3 py-1.5 bg-red-600 hover:bg-red-700 rounded-md transition-colors">
						Delete
					</button>
					<button
						onClick={onClearSelection}
						className="text-sm px-3 py-1.5 text-slate-400 hover:text-white transition-colors"
					>
						Cancel
					</button>
				</div>
			</div>
		</div>
	);
}
