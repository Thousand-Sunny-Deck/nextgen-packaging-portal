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
	entitlementsCreated: number;
	entitlementsSkipped: number;
	productsCreated: number;
	productsSkipped: number;
	failed: number;
}

// ============================================
// MAIN ENTRY POINT
// ============================================
async function main() {
	console.log("Starting entitlement seed...\n");

	// Get user email from command line args
	const userEmail = process.argv[2] ?? "pvyas1512@gmail.com";
	if (!userEmail) {
		console.error("ERROR: Please provide a user email as the first argument");
		console.error(
			"Usage: npm run seed:entitlements <user_email> [products_file.csv]",
		);
		console.error(
			"Example: npm run seed:entitlements john@example.com warong-products.csv",
		);
		process.exit(1);
	}

	// Get filename from command line args (optional, defaults to warong-products.csv)
	const filename = process.argv[3] ?? "warong-products.csv";

	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		console.error("ERROR: DATABASE_URL environment variable is not set");
		process.exit(1);
	}

	// Create Prisma client
	const adapter = new PrismaPg({ connectionString: databaseUrl });
	const prisma = new PrismaClient({ adapter });

	try {
		// Look up user in database
		const user = await prisma.user.findFirst({
			where: { email: userEmail.toLowerCase().trim() },
		});

		if (!user) {
			console.error(`ERROR: User not found in database: ${userEmail}`);
			console.error("Please run user seed first: npm run seed:users");
			process.exit(1);
		}
		console.log(`Found user: ${user.name} (${user.email})`);
		console.log(`User ID: ${user.id}\n`);

		// Read products from CSV
		const filePath = path.join(__dirname, "data", filename);
		const products = readProductCsvWarongFormat(filePath);
		console.log(`Found ${products.length} products to process\n`);

		const results = await seedEntitlements(prisma, user.id, products);
		printSummary(results);
	} catch (error) {
		console.error("Fatal error:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
	}
}

// ============================================
// ENTITLEMENT SEEDING
// ============================================
async function seedEntitlements(
	prisma: PrismaClient,
	userId: string,
	products: ProductEntry[],
): Promise<SeedResult> {
	const results: SeedResult = {
		entitlementsCreated: 0,
		entitlementsSkipped: 0,
		productsCreated: 0,
		productsSkipped: 0,
		failed: 0,
	};
	const total = products.length;

	console.log("Processing...");

	for (let i = 0; i < products.length; i++) {
		const productInput = products[i];

		try {
			// First, upsert the product (create if doesn't exist)
			const product = await prisma.product.upsert({
				where: { sku: productInput.sku },
				update: {}, // Don't update existing products
				create: {
					sku: productInput.sku,
					description: productInput.description,
					unitCost: productInput.unitCost,
					imageUrl: productInput.imageUrl,
				},
			});

			// Check if product was just created
			const wasJustCreated = product.createdAt.getTime() > Date.now() - 1000;
			if (wasJustCreated) {
				results.productsCreated++;
			} else {
				results.productsSkipped++;
			}

			// Now create the entitlement
			const existingEntitlement =
				await prisma.userProductEntitlement.findUnique({
					where: {
						userId_productId: {
							userId: userId,
							productId: product.id,
						},
					},
				});

			if (existingEntitlement) {
				console.log(
					`  [${i + 1}/${total}] ${productInput.sku} - Entitlement exists`,
				);
				results.entitlementsSkipped++;
			} else {
				await prisma.userProductEntitlement.create({
					data: {
						userId: userId,
						productId: product.id,
						customSku: null,
						customDescription: null,
						customUnitCost: null,
						customImageUrl: null,
					},
				});
				console.log(
					`  [${i + 1}/${total}] ${productInput.sku} - Entitlement created`,
				);
				results.entitlementsCreated++;
			}
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			console.error(
				`  [${i + 1}/${total}] ${productInput.sku} - Failed: ${errorMessage}`,
			);
			results.failed++;
		}
	}

	return results;
}

// ============================================
// REPORTING
// ============================================
function printSummary(results: SeedResult) {
	console.log("\nResults:");
	console.log(`  Entitlements created: ${results.entitlementsCreated}`);
	console.log(
		`  Entitlements skipped: ${results.entitlementsSkipped} (already exist)`,
	);
	console.log(`  Products created:     ${results.productsCreated}`);
	console.log(
		`  Products skipped:     ${results.productsSkipped} (already exist)`,
	);
	console.log(`  Failed:               ${results.failed}`);
	console.log("\nEntitlement seed completed.");
}

// Run
main();
