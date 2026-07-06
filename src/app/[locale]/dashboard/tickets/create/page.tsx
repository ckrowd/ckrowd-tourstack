"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { createTicketEvent, getTours, publishTicketEvent } from "@/app/actions";
import FormattedNumberInput from "@/components/ui/FormattedNumberInput";

interface TierDraft {
	name: string;
	price: string;
	capacity: string;
	description: string;
}

const EMPTY_TIER: TierDraft = { name: "", price: "", capacity: "", description: "" };

export default function CreateTicketEventPage() {
	const t = useTranslations("CreateTicketEventPage");
	const { locale } = useParams<{ locale: string }>();
	const router = useRouter();
	const qc = useQueryClient();

	const [step, setStep] = useState<"details" | "tiers" | "review">("details");
	const [commissionAccepted, setCommissionAccepted] = useState(false);

	// Step 1 — event details
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [venue, setVenue] = useState("");
	const [city, setCity] = useState("");
	const [eventDate, setEventDate] = useState("");
	const [tourId, setTourId] = useState("");

	const toursQuery = useQuery({ queryKey: ["tours"], queryFn: () => getTours() });
	const tours = (toursQuery.data?.data as Record<string, unknown>[] | null) ?? [];
	const linkableTours = tours.filter((tr) => tr.status !== "rejected");

	const handleTourChange = (value: string) => {
		setTourId(value);
		if (!value) return;
		const tour = linkableTours.find((tr) => String(tr.id) === value);
		if (!tour) return;
		setVenue(String(tour.venue ?? ""));
		setCity(String(tour.city ?? ""));
		setEventDate(tour.date ? new Date(String(tour.date)).toISOString().slice(0, 16) : "");
	};

	// Step 2 — tiers
	const [tiers, setTiers] = useState<TierDraft[]>([{ ...EMPTY_TIER }]);

	const createMutation = useMutation({
		mutationFn: async (publish: boolean) => {
			const ev = await createTicketEvent({
				title,
				description: description || undefined,
				venue: venue || undefined,
				city: city || undefined,
				eventDate: eventDate || undefined,
				tourId: tourId || undefined,
				currency: "NGN",
			});
			if (!ev.success || !ev.data) throw new Error(ev.error ?? "Failed to create event");

			const eventId = (ev.data as Record<string, unknown>).id as string;

			// Create tiers via individual API calls wrapped in actions
			const { createTicketTier } = await import("@/app/actions");
			for (const tier of tiers) {
				if (!tier.name || !tier.price) continue;
				await createTicketTier(eventId, {
					name: tier.name,
					price: Number(tier.price),
					description: tier.description || undefined,
					capacity: tier.capacity ? Number(tier.capacity) : undefined,
				});
			}

			if (publish) {
				await publishTicketEvent(eventId);
			}

			return eventId;
		},
		onSuccess: (eventId) => {
			qc.invalidateQueries({ queryKey: ["ticketEvents"] });
			router.push(`/${locale}/dashboard/tickets/${eventId}`);
		},
	});

	const addTier = () => setTiers((prev) => [...prev, { ...EMPTY_TIER }]);
	const removeTier = (i: number) => setTiers((prev) => prev.filter((_, idx) => idx !== i));
	const updateTier = (i: number, field: keyof TierDraft, value: string) => {
		setTiers((prev) => prev.map((t, idx) => (idx === i ? { ...t, [field]: value } : t)));
	};

	const canNextFromDetails = title.trim().length > 0;
	const canNextFromTiers = tiers.some((t) => t.name.trim() && t.price.trim());

	const STEPS = ["details", "tiers", "review"] as const;
	const stepIdx = STEPS.indexOf(step);

	return (
		<div className="p-6 max-w-2xl mx-auto">
			<div className="mb-8">
				<p className="text-xs font-black uppercase tracking-widest text-[#FF5A2E] mb-1">{t("badge")}</p>
				<h1 className="text-2xl font-black text-on-surface">{t("title")}</h1>
				<p className="text-sm text-on-surface-variant mt-1">{t("description")}</p>
			</div>

			{/* Step indicator */}
			<div className="flex gap-2 mb-8">
				{STEPS.map((s, i) => (
					<div key={s} className="flex items-center gap-2">
						<div
							className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center ${
								i <= stepIdx ? "bg-[#FF5A2E] text-white" : "bg-surface-container text-on-surface-variant"
							}`}
						>
							{i + 1}
						</div>
						<span className={`text-sm font-semibold ${i === stepIdx ? "text-on-surface" : "text-on-surface-variant"}`}>
							{t(`steps.${s}`)}
						</span>
						{i < STEPS.length - 1 && <div className="w-8 h-px bg-outline-variant mx-1" />}
					</div>
				))}
			</div>

			{/* Step 1: Details */}
			{step === "details" && (
				<div className="space-y-5">
					<div>
						<label className="block text-sm font-semibold mb-1">{t("form.title")}</label>
						<input
							className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm bg-surface focus:outline-none focus:border-[#FF5A2E]"
							placeholder={t("form.titlePlaceholder")}
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold mb-1">{t("form.description")}</label>
						<textarea
							rows={3}
							className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm bg-surface focus:outline-none focus:border-[#FF5A2E] resize-none"
							placeholder={t("form.descriptionPlaceholder")}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold mb-1">{t("form.linkTour")}</label>
						<select
							className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm bg-surface focus:outline-none focus:border-[#FF5A2E]"
							value={tourId}
							onChange={(e) => handleTourChange(e.target.value)}
						>
							<option value="">{t("form.linkTourPlaceholder")}</option>
							{linkableTours.map((tour) => (
								<option key={String(tour.id)} value={String(tour.id)}>
									{String(tour.tour_name ?? tour.venue)} — {String(tour.city)} (
									{t(`tourStatus.${String(tour.status)}` as Parameters<typeof t>[0])})
								</option>
							))}
						</select>
						{tourId && <p className="text-xs text-on-surface-variant mt-1">{t("form.tourLockedHint")}</p>}
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-semibold mb-1">{t("form.venue")}</label>
							<input
								className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm bg-surface focus:outline-none focus:border-[#FF5A2E] disabled:bg-surface-container disabled:text-on-surface-variant disabled:cursor-not-allowed"
								placeholder={t("form.venuePlaceholder")}
								value={venue}
								disabled={!!tourId}
								onChange={(e) => setVenue(e.target.value)}
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold mb-1">{t("form.city")}</label>
							<input
								className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm bg-surface focus:outline-none focus:border-[#FF5A2E] disabled:bg-surface-container disabled:text-on-surface-variant disabled:cursor-not-allowed"
								placeholder={t("form.cityPlaceholder")}
								value={city}
								disabled={!!tourId}
								onChange={(e) => setCity(e.target.value)}
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-semibold mb-1">{t("form.eventDate")}</label>
						<input
							disabled={!!tourId}
							type="datetime-local"
							className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm bg-surface focus:outline-none focus:border-[#FF5A2E] disabled:bg-surface-container disabled:text-on-surface-variant disabled:cursor-not-allowed"
							value={eventDate}
							onChange={(e) => setEventDate(e.target.value)}
						/>
					</div>
					<div className="flex justify-end pt-2">
						<button
							type="button"
							disabled={!canNextFromDetails}
							onClick={() => setStep("tiers")}
							className="bg-[#FF5A2E] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-40 transition"
						>
							{t("form.next")}
						</button>
					</div>
				</div>
			)}

			{/* Step 2: Tiers */}
			{step === "tiers" && (
				<div className="space-y-4">
					{tiers.map((tier, i) => (
						<div key={i} className="bg-surface-container-low rounded-2xl p-4 border border-outline-variant space-y-3">
							<div className="flex items-center justify-between">
								<span className="text-sm font-bold">Tier {i + 1}</span>
								{tiers.length > 1 && (
									<button
										type="button"
										onClick={() => removeTier(i)}
										className="text-xs text-red-500 hover:underline"
									>
										{t("tiers.remove")}
									</button>
								)}
							</div>
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="block text-xs font-semibold mb-1">{t("tiers.name")}</label>
									<input
										className="w-full border border-outline-variant rounded-xl px-3 py-2 text-sm bg-surface focus:outline-none focus:border-[#FF5A2E]"
										placeholder={t("tiers.namePlaceholder")}
										value={tier.name}
										onChange={(e) => updateTier(i, "name", e.target.value)}
									/>
								</div>
								<div>
									<label className="block text-xs font-semibold mb-1">{t("tiers.price")}</label>
									<FormattedNumberInput
										className="w-full border border-outline-variant rounded-xl px-3 py-2 text-sm bg-surface focus:outline-none focus:border-[#FF5A2E]"
										placeholder="0"
										value={tier.price}
										onChange={(v) => updateTier(i, "price", v)}
									/>
								</div>
								<div>
									<label className="block text-xs font-semibold mb-1">{t("tiers.capacity")}</label>
									<FormattedNumberInput
										className="w-full border border-outline-variant rounded-xl px-3 py-2 text-sm bg-surface focus:outline-none focus:border-[#FF5A2E]"
										placeholder={t("tiers.capacityPlaceholder")}
										value={tier.capacity}
										onChange={(v) => updateTier(i, "capacity", v)}
									/>
								</div>
							</div>
						</div>
					))}

					{!canNextFromTiers && (
						<p className="text-sm text-on-surface-variant">{t("tiers.noTiers")}</p>
					)}

					<button
						type="button"
						onClick={addTier}
						className="w-full border-2 border-dashed border-outline-variant rounded-xl py-3 text-sm font-semibold text-on-surface-variant hover:border-[#FF5A2E] hover:text-[#FF5A2E] transition"
					>
						+ {t("tiers.add")}
					</button>

					<div className="flex justify-between pt-2">
						<button
							type="button"
							onClick={() => setStep("details")}
							className="text-sm font-semibold text-on-surface-variant hover:underline"
						>
							{t("form.back")}
						</button>
						<button
							type="button"
							disabled={!canNextFromTiers}
							onClick={() => setStep("review")}
							className="bg-[#FF5A2E] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-40 transition"
						>
							{t("form.next")}
						</button>
					</div>
				</div>
			)}

			{/* Step 3: Review */}
			{step === "review" && (
				<div className="space-y-6">
					<div className="bg-surface-container-low rounded-2xl p-5 border border-outline-variant space-y-2">
						<p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">{t("review.event")}</p>
						<p className="text-lg font-black">{title}</p>
						{description && <p className="text-sm text-on-surface-variant">{description}</p>}
						{(venue || city) && (
							<p className="text-sm text-on-surface-variant">{[venue, city].filter(Boolean).join(", ")}</p>
						)}
						{eventDate && (
							<p className="text-sm text-on-surface-variant">
								{new Date(eventDate).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
							</p>
						)}
					</div>

					<div>
						<p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant mb-3">{t("review.tiers")}</p>
						<div className="space-y-2">
							{tiers.filter((t) => t.name && t.price).map((tier, i) => (
								<div key={i} className="flex items-center justify-between bg-surface-container-low rounded-xl px-4 py-3 border border-outline-variant">
									<span className="text-sm font-semibold">{tier.name}</span>
									<div className="flex items-center gap-4 text-sm text-on-surface-variant">
										{tier.capacity && <span>{tier.capacity} capacity</span>}
										<span className="font-bold text-on-surface">
											{Number(tier.price) === 0 ? t("review.free") : `₦${Number(tier.price).toLocaleString()}`}
										</span>
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Commission agreement */}
					<div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 space-y-3">
						<div className="flex items-center gap-2">
							<svg className="w-4 h-4 text-[#FF5A2E] shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
								<path d="M9 12l2 2 4-4M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
							</svg>
							<p className="text-sm font-black text-[#FF5A2E]">{t("review.commissionTitle")}</p>
						</div>
						<p className="text-xs text-orange-800 leading-relaxed">{t("review.commissionBody")}</p>
						<ul className="space-y-2">
							{(["commissionPoint1", "commissionPoint2", "commissionPoint3", "commissionPoint4", "commissionPoint5"] as const).map((key) => (
								<li key={key} className="flex items-start gap-2 text-xs text-orange-800 leading-relaxed">
									<span className="text-[#FF5A2E] font-black mt-0.5 shrink-0">•</span>
									{t(`review.${key}`)}
								</li>
							))}
						</ul>
						<label className="flex items-start gap-3 pt-1 cursor-pointer">
							<input
								type="checkbox"
								className="mt-0.5 h-4 w-4 accent-[#FF5A2E] shrink-0 cursor-pointer"
								checked={commissionAccepted}
								onChange={(e) => setCommissionAccepted(e.target.checked)}
							/>
							<span className="text-xs font-semibold text-orange-900 leading-relaxed">
								{t("review.commissionCheckbox")}
							</span>
						</label>
					</div>

					<div className="flex justify-between pt-2 gap-3">
						<button
							type="button"
							onClick={() => setStep("tiers")}
							className="text-sm font-semibold text-on-surface-variant hover:underline"
						>
							{t("form.back")}
						</button>
						<div className="flex gap-3">
							<button
								type="button"
								disabled={createMutation.isPending}
								onClick={() => createMutation.mutate(false)}
								className="border border-outline-variant text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-surface-container disabled:opacity-50 transition"
							>
								{createMutation.isPending ? t("creating") : t("review.saveDraft")}
							</button>
							<button
								type="button"
								disabled={createMutation.isPending || !commissionAccepted}
								onClick={() => createMutation.mutate(true)}
								className="bg-[#FF5A2E] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition"
								title={!commissionAccepted ? t("review.commissionRequired") : undefined}
							>
								{createMutation.isPending ? t("publishing") : t("review.publish")}
							</button>
						</div>
					</div>

					{!commissionAccepted && (
						<p className="text-xs text-orange-600 text-right">{t("review.commissionRequired")}</p>
					)}

					{createMutation.isError && (
						<p className="text-sm text-red-600">{String(createMutation.error)}</p>
					)}
				</div>
			)}
		</div>
	);
}
