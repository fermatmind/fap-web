import type { Questionnaire } from "@/lib/questionnaires/types";
export const faceSelfImageLandingSections: Questionnaire["guide"] = [
  {
    "id": "face-self-image-purpose",
    "title": {
      "en": "Face self-image: four experiences, not a beauty score",
      "zh": "面部自我形象观察：四类体验，而非颜值分"
    },
    "paragraphs": [
      {
        "en": "These sixteen original prompts concern noticing something you like about your face, making care or styling choices yourself, feeling at ease in photos and staying involved around other people. Each part records the frequency of its own stated moments during the past month. The questionnaire does not inspect your face or ask other people to evaluate it.",
        "zh": "十六条原创题分别关注注意到自己喜欢的面部细节、自主选择打理或造型、照片中的自在感，以及与人相处时持续参与活动。各部分记录过去一个月中对应时刻的自报频率，不检查面部，也不要求别人评价。"
      },
      {
        "en": "Someone can enjoy choosing a hairstyle while feeling uncomfortable in photos, or feel at ease in conversation without spending much time on styling. The four readings preserve those differences. They are not a single attractiveness, confidence or self-worth scale, and no combination defines what you should look like.",
        "zh": "一个人可以喜欢自主选择发型，却在照片中感到不自在；也可以很少打理造型，却能自在参与对话。四项读法保留这些差异，不合成吸引力、自信或自我价值尺度，任何组合都不规定你应该长什么样。"
      }
    ]
  },
  {
    "id": "face-self-image-context",
    "title": {
      "en": "Answer about one month of your own experience",
      "zh": "怎样作答：回看一个月中自己的体验"
    },
    "paragraphs": [
      {
        "en": "This reflection is for adults. Use the past month consistently, recalling ordinary settings rather than choosing your best photograph or imagining a stranger’s judgement. The five responses run from never to almost always; 3 means sometimes. They describe how often the particular experience felt applicable, not how strongly you approve of an appearance ideal.",
        "zh": "本反思面向成年人，全程以过去一个月为参照，回忆普通场合，不挑最好看的照片，也不想象陌生人怎样判断。五个选项从从不到几乎每次，3表示有时，描述对应体验出现的自报频率，不表示多么赞同某种外貌理想。"
      },
      {
        "en": "If you had no relevant photo or social setting, cannot judge the experience or prefer not to answer, choose unscored. Not having a suitable occasion is different from never feeling at ease when an occasion arose. The questionnaire does not count how many opportunities you had, so its means are not percentages of photos, conversations or days.",
        "zh": "没有相关拍照或社交场合、无法判断或不愿回答时，可以选未评分。没有合适机会，区别于有机会时从未感到自在。本问卷没有统计机会次数，因此均值不是照片、对话或天数的百分比。"
      }
    ]
  },
  {
    "id": "face-self-image-view-care",
    "title": {
      "en": "Seeing your face and choosing care are separate",
      "zh": "怎样看自己的脸与怎样自主打理，分别理解"
    },
    "paragraphs": [
      {
        "en": "The face-view prompts concern noticing liked, familiar or pleasant details, including moments without comparison. More frequent responses describe those experiences; they do not establish symmetry, facial proportions, a general level of body appreciation or how other people perceive you. Less frequent responses do not establish an unattractive feature.",
        "zh": "面部看法题关注注意到喜欢、熟悉或愉快的细节，也包含不作比较的时刻。更频繁的回答描述的是这些体验，不确定对称性、五官比例、整体身体欣赏程度或别人怎样看你；较少出现也不证明某个特征不好看。"
      },
      {
        "en": "Chosen care concerns moments when you selected a routine, adjusted a detail or tried a styling idea because you wanted to. It is not a hygiene checklist, a measure of money spent or a requirement to maintain a routine. A low frequency may reflect little interest or few relevant occasions; the number alone cannot explain why.",
        "zh": "自主打理关注自己愿意选择程序、调整细节或尝试造型想法的时刻，不是卫生检查表，不统计消费，也不要求维持打理习惯。频率较低可能与兴趣较少或机会不多有关；仅凭数字无法确定原因。"
      }
    ]
  },
  {
    "id": "face-self-image-photo-people",
    "title": {
      "en": "Photo ease and attention around people are contextual",
      "zh": "照片自在感与人群中的注意体验，都需要情境"
    },
    "paragraphs": [
      {
        "en": "Photo ease concerns recognising an expression as your own, being comfortable with an ordinary photograph, leaving a photo choice without repeated inspection and staying involved while a picture is taken. The page does not evaluate the photograph’s quality or measure another person’s reaction. You do not need to take or retrieve any picture to answer.",
        "zh": "照片自在感关注认出自己的表情、对普通照片感到自在、选定后不反复检查，以及拍照时继续参与当下。页面不评价照片质量，也不测别人的反应；作答不需要新拍照或翻找照片。"
      },
      {
        "en": "The attention-related prompts ask about following conversation or activity, letting your face be seen and remaining involved when appearance differs from your plan. They do not establish sociability, other people’s acceptance or a clinical condition. Read an answer alongside the setting, your comfort and what was happening, without converting it into a fixed social identity.",
        "zh": "注意体验题关注跟随对话或活动、让面部自然呈现，以及外貌与计划不同时继续参与，不确定社交性、他人接纳或临床状况。可以结合场合、当时的自在程度及发生的事情理解回答，不转换成固定社交身份。"
      }
    ]
  },
  {
    "id": "face-self-image-calculation",
    "title": {
      "en": "Four raw frequency means: examples and missing responses",
      "zh": "四项原始频率均值：算例与未评分处理"
    },
    "paragraphs": [
      {
        "en": "Each group has four equally weighted prompts, scored directly from 1 to 5 without reversal. At least three numeric ratings are needed. For example, 2, 4, 4 and unscored give a sum of 10 across three rated items: 10 ÷ 3 is displayed as 3.3. Two ratings of 5 give insufficient information, not a mean of 5.0 or a penalty for missing items.",
        "zh": "每组四题等权，直接按1至5计分，没有反向处理，至少三条数字才显示均值。例如2、4、4及未评分，三条数字合计10，10÷3显示为3.3；只有两条5分时显示资料不足，不显示5.0，也不因缺项扣分。"
      },
      {
        "en": "The same mean may summarise different experiences. Ratings 1, 3, 5 and unscored average 3.0, as do four ratings of 3, but one set varies across prompts and has less coverage. The result therefore keeps the sum and rated count beside each mean. The three-item threshold is an edition-specific reporting rule, not a proven reliability boundary.",
        "zh": "相同均值可能概括不同体验。1、3、5及未评分的均值为3.0，四条3也为3.0，但前者题间差异更大、覆盖更少。因此结果在均值旁保留原始和与已评分题数。三题门槛是本版报告规则，不是已证实的信度边界。"
      }
    ]
  },
  {
    "id": "face-self-image-reading",
    "title": {
      "en": "Read frequency without ranking appearance",
      "zh": "阅读频率，不给外貌排名"
    },
    "paragraphs": [
      {
        "en": "A higher mean means more frequent endorsement of this group’s stated experiences. The bar locates the raw mean between 1 and 5; its length is not a beauty percentage, population percentile or probability. A mean of 1 is a valid never response summary even when the bar is empty. No total, high/low category or winning theme is calculated.",
        "zh": "均值较高表示更常认同本组所述体验。条形定位1至5之间的原始均值，长度不是颜值百分比、人群百分位或概率。即使条形为空，均值1仍是有效的从不回答摘要。不计算总分、高低类别或胜出主题。"
      },
      {
        "en": "Keep all four guides in view, including when one or every part has insufficient information. If you repeat the reflection, compare the actual statements, occasions and missing items first. A changed mean can reflect a different month or different recalled experiences; without measurement-error and test–retest evidence, it does not quantify a lasting personal change.",
        "zh": "可以一起阅读四份指南，即使一部分或全部资料不足也如此。重测时先比较具体陈述、机会与未评分项。均值改变可能与月份或回忆经历不同有关；缺少测量误差及重测证据时，不据此量化持久的个人变化。"
      }
    ]
  },
  {
    "id": "face-self-image-research",
    "title": {
      "en": "Body-image research and the limits of this edition",
      "zh": "身体形象研究与本原创版本的证据范围"
    },
    "paragraphs": [
      {
        "en": "Positive body image is a research topic with specifically developed instruments. Tylka and Wood-Barcalow’s BAS-2 study refined a ten-item body-appreciation measure and examined its structure, reliability and validity in college and online community samples. [1] That instrument concerns body appreciation; this page uses sixteen original prompts and four separate themes rather than administering BAS-2.",
        "zh": "积极身体形象是有专门测量工具的研究主题。Tylka与Wood-Barcalow的BAS-2研究精炼了十题身体欣赏工具，并在大学及在线社区样本中考察结构、信度与效度。[1] 该工具关注身体欣赏；本页使用十六条原创题及四个独立主题，不施测BAS-2。"
      },
      {
        "en": "This edition has no established reliability, validity, population norms or English–Chinese measurement equivalence. Its arithmetic is transparent, but reproducible calculation alone does not validate an interpretation. It also does not screen for a health condition. CCI distinguishes general body-image concerns from the specific clinical topic of body dysmorphic disorder. [2] Neither a low nor a high mean here establishes or rules out that condition.",
        "zh": "本版尚未建立信度、效度、人群常模或英中测量等值。算术透明，但计算可复现本身不验证解释；本页也不筛查健康状况。CCI区分一般身体形象困扰与躯体变形障碍这一特定临床主题。[2] 本页均值无论高低，都不能确定或排除该状况。"
      }
    ]
  },
  {
    "id": "face-self-image-next",
    "title": {
      "en": "An optional observation, with no appearance task required",
      "zh": "可选观察：无需再完成任何外貌任务"
    },
    "paragraphs": [
      {
        "en": "If you want a next step, choose one prompt and privately recall the ordinary situation in which it fitted or did not fit. You can note what helped you stay with the activity without inspecting a mirror, taking a selfie or asking for reassurance. No purchase, grooming plan, comparison with another face or change to a feature follows from these results. You can stop here.",
        "zh": "如想继续，可以选一条题目，私下回想它在哪个普通情境符合或不符合，记录哪些条件有助于自己参与活动，无需照镜检查、自拍或向他人求证。结果不要求购物、打理计划、与另一张脸比较或改变五官，也可以到此结束。"
      },
      {
        "en": "Start goes directly to the first prompt. Questions and all four complete guides are free without registration, a photograph or camera access. Saving a tab draft is optional and lasts up to twenty-four hours; completion, clearing or retake removes it. Public sharing contains the title and entry link, without answers or means.",
        "zh": "点击开始直接进入第一题。完整题目与四份指南免费，无需注册、照片或相机权限。标签页草稿可选保存，最多二十四小时，完成、清除或重测即删除。公开分享只包含标题及入口，不包含答案或均值。"
      }
    ]
  }
];
export const faceSelfImageLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "What does this face self-image test observe?",
      "zh": "面部自我形象观察测什么？"
    },
    "answer": {
      "en": "Self-reported frequency during the past month across face-view, chosen care, photo ease and attention around people. It does not examine a face, measure attractiveness or collect other people’s ratings.",
      "zh": "观察过去一个月面部看法、自主打理、照片自在感及人群中注意体验的自报频率，不检查面部、不测吸引力，也不收集别人评分。"
    }
  },
  {
    "question": {
      "en": "Can I answer without recent photos?",
      "zh": "最近没有拍照也能作答吗？"
    },
    "answer": {
      "en": "Yes. Use unscored where there is no suitable experience rather than guessing how comfortable a hypothetical photograph would feel. Other groups can still have enough information; every complete guide remains available.",
      "zh": "可以。没有合适经历时选未评分，不必猜测假想照片会让你多自在。其他部分仍可拥有足够资料，全部完整指南均开放。"
    }
  },
  {
    "question": {
      "en": "Does 3 mean neutral about my appearance?",
      "zh": "3分表示对外貌中立吗？"
    },
    "answer": {
      "en": "No. Here 3 means sometimes, a frequency response. Uncertainty or an unsuitable experience is unscored and is excluded from the mean. The page does not ask whether your appearance is average.",
      "zh": "不是。本页3表示有时，是频率回应；不确定或经历不适用可选未评分，不进入均值。页面不询问外貌是否处于平均水平。"
    }
  },
  {
    "question": {
      "en": "How can I verify a mean of 3.3?",
      "zh": "怎样核对3.3这样的均值？"
    },
    "answer": {
      "en": "Ratings 2, 4 and 4 total10 over three rated items;10 divided by3 rounds to3.3. An unscored fourth response adds nothing to either sum or denominator. Fewer than three numeric ratings give insufficient information.",
      "zh": "2、4、4三条数字合计10，10除以3保留一位小数为3.3；第四条未评分不进入原始和或分母。少于三条数字显示资料不足。"
    }
  },
  {
    "question": {
      "en": "Does more chosen care mean better hygiene or confidence?",
      "zh": "自主打理更频繁，表示卫生或自信更好吗？"
    },
    "answer": {
      "en": "No. These prompts concern choices you wanted to make in particular moments. They do not verify hygiene, evaluate a routine, count purchases or measure confidence as seen by others. Frequency alone cannot explain why those moments occurred.",
      "zh": "不表示。这组关注特定时刻自己愿意作出的选择，不验证卫生、不评价程序、不统计购物，也不测别人眼中的自信。仅凭频率不能解释这些时刻为何出现。"
    }
  },
  {
    "question": {
      "en": "Is this the Body Appreciation Scale-2?",
      "zh": "这是身体欣赏量表BAS-2吗？"
    },
    "answer": {
      "en": "No. BAS-2 is a separate ten-item research instrument. [1] This is a sixteen-prompt original reflection with four themes. Its items, response use and scoring do not inherit the other instrument’s validation, norms or interpretation.",
      "zh": "不是。BAS-2是独立的十题研究工具。[1] 本页是十六题、四主题原创反思，题目、回答用途及计分不继承另一工具的验证、常模或解释。"
    }
  },
  {
    "question": {
      "en": "Can the results identify a body-image disorder?",
      "zh": "结果能判断身体形象障碍吗？"
    },
    "answer": {
      "en": "No. These raw frequencies neither establish nor rule out a condition and have no clinical cutoff. General appearance experiences and a specific clinical assessment are different tasks. [2] Do not use a result to make a treatment decision.",
      "zh": "不能。原始频率不确定或排除某种状况，也没有临床分界。一般外貌体验与特定临床评估是不同任务。[2] 不据此作出治疗决定。"
    }
  },
  {
    "question": {
      "en": "Do I need to improve a feature or keep taking this test?",
      "zh": "需要改善五官或反复做测试吗？"
    },
    "answer": {
      "en": "No. There is no target face, target score or appearance assignment. You can read the guides once and stop. If you revisit later, consider changed situations and missing responses rather than treating a number as proof that your face or worth improved.",
      "zh": "不需要。没有目标面孔、目标分数或外貌作业，可以读完指南后结束。以后重看时，可考虑情境及未评分项的变化，不把数字当作面部或价值变好的证明。"
    }
  }
];
export const faceSelfImageLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "en": "Tylka & Wood-Barcalow (2015): BAS-2 development — a separate research instrument",
      "zh": "Tylka与Wood-Barcalow（2015）：BAS-2开发——独立研究工具"
    },
    "url": "https://bpb-us-w2.wpmucdn.com/u.osu.edu/dist/1/10560/files/2015/02/BAS-2-113y6qk.pdf"
  },
  {
    "title": {
      "en": "Centre for Clinical Interventions: body-image concerns and body dysmorphic disorder",
      "zh": "临床干预中心：身体形象困扰与躯体变形障碍"
    },
    "url": "https://www.cci.health.wa.gov.au/resources/looking-after-yourself/body-dysmorphia"
  }
];
