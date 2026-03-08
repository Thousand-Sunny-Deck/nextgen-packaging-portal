import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { DraftUser, MAX_DRAFT } from "./create-users";
import { Pencil, Trash2, UserPlus } from "lucide-react";

export function DraftStep({
	draft,
	name,
	email,
	password,
	formError,
	onNameChange,
	onEmailChange,
	onPasswordChange,
	onAddToDraft,
	onRemove,
	onEdit,
}: {
	draft: DraftUser[];
	name: string;
	email: string;
	password: string;
	formError: string | null;
	onNameChange: (v: string) => void;
	onEmailChange: (v: string) => void;
	onPasswordChange: (v: string) => void;
	onAddToDraft: (e: React.FormEvent) => void;
	onRemove: (localId: string) => void;
	onEdit: (localId: string) => void;
}) {
	const atLimit = draft.length >= MAX_DRAFT;

	return (
		<div className="space-y-6 py-4 max-w-lg mx-auto">
			{/* Form */}
			<form onSubmit={onAddToDraft} className="space-y-4">
				<div className="space-y-2">
					<Label htmlFor="name">Name</Label>
					<Input
						id="name"
						value={name}
						onChange={(e) => onNameChange(e.target.value)}
						placeholder="Jane Smith"
						disabled={atLimit}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="email">Email</Label>
					<Input
						id="email"
						type="email"
						value={email}
						onChange={(e) => onEmailChange(e.target.value)}
						placeholder="jane@example.com"
						disabled={atLimit}
					/>
				</div>
				<div className="space-y-2">
					<Label htmlFor="password">Password</Label>
					<Input
						id="password"
						type="show"
						value={password}
						onChange={(e) => onPasswordChange(e.target.value)}
						placeholder="••••••••"
						disabled={atLimit}
					/>
				</div>

				{formError && <p className="text-sm text-red-600">{formError}</p>}

				{atLimit && (
					<p className="text-sm text-slate-500">
						Maximum {MAX_DRAFT} users per batch.
					</p>
				)}

				<Button type="submit" disabled={atLimit} className="w-full">
					<UserPlus className="mr-2 h-4 w-4" />
					Add to Draft
				</Button>
			</form>

			{/* Draft list */}
			{draft.length > 0 && (
				<div className="space-y-2">
					<p className="text-xs font-medium text-slate-500 uppercase tracking-wide">
						Draft — {draft.length} of {MAX_DRAFT}
					</p>
					<div className="space-y-2">
						{draft.map((user) => (
							<div
								key={user.localId}
								className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
							>
								<div>
									<p className="text-sm font-medium text-slate-900">
										{user.name}
									</p>
									<p className="text-xs text-slate-500">{user.email}</p>
								</div>
								<div className="flex items-center gap-2">
									<button
										type="button"
										onClick={() => onEdit(user.localId)}
										className="text-slate-400 hover:text-slate-700 transition-colors"
									>
										<Pencil size={14} />
									</button>
									<button
										type="button"
										onClick={() => onRemove(user.localId)}
										className="text-slate-400 hover:text-red-500 transition-colors"
									>
										<Trash2 size={14} />
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
