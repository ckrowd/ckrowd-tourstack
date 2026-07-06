"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { updateAdminSettings } from "@/app/actions";
import { useRouter } from "@/i18n/routing";

type Props = {
	initial: {
		strict_budget_match: boolean;
		auto_approve_high_match: boolean;
	};
};

function Toggle({
	id,
	label,
	description,
	checked,
	onChange,
}: {
	id: string;
	label: string;
	description: string;
	checked: boolean;
	onChange: (next: boolean) => void;
}) {
	return (
		<div className="flex items-center justify-between gap-4 p-4 bg-surface-container-low rounded-xl">
			<div>
				<p id={`${id}-label`} className="font-semibold text-sm text-on-surface">
					{label}
				</p>
				<p id={`${id}-desc`} className="text-xs text-on-surface-variant mt-1">
					{description}
				</p>
			</div>
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				aria-labelledby={`${id}-label`}
				aria-describedby={`${id}-desc`}
				onClick={() => onChange(!checked)}
				className={`relative w-11 h-6 rounded-full shrink-0 cursor-pointer transition-colors ${
					checked ? "bg-[#FF5A2E]" : "bg-surface-container-high"
				}`}
			>
				<span
					className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
						checked ? "translate-x-5" : "translate-x-0"
					}`}
				/>
			</button>
		</div>
	);
}

export default function AdminSettingsForm({ initial }: Props) {
	const t = useTranslations("AdminSettingsPage");
	const router = useRouter();

	const [strictBudget, setStrictBudget] = useState(
		initial.strict_budget_match,
	);
	const [autoApprove, setAutoApprove] = useState(
		initial.auto_approve_high_match,
	);

	const saveMutation = useMutation({
		mutationFn: updateAdminSettings,
		onSuccess: (result) => {
			if (result.success) router.refresh();
		},
	});

	const dirty =
		strictBudget !== initial.strict_budget_match ||
		autoApprove !== initial.auto_approve_high_match;

	const errorMessage = saveMutation.error
		? saveMutation.error instanceof Error
			? saveMutation.error.message
			: t("saveError")
		: saveMutation.data && !saveMutation.data.success
			? (saveMutation.data.error ?? t("saveError"))
			: null;

	return (
		<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
			<div className="flex items-center justify-between gap-4 mb-4 pb-4 border-b border-outline-variant/20">
				<h3 className="font-(family-name:--font-manrope) font-semibold text-lg">
					{t("algorithm.title")}
				</h3>
				<button
					type="button"
					onClick={() =>
						saveMutation.mutate({
							strict_budget_match: strictBudget,
							auto_approve_high_match: autoApprove,
						})
					}
					disabled={!dirty || saveMutation.isPending}
					className="flex items-center gap-2 px-5 py-2.5 bg-[#FF5A2E] text-white rounded-xl font-(family-name:--font-manrope) font-semibold text-sm shadow-lg shadow-[#FF5A2E]/20 hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
				>
					{saveMutation.isPending ? t("saving") : t("saveChanges")}
				</button>
			</div>

			<div className="space-y-4">
				<Toggle
					id="strict-budget"
					label={t("algorithm.strictBudget")}
					description={t("algorithm.strictBudgetDesc")}
					checked={strictBudget}
					onChange={setStrictBudget}
				/>
				<Toggle
					id="auto-approve"
					label={t("algorithm.autoApprove")}
					description={t("algorithm.autoApproveDesc")}
					checked={autoApprove}
					onChange={setAutoApprove}
				/>
			</div>

			{saveMutation.data?.success && (
				<p className="mt-4 text-sm text-emerald-700 font-medium">
					{t("saved")}
				</p>
			)}
			{errorMessage && (
				<p className="mt-4 text-sm text-rose-700 font-medium">{errorMessage}</p>
			)}
		</div>
	);
}
