import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const lozengeVariants = cva(
	"inline-flex items-center justify-center rounded-xs px-2 py-0.5 text-xs font-medium transition-colors",
	{
		variants: {
			appearance: {
				default: "bg-gray-100 text-gray-800",
				success: "bg-green-100 text-green-800",
				removed: "bg-red-100 text-red-800",
				inprogress: "bg-blue-100 text-blue-800",
				new: "bg-purple-100 text-purple-800",
				moved: "bg-yellow-100 text-yellow-800",
			},
			isBold: {
				true: "font-bold",
				false: "font-medium",
			},
		},
		defaultVariants: {
			appearance: "default",
			isBold: false,
		},
	},
);

export interface LozengeProps
	extends React.HTMLAttributes<HTMLSpanElement>,
		VariantProps<typeof lozengeVariants> {
	children: React.ReactNode;
}

const Lozenge = React.forwardRef<HTMLSpanElement, LozengeProps>(
	({ className, appearance, isBold, children, ...props }, ref) => {
		return (
			<span
				ref={ref}
				className={cn(lozengeVariants({ appearance, isBold }), className)}
				{...props}
			>
				{children}
			</span>
		);
	},
);

Lozenge.displayName = "Lozenge";

export { Lozenge, lozengeVariants };
