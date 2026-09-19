import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: "https://sobiecki.org" },
    { url: "https://sobiecki.org/polityka-prywatnosci" },
  ];
}
