import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminShell>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="min-w-0 flex-1 px-6 py-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </div>
      </div>
    </AdminShell>
  );
}

