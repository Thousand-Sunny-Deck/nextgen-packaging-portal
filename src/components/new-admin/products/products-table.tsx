"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import {
	Check,
	Eye,
	Loader2,
	Package,
	PackagePlus,
	Pencil,
	RefreshCw,
	Trash2,
	X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { CreateProductsSheet } from "@/components/new-admin/products/create-product-sheet/create-products";
import { EmptyState } from "@/components/new-admin/ui/empty-state";
import { AdminSearch } from "@/components/new-admin/ui/admin-search";
import { AdminPagination } from "@/components/new-admin/ui/admin-pagination";
import { AdminDataTable } from "@/components/new-admin/ui/admin-data-table";
import {
	RowActionsMenu,
	type RowActionItem,
} from "@/components/new-admin/ui/row-actions-menu";
import {
	deleteSpikeProduct,
	getSpikeProductImageUploadUrl,
	getSpikeProductImageViewUrl,
	updateSpikeProduct,
	updateSpikeProductImage,
	type SpikeAdminProduct,
} from "@/actions/spike/products-actions";
import { getProductColumns, type ProductEditDraft } from "./products-columns";
import { ProductImageViewerModal } from "./product-image-viewer-modal";
import { ProductImageUploadModal } from "./product-image-upload-modal";

interface ProductsTableProps {
	products: SpikeAdminProduct[];
	total: number;
	totalPages: number;
	loading: boolean;
	error: string | null;
	search: string;
	page: number;
	pageSize: number;
	onRefresh: () => void;
}

type ConfirmAction =
	| { type: "edit"; rowId: string; draft: ProductEditDraft }
	| { type: "delete"; rowId: string; sku: string };

const emptyDraft: ProductEditDraft = {
	sku: "",
	description: "",
	unitCost: 0,
};

export function ProductsTable({
	products,
	total,
	totalPages,
	loading,
	error,
	search,
	page,
	pageSize,
	onRefresh,
}: ProductsTableProps) {
	const [sheetOpen, setSheetOpen] = useState(false);
	const [editingRowId, setEditingRowId] = useState<string | null>(null);
	const [editDraft, setEditDraft] = useState<ProductEditDraft>(emptyDraft);
	const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(
		null,
	);
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	const [imageModalOpen, setImageModalOpen] = useState(false);
	const [imageLoading, setImageLoading] = useState(false);
	const [imageUrl, setImageUrl] = useState<string | null>(null);
	const [imageError, setImageError] = useState<string | null>(null);
	const [uploadImageModalOpen, setUploadImageModalOpen] = useState(false);
	const [uploadTargetProduct, setUploadTargetProduct] =
		useState<SpikeAdminProduct | null>(null);
	const [uploadImageFile, setUploadImageFile] = useState<File | null>(null);
	const [uploadImagePreview, setUploadImagePreview] = useState<string | null>(
		null,
	);
	const [uploadImageError, setUploadImageError] = useState<string | null>(null);

	const productById = useMemo(
		() => new Map(products.map((product) => [product.id, product])),
		[products],
	);

	const productColumns = useMemo(
		() =>
			getProductColumns({
				editingRowId,
				editDraft,
				setEditDraft,
			}),
		[editingRowId, editDraft],
	);

	const startEditing = (row: SpikeAdminProduct) => {
		if (submitting) return;
		setEditingRowId(row.id);
		setEditDraft({
			sku: row.sku,
			description: row.description,
			unitCost: row.unitCost,
		});
		setSubmitError(null);
	};

	const cancelEditing = () => {
		setEditingRowId(null);
		setEditDraft(emptyDraft);
	};

	const hasDraftChanged = () => {
		if (!editingRowId) return false;
		const row = productById.get(editingRowId);
		if (!row) return false;
		return (
			editDraft.sku.trim() !== row.sku ||
			editDraft.description.trim() !== row.description ||
			editDraft.unitCost !== row.unitCost
		);
	};

	const openEditConfirmation = () => {
		if (!editingRowId) return;
		const sku = editDraft.sku.trim();
		const description = editDraft.description.trim();
		if (!sku || !description || !Number.isFinite(editDraft.unitCost)) return;
		if (!hasDraftChanged()) return;
		setSubmitError(null);
		setConfirmAction({
			type: "edit",
			rowId: editingRowId,
			draft: {
				sku,
				description,
				unitCost: editDraft.unitCost,
			},
		});
	};

	const openDeleteConfirmation = (row: SpikeAdminProduct) => {
		setSubmitError(null);
		setConfirmAction({ type: "delete", rowId: row.id, sku: row.sku });
	};

	const openImageViewer = async (row: SpikeAdminProduct) => {
		setImageModalOpen(true);
		setImageLoading(true);
		setImageError(null);
		setImageUrl(null);

		const result = await getSpikeProductImageViewUrl({ productId: row.id });
		if (!result.success || !result.imageUrl) {
			setImageError(result.error || "Failed to load product image.");
			setImageLoading(false);
			return;
		}

		setImageUrl(result.imageUrl);
		setImageLoading(false);
	};

	const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
	const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

	const resetUploadState = () => {
		setUploadTargetProduct(null);
		setUploadImageFile(null);
		setUploadImagePreview(null);
		setUploadImageError(null);
	};

	const openUploadImageModal = (row: SpikeAdminProduct) => {
		setUploadTargetProduct(row);
		setUploadImageFile(null);
		setUploadImagePreview(null);
		setUploadImageError(null);
		setUploadImageModalOpen(true);
	};

	const handleUploadFileSelect = (file: File | null) => {
		if (!file) {
			setUploadImageFile(null);
			setUploadImagePreview(null);
			setUploadImageError(null);
			return;
		}
		if (!ACCEPTED_TYPES.includes(file.type)) {
			setUploadImageError("Only PNG, JPG, or WebP images are accepted.");
			return;
		}
		if (file.size > MAX_IMAGE_BYTES) {
			setUploadImageError("Image must be under 5 MB.");
			return;
		}
		setUploadImageError(null);
		setUploadImageFile(file);
		setUploadImagePreview(URL.createObjectURL(file));
	};

	const handleConfirmUploadImage = async () => {
		if (!uploadTargetProduct || !uploadImageFile) return;

		setSubmitting(true);
		setUploadImageError(null);
		try {
			const uploadMeta = await getSpikeProductImageUploadUrl({
				productId: uploadTargetProduct.id,
			});
			if (!uploadMeta.success || !uploadMeta.uploadUrl || !uploadMeta.s3Key) {
				setUploadImageError(
					uploadMeta.error || "Failed to prepare image upload.",
				);
				setSubmitting(false);
				return;
			}

			const uploadResponse = await fetch(uploadMeta.uploadUrl, {
				method: "PUT",
				body: uploadImageFile,
				headers: { "Content-Type": uploadImageFile.type },
			});
			if (!uploadResponse.ok) {
				setUploadImageError(
					`Image upload failed (${uploadResponse.status}). Please try again.`,
				);
				setSubmitting(false);
				return;
			}

			const updateResult = await updateSpikeProductImage({
				productId: uploadTargetProduct.id,
				imageUrl: uploadMeta.s3Key,
			});
			if (!updateResult.success) {
				setUploadImageError(updateResult.error || "Failed to save image.");
				setSubmitting(false);
				return;
			}

			const uploadedPreview = uploadImagePreview;
			const uploadedSku = uploadTargetProduct.sku;
			if (uploadedPreview) {
				toast.custom(() => (
					<div className="w-56 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
						<div className="relative h-32 w-full">
							<Image
								src={uploadedPreview}
								alt={`${uploadedSku} uploaded image`}
								fill
								unoptimized
								className="object-cover"
							/>
						</div>
						<div className="px-3 py-2">
							<p className="text-sm font-semibold text-slate-900">
								Image uploaded
							</p>
							<p className="text-xs text-slate-500">{uploadedSku}</p>
						</div>
					</div>
				));
			} else {
				toast.success("Product image uploaded.");
			}
			setUploadImageModalOpen(false);
			resetUploadState();
			onRefresh();
			setSubmitting(false);
		} catch (error) {
			setUploadImageError(
				error instanceof Error ? error.message : "Failed to upload image.",
			);
			setSubmitting(false);
		}
	};

	const handleConfirmAction = async () => {
		if (!confirmAction) return;
		setSubmitting(true);
		setSubmitError(null);

		if (confirmAction.type === "edit") {
			const result = await updateSpikeProduct({
				productId: confirmAction.rowId,
				sku: confirmAction.draft.sku,
				description: confirmAction.draft.description,
				unitCost: confirmAction.draft.unitCost,
			});

			if (!result.success) {
				setSubmitting(false);
				setSubmitError(result.error || "Failed to apply changes.");
				return;
			}
			toast.success("Product updated.");
		} else {
			const result = await deleteSpikeProduct({
				productId: confirmAction.rowId,
			});
			if (!result.success) {
				setSubmitting(false);
				setSubmitError(result.error || "Failed to apply changes.");
				return;
			}
			toast.success("Product deleted and entitlements removed.");
			if (result.warning) {
				toast.warning(result.warning);
			}
		}

		setConfirmAction(null);
		cancelEditing();
		onRefresh();
		setSubmitting(false);
	};

	const renderRowActions = (row: SpikeAdminProduct) => {
		const isEditing = editingRowId === row.id;
		const editingAnotherRow = editingRowId !== null && editingRowId !== row.id;

		if (isEditing) {
			return (
				<div className="flex items-center justify-end gap-1">
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 text-green-600 hover:bg-green-50 hover:text-green-700"
						onClick={openEditConfirmation}
						disabled={!hasDraftChanged() || submitting}
					>
						<Check className="h-4 w-4" />
					</Button>
					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
						onClick={cancelEditing}
						disabled={submitting}
					>
						<X className="h-4 w-4" />
					</Button>
				</div>
			);
		}

		const rowActions: RowActionItem<SpikeAdminProduct>[] = [
			{
				key: "edit-product",
				label: "Edit",
				icon: <Pencil className="h-4 w-4" />,
				onSelect: startEditing,
			},
			{
				key: "upload-image",
				label: "Upload image",
				icon: <PackagePlus className="h-4 w-4" />,
				onSelect: openUploadImageModal,
			},
			{
				key: "view-image",
				label: "View image",
				icon: <Eye className="h-4 w-4" />,
				onSelect: openImageViewer,
			},
			{
				key: "delete-product",
				label: "Delete",
				icon: <Trash2 className="h-4 w-4" />,
				variant: "destructive",
				onSelect: openDeleteConfirmation,
			},
		];

		return (
			<RowActionsMenu
				row={row}
				items={rowActions}
				disabled={editingAnotherRow || loading || submitting}
				triggerLabel="Open product actions"
			/>
		);
	};

	return (
		<>
			<CreateProductsSheet
				open={sheetOpen}
				onOpenChange={setSheetOpen}
				onProductsCreated={onRefresh}
			/>

			<div className="mb-4 flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center">
				<AdminSearch defaultValue={search} placeholder="Search products..." />
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						onClick={() => setSheetOpen(true)}
						className="shrink-0"
					>
						<PackagePlus size={14} className="mr-1.5" />
						Create Products
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={onRefresh}
						disabled={loading}
						className="shrink-0"
					>
						<RefreshCw size={14} className={loading ? "animate-spin" : ""} />
						<span className="ml-1.5">Refresh</span>
					</Button>
				</div>
			</div>

			{error && (
				<div className="mb-3 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
					{error}
				</div>
			)}

			{editingRowId && (
				<div className="mb-3 flex items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
					<p>
						You are editing, hit &quot;save&quot; to continue or
						&quot;cancel&quot;.
					</p>
					<div className="flex items-center gap-2">
						<Button
							size="sm"
							onClick={openEditConfirmation}
							disabled={!hasDraftChanged() || submitting}
						>
							Save
						</Button>
						<Button
							size="sm"
							variant="outline"
							onClick={cancelEditing}
							disabled={submitting}
						>
							Cancel
						</Button>
					</div>
				</div>
			)}

			{products.length === 0 && !loading ? (
				<EmptyState
					icon={Package}
					heading="No products found"
					description={
						search
							? `No products match "${search}". Try a different search.`
							: "No products in the database yet."
					}
				/>
			) : (
				<AdminDataTable
					columns={productColumns}
					data={products}
					getRowId={(product) => product.id}
					renderRowActions={renderRowActions}
					loading={loading}
					minWidth="min-w-[860px]"
				/>
			)}

			<AdminPagination
				page={page}
				totalPages={totalPages}
				total={total}
				pageSize={pageSize}
				itemLabel="products"
			/>

			<Dialog
				open={confirmAction !== null}
				onOpenChange={(open) => {
					if (submitting) return;
					if (!open) {
						setConfirmAction(null);
						setSubmitError(null);
					}
				}}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>
							{confirmAction?.type === "edit"
								? "Confirm Product Update"
								: "Confirm Product Deletion"}
						</DialogTitle>
						<DialogDescription>
							{confirmAction?.type === "edit"
								? "This will update SKU, description and unit cost for this product."
								: `This will permanently delete ${confirmAction?.sku ?? "this product"}, remove all user entitlements for it, and it will no longer appear in shop.`}
						</DialogDescription>
					</DialogHeader>
					{submitError && (
						<div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
							{submitError}
						</div>
					)}
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => {
								setConfirmAction(null);
								setSubmitError(null);
							}}
							disabled={submitting}
						>
							Cancel
						</Button>
						<Button
							variant={
								confirmAction?.type === "delete" ? "destructive" : "default"
							}
							onClick={handleConfirmAction}
							disabled={submitting}
						>
							{submitting ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Applying...
								</>
							) : (
								"Confirm"
							)}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<ProductImageViewerModal
				open={imageModalOpen}
				onOpenChange={(open) => {
					setImageModalOpen(open);
					if (!open) {
						setImageError(null);
						setImageUrl(null);
						setImageLoading(false);
					}
				}}
				imageUrl={imageUrl}
				loading={imageLoading}
				error={imageError}
			/>

			<ProductImageUploadModal
				open={uploadImageModalOpen}
				onOpenChange={(open) => {
					setUploadImageModalOpen(open);
					if (!open) {
						resetUploadState();
					}
				}}
				productSku={uploadTargetProduct?.sku ?? null}
				imagePreview={uploadImagePreview}
				imageError={uploadImageError}
				submitting={submitting}
				onFileSelect={handleUploadFileSelect}
				onConfirm={handleConfirmUploadImage}
			/>
		</>
	);
}
