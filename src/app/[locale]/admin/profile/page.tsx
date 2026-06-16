"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useMemo, useRef, useState } from "react";
import { getTourstackProfile, updateTourstackProfile } from "../../../actions";
import SignaturePad from "@/components/SignaturePad";

const CEO_SIG_KEY = "platform_admin_ceo_signature";

type ProfileData = {
	company_name?: string | null;
	trading_name?: string | null;
	contact_person?: string | null;
	job_title?: string | null;
	phone?: string | null;
	country?: string | null;
	city?: string | null;
	bio?: string | null;
	website_url?: string | null;
	instagram_handle?: string | null;
	logo_url?: string | null;
};

type ProfileResponse = {
	success: boolean;
	data?: ProfileData;
	error?: string;
};

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
	defaultValue,
	value,
	onChange,
	type = "text",
	hint,
	placeholder,
}: {
	label: string;
	id: string;
	defaultValue?: string;
	value?: string;
	onChange?: (v: string) => void;
	type?: string;
	hint?: string;
	placeholder?: string;
}) {
	return (
		<div>
			<label
				htmlFor={id}
				className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5"
			>
				{label}
			</label>
			<input
				id={id}
				type={type}
				placeholder={placeholder}
				{...(onChange
					? { value: value ?? "", onChange: (e) => onChange(e.target.value) }
					: { defaultValue })}
				className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30"
			/>
			{hint && <p className="text-xs text-on-surface-variant mt-1.5">{hint}</p>}
		</div>
	);
}

export default function AdminProfilePage() {
	const queryClient = useQueryClient();
	const t = useTranslations("AdminProfilePage");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const [ceoSignature, setCeoSignature] = useState<string | null>(() => {
		if (typeof window === "undefined") return null;
		return localStorage.getItem(CEO_SIG_KEY);
	});
	const [ceoSigSaved, setCeoSigSaved] = useState(false);

	function saveCeoSignature() {
		if (ceoSignature) {
			localStorage.setItem(CEO_SIG_KEY, ceoSignature);
		} else {
			localStorage.removeItem(CEO_SIG_KEY);
		}
		setCeoSigSaved(true);
	}

	const { data: profileQuery } = useQuery<ProfileResponse, Error>({
		queryKey: ["tourstackProfile"],
		queryFn: () => getTourstackProfile() as Promise<ProfileResponse>,
	});

	const photoMutation = useMutation<ProfileResponse, Error, Parameters<typeof updateTourstackProfile>[0]>({
		mutationFn: (variables) => updateTourstackProfile(variables) as Promise<ProfileResponse>,
		onSuccess: (result) => {
			if (result.success) {
				void queryClient.invalidateQueries({ queryKey: ["tourstackProfile"] });
			}
		},
	});

	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			photoMutation.mutate({ logoUrl: ev.target?.result as string });
		};
		reader.readAsDataURL(file);
		e.target.value = "";
	};

	const logoUrl = profileQuery?.success && profileQuery.data?.logo_url ? profileQuery.data.logo_url : null;
	const initials = (profileQuery?.data?.contact_person ?? profileQuery?.data?.company_name ?? "?").slice(0, 2).toUpperCase();

	const emptyProfile = {
		companyName: "",
		tradingName: "",
		contactPerson: "",
		jobTitle: "",
		email: "",
		phone: "",
		country: "",
		city: "",
		bio: "",
		websiteUrl: "",
		instagramHandle: "",
	};

	const serverProfile = useMemo(() => {
		if (profileQuery?.success && profileQuery.data) {
			const d = profileQuery.data;
			return {
				companyName: String(d.company_name ?? ""),
				tradingName: String(d.trading_name ?? ""),
				contactPerson: String(d.contact_person ?? ""),
				jobTitle: String(d.job_title ?? ""),
				email: "",
				phone: String(d.phone ?? ""),
				country: String(d.country ?? ""),
				city: String(d.city ?? ""),
				bio: String(d.bio ?? ""),
				websiteUrl: String(d.website_url ?? ""),
				instagramHandle: String(d.instagram_handle ?? ""),
			};
		}
		return null;
	}, [profileQuery]);

	const [localEdits, setLocalEdits] = useState<Partial<typeof emptyProfile>>(
		{},
	);

	const profile = { ...emptyProfile, ...serverProfile, ...localEdits };

	const saveMutation = useMutation<
		ProfileResponse,
		Error,
		Parameters<typeof updateTourstackProfile>[0]
	>({
		mutationFn: (variables) =>
			updateTourstackProfile(variables) as Promise<ProfileResponse>,
		onSuccess: (result) => {
			if (result.success) {
				setLocalEdits({});
				void queryClient.invalidateQueries({ queryKey: ["tourstackProfile"] });
			}
		},
	});

	const set = (key: keyof typeof emptyProfile) => (v: string) =>
		setLocalEdits((p) => ({ ...p, [key]: v }));

	const handleSave = () => {
		saveMutation.mutate({
			companyName: profile.companyName || undefined,
			tradingName: profile.tradingName || undefined,
			contactPerson: profile.contactPerson || undefined,
			jobTitle: profile.jobTitle || undefined,
			bio: profile.bio || undefined,
			phone: profile.phone || undefined,
			country: profile.country || undefined,
			city: profile.city || undefined,
			websiteUrl: profile.websiteUrl || undefined,
			instagramHandle: profile.instagramHandle || undefined,
		});
	};

	return (
		<>
			<div className="mb-8">
				<span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A30] block mb-2">
					{t("role")}
				</span>
				<h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
					{t("title")}
				</h1>
				<p className="text-on-surface-variant font-medium">
					{t("description")}
				</p>
			</div>

			<div className="space-y-6">
				{/* Profile photo */}
				<Section title={t("profilePhoto")}>
					<div className="flex items-center gap-5">
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							className="relative w-20 h-20 rounded-2xl overflow-hidden bg-surface-container-low border-2 border-dashed border-outline-variant/40 hover:border-[#FF5A30]/60 transition-colors flex items-center justify-center shrink-0 group"
						>
							{logoUrl ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img src={logoUrl} alt="" className="w-full h-full object-cover" />
							) : (
								<span className="text-xl font-semibold text-on-surface-variant group-hover:text-[#FF5A30] transition-colors">
									{initials}
								</span>
							)}
							<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
								<span className="material-symbols-outlined text-white text-xl">photo_camera</span>
							</div>
						</button>
						<div>
							<button
								type="button"
								onClick={() => fileInputRef.current?.click()}
								disabled={photoMutation.isPending}
								className="inline-flex items-center gap-2 px-4 py-2.5 border border-outline-variant/40 rounded-xl text-sm font-semibold text-on-surface hover:border-[#FF5A30]/50 hover:text-[#FF5A30] transition-all disabled:opacity-60"
							>
								<span className="material-symbols-outlined text-base">upload</span>
								{photoMutation.isPending ? t("uploadingPhoto") : t("uploadPhoto")}
							</button>
						</div>
					</div>
					<input
						ref={fileInputRef}
						type="file"
						accept="image/*"
						className="sr-only"
						onChange={handlePhotoChange}
					/>
				</Section>

				<Section title={t("personalInfo")}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<Field
							label={t("fullName")}
							id="contact-name"
							value={profile.contactPerson}
							onChange={set("contactPerson")}
							placeholder={t("fullNamePlaceholder")}
						/>
						<Field
							label={t("jobTitle")}
							id="job-title"
							value={profile.jobTitle}
							onChange={set("jobTitle")}
							placeholder={t("jobTitlePlaceholder")}
						/>
						<Field
							label={t("email")}
							id="email"
							type="email"
							value={profile.email}
							onChange={set("email")}
							placeholder={t("emailPlaceholder")}
						/>
						<Field
							label={t("phone")}
							id="phone"
							type="tel"
							value={profile.phone}
							onChange={(v) => set("phone")(v.replace(/\D/g, ""))}
							placeholder={t("phonePlaceholder")}
						/>
						<Field
							label={t("country")}
							id="country"
							value={profile.country}
							onChange={set("country")}
							placeholder={t("countryPlaceholder")}
						/>
						<Field
							label={t("city")}
							id="city"
							value={profile.city}
							onChange={set("city")}
							placeholder={t("cityPlaceholder")}
						/>
					</div>
				</Section>

				<Section
					title={t("publicDetails")}
					description={t("publicDetailsDesc")}
				>
					<div className="space-y-5">
						<div>
							<label
								htmlFor="bio"
								className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5"
							>
								{t("bio")}
							</label>
							<textarea
								id="bio"
								rows={4}
								value={profile.bio}
								onChange={(e) => set("bio")(e.target.value)}
								placeholder={t("bioPlaceholder")}
								className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30 resize-none"
							/>
						</div>
						<Field
							label={t("linkedin")}
							id="website"
							type="url"
							value={profile.websiteUrl}
							onChange={set("websiteUrl")}
							placeholder={t("linkedinPlaceholder")}
						/>
					</div>
				</Section>

				{/* CEO Signature */}
				<Section title={t("ceoSignatureTitle")} description={t("ceoSignatureDesc")}>
					<SignaturePad
						value={ceoSignature}
						onChange={(v) => { setCeoSignature(v); setCeoSigSaved(false); }}
						label={t("ceoSigLabel")}
						hint={t("ceoSigHint")}
					/>
					<div className="flex items-center gap-4 pt-2">
						<button
							type="button"
							onClick={saveCeoSignature}
							className="px-6 py-2.5 bg-[#FF5A30] text-white rounded-xl font-semibold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all"
						>
							{t("saveCeoSig")}
						</button>
						{ceoSigSaved && (
							<p className="text-sm font-medium text-emerald-700 flex items-center gap-1.5">
								<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
								{t("ceoSigSaved")}
							</p>
						)}
					</div>
				</Section>

				<div className="flex justify-end">
					<button
						type="button"
						onClick={handleSave}
						disabled={saveMutation.isPending}
						className="bg-[#FF5A30] text-white px-8 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all disabled:opacity-60"
					>
						{saveMutation.isPending ? t("saving") : t("save")}
					</button>
				</div>
			</div>
		</>
	);
}
