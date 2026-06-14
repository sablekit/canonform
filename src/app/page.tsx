import { Article } from "@/components/Article";
import { SeedForm } from "@/components/SeedForm";

// A hardcoded sample so the reading view is visible without a database.
const SAMPLE_BODY = `Vellumar is a sunken city-state on the floor of the [[Cerulean Shelf]], and the only place where [[memory|memories]] may be lawfully bought and sold. Since the night of the [[Long Tide]], its people have breathed through [[lacework gills]] and kept their dearest recollections sealed in [[Glass Vials]] against the wet.

## The Memory Trade

A Vellumari is born owning nothing but what they can remember. Those memories may be drawn off by a licensed [[Vialwright]], decanted into glass, and spent in the [[Tide Market]] — a coin that spends itself only once.

## The Tide Council

Nine officials keep the city's ledgers and its locks against the sea. Their authority descends, by tradition, from the first [[Drowned Cartographer]].

---

*Cross-reference: [[The First Reckoning]] · [[Pearl of Silt]]*`;

export default function Home() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col px-6 pb-24">
      <section className="pt-24 sm:pt-32">
        <p
          className="rise font-display text-sm uppercase tracking-[0.35em] text-ink-soft"
          style={{ animationDelay: "0ms" }}
        >
          Canonform
        </p>
        <h1
          className="rise mt-5 font-display text-5xl font-medium leading-[1.05] tracking-tight text-ink sm:text-6xl"
          style={{ animationDelay: "80ms" }}
        >
          Seed a world
          <br />
          in a single sentence.
        </h1>
        <p
          className="rise mt-6 max-w-xl text-xl leading-relaxed text-ink-soft"
          style={{ animationDelay: "160ms" }}
        >
          One line becomes a living encyclopedia that writes itself as you explore
          it — and stays true to itself.{" "}
          <span className="text-ink">Your world, not one shared hallucination.</span>
        </p>
        <div className="rise mt-10" style={{ animationDelay: "240ms" }}>
          <SeedForm />
        </div>
      </section>

      <section className="mt-24">
        <p className="font-display text-sm uppercase tracking-[0.3em] text-ink-soft">
          What a page becomes
        </p>
        <div className="mt-5 rounded-sm border border-paper-edge bg-[#f8f1e0] px-8 py-10 shadow-[0_20px_45px_-30px_rgba(60,40,20,0.55)] sm:px-12 sm:py-12">
          <h1 className="font-display text-4xl font-medium tracking-tight text-ink">
            Vellumar
          </h1>
          <p className="mt-1 font-display text-sm italic text-ink-soft">
            From a world seeded with “a drowned city where memories are traded as
            currency.”
          </p>
          <div className="mt-6 border-t border-rule pt-7">
            <Article worldId="sample" body={SAMPLE_BODY} />
          </div>
        </div>
      </section>

      <footer className="mt-20 text-sm text-ink-soft">
        <a
          className="border-b border-rule pb-0.5 transition-colors hover:text-ink"
          href="https://github.com/sablekit/canonform"
        >
          Open source on GitHub
        </a>
        <span className="px-2">·</span>
        Built in public by{" "}
        <a
          className="border-b border-rule pb-0.5 transition-colors hover:text-ink"
          href="https://x.com/sablekithq"
        >
          @sablekithq
        </a>
      </footer>
    </main>
  );
}
