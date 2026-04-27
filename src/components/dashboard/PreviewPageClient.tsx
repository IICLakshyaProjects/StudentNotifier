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
};

export function PreviewPageClient({ studentName, campus, dateTime, address, location }: PreviewPageClientProps) {
  const previewRef = React.useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] = React.useState(false);

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
          <Button type="button" variant="secondary" onClick={downloadPreviewPdf} disabled={isExporting}>
            Download PDF
          </Button>
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
        />
      </div>
    </div>
  );
}
