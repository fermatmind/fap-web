import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Entry supplements; original source-bound reports, guides and FAQ remain unchanged. */
export const inkblotLandingSections: QuestionnaireSection[] = [
  {
    "id": "inkblot-five-readings",
    "title": {
      "zh": "五种读法的区别：同一张图可以怎样继续看",
      "en": "Five readings compared: different ways to continue with one image"
    },
    "paragraphs": [
      {
        "zh": "整体轮廓关注大的边界、镜像布局与留白；边缘细节关注局部转折、尖端、小点与缝隙。看完整体再追一处边缘完全可以同时发生。两者区别在本题你选择继续关注哪里，不把前者解释成战略思维，也不把后者当作细心、视力或工作准确度。",
        "en": "Whole-form Reading follows broad boundaries, mirrored layout and open spaces; Edge-detail Reading follows local turns, tips, small dots and gaps. Taking in the whole and then tracing an edge can coexist. The distinction is where you choose to continue in this question, not strategic thinking versus carefulness, eyesight or work accuracy."
      },
      {
        "zh": "动势联想把静止轮廓想成转向、靠近或展开；色块对照比较区域之间的深浅、内外与色彩；场景编想把形状临时联系成一幕。想象两个形状转动，和给它们编一个见面的场景，焦点不同但可能相接。五个名称都是本站编辑标签，不测真实运动知觉、色觉、创造力、共情或无意识。",
        "en": "Motion Association imagines turning, approaching or unfolding in static forms; Contrast Noticing compares light and dark, inner and outer regions or colors; Scene Imagining temporarily connects forms into a scene. Imagining shapes turning differs from inventing their meeting, although the two can connect. These are editorial labels, not measures of motion perception, color vision, creativity, empathy or unconscious content."
      }
    ]
  },
  {
    "id": "inkblot-worked-example",
    "title": {
      "zh": "计分示例：3、3、2、1、1与五项并列",
      "en": "Worked scoring: 3, 3, 2, 1, 1 and a five-way tie"
    },
    "paragraphs": [
      {
        "zh": "每题只给所选方向加1，10题合计10。五个方向各被提供8次，并在四个位置各出现2次；单项范围0—8。按目录顺序得到3、3、2、1、1时，整体轮廓与边缘细节同为最高，两份完整报告均显示。3/8表示八次出现机会里选择三次，不是37.5%的人格或人群排名。",
        "en": "Each response adds one count to its direction, totaling ten across ten questions. Every focus is offered eight times, twice in each option position, so its individual range is 0–8. Counts of 3, 3, 2, 1, 1 in the listed order give Whole-form and Edge-detail Reading the joint maximum; both full reports appear. Three out of eight means three selections across eight opportunities, not 37.5% of a personality or a population rank."
      },
      {
        "zh": "一直选择同一选项位置时，五项各2次，五份报告全部保留。最高3次、另一项2次不自动合并，也没有显著差异或稳定主副型的含义。当题未提供的第五种读法没有被你比较，不能算作拒绝；一项多选挤掉当题其余选项，因此五项不能当作彼此独立的能力分数。",
        "en": "Choosing the same position throughout gives two each and retains all five reports. A highest count of three and another of two are not automatically merged or treated as a significant difference or stable primary/secondary identity. The fifth reading absent from a question was not compared and is not a rejection. Choosing one displaces that question’s alternatives, so counts are not independent ability scores."
      }
    ]
  },
  {
    "id": "inkblot-professional-context",
    "title": {
      "zh": "原创趣味图与专业罗夏测验有什么区别",
      "en": "Original recreational images versus professional Rorschach assessment"
    },
    "paragraphs": [
      {
        "zh": "专业罗夏测验使用特定牌卡、实施程序、作答记录和编码解释。R-PAS公开材料分别说明官方十张牌卡与使用者训练要求，以及实施、编码、解释的专业培训。本页十张原创SVG和预设四选一没有采用历史牌卡、CS或R-PAS编码；“Rorschach-style”仅表示墨迹外观灵感，不表示官方授权、同一量表或临床等价。[1][2]",
        "en": "Professional Rorschach assessment involves specific cards, administration, response recording, coding and interpretation. R-PAS public materials describe the official ten-card set, user training requirements and professional training in administration, coding and interpretation. These ten original SVGs and fixed choices use neither historical plates nor CS or R-PAS coding. Rorschach-style describes visual inspiration, not official authorization, instrument identity or clinical equivalence.[1][2]"
      },
      {
        "zh": "专业评估也有远程施测研究，不能仅按“线上还是线下”划定科学性。Ales等对60名意大利成人志愿者所做的远程R-PAS试点，主要考察复杂性指标，并明确说明样本与其他指标的局限。这不是无人主持的四选一网页研究，更不能把其发现用于证明本站五种标签有效。[3]",
        "en": "Professional remote administration has also been studied, so online versus in-person alone does not determine scientific status. Ales and colleagues’ remote R-PAS pilot with sixty Italian adult volunteers focused on complexity and identified sample and other-score limitations. It did not study an unassisted fixed-choice website and does not validate these five labels.[3]"
      }
    ]
  },
  {
    "id": "inkblot-evidence",
    "title": {
      "zh": "怎样判断科学性：可复算与测量证据分开看",
      "en": "Evaluating scientific claims: reproducible counts and measurement evidence"
    },
    "paragraphs": [
      {
        "zh": "本页可以复算每题给哪个方向加1，也可以核对图像与题目对应。但一致的程序、均衡的选项位置和完整报告，只说明规则透明；不能据此认定五分类是心理结构、能够稳定重测或在不同语言文化中等价。本站尚无本题本的信度、效度、常模或可靠改变阈值。",
        "en": "You can reproduce which direction receives each count and check each image’s corresponding prompt. Consistent software, balanced positions and full reports make rules transparent; they do not establish a five-part psychological structure, retest stability or equivalence across languages and cultures. This questionnaire has no established reliability, validity, norms or reliable-change threshold."
      },
      {
        "zh": "判断一项正式测量，应核对究竟研究了哪套图、怎样作答、怎样编码、对什么样本与用途有效。有关专业罗夏的文献不直接支持新画的图或新的分类规则。这里更恰当的问题是“这次我愿意继续哪种看法”，不把是否看到人物、动物或某个形状解释成健康、疾病或隐藏经历。",
        "en": "For a formal measure, check the exact images, response task, coding, sample and intended interpretation studied. Professional Rorschach literature does not directly support newly drawn images or new categories. Here the appropriate question is which offered reading you wanted to pursue, without turning a person, animal or shape into evidence of health, illness or a hidden experience."
      }
    ]
  },
  {
    "id": "inkblot-example-and-counterexample",
    "title": {
      "zh": "从图像到日常观察：具体例子与反例",
      "en": "From an image to an everyday observation: examples and counterexamples"
    },
    "paragraphs": [
      {
        "zh": "假设你在一幅对称图中选择沿外轮廓看，可以先用一句话说明看的是哪段边界，再试着追一处小缺口，比较关注点怎样改变。若结果是场景编想，可以给自选的普通抽象画编一行故事，然后只描述颜色和位置。它们是可选的看图玩法，不是提高分数或治疗的训练。",
        "en": "If you choose an outer outline in a symmetrical image, describe the boundary you followed, then try tracing a small gap and compare the focus. With Scene Imagining, invent one line about an ordinary abstract picture of your choice, then describe only its colors and positions. These are optional viewing activities, not score-improvement or treatment exercises."
      },
      {
        "zh": "还应找一个不符合结果的例子：你可能喜欢看图的边缘，却不喜欢核对表格；也可能乐于给形状编故事，却在写作时更喜欢现成提纲。前后并不矛盾，因为材料、要求与兴趣不同。不要把五个名称转成学习类型、职业推荐、内外向、智力或某种永久身份。",
        "en": "Look for a counterexample too: enjoying edges in a picture need not mean enjoying spreadsheet checks; inventing a scene need not mean preferring unstructured writing. Different materials, demands and interests explain why these can coexist. Do not convert the labels into learning types, career recommendations, extraversion, intelligence or a permanent identity."
      }
    ]
  },
  {
    "id": "inkblot-access-and-retest",
    "title": {
      "zh": "图像显示、无贴切选项与重测差异",
      "en": "Image display, absent choices and retest differences"
    },
    "paragraphs": [
      {
        "zh": "请确保当题图像完整显示；中性结构说明提供文字辅助，但不替代本项看图作答。图片加载失败时页面阻止继续计分，可以稍后重试或先读指南。若图像或选项不适合你，无须勉强完成；退出不会被解释为知觉、理解或心理问题，也不会生成个人结论。",
        "en": "Ensure the current image is fully displayed. Neutral structural text assists access but does not replace the visual task. Image-loading failure blocks continued scoring; you may retry later or read the guides. If the image or options do not work for you, leaving establishes no perceptual, comprehension or psychological problem and produces no personal conclusion."
      },
      {
        "zh": "屏幕大小、亮度、熟悉图像和措辞都可能影响你想沿哪种说法继续看。重测先核对改变了哪些题，不把计数变化解释为人格转变、恢复或退步。约5分钟只是阅读估计，页面不测第一眼、反应速度或眼动，静态图里的动势也是你的联想，不是图像真的运动。",
        "en": "Screen size, brightness, image familiarity and wording may influence which offered reading you pursue. On a retake, compare changed choices without treating count shifts as personality change, recovery or deterioration. About five minutes is a reading estimate: first glance, response speed and eye movements are not measured, and movement in a static blot is an association, not actual image motion."
      }
    ]
  }
];

export const inkblotLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "五种墨迹读法分别关注什么？",
      "en": "What do the five inkblot readings focus on?"
    },
    "answer": {
      "zh": "整体轮廓看大边界与布局，边缘细节追局部，动势联想想象静止形状的动作，色块对照比较区域，场景编想临时联系成一幕。它们是选项焦点，不是能力或临床编码。",
      "en": "Whole-form follows broad boundaries and layout; Edge-detail traces local features; Motion imagines action in static forms; Contrast compares regions; Scene connects forms into a temporary scene. These are option focuses, not abilities or clinical codes."
    }
  },
  {
    "question": {
      "zh": "3、3、2、1、1会得到什么结果？",
      "en": "What result follows counts of 3,3,2,1,1?"
    },
    "answer": {
      "zh": "按目录顺序，整体轮廓与边缘细节同为最高，两份完整报告都显示。合计10，每项最高8；3/8不是人格比例或人群百分位。",
      "en": "In the listed order, Whole-form and Edge-detail share the maximum and both complete reports appear. The total is ten, with a maximum of eight per focus; 3/8 is neither a personality proportion nor a percentile."
    }
  },
  {
    "question": {
      "zh": "可以一直选同一位置，或产生五个结果吗？",
      "en": "Can one repeated option position produce five results?"
    },
    "answer": {
      "zh": "可以。每方向在四个位置各出现2次，一直选同一位置会五项各2，保留全部最高并列，不随机只取一个。",
      "en": "Yes. Every focus appears twice in each position, so repeating one position gives two each and retains all five highest ties, without randomly selecting one."
    }
  },
  {
    "question": {
      "zh": "差一次就能确定我更擅长哪种读法吗？",
      "en": "Does one extra choice establish which reading I am better at?"
    },
    "answer": {
      "zh": "不能。计数只记录本次多选一次，没有显著差异、能力等级或固定主副型含义；近分可一起读，但不合并成新类型。",
      "en": "No. It records one additional choice, without a significant-difference claim, ability grade or fixed primary/secondary identity. Read close guides together if useful; no new hybrid type is created."
    }
  },
  {
    "question": {
      "zh": "动势联想意味着外向，场景编想意味着创造力吗？",
      "en": "Does Motion mean extraversion, or Scene mean creativity?"
    },
    "answer": {
      "zh": "不意味着。选择某种看法没有测试现实行为、作品质量或心理特质，也不能换算MBTI、大五人格、IQ、EQ或高敏感。",
      "en": "No. Choosing an offered reading does not test real-world behavior, creative work or traits and cannot be converted into MBTI, Big Five, IQ, EQ or high sensitivity."
    }
  },
  {
    "question": {
      "zh": "看到不常见的形状或什么都看不出来正常吗？",
      "en": "What if I see something unusual or no particular object?"
    },
    "answer": {
      "zh": "本页没有规定应看到什么。你可以选相对愿意继续的看法，也可以退出；不能用是否看到特定形状判断正常、异常或诊断。",
      "en": "No particular object is required. Choose a reading you would pursue or leave. Seeing or not seeing a particular form cannot establish normality, abnormality or a diagnosis here."
    }
  },
  {
    "question": {
      "zh": "图片打不开，可以只读文字继续吗？",
      "en": "Can I continue using only text if an image fails?"
    },
    "answer": {
      "zh": "不能把加载失败当作完成看图。页面会阻止继续计分，中性结构说明不替代图像；可重试或先读全部公开指南。",
      "en": "A failed image is not a completed visual task. Continued scoring is blocked, and neutral structural text does not replace the image. Retry or read all public guides first."
    }
  },
  {
    "question": {
      "zh": "线上罗夏测验一定不科学吗？",
      "en": "Is every online Rorschach assessment unscientific?"
    },
    "answer": {
      "zh": "不能只按线上线下判断。专业远程R-PAS有初步研究，但涉及具体程序、样本与局限，并非本页原创图加四选一的验证。[3]",
      "en": "Online versus in-person is insufficient to decide. Preliminary professional remote R-PAS research concerns particular procedures, samples and limitations, not validation of these original images and fixed choices.[3]"
    }
  },
  {
    "question": {
      "zh": "点击开始后要再次同意或付费吗？",
      "en": "Is another agreement or payment needed after Start?"
    },
    "answer": {
      "zh": "不需要。开始直接进入第一张图，完整10题、全部次数、最高并列和五份全文免费，无需邮箱或前置测评。保存只在主动选择后启用。",
      "en": "No. Start opens the first image directly. All ten items, counts, highest ties and five full guides are free, without email or a prerequisite test. Saving is enabled only if you choose it."
    }
  }
];
