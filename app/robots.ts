import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/me", "/api"],
    },
    sitemap: "https://lapis.nexus/sitemap.xml",
  };
}
