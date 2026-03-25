"use client";

export default function Modal({
  children,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-[var(--background)] border-3 border-[var(--border)] shadow-[var(--shadow-md)] p-6 w-full max-w-lg">
        {children}
      </div>
    </div>
  );
}
