import { ProductData } from "@/actions/products/fetch-products-action";

export type CatalogRow = ProductData & {
	quantity: number;
	total: number;
	isSelected: boolean;
};

export type CatalogCardViewModel = {
	sku: string;
	name: string;
	imageUrl: string | null;
	quantity: number;
	isSelected: boolean;
	unitCost: number;
};
