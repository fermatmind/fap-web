import type { Questionnaire } from "@/lib/questionnaires/types";
export const foodDisgustLandingSections: Questionnaire["guide"] = [
  {
    "id": "fds-reading-scope",
    "title": {
      "en": "Food Disgust Scale: imagined reactions across eight domains",
      "zh": "食物厌恶量表：八类情境中的想象反应"
    },
    "paragraphs": [
      {
        "en": "The Food Disgust Test asks how disgusting each stated food situation would feel, rather than whether you agree with a general opinion about food. This edition presents all thirty-two English prompts from the declared published supplement, with a new Chinese working translation. You can read every guide before answering.",
        "zh": "食物厌恶测试询问指定食物情境会让你感到多恶心，而不是对一般饮食观点的同意程度。本版呈现已声明发表补充材料中的全部三十二道英文题，并提供新中文工作译文；答题前即可阅读每篇指南。"
      },
      {
        "en": "Your result keeps eight separate readouts with item counts, numeric sums and complete-part means. The profile can help you name a particular reaction, such as discomfort about shared utensils or a particular food appearance. It does not identify a single food-disgust personality or require an explanation for your preferences.",
        "zh": "结果分别保留八组读数、题目数量、数字原始和与完整分组均值。它帮助你说清具体反应，例如对共用餐具或某种食物外观的不适，不分配单一食物厌恶人格，也不要求你解释自己的偏好。"
      }
    ]
  },
  {
    "id": "fds-reading-domains",
    "title": {
      "en": "Read the eight domain names alongside their actual situations",
      "zh": "结合实际题意理解八个领域"
    },
    "paragraphs": [
      {
        "en": "In this bank, animal flesh has four prompts; poor hygiene has five; human contact with food has four; and mold has four. The first concerns animal-related food scenes, while the next two separate preparation or serving conditions from another person’s contact. Mold has its own set of scenarios rather than being merged into a general hygiene score.",
        "zh": "本题本中，动物肉类四题、卫生状况五题、他人接触食物四题、霉斑四题。第一组涉及动物相关食物场景，后两组分别关注准备或供餐条件与他人的接触；霉斑有独立情境组，不并入一般卫生分数。"
      },
      {
        "en": "Decaying fruit, fish and decaying vegetables each have four prompts, while living contaminants has three. These names organize the specified wording; they do not describe everything in a food category. A fish-related mean is not an allergy result, and a fruit-related mean is not a recommendation about which fruit to keep or discard.",
        "zh": "水果过熟与变化、鱼类、蔬菜变质各四题，活体污染物三题。名称用于整理指定题文，不概括某类食物的一切特征。鱼类均值不是过敏结果，水果均值也不建议哪种水果应该保留或丢弃。"
      }
    ]
  },
  {
    "id": "fds-reading-response",
    "title": {
      "en": "Six rating points, with a separate unscored choice",
      "zh": "六点评分，另设不评分选项"
    },
    "paragraphs": [
      {
        "en": "Imagine only the wording provided. One means not disgusting at all and six means very disgusting; two through five are intermediate numbers without extra verbal anchors. This is an intensity rating, not a right-or-wrong judgment, an agreement scale or a count of how often the situation happened.",
        "zh": "只想象提供的文字。1表示完全不恶心，6表示非常恶心；2至5为没有额外文字标签的中间数字。这是程度评价，不是对错判断、同意度或情境发生次数。"
      },
      {
        "en": "If you cannot rate a scene or prefer not to answer it numerically, use the unscored choice. It records a response without adding a number. All thirty-two prompts need a response before the personal record appears; you can stop instead, and the public guides remain available. No real-food task is part of this questionnaire.",
        "zh": "无法评价或不想提供数字时，可选不评分，记录回应但不加入数字。三十二题都回应后才显示个人记录；也可以停止，公开指南始终可读。本问卷不包含实际食物任务。"
      }
    ]
  },
  {
    "id": "fds-reading-arithmetic",
    "title": {
      "en": "Why each part uses its own denominator",
      "zh": "为什么每个部分使用自己的分母"
    },
    "paragraphs": [
      {
        "en": "A complete part’s mean equals its numeric sum divided by its own item count, rounded to one decimal. Four ratings 2, 3, 4, 4 give 13 ÷ 4 = 3.3 after rounding. Five ratings 2, 3, 4, 4, 5 give 18 ÷ 5 = 3.6. Three ratings 2, 3, 5 give 10 ÷ 3 = 3.3. None is reverse-scored.",
        "zh": "完整分组均值等于数字原始和除以本组题数，保留一位小数。四题2、3、4、4得到13÷4，取一位小数为3.3；五题2、3、4、4、5得到18÷5＝3.6；三题2、3、5得到10÷3，取一位小数为3.3。没有反向题。"
      },
      {
        "en": "Raw sums are affected by group length: a five-item part can total 30, while a three-item part can total 18. Comparing those totals as if they shared a denominator is misleading. Means share the 1–6 response range but refer to different scenes; the page does not add them, calculate an overall index or rank your position in a population.",
        "zh": "原始和受题数影响：五题组最高合计30，三题组最高合计18，不能把总和当作分母相同的数值比较。均值虽同用1至6范围，却对应不同场景；页面不将其相加、不计算总体指数，也不排列你在人群中的位置。"
      }
    ]
  },
  {
    "id": "fds-reading-missing",
    "title": {
      "en": "One unscored response affects its own part, not all eight",
      "zh": "一项不评分只影响所在部分"
    },
    "paragraphs": [
      {
        "en": "Every item in a part must have a numeric rating for that part’s mean. If a four-item part has 2, 3, 4 and unscored, the record shows sum 9 and coverage 3/4, but no mean. It does not divide by three, insert a midpoint or treat the unscored response as zero.",
        "zh": "某组每题都是数字才显示该组均值。四题为2、3、4与不评分时，保留原始和9、覆盖3/4，但不计算均值；不会除以3、补入中点或把不评分当零。"
      },
      {
        "en": "Other fully rated parts retain their own means. If all thirty-two responses are unscored, all eight means are withheld while every complete guide stays readable. This complete-part rule is a declared online handling choice, not a claim that missing answers carry a psychological meaning.",
        "zh": "其他数字完整的部分仍保留各自均值。若三十二题全部不评分，八组都不给均值，但全部完整指南仍可阅读。这是明确声明的线上缺项处理选择，不声称缺答本身具有心理含义。"
      }
    ]
  },
  {
    "id": "fds-reading-research",
    "title": {
      "en": "Published research and the limits of this online edition",
      "zh": "发表研究与本线上版本的证据范围"
    },
    "paragraphs": [
      {
        "en": "The cited 2020 study examined a Spanish-language adaptation in Mexican adults and tested an eight-factor model. [1] Those findings concern that study’s instrument and sample. They do not validate this site’s Chinese working translation, unscored option or complete-part handling.",
        "zh": "所引2020年研究考察墨西哥成人中的西班牙语改编，并检验八因素模型。[1] 这些发现属于该研究工具与样本，不验证本站中文工作译文、不评分选项或完整分组处理。"
      },
      {
        "en": "Our source declaration identifies the English bank, chosen endpoints, attribution and online changes. Read it when comparing versions. A reproducible formula shows how this record was calculated; establishing reliability, interpretation and cross-language equivalence would additionally require evidence for the actual edition and intended use.",
        "zh": "本站来源说明列明英文题本、所选端点、署名与线上改编，跨版本比较时应先核对。可复算公式说明记录怎样产生；要建立信度、解释依据与跨语言等值，还需要针对实际版本与预期用途的证据。"
      }
    ]
  },
  {
    "id": "fds-reading-reading",
    "title": {
      "en": "Turn a mean into a specific, nonjudgmental description",
      "zh": "把均值转成具体、不评判的描述"
    },
    "paragraphs": [
      {
        "en": "Begin with one item and describe the imagined reaction in your own terms: “Sharing that utensil feels uncomfortable to me.” Check whether other items in the same domain fit equally well. Four ratings 1, 1, 6, 6 and four ratings 3, 3, 4, 4 both average 3.5, although the response patterns differ.",
        "zh": "可以从一题开始，用自己的话描述想象反应，例如“共用那件餐具让我不舒服”，再看同组其他题是否同样符合。1、1、6、6与3、3、4、4均为3.5，但反应模式不同。"
      },
      {
        "en": "Use such descriptions to communicate a preference, without treating another person’s different reaction as inferior, unsafe or more sophisticated. The page offers no threshold for being too sensitive, no reason to prove tolerance and no instruction to eat, smell, handle or recreate the situations.",
        "zh": "这些描述可以用于说明偏好，不把别人不同的反应评为低劣、不安全或更有品位。页面没有“过度敏感”阈值，不要求证明耐受，也不要求食用、闻嗅、触碰或重现这些场景。"
      }
    ]
  },
  {
    "id": "fds-reading-comparison",
    "title": {
      "en": "Compare editions before comparing results",
      "zh": "先比较版本，再比较结果"
    },
    "paragraphs": [
      {
        "en": "The letters FDS do not guarantee the same items, response anchors, group structure or missing-data rules on every website. A percentage from another quiz cannot be read as this page’s raw mean or as a percentile. This edition uses eight complete guides and eight separate means, without calculating the eight-item short form.",
        "zh": "不同网站都写FDS，不保证题目、评分端点、分组结构或缺项规则相同。另一问卷的百分数不能直接当作本页原始均值或人群百分位。本版使用八篇完整指南与八组独立均值，不计算八题短版。"
      },
      {
        "en": "When revisiting, compare the same wording and numeric coverage, and remember that context or interpretation can change a response. Private answers are calculated in the browser. Optional tab-session progress expires after twenty-four hours and clears on completion, retake or exit-and-clear; the copy control shares a public entry without answers or means.",
        "zh": "再次作答时，应比较相同题文与数字覆盖，并考虑情境或理解可能影响回应。私人回答在浏览器计算；可选标签页会话进度二十四小时后失效，完成、重测或退出清除即删除。复制仅分享公开入口，不含答案或均值。"
      }
    ]
  }
];
export const foodDisgustLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Are food disgust and food safety the same thing?",
      "zh": "食物厌恶与食品安全是一回事吗？"
    },
    "answer": {
      "en": "No. This record concerns imagined reactions to wording. It contains no inspection, contamination test or determination that a real food is safe.",
      "zh": "不是。本记录关注文字想象中的反应，没有检查、污染检测或真实食物安全判定。"
    }
  },
  {
    "question": {
      "en": "Why do the eight parts have different numbers of items?",
      "zh": "为什么八组题数不同？"
    },
    "answer": {
      "en": "The selected bank has groups of 4, 5, 4, 4, 4, 4, 4 and 3 items. Each mean uses its own complete part, rather than a common four-item denominator.",
      "zh": "所选题本各组为4、5、4、4、4、4、4、3题，各自用完整本组题数作分母，不统一按四题计算。"
    }
  },
  {
    "question": {
      "en": "Is three a neutral answer?",
      "zh": "3表示中立吗？"
    },
    "answer": {
      "en": "Three is an intermediate number on a six-point disgust scale, without an added neutral label. It is not the unscored option.",
      "zh": "3是六点恶心程度范围中的中间数字，没有另加中立标签，也不是不评分选项。"
    }
  },
  {
    "question": {
      "en": "Can I receive seven means if one part is incomplete?",
      "zh": "一组数字不完整，还能获得其他七组均值吗？"
    },
    "answer": {
      "en": "Yes, if every item in each of those seven parts is numeric and all thirty-two prompts have a response. The affected part alone has its mean withheld.",
      "zh": "可以，前提是其他七组每题都是数字，且三十二题都已回应；只不给受影响那一组的均值。"
    }
  },
  {
    "question": {
      "en": "Is a 3.5 mean a 58 percent disgust level?",
      "zh": "3.5均值是否就是58%的厌恶程度？"
    },
    "answer": {
      "en": "No. This page makes no percentage conversion. It is a raw mean of the selected 1–6 ratings, not an amount of disgust or a population rank.",
      "zh": "不是。本页不转换百分数，3.5是所选1至6评分的原始均值，不是厌恶总量或人群排名。"
    }
  },
  {
    "question": {
      "en": "Are the eight guides eight personality types?",
      "zh": "八篇指南是不是八种人格？"
    },
    "answer": {
      "en": "No. They explain eight domains. Every guide remains available for every reader, with no exclusive assignment, dominant type or tie-break rule.",
      "zh": "不是。它们解释八个领域，每位读者都能阅读全部指南，没有互斥分配、主导类型或破同分规则。"
    }
  },
  {
    "question": {
      "en": "Can an identical mean hide different reactions?",
      "zh": "相同均值可能隐藏不同反应吗？"
    },
    "answer": {
      "en": "Yes. Ratings 1, 1, 6, 6 and 3, 3, 4, 4 both average 3.5. Revisit the individual items before describing the result.",
      "zh": "可以。1、1、6、6与3、3、4、4都平均3.5，描述结果前应回看逐项回答。"
    }
  },
  {
    "question": {
      "en": "Does a lower mean show a better relationship with food?",
      "zh": "均值较低是否表示与食物的关系更好？"
    },
    "answer": {
      "en": "No. The record rates specific scenes, not nutritional adequacy, sophistication, flexibility or moral worth. It supplies no target score to achieve.",
      "zh": "不表示。记录评价具体场景，不评价营养充足程度、品位、灵活性或道德价值，也不设应达成的目标分。"
    }
  }
];
