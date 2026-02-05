"use client";

import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { createUser, CreateUserInput } from "@/actions/admin/users-actions";
import { toast } from "sonner";

interface CreateUserModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onUserCreated: () => void;
}

type Step = "form" | "confirm";

export function CreateUserModal({
	open,
	onOpenChange,
	onUserCreated,
}: CreateUserModalProps) {
	const [step, setStep] = useState<Step>("form");
	const [loading, setLoading] = useState(false);

	// Form state
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const resetForm = () => {
		setStep("form");
		setName("");
		setEmail("");
		setPassword("");
	};

	const handleClose = () => {
		resetForm();
		onOpenChange(false);
	};

	const handleSubmitForm = (e: React.FormEvent) => {
		e.preventDefault();
		if (!name.trim() || !email.trim()) {
			toast.error("Name and email are required");
			return;
		}
		setStep("confirm");
	};

	const handleConfirm = async () => {
		setLoading(true);

		const input: CreateUserInput = {
			name: name.trim(),
			email: email.trim(),
			password: password.trim() || undefined,
		};

		try {
			const result = await createUser(input);

			if (result.success) {
				toast.success("User created successfully");
				onUserCreated();
				handleClose();
			} else {
				toast.error(result.error || "Failed to create user");
				setStep("form");
			}
		} catch {
			toast.error("Failed to create user");
			setStep("form");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleClose}>
			<DialogContent className="sm:max-w-md">
				{step === "form" && (
					<>
						<DialogHeader>
							<DialogTitle>Create New User</DialogTitle>
							<DialogDescription>
								Add a new user to the platform.
							</DialogDescription>
						</DialogHeader>

						<form onSubmit={handleSubmitForm} className="space-y-4 py-4">
							<div className="space-y-2">
								<Label htmlFor="name">Name *</Label>
								<Input
									id="name"
									value={name}
									onChange={(e) => setName(e.target.value)}
									placeholder="John Smith"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="email">Email *</Label>
								<Input
									id="email"
									type="email"
									value={email}
									onChange={(e) => setEmail(e.target.value)}
									placeholder="john@example.com"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="password">
									Password{" "}
									<span className="text-gray-400 font-normal">(optional)</span>
								</Label>
								<Input
									id="password"
									type="text"
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									placeholder="Leave empty to auto-generate"
								/>
							</div>

							<DialogFooter className="pt-4">
								<Button type="button" variant="outline" onClick={handleClose}>
									Cancel
								</Button>
								<Button type="submit">Continue</Button>
							</DialogFooter>
						</form>
					</>
				)}

				{step === "confirm" && (
					<>
						<DialogHeader>
							<DialogTitle>Confirm User Creation</DialogTitle>
							<DialogDescription>
								Are you sure you want to create this user?
							</DialogDescription>
						</DialogHeader>

						<div className="py-4">
							<div className="bg-gray-50 rounded-md p-4 space-y-2">
								<p>
									<span className="text-gray-500">Name:</span>{" "}
									<span className="font-medium">{name}</span>
								</p>
								<p>
									<span className="text-gray-500">Email:</span>{" "}
									<span className="font-medium">{email}</span>
								</p>
								<p>
									<span className="text-gray-500">Role:</span>{" "}
									<span className="font-medium">USER</span>
								</p>
							</div>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() => setStep("form")}
								disabled={loading}
							>
								Back
							</Button>
							<Button onClick={handleConfirm} disabled={loading}>
								{loading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Creating...
									</>
								) : (
									"Yes, Create User"
								)}
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
