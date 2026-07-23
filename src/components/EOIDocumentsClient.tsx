"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Icon from "@/components/icons";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { getEOIDocuments, getEOIs, uploadEOIDocument } from "@/app/actions";
import { Link } from "@/i18n/routing";

type DocType = "cac" | "financial_statements" | "tour_itinerary" | "other";

// EOIs submitted before required_documents existed have no structured
// selection — fall back to the original fixed list for those.
const LEGACY_DOC_TYPES: DocType[] = ["cac", "financial_statements", "tour_itinerary", "other"];

const DOC_TYPE_ICONS: Record<string, string> = {
	cac: "id-card",
	financial_statements: "financing",
	tour_itinerary: "map",
	other: "file-text",
};

export default function EOIDocumentsClient() {
	const t = useTranslations("EOIDocumentsPage");
	const searchParams = useSearchParams();
	const eoiId = searchParams.get("eoiId") ?? "";
	const queryClient = useQueryClient();
	const fileInputRef = useRef<HTMLInputElement>(null);
	const [activeDocType, setActiveDocType] = useState<string>("cac");
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

	const requiredDocs = (currentEoi as Record<string, unknown> | undefined)?.required_documents as
		| string[]
		| undefined;
	const docTypes: string[] =
		requiredDocs && requiredDocs.length > 0 ? [...requiredDocs, "other"] : LEGACY_DOC_TYPES;

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
		<main className="flex-1 lg:ml-64 bg-surface p-6 md:px-10 md:pt-5 md:pb-10">
			<Link
				href="/dashboard"
				className="inline-flex items-center gap-2 text-sm font-semibold text-on-surface-variant hover:text-primary transition mb-6"
			>
				<Icon name="arrow-left" size={16} />
				{t("backToDashboard")}
			</Link>

			<header className="mb-8">
				<span className="mb-2 block text-xs font-semibold uppercase tracking-[0.3em] text-primary">
					TourStack
				</span>
				<h1 className="text-3xl font-semibold tracking-tight text-on-surface md:text-4xl font-(family-name:--font-manrope)">
					{t("title")}
				</h1>
				<p className="mt-3 text-base leading-relaxed text-on-surface-variant">{t("description")}</p>
			</header>

			{approvedEois.length === 0 ? (
				<div className="rounded-3xl border-2 border-dashed border-outline-variant/40 bg-surface-container/30 p-12 text-center">
					<Icon name="folder" size={36} className="text-on-surface-variant/50 mb-3 block" />
					<p className="text-sm text-on-surface-variant">{t("noDocsYet")}</p>
				</div>
			) : (
				<div className="grid gap-6 lg:grid-cols-12">
					{approvedEois.length > 1 && (
						<div className="lg:col-span-4 space-y-2">
							{approvedEois.map((eoi) => (
								<Link
									key={String(eoi.id)}
									href={`/eoi/documents?eoiId=${String(eoi.id)}`}
									className={`block rounded-2xl border p-4 transition ${String(eoi.id) === effectiveEoiId ? "border-primary bg-primary/5" : "border-outline-variant/30 hover:bg-surface-container-low"}`}
								>
									<p className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
										EOI-{String(eoi.id).slice(-4).toUpperCase()}
									</p>
									<p className="text-sm font-semibold text-on-surface">
										{String((eoi as Record<string, unknown>).artist
											? ((eoi as Record<string, unknown>).artist as Record<string, unknown>).name ?? "Artist"
											: "Artist")}
									</p>
								</Link>
							))}
						</div>
					)}

					<div className={approvedEois.length > 1 ? "lg:col-span-8" : "lg:col-span-12"}>
						<div className="tsd-card p-6 md:p-8 space-y-6">
							{/* Upload section */}
							<div>
								<p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary mb-3">
									{t("uploadBtn")}
								</p>
								<div className="grid gap-2 sm:grid-cols-2 mb-4">
									{docTypes.map((dt) => (
										<button
											key={dt}
											type="button"
											onClick={() => setActiveDocType(dt)}
											className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${activeDocType === dt ? "border-primary bg-primary/5 text-primary font-semibold" : "border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low"}`}
										>
											<Icon name={DOC_TYPE_ICONS[dt] ?? "file-text"} size={16} className="shrink-0" />
											{t(`docTypes.${dt}` as Parameters<typeof t>[0])}
										</button>
									))}
								</div>
								<button
									type="button"
									onClick={() => fileInputRef.current?.click()}
									disabled={uploadMutation.isPending}
									className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-60"
								>
									<Icon name="upload" size={16} />
									{uploadMutation.isPending ? t("uploading") : `${t("uploadBtn")}: ${t(`docTypes.${activeDocType}` as Parameters<typeof t>[0])}`}
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
								<p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary mb-3">
									{t("uploadedDocs")}
								</p>
								{docsLoading ? (
									<div className="h-20 rounded-2xl bg-surface-container animate-pulse" />
								) : docs.length === 0 ? (
									<p className="text-sm text-on-surface-variant">{t("noDocsYet")}</p>
								) : (
									<div className="space-y-2">
										{docs.map((doc) => (
											<div key={doc.id} className="flex items-center gap-3 rounded-xl border border-outline-variant/30 bg-surface-container px-4 py-3">
												<Icon name="file-text" size={18} className="text-on-surface-variant shrink-0" />
												<div className="flex-1 min-w-0">
													<p className="text-sm font-semibold text-on-surface truncate">{doc.file_name}</p>
													<p className="text-xs text-on-surface-variant">
														{t(`docTypes.${doc.document_type as DocType}` as Parameters<typeof t>[0])} · {t("uploadedOn")}{" "}
														{new Date(doc.uploaded_at).toLocaleDateString()}
													</p>
												</div>
												<a
													href={`/api/download/${doc.storage_id}`}
													download={doc.file_name}
													className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
												>
													<Icon name="download" size={12} />
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
