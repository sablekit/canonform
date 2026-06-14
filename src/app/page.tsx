export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="flex max-w-xl flex-col items-center gap-6">
        <span className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium uppercase tracking-wider text-zinc-500 dark:border-white/15 dark:text-zinc-400">
          Early development
        </span>
        <h1 className="text-5xl font-semibold tracking-tight">Canonform</h1>
        <p className="text-lg leading-8 text-zinc-600 dark:text-zinc-400">
          Seed a fictional world in one sentence — get your own self-writing,
          internally-consistent wiki for it.{" "}
          <span className="text-zinc-900 dark:text-zinc-100">
            Your world, not one shared hallucination.
          </span>
        </p>
        <a
          className="text-sm font-medium text-zinc-500 underline-offset-4 hover:underline dark:text-zinc-400"
          href="https://github.com/sablekit/canonform"
        >
          Follow the build on GitHub →
        </a>
      </div>
    </main>
  );
}
