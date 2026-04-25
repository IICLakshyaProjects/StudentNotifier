"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardIndex() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/admin/dashboard/users");
  }, [router]);
  return null;
}

