"use client";

import {
	generateMarketingContent,
	getSponsorshipMatches,
	getTicketForecast,
	getVenueRecommendations,
	optimizeTourRoute,
} from "@/app/actions";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import FormattedNumberInput from "@/components/ui/FormattedNumberInput";

// ── Shared ─────────────────────────────────────────────────────────────────

const ic =
	"w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30 focus:border-[#FF5A30]/60 transition-all";

function RunButton({ loading, label, loadingLabel }: { loading: boolean; label: string; loadingLabel: string }) {
	return (
		<button
			type="submit"
			disabled={loading}
			className="inline-flex items-center gap-2 bg-[#FF5A30] text-white font-bold text-sm px-6 py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60"
		>
			<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
				{loading ? "hourglass_top" : "auto_awesome"}
			</span>
			{loading ? loadingLabel : label}
		</button>
	);
}

function ResultCard({ children }: { children: React.ReactNode }) {
	return (
		<div className="mt-6 bg-surface-container-lowest border border-outline-variant/20 rounded-2xl p-6 space-y-4">
			{children}
		</div>
	);
}

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-2">
			{children}
		</p>
	);
}

function ErrorBanner({ msg }: { msg: string }) {
	return (
		<div className="mt-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl px-4 py-3 text-sm font-medium">
			{msg}
		</div>
	);
}

type EOI = { id: unknown; status: unknown; artist: unknown; city: unknown };

function EOISelector({
	eois,
	value,
	onChange,
	label,
}: {
	eois: EOI[];
	value: string;
	onChange: (v: string) => void;
	label: string;
}) {
	const t = useTranslations("AIToolsPage");
	return (
		<div>
			<label className="block text-xs font-semibold text-on-surface-variant mb-1.5">{label}</label>
			<div className="relative">
				<select
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className={`${ic} appearance-none pr-9`}
				>
					<option value="">{t("common.eoiPlaceholder")}</option>
					{eois.map((e) => {
						const artist = e.artist as Record<string, unknown> | null;
						return (
							<option key={String(e.id)} value={String(e.id)}>
								{String(artist?.name ?? "Artist")} — {String(e.city ?? "")} ({String(e.status ?? "").replace(/_/g, " ")})
							</option>
						);
					})}
				</select>
				<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-lg">
					expand_more
				</span>
			</div>
		</div>
	);
}

// ── 1. Ticket Sales Forecast ───────────────────────────────────────────────

function TicketForecastTab({ eois }: { eois: EOI[] }) {
	const t = useTranslations("AIToolsPage");
	const [eoiId, setEoiId] = useState("");
	const [price, setPrice] = useState("");

	const mutation = useMutation({
		mutationFn: () => getTicketForecast(eoiId, Number(price)),
	});

	const d = mutation.data?.data as Record<string, unknown> | undefined;

	return (
		<div className="space-y-5">
			<EOISelector eois={eois} value={eoiId} onChange={setEoiId} label={t("common.selectEoiLabel")} />
			<div>
				<label className="block text-xs font-semibold text-on-surface-variant mb-1.5">{t("forecast.ticketPrice")}</label>
				<FormattedNumberInput value={price} onChange={(v) => setPrice(v)} placeholder="e.g. 15,000" className={ic} />
			</div>
			<form onSubmit={(e) => { e.preventDefault(); if (eoiId && price) mutation.mutate(); }}>
				<RunButton loading={mutation.isPending} label={t("forecast.run")} loadingLabel={t("forecast.running")} />
			</form>
			{d && (
				<ResultCard>
					<div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
						{[
							[t("forecast.projectedSales"), `${Number(d.projectedSales ?? 0).toLocaleString()} tickets`],
							[t("forecast.sellOutProbability"), `${d.sellOutProbability ?? 0}%`],
							[t("forecast.estimatedRevenue"), `₦${Number(d.estimatedRevenue ?? 0).toLocaleString()}`],
							[t("forecast.recommendedPrice"), String(d.recommendedPriceRange ?? "—")],
							[t("forecast.timeToSellOut"), String(d.timeToSellOut ?? "—")],
						].map(([label, value]) => (
							<div key={label} className="bg-surface-container-low rounded-xl p-3">
								<p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">{label}</p>
								<p className="text-sm font-bold mt-1 text-on-surface">{value}</p>
							</div>
						))}
					</div>
					{!!d.pricingTiers && (
						<div>
							<SectionLabel>{t("forecast.pricingTiers")}</SectionLabel>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
								{Object.entries(d.pricingTiers as Record<string, Record<string, unknown>>).map(([tier, info]) => (
									<div key={tier} className="bg-surface-container-low rounded-xl p-3 text-center">
										<p className="text-[10px] font-black uppercase tracking-widest text-[#FF5A30]">{tier}</p>
										<p className="text-sm font-bold mt-1">₦{Number(info.suggestedPrice ?? 0).toLocaleString()}</p>
										<p className="text-xs text-on-surface-variant">{String(info.allocationPct ?? 0)}% allocation</p>
									</div>
								))}
							</div>
						</div>
					)}
					{!!d.insights && <p className="text-sm text-on-surface-variant">{String(d.insights)}</p>}
				</ResultCard>
			)}
			{mutation.data && !mutation.data.success && <ErrorBanner msg={mutation.data.error ?? t("forecast.error")} />}
		</div>
	);
}

// ── 2. Sponsorship Matcher ─────────────────────────────────────────────────

function SponsorshipMatcherTab({ eois }: { eois: EOI[] }) {
	const t = useTranslations("AIToolsPage");
	const [eoiId, setEoiId] = useState("");

	const mutation = useMutation({
		mutationFn: () => getSponsorshipMatches(eoiId),
	});

	const d = mutation.data?.data as Record<string, unknown> | undefined;

	return (
		<div className="space-y-5">
			<EOISelector eois={eois} value={eoiId} onChange={setEoiId} label={t("common.selectEoiLabel")} />
			<form onSubmit={(e) => { e.preventDefault(); if (eoiId) mutation.mutate(); }}>
				<RunButton loading={mutation.isPending} label={t("sponsors.run")} loadingLabel={t("sponsors.running")} />
			</form>
			{d && (
				<ResultCard>
					{!!d.strategy &&<p className="text-sm text-on-surface-variant italic">{String(d.strategy)}</p>}
					<div className="flex gap-4 flex-wrap">
						{!!d.totalPotential &&<div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2"><p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{t("sponsors.totalPotential")}</p><p className="text-base font-black text-emerald-900">{String(d.totalPotential)}</p></div>}
						{!!d.topCategory &&<div className="bg-surface-container-low rounded-xl px-4 py-2"><p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t("sponsors.topCategory")}</p><p className="text-base font-bold text-on-surface">{String(d.topCategory)}</p></div>}
					</div>
					{Array.isArray(d.matches) && (
						<div className="space-y-3">
							<SectionLabel>{t("sponsors.matches")}</SectionLabel>
							{(d.matches as Record<string, unknown>[]).map((m, i) => (
								<div key={i} className="bg-surface-container-low rounded-xl p-4">
									<div className="flex items-center justify-between mb-2">
										<p className="font-bold text-sm text-on-surface">{String(m.industry ?? "")}</p>
										<span className={`text-xs font-black px-2 py-0.5 rounded-full ${Number(m.fitScore ?? 0) >= 80 ? "bg-emerald-100 text-emerald-800" : "bg-yellow-100 text-yellow-800"}`}>{String(m.fitScore ?? 0)}% fit</span>
									</div>
									{Array.isArray(m.suggestedBrands) && <p className="text-xs text-on-surface-variant mb-1"><span className="font-semibold">Brands:</span> {(m.suggestedBrands as string[]).join(", ")}</p>}
									<p className="text-xs text-on-surface-variant mb-1">{String(m.reasoning ?? "")}</p>
									{!!m.estimatedValue && <p className="text-xs font-semibold text-emerald-700">Est. value: {String(m.estimatedValue)}</p>}
									{!!m.outreachTip && <p className="text-xs text-on-surface-variant mt-1 italic">{String(m.outreachTip)}</p>}
								</div>
							))}
						</div>
					)}
				</ResultCard>
			)}
			{mutation.data && !mutation.data.success && <ErrorBanner msg={mutation.data.error ?? t("sponsors.error")} />}
		</div>
	);
}

// ── 3. Venue Recommendation ────────────────────────────────────────────────

function VenueRecommendationTab() {
	const t = useTranslations("AIToolsPage");
	const [form, setForm] = useState({ city: "", genre: "", expectedAttendance: "", budgetMaxUsd: "" });
	const set = (k: keyof typeof form, v: string) => setForm((p) => ({ ...p, [k]: v }));

	const mutation = useMutation({
		mutationFn: () =>
			getVenueRecommendations({
				city: form.city,
				genre: form.genre,
				expectedAttendance: Number(form.expectedAttendance),
				budgetMaxUsd: form.budgetMaxUsd ? Number(form.budgetMaxUsd) : undefined,
			}),
	});

	const d = mutation.data?.data as Record<string, unknown> | undefined;

	return (
		<div className="space-y-5">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div><label className="block text-xs font-semibold text-on-surface-variant mb-1.5">{t("venues.city")}</label><input type="text" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="e.g. Lagos" className={ic} /></div>
				<div><label className="block text-xs font-semibold text-on-surface-variant mb-1.5">{t("venues.genre")}</label><input type="text" value={form.genre} onChange={(e) => set("genre", e.target.value)} placeholder="e.g. Afrobeats" className={ic} /></div>
				<div><label className="block text-xs font-semibold text-on-surface-variant mb-1.5">{t("venues.expectedAttendance")}</label><FormattedNumberInput value={form.expectedAttendance} onChange={(v) => set("expectedAttendance", v)} placeholder="e.g. 5,000" className={ic} /></div>
				<div><label className="block text-xs font-semibold text-on-surface-variant mb-1.5">{t("venues.budgetMax")}</label><FormattedNumberInput value={form.budgetMaxUsd} onChange={(v) => set("budgetMaxUsd", v)} placeholder="e.g. 10,000" className={ic} /></div>
			</div>
			<form onSubmit={(e) => { e.preventDefault(); if (form.city && form.genre && form.expectedAttendance) mutation.mutate(); }}>
				<RunButton loading={mutation.isPending} label={t("venues.run")} loadingLabel={t("venues.running")} />
			</form>
			{d && (
				<ResultCard>
					{!!d.cityInsights &&<p className="text-sm text-on-surface-variant">{String(d.cityInsights)}</p>}
					{!!d.topPick &&<div className="inline-flex items-center gap-2 bg-[#FF5A30]/10 text-[#FF5A30] font-bold text-xs px-3 py-1.5 rounded-full"><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>{t("venues.topPick")}: {String(d.topPick)}</div>}
					{Array.isArray(d.recommendations) && (
						<div className="space-y-3">
							{(d.recommendations as Record<string, unknown>[]).map((v, i) => (
								<div key={i} className="bg-surface-container-low rounded-xl p-4">
									<div className="flex items-start justify-between gap-3 mb-2">
										<div>
											<p className="font-bold text-sm text-on-surface">{String(v.name ?? "")}</p>
											<p className="text-xs text-on-surface-variant">{String(v.type ?? "")} · {String(v.location ?? "")}</p>
										</div>
										<span className={`text-xs font-black px-2 py-0.5 rounded-full shrink-0 ${Number(v.suitabilityScore ?? 0) >= 80 ? "bg-emerald-100 text-emerald-800" : "bg-yellow-100 text-yellow-800"}`}>{String(v.suitabilityScore ?? 0)}/100</span>
									</div>
									<div className="flex flex-wrap gap-3 text-xs mb-2">
										<span><span className="font-semibold">Capacity:</span> {Number(v.estimatedCapacity ?? 0).toLocaleString()} ({String(v.capacityUtilization ?? "—")} utilization)</span>
										<span><span className="font-semibold">Rental:</span> {String(v.estimatedRentalCostUsd ?? "—")}</span>
									</div>
									{Array.isArray(v.pros) && <p className="text-xs text-emerald-700"><span className="font-semibold">Pros:</span> {(v.pros as string[]).join(" · ")}</p>}
									{Array.isArray(v.cons) && <p className="text-xs text-rose-600 mt-0.5"><span className="font-semibold">Cons:</span> {(v.cons as string[]).join(" · ")}</p>}
								</div>
							))}
						</div>
					)}
					{!!d.tip &&<p className="text-xs text-on-surface-variant italic border-l-2 border-[#FF5A30]/40 pl-3">{String(d.tip)}</p>}
				</ResultCard>
			)}
			{mutation.data && !mutation.data.success && <ErrorBanner msg={mutation.data.error ?? t("venues.error")} />}
		</div>
	);
}

// ── 4. Tour Route Optimizer ────────────────────────────────────────────────

function RouteOptimizerTab() {
	const t = useTranslations("AIToolsPage");
	const [citiesRaw, setCitiesRaw] = useState("");
	const [startCity, setStartCity] = useState("");
	const [days, setDays] = useState("");

	const mutation = useMutation({
		mutationFn: () =>
			optimizeTourRoute({
				cities: citiesRaw.split(",").map((c) => c.trim()).filter(Boolean),
				startCity,
				tourDurationDays: days ? Number(days) : undefined,
			}),
	});

	const d = mutation.data?.data as Record<string, unknown> | undefined;

	return (
		<div className="space-y-5">
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div className="sm:col-span-2">
					<label className="block text-xs font-semibold text-on-surface-variant mb-1.5">{t("route.cities")}</label>
					<input type="text" value={citiesRaw} onChange={(e) => setCitiesRaw(e.target.value)} placeholder="e.g. Lagos, Abuja, Port Harcourt, Ibadan" className={ic} />
				</div>
				<div><label className="block text-xs font-semibold text-on-surface-variant mb-1.5">{t("route.startCity")}</label><input type="text" value={startCity} onChange={(e) => setStartCity(e.target.value)} placeholder="e.g. Lagos" className={ic} /></div>
				<div><label className="block text-xs font-semibold text-on-surface-variant mb-1.5">{t("route.duration")}</label><input type="text" inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value.replace(/\D/g, ""))} placeholder="e.g. 14" className={ic} /></div>
			</div>
			<form onSubmit={(e) => { e.preventDefault(); if (citiesRaw && startCity) mutation.mutate(); }}>
				<RunButton loading={mutation.isPending} label={t("route.run")} loadingLabel={t("route.running")} />
			</form>
			{d && (
				<ResultCard>
					<div className="flex flex-wrap gap-3">
						{d.logisticsScore != null && <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2"><p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">{t("route.logisticsScore")}</p><p className="text-xl font-black text-emerald-900">{String(d.logisticsScore)}/100</p></div>}
						{!!d.estimatedSavingsVsRandom &&<div className="bg-surface-container-low rounded-xl px-4 py-2"><p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t("route.savings")}</p><p className="text-xl font-black text-on-surface">{String(d.estimatedSavingsVsRandom)}</p></div>}
						{d.totalTravelDays != null && <div className="bg-surface-container-low rounded-xl px-4 py-2"><p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant">{t("route.travelDays")}</p><p className="text-xl font-black text-on-surface">{String(d.totalTravelDays)}</p></div>}
					</div>
					{Array.isArray(d.optimizedRoute) && (
						<div>
							<SectionLabel>{t("route.optimizedRoute")}</SectionLabel>
							<div className="flex flex-wrap items-center gap-2">
								{(d.optimizedRoute as string[]).map((city, i) => (
									<span key={city} className="flex items-center gap-2">
										<span className="bg-[#FF5A30] text-white font-bold text-xs px-3 py-1.5 rounded-full">{city}</span>
										{i < (d.optimizedRoute as string[]).length - 1 && <span className="material-symbols-outlined text-sm text-on-surface-variant">arrow_forward</span>}
									</span>
								))}
							</div>
						</div>
					)}
					{!!d.reasoning &&<p className="text-sm text-on-surface-variant">{String(d.reasoning)}</p>}
					{Array.isArray(d.legs) && (
						<div>
							<SectionLabel>{t("route.legs")}</SectionLabel>
							<div className="space-y-2">
								{(d.legs as Record<string, unknown>[]).map((leg, i) => (
									<div key={i} className="flex items-center gap-3 bg-surface-container-low rounded-xl px-4 py-2.5 text-sm">
										<span className="font-semibold text-on-surface">{String(leg.from ?? "")}</span>
										<span className="material-symbols-outlined text-sm text-on-surface-variant">arrow_forward</span>
										<span className="font-semibold text-on-surface">{String(leg.to ?? "")}</span>
										<span className="ml-auto text-xs text-on-surface-variant">{String(leg.recommendedMode ?? "")} · {String(leg.travelTimeHours ?? "")}h · {String(leg.estimatedCostUsd ?? "")}</span>
									</div>
								))}
							</div>
						</div>
					)}
					{Array.isArray(d.tips) && (
						<div>
							<SectionLabel>{t("route.tips")}</SectionLabel>
							<ul className="space-y-1">{(d.tips as string[]).map((tip) => <li key={tip} className="flex items-start gap-2 text-xs text-on-surface-variant"><span className="material-symbols-outlined text-[#FF5A30] text-sm mt-0.5 shrink-0">lightbulb</span>{tip}</li>)}</ul>
						</div>
					)}
				</ResultCard>
			)}
			{mutation.data && !mutation.data.success && <ErrorBanner msg={mutation.data.error ?? t("route.error")} />}
		</div>
	);
}

// ── 5. Marketing Content Generator ────────────────────────────────────────

function MarketingContentTab({ eois }: { eois: EOI[] }) {
	const t = useTranslations("AIToolsPage");
	const [eoiId, setEoiId] = useState("");
	const [activeContent, setActiveContent] = useState<string>("instagram");

	const mutation = useMutation({
		mutationFn: () => generateMarketingContent(eoiId),
	});

	const d = mutation.data?.data as Record<string, unknown> | undefined;

	return (
		<div className="space-y-5">
			<EOISelector eois={eois} value={eoiId} onChange={setEoiId} label={t("common.selectEoiLabel")} />
			<form onSubmit={(e) => { e.preventDefault(); if (eoiId) mutation.mutate(); }}>
				<RunButton loading={mutation.isPending} label={t("marketing.run")} loadingLabel={t("marketing.running")} />
			</form>
			{d && (
				<ResultCard>
					<div className="flex flex-wrap gap-2 border-b border-outline-variant/20 pb-4">
						{["instagram", "twitter", "facebook", "email", "pressRelease", "calendar"].map((tab) => (
							<button
								key={tab}
								type="button"
								onClick={() => setActiveContent(tab)}
								className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${activeContent === tab ? "bg-[#FF5A30] text-white" : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"}`}
							>
								{tab === "pressRelease"
									? t("marketing.pressRelease")
									: tab === "calendar"
										? t("marketing.calendar")
										: tab.charAt(0).toUpperCase() + tab.slice(1)}
							</button>
						))}
					</div>

					{activeContent === "instagram" && Array.isArray(d.instagram) && (
						<div className="space-y-3">
							{(d.instagram as string[]).map((post, i) => (
								<div key={i} className="bg-surface-container-low rounded-xl p-4 text-sm whitespace-pre-wrap">{post}</div>
							))}
						</div>
					)}
					{activeContent === "twitter" && Array.isArray(d.twitter) && (
						<div className="space-y-3">
							{(d.twitter as string[]).map((tweet, i) => (
								<div key={i} className="bg-surface-container-low rounded-xl p-4 text-sm">{tweet}</div>
							))}
						</div>
					)}
					{activeContent === "facebook" && Array.isArray(d.facebook) && (
						<div className="space-y-3">
							{(d.facebook as string[]).map((post, i) => (
								<div key={i} className="bg-surface-container-low rounded-xl p-4 text-sm whitespace-pre-wrap">{post}</div>
							))}
						</div>
					)}
					{activeContent === "email" && (
						<div className="space-y-3">
							{!!d.emailSubject &&<div className="bg-surface-container-low rounded-xl p-4"><p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant mb-1">{t("marketing.subject")}</p><p className="text-sm font-bold">{String(d.emailSubject)}</p></div>}
							{!!d.emailBody &&<div className="bg-surface-container-low rounded-xl p-4 text-sm whitespace-pre-wrap">{String(d.emailBody)}</div>}
						</div>
					)}
					{activeContent === "pressRelease" && !!d.pressRelease && (
						<div className="bg-surface-container-low rounded-xl p-4 text-sm whitespace-pre-wrap">{String(d.pressRelease)}</div>
					)}
					{activeContent === "calendar" && Array.isArray(d.promotionalCalendar) && (
						<div className="space-y-2">
							{(d.promotionalCalendar as Record<string, unknown>[]).map((item, i) => (
								<div key={i} className="flex items-start gap-3 bg-surface-container-low rounded-xl px-4 py-3">
									<div className="shrink-0 text-center min-w-12">
										<p className="text-[10px] font-black uppercase tracking-widest text-[#FF5A30]">Wk {String(item.week ?? "")}</p>
										<p className="text-xs font-semibold text-on-surface-variant">{String(item.day ?? "")}</p>
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-xs font-bold text-on-surface">{String(item.platform ?? "")} — {String(item.action ?? "")}</p>
										<p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">{String(item.copy ?? "")}</p>
									</div>
								</div>
							))}
						</div>
					)}
				</ResultCard>
			)}
			{mutation.data && !mutation.data.success && <ErrorBanner msg={mutation.data.error ?? t("marketing.error")} />}
		</div>
	);
}

// ── Main Tabs Component ────────────────────────────────────────────────────

const TABS = [
	{ key: "forecast", icon: "confirmation_number" },
	{ key: "sponsors", icon: "handshake" },
	{ key: "venues", icon: "stadium" },
	{ key: "route", icon: "route" },
	{ key: "marketing", icon: "campaign" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export default function AIToolsClient({ eois }: { eois: EOI[] }) {
	const [activeTab, setActiveTab] = useState<TabKey>("forecast");
	const t = useTranslations("AIToolsPage");

	return (
		<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
			{/* Tab sidebar */}
			<nav className="lg:col-span-3 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible pb-1 lg:pb-0">
				{TABS.map((tab) => (
					<button
						key={tab.key}
						type="button"
						onClick={() => setActiveTab(tab.key)}
						className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all text-left whitespace-nowrap lg:whitespace-normal shrink-0 lg:shrink ${
							activeTab === tab.key
								? "bg-[#FF5A30] text-white shadow-md shadow-[#FF5A30]/20"
								: "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low"
						}`}
					>
						<span
							className="material-symbols-outlined text-base shrink-0"
							style={{ fontVariationSettings: activeTab === tab.key ? "'FILL' 1" : "'FILL' 0" }}
						>
							{tab.icon}
						</span>
						<span className="lg:block">{t(`tabs.${tab.key}.label`)}</span>
					</button>
				))}
			</nav>

			{/* Active panel */}
			<div className="lg:col-span-9 bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
				<h2 className="font-(family-name:--font-manrope) font-extrabold text-xl text-on-surface mb-1">
					{t(`tabs.${activeTab}.label`)}
				</h2>
				<p className="text-sm text-on-surface-variant mb-6">{t(`tabs.${activeTab}.description`)}</p>

				{activeTab === "forecast" && <TicketForecastTab eois={eois} />}
				{activeTab === "sponsors" && <SponsorshipMatcherTab eois={eois} />}
				{activeTab === "venues" && <VenueRecommendationTab />}
				{activeTab === "route" && <RouteOptimizerTab />}
				{activeTab === "marketing" && <MarketingContentTab eois={eois} />}
			</div>
		</div>
	);
}
