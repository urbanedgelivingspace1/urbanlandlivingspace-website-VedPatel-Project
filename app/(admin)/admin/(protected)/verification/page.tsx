import { redirect } from "next/navigation";

export default function VerificationIndexPage() {
  redirect("/admin/verification/queue");
}
