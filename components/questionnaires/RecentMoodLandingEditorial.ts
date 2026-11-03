import type { Text } from "@/lib/questionnaires/types";

/** Frontend explanation only; original item and full-guide content stays bound to its source. */
export const recentMoodSections: { id: string; title: Text; paragraphs: Text[] }[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Recent mood: describe what has felt different",
      "zh": "近期心情回顾什么：把与平时不同的感受说清楚"
    },
    "paragraphs": [
      {
        "en": "Twelve original descriptions offer adults a way to recall the past four weeks through three topics: mood and interest; sleep and appetite; and energy, attention and inner words. Each topic contains four descriptions. The result keeps your individual choices visible and groups them by category, alongside three complete public readings.",
        "zh": "十二条原创描述，帮助成年人从心情与兴趣、睡眠与食欲、精力注意与内心语言三个主题回顾过去四周，每组四条。结果保留逐条选择，分别整理类别记录，并提供三篇完整公开读法。"
      },
      {
        "en": "This is a personal account of remembered experiences, not an observation of your behaviour or a judgment about how you should feel. The topics may overlap: a demanding activity, changed routine or practical constraint can matter in more than one account. Their grouping does not establish three independent psychological dimensions or a single explanation for your recent mood.",
        "zh": "这是对记得的经历作个人描述，不是页面对行为的观察，也不裁定应该有什么感受。主题可以重叠：活动要求、作息变化或现实限制，可能同时出现在多个叙述中。分组不确立三个独立心理维度，也不为近期心情指定单一解释。"
      }
    ]
  },
  {
    "id": "mood-interest-context",
    "title": {
      "en": "Mood, anticipation and enjoyment can differ",
      "zh": "心情、开始前的期待与过程中的享受，可以不同"
    },
    "paragraphs": [
      {
        "en": "The first topic distinguishes feeling lower than usual, finding something less appealing beforehand, noticing less enjoyment while doing it and feeling emotionally flat. Imagine looking forward to an activity less than usual but still enjoying part of it once it begins. Those two recollections can coexist; you do not need to make every description agree.",
        "zh": "第一组分别询问比平时低落、事前吸引力减少、进行时享受减少，以及情绪平淡。设想开始前不如平时期待某项活动，实际进行后却仍有部分乐趣。这两种回忆可以并存，不需要让所有描述一致。"
      },
      {
        "en": "An unavailable activity and an unappealing activity are different situations. A change in the activity or its demands can remain unknown here. No response decides that you have lost the capacity for pleasure, identifies a condition or requires you to repeat an activity to prove enjoyment. A relevant experience that you cannot recall can stay unscored.",
        "zh": "活动无法进行，与活动不再吸引人，是不同情境。活动本身或附带要求是否改变，在这里可能仍然未知。回答不判断享受能力是否丧失，不识别疾病，也不要求重复活动来证明有乐趣。回想不清的相关经历可保持未计分。"
      }
    ]
  },
  {
    "id": "sleep-appetite-context",
    "title": {
      "en": "Separate sleep opportunity, time in bed and appetite",
      "zh": "区分睡眠机会、待床时间与食欲感受"
    },
    "paragraphs": [
      {
        "en": "Difficulty settling at an intended sleep time differs from having too little opportunity to sleep. Sleeping longer and remaining in bed longer are also different experiences, although one original description allows either to be recalled. The record asks what you remember; it does not measure hours, sleep efficiency, insomnia or the medical cause of a change.",
        "zh": "打算睡时难以安睡，与没有足够睡眠机会不同。睡着更久和待在床上更久也不同，尽管某条原创描述允许回顾其中一种。记录询问记得的经历，不测小时数、睡眠效率、失眠或变化的医疗原因。"
      },
      {
        "en": "A meal feeling less appealing and wanting food more than usual describe appetite, not quantities eaten, nutritional status or body size. Food availability and routine can leave important context unresolved. There is no need to count meals, weigh yourself, restrict food, stay awake or change sleep or eating to answer. A physical change is not explained or certified harmless by a category.",
        "zh": "饭菜吸引力减少、比平时更想吃东西，描述的是食欲感受，不是实际进食量、营养状况或体型。食物可获得性和日程可能留下重要的未知处境。无需数餐次、称重、限食、熬夜或改变睡眠饮食来作答。类别不解释身体变化，也不确定它无害。"
      }
    ]
  },
  {
    "id": "energy-attention-words",
    "title": {
      "en": "Effort, attention and self-critical thoughts are different accounts",
      "zh": "用力感、留意信息与苛刻内心话，分别阅读"
    },
    "paragraphs": [
      {
        "en": "The third topic covers low energy beside difficulty starting a familiar activity, difficulty staying with ordinary information, harsh thoughts after a small setback and thoughts that what you did counted for little. Completing an activity does not mean it felt easy; not completing it does not show a lack of effort. The record provides no measure of productivity, intelligence or work suitability.",
        "zh": "第三组涉及精力不足伴随熟悉活动难开始、难以持续留意普通信息、小挫折后的苛刻想法，以及觉得所做之事价值不多。完成活动不表示轻松，未完成也不证明没有努力。记录不衡量产出、智力或工作适配。"
      },
      {
        "en": "Noticing a self-critical thought does not establish that it is true. Likewise, difficulty following a message does not reveal what you understood or diagnose an attention condition. You need not write the thought, revisit a painful event, test your concentration or replace an uncomfortable thought with a positive one. Descriptions can remain uncertain without becoming a verdict about your worth.",
        "zh": "注意到自我批评的想法，不确定想法为真。同样，没跟上一则信息，不显示实际理解了什么，也不诊断注意状况。不必写出想法、重访痛苦事件、检查专注力，或用正面想法替换不舒服的想法。描述可以保留不确定，不变成对个人价值的裁决。"
      }
    ]
  },
  {
    "id": "category-example",
    "title": {
      "en": "How six category counts describe four selections",
      "zh": "六类计数怎样记录四个选择"
    },
    "paragraphs": [
      {
        "en": "Each description offers did not notice, rarely, sometimes, often, very often and unscored. For a fictional four-description topic, two sometimes choices, one often and one unscored produce counts of 0, 0, 2, 1, 0 and 1 in that order. They add to four descriptions, not four symptoms, days, nights, meals or episodes. No points, average, combined score or highest topic is calculated.",
        "zh": "每条描述可选没有注意到、很少、有时、较常、经常和未计分。虚构示例中，同组四条选择两条有时、一条较常和一条未计分，则按上述顺序记录0、0、2、1、0、1，合计四条描述；不是四种症状、四天、四晚、四餐或四次发作。不计算点数、平均值、总分或最高主题。"
      },
      {
        "en": "No relevant experience, unclear recall and withholding remain unscored. They are not converted into did not notice or into a zero for an average. All twelve descriptions can remain unscored and the same three guides remain readable. A count describes the selected labels only; it does not determine how important an experience is to you or whether you need support.",
        "zh": "没有相关经历、回想不清或保留回答，均保持未计分，不转为没有注意到，也不为平均值补零。十二条全部未计分，同样可读三篇指南。计数只描述所选标签，不决定某段经历对你有多重要，也不决定是否需要支持。"
      }
    ]
  },
  {
    "id": "method-and-evidence",
    "title": {
      "en": "A four-week reflection is different from a depression scale",
      "zh": "四周个人回顾与抑郁量表有什么区别"
    },
    "paragraphs": [
      {
        "en": "This original form is not PHQ-9, SDS, DMI-10, K10 or a clinical screen. Similar words about mood, sleep or energy do not make their response anchors, recall periods, scores or interpretation interchangeable. Published evidence for another instrument cannot establish validity, diagnostic thresholds or English–Chinese measurement equivalence for these twelve descriptions.",
        "zh": "本原创题本不是PHQ-9、SDS、DMI-10、K10或临床筛查。都谈到心情、睡眠或精力，并不表示作答锚点、回顾时段、分数或解释可以互换。其他工具的发表证据，不能确立这十二条描述的效度、诊断阈值或中英文测量等值。"
      },
      {
        "en": "NIMH describes depression assessment as considering persistent experiences, their duration and impact, and other possible explanations. This record does not perform that assessment. Its four weeks set a recall window, not a diagnostic rule or a waiting period. A frequent label cannot establish depression; a sparse or unscored record cannot exclude it. [1]",
        "zh": "NIMH介绍的抑郁评估会考虑持续的体验、持续时间、生活影响及其他可能解释。本记录不执行这样的评估。四周是回顾窗口，不是诊断规则或等待期限。频繁标签不能确定抑郁，稀疏或未计分的记录也不能排除抑郁。[1]"
      }
    ]
  },
  {
    "id": "reading-and-support",
    "title": {
      "en": "Complete readings and a conversation you choose",
      "zh": "完整阅读，并留下自己想讨论的问题"
    },
    "paragraphs": [
      {
        "en": "Each public guide includes concrete examples, distinctions between experiences, category reading, uncertainty, support and privacy. The same full text is available before answering and after every record. You can read a single topic, stop after reading or discuss an experience outside the twelve descriptions. No completion or preferred category is required.",
        "zh": "每篇公开指南都包括具体例子、不同经历的区分、类别读法、不确定性、支持与隐私。相同全文在作答前和所有记录后开放。可只读一个主题、读完就停，或讨论十二条描述之外的经历；无需完成作答或选出某种优选类别。"
      },
      {
        "en": "If you want a conversation, describe what felt different, the situation and what you would like help understanding, at the level of detail you choose. NIMH advises talking with a healthcare provider about concerns. Asking does not require a score or waiting two weeks. Keep existing care independent; the page cannot assess urgency, personal safety or whether medicine or support should change. [1]",
        "zh": "若想交流，可以按自己愿意的细节，描述与平时有何不同、发生情境，以及希望请人帮助理解什么。NIMH建议有顾虑时与医疗专业人士沟通。咨询无需分数，也不必等待两周。已有照护独立保留；页面不能评估紧急程度、个人安全，或决定是否改变药物和支持。[1]"
      }
    ]
  },
  {
    "id": "privacy-and-later-records",
    "title": {
      "en": "Direct entry, private records and later differences",
      "zh": "直接开始、私人记录与后来差异"
    },
    "paragraphs": [
      {
        "en": "One start opens the first observation without another agreement screen. The adult recalls their own experiences; no identity, private narrative, body measurement, task performance or uploaded file is requested. Answers and records remain in current-page memory, with no draft storage, submission, questionnaire analytics or personal result address.",
        "zh": "点击一次开始即进入第一条观察，没有额外同意页。由成年人回顾本人经历，不要求身份、私人叙述、身体测量、任务表现或上传文件。回答与记录只在当前页面内存，不存草稿、不提交、不作问卷分析，也不生成个人结果地址。"
      },
      {
        "en": "Exit, retake, reload and leaving clear the record. Copying shares only the public title and entry. A later difference may reflect context, opportunity, memory or interpretation; there is no validated reliable-change threshold, target count or required retake schedule. This page neither monitors a visitor nor verifies recovery or a treatment effect.",
        "zh": "退出、重做、刷新及离页会清除记录。复制仅含公开标题与入口。后来差异可能反映处境、机会、记忆或理解；没有经验证的可靠变化阈值、目标计数或规定重测日程。页面不监测访客，也不核实恢复或治疗效果。"
      }
    ]
  }
];

export const recentMoodFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "What does the recent-mood reflection provide?",
      "zh": "近期心情回顾会提供什么？"
    },
    "answer": {
      "en": "Three separate category records covering twelve original descriptions, plus three complete public guides. Each individual choice remains visible. It does not generate a depression score, severity tier, highest topic or population comparison.",
      "zh": "围绕十二条原创描述，分别提供三组类别记录及三篇完整公开指南，保留每一项选择。不生成抑郁分数、严重程度档位、最高主题或人群比较。"
    }
  },
  {
    "question": {
      "en": "Does less anticipation mean I could not enjoy an activity?",
      "zh": "期待减少，就表示活动中没有乐趣吗？"
    },
    "answer": {
      "en": "Not necessarily. Anticipation before an activity and enjoyment during it are different recollections. One can change without the other. The record cannot test your capacity for pleasure or tell you which activities you should enjoy.",
      "zh": "不一定。活动前的期待与活动中的享受，是不同回忆；一项可以变化而另一项没有。记录不测试享受能力，也不决定应该喜欢哪些活动。"
    }
  },
  {
    "question": {
      "en": "Does longer time in bed establish oversleeping?",
      "zh": "待在床上更久，就能确定睡眠过多吗？"
    },
    "answer": {
      "en": "No. Sleeping and remaining in bed are different experiences. The original description allows either to be recalled, but the page does not measure sleep duration, quality or a cause. No device, timing or change of routine is required.",
      "zh": "不能。睡着与待床是不同经历。原创描述允许回顾其中一种，但页面不测睡眠时长、质量或原因，无需设备、计时或改变作息。"
    }
  },
  {
    "question": {
      "en": "Can appetite labels tell me how much I should eat?",
      "zh": "食欲标签能告诉我应该吃多少吗？"
    },
    "answer": {
      "en": "No. They retain a remembered change in appetite, not food intake, nutritional status or a weight target. Keep existing care and advice independent. You do not need to restrict, try a meal or measure your body for this record.",
      "zh": "不能。标签保留记得的食欲变化，不记录食物摄入量、营养状况或体重目标。已有照护和意见独立保留，无需为了记录限食、试吃或测量身体。"
    }
  },
  {
    "question": {
      "en": "Do self-critical thoughts show that I have failed?",
      "zh": "出现苛刻内心话，就说明我失败了吗？"
    },
    "answer": {
      "en": "No. Remembering a thought is different from establishing that it is true. The page asks about an experience, not your worth or contribution. You need not write the words, disclose an event or correct a thought to continue.",
      "zh": "不是。记得一种想法，与证明想法为真不同。页面问的是经历，不评价个人价值或贡献。无需写出原话、披露事件或纠正想法，便可继续。"
    }
  },
  {
    "question": {
      "en": "Can I use my partner’s or child’s behaviour to answer?",
      "zh": "能根据伴侣或孩子的表现代答吗？"
    },
    "answer": {
      "en": "This original form is for adults recalling their own experiences. Behaviour you see cannot reveal another person’s inner feelings or supply their answers. It has no child, observer-rated or relationship-assessment version.",
      "zh": "本原创题本供成年人回顾本人经历。看见的行为不能揭示别人的内心感受，也不能代替其作答。本版没有儿童、观察者评定或关系评估版本。"
    }
  },
  {
    "question": {
      "en": "Is it free, and does start open an agreement page?",
      "zh": "是否免费，开始后还要点同意吗？"
    },
    "answer": {
      "en": "All twelve descriptions, category records and three complete readings are free without registration. One start opens the first observation. Every description offers an explicit unscored choice, and you can leave at any time.",
      "zh": "十二条描述、类别记录及三篇完整读法均免费，无需注册。点击一次开始即进入第一条。每条均提供明确的未计分选择，也可随时离开。"
    }
  },
  {
    "question": {
      "en": "How are answers saved, and can retaking measure improvement?",
      "zh": "回答怎样保存，重做能衡量改善吗？"
    },
    "answer": {
      "en": "No draft or personal result link is saved: answers stay in current-page memory and clear on exit, retake, reload or leaving. Copy contains only the public entry. A later category difference is not a validated measure of improvement, deterioration or treatment response.",
      "zh": "不保存草稿或个人结果链接：回答只留当前页面内存，退出、重做、刷新及离页会清除。复制只含公开入口。后来类别的不同，不是经验证的改善、恶化或治疗反应指标。"
    }
  }
];

export const recentMoodReadingSummaries: Record<string, Text> = {
  "mood-and-interest-reading": {
    "en": "Distinguish lower mood, anticipation before an activity and enjoyment during it. Read everyday examples and retain uncertainty about context.",
    "zh": "区分低落感、活动前的期待与过程中的享受，结合日常实例，保留尚不清楚的具体处境。"
  },
  "sleep-and-appetite-reading": {
    "en": "Separate sleep opportunity, sleeping and time in bed; read appetite changes without converting them into food, body or medical judgments.",
    "zh": "分别阅读睡眠机会、睡着与待床的经历；描述食欲变化，不将它转成对进食、身体或医疗原因的判断。"
  },
  "energy-attention-and-self-talk-reading": {
    "en": "Read remembered effort, attention and inner words separately, with examples that keep personal worth and achievement distinct from the experience.",
    "zh": "分别阅读记得的用力感、注意与内心语言，通过实例区分主观经历、完成量和个人价值。"
  }
};
