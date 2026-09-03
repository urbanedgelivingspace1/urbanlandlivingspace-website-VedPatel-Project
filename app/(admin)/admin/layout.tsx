import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s · UrbanEdge Land Space",
  },
  robots: {
    index: false,
    follow: false,
  },
};

type AdminLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function AdminLayout({ children }: AdminLayoutProps) {
  return children;
}
