import { Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LoadUsersPlaceholderProps {
	onLoad: () => void;
	loading: boolean;
	error: string | null;
}

export function LoadUsersPlaceholder({
	onLoad,
	loading,
	error,
}: LoadUsersPlaceholderProps) {
	return (
		<div className="flex flex-col items-center justify-center py-24 text-center">
			<div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
				<Users className="h-6 w-6 text-slate-300" />
			</div>
			<h3 className="text-sm font-semibold text-slate-900 mb-1">
				Users not loaded
			</h3>
			<p className="text-sm text-slate-500 max-w-sm mb-4">
				User data is loaded on demand. Click below to fetch from the database.
			</p>
			{error && <p className="text-sm text-red-600 mb-3">{error}</p>}
			<Button onClick={onLoad} disabled={loading}>
				{loading ? "Loading..." : "Load Users"}
			</Button>
		</div>
	);
}
