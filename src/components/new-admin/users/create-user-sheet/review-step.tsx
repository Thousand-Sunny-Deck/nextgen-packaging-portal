// ─── Review Step ──────────────────────────────────────────────────────────────

import { DraftUser } from "./create-users";

export function ReviewStep({
	draft,
	error,
}: {
	draft: DraftUser[];
	error: string | null;
}) {
	return (
		<div className="space-y-4 py-4 max-w-lg mx-auto">
			<p className="text-sm text-slate-500">
				The following {draft.length} user{draft.length > 1 ? "s" : ""} will be
				created. If any one fails, none will be created.
			</p>
			<div className="space-y-2">
				{draft.map((user) => (
					<div
						key={user.localId}
						className="rounded-md border border-slate-200 px-4 py-3 space-y-0.5"
					>
						<p className="text-sm font-medium text-slate-900">{user.name}</p>
						<p className="text-xs text-slate-500">{user.email}</p>
					</div>
				))}
			</div>
			{error && (
				<div className="rounded-md bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
					{error}
				</div>
			)}
		</div>
	);
}
