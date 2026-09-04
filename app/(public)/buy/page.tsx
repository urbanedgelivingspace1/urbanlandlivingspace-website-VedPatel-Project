import type { Metadata } from "next";
import { TransactionLanding } from "@/components/public/transaction-landing";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Land for Purchase",
  description: "Browse UrbanEdge land opportunities currently offered for purchase.",
  alternates: { canonical: "/buy" },
};
export default function Page() {
  return <TransactionLanding transaction="BUY" />;
}
