"use client";

import { useState } from "react";

const EXAMPLES = [
  "A drowned city where memories are traded as currency.",
  "A desert empire that worships its own shadow.",
  "A monastery on the back of a sleeping god.",
];

export function SeedForm() {
  const [seed, setSeed] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        // The seed action — create the world + starter pack, then redirect — is wired
        // in the next step (it needs a database).
      }}
    >
      <div className="flex items-stretch rounded-sm border border-ink/25 bg-[#f8f1e0] shadow-[0_14px_30px_-26px_rgba(60,40,20,0.6)] transition-colors focus-within:border-ink/50">
        <input
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          placeholder="A drowned city where memories are traded as currency…"
          aria-label="Seed sentence"
          className="w-full bg-transparent px-5 py-4 text-lg text-ink placeholder:text-ink-soft/70 focus:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 bg-ink px-6 font-display text-base tracking-wide text-paper transition-colors hover:bg-link-hover"
        >
          Inscribe
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
        <span className="italic">or begin with</span>
        {EXAMPLES.map((example) => (
          <button
            key={example}
            type="button"
            onClick={() => setSeed(example)}
            className="rounded-full border border-rule px-3 py-1 transition-colors hover:border-ink/40 hover:text-ink"
          >
            {example.replace(/\.$/, "")}
          </button>
        ))}
      </div>
    </form>
  );
}
