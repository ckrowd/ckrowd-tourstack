"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { getAdminTour, updateAdminTour } from "@/app/actions";
import Loader from "@/components/Loader";
import { use } from "react";

const TOUR_STATUSES = [
	"draft",
	"under_review",
	"needs_revision",
	"confirmed",
	"rejected",
] as const;

export default function EditTourPage({
	params,
}: {
	params: Promise<{ locale: string; id: string }>;
}) {
	const { id } = use(params);
	const router = useRouter();
	const t = useTranslations("EditTourPage");

	const { data: tourResult, isLoading } = useQuery({
		queryKey: ["admin-tour", id],
		queryFn: () => getAdminTour(id),
	});

	const tour = tourResult?.data as
		| {
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
				artist: { name: string; tour_name: string; genre: string } | null;
		  }
		| undefined;

	const mutation = useMutation({
		mutationFn: (formData: FormData) => {
			const dateRaw = formData.get("date") as string | null;
			const capacityRaw = formData.get("capacity") as string | null;
			const feeRaw = formData.get("fee_usd") as string | null;
			const financingAmountRaw = formData.get("financing_amount") as string | null;
			return updateAdminTour(id, {
				venue: (formData.get("venue") as string).trim(),
				city: (formData.get("city") as string).trim(),
				country: (formData.get("country") as string).trim() || null,
				date: dateRaw || undefined,
				capacity: capacityRaw ? Number(capacityRaw) : null,
				feeUsd: feeRaw ? Number(feeRaw) : undefined,
				status: formData.get("status") as string,
				financing: formData.get("financing") === "true",
				financingAmount: financingAmountRaw ? Number(financingAmountRaw) : null,
			});
		},
		onSuccess: (result) => {
			if (result.success) router.push(`/admin/tours/${id}`);
		},
	});

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		mutation.mutate(new FormData(e.currentTarget));
	}

	const errorMessage = mutation.data && !mutation.data.success
		? (mutation.data.error ?? t("errorFailed"))
		: null;

	const isoDate = tour?.date
		? new Date(tour.date).toISOString().slice(0, 10)
		: "";

	if (isLoading) {
		return <Loader />;
	}

	if (!tour) {
		return (
			<div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl p-6 text-sm font-medium">
				{t("notFound")}
			</div>
		);
	}

	return (
		<>
			<div className="mb-10 flex items-center gap-4">
				<Link
					href={`/admin/tours/${id}`}
					className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
				>
					<span className="material-symbols-outlined text-on-surface-variant">
						arrow_back
					</span>
				</Link>
				<div>
					<span className="text-xs font-semibold uppercase tracking-widest text-[#FF5A30] block mb-1">
						{t("badge")}
					</span>
					<h1 className="text-3xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface">
						{tour.artist?.name ?? t("untitled")}
					</h1>
					<p className="text-on-surface-variant text-sm mt-1">
						{tour.artist?.tour_name ?? ""}
					</p>
				</div>
			</div>

			<div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm">
				{errorMessage && (
					<div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-semibold flex items-center gap-2">
						<span className="material-symbols-outlined">error</span>
						{errorMessage}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label htmlFor="venue" className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
								{t("fields.venue")}
							</label>
							<input
								id="venue"
								name="venue"
								type="text"
								required
								defaultValue={tour.venue}
								placeholder={t("fields.venuePlaceholder")}
								className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
							/>
						</div>
						<div>
							<label htmlFor="city" className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
								{t("fields.city")}
							</label>
							<input
								id="city"
								name="city"
								type="text"
								required
								defaultValue={tour.city}
								placeholder={t("fields.cityPlaceholder")}
								className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label htmlFor="country" className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
								{t("fields.country")}
							</label>
							<input
								id="country"
								name="country"
								type="text"
								defaultValue={tour.country ?? ""}
								placeholder={t("fields.countryPlaceholder")}
								className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
							/>
						</div>
						<div>
							<label htmlFor="date" className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
								{t("fields.date")}
							</label>
							<input
								id="date"
								name="date"
								type="date"
								required
								defaultValue={isoDate}
								className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label htmlFor="fee_usd" className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
								{t("fields.feeUsd")}
							</label>
							<input
								id="fee_usd"
								name="fee_usd"
								type="number"
								min="0"
								required
								defaultValue={tour.fee_usd}
								placeholder={t("fields.feeUsdPlaceholder")}
								className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
							/>
						</div>
						<div>
							<label htmlFor="capacity" className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
								{t("fields.capacity")}
							</label>
							<input
								id="capacity"
								name="capacity"
								type="number"
								min="0"
								defaultValue={tour.capacity ?? ""}
								placeholder={t("fields.capacityPlaceholder")}
								className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label htmlFor="status" className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
								{t("fields.status")}
							</label>
							<div className="relative">
								<select
									id="status"
									name="status"
									defaultValue={tour.status}
									className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm font-medium text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none appearance-none"
								>
									{TOUR_STATUSES.map((s) => (
										<option key={s} value={s}>
											{s.replace(/_/g, " ")}
										</option>
									))}
								</select>
								<span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
									expand_more
								</span>
							</div>
						</div>
						<div>
							<label htmlFor="financing" className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
								{t("fields.financing")}
							</label>
							<div className="relative">
								<select
									id="financing"
									name="financing"
									defaultValue={String(tour.financing)}
									className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm font-medium text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none appearance-none"
								>
									<option value="false">{t("no")}</option>
									<option value="true">{t("yes")}</option>
								</select>
								<span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
									expand_more
								</span>
							</div>
						</div>
					</div>

					<div>
						<label htmlFor="financing_amount" className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
							{t("fields.financingAmount")}
						</label>
						<input
							id="financing_amount"
							name="financing_amount"
							type="number"
							min="0"
							defaultValue={tour.financing_amount ?? ""}
							placeholder={t("fields.financingAmountPlaceholder")}
							className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
						/>
					</div>

					<div className="pt-4 flex justify-end gap-3">
						<Link
							href={`/admin/tours/${id}`}
							className="px-6 py-3 border border-outline-variant/30 text-on-surface-variant rounded-xl font-semibold text-sm hover:bg-surface-container-low transition-colors"
						>
							{t("cancel")}
						</Link>
						<button
							type="submit"
							disabled={mutation.isPending}
							className="px-8 py-3 bg-[#FF5A30] text-white rounded-xl font-(family-name:--font-manrope) font-semibold shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-opacity disabled:opacity-50"
						>
							{mutation.isPending ? t("saving") : t("save")}
						</button>
					</div>
				</form>
			</div>
		</>
	);
}
