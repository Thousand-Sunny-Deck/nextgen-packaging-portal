"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import type { ShopCategory } from "@/actions/products/fetch-products-action";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

const ALL_PRODUCTS_VALUE = "__all__";

interface CategorySelectProps {
	categories: ShopCategory[];
	/** Handle of the currently selected category, if any. */
	selectedHandle?: string;
}

export function CategorySelect({
	categories,
	selectedHandle,
}: CategorySelectProps) {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const handleChange = (value: string) => {
		const params = new URLSearchParams();
		// Preserve the active search when switching categories.
		const q = searchParams.get("q");
		if (q) params.set("q", q);
		if (value !== ALL_PRODUCTS_VALUE) params.set("category", value);
		const query = params.toString();
		router.push(query ? `${pathname}?${query}` : pathname);
	};

	return (
		<Select
			value={selectedHandle ?? ALL_PRODUCTS_VALUE}
			onValueChange={handleChange}
		>
			<SelectTrigger className="w-full sm:w-64">
				<SelectValue placeholder="Select a category" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value={ALL_PRODUCTS_VALUE}>All products</SelectItem>
				{categories.map((category) => (
					<SelectItem key={category.id} value={category.handle}>
						{category.name}
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}
