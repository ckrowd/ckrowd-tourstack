"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { getTourstackProfile, updateTourstackProfile } from "@/app/actions";
import { useSession } from "@/context/AuthContext";

function Section({
	title,
	description,
	children,
}: {
	title: string;
	description?: string;
	children: React.ReactNode;
}) {
	return (
		<div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm space-y-6">
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
	placeholder,
}: {
	label: string;
	id: string;
	value?: string;
	onChange?: (v: string) => void;
	type?: string;
	hint?: string;
	required?: boolean;
	placeholder?: string;
}) {
	return (
		<div>
			<label
				htmlFor={id}
				className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5"
			>
				{label}
				{required && <span className="text-rose-500 ml-1">*</span>}
			</label>
			<input
				id={id}
				type={type}
				value={value ?? ""}
				placeholder={placeholder}
				onChange={onChange ? (e) => onChange(e.target.value) : undefined}
				readOnly={!onChange}
				className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30"
			/>
			{hint && <p className="text-xs text-on-surface-variant mt-1.5">{hint}</p>}
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
}: {
	label: string;
	id: string;
	value: string;
	onChange: (v: string) => void;
	options: { value: string; label: string }[];
	required?: boolean;
}) {
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
					className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30 appearance-none"
				>
					{options.map((opt) => (
						<option key={opt.value} value={opt.value}>
							{opt.label}
						</option>
					))}
				</select>
				<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-lg">
					expand_more
				</span>
			</div>
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
				currencyPreference: String(d.currency_preference ?? ""),
			};
		}
		return null;
	})();

	const [edits, setEdits] = useState<Partial<ProfileData>>({});
	const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
	const [logoError, setLogoError] = useState(false);

	const profile: ProfileData = { ...EMPTY, ...serverProfile, ...edits };

	const set = (key: keyof ProfileData) => (v: string) =>
		setEdits((p) => ({ ...p, [key]: v }));

	const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			const result = ev.target?.result as string;
			setEdits((p) => ({ ...p, logoUrl: result }));
			setLogoError(false);
		};
		reader.readAsDataURL(file);
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
		if (!profile.logoUrl) {
			setLogoError(true);
			window.scrollTo({ top: 0, behavior: "smooth" });
			return;
		}
		setLogoError(false);
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
		<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
			{isSetup && (
				<div className="mb-6 bg-[#FF5A30]/10 border border-[#FF5A30]/20 rounded-2xl p-5 flex items-start gap-4">
					<span
						className="material-symbols-outlined text-[#FF5A30] mt-0.5 shrink-0"
						style={{ fontVariationSettings: "'FILL' 1" }}
					>
						person_add
					</span>
					<div>
						<p className="font-(family-name:--font-manrope) font-semibold text-[#FF5A30] text-sm">
							{t("setupBanner.title")}
						</p>
						<p className="text-sm text-on-surface-variant mt-1">
							{t("setupBanner.description")}
						</p>
					</div>
				</div>
			)}

			<div className="mb-8">
				<span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A30] block mb-2">
					{t("promoterPortal")}
				</span>
				<h1 className="text-3xl font-semibold font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
					{t("title")}
				</h1>
				<p className="text-on-surface-variant">{t("description")}</p>
			</div>

			<div className="space-y-6">
				{/* Logo Upload */}
				<div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm">
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
							className="relative w-24 h-24 rounded-2xl overflow-hidden bg-surface-container-low border-2 border-dashed border-outline-variant/40 hover:border-[#FF5A30]/60 transition-colors flex items-center justify-center shrink-0 group"
							aria-label={t("logo.label")}
						>
							{profile.logoUrl ? (
								// eslint-disable-next-line @next/next/no-img-element -- src is a base64 data URL from FileReader; next/image does not support data: URIs
								<img
									src={profile.logoUrl}
									alt="Company logo"
									className="w-full h-full object-cover"
								/>
							) : (
								<span className="text-2xl font-semibold text-on-surface-variant group-hover:text-[#FF5A30] transition-colors">
									{initials}
								</span>
							)}
							<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
								<span className="material-symbols-outlined text-white text-2xl">photo_camera</span>
							</div>
						</button>
						<div>
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								className="inline-flex items-center gap-2 px-5 py-2.5 border border-outline-variant/40 rounded-xl text-sm font-semibold text-on-surface hover:border-[#FF5A30]/50 hover:text-[#FF5A30] transition-all"
							>
								<span className="material-symbols-outlined text-base">upload</span>
								Upload Image
							</button>
							{logoError && (
								<p className="text-xs text-rose-600 font-medium mt-2 flex items-center gap-1">
									<span className="material-symbols-outlined text-sm">error</span>
									{t("logo.required")}
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
				<Section title={t("companyInfo.title")} description={t("companyInfo.description")}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<Field
							label={t("companyInfo.fields.companyName")}
							id="company-name"
							value={profile.companyName}
							onChange={set("companyName")}
							required
						/>
						<Field
							label={t("companyInfo.fields.tradingName")}
							id="trading-name"
							value={profile.tradingName}
							onChange={set("tradingName")}
						/>
						<SelectField
							label={t("companyInfo.fields.companyType")}
							id="company-type"
							value={profile.companyType}
							onChange={set("companyType")}
							options={companyTypeOptions}
							required
						/>
						<Field
							label={t("companyInfo.fields.registrationNumber")}
							id="reg-number"
							value={profile.registrationNumber}
							onChange={set("registrationNumber")}
						/>
						<Field
							label={t("companyInfo.fields.taxId")}
							id="tax-id"
							value={profile.taxId}
							onChange={set("taxId")}
						/>
						<Field
							label={t("companyInfo.fields.incorporationDate")}
							id="inc-date"
							type="date"
							value={profile.incorporationDate}
							onChange={set("incorporationDate")}
						/>
						<Field
							label={t("companyInfo.fields.incorporationCountry")}
							id="inc-country"
							value={profile.incorporationCountry}
							onChange={set("incorporationCountry")}
						/>
					</div>
				</Section>

				{/* 2. Public Information */}
				<Section title={t("publicInfo.title")} description={t("publicInfo.description")}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<div className="md:col-span-2">
							<Field
								label={t("publicInfo.fields.primaryAddress")}
								id="primary-address"
								value={profile.primaryAddress}
								onChange={set("primaryAddress")}
								required
							/>
						</div>
						<Field
							label={t("publicInfo.fields.country")}
							id="country"
							value={profile.country}
							onChange={set("country")}
							required
						/>
						<Field
							label={t("publicInfo.fields.city")}
							id="city"
							value={profile.city}
							onChange={set("city")}
							required
						/>
						<Field
							label={t("publicInfo.fields.phone")}
							id="phone"
							type="tel"
							value={profile.phone}
							onChange={(v) => set("phone")(v.replace(/\D/g, ""))}
							required
						/>
						<Field
							label={t("publicInfo.fields.website")}
							id="website"
							type="url"
							value={profile.websiteUrl}
							onChange={set("websiteUrl")}
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
							onChange={(e) => set("bio")(e.target.value)}
							className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30 resize-none"
						/>
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

				{/* 3. Key Personnel */}
				<Section title={t("keyPersonnel.title")} description={t("keyPersonnel.description")}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<Field
							label={t("keyPersonnel.fields.contactPerson")}
							id="contact-name"
							value={profile.contactPerson}
							onChange={set("contactPerson")}
							required
						/>
						<Field
							label={t("keyPersonnel.fields.jobTitle")}
							id="job-title"
							value={profile.jobTitle}
							onChange={set("jobTitle")}
							required
						/>
						<Field
							label={t("keyPersonnel.fields.contactEmail")}
							id="contact-email"
							type="email"
							value={profile.contactEmail}
							onChange={set("contactEmail")}
							placeholder={session?.user?.email ?? ""}
							required
						/>
						<Field
							label={t("keyPersonnel.fields.phone")}
							id="contact-phone"
							type="tel"
							value={profile.phone}
							onChange={(v) => set("phone")(v.replace(/\D/g, ""))}
						/>
					</div>
				</Section>

				{/* 4. Business & Operational Details */}
				<Section title={t("businessDetails.title")} description={t("businessDetails.description")}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<Field
							label={t("businessDetails.fields.yearsInBusiness")}
							id="years-in-business"
							type="number"
							value={profile.yearsInBusiness}
							onChange={(v) => set("yearsInBusiness")(v.replace(/\D/g, ""))}
						/>
						<SelectField
							label={t("businessDetails.fields.companySize")}
							id="company-size"
							value={profile.companySize}
							onChange={set("companySize")}
							options={companySizeOptions}
						/>
						<Field
							label={t("businessDetails.fields.averageEventsYear")}
							id="avg-events"
							type="number"
							value={profile.averageEventsYear}
							onChange={(v) => set("averageEventsYear")(v.replace(/\D/g, ""))}
						/>
					</div>
					<Field
						label={t("businessDetails.fields.marketsRegions")}
						id="markets-regions"
						value={profile.marketsRegions}
						onChange={set("marketsRegions")}
						placeholder={t("businessDetails.fields.marketsRegionsPlaceholder")}
					/>
					<Field
						label={t("businessDetails.fields.genresSpecialties")}
						id="genres"
						value={profile.genresSpecialties}
						onChange={set("genresSpecialties")}
						placeholder={t("businessDetails.fields.genresSpecialtiesPlaceholder")}
					/>
				</Section>

				{/* 5. Financial & Banking Information */}
				<Section title={t("banking.title")} description={t("banking.description")}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<Field
							label={t("banking.fields.bankName")}
							id="bank-name"
							value={profile.bankName}
							onChange={set("bankName")}
						/>
						<Field
							label={t("banking.fields.bankAccountHolder")}
							id="bank-holder"
							value={profile.bankAccountHolder}
							onChange={set("bankAccountHolder")}
						/>
						<Field
							label={t("banking.fields.bankAccountNumber")}
							id="bank-account"
							value={profile.bankAccountNumber}
							onChange={set("bankAccountNumber")}
						/>
						<Field
							label={t("banking.fields.bankSwiftBic")}
							id="swift-bic"
							value={profile.bankSwiftBic}
							onChange={set("bankSwiftBic")}
						/>
						<Field
							label={t("banking.fields.currencyPreference")}
							id="currency"
							value={profile.currencyPreference}
							onChange={set("currencyPreference")}
							placeholder={t("banking.fields.currencyPlaceholder")}
						/>
					</div>
				</Section>

				<div className="flex items-center justify-end gap-4">
					{saveStatus === "success" && (
						<span className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
							<span
								className="material-symbols-outlined text-base"
								style={{ fontVariationSettings: "'FILL' 1" }}
							>
								check_circle
							</span>
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
						disabled={saveMutation.isPending}
						className="bg-[#FF5A30] text-white px-8 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all disabled:opacity-60"
					>
						{saveMutation.isPending ? t("actions.saving") : t("actions.save")}
					</button>
				</div>
			</div>
		</main>
	);
}
