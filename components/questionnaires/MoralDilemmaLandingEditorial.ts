import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Entry supplement; source-bound original scenarios and reports remain unchanged. */
export const moralDilemmaLandingSections: QuestionnaireSection[] = [
  {
    "id": "dilemma-question-action",
    "title": {
      "zh": "道德困境测试在比较什么？提问、判断与行动",
      "en": "What does this test compare? Questions, judgements and actions"
    },
    "paragraphs": [
      {
        "zh": "一个情境可以同时牵涉承诺、他人需要与资源分配。本卷问的是先核对什么，没有让你选择最终行动，也没有收集理由的完整论证。选中关怀问题，不说明你一定会打破规则；选中原则问题，也不说明你会忽略困难。计数不能替代回答接下来发现了什么、如何说明与最后怎么做。",
        "en": "A situation can involve commitments, others’ needs and allocation together. This form asks what to examine first, without choosing a final action or collecting a complete argument. Choosing a care question does not establish that you would break a rule; choosing a principle question does not establish that you would ignore difficulty. Counts cannot tell us what you subsequently learned, justified or did."
      },
      {
        "zh": "哲学中的严格道德困境，涉及相冲突且难以同时履行的要求；日常所说的困境也包括信息不全、代价不同或需要重新协商的价值张力。本题本采用后一种较宽的讨论范围。补充事实、增加方案或澄清同意，有时会改变问题，而不是必须在网页列出的考虑中永久选边。",
        "en": "A strict philosophical dilemma involves conflicting requirements that cannot readily be fulfilled together. Everyday dilemmas also include incomplete information, unequal costs and value tensions open to renegotiation. This form uses that broader discussion scope. Further facts, additional options or clarified consent may change the problem rather than require a permanent allegiance to one consideration."
      }
    ]
  },
  {
    "id": "dilemma-five-lenses",
    "title": {
      "zh": "五种伦理提问：背景与本站用法",
      "en": "Five ethical questions: background and use in this form"
    },
    "paragraphs": [
      {
        "zh": "后果与影响先问谁受到怎样的影响、哪些结果可信、代价如何比较。后果伦理有不同版本，不能简化为“多数人获益就一定对”。[1] 原则与承诺先问有什么义务、边界及可以公开辩护的理由；义务伦理讨论应当、允许与禁止，并不等于盲从任何现有规定。[2] 本卷用这些问题帮助比较考虑，不声称完整测量两类理论。",
        "en": "Consequences asks who is affected, how credible outcomes are and how costs compare. Consequentialist theories vary and cannot be reduced to majority benefit always making an action right.[1] Principles asks about duties, boundaries and publicly defensible reasons. Deontology concerns requirements, permissions and prohibitions, not blind obedience to any existing rule.[2] These questions support comparison here without fully assessing either theoretical family."
      },
      {
        "zh": "品格与实践先问诚实、审慎、勇气或负责在此事中怎样落实，而不是问哪个答案让自己显得高尚。品格伦理强调德性与实践智慧，但其他伦理理论同样可以重视品格。[3] 关怀与关系先问具体依赖、需要与回应，相关伦理讨论也涉及社会安排与权力，不只是在熟人面前温柔，更不限定某种性别。[4]",
        "en": "Character asks how honesty, judgement, courage or responsibility would be practised here, rather than which answer makes you look admirable. Virtue ethics centres virtue and practical wisdom, while other ethical theories can also value character.[3] Care asks about particular dependence, needs and responses. Related ethics also addresses social arrangements and power, not simply kindness to acquaintances or a gender-specific disposition.[4]"
      },
      {
        "zh": "公允与分配先问机会、负担、参与和例外如何说明。分配正义包含平等、需要、贡献等不同依据，不是任何情况下都平均分。[5] 五个入口有交集：一条公平规则可能有好的后果，也可以出于关怀；同一个人可以先后提出全部问题。它们是编辑整理的讨论入口，不是五种互斥人格或完整哲学分类。",
        "en": "Fairness asks how opportunities, burdens, participation and exceptions can be justified. Distributive justice includes differing grounds such as equality, need and contribution, rather than equal shares in every case.[5] The entry points overlap: a fair rule may have good effects and express care, and one person can ask all five questions in sequence. They are editorial discussion prompts, not exclusive personalities or an exhaustive taxonomy."
      }
    ]
  },
  {
    "id": "dilemma-shared-tool",
    "title": {
      "zh": "借用一件共同工具：五种问题怎样落到同一案例",
      "en": "A shared tool: applying five questions to one case"
    },
    "paragraphs": [
      {
        "zh": "假设工具已被周末小组预约，新成员临时想借，借出会使原小组等待。先核对后果，可以列出等待时间与替代工具，但目前的估计不一定可靠；先核对原则，可以问预约承诺允许什么例外，但仍需说明规则为何合理。先核对关怀，可以问双方为何依赖工具，而不是预先认定某一方更值得。",
        "en": "Suppose a weekend group reserved a tool and a new member wants to borrow it, delaying that group. Consequences can examine waiting times and alternatives, while recognising uncertain estimates. Principles can examine what exceptions the reservation permits, while asking why that rule is defensible. Care can ask why each party depends on the tool without presuming one is more deserving."
      },
      {
        "zh": "品格问题可以追问怎样诚实说明可用条件、避免作无法兑现的保证；公允问题可以追问例外是否向新旧成员都能说明。进一步询问后，也许能错开时间或借替代品。选择一种提问不必排斥另外四种，也不能由此推出必须借出或必须保留。这个例子展示论证如何继续，不提供通用于现实的标准答案。",
        "en": "Character can ask how to state availability honestly without making promises that cannot be kept. Fairness can ask whether an exception can be explained to new and established members alike. Further inquiry might reveal staggered use or another tool. Starting with one question excludes none of the others and implies neither lending nor retaining. This illustrates how deliberation continues, not a universally correct real-world answer."
      }
    ]
  },
  {
    "id": "dilemma-counts-example",
    "title": {
      "zh": "20次选择怎样计数？6、6、3、3、2算例",
      "en": "How are twenty choices counted? A worked 6, 6, 3, 3, 2"
    },
    "paragraphs": [
      {
        "zh": "每题菜单有四项，分别属于不同入口，第五组轮流省略。五组各出现16次、在A至D每个位置各4次，省略4次；选中只给相应组加1，未选不加不扣，没有反向或正确率。五项次数合计20，每项可在0—16之间。相同出现次数说明菜单安排均衡，不证明问题难度相同或测量已经验证。",
        "en": "Each menu contains four different entry points with the fifth omitted in rotation. Every group appears sixteen times, four at each position A to D, and is omitted four times. Selection adds one count to its group; unchosen options add or subtract nothing, with no reversal or correctness score. The five counts sum to twenty, each from zero to sixteen. Balanced exposure describes menu construction, not equal difficulty or validated measurement."
      },
      {
        "zh": "例如按后果、原则、品格、关怀、公允顺序得到6、6、3、3、2，前两项共享最高6次，两份九节报告全部显示，其他计数仍可见。6÷20是本次选择份额，6÷16是该入口出现时被选的比例；两者都不是道德水平、信念强度或人群百分位。总和固定，一项多一次必有其他项少一次。",
        "en": "For counts of 6, 6, 3, 3, 2 in the order consequences, principles, character, care and fairness, the first two share the maximum of six. Both nine-section reports appear and other counts remain visible. Six divided by twenty is a share of these choices; six divided by sixteen is selection relative to exposure. Neither is morality, belief strength or a percentile. With a fixed sum, an additional choice for one group comes from another."
      }
    ]
  },
  {
    "id": "dilemma-tie-omission",
    "title": {
      "zh": "最高并列、近分与省略：不制造隐藏类型",
      "en": "Ties, close counts and omissions: no hidden types"
    },
    "paragraphs": [
      {
        "zh": "全选A时五组各4次，全部五份九节指南都显示。这可由固定选项位置造成，不证明理想平衡或五种道德品质相等。两个或多个最高相同就保留全部，不按字母、题序或随机强分先后。最高6、另一项5时保留实际差异，但本版没有证明差1次具有心理意义。",
        "en": "Choosing A throughout gives four counts each and displays all five nine-section guides. A fixed response position can produce this without ideal balance or equal moral qualities. Every exact maximum remains, with no alphabetical, item-order or random tie-break. Counts of six and five remain different, but this edition has not established psychological significance for a one-choice gap."
      },
      {
        "zh": "某入口在一道题里没有出现，是题本菜单设计，不是你主动拒绝它；出现但没选，也只表示当时先选另一问题。0次不证明缺少关心、原则或品格，最高项不证明已忠实实践相应理论。先读全部公开指南不会改计分，不必反复作答来解锁其他解释。",
        "en": "An absent entry point reflects menu design rather than your rejecting it. An available but unchosen question only records choosing another first. Zero establishes no absence of care, principles or character, and a maximum proves no faithful practice of a theory. Reading every public guide does not change scoring; repeated attempts are unnecessary to unlock explanations."
      }
    ]
  },
  {
    "id": "dilemma-evidence-models",
    "title": {
      "zh": "哲学背景与测量证据：不能相互替代",
      "en": "Philosophical background and measurement evidence are different"
    },
    "paragraphs": [
      {
        "zh": "参考条目解释后果、义务、德性、关怀与分配正义的论争，提供阅读概念的背景。[1][2][3][4][5] 它们不是本站20题的验证研究。本题本尚未建立信度、效度、常模或中英文测量等价性，也没有评价论证质量、道德发展阶段、行为后果或真实品行。确定的加总规则可以复算，但不等于这些解释已经获得测量支持。",
        "en": "The references explain debates about consequences, duties, virtue, care and distributive justice.[1][2][3][4][5] They provide conceptual background rather than validation of these twenty items. This form has no established reliability, validity, norms or English–Chinese measurement equivalence, and assesses neither argument quality, moral-development stage, behavioural effects nor actual character. Reproducible addition does not itself establish those measurement properties."
      },
      {
        "zh": "本卷不是DIT-2、MJT、道德基础问卷，也不是阵营九宫格。共享“关怀”“公平”等词，不代表题目、任务或分数相同；不能由五项计数推算这些工具的结果、政治立场或招聘适任性。使用假想情境也不自动变成某种已发表的实验，更不授权网站替你决定现实中的重大取舍。",
        "en": "This is neither DIT-2, MJT, a Moral Foundations Questionnaire nor a nine-cell alignment chart. Shared words such as care or fairness establish no equivalent items, tasks or scores. Five counts cannot produce those results, political affiliation or job suitability. Hypothetical scenarios do not automatically reproduce a published experiment or authorise this site to decide consequential real-life choices."
      }
    ]
  },
  {
    "id": "dilemma-deliberation",
    "title": {
      "zh": "怎样继续讨论？事实、理由、异议与可修订安排",
      "en": "How can discussion continue? Facts, reasons, objections and revisable arrangements"
    },
    "paragraphs": [
      {
        "zh": "选一道愿意讨论的假想题，先区分已知事实、估计与缺失信息；说明谁受影响、可用方案和最想核对的问题。再尝试另一入口，提出一个反对自己初步判断的理由。可以承认合理考虑仍有冲突，不必为了显得坚定而把对方描述成没原则或没同情心。参与者可以不公开答案或退出讨论。",
        "en": "Choose a hypothetical item you are willing to discuss. Separate facts, estimates and missing information; identify affected people, available options and your starting question. Try another entry point and give an objection to your initial judgement. Reasonable considerations may remain in conflict without portraying someone else as unprincipled or uncaring. Participants may keep answers private or leave the discussion."
      },
      {
        "zh": "如果讨论延伸到一个普通共同安排，可以在相关人愿意参与时澄清约定、时间和可撤回的调整，之后回看哪些预期落空。这是可选的反思步骤，不是本卷验证过的道德训练。重测先看改变了哪些题、事实理解与情境；计数变化没有可靠变化阈值，不能据此宣称道德成长、退步或价值观彻底改变。",
        "en": "If discussion extends to an ordinary shared arrangement, willing participants can clarify agreements, timing and reversible adjustments, then revisit unmet expectations. These are optional reflection steps, not moral training validated by this form. For a retake, examine changed items, interpretations and contexts first. Counts have no established reliable-change threshold and do not establish moral growth, decline or a complete change of values."
      }
    ]
  }
];

export const moralDilemmaLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "选择原则问题，就必须照原规则办吗？",
      "en": "Does choosing a principle question require following the existing rule?"
    },
    "answer": {
      "zh": "不必。本题问先核对什么，义务和规则本身仍可讨论理由与例外。它不记录最终行动。[2]",
      "en": "No. The item asks what to examine first. Duties and rules still require reasons and consideration of exceptions; no final action is recorded.[2]"
    }
  },
  {
    "question": {
      "zh": "后果入口是否等于多数人获益就正确？",
      "en": "Does the consequences lens mean majority benefit makes an action right?"
    },
    "answer": {
      "zh": "不是这种简单公式。应核对影响大小、代价、可信程度与替代方案；后果伦理本身有不同版本。[1]",
      "en": "There is no such simple rule. Examine magnitude, costs, credibility and alternatives; consequentialist theories themselves vary.[1]"
    }
  },
  {
    "question": {
      "zh": "关怀与公平一定冲突吗？",
      "en": "Must care and fairness conflict?"
    },
    "answer": {
      "zh": "不一定。了解具体需要可帮助说明合理的例外与负担分配，但仍需听取其他受影响者。它们是可交叉的考虑，不是互斥人格。[4][5]",
      "en": "No. Understanding particular needs can inform justified exceptions and allocation, while other affected people still deserve a hearing. These considerations overlap rather than define exclusive personalities.[4][5]"
    }
  },
  {
    "question": {
      "zh": "6、6、3、3、2会得到什么？",
      "en": "What result follows from 6, 6, 3, 3, 2?"
    },
    "answer": {
      "zh": "按后果、原则、品格、关怀、公允顺序，后果和原则共享最高6次，两份九节全文都保留，不合成新类型。",
      "en": "In the order consequences, principles, character, care and fairness, the first two share the maximum of six. Both nine-section guides remain without inventing a combined type."
    }
  },
  {
    "question": {
      "zh": "全选A为什么不是一种固定类型？",
      "en": "Why does choosing A throughout not produce one fixed type?"
    },
    "answer": {
      "zh": "选项位置均衡轮换，全选A使五组各4次，全部最高并列。它反映本次计数，不认证理想平衡。",
      "en": "Balanced rotation gives four each and a five-way maximum. This records counts rather than certifying ideal balance."
    }
  },
  {
    "question": {
      "zh": "某组没出现或选得少，说明我不重视吗？",
      "en": "Does omission or a low count mean I do not value that concern?"
    },
    "answer": {
      "zh": "不能这样推断。菜单每次省略一组，且每题只选想先问的问题。其他考虑可能随后同样重要，0次也不是道德缺陷。",
      "en": "No. Each menu omits one group and records only a first question. Other concerns may matter equally later, and zero is not a moral defect."
    }
  },
  {
    "question": {
      "zh": "引用哲学资料，是否证明这份测试已科学验证？",
      "en": "Do philosophical references establish scientific validation of this test?"
    },
    "answer": {
      "zh": "没有。它们支持概念背景；本卷自己的信度、效度、常模和跨语言等价性尚未建立，不输出道德等级或发展阶段。",
      "en": "No. They support conceptual background. This form’s reliability, validity, norms and cross-language equivalence remain unestablished; no moral grade or developmental stage is generated."
    }
  },
  {
    "question": {
      "zh": "需要公开真实困境或再点同意才能开始吗？",
      "en": "Must I disclose a real dilemma or agree again to start?"
    },
    "answer": {
      "zh": "不需要。开始直接进入20道假想题，无邮箱、注册、付费或其他测评前置。五份完整指南可先读，不填写私人经历。",
      "en": "No. Start opens twenty hypothetical items without email, signup, payment or another assessment. All five full guides can be read first without private experiences."
    }
  }
];
