import React from "react";

export interface AdminTableColumn<T> {
	key: string;
	header: string;
	render: (row: T) => React.ReactNode;
	className?: string;
}

interface AdminDataTableProps<T> {
	columns: AdminTableColumn<T>[];
	data: T[];
	getRowId: (row: T) => string;
	renderRowActions?: (row: T) => React.ReactNode;
	loading?: boolean;
	minWidth?: string;
}

export function AdminDataTable<T>({
	columns,
	data,
	getRowId,
	renderRowActions,
	loading = false,
	minWidth = "min-w-[600px]",
}: AdminDataTableProps<T>) {
	return (
		<div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
			<div className="overflow-x-auto">
				<table className={`w-full text-sm ${minWidth}`}>
					<thead>
						<tr className="border-b border-slate-200 bg-slate-50">
							{columns.map((col) => (
								<th
									key={col.key}
									className={[
										"px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs",
										col.className ?? "",
									]
										.join(" ")
										.trim()}
								>
									{col.header}
								</th>
							))}
							{renderRowActions && <th className="w-10 px-4 py-3" />}
						</tr>
					</thead>
					<tbody
						className={loading ? "opacity-60 pointer-events-none" : undefined}
					>
						{data.map((row) => (
							<tr
								key={getRowId(row)}
								className="border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50/50"
							>
								{columns.map((col) => (
									<td
										key={col.key}
										className={["px-4 py-3 text-slate-700", col.className ?? ""]
											.join(" ")
											.trim()}
									>
										{col.render(row)}
									</td>
								))}
								{renderRowActions && (
									<td className="px-4 py-3">{renderRowActions(row)}</td>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}
