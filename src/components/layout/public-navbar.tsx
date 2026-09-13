"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Cloud, Menu, X } from "lucide-react";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/nodes", label: "Nodes" },
  { href: "/docs", label: "Docs" },
  { href: "/about", label: "About" },
];

export function PublicNavbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isHome = pathname === "/";

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled || !isHome
            ? "bg-white/95 backdrop-blur-xl shadow-[0_1px_30px_rgba(0,0,0,0.06)] border-b border-zinc-100/80"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/40 transition-all duration-300 group-hover:scale-105">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <span
              className={`text-xl font-bold font-[family-name:var(--font-heading)] tracking-tight transition-colors duration-300 ${
                scrolled || !isHome ? "text-zinc-900" : "text-white"
              }`}
            >
              NotiX<span className="text-blue-500">Cloud</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium px-3 py-2 rounded-lg transition-all duration-300 ${
                  pathname === link.href
                    ? scrolled || !isHome
                      ? "text-blue-600 bg-blue-50"
                      : "text-white bg-white/10"
                    : scrolled || !isHome
                    ? "text-zinc-500 hover:text-blue-600 hover:bg-zinc-50"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className={`text-sm font-semibold px-4 py-2 rounded-lg transition-all duration-300 hidden sm:block ${
                scrolled || !isHome
                  ? "text-zinc-600 hover:bg-zinc-100"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="text-sm font-semibold px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:shadow-lg hover:shadow-blue-600/25 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`md:hidden p-2 rounded-lg transition-colors ${
                scrolled || !isHome ? "text-zinc-700 hover:bg-zinc-100" : "text-white hover:bg-white/10"
              }`}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 w-72 h-full bg-white shadow-2xl p-6 pt-20">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    pathname === link.href
                      ? "text-blue-600 bg-blue-50"
                      : "text-zinc-700 hover:bg-zinc-50"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-center py-3 rounded-xl border border-zinc-200 text-zinc-700 font-semibold text-sm hover:bg-zinc-50 transition-colors">
                Log In
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="block text-center py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold text-sm hover:shadow-lg transition-all">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
