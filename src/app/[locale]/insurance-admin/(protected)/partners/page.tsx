"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import Loader from "@/components/Loader";
import {
	createInsurancePartner,
	getInsurancePartners,
} from "@/app/actions";

const PARTNER_TYPES = ["underwriter", "broker", "reinsurer"] as const;
type PartnerType = (typeof PARTNER_TYPES)[number];

const TYPE_ICON: Record<string, string> = {
	underwriter: "verified_user",
	broker: "handshake",
	reinsurer: "account_balance",
};

function statusClass(status: string) {
	switch (status) {
		case "active":
			return "bg-emerald-100 text-emerald-700";
		case "review":
			return "bg-blue-100 text-blue-700";
		default:
			return "bg-yellow-100 text-yellow-700";
	}
}

type Partner = Record<string, unknown>;

export default function InsuranceAdminPartnersPage() {
	const t = useTranslations("InsuranceAdminPartnersPage");
	const queryClient = useQueryClient();

	const [name, setName] = useState("");
	const [type, setType] = useState<PartnerType>("underwriter");
	const [markets, setMarkets] = useState("");
	const [capacity, setCapacity] = useState("");

	const query = useQuery({
		queryKey: ["insurancePartners"],
		queryFn: getInsurancePartners,
	});

	const createMutation = useMutation({
		mutationFn: createInsurancePartner,
		onSuccess: (result) => {
			if (result.success) {
				setName("");
				setMarkets("");
				setCapacity("");
				setType("underwriter");
				void queryClient.invalidateQueries({
					queryKey: ["insurancePartners"],
				});
			}
		},
	});

	const partners = (
		query.data?.success ? (query.data.data ?? []) : []
	) as Partner[];

	function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault();
		const capacityValue = Number.parseInt(capacity, 10);
		if (!name.trim() || !Number.isFinite(capacityValue) || capacityValue < 1) {
			return;
		}
		createMutation.mutate({
			name: name.trim(),
			type,
			markets: markets
				.split(",")
				.map((m) => m.trim())
				.filter(Boolean),
			capacity: capacityValue,
		});
	}

	const createDone = createMutation.data?.success === true;
	const createFailed =
		createMutation.isSuccess && createMutation.data?.success === false;

	return (
		<>
			<div className="mb-10">
				<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
					{t("badge")}
				</span>
				<h1 className="text-4xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
					{t("title")}
				</h1>
				<p className="text-on-surface-variant font-medium">
					{t("description")}
				</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-[1fr_0.8fr] gap-8">
				<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
					<div className="flex items-center justify-between mb-5">
						<h3 className="font-(family-name:--font-manrope) font-bold text-lg">
							{t("directoryTitle")}
						</h3>
						<button
							type="button"
							onClick={() => query.refetch()}
							disabled={query.isFetching}
							className="text-sm font-bold text-[#FF5A30] hover:underline disabled:opacity-60"
						>
							{t("refresh")}
						</button>
					</div>

					{query.isLoading ? (
						<Loader />
					) : !query.data?.success ? (
						<p className="text-sm font-medium text-red-600 py-10 text-center">
							{query.data?.error || t("loadError")}
						</p>
					) : partners.length === 0 ? (
						<div className="py-12 text-center">
							<span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-3">
								verified_user
							</span>
							<p className="text-on-surface-variant font-medium text-sm">
								{t("empty")}
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{partners.map((partner) => {
								const partnerType = String(partner.type ?? "underwriter");
								const status = String(partner.status ?? "active");
								const marketList = Array.isArray(partner.markets)
									? (partner.markets as unknown[]).map(String)
									: [];
								return (
									<div
										key={String(partner.id)}
										className="flex items-center justify-between gap-4 py-4 border-b border-outline-variant/10 last:border-none"
									>
										<div className="flex items-start gap-4 min-w-0">
											<div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0">
												<span className="material-symbols-outlined text-on-surface-variant">
													{TYPE_ICON[partnerType] ?? "verified_user"}
												</span>
											</div>
											<div className="min-w-0">
												<div className="flex items-center gap-2 flex-wrap">
													<p className="font-(family-name:--font-manrope) font-bold text-on-surface">
														{String(partner.name ?? "—")}
													</p>
													<span
														className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusClass(status)}`}
													>
														{t(`status.${status}`)}
													</span>
												</div>
												<p className="text-sm text-on-surface-variant mt-1">
													{t(`types.${partnerType}`)}
													{marketList.length > 0
														? ` · ${marketList.join(", ")}`
														: ""}
												</p>
											</div>
										</div>
										<div className="text-right shrink-0">
											<p className="font-(family-name:--font-manrope) font-extrabold text-on-surface">
												{`$${Number(partner.capacity ?? 0).toLocaleString()}`}
											</p>
											<p className="text-xs text-on-surface-variant">
												{t("capacityLabel")}
											</p>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</div>

				<form
					onSubmit={handleSubmit}
					className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm h-fit"
				>
					<h3 className="font-(family-name:--font-manrope) font-bold text-base mb-4 pb-4 border-b border-outline-variant/20">
						{t("partnerForm.title")}
					</h3>
					<div className="space-y-4">
						<label className="block">
							<span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
								{t("partnerForm.name")}
							</span>
							<input
								type="text"
								required
								value={name}
								onChange={(event) => setName(event.target.value)}
								placeholder={t("partnerForm.namePlaceholder")}
								className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
							/>
						</label>
						<label className="block">
							<span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
								{t("partnerForm.type")}
							</span>
							<select
								value={type}
								onChange={(event) =>
									setType(event.target.value as PartnerType)
								}
								className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
							>
								{PARTNER_TYPES.map((value) => (
									<option key={value} value={value}>
										{t(`types.${value}`)}
									</option>
								))}
							</select>
						</label>
						<label className="block">
							<span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
								{t("partnerForm.markets")}
							</span>
							<input
								type="text"
								value={markets}
								onChange={(event) => setMarkets(event.target.value)}
								placeholder={t("partnerForm.marketsPlaceholder")}
								className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
							/>
						</label>
						<label className="block">
							<span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
								{t("partnerForm.capacity")}
							</span>
							<input
								type="number"
								min={1}
								required
								value={capacity}
								onChange={(event) => setCapacity(event.target.value)}
								placeholder={t("partnerForm.capacityPlaceholder")}
								className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
							/>
						</label>
						{createDone && (
							<p className="text-sm font-medium text-emerald-700" role="status">
								{t("partnerForm.success")}
							</p>
						)}
						{(createFailed || createMutation.isError) && (
							<p className="text-sm font-medium text-red-600" role="alert">
								{createMutation.data?.error || t("partnerForm.error")}
							</p>
						)}
						<button
							type="submit"
							disabled={createMutation.isPending}
							className="w-full py-3 bg-[#FF5A30] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-opacity disabled:opacity-60"
						>
							{createMutation.isPending
								? t("partnerForm.saving")
								: t("partnerForm.submit")}
						</button>
					</div>
				</form>
			</div>
		</>
	);
}
