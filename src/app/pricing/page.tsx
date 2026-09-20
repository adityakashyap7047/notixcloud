"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MarketingLayout } from "@/components/layout/marketing-layout";
import { Check, ChevronDown, Server, Zap, Shield } from "lucide-react";

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

const plans = [
  {
    name: "Starter",
    priceMonthly: 40,
    priceAnnual: 35,
    currency: "₹",
    description: "Perfect for small survival servers with friends",
    features: [
      { text: "2 GB RAM", included: true },
      { text: "10 GB NVMe Storage", included: true },
      { text: "10 Player Slots", included: true },
      { text: "DDoS Protection", included: true },
      { text: "Automatic Backups", included: true },
      { text: "Standard Support", included: true },
      { text: "Custom Domain", included: false },
      { text: "Modpack Installer", included: false },
      { text: "Priority Support", included: false },
    ],
    popular: false,
    icon: Server,
  },
  {
    name: "Pro",
    priceMonthly: 149,
    priceAnnual: 120,
    currency: "₹",
    description: "Best for modded servers and growing communities",
    features: [
      { text: "6 GB RAM", included: true },
      { text: "30 GB NVMe Storage", included: true },
      { text: "Unlimited Slots", included: true },
      { text: "DDoS Protection", included: true },
      { text: "Automatic Backups", included: true },
      { text: "Priority Support", included: true },
      { text: "Custom Domain", included: true },
      { text: "Modpack Installer", included: true },
      { text: "Dedicated IP", included: false },
    ],
    popular: true,
    icon: Zap,
  },
  {
    name: "Enterprise",
    priceMonthly: 499,
    priceAnnual: 399,
    currency: "₹",
    description: "For large networks and businesses",
    features: [
      { text: "16 GB RAM", included: true },
      { text: "80 GB NVMe Storage", included: true },
      { text: "Unlimited Slots", included: true },
      { text: "Advanced DDoS Protection", included: true },
      { text: "Real-time Backups", included: true },
      { text: "24/7 Phone Support", included: true },
      { text: "Custom Domain", included: true },
      { text: "Modpack Installer", included: true },
      { text: "Dedicated IP", included: true },
    ],
    popular: false,
    icon: Shield,
  },
];

const faqs = [
  { q: "How quickly will my server be set up?", a: "Your server is deployed and ready to use within 30 seconds of completing your order. You'll receive your connection details instantly via email and dashboard." },
  { q: "Can I upgrade my plan later?", a: "Absolutely. You can upgrade or downgrade your server resources at any time from the dashboard. Changes take effect within minutes with no downtime." },
  { q: "Do you support modded servers?", a: "Yes! We support Forge, Fabric, Paper, Spigot, and all major server types. Our one-click modpack installer supports over 100 popular modpacks." },
  { q: "What kind of support do you offer?", a: "We offer 24/7 support via live chat and tickets. Pro and Enterprise plans include priority support with faster response times. Enterprise also includes phone support." },
  { q: "Is there a money-back guarantee?", a: "Yes, we offer a 7-day money-back guarantee on all plans. If you're not satisfied, contact support for a full refund." },
  { q: "What payment methods do you accept?", a: "We support instant UPI payments via all major apps — GPay, PhonePe, Paytm, and more. Your balance is credited automatically after payment. We also accept manual bank transfers for larger amounts." },
];

export default function PricingPage() {
  useScrollAnimation();
  const [annual, setAnnual] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <MarketingLayout>
      <section className="pt-32 pb-20 bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 hero-grid opacity-30" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 rounded-full mb-6 border border-cyan-500/20">
            <span className="text-xs font-semibold text-cyan-400 tracking-wide uppercase">Pricing</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
            Simple, Transparent <span className="text-cyan-400">Pricing</span>
          </h1>
          <p className="text-lg text-white/40 max-w-xl mx-auto mb-10">
            No hidden fees. No surprises. Cancel anytime.
          </p>
          <div className="inline-flex p-1 bg-white/5 border border-white/10 rounded-full">
            <button
              onClick={() => setAnnual(false)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${!annual ? "bg-cyan-500 text-black" : "text-white/50 hover:text-white/70"}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-6 py-2 rounded-full text-sm font-semibold transition-all ${annual ? "bg-cyan-500 text-black" : "text-white/50 hover:text-white/70"}`}
            >
              Annual <span className="text-xs ml-1 opacity-70">Save 25%</span>
            </button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#0a0a0f]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start stagger-children">
            {plans.map((plan) => {
              const price = annual ? plan.priceAnnual : plan.priceMonthly;
              const Icon = plan.icon;
              return (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl border p-8 transition-all duration-500 ${
                    plan.popular
                      ? "border-cyan-500/40 bg-gradient-to-b from-cyan-500/10 to-transparent shadow-lg shadow-cyan-500/10 scale-[1.02]"
                      : "border-white/10 bg-gradient-to-b from-white/5 to-transparent hover:border-white/20"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-cyan-500 text-black text-xs font-bold rounded-full">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-cyan-500/10 border border-cyan-500/20 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white font-[family-name:var(--font-heading)]">{plan.name}</h3>
                  </div>
                  <p className="text-sm text-white/40 mb-6">{plan.description}</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-bold text-white font-[family-name:var(--font-heading)]">{plan.currency}{price}</span>
                    <span className="text-white/40">/mo</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f.text} className={`flex items-center gap-3 text-sm ${f.included ? "text-white/70" : "text-white/20"}`}>
                        <Check className={`w-4 h-4 flex-shrink-0 ${f.included ? "text-cyan-400" : "text-white/10"}`} />{f.text}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/register"
                    className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all w-full ${
                      plan.popular
                        ? "bg-cyan-500 hover:bg-cyan-400 text-black hover:shadow-lg hover:shadow-cyan-500/25"
                        : "bg-white/5 border border-white/10 hover:border-white/20 text-white"
                    }`}
                  >
                    {plan.popular ? "Get Started Now" : "Choose Plan"}
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#0d1117] border-t border-b border-white/5">
        <div className="max-w-4xl mx-auto px-6 fade-up">
          <h2 className="text-3xl font-bold text-white font-[family-name:var(--font-heading)] text-center mb-12">
            Plan <span className="text-cyan-400">Comparison</span>
          </h2>
          <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
            <div className="grid grid-cols-4 text-sm font-semibold border-b border-white/10">
              <div className="p-4 text-white/40">Feature</div>
              {plans.map((p) => (
                <div key={p.name} className={`p-4 text-center ${p.popular ? "text-cyan-400 bg-cyan-500/5" : "text-white"}`}>{p.name}</div>
              ))}
            </div>
            {[
              { label: "RAM", values: ["2 GB", "6 GB", "16 GB"] },
              { label: "Storage", values: ["10 GB", "30 GB", "80 GB"] },
              { label: "Player Slots", values: ["10", "Unlimited", "Unlimited"] },
              { label: "DDoS Protection", values: ["Basic", "Advanced", "Premium"] },
              { label: "Backups", values: ["Daily", "Daily", "Real-time"] },
              { label: "Support", values: ["Standard", "Priority", "24/7 Phone"] },
              { label: "Custom Domain", values: ["-", "Yes", "Yes"] },
              { label: "Modpack Installer", values: ["-", "Yes", "Yes"] },
              { label: "Dedicated IP", values: ["-", "-", "Yes"] },
            ].map((row, i) => (
              <div key={row.label} className={`grid grid-cols-4 text-sm ${i % 2 === 0 ? "bg-white/[0.02]" : ""}`}>
                <div className="p-4 text-white/50 font-medium">{row.label}</div>
                {row.values.map((val, j) => (
                  <div key={j} className={`p-4 text-center ${val === "-" ? "text-white/15" : "text-white/70"} ${plans[j].popular ? "bg-cyan-500/[0.03]" : ""}`}>
                    {val}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-[#0a0a0f]">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12 fade-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-cyan-500/10 rounded-full mb-6 border border-cyan-500/20">
              <span className="text-xs font-semibold text-cyan-400 tracking-wide uppercase">Help</span>
            </div>
            <h2 className="text-3xl font-bold text-white font-[family-name:var(--font-heading)]">
              Frequently Asked Questions
            </h2>
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

      <section className="py-20 bg-[#0a0a0f] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-cyan-500/5" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 fade-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
            Still have questions?
          </h2>
          <p className="text-white/40 mb-8">Our support team is here to help you find the perfect plan.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-8 py-4 rounded-lg text-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/25">
              Contact Support →
            </Link>
            <Link href="/register" className="bg-white/5 border border-white/10 hover:border-white/20 text-white font-semibold px-8 py-4 rounded-lg text-sm transition-all duration-300">
              Start Free Trial
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
