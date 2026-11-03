import type { Questionnaire } from "@/lib/questionnaires/types";

export const stressResponseLandingSections: Questionnaire["guide"] = [
  {
    "id": "stress-response-scope",
    "title": {
      "en": "Five recent response themes, not a hidden personality",
      "zh": "五类近期反应，不是隐藏人格"
    },
    "paragraphs": [
      {
        "en": "This original twenty-statement questionnaire asks how well descriptions fit situations from the past three months. Its five groups concern stepping away or postponing, tightening rules and checks, agreeing first to maintain harmony, explaining a position quickly, and saying less or holding back expression. Each group contains four statements and remains a separate record.",
        "zh": "这份20题原创问卷询问，描述与过去三个月具体情境有多符合。五组分别涉及退开或延后、收紧规则与检查、先答应以维持和气、快速解释立场，以及暂时少说或压住表达。每组四题，始终保留各自记录。"
      },
      {
        "en": "An exchange can include several of these responses in sequence. You might shorten a conversation, explain its background later and then review an arrangement. The form does not identify a single cause or establish whether the sequence helped. Read a result alongside what happened, the choices available and the consequences you can actually verify.",
        "zh": "一次交流可以先后包含几种反应，例如先缩短对话，之后解释背景，再回看安排。本页不识别唯一原因，也不判断这种顺序是否有帮助。阅读结果时，应结合实际经过、当时可选做法，以及能够核实的后续。"
      }
    ]
  },
  {
    "id": "stress-response-physiology",
    "title": {
      "en": "Stress-response research and a behavior questionnaire answer different questions",
      "zh": "压力反应研究与行为问卷，回答的问题不同"
    },
    "paragraphs": [
      {
        "en": "Kozlowska and colleagues’ 2015 review describes defensive responses to threat, including active fight or flight, freezing and other forms of immobility. Roelofs’ 2017 review distinguishes freezing from a merely passive absence of action and discusses animal and human research. These are accounts of defensive processes, not evidence that a brief behavior checklist can identify a person’s physiological state. [2][3]",
        "zh": "Kozlowska等人2015年的综述讨论威胁下的防御反应，包括主动战斗或逃跑、僵住及其他形式的不动；Roelofs在2017年区分了僵住与单纯被动不行动，并讨论动物和人类研究。这些是在解释防御过程，不证明简短行为问卷能够识别个人的生理状态。[2][3]"
      },
      {
        "en": "FermatMind does not record heart rate, movement, hormones, perceived threat or a clinical history. Its five editorial groups cannot be translated into fight, flight, freeze or fawn types. A postponed email is not a physiological flight measurement, and quiet speech is not a freezing diagnosis. The cited research supplies background distinctions, without validating these items or their group structure.",
        "zh": "费马不记录心率、动作、激素、威胁感或临床经历。五个原创题组不能换算成战斗、逃跑、僵住或讨好类型。延后邮件不是生理性逃跑测量，少说话也不是僵住诊断。引用研究提供概念背景，不验证这套条目或分组结构。"
      }
    ]
  },
  {
    "id": "stress-response-distance-checks",
    "title": {
      "en": "Stepping back and adding checks need their own context",
      "zh": "退开与增加检查，需要各自的情境"
    },
    "paragraphs": [
      {
        "en": "The first group concerns delaying a response, switching to unrelated tasks, shortening an exchange and canceling before deciding again. Those descriptions differ from staying present while speaking less. When recalling one event, distinguish what was postponed, how urgent it was, what information was available and whether a later arrangement was made.",
        "zh": "第一组涉及延后回应、转做无关任务、缩短交流，以及先取消再决定；它们不同于仍在现场但少说。回看一次事件时，可以区分延后了什么、是否紧急、当时有哪些资料，以及后来有没有重新安排。"
      },
      {
        "en": "The second group concerns specifying details, repeated checks and narrowing arrangements after disruption. Some checks may be required by a task or an approved procedure; others may be newly added. The questionnaire cannot decide which was necessary. A useful record separates the requirement, who had authority, what changed and any observed delay, without labeling a person as controlling or careless.",
        "zh": "第二组涉及指定细节、反复检查，以及变化后收紧安排。有些检查来自任务或正式程序，有些可能是新加的；问卷无法决定哪项必要。可分别记录要求、决定权限、具体变化和实际延迟，不给人贴控制欲强或粗心的标签。"
      }
    ]
  },
  {
    "id": "stress-response-harmony-explanation",
    "title": {
      "en": "Agreeing first and explaining first are different sequences",
      "zh": "先答应与先解释，是不同的互动顺序"
    },
    "paragraphs": [
      {
        "en": "The harmony group asks about agreeing before a plan is clear, saying that any option is fine, or settling the atmosphere before mentioning a limit. These choices do not establish why someone agreed or whether they freely wanted an arrangement. A response pattern cannot replace a person’s clear, current expression of willingness, refusal or a changed choice.",
        "zh": "维持和气组询问安排未清楚时先答应、先说都可以，或先安抚气氛再说明限制。这些描述不能确认为什么答应，也不能确认是否自由地愿意接受。反应记录不能替代当事人清楚、当下表达的愿意、拒绝或改变选择。"
      },
      {
        "en": "The explanation group asks about giving background, adding reasons, emphasizing completed work and establishing intent before checking an impact. An explanation may contain relevant facts, and a criticism may be mistaken. Look separately at what was said first, what was later clarified and what remained unanswered; the score cannot adjudicate responsibility or reveal an unconscious motive.",
        "zh": "快速解释组涉及补充背景、增加理由、强调已完成部分，以及先说明本意再核对影响。解释可以包含相关事实，批评也可能有误。可以分别看先说了什么、后来澄清什么、还有什么未回应；数值不裁定责任，也不揭示潜意识动机。"
      }
    ]
  },
  {
    "id": "stress-response-expression",
    "title": {
      "en": "Less expression does not establish less feeling",
      "zh": "表达减少，不等于感受减少"
    },
    "paragraphs": [
      {
        "en": "The final group concerns becoming quiet during conflict, holding back expression and tone, giving essential-only replies, or continuing without expressing a need. These are reported behaviors. They do not establish emotional absence, dissociation, a nervous-system shutdown or a particular diagnosis. Reduced expression and leaving an exchange can overlap without being the same event.",
        "zh": "最后一组涉及冲突时少说、压住表情语气、只回复必要信息，或继续完成事情却没有表达需要。这些是自报行为，不证明没有情绪、解离、神经系统关闭或某项诊断。减少表达与退出交流可以重合，但不是同一件事。"
      },
      {
        "en": "Gross and John’s 2003 paper studies reappraisal and suppression as distinct emotion-regulation processes, examining their associations across five studies. It illustrates the need to distinguish expression from experience; its measures and findings cannot be transferred to these four statements. Here, you can privately check whether expression resumed later and whether anything remained uncommunicated, without treating immediate expression as a required better outcome. [4]",
        "zh": "Gross与John在2003年的论文以五项研究考察重评与抑制两种不同情绪调节过程及其关联。这提示我们区分表达与体验，但其测量和发现不能直接转移到本页四条描述。可以私下核对后来是否恢复表达、有没有未说明的事项，不把立即表达设为必须达到的更好结果。[4]"
      }
    ]
  },
  {
    "id": "stress-response-numbers",
    "title": {
      "en": "What the sums and four-decimal means actually record",
      "zh": "原始和与四位小数均值，实际记录什么"
    },
    "paragraphs": [
      {
        "en": "Choose one of five agreement responses: does not fit at all (1), mostly does not fit (2), uncertain or depends (3), mostly fits (4), or fits very well (5). These are agreement anchors, not never-to-always frequency anchors. A 3 is a valid numeric choice that enters the calculation; it is neither a skipped answer nor proof of moderate intensity.",
        "zh": "五个选项依次为完全不符合（1）、比较不符合（2）、不确定或视情况（3）、比较符合（4）、非常符合（5）。它们是符合程度，不是从从不到总是的频率选项。3是参与计算的有效数字，既不是跳过，也不证明中等强度。"
      },
      {
        "en": "For each four-item group, add the values and divide by four. For example, 1, 2, 3 and 5 total 11 and produce 2.7500. Sums range from 4 to 20; means from 1 to 5. Four displayed decimals make the arithmetic visible, not psychologically precise to four decimal places. All twenty valid choices are required before any personal interpretation; there is no imputation, overall total, ranking or threshold.",
        "zh": "每组四项相加再除以4，例如1、2、3、5合计11，均值2.7500。原始和范围4—20，均值范围1—5。四位小数让算术清楚可查，不表示心理测量精确到四位。全部20题有效才提供个人解释；不补值、不合总分、不排名、不设阈值。"
      }
    ]
  },
  {
    "id": "stress-response-observation",
    "title": {
      "en": "Use a completed event rather than forcing a personal label",
      "zh": "回看已结束的事件，保留事实与未知"
    },
    "paragraphs": [
      {
        "en": "If you wish and it is safe, select one ordinary event that has already ended. Note the situation, your first response, any later change and a consequence you can verify. Keep a possible explanation separate from an observation: “I replied the next day” is different from “I was avoiding responsibility.” You can leave the reason unknown.",
        "zh": "如果愿意且安全，可以选一件已经结束的普通事件，记录情境、最初反应、后续变化和能核实的结果。把可能解释与观察分开：“我第二天才回复”与“我在逃避责任”不同；原因可以保留未知。"
      },
      {
        "en": "Safety, power, privacy, responsibilities and available time affect what can happen in an exchange. Leaving or saying less may concern protection rather than a communication failure. Nothing in a result requires confronting someone, reopening unwanted contact or altering a necessary procedure. An optional observation can remain incomplete or be skipped entirely.",
        "zh": "安全、权力、隐私、职责与可用时间都会影响交流中能做什么。离开或少说可能涉及保护，而非沟通失败。结果不要求你对抗他人、重新联系不愿接触的人，或改变必要程序。可选观察可以不完整，也可以完全跳过。"
      }
    ]
  },
  {
    "id": "stress-response-source-privacy",
    "title": {
      "en": "Original source, public guides and private answers",
      "zh": "原创来源、公开指南与私人回答"
    },
    "paragraphs": [
      {
        "en": "The earlier product used a personality-shadow name. The current page describes the behavior statements it actually contains. Pacifica’s library guide points to Jung’s writings about the shadow; a reading bibliography is not a scoring manual or evidence that this questionnaire assesses the unconscious. The original form and working English translation have not completed psychometric validation. [1]",
        "zh": "原产品曾使用人格阴影名称，当前页面按实际题目所描述的行为命名。Pacifica图书馆指南提供荣格关于阴影的阅读线索；书目不是计分手册，也不证明本问卷能评估潜意识。原创题本与英文工作译文尚未完成心理测量学验证。[1]"
      },
      {
        "en": "Start test opens the first statement directly. Answers and the personal record use current-page memory only and clear on reload, language change or leaving. Every full guide can be read without answering, signing in or paying. Copying shares only the five public guide links, not values or choices. General explanations are available before an attempt and do not contain any visitor’s personal record.",
        "zh": "点击开始直接进入第一条描述。回答与个人记录仅保留在当前页面内存，刷新、换语言或离开即清除。不作答、不登录、不付费也能阅读五篇全文。复制只分享五个公开指南链接，不含数值与选项。作答前即可阅读的通用说明不包含任何访客的个人记录。"
      }
    ]
  }
];

export const stressResponseLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Is this a fight, flight, freeze or fawn test?",
      "zh": "这是战斗、逃跑、僵住或讨好测试吗？"
    },
    "answer": {
      "en": "No. Its five groups summarize recent agreement with original behavior descriptions. They do not measure autonomic responses or map to four-F types. Similar everyday wording does not make the instruments equivalent. [2][3]",
      "zh": "不是。五组汇总对近期原创行为描述的符合程度，不测自主神经反应，也不映射四F类型；日常用词相似不意味着工具等同。[2][3]"
    }
  },
  {
    "question": {
      "en": "Do higher values show that I am more stressed?",
      "zh": "数值更高，说明我压力更大吗？"
    },
    "answer": {
      "en": "No. The form asks how well particular descriptions fit, not how many stressors you experienced or how severe distress was. There is no stress-severity total or population comparison.",
      "zh": "不能。题目问特定描述多符合，不问遇到多少压力源或痛苦多严重，没有压力严重度总分或人群比较。"
    }
  },
  {
    "question": {
      "en": "Why do the options ask about fit rather than how often?",
      "zh": "为什么选项问符合程度，而不是多常发生？"
    },
    "answer": {
      "en": "That is the original response format. Use the past three months to interpret each description; the numbers cannot be relabeled as counts or frequency categories.",
      "zh": "这是原题本的回答方式。请用过去三个月的经历理解每条描述，数字不能被改称发生次数或频率档位。"
    }
  },
  {
    "question": {
      "en": "Does 3.0000 mean the same thing for everyone?",
      "zh": "3.0000对每个人含义都一样吗？"
    },
    "answer": {
      "en": "No. Four uncertain-or-depends responses and the pattern 1, 5, 1, 5 have the same mean. Events and opportunities also differ. A shared arithmetic value does not establish shared motives, circumstances or a personality.",
      "zh": "不是。四项都选不确定或视情况，与1、5、1、5得到同样均值；事件与回应机会也不同。算术相同不证明动机、处境或人格相同。"
    }
  },
  {
    "question": {
      "en": "Can the five groups all fit one event?",
      "zh": "同一件事可以符合五组吗？"
    },
    "answer": {
      "en": "An event can involve several described actions in sequence. The form does not force an event into one group or select a dominant type. Check the actual sequence rather than combining numbers into a label.",
      "zh": "一件事可以先后包含几种题目描述的行动。本页不把事件强分到唯一组，也不选主导类型，应核对实际顺序，而不是把数字拼成标签。"
    }
  },
  {
    "question": {
      "en": "Does saying less show that I do not care?",
      "zh": "少说就说明不在意吗？"
    },
    "answer": {
      "en": "No. The question does not observe your feelings or establish a motive. Privacy, time, safety or needing to process information may matter, but the test cannot decide which explanation applies.",
      "zh": "不能。题目不观察内心感受，也不确定动机。隐私、时间、安全或整理信息的需要都可能有关，但测试不能决定哪种解释成立。"
    }
  },
  {
    "question": {
      "en": "Do four decimal places make the result especially accurate?",
      "zh": "四位小数说明结果特别准确吗？"
    },
    "answer": {
      "en": "No. With four integer responses, the mean changes in quarter-point steps. Four decimals are display formatting, not a confidence interval, measurement-error estimate or accuracy claim.",
      "zh": "不是。四项整数回答的均值按0.25变化；四位小数是显示格式，不是置信区间、测量误差估计或准确率声明。"
    }
  },
  {
    "question": {
      "en": "Must I sign an agreement or share an experience to begin?",
      "zh": "开始前必须签协议或分享经历吗？"
    },
    "answer": {
      "en": "No. Start test opens the first statement. No story, account or additional agreement is required. You can exit and read every public guide without receiving a personal record.",
      "zh": "不用。点击开始即进入第一条，不需要经历叙述、账户或额外协议。可以退出，不生成个人记录而直接阅读全部公开指南。"
    }
  }
];

export const stressResponseLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Kozlowska et al. (2015): review of fear and the defense cascade",
      "zh": "Kozlowska等（2015）：恐惧与防御级联综述"
    },
    "url": "https://pubmed.ncbi.nlm.nih.gov/26062169/"
  },
  {
    "title": {
      "en": "Roelofs (2017): freezing and action preparation, research review",
      "zh": "Roelofs（2017）：僵住与行动准备研究综述"
    },
    "url": "https://pubmed.ncbi.nlm.nih.gov/28242739/"
  },
  {
    "title": {
      "en": "Gross & John (2003): distinct emotion-regulation processes",
      "zh": "Gross与John（2003）：不同情绪调节过程"
    },
    "url": "https://pubmed.ncbi.nlm.nih.gov/12916575/"
  }
];
