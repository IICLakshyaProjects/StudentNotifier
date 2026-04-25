import { redirect } from "next/navigation";

export default function SendPage() {
  redirect("/dashboard?tab=send");
}

