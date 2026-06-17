"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { getEOIDocuments, getEOIs, uploadEOIDocument } from "@/app/actions";
import { Link } from "@/i18n/routing";

type DocType = "cac" | "financial_statements" | "tour_itinerary" | "other";

const DOC_TYPES: DocType[] = ["cac", "financial_statements", "tour_itinerary", "other"];

export default function EOIDocumentsClient() {
	const t = useTranslations("EOIDocumentsPage");
	const searchParams = useSearchParams();
	const eoiId = searchParams.get("eoiId") ?? "";
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [activeDocType, setActiveDocType] = useState<DocType>("cac");
	const [uploadSuccess, setUploadSuccess] = useState(false);
	const [uploadErr, setUploadErr] = useState<string | null>(null);

	const { data: eoisResult } = useQuery({
		queryKey: ["eois"],
		queryFn: () => getEOIs("approved"),
	});

	const { data: docsResult, isLoading: docsLoading } = useQuery({
		queryKey: ["eoiDocuments", eoiId],
		queryFn: () => getEOIDocuments(eoiId),
		enabled: !!eoiId,
	});

	const uploadMutation = useMutation({
		mutationFn: uploadEOIDocument,
		onSuccess: (result) => {
			if (result.success) {
				setUploadSuccess(true);
				setUploadErr(null);
				void queryClient.invalidateQueries({ queryKey: ["eoiDocuments", eoiId] });
				setTimeout(() => setUploadSuccess(false), 4000);
			} else {
				setUploadErr(result.error ?? t("uploadError"));
			}
		},
		onError: () => setUploadErr(t("uploadError")),
	});

	const approvedEois = (eoisResult?.data ?? []).filter(
		(e) => String(e.status) === "approved",
	);

	const currentEoi = approvedEois.find((e) => String(e.id) === eoiId) ?? approvedEois[0];
	const effectiveEoiId = currentEoi ? String(currentEoi.id) : "";

	function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
		const file = e.target.files?.[0];
		if (!file || !effectiveEoiId) return;
		const fd = new FormData();
		fd.append("file", file);
		fd.append("eoiId", effectiveEoiId);
		fd.append("documentType", activeDocType);
		uploadMutation.mutate(fd);
		e.target.value = "";
	}

	const docs = (docsResult?.data ?? []) as Array<{
		id: string;
		document_type: string;
		file_name: string;
		uploaded_at: string;
		storage_id: string;
	}>;

	return (
		<main className="flex-1 lg:ml-64 bg-surface p-6 md:p-10">
			<Link
				href="/dashboard"
				className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-[#FF5A30] transition mb-6"
			>
				<span className="material-symbols-outlined text-base">arrow_back</span>
				{t("backToDashboard")}
			</Link>

			<header className="mb-8">
				<span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-[#FF5A30]">
					TourStack
				</span>
				<h1 className="text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl font-(family-name:--font-manrope)">
					{t("title")}
				</h1>
				<p className="mt-3 text-base leading-relaxed text-slate-600">{t("description")}</p>
			</header>

			{approvedEois.length === 0 ? (
				<div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 p-12 text-center">
					<span className="material-symbols-outlined text-4xl text-slate-400 mb-3 block">folder_open</span>
					<p className="text-sm text-slate-500">{t("noDocsYet")}</p>
				</div>
			) : (
				<div className="grid gap-6 lg:grid-cols-12">
					{approvedEois.length > 1 && (
						<div className="lg:col-span-4 space-y-2">
							{approvedEois.map((eoi) => (
								<Link
									key={String(eoi.id)}
									href={`/eoi/documents?eoiId=${String(eoi.id)}`}
									className={`block rounded-2xl border p-4 transition ${String(eoi.id) === effectiveEoiId ? "border-[#FF5A30] bg-[#FF5A30]/5" : "border-slate-200 hover:bg-slate-50"}`}
								>
									<p className="text-xs font-bold text-[#FF5A30] uppercase tracking-wider mb-1">
										EOI-{String(eoi.id).slice(-4).toUpperCase()}
									</p>
									<p className="text-sm font-semibold text-slate-800">
										{String((eoi as Record<string, unknown>).artist
											? ((eoi as Record<string, unknown>).artist as Record<string, unknown>).name ?? "Artist"
											: "Artist")}
									</p>
								</Link>
							))}
						</div>
					)}

					<div className={approvedEois.length > 1 ? "lg:col-span-8" : "lg:col-span-12"}>
						<div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8 space-y-6">
							{/* Upload section */}
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF5A30] mb-3">
									{t("uploadBtn")}
								</p>
								<div className="grid gap-2 sm:grid-cols-2 mb-4">
									{DOC_TYPES.map((dt) => (
										<button
											key={dt}
											type="button"
											onClick={() => setActiveDocType(dt)}
											className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${activeDocType === dt ? "border-[#FF5A30] bg-[#FF5A30]/5 text-[#FF5A30] font-semibold" : "border-slate-200 text-slate-700 hover:bg-slate-50"}`}
										>
											<span className="material-symbols-outlined text-base shrink-0">
												{dt === "cac" ? "badge" : dt === "financial_statements" ? "account_balance" : dt === "tour_itinerary" ? "map" : "attach_file"}
											</span>
											{t(`docTypes.${dt}`)}
										</button>
									))}
								</div>
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									disabled={uploadMutation.isPending}
									className="inline-flex items-center gap-2 rounded-full bg-[#FF5A30] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-60"
								>
									<span className="material-symbols-outlined text-base">upload</span>
									{uploadMutation.isPending ? t("uploading") : `${t("uploadBtn")}: ${t(`docTypes.${activeDocType}`)}`}
								</button>
								<input ref={fileInputRef} type="file" className="sr-only" onChange={handleFileChange} />
								{uploadSuccess && (
									<p className="mt-3 text-sm text-emerald-700 font-medium">{t("uploadSuccess")}</p>
								)}
								{uploadErr && (
									<p className="mt-3 text-sm text-rose-600 font-medium">{uploadErr}</p>
								)}
							</div>

							{/* Uploaded documents */}
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#FF5A30] mb-3">
									{t("uploadedDocs")}
								</p>
								{docsLoading ? (
									<div className="h-20 rounded-2xl bg-slate-100 animate-pulse" />
								) : docs.length === 0 ? (
									<p className="text-sm text-slate-500">{t("noDocsYet")}</p>
								) : (
									<div className="space-y-2">
										{docs.map((doc) => (
											<div key={doc.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
												<span className="material-symbols-outlined text-slate-400 shrink-0">description</span>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-semibold text-slate-800 truncate">{doc.file_name}</p>
													<p className="text-xs text-slate-500">
														{t(`docTypes.${doc.document_type as DocType}` as Parameters<typeof t>[0])} · {t("uploadedOn")}{" "}
														{new Date(doc.uploaded_at).toLocaleDateString()}
													</p>
												</div>
												<a
													href={`/api/download/${doc.storage_id}`}
													download={doc.file_name}
													className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
												>
													<span className="material-symbols-outlined text-xs">download</span>
													{t("download")}
												</a>
											</div>
										))}
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</main>
	);
}
