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

import { siteConfig, siteIcons } from "@/config/site";
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
  metadataBase: new URL(siteConfig.defaultUrl),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  icons: siteIcons,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    url: siteConfig.defaultUrl,
    siteName: siteConfig.name,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: siteConfig.socialImage.path,
        width: siteConfig.socialImage.width,
        height: siteConfig.socialImage.height,
        alt: siteConfig.socialImage.alt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [siteConfig.socialImage.path],
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
