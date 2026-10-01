import type { Metadata } from "next";
import {
  Montserrat,
  Noto_Sans_Devanagari,
  Noto_Sans_Gujarati,
  Playfair_Display,
} from "next/font/google";
import type { ReactNode } from "react";

import "maplibre-gl/dist/maplibre-gl.css";
import "./globals.css";

import { getRequestLocale } from "@/lib/i18n/server";

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

const gujarati = Noto_Sans_Gujarati({
  subsets: ["gujarati", "latin"],
  display: "swap",
  variable: "--font-gujarati",
});

const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  display: "swap",
  variable: "--font-devanagari",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://theurbanedgelandspace.com"),
  title: {
    default: "UrbanEdge Land Space",
    template: "%s | UrbanEdge Land Space",
  },
  description:
    "Specialist land advisory and brokerage for Agricultural, NA and Industrial land across Ahmedabad and Gandhinagar.",
  icons: {
    icon: "/brand/urbanedge-land-space-logo.png",
    apple: "/brand/urbanedge-land-space-logo.png",
  },
  openGraph: {
    siteName: "UrbanEdge Land Space",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "/brand/urbanedge-land-space-logo.png",
        width: 1254,
        height: 1254,
        alt: "UrbanEdge Land Space",
      },
    ],
  },
};

type RootLayoutProps = Readonly<{
  children: ReactNode;
}>;

export default async function RootLayout({ children }: RootLayoutProps) {
  const locale = await getRequestLocale();
  return (
    <html
      lang={locale}
      data-language={locale}
      className={`${montserrat.variable} ${playfair.variable} ${gujarati.variable} ${devanagari.variable}`}
      data-scroll-behavior="smooth"
    >
      <body>{children}</body>
    </html>
  );
}
