"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Suspense, useMemo, useState } from "react";
import { createEOI, getArtists, getTourstackProfile } from "@/app/actions";
import { useSession } from "@/context/AuthContext";
import { Link } from "@/i18n/routing";

type ArtistItem = NonNullable<Awaited<ReturnType<typeof getArtists>>["data"]>[number];

type EOIForm = {
	// Step 1 — Promoter Info
	companyName: string;
	tradingName: string;
	companyType: string;
	registrationNumber: string;
	taxId: string;
	primaryAddress: string;
	country: string;
	contactPerson: string;
	jobTitle: string;
	contactEmail: string;
	phone: string;
	websiteUrl: string;
	instagram: string;
	xHandle: string;
	facebook: string;
	tiktok: string;
	// Step 2 — Experience
	yearsInBusiness: string;
	concertsOrganized: string;
	largestConcertCapacity: string;
	averageEventsYear: string;
	genresSpecialties: string;
	marketsRegions: string;
	// Step 3 — Tour & Artist
	tourName: string;
	tourManager: string;
	tourManagerEmail: string;
	tourManagerPhone: string;
	proposedCities: string;
	preferredDates: string;
	artistConfirmed: boolean;
	spotifyListeners: string;
	youtubeSubscribers: string;
	artistInstagram: string;
	// Step 4 — Venue & Ticketing
	venueName: string;
	venueCity: string;
	venueCapacity: string;
	venueType: string;
	venueStatus: string;
	venueRentalCost: string;
	ticketingPartner: string;
	expectedTicketSales: string;
	expectedOccupancy: string;
	// Step 5 — Budget & Revenue
	artistFee: string;
	productionCosts: string;
	marketingCosts: string;
	operationsCosts: string;
	totalBudget: string;
	ticketingRevenue: string;
	sponsorshipRevenue: string;
	otherRevenue: string;
	totalRevenue: string;
	netProfit: string;
	// Step 6 — Risk, Financing & Banking
	hasCancellationHistory: boolean;
	securityPlan: string;
	hasInsurance: boolean;
	insuranceProvider: string;
	insuranceType: string;
	insuranceAcknowledged: boolean;
	needsFinancing: boolean;
	financingAmount: string;
	financingPurpose: string[];
	financingStructure: string;
	bankName: string;
	bankAccountHolder: string;
	bankAccountNumber: string;
	bvnOrRc: string;
	// Step 7 — Documents & Declaration
	hasCACDocuments: boolean;
	hasFinancialStatements: boolean;
	hasTourDocs: boolean;
	authorizedRepName: string;
	authorizedRepTitle: string;
	additionalNotes: string;
	declarationConfirmed: boolean;
};

const DEFAULT_FORM: EOIForm = {
	companyName: "", tradingName: "", companyType: "", registrationNumber: "",
	taxId: "", primaryAddress: "", country: "", contactPerson: "", jobTitle: "",
	contactEmail: "", phone: "", websiteUrl: "", instagram: "", xHandle: "",
	facebook: "", tiktok: "", yearsInBusiness: "", concertsOrganized: "",
	largestConcertCapacity: "", averageEventsYear: "", genresSpecialties: "",
	marketsRegions: "", tourName: "", tourManager: "", tourManagerEmail: "",
	tourManagerPhone: "", proposedCities: "", preferredDates: "",
	artistConfirmed: false, spotifyListeners: "", youtubeSubscribers: "",
	artistInstagram: "", venueName: "", venueCity: "", venueCapacity: "",
	venueType: "", venueStatus: "", venueRentalCost: "", ticketingPartner: "",
	expectedTicketSales: "", expectedOccupancy: "", artistFee: "",
	productionCosts: "", marketingCosts: "", operationsCosts: "", totalBudget: "",
	ticketingRevenue: "", sponsorshipRevenue: "", otherRevenue: "", totalRevenue: "",
	netProfit: "", hasCancellationHistory: false, securityPlan: "",
	hasInsurance: false, insuranceProvider: "", insuranceType: "", insuranceAcknowledged: false,
	needsFinancing: false, financingAmount: "", financingPurpose: [],
	financingStructure: "", bankName: "", bankAccountHolder: "", bankAccountNumber: "",
	bvnOrRc: "", hasCACDocuments: false, hasFinancialStatements: false,
	hasTourDocs: false, authorizedRepName: "", authorizedRepTitle: "",
	additionalNotes: "", declarationConfirmed: false,
};

function buildNotes(form: EOIForm): string {
	const sections: string[] = [];

	sections.push(
		`PROMOTER INFORMATION\n` +
		`Company: ${form.companyName}${form.tradingName ? ` (${form.tradingName})` : ""} | Type: ${form.companyType}\n` +
		`RC: ${form.registrationNumber} | Tax ID: ${form.taxId}\n` +
		`Address: ${form.primaryAddress}, ${form.country}\n` +
		`Contact: ${form.contactPerson} (${form.jobTitle}) — ${form.contactEmail} | ${form.phone}\n` +
		(form.websiteUrl ? `Website: ${form.websiteUrl}\n` : "") +
		[form.instagram && `IG: ${form.instagram}`, form.xHandle && `X: ${form.xHandle}`, form.facebook && `FB: ${form.facebook}`, form.tiktok && `TikTok: ${form.tiktok}`].filter(Boolean).join(" | ")
	);

	sections.push(
		`PROMOTER EXPERIENCE\n` +
		`Years in Business: ${form.yearsInBusiness} | Total Concerts: ${form.concertsOrganized} | Largest Capacity: ${form.largestConcertCapacity}\n` +
		`Avg Events/Year: ${form.averageEventsYear} | Genres: ${form.genresSpecialties}\n` +
		`Markets: ${form.marketsRegions}`
	);

	sections.push(
		`TOUR DETAILS\n` +
		`Tour: ${form.tourName}\n` +
		`Tour Manager: ${form.tourManager}${form.tourManagerEmail ? ` — ${form.tourManagerEmail}` : ""}${form.tourManagerPhone ? ` | ${form.tourManagerPhone}` : ""}\n` +
		`Cities: ${form.proposedCities} | Dates: ${form.preferredDates}\n` +
		`Artist Confirmed: ${form.artistConfirmed ? "Yes" : "Pending"}\n` +
		[form.spotifyListeners && `Spotify: ${form.spotifyListeners}/mo`, form.youtubeSubscribers && `YouTube: ${form.youtubeSubscribers}`, form.artistInstagram && `IG: ${form.artistInstagram}`].filter(Boolean).join(" | ")
	);

	sections.push(
		`VENUE & TICKETING\n` +
		`Venue: ${form.venueName} (${form.venueCity}) — ${form.venueCapacity} cap | ${form.venueType} | ${form.venueStatus}\n` +
		(form.venueRentalCost ? `Rental: $${form.venueRentalCost}\n` : "") +
		`Ticketing: ${form.ticketingPartner} | Expected Sales: ${form.expectedTicketSales} | Occupancy: ${form.expectedOccupancy}%`
	);

	sections.push(
		`TOUR BUDGET (USD)\n` +
		`Artist Fee: $${form.artistFee} | Production: $${form.productionCosts} | Marketing: $${form.marketingCosts} | Operations: $${form.operationsCosts}\n` +
		`TOTAL BUDGET: $${form.totalBudget}\n\n` +
		`REVENUE FORECAST (USD)\n` +
		`Ticketing: $${form.ticketingRevenue} | Sponsorship: $${form.sponsorshipRevenue} | Other: $${form.otherRevenue}\n` +
		`Total Revenue: $${form.totalRevenue} | Net P/L: $${form.netProfit}`
	);

	const riskLines = [`Cancellation History: ${form.hasCancellationHistory ? "Yes" : "No"}`];
	if (form.securityPlan) riskLines.push(`Security Plan: ${form.securityPlan}`);
	riskLines.push(`Event Insurance: ${form.hasInsurance ? "Yes" : "No"}`);
	if (form.hasInsurance && form.insuranceProvider) riskLines.push(`Insurance Provider: ${form.insuranceProvider}`);
	if (form.hasInsurance && form.insuranceType) riskLines.push(`Insurance Type: ${form.insuranceType}`);
	riskLines.push(`Insurance Acknowledged: ${form.insuranceAcknowledged ? "Yes" : "No"}`);
	sections.push(`RISK & INSURANCE\n${riskLines.join("\n")}`);

	if (form.needsFinancing) {
		sections.push(
			`FINANCING\n` +
			`Amount: $${form.financingAmount}\n` +
			(form.financingPurpose.length > 0 ? `Purpose: ${form.financingPurpose.join(", ")}\n` : "") +
			(form.financingStructure ? `Structure: ${form.financingStructure}` : "")
		);
	}

	sections.push(
		`BANKING\n` +
		`Bank: ${form.bankName} | Holder: ${form.bankAccountHolder} | Account: ${form.bankAccountNumber}` +
		(form.bvnOrRc ? ` | BVN/RC: ${form.bvnOrRc}` : "")
	);

	const docs: string[] = [];
	if (form.hasCACDocuments) docs.push("✓ CAC Certificate");
	if (form.hasFinancialStatements) docs.push("✓ Financial Statements");
	if (form.hasTourDocs) docs.push("✓ Tour Docs");
	if (docs.length > 0) sections.push(`DOCUMENTS\n${docs.join("\n")}`);

	sections.push(`DECLARATION\nBy: ${form.authorizedRepName} (${form.authorizedRepTitle})`);

	if (form.additionalNotes.trim()) {
		sections.push(`ADDITIONAL NOTES\n${form.additionalNotes.trim()}`);
	}

	return sections.join("\n\n");
}

const ic = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF5A30] focus:ring-2 focus:ring-[#FF5A30]/20";
const icErr = "border-rose-400 focus:border-rose-400 focus:ring-rose-400/20";
const sc = "w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-[#FF5A30] focus:ring-2 focus:ring-[#FF5A30]/20 min-h-28";

function FLabel({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: React.ReactNode }) {
	return (
		<label htmlFor={htmlFor} className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
			{children}{required && <span className="text-rose-500 ml-1">*</span>}
		</label>
	);
}

function FError({ msg }: { msg?: string }) {
	if (!msg) return null;
	return <p className="mt-1.5 text-xs text-rose-600 font-medium">{msg}</p>;
}

function SectionHeading({ children }: { children: React.ReactNode }) {
	return (
		<div className="col-span-full border-b border-slate-100 pb-3 mb-1">
			<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF5A30]">{children}</p>
		</div>
	);
}

function ToggleGroup({ value, onChange, options }: { value: boolean; onChange: (v: boolean) => void; options: [string, string] }) {
	return (
		<div className="flex shrink-0 rounded-xl border border-slate-200 overflow-hidden text-sm font-semibold">
			<button type="button" role="switch" aria-checked={!value} onClick={() => onChange(false)}
				className={`px-4 py-2 transition ${!value ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
				{options[0]}
			</button>
			<button type="button" role="switch" aria-checked={value} onClick={() => onChange(true)}
				className={`px-4 py-2 transition ${value ? "bg-[#FF5A30] text-white" : "bg-white text-slate-500 hover:bg-slate-50"}`}>
				{options[1]}
			</button>
		</div>
	);
}

function Stepper({ current, steps }: { current: number; steps: { label: string }[] }) {
	const progress = (current / (steps.length - 1)) * 100;
	return (
		<div className="mb-8">
			<div className="relative flex items-center justify-between">
				<div className="absolute left-0 top-1/2 z-0 h-0.5 w-full -translate-y-1/2 bg-slate-200" />
				<div className="absolute left-0 top-1/2 z-0 h-0.5 -translate-y-1/2 bg-[#FF5A30] transition-all duration-500" style={{ width: `${progress}%` }} />
				{steps.map((step, i) => {
					const done = i < current;
					const active = i === current;
					return (
						<div key={step.label} className="relative z-10 flex flex-col items-center">
							<div className={`flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-[#f6f4ef] font-semibold text-xs ${done || active ? "bg-[#FF5A30] text-white" : "bg-slate-200 text-slate-500"}`}>
								{done ? <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check</span> : i + 1}
							</div>
							<span className={`mt-1.5 hidden sm:block text-[9px] font-semibold uppercase tracking-wider ${active ? "text-[#FF5A30]" : done ? "text-[#FF5A30]/60" : "text-slate-400"}`}>
								{step.label}
							</span>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function OpportunitySelector({ opportunities, loading, selectedId, onSelect }: {
	opportunities: ArtistItem[];
	loading: boolean;
	selectedId: string | null;
	onSelect: (id: string) => void;
}) {
	const t = useTranslations("EOIPage");
	const [search, setSearch] = useState("");
	const filtered = search.trim()
		? opportunities.filter(a => String(a.name ?? "").toLowerCase().includes(search.toLowerCase()) || String(a.tour_name ?? "").toLowerCase().includes(search.toLowerCase()))
		: opportunities;
	return (
		<div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5">
			<p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-500 mb-3">{t("selector.heading")}</p>
			<div className="relative mb-3">
				<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-base">search</span>
				<input type="text" placeholder={t("selector.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)}
					className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-900 outline-none focus:border-[#FF5A30] focus:ring-2 focus:ring-[#FF5A30]/20 transition" />
			</div>
			{loading ? (
				<p className="text-sm text-slate-500 text-center py-4">{t("selector.loading")}</p>
			) : filtered.length === 0 ? (
				<p className="text-sm text-slate-500 text-center py-4">{t("selector.noResults")}</p>
			) : (
				<div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
					{filtered.map(a => {
						const id = String(a.id ?? a.name ?? "");
						const sel = id === selectedId;
						return (
							<button key={id} type="button" onClick={() => onSelect(id)}
								className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${sel ? "bg-orange-50 border border-[#FF5A30]/25" : "hover:bg-slate-50 border border-transparent"}`}>
								<div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${sel ? "border-[#FF5A30]" : "border-slate-300"}`}>
									{sel && <div className="w-2 h-2 rounded-full bg-[#FF5A30]" />}
								</div>
								<div className="flex-1 min-w-0">
									<p className={`text-sm font-semibold truncate ${sel ? "text-[#FF5A30]" : "text-slate-900"}`}>{String(a.name ?? "")}</p>
									{a.tour_name && <p className="text-xs text-slate-500 truncate">{String(a.tour_name)}</p>}
								</div>
								{a.genre && <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 shrink-0">{String(a.genre)}</span>}
							</button>
						);
					})}
				</div>
			)}
		</div>
	);
}

function OpportunityPanel({ artist, locale }: { artist: ArtistItem; locale: string }) {
	const t = useTranslations("EOIPage");
	const dateRange = artist.tour_start && artist.tour_end
		? `${new Date(String(artist.tour_start)).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })} – ${new Date(String(artist.tour_end)).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })}`
		: String(artist.tour_window ?? "");
	const feeRange = artist.fee_min != null && artist.fee_max != null
		? `$${Math.round(Number(artist.fee_min) / 1000)}k – $${Math.round(Number(artist.fee_max) / 1000)}k USD` : null;
	const markets = Array.isArray(artist.markets) ? (artist.markets as string[]).join(", ") : String(artist.markets ?? "");
	return (
		<div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-5 space-y-4">
			<div>
				<p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-[#FF5A30] mb-1">{t("tourPanel.heading")}</p>
				<h2 className="text-lg font-(family-name:--font-manrope) font-semibold text-slate-950 leading-tight">{String(artist.tour_name ?? artist.name ?? "")}</h2>
				<p className="mt-0.5 text-sm font-semibold text-slate-500">{String(artist.name ?? "")}</p>
			</div>
			<div className="space-y-2.5">
				{artist.genre && <div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t("tourPanel.genre")}</p><p className="text-sm font-semibold text-slate-800 mt-0.5">{String(artist.genre)}</p></div>}
				{dateRange && <div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t("tourPanel.dates")}</p><p className="text-sm font-semibold text-slate-800 mt-0.5">{dateRange}</p></div>}
				{markets && <div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t("tourPanel.markets")}</p><p className="text-sm font-semibold text-slate-800 mt-0.5">{markets}</p></div>}
				{feeRange && <div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t("tourPanel.fee")}</p><p className="text-sm font-semibold text-slate-800 mt-0.5">{feeRange}</p></div>}
				{artist.region && <div><p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{t("tourPanel.region")}</p><p className="text-sm font-semibold text-slate-800 mt-0.5">{String(artist.region)}</p></div>}
			</div>
		</div>
	);
}

function ReviewRow({ label, value }: { label: string; value?: string | boolean }) {
	if (value === undefined || value === "" || value === false) return null;
	return (
		<div className="flex items-start gap-4 border-b border-slate-100 py-2.5 last:border-none">
			<span className="mt-0.5 w-32 shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</span>
			<span className="text-sm font-semibold text-slate-900">{value === true ? "Yes" : value}</span>
		</div>
	);
}

function EOIPageContent() {
	const t = useTranslations("EOIPage");
	const locale = useLocale();
	const { data: session } = useSession();

	const STEPS = [
		{ label: t("stepper.promoter") },
		{ label: t("stepper.experience") },
		{ label: t("stepper.tour") },
		{ label: t("stepper.venue") },
		{ label: t("stepper.budget") },
		{ label: t("stepper.financing") },
		{ label: t("stepper.declaration") },
	];

	const searchParams = useSearchParams();
	const initialId = searchParams.get("opportunity") ?? searchParams.get("id") ?? null;

	const [selectedId, setSelectedId] = useState<string | null>(initialId);
	const [step, setStep] = useState(0);
	const [userEdits, setUserEdits] = useState<Partial<EOIForm>>({});
	const [errors, setErrors] = useState<Partial<Record<keyof EOIForm | "declaration", string>>>({});

	const { data: artistsQuery, isLoading: loadingOpportunities } = useQuery({
		queryKey: ["artists"],
		queryFn: () => getArtists(),
	});

	const { data: profileQuery } = useQuery({
		queryKey: ["tourstackProfile"],
		queryFn: getTourstackProfile,
	});

	const profileDefaults = useMemo<Partial<EOIForm>>(() => {
		if (!profileQuery?.success || !profileQuery.data) return {};
		const d = profileQuery.data as Record<string, unknown>;
		return {
			companyName: String(d.company_name ?? ""),
			tradingName: String(d.trading_name ?? ""),
			companyType: String(d.company_type ?? ""),
			registrationNumber: String(d.registration_number ?? ""),
			taxId: String(d.tax_id ?? ""),
			primaryAddress: String(d.primary_address ?? ""),
			country: String(d.country ?? ""),
			contactPerson: String(d.contact_person ?? ""),
			jobTitle: String(d.job_title ?? ""),
			contactEmail: String(d.contact_email ?? "") || (session?.user?.email ?? ""),
			phone: String(d.phone ?? ""),
			websiteUrl: String(d.website_url ?? ""),
			instagram: String(d.instagram_handle ?? ""),
			xHandle: String(d.x_handle ?? ""),
			facebook: String(d.facebook_handle ?? ""),
			tiktok: String(d.tiktok_handle ?? ""),
			yearsInBusiness: d.years_in_business != null ? String(d.years_in_business) : "",
			averageEventsYear: d.average_events_year != null ? String(d.average_events_year) : "",
			genresSpecialties: String(d.genres_specialties ?? ""),
			marketsRegions: String(d.markets_regions ?? ""),
			bankName: String(d.bank_name ?? ""),
			bankAccountHolder: String(d.bank_account_holder ?? ""),
			bankAccountNumber: String(d.bank_account_number ?? ""),
			venueCity: String(d.city ?? ""),
			authorizedRepName: String(d.contact_person ?? ""),
			authorizedRepTitle: String(d.job_title ?? ""),
		};
	}, [profileQuery, session]);

	const form: EOIForm = useMemo(() => ({
		...DEFAULT_FORM,
		contactEmail: session?.user?.email ?? "",
		...profileDefaults,
		...userEdits,
	}), [profileDefaults, userEdits, session]);

	const opportunities = artistsQuery?.data ?? [];
	const artist = selectedId
		? (opportunities.find(a => String(a.id ?? a.name ?? "") === selectedId) ?? null)
		: null;

	function set<K extends keyof EOIForm>(key: K, value: EOIForm[K]) {
		setUserEdits(prev => ({ ...prev, [key]: value }));
		if (errors[key]) setErrors(prev => { const n = { ...prev }; delete n[key]; return n; });
	}

	function togglePurpose(item: string) {
		const next = form.financingPurpose.includes(item)
			? form.financingPurpose.filter(x => x !== item)
			: [...form.financingPurpose, item];
		set("financingPurpose", next);
	}

	function handleSelectOpportunity(id: string) {
		setSelectedId(id);
		setStep(0);
		setUserEdits({});
		setErrors({});
	}

	function validateStep(s: number): boolean {
		const e: typeof errors = {};
		if (s === 0) {
			if (!form.companyName.trim()) e.companyName = t("validation.companyNameRequired");
			if (!form.contactPerson.trim()) e.contactPerson = t("validation.contactPersonRequired");
			if (!form.contactEmail.trim()) e.contactEmail = t("validation.contactEmailRequired");
			if (!form.phone.trim()) e.phone = t("validation.phoneRequired");
		}
		if (s === 1) {
			if (!form.yearsInBusiness.trim()) e.yearsInBusiness = t("validation.yearsRequired");
			if (!form.concertsOrganized.trim()) e.concertsOrganized = t("validation.concertsRequired");
			if (!form.largestConcertCapacity.trim()) e.largestConcertCapacity = t("validation.capacityRequired");
			if (!form.averageEventsYear.trim()) e.averageEventsYear = t("validation.averageEventsRequired");
			if (!form.genresSpecialties.trim()) e.genresSpecialties = t("validation.genresRequired");
			if (!form.marketsRegions.trim()) e.marketsRegions = t("validation.marketsRequired");
		}
		if (s === 2) {
			if (!form.tourName.trim()) e.tourName = t("validation.tourNameRequired");
			if (!form.tourManager.trim()) e.tourManager = t("validation.tourManagerRequired");
			if (!form.proposedCities.trim()) e.proposedCities = t("validation.proposedCitiesRequired");
			if (!form.preferredDates.trim()) e.preferredDates = t("validation.preferredDatesRequired");
		}
		if (s === 3) {
			if (!form.venueName.trim()) e.venueName = t("validation.venueNameRequired");
			if (!form.venueCity.trim()) e.venueCity = t("validation.venueCityRequired");
			if (!form.venueCapacity.trim()) e.venueCapacity = t("validation.venueCapacityRequired");
			if (!form.venueType) e.venueType = t("validation.venueTypeRequired");
			if (!form.venueStatus) e.venueStatus = t("validation.venueStatusRequired");
			if (!form.ticketingPartner.trim()) e.ticketingPartner = t("validation.ticketingPartnerRequired");
			if (!form.expectedTicketSales.trim()) e.expectedTicketSales = t("validation.expectedSalesRequired");
			if (!form.expectedOccupancy.trim()) e.expectedOccupancy = t("validation.occupancyRequired");
		}
		if (s === 4) {
			if (!form.artistFee.trim()) e.artistFee = t("validation.artistFeeRequired");
			if (!form.productionCosts.trim()) e.productionCosts = t("validation.productionCostsRequired");
			if (!form.marketingCosts.trim()) e.marketingCosts = t("validation.marketingCostsRequired");
			if (!form.operationsCosts.trim()) e.operationsCosts = t("validation.operationsCostsRequired");
			if (!form.totalBudget.trim()) e.totalBudget = t("validation.totalBudgetRequired");
		}
		if (s === 5) {
			if (!form.bankName.trim()) e.bankName = t("validation.bankNameRequired");
			if (!form.bankAccountHolder.trim()) e.bankAccountHolder = t("validation.bankHolderRequired");
			if (!form.bankAccountNumber.trim()) e.bankAccountNumber = t("validation.bankNumberRequired");
			if (!form.insuranceAcknowledged) e.insuranceAcknowledged = t("validation.insuranceAcknowledgedRequired");
		}
		if (s === 6) {
			if (!form.authorizedRepName.trim()) e.authorizedRepName = t("validation.authorizedRepRequired");
			if (!form.authorizedRepTitle.trim()) e.authorizedRepTitle = t("validation.authorizedTitleRequired");
			if (!form.declarationConfirmed) e.declaration = t("validation.declarationRequired");
		}
		setErrors(e);
		return Object.keys(e).length === 0;
	}

	const submitMutation = useMutation({ mutationFn: createEOI });
	const submitted = submitMutation.isSuccess && submitMutation.data?.success;
	const submitting = submitMutation.isPending;
	const submitError = submitMutation.error
		? submitMutation.error instanceof Error ? submitMutation.error.message : t("submitError")
		: submitMutation.data && !submitMutation.data.success ? (submitMutation.data.error ?? t("submitError")) : null;

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (step < STEPS.length - 1) {
			if (!validateStep(step)) return;
			setStep(s => s + 1);
			return;
		}
		if (!validateStep(step)) return;
		if (!artist) return;
		submitMutation.mutate({
			artistId: artist.id,
			city: form.venueCity || form.proposedCities.split(",")[0]?.trim() || "",
			venue: form.venueName || undefined,
			capacity: form.venueCapacity ? Number(form.venueCapacity.replace(/,/g, "")) : undefined,
			budget: form.totalBudget ? Number(form.totalBudget.replace(/,/g, "")) : undefined,
			audience: form.expectedTicketSales || undefined,
			fundingType: form.needsFinancing ? (form.financingStructure || "required") : undefined,
			notes: buildNotes(form),
		});
	}

	const markets = artist
		? Array.isArray(artist.markets) ? (artist.markets as string[]).join(", ") : String(artist.markets ?? "")
		: "";

	if (submitted && artist) {
		return (
			<main className="flex-1 lg:ml-64 bg-surface p-6 md:p-12">
				<div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
					<div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm md:p-12">
						<div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
							<span className="material-symbols-outlined text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
						</div>
						<h1 className="text-3xl font-semibold tracking-tight text-slate-950 font-(family-name:--font-manrope)">{t("success.title")}</h1>
						<p className="mt-4 text-sm leading-6 text-slate-600">{t("success.description", { artist: String(artist.name ?? "") })}</p>
						<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
							<Link href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-[#FF5A30] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90">
								{t("success.viewDashboard")}
							</Link>
							<Link href="/discovery" className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
								{t("success.backToDiscovery")}
							</Link>
						</div>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="flex-1 lg:ml-64 bg-surface p-6 md:p-10">
			<div className="w-full">
				<header className="mb-8">
					<span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-[#FF5A30]">{t("hero.platform")}</span>
					<h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl font-(family-name:--font-manrope)">{t("hero.title")}</h1>
					<p className="mt-3 text-base leading-relaxed text-slate-600">{t("hero.description")}</p>
				</header>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
					{/* Left: selector + tour panel */}
					<div data-tour="eoi-selector" className="lg:col-span-4 space-y-4">
						<OpportunitySelector opportunities={opportunities} loading={loadingOpportunities} selectedId={selectedId} onSelect={handleSelectOpportunity} />
						{artist && <OpportunityPanel artist={artist} locale={locale} />}
					</div>

					{/* Right: form */}
					<div data-tour="eoi-form" className="lg:col-span-8">
						{!artist ? (
							<div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 p-12 text-center">
								<span className="material-symbols-outlined text-5xl text-slate-300 block mb-4">confirmation_number</span>
								<p className="text-base font-semibold text-slate-400">{t("selector.selectPrompt")}</p>
							</div>
						) : (
							<section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
								<Stepper current={step} steps={STEPS} />

								<form noValidate autoComplete="off" onSubmit={handleSubmit} className="space-y-8">
									{/* ── STEP 1: Promoter Information ── */}
									{step === 0 && (
										<div className="grid gap-5 sm:grid-cols-2">
											<SectionHeading>{t("form.step1.companySection")}</SectionHeading>
											<div className="sm:col-span-2">
												<FLabel htmlFor="s1-company" required>{t("form.step1.companyName.label")}</FLabel>
												<input id="s1-company" type="text" placeholder={t("form.step1.companyName.placeholder")} value={form.companyName} onChange={e => set("companyName", e.target.value)} className={`${ic} ${errors.companyName ? icErr : ""}`} aria-invalid={!!errors.companyName} />
												<FError msg={errors.companyName} />
											</div>
											<div>
												<FLabel htmlFor="s1-trading">{t("form.step1.tradingName.label")}</FLabel>
												<input id="s1-trading" type="text" placeholder={t("form.step1.tradingName.placeholder")} value={form.tradingName} onChange={e => set("tradingName", e.target.value)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s1-type">{t("form.step1.companyType.label")}</FLabel>
												<input id="s1-type" type="text" placeholder={t("form.step1.companyType.placeholder")} value={form.companyType} onChange={e => set("companyType", e.target.value)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s1-rc">{t("form.step1.registrationNumber.label")}</FLabel>
												<input id="s1-rc" type="text" placeholder={t("form.step1.registrationNumber.placeholder")} value={form.registrationNumber} onChange={e => set("registrationNumber", e.target.value)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s1-tax">{t("form.step1.taxId.label")}</FLabel>
												<input id="s1-tax" type="text" placeholder={t("form.step1.taxId.placeholder")} value={form.taxId} onChange={e => set("taxId", e.target.value)} className={ic} />
											</div>
											<div className="sm:col-span-2">
												<FLabel htmlFor="s1-addr">{t("form.step1.primaryAddress.label")}</FLabel>
												<input id="s1-addr" type="text" placeholder={t("form.step1.primaryAddress.placeholder")} value={form.primaryAddress} onChange={e => set("primaryAddress", e.target.value)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s1-country">{t("form.step1.country.label")}</FLabel>
												<input id="s1-country" type="text" placeholder={t("form.step1.country.placeholder")} value={form.country} onChange={e => set("country", e.target.value)} className={ic} />
											</div>

											<SectionHeading>{t("form.step1.contactSection")}</SectionHeading>
											<div>
												<FLabel htmlFor="s1-name" required>{t("form.step1.contactPerson.label")}</FLabel>
												<input id="s1-name" type="text" autoComplete="name" placeholder={t("form.step1.contactPerson.placeholder")} value={form.contactPerson} onChange={e => set("contactPerson", e.target.value)} className={`${ic} ${errors.contactPerson ? icErr : ""}`} aria-invalid={!!errors.contactPerson} />
												<FError msg={errors.contactPerson} />
											</div>
											<div>
												<FLabel htmlFor="s1-title">{t("form.step1.jobTitle.label")}</FLabel>
												<input id="s1-title" type="text" placeholder={t("form.step1.jobTitle.placeholder")} value={form.jobTitle} onChange={e => set("jobTitle", e.target.value)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s1-email" required>{t("form.step1.contactEmail.label")}</FLabel>
												<input id="s1-email" type="email" autoComplete="email" placeholder={t("form.step1.contactEmail.placeholder")} value={form.contactEmail} onChange={e => set("contactEmail", e.target.value)} className={`${ic} ${errors.contactEmail ? icErr : ""}`} aria-invalid={!!errors.contactEmail} />
												<FError msg={errors.contactEmail} />
											</div>
											<div>
												<FLabel htmlFor="s1-phone" required>{t("form.step1.phone.label")}</FLabel>
												<input id="s1-phone" type="tel" autoComplete="tel" placeholder={t("form.step1.phone.placeholder")} value={form.phone} onChange={e => set("phone", e.target.value)} className={`${ic} ${errors.phone ? icErr : ""}`} aria-invalid={!!errors.phone} />
												<FError msg={errors.phone} />
											</div>

											<SectionHeading>{t("form.step1.socialSection")}</SectionHeading>
											<div className="sm:col-span-2">
												<FLabel htmlFor="s1-web">{t("form.step1.websiteUrl.label")}</FLabel>
												<input id="s1-web" type="url" placeholder={t("form.step1.websiteUrl.placeholder")} value={form.websiteUrl} onChange={e => set("websiteUrl", e.target.value)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s1-ig">{t("form.step1.instagram.label")}</FLabel>
												<input id="s1-ig" type="text" placeholder={t("form.step1.instagram.placeholder")} value={form.instagram} onChange={e => set("instagram", e.target.value)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s1-x">{t("form.step1.xHandle.label")}</FLabel>
												<input id="s1-x" type="text" placeholder={t("form.step1.xHandle.placeholder")} value={form.xHandle} onChange={e => set("xHandle", e.target.value)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s1-fb">{t("form.step1.facebook.label")}</FLabel>
												<input id="s1-fb" type="text" placeholder={t("form.step1.facebook.placeholder")} value={form.facebook} onChange={e => set("facebook", e.target.value)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s1-tt">{t("form.step1.tiktok.label")}</FLabel>
												<input id="s1-tt" type="text" placeholder={t("form.step1.tiktok.placeholder")} value={form.tiktok} onChange={e => set("tiktok", e.target.value)} className={ic} />
											</div>
										</div>
									)}

									{/* ── STEP 2: Promoter Experience ── */}
									{step === 1 && (
										<div className="grid gap-5 sm:grid-cols-2">
											<div>
												<FLabel htmlFor="s2-years" required>{t("form.step2.yearsInBusiness.label")}</FLabel>
												<input id="s2-years" type="number" inputMode="numeric" placeholder={t("form.step2.yearsInBusiness.placeholder")} value={form.yearsInBusiness} onChange={e => set("yearsInBusiness", e.target.value)} className={`${ic} ${errors.yearsInBusiness ? icErr : ""}`} aria-invalid={!!errors.yearsInBusiness} />
												<FError msg={errors.yearsInBusiness} />
											</div>
											<div>
												<FLabel htmlFor="s2-concerts" required>{t("form.step2.concertsOrganized.label")}</FLabel>
												<input id="s2-concerts" type="number" inputMode="numeric" placeholder={t("form.step2.concertsOrganized.placeholder")} value={form.concertsOrganized} onChange={e => set("concertsOrganized", e.target.value)} className={`${ic} ${errors.concertsOrganized ? icErr : ""}`} aria-invalid={!!errors.concertsOrganized} />
												<FError msg={errors.concertsOrganized} />
											</div>
											<div>
												<FLabel htmlFor="s2-largest" required>{t("form.step2.largestConcertCapacity.label")}</FLabel>
												<input id="s2-largest" type="text" inputMode="numeric" placeholder={t("form.step2.largestConcertCapacity.placeholder")} value={form.largestConcertCapacity} onChange={e => set("largestConcertCapacity", e.target.value)} className={`${ic} ${errors.largestConcertCapacity ? icErr : ""}`} aria-invalid={!!errors.largestConcertCapacity} />
												<FError msg={errors.largestConcertCapacity} />
											</div>
											<div>
												<FLabel htmlFor="s2-avg" required>{t("form.step2.averageEventsYear.label")}</FLabel>
												<input id="s2-avg" type="number" inputMode="numeric" placeholder={t("form.step2.averageEventsYear.placeholder")} value={form.averageEventsYear} onChange={e => set("averageEventsYear", e.target.value)} className={`${ic} ${errors.averageEventsYear ? icErr : ""}`} aria-invalid={!!errors.averageEventsYear} />
												<FError msg={errors.averageEventsYear} />
											</div>
											<div className="sm:col-span-2">
												<FLabel htmlFor="s2-genres" required>{t("form.step2.genresSpecialties.label")}</FLabel>
												<input id="s2-genres" type="text" placeholder={t("form.step2.genresSpecialties.placeholder")} value={form.genresSpecialties} onChange={e => set("genresSpecialties", e.target.value)} className={`${ic} ${errors.genresSpecialties ? icErr : ""}`} aria-invalid={!!errors.genresSpecialties} />
												<FError msg={errors.genresSpecialties} />
											</div>
											<div className="sm:col-span-2">
												<FLabel htmlFor="s2-markets" required>{t("form.step2.marketsRegions.label")}</FLabel>
												<input id="s2-markets" type="text" placeholder={t("form.step2.marketsRegions.placeholder")} value={form.marketsRegions} onChange={e => set("marketsRegions", e.target.value)} className={`${ic} ${errors.marketsRegions ? icErr : ""}`} aria-invalid={!!errors.marketsRegions} />
												<FError msg={errors.marketsRegions} />
											</div>
										</div>
									)}

									{/* ── STEP 3: Tour Details & Artist Info ── */}
									{step === 2 && (
										<div className="grid gap-5 sm:grid-cols-2">
											<SectionHeading>{t("form.step3.tourSection")}</SectionHeading>
											<div className="sm:col-span-2">
												<FLabel htmlFor="s3-tour" required>{t("form.step3.tourName.label")}</FLabel>
												<input id="s3-tour" type="text" placeholder={t("form.step3.tourName.placeholder")} value={form.tourName} onChange={e => set("tourName", e.target.value)} className={`${ic} ${errors.tourName ? icErr : ""}`} aria-invalid={!!errors.tourName} />
												<FError msg={errors.tourName} />
											</div>
											<div>
												<FLabel htmlFor="s3-mgr" required>{t("form.step3.tourManager.label")}</FLabel>
												<input id="s3-mgr" type="text" placeholder={t("form.step3.tourManager.placeholder")} value={form.tourManager} onChange={e => set("tourManager", e.target.value)} className={`${ic} ${errors.tourManager ? icErr : ""}`} aria-invalid={!!errors.tourManager} />
												<FError msg={errors.tourManager} />
											</div>
											<div>
												<FLabel htmlFor="s3-mgr-email">{t("form.step3.tourManagerEmail.label")}</FLabel>
												<input id="s3-mgr-email" type="email" placeholder={t("form.step3.tourManagerEmail.placeholder")} value={form.tourManagerEmail} onChange={e => set("tourManagerEmail", e.target.value)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s3-mgr-phone">{t("form.step3.tourManagerPhone.label")}</FLabel>
												<input id="s3-mgr-phone" type="tel" placeholder={t("form.step3.tourManagerPhone.placeholder")} value={form.tourManagerPhone} onChange={e => set("tourManagerPhone", e.target.value)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s3-cities" required>{t("form.step3.proposedCities.label")}</FLabel>
												<input id="s3-cities" type="text" placeholder={t("form.step3.proposedCities.placeholder")} value={form.proposedCities} onChange={e => set("proposedCities", e.target.value)} className={`${ic} ${errors.proposedCities ? icErr : ""}`} aria-invalid={!!errors.proposedCities} />
												<FError msg={errors.proposedCities} />
											</div>
											<div>
												<FLabel htmlFor="s3-dates" required>{t("form.step3.preferredDates.label")}</FLabel>
												<input id="s3-dates" type="text" placeholder={t("form.step3.preferredDates.placeholder")} value={form.preferredDates} onChange={e => set("preferredDates", e.target.value)} className={`${ic} ${errors.preferredDates ? icErr : ""}`} aria-invalid={!!errors.preferredDates} />
												<FError msg={errors.preferredDates} />
											</div>
											<div className="sm:col-span-2">
												<div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
													<p className="text-sm font-semibold text-slate-900">{t("form.step3.artistConfirmed.label")}</p>
													<ToggleGroup value={form.artistConfirmed} onChange={v => set("artistConfirmed", v)} options={[t("form.step3.artistConfirmed.pending"), t("form.step3.artistConfirmed.confirmed")]} />
												</div>
											</div>

											<SectionHeading>{t("form.step3.artistSection")}</SectionHeading>
											<div>
												<FLabel htmlFor="s3-spotify">{t("form.step3.spotifyListeners.label")}</FLabel>
												<input id="s3-spotify" type="text" inputMode="numeric" placeholder={t("form.step3.spotifyListeners.placeholder")} value={form.spotifyListeners} onChange={e => set("spotifyListeners", e.target.value)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s3-yt">{t("form.step3.youtubeSubscribers.label")}</FLabel>
												<input id="s3-yt" type="text" inputMode="numeric" placeholder={t("form.step3.youtubeSubscribers.placeholder")} value={form.youtubeSubscribers} onChange={e => set("youtubeSubscribers", e.target.value)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s3-aig">{t("form.step3.artistInstagram.label")}</FLabel>
												<input id="s3-aig" type="text" inputMode="numeric" placeholder={t("form.step3.artistInstagram.placeholder")} value={form.artistInstagram} onChange={e => set("artistInstagram", e.target.value)} className={ic} />
											</div>
										</div>
									)}

									{/* ── STEP 4: Venue & Ticketing ── */}
									{step === 3 && (
										<div className="grid gap-5 sm:grid-cols-2">
											<SectionHeading>{t("form.step4.venueSection")}</SectionHeading>
											<div>
												<FLabel htmlFor="s4-vname" required>{t("form.step4.venueName.label")}</FLabel>
												<input id="s4-vname" type="text" placeholder={t("form.step4.venueName.placeholder")} value={form.venueName} onChange={e => set("venueName", e.target.value)} className={`${ic} ${errors.venueName ? icErr : ""}`} aria-invalid={!!errors.venueName} />
												<FError msg={errors.venueName} />
											</div>
											<div>
												<FLabel htmlFor="s4-vcity" required>{t("form.step4.venueCity.label")}</FLabel>
												<input id="s4-vcity" type="text" placeholder={t("form.step4.venueCity.placeholder")} value={form.venueCity} onChange={e => set("venueCity", e.target.value)} className={`${ic} ${errors.venueCity ? icErr : ""}`} aria-invalid={!!errors.venueCity} />
												<FError msg={errors.venueCity} />
											</div>
											<div>
												<FLabel htmlFor="s4-vcap" required>{t("form.step4.venueCapacity.label")}</FLabel>
												<input id="s4-vcap" type="text" inputMode="numeric" placeholder={t("form.step4.venueCapacity.placeholder")} value={form.venueCapacity} onChange={e => set("venueCapacity", e.target.value)} className={`${ic} ${errors.venueCapacity ? icErr : ""}`} aria-invalid={!!errors.venueCapacity} />
												<FError msg={errors.venueCapacity} />
											</div>
											<div>
												<FLabel htmlFor="s4-vrent">{t("form.step4.venueRentalCost.label")}</FLabel>
												<input id="s4-vrent" type="text" inputMode="numeric" placeholder={t("form.step4.venueRentalCost.placeholder")} value={form.venueRentalCost} onChange={e => set("venueRentalCost", e.target.value)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s4-vtype" required>{t("form.step4.venueType.label")}</FLabel>
												<div className="relative">
													<select id="s4-vtype" value={form.venueType} onChange={e => set("venueType", e.target.value)} className={`${ic} appearance-none pr-9 ${errors.venueType ? icErr : ""}`} aria-invalid={!!errors.venueType}>
														<option value="">—</option>
														<option value="indoor">{t("form.step4.venueType.indoor")}</option>
														<option value="outdoor">{t("form.step4.venueType.outdoor")}</option>
														<option value="hybrid">{t("form.step4.venueType.hybrid")}</option>
													</select>
													<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-lg">expand_more</span>
												</div>
												<FError msg={errors.venueType} />
											</div>
											<div>
												<FLabel htmlFor="s4-vstatus" required>{t("form.step4.venueStatus.label")}</FLabel>
												<div className="relative">
													<select id="s4-vstatus" value={form.venueStatus} onChange={e => set("venueStatus", e.target.value)} className={`${ic} appearance-none pr-9 ${errors.venueStatus ? icErr : ""}`} aria-invalid={!!errors.venueStatus}>
														<option value="">—</option>
														<option value="confirmed">{t("form.step4.venueStatus.confirmed")}</option>
														<option value="shortlisted">{t("form.step4.venueStatus.shortlisted")}</option>
														<option value="pending">{t("form.step4.venueStatus.pending")}</option>
													</select>
													<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-lg">expand_more</span>
												</div>
												<FError msg={errors.venueStatus} />
											</div>

											<SectionHeading>{t("form.step4.ticketingSection")}</SectionHeading>
											<div>
												<FLabel htmlFor="s4-tpart" required>{t("form.step4.ticketingPartner.label")}</FLabel>
												<input id="s4-tpart" type="text" placeholder={t("form.step4.ticketingPartner.placeholder")} value={form.ticketingPartner} onChange={e => set("ticketingPartner", e.target.value)} className={`${ic} ${errors.ticketingPartner ? icErr : ""}`} aria-invalid={!!errors.ticketingPartner} />
												<FError msg={errors.ticketingPartner} />
											</div>
											<div>
												<FLabel htmlFor="s4-tsales" required>{t("form.step4.expectedTicketSales.label")}</FLabel>
												<input id="s4-tsales" type="text" inputMode="numeric" placeholder={t("form.step4.expectedTicketSales.placeholder")} value={form.expectedTicketSales} onChange={e => set("expectedTicketSales", e.target.value)} className={`${ic} ${errors.expectedTicketSales ? icErr : ""}`} aria-invalid={!!errors.expectedTicketSales} />
												<FError msg={errors.expectedTicketSales} />
											</div>
											<div>
												<FLabel htmlFor="s4-occ" required>{t("form.step4.expectedOccupancy.label")}</FLabel>
												<input id="s4-occ" type="text" inputMode="numeric" placeholder={t("form.step4.expectedOccupancy.placeholder")} value={form.expectedOccupancy} onChange={e => set("expectedOccupancy", e.target.value)} className={`${ic} ${errors.expectedOccupancy ? icErr : ""}`} aria-invalid={!!errors.expectedOccupancy} />
												<FError msg={errors.expectedOccupancy} />
											</div>
										</div>
									)}

									{/* ── STEP 5: Budget & Revenue ── */}
									{step === 4 && (
										<div className="grid gap-5 sm:grid-cols-2">
											<SectionHeading>{t("form.step5.budgetSection")}</SectionHeading>
											<div className="col-span-full">
												<p className="text-xs text-slate-500 mb-4">{t("form.step5.budgetHint")}</p>
											</div>
											<div>
												<FLabel htmlFor="s5-afee" required>{t("form.step5.artistFee.label")}</FLabel>
												<input id="s5-afee" type="text" inputMode="numeric" placeholder={t("form.step5.artistFee.placeholder")} value={form.artistFee} onChange={e => set("artistFee", e.target.value)} className={`${ic} ${errors.artistFee ? icErr : ""}`} aria-invalid={!!errors.artistFee} />
												<FError msg={errors.artistFee} />
											</div>
											<div>
												<FLabel htmlFor="s5-prod" required>{t("form.step5.productionCosts.label")}</FLabel>
												<input id="s5-prod" type="text" inputMode="numeric" placeholder={t("form.step5.productionCosts.placeholder")} value={form.productionCosts} onChange={e => set("productionCosts", e.target.value)} className={`${ic} ${errors.productionCosts ? icErr : ""}`} aria-invalid={!!errors.productionCosts} />
												<FError msg={errors.productionCosts} />
											</div>
											<div>
												<FLabel htmlFor="s5-mkt" required>{t("form.step5.marketingCosts.label")}</FLabel>
												<input id="s5-mkt" type="text" inputMode="numeric" placeholder={t("form.step5.marketingCosts.placeholder")} value={form.marketingCosts} onChange={e => set("marketingCosts", e.target.value)} className={`${ic} ${errors.marketingCosts ? icErr : ""}`} aria-invalid={!!errors.marketingCosts} />
												<FError msg={errors.marketingCosts} />
											</div>
											<div>
												<FLabel htmlFor="s5-ops" required>{t("form.step5.operationsCosts.label")}</FLabel>
												<input id="s5-ops" type="text" inputMode="numeric" placeholder={t("form.step5.operationsCosts.placeholder")} value={form.operationsCosts} onChange={e => set("operationsCosts", e.target.value)} className={`${ic} ${errors.operationsCosts ? icErr : ""}`} aria-invalid={!!errors.operationsCosts} />
												<FError msg={errors.operationsCosts} />
											</div>
											<div className="sm:col-span-2">
												<FLabel htmlFor="s5-total" required>{t("form.step5.totalBudget.label")}</FLabel>
												<input id="s5-total" type="text" inputMode="numeric" placeholder={t("form.step5.totalBudget.placeholder")} value={form.totalBudget} onChange={e => set("totalBudget", e.target.value)} className={`${ic} ${errors.totalBudget ? icErr : ""}`} aria-invalid={!!errors.totalBudget} />
												<FError msg={errors.totalBudget} />
											</div>

											<SectionHeading>{t("form.step5.revenueSection")}</SectionHeading>
											<div>
												<FLabel htmlFor="s5-trev">{t("form.step5.ticketingRevenue.label")}</FLabel>
												<input id="s5-trev" type="text" inputMode="numeric" placeholder={t("form.step5.ticketingRevenue.placeholder")} value={form.ticketingRevenue} onChange={e => set("ticketingRevenue", e.target.value)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s5-srev">{t("form.step5.sponsorshipRevenue.label")}</FLabel>
												<input id="s5-srev" type="text" inputMode="numeric" placeholder={t("form.step5.sponsorshipRevenue.placeholder")} value={form.sponsorshipRevenue} onChange={e => set("sponsorshipRevenue", e.target.value)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s5-orev">{t("form.step5.otherRevenue.label")}</FLabel>
												<input id="s5-orev" type="text" inputMode="numeric" placeholder={t("form.step5.otherRevenue.placeholder")} value={form.otherRevenue} onChange={e => set("otherRevenue", e.target.value)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s5-trev2">{t("form.step5.totalRevenue.label")}</FLabel>
												<input id="s5-trev2" type="text" inputMode="numeric" placeholder={t("form.step5.totalRevenue.placeholder")} value={form.totalRevenue} onChange={e => set("totalRevenue", e.target.value)} className={ic} />
											</div>
											<div className="sm:col-span-2">
												<FLabel htmlFor="s5-net">{t("form.step5.netProfit.label")}</FLabel>
												<input id="s5-net" type="text" inputMode="numeric" placeholder={t("form.step5.netProfit.placeholder")} value={form.netProfit} onChange={e => set("netProfit", e.target.value)} className={ic} />
											</div>
										</div>
									)}

									{/* ── STEP 6: Risk, Financing & Banking ── */}
									{step === 5 && (
										<div className="grid gap-5 sm:grid-cols-2">
											<SectionHeading>{t("form.step6.riskSection")}</SectionHeading>
											<div className="sm:col-span-2">
												<div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
													<p className="text-sm font-semibold text-slate-900">{t("form.step6.hasCancellationHistory")}</p>
													<ToggleGroup value={form.hasCancellationHistory} onChange={v => set("hasCancellationHistory", v)} options={[t("form.no"), t("form.yes")]} />
												</div>
											</div>
											<div className="sm:col-span-2">
												<FLabel htmlFor="s6-sec">{t("form.step6.securityPlan.label")}</FLabel>
												<textarea id="s6-sec" placeholder={t("form.step6.securityPlan.placeholder")} value={form.securityPlan} onChange={e => set("securityPlan", e.target.value)} className={sc} />
											</div>

											<SectionHeading>{t("form.step6.insuranceSection")}</SectionHeading>
											<div className="sm:col-span-2">
												<div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
													<p className="text-sm font-semibold text-slate-900">{t("form.step6.hasInsurance")}</p>
													<ToggleGroup value={form.hasInsurance} onChange={v => set("hasInsurance", v)} options={[t("form.no"), t("form.yes")]} />
												</div>
											</div>
											<div className={`sm:col-span-2 grid sm:grid-cols-2 gap-5 transition-all ${form.hasInsurance ? "" : "opacity-40 pointer-events-none select-none"}`} aria-hidden={!form.hasInsurance}>
												<div>
													<FLabel htmlFor="s6-ins-prov">{t("form.step6.insuranceProvider.label")}</FLabel>
													<input id="s6-ins-prov" type="text" tabIndex={form.hasInsurance ? 0 : -1} placeholder={t("form.step6.insuranceProvider.placeholder")} value={form.insuranceProvider} onChange={e => set("insuranceProvider", e.target.value)} className={ic} />
												</div>
												<div>
													<FLabel htmlFor="s6-ins-type">{t("form.step6.insuranceType.label")}</FLabel>
													<div className="relative">
														<select id="s6-ins-type" tabIndex={form.hasInsurance ? 0 : -1} value={form.insuranceType} onChange={e => set("insuranceType", e.target.value)} className={`${ic} appearance-none pr-9`}>
															<option value="">—</option>
															<option value="cancellation">{t("form.step6.insuranceType.cancellation")}</option>
															<option value="liability">{t("form.step6.insuranceType.liability")}</option>
															<option value="comprehensive">{t("form.step6.insuranceType.comprehensive")}</option>
															<option value="workforce">{t("form.step6.insuranceType.workforce")}</option>
														</select>
														<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-lg">expand_more</span>
													</div>
												</div>
											</div>
											<div className="sm:col-span-2">
												<label className={`flex items-start gap-3 cursor-pointer rounded-2xl border px-5 py-4 ${errors.insuranceAcknowledged ? "border-rose-300 bg-rose-50" : "border-amber-200 bg-amber-50/40"}`}>
													<input type="checkbox" className="sr-only" checked={form.insuranceAcknowledged} onChange={e => { set("insuranceAcknowledged", e.target.checked); if (errors.insuranceAcknowledged) setErrors(p => { const n = { ...p }; delete n.insuranceAcknowledged; return n; }); }} />
													<div className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center ${form.insuranceAcknowledged ? "bg-amber-500 border-amber-500" : errors.insuranceAcknowledged ? "border-rose-400" : "border-amber-400"}`}>
														{form.insuranceAcknowledged && <span className="material-symbols-outlined text-white text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
													</div>
													<span className="text-sm font-semibold text-slate-800">{t("form.step6.insuranceAcknowledgmentText")}</span>
												</label>
												<FError msg={errors.insuranceAcknowledged} />
											</div>

											<SectionHeading>{t("form.step6.financingSection")}</SectionHeading>
											<div className="sm:col-span-2">
												<div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4">
													<p className="text-sm font-semibold text-slate-900">{t("form.step6.needsFinancing")}</p>
													<ToggleGroup value={form.needsFinancing} onChange={v => set("needsFinancing", v)} options={[t("form.no"), t("form.yes")]} />
												</div>
											</div>
											<div className={`sm:col-span-2 grid sm:grid-cols-2 gap-5 transition-all ${form.needsFinancing ? "" : "opacity-40 pointer-events-none select-none"}`} aria-hidden={!form.needsFinancing}>
												<div>
													<FLabel htmlFor="s6-famount">{t("form.step6.financingAmount.label")}</FLabel>
													<input id="s6-famount" type="text" inputMode="numeric" tabIndex={form.needsFinancing ? 0 : -1} placeholder={t("form.step6.financingAmount.placeholder")} value={form.financingAmount} onChange={e => set("financingAmount", e.target.value)} className={ic} />
												</div>
												<div>
													<FLabel htmlFor="s6-fstruct">{t("form.step6.financingStructure.label")}</FLabel>
													<div className="relative">
														<select id="s6-fstruct" tabIndex={form.needsFinancing ? 0 : -1} value={form.financingStructure} onChange={e => set("financingStructure", e.target.value)} className={`${ic} appearance-none pr-9`}>
															<option value="">—</option>
															<option value="loan">{t("form.step6.financingStructure.loan")}</option>
															<option value="revShare">{t("form.step6.financingStructure.revShare")}</option>
															<option value="equity">{t("form.step6.financingStructure.equity")}</option>
															<option value="advance">{t("form.step6.financingStructure.advance")}</option>
														</select>
														<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 text-lg">expand_more</span>
													</div>
												</div>
												<div className="sm:col-span-2">
													<p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">{t("form.step6.financingPurpose.label")}</p>
													<div className="grid sm:grid-cols-3 gap-2">
														{(["artistFee", "production", "marketing", "operations", "other"] as const).map(key => (
															<label key={key} className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 cursor-pointer transition ${form.financingPurpose.includes(key) ? "border-[#FF5A30]/30 bg-orange-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"}`}>
																<input type="checkbox" className="sr-only" tabIndex={form.needsFinancing ? 0 : -1} checked={form.financingPurpose.includes(key)} onChange={() => togglePurpose(key)} />
																<div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center ${form.financingPurpose.includes(key) ? "bg-[#FF5A30] border-[#FF5A30]" : "border-slate-300"}`}>
																	{form.financingPurpose.includes(key) && <span className="material-symbols-outlined text-white text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
																</div>
																<span className="text-xs font-semibold text-slate-700">{t(`form.step6.financingPurpose.${key}`)}</span>
															</label>
														))}
													</div>
												</div>
											</div>

											<SectionHeading>{t("form.step6.bankingSection")}</SectionHeading>
											<div>
												<FLabel htmlFor="s6-bname" required>{t("form.step6.bankName.label")}</FLabel>
												<input id="s6-bname" type="text" placeholder={t("form.step6.bankName.placeholder")} value={form.bankName} onChange={e => set("bankName", e.target.value)} className={`${ic} ${errors.bankName ? icErr : ""}`} aria-invalid={!!errors.bankName} />
												<FError msg={errors.bankName} />
											</div>
											<div>
												<FLabel htmlFor="s6-bholder" required>{t("form.step6.bankAccountHolder.label")}</FLabel>
												<input id="s6-bholder" type="text" placeholder={t("form.step6.bankAccountHolder.placeholder")} value={form.bankAccountHolder} onChange={e => set("bankAccountHolder", e.target.value)} className={`${ic} ${errors.bankAccountHolder ? icErr : ""}`} aria-invalid={!!errors.bankAccountHolder} />
												<FError msg={errors.bankAccountHolder} />
											</div>
											<div>
												<FLabel htmlFor="s6-bnum" required>{t("form.step6.bankAccountNumber.label")}</FLabel>
												<input id="s6-bnum" type="text" inputMode="numeric" placeholder={t("form.step6.bankAccountNumber.placeholder")} value={form.bankAccountNumber} onChange={e => set("bankAccountNumber", e.target.value)} className={`${ic} ${errors.bankAccountNumber ? icErr : ""}`} aria-invalid={!!errors.bankAccountNumber} />
												<FError msg={errors.bankAccountNumber} />
											</div>
											<div>
												<FLabel htmlFor="s6-bvn">{t("form.step6.bvnOrRc.label")}</FLabel>
												<input id="s6-bvn" type="text" placeholder={t("form.step6.bvnOrRc.placeholder")} value={form.bvnOrRc} onChange={e => set("bvnOrRc", e.target.value)} className={ic} />
											</div>
										</div>
									)}

									{/* ── STEP 7: Documents & Declaration ── */}
									{step === 6 && (
										<div className="space-y-6">
											{/* Documents */}
											<div>
												<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF5A30] mb-3">{t("form.step7.documentsSection")}</p>
												<p className="text-xs text-slate-500 mb-4">{t("form.step7.documentsNote")}</p>
												<div className="space-y-2.5">
													{(["hasCACDocuments", "hasFinancialStatements", "hasTourDocs"] as const).map(key => (
														<label key={key} className={`flex items-center gap-3 rounded-2xl border px-5 py-4 cursor-pointer transition ${form[key] ? "border-emerald-300 bg-emerald-50" : "border-slate-200 bg-slate-50 hover:bg-slate-100"}`}>
															<input type="checkbox" className="sr-only" checked={form[key]} onChange={e => set(key, e.target.checked)} />
															<div className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center ${form[key] ? "bg-emerald-500 border-emerald-500" : "border-slate-300"}`}>
																{form[key] && <span className="material-symbols-outlined text-white text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
															</div>
															<span className="text-sm font-semibold text-slate-800">{t(`form.step7.${key}`)}</span>
														</label>
													))}
												</div>
											</div>

											{/* Review summary */}
											<div>
												<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF5A30] mb-3">{t("form.step7.reviewSection")}</p>
												<div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 divide-y divide-slate-100">
													<ReviewRow label={t("review.artist")} value={String(artist.name ?? "")} />
													<ReviewRow label={t("review.tour")} value={String(artist.tour_name ?? "")} />
													<ReviewRow label={t("review.markets")} value={markets} />
													<ReviewRow label={t("review.company")} value={form.companyName} />
													<ReviewRow label={t("review.contact")} value={form.contactPerson} />
													<ReviewRow label={t("review.email")} value={form.contactEmail} />
													<ReviewRow label={t("review.phone")} value={form.phone} />
													<ReviewRow label={t("review.venues")} value={form.venueName} />
													<ReviewRow label={t("review.city")} value={form.venueCity} />
													<ReviewRow label={t("review.capacity")} value={form.venueCapacity} />
													<ReviewRow label={t("review.budget")} value={form.totalBudget ? `$${form.totalBudget}` : undefined} />
													<ReviewRow label={t("review.financing")} value={form.needsFinancing ? (form.financingAmount ? `$${form.financingAmount}` : "Yes") : false} />
												</div>
											</div>

											{/* Declaration */}
											<div>
												<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF5A30] mb-3">{t("form.step7.declarationSection")}</p>
												<div className="grid gap-5 sm:grid-cols-2">
													<div>
														<FLabel htmlFor="s7-repname" required>{t("form.step7.authorizedRepName.label")}</FLabel>
														<input id="s7-repname" type="text" placeholder={t("form.step7.authorizedRepName.placeholder")} value={form.authorizedRepName} onChange={e => set("authorizedRepName", e.target.value)} className={`${ic} ${errors.authorizedRepName ? icErr : ""}`} aria-invalid={!!errors.authorizedRepName} />
														<FError msg={errors.authorizedRepName} />
													</div>
													<div>
														<FLabel htmlFor="s7-reptitle" required>{t("form.step7.authorizedRepTitle.label")}</FLabel>
														<input id="s7-reptitle" type="text" placeholder={t("form.step7.authorizedRepTitle.placeholder")} value={form.authorizedRepTitle} onChange={e => set("authorizedRepTitle", e.target.value)} className={`${ic} ${errors.authorizedRepTitle ? icErr : ""}`} aria-invalid={!!errors.authorizedRepTitle} />
														<FError msg={errors.authorizedRepTitle} />
													</div>
													<div className="sm:col-span-2">
														<FLabel htmlFor="s7-notes">{t("form.step7.additionalNotes.label")}</FLabel>
														<textarea id="s7-notes" placeholder={t("form.step7.additionalNotes.placeholder")} value={form.additionalNotes} onChange={e => set("additionalNotes", e.target.value)} className={sc} />
													</div>
												</div>

												<div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
													<p className="text-sm text-slate-600 leading-relaxed mb-4">{t("form.step7.declarationText")}</p>
													<label className={`flex items-start gap-3 cursor-pointer`}>
														<input type="checkbox" className="sr-only" checked={form.declarationConfirmed} onChange={e => { set("declarationConfirmed", e.target.checked); if (errors.declaration) setErrors(p => { const n = { ...p }; delete n.declaration; return n; }); }} />
														<div className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center ${form.declarationConfirmed ? "bg-[#FF5A30] border-[#FF5A30]" : errors.declaration ? "border-rose-400" : "border-slate-300"}`}>
															{form.declarationConfirmed && <span className="material-symbols-outlined text-white text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>}
														</div>
														<span className="text-sm font-semibold text-slate-800">I have read and agree to the declaration above.</span>
													</label>
													{errors.declaration && <p className="mt-2 ml-8 text-xs text-rose-600 font-medium">{errors.declaration}</p>}
												</div>
											</div>
										</div>
									)}

									{submitError && (
										<p className="text-sm font-medium text-rose-700" role="alert">{submitError}</p>
									)}

									<div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
										<button type="button" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}
											className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50">
											{t("actions.back")}
										</button>
										<div className="flex flex-wrap items-center gap-3">
											<Link href="/discovery" className="rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
												{t("actions.cancel")}
											</Link>
											<button type="submit" disabled={submitting}
												className="rounded-full bg-[#FF5A30] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60">
												{submitting ? t("actions.submitting") : step === STEPS.length - 1 ? t("actions.submit") : t("actions.continue")}
											</button>
										</div>
									</div>
								</form>
							</section>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}

export default function EOIClient() {
	const t = useTranslations("EOIPage");
	return (
		<Suspense fallback={
			<main className="flex-1 lg:ml-64 bg-surface flex items-center justify-center">
				<span className="text-sm font-medium text-on-surface-variant">{t("loadingOpportunity")}</span>
			</main>
		}>
			<EOIPageContent />
		</Suspense>
	);
}
