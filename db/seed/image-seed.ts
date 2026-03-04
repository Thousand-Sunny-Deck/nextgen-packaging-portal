// Load environment variables FIRST before any other imports
import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as path from "path";

// ============================================
// TYPES
// ============================================
interface ImageMapperRow {
	sku: string;
	description: string;
	imageFilename: string;
}

interface ImageNotFoundEntry {
	sku: string;
	handle: string;
	tried: string[];
}

interface FailedEntry {
	handle: string;
	error: string;
}

interface SkuMismatchEntry {
	handle: string;
	csvSku: string;
	dbSku: string;
}

interface SeedResult {
	uploaded: string[];
	skipped: string[];
	dbNotFound: string[];
	imageNotFound: ImageNotFoundEntry[];
	noImageFilename: string[];
	skuMismatch: SkuMismatchEntry[];
	failed: FailedEntry[];
}

// ============================================
// SLUGIFY — same logic as csv-reader.ts
// ============================================
function slugify(str: string): string {
	return str
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/, "");
}

// ============================================
// CSV PARSING
// ============================================
function parseCsvLine(line: string): string[] {
	const values: string[] = [];
	let current = "";
	let inQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];
		if (char === '"') {
			if (inQuotes && line[i + 1] === '"') {
				current += '"';
				i++;
			} else {
				inQuotes = !inQuotes;
			}
		} else if (char === "," && !inQuotes) {
			values.push(current.trim());
			current = "";
		} else {
			current += char;
		}
	}
	values.push(current.trim());
	return values;
}

function readImageMapperCsv(filePath: string): ImageMapperRow[] {
	console.log(`Reading from: ${filePath}`);
	const content = fs.readFileSync(filePath, "utf-8");
	const lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);

	const rows: ImageMapperRow[] = [];
	for (const line of lines) {
		const values = parseCsvLine(line);
		const sku = values[0]?.trim() ?? "";
		if (!sku) continue;

		const description = values[1]?.trim() ?? "";
		if (!description) continue;

		const imageFilename = values[4]?.trim() ?? "";
		rows.push({ sku, description, imageFilename });
	}

	return rows;
}

// ============================================
// IMAGE RESOLUTION
// ============================================
const IMAGES_DIR = path.join(__dirname, "data", "images", "Product Images");
const EXTENSIONS = [".png", ".jpg", ".jpeg"] as const;

function resolveImagePath(
	imageFilename: string,
): { filePath: string; ext: string } | null {
	for (const ext of EXTENSIONS) {
		const filePath = path.join(IMAGES_DIR, `${imageFilename}${ext}`);
		if (fs.existsSync(filePath)) {
			return { filePath, ext };
		}
	}
	return null;
}

// ============================================
// MAIN ENTRY POINT
// ============================================
async function main() {
	console.log("Starting image seed...\n");

	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		console.error("ERROR: DATABASE_URL environment variable is not set");
		process.exit(1);
	}

	const bucketName = process.env.AWS_S3_BUCKET_NAME;
	if (!bucketName) {
		console.error("ERROR: AWS_S3_BUCKET_NAME environment variable is not set");
		process.exit(1);
	}

	const awsRegion = process.env.AWS_REGION ?? "us-east-1";

	if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
		console.error(
			"ERROR: AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY must be set",
		);
		process.exit(1);
	}

	const s3 = new S3Client({
		region: awsRegion,
		credentials: {
			accessKeyId: process.env.AWS_ACCESS_KEY_ID,
			secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
		},
		maxAttempts: 3,
	});

	const adapter = new PrismaPg({ connectionString: databaseUrl });
	const prisma = new PrismaClient({ adapter });

	try {
		const csvPath = path.join(__dirname, "data", "images-mapper.csv");
		const rows = readImageMapperCsv(csvPath);
		console.log(`Found ${rows.length} rows to process\n`);

		const results = await seedImages(prisma, s3, bucketName, rows);
		printSummary(results);
	} catch (error) {
		console.error("Fatal error:", error);
		process.exit(1);
	} finally {
		await prisma.$disconnect();
		s3.destroy();
	}
}

// ============================================
// IMAGE SEEDING
// ============================================
async function seedImages(
	prisma: PrismaClient,
	s3: S3Client,
	bucketName: string,
	rows: ImageMapperRow[],
): Promise<SeedResult> {
	const results: SeedResult = {
		uploaded: [],
		skipped: [],
		dbNotFound: [],
		imageNotFound: [],
		noImageFilename: [],
		skuMismatch: [],
		failed: [],
	};

	const total = rows.length;
	console.log("Processing...\n");

	for (let i = 0; i < total; i++) {
		const { sku, description, imageFilename } = rows[i];
		const handle = slugify(`${sku} ${description}`);
		const tag = `  [${i + 1}/${total}] ${sku} (${handle})`;

		// Skip rows with no image filename or marked COMING SOON
		if (!imageFilename) {
			console.log(`${tag} - Skipped: empty image filename`);
			results.noImageFilename.push(handle);
			continue;
		}
		if (imageFilename.toUpperCase() === "COMING SOON") {
			console.log(`${tag} - Skipped: marked COMING SOON`);
			results.noImageFilename.push(handle);
			continue;
		}

		// Resolve image file on disk
		const resolved = resolveImagePath(imageFilename);
		if (!resolved) {
			const tried = EXTENSIONS.map((ext) => `${imageFilename}${ext}`);
			console.log(
				`${tag} - SKIP: image not found on disk (tried: ${tried.join(", ")})`,
			);
			results.imageNotFound.push({ sku, handle, tried });
			continue;
		}

		// Verify product exists in DB
		const product = await prisma.product.findUnique({ where: { handle } });
		if (!product) {
			console.log(`${tag} - SKIP: no product in DB with handle "${handle}"`);
			results.dbNotFound.push(handle);
			continue;
		}
		if (product.sku !== sku) {
			console.warn(
				`${tag} - SKIP: SKU mismatch — DB has "${product.sku}", CSV has "${sku}" (handle collision)`,
			);
			results.skuMismatch.push({ handle, csvSku: sku, dbSku: product.sku });
			continue;
		}

		// Already seeded — imageUrl matches what we'd write, skip
		const s3Key = `images/${handle}.png`;
		if (product.imageUrl === s3Key) {
			console.log(`${tag} - Skipped: already seeded`);
			results.skipped.push(handle);
			continue;
		}

		// Upload to S3 and update DB
		try {
			const fileBuffer = fs.readFileSync(resolved.filePath);

			await s3.send(
				new PutObjectCommand({
					Bucket: bucketName,
					Key: s3Key,
					Body: fileBuffer,
					ContentType: "image/png",
				}),
			);

			await prisma.product.update({
				where: { handle },
				data: { imageUrl: s3Key },
			});

			console.log(`${tag} - Uploaded -> ${s3Key}`);
			results.uploaded.push(handle);
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			console.error(`${tag} - FAILED: ${errorMessage}`);
			results.failed.push({ handle, error: errorMessage });
		}
	}

	return results;
}

// ============================================
// REPORTING
// ============================================
function printSummary(results: SeedResult) {
	const {
		uploaded,
		skipped,
		dbNotFound,
		imageNotFound,
		noImageFilename,
		skuMismatch,
		failed,
	} = results;

	console.log("\n" + "=".repeat(60));
	console.log("IMAGE SEED RESULTS");
	console.log("=".repeat(60));

	console.log(`\nUploaded (${uploaded.length}):`);
	if (uploaded.length > 0) {
		uploaded.forEach((h) => console.log(`  - ${h}`));
	} else {
		console.log("  (none)");
	}

	console.log(`\nSkipped / already seeded (${skipped.length}):`);
	if (skipped.length > 0) {
		skipped.forEach((h) => console.log(`  - ${h}`));
	} else {
		console.log("  (none)");
	}

	console.log(`\nDB not found (${dbNotFound.length}):`);
	if (dbNotFound.length > 0) {
		dbNotFound.forEach((h) => console.log(`  - ${h}`));
	} else {
		console.log("  (none)");
	}

	console.log(`\nImage not found on disk (${imageNotFound.length}):`);
	if (imageNotFound.length > 0) {
		imageNotFound.forEach(({ sku, handle, tried }) =>
			console.log(`  - ${sku} (${handle}) | tried: ${tried.join(", ")}`),
		);
	} else {
		console.log("  (none)");
	}

	console.log(`\nNo image / COMING SOON (${noImageFilename.length}):`);
	if (noImageFilename.length > 0) {
		noImageFilename.forEach((h) => console.log(`  - ${h}`));
	} else {
		console.log("  (none)");
	}

	console.log(`\nSKU mismatch / handle collision (${skuMismatch.length}):`);
	if (skuMismatch.length > 0) {
		skuMismatch.forEach(({ handle, csvSku, dbSku }) =>
			console.log(`  - ${handle} | CSV: "${csvSku}" vs DB: "${dbSku}"`),
		);
	} else {
		console.log("  (none)");
	}

	console.log(`\nFailed (${failed.length}):`);
	if (failed.length > 0) {
		failed.forEach(({ handle, error }) =>
			console.log(`  - ${handle}: ${error}`),
		);
	} else {
		console.log("  (none)");
	}

	console.log("\n" + "=".repeat(60));
	console.log("Image seed completed.");
}

// Run
main();
