"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { changePassword, getTourstackProfile, updateTourstackProfile } from "@/app/actions";

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

	const fileInputRef = useRef<HTMLInputElement>(null);

	const { data: profile } = useQuery({
		queryKey: ["tourstackProfile"],
		queryFn: getTourstackProfile,
		select: (r) => r.data as { company_name?: string; contact_person?: string; logo_url?: string | null; user?: { email?: string; name?: string } } | undefined,
	});

	const photoMutation = useMutation({
		mutationFn: (logoUrl: string) => updateTourstackProfile({ logoUrl }),
		onSuccess: (result) => {
			if (result.success) {
				void qc.invalidateQueries({ queryKey: ["tourstackProfile"] });
			}
		},
	});

	const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const reader = new FileReader();
		reader.onload = (ev) => {
			photoMutation.mutate(ev.target?.result as string);
		};
		reader.readAsDataURL(file);
		e.target.value = "";
	};

	const logoUrl = profile?.logo_url ?? null;
	const initials = (profile?.company_name ?? profile?.contact_person ?? "?").slice(0, 2).toUpperCase();

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
		"w-full px-3 py-2.5 text-sm rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/40 placeholder:text-slate-400";

	return (
		<div className="max-w-2xl">
			{/* Header */}
			<div className="mb-8">
				<span className="inline-block px-3 py-1 rounded-full bg-[#FF5A2E]/10 text-[#FF5A2E] text-xs font-semibold uppercase tracking-wider mb-3">
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

			{/* Profile photo */}
			<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
				<h2 className="font-semibold text-slate-900 mb-4">{t("profilePhoto")}</h2>
				<div className="flex items-center gap-5">
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						className="relative w-20 h-20 rounded-2xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 hover:border-[#FF5A2E]/60 transition-colors flex items-center justify-center shrink-0 group"
					>
						{logoUrl ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={logoUrl} alt="" className="w-full h-full object-cover" />
						) : (
							<span className="text-xl font-semibold text-slate-400 group-hover:text-[#FF5A2E] transition-colors">
								{initials}
							</span>
						)}
						<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
							<span className="material-symbols-outlined text-white text-xl">photo_camera</span>
						</div>
					</button>
					<div>
						<button
							type="button"
							onClick={() => fileInputRef.current?.click()}
							disabled={photoMutation.isPending}
							className="inline-flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:border-[#FF5A2E]/50 hover:text-[#FF5A2E] transition-all disabled:opacity-60"
						>
							<span className="material-symbols-outlined text-base">upload</span>
							{photoMutation.isPending ? t("uploadingPhoto") : t("uploadPhoto")}
						</button>
					</div>
				</div>
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					className="sr-only"
					onChange={handlePhotoChange}
				/>
			</div>

			{/* Account info */}
			<div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-6">
				<h2 className="font-semibold text-slate-900 mb-4">{t("accountInfo")}</h2>
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
				<h2 className="font-semibold text-slate-900 mb-1">{t("changePassword")}</h2>
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
						className="w-full py-3 bg-[#FF5A2E] text-white rounded-xl font-semibold text-sm hover:bg-[#e04e27] disabled:opacity-60 transition-colors mt-2"
					>
						{passwordMutation.isPending ? t("saving") : t("savePassword")}
					</button>
				</form>
			</div>
		</div>
	);
}
