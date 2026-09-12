import { MetadataRoute } from "next";
import { createAdminClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/events`, lastModified: new Date(), changeFrequency: "hourly", priority: 0.9 },
    { url: `${baseUrl}/certificates`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ];

  try {
    const supabase = createAdminClient();
    const { data: events } = await supabase
      .from("events")
      .select("slug, updated_at")
      .eq("status", "published")
      .eq("approved", true)
      .limit(1000);

    const eventPages: MetadataRoute.Sitemap = (events || []).map((event: any) => ({
      url: `${baseUrl}/events/${event.slug}`,
      lastModified: new Date(event.updated_at),
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...eventPages];
  } catch {
    return staticPages;
  }
}
