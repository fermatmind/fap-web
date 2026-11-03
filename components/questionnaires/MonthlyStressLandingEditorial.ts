import type { Questionnaire } from "@/lib/questionnaires/types";

export const monthlyStressLandingSections: Questionnaire["guide"] = [
  {
    "id": "monthly-stress-scope",
    "title": {
      "en": "A brief monthly check-in about four selected experiences",
      "zh": "用四种选定体验，简短回看过去一个月"
    },
    "paragraphs": [
      {
        "en": "The four prompts concern competing demands that feel rushed, room for a settling pause, pressure to respond before thinking, and finding a manageable next step when plans become complicated. They cover selected experiences of pressure and room to respond. Four answers cannot comprehensively describe a month’s demands, their causes, symptoms or available support.",
        "zh": "四题分别涉及多项要求带来的急迫感、让自己稳下来的停顿空间、来不及思考就被催着回应，以及计划复杂时能否找到可做的下一步。它们选取受压与回应空间的体验；四个回答无法完整描述一个月的要求、原因、症状或可用支持。"
      },
      {
        "en": "Use the past month as you remember it now, rather than answering only about today or an imagined ideal month. The choices ask how often each situation occurred, not whether you agree with a personal trait. There is no timer and no desired answer. You can read the complete public guide without completing the form.",
        "zh": "按现在记得的过去一个月回答，而不是只看今天或想象中理想的月份。选项询问情况多常发生，不是是否认同某种人格特征。没有倒计时或理想答案；不完成问卷，也可以阅读完整公开指南。"
      }
    ]
  },
  {
    "id": "monthly-stress-pressure",
    "title": {
      "en": "Demand pressure and response pressure are not an event count",
      "zh": "任务急迫与回应催促，不等于事件数量"
    },
    "paragraphs": [
      {
        "en": "Prompts one and three address different situations. Several demands can compete for attention even when nobody asks for an immediate reply; a single request can feel rushed when there is little room to think. Read the wording separately instead of assuming that both questions describe exactly the same experience.",
        "zh": "第一题与第三题涉及不同情境。即使没人要求立即回复，多件事也可能争夺注意；即使只有一项要求，缺少思考余地时也可能感到急迫。应分别阅读措辞，不假定两题描述完全相同的体验。"
      },
      {
        "en": "In an invented example, a person may have many routine tasks but ample time to respond, while another faces one unfamiliar decision with an immediate deadline. The same questionnaire total cannot establish that their workload or needs are equal. The form collects frequency categories, not the number of demands or minutes spent responding.",
        "zh": "以虚构例子说明：一个人可能有许多常规任务，却有充分回应时间；另一个人可能只面对一个陌生决定，却必须马上作答。同一总分不能证明两人的工作量或需要相同。这里收集频率类别，不统计要求数量或回应花费的分钟数。"
      }
    ]
  },
  {
    "id": "monthly-stress-response",
    "title": {
      "en": "A pause and a next step describe opportunities as well as actions",
      "zh": "停顿与下一步，同时涉及机会和行动"
    },
    "paragraphs": [
      {
        "en": "Prompt two asks about making room for a pause that helped you settle. Prompt four asks about finding one manageable next step when plans became complicated. Answer the situations actually experienced. The questions do not test a coping skill under controlled conditions or separate personal choices from constraints on time, resources or safety.",
        "zh": "第二题询问能否留出有助于稳下来的停顿，第四题询问计划变复杂时能否找到一个可做的下一步。应按真实经历回答。题目没有在受控条件下测试应对技能，也没有把个人选择与时间、资源或安全条件的限制分离。"
      },
      {
        "en": "An original example is identifying one document you can finish after a plan changes, while other parts remain unresolved. That is one possible next step, not proof that the whole problem is manageable. A response of never to a pause item is likewise not a verdict about effort, resilience or willingness to help yourself.",
        "zh": "原创例子是：计划变动后，找到一份眼下能完成的文件，其他部分仍待解决。这只是一个可能的下一步，不证明整个问题都能处理。停顿题回答“从不”，也不代表对努力、韧性或自助意愿的裁定。"
      }
    ]
  },
  {
    "id": "monthly-stress-recipe",
    "title": {
      "en": "The exact total: first and third forward, second and fourth reversed",
      "zh": "准确总分：第一、第三题保留，第二、第四题反向"
    },
    "paragraphs": [
      {
        "en": "Each response is zero for never, one for rarely, two for sometimes, three for often or four for very often. For the first and third prompts, the contribution equals the chosen value. For the second and fourth, it is four minus that value. Add all four contributions to obtain an integer from zero to sixteen; no rounding or normalization is applied.",
        "zh": "选项为从不0、很少1、有时2、较常3、经常4。第一、第三题的贡献等于所选数字，第二、第四题为4减所选数字。四项相加得到0至16的整数，不做舍入或标准化。"
      },
      {
        "en": "For choices 3, 1, 2, 3, the calculation is 3 + (4 − 1) + 2 + (4 − 3) = 9. Reversal aligns the two response-space prompts with the disclosed sum. It does not establish that pressure and room to respond are one validated dimension, nor does a transparent formula supply evidence of measurement quality.",
        "zh": "选择3、1、2、3时，计算为3＋（4－1）＋2＋（4－3）＝9。反向使两道回应空间题与公开加总方向一致；它不证明受压与回应空间构成一个经过验证的维度，公式透明也不能代替测量质量证据。"
      }
    ]
  },
  {
    "id": "monthly-stress-patterns",
    "title": {
      "en": "The same total can summarize very different answers",
      "zh": "同一个总分，可以来自不同的回答"
    },
    "paragraphs": [
      {
        "en": "Choosing zero for every prompt gives eight, because the two reversed contributions are four. Choosing four throughout also gives eight, as does choosing two throughout. These patterns differ in both reported pressure and room to respond. Eight is only the arithmetic midpoint, not an established population average, an ideal target or a moderate-stress diagnosis.",
        "zh": "四题全选0得到8，因为两道反向题各贡献4；全选4也得到8，全选2同样得到8。这些模式在自报受压与回应空间上不同。8只是算术中点，不是已建立的人群平均、理想目标或中度压力诊断。"
      },
      {
        "en": "The minimum zero comes from 0, 4, 0, 4; the maximum sixteen comes from 4, 0, 4, 0. These endpoints describe this recipe’s possible answers. They cannot certify that a person has no concerns, cannot cope or requires a particular intervention. Read the four displayed contributions and a concrete scene alongside the sum.",
        "zh": "最低0来自0、4、0、4，最高16来自4、0、4、0。这些端点描述本算法可能的回答，不能证明一个人毫无困扰、无法应对或需要某项干预。可同时阅读四项贡献，并核对具体情境。"
      }
    ]
  },
  {
    "id": "monthly-stress-identity",
    "title": {
      "en": "An original four-item form is not standard PSS-4",
      "zh": "原创四题，与标准PSS-4是不同题本"
    },
    "paragraphs": [
      {
        "en": "FermatMind wrote these four prompts and their parallel English and Chinese wording. They are not the standard PSS-4 items or an authorized translation of that instrument. Similar recall periods and a zero-to-sixteen range do not make two forms interchangeable. CMU’s PSS resource also states that PSS is not diagnostic and supplies no score cutoffs. [1]",
        "zh": "费马独立编写这四道题及中英文对应措辞；它们不是标准PSS-4条目或该工具的授权译本。相似回顾时段和0至16分范围，不会使两种题本能够互换。CMU的PSS资源也明确说明PSS不用于诊断、不设分数分界。[1]"
      },
      {
        "en": "A study comparing two published four-item PSS versions examined how wording and the measurement model affect interpretation. [3] It did not study this FermatMind form. Its findings illustrate why the exact items, language, population and analysis matter; they cannot supply this original questionnaire with reliability, validity or norms that it has not established.",
        "zh": "一项比较两种已发表PSS四题版本的研究，考察了措辞及测量模型如何影响解释。[3] 它没有研究费马题本。这说明应核对具体条目、语言、人群和分析方式，不能为本原创问卷补上尚未建立的信度、效度或常模。"
      }
    ]
  },
  {
    "id": "monthly-stress-retest",
    "title": {
      "en": "Repeated monthly recall is not a daily stress monitor",
      "zh": "重复回顾一个月，不是每日压力监测"
    },
    "paragraphs": [
      {
        "en": "If you repeat the form after a few days, much of the remembered month overlaps. A different total may reflect a changed answer, a newly remembered event or a different reading of a prompt. This form has no established reliable-change threshold and cannot distinguish those possibilities or prove improvement from a small difference.",
        "zh": "间隔几天重做时，回想的月份大部分重叠。总分变化可能来自选择改变、想起新的事件或对题目理解不同。本题本没有已建立的可靠变化门槛，无法区分这些原因，也不能凭小差异证明改善。"
      },
      {
        "en": "If you choose to make a private note, record the date, the situation you recalled and which prompt changed rather than seeking a target score. No history or trend chart is stored by this page. Do not convert the total into a percentage of stress, compare it with another person’s PSS score or use it as a measure of treatment response.",
        "zh": "若自愿私下记录，可写下日期、想到的情境及哪道题改变，而不是追求目标分。本页不保存历史或趋势图。不要把总分换成压力百分比、与他人的PSS分数比较，或用作治疗反应指标。"
      }
    ]
  },
  {
    "id": "monthly-stress-privacy",
    "title": {
      "en": "Complete reading without an account, private score or required disclosure",
      "zh": "无需账户、私人分数链接或强制披露的完整阅读"
    },
    "paragraphs": [
      {
        "en": "All four valid choices are needed before a total appears. There is no scored skip, missing-answer replacement or partial total. If a prompt is unsuitable or you prefer not to answer, exit and read the same full public guide. Answers and results remain in current-page memory and clear on reload, language change or leaving; copying includes only the public guide title and URL.",
        "zh": "四题全部有效后才显示总分，没有计分跳题、缺答补值或部分总分。若题目不适合或不愿回答，可退出并阅读同一篇完整公开指南。回答和结果只留当前页面内存，刷新、换语言或离开会清除；复制只包含公开指南标题与地址。"
      },
      {
        "en": "WHO describes stress as a response to difficult situations and notes that people respond differently. [2] These four answers are not a symptom checklist, medical test or explanation for physical symptoms. Concerns and support needs do not have to reach a questionnaire cutoff to deserve attention; the complete guide is a reflection resource rather than a care decision.",
        "zh": "WHO把压力描述为面对困难情境的反应，并指出人们的回应各不相同。[2] 这四个回答不是症状清单、医学检查或身体症状解释。困扰与支持需要无需达到问卷分界才值得重视；完整指南提供回顾资源，不作医疗决定。"
      }
    ]
  }
];

export const monthlyStressLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "How is this different from a daily mood check?",
      "zh": "这与每天的心情记录有什么不同？"
    },
    "answer": {
      "en": "Each question refers to the past month as remembered today. It is not a daily rating, symptom diary or physiological measurement. Repeated answers a few days apart largely cover overlapping time.",
      "zh": "每题指现在记得的过去一个月，不是当日评分、症状日记或生理测量。间隔几天重做，大部分回顾时段仍然重叠。"
    }
  },
  {
    "question": {
      "en": "Why is answering never to everything not a zero?",
      "zh": "为什么四题都答“从不”不是0分？"
    },
    "answer": {
      "en": "The second and fourth prompts describe room to respond. Their contributions are four minus the selected value, so 0, 0, 0, 0 becomes 0 + 4 + 0 + 4 = 8.",
      "zh": "第二、第四题描述回应空间，贡献是4减所选值，因此0、0、0、0换算为0＋4＋0＋4＝8。"
    }
  },
  {
    "question": {
      "en": "What answers produce the endpoints?",
      "zh": "什么回答对应两端分数？"
    },
    "answer": {
      "en": "In question order, 0, 4, 0, 4 produces zero and 4, 0, 4, 0 produces sixteen. These are arithmetic endpoints, not proof of absent concerns or a clinical condition.",
      "zh": "按题目顺序，0、4、0、4得到0，4、0、4、0得到16。它们是算术端点，不证明毫无困扰或存在临床疾病。"
    }
  },
  {
    "question": {
      "en": "Does eight mean average or healthy stress?",
      "zh": "8分是否表示平均或健康的压力？"
    },
    "answer": {
      "en": "Eight is the midpoint of the possible range. There is no established reference sample or health threshold for this original form; several different answer patterns can produce eight.",
      "zh": "8是可能范围的中点。本原创题本没有已建立的参照样本或健康阈值，几种不同回答模式都可以得到8。"
    }
  },
  {
    "question": {
      "en": "Can I turn the total into a stress percentage?",
      "zh": "可以把总分换成压力百分比吗？"
    },
    "answer": {
      "en": "Dividing by sixteen only rescales the arithmetic. It does not yield a percentage of stress, a population percentile, a probability or a proportion of coping capacity.",
      "zh": "除以16只是重新缩放算术结果，不会得到压力百分比、人群百分位、概率或应对能力比例。"
    }
  },
  {
    "question": {
      "en": "Can this identify cortisol, burnout or an anxiety disorder?",
      "zh": "它能判断皮质醇、职业倦怠或焦虑障碍吗？"
    },
    "answer": {
      "en": "No. The four prompts contain no biological measurement, diagnostic interview or dedicated burnout assessment. The total cannot establish or exclude those outcomes.",
      "zh": "不能。四题不包含生物测量、诊断访谈或专门的职业倦怠评估，总分无法确立或排除这些情况。"
    }
  },
  {
    "question": {
      "en": "Will a lower score show that a pause strategy worked?",
      "zh": "分数降低能说明停顿方法有效吗？"
    },
    "answer": {
      "en": "Not by itself. There is no intervention study or validated change threshold for this form. A change in answers does not isolate the cause; any actual effect needs its own evidence.",
      "zh": "单凭分数不能。本题本没有干预研究或经过验证的变化门槛，回答改变不能分离原因，实际效果需要独立证据。"
    }
  },
  {
    "question": {
      "en": "Do I need a score before I can read the complete explanation?",
      "zh": "必须先有分数才能读完整解释吗？"
    },
    "answer": {
      "en": "No. The same complete public guide is available before answering. There is no registration, payment or required agreement between the start button and the first prompt.",
      "zh": "不需要。答题前就能阅读同一篇完整公开指南，开始按钮与第一题之间不要求注册、支付或勾选同意。"
    }
  }
];

export const monthlyStressLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Schmalbach et al. (2025): comparing two published PSS-4 versions, not the FermatMind form",
      "zh": "Schmalbach等（2025）：比较两种已发表PSS-4版本，非费马题本"
    },
    "url": "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2024.1479701/full"
  }
];

export const monthlyStressLandingDescription: Questionnaire["description"] = {
  "en": "Take four original prompts about the past month’s pressure and room to respond. Free 0–16 total, every item contribution and a complete guide, with transparent reverse scoring. No registration, diagnosis or score bands; distinct from standard PSS-4.",
  "zh": "用四道原创题回看过去一个月的急迫感与回应空间。免费查看0至16总分、逐题贡献和完整指南，反向计分透明；无需注册，不作诊断或分档，与标准PSS-4分开。"
};

export const monthlyStressLandingIntroduction: Questionnaire["introduction"] = {
  "en": "The Monthly Stress Check-In uses four original frequency questions about competing demands, a settling pause, pressure to reply and finding a manageable next step. It describes your recalled past month through those selected experiences. All four valid answers produce a disclosed zero-to-sixteen sum and the same complete public guide, with no severity bands. This is a FermatMind reflection form, distinct from standard PSS-4; it has not established psychometric reliability, validity or population norms.",
  "zh": "近一个月压力自评通过四道原创频率题，询问多项要求、稳下来的停顿、回应催促与可做的下一步，用这些选定体验描述你回想的过去一个月。四题全部有效后显示公开算法的0至16总分及同一篇完整公开指南，不按严重程度分档。这是费马原创回顾问卷，与标准PSS-4分开，尚未建立心理测量信度、效度或人群常模。"
};
