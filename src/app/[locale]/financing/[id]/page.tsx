import Link from "next/link";
import SideNav from "@/components/SideNav";
import TopNav from "@/components/TopNav";
import { getFinancingApplication } from "@/app/actions";
import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function FinancingDetailPage({
	params,
}: {
	params: Promise<{ id: string, locale: string }>;
}) {
	const { id, locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations('FinancingDetailPage');
	
	const result = await getFinancingApplication(id);
	const app = result.data;

	return (
		<div className="bg-surface text-on-surface">
			<TopNav />
			<div className="flex pt-16 h-screen">
				<SideNav />
				<main className="flex-1 overflow-y-auto bg-surface-container-low p-6 md:p-10 no-scrollbar">
					<div className="w-full space-y-6">
						<div className="flex items-center justify-between gap-3">
							<div>
								<p className="text-xs font-bold uppercase tracking-widest text-[#FF5A30]">
									{t('tagline')}
								</p>
								<h1 className="text-3xl font-(family-name:--font-manrope) font-extrabold mt-1">
									{t('title')}
								</h1>
							</div>
							<Link
								href="/financing"
								className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-outline-variant/30 text-sm font-bold text-on-surface-variant hover:bg-surface-container-low"
							>
								<span className="material-symbols-outlined text-sm">arrow_back</span>
								{t('actions.back')}
							</Link>
						</div>

						{!result.success || !app ? (
							<div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-6 text-sm font-medium">
								{result.error ?? t('errors.load')}
							</div>
						) : (
							<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm space-y-5">
								<div className="flex flex-wrap items-start justify-between gap-3">
									<div>
										<p className="text-sm text-on-surface-variant">{t('fields.product')}</p>
										<p className="text-xl font-(family-name:--font-manrope) font-bold text-on-surface">
											{String(app.product ?? t('defaultProduct'))}
										</p>
									</div>
									<span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter bg-surface-container-high text-on-surface-variant">
										{String(app.status ?? "pending").replace(/_/g, " ")}
									</span>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
									<div className="bg-surface-container-low rounded-xl p-3">
										<p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
											{t('fields.requested')}
										</p>
										<p className="text-sm font-bold mt-1 text-on-surface">
											{String(app.currency ?? "USD")} {Number(app.amount_requested).toLocaleString()}
										</p>
									</div>
									<div className="bg-surface-container-low rounded-xl p-3">
										<p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
											{t('fields.submitted')}
										</p>
										<p className="text-sm font-bold mt-1 text-on-surface">
											{app.created_at
												? new Date(String(app.created_at)).toLocaleDateString(locale, {
													month: "short",
													day: "numeric",
													year: "numeric",
												})
												: "-"}
										</p>
									</div>
									<div className="bg-surface-container-low rounded-xl p-3">
										<p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
											{t('fields.tour')}
										</p>
										<p className="text-sm font-bold mt-1 text-on-surface">
											{String(app.tour?.artist?.name ?? app.tour?.tour_name ?? "-")}
										</p>
									</div>
								</div>

								{Array.isArray(app.documents) && app.documents.length > 0 && (
									<div>
										<p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-2">
											{t('fields.documents')}
										</p>
										<ul className="space-y-2">
											{app.documents.map((doc: string, index: number) => (
												<li key={`${doc}-${index}`} className="text-sm text-on-surface-variant break-all">
													{doc}
												</li>
											))}
										</ul>
									</div>
								)}
							</div>
						)}
					</div>
				  </main>
			</div>
		</div>
	);
}
