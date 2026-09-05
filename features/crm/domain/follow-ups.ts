import type { FollowUpBucket } from "./contracts";

const INDIA_OFFSET_MS = 5.5 * 60 * 60 * 1000;
function indiaDayKey(date: Date): string {
  return new Date(date.getTime() + INDIA_OFFSET_MS).toISOString().slice(0, 10);
}
export function classifyFollowUp(
  dueAt: string,
  completedAt: string | null,
  now = new Date(),
): FollowUpBucket {
  if (completedAt) return "COMPLETED";
  const due = new Date(dueAt);
  if (due.getTime() < now.getTime() && indiaDayKey(due) < indiaDayKey(now)) return "OVERDUE";
  if (indiaDayKey(due) === indiaDayKey(now)) return "TODAY";
  return "UPCOMING";
}
export function formatIndiaDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
