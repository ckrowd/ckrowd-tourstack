"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import { createTicketEvent, publishTicketEvent } from "@/app/actions";

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

	// Step 1 — event details
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [venue, setVenue] = useState("");
	const [city, setCity] = useState("");
	const [eventDate, setEventDate] = useState("");

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
				<p className="text-xs font-black uppercase tracking-widest text-[#FF5A30] mb-1">{t("badge")}</p>
				<h1 className="text-2xl font-black text-on-surface">{t("title")}</h1>
				<p className="text-sm text-on-surface-variant mt-1">{t("description")}</p>
			</div>

			{/* Step indicator */}
			<div className="flex gap-2 mb-8">
				{STEPS.map((s, i) => (
					<div key={s} className="flex items-center gap-2">
						<div
							className={`w-6 h-6 rounded-full text-xs font-black flex items-center justify-center ${
								i <= stepIdx ? "bg-[#FF5A30] text-white" : "bg-surface-container text-on-surface-variant"
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
							className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm bg-surface focus:outline-none focus:border-[#FF5A30]"
							placeholder={t("form.titlePlaceholder")}
							value={title}
							onChange={(e) => setTitle(e.target.value)}
						/>
					</div>
					<div>
						<label className="block text-sm font-semibold mb-1">{t("form.description")}</label>
						<textarea
							rows={3}
							className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm bg-surface focus:outline-none focus:border-[#FF5A30] resize-none"
							placeholder={t("form.descriptionPlaceholder")}
							value={description}
							onChange={(e) => setDescription(e.target.value)}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div>
							<label className="block text-sm font-semibold mb-1">{t("form.venue")}</label>
							<input
								className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm bg-surface focus:outline-none focus:border-[#FF5A30]"
								placeholder={t("form.venuePlaceholder")}
								value={venue}
								onChange={(e) => setVenue(e.target.value)}
							/>
						</div>
						<div>
							<label className="block text-sm font-semibold mb-1">{t("form.city")}</label>
							<input
								className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm bg-surface focus:outline-none focus:border-[#FF5A30]"
								placeholder={t("form.cityPlaceholder")}
								value={city}
								onChange={(e) => setCity(e.target.value)}
							/>
						</div>
					</div>
					<div>
						<label className="block text-sm font-semibold mb-1">{t("form.eventDate")}</label>
						<input
							type="datetime-local"
							className="w-full border border-outline-variant rounded-xl px-4 py-3 text-sm bg-surface focus:outline-none focus:border-[#FF5A30]"
							value={eventDate}
							onChange={(e) => setEventDate(e.target.value)}
						/>
					</div>
					<div className="flex justify-end pt-2">
						<button
							type="button"
							disabled={!canNextFromDetails}
							onClick={() => setStep("tiers")}
							className="bg-[#FF5A30] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-40 transition"
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
										className="w-full border border-outline-variant rounded-xl px-3 py-2 text-sm bg-surface focus:outline-none focus:border-[#FF5A30]"
										placeholder={t("tiers.namePlaceholder")}
										value={tier.name}
										onChange={(e) => updateTier(i, "name", e.target.value)}
									/>
								</div>
								<div>
									<label className="block text-xs font-semibold mb-1">{t("tiers.price")}</label>
									<input
										type="number"
										min="0"
										className="w-full border border-outline-variant rounded-xl px-3 py-2 text-sm bg-surface focus:outline-none focus:border-[#FF5A30]"
										placeholder="0"
										value={tier.price}
										onChange={(e) => updateTier(i, "price", e.target.value)}
									/>
								</div>
								<div>
									<label className="block text-xs font-semibold mb-1">{t("tiers.capacity")}</label>
									<input
										type="number"
										min="1"
										className="w-full border border-outline-variant rounded-xl px-3 py-2 text-sm bg-surface focus:outline-none focus:border-[#FF5A30]"
										placeholder={t("tiers.capacityPlaceholder")}
										value={tier.capacity}
										onChange={(e) => updateTier(i, "capacity", e.target.value)}
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
						className="w-full border-2 border-dashed border-outline-variant rounded-xl py-3 text-sm font-semibold text-on-surface-variant hover:border-[#FF5A30] hover:text-[#FF5A30] transition"
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
							className="bg-[#FF5A30] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-40 transition"
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
								disabled={createMutation.isPending}
								onClick={() => createMutation.mutate(true)}
								className="bg-[#FF5A30] text-white font-bold text-sm px-6 py-2.5 rounded-xl hover:opacity-90 disabled:opacity-50 transition"
							>
								{createMutation.isPending ? t("publishing") : t("review.publish")}
							</button>
						</div>
					</div>

					{createMutation.isError && (
						<p className="text-sm text-red-600">{String(createMutation.error)}</p>
					)}
				</div>
			)}
		</div>
	);
}
