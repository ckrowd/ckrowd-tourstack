"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { applyForFinancing } from "@/app/actions";
import { useRouter } from "@/i18n/routing";

export default function FinancingQuickApply() {
	const t = useTranslations("FinancingQuickApply");
	const router = useRouter();

	const FINANCING_PRODUCTS = [
		{ id: "tourStopAdvance", label: t("products.tourStopAdvance") },
		{ id: "venueBuildOutCredit", label: t("products.venueBuildOutCredit") },
		{ id: "eventInsuranceBundle", label: t("products.eventInsuranceBundle") },
		{
			id: "marketingTicketingFloat",
			label: t("products.marketingTicketingFloat"),
		},
	] as const;

	const [product, setProduct] = useState<string>(FINANCING_PRODUCTS[0].id);
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
			: t("errors.failed")
		: applyMutation.data && !applyMutation.data.success
			? (applyMutation.data.error ?? t("errors.failed"))
			: null;

	return (
		<section className="rounded-3xl border border-outline-variant/10 bg-surface-container-lowest p-8 shadow-sm md:p-10">
			<div className="mb-6 flex items-start justify-between gap-4">
				<div>
					<p className="text-xs font-bold uppercase tracking-[0.3em] text-[#FF5A30]">
						{t("badge")}
					</p>
					<h2 className="mt-1 font-(family-name:--font-manrope) text-2xl font-bold text-on-surface">
						{t("title")}
					</h2>
					<p className="mt-2 max-w-2xl text-sm leading-relaxed text-on-surface-variant">
						{t("description")}
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
						product: product as Parameters<
							typeof applyForFinancing
						>[0]["product"],
						amountRequested: parsedAmount,
						currency,
					});
				}}
				className="grid grid-cols-1 gap-5 md:grid-cols-12"
			>
				<div className="md:col-span-5">
					<label htmlFor="financing-product" className={labelClass}>
						{t("fields.product")}
					</label>
					<div className="relative">
						<select
							id="financing-product"
							value={product}
							onChange={(event) => setProduct(event.target.value)}
							className={selectClass}
						>
							{FINANCING_PRODUCTS.map(({ id, label }) => (
								<option key={id} value={id}>
									{label}
								</option>
							))}
						</select>
						<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
							expand_more
						</span>
					</div>
				</div>

				<div className="md:col-span-3">
					<label htmlFor="financing-amount" className={labelClass}>
						{t("fields.amount")}
					</label>
					<input
						id="financing-amount"
						type="number"
						min={1}
						required
						onInvalid={(e) =>
							(e.target as HTMLInputElement).setCustomValidity(
								t("validation.required"),
							)
						}
						onInput={(e) => {
							const target = e.target as HTMLInputElement;
							target.setCustomValidity("");
							setAmountRequested(target.value);
						}}
						value={amountRequested}
						className={controlClass}
					/>
				</div>

				<div className="grid grid-cols-1 gap-3 sm:grid-cols-[5rem_minmax(0,1fr)] md:col-span-4 md:items-end">
					<div>
						<label htmlFor="financing-currency" className={labelClass}>
							{t("fields.currency")}
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
						{applyMutation.isPending
							? t("actions.submitting")
							: t("actions.apply")}
					</button>
				</div>
			</form>

			{applyMutation.data?.success && (
				<p className="mt-3 text-sm text-emerald-700 font-medium">
					{t("success")}
				</p>
			)}
			{errorMessage && (
				<p className="mt-3 text-sm text-rose-700 font-medium">{errorMessage}</p>
			)}
		</section>
	);
}
