"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { MarketingLayout } from "@/components/layout/marketing-layout";

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
    const elements = document.querySelectorAll(
      ".fade-up, .fade-down, .fade-left, .fade-right, .scale-in, .blur-in, .stagger-children"
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return progress;
}

function useCounter(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const startTime = Date.now();
          const animate = () => {
            const elapsed = Date.now() - startTime;
            const p = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - p, 3);
            setCount(Math.floor(eased * end));
            if (p < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);
  return { count, ref };
}

function ScrollProgressBar() {
  const progress = useScrollProgress();
  return <div className="scroll-progress" style={{ width: `${progress}%` }} />;
}

/* ======================== HERO ======================== */

function Hero() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const words = ["Game Servers", "Modpacks", "Communities", "Networks"];

  const goTo = useCallback(
    (index: number) => {
      if (isTransitioning) return;
      setIsTransitioning(true);
      setCurrent(index);
      setTimeout(() => setIsTransitioning(false), 800);
    },
    [isTransitioning]
  );

  useEffect(() => {
    const timer = setInterval(() => goTo((current + 1) % words.length), 3000);
    return () => clearInterval(timer);
  }, [current, goTo, words.length]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-zinc-950 via-blue-950/80 to-zinc-950" />
      <div className="absolute inset-0 dot-bg opacity-20" />
      <div className="absolute inset-0 hero-grid" />
      <div className="absolute inset-0 mesh-gradient" />
      <div className="absolute inset-0 noise-overlay" />

      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-[150px] animate-float-slow" />
      <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[180px] animate-float-reverse" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/3 rounded-full blur-[200px]" />

      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${5 + i * 8}%`,
            top: `${10 + (i % 5) * 18}%`,
            animationDuration: `${5 + i * 1.5}s`,
            animationDelay: `${i * 0.4}s`,
            width: `${3 + (i % 3)}px`,
            height: `${3 + (i % 3)}px`,
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6">
        <div className="max-w-4xl">
          <div
            className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-8"
            style={{ animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both" }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/60 text-sm font-medium">All systems operational &middot; 99.9% uptime</span>
          </div>

          <h1
            className="text-5xl sm:text-6xl lg:text-[4.5rem] font-bold text-white font-[family-name:var(--font-heading)] leading-[1.08] mb-7"
            style={{ animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both" }}
          >
            Premium hosting for
            <br />
            <span className="relative inline-block">
              <span className="gradient-text-white">{words[current]}</span>
              <span className="absolute -bottom-1 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full" style={{ animation: "line-draw 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards" }} />
            </span>
          </h1>

          <p
            className="text-lg sm:text-xl text-white/40 max-w-xl mb-12 leading-relaxed"
            style={{ animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both" }}
          >
            Lightning-fast Minecraft servers with instant setup, DDoS protection, and a dashboard that puts you in full control.
          </p>

          <div
            className="flex flex-wrap gap-4 mb-16"
            style={{ animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both" }}
          >
            <Link href="/register" className="btn-primary text-base inline-flex items-center gap-2 group">
              <span className="flex items-center gap-2">
                Start Free Trial
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </Link>
            <Link href="/features" className="btn-secondary text-base inline-flex items-center gap-2">
              See How It Works
            </Link>
          </div>

          <div
            className="flex flex-wrap items-center gap-x-8 gap-y-3"
            style={{ animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both" }}
          >
            {["99.9% Uptime", "30s Setup", "DDoS Protection", "24/7 Support"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-white/30">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 hidden lg:flex flex-col items-center gap-2">
        <span className="text-white/20 text-xs font-medium tracking-widest rotate-90 mb-6">SCROLL</span>
        <div className="w-5 h-8 border-2 border-white/15 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/40 rounded-full animate-bounce" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
    </section>
  );
}

/* ======================== TRUST BAR ======================== */

function TrustBar() {
  const logos = ["Hypixel", "Mineplex", "CubeCraft", "HiveMC", "DataPack", "SpigotMC", "PaperMC", "Forge"];
  return (
    <section className="py-14 bg-white border-y border-zinc-100">
      <div className="max-w-7xl mx-auto px-6">
        <p className="text-center text-xs font-semibold text-zinc-400 mb-8 tracking-widest uppercase fade-up">Trusted by 10,000+ server owners worldwide</p>
        <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
          <div className="flex animate-marquee">
            {[...logos, ...logos].map((logo, i) => (
              <div key={i} className="flex-shrink-0 mx-10 text-xl font-bold text-zinc-200 font-[family-name:var(--font-heading)] select-none hover:text-zinc-300 transition-colors duration-300">{logo}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ======================== HOW IT WORKS ======================== */

function HowItWorks() {
  const steps = [
    {
      num: "01",
      title: "Choose your plan",
      description: "Pick a plan that fits your server. Start small, scale anytime.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" />
        </svg>
      ),
      color: "from-blue-500 to-blue-600",
    },
    {
      num: "02",
      title: "Deploy in 30 seconds",
      description: "Your server is live before you finish your coffee. Mods, maps, all pre-configured.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      ),
      color: "from-amber-500 to-orange-500",
    },
    {
      num: "03",
      title: "Manage everything",
      description: "Console, files, players, backups — one dashboard to rule them all.",
      icon: (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
        </svg>
      ),
      color: "from-emerald-500 to-green-500",
    },
  ];

  return (
    <section className="py-28 bg-white relative">
      <div className="absolute inset-0 grid-bg opacity-40" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-50 rounded-full mb-6">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-xs font-semibold text-emerald-600 tracking-wide uppercase">How It Works</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 font-[family-name:var(--font-heading)] mb-5">
            From zero to <span className="gradient-text">live server</span>
          </h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto">Three steps. No credit card required. It&apos;s that simple.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
          {steps.map((step, idx) => (
            <div key={step.num} className="relative group">
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-14 left-[calc(50%+60px)] w-[calc(100%-120px)] h-[2px] bg-gradient-to-r from-zinc-200 to-zinc-100">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-r-2 border-t-2 border-zinc-300 rotate-45" />
                </div>
              )}
              <div className="card-professional p-8 text-center relative overflow-hidden group-hover:shadow-xl group-hover:shadow-blue-600/5 transition-all duration-500">
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="text-xs font-bold text-zinc-300 tracking-widest mb-4">{step.num}</div>
                <div className={`w-16 h-16 bg-gradient-to-br ${step.color} rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {step.icon}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-3 font-[family-name:var(--font-heading)]">{step.title}</h3>
                <p className="text-sm text-zinc-500 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ======================== FEATURES ======================== */

function Features() {
  const [selected, setSelected] = useState<number | null>(null);
  const features = [
    { icon: "zap", title: "Instant Setup", description: "Your server is live in under 30 seconds.", color: "from-amber-500 to-orange-500", details: "Automated provisioning, one-click creation, pre-configured firewall, instant connection details." },
    { icon: "shield", title: "DDoS Protection", description: "Enterprise-grade protection up to 1Tbps.", color: "from-blue-600 to-blue-700", details: "Layer 3/4/7 mitigation, real-time analysis, automatic detection, zero-downtime during attacks." },
    { icon: "harddrive", title: "NVMe Storage", description: "Blazing-fast NVMe SSDs for smooth gameplay.", color: "from-violet-500 to-purple-600", details: "7GB/s read speeds, redundant RAID arrays, daily snapshots, enterprise-grade hardware." },
    { icon: "globe", title: "Global Locations", description: "12 data centers across 6 continents.", color: "from-emerald-500 to-green-600", details: "<20ms to most players, redundant network paths, BGP routing, premium peering." },
    { icon: "layers", title: "One-Click Mods", description: "Install 100+ modpacks with a single click.", color: "from-pink-500 to-rose-600", details: "Forge, Fabric, Paper, Spigot support. CurseForge integration. Custom JAR upload." },
    { icon: "lock", title: "Automatic Backups", description: "Daily backups with one-click restore.", color: "from-emerald-500 to-green-600", details: "Daily automatic backups, on-demand snapshots, instant restore, 30-day retention." },
  ];

  const iconSvgs: Record<string, React.ReactNode> = {
    zap: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>,
    shield: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>,
    harddrive: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="12" x2="2" y2="12" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>,
    globe: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></svg>,
    layers: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /><polyline points="2 12 12 17 22 12" /></svg>,
    lock: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>,
  };

  return (
    <section className="py-28 bg-zinc-50 relative">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full mb-6">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">Features</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 font-[family-name:var(--font-heading)] mb-5">
            Everything you need to <span className="gradient-text">dominate</span>
          </h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto">Built for performance, designed for simplicity.</p>
          <Link href="/features" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 mt-6 hover:gap-3 transition-all duration-300">
            View All Features
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {features.map((feature, idx) => (
            <button key={feature.title} onClick={() => setSelected(idx)} className="card-professional p-7 group cursor-pointer text-left">
              <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 transition-all duration-300`}>
                {iconSvgs[feature.icon]}
              </div>
              <h3 className="text-lg font-bold text-zinc-900 mb-2 font-[family-name:var(--font-heading)]">{feature.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed mb-3">{feature.description}</p>
              <span className="text-xs font-semibold text-blue-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
                Learn more <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
              </span>
            </button>
          ))}
        </div>
      </div>
      {selected !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={() => setSelected(null)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8" onClick={(e) => e.stopPropagation()} style={{ animation: "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}>
            <button onClick={() => setSelected(null)} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-zinc-100 transition-colors">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
            </button>
            <div className={`w-14 h-14 bg-gradient-to-br ${features[selected].color} rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
              {iconSvgs[features[selected].icon]}
            </div>
            <h2 className="text-2xl font-bold text-zinc-900 font-[family-name:var(--font-heading)] mb-3">{features[selected].title}</h2>
            <p className="text-zinc-500 leading-relaxed mb-4">{features[selected].description}</p>
            <p className="text-sm text-zinc-600 leading-relaxed mb-6">{features[selected].details}</p>
            <div className="flex gap-3">
              <Link href="/features" className="btn-primary flex-1 text-center text-sm">View All Features</Link>
              <button onClick={() => setSelected(null)} className="btn-outline flex-1 text-sm">Close</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ======================== STATS ======================== */

function StatItem({ value, suffix, label, icon }: { value: number; suffix: string; label: string; icon: string }) {
  const { count, ref } = useCounter(value);
  return (
    <div ref={ref} className="text-center group">
      <div className="w-14 h-14 bg-white/8 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-white/12 transition-all duration-300 group-hover:scale-110">
        {icon === "server" && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2" ry="2" /><rect x="2" y="14" width="20" height="8" rx="2" ry="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>}
        {icon === "shield" && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
        {icon === "users" && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>}
        {icon === "headphones" && <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6" /><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" /></svg>}
      </div>
      <div className="text-4xl sm:text-5xl font-bold text-white font-[family-name:var(--font-heading)] mb-2">{count}{suffix}</div>
      <div className="text-sm text-white/35 font-medium tracking-wide">{label}</div>
    </div>
  );
}

function Stats() {
  const stats = [
    { value: 10000, suffix: "+", label: "Servers Hosted", icon: "server" },
    { value: 99, suffix: ".9%", label: "Uptime SLA", icon: "shield" },
    { value: 50, suffix: "M+", label: "Players Served", icon: "users" },
    { value: 24, suffix: "/7", label: "Expert Support", icon: "headphones" },
  ];
  return (
    <section className="py-24 aurora-bg relative overflow-hidden">
      <div className="absolute inset-0 noise-overlay" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 stagger-children">
          {stats.map((stat) => <StatItem key={stat.label} value={stat.value} suffix={stat.suffix} label={stat.label} icon={stat.icon} />)}
        </div>
      </div>
    </section>
  );
}

/* ======================== TESTIMONIALS ======================== */

function Testimonials() {
  const testimonials = [
    {
      name: "Alex Chen",
      role: "Server Owner, PixelCraft",
      text: "Moved from a budget host to NotiX and the difference was night and day. Setup took 20 seconds and the performance is incredible.",
      rating: 5,
    },
    {
      name: "Sarah Miller",
      role: "Modpack Developer",
      text: "The one-click modpack installer saved me hours. I can test different configurations instantly without any hassle.",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Network Admin, RealmX",
      text: "We run 15 servers across 3 regions. NotiX's dashboard makes managing everything effortless. Support responds in minutes.",
      rating: 5,
    },
  ];

  return (
    <section className="py-28 bg-white relative">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20 fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 rounded-full mb-6">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-xs font-semibold text-amber-600 tracking-wide uppercase">Testimonials</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 font-[family-name:var(--font-heading)] mb-5">
            Loved by <span className="gradient-text">server owners</span>
          </h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto">Don&apos;t take our word for it. Here&apos;s what our community says.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
          {testimonials.map((t) => (
            <div key={t.name} className="card-professional p-8 relative group">
              <div className="flex gap-1 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 24 24" fill="#f59e0b" stroke="#f59e0b" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                ))}
              </div>
              <p className="text-zinc-600 leading-relaxed mb-6 text-sm">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm">
                  {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="text-sm font-bold text-zinc-900">{t.name}</p>
                  <p className="text-xs text-zinc-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ======================== PRICING ======================== */

function Pricing() {
  const [annual, setAnnual] = useState(true);
  const plans = [
    { name: "Starter", price: annual ? 5.99 : 7.99, description: "Perfect for small servers", features: ["2 GB RAM", "10 GB NVMe", "10 Players", "DDoS Protection"], popular: false },
    { name: "Pro", price: annual ? 14.99 : 19.99, description: "Best for modded servers", features: ["6 GB RAM", "30 GB NVMe", "Unlimited Players", "Priority Support"], popular: true },
    { name: "Enterprise", price: annual ? 39.99 : 49.99, description: "For large networks", features: ["16 GB RAM", "80 GB NVMe", "Unlimited Players", "24/7 Phone Support"], popular: false },
  ];
  return (
    <section id="pricing" className="py-28 bg-zinc-50 relative">
      <div className="absolute inset-0 grid-bg opacity-30" />
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-50 rounded-full mb-6">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></svg>
            <span className="text-xs font-semibold text-blue-600 tracking-wide uppercase">Pricing</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 font-[family-name:var(--font-heading)] mb-5">Simple, transparent <span className="gradient-text">pricing</span></h2>
          <p className="text-lg text-zinc-500 max-w-xl mx-auto mb-10">No hidden fees. Cancel anytime.</p>
          <div className="flex items-center justify-center gap-4">
            <div className="pricing-toggle inline-flex">
              <button onClick={() => setAnnual(false)} className={`pricing-toggle-option ${!annual ? "active" : ""}`}>Monthly</button>
              <button onClick={() => setAnnual(true)} className={`pricing-toggle-option ${annual ? "active" : ""}`}>Annual <span className="text-xs ml-1 opacity-70">Save 25%</span></button>
            </div>
            <Link href="/pricing" className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">
              Compare all plans &rarr;
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start stagger-children">
          {plans.map((plan) => (
            <div key={plan.name} className={`card-professional p-8 relative ${plan.popular ? "ring-2 ring-blue-600 shadow-xl shadow-blue-600/10 scale-[1.02]" : ""}`}>
              {plan.popular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-600/25">MOST POPULAR</div>}
              <h3 className="text-lg font-bold text-zinc-900 font-[family-name:var(--font-heading)] mb-1">{plan.name}</h3>
              <p className="text-sm text-zinc-500 mb-6">{plan.description}</p>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold text-zinc-900 font-[family-name:var(--font-heading)]">${plan.price}</span>
                <span className="text-zinc-400">/mo</span>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-zinc-600">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0"><polyline points="20 6 9 17 4 12" /></svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/register" className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all ${plan.popular ? "btn-primary w-full" : "btn-outline w-full"}`}>
                {plan.popular ? "Get Started Now" : "Choose Plan"}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ======================== FAQ ======================== */

function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    { q: "How quickly will my server be set up?", a: "Your server is deployed and ready to use within 30 seconds of completing your order. You'll receive your connection details instantly via email and dashboard." },
    { q: "Can I upgrade my plan later?", a: "Absolutely. You can upgrade or downgrade your server resources at any time from the dashboard. Changes take effect within minutes with no downtime." },
    { q: "Do you support modded servers?", a: "Yes! We support Forge, Fabric, Paper, Spigot, and all major server types. Our one-click modpack installer supports over 100 popular modpacks." },
    { q: "What kind of support do you offer?", a: "We offer 24/7 support via live chat and tickets. Pro and Enterprise plans include priority support with faster response times." },
    { q: "Is there a money-back guarantee?", a: "Yes, we offer a 7-day money-back guarantee on all plans. If you're not satisfied, contact support for a full refund." },
  ];

  return (
    <section className="py-28 bg-white relative">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16 fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-violet-50 rounded-full mb-6">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" /><line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span className="text-xs font-semibold text-violet-600 tracking-wide uppercase">FAQ</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-zinc-900 font-[family-name:var(--font-heading)] mb-5">
            Frequently asked <span className="gradient-text">questions</span>
          </h2>
          <p className="text-lg text-zinc-500 max-w-2xl mx-auto">Everything you need to know about NotiX Cloud.</p>
        </div>

        <div className="space-y-3 stagger-children">
          {faqs.map((faq, i) => (
            <div key={i} className="card-professional overflow-hidden cursor-pointer group" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
              <div className="p-6 flex items-center justify-between">
                <h3 className="font-semibold text-zinc-900 pr-4 group-hover:text-blue-600 transition-colors">{faq.q}</h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 transition-all duration-300 text-zinc-400 group-hover:text-blue-500 ${openFaq === i ? "rotate-180 text-blue-500" : ""}`}>
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
              <div className={`transition-all duration-300 ease-in-out ${openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-6 pb-6 text-sm text-zinc-500 leading-relaxed">{faq.a}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10 fade-up">
          <p className="text-sm text-zinc-400">Still have questions? <Link href="/contact" className="text-blue-600 font-semibold hover:text-blue-700 transition-colors">Contact our support team</Link></p>
        </div>
      </div>
    </section>
  );
}

/* ======================== CTA ======================== */

function CTA() {
  return (
    <section className="py-28 relative overflow-hidden">
      <div className="absolute inset-0 animated-gradient-bg" />
      <div className="absolute inset-0 noise-overlay" />
      <div className="absolute inset-0 hero-grid" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-[150px]" />
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10 fade-up">
        <h2 className="text-4xl sm:text-5xl font-bold text-white font-[family-name:var(--font-heading)] mb-6">Ready to launch your server?</h2>
        <p className="text-lg text-white/40 mb-10 max-w-xl mx-auto">Join 10,000+ server owners. Start your free trial today.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/register" className="btn-primary text-base inline-flex items-center gap-2 group">
            <span className="flex items-center gap-2">
              Start Free Trial
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover:translate-x-1">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </span>
          </Link>
          <Link href="/login" className="btn-secondary text-base">Log In to Dashboard</Link>
        </div>
      </div>
    </section>
  );
}

/* ======================== PAGE ======================== */

export default function HomePage() {
  useScrollAnimation();
  return (
    <MarketingLayout>
      <ScrollProgressBar />
      <Hero />
      <TrustBar />
      <HowItWorks />
      <Features />
      <Stats />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
    </MarketingLayout>
  );
}
