"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { listBanks, resolveBankAccount } from "@/app/actions";

export interface BankDetails {
	bankCode: string;
	bankName: string;
	accountNumber: string;
	accountHolder: string;
}

const inputClass =
	"w-full bg-surface-container-low border rounded-xl px-4 py-3 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/30";
const labelClass =
	"block text-xs font-semibold uppercase tracking-widest text-on-surface-variant mb-1.5";
const errorBorder = "border-rose-400 ring-1 ring-rose-300";
const normalBorder = "border-outline-variant/30";

export default function BankSelect({
	value,
	onChange,
	country = "nigeria",
	labels,
	required,
	showError,
}: {
	value: BankDetails;
	onChange: (next: BankDetails) => void;
	country?: string;
	labels: {
		bank: string;
		bankSelectPlaceholder: string;
		bankLoading: string;
		bankPlaceholder: string;
		accountNumber: string;
		accountNumberPlaceholder: string;
		verify: string;
		verifying: string;
		verified: string;
		verifyFailed: string;
		accountHolder: string;
		accountHolderPlaceholder: string;
	};
	required?: boolean;
	showError?: boolean;
}) {
	const { data: banksQuery, isLoading: loadingBanks } = useQuery({
		queryKey: ["banks", country],
		queryFn: () => listBanks(country),
		staleTime: 1000 * 60 * 60,
	});
	const rawBankList = (banksQuery?.data as { name: string; code: string }[] | null | undefined) ?? [];
	// Paystack's bank list can list the same NUBAN code more than once (separate
	// entries per channel, e.g. nuban vs mobile_money) — dedupe by code since
	// that's the only field that matters for account resolution and <select> values.
	const bankList = Array.from(new Map(rawBankList.map((b) => [b.code, b])).values());

	const [verified, setVerified] = useState(false);
	const [verifyFailed, setVerifyFailed] = useState(false);
	const [verifyErrorDetail, setVerifyErrorDetail] = useState<string | null>(null);
	const resetVerifyState = () => {
		setVerified(false);
		setVerifyFailed(false);
		setVerifyErrorDetail(null);
	};
	const resolveMutation = useMutation({
		mutationFn: resolveBankAccount,
		onSuccess: (result) => {
			const holder =
				result.success && result.data
					? (result.data as { account_name?: string }).account_name
					: undefined;
			if (holder) {
				onChange({ ...value, accountHolder: holder });
				setVerified(true);
				setVerifyFailed(false);
				setVerifyErrorDetail(null);
			} else {
				setVerifyFailed(true);
				setVerifyErrorDetail(result.error ?? null);
			}
		},
		onError: () => {
			setVerifyFailed(true);
			setVerifyErrorDetail(null);
		},
	});

	const bankHasError = required && showError && !value.bankName;
	const accountHasError = required && showError && !value.accountNumber;
	const canVerify = value.bankCode && value.accountNumber.length === 10 && !verified;

	return (
		<>
			<div>
				<label htmlFor="bank-select" className={labelClass}>
					{labels.bank}
					{required && <span className="text-rose-500 ml-1">*</span>}
				</label>
				{loadingBanks ? (
					<p className="text-xs text-on-surface-variant py-3">{labels.bankLoading}</p>
				) : bankList.length > 0 ? (
					<div className="relative">
						<select
							id="bank-select"
							value={value.bankCode}
							onChange={(e) => {
								const selected = bankList.find((b) => b.code === e.target.value);
								resetVerifyState();
								onChange({ ...value, bankCode: e.target.value, bankName: selected?.name ?? "" });
							}}
							className={`${inputClass} appearance-none pr-9 ${bankHasError ? errorBorder : normalBorder}`}
						>
							<option value="">{labels.bankSelectPlaceholder}</option>
							{bankList.map((b) => (
								<option key={b.code} value={b.code}>
									{b.name}
								</option>
							))}
						</select>
						<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant text-lg">
							expand_more
						</span>
					</div>
				) : (
					<input
						id="bank-select"
						type="text"
						placeholder={labels.bankPlaceholder}
						value={value.bankName}
						onChange={(e) => {
							resetVerifyState();
							onChange({ ...value, bankName: e.target.value });
						}}
						className={`${inputClass} ${bankHasError ? errorBorder : normalBorder}`}
					/>
				)}
				{bankHasError && (
					<p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
						<span className="material-symbols-outlined text-sm">error</span>
						Required
					</p>
				)}
			</div>

			<div>
				<label htmlFor="bank-account-number" className={labelClass}>
					{labels.accountNumber}
					{required && <span className="text-rose-500 ml-1">*</span>}
				</label>
				<div className="flex gap-2">
					<input
						id="bank-account-number"
						type="text"
						inputMode="numeric"
						placeholder={labels.accountNumberPlaceholder}
						value={value.accountNumber}
						onChange={(e) => {
							resetVerifyState();
							onChange({ ...value, accountNumber: e.target.value.replace(/\D/g, "") });
						}}
						className={`${inputClass} ${accountHasError ? errorBorder : normalBorder}`}
					/>
					{canVerify && (
						<button
							type="button"
							disabled={resolveMutation.isPending}
							onClick={() =>
								resolveMutation.mutate({
									account_number: value.accountNumber,
									bank_code: value.bankCode,
								})
							}
							className="shrink-0 rounded-xl border border-outline-variant/40 bg-surface-container-low px-4 py-2 text-xs font-semibold text-on-surface hover:bg-surface-container transition disabled:opacity-60"
						>
							{resolveMutation.isPending ? labels.verifying : labels.verify}
						</button>
					)}
				</div>
				{verified && (
					<p className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-emerald-600">
						<span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>
							check_circle
						</span>
						{labels.verified}
					</p>
				)}
				{verifyFailed && (
					<p className="mt-1.5 text-xs text-amber-600 font-medium">
						{labels.verifyFailed}
						{verifyErrorDetail ? ` (${verifyErrorDetail})` : ""}
					</p>
				)}
				{accountHasError && (
					<p className="text-xs text-rose-600 font-medium mt-1 flex items-center gap-1">
						<span className="material-symbols-outlined text-sm">error</span>
						Required
					</p>
				)}
			</div>

			<div>
				<label htmlFor="bank-account-holder" className={labelClass}>
					{labels.accountHolder}
					{required && <span className="text-rose-500 ml-1">*</span>}
				</label>
				{/* Locks once auto-verified, but stays editable otherwise — Paystack's
				    test-mode key caps live account resolution at 3/day, so a hard
				    lock-with-no-fallback would block onboarding entirely once that's hit. */}
				<input
					id="bank-account-holder"
					type="text"
					placeholder={labels.accountHolderPlaceholder}
					value={value.accountHolder}
					readOnly={verified}
					aria-readonly={verified}
					onChange={(e) => !verified && onChange({ ...value, accountHolder: e.target.value })}
					className={`${inputClass} ${verified ? "cursor-not-allowed opacity-60" : required && showError && !value.accountHolder ? errorBorder : normalBorder}`}
				/>
			</div>
		</>
	);
}
