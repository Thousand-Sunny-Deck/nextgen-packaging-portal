"use client";

import { useRef, useState } from "react";
import { Upload, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	useCreateProductStore,
	MAX_PRODUCT_DRAFT,
} from "@/lib/store/create-product-store";
import { parseCsv } from "./parser";

const TEMPLATE_CONTENT =
	"BOX-001,Premium cardboard box,9.99,4.50\nBOX-002,Heavy duty shipping box,14.50,NA\nENV-001,Standard envelope,2.99,1.25\n";

type Status =
	| { type: "idle" }
	| { type: "success"; count: number }
	| { type: "error"; errors: string[] };

export function CsvUpload() {
	const { draft, addItem } = useCreateProductStore();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isDragging, setIsDragging] = useState(false);
	const [status, setStatus] = useState<Status>({ type: "idle" });

	const existingSkus = new Set(
		[...draft.values()].map((item) => item.sku.toLowerCase()),
	);

	const processFile = (file: File) => {
		if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
			setStatus({ type: "error", errors: ["Only .csv files are accepted."] });
			return;
		}

		const reader = new FileReader();
		reader.onload = (e) => {
			const text = e.target?.result;
			if (typeof text !== "string") return;

			const result = parseCsv(text, existingSkus);

			if (!result.ok) {
				setStatus({ type: "error", errors: result.errors });
				return;
			}

			for (const row of result.rows) {
				addItem({ ...row });
			}

			setStatus({ type: "success", count: result.rows.length });
		};
		reader.readAsText(file);
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) processFile(file);
		e.target.value = "";
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = () => setIsDragging(false);

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		const file = e.dataTransfer.files[0];
		if (file) processFile(file);
	};

	const handleDownloadTemplate = () => {
		const blob = new Blob([TEMPLATE_CONTENT], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "product-template.csv";
		a.click();
		URL.revokeObjectURL(url);
	};

	const reset = () => setStatus({ type: "idle" });

	return (
		<div className="py-4 max-w-lg mx-auto space-y-4">
			{/* Header row */}
			<div className="flex items-center justify-between">
				<p className="text-sm text-slate-500">
					Max {MAX_PRODUCT_DRAFT} products per upload (sleeves count
					separately).
				</p>
				<button
					type="button"
					onClick={handleDownloadTemplate}
					className="text-xs text-slate-500 hover:text-slate-800 hover:underline"
				>
					Download template ↓
				</button>
			</div>

			{/* Constraint hint */}
			<p className="text-xs text-slate-400">
				Fields must not contain commas or quotes. Format:{" "}
				<span className="font-mono">sku,description,unit-cost,sleeve-cost</span>{" "}
				— use <span className="font-mono">NA</span> for sleeve cost if not
				applicable.
			</p>

			{/* Idle — drop zone */}
			{status.type === "idle" && (
				<>
					<div
						onDragOver={handleDragOver}
						onDragLeave={handleDragLeave}
						onDrop={handleDrop}
						onClick={() => fileInputRef.current?.click()}
						className={[
							"flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-colors gap-2",
							isDragging
								? "border-slate-400 bg-slate-100"
								: "border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300",
						].join(" ")}
					>
						<Upload
							className={`h-8 w-8 ${isDragging ? "text-slate-500" : "text-slate-300"}`}
						/>
						<p className="text-sm font-medium text-slate-500">
							Drop CSV file here
						</p>
						<p className="text-xs text-slate-400">or click to browse</p>
						<input
							ref={fileInputRef}
							type="file"
							accept=".csv"
							className="hidden"
							onChange={handleFileChange}
						/>
					</div>
				</>
			)}

			{/* Success */}
			{status.type === "success" && (
				<div className="rounded-lg border border-green-200 bg-green-50 px-5 py-6 space-y-3">
					<div className="flex items-center gap-2 text-green-700">
						<CheckCircle2 className="h-5 w-5 shrink-0" />
						<p className="text-sm font-semibold">
							{status.count} product{status.count > 1 ? "s" : ""} parsed
							successfully
						</p>
					</div>
					<p className="text-sm text-green-700">
						Products have been added to your draft. Switch to Manual Entry to
						review or edit individual items.
					</p>
					<Button variant="outline" size="sm" onClick={reset}>
						Upload another file
					</Button>
				</div>
			)}

			{/* Errors */}
			{status.type === "error" && (
				<div className="rounded-lg border border-red-200 bg-red-50 px-5 py-5 space-y-3">
					<div className="flex items-center gap-2 text-red-700">
						<XCircle className="h-5 w-5 shrink-0" />
						<p className="text-sm font-semibold">
							{status.errors.length} error
							{status.errors.length > 1 ? "s" : ""} found — nothing was added
						</p>
					</div>
					<ul className="space-y-1">
						{status.errors.map((err, i) => (
							<li key={i} className="text-sm text-red-700 flex gap-2">
								<span className="shrink-0">•</span>
								<span>{err}</span>
							</li>
						))}
					</ul>
					<Button variant="outline" size="sm" onClick={reset}>
						Try again
					</Button>
				</div>
			)}
		</div>
	);
}
