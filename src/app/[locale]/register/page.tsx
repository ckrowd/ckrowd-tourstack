"use client";

import { Link, useRouter } from "@/i18n/routing";
import { useEffect, useState } from "react";
import { useSession, useRegister } from "@/context/AuthContext";
import { useTranslations } from 'next-intl';

export default function RegisterPage() {
	const router = useRouter();
	const { data: session, isLoading } = useSession();
	const registerMutation = useRegister();
  const t = useTranslations('RegisterPage');
  const tCommon = useTranslations('Common');

	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!isLoading && session?.user) {
			router.replace("/dashboard");
		}
	}, [session?.user, isLoading, router]);

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		registerMutation.mutate(
			{ firstName, lastName, email, password, confirmPassword },
			{
				onSuccess: (result) => {
					if (!result.success) {
						setError(result.error ?? t('errorFailed'));
					} else {
						router.replace("/dashboard");
					}
				},
				onError: () => setError(t('errorFailed')),
			},
		);
	}

	if (isLoading && !session) {
		return (
			<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4 text-slate-600">
				{t('loading')}
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4 py-12">
			<div className="w-full max-lg">
				<div className="text-center mb-10">
					<Link
						href="/"
						className="text-3xl font-black tracking-tight text-[#FF5A30] font-(family-name:--font-manrope)"
					>
						{tCommon('brandName')} {tCommon('brandBy')}
					</Link>
					<p className="mt-2 text-sm text-slate-500 font-medium">
						{t('tagline')}
					</p>
				</div>

				<div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
					<div className="mb-8">
						<h1 className="text-2xl font-extrabold font-(family-name:--font-manrope) text-slate-900 mb-1">
							{t('title')}
						</h1>
						<p className="text-sm text-slate-500">
							{t('description')}
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="first-name"
									className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
								>
									{t('firstName')}
								</label>
								<input
									id="first-name"
									type="text"
									autoComplete="given-name"
									placeholder={t('firstNamePlaceholder')}
									value={firstName}
									onChange={(event) => setFirstName(event.target.value)}
									required
									className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30 focus:border-[#FF5A30] transition-all"
								/>
							</div>

							<div>
								<label
									htmlFor="last-name"
									className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
								>
									{t('lastName')}
								</label>
								<input
									id="last-name"
									type="text"
									autoComplete="family-name"
									placeholder={t('lastNamePlaceholder')}
									value={lastName}
									onChange={(event) => setLastName(event.target.value)}
									required
									className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30 focus:border-[#FF5A30] transition-all"
								/>
							</div>
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
							>
								{t('email')}
							</label>
							<input
								id="email"
								type="email"
								autoComplete="email"
								placeholder={t('emailPlaceholder')}
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								required
								className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30 focus:border-[#FF5A30] transition-all"
							/>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="password"
									className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
								>
									{t('password')}
								</label>
								<input
									id="password"
									type="password"
									autoComplete="new-password"
									placeholder={t('passwordPlaceholder')}
									value={password}
									onChange={(event) => setPassword(event.target.value)}
									required
									className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30 focus:border-[#FF5A30] transition-all"
								/>
							</div>

							<div>
								<label
									htmlFor="confirm-password"
									className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
								>
									{t('confirmPassword')}
								</label>
								<input
									id="confirm-password"
									type="password"
									autoComplete="new-password"
									placeholder={t('confirmPasswordPlaceholder')}
									value={confirmPassword}
									onChange={(event) => setConfirmPassword(event.target.value)}
									required
									className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30 focus:border-[#FF5A30] transition-all"
								/>
							</div>
						</div>

						{error && (
							<p className="text-sm text-red-600 font-medium" role="alert">
								{error}
							</p>
						)}

						<button
							type="submit"
							disabled={registerMutation.isPending}
							className="w-full py-3 bg-[#FF5A30] text-white font-bold rounded-xl shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60"
						>
							{registerMutation.isPending ? t('creatingAccount') : t('createAccount')}
						</button>
					</form>

					<p className="text-center text-sm text-slate-500 mt-6">
						{t('alreadyHaveAccount')}{" "}
						<Link
							href="/login"
							className="text-[#FF5A30] font-semibold hover:underline"
						>
							{t('signIn')}
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
