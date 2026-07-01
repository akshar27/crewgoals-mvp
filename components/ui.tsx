import Link from "next/link";
import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return <div className="mx-auto max-w-6xl px-4 py-8 sm:py-12">{children}</div>;
}

export function Panel({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-lg border border-stone-200 bg-white p-5 shadow-soft ${className}`}>{children}</section>;
}

export function ButtonLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center justify-center rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-moss">
      {children}
    </Link>
  );
}

export function SubmitButton({ children }: { children: ReactNode }) {
  return <button className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white hover:bg-moss">{children}</button>;
}

export function Badge({ children }: { children: ReactNode }) {
  return <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-semibold text-moss">{children}</span>;
}
