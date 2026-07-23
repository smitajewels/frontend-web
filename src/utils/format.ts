export function formatInr(n: number) {
  return `₹${n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatGrams(n: number) {
  return `${n.toFixed(4)} g`;
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN");
}

export function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("en-IN");
}

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}
