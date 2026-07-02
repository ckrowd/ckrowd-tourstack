"use client";

/**
 * Drop-in replacement for a plain numeric <input> that live-formats the
 * value with thousand separators while typing. The underlying value stays a
 * raw digit string (same contract as the `e.target.value.replace(/\D/g, "")`
 * pattern used everywhere else) — only the display is comma-formatted.
 */
export default function FormattedNumberInput({
	id,
	value,
	onChange,
	placeholder,
	className,
	ariaInvalid,
	tabIndex,
}: {
	id?: string;
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	className?: string;
	ariaInvalid?: boolean;
	tabIndex?: number;
}) {
	const displayValue = value ? Number(value).toLocaleString("en-US") : "";

	return (
		<input
			id={id}
			type="text"
			inputMode="numeric"
			placeholder={placeholder}
			value={displayValue}
			onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
			className={className}
			aria-invalid={ariaInvalid}
			tabIndex={tabIndex}
		/>
	);
}
