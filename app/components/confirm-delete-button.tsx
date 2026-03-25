"use client";

import { useState } from "react";

export default function ConfirmDeleteButton({
  id,
  onDelete,
}: {
  id: number;
  onDelete: (formData: FormData) => Promise<void>;
}) {
  const [confirming, setConfirming] = useState(false);

  if (!confirming) {
    return (
      <button
        onClick={() => setConfirming(true)}
        className="text-xs font-bold uppercase text-[var(--accent-red)] hover:underline cursor-pointer"
      >
        Delete
      </button>
    );
  }

  return (
    <form
      action={async (formData) => {
        await onDelete(formData);
        setConfirming(false);
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        className="text-xs font-bold uppercase text-white bg-[var(--accent-red)] px-2 py-1 border-2 border-[var(--border)] cursor-pointer"
      >
        Confirm
      </button>
      <button
        type="button"
        onClick={() => setConfirming(false)}
        className="text-xs font-bold uppercase text-[var(--foreground)]/60 ml-1 cursor-pointer"
      >
        Cancel
      </button>
    </form>
  );
}
