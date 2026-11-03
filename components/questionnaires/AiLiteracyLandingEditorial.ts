import type { Questionnaire } from "@/lib/questionnaires/types";

export const aiLiteracyLandingSections: Questionnaire["guide"] = [
  {
    "id": "ai-literacy-scope",
    "title": {
      "zh": "人工智能素养测试练什么？四类知识与情境判断",
      "en": "What does this AI Literacy Test practise? Four knowledge and judgement topics"
    },
    "paragraphs": [
      {
        "zh": "AI素养既涉及理解技术，也涉及判断用途和影响。UNESCO学生框架包含以人为本、AI伦理、技术应用和系统设计四个方面；它是课程框架，不是本站分数标准。[3] 本页是20道原创知识单选，模型与数据、提示与工具、输出核查、隐私与判断各五题。每题依据明示条件选答案。",
        "en": "AI literacy concerns understanding technology as well as judging uses and consequences. UNESCO’s student framework covers human-centred thinking, ethics, techniques and applications, and system design; it is a curriculum framework, not this page’s scoring standard.[3] This original twenty-question exercise has five items each on Models and Data, Prompts and Tools, Checking Outputs, and Privacy and Judgement. Answer using the conditions actually stated."
      },
      {
        "zh": "本页不调用模型，不检索你的文件，也不以操作某个厂商产品为前提。虚构情境允许你检查输入、推理和动作证据，不需要编程、购买订阅或上传聊天。答对数概括这20题上的选择；能解释一个知识点、能在实际任务中运用以及取得怎样的工作结果，是不同层次的证据。",
        "en": "The page runs no AI model, retrieves no files of yours and requires no vendor-specific workflow. Fictional scenarios let you inspect inputs, reasoning and action evidence without coding, subscriptions or chat uploads. Counts summarize choices on these twenty items. Explaining a concept, applying it in a real task and achieving a work outcome require different evidence."
      }
    ]
  },
  {
    "id": "ai-context-training",
    "title": {
      "zh": "模型与数据：区分上下文、训练与外部检索",
      "en": "Models and data: distinguish context, training and retrieval"
    },
    "paragraphs": [
      {
        "zh": "OECD的定义说明将输入转为输出的推理与系统构建联系起来，同时承认系统的自主性、部署后适应方式可以不同。[1] 本题明确参数固定时，给一段新资料可影响当前回答，但不能由此推断参数已改变、资料永久记忆或所有未来会话都会知道它。",
        "en": "The OECD memorandum connects inference from inputs to outputs with system construction while recognizing variation in autonomy and adaptation after deployment.[1] When an item fixes the parameters, a newly supplied passage can influence the current answer without establishing changed parameters, permanent memory or availability in every future session."
      },
      {
        "zh": "同一产品可结合生成、分类、检索和确定性计算。新例：从三条展览笔记起草邀请是生成文本，按既定标签给笔记分类是分类，按日期查清单是检索。先看任务实际要求哪种输出，再核系统有哪些输入和工具；不能从产品名称或回答流畅程度，推定它进行了哪项操作。",
        "en": "One product can combine generation, classification, retrieval and deterministic calculation. Fresh example: drafting an invitation from three exhibition notes generates text, assigning fixed labels classifies notes, and looking up a date retrieves a record. Identify the requested output and available inputs and tools; neither a product name nor fluency establishes which operation occurred."
      }
    ]
  },
  {
    "id": "ai-prompts-verification",
    "title": {
      "zh": "提示与修改：让要求可检查，让修改对应实际缺口",
      "en": "Prompts and revision: make requirements inspectable and corrections specific"
    },
    "paragraphs": [
      {
        "zh": "一个可检查的请求可以说明任务、读者、允许来源、格式和缺失信息的处理。例如只据三条虚构场地笔记为志愿者写两条提醒，未提供的开放日期标为待确认。写清要求只是提供约束，不能代替检查生成结果。若实际少了一条例外，就指出源中对应段落，再复核新稿有没有准确保留。",
        "en": "An inspectable request states the task, audience, permitted sources, format and handling of missing information. For example, ask for two volunteer reminders from three fictional venue notes and mark an unspecified opening date unconfirmed. Instructions supply constraints rather than prove compliance. If an exception is omitted, identify the source passage and check its accurate inclusion in the revision."
      },
      {
        "zh": "新例：笔记规定开放日为周六，但遇设备维护改为另行通知。草稿只写“每周六开放”，修改应补回条件，而不是把语气改得更肯定。可用“主张—对应原文—保留的条件”三列逐条检查；检索到文档只建立取得资料的事实，文档是否相关、是否最新及是否支持摘要仍需分别核对。",
        "en": "Fresh example: notes specify Saturday opening except during equipment maintenance, when notice will follow. A draft saying “open every Saturday” needs the condition restored, not a more confident tone. Compare each claim with its source passage and retained conditions. Retrieving a document establishes access; relevance, currency and support for the summary remain separate checks."
      }
    ]
  },
  {
    "id": "ai-source-instructions",
    "title": {
      "zh": "工具与权限：来源文字、执行记录和用户授权分别看",
      "en": "Tools and permissions: separate source text, execution records and authorization"
    },
    "paragraphs": [
      {
        "zh": "外部页面可能含试图改变任务的指令。OWASP将来自网站、文件等外部资料的这类风险称为间接提示注入；检索增强或微调本身并不能彻底消除它。[4] 本页只用无害虚构句子练习区分“要总结的资料”和“有权改变任务的指令”，不实际连接或执行外部操作。",
        "en": "External pages can contain instructions that redirect a task. OWASP describes injection through websites or files as indirect prompt injection; retrieval augmentation or fine-tuning alone does not eliminate it.[4] This page uses harmless fictional sentences to distinguish material to summarize from instructions authorized to change the task. It connects to or executes no external action."
      },
      {
        "zh": "能做、获准做、已经做成是三个问题。新例：助手有日历工具，但只获准起草议程，不能因工具存在就修改日历；若用户已经明确授权添加安排，则应按该授权处理。文字说“安排已添加”仍应有真实工具结果支撑。测试不要求对已授权动作反复确认，也不把发送尝试等同收件成功。",
        "en": "Capability, authorization and completion are different questions. Fresh example: an assistant with a calendar tool authorized only to draft an agenda cannot thereby change the calendar. Explicit authorization to add an event changes that boundary. “Event added” still needs an actual tool result. The exercise requires no repeated confirmation of authorized work and does not equate attempted sending with confirmed receipt."
      }
    ]
  },
  {
    "id": "ai-claim-checks",
    "title": {
      "zh": "输出核查：事实支持、算术与数据类型各有核法",
      "en": "Checking outputs: claims, arithmetic and data types need different checks"
    },
    "paragraphs": [
      {
        "zh": "NIST把自信呈现错误或虚假内容列为生成式AI风险，并建议核对输出中的来源与引用。[2] 参考文献存在，不代表它支持附在旁边的每个结论。检查作者实际研究了谁、什么任务、何种条件和结果；不把一项特定发现扩大成所有用户、所有工具或所有工作的效果。",
        "en": "NIST identifies confidently presented erroneous content as a generative-AI risk and recommends checking sources and citations.[2] An existing reference does not support every claim beside it. Inspect the population, task, conditions and outcome actually studied rather than generalizing one finding to every user, tool or job."
      },
      {
        "zh": "新例：表中仅12、19和24，合计为55；若草稿写57，应按原值重算，不能改表迁就草稿。JSON也要分两层检查：{\"count\":\"4\"}可解析，但count是字符串，不满足整数要求；{\"count\":4}才给数值。JSON Schema按数值判断整数，4.0也可表达整数值，不能仅凭有无小数点判断。[5]",
        "en": "Fresh example: a table containing only 12,19 and 24 totals 55; correct a draft’s 57 from those values instead of changing the table. JSON needs separate syntax and type checks: {\"count\":\"4\"} parses but supplies a string, whereas {\"count\":4} supplies a number. JSON Schema treats integral values as integers, including 4.0, rather than deciding from the decimal point alone.[5]"
      }
    ]
  },
  {
    "id": "ai-evaluation-samples",
    "title": {
      "zh": "模型评估：独立样本、分母与分组错误",
      "en": "Model evaluation: held-out examples, denominators and subgroup errors"
    },
    "paragraphs": [
      {
        "zh": "训练、验证和最终测试承担不同职责。Google的课程用例说明，反复按测试结果调参，会逐渐针对测试集本身优化；重复样本也可能泄漏信息。[6] 留出样本应与实际用途相关。只测清晰扫描没有证明模糊扫描效果，也没有证明后者必然失败。列出未覆盖条件，才能知道下一步该测什么。",
        "en": "Training, validation and final testing have different roles. Google’s course explains how repeated tuning against test results can fit that test set, while duplicated examples can leak information.[6] Held-out examples must also fit the intended use. Testing clean scans establishes neither success nor failure on blurred scans. Identify uncovered conditions to choose the next evaluation."
      },
      {
        "zh": "新例：24例答对20例，观察到的比例为83.33%左右，应同时报告分母和四例错误。若A组20例错1，B组5例错2，总体错误率3／25＝12%，但分组为5%和40%。总体会遮住差异；小样本也存在不确定性。这个虚构算例不指定人口群体、公平指标或通用合格线，更不把样本比例当作个人未来成功概率。",
        "en": "Fresh example:20 correct cases out of 24 give about 83.33%, reported with the denominator and four misses. If groupA has one error in 20 and groupB two in five, the aggregate is 3/25=12% while groups show 5% and 40%. Aggregation can hide differences and small samples remain uncertain. This fictional example prescribes no demographic grouping, fairness metric or pass threshold and predicts no individual’s future success."
      }
    ]
  },
  {
    "id": "ai-privacy-judgement",
    "title": {
      "zh": "隐私与负责判断：使用有权提供的资料，按实际规则行动",
      "en": "Privacy and responsible judgement: use authorized material and actual rules"
    },
    "paragraphs": [
      {
        "zh": "免费使用工具不自动赋予上传内部资料的权限；只删除标题，也不能证明其余内容没有识别或机密信息。可改用独立编写的虚构资料练习，实际服务的访问、保留和训练设置则需查看相应文档。本站只要求单选，不需要你的文件、密码、客户名单或真实聊天记录。",
        "en": "Free tool access does not authorize uploading internal information, and removing a title does not establish that identifying or confidential details are gone. Practise with independently written fictional material; consult actual service documentation for access, retention and training settings. This quiz asks only for choices, without files, passwords, customer lists or real chats."
      },
      {
        "zh": "遇到影响真人的重要提议，应核相关证据、实际职责和适用规则；不是把判断责任转给一段生成文字。课程允许AI列提纲并要求说明时，就准确说明辅助范围，再核提交内容；其他课程可能规则不同。UNESCO强调人的判断与责任，[3] 但知识题得分本身不评价你的道德品质或授予处理他人的权限。",
        "en": "For consequential proposals about people, inspect evidence, actual responsibilities and applicable rules instead of transferring judgement to generated prose. If a course permits AI outlining with disclosure, describe that assistance accurately and check the submission; other courses may differ. UNESCO emphasizes human judgement and responsibility,[3] but a quiz count neither rates moral character nor authorizes decisions about others."
      }
    ]
  },
  {
    "id": "ai-measurement-revision",
    "title": {
      "zh": "20题怎样计分？知识练习、测量研究与完整复习",
      "en": "How are twenty items scored? Practice counts, measurement research and full revision"
    },
    "paragraphs": [
      {
        "zh": "每题匹配答案记1，其他有效选择记0；四组各五题，完整20题后显示分组与总答对数，无负分、速度权重或最高项分型。新例2、4、3、5合计14／20；相同14分可以来自不同错误。无需注册、邮箱、付款或先同意保存，开始直接进入题目。所有分数均开放20题解析、四篇各七节完整指南。",
        "en": "A keyed answer earns one and another valid choice zero. Four five-item groups produce group and total counts after all twenty choices, without penalties, speed weighting or a highest-group type. Fresh example:2,4,3 and 5 total 14/20; equal totals can hide different errors. Start opens questions directly without registration, email, payment or agreement to save. Every count receives twenty explanations and four seven-section guides."
      },
      {
        "zh": "GLAT研究对它自己的20题工具开展了条目、结构与外部效度研究，样本来自高等教育学生；论文也指出任务情境和英语版本的限制。[7] 本站是另一份原创题本，没有对应的信效度、常模或语言等值证据，不能借用GLAT结论。复习可改输入、权限或样本，解释新答案；看过原答案后升分，不能单独证明真实技能或生产力提高。",
        "en": "GLAT studied item properties, structure and external validity for its own twenty-item instrument among higher-education students, noting task-context and English-language limits.[7] This is a different original bank without established reliability, validity, norms or language equivalence; GLAT findings do not transfer. Revise by changing inputs, permissions or samples and explaining new answers. Improved recall of fixed keys alone establishes neither practical skill nor productivity gains."
      }
    ]
  }
];

export const aiLiteracyLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "这是ChatGPT操作考试或AI能力认证吗？",
      "en": "Is this a ChatGPT operation exam or an AI certification?"
    },
    "answer": {
      "zh": "不是。它按明示条件考查概念与判断，不运行模型、不评价实际提示效果，也不授厂商或机构资格。没有订阅或编程经验也可完成。",
      "en": "No. It checks concepts and judgements under stated conditions without running a model, measuring real prompting or awarding a vendor or institutional qualification. No subscription or coding experience is required."
    }
  },
  {
    "question": {
      "zh": "给模型新段落，就等于训练了模型吗？",
      "en": "Does supplying a new paragraph mean the model was trained?"
    },
    "answer": {
      "zh": "不能这样推定。本题参数固定时，段落影响当前上下文；参数更新、未来记忆和服务保留是另一些问题，须按系统具体条件核实。[1]",
      "en": "Not by itself. With fixed parameters, the passage affects current context. Parameter updates, later memory and service retention are separate questions requiring system-specific evidence.[1]"
    }
  },
  {
    "question": {
      "zh": "写了“只根据资料”，就保证回答有依据吗？",
      "en": "Does saying “use only the source” guarantee a supported answer?"
    },
    "answer": {
      "zh": "不保证。要将实际输出与源中条件逐项对照，检查遗漏、增加、日期和引用。清楚提示有助于说明要求，不能代替输出验证。",
      "en": "No. Compare the actual output with source conditions, checking omissions, additions, dates and citations. A clear prompt communicates requirements without replacing verification."
    }
  },
  {
    "question": {
      "zh": "合法JSON一定符合所需格式吗？",
      "en": "Does valid JSON necessarily meet the requested structure?"
    },
    "answer": {
      "zh": "不一定。语法可解析与字段、类型、范围符合是不同检查。例如带引号的数字仍是字符串，不满足整数值要求。[5]",
      "en": "No. Parsing and compliance with fields, types and ranges are separate checks. A quoted number remains a string and fails an integer-value requirement.[5]"
    }
  },
  {
    "question": {
      "zh": "留出样本与训练样本分开，就能保证真实表现吗？",
      "en": "Does separating test and training data guarantee real-world performance?"
    },
    "answer": {
      "zh": "不能保证。还要看重复信息、反复调参、代表性和实际用途。未覆盖条件应明确记录，不把有限结果推广到所有场景。[6]",
      "en": "No. Duplicated information, repeated tuning, representativeness and intended use still matter. Record uncovered conditions rather than generalizing finite results to every setting.[6]"
    }
  },
  {
    "question": {
      "zh": "四项都是五题，可以据分数判定哪项专业能力最强吗？",
      "en": "Can equal five-item groups establish my strongest professional skill?"
    },
    "answer": {
      "zh": "不能。题数一致不代表难度或测量尺度相同。分项帮助定位哪些具体知识还需复习，不产生专业等级、岗位结论或人群排名。",
      "en": "No. Equal item counts do not establish equal difficulty or a shared measurement scale. Groups locate knowledge for revision without professional tiers, job conclusions or population rankings."
    }
  },
  {
    "question": {
      "zh": "AI说已执行，我应看什么证据？",
      "en": "What evidence matters when AI says an action was completed?"
    },
    "answer": {
      "zh": "先核工具是否具备能力、是否获授权，再核实际执行结果。草稿、尝试和完成不同，发送记录也不一定证明收件成功。此测验不执行任何真实邮件或发布。",
      "en": "Check capability and authorization, then the actual execution result. Drafts, attempts and completion differ; a sending record may not establish receipt. This quiz performs no real email or publication action."
    }
  }
];

export const aiLiteracyLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "zh": "Jin等（2024）：GLAT生成式AI素养测验，方法与限制",
      "en": "Jin et al. (2024): GLAT, methods and limitations"
    },
    "url": "https://arxiv.org/html/2411.00283v2"
  }
];
