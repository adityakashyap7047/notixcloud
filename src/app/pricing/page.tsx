"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import {
  Check, ArrowRight, Server, Shield, Zap, ChevronDown,
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

const plans = [
  {
    name: "Starter",
    priceMonthly: 7.99,
    priceAnnual: 5.99,
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
    priceMonthly: 19.99,
    priceAnnual: 14.99,
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
    priceMonthly: 49.99,
    priceAnnual: 39.99,
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
  { q: "What payment methods do you accept?", a: "We accept UPI, credit/debit cards, and net banking. All payments are processed securely through our payment partners." },
];

export default function PricingPage() {
  useScrollAnimation();
  const [annual, setAnnual] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />
      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 dot-bg opacity-20" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
            Simple, transparent <span className="gradient-text-white">pricing</span>
          </h1>
          <p className="text-lg text-white/50 max-w-xl mx-auto mb-10">
            No hidden fees. No surprises. Cancel anytime. Start with a 7-day free trial.
          </p>
          <div className="pricing-toggle inline-flex">
            <button onClick={() => setAnnual(false)} className={`pricing-toggle-option ${!annual ? "active" : ""}`}>Monthly</button>
            <button onClick={() => setAnnual(true)} className={`pricing-toggle-option ${annual ? "active" : ""}`}>Annual <span className="text-xs ml-1 opacity-70">Save 25%</span></button>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white relative">
        <div className="absolute inset-0 grid-bg opacity-30" />
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start stagger-children">
            {plans.map((plan) => {
              const price = annual ? plan.priceAnnual : plan.priceMonthly;
              const Icon = plan.icon;
              return (
                <div key={plan.name} className={`card-professional p-8 relative ${plan.popular ? "ring-2 ring-blue-600 shadow-xl shadow-blue-600/10 scale-[1.02]" : ""}`}>
                  {plan.popular && <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white text-xs font-bold rounded-full shadow-lg shadow-blue-600/25">MOST POPULAR</div>}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-zinc-900 font-[family-name:var(--font-heading)]">{plan.name}</h3>
                  </div>
                  <p className="text-sm text-zinc-500 mb-6">{plan.description}</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-bold text-zinc-900 font-[family-name:var(--font-heading)]">${price}</span>
                    <span className="text-zinc-400">/mo</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((f) => (
                      <li key={f.text} className={`flex items-center gap-3 text-sm ${f.included ? "text-zinc-700" : "text-zinc-300"}`}>
                        <Check className={`w-4 h-4 flex-shrink-0 ${f.included ? "text-blue-600" : "text-zinc-200"}`} />{f.text}
                      </li>
                    ))}
                  </ul>
                  <button onClick={() => setSelectedPlan(plan)} className={`block text-center py-3 rounded-xl font-semibold text-sm transition-all w-full ${plan.popular ? "btn-primary" : "btn-outline"}`}>
                    {plan.popular ? "Get Started Now" : "Choose Plan"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-zinc-50">
        <div className="max-w-4xl mx-auto px-6 fade-up">
          <h2 className="text-3xl font-bold text-zinc-900 font-[family-name:var(--font-heading)] text-center mb-12">
            Plan <span className="gradient-text">comparison</span>
          </h2>
          <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-sm">
            <div className="grid grid-cols-4 text-sm font-semibold border-b border-zinc-100">
              <div className="p-4 text-zinc-500">Feature</div>
              {plans.map((p) => (
                <div key={p.name} className={`p-4 text-center ${p.popular ? "text-blue-600 bg-blue-50/50" : "text-zinc-900"}`}>{p.name}</div>
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
              <div key={row.label} className={`grid grid-cols-4 text-sm ${i % 2 === 0 ? "bg-zinc-50/50" : ""}`}>
                <div className="p-4 text-zinc-600 font-medium">{row.label}</div>
                {row.values.map((val, j) => (
                  <div key={j} className={`p-4 text-center ${val === "-" ? "text-zinc-300" : "text-zinc-700"} ${plans[j].popular ? "bg-blue-50/30" : ""}`}>
                    {val}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-12 fade-up">
            <h2 className="text-3xl font-bold text-zinc-900 font-[family-name:var(--font-heading)]">
              Frequently asked <span className="gradient-text">questions</span>
            </h2>
          </div>
          <div className="space-y-3 stagger-children">
            {faqs.map((faq, i) => (
              <div key={i} className="card-professional overflow-hidden cursor-pointer group" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="p-6 flex items-center justify-between">
                  <h3 className="font-semibold text-zinc-900 pr-4 group-hover:text-blue-600 transition-colors">{faq.q}</h3>
                  <ChevronDown className={`w-5 h-5 text-zinc-400 flex-shrink-0 transition-all duration-300 group-hover:text-blue-500 ${openFaq === i ? "rotate-180 text-blue-500" : ""}`} />
                </div>
                <div className={`transition-all duration-400 ease-in-out ${openFaq === i ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                  <div className="px-6 pb-6 text-sm text-zinc-500 leading-relaxed">{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 aurora-bg" />
        <div className="absolute inset-0 noise-overlay" />
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 fade-up">
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">Still have questions?</h2>
          <p className="text-white/40 mb-8">Our support team is here to help you find the perfect plan.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/contact" className="btn-primary text-base inline-flex items-center gap-2 group">
              <span className="flex items-center gap-2">Contact Support<ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /></span>
            </Link>
            <Link href="/register" className="btn-secondary text-base">Start Free Trial</Link>
          </div>
        </div>
      </section>
      <PublicFooter />

      <Modal open={!!selectedPlan} onClose={() => setSelectedPlan(null)} title={selectedPlan ? `${selectedPlan.name} Plan` : ""} description={selectedPlan?.description} size="md">
        {selectedPlan && (
          <div className="space-y-6">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-zinc-900 font-[family-name:var(--font-heading)]">${annual ? selectedPlan.priceAnnual : selectedPlan.priceMonthly}</span>
              <span className="text-zinc-400">/mo</span>
              {annual && <span className="text-xs text-green-600 font-semibold ml-2">Save 25%</span>}
            </div>
            <ul className="space-y-3">
              {selectedPlan.features.filter(f => f.included).map((f) => (
                <li key={f.text} className="flex items-center gap-3 text-sm text-zinc-700">
                  <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />{f.text}
                </li>
              ))}
            </ul>
            <div className="flex gap-3 pt-2">
              <Link href="/register" className="btn-primary flex-1 text-center">Get Started with {selectedPlan.name}</Link>
              <Button variant="ghost" className="flex-1" onClick={() => setSelectedPlan(null)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
