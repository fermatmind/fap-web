import type {
  DyadicGraphRaw,
  MbtiCompareAxisRaw,
  MbtiCompareInviteResponse,
  MbtiCompareSummaryRaw,
  RelationshipSyncRaw,
  RelationshipSyncSectionRaw,
} from "@/lib/api/v0_3";
import {
  normalizeMbtiPublicProjectionCard,
  type MbtiPublicProjectionCardViewModel,
} from "@/lib/mbti/publicProjection";

export type MbtiCompareAxisViewModel = {
  key: string;
  label: string;
  summary: string;
  state: string;
  inviterSide: string;
  inviteeSide: string;
};

export type MbtiCompareSummaryViewModel = {
  title: string;
  summary: string;
  sharedCount: number | null;
  divergingCount: number | null;
  axes: MbtiCompareAxisViewModel[];
};

export type MbtiCompareInviteViewModel = {
  inviteId: string;
  shareId: string;
  status: string;
  primaryCtaLabel: string;
  primaryCtaPath: string;
  inviterCard: MbtiPublicProjectionCardViewModel | null;
  inviteeCard: MbtiPublicProjectionCardViewModel | null;
  compareSummary: MbtiCompareSummaryViewModel | null;
  relationshipSync: RelationshipSyncViewModel | null;
  dyadicGraph: DyadicGraphViewModel | null;
};

export type RelationshipSyncSectionViewModel = {
  key: string;
  title: string;
  summary: string;
  bullets: string[];
};

export type RelationshipSyncActionPromptViewModel = {
  key: string;
  title: string;
  summary: string;
  ctaLabel: string;
  ctaPath: string;
};

export type RelationshipSyncViewModel = {
  contractVersion: string;
  fingerprintVersion: string;
  fingerprint: string;
  scope: string;
  subjectJoinMode: string;
  sharedCount: number | null;
  divergingCount: number | null;
  overviewTitle: string;
  overviewSummary: string;
  frictionKeys: string[];
  complementKeys: string[];
  communicationBridgeKeys: string[];
  decisionTensionKeys: string[];
  stressInterplayKeys: string[];
  actionPromptKeys: string[];
  sections: RelationshipSyncSectionViewModel[];
  actionPrompt: RelationshipSyncActionPromptViewModel | null;
};

export type DyadicGraphNodeViewModel = {
  id: string;
  kind: string;
  title: string;
  summary: string;
};

export type DyadicGraphEdgeViewModel = {
  from: string;
  to: string;
  relation: string;
};

export type DyadicGraphViewModel = {
  contractVersion: string;
  fingerprint: string;
  scope: string;
  rootNode: string;
  supportingScales: string[];
  nodes: DyadicGraphNodeViewModel[];
  edges: DyadicGraphEdgeViewModel[];
};

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== "string" && typeof value !== "number") {
      continue;
    }

    const normalized = String(value).trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeCount(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return null;
  }

  return Math.max(0, Math.round(value));
}

function normalizeAxis(axis: MbtiCompareAxisRaw, index: number): MbtiCompareAxisViewModel | null {
  const key = normalizeText(axis.code, index + 1);
  const label = normalizeText(axis.label, axis.code);
  if (!label) {
    return null;
  }

  return {
    key,
    label,
    summary: normalizeText(axis.summary),
    state: normalizeText(axis.state),
    inviterSide: normalizeText(axis.inviter_side),
    inviteeSide: normalizeText(axis.invitee_side),
  };
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeText(item))
    .filter((item): item is string => Boolean(item));
}

function normalizeRelationshipSyncSection(
  rawSection: RelationshipSyncSectionRaw,
  index: number
): RelationshipSyncSectionViewModel | null {
  const key = normalizeText(rawSection.key, index + 1);
  const title = normalizeText(rawSection.title);
  const summary = normalizeText(rawSection.summary);
  if (!key || !title) {
    return null;
  }

  return {
    key,
    title,
    summary,
    bullets: normalizeStringArray(rawSection.bullets),
  };
}

export function normalizeRelationshipSync(
  rawRelationshipSync?: RelationshipSyncRaw | null
): RelationshipSyncViewModel | null {
  if (!rawRelationshipSync || typeof rawRelationshipSync !== "object") {
    return null;
  }

  const actionPrompt =
    rawRelationshipSync.action_prompt && typeof rawRelationshipSync.action_prompt === "object"
      ? {
          key: normalizeText(rawRelationshipSync.action_prompt.key),
          title: normalizeText(rawRelationshipSync.action_prompt.title),
          summary: normalizeText(rawRelationshipSync.action_prompt.summary),
          ctaLabel: normalizeText(rawRelationshipSync.action_prompt.cta_label),
          ctaPath: normalizeText(rawRelationshipSync.action_prompt.cta_path),
        }
      : null;

  return {
    contractVersion: normalizeText(rawRelationshipSync.relationship_contract_version, rawRelationshipSync.version),
    fingerprintVersion: normalizeText(rawRelationshipSync.relationship_fingerprint_version),
    fingerprint: normalizeText(rawRelationshipSync.relationship_fingerprint),
    scope: normalizeText(rawRelationshipSync.dyadic_scope),
    subjectJoinMode: normalizeText(rawRelationshipSync.subject_join_mode),
    sharedCount: normalizeCount(rawRelationshipSync.shared_count),
    divergingCount: normalizeCount(rawRelationshipSync.diverging_count),
    overviewTitle: normalizeText(rawRelationshipSync.overview?.title),
    overviewSummary: normalizeText(rawRelationshipSync.overview?.summary),
    frictionKeys: normalizeStringArray(rawRelationshipSync.friction_keys),
    complementKeys: normalizeStringArray(rawRelationshipSync.complement_keys),
    communicationBridgeKeys: normalizeStringArray(rawRelationshipSync.communication_bridge_keys),
    decisionTensionKeys: normalizeStringArray(rawRelationshipSync.decision_tension_keys),
    stressInterplayKeys: normalizeStringArray(rawRelationshipSync.stress_interplay_keys),
    actionPromptKeys: normalizeStringArray(rawRelationshipSync.dyadic_action_prompt_keys),
    sections: Array.isArray(rawRelationshipSync.sections)
      ? rawRelationshipSync.sections
          .map(normalizeRelationshipSyncSection)
          .filter((section): section is RelationshipSyncSectionViewModel => Boolean(section))
      : [],
    actionPrompt:
      actionPrompt && (actionPrompt.key || actionPrompt.title || actionPrompt.summary) ? actionPrompt : null,
  };
}

export function normalizeDyadicGraph(rawDyadicGraph?: DyadicGraphRaw | null): DyadicGraphViewModel | null {
  if (!rawDyadicGraph || typeof rawDyadicGraph !== "object") {
    return null;
  }

  return {
    contractVersion: normalizeText(rawDyadicGraph.graph_contract_version, rawDyadicGraph.version),
    fingerprint: normalizeText(rawDyadicGraph.graph_fingerprint),
    scope: normalizeText(rawDyadicGraph.graph_scope),
    rootNode: normalizeText(rawDyadicGraph.root_node),
    supportingScales: normalizeStringArray(rawDyadicGraph.supporting_scales),
    nodes: Array.isArray(rawDyadicGraph.nodes)
      ? rawDyadicGraph.nodes
          .map((node) => {
            const id = normalizeText(node?.id);
            const title = normalizeText(node?.title);
            if (!id || !title) {
              return null;
            }
            return {
              id,
              kind: normalizeText(node?.kind),
              title,
              summary: normalizeText(node?.summary),
            };
          })
          .filter((node): node is DyadicGraphNodeViewModel => Boolean(node))
      : [],
    edges: Array.isArray(rawDyadicGraph.edges)
      ? rawDyadicGraph.edges
          .map((edge) => {
            const from = normalizeText(edge?.from);
            const to = normalizeText(edge?.to);
            const relation = normalizeText(edge?.relation);
            if (!from || !to || !relation) {
              return null;
            }
            return { from, to, relation };
          })
          .filter((edge): edge is DyadicGraphEdgeViewModel => Boolean(edge))
      : [],
  };
}

export function normalizeMbtiCompareSummary(
  rawCompareSummary?: MbtiCompareSummaryRaw | null
): MbtiCompareSummaryViewModel | null {
  if (!rawCompareSummary || typeof rawCompareSummary !== "object") {
    return null;
  }

  return {
    title: normalizeText(rawCompareSummary.title),
    summary: normalizeText(rawCompareSummary.summary),
    sharedCount: normalizeCount(rawCompareSummary.shared_count),
    divergingCount: normalizeCount(rawCompareSummary.diverging_count),
    axes: Array.isArray(rawCompareSummary.axes)
      ? rawCompareSummary.axes
          .map(normalizeAxis)
          .filter((axis): axis is MbtiCompareAxisViewModel => Boolean(axis))
      : [],
  };
}

export function buildCompareInviteViewModel(
  rawCompareInvite?: MbtiCompareInviteResponse | null
): MbtiCompareInviteViewModel {
  return {
    inviteId: normalizeText(rawCompareInvite?.invite_id),
    shareId: normalizeText(rawCompareInvite?.share_id),
    status: normalizeText(rawCompareInvite?.status).toLowerCase() || "pending",
    primaryCtaLabel: normalizeText(rawCompareInvite?.primary_cta_label),
    primaryCtaPath: normalizeText(rawCompareInvite?.primary_cta_path),
    inviterCard: normalizeMbtiPublicProjectionCard(rawCompareInvite?.inviter?.mbti_public_projection_v1),
    inviteeCard: normalizeMbtiPublicProjectionCard(rawCompareInvite?.invitee?.mbti_public_projection_v1),
    compareSummary: normalizeMbtiCompareSummary(rawCompareInvite?.compare),
    relationshipSync: normalizeRelationshipSync(rawCompareInvite?.relationship_sync_v1),
    dyadicGraph: normalizeDyadicGraph(rawCompareInvite?.dyadic_graph_v1),
  };
}
