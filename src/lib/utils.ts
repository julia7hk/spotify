export function getRelativeTime(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 30) return `${diffDay}d ago`;
  const diffMo = Math.floor(diffDay / 30);
  if (diffMo < 12) return `${diffMo}mo ago`;
  return `${Math.floor(diffMo / 12)}y ago`;
}

export function formatDuration(
  minutes: number | null
): { min: number; sec: number } | null {
  if (minutes == null) return null;
  return {
    min: Math.floor(minutes),
    sec: Math.round((minutes % 1) * 60),
  };
}

/** "2026-08" -> "Aug '26" */
export function formatMonth(month: string): string {
  const [year, mo] = month.split("-");
  const date = new Date(Number(year), Number(mo) - 1, 1);
  const name = date.toLocaleString("en-US", { month: "short" });
  return `${name} '${year.slice(2)}`;
}

export function cx(...parts: (string | false | null | undefined)[]): string {
  return parts.filter(Boolean).join(" ");
}
