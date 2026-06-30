"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import AuthShell from "@/components/auth/AuthShell";
import { authInput, authLabel, authPrimaryBtn, authTitle } from "@/components/auth/authFields";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { useRegister, useSession } from "@/context/AuthContext";
import { Link, useRouter } from "@/i18n/routing";
import { adminHomePath } from "@/lib/auth";

export default function RegisterPage() {
	const locale = useLocale();
	const router = useRouter();
	const { data: session, isFetching, isLoading } = useSession();
	const registerMutation = useRegister();
	const t = useTranslations("RegisterPage");
	const tAuth = useTranslations("Auth");

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	const accountExists =
		!!error &&
		/user already exists|USER_ALREADY_EXISTS|already exists/i.test(error);

	useEffect(() => {
		if (!isLoading && session?.user) {
			const home = adminHomePath(session);
			window.location.replace(`/${locale}${home ?? "/dashboard"}`);
		}
	}, [session, isLoading, locale]);

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		registerMutation.mutate(
			{ firstName, lastName, email, password, confirmPassword },
			{
				onSuccess: (result) => {
					if (!result.success) {
						setError(result.error ?? t("errorFailed"));
					} else {
						router.push(`/verify-email?email=${encodeURIComponent(email)}`);
					}
				},
				onError: () => setError(t("errorFailed")),
			},
		);
	}

	if ((isLoading || isFetching) && !session) {
		return (
			<div className="min-h-[100dvh] bg-[#0a0a0a] flex items-center justify-center px-4 text-white/50 text-sm font-(family-name:--font-geist)">
				{t("loading")}
			</div>
		);
	}

	return (
		<AuthShell>
			<div className="mb-8">
				<p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange mb-3">
					{t("tagline")}
				</p>
				<h1 className={authTitle}>{t("title")}</h1>
				<p className="mt-2 text-sm text-white/55">{t("description")}</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<div>
						<label htmlFor="first-name" className={authLabel}>
							{t("firstName")}
						</label>
						<input
							id="first-name"
							type="text"
							autoComplete="given-name"
							placeholder={t("firstNamePlaceholder")}
							value={firstName}
							onChange={(event) => setFirstName(event.target.value)}
							required
							className={authInput}
						/>
					</div>

					<div>
						<label htmlFor="last-name" className={authLabel}>
							{t("lastName")}
						</label>
						<input
							id="last-name"
							type="text"
							autoComplete="family-name"
							placeholder={t("lastNamePlaceholder")}
							value={lastName}
							onChange={(event) => setLastName(event.target.value)}
							required
							className={authInput}
						/>
					</div>
				</div>

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

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
							className={authInput}
						/>
					</div>

					<div>
						<label htmlFor="confirm-password" className={authLabel}>
							{t("confirmPassword")}
						</label>
						<input
							id="confirm-password"
							type="password"
							autoComplete="new-password"
							placeholder={t("confirmPasswordPlaceholder")}
							value={confirmPassword}
							onChange={(event) => setConfirmPassword(event.target.value)}
							required
							className={authInput}
						/>
					</div>
				</div>

				{accountExists ? (
					<div className="flex items-start gap-3 rounded-xl bg-amber-400/10 border border-amber-400/30 px-4 py-3" role="alert">
						<svg className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
						</svg>
						<p className="text-sm text-amber-200 font-medium">
							{t("errorAlreadyExists")}{" "}
							<Link href="/login" className="underline font-semibold hover:text-amber-100">
								{t("signIn")}
							</Link>
						</p>
					</div>
				) : error ? (
					<p className="text-sm text-red-400 font-medium" role="alert">
						{error}
					</p>
				) : null}

				<button type="submit" disabled={registerMutation.isPending} className={authPrimaryBtn}>
					{registerMutation.isPending ? t("creatingAccount") : t("createAccount")}
				</button>
			</form>

			<div className="flex items-center gap-3 my-6">
				<span className="h-px flex-1 bg-white/10" />
				<span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/35">
					{tAuth("orDivider")}
				</span>
				<span className="h-px flex-1 bg-white/10" />
			</div>

			<GoogleSignInButton callbackPath="/dashboard" />

			<p className="text-center text-sm text-white/50 mt-7">
				{t("alreadyHaveAccount")}{" "}
				<Link href="/login" className="text-orange font-semibold hover:text-ember transition-colors">
					{t("signIn")}
				</Link>
			</p>
		</AuthShell>
	);
}
