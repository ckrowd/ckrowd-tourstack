import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";

type QueueItem = {
	id: string;
	promoter: string;
	tour: string;
	product: string;
	amount: string;
	status: string;
	statusKey: "pending" | "underReview" | "approved";
};

function statusClass(status: QueueItem["statusKey"]) {
	if (status === "approved") return "bg-emerald-100 text-emerald-800";
	if (status === "underReview") return "bg-blue-100 text-blue-800";
	return "bg-yellow-100 text-yellow-800";
}

export default async function FinancingAdminPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("FinancingAdminPage");

	const queue = t.raw("queue.items") as QueueItem[];
	const workflow = t.raw("workflow.items") as {
		title: string;
		description: string;
		icon: string;
	}[];

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
				<Link
					href="/financing-admin/applications"
					className="flex items-center gap-2 px-4 py-2.5 bg-[#FF5A30] text-white rounded-xl font-(family-name:--font-manrope) text-sm font-bold shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform active:scale-95 shrink-0"
				>
					<span className="material-symbols-outlined text-base">rate_review</span>
					{t("reviewQueue")}
				</Link>
			</div>

			<div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.75fr] gap-8">
				<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
					<div className="flex items-center justify-between mb-5">
					<h2 className="font-(family-name:--font-manrope) font-bold text-base">
							{t("queue.title")}
						</h2>
						<Link
							href="/financing-admin/applications"
							className="text-sm font-bold text-[#FF5A30] hover:underline"
						>
							{t("queue.viewAll")}
						</Link>
					</div>
					<div className="space-y-4">
						{queue.map((item) => (
							<div
								key={item.id}
								className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-4 border-b border-outline-variant/10 last:border-none"
							>
								<div className="flex items-start gap-3 min-w-0">
									<div className="w-11 h-11 rounded-xl bg-surface-container-low flex items-center justify-center shrink-0">
										<span className="material-symbols-outlined text-on-surface-variant">
											request_quote
										</span>
									</div>
									<div className="min-w-0">
										<div className="flex items-center gap-2 flex-wrap mb-1">
											<span className="text-xs font-black text-[#FF5A30] uppercase tracking-widest">
												{item.id}
											</span>
											<span
												className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter ${statusClass(item.statusKey)}`}
											>
												{item.status}
											</span>
										</div>
										<p className="font-(family-name:--font-manrope) font-bold text-on-surface truncate">
											{item.promoter}
										</p>
										<p className="text-sm text-on-surface-variant mt-0.5">
											{item.tour} · {item.product}
										</p>
									</div>
								</div>
								<div className="md:text-right">
									<p className="font-(family-name:--font-manrope) font-extrabold text-on-surface">
										{item.amount}
									</p>
									<p className="text-xs text-on-surface-variant">
										{t("queue.amountLabel")}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
						<h2 className="font-(family-name:--font-manrope) font-bold text-base mb-5">
						{t("workflow.title")}
					</h2>
					<div className="space-y-4">
						{workflow.map((item) => (
							<div
								key={item.title}
								className="bg-surface-container-low rounded-2xl p-4 flex items-start gap-3"
							>
								<span className="material-symbols-outlined text-[#FF5A30] shrink-0">
									{item.icon}
								</span>
								<div>
									<p className="font-bold text-sm text-on-surface">
										{item.title}
									</p>
									<p className="text-xs text-on-surface-variant mt-1 leading-5">
										{item.description}
									</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</>
	);
}
