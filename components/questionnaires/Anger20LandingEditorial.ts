import type { Questionnaire } from "@/lib/questionnaires/types";

export const anger20LandingSections: Questionnaire["guide"] = [
  {
    "id": "anger-purpose",
    "title": {
      "en": "Anger and frustration: four separate response records",
      "zh": "愤怒与挫败自评：四组独立的反应记录"
    },
    "paragraphs": [
      {
        "en": "This adult reflection uses twenty original prompts to review ordinary situations over the past four weeks. Five prompts concern anger occurring; fifteen concern what you expressed, kept private or felt able to choose when already angry. The four complete guides and separate response records are free, without registration or another assessment.",
        "zh": "这份成年人回顾通过二十条原创描述，观察过去四周的普通情境。五条关注怒意出现，十五条关注已经生气时如何表达、保留感受，以及自感有哪些选择。四篇完整指南与四组独立记录免费提供，无需注册或先做其他测评。"
      },
      {
        "en": "Anger is an emotion, expression is a response, and aggression concerns behaviour; these words do not identify the same thing. The prompts do not exhaust triggers, bodily sensations, rumination, consequences or the circumstances of a disagreement. Their purpose is to organize specific recollections for reflection, not determine whether someone is an angry or dangerous person.",
        "zh": "愤怒是情绪，表达是回应，攻击涉及行为，这些词并不指同一件事。题目未穷尽诱因、身体感觉、反复思考、后果或分歧背景，目的是整理具体回忆供反思，不判断谁是易怒或危险的人。"
      }
    ]
  },
  {
    "id": "anger-topics",
    "title": {
      "en": "Occurrence, expression, privacy and perceived choice",
      "zh": "怒意出现、外显表达、保留感受与自感选择"
    },
    "paragraphs": [
      {
        "en": "Occurrence concerns anger or frustration in the ordinary situations named in the first five prompts. Outward expression includes a sharp voice, directly saying you are upset, visible wording, facial expression or gestures. A direct statement of feeling is not automatically aggression, poor regulation or a failed conversation; its wording, recipient and actual effects still matter.",
        "zh": "怒意出现关注前五条日常情境中的愤怒或挫败；外显表达涉及语气、直接说明不悦、消息措辞、表情或手势。直接表达感受不自动等于攻击、调节不佳或沟通失败，仍需看具体说法、对象与实际影响。"
      },
      {
        "en": "Kept-inside responses concern leaving feelings unspoken or maintaining privacy. This may reflect a deliberate choice, an unsuitable setting or limited room to speak; a mean cannot identify the reason. Perceived choice concerns feeling able to pause, delay a nonessential message or choose words. It records perceived options, not an observed test of control, communication skill or safety.",
        "zh": "保留感受关注不说出情绪或维持私人空间，可能来自主动选择、场合不合适或表达空间受限，均分不能识别原因。自感选择关注觉得可以暂停、延后非必要消息或选择措辞，记录的是自感选项，不是对控制力、沟通技能或安全的现场考核。"
      }
    ]
  },
  {
    "id": "anger-context",
    "title": {
      "en": "Use the correct occasion for each prompt",
      "zh": "每条题目按对应的机会作答"
    },
    "paragraphs": [
      {
        "en": "For the first five prompts, recall relevant ordinary situations during the past four weeks. For the remaining fifteen, recall occasions when you were already angry. Choose 0–4 from Never to Almost always on relevant occasions. If there was no relevant occasion, you are unsure or prefer not to answer, use the explicit unscored option rather than selecting zero.",
        "zh": "前五条回想过去四周相关日常情境；后十五条回想已经生气的场合。按有相关机会时，从未到几乎总如此选择0—4。没有相关机会、不确定或不愿回答时，使用明确的不计分选项，不用零代替。"
      },
      {
        "en": "Zero means the described response did not happen on relevant occasions. It is different from having no occasion to observe it. The first five answers do not automatically fill or skip the other fifteen: their situations do not cover every possible source of anger. You do not need to provoke anger, revisit distressing events or involve anyone else to complete this reflection.",
        "zh": "零表示有相关机会时未出现题述反应，与没有机会观察不同。前五条不会自动填入或跳过后十五条，因为这些情境没有覆盖所有可能的怒意来源。不需要为了完成回顾制造愤怒、重访痛苦事件或让其他人参与。"
      }
    ]
  },
  {
    "id": "anger-arithmetic",
    "title": {
      "en": "How five responses become one sum and mean",
      "zh": "五条回答如何形成一组合计与均分"
    },
    "paragraphs": [
      {
        "en": "Each topic has five direct items scored 0–4. Answers 0, 1, 2, 3 and 4 sum to 10 on a possible 0–20 range, with a displayed mean of 2.00 on the 0–4 response scale. These calculations summarize ordered frequency labels. They do not mean anger occurred on 50% of occasions, that you exceed half the population or that half your responses are well managed.",
        "zh": "每组五条直接题，数字为0—4。选择0、1、2、3、4，合计10（范围0—20），显示均分2.00（范围0—4）。计算概括有序频率标签，不表示50%的机会生气、不表示超过一半人群，也不表示一半回应处理得好。"
      },
      {
        "en": "The four topics stay separate. Perceived choice is not reverse-scored into a difficulty total, and expression is not subtracted from keeping feelings private. A higher number means a more frequent endorsement of that group’s descriptions within your recalled occasions. It is not a diagnosis, a risk band, a winner or a single index of anger severity.",
        "zh": "四组独立保留。自感选择不反向转换成困难总分，外显表达与保留感受也不相减。数字较高只表示在回想的相关机会中，更常认可本组描述，不是诊断、风险分档、主导类型或单一愤怒严重度指数。"
      }
    ]
  },
  {
    "id": "anger-missing",
    "title": {
      "en": "Skipped answers and incomplete groups remain visible",
      "zh": "不计分回答与不完整组怎样保留"
    },
    "paragraphs": [
      {
        "en": "A topic needs all five numerical answers to display its sum and mean. With 0, 1, 2, 3 and an unscored choice, it does not divide six by four, estimate a fifth response or count the skip as zero. It shows the response counts and keeps the full explanation. Other complete topics retain their own numbers.",
        "zh": "本组五条全部为数字才显示合计与均分。选择0、1、2、3及一条不计分时，不会把六除以四，不估算第五条，也不把不计分当零；会显示回答条数并保留完整说明。其他完整组仍显示自身数字。"
      },
      {
        "en": "You can explicitly choose the unscored option for all twenty prompts and still finish with all four guides. A blank is different: the page asks you to choose an answer or the unscored option before continuing. This policy keeps missing information visible; it does not establish a validated clinical rule for handling missing data.",
        "zh": "二十条全部明确选择不计分，仍可完成并获得四篇指南。空白不同：继续前需要明确选数字或不计分。这一政策让缺少的信息保持可见，不代表已经验证的临床缺答处理规则。"
      }
    ]
  },
  {
    "id": "anger-evidence",
    "title": {
      "en": "Research concepts and the evidence for this original edition",
      "zh": "研究概念与本原创版本的证据"
    },
    "paragraphs": [
      {
        "en": "The professional STAXI-2 distinguishes aspects of anger experience, expression and control; its publisher describes a fifty-seven-item instrument. That is background for understanding why anger is not one undifferentiated score. FermatMind’s twenty original prompts are not that instrument, an authorized translation or an equivalent short form, and do not use its norms or clinical interpretation.",
        "zh": "专业STAXI-2区分愤怒体验、表达与控制，出版方介绍的是五十七题工具。这提供理解愤怒并非单一分数的背景。费马二十条原创题不是该工具、授权译本或等值短版，不使用其常模或临床解释。"
      },
      {
        "en": "This four-week retrospective record also differs from a momentary state assessment and from a demonstrated stable trait. The present bilingual edition has no established reliability, factor structure, population norms, diagnostic accuracy or meaningful-change threshold. Transparent arithmetic and detailed prose make the output inspectable; they do not supply those missing measurement studies.",
        "zh": "四周回顾记录也不同于即时状态评估，或经证据支持的稳定特质测量。本双语版本尚未建立信度、因素结构、人群常模、诊断准确性或有意义变化阈值。透明计算与详细说明使结果可核查，但不能代替这些测量研究。"
      }
    ]
  },
  {
    "id": "anger-application",
    "title": {
      "en": "Turn one recollection into a concrete conversation",
      "zh": "把一段回忆转成具体的沟通问题"
    },
    "paragraphs": [
      {
        "en": "Choose an existing ordinary incident and describe what happened before the feeling, what you noticed, what you said or left unsaid, and what followed. For example: “When the plan changed, I felt frustrated and sent a short message. Next time, could we confirm the change before I respond?” This is a question to discuss, not a prescription generated from a score.",
        "zh": "选一件已经发生的普通事件，说明情绪前发生了什么、察觉到什么、说出或未说出什么，以及之后怎样。比如：“安排变化时，我很挫败，发了一条简短消息；下次能否先确认变化再回应？”这是可讨论的问题，不是分数生成的处方。"
      },
      {
        "en": "Keeping feelings private and expressing them directly can each serve different purposes. Ask whether a chosen response suited that situation and respected people’s boundaries, rather than aiming to maximize one mean or minimize another. A repeat record may differ because opportunities, stress or recollection changed; a changed mean alone does not establish improvement or deterioration.",
        "zh": "保留私人感受与直接表达各有不同用途。关注选定回应是否适合当时情境并尊重他人边界，不以提高某个均分或降低另一个为目标。重测可能因机会、压力或回忆变化而不同，均分变化本身不证明改善或恶化。"
      }
    ]
  },
  {
    "id": "anger-help-privacy",
    "title": {
      "en": "Actual impact, support and private answers",
      "zh": "实际影响、支持与私人回答"
    },
    "paragraphs": [
      {
        "en": "If anger is persistently disrupting daily life or relationships, seek advice about the actual difficulties rather than waiting for a questionnaire threshold. NHS guidance discusses recognizing anger and getting help when it is hard to cope. Threats, coercion or harmful actions require attention to those actions and circumstances; no result here can certify that a situation is safe.",
        "zh": "若愤怒持续影响日常生活或关系，应围绕实际困难寻求意见，不必等待问卷达到某个阈值。NHS资料讨论识别愤怒以及难以应对时寻求帮助。威胁、强迫或伤害行为需要针对实际行为与情境处理，本页任何结果都不能认证情境安全。"
      },
      {
        "en": "The page asks about your own recollections, not another person’s character or private history. Answers and response readings remain in page memory and clear on refresh, language change, leaving or retaking. Copying the public reading links does not share your answers or numbers. Optional anonymous action counts are separate, off by default and unnecessary for starting.",
        "zh": "本页询问自己的回忆，不评定他人品格或索取他人私人经历。回答与读数留在页面内存，刷新、换语言、离开或重测清除。复制公开指南链接不会分享你的回答或数字。可选匿名动作计数独立设置、默认关闭，不是开始的条件。"
      }
    ]
  }
];

export const anger20LandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Can I begin without accepting tracking?",
      "zh": "不接受统计也能开始吗？"
    },
    "answer": {
      "en": "Yes. Start test opens the first prompt directly. Optional anonymous action counts are off by default and do not include answers, sums or means.",
      "zh": "可以。开始测试直接进入第一题。可选匿名动作计数默认关闭，不包含回答、合计或均分。"
    }
  },
  {
    "question": {
      "en": "What should I choose if I was not angry?",
      "zh": "没有生气的场合应该怎么选？"
    },
    "answer": {
      "en": "For prompts about being already angry, choose the unscored option if no relevant occasion occurred. Zero means a response never occurred when the relevant occasion did occur.",
      "zh": "对于已经生气时的题目，没有相关场合可选不计分。零表示出现相关场合时从未有题述反应。"
    }
  },
  {
    "question": {
      "en": "Does openly saying I am upset mean aggression?",
      "zh": "直接说自己不悦就是攻击吗？"
    },
    "answer": {
      "en": "No. Outward expression includes several responses, including naming a feeling. Meaning depends on words, context and effects; the group does not classify aggression or interpersonal safety.",
      "zh": "不是。外显表达包含多种回应，包括说明感受。含义取决于说法、背景与影响，本组不分类攻击或人际安全。"
    }
  },
  {
    "question": {
      "en": "Does keeping anger private prove suppression is harmful?",
      "zh": "保留愤怒就能证明压抑有害吗？"
    },
    "answer": {
      "en": "No. The prompts record leaving feelings unspoken, not its cause, duration or health consequences. Deliberate privacy and constrained expression can look alike in a response count.",
      "zh": "不能。题目记录未说出感受，不测原因、持续时间或健康后果。主动保留隐私与表达受限可能出现相似计数。"
    }
  },
  {
    "question": {
      "en": "Is perceived choice an objective anger-control score?",
      "zh": "自感选择是客观愤怒控制分吗？"
    },
    "answer": {
      "en": "No. It records recalled feelings of having options. It does not observe behaviour, assess skill under pressure or certify a safe response.",
      "zh": "不是。它记录回忆中觉得拥有选项的体验，不观察实际行为、不考核压力下技能，也不认证回应安全。"
    }
  },
  {
    "question": {
      "en": "Is 10 out of 20 equal to 50% anger?",
      "zh": "10分满分20分等于50%的愤怒吗？"
    },
    "answer": {
      "en": "No. Five responses 0+1+2+3+4 give a sum of 10 and a mean of 2.00. Ordered response labels do not measure an emotion percentage or a population percentile.",
      "zh": "不是。五条回答0+1+2+3+4合计10、均分2.00。有序回答标签不测情绪百分比或人群百分位。"
    }
  },
  {
    "question": {
      "en": "Can four numerical answers produce a topic mean?",
      "zh": "四条数字回答能产生本组均分吗？"
    },
    "answer": {
      "en": "No. All five must be numerical. An explicit unscored response withholds only its own group’s numbers; all guides and other complete groups remain available.",
      "zh": "不能。五条都需为数字。明确不计分只使本组数字暂不显示，全部指南与其他完整组仍可阅读。"
    }
  },
  {
    "question": {
      "en": "Can this replace STAXI-2 or identify an anger disorder?",
      "zh": "能替代STAXI-2或识别愤怒障碍吗？"
    },
    "answer": {
      "en": "No. This is an independently authored adult reflection without diagnostic thresholds or equivalence to the professional instrument. Seek support according to actual impact, not these numbers.",
      "zh": "不能。这是独立编写的成年人回顾，没有诊断阈值，也未与专业工具建立等值。按实际影响寻求支持，不依赖这些数字。"
    }
  }
];
