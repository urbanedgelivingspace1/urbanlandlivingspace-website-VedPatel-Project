import type { MetadataRoute } from "next";

import { absoluteCanonical } from "@/lib/seo/canonical";
import { isProductionIndexable } from "@/lib/seo/robots";

export default function robots(): MetadataRoute.Robots {
  if (!isProductionIndexable()) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/search",
        "/*?*q=",
        "/*?*category=",
        "/*?*transaction=",
        "/*?*district=",
        "/*?*taluka=",
        "/*?*place=",
        "/*?*locality=",
        "/*?*sort=",
        "/*?*minPrice=",
        "/*?*maxPrice=",
        "/*?*minArea=",
        "/*?*maxArea=",
        "/*?*availability=",
        "/*?*agriTenure=",
        "/*?*agriIrrigation=",
        "/*?*naStatus=",
        "/*?*naPurpose=",
        "/*?*industrialType=",
        "/*?*industrialPower=",
      ],
    },
    sitemap: absoluteCanonical("/sitemap.xml"),
    host: absoluteCanonical("/"),
  };
}
