import ReactMarkdown from "react-markdown";
import { linkifyWikilinks } from "@/lib/wikilinks";

/**
 * Renders a generated article body (Markdown with [[wikilinks]]) as the parchment
 * reading view. `[[links]]` are rewritten to real links into the same world before
 * Markdown rendering; the prose styling lives in globals.css (`.article`).
 */
export function Article({ worldId, body }: { worldId: string; body: string }) {
  const markdown = linkifyWikilinks(body, worldId);
  return (
    <div className="article">
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a href={href} className="wikilink">
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
