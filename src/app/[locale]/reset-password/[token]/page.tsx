"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { use, useState } from "react";
import { resetPassword } from "@/app/actions";
import AuthBrandLockup from "@/components/AuthBrandLockup";
import { Link, useRouter } from "@/i18n/routing";

export default function ResetPasswordPage({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	const { token } = use(params);
	const t = useTranslations("ResetPasswordPage");
	const router = useRouter();

	const [password, setPassword] = useState("");
	const [confirm, setConfirm] = useState("");
	const [error, setError] = useState<string | null>(null);

	const mutation = useMutation({
		mutationFn: () => resetPassword(token, password, confirm),
		onSuccess: (result) => {
			if (result.success) {
				setError(null);
				// Send them to login with a banner once the password is changed.
				router.replace("/login?reset=true");
			} else {
				setError(result.error ?? t("error"));
			}
		},
		onError: () => setError(t("error")),
	});

	const tooShort = password.length > 0 && password.length < 8;
	const mismatch = confirm.length > 0 && confirm !== password;
	const canSubmit =
		password.length >= 8 && confirm === password && !mutation.isPending;

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (password !== confirm) {
			setError(t("mismatch"));
			return;
		}
		mutation.mutate();
	}

	return (
		<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
				<div className="text-center mb-10">
					<div className="flex items-center justify-center mb-6">
						<AuthBrandLockup />
					</div>
					<p className="mt-2 text-sm text-slate-500 font-medium">
						{t("subtitle")}
					</p>
				</div>

				<div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
					<div className="mb-8">
						<h1 className="text-2xl font-extrabold font-(family-name:--font-manrope) text-slate-900 mb-1">
							{t("title")}
						</h1>
						<p className="text-sm text-slate-500">{t("description")}</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label
								htmlFor="password"
								className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2"
							>
								{t("password")}
							</label>
							<input
								id="password"
								type="password"
								autoComplete="new-password"
								placeholder={t("passwordPlaceholder")}
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								required
								minLength={8}
								className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/30 focus:border-[#FF5A2E] transition-all"
							/>
							{tooShort && (
								<p className="mt-1.5 text-xs text-amber-600">{t("tooShort")}</p>
							)}
						</div>

						<div>
							<label
								htmlFor="confirm"
								className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2"
							>
								{t("confirm")}
							</label>
							<input
								id="confirm"
								type="password"
								autoComplete="new-password"
								placeholder={t("confirmPlaceholder")}
								value={confirm}
								onChange={(event) => setConfirm(event.target.value)}
								required
								className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/30 focus:border-[#FF5A2E] transition-all"
							/>
							{mismatch && (
								<p className="mt-1.5 text-xs text-amber-600">{t("mismatch")}</p>
							)}
						</div>

						{error && (
							<p className="text-sm text-red-600 font-medium" role="alert">
								{error}
							</p>
						)}

						<button
							type="submit"
							disabled={!canSubmit}
							className="w-full py-3 bg-[#FF5A2E] text-white font-semibold rounded-xl shadow-lg shadow-[#FF5A2E]/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
						>
							{mutation.isPending ? t("saving") : t("submit")}
						</button>
					</form>

					<p className="text-center text-sm text-slate-500 mt-6">
						<Link
							href="/login"
							className="text-[#FF5A2E] font-semibold hover:underline"
						>
							{t("backToLogin")}
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
