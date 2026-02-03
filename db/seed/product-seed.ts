// Load environment variables FIRST before any other imports
import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as path from "path";
import { readProductCsvWarongFormat, ProductEntry } from "./utils/csv-reader";

// ============================================
// TYPES
// ============================================
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

	// Get filename from command line args (optional, defaults to warong-products.csv)
	const filename = process.argv[2] ?? "warong-products.csv";

	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		console.error("ERROR: DATABASE_URL environment variable is not set");
		process.exit(1);
	}

	// Create Prisma client
	const adapter = new PrismaPg({ connectionString: databaseUrl });
	const prisma = new PrismaClient({ adapter });

	try {
		const filePath = path.join(__dirname, "data", filename);
		const products = readProductCsvWarongFormat(filePath);
		console.log(`Found ${products.length} products to process\n`);

		const results = await seedProducts(prisma, products);
		printSummary(results);
	} catch (error) {
		console.error("Fatal error:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

// ============================================
// PRODUCT SEEDING
// Responsibility: Insert products into database via Prisma
// ============================================
async function seedProducts(
	prisma: PrismaClient,
	products: ProductEntry[],
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

			console.log(`  [${i + 1}/${total}] ${product.sku} - Upserted`);
			results.created++;
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
function printSummary(results: SeedResult) {
	console.log("\nResults:");
	console.log(`  Upserted: ${results.created}`);
	console.log(`  Skipped:  ${results.skipped}`);
	console.log(`  Failed:   ${results.failed}`);
	console.log("\nProduct seed completed.");
}

// Run
main();
