"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { createAdminTour } from "../../../../actions";

export default function CreateTourPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const t = useTranslations("CreateTourPage");

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setLoading(true);
		setError(null);

		const formData = new FormData(e.currentTarget);
		const body = {
			artist_name: formData.get("artist_name") as string,
			tour_name: formData.get("tour_name") as string,
			fee_min: Number(formData.get("fee_min")),
			fee_max: Number(formData.get("fee_max")),
			date_from: formData.get("date_from") as string,
			date_to: formData.get("date_to") as string,
			genre: formData.get("genre") as string,
			technical_requirements: formData.get("technical_requirements") as string,
		};

		try {
			const res = await createAdminTour(
				body as unknown as Parameters<typeof createAdminTour>[0],
			);

			if (res.success) {
				router.push("/admin/tours");
			} else {
				setError(res.error || t("errorFailed"));
			}
		} catch (err) {
			const error = err as Error;
			setError(error.message || t("errorUnexpected"));
		} finally {
			setLoading(false);
		}
	}

	return (
		<>
			<div className="mb-10 flex items-center gap-4">
				<Link
					href="/admin/tours"
					className="w-10 h-10 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-container-high transition-colors"
				>
					<span className="material-symbols-outlined text-on-surface-variant">
						arrow_back
					</span>
				</Link>
				<div>
					<span className="text-xs font-bold uppercase tracking-widest text-[#FF5A30] block mb-1">
						{t("management")}
					</span>
					<h1 className="text-3xl font-black font-(family-name:--font-manrope) tracking-tight text-on-surface">
						{t("title")}
					</h1>
				</div>
			</div>

			<div className="bg-surface-container-lowest rounded-2xl p-6 md:p-8 shadow-sm">
				<div className="flex items-center gap-2 mb-8">
					<span className="material-symbols-outlined text-[#FF5A30]">
						add_circle
					</span>
					<h3 className="font-(family-name:--font-manrope) font-bold text-lg">
						{t("projectDetails")}
					</h3>
				</div>

				{error && (
					<div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-semibold flex items-center gap-2">
						<span className="material-symbols-outlined">error</span>
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label
								htmlFor="artist_name"
								className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider"
							>
								{t("artistName")}
							</label>
							<input
								id="artist_name"
								name="artist_name"
								type="text"
								required
								placeholder={t("placeholderArtist")}
								className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
							/>
						</div>
						<div>
							<label
								htmlFor="tour_name"
								className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider"
							>
								{t("tourName")}
							</label>
							<input
								id="tour_name"
								name="tour_name"
								type="text"
								required
								placeholder={t("placeholderTour")}
								className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label
								htmlFor="fee_min"
								className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider"
							>
								{t("feeMin")}
							</label>
							<input
								id="fee_min"
								name="fee_min"
								type="number"
								min="0"
								required
								placeholder={t("placeholderFeeMin")}
								className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
							/>
						</div>
						<div>
							<label
								htmlFor="fee_max"
								className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider"
							>
								{t("feeMax")}
							</label>
							<input
								id="fee_max"
								name="fee_max"
								type="number"
								min="0"
								required
								placeholder={t("placeholderFeeMax")}
								className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
							/>
						</div>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label
								htmlFor="date_from"
								className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider"
							>
								{t("availableFrom")}
							</label>
							<input
								id="date_from"
								name="date_from"
								type="date"
								required
								className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
							/>
						</div>
						<div>
							<label
								htmlFor="date_to"
								className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider"
							>
								{t("availableTo")}
							</label>
							<input
								id="date_to"
								name="date_to"
								type="date"
								required
								className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
							/>
						</div>
					</div>

					<div>
						<label
							htmlFor="genre"
							className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider"
						>
							{t("genre")}
						</label>
						<div className="relative">
							<select
								id="genre"
								name="genre"
								required
								className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm font-medium text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none appearance-none"
							>
								<option value="Afrobeats">{t("genres.afrobeats")}</option>
								<option value="Afropop">{t("genres.afropop")}</option>
								<option value="Electronic">{t("genres.electronic")}</option>
								<option value="Jazz & Soul">{t("genres.jazzSoul")}</option>
								<option value="World / Folk">{t("genres.worldFolk")}</option>
								<option value="Hip-Hop">{t("genres.hipHop")}</option>
							</select>
							<span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
								expand_more
							</span>
						</div>
					</div>

					<div>
						<label
							htmlFor="technical_requirements"
							className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider"
						>
							{t("technicalRequirements")}
						</label>
						<textarea
							id="technical_requirements"
							name="technical_requirements"
							rows={4}
							placeholder={t("placeholderRequirements")}
							className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none resize-none"
						/>
					</div>

					<div className="pt-4 flex justify-end">
						<button
							type="submit"
							disabled={loading}
							className="px-8 py-4 bg-[#FF5A30] text-white rounded-xl font-(family-name:--font-manrope) font-bold shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? t("publishing") : t("publish")}
						</button>
					</div>
				</form>
			</div>
		</>
	);
}
