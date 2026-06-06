import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

export const metadata: Metadata = {
  icons: {
    icon: [{ url: "/logo-main.png", type: "image/png" }],
    apple: [{ url: "/logo-main.png", type: "image/png" }],
  },
  title: "Amana — Payment Protection You Can Trust",
  description:
    "Amana keeps your money safe until the agreed work is completed, approved, or fairly resolved. Nigeria's first payment protection platform for the service economy.",
  keywords: [
    "payment protection",
    "escrow",
    "Abuja",
    "Nigeria",
    "artisan",
    "trusted payments",
    "construction escrow",
  ],
  openGraph: {
    title: "Amana — Payment Protection You Can Trust",
    description:
      "Amana keeps your money safe until the agreed work is completed, approved, or fairly resolved.",
    type: "website",
    locale: "en_NG",
    siteName: "Amana",
  },
  twitter: {
    card: "summary_large_image",
    title: "Amana — Payment Protection You Can Trust",
    description:
      "Nigeria's first payment protection platform built for the service economy.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <body>{children}</body>
    </html>
  );
}
