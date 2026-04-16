import type { ConfidenceBoundaryTone } from "@/components/career/v1/ConfidenceBoundary";

export type CareerV1StateCopy = {
  label: string;
  description: string;
  tone: ConfidenceBoundaryTone;
};

const STATE_COPY: Record<string, CareerV1StateCopy> = {
  mature_public_launch: {
    label: "资料完整，可直接参考",
    description: "这页的信息已达到公开参考标准，适合进入下一步判断。",
    tone: "complete",
  },
  public_but_conservative: {
    label: "资料仍在补充",
    description: "这页可以作为探索参考，但部分强判断暂不展示。",
    tone: "limited",
  },
  not_yet_mature: {
    label: "暂不完整，建议先看相关职业",
    description: "当前职业还不适合直接判断，建议从相关职业或职业家族继续探索。",
    tone: "review",
  },
  family_handoff: {
    label: "先从职业家族探索",
    description: "当前更适合从职业家族进入，再选择具体职业。",
    tone: "review",
  },
  explorer_only: {
    label: "适合先探索，不建议直接判断",
    description: "这项内容更适合做方向探索，不适合作为最终职业判断。",
    tone: "review",
  },
  blocked: {
    label: "暂不提供完整页面",
    description: "当前资料不足以支持完整公开展示。",
    tone: "blocked",
  },
  provisional: {
    label: "资料仍在校准",
    description: "当前结论仍在校准，只展示已确认的保守信息。",
    tone: "limited",
  },
  restricted: {
    label: "部分内容暂不展示",
    description: "部分结论暂不展示，因为当前数据还不足以支持强判断。",
    tone: "limited",
  },
  manual_only: {
    label: "需要人工复核",
    description: "这项内容需要人工复核后才适合更强展示。",
    tone: "review",
  },
  review_due: {
    label: "待复核",
    description: "这项内容已进入后续复核队列。",
    tone: "review",
  },
  available: {
    label: "资料完整，可直接参考",
    description: "这页的信息已达到公开参考标准。",
    tone: "complete",
  },
  trust_limited: {
    label: "资料仍在补充",
    description: "这页可以作为探索参考，但部分强判断暂不展示。",
    tone: "limited",
  },
  unavailable: {
    label: "暂不提供完整页面",
    description: "当前资料不足以支持完整公开展示。",
    tone: "blocked",
  },
};

export function getCareerV1StateCopy(status: string | null | undefined): CareerV1StateCopy {
  const normalized = String(status ?? "").trim().toLowerCase();
  return (
    STATE_COPY[normalized] ?? {
      label: "资料仍在补充",
      description: "当前只展示已确认的信息，更多依据可在折叠区查看。",
      tone: "limited",
    }
  );
}

export function getCareerV1RendererCopy(status: "blocked" | "provisional" | "restricted" | null | undefined): CareerV1StateCopy | null {
  if (!status) {
    return null;
  }

  return getCareerV1StateCopy(status);
}

export const careerV1StateCopy = STATE_COPY;
