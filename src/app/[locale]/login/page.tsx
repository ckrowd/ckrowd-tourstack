"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Suspense, useEffect, useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import { authInput, authLabel, authPrimaryBtn, authTitle } from "@/components/auth/authFields";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { useLogin, useSession } from "@/context/AuthContext";
import { Link } from "@/i18n/routing";
import { getRegularLoginRedirectPath } from "@/lib/auth";

function AuthLoading({ label }: { label: string }) {
	return (
		<div className="min-h-[100dvh] bg-[#0a0a0a] flex items-center justify-center px-4 text-[var(--muted)] text-sm font-(family-name:--font-geist)">
			{label}
		</div>
	);
}

function LoginPageContent() {
	const locale = useLocale();
	const searchParams = useSearchParams();
	const { data: session, isFetching, isLoading } = useSession();
	const loginMutation = useLogin();
	const from = getRegularLoginRedirectPath(searchParams.get("from"));
	const verified = searchParams.get("verified") === "true";
	const reset = searchParams.get("reset") === "true";
	const t = useTranslations("LoginPage");
	const tAuth = useTranslations("Auth");

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!isLoading && session?.user) {
			const localePath = from.startsWith("/") ? from : `/${from}`;
			window.location.replace(`/${locale}${localePath}`);
		}
	}, [session?.user, from, isLoading, locale]);

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		loginMutation.mutate(
			{ email, password },
			{
				onSuccess: (result) => {
					if (!result.success) {
						const code = "code" in result ? result.code : undefined;
						const message = "error" in result ? result.error : undefined;
						setError(
							code === "admin_only"
								? t("errorAdminOnly")
								: (message ?? t("errorInvalid")),
						);
					} else {
						const localePath = from.startsWith("/") ? from : `/${from}`;
						window.location.replace(`/${locale}${localePath}`);
					}
				},
				onError: () => setError(t("errorFailed")),
			},
		);
	}

	if ((isLoading || isFetching) && !session) {
		return <AuthLoading label={t("loading")} />;
	}

	return (
		<AuthShell>
			<div className="mb-8">
				<h1 className={authTitle}>{t("title")}</h1>
				<p className="mt-2 text-sm text-[var(--muted)]">{t("description")}</p>
			</div>

			{verified && (
				<div className="mb-6 flex items-center gap-3 rounded-xl bg-lime/10 border border-lime/25 px-4 py-3">
					<svg className="w-5 h-5 text-lime shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
					</svg>
					<p className="text-sm text-lime font-medium">{t("verifiedBanner")}</p>
				</div>
			)}

			{reset && (
				<div className="mb-6 flex items-center gap-3 rounded-xl bg-lime/10 border border-lime/25 px-4 py-3">
					<svg className="w-5 h-5 text-lime shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
						<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
					</svg>
					<p className="text-sm text-lime font-medium">{t("resetBanner")}</p>
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-5">
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

				<div>
					<label htmlFor="password" className={authLabel}>
						{t("password")}
					</label>
					<input
						id="password"
						type="password"
						autoComplete="current-password"
						placeholder={t("passwordPlaceholder")}
						value={password}
						onChange={(event) => setPassword(event.target.value)}
						required
						className={authInput}
					/>
					<div className="flex justify-end mt-2">
						<Link
							href="/forgot-password"
							className="text-xs font-semibold text-orange hover:text-ember transition-colors"
						>
							{t("forgotPassword")}
						</Link>
					</div>
				</div>

				{error && (
					<p className="text-sm text-red-400 font-medium" role="alert">
						{error}
					</p>
				)}

				<button type="submit" disabled={loginMutation.isPending} className={authPrimaryBtn}>
					{loginMutation.isPending ? t("signingIn") : t("signIn")}
				</button>
			</form>

			<div className="flex items-center gap-3 my-6">
				<span className="h-px flex-1 bg-[var(--hair)]" />
				<span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]">
					{tAuth("orDivider")}
				</span>
				<span className="h-px flex-1 bg-[var(--hair)]" />
			</div>

			<GoogleSignInButton callbackPath={from} />

			<p className="text-center text-sm text-[var(--muted)] mt-7">
				{t("noAccount")}{" "}
				<Link href="/register" className="text-orange font-semibold hover:text-ember transition-colors">
					{t("register")}
				</Link>
			</p>

			<p className="text-center text-xs text-[var(--muted)] mt-8">
				{t("agreeTo")}{" "}
				<Link href="/terms" className="hover:text-[var(--text)] transition-colors underline-offset-2 hover:underline">
					{t("terms")}
				</Link>{" "}
				{t("and")}{" "}
				<Link href="/privacy" className="hover:text-[var(--text)] transition-colors underline-offset-2 hover:underline">
					{t("privacy")}
				</Link>
				.
			</p>
		</AuthShell>
	);
}

export default function LoginPage() {
	const t = useTranslations("LoginPage");
	return (
		<Suspense fallback={<AuthLoading label={t("loading")} />}>
			<LoginPageContent />
		</Suspense>
	);
}
