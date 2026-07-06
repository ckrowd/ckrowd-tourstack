"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { requestPasswordReset } from "@/app/actions";
import AuthBrandLockup from "@/components/AuthBrandLockup";
import { Link } from "@/i18n/routing";

export default function ForgotPasswordPage() {
	const t = useTranslations("ForgotPasswordPage");
	const [email, setEmail] = useState("");

	const mutation = useMutation({
		// Pass this app's origin so the reset email links back to TourStack
		// (the backend builds the link host from this callback).
		mutationFn: (value: string) =>
			requestPasswordReset(value, window.location.origin),
	});

	// Always show the same confirmation once a request resolves, so we never
	// reveal whether an address is registered.
	const submitted = mutation.data?.success ?? false;

	return (
		<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
				<div className="text-center mb-10">
					<div className="flex items-center justify-center mb-6">
						<AuthBrandLockup />
					</div>
					<p className="mt-2 text-sm text-slate-500 font-medium">
						{t("subtitle")}
					</p>
				</div>

				<div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
					{submitted ? (
						<div className="text-center">
							<div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
								<span
									className="material-symbols-outlined text-3xl"
									style={{ fontVariationSettings: "'FILL' 1" }}
								>
									mark_email_read
								</span>
							</div>
							<h1 className="text-2xl font-extrabold font-(family-name:--font-manrope) text-slate-900 mb-2">
								{t("sentTitle")}
							</h1>
							<p className="text-sm text-slate-500 mb-6">{t("sentBody")}</p>
							<Link
								href="/login"
								className="inline-block text-[#FF5A2E] font-semibold hover:underline text-sm"
							>
								{t("backToLogin")}
							</Link>
						</div>
					) : (
						<>
							<div className="mb-8">
								<h1 className="text-2xl font-extrabold font-(family-name:--font-manrope) text-slate-900 mb-1">
									{t("title")}
								</h1>
								<p className="text-sm text-slate-500">{t("description")}</p>
							</div>

							<form
								onSubmit={(event) => {
									event.preventDefault();
									mutation.mutate(email.trim());
								}}
								className="space-y-5"
							>
								<div>
									<label
										htmlFor="email"
										className="block text-xs font-semibold uppercase tracking-widest text-slate-500 mb-2"
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
										className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/30 focus:border-[#FF5A2E] transition-all"
									/>
								</div>

								{mutation.isError && (
									<p className="text-sm text-red-600 font-medium" role="alert">
										{t("error")}
									</p>
								)}

								<button
									type="submit"
									disabled={mutation.isPending}
									className="w-full py-3 bg-[#FF5A2E] text-white font-semibold rounded-xl shadow-lg shadow-[#FF5A2E]/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60"
								>
									{mutation.isPending ? t("sending") : t("sendLink")}
								</button>
							</form>

							<p className="text-center text-sm text-slate-500 mt-6">
								<Link
									href="/login"
									className="text-[#FF5A2E] font-semibold hover:underline"
								>
									{t("backToLogin")}
								</Link>
							</p>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
