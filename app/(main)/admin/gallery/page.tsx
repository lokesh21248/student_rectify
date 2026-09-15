import { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/server";
import { AdminGalleryClient } from "./AdminGalleryClient";

export const metadata: Metadata = {
  title: "Manage Galleries | Admin Portal",
};

export default async function AdminGalleryPage() {
  const cookieStore = await cookies();
  const adminSession = cookieStore.get("admin_session");

  if (!adminSession || adminSession.value !== "authenticated") {
    redirect("/admin/login");
  }

  const supabase = createAdminClient();

  const { data: galleries } = await supabase
    .from("galleries")
    .select(`
      *,
      events!event_id(title)
    `)
    .order("created_at", { ascending: false });

  // For event dropdown when creating
  const { data: events } = await supabase
    .from("events")
    .select("id, title")
    .order("start_at", { ascending: false });

  return (
    <AdminGalleryClient 
      initialGalleries={galleries || []} 
      events={events || []} 
    />
  );
}
