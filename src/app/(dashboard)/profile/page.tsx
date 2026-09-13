"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/layout/layout";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User, Lock, MessageCircle } from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return (
      <Layout>
        <div className="flex items-center justify-center py-20">
          <div className="w-10 h-10 border-2 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
        </div>
      </Layout>
    );
  }

  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="fade-up">
          <h1 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">
            Profile
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your account settings
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card className="fade-up" style={{ transitionDelay: "100ms" }}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-500" />
                <CardTitle>Account Info</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <span className="text-white font-bold text-xl font-[family-name:var(--font-heading)]">
                    {(session?.user?.name || "U")[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-slate-900 font-semibold">
                    {session?.user?.name || "Player"}
                  </p>
                  <p className="text-sm text-slate-500">{session?.user?.email}</p>
                  <p className="text-xs text-blue-500 font-semibold mt-1">
                    {(session?.user as any)?.role === "ADMIN" ? "Admin" : "User"}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <p className="text-xs font-semibold text-slate-500 mb-1 uppercase tracking-wider">
                  Member Since
                </p>
                <p className="text-sm text-slate-900">
                  {new Date().toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="fade-up" style={{ transitionDelay: "200ms" }}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-500" />
                <CardTitle>Change Password</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Current Password
                  </label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    New Password
                  </label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <Input type="password" placeholder="••••••••" />
                </div>
                <Button type="submit" variant="primary">
                  Update Password
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="fade-up" style={{ transitionDelay: "300ms" }}>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-5 h-5 text-blue-500" />
                <CardTitle>Discord</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {(session?.user as any)?.discordId ? (
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <svg
                      className="h-6 w-6 text-indigo-500"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                    >
                      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm text-slate-900 font-medium">Connected</p>
                    <p className="text-xs text-slate-500 font-mono">
                      ID: {(session?.user as any)?.discordId || "N/A"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-slate-500 mb-3">
                    Connect your Discord account
                  </p>
                  <Button variant="secondary" size="sm">
                    Connect Discord
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
