import type { Dispatch, SetStateAction } from "react";
import { Lozenge } from "@/components/Lozenge";
import { Input } from "@/components/ui/input";
import type { AdminTableColumn } from "@/components/admin/ui/admin-data-table";
import type { SpikeAdminCategory } from "@/actions/spike/categories-actions";

function formatDate(isoString: string) {
	return new Date(isoString).toLocaleDateString("en-AU", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});
}

export type CategoryEditDraft = {
	name: string;
	description: string;
	sortOrder: number;
};

type CategoryColumnsOptions = {
	editingRowId: string | null;
	editDraft: CategoryEditDraft;
	setEditDraft: Dispatch<SetStateAction<CategoryEditDraft>>;
};

export function getCategoryColumns({
	editingRowId,
	editDraft,
	setEditDraft,
}: CategoryColumnsOptions): AdminTableColumn<SpikeAdminCategory>[] {
	return [
		{
			key: "name",
			header: "Name",
			render: (category) =>
				editingRowId === category.id ? (
					<Input
						className="h-8 text-sm"
						value={editDraft.name}
						onChange={(event) =>
							setEditDraft((prev) => ({ ...prev, name: event.target.value }))
						}
					/>
				) : (
					<span className="font-medium text-slate-900">{category.name}</span>
				),
		},
		{
			key: "handle",
			header: "Handle",
			render: (category) => (
				<span className="text-slate-500">{category.handle}</span>
			),
		},
		{
			key: "description",
			header: "Description",
			render: (category) =>
				editingRowId === category.id ? (
					<Input
						className="h-8 text-sm"
						value={editDraft.description}
						onChange={(event) =>
							setEditDraft((prev) => ({
								...prev,
								description: event.target.value,
							}))
						}
					/>
				) : (
					<span className="text-slate-700">
						{category.description ?? <span className="text-slate-400">—</span>}
					</span>
				),
		},
		{
			key: "sortOrder",
			header: "Order",
			render: (category) =>
				editingRowId === category.id ? (
					<Input
						type="number"
						step="1"
						className="h-8 w-20 text-sm"
						value={editDraft.sortOrder}
						onChange={(event) =>
							setEditDraft((prev) => ({
								...prev,
								sortOrder: Number.parseInt(event.target.value || "0", 10),
							}))
						}
					/>
				) : (
					<span className="text-slate-700">{category.sortOrder}</span>
				),
		},
		{
			key: "productCount",
			header: "Products",
			render: (category) => (
				<span className="text-slate-700">{category.productCount}</span>
			),
		},
		{
			key: "created",
			header: "Created",
			render: (category) => formatDate(category.createdAt),
		},
		{
			key: "hasImage",
			header: "Has Image",
			render: (category) =>
				category.imageUrl ? (
					<Lozenge appearance="success">True</Lozenge>
				) : (
					<Lozenge appearance="default">False</Lozenge>
				),
		},
	];
}
