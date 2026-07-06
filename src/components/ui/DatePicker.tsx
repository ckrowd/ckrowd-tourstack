"use client";

import { useEffect, useRef, useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

function parseIsoDate(value: string): Date | undefined {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!match) return undefined;
	const [, y, m, d] = match;
	const date = new Date(Number(y), Number(m) - 1, Number(d));
	return Number.isNaN(date.getTime()) ? undefined : date;
}

function formatIsoDate(date: Date): string {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}-${m}-${d}`;
}

export default function DatePicker({
	label,
	id,
	value,
	onChange,
	placeholder = "Select a date",
	required,
	showError,
	hint,
}: {
	label: string;
	id: string;
	value: string;
	onChange: (v: string) => void;
	placeholder?: string;
	required?: boolean;
	showError?: boolean;
	hint?: string;
}) {
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const selected = parseIsoDate(value);
	const hasError = required && showError && !value;

	useEffect(() => {
		function handleClick(e: MouseEvent) {
			if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
		}
		document.addEventListener("mousedown", handleClick);
		return () => document.removeEventListener("mousedown", handleClick);
	}, []);

	return (
		<div ref={rootRef} className="relative">
			<label
				htmlFor={id}
				className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5"
			>
				{label}
				{required && <span className="text-rose-500 ml-1">*</span>}
			</label>
			<button
				type="button"
				id={id}
				onClick={() => setOpen((o) => !o)}
				className={`w-full flex items-center justify-between gap-2 bg-surface-container-low border rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/30 ${hasError ? "border-rose-400 ring-1 ring-rose-300" : "border-outline-variant/30"}`}
			>
				<span className={selected ? "" : "text-on-surface-variant"}>
					{selected
						? selected.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })
						: placeholder}
				</span>
				<span className="material-symbols-outlined text-base text-on-surface-variant shrink-0">
					calendar_month
				</span>
			</button>
			{open && (
				<div className="absolute z-20 mt-1 bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg p-2">
					<DayPicker
						mode="single"
						selected={selected}
						onSelect={(date) => {
							if (date) onChange(formatIsoDate(date));
							setOpen(false);
						}}
						captionLayout="dropdown"
						defaultMonth={selected}
						// The dropdown caption defaults to 100 years ago through the end of
						// the current year (react-day-picker's own default) — too narrow
						// for future-dated fields like tour availability windows, so widen
						// it to also cover the next decade.
						startMonth={new Date(new Date().getFullYear() - 100, 0)}
						endMonth={new Date(new Date().getFullYear() + 10, 11)}
						style={{ "--rdp-accent-color": "#FF5A2E", "--rdp-accent-background-color": "#FFF1EC" } as React.CSSProperties}
					/>
				</div>
			)}
			{hasError && (
				<p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
					<span className="material-symbols-outlined text-sm">error</span>
					Required
				</p>
			)}
			{hint && !hasError && <p className="text-xs text-on-surface-variant mt-1.5">{hint}</p>}
		</div>
	);
}
