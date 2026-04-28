"use client";

import * as React from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { TemplatePreview } from "@/components/dashboard/TemplatePreview";
import { apiFetch } from "@/lib/auth-client";

type SendResponse = {
  ok: boolean;
  message: { id: string; status: "sent" | "failed"; sessionId?: string };
  errors: string[];
};

type FieldType =
  | "text"
  | "email"
  | "tel"
  | "url"
  | "password"
  | "number"
  | "date"
  | "time";

type PublicField = {
  _id: string;
  label: string;
  key: string;
  type: FieldType;
  required: boolean;
  enabled: boolean;
  order: number;
};

type FieldsResponse = { ok: true; fields: PublicField[] };

type CampusDto = { _id: string; name: string; slug: string; nextSequence?: number };
type CampusesResponse = { ok: true; campuses: CampusDto[] };

function campusSlug(campus: string) {
  const cleaned = campus.replace(/[^a-z0-9]+/gi, "");
  return (cleaned || "CAMPUS").toUpperCase().slice(0, 10);
}

function hashTo6Digits(input: string) {
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (h * 31 + input.charCodeAt(i)) >>> 0;
  }
  return String(h % 1_000_000).padStart(6, "0");
}

function toLocationHref(location: string) {
  const value = location.trim();
  if (!value) return "";
  if (value === "Location" || value === "[Location]" || value.startsWith("[")) return "";
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function formatTime12h(hhmm: string) {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return "";
  const hh = Number(m[1]);
  const mm = Number(m[2]);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return "";
  if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return "";
  const suffix = hh >= 12 ? "PM" : "AM";
  const h12 = hh % 12 === 0 ? 12 : hh % 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${suffix}`;
}

export function SendPanel() {
  const [isOpen, setIsOpen] = React.useState(true);
  const [fields, setFields] = React.useState<PublicField[]>([]);
  const [campuses, setCampuses] = React.useState<CampusDto[]>([]);
  const [sentSessionId, setSentSessionId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    studentName: "",
    email: "",
    whatsapp: "",
    contactNumber: "",
    campus: "",
    date: "",
    time: "",
    address: "",
    location: "",
    extraFields: {} as Record<string, string>,
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [result, setResult] = React.useState<SendResponse | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);
  const previewRef = React.useRef<HTMLDivElement | null>(null);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

  async function sendMessage() {
    setError(null);
    setResult(null);
    setIsLoading(true);
    try {
      const res = await apiFetch<SendResponse>("/api/message/send", {
        method: "POST",
        json: form,
      });
      setResult(res);
      if (res.ok) {
        setSentSessionId(res.message.sessionId || null);
        setIsOpen(false);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Send failed");
    } finally {
      setIsLoading(false);
    }
  }

  React.useEffect(() => {
    fetch("/api/fields", { credentials: "include" })
      .then((r) => r.json())
      .then((data: FieldsResponse) => setFields(Array.isArray(data?.fields) ? data.fields : []))
      .catch(() => setFields([]));
  }, []);

  React.useEffect(() => {
    fetch("/api/campuses", { credentials: "include" })
      .then((r) => r.json())
      .then((data: CampusesResponse) =>
        setCampuses(Array.isArray(data?.campuses) ? data.campuses : [])
      )
      .catch(() => setCampuses([]));
  }, []);

  const previewStudentName = form.studentName || "Student name";
  const previewCampus = form.campus || "Campus";
  const previewTime = form.time ? formatTime12h(form.time) : "";
  const previewDateTime =
    form.date || form.time
      ? `${form.date || "Date"} · ${previewTime || form.time || "Time"}`
      : "Date · Time";
  const previewAddress = form.address || "Address";
  const previewLocation = form.location || "Location";
  const previewContactNumber = form.contactNumber || "";
  const previewExtraFields = fields
    .filter((f) => f.enabled)
    .map((f) => ({
      label: f.label,
      value: String(form.extraFields?.[f.key] || ""),
    }));
  const campusInfo = campuses.find((c) => c.name === form.campus);
  const nextSeq = Number.isFinite(Number(campusInfo?.nextSequence))
    ? Number(campusInfo?.nextSequence)
    : 1;
  const predictedSessionId = `LAK${campusSlug(previewCampus)}${String(nextSeq).padStart(5, "0")}`;
  const previewSessionId = sentSessionId || predictedSessionId;
  const previewLocationHref = toLocationHref(previewLocation);
  const previewUrl = `/dashboard/preview?studentName=${encodeURIComponent(
    form.studentName || ""
  )}&campus=${encodeURIComponent(form.campus || "")}&date=${encodeURIComponent(
    form.date || ""
  )}&time=${encodeURIComponent(form.time || "")}&address=${encodeURIComponent(
    form.address || ""
  )}&location=${encodeURIComponent(form.location || "")}&contactNumber=${encodeURIComponent(
    form.contactNumber || ""
  )}`;

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

      const ClipboardItemCtor = (globalThis as any).ClipboardItem;
      if (!ClipboardItemCtor || !navigator.clipboard?.write) {
        throw new Error("clipboard not supported");
      }
      const parts: Record<string, Blob> = { "image/png": blob };
      if (previewLocationHref) {
        const lines = [
          `Please find the campus location for ${previewCampus} here: ${previewLocationHref}`,
        ];
        if (form.contactNumber?.trim()) {
          lines.push(`Please contact campus at: ${form.contactNumber.trim()}`);
        }
        const text = lines.join("\n");
        parts["text/plain"] = new Blob([text], { type: "text/plain" });
      }
      const item = new ClipboardItemCtor(parts);
      await navigator.clipboard.write([item]);
      showToast(previewLocationHref ? "Image + location copied. Paste it where you need." : "Image copied. Paste it where you need.");
    } catch {
      showToast("Copy not supported here. Use Download PNG.");
    } finally {
      setIsExporting(false);
    }
  }

  async function copyLocationLink() {
    if (!previewLocationHref) return;
    try {
      const lines = [
        `Please find the campus location for ${previewCampus} here: ${previewLocationHref}`,
      ];
      if (form.contactNumber?.trim()) {
        lines.push(`Please contact campus at: ${form.contactNumber.trim()}`);
      }
      const text = lines.join("\n");
      await navigator.clipboard.writeText(text);
      showToast("Text + link copied.");
    } catch {
      showToast("Could not copy link.");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
      <section className="rounded-2xl border border-slate-200/70 bg-white/70 shadow-sm shadow-slate-900/5 backdrop-blur">
        <div className="flex flex-col gap-3 border-b border-slate-200/70 p-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-lg font-semibold text-slate-900">Send invite</div>
            <div className="mt-1 text-sm text-slate-600">
              Fill in the details and we’ll notify the student/parent.
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsOpen((v) => !v)}
          >
            {isOpen ? "Hide form" : "Show form"}
          </Button>
        </div>

        <div className="p-4">
          {!isOpen ? (
            <div className="text-sm text-slate-600">
              Form hidden. Click “Show form” to send another invite.
            </div>
          ) : (
            <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Student name"
                value={form.studentName}
                onChange={(e) =>
                  setForm({ ...form, studentName: e.target.value })
                }
              />
              <Input
                label="Email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                inputMode="email"
              />
              <Input
                label="Phone number"
                value={form.whatsapp}
                onChange={(e) =>
                  setForm({ ...form, whatsapp: e.target.value })
                }
                hint="Include country code if needed"
              />
              <Input
                label="Campus Contact No"
                value={form.contactNumber}
                onChange={(e) =>
                  setForm({ ...form, contactNumber: e.target.value })
                }
                hint="Used in the Important section"
              />
              <label className="block">
                <div className="mb-1.5 text-sm font-medium text-slate-900">
                  Campus
                </div>
                <select
                  className="h-11 w-full rounded-xl border border-slate-200/80 bg-white/80 px-3 text-sm text-slate-900 shadow-sm shadow-slate-900/5 backdrop-blur focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
                  value={form.campus}
                  onChange={(e) => setForm({ ...form, campus: e.target.value })}
                >
                  <option value="">Select campus…</option>
                  {campuses.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                <div className="mt-1 text-xs text-slate-500">
                  Managed in Admin → Campuses.
                </div>
              </label>
              <Input
                label="Date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
              <Input
                label="Time"
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
              />
              <div className="sm:col-span-2">
                <Input
                  label="Location link"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                  placeholder="https://…"
                />
              </div>
              <div className="sm:col-span-2">
                <Input
                  label="Address"
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                  placeholder="Campus address"
                />
              </div>

              {fields.length ? (
                <div className="sm:col-span-2">
                  <div className="mt-2 grid gap-4 sm:grid-cols-2">
                    {fields.map((f) => (
                      <Input
                        key={f._id}
                        label={f.label}
                        type={f.type}
                        required={f.required}
                        value={form.extraFields?.[f.key] || ""}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            extraFields: {
                              ...(prev.extraFields || {}),
                              [f.key]: e.target.value,
                            },
                          }))
                        }
                        placeholder={f.label}
                      />
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="sm:col-span-2 mt-2 flex flex-wrap items-center gap-3">
                <Button type="button">
                  Update preview
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() =>
                    (setSentSessionId(null),
                    setForm({
                      studentName: "",
                      email: "",
                      whatsapp: "",
                      contactNumber: "",
                      campus: "",
                      date: "",
                      time: "",
                      address: "",
                      location: "",
                      extraFields: {},
                    }))
                  }
                >
                  Clear
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200/70 bg-white/70 shadow-sm shadow-slate-900/5 backdrop-blur">
        <div className="border-b border-slate-200/70 p-4">
          <div className="text-sm font-semibold text-slate-900">Status</div>
          <div className="mt-1 text-xs text-slate-500">
            If something fails, you’ll see why here.
          </div>
        </div>
        <div className="p-4 space-y-4">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </div>
          ) : result ? (
            <div className="space-y-2">
              <div className="text-sm text-slate-900">
                Result:{" "}
                <span
                  className={[
                    "font-medium",
                    result.ok ? "text-emerald-700" : "text-red-700",
                  ].join(" ")}
                >
                  {result.message.status}
                </span>
              </div>
              <div className="text-xs text-slate-500 font-mono">
                ID: {result.message.id}
              </div>
              {result.errors?.length ? (
                <ul className="mt-3 list-disc pl-5 text-sm text-slate-700">
                  {result.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-slate-600">Sent successfully.</div>
              )}
            </div>
          ) : (
            <div className="text-sm text-slate-600">Ready when you are.</div>
          )}

          <div className="rounded-3xl border border-slate-200/80 bg-white shadow-sm">
            <div className="border-b border-slate-200/70 p-4">
              <div className="text-sm font-semibold text-slate-900">Template preview</div>
              <div className="mt-1 text-xs text-slate-500">
                Live preview of the email card. Download as image or PDF.
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
                <div className="text-sm text-slate-600">
                  This preview updates as you fill the form.
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={downloadPreviewImage}
                    disabled={isExporting}
                  >
                    Download PNG
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={downloadPreviewPdf}
                    disabled={isExporting}
                  >
                    Download PDF
                  </Button>
                </div>
              </div>

              <div className="lg:hidden rounded-3xl border border-slate-200/70 bg-slate-50 p-4">
                <div className="text-sm text-slate-700">
                  Preview is available on a separate page when space is limited.
                </div>
                <a
                  href={previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Open preview page
                </a>
              </div>

              <div className="hidden lg:block">
                <TemplatePreview
                  ref={previewRef}
                  studentName={previewStudentName}
                  campus={previewCampus}
                  dateTime={previewDateTime}
                  address={previewAddress}
                  location={previewLocation}
                  sessionId={previewSessionId}
                  contactNumber={previewContactNumber}
                  extraFields={previewExtraFields}
                />

                <div className="mt-4 rounded-2xl border border-slate-200/70 bg-white/70 p-4">
                  <div className="text-sm font-semibold text-slate-900">Location</div>
                  <div className="mt-1 text-sm text-slate-600 break-words">
                    {previewLocationHref ? (
                      <>
                        Please find the campus location for{" "}
                        <span className="font-semibold text-slate-900">
                          {previewCampus}
                        </span>{" "}
                        here.
                      </>
                    ) : (
                      previewLocation
                    )}
                  </div>
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    {previewLocationHref ? (
                      <>
                        <a
                          href={previewLocationHref}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-b from-indigo-600 to-indigo-700 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 hover:from-indigo-500 hover:to-indigo-700"
                        >
                          Open location
                        </a>
                        <Button type="button" variant="secondary" onClick={copyPreviewImage} disabled={isExporting}>
                          Copy image
                        </Button>
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

                <div className="mt-4 flex justify-end">
                  <Button type="button" isLoading={isLoading} onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {toast ? (
        <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 rounded-full bg-slate-900 px-4 py-2 text-sm text-white shadow-lg">
          {toast}
        </div>
      ) : null}
    </div>
  );
}
