import type { Text } from "@/lib/questionnaires/types";

export const disconnectionSections: { id: string; title: Text; paragraphs: Text[] }[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Detachment, absorption and recall: four separate topics",
      "zh": "距离感、投入与回忆：分别阅读四个主题"
    },
    "paragraphs": [
      {
        "en": "Twenty original descriptions help adults recall their own ordinary experiences over the past four weeks. Five descriptions each concern the experience of self, the experience of surroundings, absorption and attention, and uncertainty in everyday recall. Each topic retains a separate category record and complete public reading.",
        "zh": "20条原创描述，供成年人回顾本人过去四周的普通经历。四个主题各含五条，分别关注自身体验、周围环境体验、投入与注意，以及日常回忆的不确定。每个主题保留单独类别记录与完整公开读法。"
      },
      {
        "en": "The topics organize descriptions; they are not four validated independent psychological dimensions. A felt distance, an absorbing activity and uncertainty about an ordinary detail need not have the same meaning or cause. The record describes selected wording, without deciding what happened or explaining a personal history.",
        "zh": "这些主题用于整理描述，不是四个经过验证的独立心理维度。距离感、投入活动与普通细节的不确定，不必具有同样含义或原因。记录呈现对措辞的选择，不替人确定事件或解释私人历史。"
      }
    ]
  },
  {
    "id": "self",
    "title": {
      "en": "Feeling distance from an experience is not a statement about identity",
      "zh": "与体验有距离，不是对身份的判断"
    },
    "paragraphs": [
      {
        "en": "The first five descriptions distinguish an observer-like feeling during an ordinary activity, an unfamiliar-sounding voice, a familiar action feeling automatic, distance from a named emotion and less connection with a bodily sensation. These are descriptions of how something felt, rather than proof of leaving the body or becoming another person.",
        "zh": "前五条区分普通活动中像旁观自己的感觉、自己的声音显得陌生、熟悉动作显得自动、与已命名感受有距离，以及与身体感觉的联结较少。它们描述体验怎样被感到，不证明离开身体或变成另一个人。"
      },
      {
        "en": "An emotion may be named while feeling distant; that does not measure its intensity or establish its cause. The form does not verify depersonalisation, a separate identity or an altered state. Answer from an existing recollection or leave it unscored, without mirror checks, voice playback or deliberate body monitoring.",
        "zh": "能够说出感受的名称，也可以同时觉得有距离；这不测量强度或确定原因。题本不核实人格解体、独立身份或某种改变状态。可使用已有回忆，或保留未计分，无需照镜检查、反复听自己的声音或刻意监测身体。"
      }
    ]
  },
  {
    "id": "surroundings",
    "title": {
      "en": "Familiar surroundings can be described without testing reality",
      "zh": "描述熟悉环境的体验，无需检验现实"
    },
    "paragraphs": [
      {
        "en": "The next five descriptions concern a familiar place feeling distant, a dreamlike scene while knowing where you are, objects feeling less immediate, familiar people feeling less familiar and difficulty feeling present. A subjective quality of familiarity is distinct from an objective change in the place, objects or people.",
        "zh": "接下来五条关注熟悉地点显得遥远、知道身处何处却觉得像梦境、物体的临近感较弱、熟人显得不那么熟悉，以及较难觉得置身其中。熟悉感的主观性质，与地点、物体或他人的客观变化分开理解。"
      },
      {
        "en": "These choices do not assess vision, neurological recognition, orientation, psychosis or immediate safety. Knowing a location in one description is not a clinical examination. No repeated looking, revisiting a place, comparing sensations or asking someone to prove what is real is needed to complete the page.",
        "zh": "选择不评估视力、神经识别功能、定向、精神病性状态或即时安全。某条描述中知道地点，不等于完成临床检查。完成页面无需反复看、重访地点、比较感官体验，或请别人证明什么是真实。"
      }
    ]
  },
  {
    "id": "attention",
    "title": {
      "en": "Absorption, mind-wandering and returning attention remain distinct",
      "zh": "投入、走神与注意返回，分别保留"
    },
    "paragraphs": [
      {
        "en": "The third topic includes being absorbed in a chosen activity, not tracking time during a story, daydreaming, noticing attention wander and returning it, and doing a familiar action while thinking about something else. A welcome absorbing experience and an unwelcome distraction can both occur; the record does not rank one as a better state.",
        "zh": "第三组包括投入自选活动、看故事时未留意时间、白日梦、注意到走神后返回，以及做熟悉动作时想着别的事。令人喜欢的投入与不想要的分心都可能出现；记录不评选哪种状态更好。"
      },
      {
        "en": "Returning attention is not reverse scored to cancel another description. These labels do not measure attention span, creativity, flow, ADHD, memory loss or functional impairment. They require neither a concentration challenge nor prolonging an activity to see whether awareness changes.",
        "zh": "注意返回不作反向计分，也不抵消另一条描述。标签不测注意持续时间、创造力、心流、ADHD、记忆丧失或功能受影响程度。无需挑战专注，或延长活动来试验觉察会不会改变。"
      }
    ]
  },
  {
    "id": "recall",
    "title": {
      "en": "Remembering uncertainty is different from not knowing how to answer",
      "zh": "记得曾不确定，与现在不知道怎样作答不同"
    },
    "paragraphs": [
      {
        "en": "The last five descriptions concern unclear parts of an ordinary conversation, the order of routine steps, a short stretch of an activity, details of a completed task and placing a remembered detail on an occasion. If you remember that uncertainty itself occurred, choose the frequency that fits that recollection. If you cannot tell whether the description occurred, it may remain unscored.",
        "zh": "最后五条关注普通对话的部分不清、日常步骤顺序、活动中的一小段、已完成任务的细节，以及记得的细节属于哪次场合。若记得当时确曾出现这种不确定，可按回忆选择频率；若不能判断题述是否发生，可保留未计分。"
      },
      {
        "en": "An unclear detail cannot establish amnesia, hidden harm, another identity or why an event is difficult to recall. Missing information remains missing. The page does not ask you to reconstruct a memory, search documents or messages, repeat a memory test or contact another person to confirm a story.",
        "zh": "细节不清，不能确定失忆、隐藏伤害、另一个身份或某件事难以回想的原因。缺失信息可以继续未知。本页不要求重建记忆、查文件或消息、重复记忆测试，或联系别人确认故事。"
      }
    ]
  },
  {
    "id": "categories",
    "title": {
      "en": "Six category counts per topic, without a dissociation score",
      "zh": "每组保留六类计数，不生成解离分数"
    },
    "paragraphs": [
      {
        "en": "For each description, select did not notice, rarely, sometimes, often or very often noticed, or leave it unscored. Category IDs carry no points. No relevant occasion, unclear recall and withholding share one unscored option, which cannot distinguish those reasons afterwards. Unscored is kept separate from did not notice.",
        "zh": "每条选择有相关机会时未注意到、很少、有时、较常、经常注意到，或未计分。类别标识不带点数。无相关机会、回忆不清与保留回答共用一个未计分选项，之后不能区分这些原因。未计分与未注意到分开保留。"
      },
      {
        "en": "For example, one sometimes, one often and three unscored yield counts 0, 0, 1, 1, 0 and 3 in display order: five descriptions, not five episodes, days or minutes. No total, mean, reverse scoring, highest topic, percentage or risk band is calculated. All twenty may remain unscored and all four readings remain available.",
        "zh": "例如，一条有时、一条较常与三条未计分，按展示顺序得到0、0、1、1、0、3，合计五条描述，而非五次、五天或五分钟。不计算总分、均值、反向分、最高主题、百分比或风险档位。20条均可未计分，四篇读法仍可阅读。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "Original reflection, clinical scales and professional assessment",
      "zh": "原创回顾、临床量表与专业评估"
    },
    "paragraphs": [
      {
        "en": "This is an original twenty-description activity, not the Dissociative Experiences Scale (DES or DES-II), a shortened version of it, or a test for dissociative identity disorder. Its four-week reference and six-category records belong to this form. Published instruments have different items, response formats and research; their norms and thresholds cannot be transferred here.",
        "zh": "这是20条原创描述活动，不是解离体验量表（DES或DES-II）、其缩短版，或解离性身份障碍测试。四周参照与六类别记录属于本题本。已发表工具各有不同题目、回答格式与研究，不能将其常模和阈值转移到这里。"
      },
      {
        "en": "No reliability, validity, clinical norms or English–Chinese measurement equivalence has been established for these original descriptions. The NHS describes assessment as potentially involving examination for other illnesses and specialist assessment of thoughts, feelings, behaviour and symptoms. A matching phrase or category count cannot perform that assessment or confirm a cause. [1]",
        "zh": "这些原创描述尚未建立自身信度、效度、临床常模与中英文测量等值证据。NHS介绍的评估可能包括检查其他疾病，以及专业人员对思维、感受、行为和症状的评估。某条措辞符合或某类计数，不能完成这种评估或确认原因。[1]"
      }
    ]
  },
  {
    "id": "privacy-support",
    "title": {
      "en": "Read privately, without reconstructing events or producing evidence",
      "zh": "私人阅读，无需重建事件或提供证明"
    },
    "paragraphs": [
      {
        "en": "Answers stay in current-page memory, without saved drafts, submission as answers, questionnaire analytics or a personal-result URL. Exit, retake, reload and leaving clear the record. Copy public entry shares the fixed public title and link only. The same full readings and support information remain public before, during and after answering.",
        "zh": "回答只留当前页面内存，不存草稿、不作为答案提交、不作问卷分析，也无个人结果网址。退出、重做、刷新与离页会清除记录。“复制公开入口”只分享固定公开标题与链接。同一份完整读法与支持说明在作答前、中、后始终公开。"
      },
      {
        "en": "You may stop without resolving an uncertainty or telling a personal story. A healthcare or mental-health professional can be consulted about concerning experiences without reaching a count or completing this page. Existing support and care remain independent; this reflection assigns no treatment change, memory-recovery task or exposure exercise.",
        "zh": "可在不解决未知、不讲述私人故事的情况下停止。对体验有顾虑时，无需达到某个计数或完成本页，便可咨询医疗或心理健康专业人员。已有支持与照护独立保留；本回顾不安排治疗改变、记忆恢复任务或暴露练习。"
      }
    ]
  }
];

export const disconnectionFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "Who can use these twenty descriptions?",
      "zh": "这20条描述适合谁使用？"
    },
    "answer": {
      "en": "Adults may recall their own ordinary experiences over the past four weeks. It takes about five minutes at your own pace, free without registration. No personal narrative, traumatic history or event evidence is requested.",
      "zh": "成年人可回顾本人过去四周的普通经历。约需五分钟，可按自己的节奏进行，免费且无需注册，不要求私人叙述、创伤史或事件证据。"
    }
  },
  {
    "question": {
      "en": "Does feeling distant mean a different identity?",
      "zh": "觉得有距离，就表示有另一个身份吗？"
    },
    "answer": {
      "en": "No identity is inferred. The wording records a remembered subjective quality, not a change of person, a diagnosis or confirmation that an event occurred. The self-experience guide explains each description without asking for proof.",
      "zh": "本页不推断身份。措辞记录记得的主观性质，不证明变成另一个人、某种诊断或某个事件发生。自身体验指南分别解释描述，不要求提供证明。"
    }
  },
  {
    "question": {
      "en": "Is an absorbing activity automatically a problem?",
      "zh": "投入活动就一定是问题吗？"
    },
    "answer": {
      "en": "No. Absorption and distraction may feel welcome or unwelcome in different contexts. The categories do not measure impairment or grade attention. Returning attention does not cancel another answer.",
      "zh": "不一定。不同情境中的投入与分心可能令人喜欢，也可能不受欢迎。类别不测受损程度或评注意力等级，注意返回也不抵消其他回答。"
    }
  },
  {
    "question": {
      "en": "What if I remember uncertainty but not the detail?",
      "zh": "记得曾不确定，却不记得细节，怎么选？"
    },
    "answer": {
      "en": "Remembering that the uncertainty occurred can support a frequency response to that description. Not knowing whether it occurred can remain unscored. You do not need to recover the missing detail to complete or leave the page.",
      "zh": "记得不确定本身曾发生，可据此选择该描述的频率；不知道是否发生，可保留未计分。无需找回缺失细节，便可完成或离开页面。"
    }
  },
  {
    "question": {
      "en": "Can all twenty remain unscored?",
      "zh": "20条都可以未计分吗？"
    },
    "answer": {
      "en": "Yes. Unscored stays separate from did not notice. It combines no occasion, unclear recall and withholding, so its count cannot identify which reason applied. An entirely unscored record produces no clinical finding and keeps all four readings available.",
      "zh": "可以。未计分与未注意到分开，包含无机会、回忆不清与保留回答，因此计数不能识别具体原因。全部未计分不产生临床发现，四篇读法仍然开放。"
    }
  },
  {
    "question": {
      "en": "Can a second attempt measure recovery?",
      "zh": "再次完成能测量恢复吗？"
    },
    "answer": {
      "en": "No change threshold or test–retest evidence has been established for this form. Recall and context may differ. Different category counts do not establish improvement, deterioration, a treatment effect or an identity change.",
      "zh": "本题本尚未建立变化阈值或重测证据。回忆与背景都可能不同。类别计数改变不能证明改善、恶化、治疗效果或身份变化。"
    }
  },
  {
    "question": {
      "en": "Can I complete this for someone else?",
      "zh": "能替别人完成吗？"
    },
    "answer": {
      "en": "This form concerns adult self-recollection. Another person cannot supply private feelings or uncertain memories. The four public readings can be consulted without answering or assigning anyone a label.",
      "zh": "本题本关注成年人回顾自己。别人不能代替私人感受或不确定回忆。无需作答或给任何人贴标签，便可查阅四篇公开读法。"
    }
  },
  {
    "question": {
      "en": "Must I inspect sensations or check old messages?",
      "zh": "必须检查感觉或翻看旧消息吗？"
    },
    "answer": {
      "en": "No. Use an existing recollection or the unscored option. No reality check, sensation experiment, document search, memory reconstruction or contact with another person is required. Support is available independently of any answer pattern.",
      "zh": "不必。可用已有回忆或选择未计分。无需检验现实、试验感受、查文件、重建记忆或联系别人。支持不取决于任何回答模式。"
    }
  }
];

export const disconnectionReadingSummaries: Record<string, Text> = {
  "experience-of-self-reading": {
    "en": "Distinguish observer-like feelings, unfamiliarity and felt distance without inferring a separate identity or testing bodily sensations.",
    "zh": "区分旁观感、陌生感与距离感，不推断独立身份或检验身体感觉。"
  },
  "experience-of-surroundings-reading": {
    "en": "Read felt distance and familiarity as descriptions of experience, without turning them into reality or recognition tests.",
    "zh": "将距离感与熟悉感作为体验描述阅读，不变成现实或识别测试。"
  },
  "absorption-and-attention-reading": {
    "en": "Keep absorption, distraction and returning attention separate, without rating concentration or inferring memory loss.",
    "zh": "分别保留投入、分心与注意返回，不评专注等级或推断记忆丧失。"
  },
  "everyday-recall-uncertainty-reading": {
    "en": "Separate remembered uncertainty from an uncertain answer, without reconstructing events or searching for missing evidence.",
    "zh": "区分记得曾不确定与作答未知，无需重建事件或寻找缺失证据。"
  }
};
