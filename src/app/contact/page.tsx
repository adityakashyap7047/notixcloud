"use client";

import { useState, useEffect } from "react";
import { PublicNavbar } from "@/components/layout/public-navbar";
import { PublicFooter } from "@/components/layout/public-footer";
import { Mail, MessageSquare, Clock, Send } from "lucide-react";

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
    document.querySelectorAll(".fade-up").forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

export default function ContactPage() {
  useScrollAnimation();
  const [submitted, setSubmitted] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <PublicNavbar />

      <section className="pt-32 pb-20 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0 dot-bg opacity-20" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px]" />
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full mb-6">
            <Mail className="w-4 h-4 text-blue-400" />
            <span className="text-white/60 text-sm font-medium">Contact Us</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white font-[family-name:var(--font-heading)] mb-4">
            Get in <span className="gradient-text-white">touch</span>
          </h1>
          <p className="text-lg text-white/50 max-w-xl mx-auto">
            Have questions? We&apos;d love to hear from you.
          </p>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="fade-up">
              <h2 className="text-2xl font-bold text-slate-900 font-[family-name:var(--font-heading)] mb-6">Send us a message</h2>
              {submitted ? (
                <div className="card-professional p-8 text-center">
                  <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">Message sent!</h3>
                  <p className="text-sm text-slate-500">We&apos;ll get back to you within 24 hours.</p>
                </div>
              ) : (
                <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true); }} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Name</label>
                      <input type="text" required className="input w-full" placeholder="Your name" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700 mb-1 block">Email</label>
                      <input type="email" required className="input w-full" placeholder="you@example.com" />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Subject</label>
                    <select className="select w-full">
                      <option>General Inquiry</option>
                      <option>Technical Support</option>
                      <option>Billing Question</option>
                      <option>Partnership</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700 mb-1 block">Message</label>
                    <textarea required rows={5} className="input w-full resize-none" placeholder="How can we help?" />
                  </div>
                  <button type="submit" className="btn-primary w-full inline-flex items-center justify-center gap-2">
                    Send Message <Send className="w-4 h-4" />
                  </button>
                </form>
              )}
            </div>

            <div className="space-y-6 fade-up" style={{ transitionDelay: "200ms" }}>
              <div className="card-professional p-6">
                <Mail className="w-6 h-6 text-blue-500 mb-3" />
                <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)] mb-1">Email</h3>
                <p className="text-sm text-slate-500">support@notixcloud.com</p>
              </div>
              <div className="card-professional p-6">
                <MessageSquare className="w-6 h-6 text-blue-500 mb-3" />
                <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)] mb-1">Live Chat</h3>
                <p className="text-sm text-slate-500">Available 24/7 for Pro and Enterprise plans.</p>
              </div>
              <div className="card-professional p-6">
                <Clock className="w-6 h-6 text-blue-500 mb-3" />
                <h3 className="text-base font-bold text-slate-900 font-[family-name:var(--font-heading)] mb-1">Response Time</h3>
                <p className="text-sm text-slate-500">Average ticket response: under 5 minutes.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
