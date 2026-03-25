import Link from "next/link";

export default function Pagination({
  basePath,
  page,
  totalPages,
  q,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  q?: string;
}) {
  if (totalPages <= 1) return null;

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="flex gap-2">
      {page > 1 && (
        <Link
          href={buildHref(page - 1)}
          className="px-4 py-2 border-2 border-[var(--border)] text-sm font-bold uppercase shadow-[var(--shadow-xs)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
        >
          Prev
        </Link>
      )}
      <span className="px-4 py-2 text-sm font-bold text-[var(--foreground)]/60">
        {page} / {totalPages}
      </span>
      {page < totalPages && (
        <Link
          href={buildHref(page + 1)}
          className="px-4 py-2 border-2 border-[var(--border)] text-sm font-bold uppercase shadow-[var(--shadow-xs)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all"
        >
          Next
        </Link>
      )}
    </div>
  );
}
