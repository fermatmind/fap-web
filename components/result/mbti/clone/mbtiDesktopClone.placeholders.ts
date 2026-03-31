import type { CloneListItem } from "@/components/result/mbti/clone/MbtiCloneTwoColumnList";

export const MBTI_DESKTOP_CLONE_PLACEHOLDERS = {
  heroIllustrationLabel: "illustration-slot placeholder",
  traitsIllustrationLabel: "traits illustration-slot placeholder",
  chapterIllustrationLabels: {
    career: "career illustration-slot placeholder",
    growth: "growth illustration-slot placeholder",
    relationships: "relationships illustration-slot placeholder",
  },
  introParagraphs: [
    "Placeholder copy: this first desktop intro paragraph reserves the real MBTI overview slot until the chapter-level summary payload is fully mapped into the new shell.",
    "Placeholder copy: this second desktop intro paragraph preserves the two-paragraph rhythm from the reference layout without pretending to be a finished interpretation.",
  ],
  traitsParagraphs: [
    "Placeholder copy: this paragraph keeps the post-traits narrative slot open for the final personality overview copy and related highlights once the data mapping is complete.",
    "Placeholder copy: this paragraph keeps the second traits narrative slot visible so the desktop shell can ship before the long-form explanation and supporting assets are ready.",
  ],
  narrativeParagraphs: {
    career: [
      "Placeholder copy: this chapter intro slot will hold the real career summary once the corresponding public projection or report section is wired into the clone layer.",
      "Placeholder copy: this follow-up career paragraph intentionally marks an unfinished content slot rather than simulating a completed recommendation.",
    ],
    growth: [
      "Placeholder copy: this growth intro slot is reserved for the real self-development summary and stays explicit until the structured content arrives.",
      "Placeholder copy: this second growth paragraph preserves the desktop reading rhythm while keeping the missing content visibly marked as placeholder.",
    ],
    relationships: [
      "Placeholder copy: this relationship intro slot is reserved for the real communication and boundary summary when the mapped content is ready.",
      "Placeholder copy: this second relationship paragraph keeps the 16P-style section cadence intact without disguising missing content as a real reading.",
    ],
  },
  influentialTraitLabels: {
    career: [
      "Placeholder trait slot",
      "Placeholder trait slot",
      "Placeholder trait slot",
      "Placeholder trait slot",
    ],
    growth: [
      "Placeholder trait slot",
      "Placeholder trait slot",
      "Placeholder trait slot",
      "Placeholder trait slot",
    ],
    relationships: [
      "Placeholder trait slot",
      "Placeholder trait slot",
      "Placeholder trait slot",
      "Placeholder trait slot",
    ],
  },
  strengths: {
    career: [
      {
        title: "Placeholder strength item",
        body: "Placeholder copy: reserve this slot for a real career strength description tied to the mapped report content.",
      },
      {
        title: "Placeholder strength item",
        body: "Placeholder copy: this item keeps the two-column list structure visible until more chapter bullets are available.",
      },
      {
        title: "Placeholder strength item",
        body: "Placeholder copy: a design-only slot for future mapped strengths, not a fabricated workplace conclusion.",
      },
      {
        title: "Placeholder strength item",
        body: "Placeholder copy: this keeps the section density and spacing consistent with the desktop reference page.",
      },
    ] satisfies CloneListItem[],
    growth: [
      {
        title: "Placeholder strength item",
        body: "Placeholder copy: reserve this slot for a real growth leverage point once the source section is mapped.",
      },
      {
        title: "Placeholder strength item",
        body: "Placeholder copy: this item exists only to hold the required shell structure while content is pending.",
      },
      {
        title: "Placeholder strength item",
        body: "Placeholder copy: keep the visible list rhythm without pretending the advice is finalized.",
      },
      {
        title: "Placeholder strength item",
        body: "Placeholder copy: this is a design placeholder rather than a real self-development recommendation.",
      },
    ] satisfies CloneListItem[],
    relationships: [
      {
        title: "Placeholder strength item",
        body: "Placeholder copy: reserve this slot for a real relationship strength once the report mapping is ready.",
      },
      {
        title: "Placeholder strength item",
        body: "Placeholder copy: this item preserves the structural density of the desktop layout while content is pending.",
      },
      {
        title: "Placeholder strength item",
        body: "Placeholder copy: a design-only placeholder for future mapped communication strengths.",
      },
      {
        title: "Placeholder strength item",
        body: "Placeholder copy: this slot remains explicitly unfinished and does not simulate a real diagnosis.",
      },
    ] satisfies CloneListItem[],
  },
  weaknesses: {
    career: [
      {
        title: "Placeholder weakness item",
        body: "Placeholder copy: reserve this slot for a real work-style risk or blind spot when the source data is connected.",
      },
      {
        title: "Placeholder weakness item",
        body: "Placeholder copy: this keeps the second visible list block intact without inventing a finished conclusion.",
      },
      {
        title: "Placeholder weakness item",
        body: "Placeholder copy: a structure-only slot for future chapter-specific caution notes.",
      },
      {
        title: "Placeholder weakness item",
        body: "Placeholder copy: this design placeholder preserves the required two-column rhythm and spacing.",
      },
    ] satisfies CloneListItem[],
    growth: [
      {
        title: "Placeholder weakness item",
        body: "Placeholder copy: reserve this slot for a real growth blocker or friction pattern once available.",
      },
      {
        title: "Placeholder weakness item",
        body: "Placeholder copy: this item marks an unfinished content slot instead of simulating advice.",
      },
      {
        title: "Placeholder weakness item",
        body: "Placeholder copy: a design placeholder for future mapped watch-outs and recurring triggers.",
      },
      {
        title: "Placeholder weakness item",
        body: "Placeholder copy: this keeps the clone shell structurally complete before content fill-in.",
      },
    ] satisfies CloneListItem[],
    relationships: [
      {
        title: "Placeholder weakness item",
        body: "Placeholder copy: reserve this slot for a real communication risk or relationship blind spot later.",
      },
      {
        title: "Placeholder weakness item",
        body: "Placeholder copy: this item stays explicit about being unfinished content in the desktop shell.",
      },
      {
        title: "Placeholder weakness item",
        body: "Placeholder copy: a structure-only placeholder for future mapped tension patterns.",
      },
      {
        title: "Placeholder weakness item",
        body: "Placeholder copy: this preserves the second visible list grammar without fabricating real content.",
      },
    ] satisfies CloneListItem[],
  },
  lockedBlocks: {
    roles: [
      {
        title: "Placeholder locked item",
        body: "Placeholder copy: this blurred item reserves a hidden detail slot that will later be replaced by real premium content.",
      },
      {
        title: "Placeholder locked item",
        body: "Placeholder copy: this keeps the hidden list density visible while the real gated section remains unavailable.",
      },
      {
        title: "Placeholder locked item",
        body: "Placeholder copy: a design placeholder for future locked insights, not a fabricated recommendation.",
      },
      {
        title: "Placeholder locked item",
        body: "Placeholder copy: this item exists only to maintain the gated list structure of the desktop reference.",
      },
    ] satisfies CloneListItem[],
    nextSteps: [
      {
        title: "Placeholder locked item",
        body: "Placeholder copy: this blurred action slot will be replaced with a real premium next-step item later.",
      },
      {
        title: "Placeholder locked item",
        body: "Placeholder copy: this preserves the hidden action list rhythm without pretending the content is ready.",
      },
      {
        title: "Placeholder locked item",
        body: "Placeholder copy: a structure-only placeholder for future chapter-specific action guidance.",
      },
      {
        title: "Placeholder locked item",
        body: "Placeholder copy: this keeps the overlay and blur grammar visible in the meantime.",
      },
    ] satisfies CloneListItem[],
  },
  finalOfferHeadline: "Placeholder headline: full report offer slot",
  finalOfferCopy:
    "Placeholder copy: this mint offer card reserves the final pricing and benefit summary area until the preferred business copy is finalized.",
  finalOfferPrice: "Placeholder price slot",
} as const;
