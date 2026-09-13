"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import {
  ArrowRight, Users, Target, Heart, Globe, Shield, Zap,
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

const values = [
  { icon: Zap, title: "Performance First", desc: "Every decision we make starts with one question: will this make servers faster?" },
  { icon: Shield, title: "Reliability", desc: "99.9% uptime isn't a goal — it's a guarantee backed by our SLA." },
  { icon: Heart, title: "Community", desc: "We built NotiX for the Minecraft community, and community feedback drives our roadmap." },
  { icon: Target, title: "Simplicity", desc: "Powerful doesn't have to mean complicated. We make complex things simple." },
];

const milestones = [
  { year: "2022", title: "Founded", desc: "NotiX Cloud started with a simple idea: server hosting should be easy." },
  { year: "2023", title: "1,000 Servers", desc: "Reached our first milestone of 1,000 active servers hosted." },
  { year: "2024", title: "Global Expansion", desc: "Expanded to 11 data centers across 6 continents." },
  { year: "2025", title: "10,000+ Servers", desc: "Now hosting over 10,000 servers for players worldwide." },
];

export default function AboutPage() {
  useScrollAnimation();

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 dot-bg opacity-20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-6">
            <Users className="w-4 h-4 text-blue-400" />
            <span className="text-white/60 text-sm font-medium">About Us</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
            We make server hosting <span className="gradient-text-white">simple</span>
          </h1>
          <p className="text-lg text-white/50 max-w-2xl mx-auto">
            NotiX Cloud was built by gamers, for gamers. We believe everyone deserves fast, reliable, and affordable server hosting.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="fade-up">
              <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-[family-name:var(--font-heading)] mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-slate-600 leading-relaxed mb-6">
                We started NotiX Cloud because we were frustrated with slow, expensive, and complicated server hosting. 
                We wanted a platform that just works — fast setup, great performance, and support that actually helps.
              </p>
              <p className="text-lg text-slate-600 leading-relaxed mb-8">
                Today, we host over 10,000 servers for players across 6 continents. Our team works around the clock 
                to ensure every server runs smoothly, every player has a great experience, and every server owner 
                feels supported.
              </p>
              <Link href="/register" className="btn-primary inline-flex items-center gap-2">
                Join our community <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 fade-up" style={{ transitionDelay: "200ms" }}>
              {[
                { value: "10,000+", label: "Servers Hosted", icon: Globe },
                { value: "50M+", label: "Players Served", icon: Users },
                { value: "99.9%", label: "Uptime SLA", icon: Shield },
                { value: "24/7", label: "Expert Support", icon: Heart },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="card-professional p-5 text-center">
                    <Icon className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                    <p className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-slate-50/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16 fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">
              Our Values
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.title} className="card-professional p-6 text-center group">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-500 group-hover:shadow-lg group-hover:shadow-blue-500/20 transition-all duration-300">
                    <Icon className="w-6 h-6 text-blue-500 group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 font-[family-name:var(--font-heading)]">{v.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16 fade-up">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-[family-name:var(--font-heading)]">
              Our Journey
            </h2>
          </div>
          <div className="space-y-8 stagger-children">
            {milestones.map((m, i) => (
              <div key={m.year} className="flex gap-6 items-start">
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-blue-500/20">
                    {m.year.slice(2)}
                  </div>
                  {i < milestones.length - 1 && <div className="w-0.5 h-8 bg-slate-200 mt-2" />}
                </div>
                <div className="card-professional p-5 flex-1">
                  <h3 className="text-base font-bold text-slate-900 mb-1 font-[family-name:var(--font-heading)]">{m.title}</h3>
                  <p className="text-sm text-slate-500">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 aurora-bg relative overflow-hidden">
        <div className="absolute inset-0 noise-overlay" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 fade-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
            Join the NotiX family
          </h2>
          <p className="text-lg text-white/50 mb-8">
            Start hosting with us today and experience the difference.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/register" className="btn-primary text-base inline-flex items-center gap-2">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/features" className="btn-secondary text-base">
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
