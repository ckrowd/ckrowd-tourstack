"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { changePassword, getTourstackProfile } from "@/app/actions";

export default function ArtmgmtProfilePage() {
	const t = useTranslations("ArtmgmtProfilePage");
	const qc = useQueryClient();

	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

	function showToast(msg: string, ok: boolean) {
		setToast({ msg, ok });
		setTimeout(() => setToast(null), 3500);
	}

	const { data: profile } = useQuery({
		queryKey: ["tourstack-profile"],
		queryFn: getTourstackProfile,
		select: (r) => r.data as { company_name?: string; contact_person?: string; user?: { email?: string; name?: string } } | undefined,
	});

	const passwordMutation = useMutation({
		mutationFn: ({
			current,
			next,
		}: {
			current: string;
			next: string;
		}) => changePassword(current, next),
		onSuccess: (result) => {
			if (result.success) {
				void qc.invalidateQueries({ queryKey: ["session"] });
				setCurrentPassword("");
				setNewPassword("");
				setConfirmPassword("");
				showToast(t("passwordSuccess"), true);
			} else {
				showToast(result.error || t("passwordError"), false);
			}
		},
	});

	function handlePasswordSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			showToast(t("passwordMismatch"), false);
			return;
		}
		if (newPassword.length < 8) {
			showToast(t("passwordTooShort"), false);
			return;
		}
		passwordMutation.mutate({ current: currentPassword, next: newPassword });
	}

	const inputCls =
		"w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/40 placeholder:text-slate-400";

	return (
		<div className="max-w-2xl">
			{/* Header */}
			<div className="mb-8">
				<span className="inline-block px-3 py-1 rounded-full bg-[#FF5A30]/10 text-[#FF5A30] text-xs font-bold uppercase tracking-wider mb-3">
					{t("badge")}
				</span>
				<h1 className="font-(family-name:--font-manrope) text-3xl font-black text-on-surface">
					{t("title")}
				</h1>
				<p className="text-on-surface-variant text-sm mt-1">{t("subtitle")}</p>
			</div>

			{/* Toast */}
			{toast && (
				<div
					className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-xl text-white text-sm font-semibold shadow-xl transition-all ${toast.ok ? "bg-emerald-500" : "bg-rose-500"}`}
				>
					{toast.msg}
				</div>
			)}

			{/* Account info */}
			<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
				<h2 className="font-bold text-slate-900 mb-4">{t("accountInfo")}</h2>
				<div className="space-y-3">
					{profile?.user?.name && (
						<div>
							<p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
								{t("name")}
							</p>
							<p className="text-sm font-semibold text-slate-800">{profile.user.name}</p>
						</div>
					)}
					{profile?.user?.email && (
						<div>
							<p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
								{t("email")}
							</p>
							<p className="text-sm font-semibold text-slate-800">{profile.user.email}</p>
						</div>
					)}
					{profile?.company_name && (
						<div>
							<p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
								{t("company")}
							</p>
							<p className="text-sm font-semibold text-slate-800">{profile.company_name}</p>
						</div>
					)}
					{profile?.contact_person && (
						<div>
							<p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-0.5">
								{t("contactPerson")}
							</p>
							<p className="text-sm font-semibold text-slate-800">{profile.contact_person}</p>
						</div>
					)}
				</div>
			</div>

			{/* Change password */}
			<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
				<h2 className="font-bold text-slate-900 mb-1">{t("changePassword")}</h2>
				<p className="text-xs text-slate-500 mb-5">{t("changePasswordHint")}</p>

				<form onSubmit={handlePasswordSubmit} className="space-y-4">
					<div>
						<label className="block text-xs font-semibold text-slate-700 mb-1">
							{t("currentPassword")}
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
							{t("newPassword")}
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
							{t("confirmPassword")}
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

					<button
						type="submit"
						disabled={passwordMutation.isPending}
						className="w-full py-3 bg-[#FF5A30] text-white rounded-xl font-bold text-sm hover:bg-[#e04e27] disabled:opacity-60 transition-colors mt-2"
					>
						{passwordMutation.isPending ? t("saving") : t("savePassword")}
					</button>
				</form>
			</div>
		</div>
	);
}
