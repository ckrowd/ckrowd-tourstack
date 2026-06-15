"use client";

import { useEffect, useId, useRef, useState } from "react";

interface Props {
  eoiId: string;
  portal: "finance" | "insurance";
  adminSignature: string | null;
  ceoSignature: string | null;
  onClose: () => void;
}

async function buildSignedPdfUrl(
  eoiId: string,
  portal: string,
  adminSig: string | null,
  ceoSig: string | null,
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

  // Signature area at bottom of last page
  const sigAreaY = 80;
  const sigWidth = 180;
  const sigHeight = 60;

  // Draw signature boxes
  lastPage.drawRectangle({
    x: 40,
    y: sigAreaY - 10,
    width: sigWidth + 20,
    height: sigHeight + 30,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 0.5,
    opacity: 0,
  });

  lastPage.drawRectangle({
    x: width / 2 + 20,
    y: sigAreaY - 10,
    width: sigWidth + 20,
    height: sigHeight + 30,
    borderColor: rgb(0.8, 0.8, 0.8),
    borderWidth: 0.5,
    opacity: 0,
  });

  // Helper: embed a dataUrl image and draw it
  async function embedSig(dataUrl: string, x: number, y: number) {
    try {
      const isJpeg =
        dataUrl.startsWith("data:image/jpeg") ||
        dataUrl.startsWith("data:image/jpg");
      const base64 = dataUrl.split(",")[1];
      const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
      const img = isJpeg
        ? await pdfDoc.embedJpg(bytes)
        : await pdfDoc.embedPng(bytes);
      const dims = img.scale(1);
      const scale = Math.min(sigWidth / dims.width, sigHeight / dims.height);
      lastPage.drawImage(img, {
        x,
        y,
        width: dims.width * scale,
        height: dims.height * scale,
      });
    } catch {
      // If embedding fails, draw a placeholder line
      lastPage.drawLine({
        start: { x, y: y + sigHeight / 2 },
        end: { x: x + sigWidth, y: y + sigHeight / 2 },
        color: rgb(0.4, 0.4, 0.4),
        thickness: 1,
      });
    }
  }

  if (adminSig) await embedSig(adminSig, 50, sigAreaY);
  if (ceoSig) await embedSig(ceoSig, width / 2 + 30, sigAreaY);

  // Label text using basic font
  const font = await pdfDoc.embedFont("Helvetica" as Parameters<typeof pdfDoc.embedFont>[0]);

  lastPage.drawText("Authorised Signatory", {
    x: 50,
    y: sigAreaY - 18,
    size: 7,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  lastPage.drawText("CEO, CKROWD (Kayode Adebayo)", {
    x: width / 2 + 30,
    y: sigAreaY - 18,
    size: 7,
    font,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Horizontal divider above sig area
  lastPage.drawLine({
    start: { x: 40, y: sigAreaY + sigHeight + 25 },
    end: { x: width - 40, y: sigAreaY + sigHeight + 25 },
    color: rgb(0.85, 0.85, 0.85),
    thickness: 0.5,
  });

  const signedBytes = await pdfDoc.save();
  const blob = new Blob([new Uint8Array(signedBytes)], { type: "application/pdf" });
  return URL.createObjectURL(blob);
}

export default function EoiPdfViewer({
  eoiId,
  portal,
  adminSignature,
  ceoSignature,
  onClose,
}: Props) {
  const titleId = useId();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const blobRef = useRef<string | null>(null);

  // Capture props in refs so effect only runs once per mount (component unmounts on close)
  const eoiIdRef = useRef(eoiId);
  const portalRef = useRef(portal);
  const adminSigRef = useRef(adminSignature);
  const ceoSigRef = useRef(ceoSignature);

  useEffect(() => {
    let cancelled = false;

    buildSignedPdfUrl(eoiIdRef.current, portalRef.current, adminSigRef.current, ceoSigRef.current)
      .then((url) => {
        if (cancelled) {
          URL.revokeObjectURL(url);
          return;
        }
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

    return () => {
      cancelled = true;
    };
  }, []);

  // Clean up blob on unmount
  useEffect(() => {
    return () => {
      if (blobRef.current) URL.revokeObjectURL(blobRef.current);
    };
  }, []);

  function downloadSigned() {
    if (!blobUrl) return;
    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = `EOI-${eoiId.slice(-6).toUpperCase()}-signed.pdf`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
    }, 100);
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
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-outline-variant/10 shrink-0">
          <h2 id={titleId} className="font-(family-name:--font-manrope) font-semibold text-lg text-on-surface">
            Document Preview
          </h2>
          <div className="flex items-center gap-2">
            {!adminSignature && (
              <span className="text-xs text-amber-700 bg-amber-50 px-3 py-1.5 rounded-lg font-medium">
                No signature set — configure in your Profile first.
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

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-4xl animate-spin">
                progress_activity
              </span>
              <p className="text-sm font-medium">Applying signatures…</p>
            </div>
          ) : error ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 text-red-600">
              <span className="material-symbols-outlined text-4xl">error</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : blobUrl ? (
            <iframe
              src={blobUrl}
              title="Signed EOI PDF"
              className="w-full h-full border-none"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
