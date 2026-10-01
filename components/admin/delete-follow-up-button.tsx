"use client";

import { useActionState } from "react";

type DeleteState = Readonly<{
  ok: boolean;
  message: string;
}>;

type DeleteFollowUpButtonProps = Readonly<{
  followUpId: string;
  action: (state: DeleteState, formData: FormData) => Promise<DeleteState>;
}>;

const initialState: DeleteState = { ok: false, message: "" };

export function DeleteFollowUpButton({ followUpId, action }: DeleteFollowUpButtonProps) {
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form
      action={formAction}
      className="inline-grid justify-items-end gap-1"
      onSubmit={(event) => {
        const confirmed = window.confirm(
          "Delete this completed follow-up?\n\nThis will permanently remove this follow-up record. The lead/customer will not be deleted.",
        );
        if (!confirmed) event.preventDefault();
      }}
    >
      <input type="hidden" name="followUpId" value={followUpId} />
      <button
        type="submit"
        className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-800 transition-colors hover:border-red-400 hover:bg-red-100 disabled:cursor-wait disabled:opacity-60"
        aria-label="Delete completed follow-up"
        disabled={pending}
      >
        {pending ? "Deleting…" : "Delete"}
      </button>
      {state.message ? (
        <span className="max-w-64 text-right text-xs font-semibold text-red-700" role="alert">
          {state.message}
        </span>
      ) : null}
    </form>
  );
}
