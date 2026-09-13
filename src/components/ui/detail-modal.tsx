"use client";

import { useEffect, useRef } from "react";

interface DetailModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function DetailModal({ open, onClose, children }: DetailModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleEsc);
      return () => {
        window.removeEventListener("keydown", handleEsc);
        document.body.style.overflow = "";
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm"
        onClick={onClose}
        style={{ animation: "fadeInUp 0.3s ease-out" }}
      />
      <div
        className="relative z-[101] w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-zinc-200"
        style={{ animation: "scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
      >
        <button
          onClick={onClose}
          className="sticky top-4 float-right mr-4 w-10 h-10 rounded-xl bg-zinc-100 hover:bg-zinc-200 flex items-center justify-center text-zinc-500 hover:text-zinc-700 transition-all z-10"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        {children}
      </div>
    </div>
  );
}
