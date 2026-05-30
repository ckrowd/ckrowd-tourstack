"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { use } from "react";
import { getOnboardingLink, submitOnboardingLink } from "@/app/actions";
import {
	BrandHeader,
	StakeholderForm,
	type StakeholderCategory,
	type SubmitPayload,
} from "@/components/onboarding/StakeholderForms";
import OnboardingValueProps from "@/components/onboarding/OnboardingValueProps";
import { Link } from "@/i18n/routing";

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
	const category = link?.category as StakeholderCategory | undefined;

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
					<p className="text-sm text-on-surface-variant mt-2">{t("success.description")}</p>
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
						<p className="text-sm text-on-surface-variant mt-6">{t("loadingLink")}</p>
					</>
				) : !linkQuery.data?.success || !link || !category ? (
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
								<span className="font-semibold text-on-surface">{String(link.label)}</span>
							</p>
						) : null}

						<OnboardingValueProps />

						<StakeholderForm
							category={category}
							onSubmit={(data) => submitMutation.mutate(data)}
							submitError={submitError}
							isPending={submitMutation.isPending}
						/>
					</>
				)}
			</div>
		</div>
	);
}
