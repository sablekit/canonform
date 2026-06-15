"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { seedAction } from "@/app/actions";

const EXAMPLES = [
  "A drowned city where memories are traded as currency.",
  "A desert empire that worships its own shadow.",
  "A monastery on the back of a sleeping god.",
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="shrink-0 bg-ink px-6 font-display text-base tracking-wide text-paper transition-colors hover:bg-link-hover disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Inscribing…" : "Inscribe"}
    </button>
  );
}

function PendingHint() {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <p className="mt-3 text-sm italic text-ink-soft">
      Summoning a world from your sentence — naming it, writing its first pages…
    </p>
  );
}

export function SeedForm() {
  const [seed, setSeed] = useState("");

  return (
    <form action={seedAction}>
      <div className="flex items-stretch rounded-sm border border-ink/25 bg-[#f8f1e0] shadow-[0_14px_30px_-26px_rgba(60,40,20,0.6)] transition-colors focus-within:border-ink/50">
        <input
          name="seed"
          value={seed}
          onChange={(e) => setSeed(e.target.value)}
          placeholder="A drowned city where memories are traded as currency…"
          aria-label="Seed sentence"
          className="w-full bg-transparent px-5 py-4 text-lg text-ink placeholder:text-ink-soft/70 focus:outline-none"
        />
        <SubmitButton />
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

      <PendingHint />
    </form>
  );
}
