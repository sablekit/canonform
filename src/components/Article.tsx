import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { linkifyWikilinks } from "@/lib/wikilinks";

/**
 * Renders a generated article body (Markdown with [[wikilinks]]) as the parchment
 * reading view. `[[links]]` are rewritten to real links into the same world before
 * Markdown rendering; the prose styling lives in globals.css (`.article`).
 *
 * Internal links use next/link so clicking a blue link navigates client-side
 * straight into the destination article (streaming it if it isn't cached yet).
 */
export function Article({ worldId, body }: { worldId: string; body: string }) {
  // The page chrome already shows the title, so drop a leading "# Title" heading
  // the model often emits as the article's first line.
  const withoutTitle = body.replace(/^\s*#\s+[^\n]*\r?\n+/, "");
  const markdown = linkifyWikilinks(withoutTitle, worldId);
  return (
    <div className="article">
      <ReactMarkdown
        components={{
          a: ({ href, children }) =>
            href && href.startsWith("/") ? (
              <Link href={href} prefetch={false} className="wikilink">
                {children}
              </Link>
            ) : (
              <a
                href={href}
                className="wikilink"
                target="_blank"
                rel="noreferrer"
              >
                {children}
              </a>
            ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
