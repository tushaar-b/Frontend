import type { Metadata } from "next";
import "./globals.css";
import { ArchiveTransitionProvider } from "@/components/ui/graph-transition-loader";

export const metadata: Metadata = {
  title: "MNEMOVAULT — The Living Family Archive",
  description: "Photographs, voices, and the little details that make a family. Explore the fictional Mehra family archive.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ArchiveTransitionProvider>
          {children}
        </ArchiveTransitionProvider>
      </body>
    </html>
  );
}

