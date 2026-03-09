"use client";

import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ProductImageViewerModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	imageUrl: string | null;
	loading: boolean;
	error: string | null;
}

export function ProductImageViewerModal({
	open,
	onOpenChange,
	imageUrl,
	loading,
	error,
}: ProductImageViewerModalProps) {
	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent
				className="max-w-[92vw] border-0 bg-black/80 p-0 shadow-none sm:max-w-[92vw]"
				showCloseButton={false}
			>
				<DialogTitle className="sr-only">Product Image</DialogTitle>
				<div className="relative flex min-h-[60vh] items-center justify-center p-6">
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="absolute right-3 top-3 h-8 w-8 p-0 text-white hover:bg-white/10 hover:text-white"
						onClick={() => onOpenChange(false)}
					>
						<X className="h-4 w-4" />
					</Button>

					{loading && (
						<p className="text-sm text-slate-200">Loading image...</p>
					)}

					{error && !loading && (
						<div className="rounded-md border border-red-300 bg-red-950/50 px-4 py-3 text-sm text-red-100">
							{error}
						</div>
					)}

					{!loading && !error && imageUrl && (
						<Image
							src={imageUrl}
							alt="Product"
							className="max-h-[80vh] max-w-[90vw] rounded-md border border-slate-700 object-contain"
						/>
					)}
				</div>
			</DialogContent>
		</Dialog>
	);
}
