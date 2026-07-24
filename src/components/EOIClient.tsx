"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Icon from "@/components/icons";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Suspense, useMemo, useState } from "react";
import { createEOI, getArtists, getTourstackProfile } from "@/app/actions";
import { useSession } from "@/context/AuthContext";
import BankSelect, { type BankDetails } from "@/components/ui/BankSelect";
import Button from "@/components/ui/Button";
import FormattedNumberInput from "@/components/ui/FormattedNumberInput";
import { Link } from "@/i18n/routing";
import PageTour from "@/components/PageTour";

type ArtistItem = NonNullable<Awaited<ReturnType<typeof getArtists>>["data"]>[number];

type VenueEntry = {
	name: string;
	city: string;
	capacity: string;
	type: string;
	status: string;
	rentalCost: string;
	expectedTicketSales: string;
	expectedOccupancy: string;
};

const EMPTY_VENUE: VenueEntry = {
	name: "",
	city: "",
	capacity: "",
	type: "",
	status: "",
	rentalCost: "",
	expectedTicketSales: "",
	expectedOccupancy: "",
};

const INSURANCE_PRODUCTS = [
	"Event Cancellation",
	"Event Insurance Bundle",
	"Touring Workforce",
	"Aviation & Equipment",
	"Audience Ticket Protection",
] as const;

type InsuranceProduct = (typeof INSURANCE_PRODUCTS)[number];

const INSURANCE_PRODUCT_I18N_KEY: Record<InsuranceProduct, string> = {
	"Event Cancellation": "eventCancellation",
	"Event Insurance Bundle": "eventInsuranceBundle",
	"Touring Workforce": "touringWorkforce",
	"Aviation & Equipment": "aviationEquipment",
	"Audience Ticket Protection": "audienceTicketProtection",
};

type InsuranceSelection = {
	product: InsuranceProduct;
	sumInsured: string;
};

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
	tourManager: string;
	tourManagerEmail: string;
	tourManagerPhone: string;
	artistConfirmed: boolean;
	spotifyListeners: string;
	youtubeSubscribers: string;
	artistInstagram: string;
	// Step 4 — Venue(s)
	venues: VenueEntry[];
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
	insuranceSelections: InsuranceSelection[];
	needsFinancing: boolean;
	financingAmount: string;
	financingPurpose: string[];
	financingStructure: string;
	bankName: string;
	bankCode: string;
	bankAccountHolder: string;
	bankAccountNumber: string;
	bvnOrRc: string;
	// Step 7 — Documents & Declaration
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
	marketsRegions: "", tourManager: "", tourManagerEmail: "",
	tourManagerPhone: "",
	artistConfirmed: false, spotifyListeners: "", youtubeSubscribers: "",
	artistInstagram: "", venues: [EMPTY_VENUE], artistFee: "",
	productionCosts: "", marketingCosts: "", operationsCosts: "", totalBudget: "",
	ticketingRevenue: "", sponsorshipRevenue: "", otherRevenue: "", totalRevenue: "",
	netProfit: "", hasCancellationHistory: false, securityPlan: "",
	insuranceSelections: [],
	needsFinancing: false, financingAmount: "", financingPurpose: [],
	financingStructure: "", bankName: "", bankCode: "", bankAccountHolder: "", bankAccountNumber: "",
	bvnOrRc: "", hasFinancialStatements: false,
	hasTourDocs: false, authorizedRepName: "", authorizedRepTitle: "",
	additionalNotes: "", declarationConfirmed: false,
};

function buildNotes(form: EOIForm, artist: ArtistItem): string {
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
		`Tour: ${String(artist.tour_name ?? "")}\n` +
		`Tour Manager: ${form.tourManager}${form.tourManagerEmail ? ` — ${form.tourManagerEmail}` : ""}${form.tourManagerPhone ? ` | ${form.tourManagerPhone}` : ""}\n` +
		`Artist Confirmed: ${form.artistConfirmed ? "Yes" : "Pending"}\n` +
		[form.spotifyListeners && `Spotify: ${form.spotifyListeners}/mo`, form.youtubeSubscribers && `YouTube: ${form.youtubeSubscribers}`, form.artistInstagram && `IG: ${form.artistInstagram}`].filter(Boolean).join(" | ")
	);

	sections.push(
		`VENUE(S)\n` +
		form.venues.map((v, i) =>
			`${i + 1}. ${v.name} (${v.city}) — ${v.capacity || "?"} cap | ${v.type || "?"} | ${v.status || "?"}` +
			(v.rentalCost ? ` | Rental: $${v.rentalCost}` : "") +
			` | Expected Sales: ${v.expectedTicketSales || "?"} | Occupancy: ${v.expectedOccupancy || "?"}%`
		).join("\n")
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
	riskLines.push("Insurance Partner: TBC (compulsory)");
	for (const sel of form.insuranceSelections) {
		riskLines.push(`${sel.product}: $${sel.sumInsured || "0"} sum insured`);
	}
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

	const docs: string[] = ["✓ CAC / Business Registration (required)"];
	if (form.hasFinancialStatements) docs.push("✓ Financial Statements");
	if (form.hasTourDocs) docs.push("✓ Tour Docs");
	sections.push(`DOCUMENTS\n${docs.join("\n")}`);

	sections.push(`DECLARATION\nBy: ${form.authorizedRepName} (${form.authorizedRepTitle})`);

	if (form.additionalNotes.trim()) {
		sections.push(`ADDITIONAL NOTES\n${form.additionalNotes.trim()}`);
	}

	return sections.join("\n\n");
}

const ic = "w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20";
const icErr = "border-rose-400 focus:border-rose-400 focus:ring-rose-400/20";
const sc = "w-full rounded-2xl border border-outline-variant/20 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 min-h-28";

function FLabel({ htmlFor, required, children }: { htmlFor: string; required?: boolean; children: React.ReactNode }) {
	return (
		<label htmlFor={htmlFor} className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">
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
		<div className="col-span-full border-b border-outline-variant/10 pb-3 mb-1">
			<p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">{children}</p>
		</div>
	);
}

function ToggleGroup({ value, onChange, options }: { value: boolean; onChange: (v: boolean) => void; options: [string, string] }) {
	return (
		<div className="flex shrink-0 rounded-xl border border-outline-variant/20 overflow-hidden text-sm font-semibold">
			<button type="button" role="switch" aria-checked={!value} onClick={() => onChange(false)}
				className={`px-4 py-2 transition ${!value ? "bg-inverse-surface text-inverse-on-surface" : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low"}`}>
				{options[0]}
			</button>
			<button type="button" role="switch" aria-checked={value} onClick={() => onChange(true)}
				className={`px-4 py-2 transition ${value ? "bg-primary text-on-primary" : "bg-surface-container-lowest text-on-surface-variant hover:bg-surface-container-low"}`}>
				{options[1]}
			</button>
		</div>
	);
}

function Stepper({ current, steps }: { current: number; steps: { label: string }[] }) {
	// Journey rail — same language as the profile journey: numbered circles
	// that turn emerald once passed, connectors that fill as you advance.
	return (
		<div className="tsd-card p-4 md:p-5 mb-8">
			<ol className="flex items-center gap-0">
				{steps.map((step, i) => {
					const done = i < current;
					const active = i === current;
					return (
						<li key={step.label} className="flex items-center flex-1 last:flex-none min-w-0">
							<div className="flex items-center gap-2 min-w-0">
								<span
									className={`flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full border text-[11px] font-semibold shrink-0 transition-all duration-300 [transition-timing-function:var(--ease-out)] ${
										done
											? "bg-emerald-500 border-emerald-500 text-white"
											: active
												? "border-primary text-primary bg-primary/10"
												: "border-outline-variant text-on-surface-variant"
									}`}
								>
									{done ? <Icon name="check" size={13} strokeWidth={2.5} /> : String(i + 1).padStart(2, "0")}
								</span>
								<span
									className={`hidden lg:block text-[10px] font-semibold uppercase tracking-wider truncate ${active ? "text-on-surface" : done ? "text-on-surface-variant" : "text-on-surface-variant/60"}`}
								>
									{step.label}
								</span>
							</div>
							{i < steps.length - 1 && (
								<span className="flex-1 h-px mx-2 md:mx-3 relative bg-outline-variant overflow-hidden rounded-full">
									<span
										className="absolute inset-y-0 left-0 bg-emerald-500 transition-[width] duration-500 [transition-timing-function:var(--ease-out)]"
										style={{ width: done ? "100%" : "0%" }}
									/>
								</span>
							)}
						</li>
					);
				})}
			</ol>
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
		<div className="tsd-card p-5">
			<p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-on-surface-variant mb-3">{t("selector.heading")}</p>
			<div className="relative mb-3">
				<Icon name="search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
				<input type="text" placeholder={t("selector.searchPlaceholder")} value={search} onChange={e => setSearch(e.target.value)}
					className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-outline-variant/20 bg-surface-container-low text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition" />
			</div>
			{loading ? (
				<p className="text-sm text-on-surface-variant text-center py-4">{t("selector.loading")}</p>
			) : filtered.length === 0 ? (
				<p className="text-sm text-on-surface-variant text-center py-4">{t("selector.noResults")}</p>
			) : (
				<div className="max-h-56 overflow-y-auto space-y-0.5 pr-0.5">
					{filtered.map(a => {
						const id = String(a.id ?? a.name ?? "");
						const sel = id === selectedId;
						return (
							<button key={id} type="button" onClick={() => onSelect(id)}
								className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${sel ? "bg-primary/10 border border-primary/25" : "hover:bg-surface-container-low border border-transparent"}`}>
								<div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center transition-colors ${sel ? "border-primary" : "border-outline-variant/40"}`}>
									{sel && <div className="w-2 h-2 rounded-full bg-primary" />}
								</div>
								<div className="flex-1 min-w-0">
									<p className={`text-sm font-semibold truncate ${sel ? "text-primary" : "text-on-surface"}`}>{String(a.name ?? "")}</p>
									{a.tour_name && <p className="text-xs text-on-surface-variant truncate">{String(a.tour_name)}</p>}
								</div>
								{a.genre && <span className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant shrink-0">{String(a.genre)}</span>}
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
		<div className="tsd-card p-5 space-y-4">
			<div>
				<p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-primary mb-1">{t("tourPanel.heading")}</p>
				<h2 className="text-lg font-(family-name:--font-manrope) font-semibold text-on-surface leading-tight">{String(artist.tour_name ?? artist.name ?? "")}</h2>
				<p className="mt-0.5 text-sm font-semibold text-on-surface-variant">{String(artist.name ?? "")}</p>
			</div>
			<div className="space-y-2.5">
				{artist.genre && <div><p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">{t("tourPanel.genre")}</p><p className="text-sm font-semibold text-on-surface mt-0.5">{String(artist.genre)}</p></div>}
				{dateRange && <div><p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">{t("tourPanel.dates")}</p><p className="text-sm font-semibold text-on-surface mt-0.5">{dateRange}</p></div>}
				{markets && <div><p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">{t("tourPanel.markets")}</p><p className="text-sm font-semibold text-on-surface mt-0.5">{markets}</p></div>}
				{feeRange && <div><p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">{t("tourPanel.fee")}</p><p className="text-sm font-semibold text-on-surface mt-0.5">{feeRange}</p></div>}
				{artist.region && <div><p className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant">{t("tourPanel.region")}</p><p className="text-sm font-semibold text-on-surface mt-0.5">{String(artist.region)}</p></div>}
			</div>
		</div>
	);
}

function ReviewRow({ label, value }: { label: string; value?: string | boolean }) {
	const t = useTranslations("EOIPage");
	if (value === undefined || value === "" || value === false) return null;
	return (
		<div className="flex items-start gap-4 border-b border-outline-variant/10 py-2.5 last:border-none">
			<span className="mt-0.5 w-32 shrink-0 text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">{label}</span>
			<span className="text-sm font-semibold text-on-surface">{value === true ? t("review.yes") : value}</span>
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
	const [venueErrors, setVenueErrors] = useState<Partial<Record<keyof VenueEntry, string>>[]>([]);

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

	function setVenue(index: number, key: keyof VenueEntry, value: string) {
		set("venues", form.venues.map((v, i) => (i === index ? { ...v, [key]: value } : v)));
		setVenueErrors(prev => {
			if (!prev[index]?.[key]) return prev;
			const next = [...prev];
			next[index] = { ...next[index] };
			delete next[index][key];
			return next;
		});
	}

	function addVenue() {
		set("venues", [...form.venues, EMPTY_VENUE]);
	}

	function removeVenue(index: number) {
		set("venues", form.venues.filter((_, i) => i !== index));
		setVenueErrors(prev => prev.filter((_, i) => i !== index));
	}

	function toggleInsuranceProduct(product: InsuranceProduct) {
		const exists = form.insuranceSelections.some(sel => sel.product === product);
		set(
			"insuranceSelections",
			exists
				? form.insuranceSelections.filter(sel => sel.product !== product)
				: [...form.insuranceSelections, { product, sumInsured: "" }],
		);
	}

	function setInsuranceSumInsured(product: InsuranceProduct, value: string) {
		set("insuranceSelections", form.insuranceSelections.map(sel => (sel.product === product ? { ...sel, sumInsured: value } : sel)));
	}

	function handleSelectOpportunity(id: string) {
		setSelectedId(id);
		setStep(0);
		setUserEdits({});
		setErrors({});
		setVenueErrors([]);
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
			if (!form.tourManager.trim()) e.tourManager = t("validation.tourManagerRequired");
		}
		if (s === 3) {
			const vErrs = form.venues.map((v) => {
				const ve: Partial<Record<keyof VenueEntry, string>> = {};
				if (!v.name.trim()) ve.name = t("validation.venueNameRequired");
				if (!v.city.trim()) ve.city = t("validation.venueCityRequired");
				if (!v.capacity.trim()) ve.capacity = t("validation.venueCapacityRequired");
				if (!v.type) ve.type = t("validation.venueTypeRequired");
				if (!v.status) ve.status = t("validation.venueStatusRequired");
				if (!v.expectedTicketSales.trim()) ve.expectedTicketSales = t("validation.expectedSalesRequired");
				if (!v.expectedOccupancy.trim()) ve.expectedOccupancy = t("validation.occupancyRequired");
				return ve;
			});
			setVenueErrors(vErrs);
			if (vErrs.some(ve => Object.keys(ve).length > 0)) {
				e.venues = t("validation.venuesIncomplete");
			}
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
			if (form.insuranceSelections.length === 0) {
				e.insuranceSelections = t("validation.insuranceRequired");
			} else if (form.insuranceSelections.some(sel => !sel.sumInsured.trim())) {
				e.insuranceSelections = t("validation.insuranceSumRequired");
			}
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
		const safeNum = (s: string) => { const n = Number(s.replace(/,/g, "")); return Number.isFinite(n) ? n : undefined; };
		const primaryVenue = form.venues[0];
		submitMutation.mutate({
			artistId: artist.id,
			city: primaryVenue.city,
			venue: primaryVenue.name || undefined,
			capacity: primaryVenue.capacity ? safeNum(primaryVenue.capacity) : undefined,
			budget: form.totalBudget ? safeNum(form.totalBudget) : undefined,
			audience: primaryVenue.expectedTicketSales || undefined,
			fundingType: form.needsFinancing ? (form.financingStructure || "required") : undefined,
			notes: buildNotes(form, artist),
			venues: form.venues.map(v => ({
				name: v.name,
				city: v.city,
				capacity: v.capacity ? safeNum(v.capacity) : undefined,
				type: v.type || undefined,
				status: v.status || undefined,
				rentalCost: v.rentalCost ? safeNum(v.rentalCost) : undefined,
				expectedTicketSales: v.expectedTicketSales || undefined,
				expectedOccupancy: v.expectedOccupancy ? safeNum(v.expectedOccupancy) : undefined,
			})),
			requiredDocuments: [
				...(form.hasFinancialStatements ? (["financial_statements"] as const) : []),
				...(form.hasTourDocs ? (["tour_itinerary"] as const) : []),
			],
			insurance: form.insuranceSelections.map(sel => ({
				product: sel.product,
				sumInsured: safeNum(sel.sumInsured) ?? 0,
			})),
			requiresFinancing: form.needsFinancing,
			financingAmount: form.needsFinancing ? safeNum(form.financingAmount) : undefined,
			financingStructure: form.needsFinancing ? (form.financingStructure || undefined) : undefined,
			financingPurpose: form.needsFinancing && form.financingPurpose.length > 0 ? form.financingPurpose : undefined,
		});
	}

	const markets = artist
		? Array.isArray(artist.markets) ? (artist.markets as string[]).join(", ") : String(artist.markets ?? "")
		: "";

	if (submitted && artist) {
		return (
			<main className="flex-1 lg:ml-64 bg-surface p-6 md:p-12">
				<div className="flex min-h-[calc(100vh-5rem)] items-center justify-center">
					<div className="tsd-card w-full max-w-lg p-8 text-center md:p-12">
						<div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mx-auto">
							<Icon name="check-circle" size={36} />
						</div>
						<h1 className="text-3xl font-semibold tracking-tight text-on-surface font-(family-name:--font-manrope)">{t("success.title")}</h1>
						<p className="mt-4 text-sm leading-6 text-on-surface-variant">{t("success.description", { artist: String(artist.name ?? "") })}</p>
						<div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
							<Link href="/dashboard" className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90">
								{t("success.viewDashboard")}
							</Link>
							<Link href="/discovery" className="inline-flex items-center justify-center rounded-full border border-outline-variant/20 px-6 py-3 text-sm font-semibold text-on-surface-variant transition hover:bg-surface-container-low">
								{t("success.backToDiscovery")}
							</Link>
						</div>
					</div>
				</div>
			</main>
		);
	}

	return (
		<main className="flex-1 lg:ml-64 bg-surface p-6 md:px-10 md:pt-5 md:pb-10">
			<PageTour pageId="eoi" />
			<div className="w-full">
				<header className="mb-8">
					<span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-primary">{t("hero.platform")}</span>
					<h1 className="text-3xl font-semibold tracking-tight text-on-surface md:text-4xl font-(family-name:--font-manrope)">{t("hero.title")}</h1>
					<p className="mt-3 text-base leading-relaxed text-on-surface-variant">{t("hero.description")}</p>
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
							<div className="rounded-3xl border-2 border-dashed border-outline-variant/20 bg-surface-container-lowest/50 p-12 text-center">
								<Icon name="tours" size={44} className="text-on-surface-variant/50 mx-auto mb-4" />
								<p className="text-base font-semibold text-on-surface-variant">{t("selector.selectPrompt")}</p>
							</div>
						) : (
							<section className="tsd-card p-6 md:p-8">
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
												<FormattedNumberInput id="s2-years" placeholder={t("form.step2.yearsInBusiness.placeholder")} value={form.yearsInBusiness} onChange={v => set("yearsInBusiness", v)} className={`${ic} ${errors.yearsInBusiness ? icErr : ""}`} ariaInvalid={!!errors.yearsInBusiness} />
												<FError msg={errors.yearsInBusiness} />
											</div>
											<div>
												<FLabel htmlFor="s2-concerts" required>{t("form.step2.concertsOrganized.label")}</FLabel>
												<FormattedNumberInput id="s2-concerts" placeholder={t("form.step2.concertsOrganized.placeholder")} value={form.concertsOrganized} onChange={v => set("concertsOrganized", v)} className={`${ic} ${errors.concertsOrganized ? icErr : ""}`} ariaInvalid={!!errors.concertsOrganized} />
												<FError msg={errors.concertsOrganized} />
											</div>
											<div>
												<FLabel htmlFor="s2-largest" required>{t("form.step2.largestConcertCapacity.label")}</FLabel>
												<FormattedNumberInput id="s2-largest" placeholder={t("form.step2.largestConcertCapacity.placeholder")} value={form.largestConcertCapacity} onChange={v => set("largestConcertCapacity", v)} className={`${ic} ${errors.largestConcertCapacity ? icErr : ""}`} ariaInvalid={!!errors.largestConcertCapacity} />
												<FError msg={errors.largestConcertCapacity} />
											</div>
											<div>
												<FLabel htmlFor="s2-avg" required>{t("form.step2.averageEventsYear.label")}</FLabel>
												<FormattedNumberInput id="s2-avg" placeholder={t("form.step2.averageEventsYear.placeholder")} value={form.averageEventsYear} onChange={v => set("averageEventsYear", v)} className={`${ic} ${errors.averageEventsYear ? icErr : ""}`} ariaInvalid={!!errors.averageEventsYear} />
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
												<p className="text-xs text-on-surface-variant">{t("form.step3.tourDetailsHint")}</p>
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
											<div className="sm:col-span-2">
												<div className="flex items-center justify-between gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-4">
													<p className="text-sm font-semibold text-on-surface">{t("form.step3.artistConfirmed.label")}</p>
													<ToggleGroup value={form.artistConfirmed} onChange={v => set("artistConfirmed", v)} options={[t("form.step3.artistConfirmed.pending"), t("form.step3.artistConfirmed.confirmed")]} />
												</div>
											</div>

											<SectionHeading>{t("form.step3.artistSection")}</SectionHeading>
											<div>
												<FLabel htmlFor="s3-spotify">{t("form.step3.spotifyListeners.label")}</FLabel>
												<FormattedNumberInput id="s3-spotify" placeholder={t("form.step3.spotifyListeners.placeholder")} value={form.spotifyListeners} onChange={v => set("spotifyListeners", v)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s3-yt">{t("form.step3.youtubeSubscribers.label")}</FLabel>
												<FormattedNumberInput id="s3-yt" placeholder={t("form.step3.youtubeSubscribers.placeholder")} value={form.youtubeSubscribers} onChange={v => set("youtubeSubscribers", v)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s3-aig">{t("form.step3.artistInstagram.label")}</FLabel>
												<FormattedNumberInput id="s3-aig" placeholder={t("form.step3.artistInstagram.placeholder")} value={form.artistInstagram} onChange={v => set("artistInstagram", v)} className={ic} />
											</div>
										</div>
									)}

									{/* ── STEP 4: Venue(s) & Ticketing ── */}
									{step === 3 && (
										<div className="space-y-6">
											{errors.venues && <FError msg={errors.venues} />}
											{form.venues.map((venue, i) => {
												const ve = venueErrors[i] ?? {};
												return (
													<div key={`venue-${i}`} className="rounded-2xl border border-outline-variant/20 p-5">
														<div className="mb-4 flex items-center justify-between">
															<p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
																{t("form.step4.venueSection")} {form.venues.length > 1 ? i + 1 : ""}
															</p>
															{form.venues.length > 1 && (
																<button type="button" onClick={() => removeVenue(i)} className="flex items-center gap-1 text-xs font-semibold text-rose-500 hover:text-rose-600">
																	<Icon name="trash" size={14} />
																	{t("form.step4.removeVenue")}
																</button>
															)}
														</div>
														<div className="grid gap-5 sm:grid-cols-2">
															<div>
																<FLabel htmlFor={`s4-vname-${i}`} required>{t("form.step4.venueName.label")}</FLabel>
																<input id={`s4-vname-${i}`} type="text" placeholder={t("form.step4.venueName.placeholder")} value={venue.name} onChange={e => setVenue(i, "name", e.target.value)} className={`${ic} ${ve.name ? icErr : ""}`} aria-invalid={!!ve.name} />
																<FError msg={ve.name} />
															</div>
															<div>
																<FLabel htmlFor={`s4-vcity-${i}`} required>{t("form.step4.venueCity.label")}</FLabel>
																<input id={`s4-vcity-${i}`} type="text" placeholder={t("form.step4.venueCity.placeholder")} value={venue.city} onChange={e => setVenue(i, "city", e.target.value)} className={`${ic} ${ve.city ? icErr : ""}`} aria-invalid={!!ve.city} />
																<FError msg={ve.city} />
															</div>
															<div>
																<FLabel htmlFor={`s4-vcap-${i}`} required>{t("form.step4.venueCapacity.label")}</FLabel>
																<FormattedNumberInput id={`s4-vcap-${i}`} placeholder={t("form.step4.venueCapacity.placeholder")} value={venue.capacity} onChange={v => setVenue(i, "capacity", v)} className={`${ic} ${ve.capacity ? icErr : ""}`} ariaInvalid={!!ve.capacity} />
																<FError msg={ve.capacity} />
															</div>
															<div>
																<FLabel htmlFor={`s4-vrent-${i}`}>{t("form.step4.venueRentalCost.label")}</FLabel>
																<FormattedNumberInput id={`s4-vrent-${i}`} placeholder={t("form.step4.venueRentalCost.placeholder")} value={venue.rentalCost} onChange={v => setVenue(i, "rentalCost", v)} className={ic} />
															</div>
															<div>
																<FLabel htmlFor={`s4-vtype-${i}`} required>{t("form.step4.venueType.label")}</FLabel>
																<div className="relative">
																	<select id={`s4-vtype-${i}`} value={venue.type} onChange={e => setVenue(i, "type", e.target.value)} className={`${ic} appearance-none pr-9 ${ve.type ? icErr : ""}`} aria-invalid={!!ve.type}>
																		<option value="">—</option>
																		<option value="indoor">{t("form.step4.venueType.indoor")}</option>
																		<option value="outdoor">{t("form.step4.venueType.outdoor")}</option>
																		<option value="hybrid">{t("form.step4.venueType.hybrid")}</option>
																	</select>
																	<Icon name="chevron-down" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
																</div>
																<FError msg={ve.type} />
															</div>
															<div>
																<FLabel htmlFor={`s4-vstatus-${i}`} required>{t("form.step4.venueStatus.label")}</FLabel>
																<div className="relative">
																	<select id={`s4-vstatus-${i}`} value={venue.status} onChange={e => setVenue(i, "status", e.target.value)} className={`${ic} appearance-none pr-9 ${ve.status ? icErr : ""}`} aria-invalid={!!ve.status}>
																		<option value="">—</option>
																		<option value="confirmed">{t("form.step4.venueStatus.confirmed")}</option>
																		<option value="shortlisted">{t("form.step4.venueStatus.shortlisted")}</option>
																		<option value="pending">{t("form.step4.venueStatus.pending")}</option>
																	</select>
																	<Icon name="chevron-down" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
																</div>
																<FError msg={ve.status} />
															</div>
															<div>
																<FLabel htmlFor={`s4-tsales-${i}`} required>{t("form.step4.expectedTicketSales.label")}</FLabel>
																<FormattedNumberInput id={`s4-tsales-${i}`} placeholder={t("form.step4.expectedTicketSales.placeholder")} value={venue.expectedTicketSales} onChange={v => setVenue(i, "expectedTicketSales", v)} className={`${ic} ${ve.expectedTicketSales ? icErr : ""}`} ariaInvalid={!!ve.expectedTicketSales} />
																<FError msg={ve.expectedTicketSales} />
															</div>
															<div>
																<FLabel htmlFor={`s4-occ-${i}`} required>{t("form.step4.expectedOccupancy.label")}</FLabel>
																<input id={`s4-occ-${i}`} type="text" inputMode="numeric" placeholder={t("form.step4.expectedOccupancy.placeholder")} value={venue.expectedOccupancy} onChange={e => setVenue(i, "expectedOccupancy", e.target.value.replace(/\D/g, ""))} className={`${ic} ${ve.expectedOccupancy ? icErr : ""}`} aria-invalid={!!ve.expectedOccupancy} />
																<FError msg={ve.expectedOccupancy} />
															</div>
														</div>
													</div>
												);
											})}
											<button type="button" onClick={addVenue} className="flex items-center gap-2 rounded-full border border-dashed border-outline-variant/40 px-5 py-3 text-sm font-semibold text-on-surface-variant transition hover:border-primary hover:text-primary">
												<Icon name="plus" size={16} />
												{t("form.step4.addVenue")}
											</button>
										</div>
									)}

									{/* ── STEP 5: Budget & Revenue ── */}
									{step === 4 && (
										<div className="grid gap-5 sm:grid-cols-2">
											<SectionHeading>{t("form.step5.budgetSection")}</SectionHeading>
											<div className="col-span-full">
												<p className="text-xs text-on-surface-variant mb-4">{t("form.step5.budgetHint")}</p>
											</div>
											<div>
												<FLabel htmlFor="s5-afee" required>{t("form.step5.artistFee.label")}</FLabel>
												<FormattedNumberInput id="s5-afee" placeholder={t("form.step5.artistFee.placeholder")} value={form.artistFee} onChange={v => set("artistFee", v)} className={`${ic} ${errors.artistFee ? icErr : ""}`} ariaInvalid={!!errors.artistFee} />
												<FError msg={errors.artistFee} />
											</div>
											<div>
												<FLabel htmlFor="s5-prod" required>{t("form.step5.productionCosts.label")}</FLabel>
												<FormattedNumberInput id="s5-prod" placeholder={t("form.step5.productionCosts.placeholder")} value={form.productionCosts} onChange={v => set("productionCosts", v)} className={`${ic} ${errors.productionCosts ? icErr : ""}`} ariaInvalid={!!errors.productionCosts} />
												<FError msg={errors.productionCosts} />
											</div>
											<div>
												<FLabel htmlFor="s5-mkt" required>{t("form.step5.marketingCosts.label")}</FLabel>
												<FormattedNumberInput id="s5-mkt" placeholder={t("form.step5.marketingCosts.placeholder")} value={form.marketingCosts} onChange={v => set("marketingCosts", v)} className={`${ic} ${errors.marketingCosts ? icErr : ""}`} ariaInvalid={!!errors.marketingCosts} />
												<FError msg={errors.marketingCosts} />
											</div>
											<div>
												<FLabel htmlFor="s5-ops" required>{t("form.step5.operationsCosts.label")}</FLabel>
												<FormattedNumberInput id="s5-ops" placeholder={t("form.step5.operationsCosts.placeholder")} value={form.operationsCosts} onChange={v => set("operationsCosts", v)} className={`${ic} ${errors.operationsCosts ? icErr : ""}`} ariaInvalid={!!errors.operationsCosts} />
												<FError msg={errors.operationsCosts} />
											</div>
											<div className="sm:col-span-2">
												<FLabel htmlFor="s5-total" required>{t("form.step5.totalBudget.label")}</FLabel>
												<FormattedNumberInput id="s5-total" placeholder={t("form.step5.totalBudget.placeholder")} value={form.totalBudget} onChange={v => set("totalBudget", v)} className={`${ic} ${errors.totalBudget ? icErr : ""}`} ariaInvalid={!!errors.totalBudget} />
												<FError msg={errors.totalBudget} />
											</div>

											<SectionHeading>{t("form.step5.revenueSection")}</SectionHeading>
											<div>
												<FLabel htmlFor="s5-trev">{t("form.step5.ticketingRevenue.label")}</FLabel>
												<FormattedNumberInput id="s5-trev" placeholder={t("form.step5.ticketingRevenue.placeholder")} value={form.ticketingRevenue} onChange={v => set("ticketingRevenue", v)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s5-srev">{t("form.step5.sponsorshipRevenue.label")}</FLabel>
												<FormattedNumberInput id="s5-srev" placeholder={t("form.step5.sponsorshipRevenue.placeholder")} value={form.sponsorshipRevenue} onChange={v => set("sponsorshipRevenue", v)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s5-orev">{t("form.step5.otherRevenue.label")}</FLabel>
												<FormattedNumberInput id="s5-orev" placeholder={t("form.step5.otherRevenue.placeholder")} value={form.otherRevenue} onChange={v => set("otherRevenue", v)} className={ic} />
											</div>
											<div>
												<FLabel htmlFor="s5-trev2">{t("form.step5.totalRevenue.label")}</FLabel>
												<FormattedNumberInput id="s5-trev2" placeholder={t("form.step5.totalRevenue.placeholder")} value={form.totalRevenue} onChange={v => set("totalRevenue", v)} className={ic} />
											</div>
											<div className="sm:col-span-2">
												<FLabel htmlFor="s5-net">{t("form.step5.netProfit.label")}</FLabel>
												<FormattedNumberInput id="s5-net" placeholder={t("form.step5.netProfit.placeholder")} value={form.netProfit} onChange={v => set("netProfit", v)} className={ic} />
											</div>
										</div>
									)}

									{/* ── STEP 6: Risk, Financing & Banking ── */}
									{step === 5 && (
										<div className="grid gap-5 sm:grid-cols-2">
											<SectionHeading>{t("form.step6.riskSection")}</SectionHeading>
											<div className="sm:col-span-2">
												<div className="flex items-center justify-between gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-4">
													<p className="text-sm font-semibold text-on-surface">{t("form.step6.hasCancellationHistory")}</p>
													<ToggleGroup value={form.hasCancellationHistory} onChange={v => set("hasCancellationHistory", v)} options={[t("form.no"), t("form.yes")]} />
												</div>
											</div>
											<div className="sm:col-span-2">
												<FLabel htmlFor="s6-sec">{t("form.step6.securityPlan.label")}</FLabel>
												<textarea id="s6-sec" placeholder={t("form.step6.securityPlan.placeholder")} value={form.securityPlan} onChange={e => set("securityPlan", e.target.value)} className={sc} />
											</div>

											<SectionHeading>{t("form.step6.insuranceSection")}</SectionHeading>
											<div className="sm:col-span-2">
												<div className="flex items-start gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-5 py-4">
													<Icon name="check-circle" size={18} className="text-emerald-600 shrink-0" />
													<div>
														<p className="text-sm font-semibold text-on-surface">{t("form.step6.insuranceCompulsoryTitle")}</p>
														<p className="mt-1 text-xs leading-relaxed text-on-surface-variant">{t("form.step6.insuranceCompulsoryText")}</p>
													</div>
												</div>
											</div>
											<div className="sm:col-span-2">
												<p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">{t("form.step6.insuranceProducts.label")}</p>
												<div className="grid sm:grid-cols-2 gap-3">
													{INSURANCE_PRODUCTS.map(product => {
														const selection = form.insuranceSelections.find(sel => sel.product === product);
														const checked = !!selection;
														return (
															<div key={product} className={`rounded-2xl border px-4 py-3 transition ${checked ? "border-primary/30 bg-primary/10" : "border-outline-variant/20 bg-surface-container-low hover:bg-surface-container"}`}>
																<label className="flex items-center gap-2.5 cursor-pointer">
																	<input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleInsuranceProduct(product)} />
																	<div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center ${checked ? "bg-primary border-primary" : "border-outline-variant/40"}`}>
																		{checked && <Icon name="check" size={10} className="text-white" />}
																	</div>
																	<span className="text-xs font-semibold text-on-surface-variant">{t(`form.step6.insuranceProducts.${INSURANCE_PRODUCT_I18N_KEY[product]}`)}</span>
																</label>
																{checked && (
																	<div className="mt-3">
																		<FLabel htmlFor={`ins-sum-${product}`}>{t("form.step6.insuranceSumInsured.label")}</FLabel>
																		<FormattedNumberInput
																			id={`ins-sum-${product}`}
																			placeholder={t("form.step6.insuranceSumInsured.placeholder")}
																			value={selection?.sumInsured ?? ""}
																			onChange={v => setInsuranceSumInsured(product, v)}
																			className={ic}
																		/>
																	</div>
																)}
															</div>
														);
													})}
												</div>
												<FError msg={errors.insuranceSelections} />
											</div>

											<SectionHeading>{t("form.step6.financingSection")}</SectionHeading>
											<div className="sm:col-span-2">
												<div className="flex items-center justify-between gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low px-5 py-4">
													<p className="text-sm font-semibold text-on-surface">{t("form.step6.needsFinancing")}</p>
													<ToggleGroup value={form.needsFinancing} onChange={v => set("needsFinancing", v)} options={[t("form.no"), t("form.yes")]} />
												</div>
											</div>
											<div className={`sm:col-span-2 grid sm:grid-cols-2 gap-5 transition-all ${form.needsFinancing ? "" : "opacity-40 pointer-events-none select-none"}`} aria-hidden={!form.needsFinancing}>
												<div>
													<FLabel htmlFor="s6-famount">{t("form.step6.financingAmount.label")}</FLabel>
													<FormattedNumberInput id="s6-famount" tabIndex={form.needsFinancing ? 0 : -1} placeholder={t("form.step6.financingAmount.placeholder")} value={form.financingAmount} onChange={v => set("financingAmount", v)} className={ic} />
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
														<Icon name="chevron-down" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
													</div>
												</div>
												<div className="sm:col-span-2">
													<p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-on-surface-variant">{t("form.step6.financingPurpose.label")}</p>
													<div className="grid sm:grid-cols-3 gap-2">
														{(["artistFee", "production", "marketing", "operations", "other"] as const).map(key => (
															<label key={key} className={`flex items-center gap-2.5 rounded-xl border px-4 py-3 cursor-pointer transition ${form.financingPurpose.includes(key) ? "border-primary/30 bg-primary/10" : "border-outline-variant/20 bg-surface-container-low hover:bg-surface-container"}`}>
																<input type="checkbox" className="sr-only" tabIndex={form.needsFinancing ? 0 : -1} checked={form.financingPurpose.includes(key)} onChange={() => togglePurpose(key)} />
																<div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center ${form.financingPurpose.includes(key) ? "bg-primary border-primary" : "border-outline-variant/40"}`}>
																	{form.financingPurpose.includes(key) && <Icon name="check" size={10} className="text-white" />}
																</div>
																<span className="text-xs font-semibold text-on-surface-variant">{t(`form.step6.financingPurpose.${key}`)}</span>
															</label>
														))}
													</div>
												</div>
											</div>

											<SectionHeading>{t("form.step6.bankingSection")}</SectionHeading>
											<BankSelect
												value={{
													bankCode: form.bankCode,
													bankName: form.bankName,
													accountNumber: form.bankAccountNumber,
													accountHolder: form.bankAccountHolder,
												}}
												onChange={(next: BankDetails) => {
													setUserEdits(p => ({
														...p,
														bankCode: next.bankCode,
														bankName: next.bankName,
														bankAccountNumber: next.accountNumber,
														bankAccountHolder: next.accountHolder,
													}));
												}}
												required
												showError={Boolean(errors.bankName || errors.bankAccountNumber || errors.bankAccountHolder)}
												labels={{
													bank: t("form.step6.bankName.label"),
													bankSelectPlaceholder: t("form.step6.bankName.select"),
													bankLoading: t("form.step6.bankName.loading"),
													bankPlaceholder: t("form.step6.bankName.placeholder"),
													accountNumber: t("form.step6.bankAccountNumber.label"),
													accountNumberPlaceholder: t("form.step6.bankAccountNumber.placeholder"),
													verify: t("form.step6.bankAccountNumber.verify"),
													verifying: t("form.step6.bankAccountNumber.verifying"),
													verified: t("form.step6.bankAccountHolder.verified"),
													verifyFailed: t("form.step6.bankAccountHolder.verifyFailed"),
													accountHolder: t("form.step6.bankAccountHolder.label"),
													accountHolderPlaceholder: t("form.step6.bankAccountHolder.placeholder"),
												}}
											/>
											<div>
												<FLabel htmlFor="s6-bvn">{t("form.step6.bvnOrRc.label")}</FLabel>
												<input id="s6-bvn" type="text" placeholder={t("form.step6.bvnOrRc.placeholder")} value={form.bvnOrRc} onChange={e => set("bvnOrRc", e.target.value.replace(/\D/g, ""))} className={ic} />
											</div>
										</div>
									)}

									{/* ── STEP 7: Documents & Declaration ── */}
									{step === 6 && (
										<div className="space-y-6">
											{/* Documents */}
											<div>
												<p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary mb-3">{t("form.step7.documentsSection")}</p>
												<p className="text-xs text-on-surface-variant mb-4">{t("form.step7.documentsNote")}</p>
												<div className="space-y-2.5">
													<div className="flex items-center gap-3 rounded-2xl border border-status-approved/30 bg-status-approved/10 px-5 py-4">
														<div className="w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center bg-status-approved border-status-approved">
															<Icon name="check" size={12} className="text-on-primary" />
														</div>
														<span className="text-sm font-semibold text-on-surface">{t("form.step7.hasCACDocuments")}</span>
														<span className="ml-auto text-[10px] font-bold uppercase tracking-wider text-status-approved">{t("form.step7.required")}</span>
													</div>
													{(["hasFinancialStatements", "hasTourDocs"] as const).map(key => (
														<label key={key} className={`flex items-center gap-3 rounded-2xl border px-5 py-4 cursor-pointer transition ${form[key] ? "border-status-approved/30 bg-status-approved/10" : "border-outline-variant/20 bg-surface-container-low hover:bg-surface-container"}`}>
															<input type="checkbox" className="sr-only" checked={form[key]} onChange={e => set(key, e.target.checked)} />
															<div className={`w-5 h-5 rounded border-2 shrink-0 flex items-center justify-center ${form[key] ? "bg-status-approved border-status-approved" : "border-outline-variant/40"}`}>
																{form[key] && <Icon name="check" size={12} className="text-on-primary" />}
															</div>
															<span className="text-sm font-semibold text-on-surface">{t(`form.step7.${key}`)}</span>
														</label>
													))}
												</div>
											</div>

											{/* Review summary */}
											<div>
												<p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary mb-3">{t("form.step7.reviewSection")}</p>
												<div className="rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5 divide-y divide-outline-variant/10">
													<ReviewRow label={t("review.artist")} value={String(artist.name ?? "")} />
													<ReviewRow label={t("review.tour")} value={String(artist.tour_name ?? "")} />
													<ReviewRow label={t("review.markets")} value={markets} />
													<ReviewRow label={t("review.company")} value={form.companyName} />
													<ReviewRow label={t("review.contact")} value={form.contactPerson} />
													<ReviewRow label={t("review.email")} value={form.contactEmail} />
													<ReviewRow label={t("review.phone")} value={form.phone} />
													<ReviewRow label={t("review.venues")} value={form.venues.map(v => v.name).filter(Boolean).join(", ")} />
													<ReviewRow label={t("review.city")} value={form.venues.map(v => v.city).filter(Boolean).join(", ")} />
													<ReviewRow label={t("review.capacity")} value={form.venues.map(v => v.capacity).filter(Boolean).join(", ")} />
													<ReviewRow label={t("review.budget")} value={form.totalBudget ? `$${form.totalBudget}` : undefined} />
													<ReviewRow label={t("review.financing")} value={form.needsFinancing ? (form.financingAmount ? `$${form.financingAmount}` : t("review.yes")) : false} />
												</div>
											</div>

											{/* Declaration */}
											<div>
												<p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary mb-3">{t("form.step7.declarationSection")}</p>
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

												<div className="mt-4 rounded-2xl border border-outline-variant/20 bg-surface-container-low p-5">
													<p className="text-sm text-on-surface-variant leading-relaxed mb-4">{t("form.step7.declarationText")}</p>
													<label className={`flex items-start gap-3 cursor-pointer`}>
														<input type="checkbox" className="sr-only" checked={form.declarationConfirmed} onChange={e => { set("declarationConfirmed", e.target.checked); if (errors.declaration) setErrors(p => { const n = { ...p }; delete n.declaration; return n; }); }} />
														<div className={`w-5 h-5 rounded border-2 shrink-0 mt-0.5 flex items-center justify-center ${form.declarationConfirmed ? "bg-primary border-primary" : errors.declaration ? "border-rose-400" : "border-outline-variant/40"}`}>
															{form.declarationConfirmed && <Icon name="check" size={12} className="text-white" />}
														</div>
														<span className="text-sm font-semibold text-on-surface">{t("form.step7.declarationAgree")}</span>
													</label>
													{errors.declaration && <p className="mt-2 ml-8 text-xs text-rose-600 font-medium">{errors.declaration}</p>}
												</div>
											</div>
										</div>
									)}

									{submitError && (
										<p className="text-sm font-medium text-rose-600 dark:text-rose-300" role="alert">{submitError}</p>
									)}

									<div className="flex flex-wrap items-center justify-between gap-3 border-t border-outline-variant/10 pt-6">
										<Button type="button" variant="secondary" onClick={() => setStep(s => Math.max(0, s - 1))} disabled={step === 0}>
											{t("actions.back")}
										</Button>
										<div className="flex flex-wrap items-center gap-3">
											<Button href="/discovery" variant="secondary">
												{t("actions.cancel")}
											</Button>
											<Button type="submit" disabled={submitting}>
												{submitting ? t("actions.submitting") : step === STEPS.length - 1 ? t("actions.submit") : t("actions.continue")}
											</Button>
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
