"use client";

import { useEffect, useId, useRef, useState } from "react";

// Must match SIG constants in ckrowd-prisma/server/services/eoi-pdf.service.ts
const SIG = {
	imgY:         88,   // bottom edge of the signature image area
	imgMaxH:      65,   // max signature image height
	nameY:        68,   // signatory name text y
	orgNameY:     55,   // signatory org name text y
	narrowSigColW: 150, // column width used for all sig columns
} as const;

interface Props {
  eoiId: string;
  portal: "finance" | "insurance";
  adminSignature: string | null;
  adminName: string | null;      // name of the person who signed (right side)
  adminOrgName: string | null;   // their organisation name (right side)
  ceoSignature: string | null;
  onClose: () => void;
}

async function buildSignedPdfUrl(
  eoiId: string,
  portal: string,
  ceoSig: string | null,
  adminSig: string | null,
  adminName: string | null,
  adminOrgName: string | null,
): Promise<string> {
  const { PDFDocument, rgb } = await import("pdf-lib");

  const pdfUrl = `/api/eoi-pdf/${encodeURIComponent(eoiId)}?portal=${portal}`;
  const resp = await fetch(pdfUrl);
  if (!resp.ok) throw new Error("Failed to fetch PDF");
  const pdfBytes = await resp.arrayBuffer();

  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const pages = pdfDoc.getPages();
  const lastPage = pages[pages.length - 1];
  const { width } = lastPage.getSize();

  const ML = 56;
  const MR = 56;
  const NARROW = SIG.narrowSigColW;

  // Fixed x positions — must match eoi-pdf.service.ts
  const ceoSigX = ML;
  const finSigX = width - MR - NARROW;
  const insSigX = (width - NARROW) / 2;
  const adminSigX = portal === "insurance" ? insSigX : finSigX;

  // Embed a signature image naturally — no box, just the image sitting above the underline
  async function embedSig(dataUrl: string, x: number) {
    try {
      const isJpeg = dataUrl.startsWith("data:image/jpeg") || dataUrl.startsWith("data:image/jpg");
      const base64 = dataUrl.split(",")[1];
      if (!base64) return;
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const img = isJpeg ? await pdfDoc.embedJpg(bytes) : await pdfDoc.embedPng(bytes);
      const dims = img.scale(1);
      // Scale to fit within NARROW × imgMaxH, preserving aspect ratio
      const scale = Math.min(NARROW / dims.width, SIG.imgMaxH / dims.height);
      const dw = dims.width * scale;
      const dh = dims.height * scale;
      // Place image so its BOTTOM edge aligns with SIG.imgY
      lastPage.drawImage(img, {
        x,
        y: SIG.imgY,
        width: dw,
        height: dh,
      });
    } catch {
      // If embedding fails, draw a faint handwriting-style squiggle line
      lastPage.drawLine({
        start: { x, y: SIG.imgY + 20 },
        end:   { x: x + 80, y: SIG.imgY + 30 },
        color: rgb(0.3, 0.3, 0.3),
        thickness: 1.2,
      });
    }
  }

  // LEFT: CEO signature
  if (ceoSig) await embedSig(ceoSig, ceoSigX);

  // Finance (far right) or Insurance (centred): admin signature
  if (adminSig) await embedSig(adminSig, adminSigX);

  // Admin signatory name + org name below the underline (comes from localStorage, not backend)
  if (adminName || adminOrgName) {
    const font = await pdfDoc.embedFont("Helvetica-Bold" as Parameters<typeof pdfDoc.embedFont>[0]);
    const regFont = await pdfDoc.embedFont("Helvetica" as Parameters<typeof pdfDoc.embedFont>[0]);

    if (adminName) {
      lastPage.drawText(adminName, {
        x: adminSigX,
        y: SIG.nameY,
        size: 8,
        font,
        color: rgb(0.08, 0.08, 0.08),
      });
    }
    if (adminOrgName) {
      lastPage.drawText(adminOrgName, {
        x: adminSigX,
        y: SIG.orgNameY,
        size: 7.5,
        font: regFont,
        color: rgb(0.33, 0.33, 0.33),
      });
    }
  }

  const signedBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(signedBytes)], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}

export default function EoiPdfViewer({
  eoiId,
  portal,
  adminSignature,
  adminName,
  adminOrgName,
  ceoSignature,
  onClose,
}: Props) {
  const titleId = useId();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const blobRef = useRef<string | null>(null);

  const eoiIdRef      = useRef(eoiId);
  const portalRef     = useRef(portal);
  const ceoSigRef     = useRef(ceoSignature);
  const adminSigRef   = useRef(adminSignature);
  const adminNameRef  = useRef(adminName);
  const adminOrgRef   = useRef(adminOrgName);

  useEffect(() => {
    let cancelled = false;

    buildSignedPdfUrl(
      eoiIdRef.current,
      portalRef.current,
      ceoSigRef.current,
      adminSigRef.current,
      adminNameRef.current,
      adminOrgRef.current,
    )
      .then((url) => {
        if (cancelled) { URL.revokeObjectURL(url); return; }
        if (blobRef.current) URL.revokeObjectURL(blobRef.current);
        blobRef.current = url;
        setBlobUrl(url);
        setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(String(err?.message ?? "Failed to load PDF"));
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    return () => { if (blobRef.current) URL.revokeObjectURL(blobRef.current); };
  }, []);

  function downloadSigned() {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `EOI-${eoiId.slice(-6).toUpperCase()}-signed.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(blobUrl); document.body.removeChild(a); }, 100);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative flex flex-col w-full max-w-4xl h-[90vh] bg-surface-container-lowest rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-outline-variant/10 shrink-0">
          <h2 id={titleId} className="font-(family-name:--font-manrope) font-semibold text-lg text-on-surface">
            Document Preview
          </h2>
          <div className="flex items-center gap-2">
            {!ceoSignature && (
              <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg font-medium">
                CEO signature not set — configure in Admin Profile.
              </span>
            )}
            {!adminSignature && (
              <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg font-medium">
                Your signature is not set — configure in your Profile first.
              </span>
            )}
            {blobUrl && (
              <button
                type="button"
                onClick={downloadSigned}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#FF5A30] text-white rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <span className="material-symbols-outlined text-sm">download</span>
                Download Signed PDF
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="w-9 h-9 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container-high transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
              <p className="text-sm font-medium">Applying signatures…</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-red-600">
              <span className="material-symbols-outlined text-4xl">error</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : blobUrl ? (
            <iframe src={blobUrl} title="Signed EOI PDF" className="w-full h-full border-none" />
          ) : null}
        </div>
      </div>
    </div>
  );
}
