import type { Text } from "@/lib/questionnaires/types";

export const eatingExperiencesSections: { id: string; title: Text; paragraphs: Text[] }[] = [
  {
    "id": "eating-purpose",
    "title": {
      "en": "Eating and body experiences: five topics, without a health score",
      "zh": "进食与身体经历：分别理解五个主题"
    },
    "paragraphs": [
      {
        "en": "Twenty original statements invite adults to recall their own past four weeks through thoughts about the body, limiting eating, feeling unable to choose while eating, trying to undo eating and the attention taken up by food concerns. Each topic contains four statements. The result retains every selected category alongside five complete public guides.",
        "zh": "二十条原创陈述，供成年人回顾本人过去四周关于身体的想法、限制进食、进食时难以自主选择、试图抵消进食，以及食物顾虑占据注意的经历。每个主题四条，结果保留逐条所选类别，并提供五篇完整公开指南。"
      },
      {
        "en": "These topics organize descriptions rather than establish five independent psychological dimensions. They can overlap without proving a sequence or a cause. You can read a guide without answering, keep any experience private or stop at any time. No food task, body assessment or personal story is needed.",
        "zh": "这些主题用于整理描述，不确立五个独立心理维度。不同经历可以重叠，但这不证明发生顺序或原因。可以不答题直接读指南，保留任何私人经历，或随时停止；无需食物任务、身体评定或个人故事。"
      }
    ]
  },
  {
    "id": "body-and-context",
    "title": {
      "en": "Body-related thoughts are experiences, not an assessment of appearance",
      "zh": "身体相关想法是主观经历，不是外表评定"
    },
    "paragraphs": [
      {
        "en": "The first topic separates judging personal worth through appearance, thoughts interrupting an activity, distress about the body and troubling comparisons. Remembering a comparison does not establish that the comparison is accurate. Nor does remembering distress require you to name a body feature or decide how you should look.",
        "zh": "第一组分别涉及通过外表评价自身价值、想法打断活动、对身体感到难受，以及令人困扰的比较。记得发生过比较，不证明比较准确；记得难受，也不要求指出身体部位或决定应该长成什么样。"
      },
      {
        "en": "A thought can fit one statement without fitting the other three. The record does not grade attractiveness, establish body size or reveal what other people think. There is no mirror, photograph, measurement or comparison task. NIMH notes that eating disorders can affect people across body weights, including people who appear healthy; appearance alone cannot settle a concern. [1]",
        "zh": "某个想法可以符合一条，而不符合另外三条。记录不评颜值、不判体型，也不揭示别人怎么看。没有照镜、照片、测量或比较任务。NIMH指出，进食障碍可能涉及不同体重的人，也可能发生在看起来健康的人身上；不能只凭外表确定顾虑是否成立。[1]"
      }
    ]
  },
  {
    "id": "limiting-and-choice",
    "title": {
      "en": "Distinguish the reason for limiting eating from the feeling of losing choice",
      "zh": "区分限制进食的语境与难以自主选择的感受"
    },
    "paragraphs": [
      {
        "en": "The limiting-eating topic asks about body-related worry and rules that feel difficult to change. Food availability, allergies, religious practice or an existing medical plan are different contexts; an outwardly similar choice does not by itself answer these statements. Use what the statement actually describes, leaving uncertain or irrelevant experiences separate.",
        "zh": "限制进食主题涉及身体相关担忧，以及感觉难以改变的规则。食物可获得性、过敏、宗教实践或已有医疗安排属于不同语境；表面相似的选择，不能直接代替题目描述。按陈述实际询问的经历作答，分别保留不确定与不相关情境。"
      },
      {
        "en": "The next topic concerns a subjective sense of being unable to choose while eating, distress afterwards and wanting to conceal the experience. That feeling does not measure the amount eaten or establish a clinical binge episode. Limiting eating and loss of choice may both be recalled, but this form cannot establish that one caused the other or assign a disorder.",
        "zh": "下一组关注进食时主观上难以自主选择、之后的不适，以及想隐瞒经历的感受。这种感受不测实际进食量，也不确定发生了临床意义上的暴食发作。限制进食与失去选择感可以同时被回顾，但本题本不能判断因果或指派疾病。"
      }
    ]
  },
  {
    "id": "undoing-and-attention",
    "title": {
      "en": "Read intention and mental preoccupation without prescribing an action",
      "zh": "理解抵消意图与注意占用，不将描述变成行动要求"
    },
    "paragraphs": [
      {
        "en": "Trying to undo eating describes an intention attached to later choices or a rule that feels binding. An ordinary change in activity, rest or schedule does not automatically have that intention. The guide keeps the topic broad: it neither asks you to name a technique nor compares methods, targets or effectiveness. Eating does not need to be earned or undone.",
        "zh": "试图抵消进食，描述的是之后选择所带的意图，或感觉必须遵守的规则。普通的活动、休息或日程变化，并不自动带有这种意图。指南保持宽泛描述，不要求说出具体方法，也不比较方法、目标或效果。进食无需靠其他行为换取或抵消。"
      },
      {
        "en": "The final topic separates food thoughts interrupting an activity, worry before a later meal, returning to an earlier meal in thought and difficulty staying with a shared activity. Planning groceries or managing an allergy is not automatically preoccupation. Read the remembered impact and context; do not start a food diary, count thoughts or change food or activity to produce an answer.",
        "zh": "最后一组区分食物想法打断活动、为之后一餐提前担忧、反复想到先前一餐，以及难以投入共同活动。安排采购或管理过敏，不自动等于顾虑占据注意。结合记得的影响和语境阅读；不必开始食物日记、数想法，或改变饮食与活动来产生答案。"
      }
    ]
  },
  {
    "id": "eating-category-example",
    "title": {
      "en": "Six separate categories, four statements per topic",
      "zh": "六类分别记录，每个主题四条陈述"
    },
    "paragraphs": [
      {
        "en": "The choices are does not describe my past four weeks, partly describes, describes, cannot judge, no relevant experience and prefer not to answer. In a fictional four-statement topic, partly, fits, unsure and withheld produce counts of 0, 1, 1, 1, 0 and 1 in that order. The sum is four statements, not four symptoms, meals, days or episodes.",
        "zh": "选项依次为不符合过去四周、部分符合、符合、无法判断、没有相关经历、不愿回答。虚构示例中，同组四条分别选部分符合、符合、无法判断与不愿回答，则按上述顺序记录0、1、1、1、0、1，合计四条陈述，不是四种症状、四餐、四天或四次发作。"
      },
      {
        "en": "Cannot judge, no relevant experience and prefer not to answer stay distinct and unscored. None is converted into does not describe or a zero for an average. All twenty statements may be withheld and the same five guides remain available. There are no points, total, mean, highest topic, population rank or threshold for receiving support.",
        "zh": "无法判断、没有相关经历、不愿回答，分别保留且不计分，不转成不符合，也不为均值补零。二十条全部保留回答，同样可读五篇指南。没有点数、总分、平均值、最高主题、人群排名或获取支持的计数门槛。"
      }
    ]
  },
  {
    "id": "eating-evidence",
    "title": {
      "en": "Original reflection, screening and clinical assessment are different activities",
      "zh": "原创回顾、筛查与临床评估，各有不同职责"
    },
    "paragraphs": [
      {
        "en": "This is not EAT-26, SCOFF, SWED, EDE-Q or the clinician-administered EDA-5. Similar topics do not make items, time windows, response labels, scoring keys or findings interchangeable. Evidence supporting another instrument does not establish the validity, norms or English–Chinese measurement equivalence of this original twenty-statement form.",
        "zh": "本题本不是EAT-26、SCOFF、SWED、EDE-Q，也不是供临床人员使用的EDA-5。主题相似，不表示题目、时段、选项、计分键或结论可以互换。其他工具的证据，不能确立本原创二十条题本的效度、常模或中英文测量等值。"
      },
      {
        "en": "The four-week window specifies which experiences to recall; it is not a diagnostic duration rule or a waiting period before seeking care. These category records do not assess nutritional status, medical stability or the cause of a physical symptom. NIMH advises discussing eating-related concerns with a healthcare provider; the public background does not validate or endorse this form. [1]",
        "zh": "四周规定回顾哪些经历，不是诊断持续时间规则，也不是寻求照护前的等待期。类别记录不评估营养状况、医疗稳定性或身体症状的原因。NIMH建议有进食相关顾虑时与医疗专业人士沟通；公开背景不验证或背书本题本。[1]"
      }
    ]
  },
  {
    "id": "eating-readings-support",
    "title": {
      "en": "Five complete readings and a conversation at your own pace",
      "zh": "五篇完整读法，以及按自己意愿进行的交流"
    },
    "paragraphs": [
      {
        "en": "Each guide includes concrete examples, distinctions from neighbouring themes, category reading, uncertainty, privacy and independent support. The public text is the same before answering and after any record. Reading a topic does not mean the page has found it in you. You may discuss an experience outside these twenty descriptions.",
        "zh": "每篇指南包含具体例子、与相邻主题的区分、类别读法、不确定性、隐私及独立支持。作答前与任何记录后，公开全文相同。读到某个主题，不表示页面已经在你身上发现它。也可讨论这二十条描述之外的经历。"
      },
      {
        "en": "If you want support, you can describe a broad concern or its effect on daily life at the level of detail you choose, without presenting a count or a body measurement. Keep existing care independent. The page cannot decide urgency or whether treatment should change; for immediate danger or severe current symptoms, seek local emergency medical help rather than continue answering. [1]",
        "zh": "若想寻求支持，可以按自己愿意的细节，表达大致顾虑或它对日常生活的影响，无需提供计数或身体测量。已有照护独立保留。页面不能决定紧急程度或是否改变治疗；有即时危险或当前严重症状时，应寻求当地紧急医疗帮助，不要继续靠作答处理。[1]"
      }
    ]
  },
  {
    "id": "eating-privacy-revisit",
    "title": {
      "en": "Direct entry, private memory and later differences",
      "zh": "直接开始、私人内存与后来差异"
    },
    "paragraphs": [
      {
        "en": "One start opens the first statement without a second agreement page. Adults answer about themselves; the form requests no identity, weight, food quantity, photograph, diary or private narrative. Answers and records stay in current-page memory, with no draft storage, submission, questionnaire analytics or personal-result URL.",
        "zh": "点击一次开始即进入第一条陈述，没有第二个同意页面。由成年人回顾本人，不要求身份、体重、食物数量、照片、日记或私人叙述。回答与记录只留当前页面内存，不保存草稿、不提交、不作问卷分析，也不生成个人结果地址。"
      },
      {
        "en": "Exit, retake, reload and leaving clear the record; copying shares only the public title and entry. Later category differences may reflect context, recall, interpretation or willingness to answer. There is no validated reliable-change threshold, target record or retake schedule, and no inference of recovery or treatment effect.",
        "zh": "退出、重做、刷新及离页会清除记录；复制仅含公开标题与入口。后来类别的不同，可能反映语境、回忆、理解或作答意愿的变化。没有经验证的可靠变化阈值、目标记录或重测日程，也不据此推断恢复或治疗效果。"
      }
    ]
  }
];

export const eatingExperiencesFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "What does this eating-experiences reflection provide?",
      "zh": "进食经历回顾会提供什么？"
    },
    "answer": {
      "en": "Five separate category records covering twenty original statements and five complete public guides. Individual choices remain visible, without points, a combined score, risk tier or diagnostic conclusion.",
      "zh": "围绕二十条原创陈述，提供五组独立类别记录与五篇完整公开指南，保留逐条选择，不生成点数、综合分数、风险档位或诊断结论。"
    }
  },
  {
    "question": {
      "en": "Do the categories count how often I had an experience?",
      "zh": "类别计数是在统计经历发生频率吗？"
    },
    "answer": {
      "en": "No. They count how many statements received each label. Four statements in a topic are not four episodes, days or symptoms. The options describe how a statement fits the recalled four weeks, without a frequency scale.",
      "zh": "不是。计数统计多少条陈述选了某个标签。同组四条不代表四次发作、四天或四种症状。选项描述陈述与回顾四周的符合情况，不是发生频率量尺。"
    }
  },
  {
    "question": {
      "en": "Does feeling unable to choose establish binge eating?",
      "zh": "感觉难以自主选择，就能确定暴食吗？"
    },
    "answer": {
      "en": "No. The statements retain a subjective sense of choice and related distress, without measuring food quantity or establishing a clinical episode. A concern can be discussed with a healthcare professional without this form giving it a diagnosis.",
      "zh": "不能。陈述保留主观选择感及相关不适，不测进食数量，也不确定临床发作。可以与医疗专业人士讨论顾虑，无需本题本先给出诊断。"
    }
  },
  {
    "question": {
      "en": "Does avoiding a food always fit the limiting-eating topic?",
      "zh": "避开某种食物，都算限制进食主题吗？"
    },
    "answer": {
      "en": "No. The statement’s reason and context matter. Availability, allergy management, religious practice and medical advice are not interchangeable with body-related worry or a binding rule. Use cannot judge or no relevant experience where appropriate.",
      "zh": "不是。需要看陈述询问的原因与语境。可获得性、过敏管理、宗教实践及医疗意见，不能与身体担忧或难以改变的规则互换。适当时可选无法判断或没有相关经历。"
    }
  },
  {
    "question": {
      "en": "Must I explain what trying to undo eating involved?",
      "zh": "需要说明试图抵消进食的具体做法吗？"
    },
    "answer": {
      "en": "No. The form asks no private narrative or named method. The guide discusses intention broadly without instructions, comparisons or targets. You do not need to change eating, rest or activity to answer.",
      "zh": "不需要。表单不要求私人叙述或具名方法。指南只宽泛讨论意图，不提供步骤、方法比较或目标；无需为了作答改变进食、休息或活动。"
    }
  },
  {
    "question": {
      "en": "Are cannot judge, no experience and withholding the same?",
      "zh": "无法判断、没有经历与不愿回答，是一回事吗？"
    },
    "answer": {
      "en": "They remain three separate unscored labels. They are not treated as does not describe or as missing zeros. Every statement may be withheld while the same five full readings remain available.",
      "zh": "三者分别保留为未计分类别，不当作不符合，也不按缺失零分补齐。每条都可保留回答，五篇完整读法仍然开放。"
    }
  },
  {
    "question": {
      "en": "Can I answer from observing a partner or child?",
      "zh": "能根据伴侣或孩子的表现代答吗？"
    },
    "answer": {
      "en": "This original form is for adults recalling their own experiences. Visible behaviour cannot establish another person’s thoughts or intention. It has no child, observer-rated or nutritional-assessment version.",
      "zh": "本原创题本供成年人回顾本人经历。可见行为不能确定别人的想法或意图。本版没有儿童、观察者评定或营养评估版本。"
    }
  },
  {
    "question": {
      "en": "Is it free, and can retaking measure recovery?",
      "zh": "是否免费，重做能衡量恢复吗？"
    },
    "answer": {
      "en": "All twenty statements, records and five full guides are free without registration. One start opens the first statement. Later differences are not a validated recovery measure, and support never depends on completing or retaking this form.",
      "zh": "二十条陈述、记录与五篇完整指南均免费，无需注册；点击一次开始即进入第一条。后来差异不是经验证的恢复指标，支持也不以完成或重做为条件。"
    }
  }
];

export const eatingExperiencesReadingSummaries: Record<string, Text> = {
  "body-thoughts-reading": {
    "en": "Separate appearance comparisons, personal worth, distress and interruption, without inspecting or judging the body.",
    "zh": "分别理解外表比较、自身价值、难受与活动被打断的经历，不检查或评判身体。"
  },
  "limiting-eating-reading": {
    "en": "Read the reason and context of a restrictive rule; distinguish body-related worry from practical or medical arrangements.",
    "zh": "结合原因与语境理解限制规则，区分身体相关担忧与现实、医疗安排。"
  },
  "loss-of-control-reading": {
    "en": "Explore the subjective sense of choice, related distress and concealment without inferring food quantity or a clinical episode.",
    "zh": "理解主观选择感、相关不适与隐瞒感，不推断进食数量或临床发作。"
  },
  "undoing-eating-reading": {
    "en": "Consider the intention to counteract eating in broad terms, without naming techniques or prescribing changes.",
    "zh": "宽泛理解抵消进食的意图，不列举具体方法或要求改变行为。"
  },
  "mental-space-reading": {
    "en": "Distinguish interruption, anticipation of meals and returning thoughts from ordinary food planning and responsibilities.",
    "zh": "区分注意被打断、提前为进食担忧及反复想起，与普通饮食安排和责任的差异。"
  }
};
