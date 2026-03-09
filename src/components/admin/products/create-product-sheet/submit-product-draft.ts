import { slugify } from "@/lib/utils";
import {
	getProductImageUploadUrl,
	bulkCreateProducts,
	type BulkCreateProductsResult,
} from "@/actions/spike/products-actions";
import type { ProductDraftItem } from "@/lib/store/create-product-store";

type UploadMeta = {
	item: ProductDraftItem;
	uploadUrl?: string;
	s3Key?: string;
};

async function resolveUploadUrls(
	items: ProductDraftItem[],
): Promise<UploadMeta[]> {
	return Promise.all(
		items.map(async (item) => {
			if (!item.imageFile) return { item };
			const handle = slugify(`${item.sku} ${item.description}`);
			const { uploadUrl, s3Key } = await getProductImageUploadUrl(handle);
			return { item, uploadUrl, s3Key };
		}),
	);
}

async function uploadImagesToS3(meta: UploadMeta[]): Promise<void> {
	await Promise.all(
		meta
			.filter(
				(m): m is UploadMeta & { uploadUrl: string; s3Key: string } =>
					!!m.uploadUrl,
			)
			.map((m) =>
				fetch(m.uploadUrl, {
					method: "PUT",
					body: m.item.imageFile,
					headers: { "Content-Type": m.item.imageFile!.type },
				}).then((res) => {
					if (!res.ok)
						throw new Error(
							`Image upload failed for ${m.item.sku} (${res.status})`,
						);
				}),
			),
	);
}

async function createProducts(
	meta: UploadMeta[],
): Promise<BulkCreateProductsResult> {
	return bulkCreateProducts(
		meta.map(({ item, s3Key }) => ({
			sku: item.sku,
			description: item.description,
			unitCost: item.unitCost,
			imageUrl: s3Key,
		})),
	);
}

export async function submitProductDraft(
	items: ProductDraftItem[],
): Promise<BulkCreateProductsResult> {
	const meta = await resolveUploadUrls(items);
	await uploadImagesToS3(meta);
	return createProducts(meta);
}
