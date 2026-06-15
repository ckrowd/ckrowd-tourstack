"use client";

import { useTranslations } from "next-intl";
import { useEffect } from "react";
import type { getTourstackVenues } from "@/app/actions";

type Venue = NonNullable<
	Awaited<ReturnType<typeof getTourstackVenues>>["data"]
>[number];

export default function VenueDetailsModal({
	venue,
	onClose,
}: {
	venue: Venue;
	onClose: () => void;
}) {
	const t = useTranslations("SettingsPage.venueTab");

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		window.addEventListener("keydown", onKey);
		document.body.style.overflow = "hidden";
		return () => {
			window.removeEventListener("keydown", onKey);
			document.body.style.overflow = "";
		};
	}, [onClose]);

	type VenueWithExtras = Venue & { expected_attendance?: number | null; notes?: string | null };
	const v = venue as VenueWithExtras;

	const rows: [string, React.ReactNode][] = [
		[t("venueDetails.fields.name"), String(venue.name ?? "—")],
		[t("venueDetails.fields.type"), String(venue.venue_type ?? "—")],
		[t("venueDetails.fields.city"), String(venue.city ?? "—")],
		[t("venueDetails.fields.country"), String(venue.country ?? "—")],
		[
			t("venueDetails.fields.seatedCap"),
			venue.seated_capacity != null
				? Number(venue.seated_capacity).toLocaleString()
				: "—",
		],
		[
			t("venueDetails.fields.standingCap"),
			venue.standing_capacity != null
				? Number(venue.standing_capacity).toLocaleString()
				: "—",
		],
		[
			t("venueDetails.fields.expectedAttendance"),
			v.expected_attendance != null
				? Number(v.expected_attendance).toLocaleString()
				: "—",
		],
		[t("venueDetails.fields.address"), String(venue.street_address ?? "—")],
		[
			t("venueDetails.fields.maps"),
			venue.google_maps_url ? (
				<a
					href={String(venue.google_maps_url)}
					target="_blank"
					rel="noopener noreferrer"
					className="text-[#FF5A30] hover:underline break-all"
				>
					{String(venue.google_maps_url)}
				</a>
			) : (
				"—"
			),
		],
	];

	const notes = v.notes ? String(v.notes) : null;

	return (
		<div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
			<button
				type="button"
				aria-label={t("viewModal.close")}
				onClick={onClose}
				className="absolute inset-0 bg-black/40 cursor-default border-none"
			/>
			<div
				role="dialog"
				aria-modal="true"
				aria-label={String(venue.name ?? "")}
				className="relative z-10 w-full max-w-lg max-h-[85vh] overflow-y-auto bg-surface-container-lowest rounded-2xl shadow-2xl"
			>
				<div className="sticky top-0 flex items-start justify-between gap-3 px-6 py-4 border-b border-outline-variant/15 bg-surface-container-lowest">
					<div className="min-w-0 flex-1">
						<div className="flex items-center gap-2 flex-wrap">
							<h3 className="font-(family-name:--font-manrope) font-semibold text-on-surface truncate">
								{String(venue.name ?? "")}
							</h3>
							{venue.is_verified ? (
								<span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
									{t("myVenues.statuses.verified")}
								</span>
							) : (
								<span className="text-[10px] font-semibold uppercase tracking-wider bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
									{t("myVenues.statuses.pending")}
								</span>
							)}
						</div>
						<p className="text-xs text-on-surface-variant capitalize mt-0.5">
							{String(venue.city ?? "")}
							{venue.country ? `, ${String(venue.country)}` : ""}
						</p>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label={t("viewModal.close")}
						className="text-on-surface-variant hover:text-on-surface transition-colors shrink-0"
					>
						<span className="material-symbols-outlined">close</span>
					</button>
				</div>
				<div className="px-6 py-5">
					<dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
						{rows.map(([label, value]) => (
							<div key={label} className="min-w-0">
								<dt className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant">
									{label}
								</dt>
								<dd className="text-sm text-on-surface break-words mt-1">
									{value}
								</dd>
							</div>
						))}
					</dl>
					{notes && (
						<div className="mt-5 pt-5 border-t border-outline-variant/15">
							<p className="text-[10px] font-semibold uppercase tracking-widest text-on-surface-variant mb-2">
								{t("venueDetails.fields.notes")}
							</p>
							<p className="text-sm text-on-surface whitespace-pre-wrap leading-relaxed">
								{notes}
							</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
