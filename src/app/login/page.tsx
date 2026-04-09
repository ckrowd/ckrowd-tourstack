"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

type Step = "email" | "otp";

export default function LoginPage() {
  const router = useRouter();
  const { auth, login } = useAuth();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const OTP_POSITIONS = ["p0", "p1", "p2", "p3", "p4", "p5"] as const;
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (auth?.authenticated) {
      router.replace("/dashboard");
    }
  }, [auth, router]);

  function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    // Simulate network delay
    setTimeout(() => {
      setLoading(false);
      setStep("otp");
    }, 800);
  }

  function handleOtpChange(index: number, value: string) {
    if (!/^\d?$/.test(value)) return;
    const next = [...otp];
    next[index] = value;
    setOtp(next);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const code = otp.join("");
    if (code.length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    // Any 6-digit code is accepted (simulation)
    setLoading(true);
    setTimeout(() => {
      login(email);
      router.replace("/dashboard");
    }, 600);
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(""));
      otpRefs.current[5]?.focus();
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link
            href="/"
            className="text-3xl font-black tracking-tight text-[#FF5A30] font-(family-name:--font-manrope)"
          >
            Tour Stack by Crowd
          </Link>
          <p className="mt-2 text-sm text-slate-500 font-medium">
            The Pan-African Touring Platform
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
          {step === "email" && (
            <>
              <div className="mb-8">
                <h1 className="text-2xl font-extrabold font-(family-name:--font-manrope) text-slate-900 mb-1">
                  Sign in
                </h1>
                <p className="text-sm text-slate-500">
                  Enter your email and we&apos;ll send you a one-time code.
                </p>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
                  >
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@yourcompany.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  disabled={loading}
                  className="w-full py-3 bg-[#FF5A30] text-white font-bold rounded-xl shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? "Sending code…" : "Continue"}
                </button>
              </form>
            </>
          )}

          {step === "otp" && (
            <>
              <div className="mb-8">
                <button
                  type="button"
                  onClick={() => { setStep("email"); setOtp(["", "", "", "", "", ""]); setError(""); }}
                  className="flex items-center gap-1 text-slate-400 hover:text-slate-600 text-sm font-medium mb-4 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  Back
                </button>
                <h1 className="text-2xl font-extrabold font-(family-name:--font-manrope) text-slate-900 mb-1">
                  Enter your code
                </h1>
                <p className="text-sm text-slate-500">
                  A 6-digit code was sent to{" "}
                  <span className="font-semibold text-slate-700">{email}</span>.
                  <br />
                  <span className="text-xs text-slate-400">(Any 6-digit code works in this demo.)</span>
                </p>
              </div>

              <form onSubmit={handleOtpSubmit} className="space-y-5">
                <div
                  className="flex gap-3 justify-center"
                  onPaste={handleOtpPaste}
                >
                  {otp.map((digit, i) => (
                    <input
                      key={OTP_POSITIONS[i]}
                      ref={(el) => { otpRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(i, e)}
                      aria-label={`OTP digit ${i + 1}`}
                      className="w-12 h-14 text-center text-xl font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/40 focus:border-[#FF5A30] transition-all"
                    />
                  ))}
                </div>

                {error && (
                  <p className="text-sm text-red-600 font-medium text-center" role="alert">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 bg-[#FF5A30] text-white font-bold rounded-xl shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60"
                >
                  {loading ? "Verifying…" : "Verify & Sign In"}
                </button>

                <p className="text-xs text-center text-slate-400">
                  Didn&apos;t receive it?{" "}
                  <button
                    type="button"
                    onClick={() => setOtp(["", "", "", "", "", ""])}
                    className="text-[#FF5A30] font-semibold hover:underline"
                  >
                    Resend code
                  </button>
                </p>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          By signing in you agree to our{" "}
          <Link href="/terms" className="hover:text-[#FF5A30] transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="hover:text-[#FF5A30] transition-colors">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
