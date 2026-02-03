// Load environment variables FIRST before any other imports
import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as path from "path";
import { readCsvFile } from "./utils/csv-reader";

// ============================================
// TYPES
// ============================================
interface RawRow {
	sku?: unknown;
	description?: unknown;
	unitCost?: unknown;
	imageUrl?: unknown;
}

interface ProductInput {
	sku: string;
	description: string;
	unitCost: number;
	imageUrl: string | null;
}

interface ValidationError {
	row: number;
	field: string;
	message: string;
}

interface SeedResult {
	created: number;
	skipped: number;
	failed: number;
}

// ============================================
// MAIN ENTRY POINT
// ============================================
async function main() {
	console.log("Starting product seed...\n");

	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		console.error("ERROR: DATABASE_URL environment variable is not set");
		process.exit(1);
	}

	// Create Prisma client
	const adapter = new PrismaPg({ connectionString: databaseUrl });
	const prisma = new PrismaClient({ adapter });

	try {
		const filePath = path.join(__dirname, "data", "products.csv");
		const rows = readFile(filePath);
		console.log(`Found ${rows.length} rows to process\n`);

		const { valid, invalid } = validateRows(rows);

		if (invalid.length > 0) {
			console.log("Validation warnings:");
			invalid.forEach((err) => {
				console.log(`  Row ${err.row}: [${err.field}] ${err.message}`);
			});
			console.log("");
		}

		const results = await seedProducts(prisma, valid);
		printSummary(results, invalid);
	} catch (error) {
		console.error("Fatal error:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

// ============================================
// FILE READING
// Responsibility: Parse CSV file into raw row objects
// ============================================
function readFile(filePath: string): RawRow[] {
	return readCsvFile<RawRow>(filePath);
}

// ============================================
// VALIDATION
// Responsibility: Validate and transform raw rows into typed Product objects
// ============================================
function validateRows(rows: RawRow[]): {
	valid: ProductInput[];
	invalid: ValidationError[];
} {
	const valid: ProductInput[] = [];
	const invalid: ValidationError[] = [];
	const seenSkus = new Set<string>();

	rows.forEach((row, index) => {
		const rowNum = index + 2; // Excel rows start at 1, plus header row
		const errors: ValidationError[] = [];

		// Validate sku
		const sku = String(row.sku ?? "").trim();
		if (!sku) {
			errors.push({
				row: rowNum,
				field: "sku",
				message: "Required field is empty",
			});
		} else if (seenSkus.has(sku)) {
			errors.push({
				row: rowNum,
				field: "sku",
				message: `Duplicate SKU in file: ${sku}`,
			});
		} else {
			seenSkus.add(sku);
		}

		// Validate description
		const description = String(row.description ?? "").trim();
		if (!description) {
			errors.push({
				row: rowNum,
				field: "description",
				message: "Required field is empty",
			});
		}

		// Validate unitCost
		const unitCostRaw = row.unitCost;
		let unitCost: number = 0;
		if (
			unitCostRaw === undefined ||
			unitCostRaw === null ||
			unitCostRaw === ""
		) {
			errors.push({
				row: rowNum,
				field: "unitCost",
				message: "Required field is empty",
			});
		} else {
			unitCost = Number(unitCostRaw);
			if (isNaN(unitCost)) {
				errors.push({
					row: rowNum,
					field: "unitCost",
					message: `Invalid number: ${unitCostRaw}`,
				});
			} else if (unitCost < 0) {
				errors.push({
					row: rowNum,
					field: "unitCost",
					message: `Unit cost cannot be negative: ${unitCost}`,
				});
			}
		}

		// Validate imageUrl (optional)
		const imageUrlRaw = row.imageUrl;
		let imageUrl: string | null = null;
		if (
			imageUrlRaw !== undefined &&
			imageUrlRaw !== null &&
			imageUrlRaw !== ""
		) {
			imageUrl = String(imageUrlRaw).trim();
		}

		if (errors.length > 0) {
			invalid.push(...errors);
		} else {
			valid.push({ sku, description, unitCost, imageUrl });
		}
	});

	return { valid, invalid };
}

// ============================================
// PRODUCT SEEDING
// Responsibility: Insert products into database via Prisma
// ============================================
async function seedProducts(
	prisma: PrismaClient,
	products: ProductInput[],
): Promise<SeedResult> {
	const results: SeedResult = { created: 0, skipped: 0, failed: 0 };
	const total = products.length;

	console.log("Processing...");

	for (let i = 0; i < products.length; i++) {
		const product = products[i];

		try {
			await prisma.product.upsert({
				where: { sku: product.sku },
				update: {
					description: product.description,
					unitCost: product.unitCost,
					imageUrl: product.imageUrl,
				},
				create: {
					sku: product.sku,
					description: product.description,
					unitCost: product.unitCost,
					imageUrl: product.imageUrl,
				},
			});

			// Check if it was created or updated
			const existing = await prisma.product.findUnique({
				where: { sku: product.sku },
			});

			if (existing) {
				console.log(`  [${i + 1}/${total}] ${product.sku} - Upserted`);
				results.created++;
			}
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);

			if (
				errorMessage.includes("UNIQUE constraint") ||
				errorMessage.includes("duplicate key")
			) {
				console.log(
					`  [${i + 1}/${total}] ${product.sku} - Skipped (already exists)`,
				);
				results.skipped++;
			} else {
				console.error(
					`  [${i + 1}/${total}] ${product.sku} - Failed: ${errorMessage}`,
				);
				results.failed++;
			}
		}
	}

	return results;
}

// ============================================
// REPORTING
// Responsibility: Log results to console
// ============================================
function printSummary(results: SeedResult, errors: ValidationError[]) {
	console.log("\nResults:");
	console.log(`  Upserted: ${results.created}`);
	console.log(`  Skipped:  ${results.skipped}`);
	console.log(`  Failed:   ${results.failed}`);
	console.log(`  Invalid:  ${errors.length} (validation errors)`);
	console.log("\nProduct seed completed.");
}

// Run
main();
