import { readFile, stat, access } from "fs/promises";
import { join } from "path";
import { cache } from "react";

// Module-level cache to persist across requests
interface CachedProducts {
	products: ProductData[];
	lastModified: number;
}

export interface ProductData {
	sku: string; // 6 digit alphanumeric code that we generate
	itemCode: string;
	description: string;
	unitCost: number; // price2 (gst included)
}

let productsCache: CachedProducts | null = null;

const getCSVPath = () => {
	return join(
		process.cwd(),
		"src/app/dashboard/[uuid]/order/NextGenSupplies.csv",
	);
};

const getCSVFile = async () => {
	const csvPath = getCSVPath();

	// Check if file exists
	try {
		await access(csvPath);
	} catch {
		throw new Error(
			`CSV file not found at ${csvPath}. Please ensure NextGenSupplies.csv exists.`,
		);
	}

	const csvContent = await readFile(csvPath, "utf-8");
	return csvContent;
};

const generateUniqueSku = (itemCode: string, description: string): string => {
	const input = `${itemCode}-${description}`.toLowerCase();

	// Simple hash function
	let hash = 0;
	for (let i = 0; i < input.length; i++) {
		hash = (hash << 5) - hash + input.charCodeAt(i);
		hash = hash & hash; // Convert to 32-bit integer
	}

	// Convert to base36 (0-9, a-z) and take first 6 chars
	return Math.abs(hash).toString(36).substring(0, 6).toUpperCase();
	// Result: "A3F5B2", "K8M2P1", etc.
};

const parsePrice = (priceStr: string): number => {
	if (!priceStr) return 0;
	const match = priceStr.match(/[\d,.]+/);
	return match ? parseFloat(match[0].replace(/,/g, "")) : 0;
};

const parseProducts = (csvContent: string): ProductData[] => {
	const lines = csvContent.split("\n").filter((line) => line.trim() !== "");

	const products: ProductData[] = lines
		.map((line): ProductData | null => {
			// Remove trailing comma if present
			const cleanLine = line.replace(/,\s*$/, "");
			const columns = cleanLine.split(",").map((col) => col.trim());

			// Skip empty rows (all columns are empty)
			if (columns.every((col) => !col)) {
				return null;
			}

			// Skip rows that don't have at least SKU and description
			if (!columns[0] || !columns[1]) {
				return null;
			}

			const itemCode = columns[0] || "";
			const description = columns[1] || "";
			const unitCost = parsePrice(columns[3]) || 0;
			const sku = generateUniqueSku(itemCode, description);

			return {
				itemCode,
				description,
				unitCost,
				sku,
			};
		})
		.filter((product): product is ProductData => product !== null);

	return products;
};

// Internal function that does the actual fetching
const _fetchProductsInternal = async (): Promise<ProductData[]> => {
	const csvPath = getCSVPath();

	// Check file modification time
	let fileStats;
	try {
		fileStats = await stat(csvPath);
	} catch {
		throw new Error(
			`CSV file not found at ${csvPath}. Please ensure NextGenSupplies.csv exists.`,
		);
	}

	const lastModified = fileStats.mtimeMs;

	// Return cached products if file hasn't changed
	if (
		productsCache &&
		productsCache.lastModified === lastModified &&
		productsCache.products.length > 0
	) {
		return productsCache.products;
	}

	// Read and parse CSV
	const csvContent = await getCSVFile();
	const products = parseProducts(csvContent);

	// Validate that we have products
	if (products.length === 0) {
		throw new Error(
			"No valid products found in CSV file. Please check the file format.",
		);
	}

	// Update cache
	productsCache = {
		products,
		lastModified,
	};

	return products;
};

// Exported function wrapped in React cache for request-level memoization
// This ensures the CSV is only read once per request, even if called multiple times
// TODO: filter products per user
export const fetchProducts = cache(_fetchProductsInternal);
