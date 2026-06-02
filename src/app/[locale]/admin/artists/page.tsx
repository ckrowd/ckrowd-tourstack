import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { getAdminArtists } from "@/app/actions";
import { Link } from "@/i18n/routing";

export default async function AdminArtistsPage({
	params,
}: {
	params: Promise<{ locale: string }>;
}) {
	const { locale } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("AdminArtistsPage");

	const result = await getAdminArtists();
	const artists = result.data ?? [];

	return (
		<>
			<div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div>
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
				<Link
					href="/admin/tours/create"
					className="flex items-center gap-2 px-6 py-3 bg-[#FF5A30] text-white rounded-xl font-(family-name:--font-manrope) font-bold shadow-lg shadow-[#FF5A30]/20 hover:scale-[1.02] transition-transform active:scale-95 shrink-0"
				>
					<span className="material-symbols-outlined">add</span>
					{t("createTour")}
				</Link>
			</div>

			<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
				<div className="flex items-center justify-between mb-5">
					<h3 className="font-(family-name:--font-manrope) font-bold text-lg">
						{t("allArtists")}
					</h3>
					<p className="text-sm text-on-surface-variant">
						{artists.length} {artists.length === 1 ? "project" : "projects"}
					</p>
				</div>

				{artists.length === 0 ? (
					<div className="bg-surface-container-low rounded-2xl p-12 text-center">
						<span className="material-symbols-outlined text-5xl text-on-surface-variant block mb-4">
							album
						</span>
						<p className="font-(family-name:--font-manrope) font-bold text-on-surface text-lg mb-2">
							{t("noArtists")}
						</p>
						<p className="text-on-surface-variant text-sm">{t("noArtistsDesc")}</p>
					</div>
				) : (
					<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
						{artists.map((artist) => {
							const isActive = Boolean(artist.is_active);
							const markets = Array.isArray(artist.markets)
								? (artist.markets as string[]).join(", ")
								: String(artist.markets ?? "");

							return (
								<div
									key={String(artist.id)}
									className="bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/10 hover:shadow-md transition-shadow"
								>
									<div className="h-36 relative bg-surface-container-high">
										{artist.image_url ? (
											<Image
												src={String(artist.image_url)}
												alt={String(artist.name ?? "")}
												fill
												className="object-cover"
											/>
										) : (
											<div className="w-full h-full flex items-center justify-center">
												<span className="material-symbols-outlined text-4xl text-on-surface-variant">
													album
												</span>
											</div>
										)}
										<div className="absolute top-3 right-3">
											<span
												className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
													isActive
														? "bg-emerald-100 text-emerald-700"
														: "bg-slate-100 text-slate-500"
												}`}
											>
												{isActive ? t("active") : t("inactive")}
											</span>
										</div>
									</div>

									<div className="p-4">
										<p className="font-(family-name:--font-manrope) font-extrabold text-on-surface truncate">
											{String(artist.name ?? "")}
										</p>
										<p className="text-xs text-on-surface-variant mt-0.5 truncate">
											{String(artist.tour_name ?? "")}
										</p>

										<div className="mt-3 space-y-1.5">
											<div className="flex items-center gap-1.5 text-on-surface-variant">
												<span className="material-symbols-outlined text-sm">
													music_note
												</span>
												<span className="text-xs font-medium">
													{String(artist.genre ?? "")}
												</span>
											</div>
											{markets && (
												<div className="flex items-center gap-1.5 text-on-surface-variant">
													<span className="material-symbols-outlined text-sm">
														location_on
													</span>
													<span className="text-xs font-medium truncate">
														{markets}
													</span>
												</div>
											)}
											<div className="flex items-center gap-1.5 text-on-surface-variant">
												<span className="material-symbols-outlined text-sm">
													event
												</span>
												<span className="text-xs font-medium">
													{String(artist.tour_window ?? "")}
												</span>
											</div>
											<div className="flex items-center gap-1.5 text-on-surface-variant">
												<span className="material-symbols-outlined text-sm">
													monetization_on
												</span>
												<span className="text-xs font-medium">
													{artist.fee_min != null && artist.fee_max != null
														? `$${Math.round(Number(artist.fee_min) / 1000)}k – $${Math.round(Number(artist.fee_max) / 1000)}k`
														: "—"}
												</span>
											</div>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</div>
		</>
	);
}
