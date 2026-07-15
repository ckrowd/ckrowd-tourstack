"use client";

import type { ComponentType, SVGProps } from "react";
import Icon from "@/components/icons";
import { useEffect, useRef, useState } from "react";
import * as Flags from "country-flag-icons/react/3x2";

// Currency names are proper nouns, not UI copy — kept as data, same convention
// as the untranslated city list in the landing page.
export const CURRENCIES = [
	{ code: "USD", name: "US Dollar", flag: "US" },
	{ code: "NGN", name: "Nigerian Naira", flag: "NG" },
	{ code: "GBP", name: "British Pound", flag: "GB" },
	{ code: "EUR", name: "Euro", flag: "EU" },
	{ code: "ZAR", name: "South African Rand", flag: "ZA" },
] as const;

const FLAGS = Flags as unknown as Record<string, ComponentType<SVGProps<SVGSVGElement>>>;

function FlagIcon({ code, className }: { code: string; className?: string }) {
	const Flag = FLAGS[code];
	if (!Flag) return null;
	return <Flag className={className} />;
}

export default function CurrencySelect({
	label,
	id,
	value,
	onChange,
	placeholder = "Select a currency",
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
	const hasError = required && showError && !value;
	const selected = CURRENCIES.find((c) => c.code === value);

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
				aria-haspopup="listbox"
				aria-expanded={open}
				className={`w-full flex items-center justify-between gap-2 bg-surface-container-low border rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/30 ${hasError ? "border-rose-400 ring-1 ring-rose-300" : "border-outline-variant/30"}`}
			>
				<span className="flex items-center gap-2.5 min-w-0">
					{selected ? (
						<>
							<FlagIcon code={selected.flag} className="w-5 h-auto rounded-[2px] shrink-0" />
							<span className="truncate">
								{selected.code} — {selected.name}
							</span>
						</>
					) : (
						<span className="text-on-surface-variant">{placeholder}</span>
					)}
				</span>
				<Icon name="chevron-down" size={16} className="text-on-surface-variant shrink-0" />
			</button>
			{open && (
				<div
					role="listbox"
					className="absolute z-20 mt-1 w-full bg-surface-container-lowest border border-outline-variant/30 rounded-xl shadow-lg overflow-hidden py-1"
				>
					{CURRENCIES.map((c) => (
						<button
							key={c.code}
							type="button"
							role="option"
							aria-selected={c.code === value}
							onClick={() => {
								onChange(c.code);
								setOpen(false);
							}}
							className={`w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-left hover:bg-surface-container transition-colors ${c.code === value ? "bg-[#FF5A2E]/10 text-[#FF5A2E] font-semibold" : "text-on-surface"}`}
						>
							<FlagIcon code={c.flag} className="w-5 h-auto rounded-[2px] shrink-0" />
							<span className="truncate">
								{c.code} — {c.name}
							</span>
						</button>
					))}
				</div>
			)}
			{hasError && (
				<p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
					<Icon name="alert-circle" size={14} />
					Required
				</p>
			)}
			{hint && !hasError && <p className="text-xs text-on-surface-variant mt-1.5">{hint}</p>}
		</div>
	);
}
