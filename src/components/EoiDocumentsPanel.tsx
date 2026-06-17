"use client";

import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { getAdminEOIDocuments } from "@/app/actions";

const DOC_TYPE_LABELS: Record<string, string> = {
	cac: "CAC / Business Registration",
	financial_statements: "Financial Statements",
	tour_itinerary: "Tour Itinerary / Artist Agreement",
	other: "Other Document",
};

export default function EoiDocumentsPanel({ eoiId }: { eoiId: string }) {
	const t = useTranslations("EOIDocumentsPage");
	const { data, isLoading } = useQuery({
		queryKey: ["adminEoiDocuments", eoiId],
		queryFn: () => getAdminEOIDocuments(eoiId),
	});

	const docs = (data?.data ?? []) as Array<{
		id: string;
		document_type: string;
		file_name: string;
		uploaded_at: string;
		storage_id: string;
	}>;

	if (isLoading) {
		return <div className="h-10 rounded-xl bg-slate-100 animate-pulse mt-3" />;
	}

	if (docs.length === 0) {
		return (
			<p className="text-xs text-slate-500 mt-3 italic">{t("noDocsYet")}</p>
		);
	}

	return (
		<div className="mt-3 space-y-2">
			{docs.map((doc) => (
				<div
					key={doc.id}
					className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
				>
					<span className="material-symbols-outlined text-slate-400 text-sm shrink-0">
						description
					</span>
					<div className="flex-1 min-w-0">
						<p className="text-xs font-semibold text-slate-800 truncate">
							{doc.file_name}
						</p>
						<p className="text-[10px] text-slate-500">
							{DOC_TYPE_LABELS[doc.document_type] ?? doc.document_type} ·{" "}
							{new Date(doc.uploaded_at).toLocaleDateString()}
						</p>
					</div>
					<a
						href={`/api/download/${doc.storage_id}`}
						download={doc.file_name}
						className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-semibold text-slate-700 hover:bg-slate-100 transition shrink-0"
					>
						<span className="material-symbols-outlined text-xs">download</span>
						{t("download")}
					</a>
				</div>
			))}
		</div>
	);
}
