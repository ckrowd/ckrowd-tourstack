"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession, useRegister } from "@/context/AuthContext";

export default function RegisterPage() {
	const router = useRouter();
	const { data: session, isLoading } = useSession();
	const registerMutation = useRegister();

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
						setError(result.error ?? "Registration failed");
					} else {
						router.replace("/dashboard");
					}
				},
				onError: () => setError("Registration failed"),
			},
		);
	}

	if (isLoading && !session) {
		return (
			<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4 text-slate-600">
				Loading session...
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-lg">
				<div className="text-center mb-10">
					<Link
						href="/"
						className="text-3xl font-black tracking-tight text-[#FF5A30] font-(family-name:--font-manrope)"
					>
						Tour Stack by Crowd
					</Link>
					<p className="mt-2 text-sm text-slate-500 font-medium">
						Create your TourStack account
					</p>
				</div>

				<div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
					<div className="mb-8">
						<h1 className="text-2xl font-extrabold font-(family-name:--font-manrope) text-slate-900 mb-1">
							Register
						</h1>
						<p className="text-sm text-slate-500">
							Create your account to manage EOIs, tours, and platform access.
						</p>
					</div>

					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<div>
								<label
									htmlFor="first-name"
									className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2"
								>
									First name
								</label>
								<input
									id="first-name"
									type="text"
									autoComplete="given-name"
									placeholder="Ada"
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
									Last name
								</label>
								<input
									id="last-name"
									type="text"
									autoComplete="family-name"
									placeholder="Mensah"
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
								Email address
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

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
									autoComplete="new-password"
									placeholder="Create a password"
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
									Confirm password
								</label>
								<input
									id="confirm-password"
									type="password"
									autoComplete="new-password"
									placeholder="Repeat your password"
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
							{registerMutation.isPending ? "Creating account..." : "Create account"}
						</button>
					</form>

					<p className="text-center text-sm text-slate-500 mt-6">
						Already have an account?{" "}
						<Link
							href="/login"
							className="text-[#FF5A30] font-semibold hover:underline"
						>
							Sign in
						</Link>
					</p>
				</div>
			</div>
		</div>
	);
}
