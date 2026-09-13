"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/layout";
import { AdminSidebar } from "@/components/layout/admin-sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Server, CreditCard, Globe, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if ((session?.user as any)?.role !== "ADMIN") {
    router.push("/servers");
    return null;
  }

  const stats = [
    { label: "Total Users", value: "--", icon: Users, color: "from-blue-500 to-blue-600" },
    { label: "Total Servers", value: "--", icon: Server, color: "from-green-500 to-emerald-600" },
    { label: "Pending Payments", value: "--", icon: CreditCard, color: "from-orange-500 to-amber-600" },
    { label: "Total Revenue", value: "--", icon: Globe, color: "from-purple-500 to-purple-600" },
  ];

  const quickActions = [
    { label: "Manage Users", href: "/admin/users", icon: Users },
    { label: "Verify Payments", href: "/admin/payments", icon: CreditCard },
    { label: "Manage Nodes", href: "/admin/nodes", icon: Globe },
  ];

  return (
    <Layout>
      <div className="flex gap-6">
        <AdminSidebar />
        <div className="flex-1 space-y-6">
          <div className="fade-up">
            <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Overview of your hosting platform
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-children">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">
                          {stat.value}
                        </p>
                        <p className="text-xs text-slate-500 font-medium">
                          {stat.label}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card className="fade-up" style={{ transitionDelay: "200ms" }}>
            <CardContent className="py-8">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 font-[family-name:var(--font-heading)]">
                  Quick Actions
                </h3>
                <div className="flex justify-center gap-4 mt-4 flex-wrap">
                  {quickActions.map((action) => {
                    const Icon = action.icon;
                    return (
                      <Link
                        key={action.href}
                        href={action.href}
                        className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-blue-50 rounded-xl text-sm font-medium text-slate-700 hover:text-blue-600 transition-all duration-300 group"
                      >
                        <Icon className="w-4 h-4" />
                        {action.label}
                        <ArrowRight className="w-3 h-3 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                      </Link>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
