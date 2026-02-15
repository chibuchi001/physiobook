import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { QueryProvider } from "@/components/providers/query-provider";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "PhysioBook | AI-Powered Physiotherapy Platform",
  description:
    "Book appointments with expert physiotherapists. Intelligent triage, personalized matching, outcome tracking, and AI-powered exercise guidance.",
  keywords: [
    "physiotherapy",
    "physical therapy",
    "booking",
    "rehabilitation",
    "exercise",
    "AI",
    "healthcare",
  ],
  authors: [{ name: "PhysioBook" }],
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "PhysioBook | AI-Powered Physiotherapy Platform",
    description:
      "Book appointments with expert physiotherapists. Intelligent triage, personalized matching, and AI-powered exercise guidance.",
    type: "website",
    locale: "en_US",
    siteName: "PhysioBook",
    images: [
      {
        url: "/screenshot-for-readme.png",
        width: 1200,
        height: 700,
        alt: "PhysioBook Dashboard",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PhysioBook | AI-Powered Physiotherapy Platform",
    description:
      "Book appointments with expert physiotherapists. Intelligent triage, personalized matching, and AI-powered exercise guidance.",
    images: ["/screenshot-for-readme.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary:
            "bg-physio-600 hover:bg-physio-700 text-white",
          card: "shadow-xl",
          headerTitle: "text-physio-900",
          headerSubtitle: "text-gray-600",
          socialButtonsBlockButton:
            "border-gray-200 hover:bg-gray-50",
          formFieldInput:
            "border-gray-300 focus:border-physio-500 focus:ring-physio-500",
          footerActionLink: "text-physio-600 hover:text-physio-700",
        },
        variables: {
          colorPrimary: "#16a34a",
          colorTextOnPrimaryBackground: "white",
        },
      }}
    >
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased`}>
          <QueryProvider>
            {children}
            <Toaster />
          </QueryProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
