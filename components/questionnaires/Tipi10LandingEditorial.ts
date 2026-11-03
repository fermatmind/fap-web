import type { Questionnaire } from "@/lib/questionnaires/types";
export const tipi10LandingSections: Questionnaire["guide"] = [
  {
    "id": "tipi-purpose",
    "title": {
      "en": "TIPI-10: a brief inventory of five broad personality domains",
      "zh": "TIPI-10：五个宽泛人格领域的极短量表"
    },
    "paragraphs": [
      {
        "en": "The Ten-Item Personality Inventory was developed by Gosling, Rentfrow and Swann in 2003 for situations with very limited measurement time. Their research examined convergence with longer measures, retest consistency and observer agreement. It supports understanding the original instrument’s intended trade-off; it does not independently validate this website’s Chinese translation or establish a local reference population.",
        "zh": "十项人格量表由Gosling、Rentfrow与Swann于2003年为测量时间非常有限的情境提出。原研究考察了与较长测量的关联、重测一致性及观察者评价的一致性。这些证据帮助理解原工具的取舍，不独立验证本站中译，也不建立本站参照人群。"
      },
      {
        "en": "This page retains the original ten English trait pairs, seven response anchors and scoring pairs under the author’s public permission. The Chinese wording is FermatMind’s working translation. After ten valid responses, the report shows five independent raw means and all original and keyed values. Five complete editorial guides are also free to read before answering.",
        "zh": "本页按作者公开许可保留十组英文原特质、七级回答及计分配对，中文为费马工作译文。十题有效作答后，报告显示五项独立原始均值及全部原回答、定向计分值；五篇完整编辑指南也可在作答前免费阅读。"
      }
    ]
  },
  {
    "id": "tipi-response",
    "title": {
      "en": "How to answer a pair of traits on the seven-point scale",
      "zh": "怎样评价一对特质与七级认同"
    },
    "paragraphs": [
      {
        "en": "Consider the pair as a whole under the prompt “I see myself as,” even when one word fits better than the other. Rate your general self-description rather than what would look impressive in a particular role. There is no instruction here to describe only the past week or a single unusually good or difficult day.",
        "zh": "在“我认为自己”的提示下，把一对特质作为整体评价，即使其中一个词更符合。依据总体自我描述，而不是某个角色中看起来更优秀的答案。本页不要求只回顾过去一周，也不要求以某个特别顺利或困难的日子代表自己。"
      },
      {
        "en": "The seven options run from strong disagreement through a neutral midpoint to strong agreement. Four is an actual neutral response, not a skipped answer. This implementation needs all ten valid responses. If you cannot or do not wish to rate a pair, you can stop and clear the attempt or read the public guides without choosing a false midpoint.",
        "zh": "七级选项从强烈不同意，经中立中点，到强烈同意。4是实际中立回答，不是跳题。本实现需要十题全部有效；若无法或不愿评价，可停止并清除，或直接阅读公开指南，不必用虚假的中点代替缺答。"
      }
    ]
  },
  {
    "id": "tipi-calculation",
    "title": {
      "en": "Reproduce the five means: reverse first, then average",
      "zh": "复算五项均值：先反向，再取平均"
    },
    "paragraphs": [
      {
        "en": "Items 2, 4, 6, 8 and 10 are reversed as 8 minus the original response. The pairs are 1 with reversed 6 for Extraversion; reversed 2 with 7 for Agreeableness; 3 with reversed 8 for Conscientiousness; reversed 4 with 9 for Emotional Stability; and 5 with reversed 10 for Openness. Item 9 remains direct.",
        "zh": "第2、4、6、8、10题先用8减原回答。外向性配第1题与反向第6题；宜人性配反向第2题与第7题；尽责性配第3题与反向第8题；情绪稳定性配反向第4题与第9题；开放性配第5题与反向第10题。第9题保持正向。"
      },
      {
        "en": "For a fresh calculation, responses 6 and 3 on items 1 and 6 produce (6 + (8 − 3)) / 2 = 5.50 for Extraversion. Each pair mean lies between 1 and 7 in half-point steps. One response moving by one scale point changes its pair mean by 0.50; displaying two decimals adds no measurement precision.",
        "zh": "另举算例：第1题选6、第6题选3，外向性为(6＋(8－3))÷2＝5.50。每对均值介于1至7，间隔为0.50。某题回答改变一个等级，该对均值就改变0.50；显示两位小数不增加测量精度。"
      }
    ]
  },
  {
    "id": "tipi-domains",
    "title": {
      "en": "Read five domains separately, with their item content in view",
      "zh": "围绕题目内容，分别阅读五个领域"
    },
    "paragraphs": [
      {
        "en": "Extraversion combines social enthusiasm with reverse-keyed reserve; Agreeableness combines warmth with reverse-keyed critical or quarrelsome self-description; Conscientiousness combines dependability and self-discipline with reverse-keyed disorganization. These broad summaries do not separately score every component of sociability, compassion or task management.",
        "zh": "外向性合并社交热情与反向计分的内敛；宜人性合并温暖与反向计分的挑剔、争辩自述；尽责性合并可靠、自我约束与反向计分的缺少条理。这些是宽泛概括，不分别计量社交、关怀或任务管理的每个成分。"
      },
      {
        "en": "Emotional Stability combines calmness with reverse-keyed anxiety or being easily upset; it is oriented toward stability, whereas many other Big Five reports label the opposite pole Neuroticism. Openness combines receptiveness to new experience with reverse-keyed conventionality. A domain mean is not a mental-health diagnosis, intelligence score, moral value or verdict about someone’s conduct.",
        "zh": "情绪稳定性合并沉着与反向计分的焦虑、易烦乱，方向朝向稳定；许多其他大五报告则把相反方向命名为神经质。开放性合并接触新体验的意愿与反向计分的遵循惯例。领域均值不是心理健康诊断、智力分数、道德价值或行为判决。"
      }
    ]
  },
  {
    "id": "tipi-patterns",
    "title": {
      "en": "The same mean can come from different response patterns",
      "zh": "相同均值可能来自不同回答模式"
    },
    "paragraphs": [
      {
        "en": "On the Extraversion pair, responses 4 and 4 give (4 + 4) / 2 = 4.00 after reversal. Responses 7 and 7 also give (7 + 1) / 2 = 4.00. The first pattern is neutral on both pairs of words; the second strongly endorses both. The mean alone cannot distinguish those self-descriptions, which is why the report retains the individual values.",
        "zh": "外向性配对中，第1题和第6题均选4，反向后得到(4＋4)÷2＝4.00；两题均选7，也得到(7＋1)÷2＝4.00。前者对两组词均中立，后者对两组词均强烈认同。均值本身不能区分这两种自述，因此报告保留单题数值。"
      },
      {
        "en": "Different settings, different meanings of a word or seeing both tendencies in yourself may help explain a mixed pattern, but the questionnaire cannot determine the reason. Such a pattern is not automatically labelled dishonest or invalid. Revisit a concrete example and the wording instead of inventing a hidden subtype or subtracting a separate “consistency” score.",
        "zh": "不同情境、对词语的不同理解，或认为两种倾向都存在，可能帮助解释混合模式；问卷不能确定原因，也不自动将它标为不诚实或无效。可回看具体例子与措辞，不据此发明隐藏亚型或另扣“一致性分数”。"
      }
    ]
  },
  {
    "id": "tipi-evidence",
    "title": {
      "en": "Research evidence: brevity changes what a score can support",
      "zh": "研究证据：极短设计改变了分数能支持什么"
    },
    "paragraphs": [
      {
        "en": "Two broad items per domain leave little room for detailed facet interpretation. The author’s methodological note cautions against treating alpha or factor-fit indices as the sole verdict for this deliberately brief, broad design, and points to retest reliability when a reliability estimate is needed. That is not permission to assume every translation or implementation is valid.[3]",
        "zh": "每领域只有两条宽泛题目，难以支持细分面向解释。作者的方法说明提醒，不宜只用alpha或因素拟合指标裁决这种有意极短、覆盖宽泛的设计；需要信度估计时应关注重测信度。这不意味着任何译文或实现都可被默认视为有效。[3]"
      },
      {
        "en": "This website supplies the transparent calculation, not a new validation study, confidence interval, population percentile or clinical threshold. A single rating has substantial arithmetic influence on a two-item mean. Use a more detailed, appropriately evaluated instrument when your question requires finer distinctions, and assess its exact version and evidence rather than its item count alone.",
        "zh": "本站提供透明计算，不提供新的验证研究、置信区间、人群百分位或临床阈值。单题等级对两题均值有明显算术影响。若问题需要更细区分，应选择经过相应评价的详细工具，并核对具体版本与证据，而不是只看题数。"
      }
    ]
  },
  {
    "id": "tipi-versions",
    "title": {
      "en": "TIPI, BFI-10 and longer Big Five inventories are different versions",
      "zh": "TIPI、BFI-10与较长大五量表是不同工具"
    },
    "paragraphs": [
      {
        "en": "Ten items is a length, not an instrument identity. Check the authors, exact wording, anchors, item order and scoring key before comparing short Big Five results. This page is the Gosling TIPI with its declared working Chinese wording; it does not administer the Rammstedt–John BFI-10 or copy another platform’s translation, norms or score display.",
        "zh": "十题只是长度，不是工具身份。比较极短大五结果前，应核对作者、确切措辞、选项、题序与计分键。本页为Gosling的TIPI及所声明的中文工作译文，不施测Rammstedt–John的BFI-10，也不借用其他平台译文、常模或展示分数。"
      },
      {
        "en": "The author’s resource page lists translations with different development and validation histories, without endorsing them all. Our working Chinese text must therefore be identified separately. Results from different languages or questionnaires cannot be numerically equated simply because the domain names sound alike; even the orientation of Emotional Stability and Neuroticism needs checking.",
        "zh": "作者资源页列有发展与验证经历不同的译本，并未对所有译本背书。因此本站工作中译需要单独标明。不同语言或问卷即使领域名称相近，也不能直接数值等同；连情绪稳定性与神经质的方向都需要核对。"
      }
    ]
  },
  {
    "id": "tipi-use",
    "title": {
      "en": "Turn a broad self-description into a concrete observation",
      "zh": "把宽泛自述转为具体观察"
    },
    "paragraphs": [
      {
        "en": "Choose one pair that needs context and recall both a fitting and a non-fitting example. You might be quiet while learning an unfamiliar task yet enthusiastic with familiar friends. The purpose is to refine what the words mean in your experience, not to decide whether one pole makes a better person or a suitable employee.",
        "zh": "选一组需要情境解释的词，分别回想符合与不符合的例子。例如，学习陌生任务时话少，与熟悉朋友相处时却热情。目的在于细化这些词在自己经历中的含义，不是判定哪一端使人更优秀或更适合某份岗位。"
      },
      {
        "en": "Start test opens the first item directly, with no required agreement checkbox. Saving an unfinished attempt is optional and limited to this tab for twenty-four hours; completion and retake clear it. The share control copies only the public title and entry link, without means or answers. Keep any personal examples private unless you independently choose to discuss them.",
        "zh": "点击开始测试直接进入第一题，没有必选同意复选框。未完成进度由你自愿选择保存，仅限本标签页二十四小时，完成或重测即清除。分享功能只复制公开标题与入口，不含均值或答案；个人例子可自行保留，是否讨论由你决定。"
      }
    ]
  }
];
export const tipi10LandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Why are two words shown together in a TIPI item?",
      "zh": "为什么TIPI一题有两个特质词？"
    },
    "answer": {
      "en": "The source asks you to rate the pair overall, even when one characteristic fits more strongly. The page does not split a source item into two separately scored questions. Consider the wording as presented and avoid choosing only the word you prefer.",
      "zh": "原说明要求整体评价这对特质，即使其中一项更符合。本页不把原题拆成两个单独计分问题，应按呈现措辞评价，不只选择自己偏爱的词。"
    }
  },
  {
    "question": {
      "en": "Is a neutral response the same as leaving an item unanswered?",
      "zh": "中立是否等同于留空？"
    },
    "answer": {
      "en": "No. Four is the valid midpoint. This page needs ten valid ratings and never replaces missing responses with a midpoint or zero. You can exit and clear if you cannot or do not wish to finish.",
      "zh": "不是。4是有效中点，本页需要十条有效回答，不用中点或零补缺答。若无法或不愿完成，可退出并清除。"
    }
  },
  {
    "question": {
      "en": "Why is item 9 not reversed?",
      "zh": "为什么第9题不反向？"
    },
    "answer": {
      "en": "Its calmness and emotional-stability wording already points in the displayed domain’s direction. Item 4 is the reversed partner. Follow the exact key instead of reversing every item with emotional content.",
      "zh": "第9题的沉着、情绪平稳措辞已指向所显示领域的方向，第4题才是其反向配对。应遵循确切计分键，不因涉及情绪就一律反向。"
    }
  },
  {
    "question": {
      "en": "Does a higher mean indicate a better personality?",
      "zh": "均值更高是否说明人格更好？"
    },
    "answer": {
      "en": "No. It indicates the direction of the keyed pair responses, not personal worth, competence or a diagnosis. Five domains are separate; the page supplies neither a combined personality total nor a winner.",
      "zh": "不是。它表示定向配对回答的方向，不是个人价值、能力或诊断。五领域分别呈现，不合成人格总分，也不选胜出领域。"
    }
  },
  {
    "question": {
      "en": "Can the 1–7 result be read as a percentile?",
      "zh": "1至7的结果能当百分位吗？"
    },
    "answer": {
      "en": "No. It is a two-item raw mean. A valid population comparison needs a suitable reference distribution and matching version and language. This page does not apply external online-study norms or convert the mean to a population rank.",
      "zh": "不能。它是两题原始均值。有效人群比较需要合适参照分布以及匹配版本、语言；本页不套用外部在线研究常模，也不把均值转换成人群名次。"
    }
  },
  {
    "question": {
      "en": "Why can both quietness and enthusiasm fit me?",
      "zh": "为什么内敛与热情可能同时符合？"
    },
    "answer": {
      "en": "You may be thinking of different situations or different aspects of the words. The paired mean cannot identify the explanation. Use the displayed original and keyed responses to review specific examples; the page does not infer deception or a hidden subtype.",
      "zh": "你可能想到不同情境或词语的不同侧面，配对均值不能确定解释。可依据报告中的原回答与定向值复盘具体例子；本页不推断欺骗或隐藏亚型。"
    }
  },
  {
    "question": {
      "en": "Does the original English research validate this Chinese page?",
      "zh": "英文原研究是否验证了本页中文？"
    },
    "answer": {
      "en": "No. The Chinese is an independent working translation. The original instrument, language adaptation and website implementation are distinct evidence questions. English and Chinese descriptions being available together does not establish cross-language equivalence.",
      "zh": "没有。中文是独立工作译文，原工具、语言改编与网站实现是不同证据问题。中英文同时可用不意味着已建立跨语言等价。"
    }
  },
  {
    "question": {
      "en": "Must I agree to activity counting before starting?",
      "zh": "开始前必须同意使用计数吗？"
    },
    "answer": {
      "en": "No. Start test enters the first question without a required agreement. Draft saving is also optional. Completing the questionnaire gives all five means and full free guides; sharing exposes only the public title and entry URL.",
      "zh": "不需要。开始测试直接进入第一题，无需必选同意；保存草稿也由你自愿选择。完成后可看五项均值与完整免费指南，分享仅包含公开标题及入口网址。"
    }
  }
];
export const tipi10LandingReferences = [
  {
    "title": {
      "en": "Gosling: A Note on Alpha Reliability and Factor Structure in the TIPI",
      "zh": "Gosling：TIPI的alpha信度与因素结构方法说明"
    },
    "url": "https://gosling.psy.utexas.edu/scales-weve-developed/ten-item-personality-measure-tipi/a-note-on-alpha-reliability-and-factor-structure-in-the-tipi/"
  }
];
