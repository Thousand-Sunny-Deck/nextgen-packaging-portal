// Load environment variables FIRST before any other imports
import dotenv from "dotenv";
dotenv.config();

import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import * as fs from "fs";
import * as path from "path";

const IMAGES_DIR = path.join(__dirname, "images");

const CONTENT_TYPES: Record<string, string> = {
	jpg: "image/jpeg",
	jpeg: "image/jpeg",
	png: "image/png",
	webp: "image/webp",
};

async function main() {
	console.log("Starting image seed...\n");

	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		console.error("ERROR: DATABASE_URL environment variable is not set");
		process.exit(1);
	}

	const bucket = process.env.AWS_S3_IMAGES_BUCKET_NAME;
	if (!bucket) {
		console.error(
			"ERROR: AWS_S3_IMAGES_BUCKET_NAME environment variable is not set",
		);
		process.exit(1);
	}

	const region = process.env.AWS_REGION;
	if (!region) {
		console.error("ERROR: AWS_REGION environment variable is not set");
		process.exit(1);
	}

	const s3 = new S3Client({ region });
	const adapter = new PrismaPg({ connectionString: databaseUrl });
	const prisma = new PrismaClient({ adapter });

	const files = fs
		.readdirSync(IMAGES_DIR)
		.filter((f) => !f.startsWith(".") && CONTENT_TYPES[f.split(".").pop()!]);

	if (files.length === 0) {
		console.log("No image files found in db/seed/images/. Nothing to do.");
		await prisma.$disconnect();
		return;
	}

	console.log(`Found ${files.length} image(s) to process\n`);

	let uploaded = 0;
	let skipped = 0;

	for (const filename of files) {
		const ext = filename.split(".").pop()!.toLowerCase();
		const handle = filename.slice(0, filename.lastIndexOf("."));
		const s3Key = `products/${filename}`;
		const contentType = CONTENT_TYPES[ext];

		const product = await prisma.product.findUnique({ where: { handle } });
		if (!product) {
			console.warn(
				`  SKIP  ${filename} — no product with handle "${handle}" in DB`,
			);
			skipped++;
			continue;
		}

		const buffer = fs.readFileSync(path.join(IMAGES_DIR, filename));

		await s3.send(
			new PutObjectCommand({
				Bucket: bucket,
				Key: s3Key,
				Body: buffer,
				ContentType: contentType,
			}),
		);

		await prisma.product.update({
			where: { sku },
			data: { imageUrl: s3Key },
		});

		console.log(`  ✅  ${handle} → ${s3Key}`);
		uploaded++;
	}

	console.log(
		`\nDone. ${uploaded} uploaded, ${skipped} skipped (no DB match).`,
	);

	await prisma.$disconnect();
}

main().catch((err) => {
	console.error("Fatal error:", err);
	process.exit(1);
});
