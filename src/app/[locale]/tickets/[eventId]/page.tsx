"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { getPublicTicketEvent, initiateTicketPurchase } from "@/app/actions";

export default function PublicTicketPage() {
	const t = useTranslations("PublicTicketPage");
	const { eventId } = useParams<{ eventId: string }>();

	const [selectedTierId, setSelectedTierId] = useState<string | null>(null);
	const [quantity, setQuantity] = useState(1);
	const [buyerName, setBuyerName] = useState("");
	const [buyerEmail, setBuyerEmail] = useState("");
	const [buyerPhone, setBuyerPhone] = useState("");

	const { data: result, isLoading } = useQuery({
		queryKey: ["publicTicketEvent", eventId],
		queryFn: () => getPublicTicketEvent(eventId),
	});

	const purchaseMutation = useMutation({
		mutationFn: () =>
			initiateTicketPurchase({
				eventId,
				tierId: selectedTierId!,
				buyerName,
				buyerEmail,
				buyerPhone: buyerPhone || undefined,
				quantity,
			}),
		onSuccess: (res) => {
			if (res.success && res.data) {
				const data = res.data as Record<string, unknown>;
				if (data.authorizationUrl) {
					window.location.href = String(data.authorizationUrl);
				}
			}
		},
	});

	const ev = result?.data as Record<string, unknown> | null | undefined;
	const tiers = (ev?.tiers as Record<string, unknown>[]) ?? [];
	const promoter = ev?.promoter as Record<string, unknown> | null | undefined;
	const selectedTier = tiers.find((t) => String((t as Record<string, unknown>).id) === selectedTierId) as Record<string, unknown> | undefined;
	const subtotal = selectedTier ? Number(selectedTier.price) * quantity : 0;
	const currency = String(ev?.currency ?? "NGN");

	const fmtAmount = (n: number) =>
		new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(n);

	const eventDate = ev?.event_date ? new Date(String(ev.event_date)) : null;
	const location = [ev?.venue, ev?.city].filter(Boolean).join(", ");

	const canSubmit =
		selectedTierId !== null &&
		buyerName.trim().length > 0 &&
		buyerEmail.trim().includes("@") &&
		quantity >= 1;

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="w-8 h-8 border-2 border-[#FF5A30] border-t-transparent rounded-full animate-spin" />
			</div>
		);
	}

	if (!ev || !result?.success) {
		return (
			<div className="min-h-screen flex items-center justify-center text-on-surface-variant text-sm">
				{t("noEvent")}
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#f7f9fb] py-10 px-4">
			<div className="max-w-2xl mx-auto space-y-6">
				{/* Event header */}
				<div className="bg-white rounded-2xl p-6 shadow-sm">
					<p className="text-xs font-black uppercase tracking-widest text-[#FF5A30] mb-2">TourStack by CKrowd</p>
					<h1 className="text-2xl font-black text-gray-900 mb-3">{String(ev.title)}</h1>
					<div className="space-y-1 text-sm text-gray-600">
						<p>
							<span className="font-semibold text-gray-900">{t("date")}: </span>
							{eventDate
								? eventDate.toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
								: t("dateTBC")}
						</p>
						<p>
							<span className="font-semibold text-gray-900">{t("location")}: </span>
							{location || t("locationTBC")}
						</p>
						{promoter && (
							<p>
								<span className="font-semibold text-gray-900">{t("by")}: </span>
								{String(promoter.trading_name ?? promoter.company_name ?? "")}
							</p>
						)}
					</div>
					{!!ev.description && (
						<p className="text-sm text-gray-600 mt-3 pt-3 border-t border-gray-100">{String(ev.description)}</p>
					)}
				</div>

				{/* Tier selection */}
				<div className="bg-white rounded-2xl p-6 shadow-sm">
					<h2 className="text-base font-bold text-gray-900 mb-4">{t("selectTier")}</h2>
					<div className="space-y-3">
						{tiers.map((tier) => {
							const tr = tier as Record<string, unknown>;
							const tierId = String(tr.id);
							const isSoldOut = tr.status === "sold_out" || (tr.available !== null && Number(tr.available) === 0);
							const isSelected = selectedTierId === tierId;
							return (
								<button
									key={tierId}
									type="button"
									disabled={isSoldOut}
									onClick={() => {
										setSelectedTierId(tierId);
										setQuantity(1);
									}}
									className={`w-full flex items-center justify-between rounded-xl p-4 border-2 transition text-left ${
										isSelected
											? "border-[#FF5A30] bg-orange-50"
											: isSoldOut
												? "border-gray-200 opacity-50 cursor-not-allowed"
												: "border-gray-200 hover:border-[#FF5A30]/50"
									}`}
								>
									<div>
										<p className="font-bold text-gray-900 text-sm">{String(tr.name)}</p>
										{tr.available !== null && !isSoldOut && (
											<p className="text-xs text-gray-500 mt-0.5">{Number(tr.available)} {t("available")}</p>
										)}
										{isSoldOut && (
											<p className="text-xs text-red-500 mt-0.5 font-semibold">{t("soldOut")}</p>
										)}
									</div>
									<span className="font-black text-base text-gray-900">
										{Number(tr.price) === 0 ? "FREE" : fmtAmount(Number(tr.price))}
									</span>
								</button>
							);
						})}
					</div>

					{selectedTier && (
						<div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
							<label className="text-sm font-semibold text-gray-900">{t("qty")}</label>
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={() => setQuantity((q) => Math.max(1, q - 1))}
									className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center font-bold text-gray-700 hover:border-[#FF5A30]"
								>
									−
								</button>
								<span className="w-8 text-center font-bold">{quantity}</span>
								<button
									type="button"
									onClick={() => {
										const avail = selectedTier.available !== null ? Number(selectedTier.available) : 10;
										setQuantity((q) => Math.min(10, avail, q + 1));
									}}
									className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center font-bold text-gray-700 hover:border-[#FF5A30]"
								>
									+
								</button>
							</div>
							<div className="ml-auto">
								<span className="text-xs text-gray-500 mr-1">{t("subtotal")}</span>
								<span className="font-black text-[#FF5A30]">{fmtAmount(subtotal)}</span>
							</div>
						</div>
					)}
				</div>

				{/* Buyer details */}
				<div className="bg-white rounded-2xl p-6 shadow-sm">
					<h2 className="text-base font-bold text-gray-900 mb-4">{t("buyerDetails")}</h2>
					<div className="space-y-4">
						<div>
							<label className="block text-sm font-semibold mb-1">{t("name")}</label>
							<input
								className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A30]"
								placeholder={t("namePlaceholder")}
								value={buyerName}
								onChange={(e) => setBuyerName(e.target.value)}
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold mb-1">{t("email")}</label>
							<input
								type="email"
								className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A30]"
								placeholder={t("emailPlaceholder")}
								value={buyerEmail}
								onChange={(e) => setBuyerEmail(e.target.value)}
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold mb-1">{t("phone")}</label>
							<input
								type="tel"
								className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A30]"
								placeholder={t("phonePlaceholder")}
								value={buyerPhone}
								onChange={(e) => setBuyerPhone(e.target.value)}
							/>
						</div>
					</div>
				</div>

				<p className="text-xs text-gray-400 text-center">{t("platformNote")}</p>

				{purchaseMutation.data && !purchaseMutation.data.success && (
					<p className="text-sm text-red-600 text-center">{purchaseMutation.data.error ?? "Something went wrong."}</p>
				)}

				<button
					type="button"
					disabled={!canSubmit || purchaseMutation.isPending}
					onClick={() => purchaseMutation.mutate()}
					className="w-full bg-[#FF5A30] text-white font-black text-base py-4 rounded-2xl hover:opacity-90 disabled:opacity-40 transition shadow-sm"
				>
					{purchaseMutation.isPending ? t("processing") : t("checkout")}
				</button>
			</div>
		</div>
	);
}
