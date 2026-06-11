"use client";

import { useTranslations } from "next-intl";

export default function ArtmgmtSubmissionsPage() {
	const t = useTranslations("ArtmgmtSubmissionsPage");

	return (
		<div>
			<div className="mb-6">
				<span className="inline-block px-3 py-1 rounded-full bg-[#FF5A30]/10 text-[#FF5A30] text-xs font-bold uppercase tracking-wider mb-3">
					{t("badge")}
				</span>
				<h1 className="font-(family-name:--font-manrope) text-3xl font-black text-on-surface">
					{t("title")}
				</h1>
				<p className="text-on-surface-variant text-sm mt-1">{t("subtitle")}</p>
			</div>

			<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 flex flex-col items-center text-center max-w-lg mx-auto mt-10">
				<div className="w-16 h-16 rounded-2xl bg-[#FF5A30]/10 flex items-center justify-center mb-5">
					<span
						className="material-symbols-outlined text-[#FF5A30] text-3xl"
						style={{ fontVariationSettings: "'FILL' 1" }}
					>
						send
					</span>
				</div>
				<h2 className="font-(family-name:--font-manrope) font-black text-xl text-slate-900 mb-2">
					{t("comingSoon.title")}
				</h2>
				<p className="text-sm text-slate-500 mb-6">
					{t("comingSoon.description")}
				</p>
				<div className="w-full space-y-2 text-left">
					{(["feature1", "feature2", "feature3"] as const).map((key) => (
						<div
							key={key}
							className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl text-sm text-slate-700"
						>
							<span className="material-symbols-outlined text-[#FF5A30] text-base shrink-0">
								check_circle
							</span>
							{t(`comingSoon.${key}`)}
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
