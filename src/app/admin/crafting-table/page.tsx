import { CraftingTableTabs } from "@/components/admin/crafting-table/crafting-table-tabs";

export default function CraftingTablePage() {
	return (
		<div className="p-8">
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900">Crafting Table</h1>
				<p className="text-gray-500 mt-1">
					Manage users, products, and entitlements
				</p>
			</div>

			<CraftingTableTabs />
		</div>
	);
}
