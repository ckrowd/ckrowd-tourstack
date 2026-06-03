"use client";
import { useQuery } from "@tanstack/react-query";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { getArtists } from "@/app/actions";
import PageTour from "@/components/PageTour";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import { Link } from "@/i18n/routing";

export default function DiscoveryPage() {
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

	// Derive unique tour_window values from live data so filter stays current
	const tourWindows = Array.from(
		new Set(artists.map((a) => String(a.tour_window ?? "")).filter(Boolean)),
	).sort();

	// Compute unique market count from all artists for the platform stats widget
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
			// Map select options to genre data
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
		<div className="bg-surface text-on-surface antialiased">
			<TopNav />
			<PageTour pageId="discovery" />

			<div className="flex pt-16 h-screen">
				<SideNav />

				<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
					{/* Header */}
					<div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
						<div>
							<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
								{t("hero.platform")}
							</span>
							<h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
								{t.rich("hero.title", {
									spanNode: (chunks) => (
										<span className="text-[#FF5A30]">{chunks}</span>
									),
								})}
							</h1>
							<p className="text-on-surface-variant font-medium max-w-xl">
								{t("hero.description")}
							</p>
						</div>
						<div className="shrink-0 bg-tertiary-fixed p-5 rounded-xl flex items-start gap-4 shadow-sm max-w-sm">
							<span
								className="material-symbols-outlined text-tertiary text-3xl"
								style={{ fontVariationSettings: "'FILL' 1" }}
							>
								bolt
							</span>
							<div>
								<p className="font-(family-name:--font-manrope) font-bold text-on-tertiary-fixed leading-tight">
									{t("trending.title")}
								</p>
								<p className="text-on-tertiary-fixed-variant text-sm mt-1 leading-relaxed">
									{t("trending.description")}
								</p>
							</div>
						</div>
					</div>

					{/* Filters */}
					<section data-tour="discovery-filters" className="bg-surface-container-low rounded-2xl p-4 md:p-6 flex flex-wrap items-end gap-4 mb-10">
						<div className="flex-1 min-w-45">
							<label
								htmlFor="filter-genre"
								className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1"
							>
								{t("filters.genre")}
							</label>
							<div className="relative">
								<select
									id="filter-genre"
									value={genre}
									onChange={(e) => setGenre(e.target.value)}
									className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-[#FF5A30]/20 appearance-none outline-none"
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
								<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
									expand_more
								</span>
							</div>
						</div>

						<div className="flex-1 min-w-45">
							<label
								htmlFor="filter-window"
								className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1"
							>
								{t("filters.availableWindow")}
							</label>
							<div className="relative">
								<select
									id="filter-window"
									value={window}
									onChange={(e) => setWindow(e.target.value)}
									className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-[#FF5A30]/20 appearance-none outline-none"
								>
									<option value="All Windows">{t("filters.allWindows")}</option>
									{tourWindows.map((w) => (
										<option key={w} value={w}>{w}</option>
									))}
								</select>
								<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
									calendar_today
								</span>
							</div>
						</div>

						<div className="flex-1 min-w-45">
							<label
								htmlFor="filter-fee"
								className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1"
							>
								{t("filters.feeRange")}
							</label>
							<div className="relative">
								<select
									id="filter-fee"
									value={feeRange}
									onChange={(e) => setFeeRange(e.target.value)}
									className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-[#FF5A30]/20 appearance-none outline-none"
								>
									<option value="All Ranges">{t("filters.allRanges")}</option>
									{FEE_RANGES.map((r) => (
										<option key={r.label} value={r.label}>
											{r.label}
										</option>
									))}
								</select>
								<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
									payments
								</span>
							</div>
						</div>

						<div className="flex-1 min-w-45">
							<label
								htmlFor="filter-region"
								className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1.5 ml-1"
							>
								{t("filters.region")}
							</label>
							<div className="relative">
								<select
									id="filter-region"
									value={region}
									onChange={(e) => setRegion(e.target.value)}
									className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-xl py-3 px-4 text-sm font-medium focus:ring-2 focus:ring-[#FF5A30]/20 appearance-none outline-none"
								>
									<option value="All Africa">{t("filters.allAfrica")}</option>
									<option value="West Africa">{t("regions.westAfrica")}</option>
									<option value="East Africa">{t("regions.eastAfrica")}</option>
									<option value="Southern Africa">
										{t("regions.southernAfrica")}
									</option>
									<option value="North Africa">{t("regions.northAfrica")}</option>
								</select>
								<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
									public
								</span>
							</div>
						</div>

						<button
							type="button"
							onClick={() => {
								setGenre("All Genres");
								setWindow("All Windows");
								setFeeRange("All Ranges");
								setRegion("All Africa");
							}}
							className="bg-[#FF5A30] text-white px-8 py-3 rounded-xl font-bold text-sm flex items-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-[#FF5A30]/20 self-end"
						>
							<span className="material-symbols-outlined text-sm">tune</span>
							{t("filters.resetFilters")}
						</button>
					</section>

					<div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
						{/* Gallery Grid */}
						<div data-tour="discovery-grid" className="lg:col-span-8">
							<div className="flex items-center justify-between mb-8">
								<h2 className="font-(family-name:--font-manrope) text-2xl font-bold">
									{t("activeTourProjects")}{" "}
									<span className="text-on-surface-variant font-normal text-lg">
										({filtered.length})
									</span>
								</h2>
								<div className="flex items-center gap-2 text-on-surface-variant text-sm font-medium">
									<span>{t("sortBy.label")}</span>
									<button
										type="button"
										className="text-[#FF5A30] font-bold flex items-center gap-1"
									>
										{t("sortBy.newestFirst")}{" "}
										<span className="material-symbols-outlined text-xs">
											arrow_drop_down
										</span>
									</button>
								</div>
							</div>

							{filtered.length === 0 ? (
								<div className="flex flex-col items-center justify-center py-24 text-on-surface-variant">
									<span className="material-symbols-outlined text-5xl mb-4">
										search_off
									</span>
									<p className="font-bold text-lg">{t("noResults.title")}</p>
									<p className="text-sm mt-1">{t("noResults.description")}</p>
								</div>
							) : (
								<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
									{filtered.map((artist) => (
										<div
											key={String(artist.id ?? artist.name)}
											className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 group border border-transparent hover:border-outline-variant/20"
										>
											<div className="h-56 relative overflow-hidden bg-surface-container-high">
												{artist.image_url ? (
													<Image
														src={String(artist.image_url)}
														alt={String(artist.name ?? "")}
														fill
														className="object-cover group-hover:scale-110 transition-transform duration-700"
													/>
												) : (
													<div className="w-full h-full flex items-center justify-center">
														<span className="material-symbols-outlined text-5xl text-on-surface-variant">
															music_note
														</span>
													</div>
												)}
												<div className="absolute top-4 left-4">
													<span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-[#FF5A30] uppercase tracking-tighter shadow-sm">
														{String(artist.genre ?? "")}
													</span>
												</div>
												{!!artist.is_trending && (
													<div className="absolute top-4 right-4">
														<span className="bg-tertiary-fixed text-on-tertiary-fixed px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
															{t("trendingLabel")}
														</span>
													</div>
												)}
												{/* Tour name overlay */}
												<div className="absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/60 to-transparent p-4">
													<span className="text-white text-xs font-bold uppercase tracking-wider opacity-90">
														{String(artist.tour_name ?? "")}
													</span>
												</div>
											</div>

											<div className="p-5">
												<h3 className="font-(family-name:--font-manrope) text-xl font-extrabold group-hover:text-[#FF5A30] transition-colors">
													{String(artist.name ?? "")}
												</h3>
												<div className="mt-3 space-y-2">
													<div className="flex items-center gap-2 text-on-surface-variant">
														<span className="material-symbols-outlined text-base">
															event
														</span>
														<span className="text-sm font-medium">
															{artist.tour_start && artist.tour_end
																? `${new Date(String(artist.tour_start)).toLocaleDateString(locale)} – ${new Date(String(artist.tour_end)).toLocaleDateString(locale)}`
																: String(artist.tour_window ?? "")}
														</span>
													</div>
													<div className="flex items-center gap-2 text-on-surface-variant">
														<span className="material-symbols-outlined text-base">
															monetization_on
														</span>
														<span className="text-sm font-medium">
															{artist.fee_min != null && artist.fee_max != null
																? `$${Math.round(Number(artist.fee_min) / 1000)}k – $${Math.round(Number(artist.fee_max) / 1000)}k USD`
																: "—"}
														</span>
													</div>
													<div className="flex items-center gap-2 text-on-surface-variant">
														<span className="material-symbols-outlined text-base">
															location_on
														</span>
														<span className="text-sm font-medium">
															{Array.isArray(artist.markets)
																? (artist.markets as string[]).join(", ")
																: String(artist.markets ?? "")}
														</span>
													</div>
												</div>
												<div className="mt-5">
													<Link
														href={`/eoi${artist.id ? `?id=${String(artist.id)}` : ""}`}
														className="block w-full bg-[#FF5A30] py-3 rounded-xl text-white font-bold text-sm tracking-wide shadow-md shadow-[#FF5A30]/10 active:scale-[0.98] transition-all text-center"
													>
														{t("submitEoi")}
													</Link>
												</div>
											</div>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Sidebar */}
						<aside className="lg:col-span-4 space-y-8">
							{/* How it Works */}
							<div data-tour="discovery-how-it-works" className="bg-white rounded-2xl p-8 border border-slate-100 shadow-sm">
								<h3 className="font-(family-name:--font-manrope) text-xl font-bold mb-6">
									{t("howItWorks.title")}
								</h3>
								<div className="space-y-7">
									{[
										{
											step: "01",
											title: t("howItWorks.step1.title"),
											desc: t("howItWorks.step1.description"),
										},
										{
											step: "02",
											title: t("howItWorks.step2.title"),
											desc: t("howItWorks.step2.description"),
										},
										{
											step: "03",
											title: t("howItWorks.step3.title"),
											desc: t("howItWorks.step3.description"),
										},
										{
											step: "04",
											title: t("howItWorks.step4.title"),
											desc: t("howItWorks.step4.description"),
										},
									].map((item) => (
										<div key={item.step} className="flex gap-4">
											<div className="shrink-0 w-8 h-8 rounded-full bg-primary-fixed flex items-center justify-center text-[#FF5A30] font-black text-xs">
												{item.step}
											</div>
											<div>
												<p className="font-bold text-sm text-on-surface">
													{item.title}
												</p>
												<p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
													{item.desc}
												</p>
											</div>
										</div>
									))}
								</div>
								<div className="mt-8 pt-6 border-t border-slate-100">
									<Link
										href="/eoi"
										className="w-full text-[#FF5A30] font-bold text-sm flex items-center justify-center gap-2 py-2 hover:bg-primary-fixed/30 rounded-lg transition-colors"
									>
										{t("howItWorks.startEoi")}{" "}
										<span className="material-symbols-outlined text-sm">
											arrow_forward
										</span>
									</Link>
								</div>
							</div>

							{/* Financing Banner */}
							<div className="bg-linear-to-br from-[#FF5A30] to-[#cc4826] rounded-2xl p-8 text-white relative overflow-hidden group">
								<div className="relative z-10">
									<h4 className="font-(family-name:--font-manrope) text-xl font-bold leading-tight">
										{t("financing.title")}
									</h4>
									<p className="text-white/90 text-sm mt-3 leading-relaxed">
										{t("financing.description")}
									</p>
									<Link
										href="/eoi"
										className="mt-6 inline-block bg-white text-[#FF5A30] px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider hover:scale-105 transition-transform"
									>
										{t("financing.applyButton")}
									</Link>
								</div>
								<span className="material-symbols-outlined absolute -bottom-4 -right-4 text-white/10 text-[120px] rotate-12 group-hover:scale-110 transition-transform duration-500">
									account_balance_wallet
								</span>
							</div>

							{/* Platform Stats */}
							<div className="bg-surface-container-high rounded-2xl p-8">
								<h3 className="font-(family-name:--font-manrope) font-bold text-sm uppercase tracking-widest text-on-surface-variant mb-6">
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
											className="bg-surface-container-lowest p-4 rounded-xl text-center border border-[#FF5A30]/5 flex flex-col items-center justify-center min-h-24"
										>
											<p className="text-2xl font-black font-(family-name:--font-manrope) text-[#FF5A30] leading-none">
												{stat.value}
											</p>
											<p className="text-[10px] uppercase font-bold text-on-surface-variant mt-2 leading-tight">
												{stat.label}
											</p>
										</div>
									))}
								</div>
							</div>
						</aside>
					</div>
				</main>
			</div>
		</div>
	);
}
