import type { Metadata } from "next";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ensureProfile } from "@/lib/auth";

export const metadata: Metadata = { title: "Setting Up Your Account" };

export default async function OnboardingPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Ensure profile exists in Supabase
  await ensureProfile();

  redirect("/");
}
