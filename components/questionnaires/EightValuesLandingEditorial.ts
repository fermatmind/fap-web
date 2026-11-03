import type { Questionnaire } from "@/lib/questionnaires/types";

export const eightValuesLandingSections: Questionnaire["guide"] = [
  {
    "id": "eight-model-scope",
    "title": {
      "zh": "8 Values测试是什么？四轴与八个互补端点",
      "en": "What is the 8 Values Test? Four axes and eight complementary poles"
    },
    "paragraphs": [
      {
        "zh": "8values以经济、外交、公民与社会四条轴整理对政策和公共生活陈述的回应。本页保留固定MIT开源版本的70条英文及正负权重，配本版中文翻译；“八项”指四轴各有两端，而不是八个彼此独立的人格维度。[1] 名称相同的修改版可能更换题目、顺序、权重或解释，比较结果前应先确认版本。",
        "en": "8values summarizes responses to policy and public-life statements on economic, diplomatic, civil and societal axes. This edition preserves seventy English statements and signed weights from an identified MIT-licensed revision, with this edition’s Chinese translation. Eight values means two poles per axis, not eight independent personality dimensions.[1] Modified editions can change items, order, weights or interpretation; identify the version before comparing results."
      },
      {
        "zh": "四组显示为平等—市场、全球—国家、公民自由—权威、进步—传统。可先选一轴看具体议题，再把互补端放在一起读。经济、公共权力、国际合作与社会变化不必形成同一种倾向；这里的四条计算轴，也不等于研究已证明它们在任何人群中统计独立。",
        "en": "The pairs are Equality–Markets, Globe–Nation, Liberty–Authority and Progress–Tradition. Start with the actual issues on one axis and read both poles together. Economic policy, public power, international cooperation and social change need not point in one direction. Four separately calculated axes also do not establish statistical independence in every population."
      }
    ]
  },
  {
    "id": "eight-economic-pair",
    "title": {
      "zh": "经济轴：分配、公共供给与市场安排",
      "en": "Economic axis: distribution, public provision and market arrangements"
    },
    "paragraphs": [
      {
        "zh": "平等端在这份题本中关联分配、公共供给及部分经济干预，市场端为其显示互补。名称是汇总约定：经济轴平等百分数不能概括所有意义上的平等，市场百分数也不衡量经济知识、工作能力或利他程度。先看你对各项陈述的具体回应，再解释汇总位置。",
        "en": "Equality in this bank concerns distribution, public provision and some economic intervention; Markets is its displayed complement. These names are aggregation conventions. Economic Equality does not cover every meaning of equality, and Markets does not measure economic knowledge, work ability or altruism. Interpret the aggregate through the actual responses."
      },
      {
        "zh": "新例：两位虚构读者都支持维护同一个社区设施，却对资金来源与运营方式有不同看法。他们可以在一个议题上相同，而经济轴结果不同；也可能经由不同答案抵消而得到同数。结果适合提出“分歧在哪项安排”的讨论问题，不能补写题目没问过的动机。",
        "en": "Fresh example: two fictional readers support maintaining the same community facility but disagree about funding and operation. Agreement on one issue can coexist with different economic totals; different answers can also offset to the same total. Use the result to locate a disagreement about arrangements rather than supply motives the questionnaire never asked about."
      }
    ]
  },
  {
    "id": "eight-diplomatic-pair",
    "title": {
      "zh": "外交轴：国家决策与跨国合作的不同问题",
      "en": "Diplomatic axis: national decisions and different kinds of international cooperation"
    },
    "paragraphs": [
      {
        "zh": "全球—国家这一对涉及题本中的跨国机构、合作、主权及国家力量等陈述。“全球较高”不自动代表支持所有国际安排，“国家较高”也不能单独建立对战争、移民或外国人的具体态度。国籍、文化身份、忠诚与个人经历不是这条百分数能验证的结果。",
        "en": "Globe–Nation aggregates the included statements about international institutions, cooperation, sovereignty and national power. A higher Globe figure does not imply supporting every international arrangement; a higher Nation figure does not independently establish a view on war, migration or foreigners. Nationality, cultural identity, loyalty and personal history are not verified by this percentage."
      },
      {
        "zh": "新例中，一位读者支持跨国灾害研究，却保留对另一机构决策机制的疑问；两项立场可以同时存在。阅读时区分“是否合作”“通过什么机构合作”“在哪个事项上合作”，避免把一个总体数当作对所有外交问题的同一个回答。",
        "en": "In a fresh example, a reader supports international disaster research while questioning another institution’s decision process. Both positions can coexist. Distinguish whether to cooperate, through which institution and on which issue; a single total is not the same answer to every foreign-policy question."
      }
    ]
  },
  {
    "id": "eight-civil-society",
    "title": {
      "zh": "公民轴与社会轴：权力边界和文化变化分开读",
      "en": "Civil and societal axes: distinguish public power from cultural change"
    },
    "paragraphs": [
      {
        "zh": "公民自由—权威涉及本题本对国家权力与个人自由的陈述，区别于经济轴的市场安排。某项制度规则的支持者，仍可能反对另一项限制；权威百分数不等于领导力或服从程度，自由百分数也不等于勇气或道德等级。",
        "en": "Liberty–Authority concerns this bank’s statements about state power and personal freedoms, distinct from economic market arrangements. Supporting one institutional rule can coexist with opposing another restriction. Authority is not leadership or obedience, and Liberty is not courage or a moral grade."
      },
      {
        "zh": "进步—传统则合并社会变化、继承规范以及若干科学、技术与环境陈述。名称不能当作表扬或贬义：欢迎一项新技术可以与珍惜某个节日习俗并存。也不能从社会轴推断宗教身份、年龄、科学素养或私人生活；这些既不是本题所测的独立指标，也没有对应验证。",
        "en": "Progress–Tradition combines social change, inherited norms and several science, technology and environmental statements. The labels are not praise or criticism: welcoming a technology can coexist with valuing a festival custom. The societal axis establishes neither religious identity, age, scientific literacy nor private life; these are not separately measured and validated outcomes here."
      }
    ]
  },
  {
    "id": "eight-weighted-example",
    "title": {
      "zh": "计分算例：一项回应为何可能影响多轴",
      "en": "Worked scoring: why one response can affect several axes"
    },
    "paragraphs": [
      {
        "zh": "五档乘数按同意程度为−1、−0.5、0、0.5、1，乘各题四轴的正负权重后分别求和。每轴用100×(M+加权和)/(2M)归一，M依次为经济195、外交225、公民320、社会292；显示正端保留一位小数，另一端补至100。[2] 这保留原计算，不把一道题凭主题重新归到单轴。",
        "en": "The five agreement levels supply multipliers −1, −0.5, 0, 0.5 and 1. Apply each to every signed axis weight and sum separately. Normalize each axis with 100 × (M + weighted sum) / (2M), using M = 195, 225, 320 and 292 respectively; round the primary pole to one decimal and display the partner as its complement to 100.[2] Items retain their effects rather than being reassigned to one intuitive topic."
      },
      {
        "zh": "可复算示例：其余69题均中立，只对第1题选“同意”，乘数0.5，使经济和增加5、公民和减少2.5。结果为平等51.3%／市场48.7%，自由49.6%／权威50.4%，其余两轴各50%／50%。这说明跨轴影响来自公布权重；没有说明这些小数差在现实中显著，也没有给政治身份判定线。",
        "en": "Reproducible example: keep sixty-nine items neutral and select Agree, multiplier 0.5, on item one. Its effects add five to the economic sum and subtract 2.5 from the civil sum. Equality/Markets becomes 51.3/48.7 and Liberty/Authority 49.6/50.4; the other pairs remain 50/50. Cross-axis changes follow published weights, without establishing that these differences are significant or define a political identity."
      }
    ]
  },
  {
    "id": "eight-midpoint-patterns",
    "title": {
      "zh": "50%怎样产生？中立、相互抵消与混合看法",
      "en": "How does 50% arise? Neutrality, cancellation and mixed views"
    },
    "paragraphs": [
      {
        "zh": "70题全部选中立／不确定时，四个加权和均为0，四对都显示50%／50%。但中点不只这一条来路：其余题均中立，第2题与第3题都选“非常同意”，经济贡献分别为+10和−10，相加仍为0，四轴显示也全为50%。两份答案不同，汇总却相同。",
        "en": "Seventy Neutral/Unsure responses give zero sums and 50/50 on all four axes. That is not the only route to the midpoint: with everything else neutral, Strongly Agree on items two and three contributes +10 and −10 economically. The sum remains zero and every axis still displays 50/50. Different answer patterns can therefore produce identical aggregates."
      },
      {
        "zh": "所以恰好50不能单独解释为中间派、没有观点、犹豫或温和。中立／不确定是有效回应，缺答则是未完成，系统不会替你补0。比较两次结果时，先核版本、语言、对措辞的理解及具体变化条目；小舍入差没有已建立的最小有意义变化或置信区间。",
        "en": "Exactly fifty alone establishes neither centrism, absence of views, indecision nor moderation. Neutral/Unsure is a valid response; an unanswered item is incomplete and is not filled with zero. Compare versions, language, interpretation and changed responses before comparing attempts. This edition has no established smallest meaningful change or confidence interval for tiny rounded differences."
      }
    ]
  },
  {
    "id": "eight-research-language",
    "title": {
      "zh": "科学性怎样核对？透明算法、题目理解与语言等值",
      "en": "How should evidence be assessed? Transparent arithmetic, item understanding and language equivalence"
    },
    "paragraphs": [
      {
        "zh": "开源权重让计算过程可检查，MIT许可允许合规使用，却不自动证明可靠性、常模、文化适配或中文等值。[3] Pew的问卷设计方法强调措辞、前后顺序与预试会影响测量，需要实际检查读者怎样理解问题。[4] 这些方法原则说明应核什么，并不构成本站已完成同类研究的证据。",
        "en": "Open weights make arithmetic inspectable, and MIT supplies permission, not automatic evidence of reliability, norms, cultural fit or Chinese equivalence.[3] Pew’s questionnaire-design methods discuss wording, ordering and pretesting, including checking how respondents understand questions.[4] These principles identify evidence to seek; they do not establish that FermatMind has completed those studies."
      },
      {
        "zh": "本页英文与原版权重绑定固定版本，中文为本版译文，尚未独立验证两种语言测得同一构念。宽泛词如“国家”“文化”“传统”，以及一个陈述同时涉及多个议题，都可能需要解释。可以在读结果时注明自己当时所想情境；不能把另一语言的一次不同分数直接认定为立场改变。",
        "en": "English items and effects remain bound to the identified revision; Chinese is this edition’s translation without independent evidence of measuring an equivalent construct. Broad words such as nation, culture and tradition, and statements combining issues, can require interpretation. Note the context you used when reading a result; a different score in another language alone does not establish a changed standpoint."
      }
    ]
  },
  {
    "id": "eight-reading-access",
    "title": {
      "zh": "八篇完整指南怎样使用？从轴摘要回到具体理由",
      "en": "How to use all eight guides: move from an axis summary to specific reasons"
    },
    "paragraphs": [
      {
        "zh": "先读某轴两端的定义，再看具体对照、中间混合与计分说明。本页提供八篇指南，每篇七节，共56节，全部公开免费。它们说明端点语义和阅读方式，不根据最大百分数选一个“主人格”，也不自动匹配意识形态、政党或候选人。",
        "en": "Read both pole definitions, then the concrete comparison, mixed patterns and scoring notes. All eight guides, seven sections each and fifty-six in total, are public and free. They explain labels and interpretation rather than choose a dominant personality from the largest percentage or automatically match an ideology, party or candidate."
      },
      {
        "zh": "开始按钮直接进入70题，不要求账户、邮箱、付款或再次确认同意。可选标签页草稿24小时后失效，完成、重测或退出清除会删除；未主动保存时刷新会丢进度。公开分享复制通用入口，不带答案或百分数。可以只读指南，也可停止作答，不必为了得到某个标签而反复重测。",
        "en": "Start enters the seventy questions without an account, email, payment or further consent confirmation. Optional tab drafts expire after twenty-four hours and clear on completion, retake or exit-and-clear; refresh loses unsaved progress. Public sharing copies a general entry link without answers or percentages. Reading guides or stopping is an option; repeated attempts need not pursue a preferred label."
      }
    ]
  }
];

export const eightValuesLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "8 Values与8values有什么关系？",
      "en": "How are 8 Values and 8values related?"
    },
    "answer": {
      "zh": "本页名称指对开源8values固定70题版本的双语改编。英文题项和正负权重沿所列版本，中文和完整指南为本版内容；仅凭相似名称不能认定与其他修改版结果互换。",
      "en": "This page is a bilingual adaptation of an identified seventy-item 8values revision. English items and signed effects follow that version; Chinese and full guides belong to this edition. A similar name does not make other modified versions interchangeable."
    }
  },
  {
    "question": {
      "zh": "经济自由与公民自由是同一个分数吗？",
      "en": "Are economic freedom and civil liberty the same score?"
    },
    "answer": {
      "zh": "不是。这里经济轴显示平等—市场，公民轴显示自由—权威，分别由各题对应effects汇总。一条陈述可能跨轴，但不能把市场百分数直接换成公民自由百分数。",
      "en": "No. Equality–Markets and Liberty–Authority use their respective published effects. An item can contribute to both, but Markets cannot be converted directly into Liberty."
    }
  },
  {
    "question": {
      "zh": "为什么“同意”有时让某端百分数下降？",
      "en": "Why can agreement lower a pole’s percentage?"
    },
    "answer": {
      "zh": "贡献取决于正负权重，不是所有“同意”都朝同一端。第1题选同意，经济贡献+5、公民贡献−2.5；它们分别进入不同分母的计算。应核公布effects，不能只按选项名称判断方向。",
      "en": "Signed weights determine direction. Agree on item one contributes +5 economically and −2.5 civilly, entering calculations with different denominators. Check the effects rather than assume every agreement moves toward the same pole."
    }
  },
  {
    "question": {
      "zh": "为什么八个百分数加起来不是100%？",
      "en": "Why do the eight percentages not add to one hundred?"
    },
    "answer": {
      "zh": "每一对合100%，共有四对，所以八数合400%。它们不是八类人所占比例，也不是一个人的八项资源分配。应逐轴读，不跨轴排最高价值。",
      "en": "Each of four pairs sums to one hundred, so the eight figures total four hundred. They are neither proportions of eight population groups nor a person’s allocation of eight resources. Read each axis rather than rank the largest value."
    }
  },
  {
    "question": {
      "zh": "只看四个50%，能判断全部选择中立吗？",
      "en": "Do four midpoint pairs prove every answer was neutral?"
    },
    "answer": {
      "zh": "不能。全部中立会得到四个中点，但不同回应也可能抵消。其他题中立时，第2与第3题都非常同意，经济+10和−10抵消，仍全部50%。只有具体答卷能区分来路。",
      "en": "No. All-neutral answers give midpoints, but different responses can cancel. Strongly Agree on items two and three, with everything else neutral, offsets +10 and −10 economically and still gives four midpoint pairs. Only the actual response pattern distinguishes them."
    }
  },
  {
    "question": {
      "zh": "这70题是在考政治知识，还是评价政策事实？",
      "en": "Do the seventy items test political knowledge or establish policy facts?"
    },
    "answer": {
      "zh": "都不是。你评定的是对陈述的同意程度，没有标准答案，也不计知识正确率。题目包含待回应主张，不代表费马认可每项陈述为事实；理解具体议题仍需阅读相应材料。",
      "en": "Neither. You rate agreement with propositions; there is no answer key or knowledge-accuracy score. Included claims are prompts for response, not FermatMind endorsement of every statement as fact. Understanding an issue still requires relevant reading."
    }
  },
  {
    "question": {
      "zh": "不同网站的8values结果为什么可能不同？",
      "en": "Why can different sites give different 8values results?"
    },
    "answer": {
      "zh": "先核题本修订、中文译法、选项方向、权重、舍入和附加分类。UI相似不证明这些相同。本页保留所列70题effects与归一方法，省略最近意识形态派型；不宣称复现其他修改版的完整结果。",
      "en": "Check the revision, translation, response order, effects, rounding and additional classification. Similar UI does not establish identical methods. This edition retains the identified seventy-item effects and normalization while omitting nearest-ideology assignment; it does not reproduce every modified edition’s result."
    }
  }
];

export const eightValuesLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "zh": "Pew Research Center：问卷措辞、顺序与预试方法",
      "en": "Pew Research Center: question wording, ordering and pretesting"
    },
    "url": "https://www.pewresearch.org/writing-survey-questions/"
  }
];
