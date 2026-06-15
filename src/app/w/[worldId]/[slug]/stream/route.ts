import { getDb } from "@/db";
import { generateArticle } from "@/lib/generation/article";
import { titleFromSlug } from "@/lib/slug";

// Long-running stream; never cache.
export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Server-Sent-Events endpoint that generates an article and streams its text deltas.
 * `generateArticle` also freezes the page + records its links on completion, so once
 * a stream finishes, the page is cached and future visits are plain SSR cache hits.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ worldId: string; slug: string }> },
) {
  const { worldId, slug } = await params;
  const title = new URL(req.url).searchParams.get("title") || titleFromSlug(slug);
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string | null, data: unknown) => {
        const prefix = event ? `event: ${event}\n` : "";
        controller.enqueue(
          encoder.encode(`${prefix}data: ${JSON.stringify(data)}\n\n`),
        );
      };
      try {
        for await (const delta of generateArticle(getDb(), {
          worldId,
          slug,
          title,
        })) {
          send(null, delta);
        }
        send("done", {});
      } catch (error) {
        send("error", error instanceof Error ? error.message : String(error));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
