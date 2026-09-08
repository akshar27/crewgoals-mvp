"use client";

import { Check, Share2 } from "lucide-react";
import { useState } from "react";

type Props = {
  url: string;
  title: string;
  text?: string;
  label?: string;
  className?: string;
};

/** Native share sheet where supported, clipboard copy everywhere else. */
export function ShareButton({ url, title, text, label = "Share", className }: Props) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    const shareData = { title, text: text ?? title, url };
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // user dismissed, or share unavailable — fall through to copy
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy this link", url);
    }
  }

  return (
    <button
      type="button"
      onClick={onShare}
      className={
        className ??
        "inline-flex items-center gap-2 rounded-md border border-stone-300 bg-white px-3 py-2 text-sm font-semibold text-ink transition hover:bg-mint"
      }
    >
      {copied ? <Check size={16} /> : <Share2 size={16} />}
      {copied ? "Link copied" : label}
    </button>
  );
}
