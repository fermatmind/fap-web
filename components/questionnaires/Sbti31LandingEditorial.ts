import type { Questionnaire } from "@/lib/questionnaires/types";
export const sbti31LandingSections: Questionnaire["guide"] = [
  {
    "id": "sbti31-purpose",
    "title": {
      "en": "What this SBTI test offers: one original Mini edition, 25 playful portraits",
      "zh": "这份SBTI测什么：小程序原31题与25种趣味画像"
    },
    "paragraphs": [
      {
        "en": "This is the web adaptation of FermatMind’s established Mini SBTI game. It preserves the thirty-one Chinese questions, their choices and order, the original calculation and twenty-five result codes. English is a working translation of this edition. The name SBTI alone does not identify one universal questionnaire, scoring method or result library.",
        "zh": "这是费马既有小程序SBTI玩法的网页适配，保留三十一道中文原题、选项与题序、原计算和二十五个结果代码，英文为本版工作译文。仅凭SBTI这个名称，不能确定各网站使用同一问卷、计分或结果库。"
      },
      {
        "en": "Complete the questions to see one selected portrait, fifteen model readouts and the complete associated explanation. All twenty-five public guides are also free before answering. Treat the humorous language as a way into a discussion of particular choices, not a standardized personality assessment or an instruction about who you must be.",
        "zh": "完成题目后可查看一个选中的画像、十五项模型读数及对应完整解释；二十五篇公开指南也可在作答前免费阅读。趣味语言可以开启对具体选择的讨论，不是标准化人格测量，也不规定你必须成为什么样的人。"
      }
    ]
  },
  {
    "id": "sbti31-answer",
    "title": {
      "en": "How to answer: choose the offered option, without performing the scenario",
      "zh": "作答方式：选择给定选项，无需实际体验情境"
    },
    "paragraphs": [
      {
        "en": "Read the original prompt and choose the one offered response closest to your view or imagined reaction. Some items use direct agreement and others use a short scenario, so the same option letter does not have one meaning across the bank. There are no correct answers or rewards for choosing a socially attractive portrait.",
        "zh": "阅读原题，从给定选项中选择最接近看法或想象反应的一项。有些题为直接认同，有些题为短情境，因此相同选项字母并不贯穿题本代表同一含义。题目没有正确答案，也不奖励选择看起来更受欢迎的画像。"
      },
      {
        "en": "This edition is untimed and requires one valid choice on every question before producing a result. You can go back and revise before the final submission, or exit and clear. No action described in a scenario has to be performed; a type name or scenario involving alcohol does not require drinking, and a relationship scenario does not require sharing another person’s information.",
        "zh": "本版不计时，每题有一项有效选择后才生成结果。最终提交前可返回修改，也可退出清除。无需实际执行题中行为；涉及饮品的情境或名称不要求饮酒，关系情境也不要求提供别人的资料。"
      }
    ]
  },
  {
    "id": "sbti31-values",
    "title": {
      "en": "From choices to fifteen model readouts: fixed contributions and transformations",
      "zh": "从选项到十五维读数：固定贡献与数值转换"
    },
    "paragraphs": [
      {
        "en": "Each chosen option contributes its predefined values to certain internal dimensions. The engine averages the contributions actually present for each dimension; a dimension receiving none retains the model default of fifty. These are game parameters, not measured population averages. The internal values are then combined and rounded into the fifteen displayed readouts.",
        "zh": "选中的每项把预设数值贡献给若干内部维度。引擎按各维度实际收到的贡献取均值，未收到贡献的维度保留模型默认值50。这些是玩法参数，不是测得的人群平均值。内部数值再经组合与取整，形成十五项显示读数。"
      },
      {
        "en": "For a fresh illustration of the S1 formula, internal stability 60, initiative 70 and signal sensitivity 40 give round((60 + 70 + (100 − 40)) / 3) = 63. The displayed bands are below 40, from 40 through 69, and 70 or more. A change from 69 to 70 changes a display band, not proof of a psychological transformation.",
        "zh": "另用S1公式举例：内部稳定值60、主动值70、信号敏感值40，得到round((60＋70＋(100－40))÷3)＝63。显示分段为低于40、40至69、70及以上。69变为70会改变显示分段，不证明心理特征发生了转变。"
      }
    ]
  },
  {
    "id": "sbti31-assignment",
    "title": {
      "en": "How the portrait is selected: reproducible assignment is not validated accuracy",
      "zh": "画像怎样分配：可复现不等于已经验证准确"
    },
    "paragraphs": [
      {
        "en": "The original rule compares the fifteen readouts with stored portrait patterns, using band mismatches and numerical distance, and includes a fixed assignment step based on the resulting values. It is therefore inaccurate to describe this edition as simply choosing whichever portrait is nearest. Nothing is newly drawn at submission: the same complete answers in the same edition reproduce the same result.",
        "zh": "原规则把十五维读数与存储的画像模式比较，使用分段不一致数与数值距离，并包含依据结果数值执行的固定分配步骤。因此不能把本版简化为“总是选最近的画像”。提交时不另行抽签，同一版本的相同完整答案会复现同一结果。"
      },
      {
        "en": "The match display is bounded between 52% and 96% by the original game. It is not the probability that the portrait is correct. Preset rarity is a stored value for a code, not an observed proportion of visitors or the world population. Neither a higher match number nor a rarer-looking label establishes greater ability, uniqueness or personal value.",
        "zh": "匹配展示值由原玩法限定在52%至96%，不是画像正确的概率。预设稀有度是某个代码的存储值，不是观察到的本站访客或全球人口比例。匹配值更高或标签看起来更稀有，都不证明能力、独特程度或个人价值更高。"
      }
    ]
  },
  {
    "id": "sbti31-groups",
    "title": {
      "en": "Five groups of names, not five validated psychological scales",
      "zh": "五组名称，不是五套经过验证的心理量表"
    },
    "paragraphs": [
      {
        "en": "The self group names self-esteem and confidence, self-clarity and core values; the emotion group names attachment security, emotional investment and boundaries and dependence. The attitude group names worldview, rules and flexibility, and meaning in life. In this game these labels organize derived readouts; they do not administer the published instruments that might study similarly named constructs.",
        "zh": "自我组命名为自尊自信、自我清晰度、核心价值；情感组命名为依恋安全感、情感投入度、边界与依赖；态度组命名为世界观倾向、规则与灵活度、人生意义感。在本玩法中，这些名称用于组织衍生读数，不代表施测研究同名概念的已发表工具。"
      },
      {
        "en": "The action group names motivational orientation, decision style and execution; the social group names social initiative, interpersonal boundaries, and expression and authenticity. Sharing labels such as attachment or self-esteem does not make the bank an attachment assessment or a self-esteem scale. Likewise, five groups of three readouts are not the five domains of a Big Five inventory.",
        "zh": "行动组命名为动机导向、决策风格、执行模式；社交组命名为社交主动性、人际边界感、表达与真实度。使用依恋、自尊等相近名称，不使题本成为依恋评估或自尊量表；五组、每组三项显示值，也不是大五人格问卷的五个领域。"
      }
    ]
  },
  {
    "id": "sbti31-read",
    "title": {
      "en": "Read a portrait in layers: humour, model explanation and concrete examples",
      "zh": "分层读画像：趣味叙事、模型解释与具体例子"
    },
    "paragraphs": [
      {
        "en": "Each guide keeps the original humorous portrait, fifteen model descriptions and supplementary observations. Separate a striking phrase from a claim about your life. BOSS does not certify leadership, POOR does not establish income, and SEXY does not assess appearance. Metaphors of low energy or shutdown do not identify a mental-health condition.",
        "zh": "每篇指南保留原趣味画像、十五维模型描述与补充观察。应把有冲击力的说法与对生活的事实判断分开：BOSS不认证领导力，POOR不确定收入，SEXY不评价外貌；低电量、停机等比喻不识别心理健康状况。"
      },
      {
        "en": "Pick one sentence that fits and one that does not, then recall a specific ordinary situation for each. You can enjoy, question or set aside a description. If a joke feels uncomfortable, stop reading or choose a different discussion topic; agreement with an insulting label is never necessary to use the page, and the label should not be imposed on someone else.",
        "zh": "可选一句符合与一句不符合的描述，各自回想普通具体情境。你可以觉得有趣、提出疑问，或直接放下。若某个笑话让你不舒服，可停止阅读或换话题；使用页面不需要认同贬损标签，也不应把标签强加给别人。"
      }
    ]
  },
  {
    "id": "sbti31-comparison",
    "title": {
      "en": "SBTI versus MBTI: compare the actual framework and edition",
      "zh": "SBTI与MBTI：比较实际框架与题本"
    },
    "paragraphs": [
      {
        "en": "The MBTI framework describes four preference pairs that combine into sixteen types; its publisher overview explains that structure. This SBTI edition instead runs its own game calculation over thirty-one choices and twenty-five stored portrait codes. A shared four-letter-looking label or similar everyday description does not supply a conversion between them.",
        "zh": "MBTI框架用四组偏好组合成十六种类型，提供方概览解释了该结构。本SBTI版则对三十一题选择运行自有玩法计算，分配到二十五个存储画像代码。字母外形相近或日常描述类似，不提供二者的换算关系。"
      },
      {
        "en": "Compare exact questions, scoring, language and evidence rather than the number of dimensions or how familiar a portrait feels. This website’s SBTI edition has not completed psychometric validation, local norms or cross-language equivalence research. Its deterministic software can be checked for consistency without turning its portraits into scientifically established types or hiring criteria.",
        "zh": "应比较确切题目、计分、语言与证据，而不是只比较维度多少或描述是否熟悉。本站SBTI版尚未完成心理测量验证、本地常模或跨语言等价研究。确定性软件可以核查一致性，但不能据此把画像变成已建立的科学类型或招聘标准。"
      }
    ]
  },
  {
    "id": "sbti31-privacy",
    "title": {
      "en": "Free full results, private answers and public-only guide sharing",
      "zh": "完整结果免费，私人作答与公开指南分享"
    },
    "paragraphs": [
      {
        "en": "The thirty-one questions, selected full result, fifteen readouts and all twenty-five guides are free without signup or a preceding MBTI test. Start 31 questions goes directly to question one, without a required agreement or activity-counting checkbox. Any other assessment is a separate optional step after the complete result, with no transfer of these answers.",
        "zh": "三十一题、本次完整结果、十五项读数及二十五篇指南全部免费，不需要注册或先做MBTI。点击开始31题直接进入第一题，不要求必选同意或使用计数复选框。完整结果后的其他测评是独立可选步骤，不传递本次答案。"
      },
      {
        "en": "This page keeps the private attempt only in its current memory, with no draft saving. Reloading, leaving, changing language, exiting or retaking clears it. Sharing copies a public portrait guide URL, not your answers, scores or an attempt identifier. Retesting can change the portrait if choices change, but that alone cannot establish a measured change in personality.",
        "zh": "私人作答仅留当前页面内存，不保存草稿；刷新、离开、换语言、退出或重测会清除。分享复制公开画像指南网址，不含你的答案、分数或作答标识。选择变化可能改变重测画像，但仅凭这一点不能确定测得了人格变化。"
      }
    ]
  }
];
export const sbti31LandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Why does this page have 25 profiles when other SBTI sites show 27?",
      "zh": "为什么本站25种，有的SBTI网站却写27种？"
    },
    "answer": {
      "en": "This page preserves the twenty-five codes in FermatMind’s established Mini edition. Other products may add different special types or use different banks and algorithms. A shared name does not make those inventories interchangeable; we do not add outcomes just to match another site’s count.",
      "zh": "本页保留费马既有小程序版的二十五个代码。其他产品可能增加不同特殊类型，或采用不同题本、算法。同名不使结果库互换，本页不为凑齐其他站点数量而增加结果。"
    }
  },
  {
    "question": {
      "en": "Does a 90% match mean the portrait is 90% accurate?",
      "zh": "匹配90%是否表示画像准确率90%？"
    },
    "answer": {
      "en": "No. It is a transformed game display within the original 52–96% range. The page has no study establishing that number as an accuracy probability, confidence level or population percentile.",
      "zh": "不是。它是原52%至96%范围内的转换显示值；本页没有研究把它建立为准确概率、置信水平或人群百分位。"
    }
  },
  {
    "question": {
      "en": "Are the lower, middle and higher bands diagnostic cutoffs?",
      "zh": "偏低、中段、偏高是诊断阈值吗？"
    },
    "answer": {
      "en": "No. They partition model readouts at 40 and 70. They are not clinical thresholds or age- or population-adjusted norms. A number divided by one hundred is not automatically a percentile or a measured strength.",
      "zh": "不是。它们按40与70切分模型读数，不是临床阈值，也不是按年龄或人群校正的常模。一个数以100为上限，不自动成为百分位或测得的能力强度。"
    }
  },
  {
    "question": {
      "en": "Can I unlock a result by drinking or trying something in a question?",
      "zh": "需要饮酒或实际执行题中行为来解锁结果吗？"
    },
    "answer": {
      "en": "No. Only choices on the page enter the calculation. There is no requirement to drink, spend money, perform an activity or disclose someone else’s information. Read the original scenario and choose an offered option, or exit if you do not wish to continue.",
      "zh": "不需要。计算只读取页面选项，不要求饮酒、花钱、实际执行活动或披露别人的信息。阅读原情境并选给定选项即可；不愿继续也可退出。"
    }
  },
  {
    "question": {
      "en": "Why can the same nickname give a different result on another website?",
      "zh": "为什么另一网站相同名字的结果不同？"
    },
    "answer": {
      "en": "Question wording, available options, order, mapping and result libraries may differ. Compare the specific edition before interpreting the difference. This page guarantees reproducibility for the same complete answers in this edition, not agreement with every site using the SBTI name.",
      "zh": "题目措辞、选项、题序、映射和结果库可能不同，应先核对具体版本再解释差异。本页可复现本版相同完整答案的结果，不承诺与每个使用SBTI名称的网站一致。"
    }
  },
  {
    "question": {
      "en": "Does a label reveal a diagnosis, income or relationship identity?",
      "zh": "标签能揭示诊断、收入或关系身份吗？"
    },
    "answer": {
      "en": "No. The names are humorous portraits, not findings about those facts. A similar word in a mental-health scale or a personality theory does not establish equivalent measurement. Use concrete experiences rather than a game code when discussing a real difficulty or decision.",
      "zh": "不能。名称是趣味画像，不是对这些事实的发现。与心理健康量表或人格理论用词相近，也不建立测量等价。讨论真实困难或决策时，应依据具体经历而不是游戏代码。"
    }
  },
  {
    "question": {
      "en": "Can I start directly, and is there a draft to restore?",
      "zh": "能否直接开始？有草稿可恢复吗？"
    },
    "answer": {
      "en": "Yes, the start button opens question one without required agreement. No draft is stored in this edition; leaving, refreshing or changing language clears the current attempt. Read the public guides first if you prefer not to answer.",
      "zh": "可以，开始按钮无需必选同意就打开第一题。本版不存草稿，离开、刷新或换语言会清除当前作答；若不想回答，可先读公开指南。"
    }
  },
  {
    "question": {
      "en": "Can I use an SBTI code to infer MBTI or choose a career?",
      "zh": "能用SBTI代码推断MBTI或选择职业吗？"
    },
    "answer": {
      "en": "There is no validated conversion here. The games, preference frameworks and occupational-interest tools ask different questions. Any later MBTI entry is separate and optional; no SBTI answer is sent to it and it does not certify this portrait.",
      "zh": "本页没有经过验证的换算。趣味玩法、偏好框架与职业兴趣工具询问不同问题。后续MBTI入口独立且可选，不接收SBTI答案，也不认证本画像。"
    }
  }
];
export const sbti31LandingReferences = [
  {
    "title": {
      "en": "Myers & Briggs Foundation: Myers-Briggs overview and four preference pairs",
      "zh": "Myers & Briggs Foundation：MBTI概览与四组偏好"
    },
    "url": "https://www.myersbriggs.org/my-mbti-personality-type/myers-briggs-overview/"
  }
];
