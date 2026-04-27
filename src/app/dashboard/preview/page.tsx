import { PreviewPageClient } from "@/components/dashboard/PreviewPageClient";

type DashboardPreviewPageProps = {
  searchParams: {
    studentName?: string;
    campus?: string;
    date?: string;
    time?: string;
    address?: string;
    location?: string;
    contactNumber?: string;
  };
};

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

export default function DashboardPreviewPage({ searchParams }: DashboardPreviewPageProps) {
  const studentName = searchParams.studentName || "Student name";
  const campus = searchParams.campus || "Campus";
  const date = searchParams.date || "Date";
  const time = searchParams.time || "Time";
  const address = searchParams.address || "Address";
  const location = searchParams.location || "Location";
  const contactNumber = searchParams.contactNumber || "";
  const prettyTime = time === "Time" ? "" : formatTime12h(time);
  const dateTime = `${date} · ${prettyTime || time}`;
  const sessionId = `LAK${campusSlug(campus)}${hashTo6Digits(
    `${studentName}|${campus}|${dateTime}|${address}|${location}`
  )}`;

  return (
    <PreviewPageClient
      studentName={studentName}
      campus={campus}
      dateTime={dateTime}
      address={address}
      location={location}
      sessionId={sessionId}
      contactNumber={contactNumber}
    />
  );
}
