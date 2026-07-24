import Icon from "@/components/icons";

export type StatusStep = {
	label: string;
	done: boolean;
};

// Horizontal N-step progress tracker (e.g. Submitted -> Review -> Decision ->
// Confirmed). Distinct from EOIClient's local `Stepper`, which drives a
// multi-page *form wizard* rather than displaying a read-only status.
export default function StatusStepper({ steps }: { steps: StatusStep[] }) {
	const stepsDone = steps.filter((s) => s.done).length;
	const widthPct = steps.length > 0 ? (stepsDone / steps.length) * 100 : 0;

	return (
		<div className="flex items-center justify-between relative mt-6">
			<div className="absolute top-4 left-0 w-full h-0.5 bg-surface-variant z-0" />
			<div
				className="absolute top-4 left-0 h-0.5 bg-primary z-0 transition-all duration-500"
				style={{ width: `${widthPct}%` }}
			/>
			{steps.map((s, i) => (
				<div key={s.label} className="relative z-10 flex flex-col items-center gap-1.5">
					<div
						className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-semibold text-xs md:text-sm ring-4 ring-surface-container-lowest transition-all ${
							s.done ? "bg-primary text-on-primary" : "bg-surface-variant text-on-surface-variant"
						}`}
					>
						{s.done ? (
							<Icon name="check" size={14} strokeWidth={2.5} />
						) : (
							String(i + 1).padStart(2, "0")
						)}
					</div>
					<span className="text-[9px] md:text-[10px] font-semibold uppercase tracking-wide text-center w-14 leading-tight text-on-surface-variant">
						{s.label}
					</span>
				</div>
			))}
		</div>
	);
}
