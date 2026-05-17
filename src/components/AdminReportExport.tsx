"use client";

import { useMutation } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { exportAdminReport } from "@/app/actions";

export default function AdminReportExport() {
	const t = useTranslations("AdminReportsPage");

	const exportMutation = useMutation({
		mutationFn: exportAdminReport,
		onSuccess: (result) => {
			if (!result.success || !result.data) return;
			// The export endpoint returns CSV text when format=csv; coerce so the
			// Blob input type stays a string regardless of the response union.
			const csv =
				typeof result.data === "string"
					? result.data
					: JSON.stringify(result.data);
			const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
			const url = URL.createObjectURL(blob);
			const a = document.createElement("a");
			a.href = url;
			a.download = `tour-report-${new Date().toISOString().slice(0, 10)}.csv`;
			document.body.appendChild(a);
			a.click();
			setTimeout(() => {
				URL.revokeObjectURL(url);
				document.body.removeChild(a);
			}, 100);
		},
	});

	const failed =
		exportMutation.error != null ||
		(exportMutation.data != null && !exportMutation.data.success);

	return (
		<div className="flex flex-col items-start gap-1 md:items-end">
			<button
				type="button"
				onClick={() => exportMutation.mutate()}
				disabled={exportMutation.isPending}
				className="flex items-center gap-2 px-6 py-3 bg-surface-container-high text-on-surface rounded-xl font-(family-name:--font-manrope) font-bold hover:bg-surface-container-highest transition-colors disabled:cursor-not-allowed disabled:opacity-60"
			>
				<span className="material-symbols-outlined text-sm">download</span>
				{exportMutation.isPending ? t("exporting") : t("exportCsv")}
			</button>
			{failed && (
				<p className="text-xs text-rose-700 font-medium">{t("exportError")}</p>
			)}
		</div>
	);
}
