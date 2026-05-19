"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { createFinancingPartner, getAdminFinancingPartners } from "@/app/actions";

const PARTNER_TYPES = ["bank", "insurance", "credit_union"] as const;
type PartnerType = (typeof PARTNER_TYPES)[number];

const TYPE_ICON: Record<string, string> = {
	bank: "account_balance",
	insurance: "verified_user",
	credit_union: "groups",
};

function statusClass(status: string) {
	switch (status) {
		case "active":
			return "bg-emerald-100 text-emerald-800";
		case "review":
			return "bg-blue-100 text-blue-800";
		default:
			return "bg-yellow-100 text-yellow-800";
	}
}

type Partner = Record<string, unknown>;

export default function FinancingAdminPartnersPage() {
	const t = useTranslations("FinancingAdminPartnersPage");
	const queryClient = useQueryClient();

	const [name, setName] = useState("");
	const [type, setType] = useState<PartnerType>("bank");
	const [markets, setMarkets] = useState("");
	const [capacity, setCapacity] = useState("");

	const cards = t.raw("cards") as {
		key: string;
		title: string;
		description: string;
		icon: string;
	}[];
	const lanes = t.raw("lanes") as {
		title: string;
		description: string;
		icon: string;
	}[];

	const query = useQuery({
		queryKey: ["adminFinancingPartners"],
		queryFn: getAdminFinancingPartners,
	});

	const createMutation = useMutation({
		mutationFn: createFinancingPartner,
		onSuccess: (result) => {
			if (result.success) {
				setName("");
				setMarkets("");
				setCapacity("");
				setType("bank");
				void queryClient.invalidateQueries({
					queryKey: ["adminFinancingPartners"],
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
			<div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-5">
				<div>
					<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-2">
						{t("badge")}
					</span>
					<h1 className="text-2xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface mb-2">
						{t("title")}
					</h1>
					<p className="text-on-surface-variant text-sm font-medium max-w-3xl">
						{t("description")}
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
				{cards.map((card) => (
					<div
						key={card.key}
						className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10"
					>
						<span className="material-symbols-outlined text-3xl text-[#FF5A30] block mb-5">
							{card.icon}
						</span>
						<h2 className="font-(family-name:--font-manrope) font-bold text-base text-on-surface">
							{card.title}
						</h2>
						<p className="text-sm text-on-surface-variant mt-2 leading-6">
							{card.description}
						</p>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-[1fr_0.85fr] gap-8">
				<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
					<div className="flex items-center justify-between mb-5">
						<h2 className="font-(family-name:--font-manrope) font-bold text-base">
							{t("directoryTitle")}
						</h2>
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
						<p className="text-sm text-on-surface-variant py-10 text-center">
							{t("loading")}
						</p>
					) : !query.data?.success ? (
						<p className="text-sm font-medium text-red-600 py-10 text-center">
							{query.data?.error || t("loadError")}
						</p>
					) : partners.length === 0 ? (
						<div className="py-12 text-center">
							<span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-3">
								account_balance
							</span>
							<p className="text-on-surface-variant font-medium text-sm">
								{t("empty")}
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{partners.map((partner) => {
								const partnerType = String(partner.type ?? "bank");
								const status = String(partner.status ?? "active");
								const marketList = Array.isArray(partner.markets)
									? (partner.markets as unknown[]).map(String)
									: [];
								return (
									<div
										key={String(partner.id)}
										className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-outline-variant/10 last:border-none"
									>
										<div className="flex items-start gap-4">
											<div className="w-12 h-12 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0">
												<span className="material-symbols-outlined text-on-surface-variant">
													{TYPE_ICON[partnerType] ?? "account_balance"}
												</span>
											</div>
											<div>
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
										<div className="md:text-right">
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

				<div className="space-y-6">
					<form
						onSubmit={handleSubmit}
						className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/10"
					>
						<h2 className="font-(family-name:--font-manrope) font-bold text-base mb-4 pb-4 border-b border-outline-variant/20">
							{t("partnerForm.title")}
						</h2>
						<div className="space-y-4">
							<label className="block">
								<span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
									{t("partnerForm.fields.name")}
								</span>
								<input
									type="text"
									required
									value={name}
									onChange={(event) => setName(event.target.value)}
									placeholder={t("partnerForm.placeholders.name")}
									className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
								/>
							</label>
							<label className="block">
								<span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
									{t("partnerForm.fields.type")}
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
									{t("partnerForm.fields.markets")}
								</span>
								<input
									type="text"
									value={markets}
									onChange={(event) => setMarkets(event.target.value)}
									placeholder={t("partnerForm.placeholders.markets")}
									className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
								/>
							</label>
							<label className="block">
								<span className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
									{t("partnerForm.fields.capacity")}
								</span>
								<input
									type="number"
									min={1}
									required
									value={capacity}
									onChange={(event) => setCapacity(event.target.value)}
									placeholder={t("partnerForm.placeholders.capacity")}
									className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 py-2.5 text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/20"
								/>
							</label>
							{createDone && (
								<p
									className="text-sm font-medium text-emerald-700"
									role="status"
								>
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

					<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
						<h2 className="font-(family-name:--font-manrope) font-bold text-base mb-5">
							{t("lanesTitle")}
						</h2>
						<div className="space-y-4">
							{lanes.map((lane) => (
								<div
									key={lane.title}
									className="bg-surface-container-low rounded-2xl p-4 flex items-start gap-3"
								>
									<span className="material-symbols-outlined text-[#FF5A30] shrink-0">
										{lane.icon}
									</span>
									<div className="flex-1">
										<p className="font-bold text-sm text-on-surface">
											{lane.title}
										</p>
										<p className="text-xs text-on-surface-variant mt-1 leading-5">
											{lane.description}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</>
	);
}
