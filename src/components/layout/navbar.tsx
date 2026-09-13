"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Cloud, LayoutGrid, CreditCard, User, Shield, LogOut } from "lucide-react";

const navItems = [
  { href: "/servers", label: "Servers", icon: LayoutGrid },
  { href: "/billing", label: "Billing", icon: CreditCard },
  { href: "/profile", label: "Profile", icon: User },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-white/95 backdrop-blur-xl shadow-[0_1px_20px_rgba(0,0,0,0.06)] border-b border-slate-100"
          : "bg-white border-b border-slate-100"
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900 tracking-tight hidden sm:block font-[family-name:var(--font-heading)]">
              NotiX<span className="text-blue-500">Cloud</span>
            </span>
          </Link>

          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "nav-link flex items-center gap-2",
                    pathname === item.href && "active"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{item.label}</span>
                </Link>
              );
            })}

            {session?.user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className={cn(
                  "nav-link flex items-center gap-2",
                  pathname.startsWith("/admin") && "active"
                )}
              >
                <Shield className="w-4 h-4" />
                <span className="hidden md:inline">Admin</span>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">
                {session?.user?.name || session?.user?.email}
              </p>
              <p className="text-xs text-blue-500 font-medium">
                {(session?.user as any)?.role === "ADMIN" ? "Admin" : "User"}
              </p>
            </div>
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-semibold text-sm">
                {(session?.user?.name || session?.user?.email || "U")[0].toUpperCase()}
              </span>
            </div>
            <button
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="btn-ghost btn-sm flex items-center gap-1.5 text-slate-500 hover:text-red-500"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Sign out</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
