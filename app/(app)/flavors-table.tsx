"use client";

import { useState } from "react";
import Link from "next/link";
import FlavorForm from "./flavor-form";
import ConfirmDeleteButton from "@/app/components/confirm-delete-button";
import Pagination from "@/app/components/pagination";
import { deleteFlavor, duplicateFlavor } from "./actions";

interface Flavor {
  id: number;
  slug: string;
  description: string | null;
  created_datetime_utc: string;
  step_count: number;
}

export default function FlavorsTable({
  flavors,
  page,
  totalPages,
  q,
}: {
  flavors: Flavor[];
  page: number;
  totalPages: number;
  q?: string;
}) {
  const [editing, setEditing] = useState<Flavor | "new" | null>(null);

  return (
    <>
      {/* Search + Create */}
      <div className="flex items-center gap-3">
        <form action="/" method="get">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search by slug..."
            className="px-3 py-2 bg-[var(--background)] border-2 border-[var(--border)] text-sm font-sans w-72 focus:outline-none focus:shadow-[var(--shadow-sm)]"
          />
        </form>
        <button
          onClick={() => setEditing("new")}
          className="px-4 py-2 bg-[var(--primary)] text-[var(--secondary)] border-2 border-[var(--border)] text-sm font-bold uppercase tracking-wide shadow-[var(--shadow-xs)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all cursor-pointer"
        >
          + New Flavor
        </button>
      </div>

      {/* Table */}
      <div className="border-3 border-[var(--border)] shadow-[var(--shadow-md)] overflow-hidden">
        <table className="w-full text-sm font-sans">
          <thead>
            <tr className="border-b-3 border-[var(--border)] bg-[var(--foreground)]/5">
              <th className="text-left p-3 text-xs font-bold uppercase tracking-wide">ID</th>
              <th className="text-left p-3 text-xs font-bold uppercase tracking-wide">Slug</th>
              <th className="text-left p-3 text-xs font-bold uppercase tracking-wide">Description</th>
              <th className="text-left p-3 text-xs font-bold uppercase tracking-wide">Steps</th>
              <th className="text-left p-3 text-xs font-bold uppercase tracking-wide">Created</th>
              <th className="text-left p-3 text-xs font-bold uppercase tracking-wide">Actions</th>
            </tr>
          </thead>
          <tbody>
            {flavors.map((f) => (
              <tr key={f.id} className="border-b-2 border-[var(--border)] hover:bg-[var(--primary)]/10 transition-colors">
                <td className="p-3 text-[var(--foreground)]/60">{f.id}</td>
                <td className="p-3 font-bold">
                  <Link href={`/flavors/${f.id}`} className="text-[var(--accent-blue)] hover:underline">
                    {f.slug}
                  </Link>
                </td>
                <td className="p-3 text-[var(--foreground)]/60 max-w-xs truncate">{f.description ?? "—"}</td>
                <td className="p-3">
                  <span className="inline-block px-2 py-0.5 bg-[var(--foreground)]/10 border border-[var(--border)] text-xs font-bold">
                    {f.step_count}
                  </span>
                </td>
                <td className="p-3 text-[var(--foreground)]/60">
                  {new Date(f.created_datetime_utc).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={() => setEditing(f)}
                      className="text-xs font-bold uppercase text-[var(--accent-blue)] hover:underline cursor-pointer"
                    >
                      Edit
                    </button>
                    <form action={duplicateFlavor}>
                      <input type="hidden" name="id" value={f.id} />
                      <button type="submit" className="text-xs font-bold uppercase text-[var(--accent-green)] hover:underline cursor-pointer">
                        Dupe
                      </button>
                    </form>
                    <ConfirmDeleteButton id={f.id} onDelete={deleteFlavor} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination basePath="/" page={page} totalPages={totalPages} extraParams={q ? { q } : undefined} />

      {editing !== null && (
        <FlavorForm
          flavor={editing === "new" ? undefined : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </>
  );
}
