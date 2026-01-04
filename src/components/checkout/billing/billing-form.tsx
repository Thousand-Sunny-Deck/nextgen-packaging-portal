import { Button } from "@/components/ui/button";
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
import { CheckoutState } from "../checkout-form";

interface BillingFormProps {
	email: string;
	updateState: (state: CheckoutState) => void;
}

const validateABN = (abn: string, isTest: boolean): boolean => {
	const cleanABN = abn.replace(/\s/g, "");
	if (!/^\d{11}$/.test(cleanABN)) {
		return false;
	}

	if (isTest) return true;

	const weights = [10, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19];
	const abnDigits = cleanABN.split("").map(Number);
	abnDigits[0] -= 1;

	const sum = abnDigits.reduce((total, digit, index) => {
		return total + digit * weights[index];
	}, 0);

	return sum % 89 === 0;
};

const formSchema = z.object({
	email: z
		.email({ message: "Please enter a valid email address" })
		.min(1, { message: "Email is required" }),

	organizationName: z
		.string()
		.min(1, { message: "Organization name is required" }),
	billingAddress: z
		.string()
		.min(1, { message: "Billing address is required" })
		.min(10, { message: "Please enter a complete address" }),
	abnNumber: z
		.string()
		.min(1, { message: "ABN number is required" })
		.refine((val) => validateABN(val, true), {
			message: "Please enter a valid 11-digit ABN",
		}),
});

type BillingFormSchema = z.infer<typeof formSchema>;

const BillingForm = ({ email, updateState }: BillingFormProps) => {
	const form = useForm<BillingFormSchema>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: email,
			organizationName: "",
			billingAddress: "",
			abnNumber: "",
		},
	});

	const onSubmit = (data: BillingFormSchema) => {
		console.log("Form submitted:", data);
		updateState("order");
	};

	return (
		<div className="w-[60%] h-[400px]">
			<div className="w-2/3 h-full">
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-slate-700 font-medium">
										<Mail className="w-[15px] h-[15px]" /> Email Address
									</FormLabel>
									<FormControl>
										<Input
											type="email"
											placeholder="your.email@example.com"
											className="bg-white rounded-md"
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
										<Building className="w-[15px] h-[15px]" /> Organization Name
									</FormLabel>
									<FormControl>
										<Input
											type="text"
											placeholder=""
											className="bg-white"
											{...field}
										/>
									</FormControl>
									<FormDescription className="text-xs text-slate-500">
										Name of your organization
									</FormDescription>
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
										<House className="w-[15px] h-[15px]" /> Billing Address
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
										Complete address including street, city, state, and postcode
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						{/* ABN Number Field */}
						<FormField
							control={form.control}
							name="abnNumber"
							render={({ field }) => (
								<FormItem>
									<FormLabel className="text-slate-700 font-medium">
										<IdCard className="w-[15px] h-[15px]" />
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
										Enter your 11-digit Australian Business Number
									</FormDescription>
									<FormMessage />
								</FormItem>
							)}
						/>

						<Button
							type="submit"
							size="default"
							className=""
							disabled={form.formState.isSubmitting}
						>
							Submit Billing Information
						</Button>
					</form>
				</Form>
			</div>
		</div>
	);
};

export default BillingForm;
