"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetFooter,
	SheetHeader,
	SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
	bulkCreateUsers,
	type BulkCreateUserEntry,
} from "@/actions/spike/users-actions";
import z from "zod";
import { DraftStep } from "./draft-step";
import { ReviewStep } from "./review-step";

const draftUserSchema = z.object({
	name: z.string().min(1, "Name is required"),
	email: z.email("Invalid email address"),
	password: z.string().min(6, "Password must be at least 6 characters"),
});

export const MAX_DRAFT = 5;

export type DraftUser = BulkCreateUserEntry & { localId: string };

type Step = "draft" | "review";

interface CreateUsersSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUsersCreated: () => void;
}

export function CreateUsersSheet({
	open,
	onOpenChange,
	onUsersCreated,
}: CreateUsersSheetProps) {
	const [step, setStep] = useState<Step>("draft");
	const [draft, setDraft] = useState<DraftUser[]>([]);
	const [submitting, setSubmitting] = useState(false);
	const [submitError, setSubmitError] = useState<string | null>(null);

	// Form state
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [formError, setFormError] = useState<string | null>(null);

	// Warn on accidental refresh/navigate while submitting
	useEffect(() => {
		if (!submitting) return;
		const handler = (e: BeforeUnloadEvent) => {
			e.preventDefault();
		};
		window.addEventListener("beforeunload", handler);
		return () => window.removeEventListener("beforeunload", handler);
	}, [submitting]);

	const resetForm = () => {
		setName("");
		setEmail("");
		setPassword("");
		setFormError(null);
	};

	const handleClose = () => {
		if (submitting) return;
		setStep("draft");
		setDraft([]);
		resetForm();
		onOpenChange(false);
	};

	const handleAddToDraft = (e: React.FormEvent) => {
		e.preventDefault();
		setFormError(null);

		const parsed = draftUserSchema.safeParse({
			name: name.trim(),
			email: email.trim().toLowerCase(),
			password,
		});

		if (!parsed.success) {
			setFormError(parsed.error.issues[0].message);
			return;
		}

		if (draft.some((u) => u.email === parsed.data.email)) {
			setFormError("This email is already in the draft.");
			return;
		}

		setDraft((prev) => [
			...prev,
			{ localId: crypto.randomUUID(), ...parsed.data },
		]);
		resetForm();
	};

	const handleRemove = (localId: string) => {
		setDraft((prev) => prev.filter((u) => u.localId !== localId));
	};

	const handleEdit = (localId: string) => {
		const user = draft.find((u) => u.localId === localId);
		if (!user) return;
		setName(user.name);
		setEmail(user.email);
		setPassword(user.password);
		setFormError(null);
		setDraft((prev) => prev.filter((u) => u.localId !== localId));
	};

	const handleConfirm = async () => {
		setSubmitting(true);
		setSubmitError(null);
		try {
			const result = await bulkCreateUsers(
				draft.map(({ name, email, password }) => ({ name, email, password })),
			);

			if (!result.success) {
				setSubmitError(
					result.createdCount > 0
						? `${result.error} — ${result.createdCount} user${result.createdCount > 1 ? "s" : ""} were created before the failure, ${result.skippedCount} skipped.`
						: result.error,
				);
				if (result.createdCount > 0) onUsersCreated();
				return;
			}

			toast.success(
				`${result.createdCount} user${result.createdCount > 1 ? "s" : ""} created successfully`,
			);
			onUsersCreated();
			handleClose();
		} catch {
			setSubmitError("An unexpected error occurred. Please try again.");
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<Sheet
			open={open}
			onOpenChange={(v) => {
				if (submitting) return;
				if (!v) handleClose();
			}}
		>
			<SheetContent
				side="right"
				className="!w-full !max-w-full flex flex-col"
				showCloseButton={!submitting}
			>
				<SheetHeader>
					<SheetTitle>
						{step === "draft"
							? "Create Users"
							: `Review ${draft.length} user${draft.length > 1 ? "s" : ""}`}
					</SheetTitle>
					<SheetDescription>
						{step === "draft"
							? `Add up to ${MAX_DRAFT} users to the draft, then proceed to confirm.`
							: "Review the users below before confirming. All will be created or none."}
					</SheetDescription>
				</SheetHeader>

				<div
					className={`flex-1 overflow-y-auto px-4 transition-opacity ${submitting ? "opacity-60 pointer-events-none" : ""}`}
				>
					{step === "draft" && (
						<DraftStep
							draft={draft}
							name={name}
							email={email}
							password={password}
							formError={formError}
							onNameChange={setName}
							onEmailChange={setEmail}
							onPasswordChange={setPassword}
							onAddToDraft={handleAddToDraft}
							onRemove={handleRemove}
							onEdit={handleEdit}
						/>
					)}
					{step === "review" && (
						<ReviewStep draft={draft} error={submitError} />
					)}
				</div>

				<SheetFooter
					className={`flex-row justify-between border-t pt-4 transition-opacity ${submitting ? "opacity-60 pointer-events-none" : ""}`}
				>
					{step === "draft" ? (
						<>
							<Button variant="outline" onClick={handleClose}>
								Cancel
							</Button>
							<Button
								onClick={() => setStep("review")}
								disabled={draft.length === 0}
							>
								Next ({draft.length})
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</>
					) : (
						<>
							<Button
								variant="outline"
								onClick={() => {
									setStep("draft");
									setSubmitError(null);
								}}
								disabled={submitting}
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back
							</Button>
							<Button onClick={handleConfirm} disabled={submitting}>
								{submitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creating...
									</>
								) : (
									<>
										<CheckCircle2 className="mr-2 h-4 w-4" />
										Confirm {draft.length} user{draft.length > 1 ? "s" : ""}
									</>
								)}
							</Button>
						</>
					)}
				</SheetFooter>
			</SheetContent>
		</Sheet>
	);
}
