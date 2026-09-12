import type { Metadata } from "next";
import { VerifySearchClient } from "@/components/certificate/VerifySearchClient";
import { Navigation } from "@/components/navigation/Navigation";
import { Footer } from "@/components/navigation/Footer";

export const metadata: Metadata = {
  title: "Verify Certificate",
  description: "Verify the authenticity of college event participation certificates issued on EduEvents.",
};

export default function VerifyPage() {
  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-slate-50 pt-24 pb-16">
        <div className="container-page">
          <VerifySearchClient />
        </div>
      </main>
      <Footer />
    </>
  );
}
