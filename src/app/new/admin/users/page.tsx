"use client";

import { useState } from "react";
import { PageHeader } from "@/components/new-admin/layout/page-header";
import { BulkActionBar } from "@/components/new-admin/ui/bulk-action-bar";
import { mockUsers } from "@/components/new-admin/mock-data";

export default function NewAdminUsersPage() {
	const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

	const allSelected =
		selectedIds.size === mockUsers.length && mockUsers.length > 0;

	const toggleAll = () => {
		if (allSelected) {
			setSelectedIds(new Set());
		} else {
			setSelectedIds(new Set(mockUsers.map((u) => u.id)));
		}
	};

	const toggleOne = (id: string) => {
		setSelectedIds((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	return (
		<div className="p-4 md:p-8">
			<PageHeader
				title="Users"
				subtitle="Manage platform accounts"
				cta={{ label: "Create User" }}
			/>

			{/* Filters */}
			<div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">
				<input
					type="text"
					placeholder="Search users..."
					className="h-9 px-3 text-sm border border-slate-200 rounded-md bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 sm:w-64"
				/>
				<select className="h-9 px-3 text-sm border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500">
					<option value="">All Roles</option>
					<option value="admin">Admin</option>
					<option value="customer">Customer</option>
				</select>
			</div>

			{/* Table — horizontal scroll on small screens */}
			<div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
				<div className="overflow-x-auto">
					<table className="w-full text-sm min-w-[500px]">
						<thead>
							<tr className="border-b border-slate-200 bg-slate-50">
								<th className="w-10 px-4 py-3 text-left">
									<input
										type="checkbox"
										checked={allSelected}
										onChange={toggleAll}
										className="rounded border-slate-300 accent-orange-500"
									/>
								</th>
								<th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
									Name
								</th>
								<th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs hidden sm:table-cell">
									Email
								</th>
								<th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs">
									Role
								</th>
								<th className="px-4 py-3 text-left font-medium text-slate-500 uppercase tracking-wide text-xs hidden md:table-cell">
									Orders
								</th>
								<th className="w-10 px-4 py-3" />
							</tr>
						</thead>
						<tbody>
							{mockUsers.map((user, i) => {
								const isSelected = selectedIds.has(user.id);
								return (
									<tr
										key={user.id}
										className={`border-b border-slate-100 last:border-0 transition-colors ${
											isSelected
												? "bg-orange-50"
												: i % 2 === 0
													? "bg-white"
													: "bg-slate-50/30"
										}`}
									>
										<td className="px-4 py-3">
											<input
												type="checkbox"
												checked={isSelected}
												onChange={() => toggleOne(user.id)}
												className="rounded border-slate-300 accent-orange-500"
											/>
										</td>
										<td className="px-4 py-3 font-medium text-slate-900">
											<div className="flex items-center gap-2">
												<div className="h-7 w-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-xs font-bold shrink-0">
													{user.name
														.split(" ")
														.map((n) => n[0])
														.join("")}
												</div>
												<span className="truncate">{user.name}</span>
											</div>
										</td>
										<td className="px-4 py-3 text-slate-500 hidden sm:table-cell">
											{user.email}
										</td>
										<td className="px-4 py-3">
											<span
												className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
													user.role === "Admin"
														? "bg-orange-50 text-orange-600"
														: "bg-slate-100 text-slate-600"
												}`}
											>
												{user.role}
											</span>
										</td>
										<td className="px-4 py-3 text-slate-500 hidden md:table-cell">
											{user.orders}
										</td>
										<td className="px-4 py-3">
											<button className="text-slate-400 hover:text-slate-700 transition-colors">
												<svg
													className="h-4 w-4"
													fill="currentColor"
													viewBox="0 0 16 16"
												>
													<circle cx="8" cy="2" r="1.5" />
													<circle cx="8" cy="8" r="1.5" />
													<circle cx="8" cy="14" r="1.5" />
												</svg>
											</button>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</div>

			<BulkActionBar
				selectedCount={selectedIds.size}
				onClearSelection={() => setSelectedIds(new Set())}
			/>

			{/* Pagination */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-4">
				<p className="text-sm text-slate-500">
					Showing {mockUsers.length} of {mockUsers.length} users
				</p>
				<div className="flex items-center gap-1">
					<button className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
						Previous
					</button>
					{[1, 2, 3].map((page) => (
						<button
							key={page}
							className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
								page === 1
									? "bg-orange-500 text-white"
									: "text-slate-500 hover:text-slate-900 hover:bg-slate-100"
							}`}
						>
							{page}
						</button>
					))}
					<button className="px-3 py-1.5 text-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors">
						Next
					</button>
				</div>
			</div>
		</div>
	);
}
