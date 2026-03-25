"use client";

import { useState } from "react";
import { updateFlavorDetail } from "./actions";

export default function FlavorHeader({
  flavor,
}: {
  flavor: { id: number; slug: string; description: string | null };
}) {
  const [editing, setEditing] = useState(false);
  const [slug, setSlug] = useState(flavor.slug);
  const [description, setDescription] = useState(flavor.description ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const fd = new FormData();
    fd.set("id", String(flavor.id));
    fd.set("slug", slug);
    fd.set("description", description);
    await updateFlavorDetail(fd);
    setSaving(false);
    setEditing(false);
  };

  if (!editing) {
    return (
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-head text-3xl uppercase tracking-tight">{flavor.slug}</h1>
          <p className="text-[var(--foreground)]/60 text-sm mt-1">
            {flavor.description || "No description"}
          </p>
        </div>
        <button
          onClick={() => setEditing(true)}
          className="px-3 py-1.5 border-2 border-[var(--border)] text-xs font-bold uppercase tracking-wide shadow-[var(--shadow-xs)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
        >
          Edit
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 border-3 border-[var(--border)] p-4 shadow-[var(--shadow-sm)]">
      <input
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        className="w-full px-3 py-2 border-2 border-[var(--border)] text-sm font-sans focus:outline-none focus:shadow-[var(--shadow-sm)]"
      />
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 border-2 border-[var(--border)] text-sm font-sans resize-y focus:outline-none focus:shadow-[var(--shadow-sm)]"
      />
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-[var(--primary)] text-[var(--secondary)] border-2 border-[var(--border)] text-xs font-bold uppercase shadow-[var(--shadow-xs)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
        <button
          onClick={() => {
            setSlug(flavor.slug);
            setDescription(flavor.description ?? "");
            setEditing(false);
          }}
          className="px-4 py-2 text-xs font-bold uppercase text-[var(--foreground)]/60 hover:text-[var(--foreground)] cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
