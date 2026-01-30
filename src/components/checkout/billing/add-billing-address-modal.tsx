"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building, House, IdCard, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";
import { BillingInfoItemWithId } from "@/lib/store/billing-info-store";

interface AddBillingAddressModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	defaultEmail: string;
	onAddressCreated: (address: BillingInfoItemWithId) => void;
}

const validateABN = (abn: string): boolean => {
	const cleanABN = abn.replace(/\s/g, "");
	if (!/^\d{11}$/.test(cleanABN)) {
		return false;
	}
	return true;
};

const formSchema = z.object({
	email: z
		.string()
		.email({ message: "Please enter a valid email address" })
		.min(1, { message: "Email is required" }),
	organizationName: z
		.string()
		.min(1, { message: "Organization name is required" }),
	billingAddress: z.string().min(1, { message: "Billing address is required" }),
	abnNumber: z
		.string()
		.min(1, { message: "ABN number is required" })
		.refine((val) => validateABN(val), {
			message: "Please enter a valid 11-digit ABN",
		}),
});

type FormSchema = z.infer<typeof formSchema>;

export const AddBillingAddressModal = ({
	open,
	onOpenChange,
	defaultEmail,
	onAddressCreated,
}: AddBillingAddressModalProps) => {
	const [isSaving, setIsSaving] = useState(false);

	const form = useForm<FormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: defaultEmail,
			organizationName: "",
			billingAddress: "",
			abnNumber: "",
		},
	});

	const onSubmit = async (data: FormSchema) => {
		setIsSaving(true);
		try {
			const response = await fetch("/api/billing-addresses", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					email: data.email,
					organization: data.organizationName,
					address: data.billingAddress,
					ABN: data.abnNumber,
				}),
			});
			const result = await response.json();
			if (result.success) {
				onAddressCreated(result.data);
				form.reset();
				onOpenChange(false);
			}
		} catch (error) {
			console.error("Error creating billing address:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleCancel = () => {
		form.reset();
		onOpenChange(false);
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="sm:max-w-[500px]">
				<DialogHeader>
					<DialogTitle>Add New Billing Address</DialogTitle>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-slate-700 font-medium">
										<Mail className="w-[15px] h-[15px] inline mr-1" />
										Email Address
									</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="your.email@example.com"
											className="bg-white"
											{...field}
										/>
									</FormControl>
									<FormDescription className="text-xs text-slate-500">
										We&apos;ll send billing confirmations to this email
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="organizationName"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-slate-700 font-medium">
										<Building className="w-[15px] h-[15px] inline mr-1" />
										Organization Name
									</FormLabel>
									<FormControl>
										<Input
											type="text"
											placeholder="Acme Corp"
											className="bg-white"
											{...field}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="billingAddress"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-slate-700 font-medium">
										<House className="w-[15px] h-[15px] inline mr-1" />
										Billing Address
									</FormLabel>
									<FormControl>
										<Input
											type="text"
											placeholder="123 Main Street, Melbourne VIC 3000, Australia"
											className="bg-white"
											{...field}
										/>
									</FormControl>
									<FormDescription className="text-xs text-slate-500">
										Street, city, state, postcode and country
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="abnNumber"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-slate-700 font-medium">
										<IdCard className="w-[15px] h-[15px] inline mr-1" />
										ABN Number
									</FormLabel>
									<FormControl>
										<Input
											type="text"
											placeholder="12 345 678 901"
											maxLength={14}
											className="bg-white"
											{...field}
										/>
									</FormControl>
									<FormDescription className="text-xs text-slate-500">
										11-digit Australian Business Number
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex justify-end gap-3 pt-4">
							<Button type="button" variant="outline" onClick={handleCancel}>
								Cancel
							</Button>
							<Button type="submit" disabled={isSaving}>
								{isSaving ? "Saving..." : "Save Address"}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
