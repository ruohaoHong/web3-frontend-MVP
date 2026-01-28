import type { ReactNode } from "react";

export function Card({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4">
      {title && (
        <div className="mb-3 text-sm font-medium text-black/70">
          {title}
        </div>
      )}
      {children}
    </div>
  );
}
