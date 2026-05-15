"use client";

import { useState } from "react";

export function CopyUrlBanner({ url, slug }: { url: string; slug: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mb-6 flex items-center gap-3 rounded-xl bg-brand-500/[0.07] border border-brand-500/20 px-4 py-3">
      <svg
        className="w-5 h-5 text-brand-400 shrink-0"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.556a4.5 4.5 0 00-1.242-7.244l4.5-4.5a4.5 4.5 0 016.364 6.364l-1.757 1.757"
        />
      </svg>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-zinc-500 mb-0.5">URL publica de tu restaurante</p>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-brand-300 hover:text-brand-200 font-mono truncate block"
        >
          {url.replace("https://", "")}
        </a>
      </div>
      <button
        onClick={copy}
        className="shrink-0 text-xs px-3 py-1.5 rounded-lg bg-brand-500/20 hover:bg-brand-500/30 text-brand-300 transition-colors"
      >
        {copied ? "Copiado!" : "Copiar"}
      </button>
    </div>
  );
}
