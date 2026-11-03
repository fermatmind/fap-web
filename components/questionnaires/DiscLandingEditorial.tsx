import { Fragment } from "react";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

/** Landing-page explanations; the frozen source reports and score identities stay intact. */
export function discLandingSummary(profile: QuestionnaireProfile, locale: Locale): string {
  const summaries: Record<string, { zh: string; en: string }> = {
    "single-d": {
      "zh": "任务停滞时，先明确目标并推动下一步。阅读推进选择较多的具体情境，核对哪些行动有效、哪些需要先补充信息或征求意见。",
      "en": "When a task stalls, clarifying the goal and taking a next step may come first. Review examples of forward action, including when missing information or consultation would change the approach."
    },
    "single-i": {
      "zh": "讨论尚未展开时，先表达想法并邀请他人参与。通过交流情境核对本次选择，区分气氛活跃、信息听懂与真正达成共识。",
      "en": "Starting a conversation and inviting participation may come first. Use discussion examples to distinguish an energetic exchange from shared understanding and an actual agreement."
    },
    "single-s": {
      "zh": "协作节奏变化时，先关注持续配合与他人的承受节奏。结合交接和日常支持的例子，观察稳定安排与及时调整之间的取舍。",
      "en": "When a shared routine changes, continuity and a manageable pace may come first. Explore handoffs and everyday support, including when preserving a routine or adjusting it would help."
    },
    "single-c": {
      "zh": "要求不明确时，先核对依据、细节与完成标准。通过检查情境区分必要验证与可以稍后补充的信息，观察核对如何影响行动时机。",
      "en": "When requirements are unclear, checking evidence, details and completion criteria may come first. Examine which checks are necessary before acting and which information can follow later."
    },
    "tied-d-i": {
      "zh": "推进任务与带动交流获得相同最高次数。以讨论下一步为例，观察你何时先提出行动、何时先邀请参与，以及两种选择怎样相互补充。",
      "en": "Forward action and engaging others share the highest count. In a discussion about next steps, compare proposing an action with inviting participation, and examine how the two can complement each other."
    },
    "tied-d-s": {
      "zh": "行动推进与稳定支持并列最高。围绕任务受阻的情境，比较尽快启动下一步与照顾协作节奏的选择；并列保留两种侧重，不规定固定先后。",
      "en": "Forward action and steady support share the highest count. When work is blocked, compare starting the next step quickly with maintaining a manageable shared pace. The tie assigns no fixed order to these priorities."
    },
    "tied-d-c": {
      "zh": "推进处理与规范核对并列最高。面对信息尚不完整的任务，比较先做小范围尝试与先确认条件的取舍，核对行动速度和检查要求如何共同影响选择。",
      "en": "Forward action and standards checks share the highest count. With incomplete information, compare a small trial with checking conditions first, and consider how timing and verification jointly shape a choice."
    },
    "tied-i-s": {
      "zh": "表达带动与稳定支持并列最高。以新成员加入讨论为例，观察主动邀请表达与耐心倾听的不同作用；热闹参与和舒适节奏可能需要不同安排。",
      "en": "Engaging others and steady support share the highest count. When someone joins a discussion, examine inviting contributions and listening patiently. Active participation and a comfortable pace can call for different arrangements."
    },
    "tied-i-c": {
      "zh": "表达带动与规范核对并列最高。围绕解释复杂方案，比较让内容容易交流与保留准确条件的选择，观察清楚表达和严谨核对怎样配合。",
      "en": "Engaging others and standards checks share the highest count. When explaining a complex plan, compare making it easy to discuss with preserving precise conditions, and explore how explanation and verification work together."
    },
    "tied-s-c": {
      "zh": "稳定支持与规范核对并列最高。以流程调整为例，比较维护顺畅交接与指出规则偏差的选择，寻找既说明依据、又让协作者有准备的表达方式。",
      "en": "Steady support and standards checks share the highest count. During a process change, compare protecting a smooth handoff with flagging deviations, and consider how to explain the evidence while giving others time to prepare."
    },
    "tied-d-i-s": {
      "zh": "推进、交流与支持三项并列最高。通过共同任务的例子，分别回看确定行动、邀请参与和维持节奏的选择；规范核对计数较低，也不表示缺少核对能力。",
      "en": "Action, engagement and support share the highest count. Review setting a next step, inviting participation and sustaining a shared pace in a group task. A lower checking count does not establish a lack of checking ability."
    },
    "tied-d-i-c": {
      "zh": "推进、交流与核对三项并列最高。围绕方案发布，观察尽快行动、让人理解与确认标准三种要求怎样影响选择，识别需要先协商的具体条件。",
      "en": "Action, engagement and checking share the highest count. Before releasing a plan, examine moving promptly, building understanding and confirming standards, then identify which concrete conditions need agreement first."
    },
    "tied-d-s-c": {
      "zh": "推进、支持与核对三项并列最高。以紧急交付为例，分别观察启动行动、保持交接连续和检查完成条件的选择，理解三种侧重之间的实际取舍。",
      "en": "Action, support and checking share the highest count. For an urgent delivery, examine initiating action, preserving handoff continuity and checking completion criteria, including the practical trade-offs among them."
    },
    "tied-i-s-c": {
      "zh": "交流、支持与核对三项并列最高。围绕新规则的讨论，比较解释想法、倾听顾虑与核对依据的选择，观察何时还需要明确一个可执行的下一步。",
      "en": "Engagement, support and checking share the highest count. When discussing a new rule, compare explaining ideas, listening to concerns and checking evidence, then consider when a concrete next step is still needed."
    },
    "tied-d-i-s-c": {
      "zh": "四个方向均为6次，形成四项最高并列。这是24道题中的相同选择次数，不是四种能力同样突出；可按不同任务回看每一次选择的情境。",
      "en": "All four directions have six choices, producing a four-way tie. Equal counts across these 24 items do not establish equally strong abilities. Review the context of individual choices across different tasks."
    }
  };
  return summaries[profile.id]?.[locale] ?? profile.summary[locale];
}

/** Explicit numeric references connect claims to the bibliography without injected HTML. */
export function DiscCitations({ text, locale, referencePath = "", referencePrefix = "disc" }: { text: string; locale: Locale; referencePath?: string; referencePrefix?: string }) {
  return text.split(/(\[\d{1,2}\])/g).map((part, index) => (
    <Fragment key={index}>
      {/^\[\d{1,2}\]$/.test(part)
        ? <a className="disc-source-citation" href={`${referencePath}#${referencePrefix}-reference-${part.slice(1, -1)}`} aria-label={locale === "zh" ? `参考文献${part.slice(1, -1)}` : `Reference ${part.slice(1, -1)}`}>{part}</a>
        : part}
    </Fragment>
  ));
}
