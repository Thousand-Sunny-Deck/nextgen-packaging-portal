"use client";

import { useEffect, useMemo, useState } from "react";
import { Globe, Loader2, Users } from "lucide-react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
	getSpikeProductShopAccess,
	setSpikeProductShopAccess,
	type SpikeShopAccessUser,
} from "@/actions/spike/products-actions";

interface ManageProductShopAccessDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	productId: string | null;
	productSku: string | null;
	onSaved: () => void;
}

type Mode = "global" | "specific";

export function ManageProductShopAccessDialog({
	open,
	onOpenChange,
	productId,
	productSku,
	onSaved,
}: ManageProductShopAccessDialogProps) {
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [mode, setMode] = useState<Mode>("global");
	const [users, setUsers] = useState<SpikeShopAccessUser[]>([]);
	const [selected, setSelected] = useState<Set<string>>(new Set());
	const [search, setSearch] = useState("");

	useEffect(() => {
		if (!open || !productId) return;

		let cancelled = false;
		setLoading(true);
		setError(null);
		setSearch("");

		getSpikeProductShopAccess({ productId })
			.then((result) => {
				if (cancelled) return;
				if (!result.success || !result.users) {
					setError(result.error || "Failed to load customers.");
					setUsers([]);
					setSelected(new Set());
					return;
				}
				setMode(result.isGlobal ? "global" : "specific");
				setUsers(result.users);
				setSelected(
					new Set(result.users.filter((u) => u.selected).map((u) => u.id)),
				);
			})
			.catch((err) => {
				if (cancelled) return;
				setError(
					err instanceof Error ? err.message : "Failed to load customers.",
				);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [open, productId]);

	const filteredUsers = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return users;
		return users.filter(
			(u) =>
				u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q),
		);
	}, [users, search]);

	const toggle = (id: string) => {
		setSelected((prev) => {
			const next = new Set(prev);
			if (next.has(id)) {
				next.delete(id);
			} else {
				next.add(id);
			}
			return next;
		});
	};

	const handleSave = async () => {
		if (!productId) return;
		setSubmitting(true);
		setError(null);
		try {
			const result = await setSpikeProductShopAccess({
				productId,
				isGlobal: mode === "global",
				userIds: Array.from(selected),
			});
			if (!result.success) {
				setError(result.error || "Failed to save customer access.");
				return;
			}
			toast.success("Customer access updated.");
			onSaved();
			onOpenChange(false);
		} catch (err) {
			setError(
				err instanceof Error ? err.message : "Failed to save customer access.",
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Dialog
			open={open}
			onOpenChange={(nextOpen) => {
				if (submitting) return;
				onOpenChange(nextOpen);
			}}
		>
			<DialogContent className="sm:max-w-md">
				<DialogHeader>
					<DialogTitle>Customer access</DialogTitle>
					<DialogDescription>
						Choose who sees {productSku ?? "this product"} in their shop.
					</DialogDescription>
				</DialogHeader>

				<div className="py-2">
					{loading ? (
						<div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-500">
							<Loader2 className="h-4 w-4 animate-spin" />
							Loading customers...
						</div>
					) : (
						<>
							<div className="flex flex-col gap-2">
								<button
									type="button"
									onClick={() => setMode("global")}
									className={`flex items-start gap-3 rounded-md border p-3 text-left transition-colors ${
										mode === "global"
											? "border-slate-900 bg-slate-50"
											: "border-slate-200 hover:bg-slate-50"
									}`}
								>
									<Globe className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
									<span>
										<span className="block text-sm font-medium text-slate-900">
											All customers (Global)
										</span>
										<span className="block text-xs text-slate-500">
											Shown in the shop for everyone.
										</span>
									</span>
								</button>
								<button
									type="button"
									onClick={() => setMode("specific")}
									className={`flex items-start gap-3 rounded-md border p-3 text-left transition-colors ${
										mode === "specific"
											? "border-slate-900 bg-slate-50"
											: "border-slate-200 hover:bg-slate-50"
									}`}
								>
									<Users className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
									<span>
										<span className="block text-sm font-medium text-slate-900">
											Specific customers
										</span>
										<span className="block text-xs text-slate-500">
											Only the selected customers see it in their shop.
										</span>
									</span>
								</button>
							</div>

							{mode === "specific" && (
								<div className="mt-3">
									<Input
										value={search}
										onChange={(event) => setSearch(event.target.value)}
										placeholder="Search customers by name or email..."
										className="mb-2"
									/>
									<div className="max-h-60 space-y-1 overflow-y-auto pr-1">
										{filteredUsers.length === 0 ? (
											<p className="py-6 text-center text-sm text-slate-500">
												No customers match.
											</p>
										) : (
											filteredUsers.map((user) => (
												<label
													key={user.id}
													className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-slate-50"
												>
													<Checkbox
														checked={selected.has(user.id)}
														onCheckedChange={() => toggle(user.id)}
													/>
													<span className="min-w-0">
														<span className="block truncate text-sm text-slate-900">
															{user.name || "Unnamed"}
														</span>
														<span className="block truncate text-xs text-slate-500">
															{user.email}
														</span>
													</span>
												</label>
											))
										)}
									</div>
									<p className="mt-2 text-xs text-slate-400">
										{selected.size} selected
									</p>
								</div>
							)}
						</>
					)}

					{error && (
						<div className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
							{error}
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
					<Button onClick={handleSave} disabled={submitting || loading}>
						{submitting ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Saving...
							</>
						) : (
							"Save"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
