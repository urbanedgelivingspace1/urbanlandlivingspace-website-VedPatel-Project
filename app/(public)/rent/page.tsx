import type { Metadata } from "next";
import { TransactionLanding } from "@/components/public/transaction-landing";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Land for Rent",
  description: "Browse UrbanEdge land opportunities currently offered for rent.",
  alternates: { canonical: "/rent" },
};
export default function Page() {
  return <TransactionLanding transaction="RENT" />;
}
