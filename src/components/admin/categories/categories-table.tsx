"use client";

import { useMemo, useState } from "react";
import {
	Check,
	Eye,
	FolderTree,
	Loader2,
	Pencil,
	Plus,
	RefreshCw,
	Trash2,
	X,
	ImagePlus,
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
import { EmptyState } from "@/components/admin/ui/empty-state";
import { AdminSearch } from "@/components/admin/ui/admin-search";
import { AdminPagination } from "@/components/admin/ui/admin-pagination";
import { AdminDataTable } from "@/components/admin/ui/admin-data-table";
import {
	RowActionsMenu,
	type RowActionItem,
} from "@/components/admin/ui/row-actions-menu";
import {
	deleteSpikeCategory,
	getSpikeCategoryImageUploadUrl,
	getSpikeCategoryImageViewUrl,
	updateSpikeCategory,
	updateSpikeCategoryImage,
	type SpikeAdminCategory,
} from "@/actions/spike/categories-actions";
import { ProductImageViewerModal } from "@/components/admin/products/product-image-viewer-modal";
import {
	getCategoryColumns,
	type CategoryEditDraft,
} from "./categories-columns";
import { CategoryCreateDialog } from "./category-create-dialog";
import { CategoryImageUploadModal } from "./category-image-upload-modal";

interface CategoriesTableProps {
	categories: SpikeAdminCategory[];
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
	| { type: "edit"; rowId: string; draft: CategoryEditDraft }
	| { type: "delete"; rowId: string; name: string };

const emptyDraft: CategoryEditDraft = {
	name: "",
	description: "",
	sortOrder: 0,
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export function CategoriesTable({
	categories,
	total,
	totalPages,
	loading,
	error,
	search,
	page,
	pageSize,
	onRefresh,
}: CategoriesTableProps) {
	const [createOpen, setCreateOpen] = useState(false);
	const [editingRowId, setEditingRowId] = useState<string | null>(null);
	const [editDraft, setEditDraft] = useState<CategoryEditDraft>(emptyDraft);
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
	const [uploadTarget, setUploadTarget] = useState<SpikeAdminCategory | null>(
		null,
	);
	const [uploadImageFile, setUploadImageFile] = useState<File | null>(null);
	const [uploadImagePreview, setUploadImagePreview] = useState<string | null>(
		null,
	);
	const [uploadImageError, setUploadImageError] = useState<string | null>(null);

	const categoryById = useMemo(
		() => new Map(categories.map((category) => [category.id, category])),
		[categories],
	);

	const categoryColumns = useMemo(
		() =>
			getCategoryColumns({
				editingRowId,
				editDraft,
				setEditDraft,
			}),
		[editingRowId, editDraft],
	);

	const startEditing = (row: SpikeAdminCategory) => {
		if (submitting) return;
		setEditingRowId(row.id);
		setEditDraft({
			name: row.name,
			description: row.description ?? "",
			sortOrder: row.sortOrder,
		});
		setSubmitError(null);
	};

	const cancelEditing = () => {
		setEditingRowId(null);
		setEditDraft(emptyDraft);
	};

	const hasDraftChanged = () => {
		if (!editingRowId) return false;
		const row = categoryById.get(editingRowId);
		if (!row) return false;
		return (
			editDraft.name.trim() !== row.name ||
			editDraft.description.trim() !== (row.description ?? "") ||
			editDraft.sortOrder !== row.sortOrder
		);
	};

	const openEditConfirmation = () => {
		if (!editingRowId) return;
		const name = editDraft.name.trim();
		if (!name || !Number.isFinite(editDraft.sortOrder)) return;
		if (!hasDraftChanged()) return;
		setSubmitError(null);
		setConfirmAction({
			type: "edit",
			rowId: editingRowId,
			draft: {
				name,
				description: editDraft.description.trim(),
				sortOrder: editDraft.sortOrder,
			},
		});
	};

	const openDeleteConfirmation = (row: SpikeAdminCategory) => {
		setSubmitError(null);
		setConfirmAction({ type: "delete", rowId: row.id, name: row.name });
	};

	const openImageViewer = async (row: SpikeAdminCategory) => {
		setImageModalOpen(true);
		setImageLoading(true);
		setImageError(null);
		setImageUrl(null);

		const result = await getSpikeCategoryImageViewUrl({ categoryId: row.id });
		if (!result.success || !result.imageUrl) {
			setImageError(result.error || "Failed to load category image.");
			setImageLoading(false);
			return;
		}

		setImageUrl(result.imageUrl);
		setImageLoading(false);
	};

	const resetUploadState = () => {
		setUploadTarget(null);
		setUploadImageFile(null);
		setUploadImagePreview(null);
		setUploadImageError(null);
	};

	const openUploadImageModal = (row: SpikeAdminCategory) => {
		setUploadTarget(row);
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
		if (!uploadTarget || !uploadImageFile) return;

		setSubmitting(true);
		setUploadImageError(null);
		try {
			const uploadMeta = await getSpikeCategoryImageUploadUrl({
				categoryId: uploadTarget.id,
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

			const updateResult = await updateSpikeCategoryImage({
				categoryId: uploadTarget.id,
				imageUrl: uploadMeta.s3Key,
			});
			if (!updateResult.success) {
				setUploadImageError(updateResult.error || "Failed to save image.");
				setSubmitting(false);
				return;
			}

			toast.success("Category image uploaded.");
			setUploadImageModalOpen(false);
			resetUploadState();
			onRefresh();
			setSubmitting(false);
		} catch (err) {
			setUploadImageError(
				err instanceof Error ? err.message : "Failed to upload image.",
			);
			setSubmitting(false);
		}
	};

	const handleConfirmAction = async () => {
		if (!confirmAction) return;
		setSubmitting(true);
		setSubmitError(null);

		if (confirmAction.type === "edit") {
			const result = await updateSpikeCategory({
				categoryId: confirmAction.rowId,
				name: confirmAction.draft.name,
				description: confirmAction.draft.description || null,
				sortOrder: confirmAction.draft.sortOrder,
			});

			if (!result.success) {
				setSubmitting(false);
				setSubmitError(result.error || "Failed to apply changes.");
				return;
			}
			toast.success("Category updated.");
		} else {
			const result = await deleteSpikeCategory({
				categoryId: confirmAction.rowId,
			});
			if (!result.success) {
				setSubmitting(false);
				setSubmitError(result.error || "Failed to apply changes.");
				return;
			}
			toast.success("Category deleted.");
			if (result.warning) {
				toast.warning(result.warning);
			}
		}

		setConfirmAction(null);
		cancelEditing();
		onRefresh();
		setSubmitting(false);
	};

	const renderRowActions = (row: SpikeAdminCategory) => {
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

		const rowActions: RowActionItem<SpikeAdminCategory>[] = [
			{
				key: "edit-category",
				label: "Edit",
				icon: <Pencil className="h-4 w-4" />,
				onSelect: startEditing,
			},
			{
				key: "upload-image",
				label: "Upload image",
				icon: <ImagePlus className="h-4 w-4" />,
				onSelect: openUploadImageModal,
			},
			{
				key: "view-image",
				label: "View image",
				icon: <Eye className="h-4 w-4" />,
				onSelect: openImageViewer,
			},
			{
				key: "delete-category",
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
				triggerLabel="Open category actions"
			/>
		);
	};

	return (
		<>
			<CategoryCreateDialog
				open={createOpen}
				onOpenChange={setCreateOpen}
				onCreated={onRefresh}
			/>

			<div className="mb-4 flex flex-col items-stretch justify-between gap-2 sm:flex-row sm:items-center">
				<AdminSearch defaultValue={search} placeholder="Search categories..." />
				<div className="flex items-center gap-2">
					<Button
						size="sm"
						onClick={() => setCreateOpen(true)}
						className="shrink-0"
					>
						<Plus size={14} className="mr-1.5" />
						Create Category
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

			{categories.length === 0 && !loading ? (
				<EmptyState
					icon={FolderTree}
					heading="No categories found"
					description={
						search
							? `No categories match "${search}". Try a different search.`
							: "No categories yet. Create one to start grouping products."
					}
				/>
			) : (
				<AdminDataTable
					columns={categoryColumns}
					data={categories}
					getRowId={(category) => category.id}
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
				itemLabel="categories"
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
								? "Confirm Category Update"
								: "Confirm Category Deletion"}
						</DialogTitle>
						<DialogDescription>
							{confirmAction?.type === "edit"
								? "This will update the name, description and sort order for this category."
								: `This will permanently delete ${confirmAction?.name ?? "this category"} and remove it from all products. Products themselves are not deleted.`}
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

			<CategoryImageUploadModal
				open={uploadImageModalOpen}
				onOpenChange={(open) => {
					setUploadImageModalOpen(open);
					if (!open) {
						resetUploadState();
					}
				}}
				categoryName={uploadTarget?.name ?? null}
				imagePreview={uploadImagePreview}
				imageError={uploadImageError}
				submitting={submitting}
				onFileSelect={handleUploadFileSelect}
				onConfirm={handleConfirmUploadImage}
			/>
		</>
	);
}
