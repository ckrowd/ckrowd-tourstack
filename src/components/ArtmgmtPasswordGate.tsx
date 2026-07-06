"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { changePassword, clearForcePasswordChange } from "@/app/actions";

export default function ArtmgmtPasswordGate({
	forcePasswordChange,
	children,
}: {
	forcePasswordChange: boolean;
	children: React.ReactNode;
}) {
	const t = useTranslations("ArtmgmtPasswordGate");
	const router = useRouter();

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [validationError, setValidationError] = useState<string | null>(null);
	const [done, setDone] = useState(false);

	const mutation = useMutation({
		mutationFn: async () => {
			const result = await changePassword(currentPassword, newPassword);
			if (!result.success) throw new Error(result.error || t("error"));
			await clearForcePasswordChange();
		},
		onSuccess: () => {
			setDone(true);
			setTimeout(() => router.refresh(), 800);
		},
	});

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setValidationError(null);
		if (newPassword.length < 8) {
			setValidationError(t("tooShort"));
			return;
		}
		if (newPassword !== confirmPassword) {
			setValidationError(t("mismatch"));
			return;
		}
		mutation.mutate();
	}

	if (!forcePasswordChange || done) return <>{children}</>;

	const inputCls =
		"w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/40 placeholder:text-slate-400";

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
			<div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
				<div className="h-1.5 w-full bg-[#FF5A2E]" />
				<div className="p-8">
					<div className="flex items-center gap-3 mb-6">
						<span className="material-symbols-outlined text-[#FF5A2E] text-3xl">
							lock_reset
						</span>
						<div>
							<h2 className="font-(family-name:--font-manrope) text-xl font-black text-slate-900">
								{t("title")}
							</h2>
							<p className="text-xs text-slate-500 mt-0.5">{t("description")}</p>
						</div>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div>
							<label className="block text-xs font-semibold text-slate-700 mb-1">
								{t("currentPasswordLabel")}
							</label>
							<input
								type="password"
								required
								autoComplete="current-password"
								value={currentPassword}
								onChange={(e) => setCurrentPassword(e.target.value)}
								placeholder={t("currentPasswordPlaceholder")}
								className={inputCls}
							/>
						</div>

						<div>
							<label className="block text-xs font-semibold text-slate-700 mb-1">
								{t("newPasswordLabel")}
							</label>
							<input
								type="password"
								required
								autoComplete="new-password"
								value={newPassword}
								onChange={(e) => setNewPassword(e.target.value)}
								placeholder={t("newPasswordPlaceholder")}
								className={inputCls}
							/>
						</div>

						<div>
							<label className="block text-xs font-semibold text-slate-700 mb-1">
								{t("confirmPasswordLabel")}
							</label>
							<input
								type="password"
								required
								autoComplete="new-password"
								value={confirmPassword}
								onChange={(e) => setConfirmPassword(e.target.value)}
								placeholder={t("confirmPasswordPlaceholder")}
								className={inputCls}
							/>
						</div>

						{(validationError ?? mutation.error) && (
							<p className="text-sm text-red-600 font-medium" role="alert">
								{validationError ?? (mutation.error as Error).message}
							</p>
						)}

						<button
							type="submit"
							disabled={mutation.isPending}
							className="w-full py-3 bg-[#FF5A2E] text-white rounded-xl font-semibold text-sm hover:bg-[#e04e27] disabled:opacity-60 transition-colors mt-2"
						>
							{mutation.isPending ? t("saving") : t("submit")}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
