import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

// Plus Jakarta Sans: geometric-humanist, tall x-height, soft terminals — the
// "soft modern" counterpart to the periwinkle palette. Variable, so one file
// covers every weight we use.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

// Used sparingly: timestamps, ranks, anything that must not jitter.
const mono = JetBrains_Mono({
  variable: "--font-mono-code",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Listening Dashboard",
  description: "Your Spotify listening stats, any day you want them.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} ${mono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
