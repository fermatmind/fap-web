import type { Text } from "@/lib/questionnaires/types";

/** Frontend explanation only; the original observation and guide source is preserved. */
export const caregiverContextSections: { id: string; title: Text; paragraphs: Text[] }[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Child focus and activity: four contexts seen by a caregiver",
      "zh": "儿童专注与活动：照顾者亲历的四类情境"
    },
    "paragraphs": [
      {
        "en": "Twenty original descriptions help an adult caregiver organise what they personally saw or heard over the past four weeks. Four topics each contain five observations: attention during shared activities, movement during activities, turns and starting steps, and observed context and available support. The record retains each selected label alongside the topic counts.",
        "zh": "二十条原创描述，帮助成年照顾者整理过去四周自己亲眼看到或亲耳听到的日常行动。共同活动中的注意、活动过程中的身体移动、轮流与开始步骤、观察到的情境与可用协助四个主题，各有五条观察。记录同时保留逐条选择和主题内的类别计数。"
      },
      {
        "en": "The topics organise reading rather than establish four independent developmental abilities. Returning after a reminder, requesting help and choosing an offered break remain visible alongside difficulties. The exercise does not rank a child, compare siblings or classmates, or judge the quality of caregiving. All four complete guides are open before answering.",
        "zh": "这些主题用于组织阅读，不确立四种独立的发展能力。提醒后返回、主动求助和选择已有的休息机会，与遇到困难的行动分别保留。练习不为孩子排名，不比较兄弟姐妹或同学，也不评价照顾质量。四篇完整指南均可在作答前阅读。"
      }
    ]
  },
  {
    "id": "direct-observation",
    "title": {
      "en": "One adult’s direct observations, with gaps left visible",
      "zh": "只记录本人直接观察，保留没有见到的部分"
    },
    "paragraphs": [
      {
        "en": "Recall ordinary situations that already happened; do not create a test for the child. A shared book, game or routine may provide an example, but the page does not require particular activities. Do not ask the child to demonstrate, remain still, repeat an event or meet a harder rule so that you can select a response.",
        "zh": "回忆已经发生的日常情境，无需为孩子另设测试。共同读书、游戏或日常安排可能提供实例，但页面不要求进行任何特定活动。不要为了选择答案，要求孩子演示、保持不动、重复事件或遵守更难的规则。"
      },
      {
        "en": "A teacher’s report may matter in a professional conversation, but it cannot fill a gap in your own direct observations here. Another caregiver can have a different view without either account being false. This single-observer record neither collects multiple informants nor establishes what happens across home and school.",
        "zh": "教师的报告可以成为专业沟通中的资料，但不能在这里填补本人未直接观察的部分。另一位照顾者可以有不同观察，而不必认定某一方说错。本记录只来自一名观察者，不收集多报告人信息，也不确定家庭与学校之间是否存在共同模式。"
      }
    ]
  },
  {
    "id": "labels-example",
    "title": {
      "en": "Six category counts, five descriptions: a worked example",
      "zh": "六类计数、五条描述：怎样核对记录"
    },
    "paragraphs": [
      {
        "en": "Each description has five observation-frequency labels, from not observed in a relevant situation to very often observed, plus an explicit unscored choice. Not directly observed, no relevant opportunity, unclear recall and withholding remain unscored. They do not become evidence that an action did not happen. The page cannot tell which reason led to an unscored choice.",
        "zh": "每条描述提供五种观察频率标签，从在相关情境中没有观察到，到经常观察到，另设明确的未计分选项。未直接观察、没有相关机会、回忆不清或保留回答，都保持未计分，不转成行动没有发生的证据。页面不能识别选择未计分的具体原因。"
      },
      {
        "en": "For one five-description topic, choosing sometimes, often, often, not observed in a relevant situation and unscored produces counts of 1, 0, 1, 2, 0 and 1 in the displayed category order. These counts add to five descriptions. They are not six points, incident counts, minutes, independent symptoms or the percentage of a child’s day. An entirely unscored topic still opens the same guide.",
        "zh": "例如，同一主题五条描述依次选择有时、较常、较常、在相关情境中没有观察到、未计分，则按页面类别顺序得到1、0、1、2、0、1，合计五条描述。这不是六个点数，不统计事件、分钟、独立症状或孩子一天的比例。整个主题均未计分，也可以阅读同一篇指南。"
      }
    ]
  },
  {
    "id": "actions-and-context",
    "title": {
      "en": "Movement, returning and asking for help retain their context",
      "zh": "把身体移动、返回活动和求助放回具体情境"
    },
    "paragraphs": [
      {
        "en": "A child can move part of their body while continuing an activity; a seated option does not imply that stillness was required. Looking away from a book does not establish that understanding stopped. Asking for a repeated instruction cannot identify whether the issue was hearing, wording, attention, memory or something else. The record does not choose a cause.",
        "zh": "孩子可以在身体某个部位移动时继续参与活动；有座位可选，不表示必须保持不动。视线离开书本，不确定理解已经中断。要求重复说明，也不能识别是听觉、措辞、注意、记忆还是其他原因。记录不在这些解释中作出选择。"
      },
      {
        "en": "Imagine a caregiver seeing a child reach for a game piece, then pause after a cue and later ask for help. These are separate observations, not a bad action cancelled by two good ones. Do not reverse-score supportive actions, subtract them from difficulties or remove an existing adjustment to test independence. A sequence alone does not show that a reminder caused a change.",
        "zh": "设想照顾者看到孩子伸手拿棋子，随后在提示后停下，后来又求助。这是不同的观察，不是一项坏行动被两项好行动抵消。支持性行动不反向计分、不从困难中扣除；也不要撤掉已有调整来测试独立程度。仅凭先后顺序，不能断言提醒造成了改变。"
      }
    ]
  },
  {
    "id": "scope-and-evidence",
    "title": {
      "en": "Original observation record and professional assessment answer different questions",
      "zh": "原创观察记录与专业评估分别回答什么问题"
    },
    "paragraphs": [
      {
        "en": "CDC explains that ADHD diagnosis involves several steps, consideration of other explanations and information about behaviour in different settings. This page supplies none of that clinical assessment. Twenty responses cannot establish or exclude ADHD, an attention disorder, an impulsivity subtype, developmental delay or a need for treatment. [1]",
        "zh": "CDC介绍的ADHD诊断涉及多个步骤、其他可能解释，以及不同环境中的行为信息。本页不提供这样的临床评估。二十个选择不能确定或排除ADHD、注意障碍、冲动亚型、发展迟缓或治疗需要。[1]"
      },
      {
        "en": "These are original FermatMind observations, not Vanderbilt, SNAP-IV, Conners, CHEXI or an adaptation of an adult questionnaire. Their published norms, response scales, age ranges and validation do not transfer here. This original form has no established age norms, clinical cutoff or English–Chinese measurement equivalence. Four weeks is its recall window, not a diagnostic duration.",
        "zh": "本题本是费马原创观察，不是Vanderbilt、SNAP-IV、Conners、CHEXI或成人问卷的改写。这些工具已发表的常模、作答尺度、年龄范围和验证结论，不能转用于本页。本原创题本尚无已建立的年龄常模、临床界值或中英文测量等值。四周只是回顾窗口，不是诊断期限。"
      }
    ]
  },
  {
    "id": "reading-library",
    "title": {
      "en": "Read all four guides alongside individual observations",
      "zh": "结合逐条观察，阅读四篇完整指南"
    },
    "paragraphs": [
      {
        "en": "The attention guide discusses shared activities and returning after a reminder. The movement guide keeps participation and movement together. The turns guide considers speaking, reaching, pausing and beginning a step. The context guide includes changes of plan, background activity, reminders and available assistance. No topic wins or becomes a child’s identity.",
        "zh": "注意主题讨论共同活动及提醒后返回；身体移动主题同时保留参与和移动；轮流主题涉及说话、伸手、暂停与开始步骤；情境主题包括计划变化、背景活动、提醒和可获得的协助。没有胜出的主题，也不将主题变成孩子的身份。"
      },
      {
        "en": "Each full guide includes topic-specific examples, category reading, limits of interpretation, support and privacy. Its public text is the same before and after answering and contains no visitor’s private record. A guide illustrates questions to discuss; it does not verify recall, determine what a child intended or prescribe a behaviour plan.",
        "zh": "每篇全文包含本主题的具体例子、类别读法、解释范围、支持与隐私。公开文本在作答前后相同，不包含访客私人记录。指南帮助形成可讨论的问题，不核实回忆、不确定孩子的意图，也不指定行为方案。"
      }
    ]
  },
  {
    "id": "support-and-next-steps",
    "title": {
      "en": "Discuss a concern without waiting for a count",
      "zh": "有疑问即可讨论，不必等到某个计数"
    },
    "paragraphs": [
      {
        "en": "If you are concerned about a child’s development or participation, you can speak with an appropriately qualified healthcare professional without finishing this page or reaching a frequent label. CDC recommends discussing developmental concerns with a healthcare provider. Bring your own concrete observations to that conversation; this website does not collect a private narrative. [1]",
        "zh": "若对孩子的发展或日常参与有疑问，无需完成本页或出现某种频繁标签，就可以与合适的医疗专业人士讨论。CDC建议有发展顾虑时与医疗专业人士沟通。可在沟通中描述自己见到的具体行动；本网站不收集私人叙述。[1]"
      },
      {
        "en": "Keep existing care and adjustments in place. This record cannot determine medical need or urgency, justify changing medicine, decide educational eligibility or measure a treatment response. A lower count on another occasion may reflect different opportunities, settings or recollections; it does not demonstrate recovery or improved development.",
        "zh": "保留已有照护与调整。记录不能决定医疗需要或紧急程度，不能作为改药、决定教育资格或衡量治疗反应的依据。另一次计数较低，可能来自不同的观察机会、环境或回忆，不证明恢复或发展进步。"
      }
    ]
  },
  {
    "id": "privacy-and-entry",
    "title": {
      "en": "Direct entry, private answers and stopping",
      "zh": "直接进入、私人回答与退出"
    },
    "paragraphs": [
      {
        "en": "One start opens the first observation without an additional agreement screen. The adult selects a category or explicitly leaves each description unscored. No child name, age, school, medical history, written account or uploaded document is requested. About five minutes is an estimate, not a time limit or a required observation session.",
        "zh": "点击一次开始即进入第一条观察，没有额外同意页。成年人逐条选择类别，或明确选择未计分。不要求孩子姓名、年龄、学校、病史、书面叙述或上传文件。约五分钟是阅读作答的估计，不是限时，也不要求专门安排观察时段。"
      },
      {
        "en": "Answers and the organised record stay in current-page memory. There is no draft storage, answer submission, questionnaire analytics or personal result address. Exit, retake, reload and leaving clear the record. Copying the public entry shares only its title and link; all four complete guides remain readable without private answers.",
        "zh": "回答与整理记录只在当前页面内存，不存草稿、不提交回答、不作问卷分析，也不生成个人结果地址。退出、重做、刷新和离页会清除。复制公开入口仅含标题与链接；没有私人回答，也始终可读四篇完整指南。"
      }
    ]
  }
];

export const caregiverContextFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "Is this a child ADHD test or an executive-function scale?",
      "zh": "这是儿童ADHD测试或执行功能量表吗？"
    },
    "answer": {
      "en": "No. It is an original adult-caregiver observation record with four editorial topics. It does not use a diagnostic cutoff, compare age norms or reproduce a published scale. ADHD assessment requires a professional process beyond these observations.",
      "zh": "不是。这是成年照顾者填写的原创观察记录，按四个编辑主题整理。不使用诊断界值、不比较年龄常模，也不复现已发表量表。ADHD评估需要超出本记录的专业过程。"
    }
  },
  {
    "question": {
      "en": "What ages can this record compare?",
      "zh": "可以比较哪些年龄的儿童？"
    },
    "answer": {
      "en": "None. This form has no established age norms or validated age-comparison range. A description that has no relevant observed opportunity can stay unscored. Do not borrow an age range from Vanderbilt, CHEXI or an adult form.",
      "zh": "不作年龄比较。本题本没有已建立的年龄常模或经验证的年龄比较范围。没有相关观察机会的描述可保持未计分，不借用Vanderbilt、CHEXI或成人题本的年龄范围。"
    }
  },
  {
    "question": {
      "en": "Does unscored mean I observed no difficulty?",
      "zh": "未计分表示没有观察到困难吗？"
    },
    "answer": {
      "en": "No. Unscored includes no direct observation, no relevant opportunity, unclear recall or withholding. Not observing an action in a relevant situation is a separate response. Neither an unscored record nor a low count rules out a concern.",
      "zh": "不是。未计分包括未直接观察、没有相关机会、回忆不清或保留回答。在相关情境中没有观察到行动，是另一个选项。全部未计分或低计数都不排除顾虑。"
    }
  },
  {
    "question": {
      "en": "Are returning after a reminder and moving while participating reverse-scored?",
      "zh": "提醒后返回、移动中继续参与，会反向计分吗？"
    },
    "answer": {
      "en": "No. Every original description keeps its own selected category. Supportive actions are not subtracted from difficulties, and stillness or independence is not a target outcome. The six counts in each topic add to five descriptions.",
      "zh": "不会。每条原创描述保留自己的类别选择。支持性行动不从困难中扣除，也不把静止或独立设为目标结果。每个主题六类计数合计五条描述。"
    }
  },
  {
    "question": {
      "en": "Should I ask the child to repeat an activity to check my answer?",
      "zh": "需要让孩子再做一遍来核对答案吗？"
    },
    "answer": {
      "en": "No. Recall only situations you already personally saw or heard. Do not require a demonstration, stillness, repetition or a harder task. If you cannot recall a relevant opportunity, choose unscored.",
      "zh": "不需要。只回忆自己已经亲眼看到或亲耳听到的情境，不要求演示、静止、重复或更难任务。回想不起相关机会时，选择未计分。"
    }
  },
  {
    "question": {
      "en": "Can two caregivers combine their records?",
      "zh": "两位照顾者能把记录合起来吗？"
    },
    "answer": {
      "en": "This page does not combine observers, resolve disagreements or create a home–school comparison. Each adult’s direct observations concern their own opportunities and setting. A professional may gather multiple accounts through a separate assessment.",
      "zh": "本页不合并观察者、不裁决分歧，也不生成家庭与学校比较。每名成年人的直接观察属于自己的机会和环境。专业人士可以在独立评估中收集多方资料。"
    }
  },
  {
    "question": {
      "en": "How much does it cost, and is another agreement required?",
      "zh": "是否收费，需要再点一次同意吗？"
    },
    "answer": {
      "en": "The twenty descriptions, category records and four complete guides are free without registration. One start opens the first observation; an explicit unscored response is available on every description. You can leave at any time.",
      "zh": "二十条描述、类别记录和四篇全文免费，无需注册。点击一次开始即进入第一条，每条均可明确选择未计分，也可随时离开。"
    }
  },
  {
    "question": {
      "en": "Will a retake show whether support worked?",
      "zh": "重做能看出支持是否有效吗？"
    },
    "answer": {
      "en": "No. The form has no established change threshold or treatment-response interpretation. Differences may reflect recall, opportunity or context. Do not change care, medicine or an existing adjustment because a category count changed.",
      "zh": "不能。本题本没有已建立的变化阈值或治疗反应解释。差异可能来自回忆、机会或情境。不要因为类别计数改变而调整照护、药物或已有支持。"
    }
  }
];
