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
            ? "glass-nav scrolled"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all duration-300 group-hover:scale-105 group-hover:rotate-3">
              <Cloud className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold font-[family-name:var(--font-heading)] tracking-tight text-white transition-all duration-300">
              NotiX<span className="text-cyan-400">Cloud</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-glass-link ${
                  pathname === link.href ? "active" : ""
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium px-4 py-2 rounded-xl text-white/60 hover:text-white hover:bg-white/6 transition-all duration-300 hidden sm:block"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="text-sm font-bold px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-cyan-600 text-black rounded-xl hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
            >
              Get Started
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl text-white/60 hover:text-white hover:bg-white/6 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-0 right-0 w-72 h-full bg-[#0a0a14]/95 backdrop-blur-2xl border-l border-white/5 shadow-2xl p-6 pt-20">
            <div className="space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                    pathname === link.href
                      ? "text-cyan-400 bg-cyan-500/10"
                      : "text-white/60 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="mt-6 space-y-3">
              <Link href="/login" onClick={() => setMobileOpen(false)} className="block text-center py-3 rounded-xl border border-white/10 text-white/70 font-semibold text-sm hover:bg-white/5 hover:border-white/20 transition-all duration-300">
                Log In
              </Link>
              <Link href="/register" onClick={() => setMobileOpen(false)} className="block text-center py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-600 text-black font-bold text-sm hover:shadow-lg hover:shadow-cyan-500/25 transition-all duration-300">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
