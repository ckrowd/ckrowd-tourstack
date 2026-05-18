"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Suspense, useEffect, useState } from "react";
import { useAdminLogin, useSession } from "@/context/AuthContext";
import { Link } from "@/i18n/routing";
import { isAdminSession } from "@/lib/auth";

function AdminLoginPageContent() {
	const locale = useLocale();
	const { data: session, isError, isFetching, isLoading } = useSession();
	const loginMutation = useAdminLogin();
	const t = useTranslations("AdminLoginPage");
	const tCommon = useTranslations("Common");

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!isLoading && session?.user) {
			window.location.replace(
				isAdminSession(session) ? `/${locale}/admin` : `/${locale}/dashboard`,
			);
		}
	}, [session, isLoading, locale]);

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
							code === "not_admin"
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
					<div className="flex items-center justify-center gap-2.5 mb-6">
						<Image
							src="/ckrowd-logo.png"
							alt={t("logoAlt")}
							width={36}
							height={36}
							priority
						/>
						<div className="flex flex-col leading-tight text-left">
							<span className="text-lg font-black tracking-tight text-[#FF5A30] font-(family-name:--font-manrope)">
								{tCommon("brandName")}
							</span>
							<span className="text-[10px] font-semibold text-black font-(family-name:--font-manrope)">
								{tCommon("brandBy")}
							</span>
						</div>
					</div>
				</div>

				<div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
					<div className="mb-8">
						<p className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] mb-3">
							{t("portal")}
						</p>
						<h1 className="text-2xl font-extrabold font-(family-name:--font-manrope) text-slate-900 mb-2">
							{t("title")}
						</h1>
						<p className="text-sm text-slate-500">{t("description")}</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label
								htmlFor="admin-email"
								className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
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
								className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30 focus:border-[#FF5A30] transition-all"
							/>
						</div>

						<div>
							<label
								htmlFor="admin-password"
								className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
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
						{t("regularAccount")}{" "}
						<Link
							href="/login"
							className="text-[#FF5A30] font-semibold hover:underline"
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
