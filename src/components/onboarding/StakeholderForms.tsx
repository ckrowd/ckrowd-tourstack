"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { VENDOR_CATEGORIES, WORKFORCE_DEPARTMENTS } from "@/lib/stakeholderTaxonomy";
import GroupedMultiSelect from "./GroupedMultiSelect";

// ─── Shared types ────────────────────────────────────────────────────────────────

export type StakeholderCategory = "service" | "workforce" | "artmgmt";

export type SubmitPayload = {
	name: string;
	email: string;
	phone: string;
	company?: string;
	country: string;
	extraData?: Record<string, unknown>;
};

export type StakeholderFormProps = {
	onSubmit: (data: SubmitPayload) => void;
	submitError: string | null;
	isPending: boolean;
};

// ─── Constants ──────────────────────────────────────────────────────────────────

const SP_COVERAGE = ["local", "national", "regional", "international"] as const;
const SP_YEARS = ["under_1", "1_3", "4_7", "8_plus"] as const;

const WF_LARGEST = ["under_500", "500_2000", "2000_10000", "10000_50000", "over_50000"] as const;
const WF_EXPERIENCE = ["0_1", "1_3", "3_5", "5_10", "10_plus"] as const;
const WF_TOURING = ["relocate", "flexible", "local_only"] as const;
const WF_GENDERS = ["male", "female", "other", "prefer_not"] as const;

const AM_YEARS = ["under_1", "1_3", "4_7", "8_plus"] as const;
const AM_ROSTER = ["1_2", "3_5", "6_10", "11_20", "20_plus"] as const;
const AM_DEALS = ["flat_fee", "percentage_split", "nda_required", "open_to_negotiation"] as const;

// Tokens resolve against the funnel's `.ts-theme` wrapper (dark + `.light`).
// Fallbacks match the light palette so the form also renders correctly on the
// standalone white-card `/stakeholders/[token]` page (outside any ts-theme).
const labelCls =
	"block text-[10px] font-semibold uppercase tracking-widest text-[var(--muted,#5c5c5c)] mb-1.5";
const inputCls =
	"w-full rounded-xl bg-[var(--surface-2,#ececea)] text-[var(--text,#0c0c0c)] px-4 py-3 text-sm border border-[var(--hair,rgba(0,0,0,0.1))] focus:outline-none focus:ring-2 focus:ring-orange/20 focus:border-orange/50";
const chipBase =
	"px-3 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer";
const chipActive = "bg-orange text-white border-orange";
const chipInactive =
	"border-[var(--hair,rgba(0,0,0,0.1))] text-[var(--muted,#5c5c5c)] hover:border-orange/40";

// ─── Shared Components ───────────────────────────────────────────────────────────

export function BrandHeader() {
	return (
		<div className="flex items-center justify-center gap-2.5 mb-6">
			<Image src="/ckrowd-logo.png" alt="Ckrowd" width={36} height={36} />
			<div className="flex flex-col leading-tight">
				<span className="text-lg font-black tracking-tight text-orange font-(family-name:--font-manrope)">
					TourStack
				</span>
				<span className="text-[10px] font-semibold text-[var(--text,#0c0c0c)] font-(family-name:--font-manrope)">
					by Ckrowd
				</span>
			</div>
		</div>
	);
}

function StepIndicator({ labels, current }: { labels: string[]; current: number }) {
	return (
		<div className="flex items-center gap-1 mb-6">
			{labels.map((label, i) => (
				<div key={label} className="flex items-center gap-1 flex-1 last:flex-none">
					<div className="flex items-center gap-1.5 shrink-0">
						<div
							className={`w-6 h-6 rounded-full text-[10px] font-semibold flex items-center justify-center shrink-0 ${
								i < current
									? "bg-orange text-white"
									: i === current
										? "border-2 border-orange text-orange"
										: "border-2 border-[var(--hair,rgba(0,0,0,0.1))] text-[var(--muted,#5c5c5c)]"
							}`}
						>
							{i < current ? (
								<span className="material-symbols-outlined text-xs">check</span>
							) : (
								i + 1
							)}
						</div>
						<span
							className={`text-[10px] font-semibold hidden sm:block whitespace-nowrap ${
								i === current ? "text-orange" : i < current ? "text-[var(--text,#0c0c0c)]" : "text-[var(--muted,#5c5c5c)]"
							}`}
						>
							{label}
						</span>
					</div>
					{i < labels.length - 1 && (
						<div
							className={`flex-1 h-px mx-1 ${i < current ? "bg-orange" : "bg-[var(--hair,rgba(0,0,0,0.1))]"}`}
						/>
					)}
				</div>
			))}
		</div>
	);
}

function RadioGroup({
	options,
	value,
	onChange,
	error = false,
}: {
	options: { value: string; label: string }[];
	value: string;
	onChange: (v: string) => void;
	error?: boolean;
}) {
	return (
		<div className={`flex flex-wrap gap-2 ${error ? "rounded-xl ring-2 ring-rose-400/70 p-2" : ""}`}>
			{options.map((opt) => (
				<button
					key={opt.value}
					type="button"
					onClick={() => onChange(opt.value)}
					className={`${chipBase} ${value === opt.value ? chipActive : chipInactive}`}
				>
					{opt.label}
				</button>
			))}
		</div>
	);
}

function CheckboxGroup({
	options,
	values,
	onChange,
}: {
	options: { value: string; label: string }[];
	values: string[];
	onChange: (values: string[]) => void;
}) {
	const toggle = (v: string) =>
		onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
	return (
		<div className="flex flex-wrap gap-2">
			{options.map((opt) => (
				<button
					key={opt.value}
					type="button"
					onClick={() => toggle(opt.value)}
					className={`${chipBase} ${values.includes(opt.value) ? chipActive : chipInactive}`}
				>
					{opt.label}
				</button>
			))}
		</div>
	);
}

function StepNav({
	step,
	onBack,
	isLastStep,
	isPending,
	submitLabel,
	submittingLabel,
}: {
	step: number;
	onBack: () => void;
	isLastStep: boolean;
	isPending: boolean;
	submitLabel: string;
	submittingLabel: string;
}) {
	const t = useTranslations("StakeholderRegistrationPage");
	return (
		<div className="flex gap-3 mt-6">
			{step > 0 && (
				<button
					type="button"
					onClick={onBack}
					className="flex-1 rounded-xl border border-[var(--hair,rgba(0,0,0,0.1))] py-3 text-sm font-semibold text-[var(--text,#0c0c0c)] hover:bg-[var(--surface-2,#ececea)] transition-colors"
				>
					{t("steps.back" as never)}
				</button>
			)}
			<button
				type="submit"
				disabled={isPending}
				className="flex-1 rounded-xl bg-orange text-white py-3 text-sm font-semibold hover:opacity-90 disabled:opacity-60 transition-opacity"
			>
				{isLastStep ? (isPending ? submittingLabel : submitLabel) : t("steps.next" as never)}
			</button>
		</div>
	);
}

function ValidationBanner({ message }: { message: string }) {
	return (
		<p className="mt-4 flex items-center gap-2 text-sm text-rose-700 font-medium">
			<span className="material-symbols-outlined text-sm shrink-0">error</span>
			{message}
		</p>
	);
}

// ─── Service Provider Form ───────────────────────────────────────────────────────

export function ServiceProviderForm({ onSubmit, submitError, isPending }: StakeholderFormProps) {
	const t = useTranslations("StakeholderRegistrationPage");
	const [step, setStep] = useState(0);
	const [form, setForm] = useState({
		// Step 0
		contactName: "", jobTitle: "", companyName: "", companyRegNumber: "", email: "",
		phone: "", whatsapp: "", country: "", city: "", website: "", instagram: "",
		// Step 1
		serviceTypes: [] as string[], otherServiceType: "", serviceDescription: "",
		serviceCoverage: "", yearsInOperation: "",
		largestEventServed: "", notableClients: "", certifications: "",
		businessRegistered: "", hasInsurance: "",
		// Step 2
		representativeName: "", declarationDate: new Date().toISOString().slice(0, 10),
		clause1: false, clause2: false, clause3: false,
	});

	const [failedFields, setFailedFields] = useState<Set<string>>(new Set());
	const clearFailed = (key: string) =>
		setFailedFields((s) => { const n = new Set(s); n.delete(key); return n; });

	const f =
		(k: keyof typeof form) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
			setForm((p) => ({ ...p, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

	const pf = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
		setForm((p) => ({ ...p, [k]: e.target.value.replace(/[^\d+\s\-()]/g, "") }));

	const stepLabels = [
		t("serviceProvider.steps.step1" as never),
		t("serviceProvider.steps.step2" as never),
		t("serviceProvider.steps.step3" as never),
	];

	const tx = useTranslations("StakeholderTaxonomy");
	const coverageOptions = SP_COVERAGE.map((v) => ({ value: v, label: t(`serviceProvider.serviceCoverageOptions.${v}` as never) }));
	const yearsOptions = SP_YEARS.map((v) => ({ value: v, label: t(`serviceProvider.yearsOptions.${v}` as never) }));
	const yesNoOptions = [
		{ value: "yes", label: t("serviceProvider.yesNo.yes" as never) },
		{ value: "no", label: t("serviceProvider.yesNo.no" as never) },
	];

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (step < 2) {
			const failed = new Set<string>();
			if (step === 1) {
				if (form.serviceTypes.length === 0) failed.add("serviceTypes");
				if (form.serviceTypes.includes("other") && !form.otherServiceType.trim()) failed.add("otherServiceType");
				if (!form.serviceCoverage) failed.add("serviceCoverage");
				if (!form.yearsInOperation) failed.add("yearsInOperation");
				if (!form.businessRegistered) failed.add("businessRegistered");
				if (!form.hasInsurance) failed.add("hasInsurance");
			}
			if (failed.size > 0) { setFailedFields(failed); return; }
			setFailedFields(new Set());
			setStep((s) => s + 1);
			return;
		}
		onSubmit({
			name: form.contactName,
			email: form.email,
			phone: form.phone,
			company: form.companyName,
			country: form.country,
			extraData: {
				jobTitle: form.jobTitle || undefined,
				companyRegNumber: form.companyRegNumber || undefined,
				whatsapp: form.whatsapp || undefined,
				city: form.city,
				website: form.website || undefined,
				instagram: form.instagram || undefined,
				serviceTypes: form.serviceTypes,
				otherServiceType: form.otherServiceType.trim() || undefined,
				serviceDescription: form.serviceDescription,
				serviceCoverage: form.serviceCoverage,
				yearsInOperation: form.yearsInOperation,
				largestEventServed: form.largestEventServed || undefined,
				notableClients: form.notableClients || undefined,
				certifications: form.certifications || undefined,
				businessRegistered: form.businessRegistered,
				hasInsurance: form.hasInsurance,
				representativeName: form.representativeName,
				declarationDate: form.declarationDate,
			},
		});
	};

	return (
		<form onSubmit={handleSubmit} className="mt-6">
			<StepIndicator labels={stepLabels} current={step} />

			{step === 0 && (
				<div className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className={labelCls} htmlFor="sp-contact-name">
								{t("serviceProvider.fields.contactName" as never)} *
							</label>
							<input id="sp-contact-name" type="text" required value={form.contactName} onChange={f("contactName")} placeholder={t("serviceProvider.fields.contactNamePlaceholder" as never)} className={inputCls} />
						</div>
						<div>
							<label className={labelCls} htmlFor="sp-job-title">
								{t("serviceProvider.fields.jobTitle" as never)}
							</label>
							<input id="sp-job-title" type="text" value={form.jobTitle} onChange={f("jobTitle")} placeholder={t("serviceProvider.fields.jobTitlePlaceholder" as never)} className={inputCls} />
						</div>
						<div>
							<label className={labelCls} htmlFor="sp-company-name">
								{t("serviceProvider.fields.companyName" as never)} *
							</label>
							<input id="sp-company-name" type="text" required value={form.companyName} onChange={f("companyName")} placeholder={t("serviceProvider.fields.companyNamePlaceholder" as never)} className={inputCls} />
						</div>
						<div>
							<label className={labelCls} htmlFor="sp-company-reg">
								{t("serviceProvider.fields.companyRegNumber" as never)}
							</label>
							<input id="sp-company-reg" type="text" value={form.companyRegNumber} onChange={f("companyRegNumber")} placeholder={t("serviceProvider.fields.companyRegNumberPlaceholder" as never)} className={inputCls} />
						</div>
						<div>
							<label className={labelCls} htmlFor="sp-email">
								{t("serviceProvider.fields.email" as never)} *
							</label>
							<input id="sp-email" type="email" required value={form.email} onChange={f("email")} placeholder={t("serviceProvider.fields.emailPlaceholder" as never)} className={inputCls} />
						</div>
						<div>
							<label className={labelCls} htmlFor="sp-phone">
								{t("serviceProvider.fields.phone" as never)} *
							</label>
							<input id="sp-phone" type="tel" required value={form.phone} onChange={pf("phone")} placeholder={t("serviceProvider.fields.phonePlaceholder" as never)} className={inputCls} />
						</div>
						<div>
							<label className={labelCls} htmlFor="sp-whatsapp">
								{t("serviceProvider.fields.whatsapp" as never)}
							</label>
							<input id="sp-whatsapp" type="tel" value={form.whatsapp} onChange={pf("whatsapp")} placeholder={t("serviceProvider.fields.whatsappPlaceholder" as never)} className={inputCls} />
						</div>
						<div>
							<label className={labelCls} htmlFor="sp-country">
								{t("serviceProvider.fields.country" as never)} *
							</label>
							<input id="sp-country" type="text" required value={form.country} onChange={f("country")} placeholder={t("serviceProvider.fields.countryPlaceholder" as never)} className={inputCls} />
						</div>
						<div>
							<label className={labelCls} htmlFor="sp-city">
								{t("serviceProvider.fields.city" as never)} *
							</label>
							<input id="sp-city" type="text" required value={form.city} onChange={f("city")} placeholder={t("serviceProvider.fields.cityPlaceholder" as never)} className={inputCls} />
						</div>
						<div>
							<label className={labelCls} htmlFor="sp-website">
								{t("serviceProvider.fields.website" as never)}
							</label>
							<input id="sp-website" type="url" value={form.website} onChange={f("website")} placeholder={t("serviceProvider.fields.websitePlaceholder" as never)} className={inputCls} />
						</div>
						<div>
							<label className={labelCls} htmlFor="sp-instagram">
								{t("serviceProvider.fields.instagram" as never)}
							</label>
							<input id="sp-instagram" type="text" value={form.instagram} onChange={f("instagram")} placeholder={t("serviceProvider.fields.instagramPlaceholder" as never)} className={inputCls} />
						</div>
					</div>
				</div>
			)}

			{step === 1 && (
				<div className="space-y-5">
					<div>
						<p className={labelCls}>{t("serviceProvider.fields.serviceTypes" as never)} *</p>
						<div className={failedFields.has("serviceTypes") ? "rounded-xl ring-2 ring-rose-400/70 p-2" : ""}>
							<GroupedMultiSelect
								groups={VENDOR_CATEGORIES.map((c) => ({ key: c.key, items: c.types }))}
								groupLabel={(k) => tx(`vendorCategories.${k}` as never)}
								itemLabel={(k) => tx(`vendorTypes.${k}` as never)}
								values={form.serviceTypes.filter(v => v !== "other")}
								onChange={(v) => { setForm((p) => ({ ...p, serviceTypes: p.serviceTypes.includes("other") ? [...v, "other"] : v })); clearFailed("serviceTypes"); }}
								searchPlaceholder={t("picker.searchPlaceholder" as never)}
								selectedLabel={t("picker.selected" as never)}
								noResultsText={t("picker.noResults" as never)}
							/>
							<div className="mt-3 flex flex-col gap-3">
								<button
									type="button"
									onClick={() => {
										setForm((p) => ({
											...p,
											serviceTypes: p.serviceTypes.includes("other")
												? p.serviceTypes.filter(v => v !== "other")
												: [...p.serviceTypes, "other"],
											otherServiceType: p.serviceTypes.includes("other") ? "" : p.otherServiceType,
										}));
										clearFailed("serviceTypes");
										clearFailed("otherServiceType");
									}}
									className={`${chipBase} self-start ${form.serviceTypes.includes("other") ? chipActive : chipInactive}`}
								>
									{t("picker.other" as never)}
								</button>
								{form.serviceTypes.includes("other") && (
									<input
										type="text"
										value={form.otherServiceType}
										onChange={(e) => { setForm((p) => ({ ...p, otherServiceType: e.target.value })); clearFailed("otherServiceType"); }}
										placeholder={t("picker.otherServicePlaceholder" as never)}
										className={`${inputCls} ${failedFields.has("otherServiceType") ? "ring-2 ring-rose-400/70" : ""}`}
									/>
								)}
							</div>
						</div>
					</div>
					<div>
						<label className={labelCls} htmlFor="sp-description">
							{t("serviceProvider.fields.serviceDescription" as never)} *
						</label>
						<textarea id="sp-description" required rows={4} value={form.serviceDescription} onChange={f("serviceDescription")} placeholder={t("serviceProvider.fields.serviceDescriptionPlaceholder" as never)} className={`${inputCls} resize-none`} />
					</div>
					<div>
						<p className={labelCls}>{t("serviceProvider.fields.serviceCoverage" as never)} *</p>
						<RadioGroup
							options={coverageOptions}
							value={form.serviceCoverage}
							error={failedFields.has("serviceCoverage")}
							onChange={(v) => { setForm((p) => ({ ...p, serviceCoverage: v })); clearFailed("serviceCoverage"); }}
						/>
					</div>
					<div>
						<p className={labelCls}>{t("serviceProvider.fields.yearsInOperation" as never)} *</p>
						<RadioGroup
							options={yearsOptions}
							value={form.yearsInOperation}
							error={failedFields.has("yearsInOperation")}
							onChange={(v) => { setForm((p) => ({ ...p, yearsInOperation: v })); clearFailed("yearsInOperation"); }}
						/>
					</div>
					<div>
						<label className={labelCls} htmlFor="sp-largest-event">
							{t("serviceProvider.fields.largestEventServed" as never)}
						</label>
						<input id="sp-largest-event" type="number" min="0" value={form.largestEventServed} onChange={f("largestEventServed")} placeholder={t("serviceProvider.fields.largestEventServedPlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="sp-notable-clients">
							{t("serviceProvider.fields.notableClients" as never)}
						</label>
						<textarea id="sp-notable-clients" rows={3} value={form.notableClients} onChange={f("notableClients")} placeholder={t("serviceProvider.fields.notableClientsPlaceholder" as never)} className={`${inputCls} resize-none`} />
					</div>
					<div>
						<label className={labelCls} htmlFor="sp-certifications">
							{t("serviceProvider.fields.certifications" as never)}
						</label>
						<input id="sp-certifications" type="text" value={form.certifications} onChange={f("certifications")} placeholder={t("serviceProvider.fields.certificationsPlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<p className={labelCls}>{t("serviceProvider.fields.businessRegistered" as never)} *</p>
						<RadioGroup
							options={yesNoOptions}
							value={form.businessRegistered}
							error={failedFields.has("businessRegistered")}
							onChange={(v) => { setForm((p) => ({ ...p, businessRegistered: v })); clearFailed("businessRegistered"); }}
						/>
					</div>
					<div>
						<p className={labelCls}>{t("serviceProvider.fields.hasInsurance" as never)} *</p>
						<RadioGroup
							options={yesNoOptions}
							value={form.hasInsurance}
							error={failedFields.has("hasInsurance")}
							onChange={(v) => { setForm((p) => ({ ...p, hasInsurance: v })); clearFailed("hasInsurance"); }}
						/>
					</div>
				</div>
			)}

			{step === 2 && (
				<div className="space-y-5">
					<p className="text-sm text-[var(--muted,#5c5c5c)]">{t("declaration.title" as never)}</p>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className={labelCls} htmlFor="sp-rep-name">
								{t("declaration.representativeName" as never)} *
							</label>
							<input
								id="sp-rep-name" type="text" required
								value={form.representativeName}
								onChange={f("representativeName")}
								placeholder={form.contactName}
								className={inputCls}
							/>
						</div>
						<div>
							<label className={labelCls} htmlFor="sp-date">
								{t("declaration.date" as never)} *
							</label>
							<input id="sp-date" type="date" required value={form.declarationDate} onChange={f("declarationDate")} className={inputCls} />
						</div>
					</div>
					<div className="space-y-3">
						{([
							["clause1", t("declaration.clause1" as never)],
							["clause2", t("declaration.clause2" as never)],
							["clause3", t("declaration.clause3" as never)],
						] as const).map(([key, label]) => (
							<label key={key} className="flex items-start gap-3 cursor-pointer">
								<input
									required
									type="checkbox"
									checked={form[key]}
									onChange={f(key)}
									className="mt-0.5 w-4 h-4 rounded accent-orange shrink-0"
								/>
								<span className="text-sm text-[var(--muted,#5c5c5c)]">{label}</span>
							</label>
						))}
					</div>
					{submitError && <p className="text-sm text-rose-700 font-medium">{submitError}</p>}
				</div>
			)}

			{failedFields.size > 0 && (
				<ValidationBanner message={t("validation.requiredFields" as never)} />
			)}

			<StepNav
				step={step}
				onBack={() => { setStep((s) => s - 1); setFailedFields(new Set()); }}
				isLastStep={step === 2}
				isPending={isPending}
				submitLabel={t("declaration.submit" as never)}
				submittingLabel={t("declaration.submitting" as never)}
			/>
		</form>
	);
}

// ─── Workforce Form ──────────────────────────────────────────────────────────────

export function WorkforceForm({ onSubmit, submitError, isPending }: StakeholderFormProps) {
	const t = useTranslations("StakeholderRegistrationPage");
	const [step, setStep] = useState(0);
	const [form, setForm] = useState({
		// Step 0
		fullName: "", preferredName: "", email: "", phone: "",
		whatsapp: "", country: "", city: "", nationality: "", nationalId: "",
		dateOfBirth: "", gender: "",
		// Step 1
		primaryRoles: [] as string[], otherPrimaryRole: "", yearsExperience: "",
		largestEventWorked: "", skillsSummary: "", equipmentOwned: "",
		// Step 2
		touringAvailability: "", canDeploy48h: "", hasPassport: "",
		dayRate: "", availability: "", marketsWorked: "",
		// Step 3
		portfolioLinks: "", refereeName: "", refereeCompany: "",
		refereeContact: "", refereeRelationship: "", previousTours: "",
		// Step 4
		representativeName: "", declarationDate: new Date().toISOString().slice(0, 10),
		clause1: false, clause2: false, clause3: false,
	});

	const [failedFields, setFailedFields] = useState<Set<string>>(new Set());
	const clearFailed = (key: string) =>
		setFailedFields((s) => { const n = new Set(s); n.delete(key); return n; });

	const f =
		(k: keyof typeof form) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
			setForm((p) => ({ ...p, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

	const pf = (k: keyof typeof form) => (ev: React.ChangeEvent<HTMLInputElement>) =>
		setForm((p) => ({ ...p, [k]: ev.target.value.replace(/[^\d+\s\-()]/g, "") }));

	const stepLabels = [
		t("workforce.steps.step1" as never), t("workforce.steps.step2" as never),
		t("workforce.steps.step3" as never), t("workforce.steps.step4" as never),
		t("workforce.steps.step5" as never),
	];

	const tx = useTranslations("StakeholderTaxonomy");
	const expOptions = WF_EXPERIENCE.map((v) => ({ value: v, label: t(`workforce.experienceLevels.${v}` as never) }));
	const largestOptions = WF_LARGEST.map((v) => ({ value: v, label: t(`workforce.largestEvents.${v}` as never) }));
	const touringOptions = WF_TOURING.map((v) => ({ value: v, label: t(`workforce.touringOptions.${v}` as never) }));
	const genderOptions = WF_GENDERS.map((v) => ({ value: v, label: t(`workforce.genders.${v}` as never) }));
	const yesNoOptions = [
		{ value: "yes", label: t("workforce.yesNo.yes" as never) },
		{ value: "no", label: t("workforce.yesNo.no" as never) },
	];

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (step < 4) {
			const failed = new Set<string>();
			if (step === 0) {
				if (!form.gender) failed.add("gender");
			}
			if (step === 1) {
				if (form.primaryRoles.length === 0) failed.add("primaryRoles");
				if (form.primaryRoles.includes("other") && !form.otherPrimaryRole.trim()) failed.add("otherPrimaryRole");
				if (!form.yearsExperience) failed.add("yearsExperience");
				if (!form.largestEventWorked) failed.add("largestEventWorked");
			}
			if (step === 2) {
				if (!form.touringAvailability) failed.add("touringAvailability");
				if (!form.canDeploy48h) failed.add("canDeploy48h");
				if (!form.hasPassport) failed.add("hasPassport");
			}
			if (step === 3) {
				if (!form.refereeName.trim()) failed.add("refereeName");
				if (!form.refereeCompany.trim()) failed.add("refereeCompany");
				if (!form.refereeContact.trim()) failed.add("refereeContact");
				if (!form.refereeRelationship.trim()) failed.add("refereeRelationship");
			}
			if (failed.size > 0) { setFailedFields(failed); return; }
			setFailedFields(new Set());
			setStep((s) => s + 1);
			return;
		}
		onSubmit({
			name: form.fullName,
			email: form.email,
			phone: form.phone,
			country: form.country,
			extraData: {
				preferredName: form.preferredName || undefined,
				whatsapp: form.whatsapp || undefined,
				city: form.city,
				nationality: form.nationality,
				nationalId: form.nationalId || undefined,
				dateOfBirth: form.dateOfBirth || undefined,
				gender: form.gender || undefined,
				primaryRoles: form.primaryRoles,
				otherPrimaryRole: form.otherPrimaryRole.trim() || undefined,
				yearsExperience: form.yearsExperience,
				largestEventWorked: form.largestEventWorked,
				skillsSummary: form.skillsSummary,
				equipmentOwned: form.equipmentOwned || undefined,
				touringAvailability: form.touringAvailability,
				canDeploy48h: form.canDeploy48h,
				hasPassport: form.hasPassport,
				dayRate: form.dayRate,
				availability: form.availability,
				marketsWorked: form.marketsWorked || undefined,
				portfolioLinks: form.portfolioLinks || undefined,
				refereeName: form.refereeName,
				refereeCompany: form.refereeCompany,
				refereeContact: form.refereeContact,
				refereeRelationship: form.refereeRelationship,
				previousTours: form.previousTours || undefined,
				representativeName: form.representativeName,
				declarationDate: form.declarationDate,
			},
		});
	};

	return (
		<form onSubmit={handleSubmit} className="mt-6">
			<StepIndicator labels={stepLabels} current={step} />

			{step === 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className={labelCls} htmlFor="wf-full-name">{t("workforce.fields.name" as never)} *</label>
						<input id="wf-full-name" type="text" required value={form.fullName} onChange={f("fullName")} placeholder={t("workforce.fields.namePlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="wf-preferred-name">{t("workforce.fields.preferredName" as never)}</label>
						<input id="wf-preferred-name" type="text" value={form.preferredName} onChange={f("preferredName")} placeholder={t("workforce.fields.preferredNamePlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="wf-email">{t("workforce.fields.email" as never)} *</label>
						<input id="wf-email" type="email" required value={form.email} onChange={f("email")} placeholder={t("workforce.fields.emailPlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="wf-phone">{t("workforce.fields.phone" as never)} *</label>
						<input id="wf-phone" type="tel" required value={form.phone} onChange={pf("phone")} placeholder={t("workforce.fields.phonePlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="wf-whatsapp">{t("workforce.fields.whatsapp" as never)}</label>
						<input id="wf-whatsapp" type="tel" value={form.whatsapp} onChange={pf("whatsapp")} placeholder={t("workforce.fields.whatsappPlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="wf-dob">{t("workforce.fields.dateOfBirth" as never)} *</label>
						<input id="wf-dob" type="date" required value={form.dateOfBirth} onChange={f("dateOfBirth")} max={new Date().toISOString().slice(0, 10)} className={inputCls} />
					</div>
					<div className="md:col-span-2">
						<p className={labelCls}>{t("workforce.fields.gender" as never)} *</p>
						<RadioGroup
							options={genderOptions}
							value={form.gender}
							error={failedFields.has("gender")}
							onChange={(v) => { setForm((p) => ({ ...p, gender: v })); clearFailed("gender"); }}
						/>
					</div>
					<div>
						<label className={labelCls} htmlFor="wf-nationality">{t("workforce.fields.nationality" as never)} *</label>
						<input id="wf-nationality" type="text" required value={form.nationality} onChange={f("nationality")} placeholder={t("workforce.fields.nationalityPlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="wf-country">{t("workforce.fields.country" as never)} *</label>
						<input id="wf-country" type="text" required value={form.country} onChange={f("country")} placeholder={t("workforce.fields.countryPlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="wf-city">{t("workforce.fields.city" as never)} *</label>
						<input id="wf-city" type="text" required value={form.city} onChange={f("city")} placeholder={t("workforce.fields.cityPlaceholder" as never)} className={inputCls} />
					</div>
					<div className="md:col-span-2">
						<label className={labelCls} htmlFor="wf-national-id">{t("workforce.fields.nationalId" as never)}</label>
						<input id="wf-national-id" type="text" value={form.nationalId} onChange={f("nationalId")} placeholder={t("workforce.fields.nationalIdPlaceholder" as never)} className={inputCls} />
					</div>
				</div>
			)}

			{step === 1 && (
				<div className="space-y-5">
					<div>
						<p className={labelCls}>{t("workforce.fields.primaryRoles" as never)} *</p>
						<div className={failedFields.has("primaryRoles") ? "rounded-xl ring-2 ring-rose-400/70 p-2" : ""}>
							<GroupedMultiSelect
								groups={WORKFORCE_DEPARTMENTS.map((d) => ({ key: d.key, items: d.roles }))}
								groupLabel={(k) => tx(`departments.${k}` as never)}
								itemLabel={(k) => tx(`roles.${k}` as never)}
								values={form.primaryRoles.filter(v => v !== "other")}
								onChange={(v) => { setForm((p) => ({ ...p, primaryRoles: p.primaryRoles.includes("other") ? [...v, "other"] : v })); clearFailed("primaryRoles"); }}
								searchPlaceholder={t("picker.searchPlaceholder" as never)}
								selectedLabel={t("picker.selected" as never)}
								noResultsText={t("picker.noResults" as never)}
							/>
							<div className="mt-3 flex flex-col gap-3">
								<button
									type="button"
									onClick={() => {
										setForm((p) => ({
											...p,
											primaryRoles: p.primaryRoles.includes("other")
												? p.primaryRoles.filter(v => v !== "other")
												: [...p.primaryRoles, "other"],
											otherPrimaryRole: p.primaryRoles.includes("other") ? "" : p.otherPrimaryRole,
										}));
										clearFailed("primaryRoles");
										clearFailed("otherPrimaryRole");
									}}
									className={`${chipBase} self-start ${form.primaryRoles.includes("other") ? chipActive : chipInactive}`}
								>
									{t("picker.other" as never)}
								</button>
								{form.primaryRoles.includes("other") && (
									<input
										type="text"
										value={form.otherPrimaryRole}
										onChange={(e) => { setForm((p) => ({ ...p, otherPrimaryRole: e.target.value })); clearFailed("otherPrimaryRole"); }}
										placeholder={t("picker.otherRolePlaceholder" as never)}
										className={`${inputCls} ${failedFields.has("otherPrimaryRole") ? "ring-2 ring-rose-400/70" : ""}`}
									/>
								)}
							</div>
						</div>
					</div>
					<div>
						<p className={labelCls}>{t("workforce.fields.yearsExperience" as never)} *</p>
						<RadioGroup
							options={expOptions}
							value={form.yearsExperience}
							error={failedFields.has("yearsExperience")}
							onChange={(v) => { setForm((p) => ({ ...p, yearsExperience: v })); clearFailed("yearsExperience"); }}
						/>
					</div>
					<div>
						<p className={labelCls}>{t("workforce.fields.largestEventWorked" as never)} *</p>
						<RadioGroup
							options={largestOptions}
							value={form.largestEventWorked}
							error={failedFields.has("largestEventWorked")}
							onChange={(v) => { setForm((p) => ({ ...p, largestEventWorked: v })); clearFailed("largestEventWorked"); }}
						/>
					</div>
					<div>
						<label className={labelCls} htmlFor="wf-skills">{t("workforce.fields.skillsSummary" as never)} *</label>
						<textarea id="wf-skills" required rows={4} value={form.skillsSummary} onChange={f("skillsSummary")} placeholder={t("workforce.fields.skillsSummaryPlaceholder" as never)} className={`${inputCls} resize-none`} />
					</div>
					<div>
						<label className={labelCls} htmlFor="wf-equipment">{t("workforce.fields.equipmentOwned" as never)}</label>
						<textarea id="wf-equipment" rows={3} value={form.equipmentOwned} onChange={f("equipmentOwned")} placeholder={t("workforce.fields.equipmentOwnedPlaceholder" as never)} className={`${inputCls} resize-none`} />
					</div>
				</div>
			)}

			{step === 2 && (
				<div className="space-y-5">
					<div>
						<p className={labelCls}>{t("workforce.fields.touringAvailability" as never)} *</p>
						<RadioGroup
							options={touringOptions}
							value={form.touringAvailability}
							error={failedFields.has("touringAvailability")}
							onChange={(v) => { setForm((p) => ({ ...p, touringAvailability: v })); clearFailed("touringAvailability"); }}
						/>
					</div>
					<div>
						<p className={labelCls}>{t("workforce.fields.canDeploy48h" as never)} *</p>
						<RadioGroup
							options={yesNoOptions}
							value={form.canDeploy48h}
							error={failedFields.has("canDeploy48h")}
							onChange={(v) => { setForm((p) => ({ ...p, canDeploy48h: v })); clearFailed("canDeploy48h"); }}
						/>
					</div>
					<div>
						<p className={labelCls}>{t("workforce.fields.hasPassport" as never)} *</p>
						<RadioGroup
							options={yesNoOptions}
							value={form.hasPassport}
							error={failedFields.has("hasPassport")}
							onChange={(v) => { setForm((p) => ({ ...p, hasPassport: v })); clearFailed("hasPassport"); }}
						/>
					</div>
					<div>
						<label className={labelCls} htmlFor="wf-day-rate">{t("workforce.fields.dayRate" as never)} *</label>
						<input id="wf-day-rate" type="number" min="0" required value={form.dayRate} onChange={f("dayRate")} placeholder={t("workforce.fields.dayRatePlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="wf-availability">{t("workforce.fields.availability" as never)} *</label>
						<input id="wf-availability" type="text" required value={form.availability} onChange={f("availability")} placeholder={t("workforce.fields.availabilityPlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="wf-markets">{t("workforce.fields.marketsWorked" as never)}</label>
						<textarea id="wf-markets" rows={3} value={form.marketsWorked} onChange={f("marketsWorked")} placeholder={t("workforce.fields.marketsWorkedPlaceholder" as never)} className={`${inputCls} resize-none`} />
					</div>
				</div>
			)}

			{step === 3 && (
				<div className="space-y-4">
					<div>
						<label className={labelCls} htmlFor="wf-portfolio">{t("workforce.fields.portfolioLinks" as never)}</label>
						<textarea id="wf-portfolio" rows={3} value={form.portfolioLinks} onChange={f("portfolioLinks")} placeholder={t("workforce.fields.portfolioLinksPlaceholder" as never)} className={`${inputCls} resize-none`} />
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className={labelCls} htmlFor="wf-ref-name">
								{t("workforce.fields.refereeName" as never)} *
							</label>
							<input
								id="wf-ref-name"
								type="text"
								required
								value={form.refereeName}
								onChange={(e) => { f("refereeName")(e); clearFailed("refereeName"); }}
								placeholder={t("workforce.fields.refereeNamePlaceholder" as never)}
								className={`${inputCls} ${failedFields.has("refereeName") ? "ring-2 ring-rose-400/70" : ""}`}
							/>
						</div>
						<div>
							<label className={labelCls} htmlFor="wf-ref-company">
								{t("workforce.fields.refereeCompany" as never)} *
							</label>
							<input
								id="wf-ref-company"
								type="text"
								required
								value={form.refereeCompany}
								onChange={(e) => { f("refereeCompany")(e); clearFailed("refereeCompany"); }}
								placeholder={t("workforce.fields.refereeCompanyPlaceholder" as never)}
								className={`${inputCls} ${failedFields.has("refereeCompany") ? "ring-2 ring-rose-400/70" : ""}`}
							/>
						</div>
						<div>
							<label className={labelCls} htmlFor="wf-ref-contact">
								{t("workforce.fields.refereeContact" as never)} *
							</label>
							<input
								id="wf-ref-contact"
								type="text"
								required
								value={form.refereeContact}
								onChange={(e) => { f("refereeContact")(e); clearFailed("refereeContact"); }}
								placeholder={t("workforce.fields.refereeContactPlaceholder" as never)}
								className={`${inputCls} ${failedFields.has("refereeContact") ? "ring-2 ring-rose-400/70" : ""}`}
							/>
						</div>
						<div>
							<label className={labelCls} htmlFor="wf-ref-rel">
								{t("workforce.fields.refereeRelationship" as never)} *
							</label>
							<input
								id="wf-ref-rel"
								type="text"
								required
								value={form.refereeRelationship}
								onChange={(e) => { f("refereeRelationship")(e); clearFailed("refereeRelationship"); }}
								placeholder={t("workforce.fields.refereeRelationshipPlaceholder" as never)}
								className={`${inputCls} ${failedFields.has("refereeRelationship") ? "ring-2 ring-rose-400/70" : ""}`}
							/>
						</div>
					</div>
					<div>
						<label className={labelCls} htmlFor="wf-previous-tours">{t("workforce.fields.previousTours" as never)}</label>
						<textarea id="wf-previous-tours" rows={3} value={form.previousTours} onChange={f("previousTours")} placeholder={t("workforce.fields.previousToursPlaceholder" as never)} className={`${inputCls} resize-none`} />
					</div>
				</div>
			)}

			{step === 4 && (
				<div className="space-y-5">
					<p className="text-sm text-[var(--muted,#5c5c5c)]">{t("declaration.title" as never)}</p>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className={labelCls} htmlFor="wf-rep-name">{t("declaration.representativeName" as never)} *</label>
							<input id="wf-rep-name" type="text" required value={form.representativeName} onChange={f("representativeName")} placeholder={form.fullName} className={inputCls} />
						</div>
						<div>
							<label className={labelCls} htmlFor="wf-date">{t("declaration.date" as never)} *</label>
							<input id="wf-date" type="date" required value={form.declarationDate} onChange={f("declarationDate")} className={inputCls} />
						</div>
					</div>
					<div className="space-y-3">
						{([
							["clause1", t("declaration.clause1" as never)],
							["clause2", t("declaration.clause2" as never)],
							["clause3", t("declaration.clause3" as never)],
						] as const).map(([key, label]) => (
							<label key={key} className="flex items-start gap-3 cursor-pointer">
								<input required type="checkbox" checked={form[key]} onChange={f(key)} className="mt-0.5 w-4 h-4 rounded accent-orange shrink-0" />
								<span className="text-sm text-[var(--muted,#5c5c5c)]">{label}</span>
							</label>
						))}
					</div>
					{submitError && <p className="text-sm text-rose-700 font-medium">{submitError}</p>}
				</div>
			)}

			{failedFields.size > 0 && (
				<ValidationBanner message={t("validation.requiredFields" as never)} />
			)}

			<StepNav
				step={step}
				onBack={() => { setStep((s) => s - 1); setFailedFields(new Set()); }}
				isLastStep={step === 4}
				isPending={isPending}
				submitLabel={t("declaration.submit" as never)}
				submittingLabel={t("declaration.submitting" as never)}
			/>
		</form>
	);
}

// ─── Artist Management Form ──────────────────────────────────────────────────────

export function ArtistMgmtForm({ onSubmit, submitError, isPending }: StakeholderFormProps) {
	const t = useTranslations("StakeholderRegistrationPage");
	const [step, setStep] = useState(0);
	const [form, setForm] = useState({
		// Step 0
		agencyName: "", companyRegNumber: "", contactName: "", jobTitle: "", email: "",
		phone: "", whatsapp: "", country: "", city: "", website: "", instagram: "",
		// Step 1
		yearsInOperation: "", rosterSize: "", primaryGenres: "",
		artistsRepresented: "", marketsOperated: "", pastTours: "",
		dealStructures: [] as string[], hasLiveBooking: "", businessRegistered: "",
		// Step 2
		representativeName: "", declarationDate: new Date().toISOString().slice(0, 10),
		clause1: false, clause2: false, clause3: false,
	});

	const [failedFields, setFailedFields] = useState<Set<string>>(new Set());
	const clearFailed = (key: string) =>
		setFailedFields((s) => { const n = new Set(s); n.delete(key); return n; });

	const f =
		(k: keyof typeof form) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
			setForm((p) => ({ ...p, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

	const pf = (k: keyof typeof form) => (ev: React.ChangeEvent<HTMLInputElement>) =>
		setForm((p) => ({ ...p, [k]: ev.target.value.replace(/[^\d+\s\-()]/g, "") }));

	const stepLabels = [
		t("artmgmt.steps.step1" as never),
		t("artmgmt.steps.step2" as never),
		t("artmgmt.steps.step3" as never),
	];

	const yearsOptions = AM_YEARS.map((v) => ({ value: v, label: t(`artmgmt.yearsOptions.${v}` as never) }));
	const rosterOptions = AM_ROSTER.map((v) => ({ value: v, label: t(`artmgmt.rosterSizes.${v}` as never) }));
	const dealOptions = AM_DEALS.map((v) => ({ value: v, label: t(`artmgmt.dealStructures.${v}` as never) }));
	const yesNoOptions = [
		{ value: "yes", label: t("artmgmt.yesNo.yes" as never) },
		{ value: "no", label: t("artmgmt.yesNo.no" as never) },
	];

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (step < 2) {
			const failed = new Set<string>();
			if (step === 1) {
				if (!form.yearsInOperation) failed.add("yearsInOperation");
				if (!form.rosterSize) failed.add("rosterSize");
				if (!form.hasLiveBooking) failed.add("hasLiveBooking");
				if (!form.businessRegistered) failed.add("businessRegistered");
			}
			if (failed.size > 0) { setFailedFields(failed); return; }
			setFailedFields(new Set());
			setStep((s) => s + 1);
			return;
		}
		onSubmit({
			name: form.contactName,
			email: form.email,
			phone: form.phone,
			company: form.agencyName,
			country: form.country,
			extraData: {
				companyRegNumber: form.companyRegNumber || undefined,
				jobTitle: form.jobTitle || undefined,
				whatsapp: form.whatsapp || undefined,
				city: form.city,
				website: form.website || undefined,
				instagram: form.instagram || undefined,
				yearsInOperation: form.yearsInOperation,
				rosterSize: form.rosterSize,
				primaryGenres: form.primaryGenres,
				artistsRepresented: form.artistsRepresented,
				marketsOperated: form.marketsOperated || undefined,
				pastTours: form.pastTours || undefined,
				dealStructures: form.dealStructures,
				hasLiveBooking: form.hasLiveBooking,
				businessRegistered: form.businessRegistered,
				representativeName: form.representativeName,
				declarationDate: form.declarationDate,
			},
		});
	};

	return (
		<form onSubmit={handleSubmit} className="mt-6">
			<StepIndicator labels={stepLabels} current={step} />

			{step === 0 && (
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label className={labelCls} htmlFor="am-agency-name">{t("artmgmt.fields.agencyName" as never)} *</label>
						<input id="am-agency-name" type="text" required value={form.agencyName} onChange={f("agencyName")} placeholder={t("artmgmt.fields.agencyNamePlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="am-company-reg">{t("artmgmt.fields.companyRegNumber" as never)}</label>
						<input id="am-company-reg" type="text" value={form.companyRegNumber} onChange={f("companyRegNumber")} placeholder={t("artmgmt.fields.companyRegNumberPlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="am-contact-name">{t("artmgmt.fields.contactName" as never)} *</label>
						<input id="am-contact-name" type="text" required value={form.contactName} onChange={f("contactName")} placeholder={t("artmgmt.fields.contactNamePlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="am-job-title">{t("artmgmt.fields.jobTitle" as never)}</label>
						<input id="am-job-title" type="text" value={form.jobTitle} onChange={f("jobTitle")} placeholder={t("artmgmt.fields.jobTitlePlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="am-email">{t("artmgmt.fields.email" as never)} *</label>
						<input id="am-email" type="email" required value={form.email} onChange={f("email")} placeholder={t("artmgmt.fields.emailPlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="am-phone">{t("artmgmt.fields.phone" as never)} *</label>
						<input id="am-phone" type="tel" required value={form.phone} onChange={pf("phone")} placeholder={t("artmgmt.fields.phonePlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="am-whatsapp">{t("artmgmt.fields.whatsapp" as never)}</label>
						<input id="am-whatsapp" type="tel" value={form.whatsapp} onChange={pf("whatsapp")} placeholder={t("artmgmt.fields.whatsappPlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="am-country">{t("artmgmt.fields.country" as never)} *</label>
						<input id="am-country" type="text" required value={form.country} onChange={f("country")} placeholder={t("artmgmt.fields.countryPlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="am-city">{t("artmgmt.fields.city" as never)} *</label>
						<input id="am-city" type="text" required value={form.city} onChange={f("city")} placeholder={t("artmgmt.fields.cityPlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="am-website">{t("artmgmt.fields.website" as never)}</label>
						<input id="am-website" type="url" value={form.website} onChange={f("website")} placeholder={t("artmgmt.fields.websitePlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="am-instagram">{t("artmgmt.fields.instagram" as never)}</label>
						<input id="am-instagram" type="text" value={form.instagram} onChange={f("instagram")} placeholder={t("artmgmt.fields.instagramPlaceholder" as never)} className={inputCls} />
					</div>
				</div>
			)}

			{step === 1 && (
				<div className="space-y-5">
					<div>
						<p className={labelCls}>{t("artmgmt.fields.yearsInOperation" as never)} *</p>
						<RadioGroup
							options={yearsOptions}
							value={form.yearsInOperation}
							error={failedFields.has("yearsInOperation")}
							onChange={(v) => { setForm((p) => ({ ...p, yearsInOperation: v })); clearFailed("yearsInOperation"); }}
						/>
					</div>
					<div>
						<p className={labelCls}>{t("artmgmt.fields.rosterSize" as never)} *</p>
						<RadioGroup
							options={rosterOptions}
							value={form.rosterSize}
							error={failedFields.has("rosterSize")}
							onChange={(v) => { setForm((p) => ({ ...p, rosterSize: v })); clearFailed("rosterSize"); }}
						/>
					</div>
					<div>
						<label className={labelCls} htmlFor="am-genres">{t("artmgmt.fields.primaryGenres" as never)} *</label>
						<input id="am-genres" type="text" required value={form.primaryGenres} onChange={f("primaryGenres")} placeholder={t("artmgmt.fields.genresPlaceholder" as never)} className={inputCls} />
					</div>
					<div>
						<label className={labelCls} htmlFor="am-artists">{t("artmgmt.fields.artistsRepresented" as never)} *</label>
						<textarea id="am-artists" required rows={3} value={form.artistsRepresented} onChange={f("artistsRepresented")} placeholder={t("artmgmt.fields.artistsRepresentedPlaceholder" as never)} className={`${inputCls} resize-none`} />
					</div>
					<div>
						<label className={labelCls} htmlFor="am-markets">{t("artmgmt.fields.marketsOperated" as never)}</label>
						<textarea id="am-markets" rows={2} value={form.marketsOperated} onChange={f("marketsOperated")} placeholder={t("artmgmt.fields.marketsOperatedPlaceholder" as never)} className={`${inputCls} resize-none`} />
					</div>
					<div>
						<label className={labelCls} htmlFor="am-past-tours">{t("artmgmt.fields.pastTours" as never)}</label>
						<textarea id="am-past-tours" rows={2} value={form.pastTours} onChange={f("pastTours")} placeholder={t("artmgmt.fields.pastToursPlaceholder" as never)} className={`${inputCls} resize-none`} />
					</div>
					<div>
						<p className={labelCls}>{t("artmgmt.fields.dealStructures" as never)}</p>
						<CheckboxGroup
							options={dealOptions}
							values={form.dealStructures}
							onChange={(v) => setForm((p) => ({ ...p, dealStructures: v }))}
						/>
					</div>
					<div>
						<p className={labelCls}>{t("artmgmt.fields.hasLiveBooking" as never)} *</p>
						<RadioGroup
							options={yesNoOptions}
							value={form.hasLiveBooking}
							error={failedFields.has("hasLiveBooking")}
							onChange={(v) => { setForm((p) => ({ ...p, hasLiveBooking: v })); clearFailed("hasLiveBooking"); }}
						/>
					</div>
					<div>
						<p className={labelCls}>{t("artmgmt.fields.businessRegistered" as never)} *</p>
						<RadioGroup
							options={yesNoOptions}
							value={form.businessRegistered}
							error={failedFields.has("businessRegistered")}
							onChange={(v) => { setForm((p) => ({ ...p, businessRegistered: v })); clearFailed("businessRegistered"); }}
						/>
					</div>
				</div>
			)}

			{step === 2 && (
				<div className="space-y-5">
					<p className="text-sm text-[var(--muted,#5c5c5c)]">{t("declaration.title" as never)}</p>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<label className={labelCls} htmlFor="am-rep-name">{t("declaration.representativeName" as never)} *</label>
							<input id="am-rep-name" type="text" required value={form.representativeName} onChange={f("representativeName")} placeholder={form.contactName} className={inputCls} />
						</div>
						<div>
							<label className={labelCls} htmlFor="am-date">{t("declaration.date" as never)} *</label>
							<input id="am-date" type="date" required value={form.declarationDate} onChange={f("declarationDate")} className={inputCls} />
						</div>
					</div>
					<div className="space-y-3">
						{([
							["clause1", t("declaration.clause1" as never)],
							["clause2", t("declaration.clause2" as never)],
							["clause3", t("declaration.clause3" as never)],
						] as const).map(([key, label]) => (
							<label key={key} className="flex items-start gap-3 cursor-pointer">
								<input required type="checkbox" checked={form[key]} onChange={f(key)} className="mt-0.5 w-4 h-4 rounded accent-orange shrink-0" />
								<span className="text-sm text-[var(--muted,#5c5c5c)]">{label}</span>
							</label>
						))}
					</div>
					{submitError && <p className="text-sm text-rose-700 font-medium">{submitError}</p>}
				</div>
			)}

			{failedFields.size > 0 && (
				<ValidationBanner message={t("validation.requiredFields" as never)} />
			)}

			<StepNav
				step={step}
				onBack={() => { setStep((s) => s - 1); setFailedFields(new Set()); }}
				isLastStep={step === 2}
				isPending={isPending}
				submitLabel={t("declaration.submit" as never)}
				submittingLabel={t("declaration.submitting" as never)}
			/>
		</form>
	);
}

// ─── Form dispatcher ─────────────────────────────────────────────────────────────

export function StakeholderForm({
	category,
	...props
}: StakeholderFormProps & { category: StakeholderCategory }) {
	if (category === "service") return <ServiceProviderForm {...props} />;
	if (category === "workforce") return <WorkforceForm {...props} />;
	return <ArtistMgmtForm {...props} />;
}
