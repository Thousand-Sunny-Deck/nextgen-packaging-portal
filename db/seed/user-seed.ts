// Load environment variables FIRST before any other imports
import dotenv from "dotenv";
dotenv.config();

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import * as path from "path";
import { readCsvFile } from "./utils/csv-reader";
// import * as crypto from "crypto";

// ============================================
// TYPES
// ============================================
interface RawRow {
	name?: unknown;
	email?: unknown;
}

interface UserInput {
	name: string;
	email: string;
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
	console.log("Starting user seed...\n");

	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		console.error("ERROR: DATABASE_URL environment variable is not set");
		process.exit(1);
	}

	// Create Prisma client
	const adapter = new PrismaPg({ connectionString: databaseUrl });
	const prisma = new PrismaClient({ adapter });

	// Create auth instance for seeding
	const auth = betterAuth({
		database: prismaAdapter(prisma, {
			provider: "postgresql",
		}),
		emailAndPassword: {
			enabled: true,
			autoSignIn: false,
		},
		advanced: {
			database: {
				generateId: false,
			},
		},
	});

	try {
		const filePath = path.join(__dirname, "data", "users.csv");
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

		const results = await seedUsers(auth, valid);
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
// Responsibility: Validate and transform raw rows into typed User objects
// ============================================
function validateRows(rows: RawRow[]): {
	valid: UserInput[];
	invalid: ValidationError[];
} {
	const valid: UserInput[] = [];
	const invalid: ValidationError[] = [];
	const seenEmails = new Set<string>();

	rows.forEach((row, index) => {
		const rowNum = index + 2; // Excel rows start at 1, plus header row
		const errors: ValidationError[] = [];

		// Validate name
		const name = String(row.name ?? "").trim();
		if (!name) {
			errors.push({
				row: rowNum,
				field: "name",
				message: "Required field is empty",
			});
		}

		// Validate email
		const email = String(row.email ?? "")
			.trim()
			.toLowerCase();
		if (!email) {
			errors.push({
				row: rowNum,
				field: "email",
				message: "Required field is empty",
			});
		} else if (!isValidEmail(email)) {
			errors.push({
				row: rowNum,
				field: "email",
				message: `Invalid email format: ${email}`,
			});
		} else if (seenEmails.has(email)) {
			errors.push({
				row: rowNum,
				field: "email",
				message: `Duplicate email in file: ${email}`,
			});
		} else {
			seenEmails.add(email);
		}

		if (errors.length > 0) {
			invalid.push(...errors);
		} else {
			valid.push({ name, email });
		}
	});

	return { valid, invalid };
}

function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

// ============================================
// PASSWORD GENERATION
// Responsibility: Generate secure random password
// ============================================
// function generatePassword(): string {
// 	return crypto.randomBytes(12).toString("base64").slice(0, 16);
// }

// ============================================
// USER REGISTRATION
// Responsibility: Register users via better-auth API
// ============================================
async function seedUsers(
	auth: ReturnType<typeof betterAuth>,
	users: UserInput[],
): Promise<SeedResult> {
	const results: SeedResult = { created: 0, skipped: 0, failed: 0 };
	const total = users.length;

	console.log("Processing...");

	for (let i = 0; i < users.length; i++) {
		const user = users[i];
		const password = "Testing123";

		try {
			await auth.api.signUpEmail({
				body: {
					name: user.name,
					email: user.email,
					password: password,
				},
			});

			console.log(`  [${i + 1}/${total}] ${user.email} - Created`);
			results.created++;
		} catch (error: unknown) {
			// Check if user already exists
			const errorMessage =
				error instanceof Error ? error.message : String(error);

			if (
				errorMessage.includes("already exists") ||
				errorMessage.includes("UNIQUE constraint") ||
				errorMessage.includes("duplicate key")
			) {
				console.log(
					`  [${i + 1}/${total}] ${user.email} - Skipped (already exists)`,
				);
				results.skipped++;
			} else {
				console.error(
					`  [${i + 1}/${total}] ${user.email} - Failed: ${errorMessage}`,
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
	console.log(`  Created: ${results.created}`);
	console.log(`  Skipped: ${results.skipped} (already exist)`);
	console.log(`  Failed:  ${results.failed}`);
	console.log(`  Invalid: ${errors.length} (validation errors)`);
	console.log("\nUser seed completed.");
}

// Run
main();
