import type { Copy, FunFaq } from "@/lib/entertainment/types";
export const beachcomberSections: {id:string;title:Copy;paragraphs:Copy[]}[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Beachcomber quiz: three ways to look at one shore",
      "zh": "海边拾趣测试：从三种角度看同一片海岸"
    },
    "paragraphs": [
      {
        "en": "Six imagined shoreline scenes ask what you would notice, sketch or wonder about. Every question offers a pattern-led, story-led and place-led choice. The result follows the choices you actually make, rather than selecting a portrait randomly.",
        "zh": "六个想象海岸场景，询问你会留意、速写或好奇什么。每题都有图案、故事与场景关系三类选择。结果来自实际选择，不随机抽取画像。"
      },
      {
        "en": "No beach visit, photograph, collection or drawing submission is needed. The prompts describe illustrations; this is a text-choice game, not a visual discrimination test. Choose an appealing next step, without trying to demonstrate knowledge or earn a better category.",
        "zh": "无需到海边、上传照片、采集物件或提交绘画。题目描述插画情境；这是文字选择游戏，不是视觉辨别测试。选更有吸引力的下一步即可，不必证明知识或争取更好的类别。"
      }
    ]
  },
  {
    "id": "pattern",
    "title": {
      "en": "Pattern finder: repeat, compare and vary",
      "zh": "图案发现者：重复、比较与变化"
    },
    "paragraphs": [
      {
        "en": "This route draws attention to curves, stripes, spacing, textures and the relationship between a repeated shape and an exception. A useful distinction is between describing what is visibly repeated and explaining why the repetition arose. The game asks about the first interest, not whether an explanation is scientifically correct.",
        "zh": "这个方向关注曲线、条纹、间距、纹理，以及重复形状与例外的关系。可区分“描述看得见的重复”和“解释重复为什么出现”。游戏询问先被什么吸引，不评解释是否科学正确。"
      },
      {
        "en": "For example, a drawn pebble’s pale stripe can become a border motif on paper. You may also notice its imagined journey or position. More pattern choices do not demonstrate superior attention, mathematical reasoning, visual memory or design skill; none of those performances is tested.",
        "zh": "例如，画中石子的浅纹可以变成纸上边框图案，也可以同时引起对旅程或位置的兴趣。图案选择较多，不证明注意力、数学推理、视觉记忆或设计技能更强；这里没有测试这些表现。"
      }
    ]
  },
  {
    "id": "story",
    "title": {
      "en": "Postcard writer: invent a past without calling it evidence",
      "zh": "明信片作者：想象过去，同时标清虚构"
    },
    "paragraphs": [
      {
        "en": "The story route turns a small detail into a before, a journey or an after. Its pebble postcard is deliberately invented. A plausible-sounding tale cannot establish the age, origin, maker or previous owner of an actual object.",
        "zh": "故事方向把小细节接成“之前”、旅程或“之后”，石子明信片明确属于虚构。听起来合理的故事，不能确定真实物件的年代、来源、制作者或原主人。"
      },
      {
        "en": "You might write three sentences from the viewpoint of an ordinary button already at home, then label the text fiction. Choosing this route is an invitation to narrate, not evidence of empathy, historical expertise, personality type or creative achievement.",
        "zh": "可以从家中已有普通纽扣的视角写三句话，再标为虚构。选择这个方向是在回应叙事邀请，不证明共情、历史专业知识、人格类型或创作成就。"
      }
    ]
  },
  {
    "id": "place",
    "title": {
      "en": "Scene observer: retain the surroundings as well as the detail",
      "zh": "观景者：细节与周围关系一起保留"
    },
    "paragraphs": [
      {
        "en": "Place-led choices keep an object within the larger arrangement: nearby stones, the tide line, a wide view and changes between scenes. The focus is on what a crop leaves out. A close-up and a context sketch can complement each other without either being the correct way to look.",
        "zh": "场景方向把物件留在较大排列中：附近石头、潮线、全景与两幅场景间的变化。重点在于裁切遗漏了什么。特写与情境速写可以互补，没有哪一种才是正确观看方式。"
      },
      {
        "en": "For example, first frame the whole arrangement, then add a small inset for one stripe. The portrait does not certify environmental virtue, patience, ecological knowledge or better behaviour outdoors. All three routes in this game can leave real objects undisturbed.",
        "zh": "例如，先画整体排列，再用小特写补充一条纹路。画像不认证环保品德、耐心、生态知识或户外行为更好。本游戏的三个方向都可以不扰动真实物件。"
      }
    ]
  },
  {
    "id": "scoring",
    "title": {
      "en": "Six choices, six points and all highest ties",
      "zh": "六次选择、六个计数与所有最高并列"
    },
    "paragraphs": [
      {
        "en": "Each selected option contributes one point to exactly one portrait. Each portrait appears once in every question, so each count runs from zero to six and the three counts sum to six. All six questions must be answered before a personal result appears. Counts are choices inside this game, not percentages or population scores.",
        "zh": "每个所选选项只给一种画像加1次。三种画像每题各出现一次，因此每项0至6次，三项合计6次。六题全部完成后才显示个人结果。次数是游戏内部选择，不是百分比或人群分数。"
      },
      {
        "en": "The largest count leads; all equally highest portraits appear. For example, 3–3–0 displays two tied portraits and 2–2–2 displays all three. The declared pattern, story, place order only arranges tied text; it does not break the tie or make the first card more important.",
        "zh": "次数最高者显示为结果；最高次数相同则全部呈现。例如3—3—0显示两项并列，2—2—2显示三项。预设的图案、故事、场景顺序只安排文字展示，不破同分，也不使第一张更重要。"
      }
    ]
  },
  {
    "id": "comparison",
    "title": {
      "en": "A tie is an invitation to compare, not a hybrid diagnosis",
      "zh": "并列用于比较，不是混合型诊断"
    },
    "paragraphs": [
      {
        "en": "Compare what the portraits invite you to do with the same detail. A pattern-and-story tie might suggest drawing its stripe and adding an explicitly fictional caption. A story-and-place tie might keep the wide view while imagining a short journey. These are optional combinations, not extra scored types.",
        "zh": "比较几种画像邀请你如何处理同一个细节。图案与故事并列时，可以画纹路并加明确虚构的说明；故事与场景并列时，可以保留全景，同时想象小旅程。这些是可选组合，不新增计分类型。"
      },
      {
        "en": "A lower count does not mean you cannot use that angle. Six forced choices cannot represent every interest or establish a stable trait. Reading all three public guides is useful even when just one appears at the top of an attempt.",
        "zh": "次数较低不表示不能使用那个角度。六次选择不能代表全部兴趣，也不能建立稳定特质。即使某次只有一项最高，也可以阅读全部三篇公开指南。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "What is authored, and what has not been measured",
      "zh": "哪些是原创设计，哪些没有被测量"
    },
    "paragraphs": [
      {
        "en": "The questions, three portrait names and counting rules are an original entertainment design. Reproducible counting shows that the same answers yield the same result; it does not establish reliability, validity, norms or predictive value. No such psychometric evidence is provided for this game.",
        "zh": "题目、三种画像名称与计数规则属于原创娱乐设计。同样答案得到同样结果，说明计数可以复现，不等于建立信度、效度、常模或预测价值。本游戏没有提供这些心理测量证据。"
      },
      {
        "en": "Nature-education resources can explain a shoreline, and an art activity can offer a practice prompt, but neither validates these portraits as psychological categories. The page therefore keeps observation, invention and measurement claims distinct. It does not convert this result into MBTI, EQ, career suitability or a clinical conclusion.",
        "zh": "自然教育资料可以解释海岸，艺术活动可以提供练习提示，但都不验证这些画像是心理类别。因此页面区分观察、创作与测量主张，不把结果换算为MBTI、EQ、职业适配或临床结论。"
      }
    ]
  },
  {
    "id": "objects",
    "title": {
      "en": "Real beachcombing and this fictional scene have different tasks",
      "zh": "真实海岸观察与虚构场景各有任务"
    },
    "paragraphs": [
      {
        "en": "The fictional scene requires no handling or removal of shells, stones or wildlife. If you later explore an actual coast, use its current local access and collection guidance rather than the game’s imagined choices. Different protected places can have different rules. [1]",
        "zh": "虚构场景无需触碰或移走贝壳、石头或野生动物。之后若去真实海岸，应查当地现行通行与采集说明，不根据游戏选择行动。不同保护地的规则可能不同。[1]"
      },
      {
        "en": "A photograph, sketch or written description can retain an observation without turning it into a collected souvenir. Leave No Trace Ireland’s coastal resource discusses keeping natural objects in place and using pictures, drawings and memories instead. That is outdoor background, not evidence about a visitor’s personality. [2]",
        "zh": "照片、速写或文字可以保留观察，不必把物件变成带走的纪念。爱尔兰无痕户外的海岸资料讨论把自然物留在原处，以照片、绘画与记忆纪念。这是户外背景，不是访客人格证据。[2]"
      }
    ]
  },
  {
    "id": "practice",
    "title": {
      "en": "Try all three angles with an object already around you",
      "zh": "用身边已有物件尝试三个角度"
    },
    "paragraphs": [
      {
        "en": "Choose something ordinary that you already have permission to use. Spend a moment recording one repeated feature, write one fictional sentence, then describe how it sits among its surroundings. No skill rating, time target or purchase is required.",
        "zh": "选择身边已有且获准使用的普通物件。记下一个重复特征，写一句虚构短文，再描述它与周围的关系。无需技能评分、限时目标或购买物品。"
      },
      {
        "en": "If one angle feels uninteresting, set it aside. These small prompts illustrate the portraits; they are not an intervention with a promised effect on attention, creativity or wellbeing. You may also finish after reading, without completing another test.",
        "zh": "某个角度没兴趣时可以放下。小提示用于说明画像，不是承诺提升注意力、创造力或身心状态的干预。阅读后也可以结束，无需完成另一测试。"
      }
    ]
  },
  {
    "id": "privacy",
    "title": {
      "en": "Answer, save and share with clear boundaries",
      "zh": "作答、保存与分享各自有范围"
    },
    "paragraphs": [
      {
        "en": "Start opens the first question directly. Answers are calculated in the browser. Saving is optional in this tab, expires after twenty-four hours, and clears when you finish, retake or exit and clear. A changed quiz version invalidates an old draft; unavailable browser storage does not prevent an attempt.",
        "zh": "点击开始直接进入第一题，答案在浏览器计算。可自愿在本标签页保存，二十四小时后失效，完成、重测或退出清除会删除。题目版本变化使旧草稿失效；浏览器无法存储时仍可作答。"
      },
      {
        "en": "The copy action includes the quiz title, leading portrait names and their public guide links. It does not include the six answers or counts. A public guide describes the authored portrait; opening it cannot reveal another visitor’s private attempt. General activity recording, when enabled, is separate from storing answers.",
        "zh": "复制功能包含测试标题、最高画像名称及其公开指南链接，不包含六条答案或次数。公开指南说明原创画像，打开它不会显示其他访客的私人作答。启用时的一般使用记录与保存答案是不同事项。"
      }
    ]
  }
];
export const beachcomberFaq: FunFaq[] = [
  {
    "question": {
      "en": "Do I need to know shells or visit a beach?",
      "zh": "需要认识贝壳或去过海边吗？"
    },
    "answer": {
      "en": "No. All six questions describe imagined shoreline scenes. Choose how you would look or create. No identification knowledge, actual beach visit, image upload or field observation is required.",
      "zh": "不需要。六题都是想象海岸场景，选择想怎样观看或创作即可。无需物种鉴定知识、真实到访、上传图片或野外观察。"
    }
  },
  {
    "question": {
      "en": "Is this a personality or attention test?",
      "zh": "这是人格或注意力测试吗？"
    },
    "answer": {
      "en": "It is an original entertainment quiz about three authored viewing angles. It does not use a validated personality scale or test how accurately or quickly you detect visual features.",
      "zh": "这是围绕三种原创观看角度的娱乐测试，没有采用经验证的人格量表，也不测发现视觉特征的准确率或速度。"
    }
  },
  {
    "question": {
      "en": "How long is the beachcomber quiz, and is it free?",
      "zh": "海边拾趣测试多久，是否免费？"
    },
    "answer": {
      "en": "There are six three-option choices, about two minutes without a time limit. All questions, result paragraphs and three complete public guides are free, with no registration or prerequisite test.",
      "zh": "共六道三选一，约两分钟，不限时。全部题目、结果段落与三篇完整公开指南免费，无需注册或先做其他测试。"
    }
  },
  {
    "question": {
      "en": "What happens when two or three portraits tie?",
      "zh": "两种或三种画像同分怎么办？"
    },
    "answer": {
      "en": "All highest ties are displayed in the authored order: pattern, story, place. No letter, question position or random choice removes a tie. A 2–2–2 result retains all three.",
      "zh": "最高同分全部呈现，按图案、故事、场景的预设顺序展示，不按字母、题目位置或随机方式淘汰并列。2—2—2保留三种画像。"
    }
  },
  {
    "question": {
      "en": "Can a low count mean I lack creativity or awareness?",
      "zh": "次数低是否表示缺乏创意或观察意识？"
    },
    "answer": {
      "en": "No. Six relative choices say which offered angle you selected more often. They do not assess abilities, worth or interests outside these scenes. You may enjoy a lower-count guide too.",
      "zh": "不是。六次相对选择只说明更常选哪个给定角度，不评能力、价值或场景以外的兴趣。次数低的指南也可能有趣。"
    }
  },
  {
    "question": {
      "en": "Can the story portrait identify an object’s real past?",
      "zh": "故事画像能鉴定物件的真实过去吗？"
    },
    "answer": {
      "en": "No. The postcard and journey are explicitly fictional prompts. A narrative that sounds convincing is not evidence of origin, age, ownership or historical events.",
      "zh": "不能。明信片与旅程明确属于虚构提示。听起来可信的叙述，不是来源、年代、所有权或历史事件的证据。"
    }
  },
  {
    "question": {
      "en": "Is leaving things in place the correct answer?",
      "zh": "把东西留在原处是不是正确答案？"
    },
    "answer": {
      "en": "There is no right answer in the game. Pattern sketches and invented stories can also leave objects untouched. Counts do not compare ecological virtue, and local outdoor guidance remains separate.",
      "zh": "游戏没有标准答案。图案速写与虚构故事也可以不触碰物件。次数不比较生态品德，当地户外指引另行适用。"
    }
  },
  {
    "question": {
      "en": "Will the same answers give the same portrait?",
      "zh": "相同回答会得到相同画像吗？"
    },
    "answer": {
      "en": "Yes. Each answer contributes its declared point. Identical complete answers yield identical totals and highest ties. This deterministic rule does not establish a stable personality across occasions.",
      "zh": "会。每条回答按明确规则加分，完整答案相同，次数与最高并列就相同。确定性规则不证明跨情境人格稳定。"
    }
  },
  {
    "question": {
      "en": "Can I change an earlier choice or retake?",
      "zh": "能修改前面的选择或重测吗？"
    },
    "answer": {
      "en": "Use Back during the attempt to revise a choice; this six-question quiz uses additive counts. Retake starts a new attempt and clears the previous completed answers. A different result can simply follow different preferences in those choices.",
      "zh": "作答中可用上一题修改；这份六题问卷采用累计计数。重新测试会新开一次作答并清除上次完成的答案。不同结果可能只是这几次选择的偏好不同。"
    }
  },
  {
    "question": {
      "en": "What does copying the result share?",
      "zh": "复制结果会分享什么？"
    },
    "answer": {
      "en": "The copied text names the leading portrait or tied portraits and includes public guide and quiz links. It excludes the six individual answers and counts. The destination is public editorial text, not a private score page.",
      "zh": "复制文字包含最高画像或并列画像名称，以及公开指南和测试链接，不包含六条具体回答与次数。链接目标是公开编辑正文，不是私人成绩页。"
    }
  },
  {
    "question": {
      "en": "Must I save progress or agree before starting?",
      "zh": "开始前必须保存进度或勾选同意吗？"
    },
    "answer": {
      "en": "No. Start takes you straight to question one. Optional tab-session saving appears during the attempt; leaving it unchecked does not block any question or complete result.",
      "zh": "不用。开始按钮直接进入第一题。作答中可自愿选择标签页保存；不勾选不会阻止题目或完整结果。"
    }
  }
];
