"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense, useEffect, useState } from "react";
import AuthBrandLockup from "@/components/AuthBrandLockup";
import { useAdminLogin, useSession } from "@/context/AuthContext";
import { useRouter } from "@/i18n/routing";
import { adminHomePath, isInsuranceAdmin } from "@/lib/auth";

function InsuranceAdminLoginContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: session, isLoading } = useSession();
	const loginMutation = useAdminLogin();
	const from = searchParams.get("from") ?? "/insurance-admin";
	const t = useTranslations("InsuranceAdminLoginPage");

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!isLoading && session?.user) {
			// Already signed in — send insurance admins to their target (or
			// portal home), anyone else to their own admin home or dashboard.
			if (isInsuranceAdmin(session)) {
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
			{ email, password },
			{
				onSuccess: (result) => {
					if (!result.success) {
						const code = "code" in result ? result.code : undefined;
						const message = "error" in result ? result.error : undefined;
						setError(
							code === "not_admin"
								? t("errorNotAdmin")
								: (message ?? t("errorInvalid")),
						);
					} else {
						router.replace(from);
					}
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
						Insurance Admin Portal
					</p>
				</div>

				<div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
					<div className="flex items-center gap-3 mb-8">
						<div className="h-10 w-10 rounded-xl bg-orange-50 flex items-center justify-center">
							<span className="material-symbols-outlined text-[#FF5A30]">
								shield
							</span>
						</div>
						<div>
							<h1 className="text-2xl font-extrabold font-(family-name:--font-manrope) text-slate-900 leading-tight">
								{t("title")}
							</h1>
							<p className="text-sm text-slate-500">{t("description")}</p>
						</div>
					</div>

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
				</div>
			</div>
		</div>
	);
}

export default function InsuranceAdminLoginPage() {
	const t = useTranslations("InsuranceAdminLoginPage");
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4 text-slate-600">
					{t("loading")}
				</div>
			}
		>
			<InsuranceAdminLoginContent />
		</Suspense>
	);
}
