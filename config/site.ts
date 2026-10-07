import type { Metadata } from "next";

export const siteConfig = {
  name: "UrbanEdge Land Space",
  defaultUrl: "https://theurbanedgelandspace.com",
  launchRegion: "Ahmedabad and Gandhinagar, Gujarat",
  description:
    "UrbanEdge Land Space helps buyers, investors, developers and landowners find Agricultural Land, NA Land and Industrial Land in Ahmedabad and Gandhinagar with local support.",
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
