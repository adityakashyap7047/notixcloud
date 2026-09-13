"use client";

import { PublicNavbar } from "./public-navbar";
import { PublicFooter } from "./public-footer";

export function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}
