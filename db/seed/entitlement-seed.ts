// Load environment variables FIRST before any other imports
import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as XLSX from "xlsx";
import * as path from "path";

// ============================================
// TYPES
// ============================================
interface UserRow {
	email?: unknown;
	name?: unknown;
}

interface ProductRow {
	sku?: unknown;
	description?: unknown;
	unitCost?: unknown;
	imageUrl?: unknown;
}

interface UserInfo {
	email: string;
	name: string;
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

	// Get filename from command line args
	const filename = process.argv[2];
	if (!filename) {
		console.error("ERROR: Please provide an Excel filename as argument");
		console.error("Usage: npm run seed:entitlements <filename.xlsx>");
		console.error("Example: npm run seed:entitlements user1-products.xlsx");
		process.exit(1);
	}

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
		console.log(`Reading from: ${filePath}\n`);

		const workbook = XLSX.readFile(filePath);

		// Read user info from "User" sheet
		const userInfo = readUserSheet(workbook);
		if (!userInfo) {
			console.error('ERROR: Could not read user info from "User" sheet');
			process.exit(1);
		}
		console.log(`User: ${userInfo.name} (${userInfo.email})\n`);

		// Look up user in database
		const user = await prisma.user.findFirst({
			where: { email: userInfo.email },
		});

		if (!user) {
			console.error(`ERROR: User not found in database: ${userInfo.email}`);
			console.error("Please run user seed first: npm run seed:users");
			process.exit(1);
		}
		console.log(`Found user in database: ${user.id}\n`);

		// Read products from "Products" sheet
		const productRows = readProductsSheet(workbook);
		console.log(`Found ${productRows.length} products to process\n`);

		const { valid: validProducts, invalid } = validateProductRows(productRows);

		if (invalid.length > 0) {
			console.log("Validation warnings:");
			invalid.forEach((err) => {
				console.log(`  Row ${err.row}: [${err.field}] ${err.message}`);
			});
			console.log("");
		}

		const results = await seedEntitlements(prisma, user.id, validProducts);
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
// ============================================
function readUserSheet(workbook: XLSX.WorkBook): UserInfo | null {
	const sheet = workbook.Sheets["User"];
	if (!sheet) {
		console.error('ERROR: Sheet "User" not found in workbook');
		console.error("Available sheets:", workbook.SheetNames.join(", "));
		return null;
	}

	const rows = XLSX.utils.sheet_to_json<UserRow>(sheet);
	if (rows.length === 0) {
		console.error('ERROR: No data in "User" sheet');
		return null;
	}

	const row = rows[0];
	const email = String(row.email ?? "")
		.trim()
		.toLowerCase();
	const name = String(row.name ?? "").trim();

	if (!email || !name) {
		console.error("ERROR: User sheet must have email and name columns");
		return null;
	}

	return { email, name };
}

function readProductsSheet(workbook: XLSX.WorkBook): ProductRow[] {
	const sheet = workbook.Sheets["Products"];
	if (!sheet) {
		console.error('ERROR: Sheet "Products" not found in workbook');
		console.error("Available sheets:", workbook.SheetNames.join(", "));
		return [];
	}

	return XLSX.utils.sheet_to_json<ProductRow>(sheet);
}

// ============================================
// VALIDATION
// ============================================
function validateProductRows(rows: ProductRow[]): {
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

		// imageUrl (optional)
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
// ENTITLEMENT SEEDING
// ============================================
async function seedEntitlements(
	prisma: PrismaClient,
	userId: string,
	products: ProductInput[],
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
						// Use product defaults, can add custom values from Excel if needed
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
function printSummary(results: SeedResult, errors: ValidationError[]) {
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
	console.log(`  Invalid rows:         ${errors.length} (validation errors)`);
	console.log("\nEntitlement seed completed.");
}

// Run
main();
