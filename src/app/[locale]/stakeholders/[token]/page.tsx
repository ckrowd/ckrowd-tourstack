"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { use, useState } from "react";
import Image from "next/image";
import { getOnboardingLink, submitOnboardingLink } from "@/app/actions";
import { Link } from "@/i18n/routing";

// ─── Types ─────────────────────────────────────────────────────────────────────

type SubmitPayload = {
	name: string;
	email: string;
	phone: string;
	company?: string;
	country: string;
	extraData?: Record<string, unknown>;
};

// ─── Constants ─────────────────────────────────────────────────────────────────

const SERVICE_TYPES = [
	"catering",
	"security",
	"av_tech",
	"transportation",
	"staging",
	"hospitality",
	"other",
] as const;

const WORKFORCE_ROLES = [
	"stage_crew",
	"lighting_tech",
	"sound_tech",
	"security",
	"production_manager",
	"driver",
	"hospitality",
	"other",
] as const;

const EXPERIENCE_LEVELS = ["0_1", "1_3", "3_5", "5_10", "10_plus"] as const;

const MANAGEMENT_TYPES = [
	"solo_artist",
	"band_group",
	"label",
	"management_agency",
] as const;

// ─── Shared Styles ─────────────────────────────────────────────────────────────

const labelCls =
	"block text-[10px] font-bold uppercase tracking-widest text-on-surface-variant mb-1.5";
const inputCls =
	"w-full rounded-xl bg-surface-container-high px-4 py-3 text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20";

// ─── Service Provider Form ─────────────────────────────────────────────────────

function ServiceProviderForm({
	onSubmit,
	submitError,
	isPending,
}: {
	onSubmit: (data: SubmitPayload) => void;
	submitError: string | null;
	isPending: boolean;
}) {
	const t = useTranslations("StakeholderRegistrationPage");
	const [form, setForm] = useState({
		contactName: "",
		companyName: "",
		email: "",
		phone: "",
		country: "",
		serviceType: "catering",
		yearsInBusiness: "",
		description: "",
		website: "",
		certifications: "",
	});

	const field =
		(k: keyof typeof form) =>
		(
			e: React.ChangeEvent<
				HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
			>,
		) =>
			setForm((p) => ({ ...p, [k]: e.target.value }));

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit({
					name: form.contactName,
					email: form.email,
					phone: form.phone,
					company: form.companyName,
					country: form.country,
					extraData: {
						serviceType: form.serviceType,
						...(form.yearsInBusiness && {
							yearsInBusiness: form.yearsInBusiness,
						}),
						description: form.description,
						...(form.website && { website: form.website }),
						...(form.certifications && {
							certifications: form.certifications,
						}),
					},
				});
			}}
			className="mt-6 space-y-4"
		>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className={labelCls} htmlFor="sp-contact-name">
						{t("serviceProvider.fields.contactName" as never)}
					</label>
					<input
						id="sp-contact-name"
						type="text"
						required
						value={form.contactName}
						onChange={field("contactName")}
						className={inputCls}
					/>
				</div>
				<div>
					<label className={labelCls} htmlFor="sp-company-name">
						{t("serviceProvider.fields.companyName" as never)}
					</label>
					<input
						id="sp-company-name"
						type="text"
						required
						value={form.companyName}
						onChange={field("companyName")}
						className={inputCls}
					/>
				</div>
				<div>
					<label className={labelCls} htmlFor="sp-email">
						{t("serviceProvider.fields.email" as never)}
					</label>
					<input
						id="sp-email"
						type="email"
						required
						value={form.email}
						onChange={field("email")}
						className={inputCls}
					/>
				</div>
				<div>
					<label className={labelCls} htmlFor="sp-phone">
						{t("serviceProvider.fields.phone" as never)}
					</label>
					<input
						id="sp-phone"
						type="text"
						required
						value={form.phone}
						onChange={field("phone")}
						className={inputCls}
					/>
				</div>
				<div>
					<label className={labelCls} htmlFor="sp-country">
						{t("serviceProvider.fields.country" as never)}
					</label>
					<input
						id="sp-country"
						type="text"
						required
						value={form.country}
						onChange={field("country")}
						className={inputCls}
					/>
				</div>
				<div>
					<label className={labelCls} htmlFor="sp-service-type">
						{t("serviceProvider.fields.serviceType" as never)}
					</label>
					<div className="relative">
						<select
							id="sp-service-type"
							required
							value={form.serviceType}
							onChange={field("serviceType")}
							className={`${inputCls} appearance-none`}
						>
							{SERVICE_TYPES.map((v) => (
								<option key={v} value={v}>
									{t(`serviceProvider.serviceTypes.${v}` as never)}
								</option>
							))}
						</select>
						<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
							expand_more
						</span>
					</div>
				</div>
				<div>
					<label className={labelCls} htmlFor="sp-years">
						{t("serviceProvider.fields.yearsInBusiness" as never)}
					</label>
					<input
						id="sp-years"
						type="number"
						min="0"
						value={form.yearsInBusiness}
						onChange={field("yearsInBusiness")}
						className={inputCls}
					/>
				</div>
				<div>
					<label className={labelCls} htmlFor="sp-website">
						{t("serviceProvider.fields.website" as never)}
					</label>
					<input
						id="sp-website"
						type="url"
						value={form.website}
						onChange={field("website")}
						placeholder="https://"
						className={inputCls}
					/>
				</div>
			</div>
			<div>
				<label className={labelCls} htmlFor="sp-description">
					{t("serviceProvider.fields.description" as never)}
				</label>
				<textarea
					id="sp-description"
					required
					rows={4}
					value={form.description}
					onChange={field("description")}
					className={`${inputCls} resize-none`}
				/>
			</div>
			<div>
				<label className={labelCls} htmlFor="sp-certifications">
					{t("serviceProvider.fields.certifications" as never)}
				</label>
				<input
					id="sp-certifications"
					type="text"
					value={form.certifications}
					onChange={field("certifications")}
					className={inputCls}
				/>
			</div>
			{submitError && (
				<p className="text-sm text-rose-700 font-medium">{submitError}</p>
			)}
			<button
				type="submit"
				disabled={isPending}
				className="w-full rounded-xl bg-[#FF5A30] text-white py-3 text-sm font-bold hover:opacity-90 disabled:opacity-60"
			>
				{isPending ? t("form.submitting") : t("form.submit")}
			</button>
		</form>
	);
}

// ─── Workforce Form ────────────────────────────────────────────────────────────

function WorkforceForm({
	onSubmit,
	submitError,
	isPending,
}: {
	onSubmit: (data: SubmitPayload) => void;
	submitError: string | null;
	isPending: boolean;
}) {
	const t = useTranslations("StakeholderRegistrationPage");
	const [form, setForm] = useState({
		name: "",
		email: "",
		phone: "",
		country: "",
		company: "",
		role: "stage_crew",
		yearsExperience: "0_1",
		skillsSummary: "",
		availability: "",
		previousWork: "",
	});

	const field =
		(k: keyof typeof form) =>
		(
			e: React.ChangeEvent<
				HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
			>,
		) =>
			setForm((p) => ({ ...p, [k]: e.target.value }));

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit({
					name: form.name,
					email: form.email,
					phone: form.phone,
					company: form.company || undefined,
					country: form.country,
					extraData: {
						role: form.role,
						yearsExperience: form.yearsExperience,
						skillsSummary: form.skillsSummary,
						availability: form.availability,
						...(form.previousWork && { previousWork: form.previousWork }),
					},
				});
			}}
			className="mt-6 space-y-4"
		>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className={labelCls} htmlFor="wf-name">
						{t("workforce.fields.name" as never)}
					</label>
					<input
						id="wf-name"
						type="text"
						required
						value={form.name}
						onChange={field("name")}
						className={inputCls}
					/>
				</div>
				<div>
					<label className={labelCls} htmlFor="wf-email">
						{t("workforce.fields.email" as never)}
					</label>
					<input
						id="wf-email"
						type="email"
						required
						value={form.email}
						onChange={field("email")}
						className={inputCls}
					/>
				</div>
				<div>
					<label className={labelCls} htmlFor="wf-phone">
						{t("workforce.fields.phone" as never)}
					</label>
					<input
						id="wf-phone"
						type="text"
						required
						value={form.phone}
						onChange={field("phone")}
						className={inputCls}
					/>
				</div>
				<div>
					<label className={labelCls} htmlFor="wf-country">
						{t("workforce.fields.country" as never)}
					</label>
					<input
						id="wf-country"
						type="text"
						required
						value={form.country}
						onChange={field("country")}
						className={inputCls}
					/>
				</div>
				<div>
					<label className={labelCls} htmlFor="wf-role">
						{t("workforce.fields.role" as never)}
					</label>
					<div className="relative">
						<select
							id="wf-role"
							required
							value={form.role}
							onChange={field("role")}
							className={`${inputCls} appearance-none`}
						>
							{WORKFORCE_ROLES.map((v) => (
								<option key={v} value={v}>
									{t(`workforce.roles.${v}` as never)}
								</option>
							))}
						</select>
						<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
							expand_more
						</span>
					</div>
				</div>
				<div>
					<label className={labelCls} htmlFor="wf-experience">
						{t("workforce.fields.yearsExperience" as never)}
					</label>
					<div className="relative">
						<select
							id="wf-experience"
							required
							value={form.yearsExperience}
							onChange={field("yearsExperience")}
							className={`${inputCls} appearance-none`}
						>
							{EXPERIENCE_LEVELS.map((v) => (
								<option key={v} value={v}>
									{t(`workforce.experienceLevels.${v}` as never)}
								</option>
							))}
						</select>
						<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
							expand_more
						</span>
					</div>
				</div>
				<div className="md:col-span-2">
					<label className={labelCls} htmlFor="wf-company">
						{t("workforce.fields.company" as never)}
					</label>
					<input
						id="wf-company"
						type="text"
						value={form.company}
						onChange={field("company")}
						className={inputCls}
					/>
				</div>
			</div>
			<div>
				<label className={labelCls} htmlFor="wf-skills">
					{t("workforce.fields.skillsSummary" as never)}
				</label>
				<textarea
					id="wf-skills"
					required
					rows={3}
					value={form.skillsSummary}
					onChange={field("skillsSummary")}
					className={`${inputCls} resize-none`}
				/>
			</div>
			<div>
				<label className={labelCls} htmlFor="wf-availability">
					{t("workforce.fields.availability" as never)}
				</label>
				<input
					id="wf-availability"
					type="text"
					required
					value={form.availability}
					onChange={field("availability")}
					placeholder={t("workforce.fields.availabilityPlaceholder" as never)}
					className={inputCls}
				/>
			</div>
			<div>
				<label className={labelCls} htmlFor="wf-previous">
					{t("workforce.fields.previousWork" as never)}
				</label>
				<textarea
					id="wf-previous"
					rows={3}
					value={form.previousWork}
					onChange={field("previousWork")}
					className={`${inputCls} resize-none`}
				/>
			</div>
			{submitError && (
				<p className="text-sm text-rose-700 font-medium">{submitError}</p>
			)}
			<button
				type="submit"
				disabled={isPending}
				className="w-full rounded-xl bg-[#FF5A30] text-white py-3 text-sm font-bold hover:opacity-90 disabled:opacity-60"
			>
				{isPending ? t("form.submitting") : t("form.submit")}
			</button>
		</form>
	);
}

// ─── Artist Management Form ────────────────────────────────────────────────────

function ArtistMgmtForm({
	onSubmit,
	submitError,
	isPending,
}: {
	onSubmit: (data: SubmitPayload) => void;
	submitError: string | null;
	isPending: boolean;
}) {
	const t = useTranslations("StakeholderRegistrationPage");
	const [form, setForm] = useState({
		agencyName: "",
		contactName: "",
		email: "",
		phone: "",
		country: "",
		artistNames: "",
		genres: "",
		managementType: "solo_artist",
		bio: "",
		website: "",
	});

	const field =
		(k: keyof typeof form) =>
		(
			e: React.ChangeEvent<
				HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
			>,
		) =>
			setForm((p) => ({ ...p, [k]: e.target.value }));

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				onSubmit({
					name: form.contactName,
					email: form.email,
					phone: form.phone,
					company: form.agencyName,
					country: form.country,
					extraData: {
						artistNames: form.artistNames,
						genres: form.genres,
						managementType: form.managementType,
						bio: form.bio,
						...(form.website && { website: form.website }),
					},
				});
			}}
			className="mt-6 space-y-4"
		>
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label className={labelCls} htmlFor="am-agency-name">
						{t("artmgmt.fields.agencyName" as never)}
					</label>
					<input
						id="am-agency-name"
						type="text"
						required
						value={form.agencyName}
						onChange={field("agencyName")}
						className={inputCls}
					/>
				</div>
				<div>
					<label className={labelCls} htmlFor="am-contact-name">
						{t("artmgmt.fields.contactName" as never)}
					</label>
					<input
						id="am-contact-name"
						type="text"
						required
						value={form.contactName}
						onChange={field("contactName")}
						className={inputCls}
					/>
				</div>
				<div>
					<label className={labelCls} htmlFor="am-email">
						{t("artmgmt.fields.email" as never)}
					</label>
					<input
						id="am-email"
						type="email"
						required
						value={form.email}
						onChange={field("email")}
						className={inputCls}
					/>
				</div>
				<div>
					<label className={labelCls} htmlFor="am-phone">
						{t("artmgmt.fields.phone" as never)}
					</label>
					<input
						id="am-phone"
						type="text"
						required
						value={form.phone}
						onChange={field("phone")}
						className={inputCls}
					/>
				</div>
				<div>
					<label className={labelCls} htmlFor="am-country">
						{t("artmgmt.fields.country" as never)}
					</label>
					<input
						id="am-country"
						type="text"
						required
						value={form.country}
						onChange={field("country")}
						className={inputCls}
					/>
				</div>
				<div>
					<label className={labelCls} htmlFor="am-management-type">
						{t("artmgmt.fields.managementType" as never)}
					</label>
					<div className="relative">
						<select
							id="am-management-type"
							required
							value={form.managementType}
							onChange={field("managementType")}
							className={`${inputCls} appearance-none`}
						>
							{MANAGEMENT_TYPES.map((v) => (
								<option key={v} value={v}>
									{t(`artmgmt.managementTypes.${v}` as never)}
								</option>
							))}
						</select>
						<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
							expand_more
						</span>
					</div>
				</div>
				<div>
					<label className={labelCls} htmlFor="am-artist-names">
						{t("artmgmt.fields.artistNames" as never)}
					</label>
					<input
						id="am-artist-names"
						type="text"
						required
						value={form.artistNames}
						onChange={field("artistNames")}
						className={inputCls}
					/>
				</div>
				<div>
					<label className={labelCls} htmlFor="am-genres">
						{t("artmgmt.fields.genres" as never)}
					</label>
					<input
						id="am-genres"
						type="text"
						required
						value={form.genres}
						onChange={field("genres")}
						placeholder={t("artmgmt.fields.genresPlaceholder" as never)}
						className={inputCls}
					/>
				</div>
				<div className="md:col-span-2">
					<label className={labelCls} htmlFor="am-website">
						{t("artmgmt.fields.website" as never)}
					</label>
					<input
						id="am-website"
						type="url"
						value={form.website}
						onChange={field("website")}
						placeholder="https://"
						className={inputCls}
					/>
				</div>
			</div>
			<div>
				<label className={labelCls} htmlFor="am-bio">
					{t("artmgmt.fields.bio" as never)}
				</label>
				<textarea
					id="am-bio"
					required
					rows={4}
					value={form.bio}
					onChange={field("bio")}
					className={`${inputCls} resize-none`}
				/>
			</div>
			{submitError && (
				<p className="text-sm text-rose-700 font-medium">{submitError}</p>
			)}
			<button
				type="submit"
				disabled={isPending}
				className="w-full rounded-xl bg-[#FF5A30] text-white py-3 text-sm font-bold hover:opacity-90 disabled:opacity-60"
			>
				{isPending ? t("form.submitting") : t("form.submit")}
			</button>
		</form>
	);
}

// ─── Brand Header ──────────────────────────────────────────────────────────────

function BrandHeader() {
	return (
		<div className="flex items-center justify-center gap-2.5 mb-6">
			<Image src="/ckrowd-logo.png" alt="Ckrowd" width={36} height={36} />
			<div className="flex flex-col leading-tight">
				<span className="text-lg font-black tracking-tight text-[#FF5A30] font-(family-name:--font-manrope)">
					TourStack
				</span>
				<span className="text-[10px] font-semibold text-black font-(family-name:--font-manrope)">
					by Ckrowd
				</span>
			</div>
		</div>
	);
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

export default function PublicOnboardingLinkPage({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	const t = useTranslations("StakeholderRegistrationPage");
	const { token } = use(params);

	const linkQuery = useQuery({
		queryKey: ["onboardingLink", token],
		queryFn: () => getOnboardingLink(token),
	});

	const submitMutation = useMutation({
		mutationFn: (body: SubmitPayload) => submitOnboardingLink(token, body),
	});

	const link = linkQuery.data?.success ? linkQuery.data.data : null;
	const category = link?.category as string | undefined;

	const submitError = submitMutation.error
		? submitMutation.error instanceof Error
			? submitMutation.error.message
			: t("errorDefault")
		: submitMutation.data && !submitMutation.data.success
			? (submitMutation.data.error ?? t("errorDefault"))
			: null;

	if (submitMutation.data?.success) {
		return (
			<div className="min-h-screen bg-surface-container-low flex items-center justify-center px-6">
				<div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
					<BrandHeader />
					<div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-4">
						<span className="material-symbols-outlined text-3xl">check</span>
					</div>
					<h1 className="text-2xl font-(family-name:--font-manrope) font-extrabold text-on-surface">
						{t("success.title")}
					</h1>
					<p className="text-sm text-on-surface-variant mt-2">
						{t("success.description")}
					</p>
					<Link
						href="/"
						className="inline-flex items-center justify-center mt-6 px-5 py-3 rounded-xl bg-[#FF5A30] text-white text-sm font-bold hover:opacity-90"
					>
						{t("success.returnHome")}
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-surface-container-low py-10 px-6">
			<div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-6 md:p-8">
				<BrandHeader />
				{linkQuery.isLoading ? (
					<>
						<p className="text-xs font-bold uppercase tracking-widest text-[#FF5A30]">
							{t("header.tagline")}
						</p>
						<h1 className="text-3xl font-(family-name:--font-manrope) font-extrabold text-on-surface mt-2">
							{t("header.title")}
						</h1>
						<p className="text-sm text-on-surface-variant mt-6">
							{t("loadingLink")}
						</p>
					</>
				) : !linkQuery.data?.success || !link ? (
					<>
						<p className="text-xs font-bold uppercase tracking-widest text-[#FF5A30]">
							{t("header.tagline")}
						</p>
						<h1 className="text-3xl font-(family-name:--font-manrope) font-extrabold text-on-surface mt-2">
							{t("header.title")}
						</h1>
						<p className="text-sm text-rose-700 mt-6">
							{linkQuery.data?.error ?? t("errorUnavailable")}
						</p>
					</>
				) : (
					<>
						<p className="text-xs font-bold uppercase tracking-widest text-[#FF5A30]">
							{category === "service"
								? t("serviceProvider.tagline" as never)
								: category === "workforce"
									? t("workforce.tagline" as never)
									: t("artmgmt.tagline" as never)}
						</p>
						<h1 className="text-3xl font-(family-name:--font-manrope) font-extrabold text-on-surface mt-2">
							{category === "service"
								? t("serviceProvider.title" as never)
								: category === "workforce"
									? t("workforce.title" as never)
									: t("artmgmt.title" as never)}
						</h1>
						{link.label ? (
							<p className="text-sm text-on-surface-variant mt-2">
								{t("label")}:{" "}
								<span className="font-semibold text-on-surface">
									{String(link.label)}
								</span>
							</p>
						) : null}

						{category === "service" ? (
							<ServiceProviderForm
								onSubmit={(data) => submitMutation.mutate(data)}
								submitError={submitError}
								isPending={submitMutation.isPending}
							/>
						) : category === "workforce" ? (
							<WorkforceForm
								onSubmit={(data) => submitMutation.mutate(data)}
								submitError={submitError}
								isPending={submitMutation.isPending}
							/>
						) : (
							<ArtistMgmtForm
								onSubmit={(data) => submitMutation.mutate(data)}
								submitError={submitError}
								isPending={submitMutation.isPending}
							/>
						)}
					</>
				)}
			</div>
		</div>
	);
}
