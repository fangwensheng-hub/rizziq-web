import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rizziq App",
  description: "Next.js App Router project with TypeScript and Tailwind CSS"
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

