import type { Text } from "@/lib/questionnaires/types";

/** Frontend explanatory copy; source statements and full readings remain unchanged. */
export const drinkingExperiencesSections: { id: string; title: Text; paragraphs: Text[] }[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Drinking experiences: plans, everyday effects, situations and the body",
      "zh": "饮酒经历回顾什么：计划、生活影响、情境与身体感受"
    },
    "paragraphs": [
      {
        "en": "This adult reflection organises twenty original first-person descriptions into four topics: plans and the pull to drink, effects noticed in everyday life, situations around drinking, and changes in bodily experience. Each topic contains five descriptions. Use the same past-four-week window throughout; the page asks how closely each sentence describes that period, without requesting quantities, names or a personal medical narrative.",
        "zh": "这项成年人自述练习以20条原创陈述，分别整理饮酒计划与牵引、日常生活中的影响、饮酒时的情境、身体感受的变化四个主题，每组五条。全程以过去四周为参照，判断每句话与这段时间的符合程度，无需填写摄入量、姓名或个人医疗经历。"
      },
      {
        "en": "Read the individual sentences as well as the category counts. A changed plan, a disagreement about an effect and uncertainty about a bodily change are different observations. Four side-by-side records keep those distinctions visible. They do not form a personality profile, an explanation of why someone drinks or a finding about whether drinking is safe.",
        "zh": "阅读时同时看逐条陈述和类别计数。计划发生变化、对某种影响存在分歧、不确定身体变化的关系，是不同观察。四份并列记录保留这些区别，不合成人格画像，也不解释饮酒原因或判断饮酒是否安全。"
      }
    ]
  },
  {
    "id": "four-week-window",
    "title": {
      "en": "One four-week window, without turning recollection into a drinking diary",
      "zh": "同一个四周窗口，保留回忆与实际情境的区别"
    },
    "paragraphs": [
      {
        "en": "Answer about yourself, using what you recall from the past four weeks. A sentence about going beyond an intended amount can fit one occasion or several; selecting it does not tell the page how many occasions occurred. An estimate of five minutes is reading time, not a timer, a required exposure to the topic or a reason to rush an uncertain answer.",
        "zh": "仅为自己作答，以记得的过去四周为参照。超过原计划饮酒量的描述，可能符合一次场合，也可能符合多次；选择它不会告诉页面发生了几次。约五分钟是阅读作答估计，不是计时限制，也不要求持续接触这个话题或匆忙判断不确定的题目。"
      },
      {
        "en": "No drinking, delay of a usual drink, change in intake or reenactment is needed to answer. You can read every public guide without using the form. Four weeks is the scope of this record, not the diagnostic period for alcohol use disorder and not a waiting period before seeking help for a current concern. [1]",
        "zh": "作答不需要饮酒、推迟平时会喝的酒、改变摄入或重现场合，也可不使用表单直接阅读所有公开指南。四周只是本记录的参照范围，不是酒精使用障碍的诊断时段，也不是有当前顾虑时必须等满的求助期限。[1]"
      }
    ]
  },
  {
    "id": "six-categories",
    "title": {
      "en": "Six separate descriptions, with no points or hidden midpoint",
      "zh": "六种类别分别保留，不加点数、不补中点"
    },
    "paragraphs": [
      {
        "en": "The first three categories mean does not describe, partly describes and describes my past four weeks. Cannot judge, no relevant experience and prefer not to answer are three additional, separate choices. These are description labels, not a never-to-always frequency scale. A partly fitting description is not assigned half a point; uncertainty is not converted to a negative answer, a midpoint or an assumed absence of concern.",
        "zh": "前三类分别是不符合、部分符合、符合过去四周的情况；另外独立保留无法判断、没有相关经历、不愿回答。这是描述类别，不是从“从不”到“总是”的频率量表。部分符合不记半分，未知也不转成否定回答、中点或没有顾虑。"
      },
      {
        "en": "For example, the five selections fits, partly, unsure, na and withheld produce six counts of 0, 1, 1, 1, 1 and 1 in the displayed category order. Their sum is five because five statements received labels. It does not mean five drinking episodes, five symptoms or a five-point score. A record containing only unknown, inapplicable or withheld choices is still complete once all twenty statements have a selection.",
        "zh": "例如，五条依次选择符合、部分符合、无法判断、没有相关经历、不愿回答，按页面类别顺序得到的六项计数为0、1、1、1、1、1；合计为五，是因为五条陈述都选择了类别，不是五次饮酒、五个症状或五分。20条均作选择后，即使全部为未知、没有经历或保留回答，也可完成记录。"
      }
    ]
  },
  {
    "id": "plans-effects",
    "title": {
      "en": "A plan mismatch and a life effect answer different questions",
      "zh": "计划偏离与生活影响，各自回答不同问题"
    },
    "paragraphs": [
      {
        "en": "The first topic distinguishes intended quantity, intended duration, attention returning to drinking, keeping a self-chosen limit and time used arranging a drink. The second concerns responsibilities, next-day activities, shared arrangements, disagreement about an effect and valued activities set aside. Similar counts can come from different sentences, so keep the original selections beside their explanation.",
        "zh": "第一组分别看原计划的量、时长、注意反复回到饮酒、自定限度的执行，以及安排饮酒占用的时间；第二组看责任、次日活动、共同安排、对影响存在分歧，以及搁置看重的活动。相同计数可能来自不同句子，因此应把逐条选择与对应解释一起阅读。"
      },
      {
        "en": "A chosen limit is something you remember deciding, not a consumption limit endorsed by this site. Keeping a plan cannot establish medical safety, and a changed shared arrangement cannot by itself establish an overall functional impairment or decide who was at fault. These descriptions can help name a specific concern without assigning a character label or a dominant theme.",
        "zh": "自定限度是你记得自己做过的安排，不是本站认可的摄入限额。按计划做不能确立医学上的安全，一项共同安排变化也不能单独确立整体功能受损或裁定谁有过错。描述可以帮助说清某项具体顾虑，无需据此贴品格标签或选出主导主题。"
      }
    ]
  },
  {
    "id": "situations-body",
    "title": {
      "en": "Separate safety context, bodily impressions and what remains unknown",
      "zh": "安全情境、身体印象与未知分别阅读"
    },
    "paragraphs": [
      {
        "en": "The third topic includes alertness-related responsibilities, uncertainty about medicine compatibility, a noticed safety concern, an unwanted effect and difficulty leaving a setting. The fourth includes perceived changes in alcohol’s effect, discomfort when a usual drink did not happen, hoping a drink would ease a bodily feeling, and uncertainty about their connection. Neither topic supplies a driving decision, medicine check or cause of symptoms.",
        "zh": "第三组包括需要清醒注意的责任、对用药相容性的未知、已注意到的安全顾虑、不希望的影响与难以离开场合；第四组包括酒精作用的主观变化、平时会喝却没喝时不适、希望靠饮酒缓解身体感受，以及不确定两者的关系。两组都不提供驾驶判断、药物核对或症状原因结论。"
      },
      {
        "en": "Needing more for a similar feeling and feeling less effect from the same amount may be overlapping recollections, not two independent medical findings. The final sentence asks about uncertainty; endorsing it does not establish a stronger bodily effect. There is no instruction to test alertness, mix alcohol with a medicine, reproduce discomfort or see whether another drink changes it.",
        "zh": "需要更多才能获得类似感受，与相同量感觉作用变弱，可能是重叠回忆，不是两个独立医学发现。最后一条问的是不确定，符合该句不表示身体作用更强。练习不要求测试清醒程度、尝试酒精与药物同用、重现不适，或看再喝一次是否改变不适。"
      }
    ]
  },
  {
    "id": "research-identity",
    "title": {
      "en": "Original reflection, clinical screening and diagnosis have different evidence requirements",
      "zh": "原创回顾、临床筛查与诊断，所需证据各不相同"
    },
    "paragraphs": [
      {
        "en": "The source contains original FermatMind statements and four original readings. It is not AUDIT, AUDIT-C or a DSM-5-TR symptom checklist. Clinical assessment considers the relevant history and context; NIAAA describes alcohol use disorder using a twelve-month clinical framework. This page’s four-week description labels cannot be counted as that framework’s symptoms or converted into a diagnosis. [1]",
        "zh": "题本由费马原创陈述和四篇原创读法组成，不是AUDIT、AUDIT-C或DSM-5-TR症状清单。临床评估需要相应病史与情境；NIAAA对酒精使用障碍的介绍采用十二个月的临床框架。本页四周内的描述类别，不能当作该框架的症状计数或换算成诊断。[1]"
      },
      {
        "en": "A clear recording rule makes the displayed counts reproducible. It does not establish reliability, validity, norms, sensitivity, specificity or English–Chinese measurement equivalence. Those properties need studies of this exact item set, response categories, language and intended use. Published evidence for a different instrument and public health references do not validate the present exercise.",
        "zh": "明确的记录规则使展示计数可以复算，但不会因此建立信度、效度、常模、敏感度、特异度或中英文测量等价。这些性质需要针对本题组、回答类别、语言和用途开展研究；其他工具的发表证据与公共健康资料，不能替本练习完成验证。"
      }
    ]
  },
  {
    "id": "private-use",
    "title": {
      "en": "Use one description for a private conversation, without ranking people",
      "zh": "以一条具体描述开启私下交流，不给人排名"
    },
    "paragraphs": [
      {
        "en": "If useful, identify one sentence you recognised and the part that remains unclear. You might choose to mention that concern in a private appointment; there is no need to give this site amounts, medicine names, a drinking diary or a detailed story. Concern about someone else belongs in an appropriate support conversation, not a record completed in their name or a judgement about their trustworthiness.",
        "zh": "若有帮助，可以先找一条认得出的描述，以及其中仍不清楚的部分；你可选择在私下咨询时提及该顾虑。无需向本站提供摄入量、药名、饮酒日记或详细经历。担心别人时，可在适当的支持交流中提出，不替对方填记录，也不据此判断其是否值得信任。"
      },
      {
        "en": "Answers and records stay in the current page’s memory. Exit, retake, refresh or leaving the page clears them; there is no saved draft or submitted answer record. Copy public entry contains only the title and public link. Repeating the exercise may reflect changed recall or circumstances; a count difference alone is not evidence of recovery, relapse or treatment effect.",
        "zh": "回答与记录只留当前页面内存；退出、重做、刷新或离开页面会清除，不保存草稿、不提交答卷。复制公开入口只包含标题和公开链接。再次作答可能反映回忆或情境变化，仅凭计数差异不能证明康复、复发或治疗效果。"
      }
    ]
  },
  {
    "id": "support-access",
    "title": {
      "en": "Support is available before, during and without the reflection",
      "zh": "开始前、作答中或不作答，都可以寻求支持"
    },
    "paragraphs": [
      {
        "en": "A concern can matter even with no fitting statement or an entirely unscored record. You do not need a minimum count, a complete form or an interpretation of the four themes before asking a qualified health professional about actual drinking or bodily symptoms. This page keeps the same support information visible regardless of your answers.",
        "zh": "即使没有符合项或全部未计分，实际顾虑仍可以被认真对待。询问合格医疗专业人士自己的饮酒或身体症状，不需要最低计数、完成表单或先解释四个主题。本页不因回答不同而隐藏支持信息。"
      },
      {
        "en": "Alcohol withdrawal can be dangerous. If dependence or withdrawal may be involved, seek medical advice before a sudden change in drinking; this exercise does not prescribe stopping, reducing, continuing or managing withdrawal yourself. An immediate danger or severe current symptoms require local emergency medical care rather than completion of this form. [1]",
        "zh": "酒精戒断可能危险。可能涉及依赖或戒断时，突然改变饮酒前应寻求医疗建议；练习不指派自行停酒、减量、继续饮酒或处理戒断。即时危险或当前严重症状需要当地紧急医疗照护，无需先完成表单。[1]"
      }
    ]
  }
];

export const drinkingExperiencesFaq: { question: Text; answer: Text }[] = [
  {
    "question": {
      "en": "Is this an alcohol addiction test or a drinking-quantity calculator?",
      "zh": "这是酒精成瘾测试或饮酒量计算器吗？"
    },
    "answer": {
      "en": "It is an original adult reflection on descriptions of drinking-related experiences. It collects neither dose nor standard-drink amounts and assigns no addiction probability, diagnosis, drinking allowance or risk band. Four topics organise words and category counts, not clinical criteria.",
      "zh": "这是成年人对饮酒相关经历的原创描述回顾，不收集摄入量或标准杯数量，不分配成瘾概率、诊断、饮酒限额或风险档位。四个主题整理的是陈述与类别计数，不是临床标准。"
    }
  },
  {
    "question": {
      "en": "Are the six answers a frequency scale?",
      "zh": "六个选项是频率量表吗？"
    },
    "answer": {
      "en": "No. The first three describe how well a sentence fits the past four weeks; the others preserve cannot judge, no relevant experience and prefer not to answer separately. None has points. Partly describes does not mean sometimes or half a clinical symptom.",
      "zh": "不是。前三类描述句子与过去四周的符合程度，另外三类独立保留无法判断、没有相关经历、不愿回答，所有类别都没有点数。部分符合不等于有时发生，也不是半个临床症状。"
    }
  },
  {
    "question": {
      "en": "Why keep the individual statements if category counts are shown?",
      "zh": "有类别计数，为什么还保留逐条陈述？"
    },
    "answer": {
      "en": "The same count can describe different experiences. A changed end time and difficulty leaving a setting are not interchangeable; two effect-change statements may overlap. Reading individual selections prevents a count from becoming an assumed number of episodes or independent symptoms.",
      "zh": "相同计数可能对应不同经历。结束时间改变与难以离开场合不能互换，两条作用变化描述也可能重叠。逐条阅读有助于避免把计数误当作发生次数或独立症状数量。"
    }
  },
  {
    "question": {
      "en": "Can I complete the reflection while keeping every experience private?",
      "zh": "可以保留所有经历不回答，仍然完成吗？"
    },
    "answer": {
      "en": "Yes. Choose prefer not to answer for each statement, or the appropriate uncertainty or no-experience category. All twenty selections complete the record. These categories remain separate and do not become a reassuring normal result. All four full guides are also readable without starting.",
      "zh": "可以。每条可选不愿回答，也可按实际情况选择未知或没有经历；20条均作选择后即可完成。类别各自保留，不转成令人安心的正常结论。也可不开始作答，直接阅读四篇完整指南。"
    }
  },
  {
    "question": {
      "en": "Do more fitting statements mean more severe drinking problems?",
      "zh": "符合的条目更多，就表示饮酒问题更严重吗？"
    },
    "answer": {
      "en": "No severity scale has been established for these statements. They differ in content and may refer to the same occasion. Counts cannot be added across topics, ranked, interpreted as a percentage of symptoms or compared with clinical cutoffs. An actual concern does not need a high count to deserve attention.",
      "zh": "这些陈述没有建立严重度量表，内容不同，也可能指向同一次场合。不能跨主题加总、排名、解释成症状百分比或对照临床界线。实际顾虑无需达到高计数才值得关注。"
    }
  },
  {
    "question": {
      "en": "Can bodily answers tell me whether I have tolerance or withdrawal?",
      "zh": "身体感受的回答能判断耐受或戒断吗？"
    },
    "answer": {
      "en": "No. They retain remembered impressions and uncertainty without establishing cause. Do not recreate symptoms, delay a usual drink or drink again to test an answer. Use qualified medical assessment for a bodily concern; possible dependence or withdrawal needs medical advice before a sudden change.",
      "zh": "不能。回答保留记得的印象与未知，不确立原因。不要为验证答案而重现症状、推迟平时会喝的酒或再喝一次。有身体顾虑应寻求合格医疗评估；可能涉及依赖或戒断时，突然改变饮酒前应先取得医疗建议。"
    }
  },
  {
    "question": {
      "en": "Does a not-fitting record clear me to drive or drink with medicine?",
      "zh": "全部不符合，就表示能驾驶或与药物同用吗？"
    },
    "answer": {
      "en": "No. The form calculates neither blood alcohol nor alertness, drug interactions or a legal limit. No answer pattern supplies safety clearance, and uncertainty about a medicine must not be converted into permission to try a combination.",
      "zh": "不表示。表单不计算血液酒精浓度、清醒程度、药物相互作用或法律限值。任何回答组合都不提供安全许可，对药物的未知也不能转成可以尝试同用。"
    }
  },
  {
    "question": {
      "en": "Should I compare my English and Chinese records or repeated results?",
      "zh": "中英文记录或多次回答可以直接比较吗？"
    },
    "answer": {
      "en": "Both languages use the same category-recording rules, but measurement equivalence and reliable change have not been established. Language interpretation, recall and circumstances can change selections. Keep any real concern specific; do not use a count difference to infer treatment success or failure.",
      "zh": "两种语言使用相同的类别记录规则，但尚未建立测量等价或可靠变化指标。语言理解、回忆和情境都会影响选择。应围绕具体顾虑交流，不凭计数差异推断治疗成功或失败。"
    }
  }
];
