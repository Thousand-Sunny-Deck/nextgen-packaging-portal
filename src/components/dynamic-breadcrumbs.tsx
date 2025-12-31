// components/dynamic-breadcrumb.tsx
"use client";

import { usePathname } from "next/navigation";
import {
	Breadcrumb,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbList,
	BreadcrumbPage,
	BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Fragment } from "react";

const segmentNames: Record<string, string> = {
	dashboard: "Dashboard",
	home: "Home",
	order: "Order",
	checkout: "Checkout",
};

// Check if segment looks like a UUID
function isUUID(segment: string): boolean {
	const uuidRegex =
		/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
	return uuidRegex.test(segment);
}

const DynamicBreadcrumb = () => {
	const pathname = usePathname();
	const paths = pathname.split("/");
	const segments = paths.filter(Boolean);
	const constructHomeHref = (uuid: string) => {
		return `/dashboard/${uuid}/home`;
	};

	let homeHref: string;
	const includesUuid = paths.filter(isUUID);
	if (includesUuid && includesUuid.length === 1) {
		const uuid = includesUuid.at(0);
		homeHref = constructHomeHref(uuid!);
	}

	const breadcrumbItems = segments
		.map((segment, index) => {
			// Skip UUIDs in breadcrumb display
			if (isUUID(segment)) {
				return null;
			}
			const isDashboard = segment.includes("dashboard");
			const href = isDashboard
				? homeHref
				: "/" + segments.slice(0, index + 1).join("/");
			const isLast = index === segments.length - 1;

			const label =
				segmentNames[segment] ||
				segment.charAt(0).toUpperCase() + segment.slice(1);

			return {
				href,
				label,
				isLast,
				segment,
			};
		})
		.filter(Boolean);

	console.log(breadcrumbItems);

	return (
		<Breadcrumb>
			<BreadcrumbList>
				{breadcrumbItems.map((item) => (
					<Fragment key={item!.href}>
						<BreadcrumbItem>
							{item!.isLast ? (
								<BreadcrumbPage>{item!.label}</BreadcrumbPage>
							) : (
								<BreadcrumbLink href={item!.href}>{item!.label}</BreadcrumbLink>
							)}
						</BreadcrumbItem>
						{!item!.isLast && <BreadcrumbSeparator />}
					</Fragment>
				))}
			</BreadcrumbList>
		</Breadcrumb>
	);
};

export default DynamicBreadcrumb;
