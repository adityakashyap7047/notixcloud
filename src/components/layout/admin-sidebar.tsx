"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Users, Server, CreditCard, Globe, Cloud } from "lucide-react";

const adminNavItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/servers", label: "Servers", icon: Server },
  { href: "/admin/payments", label: "Payments", icon: CreditCard },
  { href: "/admin/nodes", label: "Nodes", icon: Globe },
  { href: "/admin/cloud", label: "Cloud Providers", icon: Cloud },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 shrink-0">
      <nav className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm sticky top-24">
        <div className="mb-4 px-3">
          <h2 className="text-xs font-bold text-slate-400 tracking-wider uppercase">
            Admin Panel
          </h2>
        </div>
        <div className="space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  pathname === item.href
                    ? "bg-blue-50 text-blue-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                )}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
