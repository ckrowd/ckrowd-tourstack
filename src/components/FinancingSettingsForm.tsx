"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { updateFinancingSettings } from "@/app/actions";

type Settings = {
	auto_reject_below_threshold: boolean;
	require_term_sheet_for_approval: boolean;
	notify_promoter_on_decision: boolean;
	auto_review_limit_usd: number;
	committee_review_threshold_usd: number;
	max_application_usd: number;
};

const POLICIES = [
	"auto_reject_below_threshold",
	"require_term_sheet_for_approval",
	"notify_promoter_on_decision",
] as const;

const THRESHOLDS = [
	"auto_review_limit_usd",
	"committee_review_threshold_usd",
	"max_application_usd",
] as const;

export default function FinancingSettingsForm({
	initial,
}: {
	initial: Settings;
}) {
	const t = useTranslations("FinancingAdminSettingsPage");
	const queryClient = useQueryClient();
	const [draft, setDraft] = useState<Settings>(initial);

	useEffect(() => {
		setDraft(initial);
	}, [initial]);

	const mutation = useMutation({
		mutationFn: (next: Partial<Settings>) => updateFinancingSettings(next),
		onSuccess: (result) => {
			if (result.success) {
				void queryClient.invalidateQueries({
					queryKey: ["financingSettings"],
				});
			}
		},
	});

	const dirty =
		POLICIES.some((k) => draft[k] !== initial[k]) ||
		THRESHOLDS.some((k) => draft[k] !== initial[k]);

	const saved = mutation.data?.success === true;
	const failed = mutation.isSuccess && mutation.data?.success === false;

	function setPolicy(key: (typeof POLICIES)[number], value: boolean) {
		setDraft((d) => ({ ...d, [key]: value }));
	}

	function setThreshold(key: (typeof THRESHOLDS)[number], raw: string) {
		const n = Number.parseInt(raw, 10);
		setDraft((d) => ({ ...d, [key]: Number.isFinite(n) ? n : 0 }));
	}

	function submit(e: React.FormEvent) {
		e.preventDefault();
		if (!dirty) return;
		const next: Partial<Settings> = {};
		for (const k of POLICIES) if (draft[k] !== initial[k]) next[k] = draft[k];
		for (const k of THRESHOLDS) if (draft[k] !== initial[k]) next[k] = draft[k];
		mutation.mutate(next);
	}

	return (
		<form
			onSubmit={submit}
			className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10"
		>
			<div className="flex items-center justify-between mb-4 pb-4 border-b border-outline-variant/20">
				<h3 className="font-(family-name:--font-manrope) font-bold text-base">
					{t("policies.title")}
				</h3>
				<button
					type="submit"
					disabled={!dirty || mutation.isPending}
					className="px-4 py-2 rounded-lg text-sm font-bold bg-[#FF5A30] text-white shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 disabled:opacity-50"
				>
					{mutation.isPending ? t("saving") : t("saveChanges")}
				</button>
			</div>

			<div className="space-y-4">
				{POLICIES.map((key) => (
					<div
						key={key}
						className="flex items-center justify-between gap-4 p-4 bg-surface-container-low rounded-xl"
					>
						<div>
							<p
								id={`finance-policy-${key}`}
								className="font-bold text-sm text-on-surface"
							>
								{t(`policies.${key}.title`)}
							</p>
							<p className="text-xs text-on-surface-variant mt-1">
								{t(`policies.${key}.description`)}
							</p>
						</div>
						<label className="relative w-11 h-6 rounded-full shrink-0 cursor-pointer bg-surface-container-high has-[:checked]:bg-[#FF5A30]">
							<input
								type="checkbox"
								role="switch"
								aria-labelledby={`finance-policy-${key}`}
								aria-checked={draft[key]}
								checked={draft[key]}
								onChange={(e) => setPolicy(key, e.target.checked)}
								className="peer sr-only"
							/>
							<span className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
						</label>
					</div>
				))}
			</div>

			<h3 className="font-(family-name:--font-manrope) font-bold text-base mt-6 mb-4 pb-4 border-b border-outline-variant/20">
				{t("thresholds.title")}
			</h3>
			<div className="space-y-3">
				{THRESHOLDS.map((key) => (
					<div key={key} className="bg-surface-container-low rounded-xl p-4">
						<div className="flex items-center justify-between gap-3 mb-2">
							<label
								htmlFor={`finance-threshold-${key}`}
								className="text-xs font-black uppercase tracking-wider text-on-surface-variant"
							>
								{t(`thresholds.${key}.label`)}
							</label>
							<input
								id={`finance-threshold-${key}`}
								type="number"
								min={0}
								value={draft[key]}
								onChange={(e) => setThreshold(key, e.target.value)}
								className="w-32 rounded-lg border border-outline-variant/20 bg-surface-container-lowest px-2 py-1 text-sm font-bold text-on-surface text-right focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
							/>
						</div>
						<p className="text-xs text-on-surface-variant leading-5">
							{t(`thresholds.${key}.description`)}
						</p>
					</div>
				))}
			</div>

			{saved && (
				<p
					className="text-sm text-emerald-700 font-medium mt-4"
					role="status"
				>
					{t("saved")}
				</p>
			)}
			{(failed || mutation.isError) && (
				<p className="text-sm text-red-600 font-medium mt-4" role="alert">
					{mutation.data?.error || t("saveError")}
				</p>
			)}
		</form>
	);
}
