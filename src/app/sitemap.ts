import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/privacy-policy", "/terms-and-conditions", "/accessibility-statement"].map((path) => ({
    url: `${SITE_URL}${path}`,
  }));
}
