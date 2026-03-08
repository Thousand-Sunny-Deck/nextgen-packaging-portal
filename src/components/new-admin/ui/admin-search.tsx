"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface AdminSearchProps {
	defaultValue?: string;
	placeholder?: string;
}

export function AdminSearch({
	defaultValue = "",
	placeholder = "Search...",
}: AdminSearchProps) {
	const [value, setValue] = useState(defaultValue);
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	const navigate = (q: string) => {
		const params = new URLSearchParams();
		if (q) params.set("q", q);
		const pageSize = searchParams.get("pageSize");
		if (pageSize) params.set("pageSize", pageSize);
		router.push(`${pathname}?${params.toString()}`);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		navigate(value.trim());
	};

	const handleClear = () => {
		setValue("");
		navigate("");
	};

	return (
		<form
			onSubmit={handleSubmit}
			className="flex items-center gap-2 w-full sm:w-auto"
		>
			<div className="relative flex-1 sm:flex-none">
				<Input
					type="text"
					placeholder={placeholder}
					value={value}
					onChange={(e) => setValue(e.target.value)}
					className="w-full sm:w-80 pr-8"
				/>
				{value && (
					<button
						type="button"
						onClick={handleClear}
						className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
					>
						<X size={14} />
					</button>
				)}
			</div>
			<Button type="submit" variant="outline" size="sm" className="shrink-0">
				<Search size={14} className="sm:hidden" />
				<span className="hidden sm:inline">Search</span>
			</Button>
		</form>
	);
}
