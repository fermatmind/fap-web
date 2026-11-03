import type { Questionnaire } from "@/lib/questionnaires/types";

export const colorSeasonLandingSections: Questionnaire["guide"] = [
  {
    "id": "palette-task",
    "title": {
      "zh": "色彩季节测试是什么？16组三色菜单的可见偏好",
      "en": "What is this Color Analysis Quiz? Visible preferences across sixteen menus"
    },
    "paragraphs": [
      {
        "zh": "本页把春日、夏日、秋日和冬日作为四组原创示例配色的名称。16题各显示四个三色选项，选择此刻更愿意看的组合。它记录对给定色块的偏好，输入不含照片、肤色、发色或眼色，因此结果不承担个人肤色冷暖、面部对比度或专业季型的鉴定。",
        "en": "Spring, summer, autumn and winter name four original example palettes here. Each of sixteen items displays four three-colour options; choose the combination you would prefer to view now. This records preferences for supplied blocks. Without photographs, complexion, hair or eye inputs, it does not determine undertone, facial contrast or a professional personal-colour season."
      },
      {
        "zh": "四组各包含六种颜色，共24种。题目会从各组六色中选取不同三色组合，配合笔记本、书签和纸上草图等场景。结果显示四组原始选择次数及全部最高并列；四份九节完整指南在作答前后均可读，包含具体色号、配色例子和比较方法。无需购买、上传照片或继续其他测试。",
        "en": "Each palette contains six colours, twenty-four in total. Items select different triples from each group for notebook, bookmark and paper-sketch scenarios. Results show four raw selection counts and every highest tie. All four nine-section guides are readable before and after answering, with colour codes, examples and comparison methods. No purchase, photo upload or further assessment is needed."
      }
    ]
  },
  {
    "id": "palette-vocabulary",
    "title": {
      "zh": "把喜欢说具体：色相、明暗、鲜灰与面积",
      "en": "Describe what you like: hue, lightness, vividness and area"
    },
    "paragraphs": [
      {
        "zh": "可以先用日常语言描述：更偏蓝还是橙、更浅还是深、更鲜明还是灰柔，以及三色放在一起时的关系。不同色彩空间对明度、饱和度和色度有各自定义，不能把它们当成完全相同的数值，更不能仅凭英文名称推断精确测量。[2] 本版只统计选了哪个菜单，不分别输出这些维度的分数。",
        "en": "Start with ordinary descriptions: bluer or more orange, lighter or darker, more vivid or muted, and the relationship among the three. Colour spaces define lightness, saturation and chroma differently; these are not interchangeable numerical measures.[2] This bank counts menu selections without separately scoring those dimensions."
      },
      {
        "zh": "独立新例：同样是珊瑚、嫩叶绿和象牙白，三块面积相等，与象牙白占大半、珊瑚只作细边线，是两种布局。你可能喜欢后者，却不想把三色均匀铺满。先保持颜色不变，再只改面积，便能更具体地记录“喜欢怎样使用”，而不只记一个季节名称。",
        "en": "Fresh example: coral, leaf green and ivory in equal blocks form a different layout from mostly ivory with a thin coral border. You may prefer the latter without wanting three equal areas. Keep the colours and change only their proportions to describe how you would use them rather than recording only a seasonal label."
      }
    ]
  },
  {
    "id": "palette-four-groups",
    "title": {
      "zh": "四组配色怎样比较？以实际色号与组合为准",
      "en": "How do the four palettes compare? Use the actual examples"
    },
    "paragraphs": [
      {
        "zh": "春日组包含珊瑚、杏桃、奶油黄、嫩叶绿、浅湖绿和象牙白；夏日组包含灰玫瑰、粉雾蓝、柔薰衣草、灰鼠尾草、柔海军蓝和珍珠灰。它们帮助你观察这份菜单里的组合差别，不表示所有春日颜色都相同，也不把柔色偏好解释成温柔或内向。",
        "en": "Spring includes coral, peach, butter yellow, leaf green, light lagoon and ivory. Summer includes dusty rose, powder blue, soft lavender, greyed sage, soft navy and pearl grey. Compare these particular combinations rather than assuming all spring colours are alike or interpreting muted preferences as a gentle or introverted personality."
      },
      {
        "zh": "秋日组提供铁锈、橄榄、赭金、可可、陶土与暖奶油；冬日组提供墨海军蓝、莓果、冰雾蓝、深云杉绿、深李紫与粉笔白。可将两份指南的同面积样本并排，记录喜欢哪一块、哪种深浅关系。季节名称只是组织入口，并未建立专业品牌之间通用的色表或外观分类边界。",
        "en": "Autumn offers rust, olive, ochre, cocoa, clay and warm cream. Winter offers ink navy, berry, icy blue, deep spruce, deep plum and chalk white. Compare equal-area samples and note the particular colour or light–dark relationship you like. Seasonal names organize this inventory without establishing a universal professional chart or an appearance-classification boundary."
      }
    ]
  },
  {
    "id": "palette-digital",
    "title": {
      "zh": "色号意味着什么？数字定义不等于实物保证",
      "en": "What does a colour code mean? Digital definitions and physical samples"
    },
    "paragraphs": [
      {
        "zh": "本页六位十六进制色号采用网页中的sRGB表示，三对数字依次定义红、绿、蓝分量。[2] 例如原创示例珊瑚调#F08C78对应rgb(240,140,120)。这让你能核对用的是哪种数字颜色，但不是光谱测量、专业色布编号或某种布料的采购规格。",
        "en": "Six-digit hexadecimal codes specify sRGB components in red, green and blue order on the web.[2] The original coral example #F08C78 corresponds to rgb(240,140,120). A code identifies the digital value; it is not a spectral measurement, professional fabric code or purchasing specification."
      },
      {
        "zh": "屏幕设置、亮度与观看环境可能使实际体验不同；打印还涉及纸张、油墨和输出流程。想复看自己的偏好，可尽量保持同一设备、背景和面积，并记录是否开了改变色温的显示模式。即使两次使用相同色号，也不能据此保证衣物、纸张和屏幕看起来完全一致。",
        "en": "Display settings, brightness and surroundings may change the viewing experience; printing also involves paper, ink and the output process. For a personal comparison, keep the device, background and area similar and note any colour-temperature mode. Matching digital codes do not guarantee identical appearance across clothing, paper and screens."
      }
    ]
  },
  {
    "id": "palette-research",
    "title": {
      "zh": "颜色偏好研究能说明什么？与季型鉴定分开阅读",
      "en": "What can colour-preference research tell us? Separate it from season typing"
    },
    "paragraphs": [
      {
        "zh": "Palmer与Schloss（2010）以48位参与者对32种颜色的喜好评分，并结合其他参与组的物体联想和评价，检验颜色偏好与相关物体情感评价的关系。这个研究提示可考虑经验和联想，但它研究的是特定样本及任务，并未验证本页24色、16菜单或四季分类，也不能据此识别个人肤色季型。[1]",
        "en": "Palmer and Schloss (2010) studied ratings of 32 colours from 48 participants, alongside other groups’ object associations and evaluations, to examine preferences in relation to associated objects. Experience and associations are relevant considerations, but that study did not validate these twenty-four colours, sixteen menus or seasonal groups, or establish personal complexion typing.[1]"
      },
      {
        "zh": "复盘时可以问：喜欢的是某个色块、三色关系，还是“书签、封面”唤起的用途想象？这些是帮助理解回答的问题，不是网站已经测出的原因。原始次数只记录选择，不能分离每一种单色的贡献，也不能从一个偏好推断健康、人格、年龄或审美高低。",
        "en": "When reviewing, ask whether you liked one block, the relationship among three or the imagined use as a bookmark or cover. These are questions for reflection, not causes measured by the site. Counts record choices without isolating each colour’s contribution or inferring health, personality, age or aesthetic rank."
      }
    ]
  },
  {
    "id": "palette-balanced-menus",
    "title": {
      "zh": "计数与并列：相同机会不等于独立维度",
      "en": "Counts and ties: equal exposure does not establish independent dimensions"
    },
    "paragraphs": [
      {
        "zh": "四组在每题都出现，因此各有16次机会；每组在四个选项位置各出现四次，每组的六种示例色各在八个菜单中出现。轮换位置和相同色块面积是呈现安排，可以核对，但不自动消除名称联想、场景、阅读顺序或显示条件的影响，更不证明信度、效度或四组心理独立。",
        "en": "Every palette appears in every item, giving sixteen opportunities each and four appearances in each option position. Each of its six colours appears in eight menus. Rotation and equal block areas are checkable presentation conventions, without eliminating names, context, reading order or display effects, or establishing reliability, validity or psychological independence."
      },
      {
        "zh": "每题一选加1次，四组次数总和为16。独立算例：春6、夏6、秋3、冬1，完整保留春夏最高并列；四组各4时保留四份36节，不选一个“最接近”的结果。7、5、3、1只保留最高的7，不自动把相差2次合并；但你仍可自愿阅读其他全部指南。次数不转换成肤色匹配概率或人群百分位。",
        "en": "Each selection adds one and the four counts sum to sixteen. Fresh examples: 6,6,3,1 retains spring and summer as joint highest; 4,4,4,4 retains all thirty-six sections. Counts of 7,5,3,1 retain only the highest seven without merging a two-count gap, while every other guide remains freely readable. Counts are not complexion-match probabilities or population percentiles."
      }
    ]
  },
  {
    "id": "palette-accessible",
    "title": {
      "zh": "色觉与可读性：名称帮助定位，不替代视觉体验",
      "en": "Colour perception and readability: labels locate, but do not replace seeing"
    },
    "paragraphs": [
      {
        "zh": "每个选项同时提供色块与名称，指南还列色号。W3C的用色说明强调，不应只靠颜色传达功能或信息。[3] 因此作品中的错误、类别和行动可再加文字或形状；喜欢一组三色，不等于它们任意两色叠作文字与背景都清楚。可读性需要另外核对，不能仅因属于同一组就假定合格。",
        "en": "Options provide blocks and names, and guides add codes. W3C explains that colour alone should not convey functional information.[3] Use text or shapes for errors, categories and actions. Liking a triple does not establish that any two colours make a readable text–background pair; check readability separately."
      },
      {
        "zh": "若看不清色块、设备只显示灰阶，或四组选项都不愿选择，可以停止。名称能帮助知道指南谈的是哪一色，却不能代替“自己更想看哪组”的视觉判断；本版也不是色觉筛查工具。无需勉强完成才解锁内容，四份完整指南仍在页面开放。",
        "en": "Stop if blocks are indistinguishable, the device is monochrome or no option appeals. Names identify the discussed examples but cannot supply your visual preference. This is not a colour-vision screening tool. You do not need to force completion to unlock content; all four guides stay open."
      }
    ]
  },
  {
    "id": "palette-small-experiment",
    "title": {
      "zh": "把结果用于一张小草稿：记录关系，允许改变",
      "en": "Use the result in one small draft: record relationships and allow change"
    },
    "paragraphs": [
      {
        "zh": "选一份指南里的三个色号，先放三块等面积样本，再画一张小便签；只改变一块的面积，或只替换一色。写一句具体观察，例如“喜欢深色细线与浅底的关系”。不需要为结果购买衣服、改变外表或请别人评判；也可以看完指南就结束。",
        "en": "Choose three codes from a guide, start with equal blocks and make a small note design. Change one area or replace one colour. Record a concrete observation such as preferring a dark thin line on a light ground. No purchase, appearance change or external judgment is required; reading the guides can be the entire next step."
      },
      {
        "zh": "如果重测结果改变，先核对设备、环境、场景理解与是否记得上次选项。本版尚无重测信度、测量误差或跨语言等值研究，不能把次数变化解释为肤色、人格或人生阶段改变。中英文保留同一颜色与计数规则；语言名称带来的联想仍可能不同。",
        "en": "If a retake changes, consider the device, surroundings, interpreted context and memory of previous options. Without retest reliability, measurement-error or cross-language equivalence research, a changed count does not establish a change in complexion, personality or life stage. English and Chinese preserve colours and counting rules, while names may evoke different associations."
      }
    ]
  }
];

export const colorSeasonLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "喜欢的颜色就是最适合我穿的颜色吗？",
      "en": "Are preferred colours necessarily the best colours to wear?"
    },
    "answer": {
      "zh": "两者是不同问题。本版选择发生在三色色块菜单上，没有观察衣物贴近面部时的效果。可以记录喜欢的配色关系，但不能用次数证明某种颜色衬肤或决定穿衣禁区。",
      "en": "They are different questions. This bank compares triple-colour blocks without observing clothes near your face. Record a palette relationship you like without treating counts as proof of flattering effects or colours you must avoid."
    }
  },
  {
    "question": {
      "zh": "这里会判断12季或16季子类型吗？",
      "en": "Does this quiz assign twelve- or sixteen-season subtypes?"
    },
    "answer": {
      "zh": "不会。四个名称对应本站四组六色示例，只输出原始次数和最高并列，不生成子季型、主副季节或冷暖肤色分数。其他系统的名称和方法不能直接套入本题结果。",
      "en": "No. Four names identify four six-colour example groups, with raw counts and highest ties. There are no sub-seasons, primary/secondary assignments or undertone scores; another system’s categories cannot be imported into this result."
    }
  },
  {
    "question": {
      "zh": "为什么选择位置一直不变会四组并列？",
      "en": "Why does choosing the same option position produce a four-way tie?"
    },
    "answer": {
      "zh": "因为每一组在A、B、C、D各出现四次。一直选A会四组各4，总计16；这反映位置轮换，而非外观恰好均衡或四季各占25%。",
      "en": "Each group appears four times in positions A, B, C and D. All-A gives four counts per group and sixteen overall. That follows the rotation, rather than establishing balanced appearance or a 25% personal share of each season."
    }
  },
  {
    "question": {
      "zh": "春6、夏6、秋3、冬1会选哪份结果？",
      "en": "Which result appears for spring six, summer six, autumn three and winter one?"
    },
    "answer": {
      "zh": "春夏都为最高，完整保留两份九节指南，共18节。其他两份指南仍可公开阅读，不随机抽一个，也不用字母或先后顺序破同分。",
      "en": "Spring and summer are joint highest, retaining both nine-section guides, eighteen sections in all. The other guides remain public. No random choice, alphabetic rule or item order breaks the tie."
    }
  },
  {
    "question": {
      "zh": "色号相同，为什么手机和纸上看起来不同？",
      "en": "Why can a code look different on a phone and on paper?"
    },
    "answer": {
      "zh": "色号定义数字颜色，不保证设备设置、观看光线、纸张或油墨一致。可保持相同设备与背景作个人对照；不能把屏幕样本当作实物色布的精确替代。[2]",
      "en": "A code defines a digital colour without guaranteeing identical display settings, lighting, paper or ink. Keep a device and background consistent for personal comparisons rather than treating a screen sample as an exact fabric substitute.[2]"
    }
  },
  {
    "question": {
      "zh": "看不清细微色差，还需要猜答吗？",
      "en": "Should I guess if subtle colour differences are hard to see?"
    },
    "answer": {
      "zh": "不需要。可以停止，仍免费阅读四份完整指南。文字名称和色号帮助定位示例，不能替你形成视觉偏好；本测试也不据此诊断色觉或视力。[3]",
      "en": "No. Stop and still read all four guides for free. Names and codes identify examples without supplying a visual preference. The quiz does not diagnose colour vision or eyesight.[3]"
    }
  },
  {
    "question": {
      "zh": "引用颜色研究，是否表示四季分类已科学验证？",
      "en": "Do colour-research references validate these seasonal categories?"
    },
    "answer": {
      "zh": "不表示。研究讨论颜色偏好，标准说明数字表示和信息可访问性；它们未验证本版题目、分组、计数解释或个人季型。题本结构核对与心理测量验证是不同证据。[1][2][3]",
      "en": "No. Research addresses preference, while standards explain digital representation and accessible information. They do not validate these items, groups, count interpretations or personal seasons. Structural checks and psychometric validation are separate evidence.[1][2][3]"
    }
  },
  {
    "question": {
      "zh": "中英文结果、重测和专业咨询可以互相确认吗？",
      "en": "Can language versions, retakes and professional consultations confirm one another?"
    },
    "answer": {
      "zh": "不能直接互相验证。中英文同色同规则，但未建立测量等值；重测也受情境与记忆影响。专业咨询采用不同输入和方法，本页结果不用于确认或推翻其结论。",
      "en": "Not directly. The languages preserve colours and rules without established equivalence, and retakes may reflect context and memory. Consultations use different inputs and methods; this result neither confirms nor overturns their conclusions."
    }
  }
];

export const colorSeasonLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "zh": "Palmer与Schloss（2010）：颜色偏好生态效价研究",
      "en": "Palmer & Schloss (2010): An ecological valence theory of human color preference"
    },
    "url": "https://pmc.ncbi.nlm.nih.gov/articles/PMC2889342/"
  },
  {
    "title": {
      "zh": "W3C：CSS Color 4，sRGB与十六进制色号",
      "en": "W3C: CSS Color 4, sRGB and hexadecimal notation"
    },
    "url": "https://www.w3.org/TR/css-color-4/#hex-notation"
  },
  {
    "title": {
      "zh": "W3C：理解WCAG 2.2的用色要求",
      "en": "W3C: Understanding WCAG 2.2 Use of Color"
    },
    "url": "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html"
  }
];
