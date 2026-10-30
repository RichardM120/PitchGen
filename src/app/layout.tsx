import type { Metadata } from "next";
import "@fontsource-variable/sora";
import "@fontsource-variable/inter";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "PitchGen", template: "%s | PitchGen" },
  description: "Private, commission-ready pitch portals for TV and film.",
  robots: { index: false, follow: false },
  icons: { icon: "/pitchgen/icon.svg", apple: "/pitchgen/apple-icon.png" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className="antialiased">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
