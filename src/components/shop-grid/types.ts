export type CatalogUnit = "Sleeve" | "Box";

export type CatalogUnitState = {
	price: number;
	quantity: number;
	isSelected: boolean;
};

export type CatalogCardViewModel = {
	sku: string;
	name: string;
	imageUrl: string | null;
	// Single-price mode (used when unitOptions is null).
	unitCost: number;
	quantity: number;
	isSelected: boolean;
	// Dual-unit mode (Sleeve / Box). Null for normal single-price products.
	unitOptions: {
		sleeve: CatalogUnitState;
		box: CatalogUnitState;
	} | null;
};
