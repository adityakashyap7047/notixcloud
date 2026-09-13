"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  Zap, Shield, HardDrive, Globe, Terminal, Layers,
  BarChart3, Headphones, Lock, ArrowRight, Check,
  Cpu, Database, Wifi,
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

const allFeatures = [
  {
    icon: Zap, title: "Instant Setup", short: "Live in 30 seconds", color: "from-yellow-400 to-orange-500",
    description: "Your server deploys in under 30 seconds. No waiting, no configuration headaches.",
    details: ["Automated server provisioning", "Pre-configured for optimal performance", "One-click modpack installation", "Automatic port forwarding", "Instant access credentials via email"],
  },
  {
    icon: Shield, title: "DDoS Protection", short: "Up to 1Tbps mitigation", color: "from-blue-500 to-blue-600",
    description: "Enterprise-grade protection against attacks up to 1Tbps. Your server stays online no matter what.",
    details: ["Layer 3/4/7 DDoS mitigation", "Real-time attack monitoring", "Automatic traffic filtering", "Geographic attack mapping", "Zero-downtime during attacks"],
  },
  {
    icon: HardDrive, title: "NVMe Storage", short: "7GB/s read speeds", color: "from-purple-500 to-purple-600",
    description: "Blazing-fast NVMe SSDs ensure minimal world load times and buttery smooth gameplay.",
    details: ["Enterprise NVMe SSDs", "7GB/s sequential read", "4GB/s sequential write", "Redundant RAID arrays", "Daily automated snapshots"],
  },
  {
    icon: Globe, title: "Global Locations", short: "12 data centers", color: "from-green-500 to-emerald-600",
    description: "12 data centers across 6 continents ensure low latency for players everywhere.",
    details: ["North America (Virginia, Oregon, Ohio)", "Europe (Frankfurt, London, Dublin)", "Asia Pacific (Tokyo, Singapore, Sydney)", "South America (São Paulo)", "Africa (Johannesburg)"],
  },
  {
    icon: Terminal, title: "Full FTP Access", short: "Built-in file manager", color: "from-slate-600 to-slate-700",
    description: "Complete file access with our built-in manager or any FTP client you prefer.",
    details: ["Web-based file manager", "SFTP/FTP client support", "File editor with syntax highlighting", "Drag & drop uploads", "Bulk file operations"],
  },
  {
    icon: Layers, title: "One-Click Mods", short: "100+ modpacks", color: "from-pink-500 to-rose-600",
    description: "Install Forge, Fabric, Paper, and 100+ modpacks with a single click.",
    details: ["Forge & Fabric support", "CurseForge integration", "Built-in modpack library", "Custom JAR upload", "Version switching in one click"],
  },
  {
    icon: BarChart3, title: "Real-Time Metrics", short: "Live dashboards", color: "from-cyan-500 to-blue-500",
    description: "Monitor CPU, RAM, TPS, and player count with beautiful real-time dashboards.",
    details: ["CPU & RAM usage graphs", "TPS monitoring", "Player count tracking", "Network bandwidth stats", "Historical data export"],
  },
  {
    icon: Headphones, title: "24/7 Support", short: "Always available", color: "from-indigo-500 to-indigo-600",
    description: "Expert support team available around the clock via live chat and tickets.",
    details: ["Live chat support", "Ticket system", "Average response: < 5 minutes", "Knowledge base access", "Priority for Pro & Enterprise"],
  },
  {
    icon: Lock, title: "Automatic Backups", short: "Daily snapshots", color: "from-emerald-500 to-green-600",
    description: "Daily automatic backups with one-click restore. Never lose your world again.",
    details: ["Daily automatic backups", "On-demand manual backups", "One-click restore", "Backup retention policy", "Off-site backup storage"],
  },
  {
    icon: Cpu, title: "Dedicated Resources", short: "Guaranteed performance", color: "from-red-500 to-red-600",
    description: "Every server gets guaranteed CPU, RAM, and storage. No shared resources.",
    details: ["Dedicated vCPU cores", "Guaranteed RAM allocation", "Isolated NVMe storage", "No noisy neighbors", "Resource scaling on demand"],
  },
  {
    icon: Wifi, title: "1Gbps Network", short: "Premium bandwidth", color: "from-teal-500 to-cyan-600",
    description: "Premium 1Gbps network connections with low latency worldwide.",
    details: ["1Gbps port speed", "DDoS-protected network", "BGP routing optimization", "Low-latency peering", "Unlimited bandwidth"],
  },
  {
    icon: Database, title: "MySQL Databases", short: "Included free", color: "from-amber-500 to-orange-600",
    description: "Free MySQL databases included with every plan for plugins that need them.",
    details: ["MySQL 8.0 support", "phpMyAdmin access", "Multiple databases allowed", "Remote connection support", "Automated backups included"],
  },
];

export default function FeaturesPage() {
  useScrollAnimation();
  const [selectedFeature, setSelectedFeature] = useState<(typeof allFeatures)[0] | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 dot-bg opacity-20" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-6">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-white/60 text-sm font-medium">All Features</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
            Everything you need to <span className="gradient-text-white">dominate</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            Built for performance, designed for simplicity. Every feature crafted to make server management effortless.
          </p>
        </div>
      </section>
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
            {allFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} onClick={() => setSelectedFeature(feature)} className="card-professional p-7 group cursor-pointer">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-300 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1 font-[family-name:var(--font-heading)]">{feature.title}</h3>
                  <p className="text-sm text-blue-500 font-medium mb-2">{feature.short}</p>
                  <p className="text-sm text-slate-500 leading-relaxed">{feature.description}</p>
                  <div className="mt-4 flex items-center gap-1 text-sm font-semibold text-blue-500 group-hover:gap-2 transition-all">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <section className="py-20 aurora-bg relative overflow-hidden">
        <div className="absolute inset-0 noise-overlay" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 fade-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">See all features in action</h2>
          <p className="text-lg text-white/50 mb-8">Start a free trial and explore every feature with no commitment.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="btn-primary text-base inline-flex items-center gap-2">Start Free Trial <ArrowRight className="w-4 h-4" /></Link>
            <Link href="/pricing" className="btn-secondary text-base">Compare Plans</Link>
          </div>
        </div>
      </section>
      <PublicFooter />
      <Modal open={!!selectedFeature} onClose={() => setSelectedFeature(null)} title={selectedFeature?.title} description={selectedFeature?.description} size="lg">
        {selectedFeature && (
          <div className="space-y-6">
            <div className={`w-14 h-14 bg-gradient-to-br ${selectedFeature.color} rounded-2xl flex items-center justify-center shadow-lg`}>
              <selectedFeature.icon className="w-7 h-7 text-white" />
            </div>
            <p className="text-slate-600">{selectedFeature.description}</p>
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">What&apos;s included</h4>
              <ul className="space-y-2">
                {selectedFeature.details.map((detail) => (
                  <li key={detail} className="flex items-center gap-3 text-sm text-slate-600">
                    <Check className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    {detail}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-3 pt-2">
              <Link href="/register" className="btn-primary flex-1 text-center">Start Free Trial</Link>
              <Button variant="ghost" className="flex-1" onClick={() => setSelectedFeature(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
