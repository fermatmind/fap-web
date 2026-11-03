import type { Questionnaire } from "@/lib/questionnaires/types";

export const hexacoLandingSections: Questionnaire["guide"] = [
  {
    "id": "hexaco-edition",
    "title": {
      "zh": "HEXACO是什么？先区分六因素模型与具体题本",
      "en": "What is HEXACO? Distinguish the six-factor model from its inventories"
    },
    "paragraphs": [
      {
        "zh": "HEXACO用诚实—谦逊、情绪性、外向性、宜人性、尽责性与经验开放性描述人格差异。名称中的X取自eXtraversion。模型来自多语言人格词汇研究；它描述六个连续领域，而不是六种互斥人格。IPIP、官方HEXACO-PI-R及各网站自编短版采用的题目、呈现和解释可能不同。[1][5]",
        "en": "HEXACO describes personality differences through Honesty–Humility, Emotionality, eXtraversion, Agreeableness, Conscientiousness and Openness to Experience. The X comes from eXtraversion. The model arose from personality-lexicon research across languages and describes six continuous domains, rather than six exclusive types. IPIP, official HEXACO-PI-R and website-specific short forms can differ in items, presentation and interpretation.[1][5]"
      },
      {
        "zh": "本页完整保留早期公开IPIP的240条英文及正反向键，每领域40条、四个侧面各10条；中文为费马试译，六领域交错呈现。它不是当前官方60或100题版，也没有把240题任选一部分冒充等值短版。题量较长提供更多描述内容，不能单凭题数宣称更准确。[1]",
        "en": "This page retains all 240 English items and scoring directions from the preliminary public IPIP bank: forty per domain, with four ten-item facets. FermatMind supplies a Chinese trial translation and interleaves the six domains. It is not the current official sixty- or hundred-item form, nor an interchangeable short form selected from the 240 items. Length offers more descriptive content without establishing greater accuracy.[1]"
      }
    ]
  },
  {
    "id": "hexaco-h-a",
    "title": {
      "zh": "诚实—谦逊与宜人性：公平取向和冲突反应的区别",
      "en": "Honesty–Humility and Agreeableness: fairness versus responses to friction"
    },
    "paragraphs": [
      {
        "zh": "诚实—谦逊组合真诚、公平、避免贪求与谦逊，涉及怎样描述自己对利用他人、地位和特殊待遇的态度。宜人性则组合宽恕、温和、灵活与耐心，侧重面对批评、建议和摩擦的反应。两者都涉及人际生活，但题意不同，不能把其中一个当作另一个的代名词。",
        "en": "Honesty–Humility combines sincerity, fairness, greed avoidance and modesty, concerning self-described attitudes toward exploitation, status and special treatment. Agreeableness combines forgiveness, gentleness, flexibility and patience, emphasizing responses to criticism, suggestions and friction. Both concern interpersonal life, but their content differs and one cannot stand in for the other."
      },
      {
        "zh": "例如，一个人可以坦诚说明利益冲突，却在争论时容易发火；另一个人可能语气温和，却没有说清自己的利益。应分开核对披露、行动和回应。本问卷收集自述，没有观察真实行为，也不核验他人的品德；喜欢昂贵物品、拒绝不公平要求或一时生气，都不足以单独判断整个人。",
        "en": "Someone may disclose a conflict of interest yet become angry in a disagreement; another may speak gently without disclosing their interests. Check disclosure, action and response separately. The questionnaire collects self-descriptions without observing conduct or verifying character. Enjoying expensive objects, refusing unfair requests or momentary anger cannot alone establish a verdict about a person."
      }
    ]
  },
  {
    "id": "hexaco-e-x",
    "title": {
      "zh": "情绪性与外向性：感受、支持和社交表达分别阅读",
      "en": "Emotionality and Extraversion: distinguish feelings, support and expression"
    },
    "paragraphs": [
      {
        "zh": "本早期题库的情绪性包含畏惧、焦虑、依赖和多愁善感；外向性包含表达、社交胆量、合群和活力。担心危险、希望得到确认、被故事触动，以及喜欢群体活动，是不同内容。领域均分概括这些自述，不等于焦虑诊断、情商分数、身体精力测量或社交能力等级。",
        "en": "In this preliminary bank, Emotionality includes fearfulness, anxiety, dependence and sentimentality; Extraversion includes expressiveness, social boldness, sociability and liveliness. Worrying about danger, wanting reassurance, being moved by a story and enjoying group activity concern different experiences. Domain means summarize self-descriptions rather than diagnose anxiety or grade emotional intelligence, physical energy or social skill."
      },
      {
        "zh": "有人喜欢与熟友相聚，却不愿公开发言；有人演讲前担忧较多，仍能充分准备并清楚表达。回看时区分感受、可得支持、参与机会和实际行动，不用一个均分替代这些信息。两种模型都写“外向性”也不表示题目、范围和计分已经相同。",
        "en": "A person may enjoy close friends while avoiding public speaking; another may worry before a presentation yet prepare and communicate clearly. Separate feelings, available support, opportunities and actions instead of replacing them with one mean. Two models using the name Extraversion does not make their items, scope or scoring identical."
      }
    ]
  },
  {
    "id": "hexaco-c-o",
    "title": {
      "zh": "尽责性与开放性：任务习惯和探索倾向",
      "en": "Conscientiousness and Openness: task habits and exploration"
    },
    "paragraphs": [
      {
        "zh": "尽责性组合条理、勤勉、追求完善与审慎；经验开放性组合审美欣赏、求知、创造想法与非传统倾向。前者关注秩序、投入、细节和后果，后者关注对艺术、观念、想象和不同寻常事物的自述。本版报告六领域，不单列24个侧面的个人分数。",
        "en": "Conscientiousness combines organization, diligence, perfectionism and prudence; Openness combines aesthetic appreciation, inquisitiveness, creativity and unconventionality. The former concerns order, effort, detail and consequences; the latter concerns self-described engagement with art, ideas, imagination and unusual experiences. This edition reports six domains without separate personal scores for the twenty-four facets."
      },
      {
        "zh": "桌面整洁与按时完成任务可以不同，喜欢科学或艺术也不证明知识、智力或创作技能。教育、文化机会和近期负担会影响哪些句子符合自己。可以用指南中的侧面概念整理实例，但不要把兴趣变成能力认证，也不要用较高或较低数值预先决定职业、学习资格或个人价值。",
        "en": "A tidy desk and timely task completion can differ, while enjoying science or art does not establish knowledge, intelligence or creative skill. Education, cultural access and recent workload affect which statements fit. Use the facet concepts to organize examples without converting interests into certified abilities or using higher or lower numbers to decide occupations, study eligibility or personal worth."
      }
    ]
  },
  {
    "id": "hexaco-arithmetic",
    "title": {
      "zh": "240题怎样计分？反向键、原始和与均分算例",
      "en": "How are 240 items scored? Reverse keys, raw sums and worked means"
    },
    "paragraphs": [
      {
        "zh": "五级符合度回答计1至5分。正向条目保留所选分数，反向条目用6减所选分数，因此回答1、2、3、4、5分别计5、4、3、2、1。全题库有122条反向题。每个领域40条有效评分相加得到40—200原始和，报告直接除以40，均分范围1—5，显示两位小数。[3]",
        "en": "Five accuracy responses score one to five. Direct items keep that rating; reverse items use six minus the rating, so responses one through five contribute five through one. The bank contains 122 reverse-keyed items. Forty valid keyed ratings per domain give a raw sum of forty to two hundred. The report divides that sum directly by forty for a mean from one to five, displayed to two decimals.[3]"
      },
      {
        "zh": "例如，39条键向后为3、另一条为5，总和122，均分3.05；那一条可以来自正向回答5，也可以来自反向回答1。40条全部为3，以及20条键向1分加20条5分，都得到120与3.00，但回答组合不同。小数说明算术结果，不证明测量等距、差异可靠或达到某种人格等级。",
        "en": "For example, thirty-nine keyed threes and one keyed five sum to 122, giving 3.05. The five can come from a direct response of five or a reverse response of one. Forty threes and twenty keyed ones plus twenty fives both yield 120 and 3.00 despite different response patterns. Decimals describe arithmetic without establishing interval measurement, reliable differences or personality levels."
      }
    ]
  },
  {
    "id": "hexaco-na",
    "title": {
      "zh": "NA与完整结果：哪些领域有足够资料？",
      "en": "NA and complete results: which domains have sufficient information?"
    },
    "paragraphs": [
      {
        "zh": "每题都需要选择一个选项，但可选NA表示不适用或不愿回答。NA不计0，也不补成中间3。某领域只要有一条NA，就保留该领域“资料不足”，不按其余条目推算个人总分或均分；其余40条都有效的领域仍可分别显示。NA数量不用于反推被隐藏的特质。",
        "en": "Every item needs a selection, with NA available for not applicable or prefer not to answer. NA is neither zero nor an imputed middle three. Even one NA withholds that domain’s personal sum and mean rather than estimating from the remaining ratings; other domains with forty valid ratings remain available independently. NA counts are not used to infer a concealed trait."
      },
      {
        "zh": "六篇完整指南各含8节，共48节，覆盖四侧面、较高／较低与混合读法、算例、反例、具体练习和来源方法。任何领域未评分都不影响阅读；未作答也能打开公开指南。读指南并不生成个人成绩，不要求先补齐NA、再做另一测试或追求某个分数。",
        "en": "Each of six complete guides contains eight sections, forty-eight in total: facets, higher/lower and mixed readings, arithmetic, counterexamples, practical reflection and sources/method. Unscored domains remain readable, and public guides open without an attempt. Reading a guide creates no personal score and requires neither replacing NA, taking another test nor reaching a threshold."
      }
    ]
  },
  {
    "id": "hexaco-evidence",
    "title": {
      "zh": "HEXACO科学性怎样判断？模型证据与本站版本分开核对",
      "en": "How should HEXACO evidence be assessed? Separate model and edition"
    },
    "paragraphs": [
      {
        "zh": "Ashton、Lee与Goldberg（2007）的研究报告了IPIP–HEXACO量表的发展，并检验内部一致性、与HEXACO-PI的聚合及区分关联、因素结构。[6] 作者同时指出，选题与检验使用同一批411名参与者，诚实—谦逊与宜人性的区分程度有限，仍需新样本交叉验证。这些研究维度帮助判断证据涉及什么，却不能自动证明本站中文试译、交错呈现、NA处理及本次个人解释同样有效。也不能把关联当作完全等值或可互换分数。",
        "en": "Ashton, Lee and Goldberg’s 2007 study describes IPIP–HEXACO scale development and examines internal consistency, convergent and discriminant correlations with HEXACO-PI, and factor structure.[6] The authors also note that item selection and evaluation used the same 411 participants; Honesty–Humility and Agreeableness were less independent than in HEXACO-PI, and new-sample cross-validation remained necessary. These evidence categories clarify what was investigated without automatically validating this Chinese trial translation, interleaved presentation, NA handling or individual interpretation. Correlation alone does not establish equivalent or interchangeable scores."
      },
      {
        "zh": "IPIP公有领域许可允许复用，属于版权条件；心理测量质量还需对应题本、语言、人群与用途的研究。[2] HEXACO与大五在情绪性、宜人性等内容的组织方式也不同，并非简单多加一列即可换算。[4] 本页没有人群常模、百分位、临床阈值或招聘预测验证；研究源页的系数不作为本站的准确率宣传。",
        "en": "IPIP’s public-domain permission concerns reuse rights; measurement quality needs evidence for the particular inventory, language, population and use.[2] HEXACO and the Big Five also organize Emotionality/Agreeableness content differently, preventing conversion by simply adding a column.[4] This page has no population norms, percentiles, clinical cutoffs or hiring prediction validation, and does not advertise source-page coefficients as its accuracy rate."
      }
    ]
  },
  {
    "id": "hexaco-use",
    "title": {
      "zh": "怎样使用六领域结果？具体实例、免费阅读与隐私",
      "en": "Using six-domain results: examples, free access and privacy"
    },
    "paragraphs": [
      {
        "zh": "先逐领域读原始和与均分，再用一个近期实例和一个反例核对。可问：“在哪种情境下符合？哪部分不符合？有没有更直接的行为证据？”不把六项相加、按最高均分派型或把3解释为人口平均。重测时保持版本、语言和参照情境一致；本版未建立可靠变化阈值，微小分数变化不能证明人格改变。",
        "en": "Read each domain’s sum and mean, then check a recent example and a counterexample. Ask where it fits, where it does not and whether direct behavioral evidence is available. Do not add the domains, assign a highest-mean type or interpret three as a population average. Keep version, language and reference context consistent for retakes; this edition has no reliable-change threshold establishing personality change from a small numerical shift."
      },
      {
        "zh": "开始直接进入题目，不增加强制同意、账户、邮箱或付款环节。回答在浏览器计分；默认不保存，主动保存的本标签页草稿24小时后过期，完成、重测或退出清除时删除。分享仅复制公开指南名称与链接，不附答卷或个人均分；网页仍可能按隐私和Cookie设置记录不含答案的使用事件。",
        "en": "Start enters the questions without an additional mandatory consent, account, email or payment step. Scoring runs in the browser. Saving is optional: tab drafts expire after twenty-four hours and clear on completion, retake or exit-and-clear. Sharing copies a public guide’s name and link without responses or personal means. The site may still record answer-free usage events under its privacy and Cookie settings."
      }
    ]
  }
];

export const hexacoLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "HEXACO的X为什么不是E？",
      "en": "Why does HEXACO use X for Extraversion?"
    },
    "answer": {
      "zh": "E已经用于Emotionality（情绪性），X取自eXtraversion（外向性）。它是领域缩写，不是额外维度，也不代表在本页生成一个六字母类型。",
      "en": "E already denotes Emotionality; X comes from eXtraversion. It abbreviates a domain without adding a dimension or producing a six-letter personality type."
    }
  },
  {
    "question": {
      "zh": "240题是否一定比60题或100题更准确？",
      "en": "Are 240 items necessarily more accurate than sixty or one hundred?"
    },
    "answer": {
      "zh": "不能单凭题数判断。它们可能属于不同版本，覆盖、措辞与验证样本不同。质量应结合具体用途、语言、人群、信度、效度及作答负担核对；本页不将题量转换为准确率。",
      "en": "Item count alone cannot establish accuracy. Editions can differ in coverage, wording and validation samples. Assess purpose, language, population, reliability, validity and response burden rather than converting length into an accuracy claim."
    }
  },
  {
    "question": {
      "zh": "为什么不显示24个侧面的个人分数？",
      "en": "Why are there no twenty-four personal facet scores?"
    },
    "answer": {
      "zh": "本版以每领域40条的原始和及均分为输出，四个10条侧面用于解释内容。没有另设侧面分数或常模。可以阅读侧面例子，不应从领域均分倒推出各侧面得分。",
      "en": "This edition outputs each forty-item domain’s sum and mean. Four ten-item facets organize its interpretation without separate facet scores or norms. Read their examples without reconstructing facet values from a domain mean."
    }
  },
  {
    "question": {
      "zh": "均分3.00等于普通人平均，或50百分位吗？",
      "en": "Does 3.00 mean an average person or the fiftieth percentile?"
    },
    "answer": {
      "zh": "不等于。3是所用1—5数值范围的中点，不是参照人群统计量。全部中间回答和相反回答的组合可得到相同均分。本版没有据样本换算百分位，也不设置高低人格分界。",
      "en": "No. Three is the midpoint of the one-to-five numerical range, not a population statistic. Uniform middle ratings and opposing responses can yield the same mean. This edition supplies neither sample-based percentiles nor high/low classification cutoffs."
    }
  },
  {
    "question": {
      "zh": "某领域39条有效，还能显示均分吗？",
      "en": "Can a domain mean be shown with thirty-nine valid ratings?"
    },
    "answer": {
      "zh": "本版不显示。该领域任何NA都会保留资料不足，避免把未回答内容补成已知；其他完整领域仍可计分，所有完整指南仍可阅读。这是本页的缺答规则，不是所有HEXACO产品通用规则。",
      "en": "Not in this edition. Any NA keeps that domain insufficient rather than replacing unknown content. Other complete domains can still be scored, and all full guides remain readable. This page-specific rule is not a universal policy for every HEXACO product."
    }
  },
  {
    "question": {
      "zh": "全选“非常符合”会得到六项最高分吗？",
      "en": "Will selecting the highest accuracy option maximize every domain?"
    },
    "answer": {
      "zh": "不会。122条反向题会用6减所选分数，最高原始回答在这些题上计1。按想要的画像挑选答案会改变自述意义，应参照通常实际表现，而非追求六项满分。",
      "en": "No. The 122 reverse-keyed items use six minus the response, so the highest raw response contributes one on those items. Selecting answers for a desired profile changes the meaning of self-report; use usual actual behavior rather than chase six maximum scores."
    }
  },
  {
    "question": {
      "zh": "诚实—谦逊能验证一个人值得信任吗？",
      "en": "Can Honesty–Humility verify someone’s trustworthiness?"
    },
    "answer": {
      "zh": "不能。本页记录本人如何描述真诚、公平、地位和特殊待遇等内容，没有核验真实行为、证人或事件。信任应结合具体承诺、披露和行动，不用个人自评分替他人作背书或指控。",
      "en": "No. It records self-descriptions concerning sincerity, fairness, status and special treatment without verifying conduct, witnesses or events. Consider actual commitments, disclosure and action rather than using a self-rating to endorse or accuse someone."
    }
  },
  {
    "question": {
      "zh": "中英文结果能直接比较吗？",
      "en": "Can English and Chinese results be directly compared?"
    },
    "answer": {
      "zh": "两种语言使用相同题号和计分规则，但中文为本站试译，尚未建立跨语言测量等值。语言理解和文化情境都可能影响回答；不能因公式相同就把差异视为真实人格差异。",
      "en": "Both languages use the same item identities and scoring rules, but the Chinese trial translation has no established cross-language measurement equivalence here. Interpretation and cultural context can affect responses; identical arithmetic does not establish that a difference reflects personality."
    }
  }
];

export const hexacoLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "zh": "Ashton、Lee与Goldberg（2007）：IPIP–HEXACO量表原始研究",
      "en": "Ashton, Lee & Goldberg (2007): original IPIP–HEXACO study"
    },
    "url": "https://www.ipip.uksw.edu.pl/file/62"
  }
];
