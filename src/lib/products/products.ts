import { ProductRow } from "@/app/dashboard/[uuid]/order/types";
import { readFile, stat, access } from "fs/promises";
import { join } from "path";
import { cache } from "react";

// Module-level cache to persist across requests
interface CachedProducts {
	products: ProductRow[];
	lastModified: number;
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

const parseProducts = (csvContent: string): ProductRow[] => {
	const lines = csvContent.split("\n").filter((line) => line.trim() !== "");

	const products: ProductRow[] = lines
		.map((line) => {
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

			return {
				sku: columns[0] || "",
				description: columns[1] || "",
				price1: columns[2] || "",
				price2: columns[3] || "",
				quantity1: columns[4] || "",
				price3: columns[6] || "",
				quantity2: columns[7] || "",
			};
		})
		.filter((product): product is ProductRow => product !== null);

	return products;
};

// Internal function that does the actual fetching
const _fetchProductsInternal = async (): Promise<ProductRow[]> => {
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
		console.info("Got it from cache", `last modified: ${lastModified}`);
		return productsCache.products;
	}

	// Read and parse CSV
	console.info("Reading from CSV", `last modified: ${lastModified}`);
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
export const fetchProducts = cache(_fetchProductsInternal);
