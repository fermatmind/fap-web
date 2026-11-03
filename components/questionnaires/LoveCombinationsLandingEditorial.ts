import type { Questionnaire } from "@/lib/questionnaires/types";
export const loveCombinationsLandingSections: Questionnaire["guide"] = [
  {
    "id": "love-combinations-scope",
    "title": {
      "en": "Love Type Test: four comparisons in one relationship situation",
      "zh": "爱情类型测试：同一关系情境中的四组比较"
    },
    "paragraphs": [
      {
        "en": "This independent thirty-two-pair questionnaire organizes choices about proposing a direction, receiving or offering care, a practical or romantic starting point, and flexible or explicitly defined arrangements. Choose one current or imagined safe relationship situation and use it throughout. The result describes the choices you made in that reference situation.",
        "zh": "本独立三十二题二选一整理四组选择：提出方向、接受或提供照顾、实际或浪漫起点，以及弹性或明确的安排。请选定一个当前或假设的安全关系情境，并在整份问卷中保持一致；结果描述你在这个参照下所作的选择。"
      },
      {
        "en": "Each comparison retains its own eight choices. Sixteen neutral code guides explain the possible combinations with situations, trade-offs, neighboring codes and optional reflection. The page does not assign an official character or treat sixteen combinations as sixteen established natural personality categories.",
        "zh": "每组比较分别保留八次选择，十六篇中性代码指南通过情境、取舍、相邻代码和可选反思解释各种组合。页面不分配官方角色，也不把十六个组合当作已确立的十六种天然人格类别。"
      }
    ]
  },
  {
    "id": "love-combinations-axes",
    "title": {
      "en": "Read L/F and C/A as choices, not abilities",
      "zh": "把L/F与C/A读成选择，而非能力"
    },
    "paragraphs": [
      {
        "en": "L/F compares starting with your own proposal against first hearing a partner’s proposal and then responding. Both can involve initiative and a clear opinion. Choosing F is not a record of obedience, and choosing L does not establish leadership skill or a right to control the other person.",
        "zh": "L/F比较先提出自己的主意，还是先听对方的主意再回应；两侧都可以包含主动性和明确意见。选F不记录服从，选L也不证明领导能力或赋予控制对方的权利。"
      },
      {
        "en": "C/A compares which care role appeals in the stated moment: receiving reassurance or offering it. Either person can give and receive care across a relationship. The counts do not quantify dependency, empathy, generosity or the actual balance of care between two people.",
        "zh": "C/A比较指定时刻更吸引你的照顾角色：接受安慰还是提供安慰。关系中的同一个人可以给予也可以接受，次数不量化依赖、共情、慷慨或两人之间实际的照顾平衡。"
      }
    ]
  },
  {
    "id": "love-combinations-other-axes",
    "title": {
      "en": "Read R/P and O/E with the same situational focus",
      "zh": "以同样的情境参照阅读R/P与O/E"
    },
    "paragraphs": [
      {
        "en": "R/P compares the first consideration in a choice: whether ordinary circumstances make it workable, or whether it brings romantic attraction and emotional connection. Practical considerations and romantic feelings can coexist. Selecting one starting point does not measure how deeply you love or how rationally you think.",
        "zh": "R/P比较作选择时首先留意的方面：普通生活条件是否让它可行，还是它带来的心动与情感连接。实际考虑与浪漫感受可以共存，选一个起点不衡量爱得多深或思考多理性。"
      },
      {
        "en": "O/E compares leaving room to explore details against explicitly discussing expectations. Flexibility is not permission to ignore an agreement; explicit intention is not proof of loyalty. Read the particular option rather than inferring honesty, safety or commitment quality from a letter.",
        "zh": "O/E比较保留逐步探索细节的空间，还是明确讨论期待。弹性不意味着可以忽视约定，明确意图也不证明忠诚。应阅读具体选项，不从字母推断诚实、安全或承诺质量。"
      }
    ]
  },
  {
    "id": "love-combinations-counts",
    "title": {
      "en": "Eight pairs per axis: count and retain every exact tie",
      "zh": "每轴八题：计次并保留所有精确并列"
    },
    "paragraphs": [
      {
        "en": "Each selected option adds one count to its letter on that axis, so each pair of side counts sums to eight. If the counts are 6:2, the six-count letter remains; at 5:3 the five-count letter remains; at 4:4 both remain. Each side appears first in four of the eight pairs, but scoring follows the selected letter, not its screen position.",
        "zh": "每个所选选项为本轴对应字母加一次，因此每轴两侧合计八次。6:2保留六次的一侧，5:3保留五次的一侧，4:4两侧都保留。八题中每侧各四次放在第一位置，计分依据所选字母，而不是屏幕位置。"
      },
      {
        "en": "There is no total across axes, partial result, random tie-break or additional deciding question. All thirty-two pairs need a choice. If neither option fits sufficiently, you can stop and read the public guides; this bank does not score a skip option or infer the missing preference.",
        "zh": "不合成跨轴总分，不生成部分结果，不随机破并列，也不加题裁决。三十二题均需选择；两项都不够贴切时，可停止并读公开指南。本题本不为跳过计分，也不推测缺失偏好。"
      }
    ]
  },
  {
    "id": "love-combinations-combinations",
    "title": {
      "en": "One, two, four, eight or sixteen compatible readings",
      "zh": "一、二、四、八或十六份兼容读法"
    },
    "paragraphs": [
      {
        "en": "Combine the retained letters in axis order L/F, C/A, R/P, O/E. Counts L6:F2, C4:A4, R5:P3 and O3:E5 retain L, both C/A, R and E, producing LCRE and LARE. Both full guides are available; their display order is a catalog order, not a ranking.",
        "zh": "按L/F、C/A、R/P、O/E轴序交叉组合保留字母。例如L6:F2、C4:A4、R5:P3、O3:E5，保留L、C/A两者、R和E，得到LCRE与LARE，两篇完整指南都可读；展示顺序是目录顺序，不是排名。"
      },
      {
        "en": "With t tied axes the number of compatible readings is 2 to the power t. No ties give one; four tied axes give all sixteen. Here compatible means consistent with the retained-letter sets from one attempt. It does not mean suitable for a partner, equally likely personalities, or a measured probability for any code.",
        "zh": "有t条并列轴时，兼容读法数量为2的t次方；没有并列是一份，四轴全并列是十六份。这里兼容表示与一次作答的保留字母集合相符，不是适合某位伴侣，也不是各人格等概率或某代码的测量概率。"
      }
    ]
  },
  {
    "id": "love-combinations-close-counts",
    "title": {
      "en": "A one-choice change is not a measured personality transformation",
      "zh": "改变一项选择，不等于测出人格转变"
    },
    "paragraphs": [
      {
        "en": "Changing one selection moves one count from a side to the other. A 5:3 comparison becomes 4:4 if one majority-side choice changes, adding another compatible letter; changing again can make it 3:5. The arithmetic explains why the set of readings can change abruptly even when only one answer changed.",
        "zh": "改一项选择，会从原侧移走一次并为另一侧增加一次。5:3中有一个多数侧选择改变，就成为4:4并增加另一个兼容字母；再改一个可能成为3:5。算式解释了为何只改一题，读法集合就可能明显变化。"
      },
      {
        "en": "The edition retains only exact 4:4 ties; it has no validated near-tie band or measurement-error estimate. Keep both counts in view, especially around the middle. A larger margin describes these eight choices and does not establish a stronger trait, higher confidence or greater long-term stability.",
        "zh": "本版只保留精确4:4并列，没有经过验证的近似并列范围或测量误差估计。尤其接近中间时，应同时看两侧次数；差距较大只描述这八次选择，不证明特质更强、置信度更高或长期更稳定。"
      }
    ]
  },
  {
    "id": "love-combinations-research",
    "title": {
      "en": "Relationship research asks different questions from a code quiz",
      "zh": "关系研究与代码问卷回答不同问题"
    },
    "paragraphs": [
      {
        "en": "Joel and colleagues analyzed forty-three longitudinal couple datasets to examine relationship quality and its prediction over time; changes in quality remained difficult to predict. [3] That study did not test these four axes or this questionnaire. Its purpose illustrates why describing preferences and predicting a relationship outcome require different evidence.",
        "zh": "Joel等分析四十三个伴侣纵向数据集，研究关系质量及其随时间的预测；关系质量的变化仍难以预测。[3] 该研究没有检验本四轴或本问卷。这体现了描述偏好与预测关系结果需要不同证据。"
      },
      {
        "en": "The thirty-two pairs, open counts and code explanations are this edition’s own content. Reliability, validity, population norms and English–Chinese measurement equivalence have not been established. A familiar description or a meaningful conversation does not by itself establish those properties, and research on another tool cannot be transferred to these counts.",
        "zh": "三十二题、公开次数与代码解释由本版独立编写，尚未建立信度、效度、人群常模或中英文测量等值。读起来熟悉或促成一次有意义的交流，本身不足以确立这些性质；其他工具的研究也不能移植到这些次数上。"
      }
    ]
  },
  {
    "id": "love-combinations-use",
    "title": {
      "en": "Read a neighboring code, then return to a concrete preference",
      "zh": "阅读相邻代码，再回到具体偏好"
    },
    "paragraphs": [
      {
        "en": "Compare a guide that differs in one letter and notice which example fits the chosen situation better. For example, compare how LCRE and LARE describe receiving or offering care while holding the other three letters constant. Find a counterexample too: when would you want the other role? You need not settle on a permanent code.",
        "zh": "可以比较只差一个字母的指南，观察哪一个例子更符合所选情境。例如比较LCRE与LARE在其他三字母不变时，怎样描述接受或提供照顾；也找一个反例：何时你会想要另一种角色？不必确定永久代码。"
      },
      {
        "en": "If useful, keep one private sentence about a preference or discuss one ordinary arrangement voluntarily. No partner participation, disclosure or matching result is required. Answers are calculated in the browser; optional tab-session drafts expire after twenty-four hours and clear on completion, retake or exit-and-clear. Copying shares only the public entry, without answers, counts or your compatible-code set.",
        "zh": "若有用，可私下记一句偏好，或自愿讨论一项普通安排；无需伴侣参与、披露或获得匹配结果。答案在浏览器计算，可选标签页会话草稿二十四小时后失效，完成、重测或退出清除即删除。复制仅分享公开入口，不含答案、次数或个人兼容代码集合。"
      }
    ]
  }
];
export const loveCombinationsLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "What does compatible mean in this result?",
      "zh": "结果里的兼容是什么意思？"
    },
    "answer": {
      "en": "A code uses one retained letter from each of your four comparisons. It is compatible with this answer record, not a judgment of compatibility with another person.",
      "zh": "代码从四组比较各取一个保留字母，与本次回答记录相符，不是对你与另一人的适配判断。"
    }
  },
  {
    "question": {
      "en": "Why do two tied axes give four guides?",
      "zh": "为什么两条轴并列会有四篇指南？"
    },
    "answer": {
      "en": "Each tied axis contributes two possible letters. Two times two gives four combinations, while the untied axes each contribute one.",
      "zh": "每条并列轴提供两个可用字母，两乘两得到四个组合，未并列轴各提供一个字母。"
    }
  },
  {
    "question": {
      "en": "Does 8:0 mean I can never prefer the other side?",
      "zh": "8:0表示我永远不会喜欢另一侧吗？"
    },
    "answer": {
      "en": "No. It records eight selections in these situations. It does not establish what you would choose in every context or at another time.",
      "zh": "不表示。它记录这些情境中的八次选择，不确定你在所有背景或其他时间都会怎样选。"
    }
  },
  {
    "question": {
      "en": "Are 5:3 counts automatically treated as nearly tied?",
      "zh": "5:3会自动按近似并列处理吗？"
    },
    "answer": {
      "en": "No. This edition keeps exact 4:4 ties only. At 5:3 the five-count letter remains, while both raw counts are still shown.",
      "zh": "不会。本版只保留精确4:4并列；5:3保留五次的字母，同时仍显示两侧原始次数。"
    }
  },
  {
    "question": {
      "en": "Can receiving and offering care both appeal to me?",
      "zh": "接受与提供照顾可以都吸引我吗？"
    },
    "answer": {
      "en": "Yes. Each pair asks for the closer role in its moment. A relative choice does not mean the other role is absent from your relationship.",
      "zh": "可以。每题只比较该时刻相对更贴近的角色，选一个不表示另一角色不存在于你的关系中。"
    }
  },
  {
    "question": {
      "en": "Does one changed letter prove that my relationship changed?",
      "zh": "一个字母变了，是否证明关系已经改变？"
    },
    "answer": {
      "en": "No. Answer interpretation, the chosen situation or one near-middle choice may change the code. This test does not measure relationship change.",
      "zh": "不证明。题意理解、所选情境或一个接近中间的选择都可能改变代码，本测试不测量关系变化。"
    }
  },
  {
    "question": {
      "en": "Can the counts be converted to MBTI or attachment style?",
      "zh": "次数可以换算成MBTI或依恋风格吗？"
    },
    "answer": {
      "en": "No conversion is established. Different questionnaires use different concepts, questions and scoring; shared four-letter formatting does not make them equivalent.",
      "zh": "没有已确立的换算。不同问卷的概念、题目和计分不同，共用四字母形式不意味着等价。"
    }
  },
  {
    "question": {
      "en": "Must I choose a single guide when all axes tie?",
      "zh": "四轴全并列时，必须挑一篇指南吗？"
    },
    "answer": {
      "en": "No. All sixteen are retained without ranking. You can compare relevant examples or finish without choosing a permanent label.",
      "zh": "不需要。十六篇全部保留且不排名，可以比较有关例子，也可以不选永久标签就结束。"
    }
  }
];
export const loveCombinationsLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Joel et al. (2020): prediction of relationship quality in longitudinal couple studies",
      "zh": "Joel等（2020）：伴侣纵向研究中的关系质量预测"
    },
    "url": "https://pubmed.ncbi.nlm.nih.gov/32719123/"
  }
];
