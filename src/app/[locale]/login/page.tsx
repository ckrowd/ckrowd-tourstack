"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Suspense, useEffect, useState } from "react";
import AuthBrandLockup from "@/components/AuthBrandLockup";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { useLogin, useSession } from "@/context/AuthContext";
import { Link } from "@/i18n/routing";
import { getRegularLoginRedirectPath } from "@/lib/auth";

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
								: message ?? t("errorInvalid"),
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
		return (
			<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4 text-slate-600">
				{t("loading")}
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
				<div className="text-center mb-10">
					<div className="flex items-center justify-center mb-6">
						<AuthBrandLockup />
					</div>
					<p className="mt-2 text-sm text-on-surface-variant font-medium">
						{t("description")}
					</p>
				</div>

				<div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-8">
					<div className="mb-8">
						<h1 className="text-2xl font-extrabold font-(family-name:--font-manrope) text-on-surface mb-1">
							{t("title")}
						</h1>
						<p className="text-sm text-on-surface-variant">{t("description")}</p>
					</div>

					{verified && (
						<div className="mb-6 flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
							<svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
							</svg>
							<p className="text-sm text-green-700 font-medium">{t("verifiedBanner")}</p>
						</div>
					)}

					{reset && (
						<div className="mb-6 flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
							<svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
							</svg>
							<p className="text-sm text-green-700 font-medium">{t("resetBanner")}</p>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label
								htmlFor="email"
								className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2"
							>
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
								className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/30 focus:border-[#FF5A2E] transition-all"
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2"
							>
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
								className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/30 focus:border-[#FF5A2E] transition-all"
							/>
							<div className="flex justify-end mt-2">
								<Link
									href="/forgot-password"
									className="text-xs font-semibold text-[#FF5A2E] hover:underline"
								>
									{t("forgotPassword")}
								</Link>
							</div>
						</div>

						{error && (
							<p className="text-sm text-red-600 font-medium" role="alert">
								{error}
							</p>
						)}

						<button
							type="submit"
							disabled={loginMutation.isPending}
							className="w-full py-3 bg-[#FF5A2E] text-white font-semibold rounded-xl shadow-lg shadow-[#FF5A2E]/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60"
						>
							{loginMutation.isPending ? t("signingIn") : t("signIn")}
						</button>
					</form>

					<div className="flex items-center gap-3 my-6">
						<span className="h-px flex-1 bg-slate-200" />
						<span className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant/50">
							{tAuth("orDivider")}
						</span>
						<span className="h-px flex-1 bg-slate-200" />
					</div>

					<GoogleSignInButton callbackPath={from} />

					<p className="text-center text-sm text-on-surface-variant mt-6">
						{t("noAccount")}{" "}
						<Link
							href="/register"
							className="text-[#FF5A2E] font-semibold hover:underline"
						>
							{t("register")}
						</Link>
					</p>
				</div>

				<p className="text-center text-xs text-on-surface-variant/50 mt-6">
					{t("agreeTo")}{" "}
					<Link
						href="/terms"
						className="hover:text-[#FF5A2E] transition-colors"
					>
						{t("terms")}
					</Link>{" "}
					{t("and")}{" "}
					<Link
						href="/privacy"
						className="hover:text-[#FF5A2E] transition-colors"
					>
						{t("privacy")}
					</Link>
					.
				</p>
			</div>
		</div>
	);
}

export default function LoginPage() {
	const t = useTranslations("LoginPage");
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4 text-slate-600">
					{t("loading")}
				</div>
			}
		>
			<LoginPageContent />
		</Suspense>
	);
}
