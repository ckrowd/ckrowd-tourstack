"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { getTourstackProfile, updateTourstackProfile } from "../../../actions";

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

export default function AdminProfilePage() {
	const queryClient = useQueryClient();
	const t = useTranslations("AdminProfilePage");

	const { data: profileQuery } = useQuery<ProfileResponse, Error>({
		queryKey: ["tourstackProfile"],
		queryFn: () => getTourstackProfile() as Promise<ProfileResponse>,
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
		onSuccess: () => {
			setLocalEdits({});
			void queryClient.invalidateQueries({ queryKey: ["tourstackProfile"] });
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
				<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
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
				<Section title={t("personalInfo")}>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
						<Field
							label={t("fullName")}
							id="contact-name"
							value={profile.contactPerson}
							onChange={set("contactPerson")}
						/>
						<Field
							label={t("jobTitle")}
							id="job-title"
							value={profile.jobTitle}
							onChange={set("jobTitle")}
						/>
						<Field
							label={t("email")}
							id="email"
							type="email"
							value={profile.email}
							onChange={set("email")}
						/>
						<Field
							label={t("phone")}
							id="phone"
							type="tel"
							value={profile.phone}
							onChange={(v) => set("phone")(v.replace(/\D/g, ""))}
						/>
						<Field
							label={t("country")}
							id="country"
							value={profile.country}
							onChange={set("country")}
						/>
						<Field
							label={t("city")}
							id="city"
							value={profile.city}
							onChange={set("city")}
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
								className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5"
							>
								{t("bio")}
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
							label={t("linkedin")}
							id="website"
							type="url"
							value={profile.websiteUrl}
							onChange={set("websiteUrl")}
						/>
					</div>
				</Section>

				<div className="flex justify-end">
					<button
						type="button"
						onClick={handleSave}
						disabled={saveMutation.isPending}
						className="bg-[#FF5A30] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all disabled:opacity-60"
					>
						{saveMutation.isPending ? t("saving") : t("save")}
					</button>
				</div>
			</div>
		</>
	);
}
