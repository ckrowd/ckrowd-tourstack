"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { purgeAdminDraftTours } from "@/app/actions";
import { useRouter } from "@/i18n/routing";

export default function AdminDangerZone() {
	const t = useTranslations("AdminSettingsPage");
	const router = useRouter();

	const [confirming, setConfirming] = useState(false);

	const purgeMutation = useMutation({
		mutationFn: purgeAdminDraftTours,
		onSuccess: (result) => {
			if (result.success) {
				setConfirming(false);
				router.refresh();
			}
		},
	});

	const errorMessage = purgeMutation.error
		? purgeMutation.error instanceof Error
			? purgeMutation.error.message
			: t("danger.purgeError")
		: purgeMutation.data && !purgeMutation.data.success
			? (purgeMutation.data.error ?? t("danger.purgeError"))
			: null;

	return (
		<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10">
			<h3 className="font-(family-name:--font-manrope) font-bold text-lg mb-4 pb-4 border-b border-outline-variant/20 text-red-600">
				{t("danger.title")}
			</h3>
			<p className="text-sm text-on-surface-variant mb-4">
				{t("danger.description")}
			</p>

			{confirming ? (
				<div className="space-y-3">
					<p className="text-sm font-medium text-red-600">
						{t("danger.confirmPrompt")}
					</p>
					<div className="flex flex-col gap-2">
						<button
							type="button"
							onClick={() => purgeMutation.mutate()}
							disabled={purgeMutation.isPending}
							className="w-full py-3 bg-red-600 text-white rounded-xl font-bold text-sm hover:bg-red-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
						>
							{purgeMutation.isPending
								? t("danger.purging")
								: t("danger.confirm")}
						</button>
						<button
							type="button"
							onClick={() => setConfirming(false)}
							disabled={purgeMutation.isPending}
							className="w-full py-3 border border-outline-variant/30 rounded-xl font-bold text-sm text-on-surface-variant hover:bg-surface-container-low transition-colors disabled:opacity-60"
						>
							{t("danger.cancel")}
						</button>
					</div>
				</div>
			) : (
				<button
					type="button"
					onClick={() => setConfirming(true)}
					className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-bold text-sm border border-red-200 hover:bg-red-100 transition-colors"
				>
					{t("danger.purge")}
				</button>
			)}

			{purgeMutation.data?.success && (
				<p className="mt-3 text-sm text-emerald-700 font-medium">
					{t("danger.purged", {
						count: purgeMutation.data.data?.deleted ?? 0,
					})}
				</p>
			)}
			{errorMessage && (
				<p className="mt-3 text-sm text-rose-700 font-medium">{errorMessage}</p>
			)}
		</div>
	);
}
