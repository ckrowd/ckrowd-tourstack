"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Icon from "@/components/icons";
import { useTranslations } from "next-intl";
import { useState } from "react";
import {
	createTourstackVenue,
	deleteTourstackVenue,
	getTourstackVenues,
	updateTourstackVenue,
} from "@/app/actions";
import { Field, Section } from "@/components/SettingsPrimitives";
import Loader from "@/components/Loader";
import VenueDetailsModal from "@/components/VenueDetailsModal";

type Venue = NonNullable<
	Awaited<ReturnType<typeof getTourstackVenues>>["data"]
>[number];

type VenueWithExtras = Venue & { expected_attendance?: number | null; notes?: string | null };

const EMPTY_FORM = {
	name: "",
	venueType: "",
	city: "",
	country: "",
	seatedCapacity: "",
	standingCapacity: "",
	expectedAttendance: "",
	streetAddress: "",
	googleMapsUrl: "",
	notes: "",
};

export default function SettingsVenueTab() {
	const t = useTranslations("SettingsPage.venueTab");
	const queryClient = useQueryClient();

	const venuesQuery = useQuery({
		queryKey: ["tourstackVenues"],
		queryFn: getTourstackVenues,
	});
	const venues = venuesQuery.data?.data ?? [];

	const [form, setForm] = useState(EMPTY_FORM);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [viewingVenue, setViewingVenue] = useState<Venue | null>(null);

	const resetForm = () => {
		setForm(EMPTY_FORM);
		setEditingId(null);
	};

	const saveMutation = useMutation({
		mutationFn: async () => {
			const payload = {
				name: form.name.trim(),
				venueType: form.venueType.trim(),
				city: form.city.trim(),
				country: form.country.trim(),
				streetAddress: form.streetAddress.trim(),
				seatedCapacity: form.seatedCapacity
					? Number(form.seatedCapacity)
					: undefined,
				standingCapacity: form.standingCapacity
					? Number(form.standingCapacity)
					: undefined,
				expectedAttendance: form.expectedAttendance
					? Number(form.expectedAttendance)
					: undefined,
				googleMapsUrl: form.googleMapsUrl.trim() || undefined,
				notes: form.notes.trim() || undefined,
			};
			return editingId
				? updateTourstackVenue(editingId, payload)
				: createTourstackVenue(payload);
		},
		onSuccess: (result) => {
			if (result.success) {
				resetForm();
				void queryClient.invalidateQueries({ queryKey: ["tourstackVenues"] });
			}
		},
	});

	const deleteMutation = useMutation({
		mutationFn: deleteTourstackVenue,
		onSuccess: (result) => {
			if (result.success) {
				void queryClient.invalidateQueries({ queryKey: ["tourstackVenues"] });
			}
		},
	});

	const set = (key: keyof typeof EMPTY_FORM) => (v: string) =>
		setForm((p) => ({ ...p, [key]: v }));

	const startEdit = (venue: (typeof venues)[number]) => {
		setEditingId(String(venue.id));
		setForm({
			name: String(venue.name ?? ""),
			venueType: String(venue.venue_type ?? ""),
			city: String(venue.city ?? ""),
			country: String(venue.country ?? ""),
			seatedCapacity:
				venue.seated_capacity != null ? String(venue.seated_capacity) : "",
			standingCapacity:
				venue.standing_capacity != null ? String(venue.standing_capacity) : "",
			expectedAttendance: (venue as VenueWithExtras).expected_attendance != null ? String((venue as VenueWithExtras).expected_attendance) : "",
			streetAddress: String(venue.street_address ?? ""),
			googleMapsUrl: String(venue.google_maps_url ?? ""),
			notes: String((venue as VenueWithExtras).notes ?? ""),
		});
		if (typeof window !== "undefined") {
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
	};

	const canSave =
		form.name.trim() !== "" &&
		form.venueType.trim() !== "" &&
		form.city.trim() !== "" &&
		form.country.trim() !== "" &&
		form.streetAddress.trim() !== "";

	const saveFailed =
		saveMutation.error != null ||
		(saveMutation.data != null && !saveMutation.data.success);

	return (
		<div className="space-y-6">
			<Section
				title={t("myVenues.title")}
				description={t("myVenues.description")}
			>
				<div className="space-y-3">
					{venuesQuery.isLoading ? (
						<Loader size={36} />
					) : venues.length === 0 ? (
						<p className="text-sm text-on-surface-variant">
							{t("myVenues.empty")}
						</p>
					) : (
						venues.map((v) => (
							<button
								key={String(v.id)}
								type="button"
								onClick={() => setViewingVenue(v)}
								className="w-full text-left flex items-center gap-4 p-5 bg-surface-container-low rounded-xl border border-outline-variant/10 hover:border-primary/40 transition-colors"
							>
								<div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
									<Icon name="stadium" size={18} className="text-primary" />
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-2 flex-wrap">
										<p className="font-semibold text-sm text-on-surface">
											{String(v.name)}
										</p>
										{v.is_verified ? (
											<span className="text-[10px] font-semibold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
												{t("myVenues.statuses.verified")}
											</span>
										) : (
											<span className="text-[10px] font-semibold uppercase tracking-wider bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">
												{t("myVenues.statuses.pending")}
											</span>
										)}
									</div>
									<p className="text-xs text-on-surface-variant mt-0.5 capitalize">
										{String(v.city)}, {String(v.country)} ·{" "}
										{String(v.venue_type)}
									</p>
								</div>
								<div className="flex items-center gap-3 shrink-0">
									<span
										onClick={(e) => {
											e.stopPropagation();
											startEdit(v);
										}}
										onKeyDown={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												e.preventDefault();
												e.stopPropagation();
												startEdit(v);
											}
										}}
										role="button"
										tabIndex={0}
										className="text-xs font-semibold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
									>
										{t("myVenues.actions.edit")}
									</span>
									<span
										onClick={(e) => {
											e.stopPropagation();
											if (!deleteMutation.isPending) {
												deleteMutation.mutate(String(v.id));
											}
										}}
										onKeyDown={(e) => {
											if (
												(e.key === "Enter" || e.key === " ") &&
												!deleteMutation.isPending
											) {
												e.preventDefault();
												e.stopPropagation();
												deleteMutation.mutate(String(v.id));
											}
										}}
										role="button"
										tabIndex={0}
										aria-disabled={deleteMutation.isPending}
										className={`text-xs font-semibold text-red-500 hover:text-red-600 transition-colors cursor-pointer ${deleteMutation.isPending ? "opacity-50 cursor-not-allowed" : ""}`}
									>
										{deleteMutation.isPending
											? t("myVenues.actions.deleting")
											: t("myVenues.actions.delete")}
									</span>
								</div>
							</button>
						))
					)}
				</div>
				{editingId && (
					<button
						type="button"
						onClick={resetForm}
						className="w-full py-3 border-2 border-dashed border-outline-variant/40 rounded-xl text-sm font-semibold text-on-surface-variant hover:border-primary/40 hover:text-primary transition-all flex items-center justify-center gap-2"
					>
						<Icon name="plus" size={14} />
						{t("myVenues.actions.addNew")}
					</button>
				)}
			</Section>

			<Section
				title={editingId ? t("venueDetails.editTitle") : t("venueDetails.createTitle")}
				description={t("venueDetails.description")}
			>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-5">
					<Field
						label={t("venueDetails.fields.name")}
						id="v-name"
						value={form.name}
						onChange={set("name")}
						placeholder={t("venueDetails.fields.namePlaceholder")}
					/>
					<Field
						label={t("venueDetails.fields.type")}
						id="v-type"
						value={form.venueType}
						onChange={set("venueType")}
						placeholder={t("venueDetails.fields.typePlaceholder")}
					/>
					<Field
						label={t("venueDetails.fields.city")}
						id="v-city"
						value={form.city}
						onChange={set("city")}
						placeholder={t("venueDetails.fields.cityPlaceholder")}
					/>
					<Field
						label={t("venueDetails.fields.country")}
						id="v-country"
						value={form.country}
						onChange={set("country")}
						placeholder={t("venueDetails.fields.countryPlaceholder")}
					/>
					<Field
						label={t("venueDetails.fields.seatedCap")}
						id="v-cap-seated"
						type="formatted-number"
						value={form.seatedCapacity}
						onChange={set("seatedCapacity")}
						placeholder={t("venueDetails.fields.seatedCapPlaceholder")}
					/>
					<Field
						label={t("venueDetails.fields.standingCap")}
						id="v-cap-stand"
						type="formatted-number"
						value={form.standingCapacity}
						onChange={set("standingCapacity")}
						placeholder={t("venueDetails.fields.standingCapPlaceholder")}
					/>
					<Field
						label={t("venueDetails.fields.expectedAttendance")}
						id="v-expected-attendance"
						type="formatted-number"
						value={form.expectedAttendance}
						onChange={set("expectedAttendance")}
						placeholder={t("venueDetails.fields.expectedAttendancePlaceholder")}
					/>
					<Field
						label={t("venueDetails.fields.address")}
						id="v-address"
						value={form.streetAddress}
						onChange={set("streetAddress")}
						placeholder={t("venueDetails.fields.addressPlaceholder")}
					/>
					<Field
						label={t("venueDetails.fields.maps")}
						id="v-maps"
						type="url"
						value={form.googleMapsUrl}
						onChange={set("googleMapsUrl")}
						placeholder={t("venueDetails.fields.mapsPlaceholder")}
					/>
				</div>
				<div className="mt-5">
					<label
						htmlFor="v-notes"
						className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-on-surface-variant"
					>
						{t("venueDetails.fields.notes")}
					</label>
					<textarea
						id="v-notes"
						rows={4}
						value={form.notes}
						onChange={(e) => set("notes")(e.target.value)}
						placeholder={t("venueDetails.fields.notesPlaceholder")}
						className="w-full rounded-xl border border-outline-variant/20 bg-surface-container-lowest px-4 py-3 text-sm font-medium text-on-surface outline-none transition focus:ring-2 focus:ring-primary/20 resize-none"
					/>
				</div>
				<div className="flex items-center justify-end gap-4 pt-2">
					{saveMutation.data?.success && (
						<span className="text-sm font-semibold text-emerald-600">
							{t("venueDetails.saveSuccess")}
						</span>
					)}
					{saveFailed && (
						<span className="text-sm font-semibold text-rose-600">
							{t("venueDetails.saveError")}
						</span>
					)}
					{editingId && (
						<button
							type="button"
							onClick={resetForm}
							className="px-6 py-3 border border-outline-variant/40 rounded-xl font-semibold text-sm text-on-surface-variant hover:bg-surface-container-low transition-all"
						>
							{t("venueDetails.actions.cancel")}
						</button>
					)}
					<button
						type="button"
						onClick={() => saveMutation.mutate()}
						disabled={!canSave || saveMutation.isPending}
						className="bg-primary text-white px-8 py-3 rounded-xl font-semibold text-sm shadow-lg shadow-primary/20 hover:opacity-90 transition-all disabled:cursor-not-allowed disabled:opacity-60"
					>
						{saveMutation.isPending
							? t("venueDetails.actions.saving")
							: t("venueDetails.actions.save")}
					</button>
				</div>
			</Section>

			{viewingVenue && (
				<VenueDetailsModal
					venue={viewingVenue}
					onClose={() => setViewingVenue(null)}
				/>
			)}
		</div>
	);
}
