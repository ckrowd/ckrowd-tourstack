"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Icon from "@/components/icons";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { getTourstackProfile, updateTourstackProfile, uploadImage } from "@/app/actions";
import { useSession } from "@/context/AuthContext";
import { resizeImageFile } from "@/lib/image";
import BankSelect from "@/components/ui/BankSelect";
import CurrencySelect from "@/components/ui/CurrencySelect";
import DatePicker from "@/components/ui/DatePicker";
import FormattedNumberInput from "@/components/ui/FormattedNumberInput";
import PageTour from "@/components/PageTour";

function Section({
	title,
	description,
	children,
	dataTour,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
	dataTour?: string;
}) {
	return (
		<div data-tour={dataTour} className="tsd-card p-6 md:p-8 space-y-6">
			<div className="border-b border-outline-variant/20 pb-4">
				<h3 className="font-(family-name:--font-manrope) font-semibold text-lg text-on-surface">
					{title}
				</h3>
				{description && (
					<p className="text-sm text-on-surface-variant mt-1">{description}</p>
				)}
			</div>
			{children}
		</div>
	);
}

function Field({
	label,
	id,
	value,
	onChange,
	type = "text",
	hint,
	required,
	showError,
	placeholder,
}: {
	label: string;
	id: string;
	value?: string;
	onChange?: (v: string) => void;
	type?: string;
	hint?: string;
	required?: boolean;
	showError?: boolean;
	placeholder?: string;
}) {
	const hasError = required && showError && !value?.trim();
	return (
		<div>
			<label
				htmlFor={id}
				className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5"
			>
				{label}
				{required && <span className="text-rose-500 ml-1">*</span>}
			</label>
			{type === "formatted-number" ? (
				<FormattedNumberInput
					id={id}
					value={value ?? ""}
					onChange={onChange ?? (() => {})}
					placeholder={placeholder}
					ariaInvalid={hasError}
					className={`w-full bg-surface-container-low border rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 ${hasError ? "border-rose-400 ring-1 ring-rose-300" : "border-outline-variant/30"}`}
				/>
			) : (
				<input
					id={id}
					type={type}
					value={value ?? ""}
					placeholder={placeholder}
					onChange={onChange ? (e) => onChange(e.target.value) : undefined}
					readOnly={!onChange}
					className={`w-full bg-surface-container-low border rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 ${hasError ? "border-rose-400 ring-1 ring-rose-300" : "border-outline-variant/30"}`}
				/>
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

function SelectField({
	label,
	id,
	value,
	onChange,
	options,
	required,
	showError,
}: {
	label: string;
	id: string;
	value: string;
	onChange: (v: string) => void;
	options: { value: string; label: string }[];
	required?: boolean;
	showError?: boolean;
}) {
	const hasError = required && showError && !value;
	return (
		<div>
			<label
				htmlFor={id}
				className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5"
			>
				{label}
				{required && <span className="text-rose-500 ml-1">*</span>}
			</label>
			<div className="relative">
				<select
					id={id}
					value={value}
					onChange={(e) => onChange(e.target.value)}
					className={`w-full bg-surface-container-low border rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none ${hasError ? "border-rose-400 ring-1 ring-rose-300" : "border-outline-variant/30"}`}
				>
					{options.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
				<Icon name="chevron-down" size={18} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant" />
			</div>
			{hasError && (
				<p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
					<Icon name="alert-circle" size={14} />
					Required
				</p>
			)}
		</div>
	);
}

type ProfileData = {
	companyName: string;
	tradingName: string;
	companyType: string;
	registrationNumber: string;
	taxId: string;
	incorporationDate: string;
	incorporationCountry: string;
	logoUrl: string;
	primaryAddress: string;
	country: string;
	city: string;
	phone: string;
	websiteUrl: string;
	bio: string;
	instagramHandle: string;
	xHandle: string;
	facebookHandle: string;
	tiktokHandle: string;
	contactPerson: string;
	jobTitle: string;
	contactEmail: string;
	yearsInBusiness: string;
	companySize: string;
	marketsRegions: string;
	genresSpecialties: string;
	averageEventsYear: string;
	bankName: string;
	bankAccountHolder: string;
	bankAccountNumber: string;
	bankSwiftBic: string;
	bankCode: string;
	payoutCurrency: string;
	currencyPreference: string;
};

const EMPTY: ProfileData = {
	companyName: "",
	tradingName: "",
	companyType: "",
	registrationNumber: "",
	taxId: "",
	incorporationDate: "",
	incorporationCountry: "",
	logoUrl: "",
	primaryAddress: "",
	country: "",
	city: "",
	phone: "",
	websiteUrl: "",
	bio: "",
	instagramHandle: "",
	xHandle: "",
	facebookHandle: "",
	tiktokHandle: "",
	contactPerson: "",
	jobTitle: "",
	contactEmail: "",
	yearsInBusiness: "",
	companySize: "",
	marketsRegions: "",
	genresSpecialties: "",
	averageEventsYear: "",
	bankName: "",
	bankAccountHolder: "",
	bankAccountNumber: "",
	bankSwiftBic: "",
	bankCode: "",
	payoutCurrency: "",
	currencyPreference: "",
};

export default function ProfileClient() {
	const t = useTranslations("ProfilePage");
	const queryClient = useQueryClient();
	const { data: session } = useSession();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [isSetup] = useState(
		() =>
			typeof window !== "undefined" &&
			new URLSearchParams(window.location.search).get("setup") === "1",
	);

	const { data: profileQuery } = useQuery({
		queryKey: ["tourstackProfile"],
		queryFn: getTourstackProfile,
	});

	const serverProfile = (() => {
		if (profileQuery?.success && profileQuery.data) {
			const d = profileQuery.data as Record<string, unknown>;
			return {
				companyName: String(d.company_name ?? ""),
				tradingName: String(d.trading_name ?? ""),
				companyType: String(d.company_type ?? ""),
				registrationNumber: String(d.registration_number ?? ""),
				taxId: String(d.tax_id ?? ""),
				incorporationDate: String(d.incorporation_date ?? ""),
				incorporationCountry: String(d.incorporation_country ?? ""),
				logoUrl: String(d.logo_url ?? ""),
				primaryAddress: String(d.primary_address ?? ""),
				country: String(d.country ?? ""),
				city: String(d.city ?? ""),
				phone: String(d.phone ?? ""),
				websiteUrl: String(d.website_url ?? ""),
				bio: String(d.bio ?? ""),
				instagramHandle: String(d.instagram_handle ?? ""),
				xHandle: String(d.x_handle ?? ""),
				facebookHandle: String(d.facebook_handle ?? ""),
				tiktokHandle: String(d.tiktok_handle ?? ""),
				contactPerson: String(d.contact_person ?? ""),
				jobTitle: String(d.job_title ?? ""),
				contactEmail: String(d.contact_email ?? ""),
				yearsInBusiness: d.years_in_business != null ? String(d.years_in_business) : "",
				companySize: String(d.company_size ?? ""),
				marketsRegions: String(d.markets_regions ?? ""),
				genresSpecialties: String(d.genres_specialties ?? ""),
				averageEventsYear: d.average_events_year != null ? String(d.average_events_year) : "",
				bankName: String(d.bank_name ?? ""),
				bankAccountHolder: String(d.bank_account_holder ?? ""),
				bankAccountNumber: String(d.bank_account_number ?? ""),
				bankSwiftBic: String(d.bank_swift_bic ?? ""),
				bankCode: String(d.bank_code ?? ""),
				payoutCurrency: String(d.payout_currency ?? ""),
				currencyPreference: String(d.currency_preference ?? ""),
			};
		}
		return null;
	})();

	const [edits, setEdits] = useState<Partial<ProfileData>>({});
	const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
	const [logoError, setLogoError] = useState(false);
	const [logoPreview, setLogoPreview] = useState<string | null>(null);
	const [showValidation, setShowValidation] = useState(false);
	const [activeTab, setActiveTab] = useState<"company" | "public" | "business" | "banking">("company");

	useEffect(() => {
		return () => {
			if (logoPreview) URL.revokeObjectURL(logoPreview);
		};
	}, [logoPreview]);

	const REQUIRED_KEYS: (keyof ProfileData)[] = [
		"companyName", "companyType", "registrationNumber", "taxId",
		"incorporationDate", "incorporationCountry",
		"primaryAddress", "country", "city", "phone", "bio",
		"contactPerson", "jobTitle", "contactEmail",
		"yearsInBusiness", "companySize", "averageEventsYear",
		"genresSpecialties",
		"bankName", "bankAccountHolder", "bankAccountNumber", "bankSwiftBic", "currencyPreference",
	];

	const profile: ProfileData = { ...EMPTY, ...serverProfile, ...edits };
	// marketsRegions is only required for company types that show it as required
	// in the form below — keep this in sync with the Field's `required` prop.
	const needsMarkets = profile.companyType === "promoter" || profile.companyType === "artistManagement";
	const missingRequired =
		REQUIRED_KEYS.some((k) => !profile[k]?.trim?.() && !profile[k]) ||
		(needsMarkets && !profile.marketsRegions?.trim());

	const set = (key: keyof ProfileData) => (v: string) =>
		setEdits((p) => ({ ...p, [key]: v }));

	// ── Tab system ─────────────────────────────────────────────────────────
	// One shared form state across tabs; panels conditionally render, so
	// switching tabs never loses edits. Per-tab required-key mapping powers
	// the validation badges and the jump-to-first-invalid-tab on save.
	type ProfileTab = "company" | "public" | "business" | "banking";
	const TABS: ProfileTab[] = ["company", "public", "business", "banking"];
	const TAB_ICONS: Record<ProfileTab, string> = {
		company: "building",
		public: "globe",
		business: "briefcase",
		banking: "financing",
	};
	const TAB_FIELDS: Record<ProfileTab, (keyof ProfileData)[]> = {
		company: ["companyName", "companyType", "registrationNumber", "taxId", "incorporationDate", "incorporationCountry"],
		public: ["primaryAddress", "country", "city", "phone", "bio"],
		business: ["contactPerson", "jobTitle", "contactEmail", "yearsInBusiness", "companySize", "averageEventsYear", "genresSpecialties"],
		banking: ["bankName", "bankAccountHolder", "bankAccountNumber", "bankSwiftBic", "currencyPreference"],
	};
	const tabMissing = (tab: ProfileTab) =>
		TAB_FIELDS[tab].some((k) => !profile[k]?.trim?.() && !profile[k]) ||
		(tab === "company" && !profile.logoUrl) ||
		(tab === "business" && needsMarkets && !profile.marketsRegions?.trim());
	const stepIndex = TABS.indexOf(activeTab);
	const doneCount = TABS.filter((tb) => !tabMissing(tb)).length;
	const goToStep = (tb: ProfileTab) => {
		setActiveTab(tb);
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const logoUploadMutation = useMutation({
		mutationFn: uploadImage,
		onSuccess: (result) => {
			if (result.success) {
				setEdits((p) => ({ ...p, logoUrl: result.data }));
				setLogoError(false);
			}
		},
	});

	const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		setLogoPreview((prev) => {
			if (prev) URL.revokeObjectURL(prev);
			return URL.createObjectURL(file);
		});
		const resized = await resizeImageFile(file);
		const formData = new FormData();
		formData.append("file", resized);
		logoUploadMutation.mutate(formData);
	};

	const saveMutation = useMutation({
		mutationFn: updateTourstackProfile,
		onSuccess: (result) => {
			if (result.success) {
				setEdits({});
				setSaveStatus("success");
				void queryClient.invalidateQueries({ queryKey: ["tourstackProfile"] });
			} else {
				setSaveStatus("error");
			}
			setTimeout(() => setSaveStatus("idle"), 3000);
		},
		onError: () => {
			setSaveStatus("error");
			setTimeout(() => setSaveStatus("idle"), 3000);
		},
	});

	const handleSave = () => {
		if (!profile.logoUrl || missingRequired) {
			setLogoError(!profile.logoUrl);
			setShowValidation(true);
			const firstInvalid = TABS.find((tb) => tabMissing(tb));
			if (firstInvalid) setActiveTab(firstInvalid);
			window.scrollTo({ top: 0, behavior: "smooth" });
			return;
		}
		setLogoError(false);
		setShowValidation(false);
		setSaveStatus("idle");
		saveMutation.mutate({
			companyName: profile.companyName || undefined,
			tradingName: profile.tradingName || undefined,
			companyType: profile.companyType || undefined,
			registrationNumber: profile.registrationNumber || undefined,
			taxId: profile.taxId || undefined,
			incorporationDate: profile.incorporationDate || undefined,
			incorporationCountry: profile.incorporationCountry || undefined,
			logoUrl: profile.logoUrl || undefined,
			primaryAddress: profile.primaryAddress || undefined,
			country: profile.country || undefined,
			city: profile.city || undefined,
			phone: profile.phone || undefined,
			websiteUrl: profile.websiteUrl || undefined,
			bio: profile.bio || undefined,
			instagramHandle: profile.instagramHandle || undefined,
			xHandle: profile.xHandle || undefined,
			facebookHandle: profile.facebookHandle || undefined,
			tiktokHandle: profile.tiktokHandle || undefined,
			contactPerson: profile.contactPerson || undefined,
			jobTitle: profile.jobTitle || undefined,
			contactEmail: profile.contactEmail || undefined,
			yearsInBusiness: profile.yearsInBusiness ? Number(profile.yearsInBusiness) : undefined,
			companySize: profile.companySize || undefined,
			marketsRegions: profile.marketsRegions || undefined,
			genresSpecialties: profile.genresSpecialties || undefined,
			averageEventsYear: profile.averageEventsYear ? Number(profile.averageEventsYear) : undefined,
			bankName: profile.bankName || undefined,
			bankAccountHolder: profile.bankAccountHolder || undefined,
			bankAccountNumber: profile.bankAccountNumber || undefined,
			bankSwiftBic: profile.bankSwiftBic || undefined,
			bankCode: profile.bankCode || undefined,
			payoutCurrency: profile.payoutCurrency || undefined,
			currencyPreference: profile.currencyPreference || undefined,
		});
	};

	const companyTypeOptions = [
		{ value: "", label: t("companyInfo.companyTypes.placeholder") },
		{ value: "promoter", label: t("companyInfo.companyTypes.promoter") },
		{ value: "venueOperator", label: t("companyInfo.companyTypes.venueOperator") },
		{ value: "recordLabel", label: t("companyInfo.companyTypes.recordLabel") },
		{ value: "artistManagement", label: t("companyInfo.companyTypes.artistManagement") },
		{ value: "talentAgency", label: t("companyInfo.companyTypes.talentAgency") },
		{ value: "productionCompany", label: t("companyInfo.companyTypes.productionCompany") },
		{ value: "eventAgency", label: t("companyInfo.companyTypes.eventAgency") },
		{ value: "entertainmentGroup", label: t("companyInfo.companyTypes.entertainmentGroup") },
		{ value: "other", label: t("companyInfo.companyTypes.other") },
	];

	const companySizeOptions = [
		{ value: "", label: t("businessDetails.companySizes.placeholder") },
		{ value: "1-5", label: t("businessDetails.companySizes.s1to5") },
		{ value: "6-20", label: t("businessDetails.companySizes.s6to20") },
		{ value: "21-50", label: t("businessDetails.companySizes.s21to50") },
		{ value: "51-200", label: t("businessDetails.companySizes.s51to200") },
		{ value: "200+", label: t("businessDetails.companySizes.s200plus") },
	];

	const initials = profile.companyName
		? profile.companyName.slice(0, 2).toUpperCase()
		: session?.user?.email?.slice(0, 2).toUpperCase() ?? "?";

	return (
		<main className="flex-1 lg:ml-64 bg-surface p-6 md:p-10">
			<PageTour pageId="profile" />
			{isSetup && (
				<div className="mb-6 bg-primary/10 border border-primary/20 rounded-2xl p-5 flex items-start gap-4">
					<Icon name="user-plus" size={18} className="text-primary mt-0.5 shrink-0" />
					<div>
						<p className="font-(family-name:--font-manrope) font-semibold text-primary text-sm">
							{t("setupBanner.title")}
						</p>
						<p className="text-sm text-on-surface-variant mt-1">
							{t("setupBanner.description")}
						</p>
					</div>
				</div>
			)}

			<div className="mb-8">
				<span className="text-xs font-semibold uppercase tracking-widest text-primary block mb-2">
					{t("promoterPortal")}
				</span>
				<h1 className="text-3xl font-semibold font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
					{t("title")}
				</h1>
				<p className="text-on-surface-variant">{t("description")}</p>
			</div>

			{/* Journey rail */}
			<div className="tsd-card p-5 md:p-6 mb-8">
				<ol className="flex items-center gap-0">
					{TABS.map((tb, idx) => {
						const complete = !tabMissing(tb);
						const active = activeTab === tb;
						const invalid = showValidation && tabMissing(tb);
						return (
							<li key={tb} className="flex items-center flex-1 last:flex-none min-w-0">
								<button
									type="button"
									onClick={() => goToStep(tb)}
									className="group flex items-center gap-2.5 min-w-0"
								>
									<span
										className={`flex items-center justify-center w-8 h-8 rounded-full border text-xs font-semibold shrink-0 transition-all duration-300 [transition-timing-function:var(--ease-out)] ${
											complete
												? "bg-emerald-500 border-emerald-500 text-white"
												: invalid
													? "border-rose-500 text-rose-500"
													: active
														? "border-primary text-primary bg-primary/10"
														: "border-outline-variant text-on-surface-variant group-hover:border-on-surface-variant"
										}`}
									>
										{complete ? (
											<Icon name="check" size={14} strokeWidth={2.5} />
										) : (
											String(idx + 1).padStart(2, "0")
										)}
									</span>
									<span
										className={`hidden md:flex flex-col items-start min-w-0 text-left ${active ? "" : "opacity-70 group-hover:opacity-100"} transition-opacity`}
									>
										<span
											className={`text-sm truncate ${active ? "font-semibold text-on-surface" : "font-medium text-on-surface-variant"}`}
										>
											{t(`tabs.${tb}`)}
										</span>
									</span>
								</button>
								{idx < TABS.length - 1 && (
									<span className="flex-1 h-px mx-3 md:mx-4 relative bg-outline-variant overflow-hidden rounded-full">
										<span
											className="absolute inset-y-0 left-0 bg-emerald-500 transition-[width] duration-500 [transition-timing-function:var(--ease-out)]"
											style={{ width: complete ? "100%" : "0%" }}
										/>
									</span>
								)}
							</li>
						);
					})}
				</ol>
				<div className="flex items-center justify-between gap-4 mt-5">
					<p
						className={`text-xs font-medium ${doneCount === TABS.length ? "text-emerald-500" : "text-on-surface-variant"}`}
					>
						{doneCount === TABS.length
							? t("journey.ready")
							: t("journey.progress", { done: doneCount, total: TABS.length })}
					</p>
					<div className="w-32 md:w-48 h-1.5 rounded-full bg-surface-container-high overflow-hidden">
						<div
							className={`h-full rounded-full transition-[width] duration-500 [transition-timing-function:var(--ease-out)] ${doneCount === TABS.length ? "bg-emerald-500" : "bg-primary"}`}
							style={{ width: `${(doneCount / TABS.length) * 100}%` }}
						/>
					</div>
				</div>
			</div>

			<div key={activeTab} className="tsd-rise space-y-6">
				{activeTab === "company" && (<>
				{/* Logo Upload */}
				<div data-tour="profile-logo" className="tsd-card p-6 md:p-8">
					<div className="border-b border-outline-variant/20 pb-4 mb-6">
						<h3 className="font-(family-name:--font-manrope) font-semibold text-lg text-on-surface">
							{t("logo.label")}
							<span className="text-rose-500 ml-1">*</span>
						</h3>
						<p className="text-sm text-on-surface-variant mt-1">{t("logo.hint")}</p>
					</div>
					<div className="flex items-center gap-6">
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className="relative w-24 h-24 rounded-2xl overflow-hidden bg-surface-container-low border-2 border-dashed border-outline-variant/40 hover:border-primary/60 transition-colors flex items-center justify-center shrink-0 group"
							aria-label={t("logo.label")}
						>
							{logoPreview || profile.logoUrl ? (
								// eslint-disable-next-line @next/next/no-img-element -- src may be a blob: object URL (local preview) or an existing base64 data URL from before this was migrated to object storage; next/image supports neither
								<img
									src={logoPreview ?? profile.logoUrl}
									alt="Company logo"
									className="w-full h-full object-cover"
								/>
							) : (
								<span className="text-2xl font-semibold text-on-surface-variant group-hover:text-primary transition-colors">
									{initials}
								</span>
							)}
							{logoUploadMutation.isPending && (
								<div className="absolute inset-0 bg-black/50 flex items-center justify-center">
									<Icon name="loader" size={24} className="text-white animate-spin" />
								</div>
							)}
							<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
								<Icon name="camera" size={24} className="text-white" />
							</div>
						</button>
						<div>
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								disabled={logoUploadMutation.isPending}
								className="inline-flex items-center gap-2 px-5 py-2.5 border border-outline-variant/40 rounded-xl text-sm font-semibold text-on-surface hover:border-primary/50 hover:text-primary transition-all disabled:opacity-50 disabled:cursor-not-allowed"
							>
								<Icon name="upload" size={16} />
								{logoUploadMutation.isPending ? t("logo.uploading") : "Upload Image"}
							</button>
							{logoError && (
								<p className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1">
									<Icon name="alert-circle" size={14} />
									{t("logo.required")}
								</p>
							)}
							{(logoUploadMutation.isError || logoUploadMutation.data?.success === false) && (
								<p className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1">
									<Icon name="alert-circle" size={14} />
									{t("logo.uploadFailed")}
								</p>
							)}
						</div>
					</div>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						className="sr-only"
						onChange={handleLogoUpload}
					/>
				</div>

				{/* 1. Company Information */}
				<Section dataTour="profile-company" title={t("companyInfo.title")} description={t("companyInfo.description")}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<Field
							label={t("companyInfo.fields.companyName")}
							id="company-name"
							value={profile.companyName}
							onChange={set("companyName")}
							placeholder={t("companyInfo.fields.companyNamePlaceholder")}
							required
							showError={showValidation}
						/>
						<Field
							label={t("companyInfo.fields.tradingName")}
							id="trading-name"
							value={profile.tradingName}
							onChange={set("tradingName")}
							placeholder={t("companyInfo.fields.tradingNamePlaceholder")}
						/>
						<SelectField
							label={t("companyInfo.fields.companyType")}
							id="company-type"
							value={profile.companyType}
							onChange={set("companyType")}
							options={companyTypeOptions}
							required
							showError={showValidation}
						/>
						<Field
							label={t("companyInfo.fields.registrationNumber")}
							id="reg-number"
							value={profile.registrationNumber}
							onChange={set("registrationNumber")}
							placeholder={t("companyInfo.fields.registrationNumberPlaceholder")}
							required
							showError={showValidation}
						/>
						<Field
							label={t("companyInfo.fields.taxId")}
							id="tax-id"
							value={profile.taxId}
							onChange={set("taxId")}
							placeholder={t("companyInfo.fields.taxIdPlaceholder")}
							required
							showError={showValidation}
						/>
						<DatePicker
							label={t("companyInfo.fields.incorporationDate")}
							id="inc-date"
							value={profile.incorporationDate}
							onChange={set("incorporationDate")}
							required
							showError={showValidation}
						/>
						<Field
							label={t("companyInfo.fields.incorporationCountry")}
							id="inc-country"
							value={profile.incorporationCountry}
							onChange={set("incorporationCountry")}
							placeholder={t("companyInfo.fields.incorporationCountryPlaceholder")}
							required
							showError={showValidation}
						/>
					</div>
				</Section>
				</>)}

				{/* 2. Public Information */}
				{activeTab === "public" && (
				<Section title={t("publicInfo.title")} description={t("publicInfo.description")}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<div className="md:col-span-2">
							<Field
								label={t("publicInfo.fields.primaryAddress")}
								id="primary-address"
								value={profile.primaryAddress}
								onChange={set("primaryAddress")}
								placeholder={t("publicInfo.fields.primaryAddressPlaceholder")}
								required
								showError={showValidation}
							/>
						</div>
						<Field
							label={t("publicInfo.fields.country")}
							id="country"
							value={profile.country}
							onChange={set("country")}
							placeholder={t("publicInfo.fields.countryPlaceholder")}
							required
							showError={showValidation}
						/>
						<Field
							label={t("publicInfo.fields.city")}
							id="city"
							value={profile.city}
							onChange={set("city")}
							placeholder={t("publicInfo.fields.cityPlaceholder")}
							required
							showError={showValidation}
						/>
						<Field
							label={t("publicInfo.fields.phone")}
							id="phone"
							type="tel"
							value={profile.phone}
							onChange={(v) => set("phone")(v.replace(/\D/g, ""))}
							placeholder={t("publicInfo.fields.phonePlaceholder")}
							required
							showError={showValidation}
						/>
						<Field
							label={t("publicInfo.fields.website")}
							id="website"
							type="url"
							value={profile.websiteUrl}
							onChange={set("websiteUrl")}
							placeholder={t("publicInfo.fields.websitePlaceholder")}
						/>
					</div>
					<div>
						<label
							htmlFor="bio"
							className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5"
						>
							{t("publicInfo.fields.bio")}
							<span className="text-rose-500 ml-1">*</span>
						</label>
						<textarea
							id="bio"
							rows={4}
							value={profile.bio}
							placeholder={t("publicInfo.fields.bioPlaceholder")}
							onChange={(e) => set("bio")(e.target.value)}
							className={`w-full bg-surface-container-low border rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none ${showValidation && !profile.bio.trim() ? "border-rose-400 ring-1 ring-rose-300" : "border-outline-variant/30"}`}
						/>
						{showValidation && !profile.bio.trim() && (
							<p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
								<Icon name="alert-circle" size={14} />
								Required
							</p>
						)}
					</div>
					<div>
						<p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
							Social Handles{" "}
							<span className="font-normal normal-case tracking-normal text-on-surface-variant/60">
								{t("publicInfo.fields.socialOptional")}
							</span>
						</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
							<Field
								label={t("publicInfo.fields.instagram")}
								id="instagram"
								value={profile.instagramHandle}
								onChange={set("instagramHandle")}
								placeholder="@handle"
							/>
							<Field
								label={t("publicInfo.fields.x")}
								id="x-handle"
								value={profile.xHandle}
								onChange={set("xHandle")}
								placeholder="@handle"
							/>
							<Field
								label={t("publicInfo.fields.facebook")}
								id="facebook"
								value={profile.facebookHandle}
								onChange={set("facebookHandle")}
								placeholder="@page"
							/>
							<Field
								label={t("publicInfo.fields.tiktok")}
								id="tiktok"
								value={profile.tiktokHandle}
								onChange={set("tiktokHandle")}
								placeholder="@handle"
							/>
						</div>
					</div>
				</Section>
				)}

				{/* 3. Key Personnel */}
				{activeTab === "business" && (<>
				<Section title={t("keyPersonnel.title")} description={t("keyPersonnel.description")}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<Field
							label={t("keyPersonnel.fields.contactPerson")}
							id="contact-name"
							value={profile.contactPerson}
							onChange={set("contactPerson")}
							placeholder={t("keyPersonnel.fields.contactPersonPlaceholder")}
							required
							showError={showValidation}
						/>
						<Field
							label={t("keyPersonnel.fields.jobTitle")}
							id="job-title"
							value={profile.jobTitle}
							onChange={set("jobTitle")}
							placeholder={t("keyPersonnel.fields.jobTitlePlaceholder")}
							required
							showError={showValidation}
						/>
						<Field
							label={t("keyPersonnel.fields.contactEmail")}
							id="contact-email"
							type="email"
							value={profile.contactEmail}
							onChange={set("contactEmail")}
							placeholder={session?.user?.email ?? ""}
							required
							showError={showValidation}
						/>
						<Field
							label={t("keyPersonnel.fields.phone")}
							id="contact-phone"
							type="tel"
							value={profile.phone}
							onChange={(v) => set("phone")(v.replace(/\D/g, ""))}
							placeholder={t("keyPersonnel.fields.phonePlaceholder")}
						/>
					</div>
				</Section>

				{/* 4. Business & Operational Details */}
				<Section title={t("businessDetails.title")} description={t("businessDetails.description")}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<Field
							label={t("businessDetails.fields.yearsInBusiness")}
							id="years-in-business"
							type="formatted-number"
							value={profile.yearsInBusiness}
							onChange={set("yearsInBusiness")}
							placeholder={t("businessDetails.fields.yearsInBusinessPlaceholder")}
							required
							showError={showValidation}
						/>
						<SelectField
							label={t("businessDetails.fields.companySize")}
							id="company-size"
							value={profile.companySize}
							onChange={set("companySize")}
							options={companySizeOptions}
							required
							showError={showValidation}
						/>
						<Field
							label={t("businessDetails.fields.averageEventsYear")}
							id="avg-events"
							type="formatted-number"
							value={profile.averageEventsYear}
							onChange={set("averageEventsYear")}
							placeholder={t("businessDetails.fields.averageEventsYearPlaceholder")}
							required
							showError={showValidation}
						/>
					</div>
					<Field
						label={t("businessDetails.fields.marketsRegions")}
						id="markets-regions"
						value={profile.marketsRegions}
						onChange={set("marketsRegions")}
						placeholder={t("businessDetails.fields.marketsRegionsPlaceholder")}
						required={profile.companyType === "promoter" || profile.companyType === "artistManagement"}
						showError={showValidation}
					/>
					<Field
						label={t("businessDetails.fields.genresSpecialties")}
						id="genres"
						value={profile.genresSpecialties}
						onChange={set("genresSpecialties")}
						placeholder={t("businessDetails.fields.genresSpecialtiesPlaceholder")}
						required
						showError={showValidation}
					/>
				</Section>
				</>)}

				{/* 5. Financial & Banking Information */}
				{activeTab === "banking" && (
				<Section title={t("banking.title")} description={t("banking.description")}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<BankSelect
							value={{
								bankCode: profile.bankCode,
								bankName: profile.bankName,
								accountNumber: profile.bankAccountNumber,
								accountHolder: profile.bankAccountHolder,
							}}
							onChange={(next) =>
								setEdits((p) => ({
									...p,
									bankCode: next.bankCode,
									bankName: next.bankName,
									bankAccountNumber: next.accountNumber,
									bankAccountHolder: next.accountHolder,
								}))
							}
							required
							showError={showValidation}
							labels={{
								bank: t("banking.fields.bankName"),
								bankSelectPlaceholder: t("banking.fields.bankSelectPlaceholder"),
								bankLoading: t("banking.fields.bankLoading"),
								bankPlaceholder: t("banking.fields.bankNamePlaceholder"),
								accountNumber: t("banking.fields.bankAccountNumber"),
								accountNumberPlaceholder: t("banking.fields.bankAccountNumberPlaceholder"),
								verify: t("banking.fields.verify"),
								verifying: t("banking.fields.verifying"),
								verified: t("banking.fields.verified"),
								verifyFailed: t("banking.fields.verifyFailed"),
								accountHolder: t("banking.fields.bankAccountHolder"),
								accountHolderPlaceholder: t("banking.fields.bankAccountHolderPlaceholder"),
							}}
						/>
						<Field
							label={t("banking.fields.bankSwiftBic")}
							id="swift-bic"
							value={profile.bankSwiftBic}
							onChange={set("bankSwiftBic")}
							placeholder={t("banking.fields.bankSwiftBicPlaceholder")}
							required
							showError={showValidation}
						/>
						<CurrencySelect
							label={t("banking.fields.currencyPreference")}
							id="currency"
							value={profile.currencyPreference}
							onChange={set("currencyPreference")}
							placeholder={t("banking.fields.currencySelectPlaceholder")}
							required
							showError={showValidation}
						/>
						<CurrencySelect
							label={t("banking.fields.payoutCurrency")}
							id="payout-currency"
							value={profile.payoutCurrency}
							onChange={set("payoutCurrency")}
							placeholder={t("banking.fields.payoutCurrencySelectPlaceholder")}
						/>
					</div>
				</Section>
				)}

				<div className="flex items-center justify-between gap-4">
					{stepIndex > 0 ? (
						<button
							type="button"
							onClick={() => goToStep(TABS[stepIndex - 1])}
							className="inline-flex items-center gap-2 px-5 py-3 rounded-xl border border-outline-variant text-sm font-semibold text-on-surface-variant hover:text-on-surface hover:border-on-surface-variant transition-colors"
						>
							<Icon name="arrow-left" size={15} />
							{t("journey.back")}
						</button>
					) : (
						<span />
					)}
					<div className="flex items-center gap-4">
					{showValidation && missingRequired && (
						<span className="flex items-center gap-1.5 text-sm font-semibold text-rose-600">
							<Icon name="alert-circle" size={16} />
							{t("actions.requiredFields")}
						</span>
					)}
					{saveStatus === "success" && (
						<span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
							<Icon name="check-circle" size={16} />
							{t("actions.saveSuccess")}
						</span>
					)}
					{saveStatus === "error" && (
						<span className="text-sm font-semibold text-rose-600">
							{t("actions.saveError")}
						</span>
					)}
					<button
						type="button"
						onClick={handleSave}
						disabled={saveMutation.isPending || logoUploadMutation.isPending}
						className="bg-primary text-white px-8 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:opacity-60"
					>
						{saveMutation.isPending ? t("actions.saving") : t("actions.save")}
					</button>
					{stepIndex < TABS.length - 1 && (
						<button
							type="button"
							onClick={() => goToStep(TABS[stepIndex + 1])}
							className="inline-flex items-center gap-2 bg-surface-container-highest text-on-surface px-6 py-3 rounded-xl font-semibold text-sm hover:bg-surface-container-high transition-colors"
						>
							{t("journey.continue")}
							<Icon name="arrow-right" size={15} />
						</button>
					)}
					</div>
				</div>
			</div>
		</main>
	);
}
