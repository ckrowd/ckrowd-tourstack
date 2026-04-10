"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

function LoginPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { auth, isLoading, login } = useAuth();
	const from = searchParams.get("from") ?? "/dashboard";

	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);

	useEffect(() => {
		if (!isLoading && auth?.authenticated) {
			router.replace(from);
		}
	}, [auth?.authenticated, from, isLoading, router]);

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError(null);
		setSubmitting(true);

		try {
			const success = await login(email, password);
			if (success) {
				router.replace(from);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "Sign in failed");
		} finally {
			setSubmitting(false);
		}
	}

	if (isLoading && !auth) {
		return (
			<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4 text-slate-600">
				Loading session...
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-md">
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
					<div className="mb-8">
						<h1 className="text-2xl font-extrabold font-(family-name:--font-manrope) text-slate-900 mb-1">
							Sign in
						</h1>
						<p className="text-sm text-slate-500">
							Use your email and password to access your TourStack account.
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-5">
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
								Password
							</label>
							<input
								id="password"
								type="password"
								autoComplete="current-password"
								placeholder="Your password"
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
							disabled={submitting}
							className="w-full py-3 bg-[#FF5A30] text-white font-bold rounded-xl shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-60"
						>
							{submitting ? "Signing in..." : "Sign in"}
						</button>
					</form>

					<p className="text-center text-sm text-slate-500 mt-6">
						Don&apos;t have an account?{" "}
						<Link
							href="/register"
							className="text-[#FF5A30] font-semibold hover:underline"
						>
							Register
						</Link>
					</p>
				</div>

				<p className="text-center text-xs text-slate-400 mt-6">
					By signing in you agree to our{" "}
					<Link
						href="/terms"
						className="hover:text-[#FF5A30] transition-colors"
					>
						Terms of Service
					</Link>{" "}
					and{" "}
					<Link
						href="/privacy"
						className="hover:text-[#FF5A30] transition-colors"
					>
						Privacy Policy
					</Link>
					.
				</p>
			</div>
		</div>
	);
}

export default function LoginPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4 text-slate-600">
					Loading session...
				</div>
			}
		>
			<LoginPageContent />
		</Suspense>
	);
}
