"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { resendVerificationOtp, verifyEmail } from "@/app/actions";
import AuthBrandLockup from "@/components/AuthBrandLockup";
import { Link, useRouter } from "@/i18n/routing";

function VerifyEmailContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const email = searchParams.get("email") ?? "";
	const t = useTranslations("VerifyEmailPage");

	const [digits, setDigits] = useState(["", "", "", "", "", ""]);
	const [error, setError] = useState<string | null>(null);
	const [resendSuccess, setResendSuccess] = useState(false);
	const [verified, setVerified] = useState(false);
	const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

	useEffect(() => {
		if (!verified) return;
		const timer = setTimeout(() => router.replace("/login?verified=true"), 3000);
		return () => clearTimeout(timer);
	}, [verified, router]);

	const verifyMutation = useMutation({
		mutationFn: (otp: string) => verifyEmail(email, otp),
		onSuccess: (result) => {
			if (result.success) {
				setVerified(true);
			} else {
				setError(result.error || t("errorFailed"));
			}
		},
		onError: () => setError(t("errorFailed")),
	});

	const resendMutation = useMutation({
		mutationFn: () => resendVerificationOtp(email),
		onSuccess: (result) => {
			if (result.success) {
				setResendSuccess(true);
				setError(null);
				setDigits(["", "", "", "", "", ""]);
				inputRefs.current[0]?.focus();
			} else {
				setError(result.error || t("errorFailed"));
			}
		},
		onError: () => setError(t("errorFailed")),
	});

	function handleDigitChange(index: number, value: string) {
		const char = value.replace(/\D/g, "").slice(-1);
		const next = digits.map((d, i) => (i === index ? char : d));
		setDigits(next);
		setResendSuccess(false);
		setError(null);
		if (char && index < 5) {
			inputRefs.current[index + 1]?.focus();
		}
		if (next.every((d) => d !== "")) {
			verifyMutation.mutate(next.join(""));
		}
	}

	function handleKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
		if (e.key === "Backspace" && !digits[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	}

	function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
		e.preventDefault();
		const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
		if (!pasted) return;
		const next = ["", "", "", "", "", ""].map((_, i) => pasted[i] ?? "");
		setDigits(next);
		setError(null);
		setResendSuccess(false);
		const lastFilled = Math.min(pasted.length - 1, 5);
		inputRefs.current[lastFilled]?.focus();
		if (pasted.length === 6) {
			verifyMutation.mutate(pasted);
		}
	}

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		const otp = digits.join("");
		if (otp.length < 6) return;
		setError(null);
		verifyMutation.mutate(otp);
	}

	if (!email) {
		return (
			<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4 text-slate-600">
				{t("noEmail")}{" "}
				<Link href="/register" className="text-[#FF5A2E] font-semibold hover:underline ml-1">
					{t("signIn")}
				</Link>
			</div>
		);
	}

	if (verified) {
		return (
			<div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
				<div className="w-full max-w-md">
					<div className="text-center mb-10">
						<div className="flex items-center justify-center">
							<AuthBrandLockup />
						</div>
					</div>
					<div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-8 text-center">
						<div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
							<svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
								<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
							</svg>
						</div>
						<h1 className="text-2xl font-extrabold font-(family-name:--font-manrope) text-on-surface mb-2">
							{t("verifiedTitle")}
						</h1>
						<p className="text-sm text-on-surface-variant">{t("verifiedMessage")}</p>
						<div className="mt-6 flex justify-center">
							<div className="w-6 h-6 border-2 border-[#FF5A2E] border-t-transparent rounded-full animate-spin" />
						</div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-surface flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
				<div className="text-center mb-10">
					<div className="flex items-center justify-center mb-6">
						<AuthBrandLockup />
					</div>
					<p className="mt-2 text-sm text-on-surface-variant font-medium">{t("tagline")}</p>
				</div>

				<div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-outline-variant/20 p-8">
					<div className="mb-8">
						<h1 className="text-2xl font-extrabold font-(family-name:--font-manrope) text-on-surface mb-1">
							{t("title")}
						</h1>
						<p className="text-sm text-on-surface-variant">{t("description", { email })}</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-6">
						<div>
							<label className="block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-3">
								{t("codeLabel")}
							</label>
							<div className="flex gap-2 justify-between">
								{digits.map((digit, i) => (
									<input
										key={i}
										ref={(el) => { inputRefs.current[i] = el; }}
										type="text"
										inputMode="numeric"
										maxLength={1}
										value={digit}
										onChange={(e) => handleDigitChange(i, e.target.value)}
										onKeyDown={(e) => handleKeyDown(i, e)}
										onPaste={handlePaste}
										disabled={verifyMutation.isPending}
										className="w-12 h-14 text-center text-xl font-semibold bg-surface-container border border-outline-variant/40 rounded-xl text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A2E]/30 focus:border-[#FF5A2E] transition-all disabled:opacity-60"
									/>
								))}
							</div>
						</div>

						{error && (
							<p className="text-sm text-red-600 font-medium" role="alert">
								{error}
							</p>
						)}

						{resendSuccess && (
							<p className="text-sm text-green-600 font-medium">{t("resendSuccess")}</p>
						)}

						<button
							type="submit"
							disabled={verifyMutation.isPending || digits.join("").length < 6}
							className="w-full py-3 bg-[#FF5A2E] text-white font-semibold rounded-xl shadow-lg shadow-[#FF5A2E]/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60"
						>
							{verifyMutation.isPending ? t("submitting") : t("submit")}
						</button>
					</form>

					<p className="text-center text-sm text-on-surface-variant mt-6">
						{t("resendPrompt")}{" "}
						<button
							type="button"
							onClick={() => resendMutation.mutate()}
							disabled={resendMutation.isPending}
							className="text-[#FF5A2E] font-semibold hover:underline disabled:opacity-60"
						>
							{resendMutation.isPending ? t("resending") : t("resend")}
						</button>
					</p>

					<p className="text-center text-sm text-on-surface-variant mt-2">
						<Link href="/login" className="text-[#FF5A2E] font-semibold hover:underline">
							{t("signIn")}
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4">
					<div className="w-6 h-6 border-2 border-[#FF5A2E] border-t-transparent rounded-full animate-spin" />
				</div>
			}
		>
			<VerifyEmailContent />
		</Suspense>
	);
}
