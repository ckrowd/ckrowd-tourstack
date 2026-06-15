"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getRosterArtists } from "@/app/actions";
import Loader from "@/components/Loader";

type RosterArtist = {
	id: unknown;
	name: unknown;
	genre: unknown;
	nationality?: unknown;
	is_active?: unknown;
	created_at?: unknown;
};

function tally(artists: RosterArtist[], key: keyof RosterArtist) {
	const counts: Record<string, number> = {};
	for (const a of artists) {
		const val = String(a[key] ?? "Unknown");
		counts[val] = (counts[val] ?? 0) + 1;
	}
	return Object.entries(counts)
		.sort((a, b) => b[1] - a[1])
		.slice(0, 8);
}

function monthKey(dateStr: string) {
	const d = new Date(dateStr);
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function BarRow({
	label,
	count,
	max,
	color,
}: {
	label: string;
	count: number;
	max: number;
	color: string;
}) {
	const pct = max > 0 ? Math.round((count / max) * 100) : 0;
	return (
		<div className="flex items-center gap-3">
			<span className="text-xs text-slate-600 font-semibold w-28 shrink-0 truncate">
				{label}
			</span>
			<div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
				<div
					className={`h-full rounded-full transition-all duration-500 ${color}`}
					style={{ width: `${pct}%` }}
				/>
			</div>
			<span className="text-xs font-semibold text-slate-700 w-5 text-right">
				{count}
			</span>
		</div>
	);
}

export default function ArtmgmtReportsPage() {
	const t = useTranslations("ArtmgmtReportsPage");

	const { data: artists = [] as RosterArtist[], isLoading } = useQuery({
		queryKey: ["roster-artists"],
		queryFn: getRosterArtists,
		select: (r) => (r.data ?? []) as RosterArtist[],
	});

	const genreCounts = tally(artists, "genre");
	const nationalityCounts = tally(artists, "nationality");
	const maxGenre = genreCounts[0]?.[1] ?? 1;
	const maxNat = nationalityCounts[0]?.[1] ?? 1;

	const activeCount = artists.filter((a) => Boolean(a.is_active)).length;
	const inactiveCount = artists.length - activeCount;
	const activePct =
		artists.length > 0 ? Math.round((activeCount / artists.length) * 100) : 0;

	const byMonth = artists.reduce<Record<string, number>>((acc, a) => {
		if (a.created_at) {
			const k = monthKey(String(a.created_at));
			acc[k] = (acc[k] ?? 0) + 1;
		}
		return acc;
	}, {});
	const monthEntries = Object.entries(byMonth)
		.sort(([a], [b]) => a.localeCompare(b))
		.slice(-6);
	const maxMonth = Math.max(...monthEntries.map(([, v]) => v), 1);

	if (isLoading) {
		return (
			<div className="flex items-center justify-center py-32">
				<Loader />
			</div>
		);
	}

	return (
		<div>
			<div className="mb-6">
				<span className="inline-block px-3 py-1 rounded-full bg-[#FF5A30]/10 text-[#FF5A30] text-xs font-semibold uppercase tracking-wider mb-3">
					{t("badge")}
				</span>
				<h1 className="font-(family-name:--font-manrope) text-3xl font-black text-on-surface">
					{t("title")}
				</h1>
				<p className="text-on-surface-variant text-sm mt-1">{t("subtitle")}</p>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
				<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
					<div className="w-11 h-11 rounded-xl bg-[#FF5A30]/10 flex items-center justify-center shrink-0">
						<span className="material-symbols-outlined text-[#FF5A30] text-xl">
							groups
						</span>
					</div>
					<div className="min-w-0">
						<p className="text-2xl font-black text-slate-900 leading-none">
							{artists.length}
						</p>
						<p className="text-xs text-slate-500 font-semibold mt-0.5">
							{t("stats.total")}
						</p>
					</div>
				</div>
				<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
					<div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
						<span className="material-symbols-outlined text-violet-600 text-xl">
							category
						</span>
					</div>
					<div className="min-w-0">
						<p className="text-2xl font-black text-slate-900 leading-none">
							{genreCounts.length}
						</p>
						<p className="text-xs text-slate-500 font-semibold mt-0.5">
							{t("stats.genres")}
						</p>
					</div>
				</div>
				<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4">
					<div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
						<span className="material-symbols-outlined text-emerald-600 text-xl">
							public
						</span>
					</div>
					<div className="min-w-0">
						<p className="text-2xl font-black text-slate-900 leading-none">
							{nationalityCounts.length}
						</p>
						<p className="text-xs text-slate-500 font-semibold mt-0.5">
							{t("stats.nationalities")}
						</p>
					</div>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
				{/* Genre breakdown */}
				<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
					<h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
						<span className="material-symbols-outlined text-[#FF5A30] text-lg">
							music_note
						</span>
						{t("genres.title")}
					</h2>
					{genreCounts.length === 0 ? (
						<p className="text-sm text-slate-400">{t("noData")}</p>
					) : (
						<div className="space-y-3">
							{genreCounts.map(([genre, count]) => (
								<BarRow
									key={genre}
									label={genre}
									count={count}
									max={maxGenre}
									color="bg-[#FF5A30]"
								/>
							))}
						</div>
					)}
				</div>

				{/* Nationality breakdown */}
				<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
					<h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
						<span className="material-symbols-outlined text-emerald-600 text-lg">
							public
						</span>
						{t("nationalities.title")}
					</h2>
					{nationalityCounts.length === 0 ? (
						<p className="text-sm text-slate-400">{t("noData")}</p>
					) : (
						<div className="space-y-3">
							{nationalityCounts.map(([nat, count]) => (
								<BarRow
									key={nat}
									label={nat}
									count={count}
									max={maxNat}
									color="bg-emerald-500"
								/>
							))}
						</div>
					)}
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				{/* Active vs inactive */}
				<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
					<h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
						<span className="material-symbols-outlined text-violet-600 text-lg">
							donut_large
						</span>
						{t("status.title")}
					</h2>
					{artists.length === 0 ? (
						<p className="text-sm text-slate-400">{t("noData")}</p>
					) : (
						<div className="space-y-4">
							<div className="flex items-center justify-between text-sm mb-1">
								<span className="font-semibold text-slate-700">{t("status.active")}</span>
								<span className="font-semibold text-slate-900">
									{activeCount}{" "}
									<span className="text-slate-400 font-normal">({activePct}%)</span>
								</span>
							</div>
							<div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden">
								<div
									className="h-full bg-emerald-500 rounded-full transition-all duration-500"
									style={{ width: `${activePct}%` }}
								/>
							</div>
							<div className="flex gap-4 pt-1">
								<div className="flex items-center gap-2 text-xs text-slate-600">
									<span className="w-3 h-3 rounded-full bg-emerald-500 shrink-0" />
									{t("status.active")}: {activeCount}
								</div>
								<div className="flex items-center gap-2 text-xs text-slate-600">
									<span className="w-3 h-3 rounded-full bg-slate-200 shrink-0" />
									{t("status.inactive")}: {inactiveCount}
								</div>
							</div>
						</div>
					)}
				</div>

				{/* Monthly growth */}
				<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
					<h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
						<span className="material-symbols-outlined text-blue-500 text-lg">
							trending_up
						</span>
						{t("growth.title")}
					</h2>
					{monthEntries.length === 0 ? (
						<p className="text-sm text-slate-400">{t("noData")}</p>
					) : (
						<div className="space-y-3">
							{monthEntries.map(([month, count]) => (
								<BarRow
									key={month}
									label={month}
									count={count}
									max={maxMonth}
									color="bg-blue-400"
								/>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
