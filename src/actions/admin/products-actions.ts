"use server";

import { requireAdmin } from "@/lib/auth/admin-guard";
import { prisma } from "@/lib/config/prisma";

export type AdminProduct = {
	id: string;
	sku: string;
	description: string;
	unitCost: number;
};

export async function getProducts(): Promise<{
	products: AdminProduct[];
	total: number;
}> {
	await requireAdmin();

	const products = await prisma.product.findMany({
		orderBy: { sku: "asc" },
		select: {
			id: true,
			sku: true,
			description: true,
			unitCost: true,
		},
	});

	return {
		products,
		total: products.length,
	};
}

export type CreateProductInput = {
	sku: string;
	description: string;
	unitCost: number;
};

export type CreateProductResult = {
	success: boolean;
	error?: string;
};

export async function createProduct(
	input: CreateProductInput,
): Promise<CreateProductResult> {
	await requireAdmin();

	try {
		await prisma.product.create({
			data: {
				sku: input.sku.trim(),
				description: input.description.trim(),
				unitCost: input.unitCost,
			},
		});

		return { success: true };
	} catch (error: unknown) {
		console.error("Failed to create product:", error);

		if (error instanceof Error) {
			if (error.message.includes("Unique constraint")) {
				return {
					success: false,
					error: "A product with this SKU already exists",
				};
			}
			return { success: false, error: error.message };
		}

		return { success: false, error: "Failed to create product" };
	}
}
