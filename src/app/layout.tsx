import type { Metadata } from "next";
import Providers from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "NotiX Cloud - Premium Game Server Hosting",
  description: "High-performance Minecraft server hosting with instant setup, DDoS protection, and 24/7 support.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a14] text-white antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
