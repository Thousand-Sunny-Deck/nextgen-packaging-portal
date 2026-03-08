import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadEntitlementsPlaceholderProps {
	onLoad: () => void;
	loading: boolean;
}

export function LoadEntitlementsPlaceholder({
	onLoad,
	loading,
}: LoadEntitlementsPlaceholderProps) {
	return (
		<div className="rounded-lg border border-dashed border-slate-300 bg-white">
			<div className="flex flex-col items-center justify-center py-16 text-center">
				<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
					<Package className="h-6 w-6 text-slate-300" />
				</div>
				<h3 className="mb-1 text-sm font-semibold text-slate-900">
					Entitlements not loaded
				</h3>
				<p className="mb-4 max-w-sm text-sm text-slate-500">
					Click below to load this user&apos;s entitled products.
				</p>
				<Button onClick={onLoad} disabled={loading}>
					{loading ? "Loading..." : "Load Entitlements"}
				</Button>
			</div>
		</div>
	);
}
