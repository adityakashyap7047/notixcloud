"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe, ArrowRight, Server, Wifi, Cpu, HardDrive,
  MapPin, Activity,
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

const nodes = [
  { id: "us-va", region: "North America", city: "Virginia, US", flag: "US", ip: "us-east.notixcloud.com", status: "online", load: 34, cpu: "AMD EPYC 7763", ram: "256 GB DDR4", storage: "4x 2TB NVMe", network: "10 Gbps", latency: "12ms" },
  { id: "us-or", region: "North America", city: "Oregon, US", flag: "US", ip: "us-west.notixcloud.com", status: "online", load: 28, cpu: "AMD EPYC 7763", ram: "256 GB DDR4", storage: "4x 2TB NVMe", network: "10 Gbps", latency: "18ms" },
  { id: "us-oh", region: "North America", city: "Ohio, US", flag: "US", ip: "us-central.notixcloud.com", status: "online", load: 41, cpu: "Intel Xeon Gold 6348", ram: "256 GB DDR4", storage: "4x 2TB NVMe", network: "10 Gbps", latency: "15ms" },
  { id: "ca", region: "North America", city: "Montreal, CA", flag: "CA", ip: "ca-east.notixcloud.com", status: "online", load: 22, cpu: "AMD EPYC 7543", ram: "128 GB DDR4", storage: "2x 2TB NVMe", network: "5 Gbps", latency: "20ms" },
  { id: "de", region: "Europe", city: "Frankfurt, DE", flag: "DE", ip: "eu-central.notixcloud.com", status: "online", load: 45, cpu: "AMD EPYC 7763", ram: "256 GB DDR4", storage: "4x 2TB NVMe", network: "10 Gbps", latency: "8ms" },
  { id: "uk", region: "Europe", city: "London, UK", flag: "GB", ip: "eu-west.notixcloud.com", status: "online", load: 38, cpu: "Intel Xeon Gold 6348", ram: "256 GB DDR4", storage: "4x 2TB NVMe", network: "10 Gbps", latency: "14ms" },
  { id: "nl", region: "Europe", city: "Amsterdam, NL", flag: "NL", ip: "eu-north.notixcloud.com", status: "online", load: 31, cpu: "AMD EPYC 7543", ram: "128 GB DDR4", storage: "2x 2TB NVMe", network: "5 Gbps", latency: "16ms" },
  { id: "jp", region: "Asia Pacific", city: "Tokyo, JP", flag: "JP", ip: "ap-east.notixcloud.com", status: "online", load: 52, cpu: "AMD EPYC 7763", ram: "256 GB DDR4", storage: "4x 2TB NVMe", network: "10 Gbps", latency: "22ms" },
  { id: "sg", region: "Asia Pacific", city: "Singapore, SG", flag: "SG", ip: "ap-south.notixcloud.com", status: "online", load: 39, cpu: "Intel Xeon Gold 6348", ram: "256 GB DDR4", storage: "4x 2TB NVMe", network: "10 Gbps", latency: "28ms" },
  { id: "au", region: "Asia Pacific", city: "Sydney, AU", flag: "AU", ip: "ap-south-east.notixcloud.com", status: "online", load: 25, cpu: "AMD EPYC 7543", ram: "128 GB DDR4", storage: "2x 2TB NVMe", network: "5 Gbps", latency: "35ms" },
  { id: "br", region: "South America", city: "São Paulo, BR", flag: "BR", ip: "sa-east.notixcloud.com", status: "online", load: 19, cpu: "AMD EPYC 7543", ram: "128 GB DDR4", storage: "2x 2TB NVMe", network: "5 Gbps", latency: "42ms" },
  { id: "za", region: "Africa", city: "Johannesburg, ZA", flag: "ZA", ip: "af-south.notixcloud.com", status: "online", load: 15, cpu: "Intel Xeon Gold 6348", ram: "128 GB DDR4", storage: "2x 2TB NVMe", network: "5 Gbps", latency: "55ms" },
];

const regionFilters = ["All", "North America", "Europe", "Asia Pacific", "South America", "Africa"];

export default function NodesPage() {
  useScrollAnimation();
  const [selectedRegion, setSelectedRegion] = useState("All");
  const [selectedNode, setSelectedNode] = useState<(typeof nodes)[0] | null>(null);

  const filtered = selectedRegion === "All" ? nodes : nodes.filter((n) => n.region === selectedRegion);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <section className="pt-32 pb-16 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 dot-bg opacity-20" />
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-6">
            <Globe className="w-4 h-4 text-blue-400" />
            <span className="text-white/60 text-sm font-medium">Global Network</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
            Servers across <span className="gradient-text-white">the world</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            12 data centers on 6 continents. Choose the location closest to your players for the lowest ping.
          </p>
        </div>
      </section>
      <section className="py-8 bg-slate-50/80 border-b border-slate-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 flex-wrap">
            {regionFilters.map((r) => (
              <button key={r} onClick={() => setSelectedRegion(r)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${selectedRegion === r ? "bg-blue-500 text-white shadow-md" : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"}`}>{r}</button>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 stagger-children">
            {filtered.map((node) => (
              <div key={node.id} onClick={() => setSelectedNode(node)} className="card-professional p-6 cursor-pointer group">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{node.flag}</span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)] group-hover:text-blue-500 transition-colors">{node.city}</h3>
                      <p className="text-xs text-slate-500">{node.region}</p>
                    </div>
                  </div>
                  <Badge variant="success">Online</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Load</span>
                    <span className="font-medium text-slate-900">{node.load}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full transition-all ${node.load < 30 ? "bg-green-500" : node.load < 60 ? "bg-blue-500" : node.load < 80 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${node.load}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Latency</span>
                    <span className="font-medium text-slate-900">{node.latency}</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1 text-sm font-semibold text-blue-500 group-hover:gap-2 transition-all">
                  View details <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="py-16 aurora-bg relative overflow-hidden">
        <div className="absolute inset-0 noise-overlay" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 fade-up">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-[family-name:var(--font-heading)] mb-3">Pick your closest node</h2>
          <p className="text-white/50 mb-6">Deploy your server to any location for the best player experience.</p>
          <Link href="/register" className="btn-primary text-base inline-flex items-center gap-2">Get Started <ArrowRight className="w-4 h-4" /></Link>
        </div>
      </section>
      <PublicFooter />
      <Modal open={!!selectedNode} onClose={() => setSelectedNode(null)} title={selectedNode ? `${selectedNode.city} — ${selectedNode.region}` : ""} description={`IP: ${selectedNode?.ip}`} size="lg">
        {selectedNode && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Wifi, label: "Status", value: "Online", color: "text-green-500" },
                { icon: Activity, label: "Load", value: `${selectedNode.load}%`, color: "text-blue-500" },
                { icon: MapPin, label: "Latency", value: selectedNode.latency, color: "text-purple-500" },
                { icon: Server, label: "Network", value: selectedNode.network, color: "text-orange-500" },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-slate-50 rounded-xl p-4 text-center">
                    <Icon className={`w-5 h-5 ${item.color} mx-auto mb-1`} />
                    <p className="text-xs text-slate-500">{item.label}</p>
                    <p className="text-sm font-bold text-slate-900">{item.value}</p>
                  </div>
                );
              })}
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">Hardware</h4>
              <div className="space-y-2">
                {[
                  { icon: Cpu, label: "Processor", value: selectedNode.cpu },
                  { icon: HardDrive, label: "Memory", value: selectedNode.ram },
                  { icon: HardDrive, label: "Storage", value: selectedNode.storage },
                ].map((hw) => {
                  const Icon = hw.icon;
                  return (
                    <div key={hw.label} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-500 flex-shrink-0">{hw.label}</span>
                      <span className="text-sm font-medium text-slate-900 ml-auto">{hw.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Link href="/register" className="btn-primary flex-1 text-center">Deploy Here</Link>
              <Button variant="ghost" className="flex-1" onClick={() => setSelectedNode(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
