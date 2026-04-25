"use client";

import * as React from "react";

import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

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

export default function UploadPage() {
  const [file, setFile] = React.useState<File | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [dryRun, setDryRun] = React.useState(true);
  const [result, setResult] = React.useState<UploadResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function onUpload() {
    if (!file) return;
    setError(null);
    setResult(null);
    setIsLoading(true);
    try {
      const res = await uploadFile(file, dryRun);
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
          <div className="text-lg font-semibold text-zinc-900">Bulk upload</div>
          <div className="mt-1 text-sm text-zinc-600">
            Upload a CSV/Excel file. Start with a dry run to validate columns & rows.
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="text-sm font-medium text-zinc-900">File</div>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm text-zinc-700 file:mr-4 file:rounded-xl file:border-0 file:bg-zinc-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800"
                />
              </div>
              <div className="mt-2 text-xs text-zinc-500">
                Supported: .csv, .xlsx, .xls
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-zinc-700">
              <input
                type="checkbox"
                checked={dryRun}
                onChange={(e) => setDryRun(e.target.checked)}
                className="h-4 w-4 rounded border-zinc-300"
              />
              Dry run (validate only, don’t send)
            </label>

            <div className="flex gap-3">
              <Button onClick={onUpload} isLoading={isLoading} disabled={!file}>
                {dryRun ? "Validate file" : "Upload & send"}
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  setFile(null);
                  setResult(null);
                  setError(null);
                }}
              >
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="text-sm font-medium text-zinc-900">Summary</div>
          <div className="mt-1 text-xs text-zinc-500">
            Row validation errors show up here.
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
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                  <div className="text-xs text-zinc-500">Total rows</div>
                  <div className="text-lg font-semibold text-zinc-900">
                    {result.summary.totalRows}
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                  <div className="text-xs text-zinc-500">Valid</div>
                  <div className="text-lg font-semibold text-zinc-900">
                    {result.summary.validRecords}
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                  <div className="text-xs text-zinc-500">Invalid</div>
                  <div className="text-lg font-semibold text-zinc-900">
                    {result.summary.invalidRows}
                  </div>
                </div>
                {"sent" in result.summary ? (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                    <div className="text-xs text-zinc-500">Sent / Failed</div>
                    <div className="text-lg font-semibold text-zinc-900">
                      {result.summary.sent} / {result.summary.failed}
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2">
                    <div className="text-xs text-zinc-500">Mode</div>
                    <div className="text-lg font-semibold text-zinc-900">
                      Dry run
                    </div>
                  </div>
                )}
              </div>

              {result.rowErrors?.length ? (
                <div className="mt-4">
                  <div className="text-sm font-medium text-zinc-900">
                    Row errors
                  </div>
                  <div className="mt-2 max-h-72 overflow-auto rounded-xl border border-zinc-200 bg-white">
                    <ul className="divide-y divide-zinc-200">
                      {result.rowErrors.slice(0, 50).map((re) => (
                        <li key={re.row} className="p-3">
                          <div className="text-xs font-medium text-zinc-900">
                            Row {re.row}
                          </div>
                          <ul className="mt-1 list-disc pl-5 text-xs text-zinc-600">
                            {re.errors.map((e, i) => (
                              <li key={i}>{e}</li>
                            ))}
                          </ul>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {result.rowErrors.length > 50 ? (
                    <div className="mt-2 text-xs text-zinc-500">
                      Showing first 50 row errors.
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : (
            <div className="text-sm text-zinc-600">
              Upload a file to see validation and send results.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

