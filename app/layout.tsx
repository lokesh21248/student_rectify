import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import { MuiThemeProvider } from "@/components/providers/MuiThemeProvider";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: {
    default: "EduEvents — College Event Discovery Platform",
    template: "%s | EduEvents",
  },
  description:
    "Discover, register, and participate in college events. Find hackathons, workshops, seminars, cultural fests, and more from universities near you.",
  keywords: ["college events", "hackathon", "workshop", "seminar", "cultural fest", "university events", "student events", "event registration"],
  authors: [{ name: "EduEvents" }],
  creator: "EduEvents",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: process.env.NEXT_PUBLIC_APP_URL,
    siteName: "EduEvents",
    title: "EduEvents — College Event Discovery Platform",
    description: "Discover, register, and participate in college events across India.",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "EduEvents" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "EduEvents — College Event Discovery Platform",
    description: "Discover, register, and participate in college events across India.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-video-preview": -1, "max-image-preview": "large", "max-snippet": -1 },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} antialiased`}>
          <MuiThemeProvider>
            {children}
            <Toaster
              position="top-right"
              richColors
              closeButton
              toastOptions={{ style: { fontFamily: "var(--font-sans)", borderRadius: "12px" } }}
            />
          </MuiThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
