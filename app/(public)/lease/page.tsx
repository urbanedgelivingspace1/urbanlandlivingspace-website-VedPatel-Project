import type { Metadata } from "next";
import { TransactionLanding } from "@/components/public/transaction-landing";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Land for Lease",
  description: "Browse UrbanEdge land opportunities currently offered for lease.",
  alternates: { canonical: "/lease" },
};
export default function Page() {
  return <TransactionLanding transaction="LEASE" />;
}
