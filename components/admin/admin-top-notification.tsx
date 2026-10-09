"use client";

import { useEffect, useState } from "react";

export type AdminNotificationType = "success" | "warning" | "error";

const notificationStyles: Record<AdminNotificationType, string> = {
  success: "border-emerald-300 bg-emerald-50 text-emerald-950",
  warning: "border-amber-300 bg-amber-50 text-amber-950",
  error: "border-red-300 bg-red-50 text-red-950",
};

const notificationIcons: Record<AdminNotificationType, string> = {
  success: "✓",
  warning: "⚠",
  error: "!",
};

export function AdminTopNotification({
  type,
  title,
  message,
  autoDismissMs = 6500,
  onDismiss,
}: Readonly<{
  type: AdminNotificationType;
  title: string;
  message: string;
  autoDismissMs?: number;
  onDismiss?: () => void;
}>) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (autoDismissMs <= 0) return;

    const timeout = window.setTimeout(() => {
      setVisible(false);
      onDismiss?.();
    }, autoDismissMs);
    return () => window.clearTimeout(timeout);
  }, [autoDismissMs, message, onDismiss, title, type]);

  if (!visible) return null;

  const dismiss = () => {
    setVisible(false);
    onDismiss?.();
  };

  return (
    <div
      className={`admin-top-notification fixed inset-x-4 top-4 z-50 mx-auto flex max-w-3xl items-start gap-3 rounded-xl border p-4 shadow-xl ${notificationStyles[type]}`}
      role={type === "success" ? "status" : "alert"}
      aria-live={type === "success" ? "polite" : "assertive"}
      aria-atomic="true"
    >
      <span
        aria-hidden="true"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-current/10 text-lg font-black"
      >
        {notificationIcons[type]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-bold">{title}</p>
        <p className="mt-0.5 text-sm opacity-90">{message}</p>
      </div>
      <button
        type="button"
        className="grid h-8 w-8 shrink-0 place-items-center rounded-lg font-bold opacity-70 hover:bg-black/5 hover:opacity-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-current"
        aria-label="Dismiss notification"
        onClick={dismiss}
      >
        ×
      </button>
    </div>
  );
}
