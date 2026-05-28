// CSV helpers shared by directory pages.

// Quote a CSV cell only when it contains a delimiter, quote, or newline.
export function csvCell(value: string | null | undefined): string {
	const raw = value ?? "";
	// Mitigate CSV/Excel formula injection.
	const s = raw.replace(/^(\s*)([=+\-@])/, "$1'$2");
	return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

// Build a UTF-8 CSV (with BOM so Excel reads accented chars) and trigger a
// browser download. `rows` is a 2D array of already-stringified cell values.
export function downloadCsv(
	headers: string[],
	rows: string[][],
	filename: string,
) {
	const body = rows.map((row) => row.map(csvCell).join(","));
	const csv = ["﻿" + headers.map(csvCell).join(","), ...body].join("\r\n");
	const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
	const url = URL.createObjectURL(blob);
	const a = document.createElement("a");
	a.href = url;
	a.download = filename;
	document.body.appendChild(a);
	a.click();
	setTimeout(() => {
		URL.revokeObjectURL(url);
		document.body.removeChild(a);
	}, 100);
}
