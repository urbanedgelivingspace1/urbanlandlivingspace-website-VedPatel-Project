"use client";

import { useTransition } from "react";

type DeleteDraftButtonProps = Readonly<{
  propertyId: string;
  expectedUpdatedAt?: string;
  propertyTitle?: string;
  isPublished?: boolean;
  action: (formData: FormData) => Promise<void>;
  variant?: "danger-button" | "danger-outline" | "danger-link";
  className?: string;
  buttonText?: string;
}>;

export function DeleteDraftButton({
  propertyId,
  expectedUpdatedAt,
  propertyTitle,
  isPublished = false,
  action,
  variant = "danger-outline",
  className = "",
  buttonText,
}: DeleteDraftButtonProps) {
  const [isPending, startTransition] = useTransition();

  const label = buttonText ?? (isPublished ? "Delete property" : "Delete draft");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const title = propertyTitle ? `"${propertyTitle}"` : isPublished ? "this property" : "this property draft";
    const promptMessage = isPublished
      ? `Are you sure you want to permanently delete ${title}? This property is currently PUBLISHED. Deleting it will unpublish it from the website and remove it from the admin portal. This action cannot be undone.`
      : `Are you sure you want to permanently delete ${title}? This action cannot be undone.`;

    const confirmed = window.confirm(promptMessage);
    if (!confirmed) return;

    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      try {
        await action(formData);
      } catch (err) {
        // If redirect happens in server action, Next.js throws NEXT_REDIRECT which is handled by router.
        // For other unexpected client-side errors, display alert.
        if (err instanceof Error && !err.message.includes("NEXT_REDIRECT")) {
          alert(`Could not delete property: ${err.message}`);
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
      <input type="hidden" name="propertyId" value={propertyId} />
      {expectedUpdatedAt ? (
        <input type="hidden" name="expectedUpdatedAt" value={expectedUpdatedAt} />
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        data-testid={isPublished ? "btn-delete-published" : "btn-delete-draft"}
        aria-label={label}
        className={`${getVariantStyles()} ${className}`}
      >
        {isPending ? "Deleting…" : label}
      </button>
    </form>
  );
}

export const DeletePropertyButton = DeleteDraftButton;

