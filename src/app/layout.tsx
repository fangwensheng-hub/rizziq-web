import type { Metadata, Viewport } from "next";
import "./globals.css";
import RegisterSW from "./RegisterSW";

export const metadata: Metadata = {
  title: "RizzIQ",
  description:
    "Upload a chat screenshot. RizzIQ analyzes the vibe and suggests three reply options that actually fit—Maverick, Stoic, or Mirror.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "RizzIQ",
  },
};

export const viewport: Viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="apple-touch-icon" href="/logo.jpg" sizes="180x180" />
        <meta name="apple-mobile-web-app-title" content="RizzIQ" />
      </head>
      <body className="antialiased">
        {children}
        <RegisterSW />
      </body>
    </html>
  );
}
