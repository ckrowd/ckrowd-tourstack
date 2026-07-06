"use client";

import { useId, useState } from "react";
import FormattedNumberInput from "@/components/ui/FormattedNumberInput";

export function Section({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm space-y-6">
			<div className="border-b border-outline-variant/20 pb-4">
				<h3 className="font-(family-name:--font-manrope) font-semibold text-lg text-on-surface">
					{title}
				</h3>
				{description && (
					<p className="text-sm text-on-surface-variant mt-1">{description}</p>
				)}
			</div>
			{children}
		</div>
	);
}

export function Field({
	label,
	id,
	defaultValue,
	value,
	onChange,
	type = "text",
	hint,
	placeholder,
}: {
	label: string;
	id: string;
	defaultValue?: string;
	value?: string;
	onChange?: (v: string) => void;
	type?: string;
	hint?: string;
	placeholder?: string;
}) {
	return (
		<div>
			<label
				htmlFor={id}
				className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5"
			>
				{label}
			</label>
			{type === "formatted-number" && onChange ? (
				<FormattedNumberInput
					id={id}
					value={value ?? ""}
					onChange={onChange}
					placeholder={placeholder}
					className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/30"
				/>
			) : (
				<input
					id={id}
					type={type}
					placeholder={placeholder}
					{...(onChange
						? { value: value ?? "", onChange: (e) => onChange(e.target.value) }
						: { defaultValue })}
					className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/30"
				/>
			)}
			{hint && <p className="text-xs text-on-surface-variant mt-1.5">{hint}</p>}
		</div>
	);
}

export function Toggle({
	label,
	description,
	defaultChecked = false,
	checked,
	onChange,
	disabled = false,
}: {
	label: string;
	description?: string;
	defaultChecked?: boolean;
	checked?: boolean;
	onChange?: (value: boolean) => void;
	disabled?: boolean;
}) {
	const [internalOn, setInternalOn] = useState(defaultChecked);
	const isControlled = checked !== undefined;
	const on = isControlled ? checked : internalOn;
	const labelId = useId();
	const descId = useId();

	const handleClick = () => {
		if (disabled) return;
		const next = !on;
		if (!isControlled) setInternalOn(next);
		onChange?.(next);
	};

	return (
		<div className="flex items-center justify-between gap-6 py-3 border-b border-outline-variant/10 last:border-0">
			<div>
				<p id={labelId} className="text-sm font-semibold text-on-surface">
					{label}
				</p>
				{description && (
					<p id={descId} className="text-xs text-on-surface-variant mt-0.5">
						{description}
					</p>
				)}
			</div>
			<button
				type="button"
				role="switch"
				aria-checked={on}
				aria-labelledby={labelId}
				aria-describedby={description ? descId : undefined}
				onClick={handleClick}
				disabled={disabled}
				className={`relative w-11 h-6 rounded-full transition-colors shrink-0 disabled:opacity-50 ${
					on ? "bg-[#FF5A2E]" : "bg-surface-container-high"
				}`}
			>
				<span
					className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
						on ? "translate-x-5" : "translate-x-0"
					}`}
				/>
			</button>
		</div>
	);
}
