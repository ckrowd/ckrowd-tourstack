export type StatusTone =
	| "approved"
	| "pending"
	| "contacted"
	| "booked"
	| "rejected"
	| "neutral"
	| "running";

// Domains with their own status vocabulary (financing statuses, EOI statuses,
// pitch statuses, etc.) map their own strings to one of these tones before
// rendering — this component stays generic rather than knowing every
// domain's status names.
const toneClasses: Record<StatusTone, string> = {
	approved: "bg-status-approved/10 text-status-approved",
	pending: "bg-status-pending/10 text-status-pending",
	contacted: "bg-status-contacted/10 text-status-contacted",
	booked: "bg-status-booked/10 text-status-booked",
	rejected: "bg-status-rejected/10 text-status-rejected",
	neutral: "bg-surface-container-high text-on-surface-variant",
	running: "bg-status-approved/10 text-status-approved",
};

export default function StatusBadge({
	tone,
	children,
	className,
}: {
	tone: StatusTone;
	children: React.ReactNode;
	className?: string;
}) {
	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${toneClasses[tone]} ${className ?? ""}`}
		>
			{tone === "running" && (
				<span className="w-1.5 h-1.5 rounded-full bg-status-approved" />
			)}
			{children}
		</span>
	);
}
