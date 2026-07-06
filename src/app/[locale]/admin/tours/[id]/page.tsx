import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { getAdminTour } from "@/app/actions";
import { Link } from "@/i18n/routing";

type Props = {
	params: Promise<{ locale: string; id: string }>;
};

export default async function AdminTourDetailPage({ params }: Props) {
	const { locale, id } = await params;
	setRequestLocale(locale);
	const t = await getTranslations("AdminTourDetailPage");

	const result = await getAdminTour(id);
	if (!result.success || !result.data) {
		notFound();
	}
	const tour = result.data as {
		id: string;
		venue: string;
		city: string;
		country: string | null;
		date: string | Date;
		capacity: number | null;
		fee_usd: number;
		status: string;
		financing: boolean;
		financing_amount: number | null;
		artist: {
			name: string;
			tour_name: string;
			genre: string;
		} | null;
		eoi: {
			id: string;
			status: string;
			notes: string | null;
			match_score: number | null;
			promoter: {
				company_name: string | null;
				contact_person: string | null;
				user: { email: string | null } | null;
			} | null;
		} | null;
	};

	const date = new Date(tour.date);
	const dateLabel = Number.isNaN(date.getTime())
		? "—"
		: date.toLocaleDateString();

	return (
		<>
			<div className="mb-8 flex items-center gap-3 flex-wrap">
				<Link
					href="/admin/tours"
					className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors shrink-0"
				>
					<span className="material-symbols-outlined text-on-surface-variant">
						arrow_back
					</span>
				</Link>
				<div className="flex-1 min-w-0">
					<span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A2E] block mb-1">
						{t("badge")}
					</span>
					<h1 className="text-3xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface truncate">
						{tour.artist?.name ?? t("untitledArtist")}
					</h1>
					<p className="text-on-surface-variant text-sm mt-1">
						{tour.artist?.tour_name ?? ""}
					</p>
				</div>
				<Link
					href={`/admin/tours/${tour.id}/edit`}
					className="flex items-center gap-2 px-4 py-2 bg-surface-container rounded-xl text-sm font-semibold text-on-surface hover:bg-surface-container-high transition-colors shrink-0"
				>
					<span className="material-symbols-outlined text-sm">edit</span>
					{t("edit")}
				</Link>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
				<div className="lg:col-span-2 bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
					<h2 className="text-lg font-semibold font-(family-name:--font-manrope) mb-5">
						{t("stopSummary")}
					</h2>
					<dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
						<Field label={t("fields.venue")} value={tour.venue} />
						<Field
							label={t("fields.city")}
							value={[tour.city, tour.country].filter(Boolean).join(", ")}
						/>
						<Field label={t("fields.date")} value={dateLabel} />
						<Field
							label={t("fields.capacity")}
							value={tour.capacity != null ? String(tour.capacity) : "—"}
						/>
						<Field
							label={t("fields.fee")}
							value={`$${tour.fee_usd.toLocaleString()}`}
						/>
						<Field
							label={t("fields.status")}
							value={tour.status.replace(/_/g, " ")}
						/>
						<Field
							label={t("fields.financing")}
							value={
								tour.financing
									? `${t("yes")} · $${(tour.financing_amount ?? 0).toLocaleString()}`
									: t("no")
							}
						/>
						<Field
							label={t("fields.genre")}
							value={tour.artist?.genre ?? "—"}
						/>
					</dl>
				</div>

				<div className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm">
					<h2 className="text-lg font-semibold font-(family-name:--font-manrope) mb-5">
						{t("promoterSection")}
					</h2>
					{tour.eoi ? (
						<dl className="space-y-3 text-sm">
							<Field
								label={t("fields.company")}
								value={tour.eoi.promoter?.company_name ?? "—"}
							/>
							<Field
								label={t("fields.contact")}
								value={tour.eoi.promoter?.contact_person ?? "—"}
							/>
							<Field
								label={t("fields.email")}
								value={tour.eoi.promoter?.user?.email ?? "—"}
							/>
							<Field
								label={t("fields.matchScore")}
								value={
									tour.eoi.match_score != null
										? `${tour.eoi.match_score}%`
										: "—"
								}
							/>
							<Field
								label={t("fields.eoiStatus")}
								value={tour.eoi.status.replace(/_/g, " ")}
							/>
						</dl>
					) : (
						<p className="text-sm text-on-surface-variant">{t("noEoi")}</p>
					)}
				</div>
			</div>
		</>
	);
}

function Field({ label, value }: { label: string; value: string }) {
	return (
		<div>
			<dt className="text-[10px] font-semibold uppercase tracking-wider text-on-surface-variant mb-1">
				{label}
			</dt>
			<dd className="text-sm font-semibold text-on-surface">{value}</dd>
		</div>
	);
}
