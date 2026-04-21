import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"
import CookieManager from "./_components/CookieManager";
import { GoogleAnalytics } from "./_components/GoogleAnalytics";
import ConditionalLayout from "./_components/ConditionalLayout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://realvistaproperties.com'),
  title: {
    default: 'Realvista Properties | Buy & Sell Property in Nigeria',
    template: '%s | Realvista Properties',
  },
  description:
    'Realvista Properties is your one-stop real estate platform to buy, sell, rent, and track property investments across Nigeria.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <GoogleAnalytics />
        <ConditionalLayout>
          <main>
            {children}
            <Toaster />
            <CookieManager />
          </main>
        </ConditionalLayout>
      </body>
    </html>
  );
}