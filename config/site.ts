import type { Metadata } from "next";

export const siteConfig = {
  name: "UrbanEdge Land Space",
  defaultUrl: "https://theurbanedgelandspace.com",
  launchRegion: "Ahmedabad and Gandhinagar, Gujarat",
  description:
    "Specialist land advisory and brokerage for Agricultural, NA and Industrial land across Ahmedabad and Gandhinagar.",
  socialImage: {
    path: "/brand/urbanedge-social-share.png",
    width: 1200,
    height: 630,
    alt: "UrbanEdge Land Space — specialist land guidance across Ahmedabad and Gandhinagar",
  },
} as const;

export const siteIcons: NonNullable<Metadata["icons"]> = {
  icon: [
    {
      url: "/favicon.png",
      type: "image/png",
      sizes: "512x512",
    },
  ],
  apple: [
    {
      url: "/apple-touch-icon.png",
      type: "image/png",
      sizes: "180x180",
    },
  ],
};
