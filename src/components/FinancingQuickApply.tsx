"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { applyForFinancing } from "@/app/actions";

const FINANCING_PRODUCTS = [
	"Tour Stop Advance",
	"Venue Build-Out Credit",
	"Event Insurance Bundle",
	"Marketing & Ticketing Float",
] as const;

export default function FinancingQuickApply() {
	const router = useRouter();
	const [product, setProduct] = useState<(typeof FINANCING_PRODUCTS)[number]>(
		"Tour Stop Advance",
	);
	const [amountRequested, setAmountRequested] = useState("");
	const currency = "USD";

	const applyMutation = useMutation({
		mutationFn: applyForFinancing,
		onSuccess: (result) => {
			if (result.success) {
				setAmountRequested("");
				router.refresh();
			}
		},
	});

	const labelClass =
		"mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant";
	const controlClass =
		"w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm font-medium text-on-surface outline-none transition focus:ring-2 focus:ring-[#FF5A30]/20 appearance-none";
	const selectClass =
		"w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm font-medium text-on-surface outline-none transition focus:ring-2 focus:ring-[#FF5A30]/20 appearance-none";

	const errorMessage = applyMutation.error
		? applyMutation.error instanceof Error
			? applyMutation.error.message
			: "Failed to submit financing application."
		: applyMutation.data && !applyMutation.data.success
			? (applyMutation.data.error ?? "Failed to submit financing application.")
			: null;

	return (
			<section className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-sm md:p-10">
				<div className="mb-6 flex items-start justify-between gap-4">
				<div>
						<p className="text-xs font-bold uppercase tracking-[0.3em] text-[#FF5A30]">
						Quick Apply
					</p>
						<h2 className="mt-1 font-(family-name:--font-manrope) text-2xl font-bold text-on-surface">
						Submit Financing Request
					</h2>
						<p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
							Choose a product, set the amount, and submit a financing request
							for review.
						</p>
				</div>
					<span className="material-symbols-outlined text-2xl text-[#FF5A30]">
					account_balance
				</span>
			</div>

			<form
				onSubmit={(event) => {
					event.preventDefault();
					const parsedAmount = Number(amountRequested);
					if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
						return;
					}
					applyMutation.mutate({
						product,
						amountRequested: parsedAmount,
						currency,
					});
				}}
				className="grid grid-cols-1 gap-5 md:grid-cols-12"
			>
				<div className="md:col-span-5">
					<label
						htmlFor="financing-product"
						className={labelClass}
					>
						Product
					</label>
					<div className="relative">
						<select
							id="financing-product"
							value={product}
							onChange={(event) =>
								setProduct(
									event.target.value as (typeof FINANCING_PRODUCTS)[number],
								)
							}
							className={selectClass}
						>
							{FINANCING_PRODUCTS.map((value) => (
								<option key={value} value={value}>
									{value}
								</option>
							))}
						</select>
						<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
							expand_more
						</span>
					</div>
				</div>

				<div className="md:col-span-3">
					<label
						htmlFor="financing-amount"
						className={labelClass}
					>
						Amount
					</label>
					<input
						id="financing-amount"
						type="number"
						min={1}
						required
						value={amountRequested}
						onChange={(event) => setAmountRequested(event.target.value)}
						className={controlClass}
					/>
				</div>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-[5rem_minmax(0,1fr)] md:col-span-4 md:items-end">
					<div>
						<label
							htmlFor="financing-currency"
							className={labelClass}
						>
							Currency
						</label>
						<input
							id="financing-currency"
							type="text"
							value={currency}
							readOnly
							aria-readonly="true"
							className={`${controlClass} px-3 text-center uppercase tracking-[0.2em]`}
						/>
					</div>
					<button
						type="submit"
						disabled={applyMutation.isPending}
						className={`inline-flex w-full items-center justify-center rounded-xl bg-[#FF5A30] p-3 text-sm font-bold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 md:self-end`}
					>
						{applyMutation.isPending ? "Submitting..." : "Apply"}
					</button>
				</div>
			</form>

			{applyMutation.data?.success && (
				<p className="mt-3 text-sm text-emerald-700 font-medium">
					Application submitted successfully.
				</p>
			)}
			{errorMessage && (
				<p className="mt-3 text-sm text-rose-700 font-medium">{errorMessage}</p>
			)}
		</section>
	);
}
