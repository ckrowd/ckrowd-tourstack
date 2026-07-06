"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getPublicTicketEvent, initiateTicketPurchase } from "@/app/actions";

function TicketHeader({ locale }: { locale: string }) {
	return (
		<header className="w-full bg-white border-b border-gray-100 sticky top-0 z-40">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
				<Link href={`/${locale}`} className="flex items-center gap-2.5">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/ckrowd-logo.png" alt="TourStack" className="h-8 w-8 object-contain" />
					<span className="flex flex-col leading-none">
						<span className="font-bold text-[17px] tracking-tight text-gray-900">TourStack</span>
						<span className="text-[10px] tracking-[.14em] uppercase text-gray-400 mt-0.5">by CKrowd</span>
					</span>
				</Link>
				<Link
					href={`/${locale}/login`}
					className="text-sm font-semibold text-gray-600 hover:text-gray-900 transition-colors"
				>
					Sign in
				</Link>
			</div>
		</header>
	);
}

function CalendarIcon() {
	return (
		<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
			<rect x="3" y="4" width="18" height="18" rx="2" />
			<path d="M16 2v4M8 2v4M3 10h18" />
		</svg>
	);
}

function PinIcon() {
	return (
		<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
			<path d="M12 22s-8-6.686-8-12a8 8 0 1 1 16 0c0 5.314-8 12-8 12Z" />
			<circle cx="12" cy="10" r="2.5" />
		</svg>
	);
}

function UserIcon() {
	return (
		<svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
			<circle cx="12" cy="8" r="4" />
			<path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
		</svg>
	);
}

export default function PublicTicketPage() {
	const t = useTranslations("PublicTicketPage");
	const { eventId, locale } = useParams<{ eventId: string; locale: string }>();

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
	const selectedTier = tiers.find(
		(t) => String((t as Record<string, unknown>).id) === selectedTierId,
	) as Record<string, unknown> | undefined;
	const subtotal = selectedTier ? Number(selectedTier.price) * quantity : 0;
	const currency = String(ev?.currency ?? "NGN");

	const fmtAmount = (n: number) =>
		new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(n);

	const eventDate = ev?.event_date ? new Date(String(ev.event_date)) : null;
	const location = [ev?.venue, ev?.city].filter(Boolean).join(", ");
	const promoterName = promoter
		? String(promoter.trading_name ?? promoter.company_name ?? "")
		: null;

	const canSubmit =
		selectedTierId !== null &&
		buyerName.trim().length > 0 &&
		buyerEmail.trim().includes("@") &&
		quantity >= 1;

	if (isLoading) {
		return (
			<div className="min-h-screen flex flex-col">
				<TicketHeader locale={locale} />
				<div className="flex-1 flex items-center justify-center">
					<div className="w-8 h-8 border-2 border-[#FF5A2E] border-t-transparent rounded-full animate-spin" />
				</div>
			</div>
		);
	}

	if (!ev || !result?.success) {
		return (
			<div className="min-h-screen flex flex-col">
				<TicketHeader locale={locale} />
				<div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
					{t("noEvent")}
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-[#f7f9fb] flex flex-col">
			<TicketHeader locale={locale} />

			{/* Hero band */}
			<div className="bg-gradient-to-br from-[#1a1a1a] to-[#2d1810] text-white">
				<div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
					<p className="text-xs font-black uppercase tracking-widest text-[#FF5A2E] mb-3">
						TourStack Tickets
					</p>
					<h1 className="text-3xl sm:text-4xl font-black leading-tight mb-5">
						{String(ev.title)}
					</h1>
					<div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-300">
						{eventDate && (
							<span className="flex items-center gap-1.5">
								<CalendarIcon />
								{eventDate.toLocaleDateString("en-US", {
									weekday: "long",
									year: "numeric",
									month: "long",
									day: "numeric",
								})}
							</span>
						)}
						{location && (
							<span className="flex items-center gap-1.5">
								<PinIcon />
								{location}
							</span>
						)}
						{promoterName && (
							<span className="flex items-center gap-1.5">
								<UserIcon />
								{t("by")} {promoterName}
							</span>
						)}
					</div>
					{!!ev.description && (
						<p className="text-sm text-gray-400 mt-4 max-w-2xl leading-relaxed">
							{String(ev.description)}
						</p>
					)}
				</div>
			</div>

			{/* Content */}
			<div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full flex-1">
				<div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
					{/* Left — tier selection */}
					<div className="lg:col-span-3 space-y-4">
						<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
							<div className="px-6 pt-5 pb-4 border-b border-gray-100">
								<h2 className="text-base font-bold text-gray-900">{t("selectTier")}</h2>
							</div>
							<div className="p-4 space-y-3">
								{tiers.map((tier) => {
									const tr = tier as Record<string, unknown>;
									const tierId = String(tr.id);
									const isSoldOut =
										tr.status === "sold_out" ||
										(tr.available !== null && Number(tr.available) === 0);
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
											className={`w-full flex items-center justify-between rounded-xl px-4 py-4 border-2 transition text-left group ${
												isSelected
													? "border-[#FF5A2E] bg-orange-50"
													: isSoldOut
														? "border-gray-100 bg-gray-50 opacity-60 cursor-not-allowed"
														: "border-gray-200 hover:border-[#FF5A2E]/60 hover:bg-orange-50/30"
											}`}
										>
											<div>
												<p className="font-bold text-gray-900 text-sm">{String(tr.name)}</p>
												{tr.available !== null && !isSoldOut && (
													<p className="text-xs text-gray-400 mt-0.5">
														{Number(tr.available)} {t("available")}
													</p>
												)}
												{isSoldOut && (
													<p className="text-xs font-semibold text-red-400 mt-0.5">
														{t("soldOut")}
													</p>
												)}
											</div>
											<div className="flex items-center gap-3">
												<span className="font-black text-lg text-gray-900">
													{Number(tr.price) === 0 ? "FREE" : fmtAmount(Number(tr.price))}
												</span>
												{isSelected && (
													<div className="w-5 h-5 rounded-full bg-[#FF5A2E] flex items-center justify-center shrink-0">
														<svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
															<path d="m5 12 5 5 9-9" />
														</svg>
													</div>
												)}
											</div>
										</button>
									);
								})}
							</div>

							{selectedTier && (
								<div className="mx-4 mb-4 p-4 bg-gray-50 rounded-xl flex items-center gap-4">
									<label className="text-sm font-semibold text-gray-700 shrink-0">
										{t("qty")}
									</label>
									<div className="flex items-center gap-2">
										<button
											type="button"
											onClick={() => setQuantity((q) => Math.max(1, q - 1))}
											className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center font-bold text-gray-600 hover:border-[#FF5A2E] hover:text-[#FF5A2E] transition"
										>
											−
										</button>
										<span className="w-8 text-center font-black text-gray-900">{quantity}</span>
										<button
											type="button"
											onClick={() => {
												const avail =
													selectedTier.available !== null
														? Number(selectedTier.available)
														: 10;
												setQuantity((q) => Math.min(10, avail, q + 1));
											}}
											className="w-8 h-8 rounded-full border border-gray-200 bg-white flex items-center justify-center font-bold text-gray-600 hover:border-[#FF5A2E] hover:text-[#FF5A2E] transition"
										>
											+
										</button>
									</div>
									<div className="ml-auto text-right">
										<p className="text-xs text-gray-400">{t("subtotal")}</p>
										<p className="font-black text-[#FF5A2E] text-lg">{fmtAmount(subtotal)}</p>
									</div>
								</div>
							)}
						</div>

						{/* Buyer details */}
						<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
							<div className="px-6 pt-5 pb-4 border-b border-gray-100">
								<h2 className="text-base font-bold text-gray-900">{t("buyerDetails")}</h2>
							</div>
							<div className="p-6 space-y-4">
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-1.5">
										{t("name")} <span className="text-[#FF5A2E]">*</span>
									</label>
									<input
										className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A2E] transition bg-white"
										placeholder={t("namePlaceholder")}
										value={buyerName}
										onChange={(e) => setBuyerName(e.target.value)}
									/>
								</div>
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-1.5">
										{t("email")} <span className="text-[#FF5A2E]">*</span>
									</label>
									<input
										type="email"
										className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A2E] transition bg-white"
										placeholder={t("emailPlaceholder")}
										value={buyerEmail}
										onChange={(e) => setBuyerEmail(e.target.value)}
									/>
								</div>
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-1.5">
										{t("phone")}
									</label>
									<input
										type="tel"
										className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#FF5A2E] transition bg-white"
										placeholder={t("phonePlaceholder")}
										value={buyerPhone}
										onChange={(e) => setBuyerPhone(e.target.value)}
									/>
								</div>
							</div>
						</div>
					</div>

					{/* Right — order summary + checkout */}
					<div className="lg:col-span-2 space-y-4 lg:sticky lg:top-24">
						<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
							<div className="px-6 pt-5 pb-4 border-b border-gray-100">
								<h2 className="text-base font-bold text-gray-900">Order Summary</h2>
							</div>
							<div className="p-6 space-y-4">
								{selectedTier ? (
									<>
										<div className="flex items-start justify-between gap-3">
											<div>
												<p className="text-sm font-semibold text-gray-900">
													{String(selectedTier.name)}
												</p>
												<p className="text-xs text-gray-400 mt-0.5">× {quantity}</p>
											</div>
											<p className="text-sm font-bold text-gray-900 shrink-0">
												{fmtAmount(subtotal)}
											</p>
										</div>
										<div className="border-t border-gray-100 pt-3 flex items-center justify-between">
											<p className="text-sm font-bold text-gray-900">Total</p>
											<p className="text-xl font-black text-[#FF5A2E]">{fmtAmount(subtotal)}</p>
										</div>
									</>
								) : (
									<p className="text-sm text-gray-400">Select a ticket tier to continue.</p>
								)}

								{purchaseMutation.data && !purchaseMutation.data.success && (
									<p className="text-sm text-red-500 bg-red-50 rounded-lg p-3">
										{purchaseMutation.data.error ?? "Something went wrong."}
									</p>
								)}

								<button
									type="button"
									disabled={!canSubmit || purchaseMutation.isPending}
									onClick={() => purchaseMutation.mutate()}
									className="w-full bg-[#FF5A2E] text-white font-black text-sm py-4 rounded-xl hover:opacity-90 disabled:opacity-40 transition shadow-sm"
								>
									{purchaseMutation.isPending ? t("processing") : t("checkout")}
								</button>

								<p className="text-[11px] text-gray-400 text-center leading-relaxed">
									{t("platformNote")}
								</p>
							</div>
						</div>

						{/* Event details recap */}
						<div className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
							<p className="text-xs font-bold uppercase tracking-widest text-gray-400">Event</p>
							<p className="font-bold text-gray-900 text-sm">{String(ev.title)}</p>
							{eventDate && (
								<p className="text-xs text-gray-500 flex items-center gap-1.5">
									<CalendarIcon />
									{eventDate.toLocaleDateString("en-US", {
										weekday: "short",
										month: "short",
										day: "numeric",
										year: "numeric",
									})}
								</p>
							)}
							{location && (
								<p className="text-xs text-gray-500 flex items-center gap-1.5">
									<PinIcon />
									{location}
								</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
