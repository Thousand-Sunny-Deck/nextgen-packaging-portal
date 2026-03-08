import { Upload } from "lucide-react";

export function CsvUpload() {
	return (
		<div className="py-4 max-w-lg mx-auto space-y-4">
			<div className="flex items-center justify-between">
				<p className="text-sm text-slate-500">Max 30 products per upload.</p>
				<button
					type="button"
					className="text-xs text-orange-600 hover:underline"
					disabled
				>
					Download template
				</button>
			</div>

			<label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 cursor-not-allowed opacity-60">
				<Upload className="h-8 w-8 text-slate-300 mb-3" />
				<p className="text-sm font-medium text-slate-500">Drop CSV file here</p>
				<p className="text-xs text-slate-400 mt-1">or click to browse</p>
				<input type="file" accept=".csv" className="hidden" disabled />
			</label>

			<div className="rounded-md bg-orange-50 border border-orange-100 px-4 py-3 text-sm text-orange-700">
				CSV upload is not yet implemented. Use Manual Entry for now.
			</div>
		</div>
	);
}
