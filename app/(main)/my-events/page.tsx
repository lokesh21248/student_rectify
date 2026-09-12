import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MyEventsClient } from "./MyEventsClient";
import { createAdminClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "My Events",
  description: "View all events you're interested in, registered for, or have attended.",
};

async function getUserEventData(userId: string) {
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("clerk_user_id", userId)
    .single();

  if (!profile) return { registrations: [], interests: [], attended: [] };

  const [regRes, interestRes, attendanceRes] = await Promise.all([
    supabase
      .from("event_registrations")
      .select(`
        id, registration_number, qr_code, status, registered_at, cancelled_at,
        events:event_id(
          id, slug, title, banner_url, start_at, end_at, mode, venue,
          categories:category_id(name, slug, color, icon),
          colleges:college_id(name)
        )
      `)
      .eq("user_id", profile.id)
      .order("registered_at", { ascending: false }),

    supabase
      .from("event_interests")
      .select(`
        id, created_at,
        events:event_id(
          id, slug, title, banner_url, start_at, end_at, mode, venue,
          categories:category_id(name, slug, color, icon),
          colleges:college_id(name)
        )
      `)
      .eq("user_id", profile.id)
      .order("created_at", { ascending: false }),

    supabase
      .from("event_attendance")
      .select(`
        id, checked_in_at,
        events:event_id(
          id, slug, title, banner_url, start_at, end_at,
          categories:category_id(name, slug, color, icon),
          colleges:college_id(name)
        )
      `)
      .eq("user_id", profile.id)
      .order("checked_in_at", { ascending: false }),
  ]);

  return {
    registrations: regRes.data || [],
    interests: interestRes.data || [],
    attended: attendanceRes.data || [],
  };
}

export default async function MyEventsPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const data = await getUserEventData(userId);

  return <MyEventsClient {...data} />;
}
