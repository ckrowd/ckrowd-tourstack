"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
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
				<h3 className="font-(family-name:--font-manrope) font-bold text-lg text-on-surface">
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
}: {
	label: string;
	id: string;
	defaultValue?: string;
	value?: string;
	onChange?: (v: string) => void;
	type?: string;
	hint?: string;
}) {
	return (
		<div>
			<label
				htmlFor={id}
				className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5"
			>
				{label}
			</label>
			<input
				id={id}
				type={type}
				{...(onChange
					? { value: value ?? "", onChange: (e) => onChange(e.target.value) }
					: { defaultValue })}
				className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30"
			/>
			{hint && <p className="text-xs text-on-surface-variant mt-1.5">{hint}</p>}
		</div>
	);
}

export default function ProfileClient() {
	const t = useTranslations("ProfilePage");
	const queryClient = useQueryClient();
	const { data: session } = useSession();

	const { data: profileQuery } = useQuery({
		queryKey: ["tourstackProfile"],
		queryFn: getTourstackProfile,
	});

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
				email: session?.user?.email ?? "",
				phone: String(d.phone ?? ""),
				country: String(d.country ?? ""),
				city: String(d.city ?? ""),
				bio: String(d.bio ?? ""),
				websiteUrl: String(d.website_url ?? ""),
				instagramHandle: String(d.instagram_handle ?? ""),
			};
		}
		return null;
	}, [profileQuery, session]);

	const [localEdits, setLocalEdits] = useState<Partial<typeof emptyProfile>>(
		{},
	);
	const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">(
		"idle",
	);

	const profile = { ...emptyProfile, ...serverProfile, ...localEdits };

	const saveMutation = useMutation({
		mutationFn: updateTourstackProfile,
		onSuccess: (result) => {
			if (result.success) {
				setLocalEdits({});
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

	const set = (key: keyof typeof emptyProfile) => (v: string) =>
		setLocalEdits((p) => ({ ...p, [key]: v }));

	const handleSave = () => {
		setSaveStatus("idle");
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
		<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
			{/* Header */}
			<div className="mb-8">
				<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
					{t("promoterPortal")}
				</span>
				<h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
					{t("title")}
				</h1>
				<p className="text-on-surface-variant font-medium">
					{t("description")}
				</p>
			</div>

			<div className="space-y-6">
				<Section title={t("companyInfo.title")}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<Field
							label={t("companyInfo.fields.companyName")}
							id="company-name"
							value={profile.companyName}
							onChange={set("companyName")}
						/>
						<Field
							label={t("companyInfo.fields.tradingName")}
							id="trading-name"
							value={profile.tradingName}
							onChange={set("tradingName")}
						/>
						<Field
							label={t("companyInfo.fields.contactPerson")}
							id="contact-name"
							value={profile.contactPerson}
							onChange={set("contactPerson")}
						/>
						<Field
							label={t("companyInfo.fields.jobTitle")}
							id="job-title"
							value={profile.jobTitle}
							onChange={set("jobTitle")}
						/>
						<Field
							label={t("companyInfo.fields.email")}
							id="email"
							type="email"
							value={profile.email}
							onChange={set("email")}
						/>
						<Field
							label={t("companyInfo.fields.phone")}
							id="phone"
							type="tel"
							value={profile.phone}
							onChange={(v) => set("phone")(v.replace(/\D/g, ""))}
						/>
						<Field
							label={t("companyInfo.fields.country")}
							id="country"
							value={profile.country}
							onChange={set("country")}
						/>
						<Field
							label={t("companyInfo.fields.city")}
							id="city"
							value={profile.city}
							onChange={set("city")}
						/>
					</div>
				</Section>

				<Section
					title={t("publicProfile.title")}
					description={t("publicProfile.description")}
				>
					<div className="space-y-5">
						<div>
							<label
								htmlFor="bio"
								className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5"
							>
								{t("publicProfile.fields.bio")}
							</label>
							<textarea
								id="bio"
								rows={4}
								value={profile.bio}
								onChange={(e) => set("bio")(e.target.value)}
								className="w-full bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30 resize-none"
							/>
						</div>
						<Field
							label={t("publicProfile.fields.website")}
							id="website"
							type="url"
							value={profile.websiteUrl}
							onChange={set("websiteUrl")}
						/>
						<Field
							label={t("publicProfile.fields.instagram")}
							id="instagram"
							value={profile.instagramHandle}
							onChange={set("instagramHandle")}
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
						className="bg-[#FF5A30] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all disabled:opacity-60"
					>
						{saveMutation.isPending
							? t("actions.saving")
							: t("actions.save")}
					</button>
				</div>
			</div>
		</main>
	);
}
