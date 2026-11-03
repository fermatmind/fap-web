import type { Text, QuestionnaireSection } from "@/lib/questionnaires/types";
export const workValuesSections: QuestionnaireSection[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Work values assessment: priorities in a feasible next role",
      "zh": "工作价值观测试：可行岗位中的优先事项"
    },
    "paragraphs": [
      {
        "en": "This original thirty-question reflection asks which condition you would protect first when four useful benefits cannot all be the priority. It compares achievement, autonomy, creativity, security, altruism, recognition, relationships, learning, work-life balance and impact. The results describe choices within this particular bank, not an inventory of every reason a person works.",
        "zh": "本原创三十题反思，询问四项有用好处不能同时排在首位时，你先保护哪一项。比较成就、自主、创意、稳定保障、助人、认可、关系、学习、工作生活平衡与实际影响。结果描述本题组中的选择，不穷尽一个人工作的所有理由。"
      },
      {
        "en": "Imagine the same ordinary next role throughout. The instructions treat fair pay, safety and lawful conditions as requirements already met, not prizes to sacrifice. Choose one of the four offered conditions even when several matter. These imagined trade-offs do not establish what a real employer offers or require a decision to accept, leave or reject a job.",
        "zh": "整份围绕同一份普通的下一阶段工作。说明把公平薪酬、安全和合法条件作为已经满足的基本要求，不是需要牺牲的奖励。多项都重要时仍选给定四项中的一项。这些设想取舍不证明真实雇主提供什么，也不要求接受、离开或拒绝某份工作。"
      }
    ]
  },
  {
    "id": "achievement",
    "title": {
      "en": "Achievement: a completed task against a clear standard",
      "zh": "成就：对照明确标准完成任务"
    },
    "paragraphs": [
      {
        "en": "Achievement options concern reaching a milestone, doing a demanding assignment well and being able to identify a completed result. The emphasis is the work accomplished. Recognition instead concerns how others acknowledge a contribution; impact asks what the output enables after completion.",
        "zh": "成就选项关注里程碑、把困难任务做好，以及能够辨认完成的成果，侧重工作本身做成什么。认可关注他人怎样肯定贡献；实际影响则询问完成后的产出促成什么。"
      },
      {
        "en": "For example, a carefully checked handover document may meet its brief even before anyone praises it or uses it. Preferring a clear completion standard does not demonstrate greater competence or a need to outperform colleagues. Evidence of skill still comes from the work, its conditions and feedback.",
        "zh": "例如，一份认真核对的交接文件，可以在尚未获表扬或被使用时就符合要求。偏好清楚的完成标准，不证明能力更强或想压过同事。技能证据仍应来自真实工作、条件与反馈。"
      }
    ]
  },
  {
    "id": "autonomy",
    "title": {
      "en": "Autonomy: discretion within an agreed responsibility",
      "zh": "自主：约定责任内的裁量空间"
    },
    "paragraphs": [
      {
        "en": "Autonomy options describe choosing a method, tool, sequence or routine decision while working toward an agreed goal. They do not remove collaboration or accountability. A clear brief and an opportunity to ask for help can coexist with freedom over the means.",
        "zh": "自主选项涉及在约定目标下选择方法、工具、顺序或日常决定，不取消合作与责任。清楚的任务要求、可以求助，与实现方式的自由可以共存。"
      },
      {
        "en": "An example is choosing how to organise a weekly task while keeping the agreed deadline and review. If this appeals, ask which decisions the actual role delegates and which require coordination. The count cannot tell whether you make effective independent decisions or whether a particular manager offers that discretion.",
        "zh": "例如，在保留截止时间与复核约定的同时，自行组织每周任务。若这点有吸引力，可以问真实岗位授权哪些决定、哪些需要协调。次数不能判断独立决策是否有效，也不能证明某位负责人提供这种空间。"
      }
    ]
  },
  {
    "id": "creativity",
    "title": {
      "en": "Creativity: opportunities to develop alternatives",
      "zh": "创意：发展不同方案的机会"
    },
    "paragraphs": [
      {
        "en": "Creativity options concern inventing an idea, combining elements, making a prototype or proposing a different design. They describe an opportunity you would like from work, not a measured ability to produce original and useful outputs. A technical, administrative or service task can include such an opportunity.",
        "zh": "创意选项涉及构想点子、组合要素、制作原型或提出不同设计，描述希望工作提供的机会，不测产出是否原创、有用。技术、行政或服务任务都可能包含这种机会。"
      },
      {
        "en": "Imagine testing two clearer layouts for a routine form. Creating an alternative and learning how to use a new tool might happen together, but they are different priorities: invention and development. Read which benefit the chosen option offers rather than treating every change as proof of creativity.",
        "zh": "设想为普通表单试两种更清楚的布局。提出备选方案与学习新工具可以同时发生，但优先事项不同，分别关注构思与发展。应看选项提供哪项好处，不把所有变化都当作创造力证据。"
      }
    ]
  },
  {
    "id": "security",
    "title": {
      "en": "Security: continuity and predictable arrangements",
      "zh": "稳定保障：延续性与可预期安排"
    },
    "paragraphs": [
      {
        "en": "Security options concern expected continuation, reliable schedules, notice of changes and a clear basis for future work. They are descriptions of predictability, not guarantees of permanent employment or evidence of an individual’s financial situation. The questionnaire asks for no income or household details.",
        "zh": "稳定保障选项涉及预计延续、可靠日程、变化通知与未来工作依据，描述可预期性，不保证永久就业，也不证明个人财务情况。问卷不询问收入或家庭细节。"
      },
      {
        "en": "You might want enough notice to plan a handover or an ordinary commitment. That preference can coexist with curiosity about a new field. In an actual opportunity, ask what is known, what is conditional and what remains uncertain; a high choice count cannot verify any promise.",
        "zh": "你可能希望提前得到通知，以便安排交接或普通承诺，这可以与对新领域的好奇并存。面对实际机会，可分别核对已知、附条件与未知事项；次数较高无法核实承诺。"
      }
    ]
  },
  {
    "id": "altruism",
    "title": {
      "en": "Altruism: practical assistance to another person",
      "zh": "助人：给他人的具体协助"
    },
    "paragraphs": [
      {
        "en": "Altruism options involve responding to someone’s need, making a task easier or including direct service in ordinary responsibilities. Impact may instead concern an output’s later consequences, including changes to a process. Helping a person and tracing downstream effects can overlap without being identical.",
        "zh": "助人选项涉及回应需要、减轻任务困难，或把直接服务纳入日常职责。实际影响则可以关注产出的后续作用，包括流程改变。协助一个人与追踪后果可以重合，但不是同一件事。"
      },
      {
        "en": "Helping a colleague complete a difficult form is a concrete example. Whether the help is useful depends on what they need and what you can actually provide. Choosing another benefit instead does not make someone selfish; the task compares work conditions rather than moral worth.",
        "zh": "帮助同事完成难填的表格，是具体例子。协助是否有用，取决于对方需要什么与自己能提供什么。选其他好处不使人变得自私，本任务比较工作条件，不评价道德价值。"
      }
    ]
  },
  {
    "id": "recognition",
    "title": {
      "en": "Recognition: accurate credit and specific feedback",
      "zh": "认可：准确归功与具体反馈"
    },
    "paragraphs": [
      {
        "en": "Recognition options concern naming a contribution, acknowledging useful effort and giving appropriate credit. They do not require fame, promotion or a management title. Wanting the record to be accurate can matter even when someone prefers a quiet, private conversation.",
        "zh": "认可选项关注点明贡献、肯定有用付出与恰当归功，不要求名气、晋升或管理头衔。即使偏好安静的私下交流，也可能重视贡献记录准确。"
      },
      {
        "en": "For a shared deliverable, a person might prefer feedback identifying their part over a general thank-you. That is different from achieving the standard itself or developing a new skill through feedback. The chosen descriptions cannot settle every reason for wanting recognition.",
        "zh": "一项共同交付中，有人可能更重视明确指出自身贡献的反馈，而不是笼统感谢。这不同于达到质量标准，也不同于通过反馈学习新技能。选择描述无法确定想要认可的全部原因。"
      }
    ]
  },
  {
    "id": "relationships",
    "title": {
      "en": "Relationships: trust in everyday collaboration",
      "zh": "关系：日常合作中的互信"
    },
    "paragraphs": [
      {
        "en": "Relationships options describe dependable human connections, respectful conversations and a cooperative atmosphere. They concern a preferred social condition at work rather than the amount of social contact someone can tolerate or a personality classification such as extraversion.",
        "zh": "关系选项描述可靠的人际连接、尊重的交流与合作氛围，涉及希望的工作人际条件，不是能够承受多少社交接触，也不是外向性等人格分类。"
      },
      {
        "en": "A colleague who takes time to clarify a misunderstanding may support this condition. Prefer concrete examples of how people coordinate over a broad promise of a friendly culture. A lower relationships count does not establish isolation, poor teamwork or dislike of colleagues.",
        "zh": "同事愿意花时间澄清误解，就是一种具体体现。可以优先核对人们怎样协调的例子，而不只听友好文化的笼统承诺。关系次数较少不证明孤立、团队合作差或不喜欢同事。"
      }
    ]
  },
  {
    "id": "learning",
    "title": {
      "en": "Learning: developing understanding and skill",
      "zh": "学习：发展理解与技能"
    },
    "paragraphs": [
      {
        "en": "Learning options concern supported practice, useful feedback and deeper understanding of a topic. Newness alone is not the criterion: a familiar area may still offer substantial development. Choosing this benefit does not show that your current competence is low or that every task must teach something new.",
        "zh": "学习选项涉及有支持的练习、有用反馈与深入理解。并非只看是否新鲜，熟悉领域也可以提供实质发展。选择学习不说明目前能力低，也不要求每项任务都学到新东西。"
      },
      {
        "en": "For example, you might want a chance to practise a difficult technique with review. Ask what support, time and feedback the real opportunity includes. Finishing a challenging task is achievement; acquiring an understanding that helps with later tasks is the learning emphasis here.",
        "zh": "例如，希望有机会在复核支持下练习困难技术。可以问实际机会包含哪些支持、时间与反馈。完成困难任务是成就；获得有助于后续任务的理解，则是这里的学习重点。"
      }
    ]
  },
  {
    "id": "balance",
    "title": {
      "en": "Work-life balance: dependable boundaries for non-work time",
      "zh": "工作生活平衡：工作外时间的可靠边界"
    },
    "paragraphs": [
      {
        "en": "Balance options involve workable hours, a stopping time, genuine time off and room for responsibilities outside the job. They describe arrangements rather than equal hours for every life area. No explanation of your private commitments is required.",
        "zh": "平衡选项涉及可行工时、结束时间、真正休息与工作外责任的空间，描述的是安排，不是让生活各部分平均分配小时数。无需说明个人私事。"
      },
      {
        "en": "A useful question is what normally happens when a routine work message arrives after the agreed stopping time. Keep this separate from whether work will continue, which is the security theme. A lower count cannot show that excessive hours suit you or that rest is unimportant.",
        "zh": "可核对的具体问题是：约定结束时间之后收到普通工作消息，通常怎样处理。它不同于岗位是否延续，那属于稳定保障。平衡次数较少不能说明你适合过量工时，或休息不重要。"
      }
    ]
  },
  {
    "id": "impact",
    "title": {
      "en": "Impact: tracing the consequences of an output",
      "zh": "实际影响：追踪产出的后续作用"
    },
    "paragraphs": [
      {
        "en": "Impact options concern knowing who uses an output, what it changes or which next step it enables. The consequence may be small, such as a clearer handover or removal of a recurring obstacle. This priority requires no prestigious mission or claim that one occupation is worth more than another.",
        "zh": "实际影响选项关注谁使用产出、改变了什么或促成哪一步。后果可以很小，例如交接更清楚、减少重复障碍。无需声望很高的使命，也不宣称某职业更有价值。"
      },
      {
        "en": "For example, completing a checklist is an achievement; observing that the checklist reduced repeated omissions is evidence of an effect. Preferring that connection does not establish that it occurred. Ask what evidence would show the actual outcome rather than treating the count as an impact measurement.",
        "zh": "例如，完成清单是一项成就；观察到清单减少重复遗漏，才是作用的证据。偏好看见这种连接，不证明作用已经发生。应问怎样的证据能反映真实结果，不把次数当成影响测量。"
      }
    ]
  },
  {
    "id": "counting",
    "title": {
      "en": "How thirty choices become ten relative counts",
      "zh": "三十次选择怎样生成十项相对次数"
    },
    "paragraphs": [
      {
        "en": "A selected alternative adds one count to its value. Each value appears twelve times, three in each option position; each pair of values shares a question four times. The ten counts total thirty after a complete attempt, while each value ranges from zero to twelve. There are no reverse keys, multipliers or points for a more admirable answer.",
        "zh": "所选选项给其价值记一次。每项出现十二次，在四个位置各三次；每两项共同出现在同一题四次。完整作答后十项合计三十，单项范围零至十二。没有反向键、倍率或更高尚答案的加分。"
      },
      {
        "en": "These are relative choices within one fixed set. Each selection also leaves three other offered conditions unselected. Choosing autonomy rather than learning in one question does not show that learning is unimportant; it only records which condition came first in that comparison.",
        "zh": "这是同一固定题组内的相对选择。每选一项，也使同题另外三项未被选择。一题选自主而没选学习，不证明学习不重要，只记录这次比较哪项在先。"
      }
    ]
  },
  {
    "id": "ranking",
    "title": {
      "en": "Shared ranks, close counts and an all-ten tie",
      "zh": "并列名次、接近次数与十项同次"
    },
    "paragraphs": [
      {
        "en": "Rank is one plus the number of values with a greater count. Counts of 6,6,4,3,3,2,2,2,1,1 therefore receive ranks 1,1,3,4,4,6,6,6,9,9. The report preserves every highest value’s complete reading, with no hidden alphabetical tie-break or fixed top-three limit.",
        "zh": "名次等于一加上次数更多的价值数量。因此6、6、4、3、3、2、2、2、1、1，对应1、1、3、4、4、6、6、6、9、9。报告保留每项最高价值的完整读法，不按字母暗中破并列，也不设固定前三上限。"
      },
      {
        "en": "Three selections for every value produce a complete all-ten tie. This equality does not demonstrate balanced needs, indecision or identical preferences across all real jobs. A one-choice difference has no established significance threshold, retest precision or confidence level in this original form.",
        "zh": "每项各选三次，构成完整的十项同次，不证明需求平衡、犹豫不决，或面对所有真实岗位都同样偏好。对本原创题本，差一次没有已建立的显著差值阈值、重测精度或置信水平。"
      }
    ]
  },
  {
    "id": "frameworks",
    "title": {
      "en": "Different work-values instruments need their own evidence",
      "zh": "不同工作价值工具需要各自的证据"
    },
    "paragraphs": [
      {
        "en": "CareerOneStop presents six work values: achievement, independence, recognition, relationships, support and working conditions. Our ten editorial priorities and thirty original questions are a different form. Shared words do not make their scales, occupational information or interpretation interchangeable. [1]",
        "zh": "CareerOneStop介绍成就、独立、认可、关系、支持与工作条件六项价值。本站十项编辑优先事项与三十道原创题是不同题本，词语相似不使量尺、职业资料或解释可以互换。[1]"
      },
      {
        "en": "The structure can be checked by recounting answers, but that is not evidence of reliability, construct validity, language equivalence or job prediction. This edition has no established norms or validated match model. RIASEC asks about activity interests, while basic human-values theories address a broader scope than the offered work conditions.",
        "zh": "逐条重算可以核查计数结构，却不能证明信度、构念效度、语言等值或岗位预测。本版没有已建立的常模或验证过的匹配模型。RIASEC询问活动兴趣；基本人类价值理论的范围，也比题中给定工作条件更广。"
      }
    ]
  },
  {
    "id": "use",
    "title": {
      "en": "From a priority to a question you can investigate",
      "zh": "把优先事项转成能够核对的问题"
    },
    "paragraphs": [
      {
        "en": "If useful, privately choose one high or close value and write the condition you want, a question to ask and evidence still missing. For learning, that might mean asking how feedback and supported practice work. You can read all ten complete guides, including those with lower counts, before deciding what deserves further attention.",
        "zh": "有用时，可私下选择一项较高或接近的价值，写下希望的条件、可问的问题与仍缺的证据。例如学习，可以核对反馈与支持练习怎样进行。十篇完整指南始终可读，也包括次数较少的项目，再决定哪些值得进一步关注。"
      },
      {
        "en": "Counts alone do not choose a career, evaluate an employer, establish ability or predict satisfaction. You may stop after reading without submitting workplace details or taking another test. Optional sharing copies only the public title and entry; temporary tab saving remains a separate opt-in choice during the attempt.",
        "zh": "次数不能独自选择职业、评价雇主、认定能力或预测满意度。阅读后可以结束，不提交单位细节，也不必再做其他测试。可选分享只复制公开标题与入口；临时标签页保存是作答中单独选择的可选项。"
      }
    ]
  }
];
export const workValuesFaq = [
  {
    "question": {
      "en": "What setting should I use for all thirty choices?",
      "zh": "三十题参照什么情境？"
    },
    "answer": {
      "en": "Keep one ordinary, feasible next role in mind, with fair pay, safety and lawful conditions treated as requirements already met. The imagined benefits are not verified promises from employers.",
      "zh": "围绕同一份普通、可行的下一阶段工作，假设公平薪酬、安全和合法条件已满足。设想好处不是已经核实的雇主承诺。"
    }
  },
  {
    "question": {
      "en": "What if several options in a question matter?",
      "zh": "同题多项都重要怎么办？"
    },
    "answer": {
      "en": "Choose the offered condition you would protect first in that comparison. Not choosing an alternative does not reject it. If the task does not fit, you can stop and read all public guides.",
      "zh": "选该次比较中最先保护的一项，没选不表示反对。任务不适合时可以停止，并阅读全部公开指南。"
    }
  },
  {
    "question": {
      "en": "Can I skip a question?",
      "zh": "可以跳题吗？"
    },
    "answer": {
      "en": "A personal result needs thirty valid selections. This form has no unscored option; an incomplete attempt produces no counts or interpretation. Public guides are available without completing it.",
      "zh": "个人结果需要三十次有效选择。本题本没有不评分选项，未完成不生成计数或解读；无需完成也可看公开指南。"
    }
  },
  {
    "question": {
      "en": "Why do equal counts have the same rank?",
      "zh": "为什么相同次数保持同名次？"
    },
    "answer": {
      "en": "Rank counts how many values have more selections, plus one. Thus 6,6,4 starts 1,1,3. List order does not break a tie, and every highest reading is retained.",
      "zh": "名次是次数更多的价值数量加一，所以6、6、4从1、1、3开始。列表顺序不破并列，最高读法全部保留。"
    }
  },
  {
    "question": {
      "en": "Can all ten values tie?",
      "zh": "十项能全部并列吗？"
    },
    "answer": {
      "en": "Yes. Three choices each use the thirty available selections. The result retains ten full readings without choosing a winner or inventing a balanced personality.",
      "zh": "可以。每项三次，合计三十次。结果保留十份完整读法，不选唯一赢家，也不发明平衡人格。"
    }
  },
  {
    "question": {
      "en": "Is a count of 6 out of 12 a 50% job-fit score?",
      "zh": "6/12就是50%的岗位适配吗？"
    },
    "answer": {
      "en": "No. Twelve is the number of appearances of that value in this bank. The count is not a match probability, population percentile or measure of satisfaction.",
      "zh": "不是。十二是该价值在本题组中的出现次数。次数不是匹配概率、人群百分位或满意度测量。"
    }
  },
  {
    "question": {
      "en": "How do achievement, recognition and impact differ?",
      "zh": "成就、认可与实际影响怎样区分？"
    },
    "answer": {
      "en": "Achievement concerns completing work to a standard; recognition concerns credit for a contribution; impact concerns what the output later enables. One real task may involve all three.",
      "zh": "成就关注按标准完成工作，认可关注贡献获得肯定，实际影响关注产出之后促成什么。真实任务可以同时涉及三者。"
    }
  },
  {
    "question": {
      "en": "Does low altruism mean selfishness or low balance mean overworking?",
      "zh": "助人较低就是自私，平衡较低就是想过度工作吗？"
    },
    "answer": {
      "en": "Neither follows. Each choice compares four offered conditions. The counts do not establish moral character, preferred excessive hours or acceptance of unsafe conditions.",
      "zh": "都不能这样推出。每次只比较给定四项条件，次数不判道德品格、过量工时偏好或是否接受不安全条件。"
    }
  },
  {
    "question": {
      "en": "Do English and Chinese results have established equivalence?",
      "zh": "中英文结果已建立等值吗？"
    },
    "answer": {
      "en": "No. Their item structure and counting rule are aligned, but measurement equivalence is not established. Check wording and the imagined role when comparing attempts.",
      "zh": "尚未。两者题目结构与计数规则一致，但未建立测量等值。比较两次作答时应核对措辞与设想岗位。"
    }
  },
  {
    "question": {
      "en": "Does Start test require another agreement?",
      "zh": "点开始还需要勾选同意吗？"
    },
    "answer": {
      "en": "No. It opens the first four-option question directly. Optional tab saving, sharing and further exploration are not conditions of completing the test or reading the full result.",
      "zh": "不需要，直接打开第一道四选一。可选标签页保存、分享与后续探索，都不是完成作答或阅读完整结果的条件。"
    }
  }
];
export const workValuesSummaries: Record<string, Text> = {
  "achievement": {
    "en": "Completing a worthwhile assignment to a clear standard, distinguished from receiving credit and tracing later effects.",
    "zh": "按明确标准完成值得做的任务，并与获得认可、追踪后续作用区分。"
  },
  "autonomy": {
    "en": "Choosing methods, tools or sequence within agreed goals, with responsibility and collaboration still in place.",
    "zh": "在约定目标内选择方法、工具与顺序，同时保留责任与合作。"
  },
  "creativity": {
    "en": "Room for ideas, alternatives and prototypes, separated from a claim about the originality of your actual work.",
    "zh": "给点子、备选方案与原型留空间，并与真实作品是否原创区分。"
  },
  "security": {
    "en": "Continuity, predictable arrangements and notice of change, without treating an imagined promise as a guarantee.",
    "zh": "关注延续、可预期安排与变化通知，不把设想承诺当成保证。"
  },
  "altruism": {
    "en": "Direct practical assistance to someone who needs it, read as a preferred condition rather than a moral ranking.",
    "zh": "直接协助有需要的人，作为希望的工作条件阅读，而非道德排序。"
  },
  "recognition": {
    "en": "Specific acknowledgment and accurate credit for a contribution, distinct from fame, promotion or a skill score.",
    "zh": "贡献获得具体肯定与准确归功，区别于名气、晋升或技能分数。"
  },
  "relationships": {
    "en": "Trusting, respectful day-to-day connections, with examples of collaboration and counterexamples to personality labels.",
    "zh": "日常互信与尊重的连接，结合合作例子和反例，避免据此分配人格。"
  },
  "learning": {
    "en": "Supported practice, feedback and deeper understanding, alongside questions about what a real role offers.",
    "zh": "有支持的练习、反馈与深入理解，并核对真实岗位提供什么。"
  },
  "balance": {
    "en": "Dependable stopping times and room for non-work responsibilities, without requiring disclosure of private commitments.",
    "zh": "可靠的结束时间与工作外责任空间，无需披露私人安排。"
  },
  "impact": {
    "en": "Seeing who uses an output and what it enables beyond completion, with practical evidence still needed.",
    "zh": "看见谁使用产出、完成后促成什么，仍需实际证据核对。"
  }
};
