import type { Questionnaire } from "@/lib/questionnaires/types";
export const relationshipWorryLandingSections: Questionnaire["guide"] = [
  {
    "id": "relationship-worry-purpose",
    "title": {
      "en": "Relationship worry habits: four responses from your own side",
      "zh": "关系担心反应观察：自己一侧的四类反应"
    },
    "paragraphs": [
      {
        "en": "These sixteen original prompts separately record asking for reassurance again, attention to possible comparison or rivals, extra giving with a stated hope for connection and indirect checks for a response. They concern your own reported moments during the past three months. They do not measure the other person’s care, the reliability of a promise or whether a relationship will last.",
        "zh": "十六条原创题分别记录再次求安心、留意可能的比较与竞争、带着明说的联结期待额外付出，以及间接试探回应。它们关注过去三个月自己报告的时刻，不测别人多在意、承诺是否可信或关系能否持续。"
      },
      {
        "en": "Several responses may occur together or at different times. You may ask directly in one situation and keep a question to yourself in another. All four summaries remain separate: no main reaction, attachment identity, overall worry score or relationship verdict is assigned.",
        "zh": "几种反应可以同时或在不同时候出现；你可能在某次情境中直接询问，在另一次将问题留在心里。四项摘要分别保留，不分配主要反应、依恋身份、总体担心分或关系判决。"
      }
    ]
  },
  {
    "id": "relationship-worry-reference",
    "title": {
      "en": "One close adult and the same three-month reference",
      "zh": "怎样作答：同一位亲近成年人、同一个三个月参照"
    },
    "paragraphs": [
      {
        "en": "Keep one adult close person in mind throughout, without entering their name or any message history. Review your own responses over the past three months, rather than evaluating their character or switching between several people to assemble a general picture. Use what you can recall of the stated situation.",
        "zh": "全程以同一位亲近的成年人为参照，不输入姓名或聊天记录。回看过去三个月自己的反应，不评定对方性格，也不在多人之间切换以拼出整体画像。按自己能回忆的题中情境回答即可。"
      },
      {
        "en": "The five numeric options range from never to almost always. The middle response, 3, means sometimes, not neutrality or uncertainty. Choose unscored when the experience did not fit, you cannot assess it or you prefer not to answer. The page does not count opportunities for each response, so its means are not percentages of conversations or exact incident rates.",
        "zh": "五个数字选项从从不到几乎每次，3表示有时，不是中立或不确定。经历不符合、无法判断或不愿回答时可选未评分。页面没有统计每种反应的出现机会，因此均值不是对话百分比或精确事件发生率。"
      }
    ]
  },
  {
    "id": "relationship-worry-reassurance-comparison",
    "title": {
      "en": "Repeated reassurance and comparison: keep the event distinct from its meaning",
      "zh": "再次求安心与比较：区分发生的事及其含义"
    },
    "paragraphs": [
      {
        "en": "The reassurance prompts include returning to a question after an answer, seeking a further sign after a caring reply and asking about a changed plan. They do not treat every request for clarity as the same event. A higher frequency cannot tell whether an earlier answer was clear, whether information changed or whether another request was useful.",
        "zh": "求安心题包含问题已回答后再次返回、得到关心回应后继续寻找信号，以及安排改变时询问关系是否改变。它们不把每次澄清请求视作同一件事；频率较高不能确定先前回答是否清楚、信息是否改变或再次询问是否有用。"
      },
      {
        "en": "Comparison-related prompts concern attending to another person’s attention, replaying a mention or looking for signs that someone matters more. These are reports of your attention, not evidence that a rival exists or that the close person has broken an agreement. Separate the observation you actually had from the conclusion you considered.",
        "zh": "比较题关注留意他人得到的注意、反复回想一次提及，或寻找某人更重要的信号。它们记录自己的注意，不构成竞争者存在或亲近之人违背约定的证据。可以区分实际观察到什么与自己曾考虑什么结论。"
      }
    ]
  },
  {
    "id": "relationship-worry-giving-checking",
    "title": {
      "en": "Extra giving and indirect checks: only when the stated purpose fits",
      "zh": "额外付出与间接试探：只有明说的目的符合时才评价"
    },
    "paragraphs": [
      {
        "en": "Giving-for-connection prompts explicitly include hoping that extra help, availability or putting aside a plan would make the connection feel more secure. Ordinary generosity, a shared responsibility or freely chosen help is not enough to infer that purpose. Rate the whole sentence, including your own recalled intention, rather than judging yourself from the action alone.",
        "zh": "为联结付出题明确包含希望通过额外帮助、保持可联系或放下个人计划，让联结更有安全感。普通慷慨、共同责任或自愿帮忙，不足以推断这种目的。应按完整句子及自己回忆的意图评价，不只凭行动判断自己。"
      },
      {
        "en": "Indirect checks include reducing contact, hinting or seeming less available specifically to see whether the other person responds. A pause for rest or a genuine scheduling limit is not automatically an indirect check. The questionnaire records the intention you report; it does not discover hidden motives, verify the response you received or justify monitoring anyone.",
        "zh": "间接试探包含为了看对方是否回应而减少联系、暗示或表现得较难联系。为了休息而暂停或确有日程限制，不自动属于试探。问卷记录你报告的意图，不发现隐藏动机、不验证实际回应，也不为监控他人提供理由。"
      }
    ]
  },
  {
    "id": "relationship-worry-arithmetic",
    "title": {
      "en": "How four independent frequency means are calculated",
      "zh": "四项独立频率均值怎样计算"
    },
    "paragraphs": [
      {
        "en": "Each theme has four equally weighted statements scored directly from 1 to 5, with no reverse items. At least three numeric responses are needed for its mean. Ratings 1, 4, 5 and one unscored item give a sum of 10, three rated items and 10 divided by 3, displayed as 3.3. Two ratings of 5 still give insufficient information; no missing response is treated as 0 or 3.",
        "zh": "每主题四条等权陈述，直接按1至5计分，没有反向题；至少三条数字才显示均值。1、4、5及一条未评分得到原始和10、已评分三题，10除以3显示3.3。只有两条5分仍显示资料不足；缺失不补成0或3。"
      },
      {
        "en": "Identical means can describe different answers:1,3,5 and unscored average 3.0, as do four ratings of 3. One set varies between prompts and covers fewer items. Read the original statements, raw sum and rated count together. The minimum of three is this edition’s reporting rule, not a demonstrated clinical or reliability threshold.",
        "zh": "相同均值可以概括不同回答：1、3、5及未评分平均为3.0，四条3也为3.0，但前者题间差异更大且覆盖较少。应将具体陈述、原始和及已评分题数一起阅读。至少三题是本版报告规则，不是已证明的临床或信度门槛。"
      }
    ]
  },
  {
    "id": "relationship-worry-interpretation",
    "title": {
      "en": "Read the pattern without a severity label or relationship verdict",
      "zh": "阅读反应分布，不划严重等级或判断关系"
    },
    "paragraphs": [
      {
        "en": "Higher means record more frequent endorsement of the group’s stated moments, not more love, greater blame or proof of danger. Lower values do not establish calmness, clear communication or why a response was uncommon. The bar positions the raw mean between 1 and 5; its length is not a percentage, percentile or probability.",
        "zh": "均值较高记录的是更常认同本组时刻，不是爱得更多、责任更大或危险的证据。较低也不证明平静、沟通清楚或某种反应为何少见。条形只定位1至5之间的原始均值，长度不是百分比、百分位或概率。"
      },
      {
        "en": "All four guides stay available when answers are mixed, equal or entirely unscored. If you repeat the reflection, compare the same relationship, time reference and actual statements before interpreting any difference. Without established measurement-error and test–retest evidence, a number cannot quantify how much you or the relationship have changed.",
        "zh": "回答不同、相同或全部未评分时，四篇指南均开放。重测时先核对是否为同一关系、相同时间参照及具体陈述，再理解差异。缺少已建立的测量误差与重测证据，数字不能量化自己或关系发生了多大改变。"
      }
    ]
  },
  {
    "id": "relationship-worry-evidence",
    "title": {
      "en": "Related research concepts are not this questionnaire’s validation",
      "zh": "相关研究概念，不等于本问卷已获验证"
    },
    "paragraphs": [
      {
        "en": "CCI’s public information distinguishes reassurance seeking as an attempt to manage fear or uncertainty through feedback, and notes that short-term relief and longer-term patterns can differ. [1] This provides conceptual background for considering a repeated request in context. The present frequencies do not test such a cycle, identify its cause or determine whether it applies to you.",
        "zh": "CCI的公开资料将求安心描述为通过反馈处理害怕或不确定的一种行为，并指出短时缓解与较长期的模式可能不同。[1] 这为结合情境思考重复请求提供概念背景；本页频率不检验这种循环、不确定其原因，也不判定它是否适用于你。"
      },
      {
        "en": "Attachment research uses its own defined instruments. Fraley’s ECR-RS, for example, has separate attachment-related anxiety and avoidance scores for specified close relationships. [2] This original sixteen-prompt, four-theme inventory does not administer ECR-RS or convert its frequencies into attachment scores. Reliability, validity, population norms and English–Chinese measurement equivalence have not been established for this edition.",
        "zh": "依恋研究采用各自明确的工具。例如Fraley的ECR-RS对指定的亲近关系分别计算依恋相关焦虑与回避。[2] 本原创十六题、四主题回顾不施测ECR-RS，也不将频率转换为依恋分。本版尚未建立信度、效度、人群常模或英中测量等值。"
      }
    ]
  },
  {
    "id": "relationship-worry-optional",
    "title": {
      "en": "A private question, with no extra contact required",
      "zh": "可选私人问题：无需再向对方求证"
    },
    "paragraphs": [
      {
        "en": "If useful, choose one statement and privately note what you wanted to know at that moment, what you actually knew and what remained uncertain. You can consider an alternative explanation without checking messages, testing a response or asking for another promise. The result requires no disclosure, contact, relationship change or further questionnaire.",
        "zh": "如有帮助，可以选一条陈述，私下记下当时想知道什么、实际知道什么及哪些仍不确定。可以考虑另一种解释，无需检查消息、试探反应或再索取承诺。结果不要求披露、联系、改变关系或继续其他问卷。"
      },
      {
        "en": "Start opens the first prompt directly. All sixteen questions and four complete guides are free without registration. Optional tab drafts last up to twenty-four hours and clear on completion, clearing or retake. Public sharing contains only the title and entry link, without your answers or means. You can also read every guide without answering.",
        "zh": "点击开始直接进入第一题。十六题及四篇完整指南免费，无需注册。可选标签页草稿最多保留二十四小时，完成、清除或重测后删除。公开分享只有标题及入口，不含答案或均值；也可不作答直接阅读全部指南。"
      }
    ]
  }
];
export const relationshipWorryLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "What does this relationship worry reflection record?",
      "zh": "关系担心反应观察记录什么？"
    },
    "answer": {
      "en": "Your own frequency of four stated responses over the past three months toward one close adult. It is an original reflection, not an assessment of the other person, relationship quality or an overall worry level.",
      "zh": "记录过去三个月面对同一位亲近成年人时，自己四类所述反应的频率；它是原创反思，不评估对方、关系质量或总体担心等级。"
    }
  },
  {
    "question": {
      "en": "Is any request for reassurance a problem?",
      "zh": "只要寻求安心就是问题吗？"
    },
    "answer": {
      "en": "No. The prompts describe particular moments, including asking again after an answer or after a plan changes. Frequency alone cannot establish usefulness, cause or impact. Read what happened and what information was available without treating every question as equivalent.",
      "zh": "不是。题目描述特定时刻，包括回答后再问或安排改变后询问。频率本身不确定作用、原因或影响；应结合发生的事及可用信息，不把所有询问等同看待。"
    }
  },
  {
    "question": {
      "en": "Does helping someone imply giving to secure a connection?",
      "zh": "帮忙就表示为了稳住关系而付出吗？"
    },
    "answer": {
      "en": "No. Rate the stated intention only if it fits your own experience. Ordinary help, a shared obligation or enjoyment of giving does not by itself establish the hoped-for reassurance described in these prompts.",
      "zh": "不是。只有明说的意图符合自己体验时才按此评价；普通帮助、共同义务或喜欢付出，本身不确立题中期待通过付出获得安心的目的。"
    }
  },
  {
    "question": {
      "en": "Does a pause count as an indirect test?",
      "zh": "暂停联系算间接试探吗？"
    },
    "answer": {
      "en": "Only when the prompt’s stated purpose fits: using reduced contact or a hint to check for a response. A genuine need for rest, unavailable time or another reason should not be reinterpreted as a hidden test.",
      "zh": "只有题中明说的目的符合时才算：通过减少联系或暗示来试探回应。确需休息、没有时间或其他原因，不应被重新解释为隐藏试探。"
    }
  },
  {
    "question": {
      "en": "What is the difference between sometimes and unscored?",
      "zh": "有时与未评分有什么区别？"
    },
    "answer": {
      "en": "Sometimes is a numeric frequency response of 3. Unscored means unsuitable, uncertain or declined and is excluded from the sum and denominator. At least three numeric ratings out of four are needed per theme.",
      "zh": "有时是数字3的频率回应；未评分表示不适用、不确定或不愿回答，不进入原始和及分母。每主题四题至少三条数字才显示均值。"
    }
  },
  {
    "question": {
      "en": "How can I recompute the mean?",
      "zh": "怎样复算均值？"
    },
    "answer": {
      "en": "Add the group’s numeric ratings and divide by their count, then round to one decimal.1,4,5 plus unscored give 10/3=3.3. Only two numeric ratings do not meet the reporting rule; unscored is not a penalty or a neutral answer.",
      "zh": "将该组数字相加并除以数字题数，保留一位小数。1、4、5加未评分得到10/3=3.3；仅两条数字不满足报告规则。未评分不是扣分或中立回答。"
    }
  },
  {
    "question": {
      "en": "Can these means show anxious attachment or rejection sensitivity?",
      "zh": "均值能判断焦虑型依恋或拒绝敏感性吗？"
    },
    "answer": {
      "en": "No. Those concepts have separate instruments and response frameworks. [2] Similar wording does not establish equivalent constructs, scores or classifications. This edition reports only its four original response groups.",
      "zh": "不能。这些概念各有独立工具与回答框架。[2] 措辞相近不确立构念、分数或分类等同；本版只报告四个原创反应组。"
    }
  },
  {
    "question": {
      "en": "Should I ask the other person to verify my result?",
      "zh": "需要让对方验证我的结果吗？"
    },
    "answer": {
      "en": "No. No message history, further reassurance, monitoring, promise or disclosure is needed. You can privately consider one concrete example or stop here. The result cannot decide what another person feels or whether you should continue the relationship.",
      "zh": "不需要。无需聊天记录、额外安心回应、监控、承诺或披露。可以私下回想一个实例，也可到此结束。结果不能确定另一人的感受或决定是否继续关系。"
    }
  }
];
export const relationshipWorryLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "CCI: understanding reassurance seeking — conceptual background",
      "zh": "CCI：理解寻求安心——概念背景"
    },
    "url": "https://www.cci.health.wa.gov.au/News/New-Resources-to-Help-Manage-Reassurance-Seeking"
  },
  {
    "title": {
      "en": "Fraley: ECR-RS attachment measure and relationship-specific scoring — a different instrument",
      "zh": "Fraley：ECR-RS依恋测量与特定关系计分——另一独立工具"
    },
    "url": "https://labs.psychology.illinois.edu/~rcfraley/measures/relstructures.htm"
  }
];
