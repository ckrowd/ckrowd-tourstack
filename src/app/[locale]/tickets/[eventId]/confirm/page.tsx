"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { verifyTicketPayment } from "@/app/actions";

export default function TicketConfirmPage() {
	const t = useTranslations("TicketConfirmPage");
	const { locale, eventId } = useParams<{ locale: string; eventId: string }>();
	const searchParams = useSearchParams();
	const router = useRouter();
	const reference = searchParams.get("reference") ?? "";

	const { data: result, isLoading } = useQuery({
		queryKey: ["verifyTicket", reference],
		queryFn: () => verifyTicketPayment(reference),
		enabled: reference.length > 0,
		retry: 1,
	});

	// Cleanup: nothing special needed since we're not using blob URLs here

	if (!reference) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-sm text-gray-500">{t("failed")}</p>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center space-y-4">
					<div className="w-10 h-10 border-2 border-[#FF5A30] border-t-transparent rounded-full animate-spin mx-auto" />
					<p className="text-sm text-gray-600">{t("verifying")}</p>
				</div>
			</div>
		);
	}

	const purchase = result?.data as Record<string, unknown> | null | undefined;
	const success = result?.success && purchase;
	const ev = purchase?.event as Record<string, unknown> | null | undefined;
	const tier = purchase?.tier as Record<string, unknown> | null | undefined;

	const fmtAmount = (n: number, currency: string) =>
		new Intl.NumberFormat("en-NG", { style: "currency", currency: currency || "NGN" }).format(n);

	if (!success) {
		return (
			<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center py-10 px-4">
				<div className="max-w-md w-full bg-white rounded-2xl p-8 shadow-sm text-center space-y-4">
					<div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
						<span className="text-red-500 text-3xl font-black">✕</span>
					</div>
					<h1 className="text-xl font-black text-gray-900">{t("failed")}</h1>
					<p className="text-sm text-gray-600">{t("failedNote")}</p>
					<button
						type="button"
						onClick={() => router.push(`/${locale}/tickets/${eventId}`)}
						className="w-full bg-[#FF5A30] text-white font-bold text-sm py-3 rounded-xl hover:opacity-90 transition"
					>
						{t("retry")}
					</button>
				</div>
			</div>
		);
	}

	const currency = ev?.currency ? String(ev.currency) : "NGN";

	return (
		<div className="min-h-screen bg-[#f7f9fb] flex items-center justify-center py-10 px-4">
			<div className="max-w-md w-full space-y-5">
				{/* Success card */}
				<div className="bg-white rounded-2xl p-8 shadow-sm text-center">
					<div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
						<span className="text-emerald-500 text-3xl font-black">✓</span>
					</div>
					<p className="text-xs font-black uppercase tracking-widest text-[#FF5A30] mb-2">TourStack by CKrowd</p>
					<h1 className="text-2xl font-black text-gray-900 mb-2">{t("success")}</h1>
					<p className="text-sm text-gray-600">{t("successNote")}</p>
				</div>

				{/* Ticket details */}
				<div className="bg-white rounded-2xl p-6 shadow-sm space-y-4">
					{/* Ticket code */}
					<div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
						<p className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-1">{t("ticketCode")}</p>
						<p className="text-xl font-black tracking-wider text-[#FF5A30] font-mono">
							{String(purchase?.ticket_code ?? "")}
						</p>
					</div>

					{[
						{ label: t("event"), value: ev?.title ? String(ev.title) : "—" },
						{ label: t("tier"), value: tier?.name ? String(tier.name) : "—" },
						{ label: t("qty"), value: String(purchase?.quantity ?? 1) },
						{
							label: t("amount"),
							value: purchase?.total_amount != null ? fmtAmount(Number(purchase.total_amount), currency) : "—",
						},
					].map(({ label, value }) => (
						<div key={label} className="flex items-center justify-between">
							<span className="text-sm text-gray-500">{label}</span>
							<span className="text-sm font-semibold">{value}</span>
						</div>
					))}
				</div>

				<button
					type="button"
					onClick={() => router.push(`/${locale}`)}
					className="w-full border border-gray-200 text-gray-700 font-semibold text-sm py-3 rounded-xl hover:bg-gray-50 transition"
				>
					{t("backToHome")}
				</button>
			</div>
		</div>
	);
}
