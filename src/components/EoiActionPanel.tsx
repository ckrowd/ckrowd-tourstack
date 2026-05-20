"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { updateAdminEoi } from "@/app/actions";

type Action = "approve" | "revision" | "reject";

const ACTION_STATUS: Record<Action, "approved" | "needs_revision" | "rejected"> =
	{
		approve: "approved",
		revision: "needs_revision",
		reject: "rejected",
	};

export default function EoiActionPanel({ eoiId }: { eoiId: string }) {
	const t = useTranslations("EoiActionPanel");
	const router = useRouter();
	const [open, setOpen] = useState<Action | null>(null);
	const [notes, setNotes] = useState("");
	const [error, setError] = useState<string | null>(null);

	const mutation = useMutation({
		mutationFn: async (action: Action) => {
			const body: Parameters<typeof updateAdminEoi>[1] = {
				status: ACTION_STATUS[action],
			};
			if (action === "revision") body.revisionNotes = notes.trim();
			else if (notes.trim()) body.flagNote = notes.trim();
			return updateAdminEoi(eoiId, body);
		},
		onSuccess: (result) => {
			if (!result.success) {
				setError(result.error || t("errorGeneric"));
				return;
			}
			setOpen(null);
			setNotes("");
			setError(null);
			router.refresh();
		},
		onError: (err) => {
			setError(err instanceof Error ? err.message : t("errorGeneric"));
		},
	});

	function startAction(action: Action) {
		setOpen(action);
		setNotes("");
		setError(null);
	}

	function submit() {
		if (open === "revision" && notes.trim().length === 0) {
			setError(t("revisionNotesRequired"));
			return;
		}
		mutation.mutate(open as Action);
	}

	return (
		<>
			<div className="flex flex-wrap md:flex-nowrap items-center gap-3 pt-4 border-t border-outline-variant/10">
				<button
					type="button"
					onClick={() => startAction("approve")}
					className="flex-1 py-2.5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-emerald-100 transition-colors"
				>
					<span className="material-symbols-outlined text-sm">check_circle</span>
					{t("approve")}
				</button>
				<button
					type="button"
					onClick={() => startAction("revision")}
					className="flex-1 py-2.5 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors"
				>
					<span className="material-symbols-outlined text-sm">edit_note</span>
					{t("revision")}
				</button>
				<button
					type="button"
					onClick={() => startAction("reject")}
					className="flex-1 py-2.5 bg-red-50 text-red-700 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5 hover:bg-red-100 transition-colors"
				>
					<span className="material-symbols-outlined text-sm">cancel</span>
					{t("reject")}
				</button>
			</div>

			{open && (
				<div
					className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4"
					role="dialog"
					aria-modal="true"
					aria-labelledby={`eoi-action-${eoiId}-title`}
				>
					<div className="bg-surface rounded-2xl shadow-xl max-w-md w-full p-6">
						<h3
							id={`eoi-action-${eoiId}-title`}
							className="text-lg font-bold text-on-surface mb-2"
						>
							{t(`${open}Title`)}
						</h3>
						<p className="text-sm text-on-surface-variant mb-4">
							{t(`${open}Description`)}
						</p>

						<label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
							{open === "revision"
								? t("revisionNotesLabel")
								: t("optionalNotesLabel")}
						</label>
						<textarea
							value={notes}
							onChange={(e) => setNotes(e.target.value)}
							rows={3}
							className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:ring-2 focus:ring-[#FF5A30]/40"
							placeholder={
								open === "revision"
									? t("revisionNotesPlaceholder")
									: t("optionalNotesPlaceholder")
							}
						/>

						{error && (
							<p className="mt-2 text-sm text-red-600 font-semibold">{error}</p>
						)}

						<div className="flex justify-end gap-2 mt-5">
							<button
								type="button"
								onClick={() => {
									setOpen(null);
									setError(null);
								}}
								disabled={mutation.isPending}
								className="px-4 py-2 rounded-lg text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low disabled:opacity-50"
							>
								{t("cancel")}
							</button>
							<button
								type="button"
								onClick={submit}
								disabled={mutation.isPending}
								className={`px-4 py-2 rounded-lg text-sm font-bold text-white disabled:opacity-60 ${
									open === "approve"
										? "bg-emerald-600 hover:bg-emerald-700"
										: open === "revision"
											? "bg-blue-600 hover:bg-blue-700"
											: "bg-red-600 hover:bg-red-700"
								}`}
							>
								{mutation.isPending ? t("submitting") : t(`${open}Confirm`)}
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
