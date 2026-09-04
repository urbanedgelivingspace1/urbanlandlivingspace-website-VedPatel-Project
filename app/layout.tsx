import type { Metadata } from "next";
import { Montserrat, Playfair_Display } from "next/font/google";
import type { ReactNode } from "react";

import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-montserrat",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://urbanedgelandspace.com"),
  title: {
    default: "UrbanEdge Land Space",
    template: "%s | UrbanEdge Land Space",
  },
  description: "A focused land discovery and advisory experience for Ahmedabad and Gandhinagar.",
  openGraph: {
    siteName: "UrbanEdge Land Space",
    locale: "en_IN",
    type: "website",
  },
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html
      lang="en"
      className={`${montserrat.variable} ${playfair.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>{children}</body>
    </html>
  );
}
