"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
	changePassword,
	deleteAccount,
	disable2FA,
	getSession,
	revokeOtherSessions,
	setup2FA,
	verify2FA,
} from "@/app/actions";
import { Field, Section } from "@/components/SettingsPrimitives";

export default function SettingsSecurityTab() {
	const t = useTranslations("SettingsPage.securityTab");
	const router = useRouter();
	const { locale } = useParams<{ locale: string }>();

	// Password
	const [currentPw, setCurrentPw] = useState("");
	const [newPw, setNewPw] = useState("");
	const [confirmPw, setConfirmPw] = useState("");
	const [pwError, setPwError] = useState<string | null>(null);

	const passwordMutation = useMutation({
		mutationFn: () => changePassword(currentPw, newPw),
		onSuccess: (result) => {
			if (result.success) {
				setCurrentPw("");
				setNewPw("");
				setConfirmPw("");
				setPwError(null);
			}
		},
	});

	const handleChangePassword = () => {
		setPwError(null);
		if (newPw.length < 8) {
			setPwError(t("password.tooShort"));
			return;
		}
		if (newPw !== confirmPw) {
			setPwError(t("password.mismatch"));
			return;
		}
		passwordMutation.mutate();
	};

	const passwordErrorMessage =
		pwError ??
		(passwordMutation.error
			? t("password.error")
			: passwordMutation.data && !passwordMutation.data.success
				? passwordMutation.data.error || t("password.error")
				: null);

	// Sessions
	const sessionQuery = useQuery({ queryKey: ["session"], queryFn: getSession });
	const revokeOthersMutation = useMutation({ mutationFn: revokeOtherSessions });
	const session = sessionQuery.data;

	// 2FA
	const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
	const [showSetup, setShowSetup] = useState(false);
	const [totpCode, setTotpCode] = useState("");
	const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

	const setupMutation = useMutation({
		mutationFn: setup2FA,
		onSuccess: (result) => {
			if (result.success && result.data) {
				setQrCodeUrl(result.data.qrCodeUrl);
			}
			setShowSetup(true);
		},
	});

	const verifyMutation = useMutation({
		mutationFn: () => verify2FA(totpCode),
		onSuccess: (result) => {
			if (result.success) {
				setTwoFactorEnabled(true);
				setShowSetup(false);
				setTotpCode("");
				setQrCodeUrl(null);
			}
		},
	});

	const disableMutation = useMutation({
		mutationFn: () => disable2FA(""),
		onSuccess: (result) => {
			if (result.success) setTwoFactorEnabled(false);
		},
	});

	// Account Deletion
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [confirmEmail, setConfirmEmail] = useState("");

	const deleteMutation = useMutation({
		mutationFn: deleteAccount,
		onSuccess: (result) => {
			if (result.success) router.push(`/${locale}/login`);
		},
	});

	const userEmail = session?.user?.email ?? "";

	return (
		<div className="space-y-6">
			<Section title={t("password.title")}>
				<div className="space-y-4">
					<Field
						label={t("password.fields.current")}
						id="cur-pw"
						type="password"
						value={currentPw}
						onChange={setCurrentPw}
					/>
					<Field
						label={t("password.fields.new")}
						id="new-pw"
						type="password"
						hint={t("password.hint")}
						value={newPw}
						onChange={setNewPw}
					/>
					<Field
						label={t("password.fields.confirm")}
						id="confirm-pw"
						type="password"
						value={confirmPw}
						onChange={setConfirmPw}
					/>
				</div>
				{passwordMutation.data?.success && (
					<div className="flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-3">
						<span
							className="material-symbols-outlined text-emerald-600 text-base mt-0.5 shrink-0"
							style={{ fontVariationSettings: "'FILL' 1" }}
						>
							mark_email_read
						</span>
						<div>
							<p className="text-sm font-semibold text-emerald-800">
								{t("password.success")}
							</p>
							<p className="text-xs text-emerald-700 mt-0.5">
								{t("password.emailSent")}
							</p>
						</div>
					</div>
				)}
				{passwordErrorMessage && (
					<p className="text-sm font-semibold text-rose-600">
						{passwordErrorMessage}
					</p>
				)}
				<div className="flex justify-start pt-2">
					<button
						type="button"
						onClick={handleChangePassword}
						disabled={
							passwordMutation.isPending ||
							!currentPw ||
							!newPw ||
							!confirmPw
						}
						className="bg-[#FF5A30] text-white px-8 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all disabled:cursor-not-allowed disabled:opacity-60"
					>
						{passwordMutation.isPending
							? t("password.updating")
							: t("password.actions.update")}
					</button>
				</div>
			</Section>

			<Section
				title={t("twoFactor.title")}
				description={t("twoFactor.description")}
			>
				<div className="space-y-4">
					<div className="flex items-center justify-between p-5 bg-surface-container-low rounded-xl">
						<div className="flex items-center gap-4">
							<div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center">
								<span className="material-symbols-outlined text-on-surface-variant">
									smartphone
								</span>
							</div>
							<div>
								<p className="font-semibold text-sm text-on-surface">
									{t("twoFactor.authenticator")}
								</p>
								<p className="text-xs text-on-surface-variant mt-0.5">
									{twoFactorEnabled
										? t("twoFactor.configured")
										: t("twoFactor.notConfigured")}
								</p>
							</div>
						</div>
						{twoFactorEnabled ? (
							<button
								type="button"
								onClick={() => disableMutation.mutate()}
								disabled={disableMutation.isPending}
								className="text-sm font-semibold text-red-500 border border-red-200 px-4 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
							>
								{disableMutation.isPending
									? "…"
									: t("twoFactor.actions.disable")}
							</button>
						) : (
							<button
								type="button"
								onClick={() => setupMutation.mutate()}
								disabled={setupMutation.isPending || showSetup}
								className="text-sm font-semibold text-[#FF5A30] border border-[#FF5A30]/30 px-4 py-2 rounded-lg hover:bg-[#FF5A30]/5 transition-colors disabled:opacity-50"
							>
								{setupMutation.isPending ? "…" : t("twoFactor.actions.enable")}
							</button>
						)}
					</div>

					{showSetup && (
						<div className="rounded-xl border border-outline-variant/20 p-5 space-y-4 bg-surface-container-low">
							<p className="text-sm font-semibold text-on-surface">
								{t("twoFactor.setup.title")}
							</p>
							<p className="text-xs text-on-surface-variant">
								{t("twoFactor.setup.instruction")}
							</p>

							{qrCodeUrl ? (
								<div className="flex justify-center">
									<Image
										src={qrCodeUrl}
										alt="2FA QR Code"
										width={160}
										height={160}
									/>
								</div>
							) : (
								<div className="w-40 h-40 mx-auto rounded-xl bg-surface-container-high flex items-center justify-center">
									<span className="material-symbols-outlined text-3xl text-on-surface-variant">
										qr_code_2
									</span>
								</div>
							)}

							{setupMutation.data && !setupMutation.data.success && (
								<p className="text-xs text-red-500 text-center">
									{setupMutation.data.error}
								</p>
							)}

							<input
								type="text"
								inputMode="numeric"
								maxLength={6}
								value={totpCode}
								onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
								placeholder={t("twoFactor.setup.codePlaceholder")}
								className="w-full bg-surface-container border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30"
							/>

							{verifyMutation.data && !verifyMutation.data.success && (
								<p className="text-xs text-red-500 text-center">
									{verifyMutation.data.error}
								</p>
							)}

							<div className="flex gap-3">
								<button
									type="button"
									onClick={() => {
										setShowSetup(false);
										setTotpCode("");
										setQrCodeUrl(null);
									}}
									className="flex-1 py-2.5 border border-outline-variant/30 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
								>
									{t("twoFactor.setup.actions.cancel")}
								</button>
								<button
									type="button"
									onClick={() => verifyMutation.mutate()}
									disabled={totpCode.length < 6 || verifyMutation.isPending}
									className="flex-1 py-2.5 bg-[#FF5A30] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-all disabled:opacity-50"
								>
									{verifyMutation.isPending
										? "…"
										: t("twoFactor.setup.actions.verify")}
								</button>
							</div>
						</div>
					)}
				</div>
			</Section>

			<Section
				title={t("sessions.title")}
				description={t("sessions.description")}
			>
				<div className="space-y-3">
					{session && (
						<div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl">
							<span className="material-symbols-outlined text-on-surface-variant">
								laptop_mac
							</span>
							<div className="flex-1">
								<p className="text-sm font-semibold text-on-surface">
									{session.user.email ?? session.user.name ?? "—"}
								</p>
								<p className="text-xs text-on-surface-variant">
									{t("sessions.thisDevice")} ·{" "}
									{new Date(session.expires).toLocaleDateString()}
								</p>
							</div>
							<span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
								{t("sessions.thisDevice")}
							</span>
						</div>
					)}
					<button
						type="button"
						onClick={() => revokeOthersMutation.mutate()}
						disabled={revokeOthersMutation.isPending}
						className="w-full py-3 border border-red-200 rounded-xl text-sm font-semibold text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
					>
						{revokeOthersMutation.isPending
							? t("sessions.signingOut")
							: t("sessions.actions.revokeOthers")}
					</button>
					{revokeOthersMutation.data?.success && (
						<p className="text-xs text-emerald-600 text-center">
							{t("sessions.revokedAll")}
						</p>
					)}
				</div>
			</Section>

			<Section title={t("dangerZone.title")}>
				{!showDeleteConfirm ? (
					<div className="flex items-center justify-between p-5 bg-red-50 rounded-xl border border-red-100">
						<div>
							<p className="font-semibold text-sm text-red-800">
								{t("dangerZone.delete.title")}
							</p>
							<p className="text-xs text-red-600 mt-0.5">
								{t("dangerZone.delete.description")}
							</p>
						</div>
						<button
							type="button"
							onClick={() => setShowDeleteConfirm(true)}
							className="text-sm font-semibold text-red-600 border border-red-300 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors"
						>
							{t("dangerZone.actions.delete")}
						</button>
					</div>
				) : (
					<div className="rounded-xl border border-red-200 bg-red-50 p-5 space-y-4">
						<p className="text-sm font-semibold text-red-800">
							{t("dangerZone.delete.title")}
						</p>
						<p className="text-xs text-red-600">
							{t("dangerZone.confirm.instruction")}
						</p>
						<input
							type="email"
							value={confirmEmail}
							onChange={(e) => setConfirmEmail(e.target.value)}
							placeholder={t("dangerZone.confirm.emailPlaceholder")}
							className="w-full bg-white border border-red-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-300"
						/>
						{deleteMutation.data && !deleteMutation.data.success && (
							<p className="text-xs text-red-600">{deleteMutation.data.error}</p>
						)}
						<div className="flex gap-3">
							<button
								type="button"
								onClick={() => {
									setShowDeleteConfirm(false);
									setConfirmEmail("");
								}}
								className="flex-1 py-2.5 border border-outline-variant/30 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors"
							>
								{t("dangerZone.confirm.actions.cancel")}
							</button>
							<button
								type="button"
								onClick={() => deleteMutation.mutate()}
								disabled={
									confirmEmail.trim().toLowerCase() !==
										userEmail.trim().toLowerCase() || deleteMutation.isPending
								}
								className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50"
							>
								{deleteMutation.isPending
									? "…"
									: t("dangerZone.confirm.actions.confirm")}
							</button>
						</div>
					</div>
				)}
			</Section>
		</div>
	);
}
