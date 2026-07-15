import Icon from "@/components/icons";
import { Link } from "@/i18n/routing";

/* Animated empty state for the redesigned dashboard: floating glyph inside
   a soft chip with an expanding pulse ring (CSS-only, reduced-motion safe —
   see .tsd-empty-* in globals.css), title, supporting copy, optional action.
   Server-component friendly: no client hooks. */
interface EmptyStateProps {
	icon: string;
	title: string;
	description?: string;
	actionLabel?: string;
	actionHref?: string;
	actionIcon?: string;
	className?: string;
}

export default function EmptyState({
	icon,
	title,
	description,
	actionLabel,
	actionHref,
	actionIcon,
	className = "",
}: EmptyStateProps) {
	return (
		<div className={`flex flex-col items-center text-center px-6 py-12 ${className}`}>
			<div className="relative mb-5">
				<span className="absolute inset-0 rounded-2xl bg-primary/20 tsd-empty-ring" />
				<span className="relative flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary tsd-empty-icon">
					<Icon name={icon} size={24} strokeWidth={1.5} />
				</span>
			</div>
			<p className="font-semibold text-on-surface text-sm">{title}</p>
			{description ? (
				<p className="text-xs text-on-surface-variant mt-1.5 max-w-xs leading-relaxed">
					{description}
				</p>
			) : null}
			{actionLabel && actionHref ? (
				<Link
					// biome-ignore lint/suspicious/noExplicitAny: href union comes from typed routes; callers pass known routes
					href={actionHref as any}
					className="inline-flex items-center gap-1.5 mt-5 text-sm font-semibold text-primary hover:underline"
				>
					{actionIcon ? <Icon name={actionIcon} size={15} strokeWidth={2} /> : null}
					{actionLabel}
				</Link>
			) : null}
		</div>
	);
}
