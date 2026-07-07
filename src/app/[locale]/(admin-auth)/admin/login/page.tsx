"use client";

import { useLocale, useTranslations } from "next-intl";
import { Suspense, useEffect, useState } from "react";
import AuthBrandLockup from "@/components/AuthBrandLockup";
import { useAdminLogin, useSession } from "@/context/AuthContext";
import { Link } from "@/i18n/routing";
import { adminHomePath } from "@/lib/auth";

function AdminLoginPageContent() {
	const locale = useLocale();
	const { data: session, isFetching, isLoading } = useSession();
	const loginMutation = useAdminLogin();
	const t = useTranslations("AdminLoginPage");

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!isLoading && session?.user) {
			const home = adminHomePath(session);
			window.location.replace(`/${locale}${home ?? "/dashboard"}`);
		}
	}, [session, isLoading, locale]);

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		loginMutation.mutate(
			{ email, password, requireScope: "platform" },
			{
				onSuccess: (result) => {
					if (!result.success) {
						const code = "code" in result ? result.code : undefined;
						const message = "error" in result ? result.error : undefined;
						setError(
							code === "not_admin" || code === "wrong_scope"
								? t("errorNotAdmin")
								: message ?? t("errorInvalid"),
						);
					} else {
						window.location.replace(`/${locale}/admin`);
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
				</div>

				<div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-8">
					<div className="mb-8">
						<p className="text-xs font-semibold uppercase tracking-widest text-[#FF5A2E] mb-3">
							{t("portal")}
						</p>
						<h1 className="text-2xl font-extrabold font-(family-name:--font-manrope) text-on-surface mb-2">
							{t("title")}
						</h1>
						<p className="text-sm text-on-surface-variant">{t("description")}</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label
								htmlFor="admin-email"
								className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2"
							>
								{t("email")}
							</label>
							<input
								id="admin-email"
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
								htmlFor="admin-password"
								className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2"
							>
								{t("password")}
							</label>
							<input
								id="admin-password"
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

					<p className="text-center text-sm text-on-surface-variant mt-6">
						{t("regularAccount")}{" "}
						<Link
							href="/login"
							className="text-[#FF5A2E] font-semibold hover:underline"
						>
							{t("regularLogin")}
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

export default function AdminLoginPage() {
	const t = useTranslations("AdminLoginPage");
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4 text-slate-600">
					{t("loading")}
				</div>
			}
		>
			<AdminLoginPageContent />
		</Suspense>
	);
}
