"use client";

import Image from "next/image";
import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { Link, useRouter } from "@/i18n/routing";
import { createAdminTour, uploadTourImage } from "../../../../actions";

export default function CreateTourPage() {
	const router = useRouter();
	const t = useTranslations("CreateTourPage");
	const [imageFile, setImageFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string>("");
	const fileInputRef = useRef<HTMLInputElement>(null);

	const createMutation = useMutation({
		mutationFn: async ({
			formData,
			file,
		}: {
			formData: FormData;
			file: File | null;
		}) => {
			let imageUrl: string | undefined;
			if (file) {
				const uploadData = new FormData();
				uploadData.append("file", file);
				const uploadResult = await uploadTourImage(uploadData);
				if (!uploadResult.success) {
					return {
						success: false as const,
						error: uploadResult.error ?? t("errorImageUpload"),
						data: undefined,
					};
				}
				imageUrl = uploadResult.data;
			}

			const technicalRequirements = (
				formData.get("technical_requirements") as string | null
			)?.trim();
			const marketsRaw = (formData.get("markets") as string | null)?.trim();
			const markets = marketsRaw
				? marketsRaw.split(",").map((m) => m.trim()).filter(Boolean)
				: [];
			const bio = (formData.get("bio") as string | null)?.trim();

			return createAdminTour({
				artist_name: formData.get("artist_name") as string,
				tour_name: formData.get("tour_name") as string,
				fee_min: Number(formData.get("fee_min")),
				fee_max: Number(formData.get("fee_max")),
				date_from: formData.get("date_from") as string,
				date_to: formData.get("date_to") as string,
				genre: formData.get("genre") as string,
				...(technicalRequirements ? { technical_requirements: technicalRequirements } : {}),
				region: (formData.get("region") as string) || undefined,
				markets: markets.length > 0 ? markets : undefined,
				image_url: imageUrl || undefined,
				bio: bio || undefined,
			});
		},
		onSuccess: (result) => {
			if (result.success) {
				router.push("/admin/artists");
			}
		},
	});

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file) return;
		setImageFile(file);
		setImagePreview(URL.createObjectURL(file));
	}

	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		createMutation.mutate({ formData: new FormData(e.currentTarget), file: imageFile });
	}

	const errorMessage = createMutation.error
		? createMutation.error instanceof Error
			? createMutation.error.message
			: t("errorUnexpected")
		: createMutation.data && !createMutation.data.success
			? (createMutation.data.error ?? t("errorFailed"))
			: null;

	return (
		<>
			<div className="mb-10 flex items-center gap-4">
				<Link
					href="/admin/artists"
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

				{errorMessage && (
					<div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-700 text-sm font-semibold flex items-center gap-2">
						<span className="material-symbols-outlined">error</span>
						{errorMessage}
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

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<div>
							<label
								htmlFor="region"
								className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider"
							>
								{t("region")}
							</label>
							<div className="relative">
								<select
									id="region"
									name="region"
									required
									className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm font-medium text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none appearance-none"
								>
									<option value="West Africa">{t("regions.westAfrica")}</option>
									<option value="East Africa">{t("regions.eastAfrica")}</option>
									<option value="Southern Africa">{t("regions.southernAfrica")}</option>
									<option value="North Africa">{t("regions.northAfrica")}</option>
									<option value="Central Africa">{t("regions.centralAfrica")}</option>
								</select>
								<span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
									expand_more
								</span>
							</div>
						</div>
						<div>
							<label
								htmlFor="markets"
								className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider"
							>
								{t("tourCities")}
							</label>
							<input
								id="markets"
								name="markets"
								type="text"
								placeholder={t("placeholderTourCities")}
								className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none"
							/>
						</div>
					</div>

					<div>
						<label
							htmlFor="image_upload"
							className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider"
						>
							{t("tourImage")}
						</label>
						<div
							role="button"
							tabIndex={0}
							className="relative w-full rounded-xl border-2 border-dashed border-outline-variant/40 bg-surface-container-high overflow-hidden cursor-pointer hover:border-[#FF5A30]/50 transition-colors"
							style={{ minHeight: "140px" }}
							onClick={() => fileInputRef.current?.click()}
							onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
						>
							{imagePreview ? (
								<div className="relative w-full h-40">
									<Image
										src={imagePreview}
										alt="Tour image preview"
										fill
										className="object-cover"
										unoptimized
									/>
									<button
										type="button"
										onClick={(e) => {
											e.stopPropagation();
											setImageFile(null);
											setImagePreview("");
											if (fileInputRef.current) fileInputRef.current.value = "";
										}}
										className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
									>
										<span className="material-symbols-outlined text-sm">close</span>
									</button>
								</div>
							) : (
								<div className="flex flex-col items-center justify-center py-10 gap-2 text-on-surface-variant">
									<span className="material-symbols-outlined text-4xl">add_photo_alternate</span>
									<p className="text-sm font-medium">{t("uploadImageHint")}</p>
									<p className="text-xs opacity-60">{t("uploadImageTypes")}</p>
								</div>
							)}
						</div>
						<input
							ref={fileInputRef}
							id="image_upload"
							type="file"
							accept="image/jpeg,image/png,image/webp,image/gif"
							className="sr-only"
							onChange={handleFileChange}
						/>
					</div>

					<div>
						<label
							htmlFor="bio"
							className="block text-xs font-bold text-on-surface-variant mb-1.5 uppercase tracking-wider"
						>
							{t("bio")}
						</label>
						<textarea
							id="bio"
							name="bio"
							rows={3}
							placeholder={t("placeholderBio")}
							className="w-full px-4 py-3 bg-surface-container-high border-none rounded-xl text-sm text-on-surface focus:ring-2 focus:ring-[#FF5A30] outline-none resize-none"
						/>
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
							disabled={createMutation.isPending}
							className="px-8 py-4 bg-[#FF5A30] text-white rounded-xl font-(family-name:--font-manrope) font-bold shadow-lg shadow-[#FF5A30]/20 hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{createMutation.isPending ? t("publishing") : t("publish")}
						</button>
					</div>
				</form>
			</div>
		</>
	);
}
