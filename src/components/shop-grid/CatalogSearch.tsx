"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Loader2, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface CatalogSearchProps {
	defaultValue?: string;
}

// Long enough to skip the intermediate states of a quick word, short enough
// that results feel like they're keeping up with the typing.
const DEBOUNCE_MS = 250;

export function CatalogSearch({ defaultValue = "" }: CatalogSearchProps) {
	const [value, setValue] = useState(defaultValue);
	const [isPending, startTransition] = useTransition();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	// The query currently reflected in the URL. Tracked so typing back to what
	// is already on screen doesn't fire another navigation.
	const appliedRef = useRef(defaultValue.trim());

	const navigate = useCallback(
		(q: string) => {
			const params = new URLSearchParams();
			if (q) params.set("q", q);
			// Preserve the active category / view when searching within them.
			const category = searchParams.get("category");
			if (category) params.set("category", category);
			const view = searchParams.get("view");
			if (view) params.set("view", view);

			const query = params.toString();
			startTransition(() => {
				// Replace rather than push: every keystroke would otherwise land in
				// history and the back button would crawl through the whole word.
				router.replace(query ? `${pathname}?${query}` : pathname);
			});
		},
		[pathname, router, searchParams],
	);

	// Search as the user types.
	useEffect(() => {
		const q = value.trim();
		if (q === appliedRef.current) return;

		const timer = setTimeout(() => {
			// Enter (or Clear) may have applied this query while we were waiting.
			if (q === appliedRef.current) return;
			appliedRef.current = q;
			navigate(q);
		}, DEBOUNCE_MS);

		return () => clearTimeout(timer);
	}, [value, navigate]);

	// Enter still works, and skips the debounce.
	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const q = value.trim();
		if (q === appliedRef.current) return;
		appliedRef.current = q;
		navigate(q);
	};

	const handleClear = () => {
		setValue("");
		appliedRef.current = "";
		navigate("");
	};

	return (
		<form onSubmit={handleSubmit} className="w-full sm:w-auto">
			<div className="relative w-full sm:w-80">
				<Search
					size={14}
					className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
				/>
				<Input
					type="search"
					placeholder="Search products..."
					value={value}
					onChange={(e) => setValue(e.target.value)}
					className="w-full pl-9 pr-8 [&::-webkit-search-cancel-button]:appearance-none"
					aria-label="Search products"
				/>
				{isPending ? (
					<Loader2
						size={14}
						className="absolute right-2 top-1/2 -translate-y-1/2 animate-spin text-gray-400"
						aria-hidden
					/>
				) : (
					value && (
						<button
							type="button"
							onClick={handleClear}
							aria-label="Clear search"
							className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
						>
							<X size={14} />
						</button>
					)
				)}
			</div>
		</form>
	);
}
