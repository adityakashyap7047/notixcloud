"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Badge } from "@/components/ui/badge";
import {
  Activity, CheckCircle2, AlertCircle, ArrowRight,
} from "lucide-react";

function useScrollAnimation() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("visible");
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -60px 0px" }
    );
    document.querySelectorAll(".fade-up, .stagger-children").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

const services = [
  { name: "API Gateway", status: "operational", latency: "12ms" },
  { name: "Game Servers (US)", status: "operational", latency: "8ms" },
  { name: "Game Servers (EU)", status: "operational", latency: "15ms" },
  { name: "Game Servers (APAC)", status: "operational", latency: "22ms" },
  { name: "Control Panel", status: "operational", latency: "18ms" },
  { name: "File Storage", status: "operational", latency: "5ms" },
  { name: "Database Services", status: "operational", latency: "3ms" },
  { name: "Backup System", status: "operational", latency: "10ms" },
  { name: "DDoS Mitigation", status: "operational", latency: "1ms" },
  { name: "DNS Services", status: "operational", latency: "2ms" },
];

const incidents = [
  {
    date: "2025-09-05",
    title: "Scheduled Maintenance — EU Frankfurt Node",
    status: "resolved",
    updates: [
      { time: "14:00 UTC", text: "Maintenance window opened. EU Frankfurt servers temporarily offline." },
      { time: "14:45 UTC", text: "Hardware upgrade completed. Servers coming back online." },
      { time: "15:00 UTC", text: "All EU Frankfurt servers fully operational. Maintenance complete." },
    ],
  },
  {
    date: "2025-08-28",
    title: "Elevated Latency — US East Region",
    status: "resolved",
    updates: [
      { time: "09:30 UTC", text: "Reports of higher-than-normal latency in US East region." },
      { time: "09:45 UTC", text: "Investigating. Network provider identified upstream congestion." },
      { time: "10:15 UTC", text: "Traffic rerouted. Latency returning to normal levels." },
      { time: "11:00 UTC", text: "Issue fully resolved. All US East services operating normally." },
    ],
  },
  {
    date: "2025-08-15",
    title: "Brief Outage — Backup System",
    status: "resolved",
    updates: [
      { time: "03:00 UTC", text: "Backup service experiencing intermittent failures." },
      { time: "03:30 UTC", text: "Root cause identified: storage cluster node failure." },
      { time: "04:00 UTC", text: "Failed node replaced. Backup service restored." },
    ],
  },
];

const uptimeMonths = [
  { month: "Apr", uptime: 99.99 },
  { month: "May", uptime: 99.98 },
  { month: "Jun", uptime: 100.0 },
  { month: "Jul", uptime: 99.99 },
  { month: "Aug", uptime: 99.97 },
  { month: "Sep", uptime: 100.0 },
];

export default function StatusPage() {
  useScrollAnimation();

  const operationalCount = services.filter((s) => s.status === "operational").length;
  const overallStatus = operationalCount === services.length ? "All Systems Operational" : "Partial System Issues";

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 dot-bg opacity-20" />
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-green-500/10 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-6">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-white/60 text-sm font-medium">System Status</span>
          </div>
          <div className="inline-flex items-center gap-3 mb-6">
            <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            <h1 className="text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-heading)]">
              {overallStatus}
            </h1>
          </div>
          <p className="text-white/50">
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </section>

      {/* Uptime Chart */}
      <section className="py-12 bg-white -mt-4">
        <div className="max-w-4xl mx-auto px-6 fade-up">
          <div className="card-professional p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 font-[family-name:var(--font-heading)]">Uptime — Last 6 months</h3>
              <Badge variant="success">99.99% Average</Badge>
            </div>
            <div className="flex items-end gap-2 h-32">
              {uptimeMonths.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs text-slate-500 font-medium">{m.uptime}%</span>
                  <div className="w-full bg-green-500 rounded-t-md transition-all" style={{ height: `${(m.uptime - 99.9) * 1000}%`, minHeight: "4px" }} />
                  <span className="text-xs text-slate-400">{m.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-12 bg-slate-50/80">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-xl font-bold text-slate-900 font-[family-name:var(--font-heading)] mb-6 fade-up">Service Status</h2>
          <div className="space-y-2 stagger-children">
            {services.map((service) => (
              <div key={service.name} className="card-professional p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {service.status === "operational" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                  )}
                  <span className="text-sm font-medium text-slate-900">{service.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-slate-500 font-mono">{service.latency}</span>
                  <Badge variant={service.status === "operational" ? "success" : "warning"}>
                    {service.status === "operational" ? "Operational" : "Degraded"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Incidents */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-xl font-bold text-slate-900 font-[family-name:var(--font-heading)] mb-6 fade-up">Recent Incidents</h2>
          <div className="space-y-6 stagger-children">
            {incidents.map((incident, i) => (
              <div key={i} className="card-professional p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)]">{incident.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{incident.date}</p>
                  </div>
                  <Badge variant={incident.status === "resolved" ? "success" : "warning"}>
                    {incident.status === "resolved" ? "Resolved" : "Ongoing"}
                  </Badge>
                </div>
                <div className="space-y-3 border-l-2 border-slate-200 ml-2">
                  {incident.updates.map((update, j) => (
                    <div key={j} className="relative pl-5">
                      <div className="absolute -left-[7px] top-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white" />
                      <div className="flex items-baseline gap-2">
                        <span className="text-xs font-mono text-slate-400">{update.time}</span>
                        <span className="text-sm text-slate-600">{update.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Subscribe */}
      <section className="py-16 aurora-bg relative overflow-hidden">
        <div className="absolute inset-0 noise-overlay" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 fade-up">
          <h2 className="text-2xl font-bold text-white font-[family-name:var(--font-heading)] mb-3">
            Get notified of incidents
          </h2>
          <p className="text-white/50 mb-6">
            Subscribe to our status page for real-time updates.
          </p>
          <Link href="/register" className="btn-primary text-base inline-flex items-center gap-2">
            Create Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
