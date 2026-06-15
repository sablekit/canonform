import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { getPage, getWorld } from "@/db/repo";
import { slugify, titleFromSlug } from "@/lib/slug";
import { Article } from "@/components/Article";
import { ArticleStream } from "@/components/ArticleStream";

// Always render per request: we check the cache and may stream a new article.
export const dynamic = "force-dynamic";

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ worldId: string; slug: string }>;
}) {
  const { worldId, slug } = await params;
  const db = getDb();

  const world = await getWorld(db, worldId);
  if (!world) notFound();

  const page = await getPage(db, worldId, slug);
  const title = page?.title ?? titleFromSlug(slug);
  const homeSlug = world.title ? slugify(world.title) : slug;

  return (
    <main className="mx-auto max-w-3xl px-6 pb-24">
      <header className="flex items-center justify-between border-b border-rule py-5 text-sm">
        <Link
          href={`/w/${worldId}/${homeSlug}`}
          className="font-display tracking-wide text-ink transition-colors hover:text-link-hover"
        >
          {world.title ?? "An unnamed world"}
        </Link>
        <Link
          href="/"
          className="uppercase tracking-[0.25em] text-ink-soft transition-colors hover:text-ink"
        >
          Canonform
        </Link>
      </header>

      <article className="pt-10">
        <h1 className="font-display text-4xl font-medium tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>
        <div className="mt-6 border-t border-rule pt-7">
          {page ? (
            <Article worldId={worldId} body={page.body} />
          ) : (
            <ArticleStream worldId={worldId} slug={slug} title={title} />
          )}
        </div>
      </article>
    </main>
  );
}
