import * as fs from "fs";

/**
 * Parse a CSV file into an array of objects with header keys
 * @param filePath - Path to the CSV file
 * @returns Array of objects where keys are column headers
 */
export function readCsvFile<T = Record<string, unknown>>(
	filePath: string,
): T[] {
	console.log(`Reading from: ${filePath}`);

	const content = fs.readFileSync(filePath, "utf-8");
	const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);

	if (lines.length === 0) {
		return [];
	}

	// First line is headers
	const headers = parseCsvLine(lines[0]);

	// Parse remaining lines as data
	const rows: T[] = [];
	for (let i = 1; i < lines.length; i++) {
		const values = parseCsvLine(lines[i]);
		const row: Record<string, unknown> = {};

		headers.forEach((header, index) => {
			const value = values[index]?.trim() ?? "";
			// Try to parse as number if it looks like one
			if (value !== "" && !isNaN(Number(value))) {
				row[header] = Number(value);
			} else {
				row[header] = value;
			}
		});

		rows.push(row as T);
	}

	return rows;
}

/**
 * Parse a single CSV line, handling quoted values
 */
function parseCsvLine(line: string): string[] {
	const values: string[] = [];
	let current = "";
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];

		if (char === '"') {
			if (inQuotes && line[i + 1] === '"') {
				// Escaped quote
				current += '"';
				i++;
			} else {
				// Toggle quote mode
				inQuotes = !inQuotes;
			}
		} else if (char === "," && !inQuotes) {
			values.push(current.trim());
			current = "";
		} else {
			current += char;
		}
	}

	// Push the last value
	values.push(current.trim());

	return values;
}

/**
 * Read a CSV file with multiple "sheets" (sections separated by empty lines or headers)
 * For entitlement files that have User info and Products sections
 */
export function readMultiSectionCsv(filePath: string): {
	user: Record<string, unknown> | null;
	products: Record<string, unknown>[];
} {
	console.log(`Reading from: ${filePath}`);

	const content = fs.readFileSync(filePath, "utf-8");
	const lines = content.split(/\r?\n/);

	let userSection: Record<string, unknown> | null = null;
	const products: Record<string, unknown>[] = [];

	let currentSection: "none" | "user" | "products" = "none";
	let sectionHeaders: string[] = [];

	for (const line of lines) {
		const trimmed = line.trim();

		// Check for section markers
		if (
			trimmed.toLowerCase() === "[user]" ||
			trimmed.toLowerCase() === "user"
		) {
			currentSection = "user";
			sectionHeaders = [];
			continue;
		}
		if (
			trimmed.toLowerCase() === "[products]" ||
			trimmed.toLowerCase() === "products"
		) {
			currentSection = "products";
			sectionHeaders = [];
			continue;
		}

		// Skip empty lines
		if (trimmed.length === 0) {
			continue;
		}

		// If we haven't set headers for this section yet, this line is headers
		if (sectionHeaders.length === 0) {
			sectionHeaders = parseCsvLine(trimmed);
			continue;
		}

		// Parse data line
		const values = parseCsvLine(trimmed);
		const row: Record<string, unknown> = {};

		sectionHeaders.forEach((header, index) => {
			const value = values[index]?.trim() ?? "";
			if (value !== "" && !isNaN(Number(value))) {
				row[header] = Number(value);
			} else {
				row[header] = value;
			}
		});

		if (currentSection === "user") {
			userSection = row;
		} else if (currentSection === "products") {
			products.push(row);
		}
	}

	return { user: userSection, products };
}

export interface ProductEntry {
	sku: string;
	handle: string;
	description: string;
	unitCost: number;
	imageUrl: string | null;
}

function slugify(str: string): string {
	return str
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/, "");
}

/**
 * Read product CSV in the new format (with headers):
 * sku,description,unit-cost,sleeve-unit-cost
 *
 * If sleeve-unit-cost is "NA" or missing, no sleeve row is created.
 * Otherwise a second row is created with sku+"-SLV" and description+" Sleeve".
 */
export function readProductCsvNewFormat(filePath: string): ProductEntry[] {
	console.log(`Reading from: ${filePath}`);

	const content = fs.readFileSync(filePath, "utf-8");
	const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);

	if (lines.length <= 1) return [];

	// Skip header row
	const dataLines = lines.slice(1);
	const products: ProductEntry[] = [];

	for (const line of dataLines) {
		const values = parseCsvLine(line);

		const sku = values[0]?.trim() ?? "";
		if (!sku) continue;

		const description = values[1]?.trim() ?? "";
		if (!description) continue;

		const basePrice = parsePrice(values[2] ?? "");
		if (basePrice === null) continue;

		products.push({
			sku,
			handle: slugify(`${sku} ${description}`),
			description,
			unitCost: basePrice,
			imageUrl: null,
		});

		const sleeveRaw = values[3]?.trim() ?? "";
		if (sleeveRaw.toUpperCase() === "NA" || sleeveRaw === "") continue;

		const sleevePrice = parsePrice(sleeveRaw);
		if (sleevePrice === null) continue;

		const sleeveDescription = `${description} Sleeve`;
		products.push({
			sku: `${sku}-SLV`,
			handle: slugify(`${sku}-SLV ${sleeveDescription}`),
			description: sleeveDescription,
			unitCost: sleevePrice,
			imageUrl: null,
		});
	}

	return products;
}

/**
 * Parse price string like "$43.75" to number 43.75
 */
function parsePrice(value: string): number | null {
	if (!value || value.trim() === "") return null;
	// Remove $ and any whitespace, then parse
	const cleaned = value.replace(/[$,\s]/g, "");
	const num = parseFloat(cleaned);
	return isNaN(num) ? null : num;
}

/**
 * Read product CSV in the Warong format (no headers):
 * col0 = SKU, col1 = description, col2 = base price,
 * col3-4 = ignore, col5 = sleeve price (optional), col6 = ignore
 *
 * If col5 has a valid price, creates an additional SLEEVE entry
 */
export function readProductCsvWarongFormat(filePath: string): ProductEntry[] {
	console.log(`Reading from: ${filePath}`);

	const content = fs.readFileSync(filePath, "utf-8");
	const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);

	const products: ProductEntry[] = [];

	for (const line of lines) {
		const values = parseCsvLine(line);

		// Get SKU (col 0)
		const sku = values[0]?.trim() ?? "";
		if (!sku) continue;

		// Get description (col 1)
		const description = values[1]?.trim() ?? "";
		if (!description) continue;

		// Get base price (col 2)
		const basePrice = parsePrice(values[2] ?? "");
		if (basePrice === null) continue;

		// Add main product
		products.push({
			sku: sku,
			handle: slugify(`${sku} ${description}`),
			description: description,
			unitCost: basePrice,
			imageUrl: null,
		});

		// Check for sleeve price (col 5, index 5)
		const sleevePrice = parsePrice(values[3] ?? "");
		if (sleevePrice !== null && sleevePrice !== basePrice) {
			const sleeveDescription = `${description} Sleeve`;
			products.push({
				sku: `${sku}-SLV`,
				handle: slugify(`${sku}-SLV ${sleeveDescription}`),
				description: sleeveDescription,
				unitCost: sleevePrice,
				imageUrl: null,
			});
		}
	}

	return products;
}
