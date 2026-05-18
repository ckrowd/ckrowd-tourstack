"use client";

import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Suspense, useEffect, useState } from "react";
import { useLogin, useSession } from "@/context/AuthContext";
import { Link } from "@/i18n/routing";

function LoginPageContent() {
	const locale = useLocale();
	const searchParams = useSearchParams();
	const { data: session, isError, isFetching, isLoading } = useSession();
	const loginMutation = useLogin();
	const from = searchParams.get("from") ?? "/dashboard";
	const verified = searchParams.get("verified") === "true";
	const t = useTranslations("LoginPage");
	const tCommon = useTranslations("Common");

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
						setError(result.error ?? t("errorInvalid"));
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
					<Link
						href="/"
						className="text-3xl font-black tracking-tight text-[#FF5A30] font-(family-name:--font-manrope)"
					>
						{tCommon("brandName")} {tCommon("brandBy")}
					</Link>
					<p className="mt-2 text-sm text-slate-500 font-medium">
						{t("description")}
					</p>
				</div>

				<div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
					<div className="mb-8">
						<h1 className="text-2xl font-extrabold font-(family-name:--font-manrope) text-slate-900 mb-1">
							{t("title")}
						</h1>
						<p className="text-sm text-slate-500">{t("description")}</p>
					</div>

					{verified && (
						<div className="mb-6 flex items-center gap-3 rounded-xl bg-green-50 border border-green-200 px-4 py-3">
							<svg className="w-5 h-5 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
							</svg>
							<p className="text-sm text-green-700 font-medium">{t("verifiedBanner")}</p>
						</div>
					)}

					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label
								htmlFor="email"
								className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
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
								className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30 focus:border-[#FF5A30] transition-all"
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
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
								className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30 focus:border-[#FF5A30] transition-all"
							/>
						</div>

						{error && (
							<p className="text-sm text-red-600 font-medium" role="alert">
								{error}
							</p>
						)}

						<button
							type="submit"
							disabled={loginMutation.isPending}
							className="w-full py-3 bg-[#FF5A30] text-white font-bold rounded-xl shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60"
						>
							{loginMutation.isPending ? t("signingIn") : t("signIn")}
						</button>
					</form>

					<p className="text-center text-sm text-slate-500 mt-6">
						{t("noAccount")}{" "}
						<Link
							href="/register"
							className="text-[#FF5A30] font-semibold hover:underline"
						>
							{t("register")}
						</Link>
					</p>
				</div>

				<p className="text-center text-xs text-slate-400 mt-6">
					{t("agreeTo")}{" "}
					<Link
						href="/terms"
						className="hover:text-[#FF5A30] transition-colors"
					>
						{t("terms")}
					</Link>{" "}
					{t("and")}{" "}
					<Link
						href="/privacy"
						className="hover:text-[#FF5A30] transition-colors"
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
