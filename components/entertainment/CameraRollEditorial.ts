import type { Copy, FunFaq } from "@/lib/entertainment/types";
export const cameraRollSections: {id:string;title:Copy;paragraphs:Copy[]}[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Camera-roll curation quiz: what makes pictures worth revisiting?",
      "zh": "相册整理趣味测试：怎样让照片值得重看？"
    },
    "paragraphs": [
      {
        "en": "A picture collection can help you locate a day, return to a few favorites or follow a short viewing sequence. This original six-question game asks which purpose you would choose in an imagined collection. Every scene offers three actions; choose the one you most want in that scene.",
        "zh": "一组照片可以帮助重找某一天、回看少数喜欢的画面，或沿着短序列观看。这份原创六题游戏邀请你在想象相册中选择用途。每个场景提供三种做法，选择当时更想采用的一项。"
      },
      {
        "en": "No camera, photo-library access, upload or real photograph is needed. Picture an ordinary fictional outing, rather than evidence that must be preserved or sensitive family material. The portraits describe this small selection task; they do not inspect how your actual library is organised.",
        "zh": "无需相机、相册权限、上传或任何真实照片。可以想象一次普通的虚构出游，不必代入需要保全的证据或敏感家庭资料。画像只描述这次小挑选任务，不检查真实相册整理情况。"
      }
    ]
  },
  {
    "id": "find",
    "title": {
      "en": "Finding again: a cue that fits the question you will ask",
      "zh": "方便重找：线索要对应以后会问的问题"
    },
    "paragraphs": [
      {
        "en": "The Find-It-Again Curator values a route back to a picture or group. A plain event label can answer “where did I put that afternoon?” without describing every image. In these questions, grouping and a usable cue earn the find count; the count does not measure recall speed.",
        "zh": "容易重找的策展者重视返回某张图或某组图的路径。一个普通活动名，就可能回答“那天下午放在哪里”，无需逐图详述。本题把分组和可用线索记入重找次数，不测回忆速度。"
      },
      {
        "en": "For example, “rainy picnic” might be a useful label if those are the words you expect to remember. More categories are not automatically more helpful: maintaining them also takes effort. Try a single cue in an invented collection before imagining a detailed cataloguing system.",
        "zh": "例如，若以后会想到“雨天野餐”，它就可能是有用标签。分类更多不自动等于更好找，维护分类也需要投入。可以先在虚构集合里试一个线索，再考虑复杂目录。"
      }
    ]
  },
  {
    "id": "favorites",
    "title": {
      "en": "Favorites: a small entry point rather than a verdict on every image",
      "zh": "少量精选：一个入口，不是给所有照片定好坏"
    },
    "paragraphs": [
      {
        "en": "The Favorite-Few Curator chooses images they want to revisit now. One frame can be enough without representing an entire day. The result concerns the appeal of a small selection, rather than objective photographic quality, taste superiority or willingness to erase the rest.",
        "zh": "喜欢几张就好的策展者挑选此刻想回看的画面。一张图可以足够，不必代表一整天。结果谈的是少量选择的吸引力，不评客观摄影质量、审美高低，也不代表愿意删除其余照片。"
      },
      {
        "en": "Call a selection “today’s three” rather than “the only good ones.” That leaves space for a different choice later and for details missed on the first pass. A favorite set can sit beside the broader collection; this quiz asks for no deletion, cleanup target or minimum number of favorites.",
        "zh": "把集合叫作“今天的三张”，而不是“仅有的好照片”，能为以后重选和初看遗漏的细节留空间。精选可以与完整集合并存；本测试不要求删除，不设清理目标或最低收藏数量。"
      }
    ]
  },
  {
    "id": "sequence",
    "title": {
      "en": "Sequence: choosing a viewing path without rewriting the event",
      "zh": "小序列：安排观看路径，区分编辑与实际经过"
    },
    "paragraphs": [
      {
        "en": "The Little-Sequence Curator considers how one image leads to another. A wide view, a small detail and an empty table could make a brief afternoon sequence. Changing their order can change the impression, even though the images themselves stay the same.",
        "zh": "小序列策展者关注一张图怎样接到下一张。远景、一个细节和空桌面，可以组成简短的下午序列。即使图片本身不变，调换次序也可能改变观看感受。"
      },
      {
        "en": "A selected sequence is an editorial choice. It need not be chronological, exhaustive or the only account of what happened. A caption such as “three selected views” can explain its scope. In this game, sequence choices do not establish storytelling skill or the truth of a real memory.",
        "zh": "精选序列是一种编辑选择，不必按时间排列、穷尽经过或成为唯一叙述。“三张精选视角”这样的说明可以交代范围。本游戏中的排序选择不证明叙事能力，也不核实真实记忆。"
      }
    ]
  },
  {
    "id": "scoring",
    "title": {
      "en": "Six choices, three counts and every highest tie",
      "zh": "六次选择、三项次数与全部最高并列"
    },
    "paragraphs": [
      {
        "en": "Each chosen option adds one point to exactly one portrait: find, favorites or sequence. All six questions must be answered. Each count ranges from 0 to 6, and the three counts sum to 6. These are relative choices within this set, not independent ratings of three abilities.",
        "zh": "每个选中项只给重找、精选或序列中的一种画像加1次，六题全部作答才生成结果。各项范围0—6次，三项合计6次。这是本题组内的相对选择，不是三种能力的独立评分。"
      },
      {
        "en": "Every portrait at the highest count is retained: 3–3–0 gives two leading portraits and 2–2–2 gives all three. Display order does not settle ties. A difference of one choice is simply one choice here; there are no population percentiles, confidence estimates or accuracy percentages.",
        "zh": "所有最高次数画像都会保留：3—3—0得到两种最高画像，2—2—2保留三种。展示顺序不破同分。相差1次在这里就只是一次选择差异，不换算人群百分位、置信程度或准确率。"
      }
    ]
  },
  {
    "id": "combinations",
    "title": {
      "en": "Combining retrieval, favorites and sequence",
      "zh": "重找、精选与序列可以配合使用"
    },
    "paragraphs": [
      {
        "en": "Find and favorites can combine as a small chosen set with a label you recognise. Favorites and sequence can combine as three enjoyable frames in a deliberate order. Find and sequence can combine as a short ordered collection with a clear event name. These are possible uses, not extra scored combinations.",
        "zh": "重找与精选可以搭配成有熟悉标签的小集合；精选与序列可以搭配成三张喜欢的图加主动排序；重找与序列可以搭配成有明确活动名的短序列。这些是用途例子，不是新增计分组合。"
      },
      {
        "en": "A three-way tie leaves all three public portraits available in your result. A zero does not mean you never use that purpose, because each scene allows only one offered answer. Compare a portrait with a concrete example and an exception before deciding whether its wording is useful to you.",
        "zh": "三项并列会在结果中保留三篇画像。0次不表示从未使用该用途，因为每个场景只能选一个给定答案。可以先找一个符合的例子和一个反例，再判断描述对自己是否有用。"
      }
    ]
  },
  {
    "id": "research",
    "title": {
      "en": "Photo-management research and this entertainment game",
      "zh": "照片管理研究与本娱乐游戏的关系"
    },
    "paragraphs": [
      {
        "en": "Rodden and Wood’s CHI 2003 paper studied thirteen workplace volunteers over six months in 2000, using interviews and logs from the Shoebox photo-management system. Participants often used broad event groupings; detailed annotation was not universal. This is historical evidence about managing and browsing collections. [1]",
        "zh": "Rodden与Wood的CHI 2003论文研究了十三位工作场所志愿者，记录其在2000年六个月内使用Shoebox照片管理系统的情况，结合访谈与操作日志。参与者常采用较宽泛的活动分组，详细标注并非人人都会做。这是关于集合管理与浏览的历史研究。[1]"
      },
      {
        "en": "The authors explicitly warn that their small workplace sample is unlikely to represent the population. Its early digital-camera setting differs from today’s phone libraries. It does not validate these six questions, establish three universal curator types or supply norms. This original game has no supplied reliability or validity study.",
        "zh": "作者明确指出，这个工作场所的小样本不太可能代表总体。早期数码相机情境也不同于今天的手机图库。论文不验证本站六题，不确立三种普遍策展人格，也不提供常模。本原创游戏尚无所提供的信度或效度研究。"
      }
    ]
  },
  {
    "id": "preservation",
    "title": {
      "en": "Selecting a set, preserving files and deleting are separate actions",
      "zh": "挑选集合、保存文件与删除，是不同操作"
    },
    "paragraphs": [
      {
        "en": "The Library of Congress recommends identifying important digital photographs, using descriptive names and groups, and keeping copies in different places. Selection makes material easier to approach; it does not itself create another recoverable copy. A pleasing sequence is likewise not a backup plan. [2]",
        "zh": "美国国会图书馆建议辨认重要数码照片，使用描述性名称和分组，并在不同地点保留副本。挑选可以让资料更容易使用，却不会自动产生另一份可恢复副本；好看的序列同样不等于备份方案。[2]"
      },
      {
        "en": "Tool actions also differ. Google Photos distinguishes removing a picture from an album from deleting it from the main library; its album guide separately describes custom ordering. Check the current instructions for your own app before editing real files. Nothing in this quiz changes a file, album or backup. [3]",
        "zh": "工具操作也有区别。Google Photos的相册指引区分从相册移除图片与从主图库删除图片，并另外说明主动排序。改动真实文件前，应核对所用应用的现行说明。本测试不会改动文件、相册或备份。[3]"
      }
    ]
  },
  {
    "id": "viewing",
    "title": {
      "en": "A small selection for a willing viewer",
      "zh": "给愿意观看的人一个小入口"
    },
    "paragraphs": [
      {
        "en": "In the friend scene, choosing a short sequence is only one possible invitation. You could instead find the requested image or show one favorite and let the friend ask for more. Ask what they want to see; a neat presentation does not oblige anyone to watch the entire collection.",
        "zh": "朋友情境里，短序列只是邀请的一种方式。也可以找到对方所问的一张，或先看一张喜欢的，再由朋友决定是否想多看。先问对方想看什么，整齐展示不意味着别人有义务看完整套。"
      },
      {
        "en": "If you later use real images, distinguish your interest in showing them from other people’s wishes about being shown. Check recipients and visible captions or locations before voluntary sharing. You can explore all three purposes with invented pictures and without involving another person at all.",
        "zh": "若以后使用真实图片，应区分自己想展示与照片中他人的展示意愿。自愿分享前可以核对接收者、可见说明和地点。也完全可以用虚构画面探索三种用途，不涉及任何他人。"
      }
    ]
  },
  {
    "id": "practice",
    "title": {
      "en": "One optional experiment and private quiz progress",
      "zh": "一个自选小尝试与测验进度隐私"
    },
    "paragraphs": [
      {
        "en": "Imagine three ordinary pictures. Give the set a useful name, choose one favorite, then try two viewing orders. Notice which change helps the purpose you care about today. You can stop there, without installing software, reorganising your library or sharing the outcome.",
        "zh": "想象三张普通图片：给整组取一个有用名字，选一张喜欢的，再试两种观看次序。留意哪种变化对今天关心的用途有帮助。到此即可，不必安装软件、重整图库或分享结果。"
      },
      {
        "en": "Start opens question one directly. Quiz progress is kept only if you choose the optional draft feature; this tab’s draft expires after twenty-four hours and clears on completion, retake or exit-and-clear. It contains quiz answers, never photos. Copying a result includes leading portrait names and public guide links, not your answers or counts.",
        "zh": "点击开始直接进入第一题。只有主动选择草稿功能才保存测验进度；本标签页草稿二十四小时后失效，完成、重测或退出清除即删除。草稿保存测验答案，不保存照片。复制结果包含最高画像名称和公开指南链接，不含私人答案或次数。"
      }
    ]
  }
];
export const cameraRollFaq: FunFaq[] = [
  {
    "question": {
      "en": "What does this camera-roll quiz explore?",
      "zh": "相册整理趣味测试探索什么？"
    },
    "answer": {
      "en": "Six imagined scenes compare finding pictures again, selecting a few favorites and arranging a short sequence. The result summarises these choices rather than inspecting a real library.",
      "zh": "六个想象场景比较方便重找、少量精选和短序列排序。结果归纳这些选择，不检查真实图库。"
    }
  },
  {
    "question": {
      "en": "Will you read or ask me to upload my photos?",
      "zh": "会读取或要求上传照片吗？"
    },
    "answer": {
      "en": "No. The game uses written fictional scenes. No photo-library permission, camera permission, file selection or upload is part of the quiz.",
      "zh": "不会。测验使用文字虚构情境，不包含相册权限、相机权限、选择文件或上传。"
    }
  },
  {
    "question": {
      "en": "How are scores and ties calculated?",
      "zh": "次数与并列怎样计算？"
    },
    "answer": {
      "en": "One chosen option gives one point to one portrait. Six answers total six points. All highest counts remain: 3–3–0 keeps two portraits; 2–2–2 keeps all three.",
      "zh": "每个选中项给一种画像加1次，六题合计6次。保留所有最高次数：3—3—0保留两种，2—2—2保留三种。"
    }
  },
  {
    "question": {
      "en": "Does choosing favorites mean deleting the other photographs?",
      "zh": "选择精选表示删除其他照片吗？"
    },
    "answer": {
      "en": "No. A favorite set is a selection for revisiting. Unchosen pictures need not be worthless or deleted; this game never performs file operations.",
      "zh": "不表示。精选是为回看而挑选，未入选照片不必没有价值或被删除；本游戏不操作文件。"
    }
  },
  {
    "question": {
      "en": "Does a sequence have to follow time order?",
      "zh": "序列一定要按时间顺序吗？"
    },
    "answer": {
      "en": "No. The portrait concerns a deliberate viewing order, which may use contrast or a beginning and ending. It is a chosen presentation, not a complete historical record.",
      "zh": "不一定。画像关注主动观看顺序，可以使用对照或起止结构。它是精选展示，不是完整历史记录。"
    }
  },
  {
    "question": {
      "en": "Does the find portrait measure memory or organisational skill?",
      "zh": "重找画像衡量记忆或整理能力吗？"
    },
    "answer": {
      "en": "No. It records choosing a label or grouping in these scenes. There is no timed retrieval task, actual library inspection or ability benchmark.",
      "zh": "不衡量。它记录在这些情境里选择标签或分组，没有计时检索任务、实际图库检查或能力基准。"
    }
  },
  {
    "question": {
      "en": "Is this a scientifically validated personality assessment?",
      "zh": "这是经过科学验证的人格测评吗？"
    },
    "answer": {
      "en": "No. It is an original entertainment tally without supplied psychometric validation or norms. Photo-management research supplies background, not validation of these portraits.",
      "zh": "不是。这是未提供心理测量验证或常模的原创娱乐计数。照片管理研究提供背景，不验证本站画像。"
    }
  },
  {
    "question": {
      "en": "Can my selection change next time?",
      "zh": "下次选择可以不同吗？"
    },
    "answer": {
      "en": "Yes. Another imagined occasion or purpose may change your answers. A six-choice tally cannot determine whether a difference represents stable personal change.",
      "zh": "可以。想象场合或用途不同，可能改变作答。六次选择的计数无法判定差异是否代表稳定的个人变化。"
    }
  },
  {
    "question": {
      "en": "Does an album automatically back up its pictures?",
      "zh": "建相册会自动备份图片吗？"
    },
    "answer": {
      "en": "Do not assume so. An album may organise existing items rather than create an independent copy. Verify your app’s storage and backup instructions; this quiz preserves no photographs.",
      "zh": "不能直接这样认定。相册可能只是组织已有项目，并未创建独立副本。应核对应用的存储与备份说明；本测试不保存任何照片。"
    }
  },
  {
    "question": {
      "en": "Is it free, and can I start without an agreement screen?",
      "zh": "是否免费，开始前需要同意吗？"
    },
    "answer": {
      "en": "All six questions, counts, highest ties and three full public guides are free. Start opens the first question directly, without registration, another test or a required agreement choice.",
      "zh": "六题、次数、最高并列及三篇公开全文均免费。开始直接进入第一题，无需注册、其他测评或必选同意项。"
    }
  },
  {
    "question": {
      "en": "What can be saved or shared?",
      "zh": "可以保存或分享什么？"
    },
    "answer": {
      "en": "An optional draft lasts twenty-four hours in this tab and clears on completion, retake or exit-and-clear. Copying shares portrait names and public links, not photos, answers or counts.",
      "zh": "自选草稿在本标签页保留二十四小时，完成、重测或退出清除即删除。复制分享画像名称和公开链接，不含照片、答案或次数。"
    }
  }
];
