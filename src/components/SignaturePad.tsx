"use client";

import { useRef, useState, useEffect } from "react";

interface Props {
  value: string | null;
  onChange: (dataUrl: string | null) => void;
  label?: string;
  hint?: string;
}

export default function SignaturePad({ value, onChange, label, hint }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tab, setTab] = useState<"draw" | "upload">("draw");
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPos = useRef<{ x: number; y: number } | null>(null);

  // Restore saved signature onto canvas when switching to draw tab
  useEffect(() => {
    if (tab !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (value) {
      const img = new Image();
      img.onload = () => ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      img.src = value;
    }
  }, [tab, value]);

  function getPos(e: React.MouseEvent | React.TouchEvent) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    if ("touches" in e) {
      const t = e.touches[0];
      return { x: (t.clientX - rect.left) * scaleX, y: (t.clientY - rect.top) * scaleY };
    }
    return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY };
  }

  function startDraw(e: React.MouseEvent | React.TouchEvent) {
    e.preventDefault();
    setIsDrawing(true);
    lastPos.current = getPos(e);
  }

  function draw(e: React.MouseEvent | React.TouchEvent) {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    const pos = getPos(e);
    const last = lastPos.current ?? pos;
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  }

  function endDraw() {
    if (!isDrawing) return;
    setIsDrawing(false);
    lastPos.current = null;
    const canvas = canvasRef.current;
    if (canvas) onChange(canvas.toDataURL("image/png"));
  }

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange(null);
  }

  function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
  }

  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-xs font-semibold uppercase tracking-widest text-on-surface-variant">
          {label}
        </p>
      )}
      {hint && <p className="text-xs text-on-surface-variant">{hint}</p>}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-surface-container-low rounded-xl w-fit">
        {(["draw", "upload"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              tab === t
                ? "bg-surface-container-lowest text-on-surface shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            {t === "draw" ? "Draw" : "Upload"}
          </button>
        ))}
      </div>

      {tab === "draw" ? (
        <div className="space-y-2">
          <canvas
            ref={canvasRef}
            width={480}
            height={160}
            className="w-full rounded-xl border-2 border-dashed border-outline-variant/30 bg-white cursor-crosshair touch-none"
            onMouseDown={startDraw}
            onMouseMove={draw}
            onMouseUp={endDraw}
            onMouseLeave={endDraw}
            onTouchStart={startDraw}
            onTouchMove={draw}
            onTouchEnd={endDraw}
          />
          <button
            type="button"
            onClick={clearCanvas}
            className="text-xs font-semibold text-on-surface-variant hover:text-red-600 transition-colors"
          >
            Clear
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-outline-variant/30 rounded-xl p-6 flex flex-col items-center gap-2 hover:border-[#FF5A30]/40 transition-colors bg-surface-container-lowest"
          >
            <span className="material-symbols-outlined text-2xl text-on-surface-variant">upload_file</span>
            <p className="text-xs text-on-surface-variant font-medium">
              Click or drag a PNG/JPEG here
            </p>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg"
            className="hidden"
            onChange={handleUpload}
          />
        </div>
      )}

      {/* Preview */}
      {value && (
        <div className="border border-outline-variant/15 rounded-xl p-3 bg-surface-container-lowest">
          <p className="text-[10px] uppercase font-semibold text-on-surface-variant mb-2">
            Signature preview
          </p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Signature preview"
            className="max-h-16 object-contain"
          />
        </div>
      )}
    </div>
  );
}
