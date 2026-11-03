import type { Text } from "@/lib/questionnaires/types";

/** Explanatory UI copy; original observation and guide source remains unchanged. */
export const everydayWorrySections: { id: string; title: Text; paragraphs: Text[] }[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Everyday worry: thoughts, tension and ordinary activities",
      "zh": "日常担心回顾什么：想法、紧绷与日常活动"
    },
    "paragraphs": [
      {
        "en": "Twelve original adult observations organise a recent recollection into three topics: recurring worries, tension and restlessness, and worry during ordinary activities. Each contains four descriptions. You choose a frequency label for what you remember noticing over the past four weeks, or an explicit unscored response when an experience is absent, unclear or private.",
        "zh": "十二条成年人原创观察，将近期回忆整理为反复出现的担心、紧绷与坐立不安、日常活动中的担心三个主题，每组四条。以过去四周记得注意到的经历选择频率标签；没有相关经历、回想不清或希望保留回答时，可明确选择未计分。"
      },
      {
        "en": "The result is three separate category records with the individual observations still visible. Topic names help organise reading; they do not establish three independent psychological dimensions. The page has not observed your behaviour, measured your body or decided whether a concern is reasonable. All three complete guides can be read before any answers.",
        "zh": "结果是三份独立阅读的类别记录，逐条观察仍然可见。主题名称帮助组织阅读，不确立三个独立心理维度。页面没有观察行为、测量身体或裁定担心得是否合理。三篇完整指南均可在作答前阅读。"
      }
    ]
  },
  {
    "id": "recent-recall",
    "title": {
      "en": "A four-week recollection, not a diagnostic duration or daily monitoring task",
      "zh": "回顾过去四周，不将它当作诊断期限或逐日监测"
    },
    "paragraphs": [
      {
        "en": "Use the same recent window for all twelve observations. Recall the situations that are available to you without reconstructing every day, recording private thoughts or searching for stronger examples. About six minutes is an estimate for reading and answering; it is not a time limit, a required period of self-observation or a target to meet.",
        "zh": "十二条观察都使用同一个近期窗口。仅回忆目前能记起的情境，无需重建每一天、记录私人想法或寻找更强烈的例子。约六分钟是阅读作答的估计，不是限时、必须自我观察的时长或需要达到的目标。"
      },
      {
        "en": "The four-week window belongs to this original exercise. NIMH describes clinical assessment of generalized anxiety disorder as including duration, difficulty controlling worry, associated experiences and their impact. You do not need to wait for a clinical duration or complete this record before asking for help with a concern. [1]",
        "zh": "四周窗口属于本原创练习。NIMH介绍的广泛性焦虑障碍临床评估，会考虑持续时间、控制担心的困难、相关体验与生活影响。提出顾虑或寻求帮助，无需等满临床期限，也无需先完成本记录。[1]"
      }
    ]
  },
  {
    "id": "category-arithmetic",
    "title": {
      "en": "Six category counts describe four selected labels",
      "zh": "六类计数记录的是四条观察的选择"
    },
    "paragraphs": [
      {
        "en": "Did not notice, rarely, sometimes, often and very often are separate response labels. Unscored combines no relevant experience, cannot recall and prefer not to answer; the form does not infer which reason applies. A label that looks numeric in the implementation is not a point value. The recorder counts labels without adding them, taking a mean or selecting a highest topic.",
        "zh": "没有注意到、很少、有时、较常、经常是独立回答标签；未计分涵盖没有相关经历、无法回想、不愿回答，表单不推断具体属于哪个原因。实现中像数字的标签不代表点数。记录器分别统计标签，不相加、不求均值、不选择最高主题。"
      },
      {
        "en": "For example, four selections sometimes, often, often and unscored give counts of 0, 0, 1, 2, 0 and 1 in the displayed order. The total number of labelled descriptions is four. It is not four episodes, two days of worry, a symptom count or a proportion of your month. Often also has no fixed conversion into minutes or days.",
        "zh": "例如，四条分别选择有时、较常、较常、未计分，按展示顺序得到六类计数0、0、1、2、0、1。四表示四条描述都选择了标签，不是四次发作、两天担心、症状数或一个月中的时间比例。较常也没有固定的分钟或天数换算。"
      }
    ]
  },
  {
    "id": "concern-and-action",
    "title": {
      "en": "A recurring concern and an unresolved practical problem can coexist",
      "zh": "担心反复与实际问题尚未解决，可以同时存在"
    },
    "paragraphs": [
      {
        "en": "The first topic separates several worries drawing attention, a concern remaining after an available practical step, imagining an unfavourable outcome and difficulty turning to another activity. A returning thought does not tell the page whether missing information is still needed, a plan remains uncertain or someone else has replied. It cannot classify your concern as irrational or a failure of will.",
        "zh": "第一组分别看几项担心吸引注意、做了能做的实际一步后仍惦记、想到不利结果，以及难以转去另一项活动。想法再次出现，不会告诉页面是否仍缺信息、计划是否未定或别人是否回复。页面不能把顾虑归为不理性或意志不足。"
      },
      {
        "en": "Suppose an ordinary arrangement depends on a reply. The practical question and the repeated thought are two kinds of information. Even if you have done what was available, the form cannot declare the situation resolved or safe. A useful description can keep that uncertainty intact, without requiring another message, reassurance from someone or an experiment to settle it.",
        "zh": "例如，一项普通安排仍在等回复：实际问题与反复出现的想法是两类信息。即使已经做了当时能做的事，表单也不能宣布事情解决或安全。有用的描述可以保留这种未知，不要求再发消息、向别人寻求安心保证或用实验来确认。"
      }
    ]
  },
  {
    "id": "body-and-activities",
    "title": {
      "en": "Read bodily feelings, sleep and activity context without assuming one cause",
      "zh": "身体感受、睡眠与活动背景，分别阅读而不指定同一原因"
    },
    "paragraphs": [
      {
        "en": "The second topic concerns settling during a pause, unintentional muscle tension, wanting to move when an activity does not require it, and difficulty tolerating an interruption while tense. These are remembered experiences, not measurements of muscle activity, movement or patience. The page cannot distinguish their causes or establish that a bodily sensation is harmless or only anxiety.",
        "zh": "第二组涉及暂停时难以安定、并非有意的肌肉绷紧、活动不需走动时仍想动，以及紧绷时难忍打断。这些是记得的体验，不是对肌肉活动、走动或耐心的测量；页面不能区分原因，也不能建立身体感觉无害或只是焦虑。"
      },
      {
        "en": "The third topic puts worry beside attention to a chosen activity, settling for sleep, tiredness after tension and postponing an ordinary task. A remembered sequence is not proof that worry caused fatigue or delay. It does not establish insomnia, burnout, impaired ability or laziness. Workload, available information and other circumstances have not been assessed here.",
        "zh": "第三组将担心与所选活动的注意、准备安睡、紧绷后疲惫、推迟普通任务并列。记得的先后顺序不证明担心造成疲惫或延迟，也不确立失眠、倦怠、能力受损或懒惰。工作量、可用信息及其他情境并未在这里接受评估。"
      }
    ]
  },
  {
    "id": "instrument-and-evidence",
    "title": {
      "en": "Original observations and established instruments answer different questions",
      "zh": "原创观察与既有量表，题本和解释不能互换"
    },
    "paragraphs": [
      {
        "en": "This is not GAD-7, the Penn State Worry Questionnaire, the PTQ or PSS-4. Those named instruments have their own instructions, item sets and scoring methods. The separate PTQ on this site concerns typical repetitive thinking; this exercise records recent worry, tension and activities. Similar words do not make the forms interchangeable or allow one to supply another’s missing answers.",
        "zh": "本版不是GAD-7、宾州忧虑问卷（PSWQ）、PTQ或PSS-4。具名工具各有指示、题项与计分方法。本站另有PTQ，关注通常的重复思维；本练习记录近期担心、紧绷与活动。词语相近不代表题本可以互换，也不能用一份补另一份的缺失回答。"
      },
      {
        "en": "Reproducible category counts show that the recording rule was followed; they do not establish reliability, validity, clinical thresholds or English–Chinese measurement equivalence. Those claims need evidence for the actual language, items, response options, population and intended use. No clinical research on another questionnaire automatically validates these original groupings.",
        "zh": "计数可复算，说明记录规则得到了执行，不会因此建立信度、效度、临床界线或中英文测量等价。这些主张需要针对实际语言、题项、选项、人群与用途的证据。其他问卷的临床研究不能自动验证本原创分组。"
      }
    ]
  },
  {
    "id": "privacy-and-use",
    "title": {
      "en": "Keep a concrete question, with uncertainty and privacy intact",
      "zh": "留下具体问题，同时保留未知和私人边界"
    },
    "paragraphs": [
      {
        "en": "If useful, identify one ordinary activity, what you noticed and what you would like help understanding. You decide the detail and audience. No thought suppression, body checking, breathing, exposure, enforced stillness or reassurance exercise is required. You may stop with a short description, read a guide or leave without trying to reduce a count.",
        "zh": "若有帮助，可以指出一项普通活动、注意到什么，以及想请人帮助理解什么；细节和交流对象由你决定。不要求压制想法、检查身体、呼吸、暴露、强迫自己不动或寻求安心确认。可以只留一句简短描述、读指南或离开，无需努力降低计数。"
      },
      {
        "en": "Selections remain in current-page memory without a saved draft, answer submission, questionnaire analytics or a personal result address. Exit, retake, refresh and leaving clear the record. Copy public entry contains only the fixed title and link. Different later answers can reflect recall, opportunity or wording interpretation; they do not establish recovery, deterioration or treatment response.",
        "zh": "选择只留当前页面内存，不存草稿、不提交答卷、不作问卷分析，也无个人结果地址。退出、重做、刷新和离页会清除记录。复制公开入口只含固定标题与链接。之后回答不同，可能反映回忆、机会或措辞理解变化，不建立恢复、恶化或治疗反应。"
      }
    ]
  },
  {
    "id": "care-access",
    "title": {
      "en": "Support does not depend on a count, duration or completed form",
      "zh": "支持不取决于计数、持续时间或完成表单"
    },
    "paragraphs": [
      {
        "en": "You may ask a qualified healthcare or mental-health professional about a worry, bodily concern or change in ordinary activities without a completed record or proof of impairment. Clinical assessment can consider history and physical health as well as what you describe. This page cannot provide that assessment or determine the urgency of your situation. [1]",
        "zh": "对于担心、身体顾虑或日常活动变化，可直接咨询合格医疗或心理健康专业人员，无需先完成记录或证明功能受损。临床评估能结合你描述的经历、病史与身体健康；本页不能完成这种评估，也不能判断你当前情况的紧急程度。[1]"
      },
      {
        "en": "Keep existing professional advice and useful supports independent of any category. A small count, did not notice or an entirely unscored record is not a medical all-clear. Do not use this exercise to explain away a new concern, postpone assessment or change medicine. For an immediate danger or inability to stay safe, use local emergency assistance rather than continue the form.",
        "zh": "已有专业意见与有用支持，应独立于任何类别保留。少量计数、没有注意到或全部未计分，都不是医学上没有问题的结论。不要用练习解释掉新的顾虑、推迟评估或改变用药。有即时危险或无法保障安全时，请寻求当地紧急援助，而非继续表单。"
      }
    ]
  }
];

export const everydayWorryFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "What does this everyday-worry reflection actually produce?",
      "zh": "这份日常担心回顾实际会得到什么？"
    },
    "answer": {
      "en": "Three records, each retaining four individual observations and six category counts. All three full guides remain available. It does not produce a total, mean, dominant theme, anxiety severity, diagnosis or a judgement about your ability to cope.",
      "zh": "得到三份记录，每份保留四条观察的逐项选择与六类计数，三篇完整指南均可阅读。不产生总分、均值、主导主题、焦虑严重度、诊断或应对能力判断。"
    }
  },
  {
    "question": {
      "en": "Does often mean a fixed number of days in the past four weeks?",
      "zh": "过去四周的较常，等于固定几天吗？"
    },
    "answer": {
      "en": "No day-count conversion is defined. The labels describe your recollection; the counts show how many statements received each label. One often selection is one labelled observation, not a day, a minute, an episode or a clinical point.",
      "zh": "没有规定天数换算。标签描述你对经历的回忆，计数显示多少条陈述选择了该标签。一条较常是一条观察的选择，不是一天、一分钟、一次发作或一个临床点数。"
    }
  },
  {
    "question": {
      "en": "Is unscored the same as did not notice?",
      "zh": "未计分与没有注意到是一样的吗？"
    },
    "answer": {
      "en": "No. Unscored keeps no relevant experience, unclear recall or withholding visible without identifying the reason. Did not notice is a different selected label. Neither one supplies a clinical all-clear, and one cannot be estimated from other answers.",
      "zh": "不同。未计分保留没有相关经历、回想不清或不愿回答，不识别具体原因；没有注意到是另一种已选标签。两者都不提供医学上没事的结论，也不能靠其他答案估算。"
    }
  },
  {
    "question": {
      "en": "Can a recurring worry prove that I am being irrational?",
      "zh": "担心反复出现，就说明自己不理性吗？"
    },
    "answer": {
      "en": "No. The record cannot decide whether a practical problem remains unresolved, whether information is missing or what another person intends. Describing a returning thought does not require accepting a character judgement or proving the concern unnecessary.",
      "zh": "不能。记录无法判断实际问题是否尚未解决、信息是否缺失或他人意图。描述想法再次出现，无需接受品格判断，也不要求证明顾虑没有必要。"
    }
  },
  {
    "question": {
      "en": "Do tension and tiredness mean the worry caused physical symptoms?",
      "zh": "紧绷与疲惫表示担心造成了身体症状吗？"
    },
    "answer": {
      "en": "The form cannot establish cause. Remembered tension, restlessness and tiredness may be selected separately. It has no examination or health history and cannot rule out another explanation, declare a sensation harmless or substitute anxiety for a medical assessment.",
      "zh": "表单不能建立原因。记得的紧绷、想动与疲惫可以分别选择；这里没有体检或健康史，不能排除其他解释、宣布感觉无害，或用焦虑解释替代医疗评估。"
    }
  },
  {
    "question": {
      "en": "Can I use the activity topic as a concentration or sleep test?",
      "zh": "日常活动主题能当专注力或睡眠测试吗？"
    },
    "answer": {
      "en": "No performance task, sleep measurement or functional scale is used. The statements concern what you remember while doing or postponing an ordinary activity. They do not determine intelligence, work suitability, insomnia or why an activity was difficult.",
      "zh": "没有使用表现任务、睡眠测量或功能量表。陈述只涉及普通活动进行或推迟时记得的经历，不判断智力、工作适配、失眠或活动困难的原因。"
    }
  },
  {
    "question": {
      "en": "Can I fill this in for a partner, colleague or child?",
      "zh": "可以替伴侣、同事或孩子填写吗？"
    },
    "answer": {
      "en": "This original form is for an adult describing their own recollections. You cannot know another person’s private thoughts from observation alone. Concerns about someone else can be discussed through appropriate support without producing a record or label in their name.",
      "zh": "本原创题本供成年人描述自己的回忆。仅凭观察不能知道他人的私人想法；对别人的顾虑可通过适当支持交流，无需以对方名义生成记录或标签。"
    }
  },
  {
    "question": {
      "en": "Can English, Chinese and repeated records be compared as a progress score?",
      "zh": "中英文或多次记录能作为进步分数比较吗？"
    },
    "answer": {
      "en": "The recording rule is the same, but language equivalence and reliable change have not been established. Recall, circumstances and interpretation can affect selections. No target count or repeat schedule is prescribed; a difference alone cannot demonstrate treatment benefit or worsening.",
      "zh": "记录规则相同，但尚未建立语言等价或可靠变化指标。回忆、情境和理解会影响选择；没有目标计数或规定重测日程，仅凭差异不能证明治疗获益或恶化。"
    }
  }
];
