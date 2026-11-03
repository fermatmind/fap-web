import type { Questionnaire } from "@/lib/questionnaires/types";
export const imagery12LandingSections: Questionnaire["guide"] = [
  {
    "id": "imagery-reading-scope",
    "title": {
      "en": "Aphantasia test: observing voluntary visual imagery",
      "zh": "心盲症测试：观察主动视觉意象"
    },
    "paragraphs": [
      {
        "en": "When asked to imagine a scene, you may experience a visual picture, a faint impression or knowledge of what the description means. This page invites one comfortable attempt at twelve invented scenes. Report what you experience rather than what you think a good imagination should produce. There is no correct picture to reproduce.",
        "zh": "听到场景描述时，你可能体验到视觉画面、微弱印象，也可能只是知道描述的含义。本页邀请你舒适地尝试十二个虚构情境，报告实际体验，而不是猜测想象力好的人应当产生什么。没有需要复现的正确图片。"
      },
      {
        "en": "The twelve prompts and response descriptions are original FermatMind material. Four groups organize objects, fictional adult faces, places and pictured motion. They are not a shortened VVIQ or validated subscales. All four complete guides are free to read before answering and remain available when you skip.",
        "zh": "十二条题目与选项描述由费马原创，按物体、虚构成年人面孔、地点与运动画面分为四组。它们不是VVIQ短版或验证后的分量表。四篇完整指南在作答前免费可读，跳过题目后仍可查看。"
      }
    ]
  },
  {
    "id": "imagery-reading-experience",
    "title": {
      "en": "A mental picture is different from understanding the words",
      "zh": "脑中画面与理解文字不同"
    },
    "paragraphs": [
      {
        "en": "For the bowl with a blue dot, knowing that a bowl is round or that the dot is blue can help you understand the instruction. The rating instead concerns any pictured appearance you actually experience. You do not need an image projected into the room, a retinal afterimage or something visible against your closed eyelids.",
        "zh": "以带蓝点的碗为例，知道碗是圆的、点是蓝的，可以帮助理解说明；评分关注的是实际体验到的画面外观。不需要图像投射到房间里、产生视网膜后像，或在闭着的眼皮上看到东西。"
      },
      {
        "en": "Keep your eyes open or closed as feels comfortable. The page does not compare those conditions or standardize lighting. Do not keep straining until a particular option appears justified. If you tried and experienced no image, that is a report of the attempt, not evidence that you misunderstood the instruction or failed to cooperate.",
        "zh": "可舒适地睁眼或闭眼，本页不比较这两种条件，也不标准化光照。无需持续用力直到某个选项看起来合理。尝试后没有画面，是对这次尝试的报告，不表示没理解说明或没有配合作答。"
      }
    ]
  },
  {
    "id": "imagery-reading-contexts",
    "title": {
      "en": "Objects, faces, places and movement: what each group asks",
      "zh": "物体、面孔、地点与运动：各组具体问什么"
    },
    "paragraphs": [
      {
        "en": "Object prompts concern pictured shape, colour and features. Fictional adult-face prompts concern invented appearances rather than recognizing a real person. Place prompts concern pictured scenes and layouts, not whether you can describe where objects should be or navigate an actual route. Each group contains three original prompts.",
        "zh": "物体题关注想象中的形状、颜色与特征；虚构成年人面孔题关注创造出来的外观，不要求辨认真人；地点题关注脑中场景与布局，不评估能否说明物体应在何处或在实际路线中找路。每组包含三个原创情境。"
      },
      {
        "en": "Movement prompts ask about a visual impression of rotation, rolling or swaying. They do not ask you to move, judge a real motion display or rate bodily sensations. The four groups separate the topics used on this page; a difference between them does not establish four brain systems, abilities or fixed learning styles.",
        "zh": "运动题询问旋转、滚动或摆动的视觉印象，不要求实际动作、判断真实运动显示或评价身体感觉。四组只是区分本页题目主题，组间差异不能确立四种脑系统、能力或固定学习风格。"
      }
    ]
  },
  {
    "id": "imagery-reading-responses",
    "title": {
      "en": "Zero, a faint impression and a skip are different responses",
      "zh": "零、微弱印象与跳过是不同回答"
    },
    "paragraphs": [
      {
        "en": "Zero means that you made the attempt and had no visual image to rate. One describes a barely formed visual impression; two, an image with a few visible features; three, a fairly clear image with several features; four, a very clear and detailed mental image. Use these descriptions without converting them into percentages of normal vision.",
        "zh": "零表示已作尝试，但没有可评分的视觉画面。一表示很微弱的视觉印象；二表示少量可辨特征；三表示画面较清楚且有几种特征；四表示脑中画面很清楚、细节丰富。按这些描述作答，不把它们换算成正常视觉的百分比。"
      },
      {
        "en": "If you did not try, are unsure how to rate or prefer not to answer, choose the separate skip. A blank pauses progression so you can make an explicit choice. Skipping all twelve is allowed, and no explanation is requested. Uncertainty is not silently turned into either no imagery or a midpoint.",
        "zh": "没有尝试、不确定如何评分或不愿回答时，选择单独的跳过。留白时会暂停前进，让你明确选择；允许十二条全部跳过，无需说明原因。不确定不会被默认为没有意象，也不会被替换成中点。"
      }
    ]
  },
  {
    "id": "imagery-reading-scoring",
    "title": {
      "en": "Three responses per group: arithmetic and missing answers",
      "zh": "每组三个回答：算术与缺项处理"
    },
    "paragraphs": [
      {
        "en": "A group is scored only when all three responses are numeric. Add the selected zero-to-four values for a sum from zero to twelve, then divide by three for a mean from zero to four. For example, one, two and four produce seven divided by three, displayed as 2.33. The calculation has no reverse-keyed items.",
        "zh": "仅当一组三条都有数字回答时计分。把所选零至四数值相加，得到零至十二合计，再除以三，得到零至四均分。例如一、二、四得到七除以三，显示为2.33。没有反向计分条目。"
      },
      {
        "en": "Any skip withholds that group’s sum and mean; other fully answered groups remain available. Three zeros yield a real numeric zero, while a skipped group is unscored. No value is imputed and no overall total is formed. Averaging these ordered descriptions is a site summary rule, not a calibration of physical imagery strength.",
        "zh": "任一跳过会使所在组合计与均分暂不显示，其他完整组仍可查看。三个零会得到实际数字零，而包含跳过的组为未计分。不补值，也不形成整体总分。对这些有序描述求平均，是本站汇总规则，不是物理意象强度的校准。"
      }
    ]
  },
  {
    "id": "imagery-reading-evidence",
    "title": {
      "en": "Self-report and controlled laboratory findings answer different questions",
      "zh": "主观报告与受控实验回答不同问题"
    },
    "paragraphs": [
      {
        "en": "The cited 2024 systematic review identifies continuing questions about definition, measurement and explanatory theory. Zeman’s 2025 review also asks whether aphantasia is one entity and discusses variation within reported experience. Neither paper supplies validation for these twelve new prompts or a boundary that can classify this page’s visitors.",
        "zh": "所引二〇二四年系统综述指出，定义、测量与解释理论仍有待研究；Zeman二〇二五年综述也讨论心盲是否为单一对象及体验内部的差异。两篇论文都不验证本站十二个新情境，也不提供可用于分类本页访客的边界。"
      },
      {
        "en": "Kay and colleagues’ controlled pupil study examined responses during imagery and perception, providing physiological evidence relevant to reported imagery absence. This page does not reproduce that experiment: it has no pupil recording, controlled light stimuli or behavioural imagery task. A subjective response here therefore cannot be described as a laboratory confirmation.",
        "zh": "Kay等人的受控瞳孔研究考察意象与知觉过程中的反应，提供了与自报意象缺乏有关的生理证据。本页不复现实验，没有瞳孔记录、受控光刺激或行为意象任务，因此这里的主观回答不能称为实验确认。"
      }
    ]
  },
  {
    "id": "imagery-reading-interpretation",
    "title": {
      "en": "Read differences without inferring memory, creativity or a diagnosis",
      "zh": "阅读差异，不据此推断记忆、创造力或诊断"
    },
    "paragraphs": [
      {
        "en": "The four readings describe the choices made for these particular prompts. Even a complete set of zeros does not establish an aphantasia classification here. A very clear pictured scene does not establish memory accuracy, artistic skill or hyperphantasia. The questionnaire provides no population norms or threshold for either label.",
        "zh": "四组读数描述对这些特定题目的选择。即使全部为零，本页也不据此判定心盲；画面很清楚也不能确立记忆准确、艺术技能或超强意象。问卷不提供上述标签的人口常模或阈值。"
      },
      {
        "en": "These prompts ask for deliberate visual imagery while awake. They do not assess dreams, involuntary imagery, inner speech or imagery in sound, smell, taste or touch. A response in one area does not settle what you experience in another. English and Chinese equivalence and change measurement have not been established for this original edition.",
        "zh": "题目关注清醒时主动产生的视觉意象，不评估梦境、不自主意象、内在言语，或声音、嗅觉、味觉与触觉意象。一方面的回答不能决定另一方面的体验。本原创版本尚未建立中英文等值或变化测量证据。"
      }
    ]
  },
  {
    "id": "imagery-reading-use",
    "title": {
      "en": "Private exploration, complete guides and optional practical approaches",
      "zh": "私人探索、完整指南与可选实用做法"
    },
    "paragraphs": [
      {
        "en": "Start test opens the first prompt directly, without a required agreement or tracking opt-in. Anonymous activity counting is separately optional and off by default. Responses remain in page memory and clear on refresh, language change, leaving, exiting or retaking. Copying includes only the four public explanation links, without responses or numbers.",
        "zh": "开始测试直接打开第一条，无需额外同意或开启追踪。匿名动作统计另设可选项，默认关闭。回答仅留在页面内存，刷新、换语、离开、退出或重测会清除。复制只含四个公开解释链接，不含答案或数字。"
      },
      {
        "en": "If a task feels easier with written features, an external sketch or a visible layout, you may use that aid without needing a particular score. This is an optional approach to the task, not a proven imagery treatment or a prescribed learning style. If a change in your experience concerns you or affects daily activities, seek advice about the actual change rather than relying on this readout.",
        "zh": "若文字特征、外部草图或可见布局能让某项任务更容易，可以按需使用，无需达到某种分数。这是可选的任务做法，不是经证实的意象治疗或指定学习风格。若体验变化使你担心或影响日常，可围绕实际变化寻求意见，不依赖本页读数。"
      }
    ]
  }
];
export const imagery12LandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Can I understand a scene without picturing it?",
      "zh": "能理解场景却没有画面吗？"
    },
    "answer": {
      "en": "Yes. The instruction distinguishes knowing the description from having a visual experience. Rate the picture you actually experience, not the accuracy of your verbal understanding.",
      "zh": "可以。说明区分理解描述与体验视觉画面，应评价实际画面，不是文字理解是否准确。"
    }
  },
  {
    "question": {
      "en": "What does a zero mean on this page?",
      "zh": "本页的零表示什么？"
    },
    "answer": {
      "en": "You tried the scene and had no visual image to rate. It is a valid numeric response and is different from not trying or being unsure how to rate.",
      "zh": "表示已尝试该场景，但没有可评分画面；这是有效数字，与没有尝试或不确定如何评分不同。"
    }
  },
  {
    "question": {
      "en": "Why does one skip remove a group’s mean?",
      "zh": "为什么跳过一条，该组就没有均分？"
    },
    "answer": {
      "en": "Each group needs all three numeric responses under the site’s rule. No missing value is replaced or estimated; the full guide remains available.",
      "zh": "按本站规则，每组须有全部三个数字回答，不替换或估计缺失值；完整指南仍可读。"
    }
  },
  {
    "question": {
      "en": "How does one, two and four become 2.33?",
      "zh": "一、二、四怎样得到2.33？"
    },
    "answer": {
      "en": "The sum is seven. Dividing by three gives 2.333…; only the displayed mean is rounded to two decimal places. It is not 58 percent imagery.",
      "zh": "合计七，除以三得到2.333……，仅显示均分保留两位小数；它不是百分之五十八的意象。"
    }
  },
  {
    "question": {
      "en": "Does vividness tell me how accurate a memory is?",
      "zh": "清晰度说明记忆有多准确吗？"
    },
    "answer": {
      "en": "No memory accuracy task is administered. A pictured scene can feel clear without establishing that details match a real event.",
      "zh": "此处没有施测记忆准确性任务，场景感觉清楚也不证明细节符合真实事件。"
    }
  },
  {
    "question": {
      "en": "Does the movement group measure physical coordination?",
      "zh": "运动组测身体协调吗？"
    },
    "answer": {
      "en": "No. It asks about pictured movement. No actual motion, reaction time, motor performance or bodily imagery test is required.",
      "zh": "不测。它询问脑中运动画面，不要求实际动作，也不测反应时间、运动表现或身体意象。"
    }
  },
  {
    "question": {
      "en": "Can I convert this result to a VVIQ score?",
      "zh": "能把这里的结果换成VVIQ分数吗？"
    },
    "answer": {
      "en": "No. The prompts, anchors and grouping are different. There is no validated conversion or VVIQ cutoff on this page.",
      "zh": "不能。题目、选项与分组不同，本页没有经过验证的换算或VVIQ切点。"
    }
  },
  {
    "question": {
      "en": "Do I have to permit counting or supply a photograph?",
      "zh": "必须允许统计或提供照片吗？"
    },
    "answer": {
      "en": "No. Counting is optional and off by default; there is no photograph or camera step. Start test opens the first scene directly.",
      "zh": "不需要。统计可选且默认关闭，没有照片或摄像头步骤；开始测试直接打开第一个场景。"
    }
  }
];
