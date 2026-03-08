import React from "react";

export interface AdminTableColumn<T> {
	key: string;
	header: string;
	render: (row: T) => React.ReactNode;
	hideBelow?: "sm" | "md" | "lg";
	className?: string;
}

interface AdminDataTableProps<T> {
	columns: AdminTableColumn<T>[];
	data: T[];
	getRowId: (row: T) => string;
	selectedIds?: Set<string>;
	onToggleAll?: () => void;
	onToggleOne?: (id: string) => void;
	renderRowActions?: (row: T) => React.ReactNode;
	loading?: boolean;
	minWidth?: string;
}

const hideClass = {
	sm: "hidden sm:table-cell",
	md: "hidden md:table-cell",
	lg: "hidden lg:table-cell",
};

export function AdminDataTable<T>({
	columns,
	data,
	getRowId,
	selectedIds,
	onToggleAll,
	onToggleOne,
	renderRowActions,
	loading = false,
	minWidth = "min-w-[600px]",
}: AdminDataTableProps<T>) {
	const allSelected =
		!!selectedIds && data.length > 0 && selectedIds.size === data.length;

	return (
		<div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
			<div className="overflow-x-auto">
				<table className={`w-full text-sm ${minWidth}`}>
					<thead>
						<tr className="border-b border-slate-200 bg-slate-50">
							{onToggleAll && (
								<th className="w-10 px-4 py-3 text-left">
									<input
										type="checkbox"
										checked={allSelected}
										onChange={onToggleAll}
										className="rounded border-slate-300 accent-orange-500"
									/>
								</th>
							)}
							{columns.map((col) => (
								<th
									key={col.key}
									className={[
										"px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs",
										col.hideBelow ? hideClass[col.hideBelow] : "",
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
						{data.map((row) => {
							const id = getRowId(row);
							const isSelected = !!selectedIds?.has(id);
							return (
								<tr
									key={id}
									className={`border-b border-slate-100 last:border-0 transition-colors ${
										isSelected ? "bg-orange-50" : "hover:bg-slate-50/50"
									}`}
								>
									{onToggleOne && (
										<td className="px-4 py-3">
											<input
												type="checkbox"
												checked={isSelected}
												onChange={() => onToggleOne(id)}
												className="rounded border-slate-300 accent-orange-500"
											/>
										</td>
									)}
									{columns.map((col) => (
										<td
											key={col.key}
											className={[
												"px-4 py-3 text-slate-700",
												col.hideBelow ? hideClass[col.hideBelow] : "",
												col.className ?? "",
											]
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
							);
						})}
					</tbody>
				</table>
			</div>
		</div>
	);
}
