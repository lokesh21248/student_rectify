import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { GalleryMediaClient } from "./GalleryMediaClient";

export const metadata: Metadata = {
  title: "Manage Gallery Media | Admin Portal",
};

export default async function AdminGalleryMediaPage({ params }: { params: Promise<{ id: string }> }) {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  if (!adminSession || adminSession.value !== "authenticated") {
    redirect("/admin/login");
  }

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: gallery } = await supabase
    .from("galleries")
    .select(`
      *,
      events!event_id(title)
    `)
    .eq("id", id)
    .single();

  if (!gallery) notFound();

  const { data: media } = await supabase
    .from("gallery_media")
    .select("*")
    .eq("gallery_id", id)
    .order("display_order", { ascending: true });

  return (
    <GalleryMediaClient 
      gallery={gallery} 
      initialMedia={media || []} 
    />
  );
}
