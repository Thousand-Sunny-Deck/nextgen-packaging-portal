"use client";

import { ArrowUpDown } from "lucide-react";
import { Button } from "./ui/button";

interface SortingButtonProps {
	onClickFn: () => void;
	value: string;
}

const SortingButton = (props: SortingButtonProps) => {
	return (
		<Button variant="ghost" onClick={() => props.onClickFn}>
			{props.value}
			<ArrowUpDown />
		</Button>
	);
};

export default SortingButton;
