"use client";

import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { getStakeholders } from "@/app/actions";
import { downloadCsv } from "@/lib/csv";
import Loader from "@/components/Loader";

type Category = "service" | "workforce" | "artmgmt";

const CATEGORY_ICONS: Record<Category, string> = {
	service: "build",
	workforce: "engineering",
	artmgmt: "music_note",
};

function toCategory(c: string): Category {
	return c === "artmgmt" ? "artmgmt" : c === "workforce" ? "workforce" : "service";
}

// Flatten extra_data (one level deep) into raw key → string pairs so
// it can be rendered in the detail view and used as CSV columns.
function flattenExtra(extra: Record<string, unknown> | null | undefined): Record<string, string> {
	if (!extra || typeof extra !== "object") return {};
	const out: Record<string, string> = {};
	for (const [k, v] of Object.entries(extra)) {
		if (v == null || v === "") continue;
		out[k] = typeof v === "object" ? JSON.stringify(v) : String(v);
	}
	return out;
}

// Convert a camelCase / snake_case key to a human-readable label.
function humanizeKey(key: string): string {
	return key
		.replace(/_/g, " ")
		.replace(/([a-z])([A-Z])/g, "$1 $2")
		.replace(/\b\w/g, (c) => c.toUpperCase());
}

export default function AdminDirectoryPage() {
	const t = useTranslations("AdminDirectoryPage");
	const locale = useLocale();
	const [filter, setFilter] = useState<"all" | Category>("all");
	const [search, setSearch] = useState("");
	const [debouncedSearch, setDebouncedSearch] = useState("");
	const [selectedId, setSelectedId] = useState<string | null>(null);

	// Debounce so we issue one server search per pause, not per keystroke.
	useEffect(() => {
		const id = setTimeout(() => setDebouncedSearch(search.trim()), 300);
		return () => clearTimeout(id);
	}, [search]);

	// Free-text search (name / company / country / town) runs server-side so it
	// scales past what the browser can filter; category is a cheap client-side
	// refinement that keeps the per-tab counts live.
	const { data: res, isLoading } = useQuery({
		queryKey: ["stakeholders", "all", debouncedSearch],
		queryFn: () =>
			getStakeholders("all", debouncedSearch ? { q: debouncedSearch } : undefined),
	});

	const entries = useMemo(() => (res?.data ?? []).map((s) => ({
		id: s.id,
		category: toCategory(s.category),
		name: s.name,
		email: s.email,
		phone: s.phone ?? "",
		company: s.company ?? "",
		country: s.country ?? "",
		submittedAt: s.submitted_at,
		extra: flattenExtra(s.extra_data),
	})), [res]);

	const CATEGORY_LABELS: Record<Category, string> = {
		service: t("categories.service"),
		workforce: t("categories.workforce"),
		artmgmt: t("categories.artmgmt"),
	};

	const FILTER_TABS: { key: "all" | Category; label: string }[] = [
		{ key: "all", label: t("filters.all") },
		{ key: "service", label: t("filters.service") },
		{ key: "workforce", label: t("filters.workforce") },
		{ key: "artmgmt", label: t("filters.artmgmt") },
	];

	const filtered =
		filter === "all" ? entries : entries.filter((e) => e.category === filter);
	const selected = selectedId
		? (entries.find((e) => e.id === selectedId) ?? null)
		: null;

	function handleExport() {
		// Collect the union of extra-data keys across the currently filtered rows
		// so the CSV exposes every detail captured at onboarding time.
		const extraKeys = Array.from(
			new Set(filtered.flatMap((r) => Object.keys(r.extra))),
		).sort();

		const baseHeaders = [
			t("csvHeaders.name"),
			t("csvHeaders.category"),
			t("csvHeaders.company"),
			t("csvHeaders.email"),
			t("csvHeaders.phone"),
			t("csvHeaders.country"),
			t("csvHeaders.submitted"),
		];
		const headers = [...baseHeaders, ...extraKeys.map(humanizeKey)];

		const rows = filtered.map((r) => [
			r.name,
			CATEGORY_LABELS[r.category],
			r.company,
			r.email,
			r.phone,
			r.country,
			new Date(r.submittedAt).toISOString().slice(0, 10),
			...extraKeys.map((k) => r.extra[k] ?? ""),
		]);

		downloadCsv(
			headers,
			rows,
			`stakeholders-${filter}-${new Date().toISOString().slice(0, 10)}.csv`,
		);
	}

	if (selected) {
		return (
			<div className="w-full space-y-6">
				<button
					type="button"
					onClick={() => setSelectedId(null)}
					className="flex items-center gap-2 text-on-surface-variant hover:text-[#FF5A2E] text-sm font-semibold transition-colors"
				>
					<span className="material-symbols-outlined text-sm">arrow_back</span>
					{t("backToDirectory")}
				</button>

				<div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm border border-outline-variant/10">
					<div className="flex items-start gap-5 mb-8">
						<div className="w-16 h-16 rounded-2xl bg-[#FF5A2E]/10 flex items-center justify-center shrink-0">
							<span className="material-symbols-outlined text-[#FF5A2E] text-2xl">
								{CATEGORY_ICONS[selected.category]}
							</span>
						</div>
						<div>
							<span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A2E] block mb-1">
								{CATEGORY_LABELS[selected.category]}
							</span>
							<h2 className="text-2xl font-extrabold font-(family-name:--font-manrope) text-on-surface">
								{selected.name}
							</h2>
							{selected.company && (
								<p className="text-on-surface-variant text-sm mt-0.5">
									{selected.company}
								</p>
							)}
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<Field label={t("details.email")} value={selected.email} />
						<Field label={t("details.phone")} value={selected.phone} />
						<Field label={t("details.country")} value={selected.country} />
						<Field
							label={t("details.submitted")}
							value={new Date(selected.submittedAt).toLocaleDateString(locale, {
								day: "numeric",
								month: "long",
								year: "numeric",
							})}
						/>
						{Object.entries(selected.extra).map(([k, v]) => (
							<Field key={k} label={humanizeKey(k)} value={v} />
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="w-full">
			<header className="mb-8">
				<span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A2E] block mb-3">
					{t("tagline")}
				</span>
				<h1 className="text-4xl font-extrabold tracking-tight text-on-surface mb-2 font-(family-name:--font-manrope)">
					{t("title")}
				</h1>
				<p className="text-on-surface-variant">{t("description")}</p>
			</header>

			<div className="relative mb-4 max-w-md">
				<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant/60 text-lg pointer-events-none">
					search
				</span>
				<input
					type="search"
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder={t("searchPlaceholder")}
					aria-label={t("searchPlaceholder")}
					className="w-full rounded-xl bg-surface-container-highest pl-10 pr-4 py-2.5 text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/20"
				/>
			</div>

			<div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
				<div className="flex gap-2 flex-wrap">
					{FILTER_TABS.map((tab) => (
						<button
							key={tab.key}
							type="button"
							onClick={() => setFilter(tab.key)}
							className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
								filter === tab.key
									? "bg-[#FF5A2E] text-white shadow-md"
									: "bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high"
							}`}
						>
							{tab.label}
							<span className="ml-2 text-xs opacity-70">
								{tab.key === "all"
									? entries.length
									: entries.filter((e) => e.category === tab.key).length}
							</span>
						</button>
					))}
				</div>
				<button
					type="button"
					onClick={handleExport}
					disabled={filtered.length === 0}
					className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-surface-container-highest text-on-surface-variant hover:bg-surface-container-high transition-all disabled:opacity-40 disabled:cursor-not-allowed"
				>
					<span className="material-symbols-outlined text-sm">download</span>
					{t("exportCsv")}
				</button>
			</div>

			{isLoading ? (
				<div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
					<Loader />
				</div>
			) : filtered.length === 0 ? (
				<div className="text-center py-20 bg-surface-container-lowest rounded-2xl border border-outline-variant/10">
					<span className="material-symbols-outlined text-5xl text-on-surface-variant/30 block mb-4">
						{debouncedSearch ? "search_off" : "group_add"}
					</span>
					<p className="text-on-surface-variant font-medium">
						{debouncedSearch ? t("searchNoResults.title") : t("noEntries.title")}
					</p>
					<p className="text-sm text-on-surface-variant mt-1">
						{debouncedSearch
							? t("searchNoResults.description")
							: t("noEntries.description")}
					</p>
				</div>
			) : (
				<div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-surface-container-high">
								<th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
									{t("table.name")}
								</th>
								<th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-on-surface-variant hidden md:table-cell">
									{t("table.category")}
								</th>
								<th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-on-surface-variant hidden lg:table-cell">
									{t("table.country")}
								</th>
								<th className="px-5 py-4 text-xs font-semibold uppercase tracking-widest text-on-surface-variant hidden md:table-cell">
									{t("table.submitted")}
								</th>
								<th className="px-5 py-4" />
							</tr>
						</thead>
						<tbody className="divide-y divide-outline-variant/10">
							{filtered.map((entry) => (
								<tr
									key={entry.id}
									className="hover:bg-surface-container-low transition-colors"
								>
									<td className="px-5 py-4">
										<div className="flex items-center gap-3">
											<div className="w-9 h-9 rounded-xl bg-[#FF5A2E]/10 flex items-center justify-center shrink-0">
												<span className="material-symbols-outlined text-[#FF5A2E] text-base">
													{CATEGORY_ICONS[entry.category]}
												</span>
											</div>
											<div>
												<span className="block font-(family-name:--font-manrope) font-semibold text-on-surface text-sm">
													{entry.name}
												</span>
												{entry.company && (
													<span className="block text-xs text-on-surface-variant">
														{entry.company}
													</span>
												)}
											</div>
										</div>
									</td>
									<td className="px-5 py-4 hidden md:table-cell">
										<span className="px-2 py-1 bg-[#FF5A2E]/10 text-[#FF5A2E] text-xs font-semibold rounded-lg">
											{CATEGORY_LABELS[entry.category]}
										</span>
									</td>
									<td className="px-5 py-4 text-xs text-on-surface-variant font-medium hidden lg:table-cell">
										{entry.country}
									</td>
									<td className="px-5 py-4 text-xs text-on-surface-variant font-medium hidden md:table-cell">
										{new Date(entry.submittedAt).toLocaleDateString(locale, {
											day: "numeric",
											month: "short",
											year: "numeric",
										})}
									</td>
									<td className="px-5 py-4 text-right">
										<button
											type="button"
											onClick={() => setSelectedId(entry.id)}
											className="text-xs font-semibold text-[#FF5A2E] hover:underline"
										>
											{t("table.view")}
										</button>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

function Field({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1">
				{label}
			</p>
			<p className="text-sm text-on-surface font-medium break-words">
				{value || "—"}
			</p>
		</div>
	);
}
