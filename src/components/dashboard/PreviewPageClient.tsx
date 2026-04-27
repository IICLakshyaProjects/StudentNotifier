"use client";

import * as React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Link from "next/link";

import { Button } from "@/components/ui/Button";
import { TemplatePreview } from "@/components/dashboard/TemplatePreview";

type PreviewPageClientProps = {
  studentName: string;
  campus: string;
  dateTime: string;
  address: string;
  location: string;
  sessionId: string;
  contactNumber: string;
};

function toLocationHref(location: string) {
  const value = location.trim();
  if (!value) return "";
  if (value === "Location" || value === "[Location]" || value.startsWith("[")) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

export function PreviewPageClient({ studentName, campus, dateTime, address, location, sessionId, contactNumber }: PreviewPageClientProps) {
  const previewRef = React.useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  const locationHref = React.useMemo(() => toLocationHref(location), [location]);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  async function downloadPreviewImage() {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = "counselling-session-preview.png";
      link.click();
    } finally {
      setIsExporting(false);
    }
  }

  async function downloadPreviewPdf() {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });
      const imageData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [canvas.width, canvas.height] });
      pdf.addImage(imageData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("counselling-session-preview.pdf");
    } finally {
      setIsExporting(false);
    }
  }

  async function copyPreviewImage() {
    if (!previewRef.current) return;
    setIsExporting(true);
    try {
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      });
      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b), "image/png")
      );
      if (!blob) throw new Error("Unable to create image");

      // ClipboardItem is supported in modern Chrome/Edge. WhatsApp Web paste works there.
      const ClipboardItemCtor = (globalThis as any).ClipboardItem;
      if (!ClipboardItemCtor || !navigator.clipboard?.write) {
        throw new Error("clipboard not supported");
      }
      const parts: Record<string, Blob> = { "image/png": blob };
      if (locationHref) {
        parts["text/plain"] = new Blob([locationHref], { type: "text/plain" });
      }
      const item = new ClipboardItemCtor(parts);
      await navigator.clipboard.write([item]);
      showToast(locationHref ? "Image + location copied. Paste it in WhatsApp Web." : "Image copied. Paste it in WhatsApp Web.");
    } catch {
      showToast("Copy not supported in this browser. Use Download PNG.");
    } finally {
      setIsExporting(false);
    }
  }

  async function copyLocationLink() {
    if (!locationHref) return;
    try {
      await navigator.clipboard.writeText(locationHref);
      showToast("Link copied.");
    } catch {
      showToast("Could not copy link.");
    }
  }

  return (
    <div className="space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200/70 bg-white/80 p-6 shadow-sm shadow-slate-900/5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Template preview</h1>
            <p className="mt-1 text-sm text-slate-600">
              Open preview page for the email template and download it as PNG or PDF.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Back to dashboard
          </Link>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Button type="button" variant="secondary" onClick={downloadPreviewImage} disabled={isExporting}>
            Download PNG
          </Button>
          <Button type="button" variant="secondary" onClick={copyPreviewImage} disabled={isExporting}>
            Copy image
          </Button>
          <Button type="button" variant="secondary" onClick={downloadPreviewPdf} disabled={isExporting}>
            Download PDF
          </Button>
          {locationHref ? (
            <>
              <a
                href={locationHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-200/80 bg-white/80 px-4 text-sm font-medium text-slate-900 shadow-sm shadow-slate-900/5 backdrop-blur hover:bg-white"
              >
                Open location
              </a>
              <Button type="button" variant="secondary" onClick={copyLocationLink}>
                Copy link
              </Button>
            </>
          ) : null}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200/70 bg-white shadow-sm p-5">
        <TemplatePreview
          ref={previewRef}
          studentName={studentName}
          campus={campus}
          dateTime={dateTime}
          address={address}
          location={location}
          sessionId={sessionId}
          contactNumber={contactNumber}
        />
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/80 p-5 shadow-sm shadow-slate-900/5">
        <div className="text-sm font-semibold text-slate-900">Location</div>
        <div className="mt-1 text-sm text-slate-600 break-words">{location}</div>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {locationHref ? (
            <>
              <a
                href={locationHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-b from-indigo-600 to-indigo-700 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 hover:from-indigo-500 hover:to-indigo-700"
              >
                Open location
              </a>
              <Button type="button" variant="secondary" onClick={copyLocationLink}>
                Copy link
              </Button>
            </>
          ) : (
            <div className="text-xs text-slate-500">
              Add a valid link to enable the buttons.
            </div>
          )}
        </div>
      </div>

      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
