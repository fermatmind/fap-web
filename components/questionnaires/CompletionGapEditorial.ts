import type { QuestionnaireSection, Text } from "@/lib/questionnaires/types";
type Editorial = { sections: QuestionnaireSection[]; faq: {question:Text;answer:Text}[]; references: {url:string;title:Text}[] };
export const completionGapEditorial: Record<string, Editorial> = {
  "flower": {
    "sections": [
      {
        "id": "flower-meaning",
        "title": {
          "en": "Flower personality: an authored metaphor, not a botanical diagnosis",
          "zh": "花朵人格：表达比喻与真实植物分开看"
        },
        "paragraphs": [
          {
            "en": "This flower quiz compares choices about expression, atmosphere and ordinary preferences. Rose, sunflower, lavender, lotus, orchid and daisy name six authored readings. A flower name is a way to discuss a scene, not a claim that a plant species corresponds to a stable human personality.",
            "zh": "这份花朵测试比较表达、氛围与日常偏好的选择。玫瑰、向日葵、薰衣草、莲花、兰花和雏菊，是六篇原创读法的名称。花名帮助讨论情境，不表示某种植物对应一种稳定的人格。"
          },
          {
            "en": "Botanical descriptions concern plants, whereas flower symbolism is culturally interpreted. RHS describes roses in many forms and colours; that diversity does not supply a psychological scoring key. No botanical feature, flower language or birth month validates these eighteen questions.",
            "zh": "植物学描述讨论植物，花的象征则经过文化解释。RHS介绍玫瑰的多样形态与颜色，这种多样性不提供心理计分键。植物特征、花语或出生月份，都不能验证本十八题。"
          }
        ]
      },
      {
        "id": "flower-six-ways",
        "title": {
          "en": "Six expressions, with a concrete contrast",
          "zh": "六种表达，用具体取舍理解"
        },
        "paragraphs": [
          {
            "en": "A carefully chosen message and an informal invitation can both express care. The rose reading can prompt a question about deliberate expression; sunflower about shared warmth; lavender about space and atmosphere. These are editorial prompts to compare with a real occasion, not evidence of emotional depth or popularity.",
            "zh": "精心选择的话语和随意的邀请都能表达关心。玫瑰读法可引出认真表达的问题，向日葵讨论共享温暖，薰衣草讨论空间与氛围。这些是供核对经历的编辑提示，不证明情感深度或受欢迎程度。"
          },
          {
            "en": "Lotus, orchid and daisy offer other ways to explore a scene without ranking flowers. Read each complete guide’s example and tradeoff: the same preference may help in one setting and matter less in another. You can disagree with a metaphor while still recognising the answer you selected.",
            "zh": "莲花、兰花和雏菊提供其他观察角度，不给花排高低。请一起看每篇全文的例子与取舍：同一种偏好可能在一个场景有用，在另一个场景不重要。可以认得自己的选择，同时不同意某个比喻。"
          }
        ]
      },
      {
        "id": "flower-counts",
        "title": {
          "en": "Eighteen choices: exposure, raw counts and highest ties",
          "zh": "十八次选择：出现机会、原始次数与最高并列"
        },
        "paragraphs": [
          {
            "en": "Every selected option adds one to its assigned flower. There are eighteen questions and each flower appears in twelve comparisons, so a flower’s raw count is 0–12 while all six selected counts sum to eighteen. A count describes choices within this bank, not a personality percentage.",
            "zh": "每个所选项给对应花朵加一次。共十八题，每种花参与十二次比较，因此单项原始次数0至12，六项合计十八。次数描述本题组内的选择，不是人格百分比。"
          },
          {
            "en": "All flowers sharing the highest count retain their full reports. For example, six counts of three produce a six-way tie. A lower count does not establish a missing trait, and a one-choice difference has no established measurement-error interpretation.",
            "zh": "同为最高的花均保留完整报告。例如六项各三次，会产生六项并列。较低次数不确定缺少某种特质，一次之差也没有已建立的测量误差解释。"
          }
        ]
      },
      {
        "id": "flower-application",
        "title": {
          "en": "From a flower label to a useful question",
          "zh": "把花名转成可讨论的问题"
        },
        "paragraphs": [
          {
            "en": "Instead of telling a friend “you are a rose,” describe what you observed: you chose a personal note rather than a group activity in that scene. Ask whether that fits their preference today. The person’s account takes precedence over an assigned metaphor.",
            "zh": "与其对朋友说“你就是玫瑰”，不如说明观察：那个场景里，你选了私人便条而不是集体活动。再问今天是否符合对方偏好。当事人的说明优先于比喻标签。"
          },
          {
            "en": "An optional experiment is to describe two ways of expressing the same ordinary message without buying flowers. Compare their timing, effort and the recipient’s wishes. This is a communication exercise, not a prescribed intervention or a predicted relationship outcome.",
            "zh": "可选小尝试是不买花，用两种方式表达同一条普通信息，比较时机、投入与接收者意愿。这是沟通练习，不是规定的干预，也不预测关系结果。"
          }
        ]
      },
      {
        "id": "flower-evidence",
        "title": {
          "en": "Scientific scope and complete free reading",
          "zh": "科学性范围与完整免费读法"
        },
        "paragraphs": [
          {
            "en": "FermatMind authored this symbolic preference bank. It has no established trait validity, reliability or population norms. Similar-looking flower quizzes can use different questions, matching algorithms and result sets; their methods or research cannot be transferred to this edition.",
            "zh": "本象征偏好题本由费马原创，尚未建立人格特质效度、信度或人群常模。外观相近的花朵测试可能使用不同题目、匹配算法与结果集合，其方法或研究不能转移给本版。"
          },
          {
            "en": "Start opens the first question directly; saving is optional. All six complete public guides can be read without completing or sharing the test. The result is not a birth-flower calculation, an MBTI conversion or a basis for hiring and clinical decisions.",
            "zh": "开始直接进入第一题，保存可选。六篇完整公开指南可以不完成、不分享就阅读。结果不计算生辰花，不换算MBTI，也不作为招聘或临床决策依据。"
          }
        ]
      }
    ],
    "faq": [
      {
        "question": {
          "en": "Is my favourite flower the expected answer?",
          "zh": "要选择最喜欢的花吗？"
        },
        "answer": {
          "en": "Choose the action or description in the question. Counts follow those choices; prior knowledge of flowers is unnecessary.",
          "zh": "请按题目选择行动或描述。次数来自这些选择，不需要认识花卉。"
        }
      },
      {
        "question": {
          "en": "Are traditional flower meanings universal personality traits?",
          "zh": "传统花语是普遍人格特质吗？"
        },
        "answer": {
          "en": "No. Symbolic meanings and psychological constructs are different. These six readings are authored metaphors, not a universal floral personality taxonomy.",
          "zh": "不是。象征含义与心理构念不同，六篇读法是原创比喻，不是普遍的花朵人格分类。"
        }
      },
      {
        "question": {
          "en": "Can all six flowers tie?",
          "zh": "六种花可以全部并列吗？"
        },
        "answer": {
          "en": "Yes. Three choices per flower sum to eighteen and retain six complete reports; the system does not randomly select one.",
          "zh": "可以。每种三次合计十八，保留六篇全文，不随机选一篇。"
        }
      },
      {
        "question": {
          "en": "Does a changed flower mean my personality changed?",
          "zh": "重测花名不同说明人格改变了吗？"
        },
        "answer": {
          "en": "Not by itself. Compare actual choices and context; this bank has no established retest-error or personality-change estimate.",
          "zh": "单凭它不能判断。应比较具体选择和情境，本题本尚无重测误差或人格变化估计。"
        }
      }
    ],
    "references": [
      {
        "url": "https://www.rhs.org.uk/plants/roses",
        "title": {
          "en": "RHS: roses as plants, not personality categories",
          "zh": "RHS：玫瑰植物特征，不是人格分类"
        }
      }
    ]
  },
  "chakra": {
    "sections": [
      {
        "id": "chakra-symbols",
        "title": {
          "en": "Seven chakra symbols and seven everyday themes",
          "zh": "七个脉轮意象与七个日常主题"
        },
        "paragraphs": [
          {
            "en": "This edition uses chakra names as cultural symbols for seven authored reflections: steadiness, enjoyment and making, choosing action, care, expression, perspective and meaning. It asks about the past two weeks. The themes do not define the full range of Hindu, Buddhist or contemporary chakra traditions.",
            "zh": "本版把脉轮名称作为文化意象，组织安顿、兴趣创作、自主行动、关心、表达、视角与意义七种原创反思，回看过去两周。这些主题不定义印度教、佛教或当代脉轮传统的全部内容。"
          },
          {
            "en": "Cleveland Clinic distinguishes chakra beliefs from established physical science and discusses metaphorical use. That overview is context, not validation of this questionnaire. A statement about planning a break records a reported action; it cannot locate or detect bodily energy.",
            "zh": "Cleveland Clinic区分脉轮信念与已建立的物理科学，并讨论其比喻性用途。该概述提供背景，不验证本站问卷。关于安排休息的回答记录行动自述，不能定位或探测身体能量。"
          }
        ]
      },
      {
        "id": "chakra-observation",
        "title": {
          "en": "Observe actions rather than infer a blockage",
          "zh": "观察行动，不推断堵塞"
        },
        "paragraphs": [
          {
            "en": "For the root theme, recall an actual small plan for a meal or a break. For the throat theme, recall whether you stated a preference. These are different observations with different opportunities; a low response may reflect limited opportunity or an unsuitable context.",
            "zh": "海底轮主题可回想一次吃饭或休息的小计划，喉轮主题可回想有没有说出偏好。这是不同的观察，也受不同机会影响；较低回答可能涉及机会不足或情境不适合。"
          },
          {
            "en": "No symptom is decoded into a chakra result. The seven guides do not prescribe breathing, movement, substances or treatment. A person may use the symbols in a personal practice, but this website does not test spiritual achievement or the correctness of a belief.",
            "zh": "不把症状解码成脉轮结果。七篇指南不规定呼吸、动作、物质或治疗。个人可把意象用于自己的实践，但本站不测试灵性成就或信仰是否正确。"
          }
        ]
      },
      {
        "id": "chakra-arithmetic",
        "title": {
          "en": "Separate means, reverse items and unavailable responses",
          "zh": "独立均分、反向题与不可评分"
        },
        "paragraphs": [
          {
            "en": "Each theme has four items rated 1–5. Its fourth item is reverse-keyed: subtract the response from six. At least three numeric responses are needed for that theme’s mean; use only rated keyed values as the denominator. For keyed values 4, 3 and 5, the mean is 4.0.",
            "zh": "每组四条，评分1至5，其中第四条反向：用6减回答。每组至少三条数字回答才给均分，分母只包含已评分、键向处理后的条目。处理后为4、3、5时，均分4.0。"
          },
          {
            "en": "An unavailable response is not zero. With only two rated items, the group displays insufficient information while other eligible groups remain. Seven means are not summed into a balance score; equal means are not an ideal profile or evidence of open chakras.",
            "zh": "不可评分不是零。仅两条有效时，该组显示资料不足，其他合格组保留。七项均分不汇总成平衡分；同分不代表理想画像或脉轮开启。"
          }
        ]
      },
      {
        "id": "chakra-context",
        "title": {
          "en": "Compare occasions before comparing numbers",
          "zh": "比较数字前，先比较情境"
        },
        "paragraphs": [
          {
            "en": "The same person may report a different frequency when work demands, social opportunities or access to a quiet space change. Record one supporting occasion and one exception for a theme. A mean cannot identify which circumstance caused a response.",
            "zh": "工作要求、社交机会或安静空间的可获得性改变时，同一个人的自报频率也可能不同。可为一个主题记下一次符合经历与一次例外，均分本身不能识别回答的原因。"
          },
          {
            "en": "If you retake, keep the two-week reference period explicit. Overlapping periods are not independent observations. This edition has no established reliable-change threshold, so a decimal difference should not be described as recovery or deterioration.",
            "zh": "重测时明确两周参照期；重叠时间段不是独立观察。本版未建立可靠变化阈值，小数差异不应称为恢复或恶化。"
          }
        ]
      },
      {
        "id": "chakra-scope",
        "title": {
          "en": "Full guides, cultural respect and evidence limits",
          "zh": "完整指南、文化尊重与证据边界"
        },
        "paragraphs": [
          {
            "en": "Each guide remains available at every score, including insufficient-information results. Read the example, counterexample and optional observation without treating one group as your identity. No highest-chakra assignment or energetic diagnosis is produced.",
            "zh": "任何分数及资料不足结果都能阅读各篇全文。一起看例子、反例和可选观察，不把某一组当身份。不派发最高脉轮类型，不作能量诊断。"
          },
          {
            "en": "The original items and Chinese and English presentation lack established psychometric validation and cross-language equivalence. Reading about a cultural system does not supply such evidence. The separate energy-flow product uses a different bank and must not be substituted for these seven themes.",
            "zh": "原创条目及中英文呈现尚无已建立的心理测量验证与跨语言等值。文化系统介绍不能提供此类证据。另一个energy-flow产品采用不同题本，不能代替本七主题。"
          }
        ]
      }
    ],
    "faq": [
      {
        "question": {
          "en": "Why does this chakra test ask about daily actions?",
          "zh": "为什么脉轮测试问日常行动？"
        },
        "answer": {
          "en": "The seven names organise a contemporary symbolic reflection, not an examination of invisible energy. Actions provide concrete examples to discuss.",
          "zh": "七个名称组织当代象征反思，不检查不可见能量；行动提供可讨论的具体例子。"
        }
      },
      {
        "question": {
          "en": "Should seven equal means be my goal?",
          "zh": "目标是让七项均分相等吗？"
        },
        "answer": {
          "en": "No. There is no ideal equal profile, total balance score or validated target. Different opportunities can produce different responses.",
          "zh": "不是。本版无理想等分画像、总平衡分或经验证目标，不同机会可产生不同回答。"
        }
      },
      {
        "question": {
          "en": "What if I had no opportunity in the last two weeks?",
          "zh": "两周内没有相关机会怎么办？"
        },
        "answer": {
          "en": "Choose the unavailable response. It is not scored zero; a theme needs three numeric responses to show a mean.",
          "zh": "选择不可评分项，不记零；每组需三条数字回答才显示均分。"
        }
      },
      {
        "question": {
          "en": "Is this the energy-flow questionnaire?",
          "zh": "这和精力节奏自评一样吗？"
        },
        "answer": {
          "en": "No. This bank has 28 items and seven chakra-symbolic themes; energy-flow is a different product and its results do not substitute for this one.",
          "zh": "不一样。本题本28条、七个脉轮象征主题；精力节奏是另一产品，不能互相代替结果。"
        }
      }
    ],
    "references": []
  },
  "multiple-intelligences": {
    "sections": [
      {
        "id": "mi-construct",
        "title": {
          "en": "Multiple intelligences, activity domains and confidence",
          "zh": "多元智能、活动领域与把握程度"
        },
        "paragraphs": [
          {
            "en": "Gardner’s framework discusses a plural account of intelligence. This website’s eight sets of activities are prompts inspired by that framework, not eight directly measured intelligences. The answer records how confident you feel about a described activity with your usual tools and adaptations.",
            "zh": "加德纳框架讨论多元的智能观。本站八组活动是受其启发的反思提示，不是直接测得的八种智能。回答记录使用平常工具与调整方式时，对所述活动有多少把握。"
          },
          {
            "en": "Gardner’s official FAQ questions self-report tests of intelligence and distinguishes intelligence, domains and styles. Knowing the theory therefore does not authorise a short confidence questionnaire to diagnose abilities or identify a strongest intelligence.",
            "zh": "加德纳官方FAQ讨论智能自评测试的限制，并区分智能、领域与风格。因此，了解理论不等于可以用简短把握自评诊断能力或找出最强智能。"
          }
        ]
      },
      {
        "id": "mi-eight",
        "title": {
          "en": "Read all eight activity themes on their own terms",
          "zh": "按各自活动理解八个主题"
        },
        "paragraphs": [
          {
            "en": "Language, numbers, space, movement and craft, music, other people, self-reflection and nature observation cover different experiences. Familiarity, practice, support and accessible tools can affect each estimate. An unfamiliar activity is not evidence of limited potential.",
            "zh": "语言、数字、空间、动作手作、音乐、人际、自我反思与自然观察涉及不同经历。熟悉程度、练习、支持与适合自己的工具都可能影响估计。不熟悉一项活动，不证明潜力有限。"
          },
          {
            "en": "A person might feel confident explaining an idea in writing while having little experience arranging music. That is a specific pair of self-estimates, not a calibrated difference between linguistic and musical intelligence. The activity descriptions do not observe performance.",
            "zh": "一个人可能对书面解释观点有把握，却少有编排音乐的经验。这是一对具体自评，不是校准后的语言智能与音乐智能差异。活动描述没有实际观察表现。"
          }
        ]
      },
      {
        "id": "mi-means",
        "title": {
          "en": "Thirty-two responses and eight complete-group means",
          "zh": "三十二个回答与八项完整组均分"
        },
        "paragraphs": [
          {
            "en": "Each group contains four 1–5 confidence ratings. Four numeric responses produce the arithmetic mean on the same 1–5 response range, displayed to one decimal. For 2, 3, 4 and 5, the mean is 3.5. No reverse item or cross-group total is added.",
            "zh": "每组四条1至5把握评分，四条数字回答产生同一1至5范围内的算术均分，显示一位小数。2、3、4、5的均分是3.5。不另加反向题或跨组总分。"
          },
          {
            "en": "One unscored answer withholds that group’s mean without replacing it with zero or a midpoint. Other complete groups remain. This complete-group policy is an editorial choice, not an empirically validated missing-data threshold. All-unscored responses still allow the complete guides to be read.",
            "zh": "一条不计分会使该组均分缺省，不补零或中点，其他完整组保留。完整组政策是编辑选择，不是经实证验证的缺失阈值。全部不计分也可阅读完整指南。"
          }
        ]
      },
      {
        "id": "mi-learning",
        "title": {
          "en": "Learning strategies need task evidence",
          "zh": "学习方法需要任务证据"
        },
        "paragraphs": [
          {
            "en": "A confidence profile does not assign a visual, auditory or kinesthetic learner identity. A useful next question is what the task requires: a diagram can help explain a spatial relation, while a written comparison can make an argument inspectable. Neither depends on labelling the learner.",
            "zh": "把握画像不派发视觉、听觉或动作学习者身份。更有用的问题是任务需要什么：图示可解释空间关系，书面对照可让论证便于核查。这些方法不以给学习者贴标签为前提。"
          },
          {
            "en": "Try an optional small task only if you want to, then compare your expectation with what actually happened and the support available. The test does not establish that matching teaching to a preferred mode improves learning, or determine a school placement.",
            "zh": "愿意时可选做一个小任务，再比较预期、实际发生的情况和可用支持。本测试不确定按偏好匹配教学能改善学习，也不决定学业分流。"
          }
        ]
      },
      {
        "id": "mi-differences",
        "title": {
          "en": "Keep product identities and results distinct",
          "zh": "区分产品身份与结果"
        },
        "paragraphs": [
          {
            "en": "The separate intelligence-type-test counts six preferred starting approaches in imagined scenes. This multiple-intelligences product has 32 confidence prompts across eight themes. Shared words about thinking do not make their questions, denominators or results interchangeable.",
            "zh": "另一个intelligence-type-test计数想象场景里的六种思考起步偏好。本multiple-intelligences产品围绕八个主题有32条把握提示。都谈思考，不表示题目、分母或结果可以互换。"
          },
          {
            "en": "All eight guides remain free and unranked. No outcome supplies IQ, job competence, author endorsement or a population percentile. Chinese is a website presentation, with no established language-equivalence study for this original bank.",
            "zh": "八篇指南均免费，且不排名。结果不提供智商、岗位能力、作者背书或人群百分位。本原创题本的中文网站呈现尚无已建立的语言等值研究。"
          }
        ]
      }
    ],
    "faq": [
      {
        "question": {
          "en": "Does confidence show my actual ability?",
          "zh": "有把握就说明实际能力强吗？"
        },
        "answer": {
          "en": "Confidence is a self-estimate. An ability claim needs suitable performance evidence, not just agreement with activity descriptions.",
          "zh": "把握程度是自我估计，能力主张需要合适的表现证据，不只看是否认可活动描述。"
        }
      },
      {
        "question": {
          "en": "Are the eight means comparable intelligence scores?",
          "zh": "八项均分是可比较的智能分吗？"
        },
        "answer": {
          "en": "No. Different activities were not calibrated as equivalent ability tests. Read their concrete content rather than ranking intelligences.",
          "zh": "不是。不同活动未校准成等值能力测验，应看具体内容，不据此给智能排名。"
        }
      },
      {
        "question": {
          "en": "Must I perform an activity before answering?",
          "zh": "必须先做活动才能回答吗？"
        },
        "answer": {
          "en": "No. Use the unscored response when experience or access is insufficient. No performance, upload or private story is required.",
          "zh": "不必。经验或接触条件不足就选不计分，无需表演、上传或提供私密经历。"
        }
      },
      {
        "question": {
          "en": "Can all 32 answers be unscored?",
          "zh": "32项都可不计分吗？"
        },
        "answer": {
          "en": "Yes. Each group then displays insufficient information, while all eight complete general guides remain readable.",
          "zh": "可以。各组显示资料不足，八篇完整通用指南仍可阅读。"
        }
      }
    ],
    "references": []
  },
  "empathy": {
    "sections": [
      {
        "id": "compassion-identity",
        "title": {
          "en": "Empathy searches, Compassion content and the BFAS source",
          "zh": "同理心检索、关怀内容与BFAS来源"
        },
        "paragraphs": [
          {
            "en": "The search term empathy covers several constructs. This page administers the ten Compassion statements in the Big Five Aspects Scales published on IPIP, one aspect within Agreeableness. It does not administer the Empathy Quotient, the whole BFAS or an emotion-recognition task.",
            "zh": "同理心检索包含多个构念。本页采用IPIP公开的大五方面量表中十条关怀倾向陈述，它是宜人性内的一个方面，不施测Empathy Quotient、完整BFAS或情绪识别任务。"
          },
          {
            "en": "Concern about another person and accurately identifying what they feel are related questions, but one does not establish the other. Your answers report how you see your usual behaviour; the other person’s experience and a performance task would provide different evidence.",
            "zh": "关心他人与准确辨认他人感受是相关问题，但不能互相证明。回答报告你怎样看自己通常的行为；当事人的体验和表现任务提供不同证据。"
          }
        ]
      },
      {
        "id": "compassion-key",
        "title": {
          "en": "Five positive and five negative statements",
          "zh": "五条正向与五条反向陈述"
        },
        "paragraphs": [
          {
            "en": "The official IPIP key contains five positive and five negative Compassion items. This page interleaves them. Odd displayed items retain the selected 1–5 value; even items use six minus that value. All ten keyed values are summed for a 10–50 raw total.",
            "zh": "IPIP官方键含五条正向、五条反向关怀条目，本页交错呈现。显示顺序中，奇数保留所选1至5，偶数用6减原值。十个处理后的值相加，产生10至50原始总分。"
          },
          {
            "en": "For responses 4,2,3,1,5,2,4,3,4,2, keyed values are 4,4,3,5,5,4,4,3,4,4: total 40 and mean 4.0. Reverse wording is a scoring direction, not a trick or a reason to choose an idealised answer.",
            "zh": "回答4、2、3、1、5、2、4、3、4、2时，处理后为4、4、3、5、5、4、4、3、4、4，总分40、均分4.0。反向措辞是计分方向，不是陷阱，也不要求选择理想答案。"
          }
        ]
      },
      {
        "id": "compassion-missing",
        "title": {
          "en": "Continuous values and an explicit missing state",
          "zh": "连续读数与明确缺失状态"
        },
        "paragraphs": [
          {
            "en": "Ten numeric answers are required for the personal total and mean in this edition. An unscored response withholds both; it is not replaced by a zero, average or inferred answer. The same complete twelve-section guide remains available even when all items are unscored.",
            "zh": "本版需十条数字回答才给个人总分和均分。任一不计分使两者缺省，不补零、平均值或推断答案。即使全不计分，同一份十二节完整指南仍可阅读。"
          },
          {
            "en": "IPIP recommends interpreting individual values with appropriate sample information. This website does not provide local norms or validated cutoffs for Compassion. A total of 40 is not the 40th percentile, 80 percent empathy or proof of a fixed type.",
            "zh": "IPIP建议结合适当样本信息解释个人读数。本站未提供关怀倾向的本地常模或验证界值。40分不是第40百分位、80%同理心，也不证明固定类型。"
          }
        ]
      },
      {
        "id": "compassion-application",
        "title": {
          "en": "Care with questions, consent and boundaries",
          "zh": "关心也要询问、征询与保留边界"
        },
        "paragraphs": [
          {
            "en": "An everyday application is to ask whether someone wants listening, practical help or time alone before assuming what support means. Describe one actual interaction and invite correction. This is an optional communication example, not evidence that your score predicts how another person feels.",
            "zh": "日常应用可以是先问对方想要倾听、实际帮助还是独处，而不是先假定支持是什么。描述一次真实互动，并允许对方纠正。这是可选沟通例子，不证明分数能预测他人感受。"
          },
          {
            "en": "Declining a request can coexist with concern. The source phrase “soft side” concerns a tender or caring side, not physical softness or compulsory agreement. No total determines whether you are a good person or whether a relationship should continue.",
            "zh": "拒绝请求可以与关心并存。原句soft side指温柔关怀的一面，不是身体柔软，也不要求凡事答应。总分不判定是否好人，也不决定关系是否应继续。"
          }
        ]
      },
      {
        "id": "compassion-evidence",
        "title": {
          "en": "Source evidence, translation and standalone presentation",
          "zh": "来源证据、翻译与独立网站呈现"
        },
        "paragraphs": [
          {
            "en": "The official source supplies English wording, keying, accuracy anchors and public-domain permission. Source research describes the original scale context. It does not automatically establish reliability or validity for this website’s standalone administration and new working Chinese translation.",
            "zh": "官方来源提供英文题文、键向、符合程度选项和公有领域许可。源研究讨论原量表语境，不自动确立本站独立施测与新工作中译的信度或效度。"
          },
          {
            "en": "Preserve the single Compassion identity: no invented Emotional Resonance or Caring Action subscales, diagnostic threshold, hiring score or cross-test conversion. Retaking in a different context may change responses, but without measurement-error evidence it does not quantify personality change.",
            "zh": "保留单一关怀倾向身份，不新增情绪共鸣或关怀行动分量表、诊断界值、招聘分数或跨测评换算。不同情境下重测可能改变回答，没有测量误差证据就不能量化人格变化。"
          }
        ]
      }
    ],
    "faq": [
      {
        "question": {
          "en": "Why only one Compassion value?",
          "zh": "为什么只给一个关怀读数？"
        },
        "answer": {
          "en": "The ten source items belong to one keyed BFAS aspect. Splitting them into extra empathy abilities would require a different measurement model and evidence.",
          "zh": "源十题属于一个有键向的BFAS方面，拆成额外同理心能力需要不同测量模型与证据。"
        }
      },
      {
        "question": {
          "en": "Does 40 out of 50 mean 80 percent empathy?",
          "zh": "40/50就是80%同理心吗？"
        },
        "answer": {
          "en": "No. The raw range starts at ten, not zero, and is not a ratio scale of empathy. This edition reports a raw total and mean only.",
          "zh": "不是。原始范围从10起，不从0起，也不是同理心的比率量尺。本版只报告原始总分和均分。"
        }
      },
      {
        "question": {
          "en": "Can concern and personal boundaries coexist?",
          "zh": "关怀与个人边界能并存吗？"
        },
        "answer": {
          "en": "Yes. A boundary is not scored as a moral failure. Discuss a specific request and available support instead of judging a person from one total.",
          "zh": "可以。边界不被评为道德失败，应讨论具体请求与可提供的支持，不用一个总分判人。"
        }
      },
      {
        "question": {
          "en": "Can I use another person’s answers or diagnose them?",
          "zh": "可以代别人回答或诊断别人吗？"
        },
        "answer": {
          "en": "The items ask for self-description. They do not establish another person’s inner state or any clinical diagnosis.",
          "zh": "条目询问自我描述，不能确定他人内在状态或任何临床诊断。"
        }
      }
    ],
    "references": []
  }
};
