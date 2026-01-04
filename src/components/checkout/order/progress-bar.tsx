"use client";

interface Step {
	label: string;
	completed: boolean;
}

interface ProgressBarProps {
	steps: Step[];
	currentStep: number; // 0-indexed
}

export const ProgressBar = ({ steps, currentStep }: ProgressBarProps) => {
	return (
		<div className="w-full px-2 sm:px-8 py-2">
			{/* Progress line and dots container */}
			<div className="relative flex items-center justify-between">
				{/* Background line */}
				<div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 -translate-y-1/2" />

				{/* Active progress line */}
				<div
					className="absolute top-1/2 left-0 h-0.5 bg-black -translate-y-1/2 transition-all duration-500 ease-in-out"
					style={{
						width: `${(currentStep / (steps.length - 1)) * 100}%`,
					}}
				/>

				{/* Step dots */}
				{steps.map((step, index) => (
					<div key={index} className="relative z-10 flex flex-col items-center">
						{/* Dot */}
						<div
							className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-300 ${
								index <= currentStep
									? "bg-black"
									: "bg-white border-2 border-gray-300"
							}`}
						/>

						{/* Label */}
						<span
							className={`mt-2 sm:mt-3 text-[10px] sm:text-xs font-medium whitespace-nowrap transition-colors duration-300 text-center max-w-[60px] sm:max-w-none ${
								index <= currentStep ? "text-black" : "text-gray-400"
							}`}
						>
							{step.label}
						</span>
					</div>
				))}
			</div>
		</div>
	);
};
