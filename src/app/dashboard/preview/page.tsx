import { PreviewPageClient } from "@/components/dashboard/PreviewPageClient";

type DashboardPreviewPageProps = {
  searchParams: {
    studentName?: string;
    campus?: string;
    date?: string;
    time?: string;
    address?: string;
    location?: string;
  };
};

export default function DashboardPreviewPage({ searchParams }: DashboardPreviewPageProps) {
  const studentName = searchParams.studentName || "Student name";
  const campus = searchParams.campus || "Campus";
  const date = searchParams.date || "Date";
  const time = searchParams.time || "Time";
  const address = searchParams.address || "Address";
  const location = searchParams.location || "Location";
  const dateTime = `${date} · ${time}`;

  return (
    <PreviewPageClient
      studentName={studentName}
      campus={campus}
      dateTime={dateTime}
      address={address}
      location={location}
    />
  );
}
