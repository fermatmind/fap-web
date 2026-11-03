import type { Questionnaire } from "@/lib/questionnaires/types";

export const zodiacStoryLandingSections: Questionnaire["guide"] = [
  {
    "id": "star-story-symbols",
    "title": {
      "zh": "星座测试探索什么？十二个名字，十二种故事视角",
      "en": "What does this Zodiac Sign Quiz explore? Twelve names, twelve story lenses"
    },
    "paragraphs": [
      {
        "zh": "本页将白羊至双鱼的十二个星座名字，用于十二种费马原创叙事视角。你会遇到空白故事本、明信片、玩具剧场和虚构展览等情境，选择此刻更想采用的表达方式。它记录对题定故事动作的选择，不要求你写作品，也不根据生日推断性格。",
        "en": "This page uses the twelve sign names, Aries through Pisces, for twelve original FermatMind narrative lenses. Blank storybooks, postcards, toy theatres and imaginary exhibitions invite you to choose an expressive move you would like to try now. The quiz records selections among offered story actions. You need not submit a piece of writing, and no personality is inferred from a birthday."
      },
      {
        "zh": "“星座”也可以指天文学中的星空区域与星群图案。NASA Space Place区分以证据研究天体的天文学，与通过天体解释人格或未来的占星主张。[1] 本页借名字组织故事游戏，既不识别夜空星图，也不计算太阳、月亮、上升或出生星盘。",
        "en": "The word constellation also refers to regions and patterns in the sky. NASA Space Place distinguishes evidence-based astronomy from astrological claims about personality or the future.[1] Here, the names organize a story activity. The quiz neither identifies a night-sky chart nor calculates Sun, Moon, rising-sign or natal-chart placements."
      }
    ]
  },
  {
    "id": "star-openings-material",
    "title": {
      "zh": "开场、质感、对话与记忆：先让什么进入故事？",
      "en": "Openings, texture, dialogue and memory: what enters the story first?"
    },
    "paragraphs": [
      {
        "zh": "白羊·第一点火花先给场景一个可发生的小动作；金牛·质感收藏者先让物件的颜色、触感或使用痕迹具体可见。比如一本虚构手账，可以从“角色翻开第一页”开始，也可以从纸边的毛糙开始。动作与质感都能引入读者，区别在当前写法的焦点，不在勇气、勤奋或审美能力。",
        "en": "Aries, the First Spark, gives a scene a small action; Taurus, the Texture Keeper, makes an object’s colour, texture or traces of use visible. An invented notebook can begin with a character opening its first page or with its rough paper edges. Both can invite a reader in. The difference is the draft’s focus, not courage, diligence or aesthetic ability."
      },
      {
        "zh": "双子·对话编织者让不同声音相遇；巨蟹·记忆收纳者让早先的细节在后来再次出现。新例：两位虚构角色对一张旧车票作不同描述，属于对话入口；末段重新出现那张票、意义已有变化，属于回返入口。对话需要推动理解，物件回返需要与现在相连；这两种取舍不测社交能力、真实记忆或依恋模式。",
        "en": "Gemini, the Conversation Weaver, brings different voices together; Cancer, the Memory Holder, lets an earlier detail return. Two invented characters describing an old ticket differently create a dialogue entry. Bringing that ticket back with a changed meaning creates a recurring-detail entry. An exchange needs to change understanding; recurrence needs a connection to the present scene. Neither measures sociability, actual memory or attachment."
      }
    ]
  },
  {
    "id": "star-focus-arrangement",
    "title": {
      "zh": "焦点、细节、安排与层次：怎样改变读者看到的内容？",
      "en": "Focus, detail, arrangement and layers: changing what a reader sees"
    },
    "paragraphs": [
      {
        "zh": "狮子·场景照明者把一个时刻放到画面中心；处女·细节编辑者核对让场景成立的具体标记。虚构小钟重新走动，可以占据完整一格，也可以先交代钟面缺失的一笔。前者可能让旁枝变淡，后者可能打断节奏；不是自信与谨慎的高低，也不根据选择判断完美主义。",
        "en": "Leo, the Scene Illuminator, gives a moment the centre of the page; Virgo, the Detail Editor, checks a concrete mark that makes the scene understandable. An imaginary clock starting again might receive a whole panel or first need its missing dial mark explained. A focal moment can obscure a side detail; a clarification can interrupt the rhythm. These are compositional costs, not rankings of confidence or diagnoses of perfectionism."
      },
      {
        "zh": "天秤·平衡安排者比较两部分怎样相邻，天蝎·层次阅读者留意细节在后文怎样获得另一读法。把两幅桥的画并排展示，与稍后解释其中一幅缺少的人影，是两种叙事选择。安排不要求现实争议双方同样正确，层次也不意味着能识破他人秘密；讨论时应指向稿中的可见细节。",
        "en": "Libra, the Balance Arranger, compares how two parts sit together; Scorpio, the Layer Reader, follows a detail whose meaning changes later. Displaying two bridge pictures side by side differs from later explaining a missing figure in one of them. Arrangement does not make opposing real-world claims equally valid. Layering confers no access to another person’s secrets. Discuss visible details in the draft."
      }
    ]
  },
  {
    "id": "star-horizons-rules",
    "title": {
      "zh": "远景、步骤、规则与意象：给故事什么样的下一步？",
      "en": "Horizons, steps, rules and images: what comes next?"
    },
    "paragraphs": [
      {
        "zh": "射手·远景探寻者问画面以外还有什么，摩羯·阶梯规划者问当前场景怎样接到下一步。新例：想象纸上小城，可以画出边界外一间未命名的屋子，也可以补上角色从门口到展台的过渡。拓宽会增加未知，步骤会限制分支；两者可以互相修改，不代表实际旅行意愿或项目执行能力。",
        "en": "Sagittarius, the Horizon Seeker, asks what lies outside the frame; Capricorn, the Step Planner, asks how this scene reaches its next step. For a paper town, you could add an unnamed house beyond its boundary or fill the transition from an entrance to a display. Expansion adds unknowns; sequencing narrows branches. Each can revise the other without measuring travel preferences or project execution."
      },
      {
        "zh": "水瓶·框架改写者改变虚构世界的一项规则，双鱼·意象造梦者给场景加入开放的画面或比喻。按故事天气排书的图书馆，是规则入口；沙漠楼房里一扇画着海的窗，是意象入口。新规则需要说明后果，意象需要足够具体的共同细节。选择哪一种都不评定创新、共情或想象能力。",
        "en": "Aquarius, the Pattern Reframer, changes one rule of an invented world; Pisces, the Image Dreamer, adds an open image or metaphor. Sorting library books by the weather inside their stories is a rule-based entry. A painted sea window in a desert building is an image-based entry. A rule needs consequences explained; an image needs shared concrete detail. Neither choice rates innovation, empathy or imagination."
      }
    ]
  },
  {
    "id": "star-count-worked",
    "title": {
      "zh": "12题怎样计分？0至4次、出现位置与全部最高并列",
      "en": "How are twelve questions scored? Zero to four counts and every highest tie"
    },
    "paragraphs": [
      {
        "zh": "每题四选一，所选镜头加1次；十二项合计12次。每个镜头出现4次，并在A、B、C、D各出现一次，因此单项范围为0至4。出现次数相同是可复核的题目安排，不证明选项同样吸引人或中英文测量等值。各对镜头共同出现的次数也并非全部相同，不能由曝光安排推出所有结果等概率。",
        "en": "Each item offers four options and adds one count to the selected lens. All twelve counts sum to twelve. Each lens appears four times, once in each A–D position, so its range is zero to four. Equal exposure is a checkable arrangement, not evidence that options are equally attractive or languages equivalent. Lens pairs do not all co-occur equally often; exposure alone does not establish equal result probabilities."
      },
      {
        "zh": "可复算示例：十二题都选A，每个镜头各1次，十二项全部并列。仅将第1题改成B，白羊变0、金牛变2，其余仍为1，最高项变为金牛。小改动能改变最高项，说明计数对当前选择的反应，不说明人格变化。只保留实际相同的最高项；相差1次不会被自动合并，也不按字母顺序强选赢家。",
        "en": "Worked example: choosing A throughout gives each lens one count, a twelve-way tie. Change only item one to B: Aries becomes zero, Taurus two and the rest remain one. Taurus is now highest. That change describes the counting response to one choice, not a personality change. Only equally highest counts tie. A one-count difference is not merged, and alphabetical order does not select a winner."
      }
    ]
  },
  {
    "id": "star-full-portraits",
    "title": {
      "zh": "怎样阅读十二篇完整结果？从具体动作走向比较",
      "en": "How should you read the twelve full guides? Compare concrete moves"
    },
    "paragraphs": [
      {
        "zh": "先看全部原始计数，再阅读每个最高镜头的七节全文：镜头含义、虚构例子、表达取舍、另一镜头的补充、可选小练习、计数读法与文化边界。十二篇共84节指南全部免费，非匹配项也可阅读。公开指南提供固定内容，打开它不会生成你的私人分数。",
        "en": "Start with all raw counts, then read the seven sections for each highest lens: its meaning, an invented example, expressive trade-offs, another lens’s contribution, an optional prompt, count interpretation and symbolic scope. All eighty-four sections across twelve guides are free, including nonmatching ones. A public guide contains fixed text; opening it generates no private score."
      },
      {
        "zh": "例如双子与天蝎同时最高，可比较“让两位角色说出不同理解”与“让一个细节在末段获得新含义”。你可以写两版，也可以只读例子；本页不要求投稿。低项只表示在四次题定机会里较少选中，不代表某种表达能力缺失。结果无需与生日星座相符，更不需要另找月亮或上升来解释差异。",
        "en": "If Gemini and Scorpio tie highest, compare letting two characters voice different readings with giving a detail a new meaning at the end. Try two versions or simply read the examples; no submission is required. A low count means fewer selections among four offered appearances, not missing expressive ability. Results need not match a birth sign or be explained through a Moon or rising sign."
      }
    ]
  },
  {
    "id": "star-evidence-scope",
    "title": {
      "zh": "文化命名、可复算规则与科学验证分别说明什么？",
      "en": "What do cultural names, reproducible rules and scientific evidence establish?"
    },
    "paragraphs": [
      {
        "zh": "NASA Ames的2020年占星主题资料介绍西方黄道十二宫的命名与划分背景。[2] 这里用这些文化名称命名原创故事镜头，不将星体位置当作行为原因。天文学资料支持的是相关概念说明，并未研究本问卷，也不为十二篇画像或计分提供验证。",
        "en": "NASA Ames’s January 2020 astrology overview describes the naming and divisions of the Western zodiac.[2] This page uses the cultural names for original story lenses without making celestial positions a cause of behaviour. Astronomical background explains concepts; it neither studies this questionnaire nor validates its portraits or scores."
      },
      {
        "zh": "计数可以按明确规则复算，但本题本尚未建立信度、效度、常模或跨语言等值证据。读到熟悉的说法，是一次个人阅读反应，不等于证实星座决定人格。若想讨论实际性格，应另外核对相应工具的模型、目标人群与测量证据；本游戏不能换算成MBTI、大五人格、创造力或共情分数。",
        "en": "Counts follow reproducible rules, but this bank has no established reliability, validity, norms or cross-language measurement equivalence. Recognizing a familiar description is a personal reading response, not evidence that signs determine personality. For actual trait questions, examine a relevant instrument’s model, target population and measurement evidence. This game cannot be converted into MBTI, Big Five, creativity or empathy scores."
      }
    ]
  },
  {
    "id": "star-entry-sharing",
    "title": {
      "zh": "怎样开始、重测与分享？让探索保持自愿",
      "en": "Starting, retaking and sharing: keeping exploration voluntary"
    },
    "paragraphs": [
      {
        "zh": "点击开始测试直接进入第一题，无需再勾选同意、注册或填写邮箱。请选择此刻更想试的故事动作，没有标准答案，也不要求描述真实经历。约5分钟是阅读估计，不是倒计时；改天想象另一场景可以得到不同计数，不必反复作答直到出现喜欢的星座。",
        "en": "Start test opens the first question directly, without another agreement checkbox, account or email. Choose the story move you would like to try now. There are no correct answers and no requirement to disclose lived experiences. Roughly five minutes is a reading estimate, not a countdown. Imagining another scene later may yield different counts; there is no need to repeat until a favourite sign appears."
      },
      {
        "zh": "答案在浏览器计算；默认不保存，主动选择临时保存后，本标签页可在24小时内恢复。完成、清除退出或重测会清除临时进度。公开分享使用不含私人答案和计数的通用链接。可以和朋友讨论一处虚构场景的不同写法，实际关系、信任和工作决定仍应依据具体沟通与行为。",
        "en": "Answers are calculated in the browser and are not saved by default. Optional temporary saving allows recovery in this tab for twenty-four hours. Completion, clearing on exit or retaking removes that progress. Public sharing uses a general link without private answers or counts. Discuss alternative drafts of an invented scene with friends; base real relationship, trust and work decisions on concrete communication and behaviour."
      }
    ]
  }
];

export const zodiacStoryLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "这份星座测试与生日星座查询有什么区别？",
      "en": "How does this quiz differ from a birthday zodiac lookup?"
    },
    "answer": {
      "zh": "本页用十二个星座名字标记故事动作，根据12次选择计数；不收生日，也不计算出生星座。结果回答的是这次想怎样写一个故事，而不是出生时太阳的位置。",
      "en": "The twelve names label story actions counted across twelve choices. The page takes no birthday and calculates no birth sign. Results describe moves you selected for a story, not the Sun’s position at birth."
    }
  },
  {
    "question": {
      "zh": "为什么十二个星座可能同时并列？",
      "en": "Why can all twelve signs tie?"
    },
    "answer": {
      "zh": "每个镜头出现四次，并在A至D各一次。十二题全部选同一个位置，便使每个镜头各得1次。所有最高项及七节全文全部显示，不随机抽取一个。",
      "en": "Every lens appears four times, once in each A–D position. Choosing the same position throughout gives each lens one count. Every highest entry and its seven-section guide remain visible; none is randomly selected."
    }
  },
  {
    "question": {
      "zh": "白羊0次、金牛2次，表示我更像金牛吗？",
      "en": "Do zero Aries and two Taurus counts mean I resemble Taurus more?"
    },
    "answer": {
      "zh": "它只表示本次题组对金牛镜头选了两次、对白羊未选中。计数不是人格相似度；除以四也只能得到题定机会中的选中比例，不能变成人群百分位。",
      "en": "It means two selections for the Taurus lens and none for Aries in this bank. Counts are not personality resemblance. Dividing by four only gives a selection fraction among offered appearances, not a population percentile."
    }
  },
  {
    "question": {
      "zh": "火、水、土、风元素会影响这份结果吗？",
      "en": "Do Fire, Water, Earth or Air determine these results?"
    },
    "answer": {
      "zh": "不会。选项直接对应十二个故事镜头，不先算元素，也不从元素推导星座。本页不显示元素能量、缺失或平衡，也不与四元素测试换算。",
      "en": "No. Options map directly to twelve story lenses without calculating elements first. This page produces no elemental energy, deficiency or balance result and cannot be converted to a Four Elements Quiz."
    }
  },
  {
    "question": {
      "zh": "觉得画像很像我，就证明星座科学吗？",
      "en": "Does recognizing myself in a portrait validate astrology?"
    },
    "answer": {
      "zh": "不能。个人认同与受控研究的证据不同。本页画像是原创故事说明，题本没有完成心理测量验证；可以用具体例子讨论喜欢的写法，不据此认定星座造成真实人格。",
      "en": "No. Personal recognition differs from evidence in controlled research. These are original story guides, and the bank has no completed psychometric validation. Use concrete examples to discuss preferred writing moves without treating signs as causes of personality."
    }
  },
  {
    "question": {
      "zh": "完整报告需要提交作品、邮箱或付费吗？",
      "en": "Do full guides require a writing submission, email or payment?"
    },
    "answer": {
      "zh": "不需要。作答为12道四选一，不收作品；全部计数、最高并列和十二篇完整指南免费。公开指南可提前阅读，不会替你生成私人答卷。",
      "en": "No. The quiz consists of twelve four-choice items with no writing submission. All counts, highest ties and twelve full guides are free. Public guides can be read in advance without creating a private answer sheet."
    }
  },
  {
    "question": {
      "zh": "怎样把两个最高镜头用于一次创作？",
      "en": "How can I try two highest lenses in one piece?"
    },
    "answer": {
      "zh": "选一个小场景，各写一个版本：如双子版先给对话，天蝎版先留一个后文能解释的细节。比较文本中实际改变什么；不必合成固定人格，也不把其他镜头排除。",
      "en": "Choose a small scene and make two versions: a Gemini version can begin with dialogue; a Scorpio version can leave a detail for later explanation. Compare actual changes in the text without inventing a fixed combined personality or excluding other lenses."
    }
  }
];
