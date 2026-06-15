"use client";

import { useEffect, useState } from "react";
import { Article } from "./Article";

/**
 * Streams a not-yet-generated article from the SSE endpoint, rendering it as it
 * arrives (the "watch it write itself" moment). The server writes the page to the
 * cache on completion, so a later visit is a plain cache hit.
 */
export function ArticleStream({
  worldId,
  slug,
  title,
}: {
  worldId: string;
  slug: string;
  title: string;
}) {
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<"streaming" | "done" | "error">(
    "streaming",
  );

  useEffect(() => {
    const url = `/w/${worldId}/${encodeURIComponent(slug)}/stream?title=${encodeURIComponent(title)}`;
    const source = new EventSource(url);

    source.onmessage = (event) => setBody((prev) => prev + JSON.parse(event.data));
    source.addEventListener("done", () => {
      setStatus("done");
      source.close();
    });
    source.addEventListener("error", () => {
      setStatus("error");
      source.close();
    });

    return () => source.close();
  }, [worldId, slug, title]);

  return (
    <>
      <Article worldId={worldId} body={body} />
      {status === "streaming" && (
        <span
          aria-hidden
          className="ml-0.5 inline-block h-5 w-[2px] animate-pulse bg-ink align-text-bottom"
        />
      )}
      {status === "error" && body === "" && (
        <p className="text-unwritten">
          The archive could not be reached. Try reloading the page.
        </p>
      )}
    </>
  );
}
