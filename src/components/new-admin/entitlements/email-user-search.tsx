"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EmailUserSearchProps {
	defaultEmail: string;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function EmailUserSearch({ defaultEmail }: EmailUserSearchProps) {
	const [value, setValue] = useState(defaultEmail);
	const [validationError, setValidationError] = useState<string | null>(null);
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		setValue(defaultEmail);
	}, [defaultEmail]);

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const nextEmail = value.trim().toLowerCase();

		// Can search with empty input.
		if (!nextEmail) {
			setValidationError(null);
			const params = new URLSearchParams(searchParams.toString());
			params.delete("email");
			params.delete("q");
			params.delete("page");
			params.delete("loaded");
			router.push(`${pathname}?${params.toString()}`);
			return;
		}

		if (!EMAIL_REGEX.test(nextEmail)) {
			setValidationError("Enter a valid email address.");
			return;
		}

		setValidationError(null);

		const params = new URLSearchParams(searchParams.toString());
		params.set("email", nextEmail);
		params.delete("q");
		params.delete("page");
		params.delete("loaded");
		router.push(`${pathname}?${params.toString()}`);
	};

	const handleClear = () => {
		setValue("");
		setValidationError(null);
		const params = new URLSearchParams(searchParams.toString());
		params.delete("email");
		params.delete("q");
		params.delete("page");
		params.delete("loaded");
		router.push(`${pathname}?${params.toString()}`);
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-1.5">
			<Label htmlFor="entitlements-email">Search User by Email</Label>
			<div className="flex flex-col gap-2 sm:flex-row">
				<div className="relative sm:max-w-md w-full">
					<Input
						id="entitlements-email"
						type="email"
						placeholder="user@example.com"
						value={value}
						onChange={(event) => setValue(event.target.value)}
						className="pr-8"
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
				<Button type="submit" className="sm:w-auto">
					<Search className="mr-2 h-4 w-4" />
					Search
				</Button>
			</div>
			{validationError && (
				<p className="text-sm text-red-600" role="alert">
					{validationError}
				</p>
			)}
		</form>
	);
}
