"use client";

import { useState } from "react";
import Modal from "@/app/components/modal";
import { createFlavor, updateFlavor } from "./actions";

interface FlavorFormProps {
  flavor?: { id: number; slug: string; description: string | null };
  onClose: () => void;
}

export default function FlavorForm({ flavor, onClose }: FlavorFormProps) {
  const [pending, setPending] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setPending(true);
    if (flavor) {
      formData.set("id", String(flavor.id));
      await updateFlavor(formData);
    } else {
      await createFlavor(formData);
    }
    setPending(false);
    onClose();
  };

  return (
    <Modal onClose={onClose}>
      <form action={handleSubmit} className="space-y-4">
        <h2 className="font-head text-xl uppercase tracking-tight">
          {flavor ? "Edit Flavor" : "New Flavor"}
        </h2>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1">Slug</label>
          <input
            name="slug"
            defaultValue={flavor?.slug}
            required
            placeholder="e.g. dark-humor-v2"
            className="w-full px-3 py-2 bg-[var(--background)] border-2 border-[var(--border)] text-sm font-sans focus:outline-none focus:shadow-[var(--shadow-sm)]"
          />
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-wide mb-1">Description</label>
          <textarea
            name="description"
            defaultValue={flavor?.description ?? ""}
            rows={3}
            placeholder="Optional description..."
            className="w-full px-3 py-2 bg-[var(--background)] border-2 border-[var(--border)] text-sm font-sans resize-y focus:outline-none focus:shadow-[var(--shadow-sm)]"
          />
        </div>
        <div className="flex gap-2 justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-bold uppercase tracking-wide text-[var(--foreground)]/60 hover:text-[var(--foreground)] cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 bg-[var(--primary)] text-[var(--secondary)] border-2 border-[var(--border)] text-sm font-bold uppercase tracking-wide shadow-[var(--shadow-sm)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer disabled:opacity-50"
          >
            {pending ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
