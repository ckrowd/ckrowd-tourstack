"use client";

import { use, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
	getOnboardingLink,
	submitOnboardingLink,
} from "@/app/actions";

type FormState = {
	name: string;
	email: string;
	phone: string;
	company: string;
	country: string;
};

const defaultForm: FormState = {
	name: "",
	email: "",
	phone: "",
	company: "",
	country: "",
};

export default function PublicOnboardingLinkPage({
	params,
}: {
	params: Promise<{ token: string }>;
}) {
	const { token } = use(params);
	const [form, setForm] = useState<FormState>(defaultForm);

	const linkQuery = useQuery({
		queryKey: ["onboardingLink", token],
		queryFn: () => getOnboardingLink(token),
	});

	const submitMutation = useMutation({
		mutationFn: (body: {
			name: string;
			email: string;
			phone: string;
			company?: string;
			country: string;
			extraData?: Record<string, unknown>;
		}) => submitOnboardingLink(token, body),
	});

	const link = linkQuery.data?.success ? linkQuery.data.data : null;
	const submitError = submitMutation.error
		? submitMutation.error instanceof Error
			? submitMutation.error.message
			: "Unable to submit registration."
		: submitMutation.data && !submitMutation.data.success
			? (submitMutation.data.error ?? "Unable to submit registration.")
			: null;

	if (submitMutation.data?.success) {
		return (
			<div className="min-h-screen bg-surface-container-low flex items-center justify-center px-6">
				<div className="max-w-md w-full bg-white rounded-2xl shadow-sm p-8 text-center">
					<div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-4">
						<span className="material-symbols-outlined">check</span>
					</div>
					<h1 className="text-2xl font-(family-name:--font-manrope) font-extrabold text-on-surface">
						Registration submitted
					</h1>
					<p className="text-sm text-on-surface-variant mt-2">
						Your details were submitted successfully.
					</p>
					<Link
						href="/"
						className="inline-flex items-center justify-center mt-6 px-5 py-3 rounded-xl bg-[#FF5A30] text-white text-sm font-bold hover:opacity-90"
					>
						Return home
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-surface-container-low py-10 px-6">
			<div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm p-6 md:p-8">
				<p className="text-xs font-bold uppercase tracking-widest text-[#FF5A30]">
					Onboarding Invitation
				</p>
				<h1 className="text-3xl font-(family-name:--font-manrope) font-extrabold text-on-surface mt-2">
					Stakeholder Registration
				</h1>

				{linkQuery.isLoading ? (
					<p className="text-sm text-on-surface-variant mt-6">Loading link...</p>
				) : !linkQuery.data?.success || !link ? (
					<p className="text-sm text-rose-700 mt-6">
						{linkQuery.data?.error ?? "This invitation link is unavailable."}
					</p>
				) : (
					<>
						<p className="text-sm text-on-surface-variant mt-4">
							Category: <span className="font-semibold text-on-surface">{String(link.category)}</span>
							{link.label ? (
								<>
									 {" · "}Label: <span className="font-semibold text-on-surface">{String(link.label)}</span>
								</>
							) : null}
						</p>

						<form
							onSubmit={(event) => {
								event.preventDefault();
								submitMutation.mutate({
									name: form.name,
									email: form.email,
									phone: form.phone,
									company: form.company || undefined,
									country: form.country,
								});
							}}
							className="mt-6 space-y-4"
						>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="onboard-name">
										Name
									</label>
									<input
										id="onboard-name"
										type="text"
										required
										value={form.name}
										onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
										className="w-full rounded-xl bg-surface-container-high px-4 py-3 text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
									/>
								</div>
								<div>
									<label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="onboard-email">
										Email
									</label>
									<input
										id="onboard-email"
										type="email"
										required
										value={form.email}
										onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
										className="w-full rounded-xl bg-surface-container-high px-4 py-3 text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
									/>
								</div>
								<div>
									<label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="onboard-phone">
										Phone
									</label>
									<input
										id="onboard-phone"
										type="text"
										required
										value={form.phone}
										onChange={(event) => setForm((prev) => ({ ...prev, phone: event.target.value }))}
										className="w-full rounded-xl bg-surface-container-high px-4 py-3 text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
									/>
								</div>
								<div>
									<label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="onboard-country">
										Country
									</label>
									<input
										id="onboard-country"
										type="text"
										required
										value={form.country}
										onChange={(event) => setForm((prev) => ({ ...prev, country: event.target.value }))}
										className="w-full rounded-xl bg-surface-container-high px-4 py-3 text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
									/>
								</div>
							</div>

							<div>
								<label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1.5" htmlFor="onboard-company">
									Company (optional)
								</label>
								<input
									id="onboard-company"
									type="text"
									value={form.company}
									onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
									className="w-full rounded-xl bg-surface-container-high px-4 py-3 text-sm border border-outline-variant/30 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
								/>
							</div>

							{submitError && (
								<p className="text-sm text-rose-700 font-medium">{submitError}</p>
							)}

							<button
								type="submit"
								disabled={submitMutation.isPending}
								className="w-full rounded-xl bg-[#FF5A30] text-white py-3 text-sm font-bold hover:opacity-90 disabled:opacity-60"
							>
								{submitMutation.isPending ? "Submitting..." : "Submit Registration"}
							</button>
						</form>
					</>
				)}
			</div>
		</div>
	);
}
