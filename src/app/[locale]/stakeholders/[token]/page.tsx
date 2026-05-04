"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Link } from "@/i18n/routing";
import {
	getOnboardingLink,
	submitOnboardingLink,
} from "@/app/actions";
import { useTranslations } from 'next-intl';

type FormState = {
	name: string;
	email: string;
	phone: string;
	company: string;
	country: string;
};

const defaultForm: FormState = {
	name: "",
	email: "",
	phone: "",
	company: "",
	country: "",
};

export default function PublicOnboardingLinkPage({
	params,
}: {
	params: { token: string };
}) {
	const t = useTranslations('StakeholderRegistrationPage');
	const [form, setForm] = useState<FormState>(defaultForm);

	const linkQuery = useQuery({
		queryKey: ["onboardingLink", params.token],
		queryFn: () => getOnboardingLink(params.token),
	});

	const submitMutation = useMutation({
		mutationFn: (body: {
			name: string;
			email: string;
			phone: string;
			company?: string;
			country: string;
			extraData?: Record<string, unknown>;
		}) => submitOnboardingLink(params.token, body),
	});

	const link = linkQuery.data?.success ? linkQuery.data.data : null;
	const submitError = submitMutation.error
		? submitMutation.error instanceof Error
			? submitMutation.error.message
			: t('errorDefault')
		: submitMutation.data && !submitMutation.data.success
			? (submitMutation.data.error ?? t('errorDefault'))
			: null;

	if (submitMutation.data?.success) {
		return (
			<div className="min-h-screen bg-surface-container-low flex items-center justify-center px-6">
				<div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
					<div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-4">
						<span className="material-symbols-outlined">check</span>
					</div>
					<h1 className="text-2xl font-(family-name:--font-manrope) font-extrabold text-on-surface">
						{t('success.title')}
					</h1>
					<p className="text-sm text-on-surface-variant mt-2">
						{t('success.description')}
					</p>
					<Link
						href="/"
						className="inline-flex items-center justify-center mt-6 px-5 py-3 rounded-xl bg-[#FF5A30] text-white text-sm font-bold hover:opacity-90"
					>
						{t('success.returnHome')}
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-surface-container-low py-10 px-6">
			<div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-6 md:p-8">
				<p className="text-xs font-bold uppercase tracking-widest text-[#FF5A30]">
					{t('header.tagline')}
				</p>
				<h1 className="text-3xl font-(family-name:--font-manrope) font-extrabold text-on-surface mt-2">
					{t('header.title')}
				</h1>

				{linkQuery.isLoading ? (
					<p className="text-sm text-on-surface-variant mt-6">{t('loadingLink')}</p>
				) : !linkQuery.data?.success || !link ? (
					<p className="text-sm text-rose-700 mt-6">
						{linkQuery.data?.error ?? t('errorUnavailable')}
					</p>
				) : (
					<>
						<p className="text-sm text-on-surface-variant mt-4">
							{t('category')}: <span className="font-semibold text-on-surface">{t(`StakeholdersPage.categories.${String(link.category)}`)}</span>
							{link.label ? (
								<>
									 {" · "}{t('label')}: <span className="font-semibold text-on-surface">{String(link.label)}</span>
								</>
							) : null}
						</p>

						<form
							onSubmit={(event) => {
								event.preventDefault();
								submitMutation.mutate({
									name: form.name,
									email: form.email,
									phone: form.phone,
									company: form.company || undefined,
									country: form.country,
								});
							}}
							className="mt-6 space-y-4"
						>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="onboard-name">
										{t('form.name')}
									</label>
									<input
										id="onboard-name"
										type="text"
										required
										value={form.name}
										onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
										className="w-full rounded-xl bg-surface-container-high px-4 py-3 text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
									/>
								</div>
								<div>
									<label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="onboard-email">
										{t('form.email')}
									</label>
									<input
										id="onboard-email"
										type="email"
										required
										value={form.email}
										onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
										className="w-full rounded-xl bg-surface-container-high px-4 py-3 text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
									/>
								</div>
								<div>
									<label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="onboard-phone">
										{t('form.phone')}
									</label>
									<input
										id="onboard-phone"
										type="text"
										required
										value={form.phone}
										onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
										className="w-full rounded-xl bg-surface-container-high px-4 py-3 text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
									/>
								</div>
								<div>
									<label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="onboard-country">
										{t('form.country')}
									</label>
									<input
										id="onboard-country"
										type="text"
										required
										value={form.country}
										onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
										className="w-full rounded-xl bg-surface-container-high px-4 py-3 text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
									/>
								</div>
							</div>

							<div>
								<label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="onboard-company">
									{t('form.company')}
								</label>
								<input
									id="onboard-company"
									type="text"
									value={form.company}
									onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
									className="w-full rounded-xl bg-surface-container-high px-4 py-3 text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
								/>
							</div>

							{submitError && (
								<p className="text-sm text-rose-700 font-medium">{submitError}</p>
							)}

							<button
								type="submit"
								disabled={submitMutation.isPending}
								className="w-full rounded-xl bg-[#FF5A30] text-white py-3 text-sm font-bold hover:opacity-90 disabled:opacity-60"
							>
								{submitMutation.isPending ? t('form.submitting') : t('form.submit')}
							</button>
						</form>
					</>
				)}
			</div>
		</div>
	);
}
