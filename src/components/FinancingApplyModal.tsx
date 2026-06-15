"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import {
	applyForFinancing,
	listBanks,
	resolveBankAccount,
} from "@/app/actions";

// Financing products + the legacy single insurance bundle. Kept as the default
// dropdown scope so existing financing entry points are unchanged.
const FINANCING_PRODUCT_IDS = [
	"Tour Stop Advance",
	"Venue Build-Out Credit",
	"Event Insurance Bundle",
	"Marketing & Ticketing Float",
] as const;

// The ten named insurance products (Access Insurance suite).
const INSURANCE_PRODUCT_IDS = [
	"Event Cancellation and Disruption Protection",
	"Public Liability and Audience Safety Coverage",
	"Touring and Artist Risk Management",
	"Workforce and Contractor Protection",
	"Production Equipment and Asset Insurance",
	"Venue and Infrastructure Coverage",
	"Ticket Protection and Consumer Assurance Solutions",
	"Sponsor and Brand Activation Risk Solutions",
	"Compliance and Risk Assessment Services",
	"Data-Driven Insurance Products",
] as const;

type ProductId =
	| (typeof FINANCING_PRODUCT_IDS)[number]
	| (typeof INSURANCE_PRODUCT_IDS)[number];

const PRODUCT_KEYS: Record<ProductId, string> = {
	"Tour Stop Advance": "tourStopAdvance",
	"Venue Build-Out Credit": "venueBuildOutCredit",
	"Event Insurance Bundle": "eventInsuranceBundle",
	"Marketing & Ticketing Float": "marketingTicketingFloat",
	"Event Cancellation and Disruption Protection": "eventCancellationDisruption",
	"Public Liability and Audience Safety Coverage": "publicLiabilityAudience",
	"Touring and Artist Risk Management": "touringArtistRisk",
	"Workforce and Contractor Protection": "workforceContractor",
	"Production Equipment and Asset Insurance": "productionEquipment",
	"Venue and Infrastructure Coverage": "venueInfrastructure",
	"Ticket Protection and Consumer Assurance Solutions": "ticketProtection",
	"Sponsor and Brand Activation Risk Solutions": "sponsorBrandRisk",
	"Compliance and Risk Assessment Services": "complianceRisk",
	"Data-Driven Insurance Products": "dataDrivenInsurance",
};

export default function FinancingApplyModal({
	defaultProduct,
	applicantName,
	onClose,
	products = FINANCING_PRODUCT_IDS,
}: {
	defaultProduct: ProductId;
	applicantName?: string;
	onClose: () => void;
	products?: readonly ProductId[];
}) {
	const t = useTranslations("FinancingApplyModal");
	const queryClient = useQueryClient();

	const [step, setStep] = useState<0 | 1>(0);
	const [product, setProduct] = useState<ProductId>(defaultProduct);
	const [amount, setAmount] = useState("");
	const [purpose, setPurpose] = useState("");
	const [bankCode, setBankCode] = useState("");
	const [accountNumber, setAccountNumber] = useState("");
	const [accountHolder, setAccountHolder] = useState(applicantName ?? "");

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [onClose]);

	const banksQuery = useQuery({
		queryKey: ["banks", "nigeria"],
		queryFn: () => listBanks("nigeria"),
		staleTime: 30 * 60 * 1000,
	});
	const banks = banksQuery.data?.data ?? [];
	const selectedBank = banks.find((b) => b.code === bankCode);

	const resolveMutation = useMutation({
		mutationFn: resolveBankAccount,
	});

	const applyMutation = useMutation({
		mutationFn: applyForFinancing,
		onSuccess: (result) => {
			if (result.success) {
				void queryClient.invalidateQueries({
					queryKey: ["financingApplications"],
				});
			}
		},
	});

	const resolvedName = resolveMutation.data?.success
		? resolveMutation.data.data?.account_name
		: null;
	const nameMatches = resolveMutation.data?.success
		? resolveMutation.data.data?.name_matches
		: undefined;
	const resolveError = resolveMutation.error
		? resolveMutation.error instanceof Error
			? resolveMutation.error.message
			: t("errors.resolve")
		: resolveMutation.data && !resolveMutation.data.success
			? (resolveMutation.data.error ?? t("errors.resolve"))
			: null;

	const applyError = applyMutation.error
		? applyMutation.error instanceof Error
			? applyMutation.error.message
			: t("errors.submit")
		: applyMutation.data && !applyMutation.data.success
			? (applyMutation.data.error ?? t("errors.submit"))
			: null;

	const parsedAmount = Number(amount);
	const amountValid = Number.isFinite(parsedAmount) && parsedAmount > 0;
	const accountNumberValid = /^\d{6,20}$/.test(accountNumber);
	const accountHolderValid = accountHolder.trim().length >= 2;
	const canResolve =
		bankCode !== "" &&
		accountNumberValid &&
		accountHolderValid &&
		!resolveMutation.isPending;
	const canSubmit =
		step === 1 &&
		amountValid &&
		bankCode !== "" &&
		accountNumberValid &&
		accountHolderValid &&
		resolvedName !== null &&
		nameMatches === true &&
		!applyMutation.isPending;

	function handleResolve() {
		resolveMutation.mutate({
			account_number: accountNumber,
			bank_code: bankCode,
			expected_name: accountHolder.trim(),
		});
	}

	function handleSubmit() {
		if (!canSubmit) return;
		applyMutation.mutate({
			// The six insurance products require ckrowd-prisma's financing route to
			// accept them; until that package version ships, bridge to the client's
			// product type the same way FinancingQuickApply does.
			product: product as Parameters<typeof applyForFinancing>[0]["product"],
			amountRequested: parsedAmount,
			currency: "USD",
			purpose: purpose.trim() || undefined,
			bankCode,
			bankName: selectedBank?.name,
			accountNumber,
			accountName: resolvedName ?? accountHolder.trim(),
			accountVerified: nameMatches === true,
		});
	}

	if (applyMutation.data?.success) {
		return (
			<div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
				<button
					type="button"
					aria-label={t("close")}
					onClick={onClose}
					className="absolute inset-0 bg-black/40 cursor-default border-none"
				/>
				<div
					role="dialog"
					aria-modal="true"
					className="relative z-10 w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-2xl p-8 text-center"
				>
					<div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
						<span
							className="material-symbols-outlined text-3xl"
							style={{ fontVariationSettings: "'FILL' 1" }}
						>
							check_circle
						</span>
					</div>
					<h3 className="text-xl font-semibold font-(family-name:--font-manrope) text-on-surface">
						{t("success.title")}
					</h3>
					<p className="mt-2 text-sm text-on-surface-variant">
						{t("success.description")}
					</p>
					<button
						type="button"
						onClick={onClose}
						className="mt-6 inline-flex items-center justify-center rounded-xl bg-[#FF5A30] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity"
					>
						{t("success.done")}
					</button>
				</div>
			</div>
		);
	}

	const labelClass =
		"mb-2 block text-xs font-semibold uppercase tracking-[0.24em] text-on-surface-variant";
	const controlClass =
		"w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm font-medium text-on-surface outline-none transition focus:ring-2 focus:ring-[#FF5A30]/20";

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
			<button
				type="button"
				aria-label={t("close")}
				onClick={onClose}
				className="absolute inset-0 bg-black/40 cursor-default border-none"
			/>
			<div
				role="dialog"
				aria-modal="true"
				aria-label={t("title")}
				className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface-container-lowest rounded-2xl shadow-2xl"
			>
				<div className="sticky top-0 flex items-start justify-between gap-3 px-6 py-4 border-b border-outline-variant/15 bg-surface-container-lowest">
					<div className="min-w-0">
						<p className="text-[10px] font-black uppercase tracking-widest text-[#FF5A30]">
							{t("step", { current: step + 1, total: 2 })}
						</p>
						<h3 className="font-(family-name:--font-manrope) font-semibold text-on-surface text-lg">
							{step === 0 ? t("step1.title") : t("step2.title")}
						</h3>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label={t("close")}
						className="text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
					>
						<span className="material-symbols-outlined">close</span>
					</button>
				</div>

				<div className="px-6 py-6">
					{step === 0 ? (
						<div className="space-y-5">
							<div>
								<label htmlFor="apply-product" className={labelClass}>
									{t("fields.product")}
								</label>
								<select
									id="apply-product"
									value={product}
									onChange={(e) => setProduct(e.target.value as ProductId)}
									className={controlClass}
								>
									{products.map((p) => (
										<option key={p} value={p}>
											{t(`products.${PRODUCT_KEYS[p]}`)}
										</option>
									))}
								</select>
							</div>
							<div className="grid grid-cols-1 sm:grid-cols-[1fr_5rem] gap-3">
								<div>
									<label htmlFor="apply-amount" className={labelClass}>
										{t("fields.amount")}
									</label>
									<input
										id="apply-amount"
										type="number"
										min={1}
										value={amount}
										onChange={(e) => setAmount(e.target.value)}
										className={controlClass}
										placeholder="50000"
									/>
								</div>
								<div>
									<label htmlFor="apply-currency" className={labelClass}>
										{t("fields.currency")}
									</label>
									<input
										id="apply-currency"
										value="USD"
										readOnly
										aria-readonly="true"
										className={`${controlClass} text-center uppercase tracking-[0.2em]`}
									/>
								</div>
							</div>
							<div>
								<label htmlFor="apply-purpose" className={labelClass}>
									{t("fields.purpose")}
								</label>
								<textarea
									id="apply-purpose"
									value={purpose}
									onChange={(e) => setPurpose(e.target.value)}
									className={`${controlClass} min-h-24`}
									placeholder={t("fields.purposePlaceholder")}
								/>
							</div>
						</div>
					) : (
						<div className="space-y-5">
							<p className="text-sm text-on-surface-variant">
								{t("step2.description")}
							</p>
							<div>
								<label htmlFor="apply-bank" className={labelClass}>
									{t("fields.bank")}
								</label>
								<select
									id="apply-bank"
									value={bankCode}
									onChange={(e) => {
										setBankCode(e.target.value);
										resolveMutation.reset();
									}}
									className={controlClass}
									disabled={banksQuery.isLoading}
								>
									<option value="">
										{banksQuery.isLoading
											? t("fields.bankLoading")
											: t("fields.bankSelect")}
									</option>
									{banks.map((bank, index) => (
										<option
											key={`${bank.code}-${index}`}
											value={bank.code}
										>
											{bank.name}
										</option>
									))}
								</select>
							</div>
							<div>
								<label htmlFor="apply-account" className={labelClass}>
									{t("fields.accountNumber")}
								</label>
								<input
									id="apply-account"
									inputMode="numeric"
									pattern="\d*"
									maxLength={20}
									value={accountNumber}
									onChange={(e) => {
										setAccountNumber(e.target.value.replace(/\D/g, ""));
										resolveMutation.reset();
									}}
									className={controlClass}
									placeholder="0123456789"
								/>
							</div>
							<div>
								<label htmlFor="apply-holder" className={labelClass}>
									{t("fields.accountHolder")}
								</label>
								<input
									id="apply-holder"
									value={accountHolder}
									onChange={(e) => {
										setAccountHolder(e.target.value);
										resolveMutation.reset();
									}}
									className={controlClass}
									placeholder={t("fields.accountHolderPlaceholder")}
								/>
							</div>

							<div className="flex flex-col gap-3 rounded-xl border border-outline-variant/15 bg-surface-container-low p-4">
								<div className="flex items-center justify-between gap-3">
									<p className="text-sm font-semibold text-on-surface">
										{t("verify.title")}
									</p>
									<button
										type="button"
										onClick={handleResolve}
										disabled={!canResolve}
										className="rounded-lg bg-[#FF5A30] text-white text-xs font-semibold px-4 py-2 hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-50"
									>
										{resolveMutation.isPending
											? t("verify.checking")
											: t("verify.action")}
									</button>
								</div>
								{resolveError && (
									<p className="text-xs text-rose-700 font-medium">
										{resolveError}
									</p>
								)}
								{resolvedName && (
									<div className="flex items-start gap-2">
										<span
											className={`material-symbols-outlined text-base ${nameMatches ? "text-emerald-600" : "text-amber-600"}`}
											style={{ fontVariationSettings: "'FILL' 1" }}
										>
											{nameMatches ? "verified" : "warning"}
										</span>
										<div className="min-w-0 flex-1">
											<p className="text-xs font-semibold text-on-surface">
												{t("verify.registeredAs")}
											</p>
											<p className="text-sm text-on-surface truncate">
												{resolvedName}
											</p>
											<p
												className={`text-xs mt-1 ${nameMatches ? "text-emerald-700" : "text-amber-700"}`}
											>
												{nameMatches
													? t("verify.matched")
													: t("verify.mismatch")}
											</p>
										</div>
									</div>
								)}
							</div>
						</div>
					)}

					{applyError && (
						<p
							className="mt-4 text-sm font-medium text-rose-700"
							role="alert"
						>
							{applyError}
						</p>
					)}
				</div>

				<div className="sticky bottom-0 flex items-center justify-between gap-3 px-6 py-4 border-t border-outline-variant/15 bg-surface-container-lowest">
					<button
						type="button"
						onClick={() => (step === 0 ? onClose() : setStep(0))}
						className="rounded-xl border border-outline-variant/40 px-5 py-2.5 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
					>
						{step === 0 ? t("actions.cancel") : t("actions.back")}
					</button>
					{step === 0 ? (
						<button
							type="button"
							onClick={() => setStep(1)}
							disabled={!amountValid}
							className="rounded-xl bg-[#FF5A30] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
						>
							{t("actions.next")}
						</button>
					) : (
						<button
							type="button"
							onClick={handleSubmit}
							disabled={!canSubmit}
							className="rounded-xl bg-[#FF5A30] px-6 py-2.5 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
						>
							{applyMutation.isPending
								? t("actions.submitting")
								: t("actions.submit")}
						</button>
					)}
				</div>
			</div>
		</div>
	);
}

export type { ProductId };
export { FINANCING_PRODUCT_IDS, INSURANCE_PRODUCT_IDS };
