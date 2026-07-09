"use client";

import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { resendVerificationOtp, verifyEmail } from "@/app/actions";
import AuthLoading from "@/components/auth/AuthLoading";
import AuthShell from "@/components/auth/AuthShell";
import { authPrimaryBtn, authTitle } from "@/components/auth/authFields";
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
		// New users continue into the single onboarding after signing in; login
		// honours `from` for its post-auth redirect.
		const timer = setTimeout(
			() =>
				router.replace(
					`/login?verified=true&from=${encodeURIComponent("/get-started")}`,
				),
			3000,
		);
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
			<AuthShell>
				<div className="flex flex-1 flex-col items-center justify-center text-center">
					<p className="text-sm text-[var(--muted)]">
						{t("noEmail")}{" "}
						<Link href="/register" className="text-orange font-semibold hover:text-ember transition-colors ml-1">
							{t("signIn")}
						</Link>
					</p>
				</div>
			</AuthShell>
		);
	}

	if (verified) {
		return (
			<AuthShell>
				<div className="flex flex-1 flex-col items-center justify-center text-center">
					<div className="w-16 h-16 rounded-full bg-lime/10 border border-lime/25 flex items-center justify-center mx-auto mb-6">
						<svg className="w-8 h-8 text-lime" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
							<path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<h1 className={authTitle}>{t("verifiedTitle")}</h1>
					<p className="mt-2 text-sm text-[var(--muted)]">{t("verifiedMessage")}</p>
					<div className="mt-6 flex justify-center">
						<div className="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin" />
					</div>
				</div>
			</AuthShell>
		);
	}

	return (
		<AuthShell>
			<div className="mb-8">
				<h1 className={authTitle}>{t("title")}</h1>
				<p className="mt-2 text-sm text-[var(--muted)]">{t("description", { email })}</p>
			</div>

			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label className="block text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--muted)] mb-3">
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
								className="w-12 h-14 text-center text-xl font-semibold bg-[var(--surface)] border border-[var(--hair)] rounded-xl text-[var(--text)] focus:outline-none focus:ring-2 focus:ring-orange/40 focus:border-orange/60 transition-all disabled:opacity-60"
							/>
						))}
					</div>
				</div>

				{error && (
					<p className="text-sm text-red-400 font-medium" role="alert">
						{error}
					</p>
				)}

				{resendSuccess && (
					<p className="text-sm text-lime font-medium">{t("resendSuccess")}</p>
				)}

				<button
					type="submit"
					disabled={verifyMutation.isPending || digits.join("").length < 6}
					className={authPrimaryBtn}
				>
					{verifyMutation.isPending ? t("submitting") : t("submit")}
				</button>
			</form>

			<p className="text-center text-sm text-[var(--muted)] mt-6">
				{t("resendPrompt")}{" "}
				<button
					type="button"
					onClick={() => resendMutation.mutate()}
					disabled={resendMutation.isPending}
					className="text-orange font-semibold hover:text-ember transition-colors disabled:opacity-60"
				>
					{resendMutation.isPending ? t("resending") : t("resend")}
				</button>
			</p>

			<p className="text-center text-sm text-[var(--muted)] mt-2">
				<Link href="/login" className="text-orange font-semibold hover:text-ember transition-colors">
					{t("signIn")}
				</Link>
			</p>
		</AuthShell>
	);
}

export default function VerifyEmailPage() {
	return (
		<Suspense fallback={<AuthLoading label="…" />}>
			<VerifyEmailContent />
		</Suspense>
	);
}
