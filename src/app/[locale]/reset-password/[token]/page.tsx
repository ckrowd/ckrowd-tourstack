"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { use, useState } from "react";
import { resetPassword } from "@/app/actions";
import AuthShell from "@/components/auth/AuthShell";
import { authInput, authLabel, authPrimaryBtn, authTitle } from "@/components/auth/authFields";
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
		<AuthShell>
			<div className="mb-8">
				<h1 className={authTitle}>{t("title")}</h1>
				<p className="mt-2 text-sm text-[var(--muted)]">{t("description")}</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-5">
				<div>
					<label htmlFor="password" className={authLabel}>
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
						className={authInput}
					/>
					{tooShort && (
						<p className="mt-1.5 text-xs text-amber-500">{t("tooShort")}</p>
					)}
				</div>

				<div>
					<label htmlFor="confirm" className={authLabel}>
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
						className={authInput}
					/>
					{mismatch && (
						<p className="mt-1.5 text-xs text-amber-500">{t("mismatch")}</p>
					)}
				</div>

				{error && (
					<p className="text-sm text-red-400 font-medium" role="alert">
						{error}
					</p>
				)}

				<button type="submit" disabled={!canSubmit} className={authPrimaryBtn}>
					{mutation.isPending ? t("saving") : t("submit")}
				</button>
			</form>

			<p className="text-center text-sm text-[var(--muted)] mt-6">
				<Link href="/login" className="text-orange font-semibold hover:text-ember transition-colors">
					{t("backToLogin")}
				</Link>
			</p>
		</AuthShell>
	);
}
