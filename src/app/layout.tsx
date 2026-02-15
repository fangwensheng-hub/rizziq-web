import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RizzIQ",
  description:
    "Upload a chat screenshot. RizzIQ analyzes the vibe and suggests three reply options that actually fit—Maverick, Stoic, or Mirror.",
};

export const viewport: Viewport = {
  themeColor: "#05050a",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
