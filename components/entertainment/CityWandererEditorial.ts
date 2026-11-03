import type { Copy, FunFaq } from "@/lib/entertainment/types";
export const cityWandererSections: {id:string;title:Copy;paragraphs:Copy[]}[] = [
  {
    "id": "purpose",
    "title": {
      "en": "City wanderer quiz: three threads of urban attention",
      "zh": "城市漫游方式测试：三条观察城市的线索"
    },
    "paragraphs": [
      {
        "en": "An unfamiliar junction, a square changing pace and an old photograph can invite different kinds of curiosity. In six imagined neighborhood scenes, choose whether you would follow connections between spaces, everyday public activity or evidence of a place’s earlier uses. You do not need to know a particular city or recall historical dates.",
        "zh": "陌生路口、节奏变化的广场与一张老照片，可以引出不同好奇。六个想象街区场景，让你选择更想追踪空间连接、日常公共活动，还是地方过往用途的证据。无需熟悉某座城市，也不考历史年代。"
      },
      {
        "en": "The three portraits are original narrative lenses for this game. Your answers describe which options appealed here; they do not establish a psychological type, navigation skill, cultural knowledge or a better way to explore. All three complete guides are available without registering, sharing your location or making a real trip.",
        "zh": "三种画像是本游戏原创的叙事视角。回答记录哪些选项在这里吸引你，不判定心理类型、导航技能、文化知识或更好的探索方式。三篇完整指南均可直接阅读，无需注册、提供位置或真的出门。"
      }
    ]
  },
  {
    "id": "map",
    "title": {
      "en": "The Everyday Mapmaker: notice relationships between spaces",
      "zh": "日常地图的绘制者：看见空间之间的关系"
    },
    "paragraphs": [
      {
        "en": "This thread follows how a side street meets a main road, where an entrance opens or how a courtyard links two public spaces. For example, you might remember an unfamiliar square by sketching its connections rather than listing its attractions. A rough personal sketch can record what caught your attention without claiming to be a reliable map.",
        "zh": "这一线索关注支路怎样接上主路、入口朝哪里开，以及庭院如何连接两处公共空间。例如，你可能画出陌生广场的连接关系，而非罗列景点。个人草图可以记录注意到的关系，同时保留与可靠地图的区别。"
      },
      {
        "en": "Kevin Lynch’s work examines how people understand city form. The publisher describes studies in Boston, Jersey City and Los Angeles and the idea of imageability. That provides background for asking about spatial impressions, not validation of our Mapmaker portrait or evidence that choosing it improves wayfinding. [1]",
        "zh": "凯文·林奇的著作讨论人如何理解城市形态。出版社介绍其波士顿、泽西市与洛杉矶研究及城市意象性概念，为空间印象提供背景；这些研究并未验证本站“绘制者”画像，也不证明选中它就更擅长认路。[1]"
      }
    ]
  },
  {
    "id": "rhythm",
    "title": {
      "en": "The Neighborhood Rhythm Listener: a time-specific observation",
      "zh": "听街区节奏的人：把观察放回具体时刻"
    },
    "paragraphs": [
      {
        "en": "Here the interest lies in public activity: a square becoming quieter, a corner where people pause or a route filling and emptying. You might record “more people passed this corner during these few minutes” rather than assume the area is always busy. The time, weather and event schedule may all change what a brief visit reveals.",
        "zh": "这里关注公共活动：逐渐安静的广场、有人停留的转角，或时疏时密的通道。可以记“这几分钟经过此处的人较多”，而非断定这里始终热闹。时段、天气与活动安排，都可能改变短暂到访所见。"
      },
      {
        "en": "The Public Life Data Protocol distinguishes people moving through public space from people staying there and supports structured observational records. This is background for separating movement from lingering. Our six imagined choices neither conduct that survey nor measure a neighborhood’s social quality, residents’ feelings or your observational expertise. [2]",
        "zh": "公共生活数据协议区分经过公共空间的人与停留者，并支持结构化观察记录，可作为区分移动与停留的背景。本页六次想象选择并未实施该调查，也不测街区社交质量、居民感受或你的观察专业程度。[2]"
      }
    ]
  },
  {
    "id": "layers",
    "title": {
      "en": "The Place-Story Collector: keep the evidence with the story",
      "zh": "地方故事的拾层者：让故事带着证据"
    },
    "paragraphs": [
      {
        "en": "A changed shopfront, a street name or an old public photograph can prompt a question about earlier uses. Start with what the caption actually says, who produced it and which date it describes. “This photograph shows a shop at that time” is narrower than “this street has always been a shopping street.” Leave room for what the source cannot tell you.",
        "zh": "改过的店面、街名或公开老照片，可能让人好奇过去的用途。先看图注实际说了什么、由谁提供、对应哪个年代。“照片显示当时有家商店”，比“这条街一直是商业街”更有限，也更准确；资料没有回答的部分可以先留白。"
      },
      {
        "en": "Historic England’s area-assessment guidance combines field observation with documentary research. Its discussion of maps, photographs and records also shows why one source cannot settle an area’s whole history. This professional method informs the evidence-checking suggestion; our game is not a historic-area assessment or a test of historical competence. [3]",
        "zh": "Historic England的区域评估指南结合现场观察与文献研究，讨论地图、照片及档案的使用，也说明单一材料不足以概括整个地方的历史。这里借其方法提醒核对证据；本游戏不是历史区域评估，也不考核历史研究能力。[3]"
      }
    ]
  },
  {
    "id": "scoring",
    "title": {
      "en": "Six answers, three counts: a transparent tally",
      "zh": "六个回答、三项计数：清楚可复算的规则"
    },
    "paragraphs": [
      {
        "en": "Each question offers one map, one rhythm and one layers option, with their positions varying across questions. A selected option adds one point to its thread. Complete all six questions to see the result. Each count ranges from zero to six and the three counts always sum to six; no time, location, photograph or hidden personality score enters the calculation.",
        "zh": "每题各有一个空间、节奏与故事层次选项，位置会随题目变化。选中后只为对应线索加一次；六题全部回答才产生结果。每项零至六次，三项合计恒为六，不加入用时、位置、照片或隐藏人格分。"
      },
      {
        "en": "For example, map 3, rhythm 2 and layers 1 means three selections followed spatial connections in this set. It is not a population percentile, a percentage of your identity or a city-exploration proficiency score. Zero records that another option was chosen each time here; it does not mean you never notice that thread outside the game.",
        "zh": "例如空间三次、节奏两次、故事一次，表示本题组里有三次选择追踪空间连接，不是人群百分位、身份比例或城市探索熟练分。零次只记录在这里每次都选了其他选项，不代表日常永远不会注意这条线索。"
      }
    ]
  },
  {
    "id": "ties",
    "title": {
      "en": "Highest ties: read every leading lens",
      "zh": "最高次数并列：把领先视角一起读"
    },
    "paragraphs": [
      {
        "en": "The game returns every thread sharing the highest count. A 3–3–0 result keeps map and rhythm; a 2–2–2 result keeps all three. It does not resolve ties by question order, alphabet or a random draw. A 3–2–1 result has one highest portrait, although the other counts remain visible for context.",
        "zh": "所有达到相同最高次数的线索都会保留。三、三、零保留空间与节奏；二、二、二保留全部三项。不按题序、字母或随机抽取破同分。三、二、一只有一个最高画像，但其他次数仍会显示，供结合阅读。"
      },
      {
        "en": "With three options on each of six questions, 729 complete answer patterns are possible. All seven nonempty sets of highest threads can occur: three single portraits, three pairs and one three-way tie. These are possible outputs of the rule, not observed population frequencies or seven independently validated traveler types.",
        "zh": "六题每题三个选项，共有729种完整回答。七种非空最高集合均可出现：三个单项、三个两项并列和一个三项并列。它们是规则允许的输出，不是实际人群比例，也不是七类经过独立验证的旅行者类型。"
      }
    ]
  },
  {
    "id": "comparison",
    "title": {
      "en": "Use the three lenses on the same imagined corner",
      "zh": "同一个想象转角，也可用三种视角观察"
    },
    "paragraphs": [
      {
        "en": "At a public corner, map might ask which spaces connect, rhythm might ask when people pause, and layers might ask what a dated photograph can support. These are different questions about the same setting, not rival descriptions that must cancel each other out. Your highest portrait is a starting point for reading, not a requirement to ignore the other guides.",
        "zh": "面对同一公共转角，空间视角问连接了哪里，节奏视角问何时有人停留，故事视角问带日期的照片能支持什么。它们是在同一场景里提出不同问题，不必互相排斥。最高画像可作为阅读起点，无需因此忽略其他指南。"
      },
      {
        "en": "A low-effort comparison can remain entirely on paper: draw one uncertain connection, note one time-dependent detail and write one historical question with its source. Comparing the notes may show which prompt was interesting today. It cannot prove that one lens describes you permanently or that a different score marks a change in personality.",
        "zh": "轻量比较可以完全在纸上进行：画一处尚不确定的连接、记一个随时间变化的细节、写一个附来源的历史问题。比较笔记能帮你发现今天哪种提示更有趣，却不能证明某视角永久定义你，也不能凭分数变化断定人格改变。"
      }
    ]
  },
  {
    "id": "access",
    "title": {
      "en": "Explore in a form that fits your access and comfort",
      "zh": "以适合自身条件的形式探索"
    },
    "paragraphs": [
      {
        "en": "No outdoor task is required to answer. The imagined walk can be adapted to the way you move, or explored through an available public map, photograph or memory. You do not need to visit unfamiliar streets, cover a distance, find a hidden entrance or photograph people to obtain a complete result.",
        "zh": "作答无需完成户外任务。想象中的“走走”可以换成适合你的移动方式，也可借可用的公共地图、照片或记忆理解。无需去陌生街道、走够距离、寻找隐蔽入口或拍摄他人，仍能得到完整结果。"
      },
      {
        "en": "A route that appears connected on paper may have steps, closures, access restrictions or other conditions the sketch omits. If you separately choose a real outing, check current local information and your own requirements. The quiz supplies neither a route nor an assessment of safety, accessibility, legality or opening hours.",
        "zh": "纸上连通的路线，可能存在台阶、封闭、进入限制及草图未记的条件。若另行决定真实外出，应核对当时当地信息与自身需要。本测试不提供路线，也不评估安全、可达性、准入或开放时间。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "Research context without borrowed scientific certification",
      "zh": "研究背景与本站题本的证据分别看"
    },
    "paragraphs": [
      {
        "en": "Urban design, public-life observation and historic-area research offer useful vocabulary for these three interests. They study places and experiences using methods different from this original forced-choice game. The cited works did not create our questions, derive our three portraits or establish their measurement properties.",
        "zh": "城市设计、公共生活观察与历史区域研究，为三种兴趣提供有用词汇；其研究对象与方法，都不同于本站原创强迫选择小游戏。所引资料没有编写这里的题目、推导三种画像，或建立它们的测量学性质。"
      },
      {
        "en": "This version has no established reliability, validity, norms or evidence for predicting travel behavior. Read the result as a bounded record of six imagined selections. The same person may attend to different details with a deadline, familiar surroundings or a companion; the game does not separate situational effects from stable traits.",
        "zh": "本版本尚未建立信度、效度、常模或预测旅行行为的证据。结果适合读作六次想象选择的有限记录。同一个人在赶时间、熟悉环境或有人作伴时，可能关注不同细节；本游戏不能区分情境影响与稳定特质。"
      }
    ]
  },
  {
    "id": "privacy",
    "title": {
      "en": "Start directly, keep exploration optional",
      "zh": "直接开始，把后续探索留作自选"
    },
    "paragraphs": [
      {
        "en": "The Start quiz button opens the first question after the page is ready, without a mandatory agreement, location permission or another test. Answers are calculated in the current browser. All complete portraits are free; the later MBTI link is optional and does not determine, unlock or convert your city-wanderer result.",
        "zh": "页面就绪后，“开始测试”直接进入第一题，无需入口同意勾选、定位权限或先做另一测试。回答在当前浏览器计算，全部完整画像免费；后续MBTI链接自愿使用，不决定、解锁或换算城市漫游结果。"
      },
      {
        "en": "Progress saving is optional and limited to this browser tab for 24 hours; completion, retaking or exit-and-clear deletes it. Answers are not placed in the page URL or answer-bearing analytics events. General site-use events may still follow the site’s cookie settings. Public portrait links contain authored explanations, not another visitor’s answers.",
        "zh": "进度只在主动选择后保存于本标签页，二十四小时失效；完成、重测或退出并清除时删除。回答不写入页面网址或携带答案的分析事件。一般站点使用事件仍以网站Cookie设置为准。公开画像链接展示原创说明，不是其他访客答案。"
      }
    ]
  }
];
export const cityWandererFaq: FunFaq[] = [
  {
    "question": {
      "en": "What does this city wanderer quiz explore?",
      "zh": "城市漫游方式测试探索什么？"
    },
    "answer": {
      "en": "Six imagined scenes compare spatial connections, everyday public activity and traces of earlier uses. The result contains three raw counts and every highest portrait; it describes selections in this game.",
      "zh": "六个想象场景比较空间连接、日常公共活动与地方过往痕迹。结果提供三项原始次数与全部最高画像，描述本游戏内的选择。"
    }
  },
  {
    "question": {
      "en": "Is this a validated personality or navigation test?",
      "zh": "这是经过验证的人格或导航测试吗？"
    },
    "answer": {
      "en": "No. It is an original narrative game without established reliability, validity or population norms. The urban research references provide context, not certification of its questions or portraits.",
      "zh": "不是。这是原创叙事游戏，尚未建立信度、效度或人群常模。城市研究资料提供背景，不为这些题目或画像认证。"
    }
  },
  {
    "question": {
      "en": "How are the three scores calculated?",
      "zh": "三项分数怎样计算？"
    },
    "answer": {
      "en": "Each selected option adds one to map, rhythm or layers. All six answers are required; each count is 0–6 and the sum is six. Option position is not itself a scoring category.",
      "zh": "每个所选选项为空间、节奏或故事对应计数加一次。六题须全部完成；每项零至六次、合计六次。选项位置本身不是计分类别。"
    }
  },
  {
    "question": {
      "en": "What if two or all three portraits tie?",
      "zh": "两项或三项画像并列怎么办？"
    },
    "answer": {
      "en": "Every equal highest count remains. A 3–3–0 pattern gives two portraits and 2–2–2 gives three. Close but unequal counts are displayed without being merged.",
      "zh": "同为最高的全部保留。三、三、零返回两个画像，二、二、二返回三个；接近但不相等的次数仍分别显示，不自动合并。"
    }
  },
  {
    "question": {
      "en": "Does Mapmaker mean I have better spatial ability?",
      "zh": "“绘制者”代表空间能力更好吗？"
    },
    "answer": {
      "en": "No. Selecting connection-focused options is not an observed navigation task. This quiz does not measure route accuracy, spatial reasoning, memory or safe movement.",
      "zh": "不代表。选中关注连接的选项，并非完成真实导航任务。本测试不测路线准确性、空间推理、记忆或安全移动。"
    }
  },
  {
    "question": {
      "en": "Can Rhythm Listener reveal how residents feel?",
      "zh": "“听节奏的人”能判断居民感受吗？"
    },
    "answer": {
      "en": "No. A public activity observed briefly does not establish a person’s motives or an area’s usual character. The game gathers no resident interviews or real public-life survey data.",
      "zh": "不能。短暂看到的公共活动，不足以说明个人动机或区域常态。本游戏不收集居民访谈或真实公共生活调查数据。"
    }
  },
  {
    "question": {
      "en": "Does Place-Story Collector verify a historical story?",
      "zh": "“拾层者”会验证地方历史吗？"
    },
    "answer": {
      "en": "No. It invites source-checking questions. A photograph or caption needs a date, provenance and comparison with other evidence before supporting a specific historical claim.",
      "zh": "不会。它提供核对来源的提问方向。照片或图注需结合日期、出处与其他证据，才能支持具体历史主张。"
    }
  },
  {
    "question": {
      "en": "Do I need to go outside or share my location?",
      "zh": "需要出门或提供位置吗？"
    },
    "answer": {
      "en": "No. All scenes are imagined. You may adapt the walk to your access needs or use a public map or photograph as context. No GPS, address, photograph upload or real itinerary is requested.",
      "zh": "不需要。全部场景为想象，可按自身条件理解“走走”，或借公共地图、照片了解情境。不要求GPS、地址、上传照片或真实行程。"
    }
  },
  {
    "question": {
      "en": "How long is it, and is the whole result free?",
      "zh": "需要多久，完整结果免费吗？"
    },
    "answer": {
      "en": "Six choices take about two minutes, without a time limit. Answering, all three full public guides and every highest tie are free without registration or a prerequisite test.",
      "zh": "六次选择约两分钟，没有倒计时。作答、三篇完整公开指南与全部最高并列均免费，无需注册或前置测试。"
    }
  },
  {
    "question": {
      "en": "Can I retake or compare it with MBTI?",
      "zh": "可以重测，或与MBTI比较吗？"
    },
    "answer": {
      "en": "Retaking starts fresh choices; changes do not prove a personality shift. MBTI uses a different framework and question set. No conversion from these three counts to MBTI letters is provided.",
      "zh": "重测开始新一轮选择，变化不证明人格改变。MBTI采用不同框架与题目，这三项次数不换算为MBTI字母。"
    }
  },
  {
    "question": {
      "en": "Are answers saved or included in shared links?",
      "zh": "答案会保存或出现在分享链接里吗？"
    },
    "answer": {
      "en": "Answers are calculated in the browser; optional tab-only progress expires after 24 hours and clears on completion, retake or exit-and-clear. Public guide links contain portrait identities, not private answers.",
      "zh": "答案在浏览器计算；自选标签页进度二十四小时失效，完成、重测或退出并清除时删除。公开指南链接只含画像身份，不含私人答案。"
    }
  }
];
