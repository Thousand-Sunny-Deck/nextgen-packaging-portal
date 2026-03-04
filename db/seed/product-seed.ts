// Load environment variables FIRST before any other imports
import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as path from "path";
import { readProductCsvNewFormat, ProductEntry } from "./utils/csv-reader";

// ============================================
// TYPES
// ============================================
interface SeedResult {
	inserted: number;
	updated: number;
	skipped: number;
	failed: number;
}

// ============================================
// MAIN ENTRY POINT
// ============================================
async function main() {
	console.log("Starting product seed...\n");

	// Get filename from command line args (optional, defaults to products.csv)
	const filename = process.argv[2] ?? "temp.csv";

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
		const products = readProductCsvNewFormat(filePath);
		console.log(`Found ${products.length} products to process\n`);

		const results = await seedProducts(prisma, products);

		const duplicates = findDuplicateHandles(products);
		if (duplicates.length > 0) {
			console.log(
				`⚠️  Found ${duplicates.length} duplicate handle(s) in CSV — only the last row wins for each:\n`,
			);
			for (const { handle, skus } of duplicates) {
				console.log(`  handle: "${handle}"  →  SKUs: ${skus.join(", ")}`);
			}
			console.log();
		}
		printSummary(results);
	} catch (error) {
		console.error("Fatal error:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

// ============================================
// DUPLICATE DETECTION
// ============================================
function findDuplicateHandles(
	products: ProductEntry[],
): { handle: string; skus: string[] }[] {
	const seen = new Map<string, string[]>();

	for (const product of products) {
		const existing = seen.get(product.handle) ?? [];
		seen.set(product.handle, [...existing, product.sku]);
	}

	return Array.from(seen.entries())
		.filter(([, skus]) => skus.length > 1)
		.map(([handle, skus]) => ({ handle, skus }));
}

// ============================================
// PRODUCT SEEDING
// Responsibility: Insert products into database via Prisma
// ============================================
async function seedProducts(
	prisma: PrismaClient,
	products: ProductEntry[],
): Promise<SeedResult> {
	const results: SeedResult = {
		inserted: 0,
		updated: 0,
		skipped: 0,
		failed: 0,
	};
	const total = products.length;

	console.log("Processing...");

	for (let i = 0; i < products.length; i++) {
		const product = products[i];
		const tag = `  [${i + 1}/${total}] ${product.sku}`;

		try {
			const existing = await prisma.product.findUnique({
				where: { handle: product.handle },
			});

			if (existing) {
				const unchanged =
					existing.sku === product.sku &&
					existing.description === product.description &&
					existing.unitCost === product.unitCost;

				if (unchanged) {
					console.log(`${tag} - Skipped (no changes)`);
					results.skipped++;
					continue;
				}

				await prisma.product.update({
					where: { handle: product.handle },
					data: {
						sku: product.sku,
						description: product.description,
						unitCost: product.unitCost,
					},
				});
				console.log(`${tag} - Updated`);
				results.updated++;
			} else {
				await prisma.product.create({
					data: {
						sku: product.sku,
						handle: product.handle,
						description: product.description,
						unitCost: product.unitCost,
						imageUrl: product.imageUrl,
					},
				});
				console.log(`${tag} - Inserted`);
				results.inserted++;
			}
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			console.error(`${tag} - Failed: ${errorMessage}`);
			results.failed++;
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
	console.log(`  Inserted: ${results.inserted}`);
	console.log(`  Updated:  ${results.updated}`);
	console.log(`  Skipped:  ${results.skipped} (no changes)`);
	console.log(`  Failed:   ${results.failed}`);
	console.log("\nProduct seed completed.");
}

// Run
main();
