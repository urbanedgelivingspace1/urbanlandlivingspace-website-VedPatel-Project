"use client";

import { useTransition } from "react";

type DeleteLeadButtonProps = Readonly<{
  leadId: string;
  leadName?: string;
  action: (formData: FormData) => Promise<void>;
  variant?: "danger-button" | "danger-outline" | "danger-link";
  className?: string;
  buttonText?: string;
}>;

export function DeleteLeadButton({
  leadId,
  leadName,
  action,
  variant = "danger-outline",
  className = "",
  buttonText = "Delete lead",
}: DeleteLeadButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = leadName ? `"${leadName}"` : "this lead";
    const confirmed = window.confirm(
      `Are you sure you want to delete ${title}? This will remove the lead from your CRM pipeline and active follow-ups.`,
    );
    if (!confirmed) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      try {
        await action(formData);
      } catch (err) {
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
          alert(`Could not delete lead: ${err.message}`);
        }
      }
    });
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger-button":
        return "rounded-lg bg-red-600 px-4 py-2 text-xs font-bold text-white hover:bg-red-700 shadow-xs transition-colors disabled:opacity-60";
      case "danger-link":
        return "text-xs font-bold text-red-600 hover:text-red-800 underline transition-colors disabled:opacity-60";
      case "danger-outline":
      default:
        return "rounded-lg border border-red-300 bg-red-50/70 px-3.5 py-1.5 text-xs font-bold text-red-800 hover:bg-red-100 hover:border-red-400 transition-colors disabled:opacity-60";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="inline-block">
      <input type="hidden" name="leadId" value={leadId} />
      <button
        type="submit"
        disabled={isPending}
        data-testid="btn-delete-lead"
        aria-label="Delete lead"
        className={`${getVariantStyles()} ${className}`}
      >
        {isPending ? "Deleting…" : buttonText}
      </button>
    </form>
  );
}
