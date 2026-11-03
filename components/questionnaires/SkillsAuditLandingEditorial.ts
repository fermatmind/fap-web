import type { Text, QuestionnaireSection } from "@/lib/questionnaires/types";
export const skillsAuditSections: QuestionnaireSection[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Skills audit: twenty tasks, remembered examples and four complete readings",
      "zh": "技能审计：20项任务、可回想实例与四篇完整读法"
    },
    "paragraphs": [
      {
        "en": "This Skills Audit Test is an original task-example inventory. It asks which examples you can currently recall for twenty activities, grouped into methods, tools, communication and task knowledge. Each group contains five tasks. Select a state for the example; you are not asked to rate how well you performed or to submit a work sample.",
        "zh": "技能审计测试是一份原创任务实例盘点，询问目前能回想起哪些活动经历。20项任务分为方法、工具、沟通和任务知识，每组五项。为实例选择记录状态即可，不必评价自己做得多好，也不需要提交工作样本。"
      },
      {
        "en": "A useful distinction is between recording experience, describing evidence and assessing competence against a requirement. Europass provides tools for organising skills and experiences; O*NET describes occupational skill concepts. These backgrounds help explain the topic, but neither supplies this original inventory or validates its four editorial categories. [1][2][3]",
        "zh": "记录经历、描述证据、按要求评估胜任，是不同步骤。Europass提供整理技能和经历的工具，O*NET描述职业技能概念；这些背景有助理解主题，但不提供本站原创盘点，也不验证其四个编辑类别。[1][2][3]"
      }
    ]
  },
  {
    "id": "states",
    "title": {
      "en": "Four record states, with a twelve-month recall boundary",
      "zh": "四种记录状态与12个月回忆界限"
    },
    "paragraphs": [
      {
        "en": "Recent means you can recall an example within the past twelve months and its outcome. Older means you recall only an earlier example that you would need to revisit. Explore means no example comes to mind and you would like to explore the activity. Not recorded covers irrelevance, uncertainty or a choice not to answer.",
        "zh": "近期指能回想过去12个月内的一次实例及其结果；更早指只能回想此前的实例，需要重新查看；探索指目前想不到实例，愿意了解或尝试该活动；暂不记录涵盖不相关、无法判断或暂不回答。"
      },
      {
        "en": "These states are categories, not steps on a proficiency ladder. Recent is not expert, older is not intermediate, and explore is not beginner. The twelve-month boundary organises recall rather than setting a scientific expiry date for a skill. A recent event can have an unhelpful outcome; an older one can still be relevant to a current requirement.",
        "zh": "这些是分类，不是熟练度阶梯。近期不等于专家，更早不等于中级，探索也不等于新手。12个月界限用于整理回忆，不是技能失效的科学期限。近期经历可能没有帮助，更早的经历也可能与当前要求相关。"
      }
    ]
  },
  {
    "id": "methods",
    "title": {
      "en": "Methods: steps, conditions, assumptions and limits",
      "zh": "方法：步骤、条件、前提与限制"
    },
    "paragraphs": [
      {
        "en": "The first five tasks concern arranging steps, applying a stated method, checking an output, noticing an unsuitable case and explaining an assumption. For each, look for a specific occasion rather than a broad adjective such as organised. An example can include instructions, assistance, a changed plan or an outcome you would now handle differently.",
        "zh": "前五项涉及安排步骤、应用明示方法、核对产出、发现不适用情况和解释前提。逐项寻找一次具体经历，而不只是“有条理”等笼统评价。实例可以包含说明、帮助、计划变化，或如今会用不同方式处理的结果。"
      },
      {
        "en": "Imagine a fictional study session whose agenda exceeded the time available. Listing the topics and checking materials can still be an example of task planning, even if the schedule did not work. If you revisit it privately, distinguish the intended method, what you actually did and what happened. Recalling it does not establish that the method was effective.",
        "zh": "例如一场虚构学习讨论因议程太多而超时。列话题和核材料仍可成为安排任务的实例，即使排程没有奏效。私下重看时，可区分原定方法、实际做法与结果；记得这件事，并不能证明方法有效。"
      }
    ]
  },
  {
    "id": "tools",
    "title": {
      "en": "Tools: versions, sources, access and recovery",
      "zh": "工具：版本、来源、访问与恢复"
    },
    "paragraphs": [
      {
        "en": "Tasks 6–10 prompt examples of locating a permitted version, organising information, preserving sources during repeated operations, checking access before sharing and undoing or recovering an ordinary change. They do not test commands in a named application. Using a guide, assistive technology or another person’s help belongs to the task context.",
        "zh": "第6—10项提示找到获准版本、整理信息、重复操作时保留来源、分享前核对访问权限，以及撤销或恢复普通改动的实例。它们不考试某个软件的命令；使用指南、辅助技术或他人帮助，都属于任务背景。"
      },
      {
        "en": "A fictional practice copy of an event list might show that you changed a column while keeping the source available. That says which activity you recall, not whether you can perform every function of the software. A current task may use a different version or permission setting; inspect those requirements before assuming an older example transfers unchanged.",
        "zh": "例如在一份虚构活动清单练习副本里，你修改一列并保留了来源。它说明回想的是哪项活动，不证明掌握软件全部功能。当前任务可能使用不同版本或权限，应先核对要求，再判断旧实例是否可直接迁移。"
      }
    ]
  },
  {
    "id": "communication",
    "title": {
      "en": "Communication: your contribution and the shared outcome",
      "zh": "沟通：自身贡献与共同结果"
    },
    "paragraphs": [
      {
        "en": "Tasks 11–15 concern explaining a term, clarifying a handover, recording a decision, considering feedback and adjusting a plan when requirements conflict. An example may use speech, writing, sign or an accessible communication aid. The state choice says nothing about which medium is better or how outgoing you are.",
        "zh": "第11—15项涉及解释术语、澄清交接、记录决定、考虑反馈及要求冲突时调整计划。实例可以使用口语、文字、手语或适合的沟通辅助；所选状态不判断哪种媒介更好，也不评价是否外向。"
      },
      {
        "en": "In a fictional volunteer event, you may have clarified who brings materials but left the opening time unclear. A useful account separates what you communicated, what was checked and what remains unknown about the result. A group outcome cannot be attributed entirely to one person merely because that person attended the discussion.",
        "zh": "例如一次虚构志愿活动中，你澄清了谁带材料，却没有说清开场时间。有用的叙述可区分传达了什么、核对过什么，以及结果还有哪些不确定。仅因参加讨论，不能把团队结果全部归因于自己。"
      }
    ]
  },
  {
    "id": "knowledge",
    "title": {
      "en": "Task knowledge: current sources and the boundary of an answer",
      "zh": "任务知识：当前来源与回答边界"
    },
    "paragraphs": [
      {
        "en": "Tasks 16–20 prompt examples of identifying terms, finding a relevant and current-enough source, applying a rule within its limits, recognising a need for expertise and distinguishing support from uncertainty. The inventory does not check whether your interpretation was correct or whether you hold a professional qualification.",
        "zh": "第16—20项提示识别术语、寻找相关且足够新的来源、在边界内应用规则、识别专业协助需要，以及区分依据与不确定。盘点不核验解释是否正确，也不检查专业资格。"
      },
      {
        "en": "Imagine recalling a community booking rule from an old notice before discovering a newer notice. The example can prompt a question about which version applied in that setting. It does not establish that every older source is wrong. The appropriate source, date, setting and authority must be checked for the actual task rather than inferred from a recent-or-older count.",
        "zh": "例如先按旧通知回想社区预约规则，后来发现新通知。实例可以引出“当时哪个版本适用”的问题，不表示所有旧来源都错。真实任务仍需核对合适来源、日期、情境及相关权威，不能从近期或更早的计数推断。"
      }
    ]
  },
  {
    "id": "counts",
    "title": {
      "en": "How the four counts account for five task records",
      "zh": "四种计数怎样对应五项任务"
    },
    "paragraphs": [
      {
        "en": "Every selected state counts as an answer, including not recorded. All twenty tasks must have a recognised selection before the inventory appears. For each group, count recent, older, explore and not recorded separately. Each count ranges from zero to five and the four counts add to five; the individual task rows remain visible.",
        "zh": "包括暂不记录在内，每个有效选择都算作答；20项均有有效选择后呈现盘点。每组分别清点近期、更早、探索与暂不记录，每项计数为0—5，四种计数合计五，并保留逐任务记录。"
      },
      {
        "en": "For selections recent, older, recent, not recorded, explore, the counts are 2, 1, 1, 1 in that order. Their total is five task records, not five skill points or a success rate. Identical counts can come from different tasks. There are no numeric weights, reverse coding, averages, overall level, strongest cluster or automatic training priority.",
        "zh": "例如依次选择近期、更早、近期、暂不记录、探索，按上述四种状态的顺序清点为2、1、1、1。合计五表示五项任务记录，不是五点技能或成功率；相同计数也可能来自不同任务。没有数值权重、反向计分、均分、整体等级、最强技能集群或自动培训优先级。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "From recalling an event to examining relevant evidence",
      "zh": "从回想事件，到查看相关证据"
    },
    "paragraphs": [
      {
        "en": "A recalled example can start a private note about the task, your contribution, support used, the outcome and what remains uncertain. A relevant work sample, an appropriate observation or a qualification can supply different information. This questionnaire collects none of these materials and does not verify an event or correct self-assessment bias.",
        "zh": "回想实例后，可以私下记录任务、自身贡献、所用支持、结果及仍不确定的部分。相关工作样本、合适的观察或资格证明可提供不同信息。本问卷不收集这些材料、不核实事件，也不纠正自评偏差。"
      },
      {
        "en": "Europass describes recording experiences and supporting documents, while O*NET provides definitions of skill areas and occupational ratings. These references do not endorse the twenty prompts, the twelve-month boundary or the four-state rules. This original inventory has no established reliability, norms, validity or English–Chinese measurement equivalence. [1][2][3]",
        "zh": "Europass介绍记录经历与支持材料，O*NET提供技能领域定义及职业评分；它们不背书本站20项提示、12个月界限或四状态规则。本原创盘点尚未建立信度、常模、效度或英中测量等价性。[1][2][3]"
      }
    ]
  },
  {
    "id": "next-step",
    "title": {
      "en": "Choose one relevant task before choosing a next step",
      "zh": "先选相关任务，再决定下一步"
    },
    "paragraphs": [
      {
        "en": "Start with a task you actually want or need to do. For a recalled example, ask whether its complexity, method and outcome are relevant to the current requirement. For explore, a question about requirements or a small fictional rehearsal may be enough. Not recorded is an acceptable stopping point; it does not automatically identify a deficit or an obligation to train.",
        "zh": "从实际想做或需要做的任务开始。有实例时，核对其复杂度、方法和结果是否与当前要求相关；想探索时，询问要求或做一次虚构小练习可能已足够。暂不记录也是可接受的结束点，不自动说明欠缺，也不产生培训义务。"
      },
      {
        "en": "Keep real documents and other people’s information outside this questionnaire. No upload, course purchase, message to a colleague or practical demonstration is needed to finish. Public sharing copies only the title and link. Use actual task requirements and suitable evidence for consequential decisions; these counts do not certify competence, predict salary or decide a career or hiring outcome.",
        "zh": "真实文件与他人信息保留在问卷之外。完成盘点不要求上传、购课、联系同事或实际演示；公开分享只复制标题与链接。重要决定应看真实任务要求及合适证据，计数不认证胜任、不预测薪资，也不决定职业或录用结果。"
      }
    ]
  }
];
export const skillsAuditFaq = [
  {
    "question": {
      "en": "What does a skills audit mean on this page?",
      "zh": "本页的技能审计具体指什么？"
    },
    "answer": {
      "en": "It is an inventory of recalled examples for twenty original task prompts in four groups. It records example states and counts, rather than inspecting work, grading proficiency or auditing an employer’s workforce.",
      "zh": "指对四组20项原创任务提示进行可回想实例盘点，记录状态与个数，不检查成果、不评熟练度，也不审计企业员工能力。"
    }
  },
  {
    "question": {
      "en": "What are the four task groups?",
      "zh": "四组任务分别是什么？"
    },
    "answer": {
      "en": "Methods and steps; tools and information handling; communication and coordination; task knowledge and its limits. Each has five prompts and its own complete guide. The groups are selected editorial topics, not a complete model of professional competence.",
      "zh": "方法与步骤、工具与信息处理、表达与协同、任务知识及适用边界，每组五项并有完整指南。它们是选定编辑话题，不是专业胜任力的完整模型。"
    }
  },
  {
    "question": {
      "en": "How do five choices become counts of 2, 1, 1, 1?",
      "zh": "五项选择怎样得到2、1、1、1？"
    },
    "answer": {
      "en": "Recent, older, recent, not recorded, explore contains two recent, one older, one explore and one not recorded. The counts add to five because each task appears once; they carry no numeric weights or proficiency meaning.",
      "zh": "近期、更早、近期、暂不记录、探索，包含两个近期、一个更早、一个探索和一个暂不记录。合计五是因为每项任务记录一次，没有数值权重或熟练度含义。"
    }
  },
  {
    "question": {
      "en": "Do the same counts mean the same skill profile?",
      "zh": "计数相同代表技能相同吗？"
    },
    "answer": {
      "en": "No. Two people can have counts of 2, 1, 1, 1 while choosing recent for different tasks. They may also recall different complexity, support and outcomes. The individual rows matter; the inventory cannot rank competence.",
      "zh": "不代表。两个人都可能是2、1、1、1，却在不同任务上选择近期；经历的复杂度、支持与结果也可能不同。应看逐项记录，盘点不能排名胜任力。"
    }
  },
  {
    "question": {
      "en": "Can study, volunteering or everyday life provide examples?",
      "zh": "学习、志愿活动和日常生活也能提供实例吗？"
    },
    "answer": {
      "en": "Yes. A relevant event can come from those settings as well as paid work or a hobby. Receiving help does not exclude an example. Its actual setting, support and outcome would matter when considering a particular requirement.",
      "zh": "可以。实例可来自这些情境，也可来自有偿工作或爱好；获得帮助不排除实例。考虑具体要求时，仍需看实际背景、支持和结果。"
    }
  },
  {
    "question": {
      "en": "Is no recalled example the same as no ability?",
      "zh": "想不到实例等于没有能力吗？"
    },
    "answer": {
      "en": "No. Recall, opportunity, access, relevance and a choice not to answer can affect the state selected. Explore expresses willingness to consider that activity, not a measured training deficit. No state proves competence or incompetence.",
      "zh": "不等于。记忆、机会、接触条件、相关性和不愿回答都可能影响状态；探索表达愿意了解该活动，不是测得的培训缺口。任何状态都不证明胜任或不胜任。"
    }
  },
  {
    "question": {
      "en": "What changes if I retake the inventory?",
      "zh": "重做盘点后，变化说明什么？"
    },
    "answer": {
      "en": "It records newly selected states. You might recall an event you had forgotten, have a new experience or move beyond the twelve-month boundary. A count change is not a calibrated improvement or decline in skill.",
      "zh": "它记录新选择的状态。可能想起之前忘记的事件、有了新经历，或经历跨过12个月界限。计数变化不是经校准的技能提升或下降。"
    }
  },
  {
    "question": {
      "en": "Will Start test open the first task directly?",
      "zh": "点击开始测试会直接进入首项吗？"
    },
    "answer": {
      "en": "Yes. No additional agreement screen unlocks the questionnaire. Draft saving is optional after entry. All-not-recorded can finish, and every complete public guide can be read without answering.",
      "zh": "会。不通过额外同意页面解锁问卷，进入后保存草稿仍为自选。全部暂不记录也能完成，不作答也可阅读全部完整公开指南。"
    }
  }
];
export const skillsAuditSummaries: Record<string, Text> = {
  "methods-reading": {
    "en": "Revisit task steps, methods, checks, limits and assumptions through a five-record count example, a fictional planning task and an optional next question.",
    "zh": "通过五项计数算例、虚构规划任务及自选问题，重看步骤、方法、核对、限制与前提实例。"
  },
  "tools-reading": {
    "en": "Read examples of versions, information handling, source preservation, access and recovery without converting a tool-use memory into software proficiency.",
    "zh": "阅读版本、信息处理、来源保留、访问与恢复实例，不将工具使用记忆转换成熟练度。"
  },
  "communication-reading": {
    "en": "Separate your communication contribution from a group outcome, using task-specific records, a handover example and voluntary reflection.",
    "zh": "结合逐项记录、交接情境与自愿反思，区分自身沟通贡献和团队结果。"
  },
  "domain-reading": {
    "en": "Examine sources, rules, expertise and uncertainty with a complete count example and a bounded question about current task requirements.",
    "zh": "结合完整计数算例及当前任务要求问题，查看来源、规则、专业协助与不确定性的实例。"
  }
};
