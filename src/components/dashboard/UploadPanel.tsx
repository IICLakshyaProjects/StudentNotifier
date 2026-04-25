"use client";

import * as React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const SAMPLE_CSV = `email,Student Name,Parent Name,WhatsApp No,Campus,Date,Time,Location Link
student@example.com,John Doe,Mr Doe,+911234567890,Main Campus,2026-04-25,10:30,https://maps.google.com/?q=campus
`;

function downloadSampleCsv() {
  const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "student-notifier-sample.csv";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

type UploadResponse = {
  ok: boolean;
  dryRun?: boolean;
  summary?: {
    totalRows: number;
    validRecords: number;
    invalidRows: number;
    sent?: number;
    failed?: number;
  };
  rowErrors?: Array<{ row: number; errors: string[] }>;
};

async function uploadFile(file: File, dryRun: boolean) {
  const form = new FormData();
  form.append("file", file);
  if (dryRun) form.append("dryRun", "true");

  const res = await fetch("/api/upload", {
    method: "POST",
    body: form,
    credentials: "include",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Upload failed");
  return data as UploadResponse;
}

export function UploadPanel() {
  const [file, setFile] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [result, setResult] = React.useState<UploadResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [hasValidatedOnce, setHasValidatedOnce] = React.useState(false);

  async function validate() {
    if (!file) return;
    setError(null);
    setResult(null);
    setHasValidatedOnce(true);
    setIsLoading(true);
    try {
      const res = await uploadFile(file, true);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || "Upload failed");
    } finally {
      setIsLoading(false);
    }
  }

  async function sendNow() {
    if (!file) return;
    setError(null);
    setResult(null);
    setIsLoading(true);
    try {
      const res = await uploadFile(file, false);
      setResult(res);
    } catch (err: any) {
      setError(err?.message || "Upload failed");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <Card>
        <CardHeader>
          <div className="text-lg font-semibold text-slate-900">Bulk upload</div>
          <div className="mt-1 text-sm text-slate-600">
            Upload a file and notify everyone in it. Validation is optional, but recommended.
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded-2xl border border-dashed border-slate-200/80 bg-white/50 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-900">Upload file</div>
                  <div className="mt-1 text-xs text-slate-500">
                    Supported: .csv, .xlsx, .xls
                  </div>
                </div>
                <Button type="button" variant="secondary" onClick={downloadSampleCsv}>
                  Download sample CSV
                </Button>
              </div>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => {
                    setFile(e.target.files?.[0] || null);
                    setResult(null);
                    setError(null);
                    setHasValidatedOnce(false);
                  }}
                  className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-xl file:border-0 file:bg-gradient-to-b file:from-indigo-600 file:to-indigo-700 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:from-indigo-500 hover:file:to-indigo-700"
                />
                {file ? (
                  <div className="inline-flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white/70 px-3 py-2 text-xs text-slate-700">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="max-w-[220px] truncate">{file.name}</span>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                onClick={sendNow}
                isLoading={isLoading}
                disabled={!file}
              >
                Send notifications
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={validate}
                isLoading={isLoading}
                disabled={!file}
              >
                Validate (optional)
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setFile(null);
                  setResult(null);
                  setError(null);
                  setHasValidatedOnce(false);
                }}
              >
                Clear
              </Button>
            </div>
            <div className="text-xs text-slate-500">
              {hasValidatedOnce
                ? "Validation results are shown on the right."
                : "Tip: Run validation to catch missing columns and row issues before sending."}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-sm font-medium text-slate-900">Summary</div>
          <div className="mt-1 text-xs text-slate-500">
            We’ll highlight rows that need fixing.
          </div>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : result?.summary ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-xl border border-slate-200/70 bg-white/60 px-3 py-2">
                  <div className="text-xs text-slate-500">Total rows</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {result.summary.totalRows}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-white/60 px-3 py-2">
                  <div className="text-xs text-slate-500">Valid</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {result.summary.validRecords}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200/70 bg-white/60 px-3 py-2">
                  <div className="text-xs text-slate-500">Invalid</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {result.summary.invalidRows}
                  </div>
                </div>
                {"sent" in result.summary ? (
                  <div className="rounded-xl border border-slate-200/70 bg-white/60 px-3 py-2">
                    <div className="text-xs text-slate-500">Sent / Failed</div>
                    <div className="text-lg font-semibold text-slate-900">
                      {result.summary.sent} / {result.summary.failed}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-slate-200/70 bg-white/60 px-3 py-2">
                    <div className="text-xs text-slate-500">Mode</div>
                    <div className="text-lg font-semibold text-slate-900">
                      Validate
                    </div>
                  </div>
                )}
              </div>

              {result.rowErrors?.length ? (
                <div className="mt-4">
                  <div className="text-sm font-medium text-slate-900">
                    Row errors
                  </div>
                  <div className="mt-2 max-h-72 overflow-auto rounded-xl border border-slate-200/70 bg-white/70 backdrop-blur">
                    <ul className="divide-y divide-slate-200/70">
                      {result.rowErrors.slice(0, 50).map((re) => (
                        <li key={re.row} className="p-3">
                          <div className="text-xs font-medium text-slate-900">
                            Row {re.row}
                          </div>
                          <ul className="mt-1 list-disc pl-5 text-xs text-slate-600">
                            {re.errors.map((e, i) => (
                              <li key={i}>{e}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {result.rowErrors.length > 50 ? (
                    <div className="mt-2 text-xs text-slate-500">
                      Showing first 50 row errors.
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-sm text-slate-600">
              Upload a file to see validation and send results.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

