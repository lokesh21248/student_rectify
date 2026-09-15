import { Metadata } from "next";
import { getPublicGalleries } from "@/lib/supabase/queries";
import { GalleryClient } from "./GalleryClient";

export const metadata: Metadata = {
  title: "Gallery | Evently",
  description: "Browse photos and videos from college events across the country.",
};

export const revalidate = 60; // Revalidate every minute

export default async function GalleryPage() {
  const galleries = await getPublicGalleries();

  return <GalleryClient galleries={galleries as any} />;
}
