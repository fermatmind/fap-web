import type { Questionnaire } from "@/lib/questionnaires/types";
export const careerThemesLandingSections: Questionnaire["guide"] = [
  {
    "id": "career-reading-scope",
    "title": {
      "en": "Career Match: an interest-theme comparison, with you choosing the careers",
      "zh": "职业匹配：由你选择职业的兴趣主题比较"
    },
    "paragraphs": [
      {
        "en": "Career Match connects a small set of interests you select to the published interest codes of two or three occupations. You choose both the themes and the careers; the tool then shows their shared letters and the accompanying career explanations. It is useful when you already have several possibilities and want a consistent starting point for comparing them.",
        "zh": "职业匹配工具把你选择的一组兴趣主题与两个或三个职业的已发布兴趣代码连接起来。主题和职业都由你选择，工具展示共有字母及相应职业解释，适合已经有几个候选方向、希望用同一线索展开比较的读者。"
      },
      {
        "en": "This page does not infer interests from a questionnaire or generate a ranked list of recommended jobs. Its output is a transparent comparison of the choices you made and the profiles it could read. You can open the full occupation pages to investigate tasks and entry requirements before deciding which possibilities deserve more attention.",
        "zh": "本页不通过问卷推断兴趣，也不生成按适配程度排序的推荐职业榜。输出是你所选主题与本次成功读取档案之间的透明比较；可以继续打开完整职业页，核对任务与入门要求，再决定哪些方向值得深入了解。"
      }
    ]
  },
  {
    "id": "career-reading-construct",
    "title": {
      "en": "What RIASEC contributes to a career comparison",
      "zh": "RIASEC为职业比较提供什么"
    },
    "paragraphs": [
      {
        "en": "RIASEC organizes broad occupational interests into Realistic, Investigative, Artistic, Social, Enterprising and Conventional themes. The vocabulary helps describe kinds of work activities: making or repairing, investigating, creating, helping, influencing and organizing information. The official O*NET overview below offers a reference for these six broad areas.",
        "zh": "RIASEC将宽泛职业兴趣整理为现实型、研究型、艺术型、社会型、企业型与常规型六个主题，用于描述制作维修、探究分析、创作表达、帮助他人、影响协商与组织信息等活动。下方O*NET官方说明可作为理解这六类宽泛领域的参考。"
      },
      {
        "en": "Selecting a theme here means you want to examine it, not that you obtained a measured score on it. You may keep several equally relevant themes without ordering them. An occupation code describes the published profile being read; it is not a measurement of your personality or proof that every job with that title has identical activities.",
        "zh": "在这里勾选主题，表示你想考察它，不表示已经测得该维度分数。多个同样相关的主题可以全部保留，无需排序。职业代码描述本次读取的已发布档案，不是对你人格的测量，也不证明所有同名岗位具有相同活动。"
      }
    ]
  },
  {
    "id": "career-reading-example",
    "title": {
      "en": "A worked example: selected themes and a published code",
      "zh": "完整算例：所选主题与已发布代码"
    },
    "paragraphs": [
      {
        "en": "Suppose you select A and S, and a fictional example profile has the code ASE. The shared themes are A and S; neither of your selected themes lies outside that code. For a second example code RIC, there is no shared selected theme, and A and S both appear in the outside-code explanation. These are examples of the rule, not claims about named occupations.",
        "zh": "假设你勾选A和S，一个虚构示例档案的代码是ASE。共有主题就是A和S，你所选主题中没有字母落在该代码之外。第二个示例代码若为RIC，则没有共有的所选主题，A和S都会出现在代码之外的说明中。这只是规则示例，不对应任何具名职业结论。"
      },
      {
        "en": "The tool tests letter membership, not letter position: ASE and SAE share the same selected letters in this comparison. It does not weight the first letter, divide shared letters by three or turn the result into a percentage. Roles stay in the order you chose them, so the first result is not a first-place recommendation.",
        "zh": "工具判断的是字母是否出现，而不是字母的位置；在本次比较中，ASE和SAE包含的共有字母相同。它不为首字母加权，不用共有字母数除以三，也不换算百分比。职业保留你的选择顺序，第一张结果并不意味着推荐第一名。"
      }
    ]
  },
  {
    "id": "career-reading-coverage",
    "title": {
      "en": "Why more shared themes do not decide between careers",
      "zh": "为什么共有主题更多仍不能替你选择职业"
    },
    "paragraphs": [
      {
        "en": "Choosing all six themes will retain every letter from each readable occupation code. That is a consequence of the selection rule, not evidence that every occupation fits you equally well. Choosing only one theme makes the comparison narrower but does not establish how strongly you enjoy it or how central it is to a particular job.",
        "zh": "勾选全部六项时，每个可读取职业代码中的字母都会被保留。这是选择规则的结果，不证明每个职业都同样适合你。只选一个主题会缩小比较范围，但仍未确定你喜欢它的强度，也未确定它在具体岗位中占多大比重。"
      },
      {
        "en": "A short code cannot carry an occupation’s entire activity profile. A theme missing from the code may still occur in some tasks, and two occupations with the same code may differ in tools, work setting, training and responsibilities. Read the full descriptions rather than treating the short code as an exhaustive task list.",
        "zh": "短代码无法容纳一个职业的完整活动结构。未出现在代码中的主题仍可能涉及部分任务；同代码职业也可能在工具、工作环境、培训与职责方面不同。应继续阅读完整说明，而不是把短代码视为穷尽所有任务的清单。"
      }
    ]
  },
  {
    "id": "career-reading-action",
    "title": {
      "en": "From broad themes to a practical investigation",
      "zh": "从宽泛主题走向实际职业调查"
    },
    "paragraphs": [
      {
        "en": "For each selected career, identify one ordinary task that attracts you and one condition you need to understand. For example, interest in helping people can lead to questions about whom the role serves, how support is delivered and how much documentation is involved. Use the actual profile to formulate the questions rather than assuming that a theme specifies the whole working day.",
        "zh": "对每个候选职业，先找一项吸引你的普通任务，再找一项仍需了解的条件。例如，喜欢帮助他人可以引出服务谁、怎样提供支持、记录文书占多少等问题。应根据实际档案提出问题，而不是假设一个主题就能概括整天的工作。"
      },
      {
        "en": "Compare the careers using the same practical criteria: typical tasks, learning requirements, working conditions and local opportunities. Where appropriate, supplement reading with an informational conversation, an introductory course or a safe sample task. These activities add evidence about your preferences and circumstances; the theme intersection itself does not supply that evidence.",
        "zh": "继续用相同的实际标准比较职业：典型任务、学习要求、工作条件与当地机会。条件允许时，可通过从业者访谈、入门课程或安全的任务体验补充阅读。这些活动增加对自身偏好与现实条件的了解；主题交集本身并不提供这些证据。"
      }
    ]
  },
  {
    "id": "career-reading-data",
    "title": {
      "en": "Current-language sources and incomplete comparisons",
      "zh": "当前语言资料与不完整的比较"
    },
    "paragraphs": [
      {
        "en": "The occupation list is read after you start. Only the two or three profiles you select are requested for the comparison, in the current language. Filtering titles changes the choices visible on this page; it does not send the filter text or automatically select careers based on your interests.",
        "zh": "开始后才读取职业目录；比较时只请求你选择的两个或三个当前语言档案。筛选名称只改变本页可见选项，不发送筛选文字，也不根据兴趣自动替你选择职业。"
      },
      {
        "en": "If a list is unavailable, empty, or a selected profile cannot provide usable current interest information, the page keeps that state visible. An unreadable profile does not receive a zero-interest score, a guessed code or a replacement career. You can retry or open the linked career page, while interpreting a partial comparison as partial.",
        "zh": "目录不可用、目录为空，或某个档案不能提供可用的当前兴趣信息时，页面会保留相应状态。不可读取的档案不会得到零兴趣分、猜测的代码或替代职业。可以重试或打开关联职业页；部分比较仍应按部分结果理解。"
      }
    ]
  },
  {
    "id": "career-reading-evidence",
    "title": {
      "en": "A research framework and a transparent rule are different evidence",
      "zh": "理论依据与透明规则分别说明什么"
    },
    "paragraphs": [
      {
        "en": "A vocational-interest framework provides a vocabulary for discussing activities and environments. A questionnaire based on that framework still needs evidence for its own items, language, scoring and use. O*NET documents its own Interest Profiler separately; this page does not administer that instrument or inherit its measurement evidence.",
        "zh": "职业兴趣框架为讨论活动与环境提供词汇。依据框架设计的问卷，仍需针对自身题目、语言、计分和用途取得证据。O*NET另有自身Interest Profiler的说明；本页并未施测该工具，也不继承其测量证据。"
      },
      {
        "en": "Here, the rule can be checked directly because it is a literal set intersection. Reproducible arithmetic establishes what the displayed shared letters mean. It does not establish predictive validity for satisfaction, performance or hiring. Those are different questions requiring suitable outcome data and a defined population.",
        "zh": "本页采用直接的集合交集，因此规则可逐字母核对。可复算的运算说明共有字母如何产生，但不建立对满意度、绩效或录用的预测效度；这些是不同问题，需要相应结果数据与明确适用人群。"
      }
    ]
  },
  {
    "id": "career-reading-privacy",
    "title": {
      "en": "Keep your comparison private and your next step optional",
      "zh": "保留私人比较，自主决定下一步"
    },
    "paragraphs": [
      {
        "en": "Theme selections, selected careers and filter text stay in this page’s memory. Clearing, leaving, reloading or switching language removes that local input. The page reads public career data to make a comparison; it does not offer a saved personal career account or a cross-language recovery of your selection.",
        "zh": "主题选择、所选职业与筛选文字仅保留在本页内存。清除、离开、刷新或换语言会移除这些本地输入。页面读取公开职业数据进行比较，不提供已保存的个人职业账户或跨语言恢复选择。"
      },
      {
        "en": "Copy public entry shares the title and public page link only, not your selected themes or careers. You may finish here or read the linked career profiles. The separate RIASEC questionnaire is an optional route for another kind of exploration, not a prerequisite, identity check or step required to reveal this comparison.",
        "zh": "“复制公开入口”只分享标题与公开页面链接，不包含所选主题或职业。可以在此结束，也可继续阅读关联职业档案。独立RIASEC问卷是另一种可选探索入口，不是查看本次比较的前置测试、身份检查或解锁步骤。"
      }
    ]
  }
];
export const careerThemesLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Does the first career shown rank highest?",
      "zh": "最先展示的职业排名最高吗？"
    },
    "answer": {
      "en": "No. Results preserve the order in which you selected the careers. Shared themes are shown for each profile without sorting occupations by suitability.",
      "zh": "不是。结果保留你选择职业的顺序，分别展示每个档案的共同主题，不按适合程度排序。"
    }
  },
  {
    "question": {
      "en": "Can I enter a previous RIASEC result?",
      "zh": "可以使用以前的RIASEC结果吗？"
    },
    "answer": {
      "en": "You can manually select themes you want to investigate, including themes from a result you have already read. The tool does not import, verify, rank or rescore that earlier result.",
      "zh": "可以手动勾选想考察的主题，包括你已经阅读过的结果中的主题。本工具不导入、核验、排序或重新计分此前结果。"
    }
  },
  {
    "question": {
      "en": "What happens if I choose all six themes?",
      "zh": "六项全选会怎样？"
    },
    "answer": {
      "en": "Every letter in a readable occupation code will also be in your selection. This follows from the rule and is not a finding that all careers fit you. Narrow the selection only when that reflects the question you actually want to explore.",
      "zh": "可读取职业代码中的每个字母都会出现在所选主题中。这来自规则本身，不表示所有职业都适合你。是否缩小选择，应取决于你实际想探索的问题。"
    }
  },
  {
    "question": {
      "en": "Do ASE and SAE produce different overlaps?",
      "zh": "ASE和SAE会得到不同交集吗？"
    },
    "answer": {
      "en": "Not for the same selected themes. This tool checks whether each selected letter appears in the short code, without weighting its position. The original published code remains visible.",
      "zh": "相同主题选择下不会。本工具只判断所选字母是否出现在短代码中，不按位置加权；原始已发布代码仍会展示。"
    }
  },
  {
    "question": {
      "en": "Does no shared theme eliminate a career?",
      "zh": "没有共有主题就应该排除该职业吗？"
    },
    "answer": {
      "en": "No. It says only that your chosen letters do not occur in that published short code. Examine the full tasks and your reasons for considering the career before drawing a conclusion.",
      "zh": "不能。它只说明你勾选的字母没有出现在该已发布短代码中。应继续核对完整任务与自己考虑该职业的原因，再作判断。"
    }
  },
  {
    "question": {
      "en": "Why can careers with the same code feel different?",
      "zh": "为什么相同代码的职业仍可能很不同？"
    },
    "answer": {
      "en": "The short code summarizes broad interests. Work setting, tools, responsibilities, qualifications and specific tasks can still differ. Read each occupation’s own profile.",
      "zh": "短代码概括宽泛兴趣；工作环境、工具、职责、资格与具体任务仍可能不同，需要分别阅读各职业档案。"
    }
  },
  {
    "question": {
      "en": "Can I compare before taking a questionnaire?",
      "zh": "没有先做问卷也能比较吗？"
    },
    "answer": {
      "en": "Yes. Start comparison opens the selection flow directly. Choose at least one theme and two different occupations; a third occupation is optional. There is no prerequisite personality test.",
      "zh": "可以。“开始比较”直接进入选择流程。至少勾选一个主题、选择两个不同职业，第三个职业可选，无需先完成人格测试。"
    }
  },
  {
    "question": {
      "en": "Will copying the link expose my choices?",
      "zh": "复制链接会暴露我的选择吗？"
    },
    "answer": {
      "en": "The copy action includes only the public title and entry URL. It omits selected themes, careers and filter text; the public link does not recreate your comparison.",
      "zh": "复制动作只包含公开标题和入口网址，不含主题、职业选择或筛选文字；公开链接不会还原你的比较结果。"
    }
  }
];
