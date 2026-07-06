"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import Link from "next/link";
import { checkTicketByCode } from "@/app/actions";

export default function TicketCheckPage() {
	const t = useTranslations("TicketCheckPage");
	const { code, locale } = useParams<{ code: string; locale: string }>();

	const { data: result, isLoading } = useQuery({
		queryKey: ["ticketCheck", code],
		queryFn: () => checkTicketByCode(code),
		enabled: !!code,
		retry: false,
	});

	const ticket = result?.data as Record<string, unknown> | null | undefined;
	const found = result?.success && ticket;
	const isValid = !!ticket?.isValid;

	const eventDate = ticket?.eventDate
		? new Date(String(ticket.eventDate)).toLocaleDateString("en-US", {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			})
		: null;
	const location = [ticket?.venue, ticket?.city].filter(Boolean).join(", ") || null;

	const statusLabel = () => {
		const s = String(ticket?.status ?? "");
		if (s === "success") return t("statusConfirmed");
		if (s === "pending") return t("statusPending");
		return t("statusFailed");
	};

	return (
		<div className="min-h-screen bg-[#f0f2f5] flex flex-col">
			{/* Header */}
			<header className="bg-white border-b border-gray-100">
				<div className="max-w-lg mx-auto px-4 h-14 flex items-center gap-2.5">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/ckrowd-logo.png" alt="TourStack" className="h-7 w-7 object-contain" />
					<span className="font-bold text-[16px] text-gray-900 tracking-tight">TourStack</span>
					<span className="text-[10px] uppercase tracking-widest text-gray-400 mt-0.5">Ticket Verify</span>
				</div>
			</header>

			<div className="flex-1 flex items-center justify-center px-4 py-10">
				<div className="w-full max-w-sm space-y-4">
					{isLoading ? (
						<div className="bg-white rounded-2xl p-10 shadow-sm flex flex-col items-center gap-4">
							<div className="w-10 h-10 border-2 border-[#FF5A2E] border-t-transparent rounded-full animate-spin" />
							<p className="text-sm text-gray-500">Checking ticket…</p>
						</div>
					) : !found ? (
						<div className="bg-white rounded-2xl p-8 shadow-sm text-center space-y-3">
							<div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
								<svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
									<circle cx="12" cy="12" r="10" />
									<path d="M12 8v4M12 16h.01" />
								</svg>
							</div>
							<h1 className="text-xl font-black text-gray-900">{t("notFound")}</h1>
							<p className="text-sm text-gray-500">{t("notFoundNote")}</p>
						</div>
					) : (
						<>
							{/* Status banner */}
							<div className={`rounded-2xl p-6 text-center shadow-sm ${isValid ? "bg-emerald-500" : "bg-red-500"}`}>
								<div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
									{isValid ? (
										<svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
											<path d="m5 12 5 5 9-9" />
										</svg>
									) : (
										<svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
											<path d="M18 6 6 18M6 6l12 12" />
										</svg>
									)}
								</div>
								<h1 className="text-2xl font-black text-white">
									{isValid ? t("valid") : t("invalid")}
								</h1>
								<p className="text-sm text-white/80 mt-1">
									{isValid ? t("validNote") : t("invalidNote")}
								</p>
							</div>

							{/* Ticket details */}
							<div className="bg-white rounded-2xl shadow-sm overflow-hidden">
								<div className="bg-gray-900 px-5 py-4">
									<p className="text-[10px] font-black uppercase tracking-[.2em] text-[#FF5A2E] mb-0.5">
										{t("event")}
									</p>
									<p className="text-base font-black text-white leading-snug">
										{String(ticket?.eventTitle ?? "—")}
									</p>
								</div>
								<div className="divide-y divide-gray-100">
									{[
										{ label: t("date"), value: eventDate ?? t("dateTBC") },
										{ label: t("location"), value: location ?? t("locationTBC") },
										{ label: t("holder"), value: String(ticket?.buyerName ?? "—") },
										{ label: t("tier"), value: String(ticket?.tierName ?? "—") },
										{ label: t("qty"), value: `× ${String(ticket?.quantity ?? 1)}` },
										{ label: t("status"), value: statusLabel() },
									].map(({ label, value }) => (
										<div key={label} className="flex items-center justify-between px-5 py-3">
											<span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</span>
											<span className="text-sm font-bold text-gray-900 text-right max-w-[60%]">{value}</span>
										</div>
									))}
								</div>
								{/* Ticket code */}
								<div className="bg-orange-50 border-t border-orange-100 px-5 py-4 text-center">
									<p className="text-[10px] font-bold uppercase tracking-[.18em] text-orange-600 mb-1">
										Ticket Code
									</p>
									<p className="font-mono font-black text-[#FF5A2E] text-sm tracking-wider break-all">
										{String(ticket?.ticketCode ?? code)}
									</p>
								</div>
							</div>
						</>
					)}

					<Link
						href={`/${locale}`}
						className="block text-center text-xs text-gray-400 hover:text-gray-600 transition py-2"
					>
						Powered by TourStack by CKrowd
					</Link>
				</div>
			</div>
		</div>
	);
}
