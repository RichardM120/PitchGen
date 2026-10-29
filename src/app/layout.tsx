import type { Metadata } from "next";
import "@fontsource-variable/montserrat";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/400-italic.css";
import "@fontsource/cormorant-garamond/500.css";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "PitchGen", template: "%s | PitchGen" },
  description: "Private, commission-ready pitch portals for TV and film.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className="antialiased">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
