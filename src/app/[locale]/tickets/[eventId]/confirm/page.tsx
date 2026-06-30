"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { verifyTicketPayment } from "@/app/actions";

function TicketHeader({ locale }: { locale: string }) {
	return (
		<header className="w-full bg-white border-b border-gray-100">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center">
				<Link href={`/${locale}`} className="flex items-center gap-2.5">
					{/* eslint-disable-next-line @next/next/no-img-element */}
					<img src="/ckrowd-logo.png" alt="TourStack" className="h-8 w-8 object-contain" />
					<span className="flex flex-col leading-none">
						<span className="font-bold text-[17px] tracking-tight text-gray-900">TourStack</span>
						<span className="text-[10px] tracking-[.14em] uppercase text-gray-400 mt-0.5">by CKrowd</span>
					</span>
				</Link>
			</div>
		</header>
	);
}

interface TicketCardProps {
	eventTitle: string;
	eventDate: string;
	eventLocation: string;
	tierName: string;
	quantity: number;
	totalAmount: string;
	buyerName: string;
	ticketCode: string;
	qrDataUrl: string | null;
}

function TicketCard({
	eventTitle,
	eventDate,
	eventLocation,
	tierName,
	quantity,
	totalAmount,
	buyerName,
	ticketCode,
	qrDataUrl,
}: TicketCardProps) {
	return (
		<div className="w-full max-w-sm mx-auto rounded-2xl overflow-hidden shadow-xl border border-gray-100">
			<div className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#1a1a2e] px-6 pt-6 pb-5">
				<div className="flex items-start justify-between mb-5">
					<div>
						<p className="text-[10px] font-black uppercase tracking-[.2em] text-[#FF5A30]">TourStack</p>
						<p className="text-[9px] uppercase tracking-[.14em] text-slate-500 mt-0.5">by CKrowd</p>
					</div>
					<span className="bg-[#FF5A30] text-white text-[9px] font-black tracking-[.15em] uppercase px-2.5 py-1.5 rounded-md">
						ADMIT ONE
					</span>
				</div>
				<h2 className="text-[19px] font-black text-white leading-tight mb-4">{eventTitle}</h2>
				<div className="grid grid-cols-2 gap-3">
					<div>
						<p className="text-[9px] text-slate-500 uppercase tracking-[.12em] mb-0.5">Date</p>
						<p className="text-xs font-semibold text-slate-200 leading-tight">{eventDate || "Date TBC"}</p>
					</div>
					<div>
						<p className="text-[9px] text-slate-500 uppercase tracking-[.12em] mb-0.5">Location</p>
						<p className="text-xs font-semibold text-slate-200 leading-tight">{eventLocation || "Venue TBC"}</p>
					</div>
				</div>
			</div>

			<div className="flex items-center bg-white">
				<div className="w-5 h-5 -ml-2.5 rounded-full bg-[#f7f9fb] shrink-0" />
				<div className="flex-1 border-t-2 border-dashed border-slate-200 mx-1.5" />
				<div className="w-5 h-5 -mr-2.5 rounded-full bg-[#f7f9fb] shrink-0" />
			</div>

			<div className="bg-white px-6 py-5 space-y-4">
				<div className="grid grid-cols-2 gap-x-5 gap-y-3 pb-4 border-b border-slate-100">
					<div>
						<p className="text-[9px] text-slate-400 uppercase tracking-[.12em] mb-0.5">Ticket Type</p>
						<p className="text-sm font-bold text-slate-900">{tierName}</p>
					</div>
					<div>
						<p className="text-[9px] text-slate-400 uppercase tracking-[.12em] mb-0.5">Quantity</p>
						<p className="text-sm font-bold text-slate-900">× {quantity}</p>
					</div>
					<div>
						<p className="text-[9px] text-slate-400 uppercase tracking-[.12em] mb-0.5">Amount Paid</p>
						<p className="text-sm font-black text-[#FF5A30]">{totalAmount}</p>
					</div>
					<div>
						<p className="text-[9px] text-slate-400 uppercase tracking-[.12em] mb-0.5">Ticket Holder</p>
						<p className="text-sm font-semibold text-slate-900">{buyerName}</p>
					</div>
				</div>

				<div className="border border-orange-200 rounded-xl p-4 bg-orange-50 flex items-center gap-4">
					<div className="shrink-0">
						{qrDataUrl ? (
							// eslint-disable-next-line @next/next/no-img-element
							<img src={qrDataUrl} alt="Scan to verify" width={80} height={80} className="rounded-lg" />
						) : (
							<div className="w-20 h-20 bg-orange-100 rounded-lg animate-pulse" />
						)}
					</div>
					<div className="min-w-0">
						<p className="text-[9px] font-bold uppercase tracking-[.16em] text-orange-700 mb-1">Ticket Code</p>
						<p className="font-mono font-black text-[#FF5A30] text-[13px] leading-snug break-all">{ticketCode}</p>
						<p className="text-[9px] text-orange-600 mt-1">Scan QR to verify</p>
					</div>
				</div>
			</div>

			<div className="bg-slate-50 border-t border-slate-100 px-6 py-2.5 flex items-center justify-between">
				<p className="text-[9px] text-slate-400">Present at venue entrance</p>
				<p className="text-[9px] font-black text-[#FF5A30] tracking-widest">TOURSTACK</p>
			</div>
		</div>
	);
}

// ── Canvas-based ticket image renderer ────────────────────────────────────────
// Uses Canvas 2D API directly to avoid html2canvas incompatibility with
// Tailwind v4's oklch/lab CSS color functions.
async function renderTicketToCanvas(data: TicketCardProps & { qrDataUrl: string }): Promise<Blob | null> {
	const SCALE = 2;
	const W = 340;
	const HEADER_H = 195;
	const TEAR_H = 24;
	const GRID_H = 120;
	const QR_H = 104;
	const FOOTER_H = 40;
	const TOTAL_H = HEADER_H + TEAR_H + GRID_H + QR_H + FOOTER_H;

	const canvas = document.createElement("canvas");
	canvas.width = W * SCALE;
	canvas.height = TOTAL_H * SCALE;
	const rawCtx = canvas.getContext("2d");
	if (!rawCtx) return null;
	const ctx: CanvasRenderingContext2D = rawCtx;
	ctx.scale(SCALE, SCALE);

	function rr(x: number, y: number, w: number, h: number, r: number) {
		ctx.beginPath();
		ctx.moveTo(x + r, y);
		ctx.lineTo(x + w - r, y);
		ctx.arcTo(x + w, y, x + w, y + r, r);
		ctx.lineTo(x + w, y + h - r);
		ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
		ctx.lineTo(x + r, y + h);
		ctx.arcTo(x, y + h, x, y + h - r, r);
		ctx.lineTo(x, y + r);
		ctx.arcTo(x, y, x + r, y, r);
		ctx.closePath();
	}

	function fit(text: string, maxW: number): string {
		if (ctx.measureText(text).width <= maxW) return text;
		let t = text;
		while (t.length > 0 && ctx.measureText(`${t}…`).width > maxW) t = t.slice(0, -1);
		return `${t}…`;
	}

	// Clip card to rounded rect
	rr(0, 0, W, TOTAL_H, 14);
	ctx.clip();

	// ── HEADER ──────────────────────────────────────────────────────────────
	const hGrad = ctx.createLinearGradient(0, 0, W, HEADER_H);
	hGrad.addColorStop(0, "#0f172a");
	hGrad.addColorStop(0.6, "#1e293b");
	hGrad.addColorStop(1, "#1a1a2e");
	ctx.fillStyle = hGrad;
	ctx.fillRect(0, 0, W, HEADER_H);

	// TourStack
	ctx.font = "800 10px Arial,sans-serif";
	ctx.fillStyle = "#FF5A30";
	ctx.fillText("TOURSTACK", 20, 28);

	ctx.font = "400 8px Arial,sans-serif";
	ctx.fillStyle = "#64748b";
	ctx.fillText("by CKrowd", 20, 42);

	// ADMIT ONE badge
	rr(W - 92, 13, 76, 22, 5);
	ctx.fillStyle = "#FF5A30";
	ctx.fill();
	ctx.font = "800 8px Arial,sans-serif";
	ctx.fillStyle = "#ffffff";
	ctx.fillText("ADMIT ONE", W - 83, 28);

	// Event title — wrap up to 2 lines
	ctx.font = "800 17px Arial,sans-serif";
	ctx.fillStyle = "#ffffff";
	const titleWords = data.eventTitle.split(" ");
	let titleLine = "";
	let titleY = 70;
	const MAX_TITLE_W = W - 40;
	for (let i = 0; i < titleWords.length; i++) {
		const test = titleLine ? `${titleLine} ${titleWords[i]}` : titleWords[i];
		if (ctx.measureText(test).width > MAX_TITLE_W && titleLine) {
			ctx.fillText(titleLine, 20, titleY);
			if (titleY >= 90) {
				ctx.fillText(fit(`${titleWords.slice(i).join(" ")}`, MAX_TITLE_W), 20, titleY + 22);
				titleLine = "";
				break;
			}
			titleLine = titleWords[i];
			titleY += 22;
		} else {
			titleLine = test;
		}
	}
	if (titleLine) ctx.fillText(titleLine, 20, titleY);

	// Meta (date / location)
	const metaY = Math.max(titleY + 24, 118);
	ctx.font = "400 8px Arial,sans-serif";
	ctx.fillStyle = "#64748b";
	ctx.fillText("DATE", 20, metaY);
	ctx.fillText("LOCATION", W / 2, metaY);

	ctx.font = "600 11px Arial,sans-serif";
	ctx.fillStyle = "#cbd5e1";
	ctx.fillText(fit(data.eventDate || "Date TBC", W / 2 - 28), 20, metaY + 15);
	ctx.fillText(fit(data.eventLocation || "Venue TBC", W / 2 - 28), W / 2, metaY + 15);

	// ── TEAR ────────────────────────────────────────────────────────────────
	const tearY = HEADER_H;
	ctx.fillStyle = "#f7f9fb";
	ctx.fillRect(0, tearY, W, TEAR_H);
	ctx.beginPath();
	ctx.arc(0, tearY + TEAR_H / 2, 11, 0, Math.PI * 2);
	ctx.fill();
	ctx.beginPath();
	ctx.arc(W, tearY + TEAR_H / 2, 11, 0, Math.PI * 2);
	ctx.fill();

	ctx.setLineDash([5, 4]);
	ctx.strokeStyle = "#cbd5e1";
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(18, tearY + TEAR_H / 2);
	ctx.lineTo(W - 18, tearY + TEAR_H / 2);
	ctx.stroke();
	ctx.setLineDash([]);

	// ── BODY ────────────────────────────────────────────────────────────────
	const bodyY = tearY + TEAR_H;
	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, bodyY, W, GRID_H + QR_H);

	const cells: [string, string, string][] = [
		["TICKET TYPE", data.tierName, "#0f172a"],
		["QUANTITY", `× ${data.quantity}`, "#0f172a"],
		["AMOUNT PAID", data.totalAmount, "#FF5A30"],
		["TICKET HOLDER", fit(data.buyerName, W / 2 - 30), "#0f172a"],
	];

	cells.forEach(([label, value, color], i) => {
		const col = i % 2;
		const row = Math.floor(i / 2);
		const x = col === 0 ? 20 : W / 2 + 10;
		const y = bodyY + 18 + row * 50;
		ctx.font = "400 8px Arial,sans-serif";
		ctx.fillStyle = "#94a3b8";
		ctx.fillText(label, x, y);
		ctx.font = "700 12px Arial,sans-serif";
		ctx.fillStyle = color;
		ctx.fillText(value, x, y + 18);
	});

	// Divider
	const divY = bodyY + GRID_H - 6;
	ctx.strokeStyle = "#f1f5f9";
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(20, divY);
	ctx.lineTo(W - 20, divY);
	ctx.stroke();

	// ── QR SECTION ──────────────────────────────────────────────────────────
	const qrSecY = bodyY + GRID_H;
	rr(16, qrSecY + 6, W - 32, QR_H - 12, 10);
	ctx.fillStyle = "#fff7ed";
	ctx.fill();
	ctx.strokeStyle = "#fed7aa";
	ctx.lineWidth = 1;
	ctx.stroke();

	const QR_SZ = 68;
	const qrX = 26;
	const qrY = qrSecY + (QR_H - QR_SZ) / 2;

	await new Promise<void>((resolve) => {
		const img = new Image();
		img.onload = () => { ctx.drawImage(img, qrX, qrY, QR_SZ, QR_SZ); resolve(); };
		img.onerror = () => resolve();
		img.src = data.qrDataUrl;
	});

	const codeX = qrX + QR_SZ + 12;
	const codeAreaW = W - 32 - QR_SZ - 26 - 12 - 10;

	ctx.font = "700 8px Arial,sans-serif";
	ctx.fillStyle = "#c2410c";
	ctx.fillText("TICKET CODE", codeX, qrSecY + 24);

	ctx.font = "700 10px 'Courier New',monospace";
	ctx.fillStyle = "#FF5A30";
	let codeLine = "";
	let codeLineY = qrSecY + 40;
	for (const ch of data.ticketCode) {
		if (ctx.measureText(codeLine + ch).width > codeAreaW) {
			ctx.fillText(codeLine, codeX, codeLineY);
			codeLineY += 14;
			codeLine = ch;
		} else {
			codeLine += ch;
		}
	}
	if (codeLine) ctx.fillText(codeLine, codeX, codeLineY);

	ctx.font = "400 8px Arial,sans-serif";
	ctx.fillStyle = "#ea580c";
	ctx.fillText("Scan QR to verify", codeX, qrSecY + QR_H - 16);

	// ── FOOTER ──────────────────────────────────────────────────────────────
	const footerY = bodyY + GRID_H + QR_H;
	ctx.fillStyle = "#f8fafc";
	ctx.fillRect(0, footerY, W, FOOTER_H);
	ctx.strokeStyle = "#f1f5f9";
	ctx.lineWidth = 1;
	ctx.beginPath();
	ctx.moveTo(0, footerY);
	ctx.lineTo(W, footerY);
	ctx.stroke();

	ctx.font = "400 8px Arial,sans-serif";
	ctx.fillStyle = "#94a3b8";
	ctx.fillText("Present at venue entrance", 20, footerY + 22);

	ctx.font = "700 9px Arial,sans-serif";
	ctx.fillStyle = "#FF5A30";
	ctx.textAlign = "right";
	ctx.fillText("TOURSTACK", W - 20, footerY + 22);
	ctx.textAlign = "left";

	return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
}

// ─────────────────────────────────────────────────────────────────────────────

export default function TicketConfirmPage() {
	const t = useTranslations("TicketConfirmPage");
	const { locale, eventId } = useParams<{ locale: string; eventId: string }>();
	const searchParams = useSearchParams();
	const router = useRouter();
	const reference = searchParams.get("reference") ?? "";

	const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
	const [downloading, setDownloading] = useState(false);

	const { data: result, isLoading } = useQuery({
		queryKey: ["verifyTicket", reference],
		queryFn: () => verifyTicketPayment(reference),
		enabled: reference.length > 0,
		retry: 1,
	});

	const purchase = result?.data as Record<string, unknown> | null | undefined;
	const success = !!result?.success && !!purchase;
	const ev = purchase?.event as Record<string, unknown> | null | undefined;
	const tier = purchase?.tier as Record<string, unknown> | null | undefined;

	const currency = ev?.currency ? String(ev.currency) : "NGN";
	const fmtAmount = (n: number) =>
		new Intl.NumberFormat("en-NG", { style: "currency", currency }).format(n);

	const ticketCode = String(purchase?.ticket_code ?? "");
	const eventTitle = ev?.title ? String(ev.title) : "—";
	const eventDate = ev?.event_date
		? new Date(String(ev.event_date)).toLocaleDateString("en-US", {
				weekday: "short",
				year: "numeric",
				month: "short",
				day: "numeric",
			})
		: "";
	const eventLocation = [ev?.venue, ev?.city].filter(Boolean).join(", ");
	const totalAmount = fmtAmount(Number(purchase?.total_amount ?? 0));
	const tierName = tier?.name ? String(tier.name) : "—";
	const buyerName = purchase?.buyer_name ? String(purchase.buyer_name) : "—";

	useEffect(() => {
		if (!ticketCode || !success) return;
		const checkUrl = `${window.location.origin}/${locale}/tickets/check/${ticketCode}`;
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		import("qrcode").then((mod: any) => {
			(mod.toDataURL ?? mod.default?.toDataURL ?? mod.default)(checkUrl, {
				width: 200,
				margin: 1,
				errorCorrectionLevel: "M",
				color: { dark: "#0f172a", light: "#fffbf7" },
			}).then((url: string) => setQrDataUrl(url));
		});
	}, [ticketCode, locale, success]);

	const handleDownload = async () => {
		if (downloading || !qrDataUrl) return;
		setDownloading(true);
		try {
			const blob = await renderTicketToCanvas({
				eventTitle,
				eventDate,
				eventLocation,
				tierName,
				quantity: Number(purchase?.quantity ?? 1),
				totalAmount,
				buyerName,
				ticketCode,
				qrDataUrl,
			});
			if (!blob) return;
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `ticket-${ticketCode.slice(0, 10)}.png`;
			document.body.appendChild(a);
			a.click();
			setTimeout(() => {
				URL.revokeObjectURL(url);
				document.body.removeChild(a);
			}, 100);
		} catch (err) {
			console.error("Failed to generate ticket image:", err);
		} finally {
			setDownloading(false);
		}
	};

	if (!reference) {
		return (
			<div className="min-h-screen flex flex-col">
				<TicketHeader locale={locale} />
				<div className="flex-1 flex items-center justify-center">
					<p className="text-sm text-gray-500">{t("failed")}</p>
				</div>
			</div>
		);
	}

	if (isLoading) {
		return (
			<div className="min-h-screen flex flex-col">
				<TicketHeader locale={locale} />
				<div className="flex-1 flex items-center justify-center">
					<div className="text-center space-y-4">
						<div className="w-10 h-10 border-2 border-[#FF5A30] border-t-transparent rounded-full animate-spin mx-auto" />
						<p className="text-sm text-gray-600">{t("verifying")}</p>
					</div>
				</div>
			</div>
		);
	}

	if (!success) {
		return (
			<div className="min-h-screen flex flex-col">
				<TicketHeader locale={locale} />
				<div className="flex-1 bg-[#f7f9fb] flex items-center justify-center py-10 px-4">
					<div className="max-w-sm w-full bg-white rounded-2xl p-8 shadow-sm text-center space-y-4">
						<div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
							<svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
								<path d="M18 6 6 18M6 6l12 12" />
							</svg>
						</div>
						<h1 className="text-xl font-black text-gray-900">{t("failed")}</h1>
						<p className="text-sm text-gray-500">{t("failedNote")}</p>
						<button
							type="button"
							onClick={() => router.push(`/${locale}/tickets/${eventId}`)}
							className="w-full bg-[#FF5A30] text-white font-bold text-sm py-3 rounded-xl hover:opacity-90 transition"
						>
							{t("retry")}
						</button>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen flex flex-col bg-[#f7f9fb]">
			<TicketHeader locale={locale} />

			<div className="flex-1 flex flex-col items-center justify-center py-10 px-4">
				<div className="text-center mb-6">
					<div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
						<svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
							<path d="m5 12 5 5 9-9" />
						</svg>
					</div>
					<h1 className="text-2xl font-black text-gray-900">{t("success")}</h1>
					<p className="text-sm text-gray-500 mt-1 max-w-xs mx-auto">{t("successNote")}</p>
				</div>

				<div className="w-full max-w-sm">
					<TicketCard
						eventTitle={eventTitle}
						eventDate={eventDate}
						eventLocation={eventLocation}
						tierName={tierName}
						quantity={Number(purchase?.quantity ?? 1)}
						totalAmount={totalAmount}
						buyerName={buyerName}
						ticketCode={ticketCode}
						qrDataUrl={qrDataUrl}
					/>
				</div>

				<div className="mt-5 flex flex-col sm:flex-row gap-3 w-full max-w-sm">
					<button
						type="button"
						onClick={handleDownload}
						disabled={downloading || !qrDataUrl}
						className="flex-1 bg-[#FF5A30] text-white font-bold text-sm py-3.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
					>
						{downloading ? (
							<>
								<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
								Generating…
							</>
						) : (
							<>
								<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
									<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
								</svg>
								{t("downloadTicket")}
							</>
						)}
					</button>
					<Link
						href={`/${locale}`}
						className="flex-1 border border-gray-200 text-gray-700 font-semibold text-sm py-3.5 rounded-xl hover:bg-gray-50 transition text-center"
					>
						{t("backToHome")}
					</Link>
				</div>

				{!qrDataUrl && (
					<p className="text-xs text-gray-400 mt-3">Generating QR code, download will be ready shortly…</p>
				)}
			</div>
		</div>
	);
}
