"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import {
	getTicketEvent,
	getTours,
	publishTicketEvent,
	closeTicketEvent,
	createTicketTier,
	deleteTicketTier,
	listTicketPurchases,
	updateTicketEvent,
} from "@/app/actions";

type Tab = "overview" | "tiers" | "buyers";

export default function ManageTicketEventPage() {
	const t = useTranslations("ManageTicketEventPage");
	const { locale, id } = useParams<{ locale: string; id: string }>();
	const router = useRouter();
	const qc = useQueryClient();
	const [tab, setTab] = useState<Tab>("overview");

	// Adding a new tier inline
	const [addingTier, setAddingTier] = useState(false);
	const [newTierName, setNewTierName] = useState("");
	const [newTierPrice, setNewTierPrice] = useState("");
	const [newTierCap, setNewTierCap] = useState("");

	// Editing the linked tour
	const [editingTour, setEditingTour] = useState(false);
	const [selectedTourId, setSelectedTourId] = useState("");

	// Sharing the public ticket link
	const [linkCopied, setLinkCopied] = useState(false);
	const publicUrl =
		typeof window !== "undefined" ? `${window.location.origin}/${locale}/tickets/${id}` : "";

	async function handleCopyLink() {
		if (!publicUrl) return;
		await navigator.clipboard.writeText(publicUrl);
		setLinkCopied(true);
		setTimeout(() => setLinkCopied(false), 2000);
	}

	const eventQuery = useQuery({
		queryKey: ["ticketEvent", id],
		queryFn: () => getTicketEvent(id),
	});

	const toursQuery = useQuery({
		queryKey: ["tours"],
		queryFn: () => getTours(),
		enabled: tab === "overview",
	});
	const tours = (toursQuery.data?.data as Record<string, unknown>[] | null) ?? [];
	const linkableTours = tours.filter((tr) => tr.status !== "rejected");

	const updateTourMutation = useMutation({
		mutationFn: (nextTourId: string | null) => updateTicketEvent(id, { tourId: nextTourId }),
		onSuccess: (res) => {
			if (res.success) {
				qc.invalidateQueries({ queryKey: ["ticketEvent", id] });
				setEditingTour(false);
			}
		},
	});

	const purchasesQuery = useQuery({
		queryKey: ["ticketPurchases", id],
		queryFn: () => listTicketPurchases(id, "success"),
		enabled: tab === "buyers",
	});

	const publishMutation = useMutation({
		mutationFn: () => publishTicketEvent(id),
		onSuccess: (res) => {
			if (res.success) {
				qc.invalidateQueries({ queryKey: ["ticketEvent", id] });
				qc.invalidateQueries({ queryKey: ["ticketEvents"] });
			}
		},
	});

	const closeMutation = useMutation({
		mutationFn: () => closeTicketEvent(id),
		onSuccess: (res) => {
			if (res.success) {
				qc.invalidateQueries({ queryKey: ["ticketEvent", id] });
				qc.invalidateQueries({ queryKey: ["ticketEvents"] });
			}
		},
	});

	const addTierMutation = useMutation({
		mutationFn: () =>
			createTicketTier(id, {
				name: newTierName,
				price: Number(newTierPrice),
				capacity: newTierCap ? Number(newTierCap) : undefined,
			}),
		onSuccess: (res) => {
			if (res.success) {
				qc.invalidateQueries({ queryKey: ["ticketEvent", id] });
				setAddingTier(false);
				setNewTierName("");
				setNewTierPrice("");
				setNewTierCap("");
			}
		},
	});

	const deleteTierMutation = useMutation({
		mutationFn: (tierId: string) => deleteTicketTier(id, tierId),
		onSuccess: (res) => {
			if (res.success) qc.invalidateQueries({ queryKey: ["ticketEvent", id] });
		},
	});

	const ev = eventQuery.data?.data as Record<string, unknown> | null | undefined;
	const tiers = (ev?.tiers as Record<string, unknown>[]) ?? [];
	const purchases = (purchasesQuery.data?.data as Record<string, unknown>[]) ?? [];
	const status = String(ev?.status ?? "draft");

	const statusColor: Record<string, string> = {
		draft: "bg-surface-container text-on-surface-variant",
		published: "bg-emerald-100 text-emerald-800",
		closed: "bg-surface-container-high text-on-surface-variant",
		cancelled: "bg-red-100 text-red-700",
	};

	const TABS: Tab[] = ["overview", "tiers", "buyers"];

	if (eventQuery.isLoading) {
		return (
			<div className="flex justify-center py-16">
				<div className="w-6 h-6 border-2 border-[#FF5A30] border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	if (!ev) {
		return <div className="p-6 text-sm text-on-surface-variant">Event not found.</div>;
	}

	const tourData = ev.tour as Record<string, unknown> | null | undefined;

	return (
		<div className="p-6 max-w-5xl mx-auto">
			<button
				type="button"
				onClick={() => router.push(`/${locale}/dashboard/tickets`)}
				className="text-sm text-on-surface-variant hover:underline mb-6 flex items-center gap-1"
			>
				← {t("backToEvents")}
			</button>

			<div className="flex items-start justify-between mb-6">
				<div>
					<p className="text-xs font-black uppercase tracking-widest text-[#FF5A30] mb-1">{t("badge")}</p>
					<h1 className="text-2xl font-black">{String(ev.title)}</h1>
				</div>
				<span className={`mt-1 px-3 py-1 rounded-full text-xs font-bold ${statusColor[status] ?? ""}`}>
					{t(`status.${status}` as Parameters<typeof t>[0])}
				</span>
			</div>

			{/* Tabs */}
			<div className="flex border-b border-outline-variant mb-6">
				{TABS.map((tabKey) => (
					<button
						key={tabKey}
						type="button"
						onClick={() => setTab(tabKey)}
						className={`px-5 py-3 text-sm font-semibold border-b-2 transition ${
							tab === tabKey
								? "border-[#FF5A30] text-[#FF5A30]"
								: "border-transparent text-on-surface-variant hover:text-on-surface"
						}`}
					>
						{t(`tabs.${tabKey}`)}
					</button>
				))}
			</div>

			{/* Overview Tab */}
			{tab === "overview" && (
				<div className="space-y-6">
					<div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant space-y-3">
						{[
							{ label: t("overview.date"), value: ev.event_date ? new Date(String(ev.event_date)).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : "—" },
							{ label: t("overview.location"), value: [ev.venue, ev.city].filter(Boolean).join(", ") || "—" },
							{ label: t("overview.currency"), value: String(ev.currency ?? "NGN") },
						].map(({ label, value }) => (
							<div key={label} className="flex items-start gap-4">
								<span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant w-32 shrink-0">{label}</span>
								<span className="text-sm">{value}</span>
							</div>
						))}
						<div className="flex items-start gap-4">
							<span className="text-xs font-bold uppercase tracking-wide text-on-surface-variant w-32 shrink-0">
								{t("overview.linkedTour")}
							</span>
							<div className="flex-1">
								{!editingTour ? (
									<div className="flex items-center gap-3">
										<span className="text-sm">
											{tourData
												? `${String(tourData.tour_name ?? tourData.venue)} — ${String(tourData.city)}`
												: t("overview.noTour")}
										</span>
										{status !== "cancelled" && (
											<button
												type="button"
												onClick={() => {
													setSelectedTourId(tourData ? String(tourData.id) : "");
													setEditingTour(true);
												}}
												className="text-xs text-[#FF5A30] font-semibold hover:underline"
											>
												{t("overview.changeTour")}
											</button>
										)}
									</div>
								) : (
									<div className="flex items-center gap-2">
										<select
											className="border border-outline-variant rounded-xl px-3 py-2 text-sm bg-surface focus:outline-none focus:border-[#FF5A30]"
											value={selectedTourId}
											onChange={(e) => setSelectedTourId(e.target.value)}
										>
											<option value="">{t("overview.noTourOption")}</option>
											{linkableTours.map((tour) => (
												<option key={String(tour.id)} value={String(tour.id)}>
													{String(tour.tour_name ?? tour.venue)} — {String(tour.city)}
												</option>
											))}
										</select>
										<button
											type="button"
											disabled={updateTourMutation.isPending}
											onClick={() => updateTourMutation.mutate(selectedTourId || null)}
											className="bg-[#FF5A30] text-white font-bold text-xs px-4 py-2 rounded-xl hover:opacity-90 disabled:opacity-50 transition"
										>
											{updateTourMutation.isPending ? t("tiers.saving") : t("overview.saveTour")}
										</button>
										<button
											type="button"
											onClick={() => setEditingTour(false)}
											className="text-xs text-on-surface-variant hover:underline"
										>
											{t("overview.cancelTourEdit")}
										</button>
									</div>
								)}
							</div>
						</div>
						{!!ev.description && (
							<div className="pt-2 border-t border-outline-variant">
								<p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-1">{t("overview.description")}</p>
								<p className="text-sm text-on-surface-variant">{String(ev.description)}</p>
							</div>
						)}
					</div>

					{status === "published" && (
						<div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant">
							<p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-2">
								{t("overview.shareLink")}
							</p>
							<div className="flex items-center gap-3 flex-wrap">
								<code className="flex-1 min-w-0 text-xs text-on-surface-variant bg-surface-container px-3 py-2 rounded-xl truncate">
									{publicUrl}
								</code>
								<button
									type="button"
									onClick={() => { void handleCopyLink(); }}
									className="shrink-0 flex items-center gap-2 bg-[#FF5A30] text-white font-bold text-xs px-4 py-2 rounded-xl hover:opacity-90 transition"
								>
									<span className="material-symbols-outlined text-sm">
										{linkCopied ? "check" : "content_copy"}
									</span>
									{linkCopied ? t("overview.linkCopied") : t("overview.copyLink")}
								</button>
							</div>
						</div>
					)}

					<div className="flex gap-3">
						{status === "draft" && (
							<button
								type="button"
								disabled={publishMutation.isPending}
								onClick={() => publishMutation.mutate()}
								className="bg-[#FF5A30] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition"
							>
								{publishMutation.isPending ? t("overview.publishing") : t("overview.publish")}
							</button>
						)}
						{status === "published" && (
							<button
								type="button"
								disabled={closeMutation.isPending}
								onClick={() => closeMutation.mutate()}
								className="border border-outline-variant text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-surface-container disabled:opacity-50 transition"
							>
								{closeMutation.isPending ? t("overview.closing") : t("overview.close")}
							</button>
						)}
					</div>

					{publishMutation.data && !publishMutation.data.success && (
						<p className="text-sm text-red-600">{t("overview.publishError")}</p>
					)}
					{closeMutation.data && !closeMutation.data.success && (
						<p className="text-sm text-red-600">{t("overview.closeError")}</p>
					)}
				</div>
			)}

			{/* Tiers Tab */}
			{tab === "tiers" && (
				<div className="space-y-4">
					{tiers.length === 0 && !addingTier && (
						<p className="text-sm text-on-surface-variant py-4">{t("tiers.noTiers")}</p>
					)}

					{tiers.length > 0 && (
						<div className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-outline-variant bg-surface-container">
										{["name", "price", "capacity", "sold", "status"].map((col) => (
											<th key={col} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
												{t(`tiers.${col}`)}
											</th>
										))}
										<th className="px-4 py-3" />
									</tr>
								</thead>
								<tbody>
									{tiers.map((tier) => {
										const tierRaw = tier as Record<string, unknown>;
										return (
											<tr key={String(tierRaw.id)} className="border-b border-outline-variant last:border-0">
												<td className="px-4 py-3 font-semibold">{String(tierRaw.name)}</td>
												<td className="px-4 py-3">₦{Number(tierRaw.price).toLocaleString()}</td>
												<td className="px-4 py-3 text-on-surface-variant">
													{tierRaw.capacity != null ? Number(tierRaw.capacity).toLocaleString() : t("tiers.unlimited")}
												</td>
												<td className="px-4 py-3 font-semibold">{Number(tierRaw.tickets_sold)}</td>
												<td className="px-4 py-3">
													<span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
														tierRaw.status === "active" ? "bg-emerald-100 text-emerald-800" :
														tierRaw.status === "sold_out" ? "bg-red-100 text-red-700" :
														"bg-surface-container text-on-surface-variant"
													}`}>
														{String(tierRaw.status)}
													</span>
												</td>
												<td className="px-4 py-3">
													{Number(tierRaw.tickets_sold) === 0 && (
														<button
															type="button"
															onClick={() => {
																if (window.confirm(t("tiers.deleteConfirm"))) {
																	deleteTierMutation.mutate(String(tierRaw.id));
																}
															}}
															className="text-xs text-red-500 hover:underline"
														>
															{t("tiers.delete")}
														</button>
													)}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}

					{/* Add tier form */}
					{addingTier && (
						<div className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant space-y-3">
							<div className="grid grid-cols-3 gap-3">
								<div>
									<label className="block text-xs font-semibold mb-1">{t("tiers.name")}</label>
									<input
										className="w-full border border-outline-variant rounded-xl px-3 py-2 text-sm bg-surface focus:outline-none focus:border-[#FF5A30]"
										value={newTierName}
										onChange={(e) => setNewTierName(e.target.value)}
									/>
								</div>
								<div>
									<label className="block text-xs font-semibold mb-1">{t("tiers.price")}</label>
									<input
										type="number"
										min="0"
										className="w-full border border-outline-variant rounded-xl px-3 py-2 text-sm bg-surface focus:outline-none focus:border-[#FF5A30]"
										value={newTierPrice}
										onChange={(e) => setNewTierPrice(e.target.value)}
									/>
								</div>
								<div>
									<label className="block text-xs font-semibold mb-1">{t("tiers.capacity")}</label>
									<input
										type="number"
										min="1"
										className="w-full border border-outline-variant rounded-xl px-3 py-2 text-sm bg-surface focus:outline-none focus:border-[#FF5A30]"
										value={newTierCap}
										onChange={(e) => setNewTierCap(e.target.value)}
									/>
								</div>
							</div>
							<div className="flex gap-2 justify-end">
								<button type="button" onClick={() => setAddingTier(false)} className="text-sm text-on-surface-variant hover:underline">
									Cancel
								</button>
								<button
									type="button"
									disabled={!newTierName || !newTierPrice || addTierMutation.isPending}
									onClick={() => addTierMutation.mutate()}
									className="bg-[#FF5A30] text-white font-bold text-xs px-4 py-2 rounded-xl hover:opacity-90 disabled:opacity-50 transition"
								>
									{addTierMutation.isPending ? t("tiers.saving") : t("tiers.add")}
								</button>
							</div>
						</div>
					)}

					{!addingTier && status !== "cancelled" && status !== "closed" && (
						<button
							type="button"
							onClick={() => setAddingTier(true)}
							className="w-full border-2 border-dashed border-outline-variant rounded-xl py-3 text-sm font-semibold text-on-surface-variant hover:border-[#FF5A30] hover:text-[#FF5A30] transition"
						>
							+ {t("tiers.add")}
						</button>
					)}
				</div>
			)}

			{/* Buyers Tab */}
			{tab === "buyers" && (
				<div>
					{purchasesQuery.isLoading && (
						<div className="flex justify-center py-8">
							<div className="w-5 h-5 border-2 border-[#FF5A30] border-t-transparent rounded-full animate-spin" />
						</div>
					)}
					{!purchasesQuery.isLoading && purchases.length === 0 && (
						<p className="text-sm text-on-surface-variant py-6">{t("buyers.noBuyers")}</p>
					)}
					{purchases.length > 0 && (
						<div className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-outline-variant bg-surface-container">
										{["name", "email", "phone", "tier", "qty", "amount", "code", "paid"].map((col) => (
											<th key={col} className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wide text-on-surface-variant">
												{t(`buyers.${col}`)}
											</th>
										))}
									</tr>
								</thead>
								<tbody>
									{purchases.map((p) => {
										const pur = p as Record<string, unknown>;
										const tierData = pur.tier as Record<string, unknown> | null | undefined;
										return (
											<tr key={String(pur.id)} className="border-b border-outline-variant last:border-0">
												<td className="px-4 py-3 font-semibold">{String(pur.buyer_name)}</td>
												<td className="px-4 py-3 text-on-surface-variant">{String(pur.buyer_email)}</td>
												<td className="px-4 py-3 text-on-surface-variant">{pur.buyer_phone ? String(pur.buyer_phone) : "—"}</td>
												<td className="px-4 py-3">{tierData?.name ? String(tierData.name) : "—"}</td>
												<td className="px-4 py-3">{Number(pur.quantity)}</td>
												<td className="px-4 py-3 font-semibold">₦{Number(pur.total_amount).toLocaleString()}</td>
												<td className="px-4 py-3 font-mono text-xs">{String(pur.ticket_code)}</td>
												<td className="px-4 py-3 text-on-surface-variant">
													{pur.paid_at ? new Date(String(pur.paid_at)).toLocaleDateString() : "—"}
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
