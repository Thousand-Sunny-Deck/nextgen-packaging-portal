"use client";

import { useRef } from "react";
import { ImagePlus, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ProductImageUploadModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	productSku: string | null;
	imagePreview: string | null;
	imageError: string | null;
	submitting: boolean;
	onFileSelect: (file: File | null) => void;
	onConfirm: () => void;
}

export function ProductImageUploadModal({
	open,
	onOpenChange,
	productSku,
	imagePreview,
	imageError,
	submitting,
	onFileSelect,
	onConfirm,
}: ProductImageUploadModalProps) {
	const fileInputRef = useRef<HTMLInputElement>(null);

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (submitting) return;
				onOpenChange(nextOpen);
			}}
		>
			<DialogContent className="max-w-xl">
				<DialogHeader>
					<DialogTitle>Upload Product Image</DialogTitle>
					<DialogDescription>
						Upload image for {productSku ?? "selected product"} and confirm to
						save it.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-2 py-2">
					{imagePreview ? (
						<div className="relative h-72 w-full overflow-hidden rounded-lg border border-slate-200">
							<Image
								src={imagePreview}
								alt="preview"
								fill
								className="object-cover"
							/>
							<button
								type="button"
								onClick={() => onFileSelect(null)}
								className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
							>
								<X size={14} />
							</button>
						</div>
					) : (
						<div
							onClick={() => fileInputRef.current?.click()}
							className="flex h-72 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-slate-200 bg-slate-50 transition-colors hover:bg-slate-100"
						>
							<ImagePlus className="h-9 w-9 text-slate-300" />
							<div className="text-center">
								<p className="text-sm font-medium text-slate-500">
									Product Image
								</p>
								<p className="text-xs text-slate-400">
									PNG, JPG, WebP · max 5 MB
								</p>
							</div>
							<Button
								type="button"
								size="sm"
								variant="outline"
								className="pointer-events-none mt-1"
							>
								<Upload size={13} className="mr-1.5" />
								Upload Image
							</Button>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/png,image/jpeg,image/webp"
								className="hidden"
								onChange={(event) => {
									const file = event.target.files?.[0] ?? null;
									onFileSelect(file);
									event.target.value = "";
								}}
							/>
						</div>
					)}

					{imageError && (
						<div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
							{imageError}
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => onOpenChange(false)}
						disabled={submitting}
					>
						Cancel
					</Button>
					<Button onClick={onConfirm} disabled={submitting || !imagePreview}>
						{submitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Uploading...
							</>
						) : (
							"Confirm Upload"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
