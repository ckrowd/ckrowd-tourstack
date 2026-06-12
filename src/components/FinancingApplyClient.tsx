"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { applyForFinancing } from "@/app/actions";
import { Link } from "@/i18n/routing";

type Tour = { id: string; name?: string | null; city?: string | null; artist?: { name?: string | null } | null };
type Application = { id: string; product?: string | null; amount_requested?: number | null; currency?: string | null; status?: string | null; created_at?: Date | string | null; tour?: { artist?: { name?: string | null } | null } | null };

const FINANCING_PRODUCTS: { id: Parameters<typeof applyForFinancing>[0]["product"]; labelKey: string }[] = [
	{ id: "Tour Stop Advance", labelKey: "tourStopAdvance" },
	{ id: "Venue Build-Out Credit", labelKey: "venueBuildOutCredit" },
	{ id: "Marketing & Ticketing Float", labelKey: "marketingTicketingFloat" },
	{ id: "Credit Guarantee", labelKey: "creditGuarantee" },
	{ id: "Promoter Business", labelKey: "promoterBusiness" },
];

interface Props {
	tours: Tour[];
	applications: Application[];
	locale: string;
}

export default function FinancingApplyClient({ tours, applications, locale }: Props) {
	const t = useTranslations("FinancingApplyPage");
	const queryClient = useQueryClient();

	const [tourId, setTourId] = useState<string>("");
	const [product, setProduct] = useState<Parameters<typeof applyForFinancing>[0]["product"]>(FINANCING_PRODUCTS[0].id);
	const [amount, setAmount] = useState("");

	const applyMutation = useMutation({
		mutationFn: applyForFinancing,
		onSuccess: (result) => {
			if (result.success) {
				setAmount("");
				setTourId("");
				void queryClient.invalidateQueries({ queryKey: ["financingApplications"] });
			}
		},
	});

	const errorMessage = applyMutation.data && !applyMutation.data.success
		? (applyMutation.data.error ?? t("errors.failed"))
		: applyMutation.error
			? t("errors.failed")
			: null;

	const selectClass = "w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm font-medium text-on-surface outline-none transition focus:ring-2 focus:ring-[#FF5A30]/20 appearance-none";
	const labelClass = "mb-2 block text-xs font-bold uppercase tracking-[0.22em] text-on-surface-variant";

	return (
		<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
			{/* Header */}
			<div className="mb-8">
				<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
					{t("promoterPortal")}
				</span>
				<h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
					{t("title")}
				</h1>
				<p className="text-on-surface-variant font-medium max-w-xl">
					{t("description")}
				</p>
			</div>

			{/* Apply form */}
			<div className="bg-surface-container-lowest rounded-2xl p-8 shadow-sm mb-10">
				<h2 className="font-(family-name:--font-manrope) font-bold text-xl text-on-surface mb-6">
					{t("applyTitle")}
				</h2>
				<form
					onSubmit={(e) => {
						e.preventDefault();
						const parsedAmount = Number(amount);
						if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) return;
						applyMutation.mutate({
							product,
							amountRequested: parsedAmount,
							currency: "USD",
							...(tourId ? { tourId } : {}),
						});
					}}
					className="space-y-6"
				>
					{/* Choose tour */}
					<div>
						<label htmlFor="fin-tour" className={labelClass}>
							{t("fields.tour")}
						</label>
						<div className="relative">
							<select
								id="fin-tour"
								value={tourId}
								onChange={(e) => setTourId(e.target.value)}
								className={selectClass}
							>
								<option value="">{t("fields.tourNone")}</option>
								{tours.map((tour) => (
									<option key={tour.id} value={tour.id}>
										{tour.artist?.name ?? t("fields.unknownArtist")}
										{tour.city ? ` — ${tour.city}` : ""}
									</option>
								))}
							</select>
							<span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
								expand_more
							</span>
						</div>
					</div>

					{/* Choose package */}
					<div>
						<p className={labelClass}>{t("fields.package")}</p>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
							{FINANCING_PRODUCTS.map((p) => (
								<button
									key={p.id}
									type="button"
									role="radio"
									aria-checked={product === p.id}
									onClick={() => setProduct(p.id)}
									className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
										product === p.id
											? "border-[#FF5A30] bg-[#FF5A30]/5"
											: "border-outline-variant/20 hover:border-outline-variant/50"
									}`}
								>
									<span
										className={`material-symbols-outlined text-xl shrink-0 ${product === p.id ? "text-[#FF5A30]" : "text-on-surface-variant"}`}
										style={{ fontVariationSettings: "'FILL' 1" }}
									>
										account_balance
									</span>
									<span className={`text-sm font-semibold font-(family-name:--font-manrope) ${product === p.id ? "text-[#FF5A30]" : "text-on-surface"}`}>
										{t(`packages.${p.labelKey}`)}
									</span>
								</button>
							))}
						</div>
					</div>

					{/* Amount */}
					<div className="max-w-xs">
						<label htmlFor="fin-amount" className={labelClass}>
							{t("fields.amount")}
						</label>
						<div className="flex items-center gap-2">
							<span className="text-sm font-bold text-on-surface-variant w-10 shrink-0 text-center">
								USD
							</span>
							<input
								id="fin-amount"
								type="number"
								min={1}
								required
								value={amount}
								onChange={(e) => setAmount(e.target.value)}
								placeholder="0"
								className="flex-1 rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm font-medium text-on-surface outline-none transition focus:ring-2 focus:ring-[#FF5A30]/20"
							/>
						</div>
					</div>

					{errorMessage && (
						<p className="text-sm text-rose-700 font-medium">{errorMessage}</p>
					)}
					{applyMutation.data?.success && (
						<p className="text-sm text-emerald-700 font-medium">{t("success")}</p>
					)}

					<button
						type="submit"
						disabled={applyMutation.isPending}
						className="bg-[#FF5A30] text-white px-8 py-3 rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-all disabled:opacity-60"
					>
						{applyMutation.isPending ? t("actions.submitting") : t("actions.submit")}
					</button>
				</form>
			</div>

			{/* Applications list */}
			<div>
				<h2 className="font-(family-name:--font-manrope) text-xl font-bold text-on-surface mb-5">
					{t("myApplications")}
				</h2>
				{applications.length === 0 ? (
					<div className="bg-surface-container-lowest rounded-2xl p-10 text-center shadow-sm">
						<span className="material-symbols-outlined text-4xl text-on-surface-variant block mb-3">
							account_balance
						</span>
						<p className="text-sm font-bold text-on-surface-variant">
							{t("noApplications")}
						</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{applications.map((app) => {
							const status = String(app.status ?? "pending");
							const statusColor =
								status === "approved"
									? "bg-emerald-100 text-emerald-800"
									: status === "declined"
										? "bg-red-100 text-red-800"
										: "bg-yellow-100 text-yellow-800";
							return (
								<div
									key={String(app.id)}
									className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-transparent hover:border-outline-variant/20 transition-all"
								>
									<div className="flex items-start justify-between gap-4 mb-4">
										<div>
											<p className="font-(family-name:--font-manrope) font-bold text-on-surface">
												{String(app.product ?? t("application"))}
											</p>
											<p className="text-sm text-on-surface-variant mt-0.5">
												{String(app.tour?.artist?.name ?? "")}
											</p>
										</div>
										<span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shrink-0 ${statusColor}`}>
											{t(`statuses.${status}`)}
										</span>
									</div>
									<div className="grid grid-cols-2 gap-3">
										<div className="p-3 bg-surface-container-low rounded-lg">
											<p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">
												{t("requested")}
											</p>
											<p className="font-bold text-on-surface">
												{String(app.currency ?? "USD")}{" "}
												{Number(app.amount_requested).toLocaleString(locale)}
											</p>
										</div>
										<div className="p-3 bg-surface-container-low rounded-lg">
											<p className="text-[10px] uppercase font-bold text-on-surface-variant mb-1">
												{t("appliedOn")}
											</p>
											<p className="font-bold text-on-surface">
												{app.created_at
													? new Date(String(app.created_at)).toLocaleDateString(locale, { month: "short", day: "numeric", year: "numeric" })
													: "—"}
											</p>
										</div>
									</div>
									<div className="mt-4">
										<Link
											href={`/financing/${String(app.id)}`}
											className="text-sm font-bold text-[#FF5A30] hover:underline"
										>
											{t("viewDetails")}
										</Link>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</main>
	);
}
