import type { Questionnaire } from "@/lib/questionnaires/types";

export const parentingLandingSections: Questionnaire["guide"] = [
  {
    "id": "parenting-context-scope",
    "title": {
      "en": "Parenting practices, dimensions and styles: three levels of description",
      "zh": "养育行为、维度与风格：三个描述层次"
    },
    "paragraphs": [
      {
        "en": "A practice is a particular action, such as listening before proposing a solution. A dimension groups related practices; a style describes a wider pattern across them. These twelve original questions sample warm responses and clear everyday boundaries. Their two frequency means describe the selected actions, rather than measuring every feature of a parenting style. The four complete guides explain a broader framework and are available before or after answering. [4]",
        "zh": "行为是具体行动，例如提出办法前先听清情况；维度把相关行为归在一起，风格描述更广泛的组合模式。本十二道原创题抽样回看温暖回应与清楚日常边界，两个频率均分描述所选行动，没有测量一种养育风格的全部特征。四份完整指南解释较广的框架，作答前后均可阅读。[4]"
      },
      {
        "en": "In the familiar four-style vocabulary, authoritative combines responsiveness with expectations; authoritarian emphasizes demands with less responsiveness; permissive emphasizes responsiveness with less structure; uninvolved describes less responsiveness and structure. These are concepts for comparison, not four identities assigned here. A clear limit is not automatically harsh control, and changing an unsuitable arrangement is not automatically permissiveness. [1]",
        "zh": "常见四风格词汇中，权威型把回应与要求结合，专制型侧重要求而回应较少，宽松型回应较多而结构较少，低投入型则回应与结构均较少。这些概念供比较，本页不会分配四种身份。清楚边界不自动等于严厉控制，调整不合适的安排也不自动等于放任。[1]"
      }
    ]
  },
  {
    "id": "parenting-context-answer",
    "title": {
      "en": "One adult, one child aged three to twelve, four weeks",
      "zh": "一位成年人、同一位3至12岁孩子、过去四周"
    },
    "paragraphs": [
      {
        "en": "Answer about your own care of the same child throughout the past four weeks. Relevant caregivers can include parents, grandparents or another adult with an actual care role. If you care for several children, choose one reference for this attempt rather than averaging their different needs. This age range and recall period are editorial choices for this original form; they are not a validated developmental norm.",
        "zh": "请全程回看过去四周，自己照料同一位孩子的行为。有实际照料职责的家长、祖辈或其他成年人均可使用这个参照。照料多个孩子时，本次选定一位，不把不同需要混在一起取平均。年龄范围和回忆期限属于本原创题本的编辑约定，不是经过验证的发展常模。"
      },
      {
        "en": "When the relevant situation occurred, how often did you take the stated action? Never, Rarely, Sometimes, Often and Almost always contribute 1–5. If no such occasion arose, you cannot judge or you prefer privacy, choose unscored. For example, no tense exchange is different from having one and not returning to listen. No child name, birth date, school or account is required.",
        "zh": "相关情境发生时，多常采取题述行动？从不、很少、有时、经常、几乎总是依次记1—5。没有相关机会、无法判断或希望保留隐私时，可选不计分。例如，没有紧张交流，不同于发生后没有回来继续倾听。无需孩子姓名、生日、学校或账户。"
      }
    ]
  },
  {
    "id": "parenting-context-response",
    "title": {
      "en": "Warm responses: listening, acknowledgment and returning to a conversation",
      "zh": "温暖回应：倾听、具体回应与返回对话"
    },
    "paragraphs": [
      {
        "en": "The first six items concern hearing an ordinary frustration, checking the intended message, respectful refusal, acknowledging effort, attention not conditional on perfect behavior, and listening again after tension. A larger mean means these particular actions were recalled more often. It does not tell us whether the child felt understood, whether help met the need or how much the adult cares. These require information beyond the adult’s frequency choices.",
        "zh": "前六项涉及听完日常困扰、核对想表达的意思、尊重地拒绝、具体回应努力、不以完美表现为条件的关注，以及紧张之后重新倾听。均分较大表示这些行动被回忆为较常发生，不能说明孩子是否感到被理解、帮助是否符合需要，或成年人有多关爱；这些需要自报频率之外的信息。"
      },
      {
        "en": "Imagine a child explaining that a group activity did not go as expected. Before choosing a solution, the adult can ask which part was difficult and check whether the child wants help or wants to finish telling the story. Acknowledging the account need not mean accepting every request. AAP guidance supports listening, specific positive attention and continued connection; a scripted phrase cannot guarantee a particular response. [3]",
        "zh": "设想孩子讲起一次不顺利的小组活动。选择办法前，成年人可以问哪部分困难，核对孩子是希望获得帮助，还是想先把经过讲完。回应其说明不必等于接受所有请求。美国儿科学会资料支持倾听、具体积极关注和持续联结，但固定话术不能保证某种反应。[3]"
      }
    ]
  },
  {
    "id": "parenting-context-boundaries",
    "title": {
      "en": "Clear boundaries: a workable next action, not more restrictions",
      "zh": "清楚的边界：可实行的下一步，而非更多限制"
    },
    "paragraphs": [
      {
        "en": "Items seven to twelve concern an understandable next action, explaining a transition, following through, explaining changes, fitting expectations to current capabilities and clarifying a revised plan. These ask about practical structure, not punishment intensity or psychological control. A larger boundary mean cannot be treated as the research framework’s full demandingness dimension or as evidence of authoritarian parenting.",
        "zh": "第七至十二项关注可理解的下一步、说明活动转换、落实安排、解释变化、使要求符合当下能力，以及说清修订计划。它们询问实际结构，不问惩罚强度或心理控制。边界均分较大，不能当作研究框架全部要求维度，也不是专制型养育的证据。"
      },
      {
        "en": "For example, before leaving a shared activity, explain what needs to happen next and what assistance is available. Check whether the child can understand and carry out that action; a calm demand can still be unrealistic. CDC’s young-child guidance emphasizes specific, age-appropriate rules and shared caregiver understanding. Its toddler/preschool scope does not supply identical rules for every three-to-twelve-year-old. Adapt the example to the actual child and situation. [2]",
        "zh": "例如，共同活动结束前，可说明接下来需要做什么、能提供什么帮助，核对孩子能否理解、完成；语气平静的要求仍可能不现实。CDC幼儿资料强调具体、适龄的规则及照料者共同理解，其幼儿／学前范围不提供适用于所有3至12岁孩子的相同规则。示例需要按真实孩子与情境调整。[2]"
      }
    ]
  },
  {
    "id": "parenting-context-calculation",
    "title": {
      "en": "Two independent calculations: 3.5 and 3.2, with no type boundary",
      "zh": "两项独立算例：3.5与3.2，没有派型界点"
    },
    "paragraphs": [
      {
        "en": "For a fresh example, warm-response choices 5, 1, 4, 2, 5 and 4 sum to 21 and display 3.5 / 5. Boundary choices 2, 4, 3, 1, 4 and 5 sum to 19; 19 divided by six displays 3.2 / 5 after rounding. All items score forward. The ordered response categories are not a log of every event, so 3.5 is not seventy percent effective care. The two parts are never added to make an overall score.",
        "zh": "举一组新算例：温暖回应选5、1、4、2、5、4，合计21，显示3.5 / 5；边界选2、4、3、1、4、5，合计19，19除以六舍入后显示3.2 / 5。全部题目正向计分。有顺序的回答类别不是逐次事件记录，因此3.5不表示有效照料70%；两部分也不会相加形成总分。"
      },
      {
        "en": "If the fourth warm-response item becomes unscored, the remaining five values sum to 19, but that part has no mean. The complete boundary part keeps 3.2. Nothing is imputed or divided by five, and every guide remains available. Requiring all six numeric answers is this edition’s completeness policy, not a validated missing-data threshold. Neither a complete pair nor an all-unscored attempt assigns a style.",
        "zh": "若温暖回应第4项改为不计分，剩余五项合计19，但该部分没有均分，完整边界部分仍显示3.2。不代填，也不除以五，全部指南仍可阅读。六项数值齐全是本版完整程度政策，不是验证过的缺失阈值。无论两项齐全或全部不计分，都不会分配风格。"
      }
    ]
  },
  {
    "id": "parenting-context-evidence",
    "title": {
      "en": "Research patterns are not a prediction for your child",
      "zh": "研究中的模式不是对你家孩子的预测"
    },
    "paragraphs": [
      {
        "en": "Kuppens and Ceulemans’ study, published online in 2018 and in a 2019 issue, examined Flemish families with children aged eight to ten. Its final paired-parent analysis involved 527 families. Adding psychological control changed the interpretation of one cluster. This illustrates why model content matters. The study used parent reports and cross-sectional data; it cannot establish that a style caused a child outcome. [4]",
        "zh": "Kuppens与Ceulemans的研究于2018年在线发表、刊于2019年期刊，考察孩子8至10岁的佛兰德家庭，最终双亲配对分析涉及527个家庭。加入心理控制后，一组的解释发生变化，说明模型包含什么很重要。研究使用家长自报和横断资料，不能确立某风格导致儿童结果。[4]"
      },
      {
        "en": "This original twelve-item form was not used in that study. It has no established reliability, norms, factor structure, predictive validity or English–Chinese measurement equivalence. Computing means correctly does not establish those properties. A child’s account, another caregiver’s observations and circumstances may add information that is absent here. A research association is not an individual forecast of school performance, attachment or mental health.",
        "zh": "该研究没有使用本站原创十二题，本题本尚未建立信度、常模、因子结构、预测效度或英中测量等价。正确计算均分不能确立这些性质。孩子的说明、其他照料者的观察与实际背景，可能补充本页没有的信息；研究相关不是对个体成绩、依恋或心理健康的预测。"
      }
    ]
  },
  {
    "id": "parenting-context-instruments",
    "title": {
      "en": "This form is not PAQ, PSDQ or a childhood-recollection test",
      "zh": "本页不是PAQ、PSDQ或童年回忆测验"
    },
    "paragraphs": [
      {
        "en": "Buri’s 1991 Parental Authority Questionnaire contains thirty items per parent and derives three prototype scores from a son’s or daughter’s appraisal of each parent. That perspective differs from an adult describing their own recent care. This page neither reproduces PAQ nor imports its score interpretation. It also does not claim to be a shortened Parenting Styles and Dimensions Questionnaire. [5]",
        "zh": "Buri的1991年父母权威问卷每位家长30项，由子女对父母的评价产生三种原型分数，这一视角不同于成年人描述自己的近期照料。本页既不复现PAQ，也不移用其分数解释，同样不声称是养育风格与维度问卷PSDQ的缩短版。[5]"
      },
      {
        "en": "Before comparing online results, check who answers, whose behavior is described, the recall period, item set and scoring. A retrospective account of being parented and a four-week account of parenting can both be meaningful while answering different questions. Similar English or translated style names do not establish interchangeable instruments. No score from another form can be converted into these two means by its title alone.",
        "zh": "比较网上结果前，应核对谁作答、描述谁的行为、回忆期限、题目及计分。回顾自己怎样被养育，与回看四周内自己怎样照料，可以各有意义，但回答不同问题。英文或译名相似，不代表工具互换；不能仅凭名称把其他问卷分数换成这里的两个均分。"
      }
    ]
  },
  {
    "id": "parenting-context-application",
    "title": {
      "en": "Use one shared-care arrangement to turn reflection into action",
      "zh": "从一项共同照料安排，把反思转为行动"
    },
    "paragraphs": [
      {
        "en": "Choose one ordinary situation already within your responsibility. Identify the child’s expressed need, the actual constraint and one next step you can explain. When another caregiver is involved, agree who will do what and how a change will be communicated. Discuss an arrangement rather than ranking adults by their means. A child does not need to settle the adults’ disagreement or make your questionnaire result improve. [1]",
        "zh": "选择职责内的一次普通情境，明确孩子表达的需要、真实限制，以及可以说明的一项下一步。涉及其他照料者时，商定谁做什么、变化时怎样沟通。讨论具体安排，不按均分给成年人排名；孩子不需要解决成年人的分歧，或让你的问卷结果提高。[1]"
      },
      {
        "en": "Afterward, privately note what was explained, what actually happened and what is still uncertain. An adjustment may help even if a later mean stays the same; a changed mean can reflect different opportunities or recall. There is no established reliable-change threshold here. If a care need cannot be met, seek appropriate practical or professional support based on that need, without waiting for a score or requiring a child to share identifying information.",
        "zh": "事后可私下记下说明了什么、实际发生什么、仍不确定什么。调整可能有帮助，而下次均分不变；均分变化也可能涉及机会或回忆不同。本页没有已建立的可靠变化阈值。照料需要无法满足时，可按需要寻找合适的实际或专业支持，不必等待分数，也不要求孩子提供身份信息。"
      }
    ]
  }
];

export const parentingLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Can grandparents or other adult caregivers answer?",
      "zh": "祖辈或其他成年照料者可以回答吗？"
    },
    "answer": {
      "en": "Yes, when they have an actual everyday care role for the selected child aged three to twelve. Answer only for your own actions, not on behalf of another caregiver.",
      "zh": "有实际日常照料职责时，可以。同一位参照孩子应为3至12岁；只回答本人的行动，不替另一位照料者作答。"
    }
  },
  {
    "question": {
      "en": "Which child should I think about if I care for several?",
      "zh": "照料几个孩子时，应当回想哪一位？"
    },
    "answer": {
      "en": "Choose one child for this attempt and keep that reference throughout the four weeks. Different needs and opportunities should not be mixed into an imagined average child.",
      "zh": "本次选定同一位孩子，保持四周参照。不要把不同需要和机会混成一个想象中的平均孩子。"
    }
  },
  {
    "question": {
      "en": "Does acknowledging a feeling mean granting a request?",
      "zh": "回应感受就意味着答应请求吗？"
    },
    "answer": {
      "en": "No. Listening and understanding can coexist with a practical limit. Whether a limit is reasonable still depends on the child’s capabilities and the actual situation.",
      "zh": "不意味着。倾听、理解可以与实际边界并存；边界是否合理，仍需结合孩子能力和真实情境。"
    }
  },
  {
    "question": {
      "en": "Are clear boundaries a measure of harsh control?",
      "zh": "清楚边界是在测严厉控制吗？"
    },
    "answer": {
      "en": "No. These six items concern understandable arrangements and follow-through. They do not measure punishment intensity or the full research concept of demandingness.",
      "zh": "不是。这六项关注可理解的安排与落实，不测惩罚强度或完整研究概念中的要求维度。"
    }
  },
  {
    "question": {
      "en": "Does 3.5 / 5 mean seventy percent good parenting?",
      "zh": "3.5 / 5表示好家长程度70%吗？"
    },
    "answer": {
      "en": "No. It is a descriptive mean of six frequency choices, not an effectiveness percentage, a parent ranking or a comparison with other families.",
      "zh": "不是。它是六项频率选项的描述均值，不是有效率、家长排名或与其他家庭的比较。"
    }
  },
  {
    "question": {
      "en": "Is this the thirty-item PAQ?",
      "zh": "这是30项父母权威问卷PAQ吗？"
    },
    "answer": {
      "en": "No. Buri’s PAQ uses the son’s or daughter’s perspective and thirty items per parent. This form has twelve original items about the adult’s own recent care. [5]",
      "zh": "不是。Buri的PAQ使用子女视角，每位家长30项；本页是关于成年人本人近期照料的十二项原创题。[5]"
    }
  },
  {
    "question": {
      "en": "Can a higher mean next month prove that parenting improved?",
      "zh": "下个月均分升高，能证明养育改善吗？"
    },
    "answer": {
      "en": "Not by itself. Occasions, routines and recall may differ. Check a concrete interaction and its observed consequences; this form has no established reliable-change threshold.",
      "zh": "单凭数值不能证明。机会、日常安排和回忆可能不同，应核对具体互动与观察到的后续情况；本题本没有已建立的可靠变化阈值。"
    }
  },
  {
    "question": {
      "en": "Does Start go straight to the first question?",
      "zh": "点击开始会直接到第一题吗？"
    },
    "answer": {
      "en": "Yes. There is no second agreement, registration or payment step. Saving progress is optional; all twelve questions and all four complete guides are free.",
      "zh": "会。没有再次同意、注册或付款步骤；保存进度自选，全部十二题与四份完整指南免费。"
    }
  }
];

export const parentingLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Kuppens and Ceulemans (2019): parenting dimensions, clusters and research limits",
      "zh": "Kuppens与Ceulemans（2019）：养育维度、模式与研究限制"
    },
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC6323136/"
  },
  {
    "title": {
      "en": "Buri (1991): Parental Authority Questionnaire, original abstract",
      "zh": "Buri（1991）：父母权威问卷原始摘要"
    },
    "url": "https://pubmed.ncbi.nlm.nih.gov/16370893/"
  }
];
