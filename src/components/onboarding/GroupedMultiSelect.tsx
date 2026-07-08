"use client";

import { useMemo, useState } from "react";

type Group = { key: string; items: readonly string[] };

const chipBase =
	"px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer";
const chipActive = "bg-orange text-white border-orange";
const chipInactive =
	"border-[var(--hair,rgba(0,0,0,0.1))] text-[var(--muted,#5c5c5c)] hover:border-orange/40";

/**
 * Searchable, grouped multi-select for large taxonomies (e.g. the 110 workforce
 * roles / 94 vendor types). Stores selections as an array of stable keys; all
 * display text is resolved through the caller-supplied label functions so it
 * stays fully i18n'd.
 */
export default function GroupedMultiSelect({
	groups,
	groupLabel,
	itemLabel,
	values,
	onChange,
	searchPlaceholder,
	selectedLabel,
	noResultsText,
}: {
	groups: readonly Group[];
	groupLabel: (key: string) => string;
	itemLabel: (key: string) => string;
	values: string[];
	onChange: (values: string[]) => void;
	searchPlaceholder: string;
	selectedLabel: string;
	noResultsText: string;
}) {
	const [query, setQuery] = useState("");

	const toggle = (item: string) =>
		onChange(
			values.includes(item)
				? values.filter((v) => v !== item)
				: [...values, item],
		);

	const q = query.trim().toLowerCase();
	const filtered = useMemo(
		() =>
			groups
				.map((g) => ({
					key: g.key,
					items: q
						? g.items.filter((it) => itemLabel(it).toLowerCase().includes(q))
						: g.items,
				}))
				.filter((g) => g.items.length > 0),
		[groups, q, itemLabel],
	);

	return (
		<div className="rounded-xl border border-[var(--hair,rgba(0,0,0,0.1))] bg-[var(--surface-2,#ececea)]">
			{/* Selected summary */}
			{values.length > 0 && (
				<div className="px-3 pt-3">
					<p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted,#5c5c5c)] mb-2">
						{selectedLabel} ({values.length})
					</p>
					<div className="flex flex-wrap gap-1.5">
						{values.map((item) => (
							<button
								key={item}
								type="button"
								onClick={() => toggle(item)}
								className={`${chipBase} ${chipActive} inline-flex items-center gap-1`}
							>
								{itemLabel(item)}
								<span className="material-symbols-outlined text-sm leading-none">close</span>
							</button>
						))}
					</div>
				</div>
			)}

			{/* Search */}
			<div className="p-3">
				<div className="relative">
					<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted,#5c5c5c)]/60 text-lg pointer-events-none">
						search
					</span>
					<input
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder={searchPlaceholder}
						aria-label={searchPlaceholder}
						className="w-full rounded-lg bg-[var(--bg,#ffffff)] text-[var(--text,#0c0c0c)] pl-10 pr-4 py-2.5 text-sm border border-[var(--hair,rgba(0,0,0,0.1))] focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange/50"
					/>
				</div>
			</div>

			{/* Grouped options */}
			<div className="max-h-72 overflow-y-auto px-3 pb-3 space-y-4">
				{filtered.length === 0 ? (
					<p className="text-sm text-[var(--muted,#5c5c5c)] py-4 text-center">
						{noResultsText}
					</p>
				) : (
					filtered.map((g) => (
						<div key={g.key}>
							<p className="text-[10px] font-semibold uppercase tracking-widest text-orange mb-2 sticky top-0 bg-[var(--surface-2,#ececea)] py-1">
								{groupLabel(g.key)}
							</p>
							<div className="flex flex-wrap gap-1.5">
								{g.items.map((item) => {
									const on = values.includes(item);
									return (
										<button
											key={item}
											type="button"
											aria-pressed={on}
											onClick={() => toggle(item)}
											className={`${chipBase} ${on ? chipActive : chipInactive}`}
										>
											{itemLabel(item)}
										</button>
									);
								})}
							</div>
						</div>
					))
				)}
			</div>
		</div>
	);
}
