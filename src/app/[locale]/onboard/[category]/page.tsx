"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { use } from "react";
import { registerStakeholder } from "@/app/actions";
import {
	BrandHeader,
	StakeholderForm,
	type StakeholderCategory,
	type SubmitPayload,
} from "@/components/onboarding/StakeholderForms";
import OnboardingValueProps from "@/components/onboarding/OnboardingValueProps";
import { Link } from "@/i18n/routing";

const VALID: StakeholderCategory[] = ["service", "workforce", "artmgmt"];

function isCategory(value: string): value is StakeholderCategory {
	return (VALID as string[]).includes(value);
}

export default function SelfServeOnboardingPage({
	params,
}: {
	params: Promise<{ category: string }>;
}) {
	const t = useTranslations("StakeholderRegistrationPage");
	const { category } = use(params);

	const submitMutation = useMutation({
		mutationFn: (body: SubmitPayload) =>
			registerStakeholder({ ...body, category: category as StakeholderCategory }),
	});

	const submitError = submitMutation.error
		? submitMutation.error instanceof Error
			? submitMutation.error.message
			: t("errorDefault")
		: submitMutation.data && !submitMutation.data.success
			? (submitMutation.data.error ?? t("errorDefault"))
			: null;

	if (!isCategory(category)) {
		return (
			<div className="min-h-screen bg-surface-container-low flex items-center justify-center px-6">
				<div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
					<BrandHeader />
					<p className="text-sm text-rose-700 mt-4">{t("errorUnavailable")}</p>
					<Link
						href="/join"
						className="inline-flex items-center justify-center mt-6 px-5 py-3 rounded-xl bg-[#FF5A30] text-white text-sm font-bold hover:opacity-90"
					>
						{t("success.returnHome")}
					</Link>
				</div>
			</div>
		);
	}

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

				<OnboardingValueProps />

				<StakeholderForm
					category={category}
					onSubmit={(data) => submitMutation.mutate(data)}
					submitError={submitError}
					isPending={submitMutation.isPending}
				/>
			</div>
		</div>
	);
}
