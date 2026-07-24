export function formatInr(n: number) {
  return `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatGrams(n: number) {
  return `${n.toFixed(3)} g`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN");
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN");
}

/** Resolve profile/PAN photo paths for <img src> (absolute, relative, or data URL). */
export function resolveMediaUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("data:") || path.startsWith("blob:") || path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const base = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

