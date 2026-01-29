import { cn } from "@/lib/utils";
import OrderButton from "./OrderButton";

const heading = "text-xl md:text-2xl lg:text-4xl";

export type UserDetails = {
	name: string;
	email: string;
	orgId: string;
};

interface WelcomeHeaderProps {
	userDetails: UserDetails;
}

export const WelcomeHeader = ({ userDetails }: WelcomeHeaderProps) => {
	return (
		<div className="space-y-8">
			<div className="flex-none px-6 py-4">
				<p className={cn(heading, "text-gray-700")}>Welcome,</p>
				<p
					className={cn(
						heading,
						"font-semibold text-gray-900 flex items-center gap-2",
					)}
				>
					{userDetails.name || userDetails.email || userDetails.orgId}{" "}
					<span aria-hidden>📦</span>
				</p>
			</div>
		</div>
	);
};

export { OrderButton };
