import { FileText, Upload } from "lucide-react";
import type { ProductDraftMode } from "@/lib/store/product-draft-store";

interface ModeToggleProps {
	mode: ProductDraftMode;
	onRequestSwitch: (to: ProductDraftMode) => void;
}

const options: {
	value: ProductDraftMode;
	label: string;
	icon: React.ElementType;
}[] = [
	{ value: "manual", label: "Manual Entry", icon: FileText },
	{ value: "csv", label: "CSV Upload", icon: Upload },
];

export function ModeToggle({ mode, onRequestSwitch }: ModeToggleProps) {
	return (
		<div className="flex rounded-md border border-slate-200 bg-slate-50 p-0.5 w-fit">
			{options.map(({ value, label, icon: Icon }) => (
				<button
					key={value}
					type="button"
					onClick={() => {
						if (value !== mode) onRequestSwitch(value);
					}}
					className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
						mode === value
							? "bg-white text-slate-900 shadow-sm"
							: "text-slate-500 hover:text-slate-700"
					}`}
				>
					<Icon size={14} />
					{label}
				</button>
			))}
		</div>
	);
}
