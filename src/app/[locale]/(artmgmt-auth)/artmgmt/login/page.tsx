"use client";

import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Suspense, useEffect, useState } from "react";
import AuthBrandLockup from "@/components/AuthBrandLockup";
import { useArtmgmtLogin, useSession } from "@/context/AuthContext";
import { Link, useRouter } from "@/i18n/routing";
import { isArtmgmtProfile } from "@/lib/auth";
import { getTourstackProfile } from "@/app/actions";
import { useQuery } from "@tanstack/react-query";

function ArtmgmtLoginContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { data: session, isLoading: sessionLoading } = useSession();
	const loginMutation = useArtmgmtLogin();
	const from = searchParams.get("from") ?? "/artmgmt";
	const t = useTranslations("ArtmgmtLoginPage");

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	const { data: profile, isLoading: profileLoading } = useQuery({
		queryKey: ["tourstack-profile"],
		queryFn: getTourstackProfile,
		enabled: !!session?.user,
		select: (r) => r.data,
	});

	useEffect(() => {
		if (sessionLoading || (session?.user && profileLoading)) return;
		if (session?.user && profile) {
			if (isArtmgmtProfile(profile as { role?: string | null })) {
				router.replace(from);
			}
		}
	}, [session, profile, sessionLoading, profileLoading, from, router]);

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
							code === "not_artmgmt"
								? t("errorNotArtmgmt")
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

	if (sessionLoading && !session) {
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
					<p className="mt-2 text-xs font-semibold uppercase tracking-widest text-on-surface-variant/50">
						{t("portal")}
					</p>
				</div>

				<div className="bg-surface rounded-2xl shadow-sm border border-outline-variant/30 p-8">
					<div className="mb-8">
						<p className="text-xs font-semibold uppercase tracking-widest text-[#FF5A2E] mb-2">
							{t("badge")}
						</p>
						<h1 className="text-2xl font-extrabold font-(family-name:--font-manrope) text-on-surface mb-1">
							{t("title")}
						</h1>
						<p className="text-sm text-on-surface-variant">{t("description")}</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-5">
						<div>
							<label
								htmlFor="artmgmt-email"
								className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2"
							>
								{t("email")}
							</label>
							<input
								id="artmgmt-email"
								type="email"
								autoComplete="email"
								placeholder={t("emailPlaceholder")}
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								required
								className="w-full px-4 py-3 bg-surface-container-low border border-outline-variant/30 rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/30 focus:border-[#FF5A2E] transition-all"
							/>
						</div>

						<div>
							<label
								htmlFor="artmgmt-password"
								className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-2"
							>
								{t("password")}
							</label>
							<input
								id="artmgmt-password"
								type="password"
								autoComplete="current-password"
								placeholder={t("passwordPlaceholder")}
								value={password}
								onChange={(e) => setPassword(e.target.value)}
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
							<p className="text-sm font-medium text-red-600" role="alert">
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
				</div>

				<p className="text-center text-xs text-on-surface-variant/50 mt-6">{t("footer")}</p>
			</div>
		</div>
	);
}

export default function ArtmgmtLoginPage() {
	const t = useTranslations("ArtmgmtLoginPage");
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4 text-slate-600">
					{t("loading")}
				</div>
			}
		>
			<ArtmgmtLoginContent />
		</Suspense>
	);
}
