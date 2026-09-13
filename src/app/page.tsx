"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import {
  Shield, Zap, HardDrive, Users, Globe, Cpu, Headphones,
  CreditCard, Smartphone, Landmark, Wallet, Rocket, BarChart3,
  CheckCircle, Server, Gamepad2, Bot, Cloud, Globe2, Calculator,
  MessageCircle, ArrowRight, ChevronDown, Activity, Clock,
  ShieldCheck, Banknote, ArrowUpRight, CircuitBoard, Wifi,
  Database, Lock, Gauge,
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
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#0a0a0f]">
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f] via-[#0d1117] to-[#0a0a0f]" />
      <div className="absolute inset-0 hero-grid opacity-40" />
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[200px]" />
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[180px]" />

      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="particle"
          style={{
            left: `${10 + i * 10}%`,
            top: `${15 + (i % 4) * 20}%`,
            animationDuration: `${6 + i * 2}s`,
            animationDelay: `${i * 0.5}s`,
            width: `${3 + (i % 3)}px`,
            height: `${3 + (i % 3)}px`,
            background: "rgba(6, 182, 212, 0.4)",
          }}
        />
      ))}

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 py-24">
        <div className="max-w-4xl">
          <div
            className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-8"
            style={{ animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) both" }}
          >
            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            <span className="text-white/50 text-sm font-medium">NotiX Cloud</span>
          </div>

          <h1
            className="text-5xl sm:text-6xl lg:text-[5rem] font-bold text-white font-[family-name:var(--font-heading)] leading-[1.05] mb-4"
            style={{ animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s both" }}
          >
            NOTIX CLOUD
            <br />
            <span className="text-cyan-400">WHERE CUSTOMERS</span>
            <br />
            <span className="text-cyan-400 underline decoration-cyan-400/30 underline-offset-8">COME FIRST</span>
          </h1>

          <div className="flex items-center gap-2 mb-6" style={{ animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both" }}>
            <span className="text-cyan-400 text-lg font-semibold">&gt;</span>
            <span className="text-white/70 text-lg">High Performance VPS Hosting</span>
            <span className="w-0.5 h-5 bg-cyan-400 animate-pulse" />
          </div>

          <p
            className="text-base text-white/30 max-w-xl mb-10 leading-relaxed"
            style={{ animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s both" }}
          >
            Experience the raw power of dedicated Ryzen infrastructure. Optimized for Minecraft, Discord Bots, Web, and VPS. No lag. No excuses.
          </p>

          <div
            className="flex flex-wrap gap-4 mb-16"
            style={{ animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s both" }}
          >
            <Link href="/register" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-4 rounded-lg text-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-0.5 inline-flex items-center gap-2">
              DEPLOY SERVER <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link href="/features" className="bg-white/5 border border-white/10 hover:border-white/20 text-white font-semibold px-8 py-4 rounded-lg text-sm transition-all duration-300 hover:-translate-y-0.5 inline-flex items-center gap-2">
              <Calculator className="w-4 h-4" /> RESOURCE CALCULATOR
            </Link>
          </div>

          <div
            className="flex flex-wrap gap-6"
            style={{ animation: "fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.4s both" }}
          >
            {[
              { icon: <ShieldCheck className="w-4 h-4 text-cyan-400" />, text: "DDoS Protected" },
              { icon: <HardDrive className="w-4 h-4 text-cyan-400" />, text: "NVMe SSD" },
              { icon: <Rocket className="w-4 h-4 text-cyan-400" />, text: "Instant Deploy" },
              { icon: <Users className="w-4 h-4 text-cyan-400" />, text: "200+ Users" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2.5 text-sm text-white/40 bg-white/5 px-4 py-2 rounded-lg border border-white/5">
                {item.icon}
                <span>{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 right-10 hidden lg:flex flex-col items-center gap-2">
        <span className="text-white/15 text-xs font-medium tracking-widest rotate-90 mb-6">SCROLL</span>
        <div className="w-5 h-8 border-2 border-white/15 rounded-full flex justify-center pt-1.5">
          <div className="w-1 h-2 bg-white/30 rounded-full animate-bounce" />
        </div>
      </div>
    </section>
  );
}

/* ======================== STATS ======================== */

function Stats() {
  const stats = [
    { value: 200, suffix: "+", label: "HAPPY CLIENTS", icon: <Users className="w-5 h-5 text-cyan-400" /> },
    { value: 99, suffix: ".9%", label: "UPTIME", icon: <Activity className="w-5 h-5 text-cyan-400" /> },
    { value: 10, suffix: " Tbps", label: "DDOS SHIELD", icon: <Shield className="w-5 h-5 text-cyan-400" /> },
    { value: 24, suffix: "/7", label: "LIVE SUPPORT", icon: <Headphones className="w-5 h-5 text-cyan-400" /> },
  ];

  const { count: c1, ref: r1 } = useCounter(200);
  const { count: c2, ref: r2 } = useCounter(99);
  const { count: c3, ref: r3 } = useCounter(10);
  const { count: c4, ref: r4 } = useCounter(24);
  const counts = [c1, c2, c3, c4];
  const refs = [r1, r2, r3, r4];

  return (
    <section className="py-20 bg-[#0a0a0f] border-t border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={stat.label} ref={refs[i]} className="text-center">
              <div className="flex justify-center mb-3">{stat.icon}</div>
              <div className="text-4xl sm:text-5xl font-bold text-white font-[family-name:var(--font-heading)] mb-2">
                {counts[i]}{stat.suffix}
              </div>
              <div className="text-xs text-cyan-400 font-semibold tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ======================== SERVICES ======================== */

function Services() {
  const services = [
    {
      title: "Minecraft Hosting",
      price: "From ₹40/mo",
      description: "AMD Epyc 9 CPUs, NVMe SSDs, and one-click plugin installation for best experience.",
      tags: ["Paper", "Forge", "Fabric"],
      popular: true,
      cta: "Get Started",
      href: "/pricing",
      icon: <Gamepad2 className="w-6 h-6" />,
      color: "from-emerald-500/20 to-emerald-500/5",
      borderColor: "border-emerald-500/20",
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
    },
    {
      title: "Among Us Hosting",
      price: "Affordable Plans",
      description: "Host your own private Among Us server with custom maps and full control over your games.",
      tags: ["Custom Maps", "Full Control"],
      popular: false,
      cta: "Start Playing",
      href: "/pricing",
      icon: <Users className="w-6 h-6" />,
      color: "from-rose-500/20 to-rose-500/5",
      borderColor: "border-rose-500/20",
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-400",
    },
    {
      title: "Cloud VPS",
      price: "From ₹250/mo",
      description: "Full root access, dedicated IP, and high clock speeds for any project or application.",
      tags: ["Root Access", "DDoS Protected"],
      popular: false,
      cta: "Deploy Now",
      href: "/pricing",
      icon: <Cloud className="w-6 h-6" />,
      color: "from-violet-500/20 to-violet-500/5",
      borderColor: "border-violet-500/20",
      iconBg: "bg-violet-500/10",
      iconColor: "text-violet-400",
    },
    {
      title: "Web Hosting",
      price: "From ₹120/mo",
      description: "LiteSpeed web servers, free SSL, and NVMe storage for blazing fast websites.",
      tags: ["LiteSpeed", "Free SSL"],
      popular: false,
      cta: "Get Started",
      href: "/pricing",
      icon: <Globe2 className="w-6 h-6" />,
      color: "from-sky-500/20 to-sky-500/5",
      borderColor: "border-sky-500/20",
      iconBg: "bg-sky-500/10",
      iconColor: "text-sky-400",
    },
    {
      title: "Bot Hosting",
      price: "From ₹30/mo",
      description: "Optimized environment for Discord bots, 24/7 uptime with auto-restart on failure.",
      tags: ["Discord Bots", "24/7 Uptime"],
      popular: false,
      cta: "Get Started",
      href: "/pricing",
      icon: <Bot className="w-6 h-6" />,
      color: "from-amber-500/20 to-amber-500/5",
      borderColor: "border-amber-500/20",
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
    },
  ];

  return (
    <section className="py-28 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 rounded-full mb-6 border border-cyan-500/20">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400 tracking-wide uppercase">Services</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white font-[family-name:var(--font-heading)] mb-5">
            Deploy Your Infrastructure
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Enterprise-grade hosting solutions tailored for gamers, developers, and businesses.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {services.map((service) => (
            <div
              key={service.title}
              className={`relative group rounded-2xl border ${service.borderColor} bg-gradient-to-b ${service.color} p-7 hover:shadow-lg hover:shadow-cyan-500/5 transition-all duration-500`}
            >
              {service.popular && (
                <div className="absolute -top-3 right-6 px-3 py-1 bg-cyan-500 text-black text-xs font-bold rounded-full">
                  POPULAR
                </div>
              )}
              <div className={`w-12 h-12 ${service.iconBg} rounded-xl flex items-center justify-center mb-4 ${service.iconColor}`}>
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2 font-[family-name:var(--font-heading)]">{service.title}</h3>
              <div className="text-cyan-400 font-semibold text-sm mb-3">{service.price}</div>
              <p className="text-sm text-white/40 leading-relaxed mb-4">{service.description}</p>
              <div className="flex flex-wrap gap-2 mb-5">
                {service.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white/50">
                    {tag}
                  </span>
                ))}
              </div>
              <Link href={service.href} className="text-sm text-cyan-400 font-semibold hover:text-cyan-300 transition-colors inline-flex items-center gap-1.5">
                {service.cta} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
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
      title: "Choose Your Plan",
      description: "Browse our plans and pick one that fits your needs. Compare resources and pricing.",
      icon: <BarChart3 className="w-7 h-7" />,
    },
    {
      num: "02",
      title: "Make Payment",
      description: "Pay securely via UPI, Esewa, Khalti, or other supported payment methods.",
      icon: <CreditCard className="w-7 h-7" />,
    },
    {
      num: "03",
      title: "Server Deployed",
      description: "Instantly provisioned and ready to use. No manual setup required from your end.",
      icon: <Rocket className="w-7 h-7" />,
    },
  ];

  return (
    <section className="py-28 bg-[#0d1117]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 rounded-full mb-6 border border-cyan-500/20">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400 tracking-wide uppercase">Process</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white font-[family-name:var(--font-heading)] mb-5">
            How It Works
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Get your server running in three simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
          {steps.map((step, idx) => (
            <div key={step.num} className="relative group">
              {idx < steps.length - 1 && (
                <div className="hidden md:block absolute top-14 left-[calc(50%+60px)] w-[calc(100%-120px)] h-[2px] bg-gradient-to-r from-cyan-500/20 to-cyan-500/5">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 border-r-2 border-t-2 border-cyan-500/30 rotate-45" />
                </div>
              )}
              <div className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 text-center group-hover:border-cyan-500/30 transition-all duration-500">
                <div className="w-16 h-16 mx-auto bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400 mb-5">
                  {step.icon}
                </div>
                <div className="text-xs text-white/20 font-bold tracking-widest mb-2">STEP {step.num}</div>
                <h3 className="text-xl font-bold text-white mb-3 font-[family-name:var(--font-heading)]">{step.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ======================== WHY CHOOSE US ======================== */

function WhyChoose() {
  const reasons = [
    {
      icon: <Cpu className="w-6 h-6" />,
      title: "Ryzen Power",
      description: "Latest AMD Ryzen CPUs with high single-thread performance with Lighting Fast NVMe Storage for smooth gameplay.",
      color: "text-orange-400",
      bg: "bg-orange-500/10",
    },
    {
      icon: <ShieldCheck className="w-6 h-6" />,
      title: "DDoS Protected",
      description: "Enterprise-grade mitigation keeps your server online 24/7 under any attack.",
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
    },
    {
      icon: <Headphones className="w-6 h-6" />,
      title: "Expert Support",
      description: "Real humans, not bots. Get help via Discord tickets within minutes.",
      color: "text-sky-400",
      bg: "bg-sky-500/10",
    },
    {
      icon: <Banknote className="w-6 h-6" />,
      title: "Affordable",
      description: "Pocket-friendly plans designed for Indian and Nepali users.",
      color: "text-violet-400",
      bg: "bg-violet-500/10",
    },
  ];

  return (
    <section className="py-28 bg-[#0a0a0f]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 rounded-full mb-6 border border-cyan-500/20">
            <CheckCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400 tracking-wide uppercase">Why Us</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white font-[family-name:var(--font-heading)] mb-5">
            Why Choose NotiX Cloud?
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            We don&apos;t just host your servers — we power your success.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
          {reasons.map((r) => (
            <div key={r.title} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-7 text-center hover:border-cyan-500/30 transition-all duration-500">
              <div className={`w-14 h-14 mx-auto ${r.bg} rounded-2xl flex items-center justify-center ${r.color} mb-4`}>
                {r.icon}
              </div>
              <h3 className="text-lg font-bold text-white mb-3 font-[family-name:var(--font-heading)]">{r.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{r.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ======================== INFRASTRUCTURE ======================== */

function Infrastructure() {
  const items = [
    { icon: <CircuitBoard className="w-7 h-7" />, title: "AMD Ryzen", subtitle: "9 7953X", color: "text-orange-400", bg: "bg-orange-500/10" },
    { icon: <HardDrive className="w-7 h-7" />, title: "NVMe SSD", subtitle: "Gen4 Drives", color: "text-emerald-400", bg: "bg-emerald-500/10" },
    { icon: <Shield className="w-7 h-7" />, title: "DDoS Shield", subtitle: "10 Tbps", color: "text-sky-400", bg: "bg-sky-500/10" },
    { icon: <Wifi className="w-7 h-7" />, title: "1 Gbps", subtitle: "Bandwidth", color: "text-violet-400", bg: "bg-violet-500/10" },
  ];

  return (
    <section className="py-20 bg-[#0d1117] border-t border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12 fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 rounded-full mb-6 border border-cyan-500/20">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400 tracking-wide uppercase">Infrastructure</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white font-[family-name:var(--font-heading)]">
            Powered By The Best
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
          {items.map((item) => (
            <div key={item.title} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/5 to-transparent p-8 text-center hover:border-cyan-500/30 transition-all duration-500">
              <div className={`w-14 h-14 mx-auto ${item.bg} rounded-2xl flex items-center justify-center ${item.color} mb-4`}>
                {item.icon}
              </div>
              <h3 className="text-lg font-bold text-white font-[family-name:var(--font-heading)]">{item.title}</h3>
              <p className="text-sm text-white/40 mt-1">{item.subtitle}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ======================== SERVER CALCULATOR ======================== */

function ServerCalculator() {
  const [serverType, setServerType] = useState("paper");
  const [players, setPlayers] = useState(50);
  const [plugins, setPlugins] = useState(10);
  const [result, setResult] = useState<{ ram: string; cpu: string; disk: string } | null>(null);

  const calculate = () => {
    let ram = 2;
    if (serverType === "forge" || serverType === "fabric") ram = 4;
    ram += Math.floor(players / 10);
    ram += Math.floor(plugins / 5);
    if (ram < 2) ram = 2;
    const cpu = players > 100 ? 4 : players > 50 ? 2 : 1;
    const disk = Math.max(10, ram * 3);
    setResult({ ram: `${ram} GB`, cpu: `${cpu} Cores`, disk: `${disk} GB NVMe` });
  };

  return (
    <section className="py-28 bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12 fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 rounded-full mb-6 border border-cyan-500/20">
            <Calculator className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400 tracking-wide uppercase">Tool</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white font-[family-name:var(--font-heading)] mb-5">
            Server Calculator
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Get accurate resource estimates based on real-world benchmarks.
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-cyan-500/5 to-transparent p-8">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl mb-8">
            <p className="text-sm text-cyan-400 text-center">
              Includes OS overhead, JVM memory, and realistic plugin/mod memory usage. Recommendations are generous for smooth gameplay.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Server Type</label>
              <select
                value={serverType}
                onChange={(e) => setServerType(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
              >
                <option value="paper">Paper / Spigot</option>
                <option value="forge">Forge</option>
                <option value="fabric">Fabric</option>
                <option value="vanilla">Vanilla</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Expected Players</label>
              <input
                type="number"
                value={players}
                onChange={(e) => setPlayers(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                placeholder="e.g. 50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2 block">Plugins</label>
              <input
                type="number"
                value={plugins}
                onChange={(e) => setPlugins(parseInt(e.target.value) || 0)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-cyan-500/50 transition-colors"
                placeholder="e.g. 10"
              />
            </div>
          </div>

          <div className="text-center">
            <button
              onClick={calculate}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-3 rounded-lg text-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 inline-flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" /> CALCULATE RESOURCES
            </button>
          </div>

          {result && (
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                <Database className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-cyan-400">{result.ram}</div>
                <div className="text-xs text-white/40 mt-1">RAM</div>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                <Cpu className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-cyan-400">{result.cpu}</div>
                <div className="text-xs text-white/40 mt-1">CPU</div>
              </div>
              <div className="p-4 bg-white/5 border border-white/10 rounded-xl text-center">
                <HardDrive className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-cyan-400">{result.disk}</div>
                <div className="text-xs text-white/40 mt-1">Storage</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ======================== PAYMENT METHODS ======================== */

function PaymentMethods() {
  const UPILogo = () => (
    <svg viewBox="0 0 120 40" className="w-16 h-8" fill="none">
      <text x="5" y="28" fontFamily="Arial Black, Arial, sans-serif" fontWeight="900" fontSize="22" fill="#00BAF2">UPI</text>
      <text x="58" y="16" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="6" fill="#999">UNIFIED</text>
      <text x="58" y="23" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="6" fill="#999">PAYMENTS</text>
      <text x="58" y="30" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="6" fill="#999">INTERFACE</text>
    </svg>
  );

  const PhonePeLogo = () => (
    <svg viewBox="0 0 120 36" className="w-20 h-8" fill="none">
      <circle cx="16" cy="18" r="14" fill="#5F259F"/>
      <text x="10" y="23" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="14" fill="white">P</text>
      <text x="34" y="24" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="15" fill="#5F259F">Phone</text>
      <text x="88" y="24" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="15" fill="#5F259F">Pe</text>
    </svg>
  );

  const GPayLogo = () => (
    <svg viewBox="0 0 120 40" className="w-20 h-8" fill="none">
      <text x="2" y="30" fontFamily="Arial, sans-serif" fontWeight="400" fontSize="18" fill="#5F6368">G</text>
      <text x="20" y="30" fontFamily="Arial, sans-serif" fontWeight="500" fontSize="18" fill="#5F6368">Pay</text>
    </svg>
  );

  const EsewaLogo = () => (
    <svg viewBox="0 0 120 36" className="w-20 h-8" fill="none">
      <rect x="0" y="4" width="28" height="28" rx="6" fill="#60BB46"/>
      <text x="5" y="24" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="16" fill="white">e</text>
      <text x="34" y="26" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="17" fill="#60BB46">Sewa</text>
    </svg>
  );

  const KhaltiLogo = () => (
    <svg viewBox="0 0 120 36" className="w-20 h-8" fill="none">
      <text x="2" y="26" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="18" fill="#E4287C">khalti</text>
    </svg>
  );

  const FonePayLogo = () => (
    <svg viewBox="0 0 130 36" className="w-20 h-8" fill="none">
      <text x="2" y="26" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="16" fill="#E4287C">fone</text>
      <text x="52" y="26" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="16" fill="#333">pay</text>
    </svg>
  );

  const BankLogo = () => (
    <svg viewBox="0 0 120 40" className="w-16 h-8" fill="none">
      <rect x="35" y="4" width="50" height="32" rx="4" fill="none" stroke="#F59E0B" strokeWidth="1.5"/>
      <text x="40" y="18" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="7" fill="#F59E0B">NEPAL</text>
      <text x="40" y="26" fontFamily="Arial, sans-serif" fontWeight="700" fontSize="7" fill="#F59E0B">BANK</text>
      <text x="40" y="33" fontFamily="Arial, sans-serif" fontWeight="500" fontSize="5" fill="#F59E0B">LIMITED</text>
    </svg>
  );

  const methods = [
    { name: "UPI", logo: <UPILogo /> },
    { name: "PhonePe", logo: <PhonePeLogo /> },
    { name: "GPay", logo: <GPayLogo /> },
    { name: "Esewa", logo: <EsewaLogo /> },
    { name: "Khalti", logo: <KhaltiLogo /> },
    { name: "FonePay", logo: <FonePayLogo /> },
    { name: "Bank Transfer", logo: <BankLogo /> },
  ];

  return (
    <section className="py-20 bg-[#0d1117] border-t border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-xs font-semibold text-white/30 tracking-widest uppercase mb-2">Accepted Payment Methods</p>
        <p className="text-lg text-white/50 mb-10">We accept all Indian &amp; Nepali payment methods</p>
        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-7 gap-4">
          {methods.map((m) => (
            <div key={m.name} className="p-5 rounded-xl border border-white/10 bg-white/5 hover:border-cyan-500/30 transition-all duration-300 flex flex-col items-center justify-center gap-3 min-h-[100px]">
              <div className="flex items-center justify-center h-10">{m.logo}</div>
              <div className="text-[10px] text-white/40 font-semibold tracking-wider uppercase">{m.name}</div>
            </div>
          ))}
        </div>
        <p className="flex items-center justify-center gap-2 text-xs text-white/30 mt-6">
          <Lock className="w-3.5 h-3.5" /> All transactions secured with 256-bit SSL. For PayPal, Crypto, BKash, Nagad &amp; Cards, use Discord.
        </p>
      </div>
    </section>
  );
}

/* ======================== FAQ ======================== */

function FAQ() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const faqs = [
    { q: "What is NotiX Cloud?", a: "NotiX Cloud is a premium hosting platform for Minecraft servers, VPS, web hosting, and Discord bot hosting. We provide high-performance infrastructure with DDoS protection and 24/7 expert support." },
    { q: "What payments do you accept?", a: "We accept UPI, PhonePe, Google Pay, Esewa, Khalti, FonePay, and Bank Transfers. For PayPal, Crypto, and cards, join our Discord server." },
    { q: "Can I upgrade my plan later?", a: "Absolutely. You can upgrade or downgrade your server resources at any time from the dashboard. Changes take effect within minutes with no downtime." },
    { q: "How fast is server deployment?", a: "Your server is deployed and ready to use within 30 seconds of completing your order. No manual setup required." },
    { q: "Do you offer DDoS protection?", a: "Yes, all our servers come with enterprise-grade DDoS protection up to 10 Tbps. Your server stays online even under attack." },
    { q: "What is your refund policy?", a: "We offer a 7-day money-back guarantee on all plans. If you're not satisfied, contact support for a full refund." },
  ];

  return (
    <section className="py-28 bg-[#0a0a0f]">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16 fade-up">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 rounded-full mb-6 border border-cyan-500/20">
            <Lock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-cyan-400 tracking-wide uppercase">Help</span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white font-[family-name:var(--font-heading)] mb-5">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-white/40 max-w-2xl mx-auto">
            Got questions? We&apos;ve got answers.
          </p>
        </div>

        <div className="space-y-3 stagger-children">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-white/5 cursor-pointer overflow-hidden hover:border-white/15 transition-all duration-300"
              onClick={() => setOpenFaq(openFaq === i ? null : i)}
            >
              <div className="p-6 flex items-center justify-between">
                <h3 className="font-semibold text-white pr-4">{faq.q}</h3>
                <ChevronDown
                  className={`w-5 h-5 flex-shrink-0 transition-all duration-300 ${openFaq === i ? "rotate-180 text-cyan-400" : "text-white/30"}`}
                />
              </div>
              <div className={`transition-all duration-300 ease-in-out ${openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                <div className="px-6 pb-6 text-sm text-white/40 leading-relaxed">{faq.a}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ======================== CTA ======================== */

function CTA() {
  return (
    <section className="py-28 bg-[#0a0a0f] relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-cyan-500/5" />
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10 fade-up">
        <div className="w-16 h-16 mx-auto bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center text-cyan-400 mb-6">
          <Rocket className="w-8 h-8" />
        </div>
        <h2 className="text-4xl sm:text-5xl font-bold text-white font-[family-name:var(--font-heading)] mb-6">
          Ready to Start?
        </h2>
        <p className="text-lg text-white/40 mb-10 max-w-xl mx-auto">
          Deploy your server in seconds and join 200+ happy customers.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/register" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-4 rounded-lg text-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25 hover:-translate-y-0.5 inline-flex items-center gap-2">
            GET STARTED NOW <ArrowUpRight className="w-4 h-4" />
          </Link>
          <Link href="/discord" className="bg-white/5 border border-white/10 hover:border-white/20 text-white font-semibold px-8 py-4 rounded-lg text-sm transition-all duration-300 hover:-translate-y-0.5 inline-flex items-center gap-2">
            <MessageCircle className="w-4 h-4" /> JOIN DISCORD
          </Link>
        </div>
        <p className="text-sm text-white/30 mt-6">Pay with UPI, Esewa, Khalti &amp; more. For more payment options, join Discord.</p>
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
      <Stats />
      <Services />
      <HowItWorks />
      <WhyChoose />
      <Infrastructure />
      <ServerCalculator />
      <PaymentMethods />
      <FAQ />
      <CTA />
    </MarketingLayout>
  );
}
