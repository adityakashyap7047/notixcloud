import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

export function formatCurrency(amount: number, currency = "INR"): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
  }).format(amount);
}

export function getServerStatusColor(status: string): string {
  switch (status) {
    case "RUNNING":
      return "text-emerald-400";
    case "STARTING":
      return "text-yellow-400";
    case "STOPPING":
      return "text-orange-400";
    case "ERROR":
      return "text-red-400";
    default:
      return "text-zinc-500";
  }
}

export function getServerStatusDot(status: string): string {
  switch (status) {
    case "RUNNING":
      return "bg-emerald-400";
    case "STARTING":
      return "bg-yellow-400";
    case "STOPPING":
      return "bg-orange-400";
    case "ERROR":
      return "bg-red-400";
    default:
      return "bg-zinc-500";
  }
}
