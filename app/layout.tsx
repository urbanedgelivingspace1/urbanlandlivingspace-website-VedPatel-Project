import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://urbanedgelandspace.com"),
  title: {
    default: "UrbanEdge Land Space",
    template: "%s | UrbanEdge Land Space",
  },
  description: "A focused land discovery and advisory experience for Ahmedabad and Gandhinagar.",
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
