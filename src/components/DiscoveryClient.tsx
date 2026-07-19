"use client";

import { useQuery } from "@tanstack/react-query";
import Icon from "@/components/icons";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { getArtists } from "@/app/actions";
import HowItWorksModal from "@/components/HowItWorksModal";
import PageTour from "@/components/PageTour";
import { Link } from "@/i18n/routing";

type MyTour = {
	id: string;
	tour_name?: string | null;
	city?: string;
	status?: string;
	date?: string | Date;
	artist?: { name?: string | null } | null;
};

export default function DiscoveryClient({ myTours = [] }: { myTours?: MyTour[] }) {
	const t = useTranslations("DiscoveryPage");
	const locale = useLocale();

	const FEE_RANGES: { label: string; min: number; max: number }[] = [
		{ label: t("feeRanges.r1"), min: 5000, max: 15000 },
		{ label: t("feeRanges.r2"), min: 15000, max: 50000 },
		{ label: t("feeRanges.r3"), min: 50000, max: 150000 },
		{ label: t("feeRanges.r4"), min: 150000, max: Infinity },
	];

	const [genre, setGenre] = useState("All Genres");
	const [window, setWindow] = useState("All Windows");
	const [feeRange, setFeeRange] = useState("All Ranges");
	const [region, setRegion] = useState("All Africa");

	const { data: artistsQuery } = useQuery({
		queryKey: ["artists"],
		queryFn: () => getArtists(),
	});

	const artists = artistsQuery?.data ?? [];

	const tourWindows = Array.from(
		new Set(artists.map((a) => String(a.tour_window ?? "")).filter(Boolean)),
	).sort();

	const allMarkets = new Set<string>();
	for (const a of artists) {
		const m: unknown = a.markets;
		if (Array.isArray(m)) {
			for (const v of m as string[]) if (v) allMarkets.add(String(v));
		} else if (typeof m === "string" && m) {
			for (const v of m.split(",")) if (v.trim()) allMarkets.add(v.trim());
		}
	}

	const filtered = artists.filter((a) => {
		const aGenre = String(a.genre ?? "");
		if (
			genre !== "All Genres" &&
			!aGenre.toLowerCase().includes(genre.toLowerCase().split(" ")[0])
		) {
			const genreMap: Record<string, string[]> = {
				Afrobeats: ["afrobeats", "afro"],
				Electronic: ["electronic", "tech-house"],
				"Indie Rock": ["indie rock"],
				"Jazz & Soul": ["jazz", "soul", "neo-soul"],
				"World / Folk": ["world", "folk"],
				"Modern Classical": ["classical"],
			};
			const keys = genreMap[genre] ?? [];
			if (!keys.some((k) => aGenre.toLowerCase().includes(k))) return false;
		}
		if (window !== "All Windows" && String(a.tour_window ?? "") !== window)
			return false;
		if (feeRange !== "All Ranges") {
			const range = FEE_RANGES.find((r) => r.label === feeRange);
			if (
				range &&
				!(
					Number(a.fee_min ?? 0) <= range.max &&
					Number(a.fee_max ?? 0) >= range.min
				)
			)
				return false;
		}
		if (region !== "All Africa" && String(a.region ?? "") !== region)
			return false;
		return true;
	});

	return (
		<main className="flex-1 lg:ml-64 bg-surface p-6 md:p-10">
			<PageTour pageId="discovery" />

			{/* Header */}
			{(() => {
				const topByEoi = artists
					.filter((a) => ((a as unknown as { _count?: { eois: number } })._count?.eois ?? 0) > 0)
					.sort(
						(a, b) =>
							((b as unknown as { _count?: { eois: number } })._count?.eois ?? 0) -
							((a as unknown as { _count?: { eois: number } })._count?.eois ?? 0),
					)[0];
				const topTrending = topByEoi ?? artists[0];
				return (
					<div className="mb-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
						<div>
							<span className="text-xs font-semibold uppercase tracking-widest text-primary block mb-2">
								{t("hero.platform")}
							</span>
							<h1 className="text-3xl font-semibold font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
								{t.rich("hero.title", {
									spanNode: (chunks) => (
										<span className="text-primary">{chunks}</span>
									),
								})}
							</h1>
							<p className="text-on-surface-variant font-medium max-w-xl">
								{t("hero.description")}
							</p>
						</div>
						<div className="shrink-0 flex flex-col gap-4 max-w-sm w-full md:w-auto">
							<div data-tour="discovery-how-it-works">
								<HowItWorksModal
									title={t("howItWorks.title")}
									buttonLabel={t("howItWorks.button")}
									steps={[
										{ step: "01", title: t("howItWorks.step1.title"), desc: t("howItWorks.step1.description") },
										{ step: "02", title: t("howItWorks.step2.title"), desc: t("howItWorks.step2.description") },
										{ step: "03", title: t("howItWorks.step3.title"), desc: t("howItWorks.step3.description") },
										{ step: "04", title: t("howItWorks.step4.title"), desc: t("howItWorks.step4.description") },
									]}
								/>
							</div>
							<div className="bg-tertiary-fixed p-5 rounded-xl flex items-start gap-4 shadow-sm">
								<Icon name="zap" size={30} className="text-tertiary" />
								<div>
									<p className="font-(family-name:--font-manrope) font-semibold text-on-tertiary-fixed leading-tight">
										{t("trending.title")}
									</p>
									<p className="text-on-tertiary-fixed-variant text-sm mt-1 leading-relaxed">
										{topTrending
											? t("trending.dynamicDesc", {
												tourName: String(topTrending.tour_name ?? topTrending.name),
												artist: String(topTrending.name),
												window: String(topTrending.tour_window ?? ""),
											})
											: t("trending.fallbackDesc")}
									</p>
								</div>
							</div>
						</div>
					</div>
				);
			})()}

			{/* Filters */}
			<section data-tour="discovery-filters" className="bg-surface-container-low rounded-2xl p-4 md:p-6 mb-10">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
				<div className="w-full">
					<label
						htmlFor="filter-genre"
						className="block text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1"
					>
						{t("filters.genre")}
					</label>
					<div className="relative">
						<select
							id="filter-genre"
							value={genre}
							onChange={(e) => setGenre(e.target.value)}
							className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 appearance-none outline-none"
						>
							<option value="All Genres">{t("filters.allGenres")}</option>
							<option value="Afrobeats">{t("genres.afrobeats")}</option>
							<option value="Electronic">{t("genres.electronic")}</option>
							<option value="Indie Rock">{t("genres.indieRock")}</option>
							<option value="Jazz & Soul">{t("genres.jazzSoul")}</option>
							<option value="World / Folk">{t("genres.worldFolk")}</option>
							<option value="Modern Classical">
								{t("genres.modernClassical")}
							</option>
						</select>
						<Icon name="chevron-down" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
					</div>
				</div>

				<div className="w-full">
					<label
						htmlFor="filter-window"
						className="block text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1"
					>
						{t("filters.availableWindow")}
					</label>
					<div className="relative">
						<select
							id="filter-window"
							value={window}
							onChange={(e) => setWindow(e.target.value)}
							className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 appearance-none outline-none"
						>
							<option value="All Windows">{t("filters.allWindows")}</option>
							{tourWindows.map((w) => (
								<option key={w} value={w}>{w}</option>
							))}
						</select>
						<Icon name="calendar" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
					</div>
				</div>

				<div className="w-full">
					<label
						htmlFor="filter-fee"
						className="block text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1"
					>
						{t("filters.feeRange")}
					</label>
					<div className="relative">
						<select
							id="filter-fee"
							value={feeRange}
							onChange={(e) => setFeeRange(e.target.value)}
							className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 appearance-none outline-none"
						>
							<option value="All Ranges">{t("filters.allRanges")}</option>
							{FEE_RANGES.map((r) => (
								<option key={r.label} value={r.label}>
									{r.label}
								</option>
							))}
						</select>
						<Icon name="wallet" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
					</div>
				</div>

				<div className="w-full">
					<label
						htmlFor="filter-region"
						className="block text-[10px] font-semibold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1"
					>
						{t("filters.region")}
					</label>
					<div className="relative">
						<select
							id="filter-region"
							value={region}
							onChange={(e) => setRegion(e.target.value)}
							className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 appearance-none outline-none"
						>
							<option value="All Africa">{t("filters.allAfrica")}</option>
							<option value="West Africa">{t("regions.westAfrica")}</option>
							<option value="East Africa">{t("regions.eastAfrica")}</option>
							<option value="Southern Africa">
								{t("regions.southernAfrica")}
							</option>
							<option value="North Africa">{t("regions.northAfrica")}</option>
						</select>
						<Icon name="globe" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
					</div>
				</div>

				<div className="w-full sm:col-span-2 lg:col-span-1 lg:self-end">
					<button
						type="button"
						onClick={() => {
							setGenre("All Genres");
							setWindow("All Windows");
							setFeeRange("All Ranges");
							setRegion("All Africa");
						}}
						className="w-full lg:w-auto bg-primary text-white px-6 py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-primary/20"
					>
						<Icon name="sliders" size={14} />
						{t("filters.resetFilters")}
					</button>
				</div>
				</div>
			</section>

			<div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
				{/* Gallery Grid */}
				<div data-tour="discovery-grid" className="lg:col-span-8">
					<div className="flex items-center justify-between mb-8">
						<h2 className="font-(family-name:--font-manrope) text-2xl font-semibold">
							{t("activeTourProjects")}{" "}
							<span className="text-on-surface-variant font-normal text-lg">
								({filtered.length})
							</span>
						</h2>
						<div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
							<span>{t("sortBy.label")}</span>
							<button
								type="button"
								className="text-primary font-semibold flex items-center gap-1"
							>
								{t("sortBy.newestFirst")}{" "}
								<Icon name="chevron-down" size={12} />
							</button>
						</div>
					</div>

					{filtered.length === 0 ? (
						<div className="flex flex-col items-center justify-center py-24 text-on-surface-variant">
							<Icon name="search-x" size={44} className="mb-4" />
							<p className="font-semibold text-lg">{t("noResults.title")}</p>
							<p className="text-sm mt-1">{t("noResults.description")}</p>
						</div>
					) : (
						<div className="tsd-stagger grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
							{filtered.map((artist) => (
								<article
									key={String(artist.id ?? artist.name)}
									className="tsd-card tsd-card-hover overflow-hidden group flex flex-col"
								>
									<div className="h-44 relative overflow-hidden bg-surface-container-high">
										{artist.image_url ? (
											<Image
												src={String(artist.image_url)}
												alt={String(artist.name ?? "")}
												fill
												className="object-cover group-hover:scale-[1.04] transition-transform duration-700 [transition-timing-function:var(--ease-out)]"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center">
												<Icon name="music" size={40} className="text-on-surface-variant" />
											</div>
										)}
										<div className="absolute inset-x-0 bottom-0 h-24 bg-linear-to-t from-black/70 to-transparent" />
										{!!artist.is_trending && (
											<span className="absolute top-3 right-3 inline-flex items-center gap-1.5 bg-primary text-white px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-widest">
												<Icon name="trending-up" size={11} strokeWidth={2.5} />
												{t("trendingLabel")}
											</span>
										)}
										<div className="absolute bottom-3 left-4 right-4 flex items-end justify-between gap-3">
											<div className="min-w-0">
												<h3 className="text-white text-lg font-semibold leading-tight truncate group-hover:text-orange-200 transition-colors">
													{String(artist.name ?? "")}
												</h3>
												<p className="text-white/80 text-xs font-medium truncate">
													{String(artist.tour_name ?? "")}
												</p>
											</div>
											{artist.genre ? (
												<span className="shrink-0 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/90 bg-white/10 backdrop-blur px-2.5 py-1 rounded-md border border-white/15">
													<span className="w-1 h-1 rounded-full bg-primary" />
													{String(artist.genre)}
												</span>
											) : null}
										</div>
									</div>

									<dl className="px-5 py-1 flex-1 divide-y divide-outline-variant/60 text-sm">
										<div className="flex items-center justify-between gap-3 py-2.5">
											<dt className="flex items-center gap-2 text-on-surface-variant text-xs font-medium shrink-0">
												<Icon name="calendar" size={13} />
												{t("filters.availableWindow")}
											</dt>
											<dd className="font-semibold text-on-surface text-xs text-right truncate">
												{artist.tour_start && artist.tour_end
													? `${new Date(String(artist.tour_start)).toLocaleDateString(locale)} – ${new Date(String(artist.tour_end)).toLocaleDateString(locale)}`
													: String(artist.tour_window ?? "")}
											</dd>
										</div>
										<div className="flex items-center justify-between gap-3 py-2.5">
											<dt className="flex items-center gap-2 text-on-surface-variant text-xs font-medium shrink-0">
												<Icon name="map-pin" size={13} />
												{t("filters.region")}
											</dt>
											<dd className="font-semibold text-on-surface text-xs text-right truncate">
												{Array.isArray(artist.markets)
													? (artist.markets as string[]).join(", ")
													: String(artist.markets ?? "")}
											</dd>
										</div>
									</dl>

									<div className="tsd-foot px-5 py-3.5 flex items-center justify-between gap-3">
										<div className="min-w-0">
											<p className="text-[9px] font-semibold uppercase tracking-[0.14em] text-on-surface-variant">
												{t("filters.feeRange")}
											</p>
											<p className="text-sm font-(family-name:--font-display) text-on-surface leading-tight">
												{artist.fee_min != null && artist.fee_max != null
													? `$${Math.round(Number(artist.fee_min) / 1000)}k – $${Math.round(Number(artist.fee_max) / 1000)}k`
													: "—"}
											</p>
										</div>
										<Link
											href={`/eoi${artist.id ? `?id=${String(artist.id)}` : ""}`}
											className="shrink-0 inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-2.5 rounded-lg hover:opacity-90 active:scale-95 transition-all"
										>
											{t("submitEoi")}
											<Icon name="arrow-right" size={13} strokeWidth={2.25} />
										</Link>
									</div>
								</article>
							))}
						</div>
					)}
				</div>

				{/* Sidebar */}
				<aside className="lg:col-span-4 space-y-8">
					{/* My Active Tours */}
					<div className="tsd-card overflow-hidden">
						<div className="px-6 py-4 border-b border-outline-variant/10">
							<h3 className="font-(family-name:--font-manrope) font-semibold text-sm text-on-surface">
								{t("myTours.title")}
							</h3>
						</div>
						{myTours.length === 0 ? (
							<p className="px-6 py-5 text-xs text-on-surface-variant">{t("myTours.noTours")}</p>
						) : (
							<div className="divide-y divide-outline-variant/10">
								{myTours.map((tour) => {
									const statusKey = tour.status === "confirmed" ? "statusConfirmed"
										: tour.status === "under_review" ? "statusUnderReview"
										: tour.status === "needs_revision" ? "statusNeedsRevision"
										: tour.status === "rejected" ? "statusRejected"
										: "statusDraft";
									const statusColor = tour.status === "confirmed"
										? "bg-emerald-100 text-emerald-800"
										: tour.status === "rejected"
											? "bg-red-100 text-red-800"
											: "bg-yellow-100 text-yellow-800";
									return (
										<div key={tour.id} className="px-6 py-4 flex flex-col gap-1">
											<div className="flex items-start justify-between gap-2">
												<p className="font-(family-name:--font-manrope) font-semibold text-sm text-on-surface leading-tight">
													{tour.artist?.name ?? "—"}
												</p>
												<span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${statusColor}`}>
													{t(`myTours.${statusKey}`)}
												</span>
											</div>
											{(tour.tour_name || tour.city) && (
												<p className="text-xs text-on-surface-variant">
													{[tour.tour_name, tour.city].filter(Boolean).join(" · ")}
												</p>
											)}
										</div>
									);
								})}
							</div>
						)}
					</div>

					{/* Financing Banner */}
					<div className="bg-linear-to-br from-primary to-[#cc4826] rounded-2xl p-8 text-white relative overflow-hidden group">
						<div className="relative z-10">
							<h4 className="font-(family-name:--font-manrope) text-xl font-semibold leading-tight">
								{t("financing.title")}
							</h4>
							<p className="text-white/90 text-sm mt-3 leading-relaxed">
								{t("financing.description")}
							</p>
							<Link
								href="/eoi"
								className="mt-6 inline-block bg-white text-primary px-6 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider hover:scale-105 transition-transform"
							>
								{t("financing.applyButton")}
							</Link>
						</div>
						<Icon name="wallet" size={120} className="absolute -bottom-4 -right-4 text-white/10 rotate-12 group-hover:scale-110 transition-transform duration-500" />
					</div>

					{/* Platform Stats */}
					<div className="bg-surface-container-high rounded-2xl p-8">
						<h3 className="font-(family-name:--font-manrope) font-semibold text-sm uppercase tracking-widest text-on-surface-variant mb-6">
							{t("platformStats.title")}
						</h3>
						<div className="grid grid-cols-2 gap-4">
							{[
								{
									value: allMarkets.size > 0 ? String(allMarkets.size) : "—",
									label: t("platformStats.markets"),
								},
								{
									value: String(artists.length),
									label: t("platformStats.opportunities"),
								},
								{
									value: `${filtered.length}`,
									label: t("platformStats.activeTours"),
								},
								{ value: "48h", label: t("platformStats.avgReview") },
							].map((stat) => (
								<div
									key={stat.label}
									className="bg-surface-container-lowest p-4 rounded-xl text-center border border-primary/5 flex flex-col items-center justify-center min-h-24"
								>
									<p className="text-2xl font-semibold font-(family-name:--font-manrope) text-primary leading-none">
										{stat.value}
									</p>
									<p className="text-[10px] uppercase font-semibold text-on-surface-variant mt-2 leading-tight">
										{stat.label}
									</p>
								</div>
							))}
						</div>
					</div>
				</aside>
			</div>
		</main>
	);
}
