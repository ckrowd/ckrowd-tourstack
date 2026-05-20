"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense, useEffect, useState } from "react";
import AuthBrandLockup from "@/components/AuthBrandLockup";
import { useAdminLogin, useSession } from "@/context/AuthContext";
import { useRouter } from "@/i18n/routing";
import { adminHomePath, isFinancingAdmin } from "@/lib/auth";

function FinancingAdminLoginContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: session, isLoading } = useSession();
	const loginMutation = useAdminLogin();
	const from = searchParams.get("from") ?? "/financing-admin";
	const t = useTranslations("FinancingAdminLoginPage");

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!isLoading && session?.user) {
			if (isFinancingAdmin(session)) {
				router.replace(from);
			} else {
				const home = adminHomePath(session);
				router.replace(home ?? "/dashboard");
			}
		}
	}, [session, from, isLoading, router]);

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		loginMutation.mutate(
			{ email, password, requireScope: "financing" },
			{
				onSuccess: (result) => {
					if (!result.success) {
						const code = "code" in result ? result.code : undefined;
						const message = "error" in result ? result.error : undefined;
						setError(
							code === "not_admin" || code === "wrong_scope"
								? t("errorNotAdmin")
								: (message ?? t("errorInvalid")),
						);
						return;
					}
					router.replace(from);
				},
				onError: () => setError(t("errorFailed")),
			},
		);
	}

	if (isLoading && !session) {
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
					<p className="mt-2 text-xs font-bold uppercase tracking-widest text-slate-400">
						{t("portal")}
					</p>
					<p className="mt-2 text-sm text-slate-500 font-medium">
						{t("description")}
					</p>
				</div>

				<div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
					<div className="mb-8">
						<p className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] mb-2">
							{t("badge")}
						</p>
						<h1 className="text-2xl font-extrabold font-(family-name:--font-manrope) text-slate-900 mb-1">
							{t("title")}
						</h1>
						<p className="text-sm text-slate-500">
							{t("description")}
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label
								htmlFor="finance-admin-email"
								className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
							>
								{t("email")}
							</label>
							<input
								id="finance-admin-email"
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
								htmlFor="finance-admin-password"
								className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
							>
								{t("password")}
							</label>
							<input
								id="finance-admin-password"
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
							<p className="text-sm font-medium text-red-600" role="alert">
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
				</div>

				<p className="text-center text-xs text-slate-400 mt-6">
					{t("footer")}
				</p>
			</div>
		</div>
	);
}

export default function FinancingAdminLoginPage() {
	const t = useTranslations("FinancingAdminLoginPage");
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4 text-slate-600">
					{t("loading")}
				</div>
			}
		>
			<FinancingAdminLoginContent />
		</Suspense>
	);
}
