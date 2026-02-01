import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { ThemeProvider } from "@/components/providers/ThemeProvider";



import { Analytics } from "@vercel/analytics/react";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://bonder-app.vercel.app'),
  title: "Bonder | Relationship Manager",
  description: "Maintain meaningful connections with your personal CRM.",
  manifest: "/manifest.json",
  openGraph: {
    title: "Bonder | Relationship Manager",
    description: "Maintain meaningful connections with your personal CRM.",
    url: "https://bonder-app.vercel.app",
    siteName: "Bonder",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Bonder | Relationship Manager",
    description: "Maintain meaningful connections with your personal CRM.",
  },
};

import { SyncProvider } from "@/components/providers/SyncProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to prevent FOUC (Flash of Unstyled Content) for dark mode */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SyncProvider />
          <InstallPrompt />
          {children}
          <Analytics />
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  );
}

