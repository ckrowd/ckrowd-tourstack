"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { deleteAdminTour } from "@/app/actions";
import { Link } from "@/i18n/routing";

export default function TourActionsMenu({ tourId }: { tourId: string }) {
	const t = useTranslations("TourActionsMenu");
	const router = useRouter();
	const [open, setOpen] = useState(false);
	const [confirmingDelete, setConfirmingDelete] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!open) return;
		function onClickOutside(e: MouseEvent) {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setOpen(false);
			}
		}
		document.addEventListener("mousedown", onClickOutside);
		return () => document.removeEventListener("mousedown", onClickOutside);
	}, [open]);

	const mutation = useMutation({
		mutationFn: () => deleteAdminTour(tourId),
		onSuccess: (result) => {
			if (!result.success) {
				setError(result.error || t("errorGeneric"));
				return;
			}
			setConfirmingDelete(false);
			setOpen(false);
			router.refresh();
		},
		onError: (err) => {
			setError(err instanceof Error ? err.message : t("errorGeneric"));
		},
	});

	return (
		<div className="relative" ref={menuRef}>
			<button
				type="button"
				aria-haspopup="menu"
				aria-expanded={open}
				aria-label={t("openMenu")}
				onClick={() => setOpen((v) => !v)}
				className="ml-4 p-2 text-on-surface-variant hover:text-[#FF5A30] hover:bg-[#FF5A30]/10 rounded-lg transition-colors"
			>
				<span className="material-symbols-outlined">more_vert</span>
			</button>

			{open && (
				<div
					role="menu"
					className="absolute right-0 mt-2 w-44 bg-surface rounded-xl shadow-lg border border-outline-variant/30 z-20 py-1"
				>
					<Link
						role="menuitem"
						href={`/admin/tours/${tourId}`}
						onClick={() => setOpen(false)}
						className="flex items-center gap-2 px-3 py-2 text-sm text-on-surface hover:bg-surface-container-low"
					>
						<span className="material-symbols-outlined text-base">
							open_in_new
						</span>
						{t("viewDetail")}
					</Link>
					<button
						type="button"
						role="menuitem"
						onClick={() => {
							setOpen(false);
							setConfirmingDelete(true);
							setError(null);
						}}
						className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
					>
						<span className="material-symbols-outlined text-base">delete</span>
						{t("delete")}
					</button>
				</div>
			)}

			{confirmingDelete && (
				<div
					className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby={`tour-delete-${tourId}-title`}
				>
					<div className="bg-surface rounded-2xl shadow-xl max-w-md w-full p-6">
						<h3
							id={`tour-delete-${tourId}-title`}
							className="text-lg font-bold text-on-surface mb-2"
						>
							{t("deleteTitle")}
						</h3>
						<p className="text-sm text-on-surface-variant mb-4">
							{t("deleteDescription")}
						</p>

						{error && (
							<p className="mb-3 text-sm text-red-600 font-semibold">{error}</p>
						)}

						<div className="flex justify-end gap-2">
							<button
								type="button"
								onClick={() => {
									setConfirmingDelete(false);
									setError(null);
								}}
								disabled={mutation.isPending}
								className="px-4 py-2 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
							>
								{t("cancel")}
							</button>
							<button
								type="button"
								onClick={() => mutation.mutate()}
								disabled={mutation.isPending}
								className="px-4 py-2 rounded-lg text-sm font-bold bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
							>
								{mutation.isPending ? t("deleting") : t("confirmDelete")}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
