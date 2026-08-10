import type { PublicTopicEdgeProjection, PublicTopicEdgeSource } from "@/lib/cms/publicTopicEdges";
import { loadPublicTopicEdges } from "@/lib/cms/publicTopicEdges";
import {
  buildPublicTopicEdgeClickPayload,
  type PublicTopicEdgeEntrySurface,
} from "@/lib/tracking/publicTopicEdge";
import { PublicTopicEdgeLink } from "@/components/public-topic-graph/PublicTopicEdgeLink";

export function PublicTopicEdgeRenderer({
  projection,
  entrySurface,
}: {
  projection: PublicTopicEdgeProjection | null;
  entrySurface: PublicTopicEdgeEntrySurface;
}) {
  if (!projection || projection.items.length === 0) return null;

  return (
    <nav
      aria-label="Public topic edges"
      data-testid="public-topic-edge-renderer"
      data-authority-version={projection.authorityVersion}
      className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]"
    >
      <ul className="m-0 grid list-none gap-3 p-0">
        {projection.items.map((item, index) => (
          <li
            key={item.identity}
            data-edge-position={item.position}
            data-edge-relation={item.relationType}
            className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4"
          >
            <PublicTopicEdgeLink
              href={item.targetCanonical}
              payload={buildPublicTopicEdgeClickPayload(item, index, entrySurface)}
            >
              {item.visibleLabel}
            </PublicTopicEdgeLink>
            {item.context ? (
              <p className="mb-0 mt-2 text-sm leading-6 text-[var(--fm-text-muted)]">{item.context}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}

export async function PublicTopicEdgeModule({
  source,
  entrySurface,
}: {
  source: PublicTopicEdgeSource | null;
  entrySurface: PublicTopicEdgeEntrySurface;
}) {
  if (!source) return null;
  const projection = await loadPublicTopicEdges(source);
  return <PublicTopicEdgeRenderer projection={projection} entrySurface={entrySurface} />;
}
