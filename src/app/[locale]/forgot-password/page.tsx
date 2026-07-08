"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { requestPasswordReset } from "@/app/actions";
import AuthShell from "@/components/auth/AuthShell";
import { authInput, authLabel, authPrimaryBtn, authTitle } from "@/components/auth/authFields";
import { Link } from "@/i18n/routing";

export default function ForgotPasswordPage() {
	const t = useTranslations("ForgotPasswordPage");
	const [email, setEmail] = useState("");

	const mutation = useMutation({
		// Pass this app's origin so the reset email links back to TourStack
		// (the backend builds the link host from this callback).
		mutationFn: (value: string) =>
			requestPasswordReset(value, window.location.origin),
	});

	// Always show the same confirmation once a request resolves, so we never
	// reveal whether an address is registered.
	const submitted = mutation.data?.success ?? false;

	if (submitted) {
		return (
			<AuthShell>
				<div className="flex flex-1 flex-col items-center justify-center text-center">
					<div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-lime/10 border border-lime/25 text-lime">
						<span
							className="material-symbols-outlined text-3xl"
							style={{ fontVariationSettings: "'FILL' 1" }}
						>
							mark_email_read
						</span>
					</div>
					<h1 className={authTitle}>{t("sentTitle")}</h1>
					<p className="mt-2 mb-6 text-sm text-[var(--muted)]">{t("sentBody")}</p>
					<Link
						href="/login"
						className="inline-block text-sm text-orange font-semibold hover:text-ember transition-colors"
					>
						{t("backToLogin")}
					</Link>
				</div>
			</AuthShell>
		);
	}

	return (
		<AuthShell>
			<div className="mb-8">
				<h1 className={authTitle}>{t("title")}</h1>
				<p className="mt-2 text-sm text-[var(--muted)]">{t("description")}</p>
			</div>

			<form
				onSubmit={(event) => {
					event.preventDefault();
					mutation.mutate(email.trim());
				}}
				className="space-y-5"
			>
				<div>
					<label htmlFor="email" className={authLabel}>
						{t("email")}
					</label>
					<input
						id="email"
						type="email"
						autoComplete="email"
						placeholder={t("emailPlaceholder")}
						value={email}
						onChange={(event) => setEmail(event.target.value)}
						required
						className={authInput}
					/>
				</div>

				{mutation.isError && (
					<p className="text-sm text-red-400 font-medium" role="alert">
						{t("error")}
					</p>
				)}

				<button type="submit" disabled={mutation.isPending} className={authPrimaryBtn}>
					{mutation.isPending ? t("sending") : t("sendLink")}
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
