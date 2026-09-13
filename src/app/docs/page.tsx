"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  BookOpen, ArrowRight, Terminal, Server, Shield, Settings,
  FileText, Code, Users, Search, Rocket,
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

const guides = [
  {
    icon: Rocket,
    category: "Getting Started",
    title: "Create Your First Server",
    description: "Step-by-step guide to deploying your Minecraft server in under 2 minutes.",
    content: [
      "1. Create a free account at notixcloud.com/register",
      "2. Verify your email address",
      "3. Navigate to the Dashboard and click 'Create Server'",
      "4. Choose your server type (Paper, Spigot, Forge, etc.)",
      "5. Select your preferred location",
      "6. Click 'Deploy' — your server is live in seconds!",
      "7. Copy the IP address and connect from your Minecraft client",
    ],
  },
  {
    icon: Terminal,
    category: "Server Management",
    title: "Using the Console",
    description: "Learn how to send commands and monitor your server in real-time.",
    content: [
      "Navigate to your server dashboard and click the 'Console' tab",
      "The live console shows real-time server output",
      "Type commands in the input field and press Enter or click Send",
      "Common commands: help, list, stop, say, tp, give, gamemode",
      "The console automatically color-codes different message types",
      "You can clear the console output with the Clear button",
    ],
  },
  {
    icon: FileText,
    category: "Server Management",
    title: "File Manager",
    description: "Upload, edit, and manage your server files directly from the dashboard.",
    content: [
      "Open the 'Files' tab in your server dashboard",
      "Browse directories by clicking on folder names",
      "Upload files using the Upload button or drag-and-drop",
      "Create new files and folders with the respective buttons",
      "Edit files directly in the browser with syntax highlighting",
      "Delete files by hovering and clicking the trash icon",
    ],
  },
  {
    icon: Shield,
    category: "Security",
    title: "DDoS Protection",
    description: "Understanding our enterprise-grade DDoS protection system.",
    content: [
      "All servers include basic DDoS protection by default",
      "Pro plans get standard mitigation up to 500Gbps",
      "Enterprise plans get advanced mitigation up to 1Tbps",
      "Protection covers Layer 3, 4, and 7 attacks",
      "Automatic traffic filtering with zero downtime",
      "Real-time attack monitoring in your dashboard",
    ],
  },
  {
    icon: Settings,
    category: "Configuration",
    title: "Server Properties",
    description: "Configure your server settings for optimal performance.",
    content: [
      "Access server.properties via the File Manager",
      "Key settings: server-port, max-players, difficulty, gamemode",
      "Adjust view-distance and simulation-distance for performance",
      "Set the MOTD (Message of the Day) for your server",
      "Enable whitelist for private servers",
      "Restart the server after making changes",
    ],
  },
  {
    icon: Users,
    category: "Community",
    title: "Player Management",
    description: "Manage whitelist, bans, and operator permissions.",
    content: [
      "Use the Players tab to view online players",
      "Add players to the whitelist for private servers",
      "Ban players directly from the dashboard",
      "OP (operator) status grants admin commands in-game",
      "Use /op <player> in console to grant operator status",
      "View player UUIDs for advanced management",
    ],
  },
  {
    icon: Code,
    category: "Advanced",
    title: "Modpack Installation",
    description: "Install Forge, Fabric, and popular modpacks with one click.",
    content: [
      "Navigate to your server settings",
      "Select the server type (Forge, Fabric, etc.)",
      "Choose your preferred version from the dropdown",
      "For modpacks, browse the built-in modpack library",
      "Click 'Install' and the modpack deploys automatically",
      "Upload custom mods via the File Manager's mods/ directory",
    ],
  },
  {
    icon: Server,
    category: "Advanced",
    title: "FTP/SFTP Access",
    description: "Connect with any FTP client for advanced file management.",
    content: [
      "Find your FTP credentials in the server settings",
      "Supported protocols: SFTP (recommended), FTP, FTPS",
      "Recommended clients: FileZilla, WinSCP, Cyberduck",
      "Use port 22 for SFTP connections",
      "Upload large files or bulk directories easily",
      "Always back up before making bulk changes",
    ],
  },
];

const categories = ["all", ...new Set(guides.map((g) => g.category))];

export default function DocsPage() {
  useScrollAnimation();
  const [selectedGuide, setSelectedGuide] = useState<(typeof guides)[0] | null>(null);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch] = useState("");

  const filtered = guides.filter((g) => {
    const matchesCategory = activeCategory === "all" || g.category === activeCategory;
    const matchesSearch = g.title.toLowerCase().includes(search.toLowerCase()) || g.description.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      <section className="pt-32 pb-16 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 dot-bg opacity-20" />
        <div className="absolute top-1/3 right-1/3 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-6">
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span className="text-white/60 text-sm font-medium">Documentation</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
            Learn & <span className="gradient-text-white">build</span>
          </h1>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            Guides, tutorials, and documentation to help you master server hosting.
          </p>
        </div>
      </section>

      <section className="py-6 bg-slate-50/80 border-b border-slate-100 sticky top-16 z-30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search documentation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setActiveCategory(c)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                    activeCategory === c
                      ? "bg-blue-500 text-white shadow-md"
                      : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                  }`}
                >
                  {c === "all" ? "All" : c}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
            {filtered.map((guide, i) => {
              const Icon = guide.icon;
              return (
                <div
                  key={i}
                  onClick={() => setSelectedGuide(guide)}
                  className="card-professional p-6 cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                      <Icon className="w-6 h-6 text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-blue-500 uppercase tracking-wider">{guide.category}</span>
                      <h3 className="text-base font-bold text-slate-900 mt-1 mb-2 font-[family-name:var(--font-heading)] group-hover:text-blue-500 transition-colors">
                        {guide.title}
                      </h3>
                      <p className="text-sm text-slate-500 leading-relaxed">{guide.description}</p>
                      <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-blue-500 group-hover:gap-2 transition-all">
                        Read guide <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-12">
              <p className="text-slate-500">No guides found. Try a different search or category.</p>
            </div>
          )}
        </div>
      </section>

      <PublicFooter />

      <Modal
        open={!!selectedGuide}
        onClose={() => setSelectedGuide(null)}
        title={selectedGuide?.title}
        description={selectedGuide?.description}
        size="lg"
      >
        {selectedGuide && (
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg">
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">{selectedGuide.category}</span>
            </div>
            <div className="bg-slate-50 rounded-xl p-5">
              <h4 className="text-sm font-bold text-slate-900 mb-3 uppercase tracking-wider">Step-by-step guide</h4>
              <ol className="space-y-2">
                {selectedGuide.content.map((step, i) => (
                  <li key={i} className="text-sm text-slate-600 leading-relaxed pl-1">{step}</li>
                ))}
              </ol>
            </div>
            <div className="flex gap-3">
              <Link href="/register" className="btn-primary flex-1 text-center">Try it now</Link>
              <Button variant="ghost" className="flex-1" onClick={() => setSelectedGuide(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
