import type { Copy, FunFaq } from "@/lib/entertainment/types";
export type StoryEditorial = {label:Copy;instructions:Copy;sections:{id:string;title:Copy;paragraphs:Copy[]}[];faq:FunFaq[];references:{url:string;label:Copy}[]};
export const additionalStoryEditorials: Record<string, StoryEditorial | undefined> = {
  "woodland-animal": {
  "label": {
    "en": "Original shared-outing story · Discovery, a base and personal space",
    "zh": "原创同行出游故事 · 发现、据点与个人空间"
  },
  "instructions": {
    "en": "Imagine the supplied friendly woodland outing, without a survival contest. Choose one response per scene about routes, shared supplies, a busy stop and different wishes for pace. The animals are authored symbols; all highest-count portraits appear with their complete guides.",
    "zh": "想象给定的友好林间出游，没有生存竞赛。每景选择一种回应，涉及路线、公用物品、热闹停靠点与不同节奏意愿。动物是原创符号，所有最高次数画像及完整指南都会显示。"
  },
  "sections": [
    {
      "id": "premise",
      "title": {
        "en": "Three contributions to the same imagined woodland outing",
        "zh": "同一次想象出游里的三种贡献"
      },
      "paragraphs": [
        {
          "en": "An extra hour at the entrance, one shared item, a busy viewpoint, a proposed extension, a souvenir and a future-plan change form the six scenes. Your choice counts toward discovery, a dependable base or personal space. No route is mapped for a real location, and no animal is identified.",
          "zh": "入口多一小时、一件公用物品、热闹观景点、延长行程提议、纪念物与下次调整，组成六个场景。选择分别记向发现、可靠据点或个人空间；不为真实地点规划路线，也不识别动物。"
        },
        {
          "en": "Jay, beaver and hedgehog are original names for these contributions, not observations that real animals arrange human outings. The three emphases can coexist: notice a detail, share practical work and agree where someone can pause. No contribution makes one person responsible for the entire group.",
          "zh": "松鸦、河狸、刺猬是这些贡献的原创名称，不声称真实动物会安排人类出游。三种侧重可并存：留意细节、分担实际工作、约好停靠处；任何一种都不让个人负责整个群体。"
        }
      ]
    },
    {
      "id": "jay",
      "title": {
        "en": "Curious Route Finder: an optional discovery needs coordination",
        "zh": "好奇探路者：可选发现也需要协调"
      },
      "paragraphs": [
        {
          "en": "The jay choices notice a mapped side route, an unfamiliar leaf or another view. The original guide pairs a possible detour with explaining where and when to meet again. An original indoor parallel is asking whether companions want to see one additional room in an exhibition.",
          "zh": "松鸦选项留意地图支线、陌生叶片或另一观察角度。原指南将可选绕行与说明去向、会合时间放在一起；一个原创室内对照是问同行者，是否愿意多看展览中的一间房。"
        },
        {
          "en": "Interest does not establish that everyone has spare time, energy or permission to take a route. The full guide keeps joining optional. A high jay count is not navigation competence, extroversion or a license to leave an approved path.",
          "zh": "有兴趣不代表大家有时间、体力，或获准使用某条路线。完整指南保留可选参加；松鸦次数高，不证明导航能力、外向性，也不意味着可离开获准路径。"
        }
      ]
    },
    {
      "id": "beaver",
      "title": {
        "en": "Base Builder: make shared comfort a shared job",
        "zh": "据点搭建者：共同舒服，也共同分担"
      },
      "paragraphs": [
        {
          "en": "The beaver choices locate supplies, a place to sit and an understandable meeting point. The original picnic-mat example makes a vague outing more usable. An original conversation might divide the mat, water and check-in arrangements among willing participants rather than assign everything to one person.",
          "zh": "河狸选项明确物资、座位与易懂会合点。原野餐垫例子让模糊出游安排更可用；一个原创讨论可以把垫子、水与确认安排分给愿意的参与者，而不是全交给一个人。"
        },
        {
          "en": "Dependability can become an unchosen job. The complete guide asks what you are happy to organize and what someone else can own. Counts do not measure caregiving ability or establish that supplies, conditions or a real outing have been checked for safety.",
          "zh": "可靠也可能变成未曾答应的工作。完整指南问你愿意组织什么、别人可以承担什么。次数不测照顾能力，也不证明已经核查实际物资、条件或出游安全。"
        }
      ]
    },
    {
      "id": "hedgehog",
      "title": {
        "en": "Gentle Pace Keeper: a concrete request can leave room to join",
        "zh": "温和节奏守护者：具体请求让参与留有余地"
      },
      "paragraphs": [
        {
          "en": "The hedgehog options consider a quieter stop, room to rest and participation without pressure. The original guide favors naming a return point rather than disappearing without explanation. This is one contribution to a shared scene, not a verdict that solitude is superior to company.",
          "zh": "刺猬选项考虑安静停点、休息空间与不受压力的参与。原指南鼓励说清返回节点，而不是不作说明就消失。这是共同场景中的一种贡献，不判独处优于陪伴。"
        },
        {
          "en": "People may not infer a limit from silence. A request for a quieter interval can be discussed alongside other people’s needs. A high count does not diagnose sensitivity, avoidance or low stamina, and a lower count does not remove anyone’s right to rest.",
          "zh": "他人未必能从沉默猜出限度。安静间隙的请求可以与其他人的需要一起讨论。次数高不诊断敏感、回避或体力差；次数低也不取消任何人休息的权利。"
        }
      ]
    },
    {
      "id": "nature",
      "title": {
        "en": "A story outing and actual forest access are different",
        "zh": "故事出游与真实森林通行的区别"
      },
      "paragraphs": [
        {
          "en": "Woodland Trust’s English walking page discusses planning a real woodland visit, including access and following paths. The French agriculture ministry explains the ONF visitor charter and the coexistence of public access and forest protection. These are real outdoor references, not evidence that three animal portraits classify people. [1] [2]",
          "zh": "Woodland Trust英语步行页介绍真实林地到访安排，包括通行条件与路径；法国农业部门说明ONF访客公约，以及公众进入与森林保护的并存。这是真实户外资料，不证明三种动物画像能给人分类。 [1] [2]"
        },
        {
          "en": "Our page supplies no site conditions, route authorization, weather or emergency assessment. A fictional example cannot replace current local information. The drawings are original decorative symbols, and the guides’ ordinary communication ideas remain optional rather than rules for a real expedition.",
          "zh": "本页不提供现场条件、路线许可、天气或应急评估，虚构例子不能代替当地当前信息。插图是原创装饰符号；指南中的普通沟通点子仍可选，不是实际探险规则。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices, complete ties and all original guide fields",
        "zh": "六次选择、完整并列与全部原指南内容"
      },
      "paragraphs": [
        {
          "en": "Each scene offers jay, beaver and hedgehog once, with different positions. A selection adds one count, the total is six and each lies between zero and six. All maximum counts remain: three-three-zero keeps two portraits, two-two-two keeps three. These are neither sociability ranks nor ability percentages.",
          "zh": "每景各提供松鸦、河狸、刺猬一项，位置不同。所选项加一次，合计六次、各项0至6次。最高全部保留，三、三、零保留两篇，二、二、二保留三篇；不是社交排名或能力百分比。"
        },
        {
          "en": "Start opens the first scene directly, Back edits and Retake clears. All public guides preserve their full summary, example, benefit, tradeoff and optional experiment. Choices resolve in the browser; optional tab drafts last up to twenty-four hours and clear on completion or retake. No real location, animal photo or health history is requested.",
          "zh": "开始直接打开首景，可返回修改，重玩清空。公开指南保留完整概述、例子、用处、取舍与可选尝试。选择在浏览器内解析，可选标签页草稿最长二十四小时，完成或重玩清除；无需真实位置、动物照片或健康经历。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Are these scientific animal personalities?",
        "zh": "这是科学动物人格分类吗？"
      },
      "answer": {
        "en": "No. The three animals are authored metaphors for contributions to a fictional outing.",
        "zh": "不是。三种动物是虚构出游贡献的原创比喻。"
      }
    },
    {
      "question": {
        "en": "Does jay prove navigation skill?",
        "zh": "松鸦证明会认路吗？"
      },
      "answer": {
        "en": "No. It counts discovery choices without testing a real route or navigation task.",
        "zh": "不证明。只统计发现类选择，不测试实际路线或导航任务。"
      }
    },
    {
      "question": {
        "en": "Must beaver organize everything?",
        "zh": "河狸必须组织全部事情吗？"
      },
      "answer": {
        "en": "No. The full guide discusses choosing one responsibility and sharing others.",
        "zh": "不必。完整指南讨论自选一项责任，并分担其他事项。"
      }
    },
    {
      "question": {
        "en": "Does hedgehog dislike group outings?",
        "zh": "刺猬不喜欢集体出游吗？"
      },
      "answer": {
        "en": "No. It makes personal space part of shared participation, without ranking sociability.",
        "zh": "不是。它把个人空间放进共同参与中，不排名社交性。"
      }
    },
    {
      "question": {
        "en": "Can I use it as a real trail guide?",
        "zh": "可以用它作真实林道指南吗？"
      },
      "answer": {
        "en": "No. It provides fictional scenes, not current routes, permissions or site conditions.",
        "zh": "不能。它提供虚构场景，不提供当前路线、许可或现场条件。"
      }
    },
    {
      "question": {
        "en": "Why do I see more than one animal?",
        "zh": "为什么显示不止一种动物？"
      },
      "answer": {
        "en": "All portraits sharing the highest count appear completely; ties are an expected result.",
        "zh": "同为最高次数的画像全部完整显示，并列是正常结果。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.woodlandtrust.org.uk/visiting-woods/things-to-do/walking/",
      "label": {
        "en": "Woodland Trust: real woodland-visit planning (English; outdoor context)",
        "zh": "Woodland Trust：真实林地到访安排（英语；户外背景）"
      }
    },
    {
      "url": "https://agriculture.gouv.fr/quels-sont-les-gestes-citoyens-en-foret",
      "label": {
        "en": "French agriculture ministry: ONF visitor charter (French; outdoor context)",
        "zh": "法国农业部门：ONF访客公约（法语；户外背景）"
      }
    }
  ]
},
  "weekend-pace": {
  "label": {
    "en": "Original leisure-planning scenes · Anchors, openness and space",
    "zh": "原创休闲安排场景 · 锚点、开放与留白"
  },
  "instructions": {
    "en": "Think of an ordinary weekend over which you have some choice. In six supplied scenes, choose a response that fits your circumstances. Work, care, money and access may limit your options. No schedule is created; all highest-count pace portraits are shown completely.",
    "zh": "想一个能部分自主安排的普通周末，在六个给定场景里选择符合自己条件的回应。工作、照顾责任、预算和出行条件都可能限制选择；页面不创建日程，所有最高次数节奏画像完整显示。"
  },
  "sections": [
    {
      "id": "premise",
      "title": {
        "en": "A weekend preference within real constraints",
        "zh": "在现实条件里谈周末偏好"
      },
      "paragraphs": [
        {
          "en": "You choose a reserved part of Saturday, respond to a last-minute invitation, imagine Sunday satisfaction, consider a chore, adapt to changed weather and choose next weekend’s invitation. The scenes compare preferences, not how many hours you truly control or what a good weekend should cost.",
          "zh": "你选择周六预留时段、回应临时邀约、想象周日满足感、考虑家务、应对天气变化，再选下周邀请。场景比较偏好，不统计实际掌控多少小时，也不规定好周末该花多少钱。"
        },
        {
          "en": "A few anchors, an open afternoon and protected space are three original portraits. A person can use all three on one day. Paid work, caring duties, disability, access and finances can change what is possible; fewer options do not indicate a worse pace or weaker planning.",
          "zh": "几个锚点、开放下午与守住留白，是三篇原创画像，同一天可以兼用。工作、照顾责任、残障、可达性与经济条件会改变可能性；选项少不代表节奏更差或规划更弱。"
        }
      ]
    },
    {
      "id": "anchor",
      "title": {
        "en": "A Few Good Anchors: protect the part you chose",
        "zh": "几个锚点：保留主动选择的部分"
      },
      "paragraphs": [
        {
          "en": "An anchor gives the day one anticipated point without filling every hour. The original guide’s market visit is a concrete example. An original smaller alternative is setting aside a short shared reading time at home while leaving the afternoon unassigned.",
          "zh": "锚点给一天一个可期待的点，而不填满每小时。原指南的集市出游是具体例子；一个原创小替代是在家预留短时间共读，让下午暂不安排。"
        },
        {
          "en": "When a plan changes, ask what mattered about it: company, a place, a new activity or something else. A smaller alternative may preserve that purpose, or you may choose to let it go. A higher anchor count does not establish discipline or make a full itinerary necessary.",
          "zh": "安排变化时，可以问其中重要的是什么：陪伴、地点、新活动或其他。小替代也许保留目的，也可以放下本次安排。锚点次数高，不证明自律，也不要求满行程。"
        }
      ]
    },
    {
      "id": "open",
      "title": {
        "en": "Open Afternoon: later decisions still affect others",
        "zh": "开放下午：晚点决定，也会影响同行者"
      },
      "paragraphs": [
        {
          "en": "The open choices respond to an invitation, a new interest or changed conditions. The original guide describes noticing a small exhibition while walking. Openness means a genuine option to say yes or no, not an expectation to accept every more interesting offer.",
          "zh": "开放选项回应邀约、新兴趣或变化条件。原指南举例散步中发现小展览。开放意味着真能答应或拒绝，不是必须接受每个看似更有趣的邀约。"
        },
        {
          "en": "Leaving everything undecided can make shared coordination difficult. A check-in time or a return-time preference can give others enough information without filling the entire day. The count does not measure spontaneity as a stable trait or excuse breaking an existing agreement.",
          "zh": "一切都不决定，也会让共同协调变难。约个确认时间或说明回家时间偏好，可给别人足够信息，而不排满一天。次数不测固定的随性特质，也不为破坏既有约定提供理由。"
        }
      ]
    },
    {
      "id": "space",
      "title": {
        "en": "Protected Breathing Space: an understandable boundary",
        "zh": "被守住的留白：把边界说得懂"
      },
      "paragraphs": [
        {
          "en": "Space options leave some time unclaimed before another invitation becomes an obligation. The original guide allows later deciding to read or see someone. An original request is keeping one interval unbooked and saying when you can confirm the rest.",
          "zh": "留白选项在邀约成为义务之前保留未分配时间。原指南允许晚点再决定读书或见人；一个原创请求是先不约某段时间，并说明何时能确认其他安排。"
        },
        {
          "en": "An unexplained absence can be misunderstood, so the guide encourages a concrete request rather than expecting others to infer it. You do not have to offer another time unless you want to. The portrait does not diagnose social avoidance, burnout or a need to recover.",
          "zh": "没有说明的缺席可能被误解，因此指南鼓励具体请求，而不要求别人猜。只有愿意时才需补另一个时间。画像不诊断社交回避、倦怠或恢复需求。"
        }
      ]
    },
    {
      "id": "tools",
      "title": {
        "en": "Planning tools can enforce hours; this page explores choices",
        "zh": "排程工具设置时段，本页探索选择"
      },
      "paragraphs": [
        {
          "en": "Calendly’s English help describes buffers before or after meetings, while its French help describes recurring or date-specific availability. These are actual scheduling settings in one service, not scientific evidence for three kinds of weekend person. [1] [2]",
          "zh": "Calendly英语帮助说明会议前后缓冲，法语帮助说明重复或指定日期的可用时段。这是同一服务的真实排程设置，不是三类周末人格的科学证据。 [1] [2]"
        },
        {
          "en": "Our page neither connects a calendar nor books, cancels or notifies anyone. The complete guides offer optional language for planning conversations. A result cannot determine how much leisure you have, make an inaccessible activity possible or require another person to match your preferred pace.",
          "zh": "本页不连接日历，不预约、取消或通知任何人。完整指南提供可选的安排沟通用语；结果不能决定你有多少闲暇、使不可达活动成为可能，也不能要求别人匹配你的节奏。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six scenes, all highest pace readings and editable answers",
        "zh": "六个场景、所有最高节奏读法与可修改答案"
      },
      "paragraphs": [
        {
          "en": "Every scene offers anchor, open and space once, with changing option positions. A choice adds one count; the total is six and each count ranges from zero to six. All highest counts remain. Three-three-zero displays two guides; two-two-two displays three. This is not a time-use score or norm-based ranking.",
          "zh": "每题各提供锚点、开放、留白一项，位置会变化。一次选择加一次，总和六次、各项0至6次。所有最高次数保留，三、三、零显示两篇，二、二、二显示三篇；不是时间利用分或常模排名。"
        },
        {
          "en": "Start opens the first scene directly. Back edits, Retake clears, and each public guide retains its complete five fields. Choices resolve in the browser. Optional tab drafts last up to twenty-four hours and clear on completion or retake. No employer, caring history, income or private calendar is requested.",
          "zh": "开始直接进入首景，可返回修改，重玩清空；每篇公开指南保留完整五部分。选择在浏览器内解析，可选标签页草稿最长二十四小时，完成或重玩清除；无需雇主、照顾经历、收入或私人日历。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Is this a productivity score?",
        "zh": "这是生产力评分吗？"
      },
      "answer": {
        "en": "No. The scenes compare leisure preferences without ranking activity completed or time used efficiently.",
        "zh": "不是。场景比较休闲偏好，不排名完成活动多少或时间是否高效。"
      }
    },
    {
      "question": {
        "en": "What if I work on weekends?",
        "zh": "周末需要工作怎么办？"
      },
      "answer": {
        "en": "Use a small interval over which you have some choice. The premise recognizes that responsibilities limit availability.",
        "zh": "可参照能部分自主选择的小段时间；前提承认责任会限制可用时间。"
      }
    },
    {
      "question": {
        "en": "Does space mean disliking friends?",
        "zh": "留白表示不喜欢朋友吗？"
      },
      "answer": {
        "en": "No. It preserves choice about an interval, while allowing later company or another activity.",
        "zh": "不表示。它保留一段时间的选择，也允许之后见人或做其他事。"
      }
    },
    {
      "question": {
        "en": "Will the page book or cancel a plan?",
        "zh": "页面会预约或取消安排吗？"
      },
      "answer": {
        "en": "No. There is no calendar connection, booking request or notification.",
        "zh": "不会。没有日历连接、预约请求或通知。"
      }
    },
    {
      "question": {
        "en": "Can two or three paces be highest?",
        "zh": "两种或三种节奏能同时最高吗？"
      },
      "answer": {
        "en": "Yes. All equal maximum counts retain their complete guides.",
        "zh": "可以。所有相同最高次数保留各自完整指南。"
      }
    },
    {
      "question": {
        "en": "Must I follow the optional experiment?",
        "zh": "必须照做小尝试吗？"
      },
      "answer": {
        "en": "No. A guide is a discussion prompt; the people involved and their real circumstances decide the arrangement.",
        "zh": "不必。指南是讨论提示，实际安排由参与者及真实条件决定。"
      }
    }
  ],
  "references": [
    {
      "url": "https://calendly.com/help/how-to-use-buffers",
      "label": {
        "en": "Calendly: actual before/after buffers (English; related tool)",
        "zh": "Calendly：实际会前会后缓冲（英语；相关工具）"
      }
    },
    {
      "url": "https://calendly.com/fr/help/how-to-set-your-availability",
      "label": {
        "en": "Calendly: actual availability settings (French; the same service)",
        "zh": "Calendly：实际可用时段设置（法语；同一服务）"
      }
    }
  ]
},
  "weather-in-a-bottle": {
  "label": {
    "en": "Original scene-making story · Mist, breeze and a sunbeam",
    "zh": "原创场景创作故事 · 薄雾、微风与日光"
  },
  "instructions": {
    "en": "Imagine an original bottle used as a story prop. Across six scenes, choose how a shape appears, a paper detail moves or a small area catches light. There is no actual weather simulation or hidden-image task. All highest-count weather portraits appear completely.",
    "zh": "想象一只作为故事道具的原创小瓶。六个场景里选择形状怎样出现、纸片细节怎样移动或小处怎样被光照亮。不实际模拟天气，也没有隐藏图形任务；所有最高次数天气画像完整显示。"
  },
  "sections": [
    {
      "id": "premise",
      "title": {
        "en": "A bottle that changes how a scene becomes visible",
        "zh": "一只改变场景显露方式的小瓶"
      },
      "paragraphs": [
        {
          "en": "The opening introduces a slowly appearing shape, a moving ribbon or an illuminated object. Later choices concern a page change, a reader’s question, the bottle’s limit, an ending and its label. You choose among authored descriptions of a scene, rather than draw a bottle or influence the local weather.",
          "zh": "开头分别给出渐显形状、移动丝带或受光物件。随后选择涉及换页、读者提问、小瓶限制、结尾与标签。你在原创场景描述间选择，不实际画瓶子或改变当地天气。"
        },
        {
          "en": "Mist, breeze and sun name three narrative emphases: reveal, transition and focus. One original story could use all three in succession. Their counts describe this round’s choices; the weather is not a hidden code for mood, personality, spirituality or a predicted event.",
          "zh": "薄雾、微风与日光命名三种叙事侧重：显露、转场与聚焦。一个原创故事可以依次用到三者。次数只描述本轮选择，天气不是情绪、人格、灵性或未来事件的隐藏代码。"
        }
      ]
    },
    {
      "id": "mist",
      "title": {
        "en": "Gradually-Clearing Bottle: give a reveal a destination",
        "zh": "渐显小瓶：让逐步显露有具体落点"
      },
      "paragraphs": [
        {
          "en": "The mist options let an already-drawn form arrive in pieces. The original bridge example moves from line to posts to a recognizable path. An original variation is revealing the rim, handle and full outline of a plain cup, without inventing a secret inside it.",
          "zh": "薄雾选项让已经画好的形状分部分到来。原小桥例子从线条到柱子，再到可认的路。一个原创变化是依次显出素杯的口沿、把手和全轮廓，不在其中编造秘密。"
        },
        {
          "en": "A reveal can become frustrating if it withholds too much or never answers the earlier outlines. The guide asks for enough concrete detail by the end. A higher mist count does not imply emotional uncertainty, secrecy or a preference to keep people guessing.",
          "zh": "若藏得太多，或始终不回应早先轮廓，显露会变得令人挫折。指南要求结尾有足够具体细节。薄雾次数高，不表示情绪不确定、隐秘，或喜欢让他人猜。"
        }
      ]
    },
    {
      "id": "breeze",
      "title": {
        "en": "Page-Turning Breeze: connect two places with a small motion",
        "zh": "带动纸页的风：用小移动连接两处"
      },
      "paragraphs": [
        {
          "en": "The breeze moves a light fictional prop, not a character’s decision. A paper leaf can link a windowsill with the next page’s unfinished drawing. What carries over is a recognizable detail, giving the transition continuity without needing an urgent event.",
          "zh": "微风移动轻的虚构道具，不替角色决定。纸叶可以把窗台与下一页未完的画相连；被带过去的是可辨认细节，让转场不靠紧急事件也有连续感。"
        },
        {
          "en": "Movement alone need not provide meaning. The complete guide lets the prop stop so readers can notice what came into view. The count does not measure energy, adaptability, actual airflow or how freely another person should move.",
          "zh": "移动本身未必有意义。完整指南让道具停下，好让读者看见它带出了什么。次数不测精力、适应性或真实气流，也不规定他人应该多自由地移动。"
        }
      ]
    },
    {
      "id": "sun",
      "title": {
        "en": "Ordinary-Thing Sunbeam: one detail can hold attention",
        "zh": "照亮普通物的光：让一个细节被留意"
      },
      "paragraphs": [
        {
          "en": "The sun options briefly select an existing part of a scene. The original cup-handle example makes a notch visible. An original alternative is light passing over a folded card, revealing a crease that was there before; the object’s value and history do not change with the light.",
          "zh": "日光选项短暂挑出场景已有部分。原杯把手例子让缺口可见。一个原创替代是光掠过折卡，显出本来存在的折痕；物件价值与历史不随照明改变。"
        },
        {
          "en": "A bright focus can leave the rest unnoticed. Moving it later acknowledges the wider setting. Sun does not rank as a more positive or healthy result than mist, and the portrait does not identify someone as optimistic or predict a fortunate future.",
          "zh": "亮点也会让其余部分被忽略。之后移动焦点，可承认更大的环境。日光不比薄雾更积极或健康，画像也不判乐观或预测好运。"
        }
      ]
    },
    {
      "id": "context",
      "title": {
        "en": "Setting, illustrated puzzles and this written-choice story",
        "zh": "故事背景、图像谜题与本页文字选择"
      },
      "paragraphs": [
        {
          "en": "Open University’s English course defines setting through a story’s time and place and discusses its significance for reading. This offers a literary context for attending to a scene, rather than a scientific association between weather and personality. We do not reproduce the course’s novel extracts. [1]",
          "zh": "开放大学英语课程从时间和地点定义故事背景，并讨论它对阅读的意义。这为关注场景提供文学背景，不建立天气与人格的科学关联；本站不复制课程里的小说摘录。 [1]"
        },
        {
          "en": "Gorogoa’s French publisher description presents illustrated panels that players arrange to solve puzzles. Our bottle instead compares supplied text choices, without arranging panels or solving those puzzles. Its drawings, weather limits and guides are original, not adaptations of the commercial game. [2]",
          "zh": "Gorogoa法语发行介绍说明，玩家排列插画面板来解谜。本故事比较给定文字选择，不排列面板或解决该游戏谜题；插图、天气限制与指南均原创，不改编商业游戏。 [2]"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices and complete highest-count weather guides",
        "zh": "六次选择与全部最高次数天气指南"
      },
      "paragraphs": [
        {
          "en": "Each scene has one mist, breeze and sun option in varying positions. One choice adds one count; all three sum to six and each ranges from zero to six. Every maximum remains: three-three-zero displays two guides, and two-two-two displays three. Counts are not forecasts, mood percentages or population ranks.",
          "zh": "每题各有薄雾、微风、日光一项，位置会变化。每选一项加一次，合计六次、各项0至6次。最高全部保留，三、三、零显示两篇，二、二、二显示三篇。次数不是预报、情绪百分比或人群排名。"
        },
        {
          "en": "Start enters the first scene directly. Back edits, Retake clears and all five original guide fields remain publicly readable. Choices resolve in the browser; optional tab drafts last up to twenty-four hours and clear on completion or retake. No location, picture upload or personal feelings journal is requested.",
          "zh": "开始直接进入首景，可返回修改，重玩清空；指南原五部分全部公开可读。选择在浏览器内解析，可选标签页草稿最长二十四小时，完成或重玩清除；无需位置、上传图片或私人情绪日记。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Does mist mean I am sad or confused?",
        "zh": "薄雾表示悲伤或困惑吗？"
      },
      "answer": {
        "en": "No. It names a gradual visual reveal in a fictional scene, not your mental state.",
        "zh": "不表示。它命名虚构场景里的渐显方式，不判断心理状态。"
      }
    },
    {
      "question": {
        "en": "Is sun a better result?",
        "zh": "日光是更好的结果吗？"
      },
      "answer": {
        "en": "No. Focus, movement and gradual reveal have equal standing and their own tradeoffs.",
        "zh": "不是。聚焦、移动与渐显同等地位，各有取舍。"
      }
    },
    {
      "question": {
        "en": "Does the bottle actually simulate weather?",
        "zh": "瓶子实际模拟天气吗？"
      },
      "answer": {
        "en": "No. The weather is described in supplied text and original decorative art.",
        "zh": "不模拟。天气由给定文字与原创装饰画呈现。"
      }
    },
    {
      "question": {
        "en": "Can the breeze control a character?",
        "zh": "微风能控制角色吗？"
      },
      "answer": {
        "en": "No. Its authored limit moves light paper props while characters keep their choice.",
        "zh": "不能。原有限制只移动轻纸道具，角色仍自己选择。"
      }
    },
    {
      "question": {
        "en": "What if several weather counts are highest?",
        "zh": "多种天气次数最高怎么办？"
      },
      "answer": {
        "en": "Every tied guide appears in full, without a random winner or position-based tie break.",
        "zh": "每篇并列指南完整显示，不随机或按位置破同分。"
      }
    },
    {
      "question": {
        "en": "Are the optional exercises required?",
        "zh": "必须做可选练习吗？"
      },
      "answer": {
        "en": "No. You may read every guide without drawing, writing or sharing anything.",
        "zh": "不必。无需绘画、写作或分享，也可阅读所有指南。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.open.edu/openlearn/history-the-arts/literature/approaching-prose-fiction/content-section-2.4",
      "label": {
        "en": "Open University: setting in fiction (English; literary context)",
        "zh": "开放大学：小说中的背景（英语；文学语境）"
      }
    },
    {
      "url": "https://store.steampowered.com/app/557600/Gorogoa/?l=french",
      "label": {
        "en": "Gorogoa: illustrated puzzle interaction (French; related game)",
        "zh": "Gorogoa：图像谜题互动（法语；相关游戏）"
      }
    }
  ]
},
  "tiny-treat": {
  "label": {
    "en": "Original ordinary-finish story · No purchase or earned-rest rule",
    "zh": "原创普通收尾故事 · 无需购买或先赚得休息"
  },
  "instructions": {
    "en": "Imagine a small recreational project reaching a stopping point. Across six scenes, choose a pleasant moment, a small visible symbol or a little unassigned time. No real task must be completed first. The round displays every highest-count portrait and its full reading.",
    "zh": "想象小型休闲作品告一段落。六个场景里选择愉快片刻、可见小符号或暂不安排的时间。不必先完成真实任务；本轮显示所有最高次数画像与完整读法。"
  },
  "sections": [
    {
      "id": "premise",
      "title": {
        "en": "A modest finish can have its own small marker",
        "zh": "普通结束，也可以有自己的小标记"
      },
      "paragraphs": [
        {
          "en": "The paper project is finished. You consider a small celebration, describe it to a friend, adapt when an idea is unavailable, imagine what you may appreciate tomorrow and choose a closing phrase. The scenes concern this particular ending, not how much work earns an acceptable reward.",
          "zh": "纸作完成后，你考虑小庆祝、向朋友描述、在原想法做不了时调整、想象明天可能欣赏什么，再选收尾句。场景关注这一次结束，不计算做多少事才配获得奖励。"
        },
        {
          "en": "A pleasant minute, a tiny done-symbol and an open next moment are three original emphases. They can overlap: mark a card, enjoy a view and leave the next activity undecided. None is a requirement for rest, and no result asks you to spend money or make the ending impressive.",
          "zh": "愉快一分钟、完成小符号与开放下一刻，是三种原创侧重。它们可以重叠：标记卡片、看看风景，再不急着选下一事。任何一种都不是休息条件，结果不要求花钱或把结束办得精彩。"
        }
      ]
    },
    {
      "id": "moment",
      "title": {
        "en": "Pleasant-Minute Marker: notice something already available",
        "zh": "愉快片刻：留意已经在身边的东西"
      },
      "paragraphs": [
        {
          "en": "The moment choices focus on a sound, view, color or other ordinary detail. The original guide offers looking out of a window or listening to an already-enjoyed song. An original alternative is simply noticing the light on the completed paper, without recording or sharing it.",
          "zh": "片刻选项关注声音、景色、颜色或其他普通细节。原指南举例看窗外、听本来喜欢的歌；一个原创替代是留意成品纸上的光，不记录也不分享。"
        },
        {
          "en": "A minute may pass without becoming memorable. Trying to make every pause special can turn it into another assignment. Counts do not measure happiness, sensory sensitivity or how much benefit you received; a particular sound or view need not suit everyone.",
          "zh": "一分钟可以过去，而不变成难忘回忆。努力让每次停顿都特别，也会变成另一项任务。次数不测幸福、感官敏感或所得益处，某种声音或景色也不必适合所有人。"
        }
      ]
    },
    {
      "id": "token",
      "title": {
        "en": "Little-Done Symbol: a trace that may stay temporary",
        "zh": "完成小符号：可以暂时留下的痕迹"
      },
      "paragraphs": [
        {
          "en": "A small date or drawn mark gives one recreational piece a recognizable ending. It can remain on the back rather than becoming a public achievement. An original example is a pencil dot beside a paper model’s last fold, used only if its maker enjoys having it there.",
          "zh": "小日期或画出的标记，让一件休闲作品有可辨认的结束。它可以留在背面，不变公开成就。一个原创例子是在纸模型最后一道折痕旁点个铅笔点，只在作者觉得有趣时保留。"
        },
        {
          "en": "A mark can be erased or discarded without undoing the completed activity. Collecting every token may create its own management work. This portrait is not a productivity record, a streak score or a measure of how much recognition you need from others.",
          "zh": "记号可擦掉或丢弃，不会抹去已经完成的活动。每个符号都收藏，也可能增加管理工作。画像不是效率记录、连续打卡分，也不测你多么需要他人认可。"
        }
      ]
    },
    {
      "id": "time",
      "title": {
        "en": "Unassigned-Next-Minute: an ending need not issue a new task",
        "zh": "下一分钟暂不安排：结束不必立刻发新任务"
      },
      "paragraphs": [
        {
          "en": "The time options leave a short interval undecided. The original guide allows later choosing to chat, stretch, browse or stay where you are. An open moment is permission to decide later, not an instruction to perform stillness or avoid every activity.",
          "zh": "时间选项让短间隙暂不决定。原指南允许稍后选择聊天、伸展、看看别的或原处待着。开放片刻是允许晚点决定，不是要求正确静止或回避所有活动。"
        },
        {
          "en": "Open time will not always feel enjoyable. Choosing a particular next activity remains compatible with the portrait. The count does not indicate laziness, burnout, recovery capacity or a medical need; this page has not assessed any of those things.",
          "zh": "空闲未必总愉快，主动选择下一项活动仍与画像兼容。次数不表示懒惰、倦怠、恢复能力或医疗需要，页面没有评估这些事项。"
        }
      ]
    },
    {
      "id": "related",
      "title": {
        "en": "A completion-marker story and a goal-tracking app differ",
        "zh": "收尾标记故事与目标记录应用的区别"
      },
      "paragraphs": [
        {
          "en": "Finch’s official English help page describes creating goals, marking them complete and receiving in-app Energy or Rainbow Stones. This is a concrete app interaction, not evidence for the three portraits here. We do not award currency, keep a habit streak or check whether you completed a real-world goal. [1]",
          "zh": "Finch官方英语帮助页说明创建目标、标记完成与获得应用内能量或彩虹石，这是具体应用互动，不是本站三种画像的证据。本页不发货币、不记习惯连续天数，也不检查是否完成现实目标。 [1]"
        },
        {
          "en": "Our scenes offer a recreational choice about one stopping point. They do not apply a behavioral intervention or test whether a treat builds a habit. The guide’s optional ideas can be declined, changed or used after an ordinary pause, without making enjoyment conditional on achievement.",
          "zh": "本站场景对一个停点提供趣味选择，不实施行为干预，也不测试小庆祝能否养成习惯。指南的可选点子可以拒绝、修改，或放在普通暂停之后，不把享受与成就绑定。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices, full ties and a round without a task list",
        "zh": "六次选择、完整并列，不创建任务表"
      },
      "paragraphs": [
        {
          "en": "Each scene offers moment, token and time once, with positions changing. Selecting one adds one count. The three counts total six, each from zero to six. All maxima remain: three-three-zero gives two readings, two-two-two gives all three. Raw counts are not reward-need percentages or population norms.",
          "zh": "每题各提供一次片刻、符号、时间，位置会变化。所选项加一次，三项总计六次、各项0至6次。最高全部保留：三、三、零显示两篇，二、二、二显示三篇。原始次数不是奖励需求百分比或人群常模。"
        },
        {
          "en": "Start enters the first scene directly. Back edits, Retake clears and all five fields of every public guide remain freely readable. Choices resolve in the browser; optional tab saving lasts up to twenty-four hours and clears on completion or retake. No task proof, spending record, calendar or health information is requested.",
          "zh": "开始直接进入首景，可返回修改，重玩清空；每篇公开指南的五部分始终免费可读。选择在浏览器内解析，可选标签页保存最长二十四小时，完成或重玩清除；无需任务证明、消费记录、日历或健康资料。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Do I have to earn a break?",
        "zh": "必须先赚得休息吗？"
      },
      "answer": {
        "en": "No. Rest and ordinary enjoyment are not conditional on performance; the scenes only imagine marking a small finish.",
        "zh": "不必。休息与普通享受不取决于表现，场景只想象怎样标记小结束。"
      }
    },
    {
      "question": {
        "en": "Does treat mean buying something?",
        "zh": "犒赏就是购买东西吗？"
      },
      "answer": {
        "en": "No. All three emphases can use what is already available, and nothing needs to be bought.",
        "zh": "不是。三种侧重都可使用已有条件，无需购买。"
      }
    },
    {
      "question": {
        "en": "Does a token have to be kept forever?",
        "zh": "小记号必须永久留着吗？"
      },
      "answer": {
        "en": "No. The guide permits temporary marks and discarding a token without erasing the finished activity.",
        "zh": "不必。指南允许临时标记，丢掉符号不会抹去完成。"
      }
    },
    {
      "question": {
        "en": "Must I do nothing during open time?",
        "zh": "开放时间必须什么都不做吗？"
      },
      "answer": {
        "en": "No. You may choose the next activity when you want; the portrait does not prescribe stillness.",
        "zh": "不必。愿意时可以选下一活动，画像不规定静止。"
      }
    },
    {
      "question": {
        "en": "Does the result test my mood or habits?",
        "zh": "结果测试情绪或习惯吗？"
      },
      "answer": {
        "en": "No. It counts supplied fictional preferences without tracking mood, behavior change or recovery.",
        "zh": "不测试。只统计给定虚构偏好，不追踪情绪、行为改变或恢复。"
      }
    },
    {
      "question": {
        "en": "What if all three counts match?",
        "zh": "三项相同怎么办？"
      },
      "answer": {
        "en": "Two-two-two retains all three complete guides. There is no forced winner or payment step.",
        "zh": "二、二、二保留全部三篇完整指南，不强分胜者，也不增加支付步骤。"
      }
    }
  ],
  "references": [
    {
      "url": "https://help.finchcare.com/hc/en-us/articles/37779940291213-Creating-and-Completing-Goals",
      "label": {
        "en": "Finch: actual goal-completion interaction (English; a different product)",
        "zh": "Finch：真实目标完成互动（英语；不同产品）"
      }
    }
  ]
},
  "tiny-superpower": {
  "label": {
    "en": "Original limited powers · Words, pauses and outlines",
    "zh": "原创有限微能力 · 词语、停顿与勾边"
  },
  "instructions": {
    "en": "Choose among three original powers across six fictional scenes. They can clarify one label, offer a voluntary pause or outline an existing drawn edge. You do not perform a language or visual task. Every power sharing the highest raw count appears with its complete guide.",
    "zh": "在六个虚构场景中选择三种原创微能力：澄清一个标签、提供自愿停顿、勾出已有画面边缘。不实际进行语言或视觉任务；所有同为最高原始次数的能力及完整指南都会显示。"
  },
  "sections": [
    {
      "id": "premise",
      "title": {
        "en": "A small fictional power with a deliberate limit",
        "zh": "刻意留有边界的原创小能力"
      },
      "paragraphs": [
        {
          "en": "You first choose a tiny power, then use it in a confusing paper exhibition, name its limit, consider a creative task, respect another character’s refusal and choose a motto. These scenes ask what kind of small change you prefer. They contain no hidden image to solve, timed challenge or correct-answer key.",
          "zh": "你先选微能力，再处理难懂纸展、说明限制、考虑创作任务、面对另一角色拒绝，最后选口号。问题问你喜欢哪种小变化，没有隐藏图谜、限时挑战或正确答案键。"
        },
        {
          "en": "The powers are authored here rather than assigned from a licensed character universe. Word, pause and edge are creative possibilities with equal standing. Their limits keep another character free to continue without accepting your suggestion; no count grants control over someone.",
          "zh": "能力由本站原创，不从授权角色世界分配。词语、停顿、边缘是同等地位的创意可能。限制让另一角色能够不接受建议、照常继续；次数不会赋予控制别人的权力。"
        }
      ]
    },
    {
      "id": "word",
      "title": {
        "en": "One-Plain-Word Power: make a phrase more specific",
        "zh": "普通词微能力：让一句话更具体"
      },
      "paragraphs": [
        {
          "en": "The word option offers one clarification, such as naming the shelf in an invented “put it there” label. Another original comparison is adding “paper” to a fictional materials note. Both change a small instruction without revealing what a character secretly intends.",
          "zh": "词语选项提供一次澄清，例如给虚构的“放那儿”标签补上“架子”。另一个原创对照是为虚构材料便条加“纸质”。它们改变小指引，不揭示角色暗中真正想什么。"
        },
        {
          "en": "A clearer suggestion can still be wrong for the author’s purpose. The writer may keep the original wording or choose a different term. A high word count is not a vocabulary grade, communication-skill measure or evidence of mind-reading.",
          "zh": "更清楚的建议仍可能不符作者目的。作者可以保留原句或选其他词。词语次数高，不是词汇成绩、沟通能力测量，也不证明读心。"
        }
      ]
    },
    {
      "id": "pause",
      "title": {
        "en": "Optional-Little-Pause Power: leave the next step voluntary",
        "zh": "可选停顿微能力：下一步仍由角色选择"
      },
      "paragraphs": [
        {
          "en": "This power leaves an available stopping place inside a continuing scene. In the original paper-parade example, one character may stop to look while others continue. An original variation is a small viewing space beside a paper exhibition, usable without turning the whole scene off.",
          "zh": "这个能力在继续进行的场景里留下可用停点。原纸游行例子中，一个角色可以停看，其他角色继续。一个原创变化是在纸展旁留小观看区，可使用，但不关闭整个场景。"
        },
        {
          "en": "A pause may interrupt rather than help. Skipping it is a valid response, and the power cannot stop time or require stillness. The guide offers a writing possibility, not a relaxation treatment, attention assessment or promise that a serious difficulty will resolve.",
          "zh": "停顿也可能打断而非帮助；跳过同样有效，能力不能停止时间或要求静止。指南提供写作可能，不是放松治疗、注意力评估，也不承诺解决严肃困难。"
        }
      ]
    },
    {
      "id": "edge",
      "title": {
        "en": "Already-There Outline Power: notice one drawn connection",
        "zh": "原有边缘微能力：留意一个画中连接"
      },
      "paragraphs": [
        {
          "en": "The edge options reveal only a detail already present in the invented drawing. A light outline can distinguish an overlapping tab from the sheet behind it. The original guide then asks what became clearer and what stayed unchanged, rather than inventing a hidden truth outside the picture.",
          "zh": "边缘选项只显出虚构画中已经存在的细节。轻勾边可以区分叠放标签与后面的纸；原指南随后问什么更清楚、什么没有变化，而非发明画外的隐藏真相。"
        },
        {
          "en": "Highlighting one boundary can pull attention away from other parts. A viewer may remove the cue and return to the whole picture. Counts do not establish eyesight, observation ability, intelligence or a real visual-accessibility solution.",
          "zh": "突出一条边界也会把注意从其他部分移开。观者可撤掉提示、重看全图。次数不证明视力、观察能力、智力，也不提供真实视觉无障碍解决方案。"
        }
      ]
    },
    {
      "id": "related",
      "title": {
        "en": "Perspective-based play is related, but the mechanism differs",
        "zh": "视角玩法有相邻创意，机制仍不相同"
      },
      "paragraphs": [
        {
          "en": "Pillow Castle’s developer article explains how Superliminal uses perspective to manipulate objects inside a playable puzzle world. Its French publisher description identifies a first-person optical-illusion puzzle. These describe one game in two language contexts, not two independent competitors or evidence for our three powers. [1] [2]",
          "zh": "Pillow Castle开发者文章解释Superliminal怎样借视角操控可玩谜题世界里的物件；法语发行介绍将其描述为第一人称视觉错觉解谜。这是一款游戏的两种语言材料，不是两家独立竞品，也不证明本站三种能力。 [1] [2]"
        },
        {
          "en": "Our page presents written choices without optical tricks, object manipulation or puzzle correctness. The original drawings and powers do not copy that game’s scenes or mechanics. No result indicates a real supernatural power, creativity level or capacity to influence another person.",
          "zh": "本页提供文字选择，没有视觉错觉、物件操控或谜题对错。原创插图与能力不复制该游戏场景或机制；结果不表示真实超能力、创造力等级或影响他人的本领。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six preferences, all highest powers and complete limits",
        "zh": "六次偏好、所有最高能力与完整限制"
      },
      "paragraphs": [
        {
          "en": "Each selected option adds one to word, pause or edge; each is offered once per scene. Counts total six, and each ranges from zero to six. Positions change. All maximum counts remain, so three-three-zero gives two guides and two-two-two gives three. A lower count is simply a less-selected authored option family.",
          "zh": "所选项给词语、停顿或边缘加一次，每个场景各提供一次三种选择。总和六次、各项0至6次，位置会变化。最高全部保留，三、三、零显示两篇，二、二、二显示三篇；低次数只是相对少选某类原创选项。"
        },
        {
          "en": "Start enters the first scene without another agreement step. Back edits and Retake clears the round. Public guides retain all five original fields, including limits and optional creative exercises. Choices resolve in the browser; optional tab saving lasts up to twenty-four hours and clears on completion or retake. No real image, private message or personal ability record is requested.",
          "zh": "开始不经额外同意直接进入首景，可返回修改，重玩清空本轮。公开指南保留原五部分，包括限制与可选创作练习。选择在浏览器内解析，可选标签页保存最长二十四小时，完成或重玩清除；无需真实图片、私人消息或个人能力记录。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Is there a correct superpower?",
        "zh": "存在正确的微能力吗？"
      },
      "answer": {
        "en": "No. The three powers are equal authored choices, not correct and incorrect answers.",
        "zh": "没有。三种能力是同等的原创选择，不按对错评分。"
      }
    },
    {
      "question": {
        "en": "Does word mean mind-reading?",
        "zh": "补词代表读心吗？"
      },
      "answer": {
        "en": "No. It offers a possible clarification that the fictional author can decline.",
        "zh": "不代表。只提供虚构作者可拒绝的一种澄清。"
      }
    },
    {
      "question": {
        "en": "Can pause stop time or another character?",
        "zh": "停顿能停时间或阻止角色吗？"
      },
      "answer": {
        "en": "No. The stopping point is optional, and the rest of the scene can continue.",
        "zh": "不能。停点可选，其他场景可以继续。"
      }
    },
    {
      "question": {
        "en": "Am I solving hidden visual puzzles?",
        "zh": "这是寻找隐藏图形吗？"
      },
      "answer": {
        "en": "No. The edge is described in text; this page does not test detection or visual skill.",
        "zh": "不是。边缘由文字描述，页面不测试发现细节或视觉技能。"
      }
    },
    {
      "question": {
        "en": "Why can several powers appear?",
        "zh": "为什么显示多种能力？"
      },
      "answer": {
        "en": "All families tied for the highest raw count remain, with complete guides for each.",
        "zh": "同为最高原始次数的各类均保留，并分别提供完整指南。"
      }
    },
    {
      "question": {
        "en": "Can I read the limits without completing a round?",
        "zh": "不作答能读能力限制吗？"
      },
      "answer": {
        "en": "Yes. All three complete public guides are available before or after play.",
        "zh": "可以。作答前后都可读三篇完整公开指南。"
      }
    }
  ],
  "references": [
    {
      "url": "https://blog.playstation.com/2020/06/30/breaking-down-the-tech-behind-superliminals-mind-bending-illusions/",
      "label": {
        "en": "Pillow Castle developer: Superliminal’s actual perspective mechanic (English)",
        "zh": "Pillow Castle开发者：Superliminal真实视角机制（英语）"
      }
    },
    {
      "url": "https://store.steampowered.com/app/1049410/Superliminal/?l=french",
      "label": {
        "en": "Superliminal: publisher description (French; the same related game)",
        "zh": "Superliminal：发行介绍（法语；同一相关游戏）"
      }
    }
  ]
},
  "tiny-kingdom": {
  "label": {
    "en": "Original shoebox community · Three complete design portraits",
    "zh": "原创鞋盒社群 · 三篇完整设计画像"
  },
  "instructions": {
    "en": "Imagine a shoebox kingdom populated by paper figures. Choose one response in each of six scenes about buildings, materials, a model bridge and festival plans. The story counts your choices; it does not simulate a working city. All highest-count portraits appear in full.",
    "zh": "想象一个纸片居民组成的鞋盒王国。六个场景里分别选择建筑、材料、小桥模型与节庆安排的回应。故事统计选择，不模拟真实城市运转；全部最高次数画像完整显示。"
  },
  "sections": [
    {
      "id": "premise",
      "title": {
        "en": "A kingdom small enough to be a design story",
        "zh": "小到可以一起想象的设计王国"
      },
      "paragraphs": [
        {
          "en": "The first public building sets a theme. A ribbon shortage, a proposed moving bridge, changing plans, a favorite tradition and a visitor’s impression then invite different priorities. Each scene is already written: you select an approach rather than placing buildings, balancing a budget or governing simulated citizens.",
          "zh": "第一座公共建筑确定开头主题。丝带不足、移动小桥、反复修改的安排、喜欢的惯例与来客印象，随后带来不同侧重。每个场景都已写好，你选择做法，而非摆建筑、平衡预算或治理模拟居民。"
        },
        {
          "en": "The three kingdoms concern voluntary exchange, a small purposeful trial and a usable record of current agreements. They are compatible ideas. An original miniature festival could exchange spare card, test one stall layout and write down the arrangement everyone accepted.",
          "zh": "三个王国分别讨论自愿交换、有目的的小尝试，以及好用的当前约定记录。它们可以兼容。原创微型节庆可以交换余下卡纸、试一个摊位布局，再记下大家认可的安排。"
        }
      ]
    },
    {
      "id": "exchange",
      "title": {
        "en": "Button Exchange Kingdom: a match needs two willing sides",
        "zh": "纽扣交换王国：有用的连接需要双方愿意"
      },
      "paragraphs": [
        {
          "en": "The exchange options look for how one person’s surplus could meet another’s actual need. The original guide’s paper baker and ribbon example makes that connection visible. A spare piece is an offer, not a debt someone else must repay or a reason to assume everything has the same value.",
          "zh": "交换选项寻找，一个人的剩余怎样符合另一个人的实际需要。原指南中纸片面包师与丝带的例子，让连接看得见。余下零件是提议，不是别人必须偿还的人情，也不代表所有东西价值相同。"
        },
        {
          "en": "A useful object may find no match. People can decline, and a swap can still be unfair. Read the complete tradeoff before trying an ordinary low-stakes exchange. The count does not establish negotiation skill, generosity or how well a real economy would work.",
          "zh": "有用的物件也可能找不到匹配。参与者可以拒绝，交换仍可能不公平。尝试日常小交换前，可先读完取舍；次数不证明谈判能力、慷慨程度，也不预测真实经济怎样运行。"
        }
      ]
    },
    {
      "id": "experiment",
      "title": {
        "en": "Unfinished Workshop Kingdom: one trial and a stopping point",
        "zh": "未完成工坊王国：给尝试一个问题和停点"
      },
      "paragraphs": [
        {
          "en": "A moving bridge can begin as folded cards on a table. In the story, a small model makes an idea discussable before a larger commitment. An original extension is trying where a paper stall stands, then asking whether it leaves enough space for the other figures.",
          "zh": "移动桥可以先从桌上几张折卡开始。故事里的小模型让想法在大量投入前变得可讨论。一个原创延伸是试摆纸摊位，再问是否为其他纸人留下足够空间。"
        },
        {
          "en": "Repeated trials can become tiring when nothing is concluded or shared. The complete guide asks for a review point as well as permission to start. The portrait is not an innovation score or a construction-safety test, and a paper model does not establish that a real bridge works.",
          "zh": "不断尝试却不收尾、不说明发现了什么，也会让人疲倦。完整指南既留开始许可，也要求回看节点。画像不是创新分或结构安全测试，纸模型不证明真实桥梁可用。"
        }
      ]
    },
    {
      "id": "promise",
      "title": {
        "en": "Lantern Archive Kingdom: keep the current agreement usable",
        "zh": "灯下档案王国：让当前约定真正可用"
      },
      "paragraphs": [
        {
          "en": "The archive favors a short shared memory: what was agreed, what changed and the next step. Replacing conflicting festival notices with a recognizable current note is an original practical use of this idea. More pages are not automatically more clarity.",
          "zh": "档案侧重简短的共同记忆：答应了什么、改了什么、下一步是什么。把互相矛盾的节庆告示换成一份可辨认的当前说明，是这个想法的原创实际用法。页数更多，不自动等于更清楚。"
        },
        {
          "en": "A note can be unrealistic, outdated or unlike what the participants thought they agreed. Invite corrections rather than making the document outrank the situation. A high archive count does not measure reliability or moral worth; the guide values honest revision too.",
          "zh": "记录也可能不现实、过时，或不同于参与者理解的约定。可邀请更正，不让文件凌驾实际情境。档案次数高，不测可靠性或道德价值；原指南同样重视诚实调整。"
        }
      ]
    },
    {
      "id": "related",
      "title": {
        "en": "Miniature making and building games use different interactions",
        "zh": "微型制作与建造游戏有不同互动"
      },
      "paragraphs": [
        {
          "en": "The Cambridge Museums activity introduces a miniature room made in a small box. It provides a physical-making context for the miniature premise; our story requires no materials or finished model. Its activity is not validation of the three kingdom portraits. [1]",
          "zh": "剑桥博物馆活动介绍在小盒里制作微型房间，为微缩前提提供实体创作背景。本故事无需材料或完成模型；那项活动并不验证三个王国画像。 [1]"
        },
        {
          "en": "Townscaper’s French publisher page describes placing building blocks that turn into towns. Here you select supplied decisions rather than manipulate a building editor. No game engine, artwork or building rules are imported, and the portraits do not measure political views or leadership. [2]",
          "zh": "Townscaper法语发行页介绍放置建筑块、形成城镇的玩法。本页选择给定决定，不操作建筑编辑器；没有引入其引擎、素材或建造规则，画像也不测政治观点或领导力。 [2]"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices, all highest kingdoms and five-part readings",
        "zh": "六次选择、所有最高王国与五部分读法"
      },
      "paragraphs": [
        {
          "en": "Each scene contains one exchange, experiment and promise option, in changing positions. The selected family gains one count. All counts sum to six and each ranges from zero to six. Every highest count remains: three-three-zero shows two kingdoms, and two-two-two shows three. Counts are not percentages or a ranking against other players.",
          "zh": "每题为交换、试验、承诺各提供一项，位置会变化。选中哪类就加一次，合计六次、各项0至6次。所有最高保留：三、三、零显示两个王国，二、二、二显示三个。次数不是百分比或与其他玩家比较的排名。"
        },
        {
          "en": "Start opens the first scene directly, Back edits a choice and Retake clears the round. Public guides retain the full summary, example, benefit, tradeoff and optional experiment. Choices resolve in your browser; optional tab drafts last up to twenty-four hours and clear on completion or retake. There is no real community data to upload.",
          "zh": "开始直接进入首个场景，可返回改选，重玩清空本轮。公开指南保留完整概述、例子、用处、取舍与可选尝试。选择在浏览器内解析，可选标签页草稿最长二十四小时，完成或重玩清除；无需上传真实社群资料。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Am I building an interactive city?",
        "zh": "我在操作建城游戏吗？"
      },
      "answer": {
        "en": "You choose written responses in six fixed scenes. No blocks, resources or citizens are simulated.",
        "zh": "你在六个固定场景中选择文字回应，不模拟建筑块、资源或居民。"
      }
    },
    {
      "question": {
        "en": "Does a kingdom describe my politics?",
        "zh": "王国说明政治立场吗？"
      },
      "answer": {
        "en": "No. Exchanges, trials and records are authored miniature design themes, not a political survey.",
        "zh": "不说明。交换、试验与记录是原创微型设计主题，不是政治调查。"
      }
    },
    {
      "question": {
        "en": "Is the archive kingdom a reliability score?",
        "zh": "档案王国是可靠性分数吗？"
      },
      "answer": {
        "en": "No. It counts record-and-agreement choices and keeps the original guide’s need for honest revision.",
        "zh": "不是。只统计记录与约定类选择，并保留原指南关于诚实调整的说明。"
      }
    },
    {
      "question": {
        "en": "Is every exchange fair?",
        "zh": "交换都公平吗？"
      },
      "answer": {
        "en": "No. The full exchange guide says a match may fail and people need room to decline.",
        "zh": "不是。完整交换指南说明，匹配可能不成立，也要给参与者拒绝空间。"
      }
    },
    {
      "question": {
        "en": "How are ties shown?",
        "zh": "并列怎样显示？"
      },
      "answer": {
        "en": "Every highest-count kingdom appears completely. No random winner replaces an equal count.",
        "zh": "每个最高次数王国完整显示，不随机替并列挑胜者。"
      }
    },
    {
      "question": {
        "en": "Do I need to make or buy a model?",
        "zh": "需要做模型或购买材料吗？"
      },
      "answer": {
        "en": "No. All choices and complete guides work from the supplied fictional text.",
        "zh": "不需要。给定虚构文字即可完成选择和阅读完整指南。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.museums.cam.ac.uk/school-sessions/explore-and-create-make-miniature-room",
      "label": {
        "en": "Cambridge Museums: miniature-room making (English; related activity)",
        "zh": "剑桥博物馆：微型房间制作（英语；相关活动）"
      }
    },
    {
      "url": "https://store.steampowered.com/app/1291340/Townscaper/?l=french",
      "label": {
        "en": "Townscaper: actual building interaction (French; related game)",
        "zh": "Townscaper：实际建造互动（法语；相关游戏）"
      }
    }
  ]
},
  "time-capsule": {
  "label": {
    "en": "Original imaginary capsule · Scenes, questions and little methods",
    "zh": "原创想象胶囊 · 场景、问题与小方法"
  },
  "instructions": {
    "en": "Imagine choosing harmless written keepsakes for a fictional future reader. Answer six supplied choices about a present scene, an open question or a small optional method. Nothing is written to a recipient or scheduled for delivery; all highest-count guides are shown completely.",
    "zh": "想象为虚构未来读者选择无害文字留念。六个给定选择分别涉及当下场景、开放问题或可选小方法，不向收件人写信、不定时投递；所有最高次数指南完整显示。"
  },
  "sections": [
    {
      "id": "premise",
      "title": {
        "en": "An ordinary day, without a promise to the future",
        "zh": "留住普通一天，不替未来许诺"
      },
      "paragraphs": [
        {
          "en": "The capsule begins with a first page. You then clarify a vague note, consider changed tastes, choose a last line, decide what should remain and imagine when the capsule feels complete. These are six written decisions, not a free-text archive or a service that stores your chosen keepsakes.",
          "zh": "胶囊从第一页开始，随后澄清模糊便条、考虑口味变化、选择末句、决定保留什么，再想象怎样才算完整。这是六次文字决定，不是自由输入的档案，也不储存你挑选的留念物。"
        },
        {
          "en": "The three portraits distinguish a particular scene, a question whose answer can change and a method a reader may use or ignore. An original capsule could contain all three. The format asks which supplied line you prefer, not whether you have planned your future well or preserved an important life event.",
          "zh": "三篇画像区分具体场景、答案可变化的问题，以及读者可采用或忽略的方法。原创胶囊可以三者都有；格式只问更喜欢哪句给定文字，不评未来规划，也不要求保存重大人生事件。"
        }
      ]
    },
    {
      "id": "scene",
      "title": {
        "en": "Ordinary-Scene Capsule: a fragment with its context",
        "zh": "普通场景胶囊：保留有背景的片段"
      },
      "paragraphs": [
        {
          "en": "A scene can be modest and precise: an invented paper envelope, a bicycle bell and an unfinished drawing. Such details offer a reader something to imagine without telling them which emotion they must feel. They are creative examples, not an autobiographical record the page has verified.",
          "zh": "场景可以小而具体：虚构的纸信封、车铃与未完的画。这些细节给读者想象之物，不规定必须有哪种情绪；它们是创作例子，不是页面核实过的自传记录。"
        },
        {
          "en": "A vivid fragment still leaves things out. The complete guide asks you not to present it as an entire person or historical period. A higher scene count does not establish memory accuracy, mindfulness or an unusually strong attachment to the past.",
          "zh": "生动片段仍会有所遗漏。完整指南提醒，不把它当作一个人或历史时期的全部。场景次数较高，不证明记忆准确、正念水平，也不表示特别依恋过去。"
        }
      ]
    },
    {
      "id": "question",
      "title": {
        "en": "Still-Open Question Capsule: an invitation without an answer key",
        "zh": "开放问题胶囊：没有标准答案的邀请"
      },
      "paragraphs": [
        {
          "en": "This portrait leaves room for a future reader to answer differently, change the question or leave it unanswered. An original prompt might ask which ordinary object they would draw then, without requiring them to keep liking today’s object. The invitation survives because agreement is optional.",
          "zh": "这篇画像让未来读者可以不同回答、改问题或不回答。一个原创提问可以问，那时想画哪件普通物品，而不要求继续喜欢今天这件。邀请得以保留，是因为同意并非义务。"
        },
        {
          "en": "Even gentle wording can carry an expected answer. Read whether the note permits genuine difference rather than disguising a future goal as a question. Counts do not measure curiosity, openness as a personality trait or how the reader will actually change.",
          "zh": "温和措辞也可能暗藏预期答案。可检查便条是否真容许差异，而非把未来目标伪装成提问。次数不测好奇心、人格开放性，也不预测读者实际会怎样变化。"
        }
      ]
    },
    {
      "id": "method",
      "title": {
        "en": "Little-Return Method Capsule: something usable and changeable",
        "zh": "小方法胶囊：可使用，也可修改"
      },
      "paragraphs": [
        {
          "en": "A small instruction names its purpose and enough steps to be understood later. The original guide’s harmless paper arrangement is one example. An imagined reader can adapt a step without having to reproduce the original room, feeling or tastes. Nothing on this page runs the activity for them.",
          "zh": "小指引写清用途与足够步骤，让以后仍看得懂。原指南中的无害纸布置是一个例子。想象读者可以改一步，不必重建原房间、感受或口味；页面也不会替他们执行活动。"
        },
        {
          "en": "Instructions can lose context over time. A limited purpose helps the reader decide whether to try them, while permission to ignore them avoids turning a keepsake into a task list. A high method count is not a measure of conscientiousness, productivity or teaching ability.",
          "zh": "指引会随时间失去背景。写明有限用途，方便读者决定是否尝试；允许忽略，避免把留念变成任务表。方法次数高，不测尽责性、生产力或教学能力。"
        }
      ]
    },
    {
      "id": "services",
      "title": {
        "en": "Real future-letter services and physical workshops are separate",
        "zh": "与真实未来信件服务、实体工坊的区别"
      },
      "paragraphs": [
        {
          "en": "FutureMe’s English entry offers a letter field, delivery timing and a recipient email. This page instead supplies fictional choices and never sends a future message. Its browser draft, if you save one, is not a scheduled letter or a long-term archive. [1]",
          "zh": "FutureMe英语入口提供信件输入、投递时间与收件邮箱。本页提供虚构选择，不发送未来信息；即使主动保存浏览器草稿，也不是定时信件或长期档案。 [1]"
        },
        {
          "en": "Cap Sciences’ French capsule workshop describes selecting a theme and making sound, photo, written and object contributions. That is a facilitated physical activity. Our story asks for none of those submissions and does not inherit its team-building or creativity objectives as tested outcomes. [2]",
          "zh": "Cap Sciences法语胶囊工坊介绍选主题，并制作声音、照片、文字与物件内容，那是有主持的实体活动。本故事不收集这些提交，也不把其团队或创意目标当成本站经验证的效果。 [2]"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices, complete ties and a round you can revise",
        "zh": "六次选择、完整并列与可修改的一轮"
      },
      "paragraphs": [
        {
          "en": "Each scene has one scene, question and instruction option, in varying positions. One selected option adds one count; the three counts total six and each lies between zero and six. All maximum counts are kept: three-three-zero gives two portraits, and two-two-two gives three. These are raw counts, not percentages or future predictions.",
          "zh": "每个场景各有一个场景、问题、方法选项，位置会变化。所选项加一次，三项总和六次、各项0至6次。所有最高次数保留：三、三、零显示两篇，二、二、二显示三篇；这是原始次数，不是百分比或未来预测。"
        },
        {
          "en": "Start goes straight to the first page; Back lets you edit, and Retake clears the round. Complete public guides retain all five original fields. No name, email, private letter or other person’s message is requested. Choices resolve in your browser; optional tab drafts expire after twenty-four hours and clear on completion or retake.",
          "zh": "开始直接进入第一页，可返回修改，重玩清空本轮。完整公开指南保留原五部分。无需姓名、邮箱、私人信件或他人信息；选择在浏览器内解析，可选标签页草稿二十四小时失效，完成或重玩清除。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Will a letter arrive in the future?",
        "zh": "未来会收到信吗？"
      },
      "answer": {
        "en": "No. There is no recipient, delivery date or sending service. The capsule only exists in the supplied creative scenes.",
        "zh": "不会。没有收件人、投递日期或发送服务，胶囊只存在于给定创作场景。"
      }
    },
    {
      "question": {
        "en": "Should I enter private memories?",
        "zh": "需要输入私人回忆吗？"
      },
      "answer": {
        "en": "No. You select supplied fictional options. No free-text letter, private identifier or other person’s message is needed.",
        "zh": "不需要。只选择给定虚构选项，无需自由写信、私人标识或他人信息。"
      }
    },
    {
      "question": {
        "en": "Does a question commit my future self?",
        "zh": "问题会约束未来的自己吗？"
      },
      "answer": {
        "en": "No. The question portrait explicitly allows a different answer, no answer or a changed question.",
        "zh": "不会。问题画像明确允许不同回答、不答或改问题。"
      }
    },
    {
      "question": {
        "en": "Why can several capsules be highest?",
        "zh": "为什么多种胶囊都最高？"
      },
      "answer": {
        "en": "The six choices can give equal maximum counts. Every tied portrait appears in full, without an arbitrary winner.",
        "zh": "六次选择可以产生相同最高次数，每篇并列完整显示，不任意挑胜者。"
      }
    },
    {
      "question": {
        "en": "Is this a memory or planning assessment?",
        "zh": "这是记忆或规划能力评估吗？"
      },
      "answer": {
        "en": "No. The page neither checks recall against events nor follows future outcomes. It offers authored recreational portraits.",
        "zh": "不是。页面不核对事件回忆，也不追踪未来成果，只提供原创趣味画像。"
      }
    },
    {
      "question": {
        "en": "Can I read all guides without saving?",
        "zh": "不保存也能读全部指南吗？"
      },
      "answer": {
        "en": "Yes. All guides are public and free. Saving a temporary draft is optional and does not create a future reminder.",
        "zh": "可以。全部指南公开免费，临时草稿保存可选，不会创建未来提醒。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.futureme.org/",
      "label": {
        "en": "FutureMe: actual future-letter entry (English; a different service)",
        "zh": "FutureMe：真实未来信件入口（英语；不同服务）"
      }
    },
    {
      "url": "https://www.cap-sciences.net/vous-etes/professionnels/louer-nos-espaces-et-teambuilding/activites-culturelles-et-team-building/capsule-temporelle/",
      "label": {
        "en": "Cap Sciences: physical time-capsule workshop (French; related activity)",
        "zh": "Cap Sciences：实体时间胶囊工坊（法语；相关活动）"
      }
    }
  ]
},
  "tide-pool-creature": {
  "label": {
    "en": "Original shared-space story · All complete creature portraits",
    "zh": "原创共享空间故事 · 完整小生物画像"
  },
  "instructions": {
    "en": "Imagine the written tide pool as a fictional neighborhood. Across six scenes, choose how you would arrange shade, entrances, routes and quiet space. No real creature is handled or identified. Each choice counts once; every portrait sharing the highest count appears completely.",
    "zh": "把文字潮池想象成虚构小社区。六个场景里选择怎样安排阴凉、入口、通路与安静空间，不接触或识别真实生物。每次选择记一次，所有同为最高的画像完整显示。"
  },
  "sections": [
    {
      "id": "premise",
      "title": {
        "en": "A tiny fictional neighborhood with limited shade",
        "zh": "一处阴凉有限的虚构小社区"
      },
      "paragraphs": [
        {
          "en": "The story begins with several arrivals and one shaded rock. Later scenes introduce an unclear entrance, a busy resting place, a path crossing a nook, different wishes for company and a final arrangement. You choose how to organize these authored spaces; you do not steer an animal through a simulated habitat.",
          "zh": "故事从几位新邻居与一块阴凉岩石开始。后续涉及不清楚的入口、忙碌休息处、穿过角落的通路、不同陪伴需要与最后安排。你选择怎样组织写好的空间，不是在模拟栖息地里操控动物。"
        },
        {
          "en": "Crab, shrimp and anemone name three original portraits: shared access, several routes and a recognizable personal nook. These choices can coexist. The story makes no claim that these animals negotiate turns or establish human-style property boundaries in nature.",
          "zh": "蟹、虾与海葵命名三篇原创画像：共同使用、多条路线与可辨认的个人角落。三种选择可以共存；故事不声称真实动物会协商轮次或建立人类式产权边界。"
        }
      ]
    },
    {
      "id": "common",
      "title": {
        "en": "Common-Rock Crab: make shared access understandable",
        "zh": "共用岩石小蟹：让共同使用有章可循"
      },
      "paragraphs": [
        {
          "en": "This portrait favors a legible common arrangement. A turn, a marked entrance or a shared passing lane gives a newcomer something concrete to ask about. In an original everyday parallel, a craft group can agree when each person uses a large table without assigning one member permanent authority over it.",
          "zh": "这幅画像侧重看得懂的共同安排。轮次、入口标记或共同通道，让新来者知道可以具体询问什么。一个原创日常对照是手工小组约定使用大桌的时段，而不让某位成员永久管理它。"
        },
        {
          "en": "A written arrangement still needs the users’ agreement and may stop fitting as needs change. A high crab count does not show fairness, leadership or conflict-resolution skill. The original guide explicitly leaves room for revision and does not require you to police everyone.",
          "zh": "写下来的安排仍需使用者同意，也可能随需要变化而不再合适。小蟹次数高，不证明公平、领导力或冲突处理能力；原指南保留修改空间，不要求你监督所有人。"
        }
      ]
    },
    {
      "id": "routes",
      "title": {
        "en": "Many-Paths Shrimp: offer another way without losing the question",
        "zh": "多条路线小虾：增加走法，也看清原问题"
      },
      "paragraphs": [
        {
          "en": "The shrimp options spread activity across smaller places or offer more than one route. An original imagined example is leaving a central conversation available while opening a quieter table for a separate activity. Someone may choose either, and movement need not become an expectation that everyone constantly circulates.",
          "zh": "小虾选项把活动分散到小地方，或提供不止一条路。一个原创想象例子是保留中央对话，同时开放一张更安静的小桌。参与者可选任何一处，不必把自由移动变成必须不断走动。"
        },
        {
          "en": "An alternative can reduce immediate crowding while leaving an unfair original arrangement untouched. The complete portrait therefore asks whether the first problem still needs attention. Counts do not measure flexibility, physical mobility, sociability or how many friends someone has.",
          "zh": "替代选项可缓解眼前拥挤，却可能让原本不公平的安排继续存在。因此完整画像仍问，最初的问题是否需要处理。次数不测灵活性、身体移动能力、社交性或朋友数量。"
        }
      ]
    },
    {
      "id": "nook",
      "title": {
        "en": "Sheltered-Nook Anemone: separate personal space and an open path",
        "zh": "小角落海葵：个人空间与开放通路并存"
      },
      "paragraphs": [
        {
          "en": "The anemone choices make the edges of a nook understandable while leaving a route or gathering place available. A small labeled personal tray beside shared paper supplies is an original practical illustration: it distinguishes what needs permission without claiming the entire desk.",
          "zh": "海葵选项让角落边缘清楚，同时留下通道或聚处。公共纸品旁标明个人使用的小托盘，是一个原创实际对照：说明什么需要先问，而不是占据整张书桌。"
        },
        {
          "en": "A boundary can become too broad or be misunderstood. Naming it allows other users to explain their needs too. This portrait is not a diagnosis of avoidance, introversion or sensitivity; a nook is one authored spatial choice, not a permanent instruction to withdraw.",
          "zh": "边界也可能过宽或被误解。把它说明白，让其他使用者也能表达需要。画像不诊断回避、内向或敏感；角落只是题本中的一种空间选择，不是永久退开的指令。"
        }
      ]
    },
    {
      "id": "nature",
      "title": {
        "en": "Real shores and fictional animal labels answer different questions",
        "zh": "真实海岸资料与虚构动物标签的区别"
      },
      "paragraphs": [
        {
          "en": "National Trust’s English rock-pool activity introduces observation of actual coastal life and separately addresses outdoor conditions. The Saint-Brieuc reserve’s French habitat page describes a real intertidal ecosystem and its food relationships. These are nature references, not sources for our three human-facing portraits. [1] [2]",
          "zh": "National Trust英语潮池活动介绍真实海岸生物观察，并另述户外条件；圣布里厄海湾保护区法语栖息地页说明真实潮间带生态与食物关系。它们是自然背景资料，不是本故事三种人类化画像的来源。 [1] [2]"
        },
        {
          "en": "Here the animals and pool are authored symbols. No species is identified, no tide is calculated and no animal-care or shoreline-access decision is supported by a result. The drawing is original decorative art rather than a biological plate. A recreational metaphor does not acquire scientific validity from a coastal reference.",
          "zh": "本站动物与潮池是原创符号，不识别物种、不计算潮汐，结果也不支持照护动物或进入海岸的决定。绘图是原创装饰，而非生物图鉴。休闲比喻不会因引用海岸资料获得科学效度。"
        }
      ]
    },
    {
      "id": "reading",
      "title": {
        "en": "Six choices, seven possible highest sets and complete guides",
        "zh": "六次选择、七种最高集合与完整指南"
      },
      "paragraphs": [
        {
          "en": "Every scene offers one option per portrait and adds one count to the selected family. Each raw count ranges from zero to six, with a total of six. Positions change across scenes. Three-three-zero retains two guides; two-two-two retains all three. Counts are neither percentages nor ranks against other readers.",
          "zh": "每个场景为三种画像各提供一个选项，选中哪类就给它加一次。各项0至6次，总和6次；位置随场景变化。三、三、零保留两篇，二、二、二保留三篇。次数不是百分比，也不是与其他读者比较的排名。"
        },
        {
          "en": "Start opens the first scene directly. Back edits a choice, and Retake clears the round. Each public guide preserves the full summary, example, benefit, tradeoff and optional experiment. Choices resolve in the browser; optional tab saving lasts up to twenty-four hours and clears on completion or retake. No location, animal photo or identity is requested.",
          "zh": "开始直接打开首个场景，可返回改选，重玩清空本轮。每篇公开指南保留完整概述、例子、用处、取舍与可选尝试。选择在浏览器内解析，可选标签页保存最长二十四小时，完成或重玩清除；无需位置、动物照片或身份资料。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Is this a marine-biology quiz?",
        "zh": "这是海洋生物学测验吗？"
      },
      "answer": {
        "en": "No. The animal names are authored symbols for shared-space choices. There are no factual identification questions or biology grades.",
        "zh": "不是。动物名是共享空间选择的原创符号，没有物种识别题或生物学成绩。"
      }
    },
    {
      "question": {
        "en": "Does crab mean I am a leader?",
        "zh": "小蟹结果代表我是领导者吗？"
      },
      "answer": {
        "en": "No. It means common-access options were among the most selected in this six-scene round, without observing leadership or fairness.",
        "zh": "不代表。它只表示六个场景中共同使用类选项属于最高次数，没有观察领导力或公平程度。"
      }
    },
    {
      "question": {
        "en": "Is a personal nook a sign of avoidance?",
        "zh": "个人角落说明回避他人吗？"
      },
      "answer": {
        "en": "No. The anemone guide pairs an understandable nook with an open path and discusses where a boundary can become too broad.",
        "zh": "不说明。海葵指南把清楚角落与开放通路并列，也讨论边界过宽的取舍。"
      }
    },
    {
      "question": {
        "en": "What if two or three portraits tie?",
        "zh": "两种或三种画像并列怎么办？"
      },
      "answer": {
        "en": "All highest counts remain and their complete guides appear. No random choice or option-position rule breaks a tie.",
        "zh": "所有最高次数保留并完整显示，不随机抽取，也不靠选项位置破同分。"
      }
    },
    {
      "question": {
        "en": "Must I go to a beach or upload a photo?",
        "zh": "需要到海边或上传照片吗？"
      },
      "answer": {
        "en": "No. Everything takes place in supplied fictional text, with no real-world task or upload.",
        "zh": "不需要。全部发生在提供的虚构文字中，没有实际出行任务或上传。"
      }
    },
    {
      "question": {
        "en": "Can I read the other complete portraits?",
        "zh": "可以阅读其他完整画像吗？"
      },
      "answer": {
        "en": "Yes. All three public guides are free, including those that were not highest in your round.",
        "zh": "可以。三篇公开指南全部免费，包括本轮没有最高的画像。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.nationaltrust.org.uk/visit/50-things/no.-37-explore-the-wonders-of-a-rock-pool",
      "label": {
        "en": "National Trust: observing actual rock pools (English; nature background)",
        "zh": "National Trust：真实潮池观察（英语；自然背景）"
      }
    },
    {
      "url": "https://www.reservebaiedesaintbrieuc.com/decouvrir/les-habitats/lestran",
      "label": {
        "en": "Saint-Brieuc reserve: the actual intertidal habitat (French; nature background)",
        "zh": "圣布里厄保护区：真实潮间带栖息地（法语；自然背景）"
      }
    }
  ]
},
  "thrift-shop-find": {
  "label": {
    "en": "Original illustrated secondhand shelf · Use, remake and visible traces",
    "zh": "原创插画二手架 · 用途、改造与可见痕迹"
  },
  "instructions": {
    "en": "Browse an original illustrated shelf, with an equivalent written description. In six imagined scenes, choose what attracts you to a story prop. No purchase, object upload or actual restoration is required. Three counts and every equally highest portrait appear in full.",
    "zh": "浏览原创插画货架及等价文字说明。六个想象场景里选道具什么地方吸引你，无需购买、上传物件或实际修复；三项次数与全部同为最高的画像均完整显示。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "An imagined secondhand shelf, with nothing to buy",
        "zh": "一排想象二手架，不需要购物"
      },
      "paragraphs": [
        {
          "en": "The shelf offers a simple box, a plain frame and a notebook with an old label. Later scenes introduce an unusual shape, one prop, a project that grows, a note and what makes the find satisfying. Objects remain fictional props, not actual listings or items inspected by the page.",
          "zh": "架上有简单盒子、素框与带旧标签的笔记本。后续场景涉及不寻常形状、只选一道具、项目变费力、写一笔与怎样满足。物件始终是虚构道具，不是实际商品或本站检验过的东西。"
        },
        {
          "en": "Current use, a small possible transformation and a visible detail offer different reasons to pause. The original premise permits leaving empty-handed. Choosing a response in the story does not recommend a purchase or rate taste, thrift, sustainability or condition-judging ability.",
          "zh": "当前用途、小幅改造可能与可见细节，提供不同停留理由。原前提允许空手离开。故事中作答不推荐购买，也不评品位、节俭、可持续性或判断品相的能力。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Ready-to-use find: begin with something already needed",
        "zh": "顺手再用：从已有需要开始"
      },
      "paragraphs": [
        {
          "en": "The use portrait asks where an object fits something you actually do. An original imagined box might hold a few drawing cards already on a desk, without starting a collection to fill it. The scene compares an ordinary purpose with other possible interests, not whether the object is technically fit for real use.",
          "zh": "用途画像询问物件怎样配合真在做的事。一个原创想象盒子可以装桌上已有画卡，不为了填满它另开收藏。场景比较普通用途与其他兴趣，不检验物件现实中是否适用。"
        },
        {
          "en": "The full guide allows enjoyment without utility. A decorative object can be wanted for its appearance, and an existing item need not gain an improvement project. A count does not inspect hygiene, materials, durability or safety; those properties cannot be inferred from a fictional choice.",
          "zh": "完整指南允许乐趣不靠实用。装饰物可因外观被喜欢，已有物也不必增加改进项目。次数不检查卫生、材料、耐久或安全，这些性质无法从虚构选择推断。"
        }
      ]
    },
    {
      "id": "remake",
      "title": {
        "en": "One-change possibility: a mockup may be enough",
        "zh": "只改一处：样稿也可以已经足够"
      },
      "paragraphs": [
        {
          "en": "The remake portrait uses a shape as a bounded starting point. An original imagined example could try a removable paper insert inside an already-owned frame. Its purpose is to make one possibility concrete without promising a completed transformation or replacing the whole room around it.",
          "zh": "改造画像把形状当有边界的起点。一个原创想象例子可以在已有素框里试一张可移除纸内页。目的在于让一个可能具体，不承诺完成改造，也不围着它更换整间房。"
        },
        {
          "en": "The original tradeoff recognizes a growing queue of obligations. After one reversible paper mockup, you can separately decide whether further work is wanted. The story supplies no restoration procedure, tool instruction or evidence that an alteration preserves an object’s value.",
          "zh": "原取舍承认可能积成义务队列。做完一次可撤回纸样后，可以另外决定是否还想继续。故事不提供修复流程、工具操作，也不证明改变会保留物件价值。"
        }
      ]
    },
    {
      "id": "trace",
      "title": {
        "en": "Visible-trace find: observation and an invented history stay apart",
        "zh": "可见痕迹：观察与虚构身世分开"
      },
      "paragraphs": [
        {
          "en": "The trace portrait looks at a worn edge, label or curve without claiming to know its former owner. An original imagined note could describe a faded green rectangle and keep its origin unknown. You can enjoy the visible mark without possessing the object or completing its past.",
          "zh": "痕迹画像看磨边、标签或曲线，不声称知道旧主人。一个原创想象短记可以描述褪色绿色矩形，让来历保持未知。无需拥有物件或补完过去，也可欣赏可见标记。"
        },
        {
          "en": "V&A Dundee’s object-writing activity offers a related way to gather words and impressions from looking.[1] Our full guide keeps a separate label for any fiction invented from a mark. An engaging story is not authentication, provenance or evidence that an antique is valuable.",
          "zh": "V&A Dundee的物件写作活动提供从观察收集词语和印象的相关方法。[1]本站完整指南为由痕迹编出的虚构另加标签。好听故事不是鉴真、来源记录或古物有价值的证明。"
        }
      ]
    },
    {
      "id": "context",
      "title": {
        "en": "Real reuse services and a fictional shelf differ",
        "zh": "真实再用服务与虚构货架不同"
      },
      "paragraphs": [
        {
          "en": "Emmaüs France’s French introduction describes collecting, sorting, cleaning, repairing when needed and reselling objects within its solidarity activity.[2] These are related real-world operations. This page runs no shop or collection service and does not assert that a depicted prop has passed those steps.",
          "zh": "Emmaüs France法语介绍描述其互助活动中的收集、分拣、清洁、按需维修与转售。[2]这是相关现实运作。本站不经营商店或回收服务，也不声称画中道具经过这些步骤。"
        },
        {
          "en": "The sources supply creative and practical context, not validation of three find types or a recommendation to shop. Our shelf drawing, prompts and examples are original. No monetary, environmental-impact or condition score is calculated from the selected props.",
          "zh": "来源提供创作与实践背景，不验证三种拾物类型，也不建议购物。本站货架绘图、题目和例子均为原创，不从道具选择计算金钱、环境影响或品相分。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six shelf choices, three counts and complete highest ties",
        "zh": "六次货架选择，三项次数与全部最高并列"
      },
      "paragraphs": [
        {
          "en": "Each scene offers use, remake and trace once, with positions changing. The chosen emphasis receives one; each ranges from zero to six, total six. All equally highest portraits stay: three-three-zero shows two and two-two-two shows three. The authored categories have no established psychometric reliability, validity or norms.",
          "zh": "每场景各有用途、改造与痕迹一次，位置会变化。选中侧重加一次，各项零至六次，总六。同为最高全部保留：三、三、零显示两篇，二、二、二显示三篇。原创分类尚无已建立的心理测量信度、效度或常模。"
        },
        {
          "en": "Every original five-part guide remains complete. Start opens the first question, Back allows changes and retake clears the run. Choices resolve in the browser; optional tab-only saving lasts up to twenty-four hours and clears on completion, retake or deletion. Refresh may lose unsaved progress. No listing, payment, photograph or personal inventory is requested; cookie-controlled usage analytics are separate from answers.",
          "zh": "原五部分指南保持完整。开始打开第一题，上一题可改选，重玩清空本轮。选择在浏览器内解析；可选本标签页保存最长二十四小时，完成、重玩或删除清除，刷新可能丢失未保存进度。不索取商品链接、支付、照片或私人库存；受Cookie设置控制的使用统计与答案分开。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Do I need to buy or find an actual item?",
        "zh": "需要购买或找到真实物件吗？"
      },
      "answer": {
        "en": "No. The supplied shelf and objects are fictional. Existing belongings are enough for any optional private prompt.",
        "zh": "不用。所供货架与物件均虚构，可选私人提示用已有物即可。"
      }
    },
    {
      "question": {
        "en": "Does the picture show items for sale?",
        "zh": "图片里是待售商品吗？"
      },
      "answer": {
        "en": "No. It is an original illustration of story props, with no listings, prices, checkout or seller connection.",
        "zh": "不是。它是故事道具的原创插画，没有商品、价格、结账或卖家连接。"
      }
    },
    {
      "question": {
        "en": "Can I play using text alone?",
        "zh": "只读文字可以玩吗？"
      },
      "answer": {
        "en": "Yes. The shelf has an equivalent description and all questions and choices remain written text.",
        "zh": "可以。货架有等价说明，全部问题和选项始终为文字。"
      }
    },
    {
      "question": {
        "en": "Does a visible mark prove an object’s past?",
        "zh": "可见痕迹能证明物件过去吗？"
      },
      "answer": {
        "en": "No. Notice the mark separately from any tale you invent; the page performs no authentication or provenance check.",
        "zh": "不能。应把看见的痕迹与编出的故事分开，页面不鉴真或核查来源。"
      }
    },
    {
      "question": {
        "en": "Does a high remake count require a project?",
        "zh": "改造次数高就必须完成项目吗？"
      },
      "answer": {
        "en": "No. The complete guide permits a reversible paper mockup and a separate decision to stop.",
        "zh": "不用。完整指南允许只做可撤回纸样，再独立决定停止。"
      }
    },
    {
      "question": {
        "en": "Why can several portraits appear?",
        "zh": "为什么有多篇画像？"
      },
      "answer": {
        "en": "Every equally highest count remains without a tie-break. All three public guides are free regardless of your choices.",
        "zh": "同为最高次数全部保留，不破同分。三篇公开指南均免费，不受所选限制。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.vam.ac.uk/dundee/articles/just-add-words",
      "label": {
        "en": "V&A Dundee: observing objects and writing impressions (English; creative context)",
        "zh": "V&A Dundee：观察物件、记录印象（英语；创作背景）"
      }
    },
    {
      "url": "https://emmaus-france.org/nos-actions/reemploi-et-alternatives-ecologiques/",
      "label": {
        "en": "Emmaüs France: actual reuse activities (French; related practice)",
        "zh": "Emmaüs France：实际再用活动（法语；相关实践）"
      }
    }
  ]
},
  "team-name-maker": {
  "label": {
    "en": "Original hobby-team naming scenes · Words, shared context and a shortlist",
    "zh": "原创爱好小队起名情境 · 词语、共同背景与候选单"
  },
  "instructions": {
    "en": "Imagine naming a temporary hobby team for one fictional event. Choose your approach in six written situations. The page compares naming contributions rather than generating a name, collecting group votes or checking a brand. Read every equally highest portrait in full.",
    "zh": "想象给参加一场虚构活动的临时爱好小队起名。六个文字情境里选做法；页面比较起名贡献，不实际生成队名、采集群体投票或检索品牌。同为最高的画像均可完整阅读。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "A temporary team name: how would you help it take shape?",
        "zh": "临时小队名：你会怎样帮它成形？"
      },
      "paragraphs": [
        {
          "en": "The scenes begin with a blank sign and then introduce a hard-to-explain suggestion, a newcomer, equal support, discomfort with a proposal and a satisfying finish. The subject is a low-stakes hobby name for one event, without evaluating leadership, creativity, popularity or a real team’s cohesion.",
          "zh": "场景从空牌开始，接着有难解释的提议、新成员、支持相当、对提议不舒服，以及满意的收尾。主题是一场活动的低风险爱好队名，不评价领导力、创造力、人气或真实团队凝聚力。"
        },
        {
          "en": "Word combinations, a shared reference and a manageable process can work together. A playful candidate may be explained, revised or discarded. A chosen portrait does not give one member the authority to name everyone else or require the group to keep an unwanted name.",
          "zh": "词语组合、共同指涉与可掌握流程可以一起用。趣味候选可说明、修改或放弃。画像不授予一个人为所有人命名的权力，也不要求群体保留不想要的名字。"
        }
      ]
    },
    {
      "id": "wordplay",
      "title": {
        "en": "Word-combination maker: say it, then hear how others hear it",
        "zh": "词语组合制造者：念出来，也听别人怎样听"
      },
      "paragraphs": [
        {
          "en": "The wordplay portrait tries ordinary words in an unexpected pairing. An original imagined option could combine a paper craft material and a harmless garden image. The interest lies in an enjoyable shared phrase, without claiming that novelty makes a name good for every listener.",
          "zh": "词语画像让普通词意外搭档。一个原创想象选项可以把纸艺材料与无害花园意象组合。重点是容易共用、说着有趣的短语，不声称新鲜就对每位听者都好。"
        },
        {
          "en": "The full guide preserves pronunciation and unintended meanings as things to check. A phrase easy for its inventor may be awkward for someone else. Its optional three-pair exercise is a private prompt, not an automated generation service or a language-quality score.",
          "zh": "完整指南保留读音与意外含义这些需要核对的事情。对发明者容易的短语，对别人可能别扭。可选三对词练习是私人提示，不是自动生成服务或语言质量评分。"
        }
      ]
    },
    {
      "id": "reference",
      "title": {
        "en": "Shared-reference maker: give newcomers a way into the story",
        "zh": "共同指涉起名者：给新人进入故事的办法"
      },
      "paragraphs": [
        {
          "en": "The reference portrait carries a small shared event into a name. An original imagined group might remember a paper boat that kept circling a bowl. A one-line explanation lets someone joining later understand the reference without having to prove they were there.",
          "zh": "指涉画像把小段共同经历放进名字。一个原创想象小组可以记得纸船总在碗里转圈。一句说明让后来者理解，不必证明当时在场。"
        },
        {
          "en": "The original guide permits the reference to change. Guarding an inside story or testing newcomers can turn a small context into a barrier. A shared name can remain specific while dropping a reference someone finds uncomfortable; the story does not measure belonging.",
          "zh": "原指南允许指涉变化。守着内幕或考新人，会把小背景变成门槛。名字可以保持具体，也可放下让某人不舒服的指涉；故事不测归属。"
        }
      ]
    },
    {
      "id": "process",
      "title": {
        "en": "Shortlist-and-choose maker: finish without silencing a concern",
        "zh": "候选单推动者：能收尾，也听见顾虑"
      },
      "paragraphs": [
        {
          "en": "The process portrait makes a bounded list and agrees how to settle it. Miro’s official French voting guide describes setting candidate objects, vote counts and a session duration.[1] This is related facilitation context, not a claim that a software vote ensures a fair or unanimously liked name.",
          "zh": "流程画像建立有边界的清单，约好怎样收尾。Miro官方法语投票指南说明设置候选对象、票数与投票时长。[1]这是相关协作背景，不表示软件投票保证公平或人人喜欢。"
        },
        {
          "en": "The full portrait keeps one chance to raise a meaningful concern before settling a low-stakes choice. Finishing quickly is not the only goal. This page hosts no live vote, counts no other members’ preferences and does not infer what a real group has agreed.",
          "zh": "完整画像在确定低风险选择前，留一次提出重要顾虑的机会。快结束不是唯一目标。本站不组织实时投票、不计算其他成员偏好，也不推断真实群体已经同意什么。"
        }
      ]
    },
    {
      "id": "context",
      "title": {
        "en": "Naming generators and this naming-approach story differ",
        "zh": "名称生成器与起名方式故事不同"
      },
      "paragraphs": [
        {
          "en": "LOGO.com’s English team-name page asks for a description and offers AI-generated name suggestions.[2] It is a related naming product with a different output. Here you choose responses to six scenes and receive authored contribution portraits, not a fresh list of names or a logo.",
          "zh": "LOGO.com英语队名页要求描述并提供AI名称建议。[2]这是相关起名产品，输出不同。本站让你在六个场景选回应，得到原创贡献画像，不输出一批新名字或标志。"
        },
        {
          "en": "Neither reference verifies these three categories. The page does not search trademarks, domains or existing teams, and a result cannot establish commercial availability. The original examples stay illustrative and do not reserve or recommend a real brand identity.",
          "zh": "两项参考都不验证本站三分类。页面不检索商标、域名或现有团队，结果不能确认商业可用。原例子仅用于说明，不预订或推荐真实品牌身份。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices count contributions, not votes for a name",
        "zh": "六次选择统计贡献，不是给队名投票"
      },
      "paragraphs": [
        {
          "en": "Every scene offers wordplay, reference and process once, with changing option positions. The selected approach receives one count; each ranges from zero to six, total six. Every equally highest portrait remains: three-three-zero shows two and two-two-two shows three. These recreational categories have no established psychometric reliability, validity or norms.",
          "zh": "每场景各有词语、指涉与流程一次，选项位置会变化。选中做法加一次，各项零至六次，总六。同为最高全部保留：三、三、零显示两篇，二、二、二显示三篇。趣味分类尚无已建立的心理测量信度、效度或常模。"
        },
        {
          "en": "All original five-part guides remain complete. Start opens the first scene, Back permits edits and retake clears the run. Answers resolve in the browser; optional tab-only drafts last up to twenty-four hours and clear on completion, retake or deletion. Refresh may lose unsaved progress. No group name, member list or private joke is requested; cookie-controlled usage analytics are separate from answers.",
          "zh": "原五部分指南保持完整。开始打开首场景，上一题可改选，重玩清空本轮。答案在浏览器内解析；可选本标签页草稿最长二十四小时，完成、重玩或删除清除，刷新可能丢失未保存进度。不索取队名、成员名单或私人玩笑；受Cookie设置控制的使用统计与答案分开。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Will this generate a team name?",
        "zh": "会生成一个队名吗？"
      },
      "answer": {
        "en": "No. It compares your preferred approaches to six fictional naming situations and returns three authored contribution portraits.",
        "zh": "不会。它比较六个虚构起名情境中的偏好做法，返回三篇原创贡献画像。"
      }
    },
    {
      "question": {
        "en": "Does a high process count make me the leader?",
        "zh": "流程次数高就让我当队长吗？"
      },
      "answer": {
        "en": "No. Counts record selected responses and grant no role or authority within an actual group.",
        "zh": "不会。次数记录所选回应，不授予真实群体角色或权力。"
      }
    },
    {
      "question": {
        "en": "Are these votes from other people?",
        "zh": "这些是其他人的投票吗？"
      },
      "answer": {
        "en": "No. Only your choices in this run are counted. No invitation, live poll or member voting is performed.",
        "zh": "不是。仅统计你本轮选择，没有邀请、实时民调或成员投票。"
      }
    },
    {
      "question": {
        "en": "Does it check trademark or domain availability?",
        "zh": "会检查商标或域名可用吗？"
      },
      "answer": {
        "en": "No. There is no search or registration service, and the examples establish no right to a name.",
        "zh": "不会。没有检索或注册服务，例子也不建立名称权利。"
      }
    },
    {
      "question": {
        "en": "Can a name change when a newcomer joins?",
        "zh": "有新人加入时名字可以变吗？"
      },
      "answer": {
        "en": "Yes. The original shared-reference guide permits explanation and revision rather than testing a newcomer’s insider knowledge.",
        "zh": "可以。原共同指涉指南允许解释与修改，不考新人掌握多少内幕。"
      }
    },
    {
      "question": {
        "en": "Can several portraits appear?",
        "zh": "会同时出现多篇画像吗？"
      },
      "answer": {
        "en": "Yes. Every equally highest count is retained, and all three complete public guides remain freely accessible.",
        "zh": "会。同为最高的次数全部保留，三篇完整公开指南也均可自由阅读。"
      }
    }
  ],
  "references": [
    {
      "url": "https://help.miro.com/hc/fr/articles/360017572274-Une-fonction-de-vote",
      "label": {
        "en": "Miro: configuring a voting session (French; related collaboration tool)",
        "zh": "Miro：设置投票环节（法语；相关协作工具）"
      }
    },
    {
      "url": "https://logo.com/name/team-name-generator",
      "label": {
        "en": "LOGO.com: actual team-name generation (English; different output)",
        "zh": "LOGO.com：实际队名生成（英语；输出不同）"
      }
    }
  ]
},
  "storybook-narrator": {
  "label": {
    "en": "Original umbrella-parade narration · Detail, voices and a playful aside",
    "zh": "原创雨伞游行叙述 · 细节、多声部与趣味插话"
  },
  "instructions": {
    "en": "Imagine a town holding a parade for lost umbrellas. In six written scenes, choose how you would like the same tale to be told. No writing sample or preferred reader response is required. Three counts and every equally highest narrator appear in full.",
    "zh": "想象小镇为走失雨伞举行游行。六个文字场景里选希望怎样讲述同一个故事，无需提交写作样本或猜测读者喜好；三项次数与全部同为最高的叙述者均完整显示。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "One fictional parade, several ways of telling it",
        "zh": "一场虚构游行，不同讲法"
      },
      "paragraphs": [
        {
          "en": "The questions move through an opening, a dropped map, a quiet umbrella, a narrator’s notebook, a pause and the last line. What changes is the telling: where attention lands, whose account is heard and when a narrator steps aside to comment. This is not a branching plot with different events caused by your choices.",
          "zh": "题目涉及开头、掉落地图、安静雨伞、叙述者笔记、暂停与末句。变化在讲法：注意落在哪里、听见谁的版本，以及旁白何时侧身评论。这不是选择引发不同事件的分支剧情。"
        },
        {
          "en": "The close-up lens, village chorus and sideways wink are authored playful devices. A writer may combine them within a scene. Your selected count does not identify your intelligence, observation skill, humor ability or the narrator you must use in every story.",
          "zh": "近景镜头、村庄合唱与侧着眨眼的旁白，是原创趣味手法。作者可在同一场景组合使用。次数不识别智力、观察技能或幽默能力，也不规定每篇故事都必须用同一种旁白。"
        }
      ]
    },
    {
      "id": "lens",
      "title": {
        "en": "Close-up lens: give a detail its context",
        "zh": "近景镜头：给细节补上背景"
      },
      "paragraphs": [
        {
          "en": "The lens portrait stays with an observable detail. An original imagined sentence might begin with a ribbon brushing a puddle before naming the parade it belongs to. The detail gives the scene a place to start, without needing to explain the entire town at once.",
          "zh": "镜头画像停在可观察细节。一个原创想象句可以先写缎带扫过水洼，再说它属于哪支游行。细节给场景一个起点，无需一次说明整座小镇。"
        },
        {
          "en": "Its full guide also names what falls outside the frame. A vivid close view may hide the wider action or another character’s perspective. The optional experiment pairs one concrete detail with one context sentence; the exercise is available as a private idea rather than an evaluated writing task.",
          "zh": "完整指南也说明画面外遗漏什么。鲜明近景可能遮住较大行动或另一角色视角。可选尝试把一个具体细节与一句背景配在一起，作为私人点子，不是接受评分的写作任务。"
        }
      ]
    },
    {
      "id": "chorus",
      "title": {
        "en": "Village chorus: keep different accounts distinguishable",
        "zh": "村庄合唱：让不同版本各自清楚"
      },
      "paragraphs": [
        {
          "en": "The chorus portrait lets several townspeople notice different parts of one event. An original imagined example might put a shopkeeper’s blocked doorway beside a child’s delight in the parade. Neither account has to disappear to make the other audible.",
          "zh": "合唱画像让几位镇民注意同一事件的不同部分。一个原创想象例子可以并置店主被挡的门口与孩子看游行的欢喜，不必删除一方才听见另一方。"
        },
        {
          "en": "The original tradeoff distinguishes impressions from factual claims. Several voices do not make incompatible checkable statements equally supported. In a harmless shared-event exercise, you can invite another account while checking a factual question separately when it matters.",
          "zh": "原取舍区分印象与事实主张。声音多，不让彼此冲突、可核对的说法自动拥有同等依据。在无害共同经历练习里，可邀请另一版本，也可在重要时另外核对事实。"
        }
      ]
    },
    {
      "id": "wink",
      "title": {
        "en": "Sideways wink: an aside that returns to the event",
        "zh": "侧着眨眼：插一句，再回到事情"
      },
      "paragraphs": [
        {
          "en": "The wink portrait changes framing rather than making a person the target. An original imagined narrator could say a runaway ribbon had accepted a job in the wind. The play belongs to the description; no character has to be humiliated to supply a joke.",
          "zh": "眨眼画像改变叙述角度，不把某个人当靶子。一个原创想象旁白可以说逃跑缎带接受了风里的新工作。趣味属于描述，无需让角色受辱来提供笑点。"
        },
        {
          "en": "The full guide keeps the aside brief and conditional on context. A moment needing direct information may not benefit from a joke, and another reader may not enjoy the framing. The optional prompt returns to the actual story and permits dropping the aside when it distracts.",
          "zh": "完整指南让插话短而看情境。需要直接信息的片刻未必适合玩笑，另一读者也可能不喜欢这个角度。可选提示回到故事本身，并允许在分散注意时省去插话。"
        }
      ]
    },
    {
      "id": "context",
      "title": {
        "en": "Narrative voice is a craft choice, not a personal diagnosis",
        "zh": "叙述声音是创作选择，不是个人诊断"
      },
      "paragraphs": [
        {
          "en": "Open University’s narrative-perspectives lesson examines who narrates and how perspective shapes the reading of fiction.[1] It supplies a related craft distinction, not an assessment of our three devices. Close detail, several accounts and an aside do not map directly onto first-person and third-person categories.",
          "zh": "开放大学叙事视角课程讨论谁讲述，以及视角怎样影响小说阅读。[1]它提供相关创作区分，不评估本站三种手法。近看细节、多种版本和插话，不直接一一对应第一或第三人称分类。"
        },
        {
          "en": "The umbrella town, prompts and examples are original. The page does not generate a manuscript, imitate a named author, score prose or infer empathy from a voice. The complete public portraits keep their own examples, possible benefits, tradeoffs and optional experiments.",
          "zh": "雨伞小镇、题目与例子均为原创。页面不生成稿件、不模仿具名作者、不评文笔，也不凭叙述声音推断共情。完整公开画像保留各自例子、可能用处、取舍与可选尝试。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six narration choices and all equally highest devices",
        "zh": "六次叙述选择，保留同为最高的手法"
      },
      "paragraphs": [
        {
          "en": "Each scene offers lens, chorus and wink once, with positions changing. A selection adds one count; each ranges from zero to six and the completed total is six. Three-three-zero keeps two full portraits, and two-two-two keeps all three. These authored counts have no established psychometric reliability, validity or norms.",
          "zh": "每场景各提供镜头、合唱与眨眼一次，位置会变化。选中项加一次，各项零至六次，总六。三、三、零显示两篇全文，二、二、二显示三篇。原创次数尚无已建立的心理测量信度、效度或常模。"
        },
        {
          "en": "Start opens the first scene directly, Back allows changes and retake clears this run. Choices resolve in the browser. Optional tab-only saving lasts up to twenty-four hours, clearing on completion, retake or deletion; refresh may lose unsaved progress. No story upload or private event is requested, and cookie-controlled usage analytics are separate from answers.",
          "zh": "开始直接打开首场景，上一题可改选，重玩清空本轮。选择在浏览器内解析，可选本标签页保存最长二十四小时，完成、重玩或删除清除；刷新可能丢失未保存进度。不索取故事上传或私人事件，受Cookie设置控制的使用统计与答案分开。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Does this test literary quality?",
        "zh": "这会测试文学质量吗？"
      },
      "answer": {
        "en": "No. It counts narration choices in a supplied fiction, without reading or grading your own prose.",
        "zh": "不会。它统计给定虚构里的叙述选择，不阅读或评分你的文章。"
      }
    },
    {
      "question": {
        "en": "Does each choice change the plot?",
        "zh": "每次选择都改变剧情吗？"
      },
      "answer": {
        "en": "No. This is a tally of preferred telling devices, not a branch that changes what happens in the town.",
        "zh": "不会。这是所偏好讲法的计数，不是改变小镇事件的分支。"
      }
    },
    {
      "question": {
        "en": "Are the three devices first, second and third person?",
        "zh": "三手法分别是第一、第二、第三人称吗？"
      },
      "answer": {
        "en": "No. Detail, multiple accounts and asides can be used with different grammatical persons and narrative structures.",
        "zh": "不是。细节、多种版本与插话可以用于不同语法人称和叙述结构。"
      }
    },
    {
      "question": {
        "en": "Does the chorus treat every factual claim as equally supported?",
        "zh": "合唱会把每个事实说法都当同样有据吗？"
      },
      "answer": {
        "en": "No. The original guide separates remembered impressions and guesses from checkable factual questions.",
        "zh": "不会。原指南把记得的印象、猜测与可核对事实问题分开。"
      }
    },
    {
      "question": {
        "en": "Can I get more than one narrator?",
        "zh": "能得到多个叙述者吗？"
      },
      "answer": {
        "en": "Yes. All equally highest counts are retained, and every complete public guide is freely readable.",
        "zh": "可以。同为最高的次数全部保留，每篇完整公开指南也均可自由读。"
      }
    },
    {
      "question": {
        "en": "Must I submit a story or personal experience?",
        "zh": "必须提交故事或个人经历吗？"
      },
      "answer": {
        "en": "No. Every scene and option is provided. No manuscript, personal event or file is requested.",
        "zh": "不用。场景与选项都已提供，不索取稿件、个人事件或文件。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.open.edu/openlearn/history-the-arts/literature/approaching-prose-fiction/content-section-2.3",
      "label": {
        "en": "Open University: narrative perspectives (English; craft context)",
        "zh": "开放大学：叙事视角（英语；创作背景）"
      }
    }
  ]
},
  "story-ending": {
  "label": {
    "en": "Original branching paper-parade tale · One ending per route",
    "zh": "原创纸游行分支故事 · 每条路线抵达一个结局"
  },
  "instructions": {
    "en": "Follow the paper parade to an unfinished square. At each scene choose one action, then follow the next scene it opens. A route takes three or four choices to one complete ending; it does not add personality points. All three public ending guides remain freely readable.",
    "zh": "跟随纸游行抵达未完广场。每个场景选一个行动，再跟随它打开的下一幕。每条路线经三或四次选择到达一个完整结局，不累加人格分；三篇公开结局指南均可自由读。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "The parade has arrived: what will the last page finish?",
        "zh": "游行已抵达：最后一页完成什么？"
      },
      "paragraphs": [
        {
          "en": "A paper figure carries a displaced sign, while another group arranges a circle in a square. Following either thread changes which scene comes next. The story asks what to resolve in an authored fictional ending, not how you cope with real endings, relationships or uncertainty.",
          "zh": "一个纸人拿着放错地方的牌，另一组正在广场排圆圈。跟随不同线索，会改变下一幕。故事让你选择原创虚构结尾里解决什么，不判断现实中怎样面对结束、关系或不确定性。"
        },
        {
          "en": "Returning one thing, showing a shared scene and leaving a path open are all complete endings for this small tale. None is a moral success or failure. The parade’s present arrival can be finished without deciding every figure’s future or promising another installment.",
          "zh": "归还一物、展示共作景与留开放小路，都是本小故事的完整结局，不分道德成败。当下抵达可以完成，不必决定每个纸人的未来，也不承诺续篇。"
        }
      ]
    },
    {
      "id": "return",
      "title": {
        "en": "A small return: connect the first scene with the last",
        "zh": "小小归还：连接首景与末景"
      },
      "paragraphs": [
        {
          "en": "The return ending brings the bench and sign back into relation. One route actually returns to the starting bench; another final choice places the bench beside the square. The original reading concerns this concrete connection, without claiming that every loose detail has been put right.",
          "zh": "归还结局让长椅与牌重新联系。一条路线实际返回出发长椅，另一末步选择把长椅放在广场旁。原读法讨论这处具体连接，不声称所有散落细节都已归位。"
        },
        {
          "en": "The complete guide retains its caution against forcing every thread into a neat loop. An optional original writing exercise follows one fictional object from an opening to a final image while leaving a surrounding detail unresolved. It is creative practice, not a test of a need for closure.",
          "zh": "完整指南保留对过度圆满的提醒，不把每条线索硬收成环。原可选写作练习跟随一个虚构物件从开头到末图，同时留一处周围细节未解。这是创作练习，不测结束需要。"
        }
      ]
    },
    {
      "id": "together",
      "title": {
        "en": "A shared scene: make each willing contribution visible",
        "zh": "共作小景：看见每份自愿贡献"
      },
      "paragraphs": [
        {
          "en": "The shared ending shows what the willing figures have made in the circle. An original imagined addition might let one figure bring a folded seat and another draw a small banner. Different additions can coexist without requiring every character to want the same final image.",
          "zh": "共作结局展示愿意的纸人在圆圈里做成什么。一个原创想象添加可以让一人带折叠座椅，另一人画小旗。不同添加可以并存，不要求每位角色想要同一末图。"
        },
        {
          "en": "The original guide also leaves room for a figure who only watches or declines to join. A shared picture is not proof of universal agreement. Its optional multi-character exercise makes contributions distinct instead of treating participation as a condition of being welcome.",
          "zh": "原指南也给只看或不参加的纸人留位置。共享画面不证明人人认同。可选多角色练习让贡献各自可见，不把参加变成受欢迎的条件。"
        }
      ]
    },
    {
      "id": "open",
      "title": {
        "en": "A path beyond the page: finish this action first",
        "zh": "纸页外的小路：先完成当前行动"
      },
      "paragraphs": [
        {
          "en": "The open ending lets a narrow path leave the square. The current parade is already at its destination; only a possible next journey remains unspecified. This distinction makes the final image available for imagination without leaving the selected route incomplete.",
          "zh": "开放结局让窄路离开广场。当前游行已经抵达，只有可能的下一程尚未指定。这一区分让末图开放给想象，同时不让所选路线处于未完成状态。"
        },
        {
          "en": "The full guide keeps a concrete stopping point, an example, a tradeoff and an optional final-image prompt. An original imagined exercise could end with the last paper flag lowered while one unmarked path continues. It does not forecast your future or establish a fixed preference for ambiguity.",
          "zh": "完整指南保留具体停点、例子、取舍与可选末图提示。一个原创想象练习可以用最后纸旗落下收尾，同时留一条无标识小路。它不预言未来，也不确定固定的模糊偏好。"
        }
      ]
    },
    {
      "id": "routes",
      "title": {
        "en": "Eleven terminal routes, three or four choices, one ending",
        "zh": "十一条终端路线，三或四次选择，一个结局"
      },
      "paragraphs": [
        {
          "en": "The source contains six scene nodes, but a run visits only its selected path. Five terminal routes take three choices and six take four. Eleven complete routes reach return five ways, together two ways and open four ways. These are authored route counts, not probabilities: the page does not randomly choose actions.",
          "zh": "源中有六个场景节点，但每轮只走所选路径。五条终端路线经三次选择，六条经四次。十一条完整路线中，归还可由五条抵达，共作两条、开放四条。这是作者路线数量，不是概率；页面不随机替你选行动。"
        },
        {
          "en": "There are no points or highest ties. A partial path waits for its next required choice; a final action opens one complete five-part ending. Back allows an earlier edit, and changing a branch discards its abandoned later choices. Retake begins again without previous selections; public guides let you read other endings without changing a run.",
          "zh": "这里没有积分或最高并列。路径未完成时等待下一必要选择，末步打开一篇完整五部分结局。上一题可修改前步，换分支会清除被放弃路径的后续选择。重玩不带旧选择，公开指南可读其他结局而不改变本轮。"
        }
      ]
    },
    {
      "id": "context",
      "title": {
        "en": "Interactive-writing context and your private reading",
        "zh": "互动写作背景与私人阅读"
      },
      "paragraphs": [
        {
          "en": "Inkle’s official ink tutorial describes choices, links between passages and intentional endpoints.[1] V&A’s story-making activity asks participants to consider a beginning, middle and end using familiar objects.[2] They supply related writing context; this paper parade uses its own scenes and implementation, without borrowing a plot or claiming to run those products.",
          "zh": "Inkle官方ink教程介绍选择、段落跳转与明确终点。[1]V&A故事创作活动用熟悉物件，引导考虑开头、中段和结尾。[2]它们提供相关写作背景；纸游行使用自己的场景与实现，不借剧情，也不声称运行这些产品。"
        },
        {
          "en": "Start opens the first scene directly. No personal account, real-life event or story upload is requested. Choices resolve in the browser. Optional tab-only saving keeps the current edition’s draft for up to twenty-four hours and clears on completion, retake or deletion; refresh may lose unsaved progress. Cookie-controlled usage analytics are separate from answers. These endings are original fiction, without a personality scale, diagnosis or psychometric validation.",
          "zh": "开始直接打开首场景，不要求私人叙述、真实事件或故事上传。选择在浏览器内解析；可选本标签页保存把本版草稿保留最长二十四小时，完成、重玩或删除清除，刷新可能丢失未保存进度。受Cookie设置控制的使用统计与答案分开。这些结局是原创虚构，没有人格量表、诊断或心理测量验证。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Is my ending chosen by a score?",
        "zh": "结局由分数决定吗？"
      },
      "answer": {
        "en": "No. Each selected action points to the next scene or one ending. The engine follows the branch rather than counting personality points.",
        "zh": "不是。所选行动指向下一幕或一个结局，按分支前进，不累加人格分。"
      }
    },
    {
      "question": {
        "en": "Why do I see fewer than six questions?",
        "zh": "为什么没有看到六题？"
      },
      "answer": {
        "en": "Six nodes exist in the source, but each complete route visits three or four. Unvisited scenes belong to other branches.",
        "zh": "源中有六节点，但每条完整路线只走三或四个，未访问场景属于其他分支。"
      }
    },
    {
      "question": {
        "en": "Are any endings wrong?",
        "zh": "有错误结局吗？"
      },
      "answer": {
        "en": "No. Return, together and open close different parts of the fictional tale, without a moral grade or a preferred winner.",
        "zh": "没有。归还、共作与开放收束虚构故事的不同部分，不给道德等级或指定最佳。"
      }
    },
    {
      "question": {
        "en": "Does an open ending promise a sequel?",
        "zh": "开放结局承诺续集吗？"
      },
      "answer": {
        "en": "No. The parade has arrived and this scene finishes; a path invites imagination without promising another published episode.",
        "zh": "不承诺。游行已抵达，当景完成；小路邀请想象，不保证另有已发布续篇。"
      }
    },
    {
      "question": {
        "en": "What happens if I change an earlier branch?",
        "zh": "改前面的分支会怎样？"
      },
      "answer": {
        "en": "The abandoned branch’s later selections are cleared, so a previous ending cannot silently determine the new route.",
        "zh": "被放弃分支的后续选择会清除，旧结局不会暗中决定新路线。"
      }
    },
    {
      "question": {
        "en": "Can I read all three endings for free?",
        "zh": "可以免费读三种结局吗？"
      },
      "answer": {
        "en": "Yes. Every public ending guide includes its full five-part text, independent of which route you take.",
        "zh": "可以。全部公开结局指南保留完整五部分文本，不取决于本轮路线。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.inklestudios.com/ink/web-tutorial/",
      "label": {
        "en": "Inkle: choices, passages and intentional endings (English; related authoring system)",
        "zh": "Inkle：选择、段落与明确终点（英语；相关写作系统）"
      }
    },
    {
      "url": "https://www.vam.ac.uk/articles/design-and-make-your-own-story",
      "label": {
        "en": "V&A: objects, scenes and a story ending (English; creative activity)",
        "zh": "V&A：物件、场景与故事结尾（英语；创作活动）"
      }
    }
  ]
},
  "stargazing-role": {
  "label": {
    "en": "Original imaginary sky gathering · Patterns, stories and welcome",
    "zh": "原创想象星图聚会 · 图案、故事与欢迎"
  },
  "instructions": {
    "en": "Imagine a gathering around a made-up sky chart. Choose your contribution in six written scenes without identifying real constellations or entering a location. Three raw counts and every equally highest role appear in full.",
    "zh": "想象围绕虚构星图的一次聚会。六个文字场景里选愿意提供的贡献，无需辨真实星座或输入位置；三项原始次数与全部同为最高的角色均完整显示。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "A fictional sky-chart evening that people can join",
        "zh": "让人能够加入的虚构星图夜"
      },
      "paragraphs": [
        {
          "en": "The evening begins with an unfamiliar chart, then brings a new arrival, similar-looking clusters, another activity, a crowded printout and a keepsake. The choices concern what you would add to this imagined gathering, not an observation made under an actual night sky.",
          "zh": "夜晚从陌生星图开始，接着有新人到访、相似星簇、加一个活动、印图过密与留纪念。选择关注愿给这场想象聚会添什么，不是在真实夜空下作观测。"
        },
        {
          "en": "A clear pattern, an invented tale and practical welcome can support the same evening. Selecting one here does not assign you a permanent group role or require you to look after every guest. There is no astronomy knowledge score or prediction about an event.",
          "zh": "清楚图案、虚构故事与实际欢迎，可以支持同一夜晚。本次单选不分配永久群体角色，也不要求照顾每位来客。这里没有天文知识分，也不预测事件。"
        }
      ]
    },
    {
      "id": "pattern",
      "title": {
        "en": "Constellation sketcher: a starting shape, not the only reading",
        "zh": "星形速写者：起始图案，不是唯一读法"
      },
      "paragraphs": [
        {
          "en": "The sketcher portrait looks for a small visible starting point. An original imagined example could connect four dots into a cup outline on a fictional chart, then leave neighboring dots open for another person’s idea. It does not require finding a known real-world figure.",
          "zh": "速写者画像寻找小而可见的起点。一个原创想象例子可以在虚构图上连四点成杯形，把邻近星点留给别人的想法，无需找到现实已知图案。"
        },
        {
          "en": "The IAU distinguishes officially bounded sky areas from figures drawn between stars.[1] Our invented pattern belongs to a story and claims neither official recognition nor astronomical coordinates. Its full guide keeps a tradeoff: a simple starting path leaves details out and should remain an invitation, not the only valid interpretation.",
          "zh": "国际天文学联合会区分正式划界的天空区域与连星图形。[1]本站自创图案属于故事，不声称官方命名或天文坐标。完整指南保留取舍：简单起始路径会省略细节，应保持邀请，而非唯一合法解读。"
        }
      ]
    },
    {
      "id": "tale",
      "title": {
        "en": "Sky-story weaver: leave room for another sentence",
        "zh": "星空故事编织者：给另一句话留位置"
      },
      "paragraphs": [
        {
          "en": "The tale portrait makes a few dots into characters and connections. An original imagined opening could let a paper lantern search for its missing handle among two star clusters. Another participant may change the premise; the activity is collaborative invention, not retelling a documented cultural tradition.",
          "zh": "故事画像把星点变成角色与联系。一个原创想象开头可以让纸灯笼在两簇星点里找丢失的提手；另一参与者可以改前提。活动是共同虚构，不是复述有文献的文化传统。"
        },
        {
          "en": "The original result retains both a possible benefit and a limit: a shared tale offers a way in without technical knowledge, but fixing one version too quickly can crowd out quieter readings. A playful story is not evidence of what a real constellation means or of an innate storytelling talent.",
          "zh": "原结果同时保留可能用处与限制：共同故事提供不依赖专业知识的入口，但一种版本太快定型，会挤掉安静读法。趣味叙事不证明真实星座含义，也不鉴定天生讲故事天赋。"
        }
      ]
    },
    {
      "id": "host",
      "title": {
        "en": "Comfortable-night host: make returning easy, share the work",
        "zh": "舒适星夜照应者：方便回来，也分担准备"
      },
      "paragraphs": [
        {
          "en": "The host portrait notices a place to settle, a manageable viewing turn and a pause with a clear way back. An original example could offer a newcomer a seat and a one-line outline before continuing the fictional chart. People need not stay for the whole evening or contribute a story to belong.",
          "zh": "照应者画像留意安顿位置、合适看图轮次，以及有清楚返回方式的休息。一个原创例子可以先给新人座位与一句安排说明，再继续虚构星图。人们不必全程留下或贡献故事，才算参与。"
        },
        {
          "en": "The full guide also protects the host’s enjoyment. Two useful details and help from a willing participant may be enough; perfect comfort for everyone is not a scored duty. The page gives no venue, weather, equipment or outdoor safety assessment.",
          "zh": "完整指南也保留照应者自己的乐趣。两项有用细节加一位自愿同伴帮忙，也许已经足够；让每人完美舒适不是评分责任。页面不评估场地、天气、设备或户外安全。"
        }
      ]
    },
    {
      "id": "context",
      "title": {
        "en": "Sky simulation and imaginative gathering are different products",
        "zh": "天空模拟与想象聚会，是不同产品"
      },
      "paragraphs": [
        {
          "en": "Stellarium’s official French feature list describes star catalogs, constellation illustrations, time controls and coordinate views.[2] These are related sky-visualization functions. This story instead provides written fictional situations, without computing a real sky, connecting a telescope or asking where you are.",
          "zh": "Stellarium官方法语功能清单介绍恒星目录、星座图示、时间控制与坐标视图。[2]这些是相关天空可视化功能。本站提供虚构文字情境，不计算真实天空，不连接望远镜，也不询问你的位置。"
        },
        {
          "en": "IAU material supplies a factual boundary for the language, while Stellarium shows a related product’s scope. Neither is a validation study of our three roles. The imagined chart and original examples do not copy a cultural star story, a simulation output or another product’s assessment.",
          "zh": "IAU资料提供用词的事实边界，Stellarium展示相关产品范围。两者都不验证本站三角色。想象星图与原创例子，不复制文化星空传说、模拟输出或其他产品的测试。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six contributions counted without a knowledge grade",
        "zh": "六次贡献计数，不给知识等级"
      },
      "paragraphs": [
        {
          "en": "Each scene contains pattern, tale and host once, in varying positions. A selected contribution receives one; each ranges from zero to six, total six. Every equally highest role stays: three-three-zero keeps two complete guides, and two-two-two keeps all three. No answer is marked astronomically correct or incorrect.",
          "zh": "每场景各有图案、故事与照应一次，位置会变化。选中贡献加一次，各项零至六次，总六。同为最高全部保留：三、三、零显示两篇完整指南，二、二、二显示三篇。回答不按天文对错评判。"
        },
        {
          "en": "All original five-part results remain complete. These authored roles have no established psychometric reliability, validity or norms. Start goes straight to the first scene; Back permits changes and retake clears the run. Answers resolve locally; optional tab-only drafts last up to twenty-four hours and clear on completion, retake or deletion. Refresh may lose unsaved progress. No name, coordinates or real observation is requested; cookie-controlled usage analytics remain separate from answers.",
          "zh": "原五部分结果保持完整。原创角色尚无已建立的心理测量信度、效度或常模。开始直接进入首场景，上一题可改选，重玩清空本轮。答案在浏览器内解析；可选本标签页草稿最长二十四小时，完成、重玩或删除清除，刷新可能丢失未保存进度。不索取姓名、坐标或真实观测；受Cookie设置控制的使用统计与答案分开。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Must I know astronomy?",
        "zh": "必须懂天文学吗？"
      },
      "answer": {
        "en": "No. All scenes concern a fictional gathering around an invented chart, without identifying real stars or constellations.",
        "zh": "不用。全部场景围绕虚构星图聚会，不辨真实恒星或星座。"
      }
    },
    {
      "question": {
        "en": "Is this an astrology or prediction quiz?",
        "zh": "这是占星或预测吗？"
      },
      "answer": {
        "en": "No. It counts choices about a fictional activity, without birthdays, horoscopes or predictions.",
        "zh": "不是。这里只统计虚构活动选择，不问生日、不排星盘，也不预测。"
      }
    },
    {
      "question": {
        "en": "Does the chart show tonight’s sky?",
        "zh": "星图会显示今晚天空吗？"
      },
      "answer": {
        "en": "No. There is no real-time sky or location calculation; the chart belongs to the imagined premise.",
        "zh": "不会。没有实时天空或地点计算，星图只属于想象前提。"
      }
    },
    {
      "question": {
        "en": "Can several roles appear?",
        "zh": "可以有多个角色吗？"
      },
      "answer": {
        "en": "Yes. Every equally highest count is kept, and all three complete public guides are available regardless of your result.",
        "zh": "可以。同为最高全部保留，三篇完整公开指南也不受个人结果限制。"
      }
    },
    {
      "question": {
        "en": "Does hosting mean taking responsibility for everyone?",
        "zh": "照应就代表对所有人负责吗？"
      },
      "answer": {
        "en": "No. The original guide encourages a modest shared arrangement and leaves room for the host to enjoy the evening.",
        "zh": "不是。原指南鼓励适度共同行动，也给照应者享受夜晚的空间。"
      }
    },
    {
      "question": {
        "en": "Will I need to share my location?",
        "zh": "需要分享位置吗？"
      },
      "answer": {
        "en": "No. This written-choice story requests no coordinates, observation records or device location.",
        "zh": "不用。文字选择故事不请求坐标、观测记录或设备定位。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.iau.org/IAU/Astronomy-FAQs/Constellations.aspx",
      "label": {
        "en": "IAU: constellation areas and figures (English; factual context)",
        "zh": "国际天文学联合会：星座区域与图形（英语；事实背景）"
      }
    },
    {
      "url": "https://stellarium.org/fr/",
      "label": {
        "en": "Stellarium: official sky-visualization features (French; related product)",
        "zh": "Stellarium：官方天空可视化功能（法语；相关产品）"
      }
    }
  ]
},
  "spell-school-elective": {
  "label": {
    "en": "Four original imaginary electives · Creative interests within this story",
    "zh": "四门原创想象选修课 · 本故事中的创作兴趣"
  },
  "instructions": {
    "en": "Imagine visiting a small fictional school’s elective fair. Choose the project you would enjoy in each of six scenes, without needing prior skills. Four raw counts and every equally highest elective appear in full; no exam, audio recording or real magic task is involved.",
    "zh": "想象走进虚构小学校的选修课展会。六个场景里选愿意体验的项目，无需已有技能；四项原始次数及全部同为最高的课程均完整显示，不考试、不录音，也不完成真实魔法任务。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "Four invented workshops, without a talent ranking",
        "zh": "四间虚构工作坊，不排天赋等级"
      },
      "paragraphs": [
        {
          "en": "The fair offers teacup weather, pocket architecture, echo letters and floating shapes. Scenes progress through a first project, a classmate’s question, extra workshop time, an unfinished question and a final showcase. They ask what catches your interest here, not which course you would succeed in.",
          "zh": "展会提供杯中天气、口袋建筑、回声书信与漂浮形状。场景依次涉及首个项目、同学提问、额外时间、未完问题与最后展示。问题询问此处什么吸引你，不判断哪门课一定学得好。"
        },
        {
          "en": "These are original fictional subjects rather than houses from a commercial fantasy school. Their interests can overlap: a miniature room can have atmosphere, spoken words and moving parts. The selected emphasis is not a learning-style diagnosis, career recommendation or proof of magical ability.",
          "zh": "这些是原创虚构科目，不是商业幻想学校的学院。兴趣可交叠：微型房间也可以有氛围、话语与运动部件。所选侧重不是学习风格诊断、职业推荐或魔法能力证明。"
        }
      ]
    },
    {
      "id": "weather",
      "title": {
        "en": "Teacup weather: compare two atmospheres",
        "zh": "杯中天气：比较两种氛围"
      },
      "paragraphs": [
        {
          "en": "The weather studio follows a cloud, light or imagined breeze changing one small scene. An original example might show the same paper window under a pale morning and a coral evening. The scene stays small enough to notice a change without constructing a whole fictional climate.",
          "zh": "天气工作室关注云、光或想象微风怎样改变小场景。一个原创例子可以把同一纸窗分别放在浅色早晨与珊瑚色傍晚。场景足够小，方便看变化，不必构建完整虚构气候。"
        },
        {
          "en": "The original guide keeps interpretations open. A setting you find restful may feel different to another viewer; atmosphere does not guarantee an emotion. Its optional two-version exercise can use existing materials, with no photograph upload, light measurement or weather forecast.",
          "zh": "原指南保留不同解释。你觉得安静的环境，另一观众可能感觉不同；氛围不保证情绪。可选的两版本练习可以用已有材料，无需上传照片、测光或天气预报。"
        }
      ]
    },
    {
      "id": "architecture",
      "title": {
        "en": "Pocket architecture: a small outline with a clear use",
        "zh": "口袋建筑：小轮廓，清楚用途"
      },
      "paragraphs": [
        {
          "en": "The architecture workshop explores an entrance, seat or compartment in a tiny imaginary room. Cambridge Museums’ activity introduces making a miniature room inspired by a matchbox kitchen.[1] It is related creative context; this page supplies written choices rather than a model-building lesson.",
          "zh": "建筑工坊探索想象小房间的入口、座位或暗格。剑桥大学博物馆的活动介绍受火柴盒厨房启发制作微型房间。[1]它是相关创作背景；本站提供文字选择，不提供模型制作课程。"
        },
        {
          "en": "The complete portrait asks how another person would enter and use a sketch before another secret compartment is added. A clever miniature can be hard to understand. This playful question does not establish architectural access, building safety or professional design competence.",
          "zh": "完整画像建议加下一个暗格前，先问别人怎样进入与使用草图。巧妙微缩设计也可能难理解。这种趣味提问不验证建筑无障碍、结构安全或专业设计能力。"
        }
      ]
    },
    {
      "id": "echo",
      "title": {
        "en": "Echo letters: words, pauses and another reading",
        "zh": "回声书信：话语、停顿与另一种读法"
      },
      "paragraphs": [
        {
          "en": "The echo classroom imagines one short line heard in contrasting rhythms. An original example could read an invitation first eagerly and then with a curious pause. No audio is generated or captured here: the selected option expresses which fictional project you would try.",
          "zh": "回声教室想象一句短话在不同节奏里的听感。一个原创例子可以把邀请先读得热切，再添好奇停顿。本站不生成或采集音频，所选项表达愿意尝试哪个虚构项目。"
        },
        {
          "en": "The full guide distinguishes an imagined reading from a real speaker’s intention. A tone is not a hidden code that proves motive. The optional experiment uses a non-private line and leaves its author’s intention open when unknown, rather than scoring communication talent.",
          "zh": "完整指南区分想象读法与真实说话者意图。语气不是证明动机的隐藏密码。可选尝试使用不涉及隐私的短句，作者意图未知时保持开放，不给沟通天赋评分。"
        }
      ]
    },
    {
      "id": "floating",
      "title": {
        "en": "Floating shapes: one change in a relationship of parts",
        "zh": "漂浮形状：局部变化与整体关系"
      },
      "paragraphs": [
        {
          "en": "The floating-shapes project follows spacing, a slow movement or a small wobble. An original imagined display could let three paper disks exchange places while their colors stay the same. In the optional experiment, changing one position on a flat surface is enough to consider a different composition.",
          "zh": "漂浮项目关注间距、缓慢移动或轻晃。一个原创想象展品可以让三片纸圆交换位置、颜色不变。可选尝试中，只改平面上的一个位置，就足以思考不同构图。"
        },
        {
          "en": "The guide also values a pause: a moving display may demand more attention than a viewer wants. This is not a physics simulator or a measurement of visual intelligence. The decorative illustration stays static, and the page does not ask you to suspend real objects.",
          "zh": "指南也珍惜暂停：运动展品可能索取超过观众愿意给的注意力。这不是物理模拟器或视觉智力测量。装饰插画保持静态，页面不要求悬挂真实物件。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices, four counts and every reachable highest tie",
        "zh": "六次选择、四项次数与可出现的最高并列"
      },
      "paragraphs": [
        {
          "en": "Each scene offers all four electives once, with changing option positions. One selection adds one count, each ranges from zero to six and the total is six. All equally highest electives remain. Three-three-zero-zero gives two and two-two-two-zero gives three; a four-way highest tie is impossible with six whole counts divided across four electives.",
          "zh": "每场景各提供四门课一次，位置会变化。选一次加一次，各项零至六次，总和六。同为最高全部保留。三、三、零、零显示两篇，二、二、二、零显示三篇；六个整数次数无法让四门课同为最高。"
        },
        {
          "en": "Four complete public guides keep their original examples, benefits, tradeoffs and optional experiments. These authored interests have no established psychometric reliability, validity or norms. Start opens the first question, Back permits edits and retake clears this run. Answers resolve in the browser; optional tab-only drafts last up to twenty-four hours, clearing on completion, retake or deletion. Unsaved progress may be lost on refresh. No name, audio or real work is requested; cookie-controlled usage analytics are separate from answers.",
          "zh": "四篇公开指南保留原例子、用处、取舍与可选尝试。原创兴趣尚无已建立的心理测量信度、效度或常模。开始打开第一题，上一题可改选，重玩清空本轮。答案在浏览器内解析；可选本标签页草稿最长二十四小时，完成、重玩或删除清除，刷新可能丢失未保存进度。不索取姓名、音频或真实作品；受Cookie设置控制的使用统计与答案分开。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Is this an official fantasy-school sorting quiz?",
        "zh": "这是官方幻想学校分院吗？"
      },
      "answer": {
        "en": "No. All four electives and this school are original fictional premises, without licensed houses or official affiliation.",
        "zh": "不是。四门选修课和学校均为原创虚构前提，不使用授权学院或声称官方关联。"
      }
    },
    {
      "question": {
        "en": "Do I need prior creative skills?",
        "zh": "需要已有创作技能吗？"
      },
      "answer": {
        "en": "No. Choose which project you would enjoy trying; the story does not inspect a finished work or grade skill.",
        "zh": "不用。选愿意尝试的项目，故事不检查完成作品或评技能。"
      }
    },
    {
      "question": {
        "en": "Does an echo-letter answer record my voice?",
        "zh": "选回声书信会录音吗？"
      },
      "answer": {
        "en": "No. All responses are written choices; the page requests no microphone or audio file.",
        "zh": "不会。全部回应是文字选择，不请求麦克风或音频文件。"
      }
    },
    {
      "question": {
        "en": "Can all four electives tie?",
        "zh": "四门课能同时最高吗？"
      },
      "answer": {
        "en": "No. Six whole counts cannot be equally divided among four electives. Two- and three-way highest ties are retained completely.",
        "zh": "不能。六个整数次数无法四等分，两门或三门最高并列均完整保留。"
      }
    },
    {
      "question": {
        "en": "Does a high architecture count certify design skill?",
        "zh": "建筑次数高能证明设计技能吗？"
      },
      "answer": {
        "en": "No. It records chosen fictional projects, without testing construction, spatial ability or professional competence.",
        "zh": "不能。它记录所选虚构项目，不考施工、空间能力或专业胜任。"
      }
    },
    {
      "question": {
        "en": "Are all four guides readable without taking the quiz?",
        "zh": "不作答也能读四篇指南吗？"
      },
      "answer": {
        "en": "Yes. All complete public guides are free, and reading them does not change the selection or counting rules.",
        "zh": "可以。全部完整公开指南免费，阅读不改变选项或计数规则。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.museums.cam.ac.uk/school-sessions/explore-and-create-make-miniature-room",
      "label": {
        "en": "Cambridge Museums: miniature-room activity (English; creative context)",
        "zh": "剑桥大学博物馆：微型房间活动（英语；创作背景）"
      }
    }
  ]
},
  "souvenir-story": {
  "label": {
    "en": "Original keepsake scenes · Everyday use, a moment or a shared story",
    "zh": "原创留念情境 · 日常用途、片刻与共同故事"
  },
  "instructions": {
    "en": "Imagine a small reminder you can legitimately keep, including an existing ticket, note, photograph or ordinary object. Choose what matters in six written scenes; no purchase, photograph upload or personal history is needed. Read all equally highest portraits in full.",
    "zh": "想象一份有权保留的小提醒，可以是已有票根、短记、照片或普通物件。六个文字场景里选择看重什么，不需购买、上传照片或提供个人经历；同为最高的画像均可完整阅读。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "What gives an ordinary reminder a place after an outing?",
        "zh": "一次外出之后，普通提醒为何留下？"
      },
      "paragraphs": [
        {
          "en": "The scenes follow a reminder from choosing it to rediscovering it: an old ticket, an introduction to a keepsake, limited space and a return after years. They compare reasons for keeping something, without appraising its price, rarity, ownership status or the quality of the experience it recalls.",
          "zh": "场景沿着选择到重新发现展开：旧票、介绍纪念物、空间有限，以及多年后重看。它们比较保留理由，不鉴定价格、稀有性、收藏身份，也不评价所忆经历的质量。"
        },
        {
          "en": "An object may be useful, connected to a moment and shared with someone at once. The single-choice format brings one reason forward in each scene. Keeping nothing can also be a legitimate real-life choice; an enjoyable experience needs no possession to prove that it happened.",
          "zh": "同一物件可以既可用，又连着片刻，也属于共同故事。单选在每场景凸显一种理由。现实中不留任何物件也可以；愉快经历无需靠拥有物品证明曾经发生。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Useful companion: a past outing joins present life",
        "zh": "日常物件：让过去的外出参与现在"
      },
      "paragraphs": [
        {
          "en": "The useful-companion portrait notices what a reminder does now. An original imagined example could let an already-owned illustrated card mark a recipe page. Its value in this story comes from a place in an ordinary routine, not from how impressive its reuse looks.",
          "zh": "日常物件画像注意提醒现在能做什么。一个原创想象例子是让已有插画卡夹在菜谱页。故事里的价值来自普通习惯中的位置，不取决于再利用显得多巧妙。"
        },
        {
          "en": "The full guide leaves meaning without a task. A fragile or unsuitable keepsake need not be handled daily, and a reminder does not have to earn storage through productivity. The optional experiment asks whether a simple use would help you enjoy an existing item, then permits the answer to be no.",
          "zh": "完整指南也允许意义无需任务。易损或不适合的纪念物不必天天使用，提醒也无需靠生产力换取存放空间。可选尝试问简单用途是否有助享用已有物件，也允许答案是否定。"
        }
      ]
    },
    {
      "id": "moment",
      "title": {
        "en": "Moment marker: one detail without a complete replay",
        "zh": "片刻记号：留一个细节，不求完整回放"
      },
      "paragraphs": [
        {
          "en": "The moment-marker portrait gives a specific scene a cue: a color, sound or short note rather than a complete record of an outing. An original imagined line might remember the orange chair where a street performance began. It need not describe every person or reconstruct everything that followed.",
          "zh": "片刻记号画像为具体场景留下线索：颜色、声音或短记，而非出游全记录。一个原创想象短句可以记下街头表演开始时的橙色椅子，无需描述每个人或重建全部后续。"
        },
        {
          "en": "V&A Dundee’s writing activity invites visitors to look at an object and gather personal words and impressions.[1] It provides related creative context, not a method for verifying memory. Our full guide preserves uncertainty: an object cannot certify an exact replay, and leaving some of a pleasant experience unrecorded is allowed.",
          "zh": "V&A Dundee的写作活动邀请参观者观察物件，收集个人词语与印象。[1]它提供相关创作背景，不是验证记忆的方法。本站完整指南保留不确定性：物件不能认证精确回放，愉快经历也可以部分不记录。"
        }
      ]
    },
    {
      "id": "shared",
      "title": {
        "en": "Shared story: invite another version, not a memory test",
        "zh": "共同故事：邀请另一个版本，不考记忆"
      },
      "paragraphs": [
        {
          "en": "The shared-story portrait treats a reminder as a possible opening for conversation. An original example could be a saved program from a small community performance, offered to someone who attended if they welcome the topic. Their account may add a different detail without replacing yours.",
          "zh": "共同故事画像把提醒当作一种可能的对话入口。一个原创例子是保留小型社区演出的节目单，在对方愿意谈时向同行者提起。他们的讲述可以加入不同细节，不替换你的版本。"
        },
        {
          "en": "The original tradeoff keeps present needs separate from a past connection. A shared object creates no obligation to reply, agree or maintain the same closeness forever. The optional experiment is an invitation that can be declined, not evidence that the other person remembers, cares or values the occasion less.",
          "zh": "原取舍把当下需要与过去连接分开。共同物件不产生必须回话、认同或永远保持同等亲近的义务。可选尝试是可以拒绝的邀请，不用来证明对方记得较少、较不关心或较不重视那次经历。"
        }
      ]
    },
    {
      "id": "context",
      "title": {
        "en": "Object records and personal associations answer different questions",
        "zh": "物件记录与个人联系，回答不同问题"
      },
      "paragraphs": [
        {
          "en": "The Louvre’s French record for a cup and saucer lists an object title, inventory identifier, approximate date, materials and acquisition history.[2] Such documentation describes a collection object. It does not determine what a personal cup means to its owner or provide a universal interpretation of souvenir choices.",
          "zh": "卢浮宫法语杯碟记录列出名称、馆藏编号、大致年代、材料与入藏历史。[2]这类资料描述馆藏物件，不决定一只私人杯子对物主意味着什么，也不提供纪念物选择的普遍解码。"
        },
        {
          "en": "The museum record and creative-writing activity are related references, not equivalent quiz competitors or validation studies. Our prompts and examples are original. The page neither identifies an uploaded object nor prices it, stores a personal collection, recovers memories or assesses sentimentality.",
          "zh": "馆藏记录与创意写作活动是相关参考，不是等价测试竞品或验证研究。本站提示与例子均为原创；页面不识别上传物品，不估价、不保存私人收藏、不找回记忆，也不测多愁善感。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six reasons selected, three counts and complete highest ties",
        "zh": "六次理由选择，三项次数与全部最高并列"
      },
      "paragraphs": [
        {
          "en": "Each scene presents use, moment and shared once, with changing positions. The selected reason receives one count; each ranges from zero to six and the total is six. All equally highest portraits remain: three-three-zero gives two, and two-two-two gives all three. No count is a sentimental-value percentage or a memory-ability score.",
          "zh": "每个场景各呈现用途、片刻与共同故事一次，位置会变化。选中理由加一次，各项零至六次，总和六。同为最高的画像全部保留：三、三、零显示两篇，二、二、二显示三篇。次数不是情感价值百分比或记忆能力分。"
        },
        {
          "en": "All five original result fields remain complete. The authored categories have no established psychometric reliability, validity or norms. Start opens the first question, Back permits edits and retake clears this run. Answers resolve in the browser; optional saving keeps a tab-only draft for up to twenty-four hours and clears on completion, retake or deletion. Refresh may lose unsaved progress. No photo, names, location or personal memory text is requested; cookie-controlled usage analytics are separate from answers.",
          "zh": "原五部分结果保持完整。原创分类尚无已建立的心理测量信度、效度或常模。开始直接打开第一题，上一题可改选，重玩清空本轮。答案在浏览器内解析；可选本标签页保存最长二十四小时，完成、重玩或删除清除，刷新可能丢失未保存进度。不索取照片、姓名、位置或私人记忆文本；受Cookie设置控制的使用统计与答案分开。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Do I need to buy a souvenir?",
        "zh": "需要购买纪念品吗？"
      },
      "answer": {
        "en": "No. Imagine an existing reminder you can legitimately keep. A ticket, note or ordinary object is sufficient; no purchase is part of the flow.",
        "zh": "不用。想象一份已有且有权保留的提醒即可，票根、短记或普通物件都可以；流程不含购买。"
      }
    },
    {
      "question": {
        "en": "Is this a test of memory accuracy?",
        "zh": "这是记忆准确性测试吗？"
      },
      "answer": {
        "en": "No. The scenes ask what makes a reminder meaningful. There is no recall task or external verification of a remembered event.",
        "zh": "不是。场景询问什么让提醒有意义，没有回忆测验，也不核实所忆事件。"
      }
    },
    {
      "question": {
        "en": "Can one object fit all three portraits?",
        "zh": "一个物件能符合三篇画像吗？"
      },
      "answer": {
        "en": "Yes. The three reasons can coexist. Counts summarize which reason you selected first in each supplied scene.",
        "zh": "可以。三种理由能够并存，次数只汇总各给定场景中先选了什么。"
      }
    },
    {
      "question": {
        "en": "Must a useful keepsake be used every day?",
        "zh": "有用的纪念物必须每天使用吗？"
      },
      "answer": {
        "en": "No. The full guide retains meaning without productivity and recognizes that some objects are fragile or unsuitable for daily handling.",
        "zh": "不用。完整指南保留不实用也有意义的空间，也认可某些物件易损或不适合天天使用。"
      }
    },
    {
      "question": {
        "en": "Does a shared reminder oblige someone to reply?",
        "zh": "共同提醒让对方有义务回应吗？"
      },
      "answer": {
        "en": "No. An optional conversation can be declined, and different present needs do not erase a past experience.",
        "zh": "不会。可选对话可以拒绝，当下需要不同，也不抹去过去的经历。"
      }
    },
    {
      "question": {
        "en": "Why are several complete guides shown?",
        "zh": "为什么显示多篇完整指南？"
      },
      "answer": {
        "en": "Every equally highest reason is retained without a tie-break. All three public guides are also freely readable outside your result.",
        "zh": "同为最高的理由全部保留，不破同分；本次结果之外，三篇公开指南也均可免费读。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.vam.ac.uk/dundee/articles/just-add-words",
      "label": {
        "en": "V&A Dundee: personal writing in response to objects (English; creative activity)",
        "zh": "V&A Dundee：回应物件的个人写作（英语；创作活动）"
      }
    },
    {
      "url": "https://collections.louvre.fr/ark:/53355/cl010101085",
      "label": {
        "en": "Louvre: cup-and-saucer collection record (French; documentation example)",
        "zh": "卢浮宫：杯碟馆藏记录（法语；记录示例）"
      }
    }
  ]
},
  "snow-day": {
  "label": {
    "en": "Original illustrated snow scenes · Shape, character and rearrangement",
    "zh": "原创插画雪景 · 构成、角色与重排"
  },
  "instructions": {
    "en": "Look at six original static scenes with matching written descriptions. Choose how you would arrange an imaginary snow sculpture; no real snow, drawing upload or outdoor task is needed. All six choices produce three counts and every equally highest guide in full.",
    "zh": "查看六幅原创静态场景及对应文字说明，选择怎样安排想象雪雕；不需要真实下雪、上传绘画或完成户外任务。完成六次选择，查看三项次数与全部同为最高的指南全文。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "An imaginary snow sculpture, from first shape to postcard",
        "zh": "一座想象雪雕：从第一块形状到明信片"
      },
      "paragraphs": [
        {
          "en": "The six scenes begin with a blank patch, then introduce a leaning form, a friend’s addition, one final detail, partial melting and a postcard view. Illustrations accompany the written choices; neither a physical sculpture nor a simulated building canvas is produced by selecting an option.",
          "zh": "六个场景从空白雪地开始，随后出现歪斜形状、朋友新增、一处最后细节、部分融化与明信片画面。插画陪伴文字选择；选中选项不会生成实体雪雕或模拟搭建画布。"
        },
        {
          "en": "Arrangement, expression and a scene open to another move are different creative aims. You may combine them in a single imagined build. The result describes what you selected in this small scene, without judging artistic talent, engineering skill, emotional style or outdoor competence.",
          "zh": "构成、表达与留给下一步变化，是不同创作目的，可以合在同一想象搭建里。结果描述这幕小场景的所选内容，不评价艺术天赋、工程技能、情绪风格或户外能力。"
        }
      ]
    },
    {
      "id": "builder",
      "title": {
        "en": "Snow-shape builder: visual relationships between parts",
        "zh": "雪形搭建者：部件之间的视觉关系"
      },
      "paragraphs": [
        {
          "en": "The builder portrait follows the pleasure of a recognizable base, repeated forms and a composition that feels connected. An original paper exercise could place five scraps on a page, moving the larger ones before fixing a small accent. No glue, snow or special equipment is needed to imagine it.",
          "zh": "搭建者画像关注可辨的底座、重复形状与连贯构图的乐趣。一个原创纸上练习可以把五片碎纸排在纸页上，先移动大块，再确定小点缀；只想象即可，无需胶水、真雪或专门设备。"
        },
        {
          "en": "The complete guide keeps room for an unexpected addition: a visually tidy arrangement can become restrictive if every newcomer must preserve it. Visual balance in an illustration is not evidence of real structural stability; the game gives no load, material or weather calculations.",
          "zh": "完整指南为意外新增留出位置：若每次加入都必须维护原样，整齐布局也会拘束。插画中的视觉平衡不证明实体结构稳定；游戏没有荷载、材料或天气计算。"
        }
      ]
    },
    {
      "id": "character",
      "title": {
        "en": "Snow-cast creator: a gesture and a moment",
        "zh": "雪中角色创造者：一个动作，一幕瞬间"
      },
      "paragraphs": [
        {
          "en": "The character portrait imagines a face, a lean or a line of dialogue. An original example might turn a tilted oval into a snow courier reaching for a postcard. The fictional gesture gives an accidental shape a role, rather than revealing anything hidden about the player.",
          "zh": "角色画像想象表情、歪斜动作或一句对白。一个原创例子可以把倾斜椭圆变成伸手接明信片的雪中信使。虚构动作让偶然形状有角色，不揭示玩家隐藏的特征。"
        },
        {
          "en": "A shape may also remain simply a shape. The original tradeoff avoids requiring a biography for every piece, while its optional prompt adds just one gesture and one spoken line to an existing doodle. You do not need to upload that doodle or explain personal experiences.",
          "zh": "形状也可以只是形状。原取舍不要求每个部件都有身世；可选提示只给已有涂鸦添一个动作与一句对白。无需上传涂鸦，也不必解释个人经历。"
        }
      ]
    },
    {
      "id": "player",
      "title": {
        "en": "Rearranging snow-player: agree what can move",
        "zh": "重排雪景玩家：约清哪些可以移动"
      },
      "paragraphs": [
        {
          "en": "The player portrait keeps a doorway, loose piece or new path available for another turn. An original imagined scene might leave two paper tokens outside an arch so another participant can propose a route. This is an invitation to change a shared scene, not permission to alter somebody else’s finished work.",
          "zh": "重排画像为下一回合留下小门、松散部件或新路线。一个原创想象场景可以在拱门外留两枚纸棋子，邀请另一人提议走法。这是邀请共同改变场景，不授权改动别人的成品。"
        },
        {
          "en": "The full guide distinguishes a movable part from a part finished for now. Constant rearrangement may frustrate someone hoping to keep a picture. Both kinds of enjoyment can coexist when participants agree on the boundary; neither is ranked above the other.",
          "zh": "完整指南区分可移动部分与暂时完成部分。不断重排，可能让想保留画面的人困扰。参与者约清边界，两种乐趣可以并存，不给彼此排高低。"
        }
      ]
    },
    {
      "id": "context",
      "title": {
        "en": "Related building games, different interactions",
        "zh": "相关搭建游戏，不同互动机制"
      },
      "paragraphs": [
        {
          "en": "Townscaper’s official English description presents a digital building toy that turns placed blocks into town forms.[1] Dorfromantik’s French introduction describes hexagonal tiles used to expand a landscape and complete quests.[2] They offer related examples of arranging parts, with mechanics different from this six-choice story.",
          "zh": "Townscaper官方英语介绍把产品描述为将放置方块转成城镇形态的数字搭建玩具。[1]Dorfromantik法语介绍描述用六边形板块扩展景观、完成任务。[2]它们是安排部件的相关例子，机制与本六次选择故事不同。"
        },
        {
          "en": "Our six snow panels are original static drawings, with equivalent text available in both languages. They copy no game assets or layouts and do not simulate either product. Partial melting is a fictional change in a panel, not a forecast or a real snow-construction lesson.",
          "zh": "本站六幅雪景为原创静态绘图，双语均有等价文字，不复制这些游戏的素材或布局，也不模拟其产品。部分融化是画格里的虚构变化，不是天气预报或真实堆雪教学。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices retain all highest creative emphases",
        "zh": "六次选择，保留全部最高创作侧重"
      },
      "paragraphs": [
        {
          "en": "Each scene offers builder, character and player once, with varying option positions. One choice adds one count; each emphasis ranges from zero to six and the completed total is six. All equally highest portraits appear in full: three-three-zero gives two and two-two-two gives three. There is no correctness score or random tie-break.",
          "zh": "每个场景各提供搭建、角色与重排一次，选项位置会变化。选一次加一次，各项零至六次，完成总和六。同为最高的画像均显示全文：三、三、零显示两篇，二、二、二显示三篇。没有答对分或随机破同分。"
        },
        {
          "en": "The original five-part guides remain complete. These recreational emphases have no established psychometric reliability, trait validity or norms. Start enters the first scene directly, Back permits edits and retake clears answers. Resolution happens in the browser; optional tab-only saving lasts up to twenty-four hours and clears on completion, retake or deletion. Unsaved progress may be lost on refresh. No picture upload, weather data or personal location is requested; cookie-controlled usage analytics are separate from answers.",
          "zh": "原五部分指南保持完整。这些趣味侧重尚无已建立的心理测量信度、特质效度或常模。开始直接进入首场景，上一题可改选，重玩清空答案。结果在浏览器内解析；可选本标签页保存最长二十四小时，完成、重玩或删除会清除，刷新可能丢失未保存进度。不索取图片上传、天气数据或个人位置；受Cookie设置控制的使用统计与答案分开。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Do I need real snow or a drawing?",
        "zh": "需要真雪或绘画作品吗？"
      },
      "answer": {
        "en": "No. The six illustrations and written choices are already supplied, and no upload or outdoor activity is required.",
        "zh": "不用。六幅插画与文字选择已提供，无需上传或户外活动。"
      }
    },
    {
      "question": {
        "en": "Can I move pieces on the page?",
        "zh": "可以在页面里移动部件吗？"
      },
      "answer": {
        "en": "No. The scenes are static illustrations. You select a written response about an imagined move; this is not a draggable building editor.",
        "zh": "不能。场景为静态插画，你选择关于想象移动的文字回应；这里不是可拖拽搭建编辑器。"
      }
    },
    {
      "question": {
        "en": "Can I play using the descriptions alone?",
        "zh": "只读文字说明可以玩吗？"
      },
      "answer": {
        "en": "Yes. Every panel has a written description, and the question and all options remain text. There is no timed visual-identification task.",
        "zh": "可以。每幅都有文字描述，题目与全部选项仍为文字，没有限时视觉辨认任务。"
      }
    },
    {
      "question": {
        "en": "Is the most stable sculpture the best result?",
        "zh": "最稳固的雪雕就是最佳结果吗？"
      },
      "answer": {
        "en": "No. Visual arrangement, character expression and changeable play serve different aims. The story makes no real structural assessment.",
        "zh": "不是。视觉构成、角色表达与可变玩法服务不同目的，故事不进行实体结构评估。"
      }
    },
    {
      "question": {
        "en": "Why can I receive more than one guide?",
        "zh": "为什么有多篇指南？"
      },
      "answer": {
        "en": "All equally highest counts are retained. Two-two-two shows all three complete portraits, without choosing a winner.",
        "zh": "同为最高的次数全部保留。二、二、二显示全部三篇完整画像，不强选胜者。"
      }
    },
    {
      "question": {
        "en": "Does the melting panel predict weather or describe my resilience?",
        "zh": "融化画格会预测天气或描述韧性吗？"
      },
      "answer": {
        "en": "No. It introduces a fictional change in the sculpture. Your response is not a forecast, resilience scale or psychological diagnosis.",
        "zh": "不会。它只引入雪雕的虚构变化，回答不是预报、韧性量表或心理诊断。"
      }
    }
  ],
  "references": [
    {
      "url": "https://store.steampowered.com/app/1291340/Townscaper/?l=english",
      "label": {
        "en": "Townscaper: official building-toy introduction (English; related game)",
        "zh": "Townscaper：官方搭建玩具介绍（英语；相关游戏）"
      }
    },
    {
      "url": "https://store.steampowered.com/app/1455840/Dorfromantik/?l=french",
      "label": {
        "en": "Dorfromantik: official tile-landscape introduction (French; related game)",
        "zh": "Dorfromantik：官方板块景观介绍（法语；相关游戏）"
      }
    }
  ]
},
  "small-apology": {
  "label": {
    "en": "Original minor mix-up scenes · Acknowledge, correct and leave response space",
    "zh": "原创小失误情境 · 承认、纠正与回应空间"
  },
  "instructions": {
    "en": "Imagine a minor everyday mix-up such as an incorrect meeting time or a late return. Choose your first response in six scenes, without entering a real dispute or contacting anyone. Complete all six to read three counts and every equally highest portrait in full.",
    "zh": "想象见面时间发错、借物晚还等轻微日常失误。六个场景里选择第一步，不输入真实纠纷，也不联系任何人；完成六题，查看三项次数与全部同为最高的完整画像。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "A small mix-up: which part would you address first?",
        "zh": "一件小失误：你会先处理哪部分？"
      },
      "paragraphs": [
        {
          "en": "The scenes move from sending a wrong detail to hearing its effect, deciding whether to explain, responding to an unwanted corrective offer and considering what would be complete enough. The subject is an ordinary inconvenience, not serious harm, coercion, a legal dispute or a clinical assessment.",
          "zh": "场景从发错细节，走到听见影响、考虑是否解释、面对不被需要的补救，以及怎样才算足够完整。主题是普通不便，不涉及严重伤害、胁迫、法律纠纷或临床评估。"
        },
        {
          "en": "Clear acknowledgment, practical correction and an unpressured response can coexist. Selecting one first makes the immediate emphasis visible; it does not mean the other two should be omitted. A portrait cannot decide whether another person ought to forgive you or how they actually feel.",
          "zh": "清楚承认、实际纠正与不催促的回应可以并存。先选一种，让此刻侧重可见，不表示其余两种应被省去。画像不能决定别人应否原谅，也不能识别对方真实感受。"
        }
      ]
    },
    {
      "id": "name",
      "title": {
        "en": "Acknowledge a specific action and its effect",
        "zh": "承认具体行动及其影响"
      },
      "paragraphs": [
        {
          "en": "The clear-acknowledgment guide begins with the part you can accurately own. An original example is saying that you sent the wrong entrance number and recognizing that the other person waited elsewhere. You need not describe their feelings for them or add a long account of your intentions.",
          "zh": "清楚承认指南从能够准确认下的部分开始。一个原创例子是说清自己发错入口编号，承认让对方等在别处；无需替对方描述感受，也不必长讲自己的意图。"
        },
        {
          "en": "The original guide keeps a practical tradeoff: repeated acknowledgment leaves an agreed correction undone. After the error is clear, ask what adjustment is wanted and feasible. Naming your part is different from asking the recipient to confirm that you are a good person.",
          "zh": "原指南保留实际取舍：反复承认，仍可能没有完成已约纠正。说清失误后，可问什么调整是对方愿意且实际可行的。认下自己的部分，与要求接收者证明自己是好人，是不同的事情。"
        }
      ]
    },
    {
      "id": "repair",
      "title": {
        "en": "Offer a feasible correction that can be declined",
        "zh": "提供可行、也可被拒绝的纠正"
      },
      "paragraphs": [
        {
          "en": "The concrete-correction guide turns toward what can change now. For a borrowed notebook returned to the wrong place, an original possible offer is one realistic handover time, checked with its owner. The story does not require a grand gesture, a gift or a promise to do anything at all.",
          "zh": "具体纠正指南关注现在能改变什么。借来的笔记本还错地方时，一个原创可选提供是现实可行的交接时间，再与物主确认。故事不要求宏大表示、礼物或“什么都愿意做”的承诺。"
        },
        {
          "en": "A proposed correction is an offer, not a condition the other person must accept. If it is unwanted, listen before replacing it with something larger. Acting quickly may also bypass the acknowledgment they wanted; an agreed action and a brief admission can belong to the same exchange.",
          "zh": "纠正是提供，不是对方必须接受的条件。不被需要时，可先听清，而非立刻换成更大的表示。行动太快也可能绕过对方想要的承认；已约行动与简短认下，可以属于同一次交流。"
        }
      ]
    },
    {
      "id": "space",
      "title": {
        "en": "Leave the reply open without abandoning your part",
        "zh": "让回应保持开放，也保留自己的责任"
      },
      "paragraphs": [
        {
          "en": "The response-space guide separates your next action from the recipient’s reply. An original example is confirming how a late-returned item will be delivered, then leaving the person free to respond rather than repeatedly asking whether they are definitely no longer annoyed.",
          "zh": "回应空间指南把自己的下一行动与接收者的回话分开。一个原创例子是确认晚还物品怎样交接后，让对方自由回应，而不是反复询问是否已经肯定不再不快。"
        },
        {
          "en": "Space alone does not name the error or perform the correction. Make those parts clear before treating a pause as sufficient. A quiet response is not evidence of forgiveness, agreement or rejection, and the page has no access to the other person’s interpretation.",
          "zh": "只留空间，不会自动说清错误或完成纠正。可先把这些部分交代清楚，再看暂停是否合适。安静回应不证明原谅、同意或拒绝，页面也无法访问另一人的理解。"
        }
      ]
    },
    {
      "id": "evidence",
      "title": {
        "en": "Research context is not a validation of three apology types",
        "zh": "研究背景，不是三种致歉类型的验证"
      },
      "paragraphs": [
        {
          "en": "Ohio State’s report of Lewicki and colleagues’ 2016 research describes two experiments with 755 participants rating apologies in a hypothetical hiring scenario. Acknowledging responsibility and offering repair were important components in those ratings.[1] The report concerns judgments about presented apologies, not observed outcomes in your relationship.",
          "zh": "俄亥俄州立大学对Lewicki等人2016年研究的报道，介绍两项共755名参与者的实验，评价虚构招聘场景里的道歉。承认责任与提供补救，是这些评价中的重要组成部分。[1]报道讨论对所呈现道歉的判断，不是你所在关系的实测结果。"
        },
        {
          "en": "This authored story neither reproduces that experiment nor measures its six components. Its three counts summarize selected options only; they have no established psychometric reliability, validity or norms. The source does not validate these portraits, guarantee acceptance or rank your moral worth.",
          "zh": "本原创故事既不复现该实验，也不测其六个组成部分。三项次数仅汇总所选项，尚无已建立的心理测量信度、效度或常模。来源不验证这些画像，不保证被接受，也不给人的道德价值排名。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six first steps, three counts and no forgiveness score",
        "zh": "六次第一步、三项次数，不给原谅打分"
      },
      "paragraphs": [
        {
          "en": "Every scene contains one name, repair and space option, with some positions changing. A selection adds one to its emphasis; each ranges from zero to six, with six in total. All equally highest emphases remain: three-three-zero keeps two full guides, and two-two-two keeps all three.",
          "zh": "每个场景各有一项承认、纠正与空间，部分位置会变化。选择给对应侧重加一次，各项零至六次，总和六次。同为最高全部保留：三、三、零显示两篇全文，二、二、二显示三篇。"
        },
        {
          "en": "Each original portrait retains its summary, example, possible benefit, tradeoff and optional experiment. Start opens the first question directly; Back permits changes and retake clears this run. Answers resolve in the browser. Optional saving keeps a tab-only draft for up to twenty-four hours, cleared on completion, retake or deletion; unsaved progress may be lost on refresh. No message is sent and no dispute details are requested. Cookie-controlled usage analytics remain separate from answers.",
          "zh": "每篇原画像保留概述、例子、可能用处、取舍与可选尝试。开始直接打开第一题，上一题可改选，重玩清空本轮。答案在浏览器内解析；可选保存把草稿留在本标签页最长二十四小时，完成、重玩或删除会清除，刷新可能丢失未保存进度。不发送消息，不索取纠纷细节；受Cookie设置控制的使用统计与答案分开。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Is this an apology-language or maturity test?",
        "zh": "这是道歉语言或成熟度测试吗？"
      },
      "answer": {
        "en": "No. These are three authored first-step emphases in six minor fictional situations, without a validated personality or maturity scale.",
        "zh": "不是。这是六个轻微虚构场景中的三种原创第一步侧重，没有经过验证的人格或成熟度量表。"
      }
    },
    {
      "question": {
        "en": "Does the highest count tell me what to say?",
        "zh": "次数最高就告诉我该说什么吗？"
      },
      "answer": {
        "en": "It offers a reading prompt, not a script for another person. Check the real action, wanted correction and recipient’s preferences instead.",
        "zh": "它提供阅读提示，不替另一人规定对白。应核对实际行动、对方愿意的纠正和回应偏好。"
      }
    },
    {
      "question": {
        "en": "Does offering a repair guarantee forgiveness?",
        "zh": "提供补救就能保证被原谅吗？"
      },
      "answer": {
        "en": "No. The recipient may decline the offer or choose their own response; counts cannot establish acceptance.",
        "zh": "不能。接收者可拒绝提供或选择自己的回应，次数无法证明接受。"
      }
    },
    {
      "question": {
        "en": "Can several portraits appear?",
        "zh": "可以同时出现多篇画像吗？"
      },
      "answer": {
        "en": "Yes. Every equally highest emphasis appears in full. The system neither breaks ties nor randomly chooses one.",
        "zh": "可以。同为最高的侧重均显示全文，不破同分，也不随机抽一个。"
      }
    },
    {
      "question": {
        "en": "Does giving space mean doing nothing?",
        "zh": "留空间就是不处理吗？"
      },
      "answer": {
        "en": "The original portrait retains clear acknowledgment and practical responsibilities. A pause is not a substitute for an agreed correction.",
        "zh": "原画像保留清楚承认与实际责任，暂停不能代替已约纠正。"
      }
    },
    {
      "question": {
        "en": "Will the quiz contact anyone or resolve a real dispute?",
        "zh": "会联系别人或解决真实纠纷吗？"
      },
      "answer": {
        "en": "No. It is a browser-based written-choice story, with no messages, recipient scoring or dispute-resolution service.",
        "zh": "不会。它是在浏览器内运行的文字选择故事，不发消息，不给接收者评分，也不提供纠纷裁决服务。"
      }
    }
  ],
  "references": [
    {
      "url": "https://news.osu.edu/the-6-elements-of-an-effective-apology-according-to-science/",
      "label": {
        "en": "Ohio State: report of two apology-rating experiments (2016; research context)",
        "zh": "俄亥俄州立大学：两项道歉评价实验报道（2016；研究背景）"
      }
    }
  ]
},
  "shared-workspace": {
  "label": {
    "en": "Original paper-workshop scenes · State, shared tools and requested feedback",
    "zh": "原创纸艺桌情境 · 状态、共用工具与受邀反馈"
  },
  "instructions": {
    "en": "Imagine a casual shared paper-craft table. In six written scenes, choose how to hand over work or materials and respond to a draft. No real work is uploaded or evaluated. Complete all six for three counts and every equally highest guide in full.",
    "zh": "想象轻松共用的纸艺桌。六个文字场景里选择怎样交接作品、材料或回应草稿，不上传或评价真实作品；完成六题，查看三项次数与全部同为最高的指南全文。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "A creative-table handover: make the next action understandable",
        "zh": "创作桌交接：让下一步容易理解"
      },
      "paragraphs": [
        {
          "en": "The scenes cover an unfinished page, a shared tool in demand, a feedback request, a session ending, a proposed edit and returning to the table. They compare small contributions within a hobby workshop, without evaluating employee performance, leadership or project-management competence.",
          "zh": "场景涉及未完成纸页、多人想用同一工具、反馈请求、活动结束、建议修改与返回桌边。它们比较爱好工作坊的小贡献，不评价员工表现、领导力或项目管理能力。"
        },
        {
          "en": "Labels, usable tool arrangements and requested feedback can support the same session. A single-choice format shows what you would address first here. A higher count does not make you responsible for everybody’s property, give permission to edit someone’s work or prove that your advice is correct.",
          "zh": "标记、可用工具安排和受邀反馈可以支持同一次活动。单选凸显此处先处理什么。次数高，不让你负责所有人物品，不授予修改别人作品的许可，也不证明建议正确。"
        }
      ]
    },
    {
      "id": "label",
      "title": {
        "en": "Work-in-progress markers: whose page, which state?",
        "zh": "进行中标记：谁的纸页，什么状态？"
      },
      "paragraphs": [
        {
          "en": "The marker guide makes authorship and a current state visible. An original note might say that a paper bird is still being arranged and ask that its pieces remain in place. At an actual handover, a short note can distinguish an unfinished layout from spare scraps.",
          "zh": "标记指南让作者与当前状态可见。一个原创便条可以写纸鸟仍在排布，请保留碎片位置。实际交接时，一则短记可区分未完成布局和备用碎纸。"
        },
        {
          "en": "The full guide keeps a tradeoff: documenting every tiny move could take over the activity. Choose a real handover point rather than building a record of everything. A label does not establish ownership of unrelated materials or permission to publish a draft.",
          "zh": "完整指南保留取舍：记录每个微小动作，可能接管活动。可选择真实交接点，无需记录一切。标签不确定无关材料的归属，也不授予发布草稿的许可。"
        }
      ]
    },
    {
      "id": "tool",
      "title": {
        "en": "Common-tool handovers: a useful place, a modest arrangement",
        "zh": "共用工具交接：好用位置，适度安排"
      },
      "paragraphs": [
        {
          "en": "The tool guide asks where a genuinely shared item can be found, passed on and returned. An original imagined example is agreeing a place for a common ruler while leaving personal pencils separate. Users can revisit the arrangement as the paper project changes.",
          "zh": "工具指南询问真正共用物如何找到、传递和归还。一个原创想象例子是约清共用尺位置，个人铅笔另放。纸作项目改变时，使用者可以重新商量。"
        },
        {
          "en": "Repair Café’s French introduction describes shared tools and volunteer expertise in a practical activity setting.[2] This is related context, not a safety procedure or a service supplied here. Our fictional paper table does not inspect equipment, authorise borrowing personal tools or measure repair ability.",
          "zh": "Repair Café法语介绍描述实际活动中的共用工具与志愿者经验。[2]这是相关背景，不是安全流程或本站服务。虚构纸艺桌不检查设备、不授权借私人工具，也不测维修能力。"
        }
      ]
    },
    {
      "id": "feedback",
      "title": {
        "en": "Asked-for feedback: clarify the response before changing the work",
        "zh": "受邀反馈：先明确回应，再谈修改"
      },
      "paragraphs": [
        {
          "en": "The feedback guide begins with what the maker wants: an impression, wording help or a comparison between versions. An original question could ask whether a card maker wants a comment on spacing rather than a full redesign. The final choice remains with the maker.",
          "zh": "反馈指南从作者想要什么开始：第一印象、文字帮助或版本比较。一个原创问题可以问卡片作者是否想听间距意见，而非整套重设计。最终选择仍在作者手里。"
        },
        {
          "en": "Google Docs’ official sharing guide distinguishes viewer, commenter and editor roles.[1] It is a concrete related example of separating access and editing, not a scoring framework for this hobby story. The page connects to no document service and grants no access to a real draft; once a feedback scope is clear, one observation may be enough.",
          "zh": "Google Docs官方分享指南区分查看、评论与编辑角色。[1]这是区分访问和修改的具体相关例子，不是爱好故事的计分框架。页面不连接文档服务，也不授予访问真实草稿的权限；反馈范围清楚后，一条观察可以已经足够。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices preserve every equally highest table contribution",
        "zh": "六次选择，保留全部同为最高的桌边贡献"
      },
      "paragraphs": [
        {
          "en": "Each scene offers label, tool and feedback once, with changing option positions. The selected contribution receives one count. Each ranges from zero to six and a completed total is six. Counts describe this bank’s choices, without ability grades, employment conclusions or population comparison.",
          "zh": "每场景各提供标记、工具与反馈一次，选项位置会变化。选中贡献加一次，各项零至六次，完成总和六。次数描述本题组选择，不给能力等级、就业结论或人群比较。"
        },
        {
          "en": "Three-three-zero retains two full guides; two-two-two retains all three. Seven highest sets are reachable without randomness or a tie-break. Original summaries, examples, possible benefits, tradeoffs and optional experiments remain intact. No psychometric reliability, validity or norms have been established for these recreational roles.",
          "zh": "三、三、零保留两篇全文，二、二、二保留三篇。七种最高集合均可出现，不随机抽取，也不破同分。原概述、例子、可能用处、取舍与可选尝试保持完整。这些趣味角色尚未建立心理测量信度、效度或常模。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Keep the paper workshop fictional and your drafts private",
        "zh": "纸艺工作坊可以虚构，草稿可以私下"
      },
      "paragraphs": [
        {
          "en": "Start opens the first scene directly. No colleague’s name, actual draft, workplace or file is requested. Back permits edits and retake clears the run. Three public guides remain freely readable; their links contain no individual answers or shared documents.",
          "zh": "开始直接打开首场景，不索取同伴姓名、真实草稿、工作地点或文件。上一题可改选，重玩清空本轮。三篇公开指南仍可免费读，链接不含个人答案或共享文档。"
        },
        {
          "en": "Answers resolve in the browser. Optional saving retains this edition’s draft in the current tab for up to twenty-four hours; completion, retake or deletion clears it. Refresh can lose unsaved progress. Cookie-controlled usage analytics are separate from answer content. Optional paper exercises require no upload or public attribution.",
          "zh": "答案在浏览器内解析。可选保存把本版草稿留在当前标签页最长二十四小时，完成、重玩或删除会清除；刷新可能丢失未保存进度。受Cookie设置控制的使用统计与答案内容分开。可选纸上尝试无需上传或公开署名。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Is this a workplace assessment?",
        "zh": "这是职场评估吗？"
      },
      "answer": {
        "en": "No. The premise is a casual paper-craft table, without employment, leadership or competence grading.",
        "zh": "不是。前提是轻松纸艺桌，不给就业、领导力或胜任等级。"
      }
    },
    {
      "question": {
        "en": "Does a shared table imply permission to edit?",
        "zh": "共用桌意味着可以修改别人作品吗？"
      },
      "answer": {
        "en": "No. The source scenes distinguish the maker’s requested response from making a change.",
        "zh": "不意味着。原场景区分作者所需回应与直接修改。"
      }
    },
    {
      "question": {
        "en": "Must I provide feedback to be helpful?",
        "zh": "有帮助就必须给反馈吗？"
      },
      "answer": {
        "en": "No. A state note or workable tool handover may be the contribution wanted in that scene.",
        "zh": "不用。某场景可能更需要状态便条或可用工具交接。"
      }
    },
    {
      "question": {
        "en": "Does a high tool count make me the custodian?",
        "zh": "工具项最高就要负责保管吗？"
      },
      "answer": {
        "en": "No. It records selected arrangements, without assigning responsibility for everyone’s belongings.",
        "zh": "不用。它记录所选安排，不把所有人物品责任交给你。"
      }
    },
    {
      "question": {
        "en": "Why can several guides appear?",
        "zh": "为什么有多篇指南？"
      },
      "answer": {
        "en": "All equally highest counts remain. Three-three-zero shows two; two-two-two shows three.",
        "zh": "全部同为最高的次数保留。三、三、零显示两篇，二、二、二显示三篇。"
      }
    },
    {
      "question": {
        "en": "Will this connect to a shared document?",
        "zh": "会连接共享文档吗？"
      },
      "answer": {
        "en": "No. It is a written-choice story with no file access, uploads or live collaboration.",
        "zh": "不会。它是文字选择故事，没有文件访问、上传或实时协作。"
      }
    }
  ],
  "references": [
    {
      "url": "https://support.google.com/a/users/answer/9305685?hl=en",
      "label": {
        "en": "Google Docs: viewing, commenting and editing roles (English; related tool)",
        "zh": "Google Docs：查看、评论与编辑角色（英语；相关工具）"
      }
    },
    {
      "url": "https://www.repaircafe.org/fr/a-propos/",
      "label": {
        "en": "Repair Café: shared tools and voluntary expertise (French; related activity)",
        "zh": "Repair Café：共用工具与志愿经验（法语；相关实践）"
      }
    }
  ]
},
  "shared-ritual": {
  "label": {
    "en": "Original recurring-activity scenes · Cue, window and chosen meaning",
    "zh": "原创重复活动情境 · 提示、时段与自选意义"
  },
  "instructions": {
    "en": "Imagine a small recurring activity with someone who wants to join. Choose among six written arrangements that may be changed, skipped or stopped. No reminder is scheduled. Complete all six for three raw counts and every equally highest guide.",
    "zh": "想象与愿意的人进行一项小型重复活动。六个文字安排中选择，活动可修改、跳过或停止；不会安排提醒。完成六题，查看三项原始次数与全部同为最高的指南。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "A shared ritual is an arrangement both people can revisit",
        "zh": "共同小仪式：双方可以重新商量的安排"
      },
      "paragraphs": [
        {
          "en": "The scenes concern beginning, an activity becoming elaborate, missing a time, choosing a marker, wanting change after a month and what feels good about the ritual. They explore a chosen recurring activity, without prescribing how frequently two people should meet or contact one another.",
          "zh": "场景涉及开始、活动变复杂、错过时间、选标记、一个月后想改变与怎样才舒服。它们探索自选重复活动，不规定两人该多久见面或联系。"
        },
        {
          "en": "Cue, window and meaning can work together. You might use a familiar closing moment, allow a movable time and keep one part that matters to both. One selected response does not measure discipline, habit strength, commitment or closeness.",
          "zh": "提示、时段与意义可以组合：使用熟悉收尾时刻、允许时间移动、保留双方在意的一部分。一次所选回应，不测自律、习惯强度、投入或亲近。"
        }
      ]
    },
    {
      "id": "cue",
      "title": {
        "en": "A tiny cue: a small beginning without a missed-turn debt",
        "zh": "小提示：小小开始，不欠错过回合的债"
      },
      "paragraphs": [
        {
          "en": "The cue guide places a small action beside an existing ordinary moment. An original imagined example is each person showing one small drawing after putting materials away. The action stays brief, and missing that cue does not require compensation.",
          "zh": "提示指南把小行动放在已有日常时刻旁。一个原创想象例子是各自收好材料后展示一幅小画。行动保持简短，错过提示不需补偿。"
        },
        {
          "en": "Tiny Habits’ creator material describes pairing a small behaviour with an existing routine and revising an unsuitable pairing.[1] This is related method context, not validation of this quiz or a guarantee that a shared activity will become automatic. The story does not deliver that programme or monitor real behaviour.",
          "zh": "Tiny Habits创作者资料描述把小行为与已有日程配对，并修改不合适配对。[1]这是相关方法背景，不验证本站题组，也不保证共同活动会自动形成。本故事不提供该课程，也不监测真实行为。"
        }
      ]
    },
    {
      "id": "window",
      "title": {
        "en": "A flexible window: make an option clear enough to use",
        "zh": "灵活时段：让选项清楚到可以使用"
      },
      "paragraphs": [
        {
          "en": "The window guide allows moving, skipping and returning. An original invitation could offer a short weekend exchange whenever both have room, with “not this time” accepted. A broad window is not a demand for continuous availability or immediate replies.",
          "zh": "时段指南允许移动、跳过与返回。一个原创邀请可以在双方有余地时，安排周末短交换，并接受“这次不参加”。宽时间窗不要求持续在线或立即回复。"
        },
        {
          "en": "Calendly’s French settings distinguish duration, availability and buffer arrangements.[2] It is a related example of explicit scheduling choices, not relationship advice or a calendar service connected to this page. Our story sets no booking, notification or attendance requirement.",
          "zh": "Calendly法语设置区分时长、可用时间和缓冲安排。[2]这是明确日程选择的相关例子，不是关系建议，也不是本站已连接的日历服务。故事不设预约、通知或出席要求。"
        }
      ]
    },
    {
      "id": "meaning",
      "title": {
        "en": "Meaning kept: ask what each person wants to retain",
        "zh": "留下意义：问双方分别想保留什么"
      },
      "paragraphs": [
        {
          "en": "The meaning guide permits the outer form to change. An original example is replacing an elaborate drawing exchange with noticing one ordinary detail, if both want that change. The activity need not preserve every original step to remain recognisable.",
          "zh": "意义指南允许外在形式改变。一个原创例子是双方都愿意时，把复杂画作交换换成留意一个普通细节。活动不必保留原有每步，仍可辨认。"
        },
        {
          "en": "The complete guide keeps a tradeoff: two people can give the same activity different meanings. Ask separately rather than appointing one official interpretation. Neither a high meaning count nor repeated attendance establishes the other person’s motivation or that the ritual should continue unchanged.",
          "zh": "完整指南保留取舍：同一活动对两人可以意义不同。可以分别询问，不指定唯一官方解释。意义次数高或重复出席，都不证明对方动机，或仪式应原样继续。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices retain all equally highest ritual guides",
        "zh": "六次选择，保留全部同为最高的仪式指南"
      },
      "paragraphs": [
        {
          "en": "Each scene offers cue, window and meaning once, with changing option positions. The selected emphasis gets one count. Each ranges from zero to six, and the completed total is six. Counts reflect this fictional arrangement, without measuring relationship strength, automaticity or self-control.",
          "zh": "每场景各提供提示、时段与意义一次，选项位置会变化。选中侧重加一次，各项零至六次，完成总和六。次数反映虚构安排，不测关系强度、自动程度或自控。"
        },
        {
          "en": "Three-three-zero keeps two full guides; two-two-two keeps all three. Seven highest sets are reachable without random selection or a tie-break. Original summaries, examples, possible benefits, tradeoffs and optional experiments remain intact. No psychometric reliability, validity or norms have been established for these recreational categories.",
          "zh": "三、三、零保留两篇全文，二、二、二保留三篇。七种最高集合均可出现，不随机抽取，也不破同分。原概述、例子、可能用处、取舍与可选尝试保持完整。这些趣味类别尚未建立心理测量信度、效度或常模。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Explore a recurring activity without scheduling a real person",
        "zh": "探索重复活动，无需安排真实联系人"
      },
      "paragraphs": [
        {
          "en": "Start opens the first scene directly. No contact, calendar, relationship history or ritual description is requested. Back permits edits and retake clears the current run. Public guide links contain no individual answers and do not send invitations.",
          "zh": "开始直接打开首场景，不索取联系人、日历、关系历史或仪式描述。上一题可改选，重玩清空本轮。公开指南链接不含个人答案，也不发邀请。"
        },
        {
          "en": "Answers resolve in the browser. Optional saving retains this edition’s draft in the current tab for up to twenty-four hours; completion, deletion or retake clears it. Refresh can lose unsaved progress. Cookie-controlled usage analytics are separate from answer content. Any later real activity remains voluntary and may be changed or stopped.",
          "zh": "答案在浏览器内解析。可选保存把本版草稿留在当前标签页最长二十四小时，完成、删除或重玩会清除；刷新可能丢失未保存进度。受Cookie设置控制的使用统计与答案内容分开。之后真实活动仍自愿，可以修改或停止。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Does missing a ritual indicate less care?",
        "zh": "错过仪式表示少关心吗？"
      },
      "answer": {
        "en": "No. The story allows skipping or moving an activity without making it a relationship test.",
        "zh": "不表示。故事允许跳过或移动活动，不把它当关系考试。"
      }
    },
    {
      "question": {
        "en": "Is this a habit-strength assessment?",
        "zh": "这是习惯强度评估吗？"
      },
      "answer": {
        "en": "No. It records imagined arrangements, without observing repetition or measuring automatic behaviour.",
        "zh": "不是。它记录想象安排，不观察重复或测自动行为。"
      }
    },
    {
      "question": {
        "en": "Can the meaning stay while the activity changes?",
        "zh": "活动改变时意义能保留吗？"
      },
      "answer": {
        "en": "Yes, if both people want the change. The meaning guide allows a smaller or different form.",
        "zh": "可以，前提是双方愿意。意义指南允许更小或不同形式。"
      }
    },
    {
      "question": {
        "en": "Will the page create reminders?",
        "zh": "页面会创建提醒吗？"
      },
      "answer": {
        "en": "No. It does not connect to calendars, contacts, bookings or notifications.",
        "zh": "不会。它不连接日历、联系人、预约或通知。"
      }
    },
    {
      "question": {
        "en": "Why can two or three guides appear?",
        "zh": "为何有两篇或三篇指南？"
      },
      "answer": {
        "en": "Every highest count remains. Three-three-zero gives two; two-two-two gives three.",
        "zh": "所有最高次数都保留。三、三、零显示两篇，二、二、二显示三篇。"
      }
    },
    {
      "question": {
        "en": "Can either person stop the arrangement?",
        "zh": "任何一方都能停止安排吗？"
      },
      "answer": {
        "en": "Yes. The source premise explicitly allows change, skipping and stopping; a portrait does not override that choice.",
        "zh": "可以。原设定明确允许修改、跳过和停止，画像不取代这个选择。"
      }
    }
  ],
  "references": [
    {
      "url": "https://tinyhabits.com/design/",
      "label": {
        "en": "Tiny Habits: small actions and existing anchors (English; method context)",
        "zh": "Tiny Habits：小行动与已有提示（英语；方法背景）"
      }
    },
    {
      "url": "https://calendly.com/fr/help/how-to-customize-your-event-types",
      "label": {
        "en": "Calendly: explicit scheduling settings (French; related tool)",
        "zh": "Calendly：明确日程设置（法语；相关工具）"
      }
    }
  ]
},
  "shared-hobby": {
  "label": {
    "en": "Original hobby-hour scenes · Visit, make alongside or exchange turns",
    "zh": "原创爱好时间情境 · 做客、并行或交换回合"
  },
  "instructions": {
    "en": "Imagine a short, freely chosen visit with someone whose hobby differs from yours. Choose your preferred arrangement in six written scenes. No actual hobby task or skill test is required. Complete all six for three counts and every highest guide in full.",
    "zh": "想象与爱好不同的人进行一段双方自愿的短相处。六个文字场景里选择较想采用的安排，不需实际完成爱好任务或技能测试；完成六题，查看三项次数与全部最高指南全文。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "Share an hour without needing the same interest",
        "zh": "共度一小时，不必拥有同一种兴趣"
      },
      "paragraphs": [
        {
          "en": "The scenes concern an unfamiliar invitation, unexpected complexity, including your own interest, unequal experience, the end of the visit and what made it worthwhile. They compare arrangements for a small shared period, not whether either person has learned a craft or become an enthusiastic permanent partner.",
          "zh": "场景涉及陌生爱好邀请、复杂度超预期、加入自己的兴趣、经验不同、结束时刻与怎样才值得。它们比较小段共处的安排，不判断双方是否学会手艺，或成为热情固定伙伴。"
        },
        {
          "en": "A guest experience, parallel making and a short exchange can be combined. You might try one part, return to separate activities and share a detail at the end. Choosing one response first does not measure affection, compatibility, learning style or the quality of a friendship.",
          "zh": "做客体验、并行创作和短交换可以组合：先试一小部分，再各做各的，最后分享细节。先选一种回应，不测感情、匹配、学习风格或友情质量。"
        }
      ]
    },
    {
      "id": "guest",
      "title": {
        "en": "A one-round guest: curiosity without recruitment",
        "zh": "一小轮客人：好奇不等于加入长期行列"
      },
      "paragraphs": [
        {
          "en": "The guest guide keeps a trial small enough to enjoy without mastering the whole hobby. An original imagined example is trying one paper fold while asking only for the help wanted. Enjoying that fold need not become a promise to practise weekly or adopt the other person’s interest.",
          "zh": "客人指南让尝试小到无需掌握整个爱好也能享受。一个原创想象例子是试一种折纸，只请求想要的帮助。喜欢这一折，不必变成每周练习或认领对方兴趣的承诺。"
        },
        {
          "en": "Repair Café’s French introduction describes visitors working with knowledgeable volunteers around shared repair activities.[2] It is a related example of participating with different experience levels, not a rule for this quiz or a repair instruction. This written story assesses no tools, objects or technical competence.",
          "zh": "Repair Café法语介绍描述访客与有经验志愿者围绕共同维修活动协作。[2]这是不同经验者参与的相关例子，不是本站规则或维修指导。文字故事不评工具、物件或技术能力。"
        }
      ]
    },
    {
      "id": "parallel",
      "title": {
        "en": "Side-by-side making: different tasks, an agreed visit",
        "zh": "并排各做：任务不同，相处可以约清"
      },
      "paragraphs": [
        {
          "en": "The parallel guide lets activities retain their own pace. An original scene could place a sketchbook beside a paper model, with an agreed amount of conversation. Neither activity needs to become a joint assignment, and a quieter moment does not prove either person wants less company.",
          "zh": "并行指南让活动保留自己的节奏。一个原创场景可以把速写本放在纸模型旁，约清想聊多少。任何活动都不必变成共同作业，安静片刻也不证明谁想少作伴。"
        },
        {
          "en": "Silent Book Club’s English format allows people to bring different books and choose whether to socialise afterward.[1] It supplies a concrete related community format, not evidence that parallel making improves every relationship. Our story organises no meeting and requires no reading, finished object or public sharing.",
          "zh": "Silent Book Club英语活动形式允许带不同书，也可选择之后是否社交。[1]它提供具体相关社群形式，不证明并行创作能改善所有关系。本站不组织见面，也不要求阅读、成品或公开分享。"
        }
      ]
    },
    {
      "id": "swap",
      "title": {
        "en": "Short-turn exchange: mutual interest without keeping accounts",
        "zh": "短轮交换：双向兴趣，不必逐分算账"
      },
      "paragraphs": [
        {
          "en": "The exchange guide gives both interests a small turn, with permission to pass. An original arrangement might include one brief puzzle and a tiny drawing, then ask what each person actually enjoyed. Equal welcome does not require precisely equal minutes, skill or effort.",
          "zh": "交换指南给双方兴趣各一小轮，也允许跳过。一个原创安排可以包括短谜题与小画，再问各自真喜欢什么。同样受欢迎，不要求分钟、熟练或精力精确相等。"
        },
        {
          "en": "The original tradeoff stays visible: tracking every contribution can make play feel like repayment. A separate invitation may be preferable when one activity needs much more time. A high swap count does not establish fairness, reciprocity as a stable trait or that another person agrees to take part.",
          "zh": "原取舍保持可见：记录每份付出，可能让玩耍像偿还。某活动需多很多时间时，另一次邀请可能更合适。交换次数高，不证明公平、稳定互惠特质，或别人已经同意参加。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six selections and all equally highest hobby arrangements",
        "zh": "六次选择与全部同为最高的爱好安排"
      },
      "paragraphs": [
        {
          "en": "Every scene offers guest, parallel and swap once, with changing option positions. The selected emphasis gets one count; each ranges from zero to six and the completed total is six. These are within-bank choices, without correct answers or ability percentages.",
          "zh": "每场景各提供做客、并行与交换一次，选项位置会变化。选中侧重加一次，各项零至六次，完成总和六。这是题组内选择，没有正确答案或能力百分比。"
        },
        {
          "en": "Three-three-zero shows two complete guides; two-two-two shows three. Seven highest sets are reachable without randomness or a tie-break. All original summaries, examples, possible benefits, tradeoffs and optional experiments remain intact. No psychometric reliability, validity or norms have been established for these recreational portraits.",
          "zh": "三、三、零显示两篇完整指南，二、二、二显示三篇。七种最高集合都可出现，不随机抽取，也不破同分。原概述、例子、可能用处、取舍与可选尝试完整保留。这些休闲画像尚未建立心理测量信度、效度或常模。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Imagine the visit without entering a friend’s details",
        "zh": "想象相处，不需输入朋友资料"
      },
      "paragraphs": [
        {
          "en": "Start opens the first scene directly. No friend’s name, contact, hobby history or photograph is requested. Back permits edits and retake clears the run. All three public guides are free to read, and their links contain no individual answers.",
          "zh": "开始直接打开第一场景，不索取朋友姓名、联系人、爱好历史或照片。上一题可改选，重玩清空本轮。三篇公开指南免费读，链接不含个人答案。"
        },
        {
          "en": "Answers resolve in the browser. Optional saving retains this edition’s draft in the current tab for up to twenty-four hours; completion, retake or deletion clears it. Refresh can lose unsaved progress. Cookie-controlled usage analytics are separate from answer content. A fictional choice never sends a real invitation.",
          "zh": "答案在浏览器内解析。可选保存把本版草稿留在当前标签页最长二十四小时，完成、重玩或删除会清除；刷新可能丢失未保存进度。受Cookie设置控制的使用统计与答案内容分开。虚构选择不会发送真实邀请。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Must we like the same hobby?",
        "zh": "必须喜欢同一爱好吗？"
      },
      "answer": {
        "en": "No. The story permits a small guest trial, different activities nearby or optional short exchanges.",
        "zh": "不必。故事允许小做客尝试、邻近的不同活动或可选短交换。"
      }
    },
    {
      "question": {
        "en": "Does parallel activity mean emotional distance?",
        "zh": "并行活动表示感情疏远吗？"
      },
      "answer": {
        "en": "No. The count describes an arrangement selected in the story, not feelings or relationship quality.",
        "zh": "不表示。次数描述故事中所选安排，不是感情或关系质量。"
      }
    },
    {
      "question": {
        "en": "Is the exchange an exact repayment schedule?",
        "zh": "交换要精确偿还时间吗？"
      },
      "answer": {
        "en": "No. The guide explicitly allows different durations and a choice to pass.",
        "zh": "不用。指南明确允许时长不同，也可跳过。"
      }
    },
    {
      "question": {
        "en": "Do I need to complete a real hobby task?",
        "zh": "需要完成真实爱好任务吗？"
      },
      "answer": {
        "en": "No. You select written responses; no object, skill demonstration or upload is required.",
        "zh": "不用。选择文字回应即可，不需物件、技能展示或上传。"
      }
    },
    {
      "question": {
        "en": "Why can several guides appear?",
        "zh": "为什么会出现多篇指南？"
      },
      "answer": {
        "en": "All equally highest counts are retained, including all three at two-two-two.",
        "zh": "同为最高的次数都保留，二、二、二显示三篇。"
      }
    },
    {
      "question": {
        "en": "Does this assess friendship compatibility?",
        "zh": "会评估友情匹配吗？"
      },
      "answer": {
        "en": "No. One person’s fictional choices cannot measure a pair’s compatibility or speak for the other person.",
        "zh": "不会。一个人的虚构选择不能测两人匹配，也不替别人作答。"
      }
    }
  ],
  "references": [
    {
      "url": "https://silentbook.club/pages/about-us",
      "label": {
        "en": "Silent Book Club: bring-your-own reading format (English; related community)",
        "zh": "Silent Book Club：自选读物形式（英语；相关社群）"
      }
    },
    {
      "url": "https://www.repaircafe.org/fr/a-propos/",
      "label": {
        "en": "Repair Café: participating with volunteers (French; related activity)",
        "zh": "Repair Café：与志愿者参与活动（法语；相关实践）"
      }
    }
  ]
},
  "secret-garden-gate": {
  "label": {
    "en": "Original creative-sharing scenes · A glimpse, a making note or a contribution",
    "zh": "原创创作分享情境 · 成品一瞥、制作小记或共作"
  },
  "instructions": {
    "en": "Imagine a harmless small creative work as a garden. Across six written scenes, choose what you would voluntarily share first. You do not need a real draft, upload or viewer. Complete all six for three counts and every equally highest guide in full.",
    "zh": "把无害小作品想象成花园。六个文字场景里，选较愿先分享什么。不需真实草稿、上传或观众；完成六题，查看三项次数与全部同为最高的指南全文。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "Open a creative garden gate at the scale you choose",
        "zh": "按自己选择的范围，打开创作花园门"
      },
      "paragraphs": [
        {
          "en": "The scenes ask about an invitation, a viewer with one minute, a request for the whole draft, an unclear introduction, a later revision and what makes sharing satisfying. The garden stands for a chosen creative work. It is not a metaphor used to infer private relationship boundaries or trust.",
          "zh": "场景询问邀请、只有一分钟的观者、查看全稿的请求、不清楚的介绍、之后修订与满意分享。花园代表自选创作，不用来推断私人关系边界或信任。"
        },
        {
          "en": "A finished glimpse, one making decision and a bounded contribution space can coexist. The single-choice format records which emphasis appeals first here. You can keep the rest unshared; neither a viewer’s curiosity nor a highest count creates an obligation to reveal or collaborate.",
          "zh": "完成一瞥、一个制作决定与有范围的贡献位置可共存。单选记录此处先受哪种侧重吸引，其余仍可不分享。观者好奇或某项最高次数，都不制造披露或合作义务。"
        }
      ]
    },
    {
      "id": "glimpse",
      "title": {
        "en": "A finished corner: let a small work stand on its own",
        "zh": "完成一角：让小作品本身成立"
      },
      "paragraphs": [
        {
          "en": "The Finished-Corner Gate offers something complete at a modest scale. An original imagined example is one finished paper-garden illustration with a two-line caption, leaving its neighbouring unfinished pages outside the invitation. A viewer can enjoy it without receiving the creator’s whole history.",
          "zh": "完成一角的门，提供规模适度且完整的东西。一个原创想象例子是配两行图注的纸花园插画，把旁边未完成页面留在邀请之外。观者可以欣赏，无需接收创作者的全部历史。"
        },
        {
          "en": "The original guide keeps the tradeoff that a finished view does not explain every decision. More context may be interesting, but is not automatically owed. This emphasis does not establish artistic skill, confidence, privacy preference or a fixed style of self-disclosure.",
          "zh": "原指南保留取舍：成品视角不解释每个决定。更多背景可以有趣，却不是自动欠下的内容。此侧重不证明艺术技能、自信、隐私偏好或固定自我披露方式。"
        }
      ]
    },
    {
      "id": "process",
      "title": {
        "en": "A making note: one chosen change, not every abandoned draft",
        "zh": "制作小记：一处选定变化，而非所有弃稿"
      },
      "paragraphs": [
        {
          "en": "The Making-Note Gate shows a concrete before-and-after. An original example is moving a drawn path and explaining what became easier to follow and what remains undecided. One comparison can communicate a craft choice without turning the piece into a complete tutorial.",
          "zh": "制作小记展示具体前后对照。一个原创例子是移动画中路径，说明何处更好跟随、何处仍未决定。一处比较可传达创作选择，无需把作品变成完整教程。"
        },
        {
          "en": "Itch.io’s 2017 introduction of devlogs describes posts about project changes and optional comments.[1] That is a related publishing format, not evidence that sharing a process improves creativity or engagement for everyone. Our story publishes no devlog, records no artwork and promises no audience response.",
          "zh": "Itch.io于2017年介绍开发日志时，说明可发布项目变化，并让评论可选。[1]这是相关发布形式，不证明分享过程能普遍提高创造力或互动。本站故事不发布日志、不记录作品，也不承诺观众回应。"
        }
      ]
    },
    {
      "id": "contribute",
      "title": {
        "en": "A contribution gate: explain the scope and the choice to pass",
        "zh": "共作门：说清范围，也能选择不参加"
      },
      "paragraphs": [
        {
          "en": "The Clearly-Open Contribution Gate offers a small, defined addition. An original fictional invitation could leave one planter for an invented paper flower, describe where it will appear and welcome simply looking. A small invitation need not recruit someone to finish the whole project.",
          "zh": "范围说清的共作门，提供小而明确的添加。一个原创虚构邀请可留一只花盆放想象纸花，说明展示位置，也欢迎只看。小邀请不必把人招来完成整个项目。"
        },
        {
          "en": "Framapad’s French creator page describes real-time collaborative text, version history and private-pad access management.[2] It illustrates the difference between viewing and editing arrangements in a related tool. The garden story is not a shared editor; it manages no collaborators, uploads, credits or permissions for real work.",
          "zh": "Framapad法语开发者页面介绍实时协作文本、版本历史与私有文档访问管理。[2]它以相关工具说明观看和编辑安排需要区分。花园故事不是共享编辑器，不管理真实作品的合作者、上传、署名或许可。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices retain every equally highest sharing guide",
        "zh": "六次选择，保留全部同为最高的分享指南"
      },
      "paragraphs": [
        {
          "en": "Every scene offers glimpse, process and contribute once, with changing option positions. The selected emphasis receives one count. Each ranges from zero to six and the completed total is six. These are within-story selections, not creativity percentages, trust scores, communication ability or population ranks.",
          "zh": "每个场景各提供成品、过程与贡献一次，选项位置会变化。选中侧重加一次，各项零至六次，完成总和六。这是故事内选择，不是创造力百分比、信任分、沟通能力或人群排名。"
        },
        {
          "en": "Three-three-zero retains two complete guides; two-two-two retains all three. Seven highest sets are reachable, without random selection or a tie-break. Each original summary, example, possible benefit, tradeoff and optional experiment remains intact. No psychometric reliability, validity or norms have been established for these recreational portraits.",
          "zh": "三、三、零保留两篇全文，二、二、二保留三篇。七种最高集合均可出现，不随机抽取，也不破同分。原概述、例子、可能用处、取舍与可选尝试保持完整。这些趣味画像尚未建立心理测量信度、效度或常模。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Explore sharing without making a real draft public",
        "zh": "探索分享，无需公开真实草稿"
      },
      "paragraphs": [
        {
          "en": "Start opens the first scene directly. No account, portfolio, photograph or project title is requested. Back permits edits and retake clears the run. Public guide links contain no individual answers; reading them never changes access to any real work.",
          "zh": "开始直接打开首场景，不索取账号、作品集、照片或项目名。上一题可改选，重玩清空本轮。公开指南链接不含个人答案，阅读不会改变任何真实作品访问权限。"
        },
        {
          "en": "Answers resolve in the browser. Optional saving keeps this edition’s draft in the current tab for up to twenty-four hours; completion, retake or deletion clears it. Without saving, refresh can lose progress. Cookie-controlled usage analytics are separate from answer content. Any optional writing exercise can remain fictional and private.",
          "zh": "答案在浏览器内解析。可选保存把本版草稿留在当前标签页最长二十四小时，完成、重玩或删除会清除；不保存时刷新可能丢失进度。受Cookie设置控制的使用统计与答案内容分开。可选写作尝试可以始终保持虚构与私下。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Does an open garden mean I trust people more?",
        "zh": "花园开门表示更信任人吗？"
      },
      "answer": {
        "en": "No. The garden represents a chosen creative work, not private relationships or a measure of trust.",
        "zh": "不表示。花园代表自选创作，不是私人关系或信任测量。"
      }
    },
    {
      "question": {
        "en": "Must I show every draft to explain my process?",
        "zh": "解释过程必须展示所有草稿吗？"
      },
      "answer": {
        "en": "No. One selected change can be enough. The making-note guide leaves other drafts and private reasons outside the invitation.",
        "zh": "不用。一处选定变化可以足够，制作小记允许其他草稿与私人理由留在邀请外。"
      }
    },
    {
      "question": {
        "en": "Will my answers publish or upload a work?",
        "zh": "答案会发布或上传作品吗？"
      },
      "answer": {
        "en": "No. The page is a written-choice story, without uploads, a portfolio, a public gallery or shared editing.",
        "zh": "不会。页面是文字选择故事，没有上传、作品集、公共画廊或共享编辑。"
      }
    },
    {
      "question": {
        "en": "Can someone enjoy a shared piece without contributing?",
        "zh": "别人能只欣赏而不贡献吗？"
      },
      "answer": {
        "en": "Yes. A contribution is optional; looking or declining need not create responsibility for the project.",
        "zh": "可以。贡献自愿，只看或拒绝不必承担项目责任。"
      }
    },
    {
      "question": {
        "en": "Why can more than one guide appear?",
        "zh": "为什么会出现多篇指南？"
      },
      "answer": {
        "en": "All emphases tied for the highest count remain. Three-three-zero shows two; two-two-two shows all three.",
        "zh": "同为最高次数的侧重都保留。三、三、零显示两篇，二、二、二显示三篇。"
      }
    },
    {
      "question": {
        "en": "Does a highest process count prove creative ability?",
        "zh": "过程项最高能证明创作能力吗？"
      },
      "answer": {
        "en": "No. It records selected descriptions in six fictional scenes, without evaluating actual work, skill or effectiveness.",
        "zh": "不能。它记录六个虚构场景所选描述，不评价实际作品、技能或效果。"
      }
    }
  ],
  "references": [
    {
      "url": "https://itch.io/updates/introducing-devlogs",
      "label": {
        "en": "Itch.io: 2017 devlog introduction (English; related publishing format)",
        "zh": "Itch.io：2017年开发日志介绍（英语；相关发布形式）"
      }
    },
    {
      "url": "https://framapad.org/abc/",
      "label": {
        "en": "Framapad: collaborative writing and access overview (French; related tool)",
        "zh": "Framapad：协作写作与访问介绍（法语；相关工具）"
      }
    }
  ]
},
  "secret-door": {
  "label": {
    "en": "Original branching fiction · Three choices, one complete ending",
    "zh": "原创分支短篇 · 三次选择，一篇完整结局"
  },
  "instructions": {
    "en": "A borrowed book contains a misplaced key and a note about invitation. Start at the return address, then follow three choices to one ending. There are no points, hidden personality scores or doors to unlock on screen. Back lets you change the route; retake starts again.",
    "zh": "借来的书中有误放的钥匙与关于邀请的便条。从回邮地址开始，沿三次选择抵达一个结局。没有积分、隐藏人格分或屏幕解锁谜题。上一题可换路线，重玩从头开始。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "The secret door: a key, an owner and a separate invitation",
        "zh": "秘密门：钥匙、主人与另行确认的邀请"
      },
      "paragraphs": [
        {
          "en": "The story begins with an object found in a borrowed book. Both opening choices seek its owner: contact them directly or use the staffed return desk. A later invitation is optional. The tale keeps returning the key, visiting a room and arranging another encounter as distinct decisions.",
          "zh": "故事从借书中发现物品开始。两个开场都寻找主人：直接联络，或交给有人值守的归还柜台。之后邀请可自选。归还钥匙、参观房间与安排另次相遇，在故事里是分别的决定。"
        },
        {
          "en": "The invitation and private door are fictional narrative conditions, not a real access procedure. No address, key code or personal relationship is assessed. The ending concerns what happened along this route, without declaring the reader trustworthy, avoidant, generous or compatible with somebody else.",
          "zh": "邀请和私门是虚构叙事条件，不是真实进入流程。不评地址、钥匙码或私人关系。结局描述这条路线发生什么，不判定读者可信、回避、慷慨，或与别人匹配。"
        }
      ]
    },
    {
      "id": "guest",
      "title": {
        "en": "The invited guest: enjoy the part actually offered",
        "zh": "受邀客人：欣赏真正开放的部分"
      },
      "paragraphs": [
        {
          "en": "The guest ending follows an agreed visit and leaves the private door closed. An original imagined example is enjoying a displayed paper model while treating a closed portfolio as outside the visit. Curiosity can stay with the offered work without requiring access to everything nearby.",
          "zh": "客人结局沿约定参观，让私门继续关闭。一个原创想象例子是欣赏已展示的纸模型，把合上的作品夹留在参观之外。好奇可以停在对方提供的作品，不要求访问附近一切。"
        },
        {
          "en": "Its original tradeoff remains: a small permission question need not turn an ordinary exchange into a formal interview. This is a reading of the authored ending, not a score for ethical conduct or a claim that all real permissions can be inferred from one invitation.",
          "zh": "原取舍保持：一个小许可问题，不必让普通交流变成正式采访。这是对原创结局的读法，不是道德行为评分，也不表示现实所有许可可由一次邀请推定。"
        }
      ]
    },
    {
      "id": "return",
      "title": {
        "en": "The returned key: a considerate handover can be a full ending",
        "zh": "归还钥匙：体贴交接本身可以完整"
      },
      "paragraphs": [
        {
          "en": "The return ending allows you to keep your own afternoon after handing the key back. An original fictional continuation might end with a short return note and no proposed visit. The story does not mark declining the extra encounter as a failure or an unfinished relationship.",
          "zh": "归还结局允许交还钥匙后保留自己的下午。一个原创虚构续写可以以简短归还便条结束，不提参观。故事不把谢绝额外相遇记作失败或未完成的关系。"
        },
        {
          "en": "The complete guide also leaves room to reconsider an opportunity you genuinely want. Its question is whether to accept this optional invitation, not whether a person is socially open in general. Choosing the desk rather than a direct message does not by itself decide the ending.",
          "zh": "完整指南也留出重新考虑真想接受机会的空间。问题是是否接受这次可选邀请，不是人总体是否善交际。选柜台而非直接消息，本身不决定结局。"
        }
      ]
    },
    {
      "id": "bridge",
      "title": {
        "en": "The open invitation: a new meeting stands on a fresh choice",
        "zh": "开放邀请：新见面建立在新的选择上"
      },
      "paragraphs": [
        {
          "en": "The bridge ending can follow either visiting the open room or returning the key without a visit. Its common thread is a public, optional next encounter. An original example is one sketch afternoon whose time and setting are clear, while declining leaves the handover and thanks intact.",
          "zh": "桥梁结局既可接在参观开放房间之后，也可接在只还钥匙之后。共同点是公开、可选的下次相遇。一个原创例子是时间场地清楚的速写下午；拒绝不影响已经完成的交接与感谢。"
        },
        {
          "en": "The original guide retains a limit: repeated requests after a decline can turn an invitation into pressure. The page sends no actual invitation and organises no event. Reading a bridge ending does not tell you that a particular person wants to meet.",
          "zh": "原指南保留限制：拒绝后重复请求，可能把邀请变成压力。页面不发真实邀请，也不组织活动。读到桥梁结局，不说明某个具体人想见面。"
        }
      ]
    },
    {
      "id": "routes",
      "title": {
        "en": "Five written scenes, eight routes and one ending per run",
        "zh": "五个文字场景、八条路线，每轮一个结局"
      },
      "paragraphs": [
        {
          "en": "Only three of the five scenes appear in a run. The opening leads through either a direct reply or the desk; the second choice leads to an open-room scene or a returned-key note. The final option selects guest, return or bridge. Of the eight complete routes, two reach guest, two return and four bridge. These route counts are properties of the authored story, not probabilities of what readers will choose.",
          "zh": "每轮只出现五个场景中的三个。开场通向直接回复或柜台；第二次选择通向开放房间或归还便条；最后选项抵达客人、归还或桥梁。八条完整路线中，客人两条、归还两条、桥梁四条。这是故事编排的路线数，不是读者选择概率。"
        },
        {
          "en": "Inkle’s tutorial explains linked passages, choices and intentional endings as an interactive-fiction structure.[1] The Room’s official French introduction instead describes an invitation leading to an object-opening puzzle.[2] These are related forms, not our source text or engine. Our tale follows explicit text links without a lock puzzle, tally, random ending or psychometric interpretation.",
          "zh": "Inkle教程以相连段落、选择和有意结束解释互动叙事结构。[1]The Room官方法语介绍则描述邀请引向打开物件的谜题。[2]两者是相关形式，不是本站题文或引擎来源。本短篇沿明确文字连接前进，没有锁具谜题、计数、随机结局或心理测量解释。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Change the route without carrying an abandoned answer forward",
        "zh": "换一条路，不携带已放弃分支的答案"
      },
      "paragraphs": [
        {
          "en": "Start opens the first scene directly. Back permits a different choice; changing an earlier choice clears the later answers from the abandoned route. Retake clears the run. Each reached ending retains its full summary, example, possible benefit, tradeoff and optional experiment; all three public guides remain free to read.",
          "zh": "开始直接打开首场景。上一题可改选；改变较早选择，会清除被放弃路线的后续答案。重玩清空本轮。抵达结局保留完整概述、例子、可能用处、取舍与可选尝试，三篇公开指南仍可免费读。"
        },
        {
          "en": "Answers resolve in the browser without collecting an address, key photograph or contact. Optional saving keeps this edition’s draft in the current tab for up to twenty-four hours; completion, retake or deletion clears it. Without saving, refresh can lose progress. Public links contain no individual choices; Cookie-controlled usage analytics are separate from answer content.",
          "zh": "答案在浏览器内解析，不收集地址、钥匙照片或联系人。可选保存把本版草稿留在当前标签页最长二十四小时，完成、重玩或删除会清除；不保存时刷新可能丢失进度。公开链接不含个人选择，受Cookie设置控制的使用统计与答案内容分开。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Why do I answer three scenes when the story has five?",
        "zh": "故事有五场景，为何只答三次？"
      },
      "answer": {
        "en": "The five scenes form a branching bank. Each run visits the opening, one middle scene and one final scene, then reaches one ending.",
        "zh": "五场景构成分支题库，每轮经过开场、一个中间场景与一个末场景，再到一个结局。"
      }
    },
    {
      "question": {
        "en": "Are there points or tied results?",
        "zh": "有积分或并列结果吗？"
      },
      "answer": {
        "en": "No. The selected final option determines a single ending along the route. No points are added and no highest-score comparison occurs.",
        "zh": "没有。路线末项决定一个结局，不加分，也不比较最高分。"
      }
    },
    {
      "question": {
        "en": "Is the bridge ending more likely or better?",
        "zh": "桥梁结局更可能或更好吗？"
      },
      "answer": {
        "en": "Four authored routes reach it, but route counts are not reader probabilities or quality rankings. All three endings are complete.",
        "zh": "四条编排路线通向它，但路线数量不是读者概率或优劣排名，三种结局都完整。"
      }
    },
    {
      "question": {
        "en": "Does declining the visit mean I avoid relationships?",
        "zh": "拒绝参观表示我回避关系吗？"
      },
      "answer": {
        "en": "No. It is one fictional decision about an optional visit, without assessing attachment or your general social behaviour.",
        "zh": "不表示。这是关于可选参观的一次虚构决定，不评依恋或总体社交行为。"
      }
    },
    {
      "question": {
        "en": "What happens after I change an earlier choice?",
        "zh": "改较早选择后会怎样？"
      },
      "answer": {
        "en": "The later answers from the abandoned branch are cleared. The new route continues from the scene selected by your changed answer.",
        "zh": "被放弃分支的后续答案会清除，新路线从改选指向的场景继续。"
      }
    },
    {
      "question": {
        "en": "Is this an escape-room or real permission guide?",
        "zh": "这是密室逃脱或真实许可指南吗？"
      },
      "answer": {
        "en": "No. It is a short written branching story. It provides no lock-solving task, access authorisation or assessment of real permissions.",
        "zh": "不是。它是文字分支短篇，不提供开锁任务、进入授权或真实许可评估。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.inklestudios.com/ink/web-tutorial/",
      "label": {
        "en": "Inkle: linked passages, choices and endings (English; narrative form)",
        "zh": "Inkle：相连段落、选择与结尾（英语；叙事形式）"
      }
    },
    {
      "url": "https://store.steampowered.com/app/288160/The_Room/?l=french",
      "label": {
        "en": "The Room: official French puzzle-game introduction (related product)",
        "zh": "The Room：官方法语谜题游戏介绍（相关产品）"
      }
    }
  ]
},
  "seasonal-table": {
  "label": {
    "en": "Original tabletop scenes · One trace, an open place or a shared addition",
    "zh": "原创桌面情境 · 一处痕迹、一个空位或共享添加"
  },
  "instructions": {
    "en": "Imagine a tabletop changing with a fictional season. In six written scenes, choose what to retain, leave available or invite someone to add. No purchase, photograph or real object is required. Complete all six for three counts and every highest guide in full.",
    "zh": "想象随虚构季节变化的桌面。六个文字场景里，选择保留什么、留下什么余地，或邀别人添什么。不需购物、照片或真实物件；完成六题，查看三项次数与所有最高指南全文。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "A seasonal tabletop: make a small change visible",
        "zh": "换季桌景：让一处小变化可见"
      },
      "paragraphs": [
        {
          "en": "The scenes move through adding a new detail, keeping something from the previous season, reducing a crowded table, writing a caption, hearing a different interpretation and imagining the next transition. A season provides the occasion for a composition, rather than a forecast about your life stage.",
          "zh": "场景依次涉及添新细节、保留上一季物件、整理太满桌面、写图注、听到不同解读与想象下次转换。季节提供构图契机，不预测人生阶段。"
        },
        {
          "en": "The National Gallery’s still-life glossary describes ordinary inanimate objects as a painting’s main subject.[1] This supplies a visual-art context for attending to a small arrangement. It does not make a tabletop a personality test, nor establish one object as a universal symbol for a season or emotion.",
          "zh": "英国国家美术馆的静物术语介绍，以日常无生命物件作为绘画主要对象。[1]这为关注小布置提供视觉艺术背景，不让桌景成为人格测验，也不确立某件物是季节或情绪的普遍符号。"
        }
      ]
    },
    {
      "id": "trace",
      "title": {
        "en": "One trace: describe what changed before assigning meaning",
        "zh": "一处痕迹：先描述变化，再讨论含义"
      },
      "paragraphs": [
        {
          "en": "The One-Seasonal-Trace Table keeps a specific difference visible. An original imagined example is placing two drawings side by side, adding one paper leaf to the second branch. A caption can simply name that visible change; it need not turn it into a lesson about growth or improvement.",
          "zh": "留一处季节痕迹，让具体差异可见。一个原创想象例子是把两幅画并排，在第二根画枝上添一片纸叶。图注可以只指出可见变化，无需升成成长或进步的教训。"
        },
        {
          "en": "The original guide notes that climate and tradition differ. A leaf, colour or familiar holiday may not mean the same thing to another visitor. Explain what the detail means in this particular fictional scene rather than treating agreement as the correct response.",
          "zh": "原指南指出，气候与传统会不同。叶片、色彩或熟悉节日对另一访客可能意义不同。可以说明细节在这幅虚构场景的意思，不把赞同当正确回应。"
        }
      ]
    },
    {
      "id": "space",
      "title": {
        "en": "An available place: a complete scene can retain an empty square",
        "zh": "可用位置：场景完整，也能留一格空"
      },
      "paragraphs": [
        {
          "en": "The Place-Still-Available Table lets a detail remain undecided. An original drawing could leave one neutral square beside an older object, then leave the same square empty in its next version. There is no requirement for a new season to arrive with a full plan.",
          "zh": "还留一个位置，让细节保持未定。一个原创画面可在旧物旁留一格中性空位，下一版仍空着。新季节不必带着完整计划到来。"
        },
        {
          "en": "The full guide keeps the tension between openness and pressure to fill it perfectly. An unassigned place is one compositional choice, not evidence of readiness for change, indecision, resilience or psychological flexibility. No real living or working space is evaluated.",
          "zh": "完整指南保留开放与必须完美填满之间的张力。未指定位置是一种构图选择，不证明迎接变化的准备、优柔寡断、韧性或心理灵活性，也不评估真实居住或工作空间。"
        }
      ]
    },
    {
      "id": "shared",
      "title": {
        "en": "A shared addition: invite another view without requiring participation",
        "zh": "共享添加：邀请另一视角，不要求参与"
      },
      "paragraphs": [
        {
          "en": "The Add-Your-Own Table allows different details and captions to coexist. An original fictional scene could include your drawn branch, one guest’s paper bird and another’s abstract shape. A third guest can simply look; contribution is not the price of being welcome.",
          "zh": "可以自愿添一份，让不同细节与图注共存。一个原创虚构场景可以包括你的画枝、一位客人的纸鸟与另一位的抽象形状。第三位客人可以只看，贡献不是受欢迎的代价。"
        },
        {
          "en": "La Grande Lessive’s French project explanation describes a shared invitation and common display format for a temporary collective artwork.[2] It is a related participatory-art example, not a partner event or online contribution tool here. This story collects no artwork and provides no permission to display or remove another person’s real work.",
          "zh": "La Grande Lessive法语项目说明介绍共同邀请与统一展示形式，用于临时集体艺术创作。[2]这是相关参与式艺术例子，不是本站合作活动或在线投稿工具。本故事不收集作品，也不授予展示或撤除别人真实作品的许可。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six scenes, three counts and all equally highest tabletop guides",
        "zh": "六个场景、三项次数与全部同为最高的桌景指南"
      },
      "paragraphs": [
        {
          "en": "Every scene offers trace, space and shared once, with changing option positions. The selected emphasis receives one count. Each ranges from zero to six, and a completed total is six. Counts record choices within this bank, without measuring creativity, cooperation, seasonal knowledge or personality.",
          "zh": "每个场景各提供痕迹、空间与共享一次，选项位置会变化。选中侧重加一次，各项零至六次，完成总和六。次数记录题组内选择，不测创造力、合作能力、季节知识或人格。"
        },
        {
          "en": "Three-three-zero retains two complete guides; two-two-two retains all three. Seven highest sets are reachable without random selection or a tie-break. Each original summary, example, possible benefit, tradeoff and optional experiment remains intact. No psychometric reliability, validity or population norms have been established for these recreational portraits.",
          "zh": "三、三、零保留两篇完整指南，二、二、二保留三篇。七种最高集合均可出现，不随机抽取，也不破同分。原概述、例子、可能用处、取舍与可选尝试保持完整。这些休闲画像尚未建立心理测量信度、效度或人群常模。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Imagine the table without buying, collecting or uploading",
        "zh": "想象桌景，不需购买、采集或上传"
      },
      "paragraphs": [
        {
          "en": "Start opens the first scene directly. No photograph, address, birthday or art submission is requested. You may imagine objects or optionally draw them on paper; the page is not an editable collage or public gallery. There is no shopping list or requirement to collect objects outdoors.",
          "zh": "开始直接打开第一场景，不索取照片、地址、生日或作品。可以想象物件，或自选画在纸上；页面不是可编辑拼贴或公共画廊，没有购物单，也不要求户外采集物件。"
        },
        {
          "en": "Answers resolve in the browser. Back permits edits and retake clears the run. Optional saving retains this edition’s draft in the current tab for up to twenty-four hours; completion, deletion or retake clears it. Without saving, refresh can lose progress. Public guide links contain no individual answers; Cookie-controlled usage analytics are separate from answer content.",
          "zh": "答案在浏览器内解析。上一题可改选，重玩清空本轮。可选保存把本版草稿留在当前标签页最长二十四小时，完成、删除或重玩会清除；不保存时刷新可能丢失进度。公开指南链接不含个人答案，受Cookie设置控制的使用统计与答案内容分开。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Must I follow a particular seasonal tradition?",
        "zh": "必须遵循某种季节传统吗？"
      },
      "answer": {
        "en": "No. The season is a fictional occasion for a change. The trace guide explicitly allows different climates and interpretations.",
        "zh": "不用。季节只是虚构变化契机，痕迹指南明确允许不同气候与解读。"
      }
    },
    {
      "question": {
        "en": "Does this predict my next life stage?",
        "zh": "能预测下个人生阶段吗？"
      },
      "answer": {
        "en": "No. The result describes selected tabletop arrangements, without forecasting events, personal growth or readiness for change.",
        "zh": "不能。结果描述所选桌景布置，不预测事件、个人成长或迎接变化的准备程度。"
      }
    },
    {
      "question": {
        "en": "Can the empty square remain empty?",
        "zh": "空格能一直空着吗？"
      },
      "answer": {
        "en": "Yes. The space guide permits an intentionally unassigned place; filling it is not a completion requirement.",
        "zh": "可以。空间指南允许刻意未指定的位置，填满不是完成条件。"
      }
    },
    {
      "question": {
        "en": "Can I upload or invite someone to contribute artwork?",
        "zh": "可以上传或邀请别人投稿吗？"
      },
      "answer": {
        "en": "No. This is a written-choice story, without an upload, gallery or invitation service. A shared contribution is fictional.",
        "zh": "不可以。这是文字选择故事，没有上传、画廊或邀请服务；共享贡献是虚构情节。"
      }
    },
    {
      "question": {
        "en": "Why can more than one guide appear?",
        "zh": "为什么会出现多篇指南？"
      },
      "answer": {
        "en": "All emphases tied for the highest count remain. Three-three-zero gives two guides; two-two-two gives three.",
        "zh": "同为最高次数的侧重都保留。三、三、零显示两篇，二、二、二显示三篇。"
      }
    },
    {
      "question": {
        "en": "Do I need seasonal objects, food or a purchase?",
        "zh": "需要季节物件、食物或购物吗？"
      },
      "answer": {
        "en": "No. Drawn or imagined objects are sufficient. The story is not a purchase list, food recommendation or real decorating plan.",
        "zh": "不需要。画出或想象的物件即可，故事不是购物单、饮食建议或真实装饰方案。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.nationalgallery.org.uk/paintings/glossary/still-lives",
      "label": {
        "en": "National Gallery: still-life subject matter (English; visual-art context)",
        "zh": "英国国家美术馆：静物主题（英语；视觉艺术背景）"
      }
    },
    {
      "url": "https://www.lagrandelessive.net/faq-items/que-faire-ensemble/",
      "label": {
        "en": "La Grande Lessive: shared artistic format (French; related participatory project)",
        "zh": "La Grande Lessive：共同艺术形式（法语；相关参与式项目）"
      }
    }
  ]
},
  "saying-goodbye": {
  "label": {
    "en": "Original visit endings · Clarity, appreciation and an optional next time",
    "zh": "原创见面收尾 · 清楚、欣赏与可选下次"
  },
  "instructions": {
    "en": "Imagine the end of a pleasant, freely chosen visit. Choose your preferred response in six written moments, without guessing what the other person secretly wants. Complete all six to see three counts and every equally highest guide. No message or invitation is sent.",
    "zh": "想象一次双方自愿、相处愉快的见面结束。六个文字片刻中，选较愿采用的回应，不猜对方暗中想什么。完成六题，查看三项次数与全部同为最高的指南；不会发送消息或邀请。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "A gentle goodbye closes this visit, not the whole relationship",
        "zh": "轻柔告别：结束这次见面，不定义整段关系"
      },
      "paragraphs": [
        {
          "en": "The scenes ask about an agreed finish, an enjoyable conversation, a possible next visit, an unfinished small activity, a brief follow-up and a closing that feels right. The other person also has their own plans. You can appreciate the visit while allowing it to end; another meeting is a possibility rather than a debt created by a warm goodbye.",
          "zh": "场景涉及约定结束、愉快对话、可能再会、未完的小活动、短短后续与恰当收尾。对方也有自己的安排。可以珍惜这次见面，同时允许结束；再见是可能，不是温暖告别制造的债务。"
        },
        {
          "en": "This is a recreational choice story about ordinary endings. It does not assess attachment, relationship quality, care, grief or a breakup. The three emphases can coexist: mention the finish, thank someone for a detail and offer a genuinely optional next idea. Selecting one first does not rule out the others.",
          "zh": "这是关于普通收尾的趣味选择故事，不评依恋、关系质量、关心、哀伤或分手。三种侧重可共存：说清结束、为细节道谢、提出真正可选的下次。先选一种，不排除其他。"
        }
      ]
    },
    {
      "id": "clear",
      "title": {
        "en": "A clear stopping point: make timing understandable",
        "zh": "清楚停止点：让时间安排容易理解"
      },
      "paragraphs": [
        {
          "en": "The Clear-End Goodbye gives the visit a recognisable end. An original example is saying that the agreed sketching hour is nearly over, finishing the current mark and putting shared paper away. A short cue can express your plan without claiming to know whether the other person is bored or wants to stay.",
          "zh": "清楚结尾让见面有可辨认的结束。一个原创例子是说约好的一小时速写快结束，画完当前一笔，再归好共用纸张。短提示表达自己的安排，无需声称知道对方无聊或想留下。"
        },
        {
          "en": "Mastroianni and colleagues’ 2021 paper studied desired and actual endings across two studies of 932 conversations; participants had limited insight into a partner’s preferred ending.[1] This supports discussing timing as a coordination question. It does not validate our three portraits or establish that a particular closing cue causes better relationships.",
          "zh": "Mastroianni等2021年论文通过两项研究讨论932次对话的期望与实际结束，参与者对对方期望结束时间的了解有限。[1]这支持把时间安排作为协调问题讨论，不验证本站三种画像，也不证明某句收尾提示会改善关系。"
        }
      ]
    },
    {
      "id": "detail",
      "title": {
        "en": "One good detail: appreciation without a required response",
        "zh": "一个好细节：欣赏不要求同等回应"
      },
      "paragraphs": [
        {
          "en": "The One-Good-Detail Goodbye stays close to what actually happened in the imagined visit. An original sentence could thank someone for the unexpected little bird they drew together, without calling the whole afternoon perfect. One modest detail lets the thanks stand on its own.",
          "zh": "留一个好细节，贴近想象见面中实际发生的事。一个原创说法可以感谢对方一起画出的意外小鸟，无需称整个下午完美。一点适度细节，让感谢本身成立。"
        },
        {
          "en": "The complete guide retains a tradeoff: searching for the perfect sentence can delay a simple goodbye. The recipient need not reply with equal emotion, promise another meeting or explain their reaction. The count concerns your selected description, not an assessment of somebody who has not answered.",
          "zh": "完整指南保留取舍：寻找完美句子可能拖住简单告别。接收者不必用同等情绪回应、许诺再会或解释反应。次数讨论你所选的描述，不评估未作答的那个人。"
        }
      ]
    },
    {
      "id": "future",
      "title": {
        "en": "An open next door: a specific possibility that can be declined",
        "zh": "留着下次的门：具体，也能拒绝的可能"
      },
      "paragraphs": [
        {
          "en": "The Open-Next-Door Goodbye offers one small next encounter only when it is genuinely wanted. An original example is mentioning another short drawing afternoon, while leaving the answer and timing open. Today’s visit remains worthwhile even if neither person takes up that option.",
          "zh": "下次门留着的告别，只在真想时提出一项小再会。一个原创例子是提另一个短短绘画下午，回答和时间保持开放。即使双方都不采用，这次见面仍可值得。"
        },
        {
          "en": "Calendly’s French event-setting documentation makes duration and availability explicit in a booking tool.[2] It is a related example of visible scheduling information, not emotional advice or a feature provided here. This story does not connect a calendar, reserve time, send a follow-up or turn an imagined invitation into an appointment.",
          "zh": "Calendly法语活动设置文档在预约工具里明确列出时长与可用时间。[2]这是让日程信息可见的相关例子，不是情感建议或本站功能。本故事不连接日历、不预订时间、不发后续消息，也不把想象邀请变成约会。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices preserve every equally highest closing guide",
        "zh": "六次选择，保留全部同为最高的收尾指南"
      },
      "paragraphs": [
        {
          "en": "Every question offers clear, detail and future once, with changing option positions. One selected option adds one count. Each emphasis ranges from zero to six, with a completed total of six. These are within-story selections, not percentages of affection, detachment, communication skill or population ranks.",
          "zh": "每题各提供清楚、细节和未来一次，选项位置会变化。选中项加一次，各侧重零至六次，完成总和六。它们是故事内选择，不是感情、抽离或沟通能力百分比，也不是人群排名。"
        },
        {
          "en": "Three-three-zero retains two full guides; two-two-two retains all three. All seven highest sets are reachable without random selection or a tie-break. Original summaries, examples, possible benefits, tradeoffs and optional experiments remain intact. No psychometric reliability, validity or norms have been established for these recreational categories.",
          "zh": "三、三、零保留两篇全文，二、二、二保留三篇。七种最高集合均可出现，不随机抽取，也不破同分。原概述、例子、可能用处、取舍与可选尝试保持完整。这些趣味类别尚未建立心理测量信度、效度或常模。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Try the fictional ending without entering a real contact",
        "zh": "尝试虚构收尾，不需输入真实联系人"
      },
      "paragraphs": [
        {
          "en": "Start opens the first question directly. No name, contact, relationship history or message text is requested. Back permits edits; retake clears the current run. All three public guides can be read without changing the result, and their links contain no individual answers.",
          "zh": "开始直接打开第一题，不索取姓名、联系人、关系历史或消息内容。上一题可改选，重玩清空本轮。三篇公开指南可直接读，不改变结果，链接不含个人答案。"
        },
        {
          "en": "Answers resolve in the browser. Optional saving retains this edition’s draft in the current tab for up to twenty-four hours; completion, retake or deletion clears it. Without saving, refreshing can lose progress. Cookie-controlled usage analytics are separate from answer content. Any real future invitation remains your own voluntary decision.",
          "zh": "答案在浏览器内解析。可选保存把本版草稿留在当前标签页最长二十四小时，完成、重玩或删除会清除；不保存时刷新可能丢失进度。受Cookie设置控制的使用统计与答案内容分开。现实中的未来邀请仍由你自主决定。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Does this measure attachment or relationship quality?",
        "zh": "会测依恋或关系质量吗？"
      },
      "answer": {
        "en": "No. It counts six fictional visit-ending choices, without measuring attachment, closeness or either person’s care.",
        "zh": "不会。它统计六次虚构见面收尾选择，不测依恋、亲近或双方关心程度。"
      }
    },
    {
      "question": {
        "en": "Can a clear finish still be warm?",
        "zh": "清楚结束也能温暖吗？"
      },
      "answer": {
        "en": "The story allows clarity and appreciation together. A stopping point need not turn an enjoyable visit into a failure.",
        "zh": "故事允许清楚与欣赏共存。停止点不必让愉快见面变成失败。"
      }
    },
    {
      "question": {
        "en": "Will this send the follow-up message I select?",
        "zh": "会发送我所选的后续消息吗？"
      },
      "answer": {
        "en": "No. Options describe imagined responses. The page has no messaging, contact or scheduling connection.",
        "zh": "不会。选项描述想象回应，页面不连接消息、通讯录或日程系统。"
      }
    },
    {
      "question": {
        "en": "Must an unfinished activity lead to another meeting?",
        "zh": "小活动未做完，必须再见吗？"
      },
      "answer": {
        "en": "No. The stopping point and a future round are separate choices; either person can leave the next round undecided.",
        "zh": "不用。停止点和未来一轮是分别的选择，双方都可让下一轮保持未定。"
      }
    },
    {
      "question": {
        "en": "Why are two or three complete guides possible?",
        "zh": "为什么会有两篇或三篇完整指南？"
      },
      "answer": {
        "en": "Every emphasis sharing the maximum remains. Three-three-zero shows two; two-two-two shows three.",
        "zh": "同为最高的侧重均保留。三、三、零显示两篇，二、二、二显示三篇。"
      }
    },
    {
      "question": {
        "en": "Does the conversation research prove these goodbye types?",
        "zh": "对话研究证明了这些告别类型吗？"
      },
      "answer": {
        "en": "No. It supplies limited context about coordinating conversation endings. Our six choices and three recreational guides were not validated in that study.",
        "zh": "没有。研究只提供关于协调对话结束的限定背景，本站六题与三种趣味指南未在该研究中验证。"
      }
    }
  ],
  "references": [
    {
      "url": "https://dtg.sites.fas.harvard.edu/MASTROIANNI2021.pdf",
      "label": {
        "en": "Mastroianni et al. (2021): conversation endings, abstract and opening discussion",
        "zh": "Mastroianni等（2021）：对话结束，摘要与开篇讨论"
      }
    },
    {
      "url": "https://calendly.com/fr/help/how-to-customize-your-event-types",
      "label": {
        "en": "Calendly: duration and availability settings (French; related scheduling tool)",
        "zh": "Calendly：时长与可用时间设置（法语；相关预约工具）"
      }
    }
  ]
},
  "room-atmosphere": {
  "label": {
    "en": "Original room scenes · Light, room to move and small collections",
    "zh": "原创房间情境 · 光点、活动余地与小收藏"
  },
  "instructions": {
    "en": "Imagine a room on paper. In six written scenes, choose the arrangement you would like to imagine now. No drawing, purchase or real room measurement is needed. Complete all six to see three raw counts and every highest atmosphere guide in full.",
    "zh": "想象纸上的一间房。六个文字场景里，选择此刻较想想象的布置。不需画图、购物或测量真实房间；完成六题，查看三项原始次数及所有最高氛围指南全文。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "Room atmosphere: six decisions about an imagined arrangement",
        "zh": "想象房间氛围：六次关于布置的决定"
      },
      "paragraphs": [
        {
          "en": "The story begins with a blank room, then asks about a busy drawing, a fictional visitor, a different afternoon, a finishing detail and a caption. Light, available space and selected objects offer three ways to give that drawing character. You choose among descriptions rather than manipulating furniture on a canvas.",
          "zh": "故事从空房开始，再问画面太满、虚构访客、另一个午后、完成细节与图注。光线、可用空间和选定物件，提供三种让画面有特点的方式。你在描述之间选择，不是在画布上操纵家具。"
        },
        {
          "en": "A room could contain all three. The single-choice scenes record what you select first under the stated conditions; they do not determine your ideal home, budget, aesthetic identity or wellbeing. Changing your choices changes this small fictional arrangement, without a correct design to discover.",
          "zh": "一间房可以同时拥有三者。单选场景记录在所述条件下先选什么，不确定理想住房、预算、美学身份或身心状况。改选改变的是小小虚构布置，没有等待发现的标准设计。"
        }
      ]
    },
    {
      "id": "glow",
      "title": {
        "en": "A pool of light: give one moment a visible focus",
        "zh": "一圈光：给一个当下可见的焦点"
      },
      "paragraphs": [
        {
          "en": "The light guide gathers the imagined scene around a limited focus. An original example is a chair and a paper book within a drawn lamp circle, leaving the rest loosely sketched. The choice concerns composition: which activity receives attention in this picture?",
          "zh": "光点指南把想象场景聚在有限焦点。一个原创例子是把椅子与纸书放入画出的灯光圈，其余只略略勾勒。选择讨论构图：画面里哪项活动受到关注？"
        },
        {
          "en": "The original guide keeps a practical tradeoff: an attractive glow does not establish that a real arrangement is usable. The quiz specifies no illuminance, glare, electrical installation or accessibility criteria. Its light count cannot prescribe suitable lighting for another person or activity.",
          "zh": "原指南保留实际取舍：光晕好看不证明现实布置可用。题组没有照度、眩光、电气安装或无障碍条件，光点次数不能替别人或其他活动规定适当照明。"
        }
      ]
    },
    {
      "id": "space",
      "title": {
        "en": "Available space: leaving a use undecided is a choice",
        "zh": "可用余地：暂不指定用途也是选择"
      },
      "paragraphs": [
        {
          "en": "The space guide keeps an area open to later changes. In an original paper scene, one movable chair could face a visitor, a small craft project or a window on different afternoons. An unassigned corner makes those alternatives imaginable without committing the whole room to one activity.",
          "zh": "空间指南为之后的变化留位置。一个原创纸上场景里，同一把可移动椅子可在不同午后朝向访客、纸作或窗户。不指定一角，让这些可能成立，而不把整间房交给同一活动。"
        },
        {
          "en": "An open patch need not imply minimalism or a more organised person. The full portrait also allows one chosen object to give the room character. This story does not inspect floor area, circulation, tenancy conditions or whether furniture can actually be moved.",
          "zh": "空地不必表示极简主义或人更有条理。完整画像也允许用一件选定物给房间特点。故事不检查面积、通行、居住条件，或家具实际能否移动。"
        }
      ]
    },
    {
      "id": "layers",
      "title": {
        "en": "A small collection: relationships among objects, not more possessions",
        "zh": "小收藏：物件之间的联系，而非更多拥有"
      },
      "paragraphs": [
        {
          "en": "The collection guide notices a few visible layers. An original imagined shelf might bring together a folded cloth, a postcard and a paper shape through a shared colour. You can explain why those three belong together without buying anything or filling every gap.",
          "zh": "收藏指南关注几层可见细节。一个原创想象架子可以通过共同色彩，让折布、明信片与纸形相伴。可以解释三者为何放一起，无需购买，也无需填满每处空隙。"
        },
        {
          "en": "Unpacking’s official English and French descriptions present a game about placing possessions in new homes, combining spatial puzzles with decoration.[1][2] It is a related creative product, not a source of our questions or a validated room-personality test. Our six written choices neither reproduce its rooms nor generate a playable unpacking puzzle.",
          "zh": "Unpacking的官方英法介绍呈现把物品放入新家的游戏，结合空间拼摆与装饰。[1][2]它是相关创作产品，不是本站题目来源，也不是经验证的房间人格测验。本站六次文字选择不复刻其房间，也不生成可操作的开箱谜题。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six selections and all equally highest atmosphere guides",
        "zh": "六次选择与所有同为最高的氛围指南"
      },
      "paragraphs": [
        {
          "en": "Every scene offers glow, space and layers once, with changing option positions. The selected emphasis receives one count. Each ranges from zero to six and the completed total is six. These counts describe selections inside this bank, without percentages of taste, design ability or population ranking.",
          "zh": "每个场景各提供光点、空间和层次一次，选项位置会变化。选中侧重加一次，各项零至六次，完成总和六。次数只描述题组内选择，不是品味百分比、设计能力或人群排名。"
        },
        {
          "en": "Three-three-zero retains two complete guides; two-two-two retains all three. All seven possible highest sets are supported, without random selection or a tie-break. The original summary, example, possible benefit, tradeoff and optional experiment remain intact. No psychometric reliability, validity or norms have been established for these authored recreational portraits.",
          "zh": "三、三、零保留两篇完整指南；二、二、二保留三篇。七种最高集合都可出现，不随机抽取，也不破同分。原概述、例子、可能用处、取舍与可选尝试保持完整。这些原创休闲画像尚未建立心理测量信度、效度或常模。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Keep the room fictional and the next experiment optional",
        "zh": "房间可以保持虚构，下一步尝试可自选"
      },
      "paragraphs": [
        {
          "en": "Start opens the first scene directly, with no account, address, photograph or room dimensions requested. Back permits edits. Retake clears the current run. Public result guides contain no individual answers, and reading all three does not change your counts.",
          "zh": "开始直接打开第一场景，不索取账号、地址、照片或房间尺寸。上一题允许改选，重玩清空本轮。公开指南不含个人答案，读完三篇不会改变次数。"
        },
        {
          "en": "Answers resolve in the browser. Optional saving keeps this edition’s draft in the current tab for up to twenty-four hours; completion, deletion or retake clears it. Without saving, refreshing can lose progress. Cookie-controlled usage analytics are separate from answer content. The optional paper experiments do not require a purchase, public upload or alteration of a real room.",
          "zh": "答案在浏览器内解析。可选保存把本版草稿留在当前标签页最长二十四小时，完成、删除或重玩会清除；不保存时刷新可能丢失进度。受Cookie设置控制的使用统计与答案内容分开。可选纸上尝试不要求购买、公开上传或改造真实房间。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Can I actually drag furniture or draw a floor plan here?",
        "zh": "能在这里拖家具或画平面图吗？"
      },
      "answer": {
        "en": "No. The interaction consists of six written choices. The illustration introduces the theme and is not an editable room canvas.",
        "zh": "不能。互动由六次文字选择构成，插画介绍主题，不是可编辑房间画布。"
      }
    },
    {
      "question": {
        "en": "Does the result reveal my personality through my room?",
        "zh": "结果能透过房间揭示人格吗？"
      },
      "answer": {
        "en": "No real room is examined. The result counts selected fictional arrangements without inferring personality, wellbeing or hidden motives.",
        "zh": "不检查真实房间。结果统计所选虚构布置，不推断人格、身心状况或隐藏动机。"
      }
    },
    {
      "question": {
        "en": "Do I need to buy or move anything?",
        "zh": "需要购买或移动东西吗？"
      },
      "answer": {
        "en": "No. Imagine the scene or optionally sketch it on paper. No purchase, renovation or real-world rearrangement is required.",
        "zh": "不需要。可以想象，或自选画在纸上，不需购买、装修或实际搬动物件。"
      }
    },
    {
      "question": {
        "en": "Can one imagined room use all three approaches?",
        "zh": "一间想象房可以同时采用三种方式吗？"
      },
      "answer": {
        "en": "Yes. Light, open space and collections can coexist. A highest count records the more frequently selected option family in this run, not an exclusive design rule.",
        "zh": "可以。光点、留白与收藏可共存。最高次数只记录本轮较常选的选项类别，不是排他的设计规则。"
      }
    },
    {
      "question": {
        "en": "Why can more than one complete guide appear?",
        "zh": "为什么会出现多篇完整指南？"
      },
      "answer": {
        "en": "Every emphasis sharing the highest count is retained. Three-three-zero gives two; two-two-two gives all three.",
        "zh": "同为最高次数的侧重都保留。三、三、零显示两篇，二、二、二显示三篇。"
      }
    },
    {
      "question": {
        "en": "Is an open corner an unfinished or incorrect answer?",
        "zh": "留白一角是未完成或错误答案吗？"
      },
      "answer": {
        "en": "No. The space guide deliberately leaves a use available. There are no correct answers, completeness grades or penalties for leaving an imagined corner undecided.",
        "zh": "不是。空间指南刻意保留可用位置，没有正确答案、完成度评级，或对未定角落的扣分。"
      }
    }
  ],
  "references": [
    {
      "url": "https://store.steampowered.com/app/1135690/Unpacking/?l=english",
      "label": {
        "en": "Unpacking: official English product description (related creative game)",
        "zh": "Unpacking：官方英语产品介绍（相关创作游戏）"
      }
    },
    {
      "url": "https://store.steampowered.com/app/1135690/Unpacking/?l=french",
      "label": {
        "en": "Unpacking: official French description of the same product",
        "zh": "Unpacking：同一产品的官方法语介绍"
      }
    }
  ]
},
  "road-trip-dj": {
  "label": {
    "en": "Original passenger-listening scenes · Turns, transitions and room for quiet",
    "zh": "原创乘客聆听情境 · 轮次、过渡与安静位置"
  },
  "instructions": {
    "en": "Imagine passengers sharing a music queue on a fictional journey. Across six written situations, choose how you would arrange listening today. No music plays and no device or driving controls are involved. Complete all six for three counts and every highest portrait in full.",
    "zh": "想象虚构旅程里，乘客共用音乐队列。六个文字情境中，选择今天愿怎样安排聆听。页面不播放音乐，也不涉及设备或驾驶操作；完成六题，查看三项次数与所有最高画像全文。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "A shared queue is an agreement between listeners",
        "zh": "共同队列，是听者之间的安排"
      },
      "paragraphs": [
        {
          "en": "The scenes concern several requests, contrasting tracks, a passenger who has not chosen, a queue longer than the journey, less sound and a satisfying listening interval. They compare how a fictional group can share a queue. No songs, genre preferences, listening history or knowledge questions are collected.",
          "zh": "场景涉及多人点歌、曲目反差、尚未选歌的乘客、队列长过旅程、少些声音，以及满意的聆听时段。它们比较虚构群体怎样共用队列，不收集歌曲、曲风偏好、听歌记录或知识题。"
        },
        {
          "en": "Visible turns, thoughtful transitions and an option for quiet can be combined. The format asks what you would choose first, not which listener deserves control. The imagined passenger setting does not give driving instructions, require anyone to operate a device or assess musical expertise.",
          "zh": "可见轮次、考虑过的过渡与安静选项可以组合。格式问首先会选什么，不判谁更配控制音乐。想象乘客场景不提供驾驶指令，不要求任何人操作设备，也不评音乐专业程度。"
        }
      ]
    },
    {
      "id": "turns",
      "title": {
        "en": "Visible turns: make a place in the queue understandable",
        "zh": "可见轮次：让队列里的位置易懂"
      },
      "paragraphs": [
        {
          "en": "The Visible-Queue DJ follows choices that show how a request enters the order, while allowing a turn to be passed. An original example is agreeing to one selection each for a short round, then checking whether anyone wants another round. A visible order need not become a rule that keeps playing after listeners want something else.",
          "zh": "队列看得见的点歌者跟随说明点播怎样进入顺序、也允许跳过的选择。一个原创例子是短短一轮先每人一首，再问是否还想下一轮。可见顺序无需变成听者已想换方式后仍继续播放的规则。"
        },
        {
          "en": "Apple’s English support page distinguishes adding a selection next or at the queue’s end and describes viewing and editing the order.[1] That is a related product example of making a queue explicit. This story does not connect to Apple Music, access an account or create, reorder or play a real queue.",
          "zh": "Apple英语支持页区分将所选内容接在下一首或队尾，并介绍查看与编辑顺序。[1]这是把队列说清楚的相关产品例子。本故事不连接Apple Music、不访问账号，也不创建、重排或播放真实队列。"
        }
      ]
    },
    {
      "id": "bridge",
      "title": {
        "en": "Between tastes: a transition can help without overruling a request",
        "zh": "口味之间：过渡可有帮助，也不压过点播"
      },
      "paragraphs": [
        {
          "en": "The Between-Tastes DJ follows an optional connecting selection, a short pause or a manageable closing sequence. An original example is offering a familiar short piece between two contrasting requests and asking whether listeners want it. A contrast can also remain simply because the group chose it.",
          "zh": "口味间搭桥的点歌者跟随可选连接曲、短停顿或易掌握的收尾序列。一个原创例子是在两首反差曲目之间提议一个熟悉短选项，并问听者是否愿意。鲜明对比也可因为大家选择而保留。"
        },
        {
          "en": "Spotify’s French Jam documentation describes participants adding songs to a shared queue and host settings for control.[2] It is a real collaboration feature, not a psychological model or an integration here. Neither a bridge count nor these service examples establishes sophistication, musical breadth or what everybody should enjoy.",
          "zh": "Spotify法语Jam文档介绍参与者向共同队列加歌，以及主持者的控制设置。[2]这是真实协作功能，不是心理模型，也不是本页集成。搭桥次数或这些服务例子，都不证明品味高级、音乐涉猎广，或所有人应喜欢什么。"
        }
      ]
    },
    {
      "id": "quiet",
      "title": {
        "en": "Music and pause: less sound is also a choice to ask about",
        "zh": "音乐与停顿：少些声音，也需要问过"
      },
      "paragraphs": [
        {
          "en": "The Music-and-Pause DJ follows an explicit opportunity to pause, stop early or skip selecting. An original example is asking whether a willing group prefers another short round or a break, without demanding a personal explanation. Not choosing a track can be a complete option.",
          "zh": "音乐与停顿的点歌者跟随明确暂停、提前结束或跳过选歌的机会。一个原创例子是问愿意一起听的人想再短听一轮还是歇会儿，无需索取私人理由。不点一首歌也可以是完整选择。"
        },
        {
          "en": "The original guide retains the tradeoff that quiet is not automatically everyone’s preference either. A request for less sound does not reveal a sensory condition, relationship feeling or fixed social personality. Listen to the actual answer instead of using a portrait to decide what another person must need.",
          "zh": "原指南保留取舍：安静也不自动是所有人的偏好。想少些声音不揭示感官状况、关系感受或固定社交人格。依据真实回答，而不是用画像决定别人一定需要什么。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six imagined arrangements, three counts and all highest portraits",
        "zh": "六种想象安排、三项次数与全部最高画像"
      },
      "paragraphs": [
        {
          "en": "Each question offers turns, bridge and quiet once, with changing positions. The selected direction gains one count; each is zero to six and the completed sum is six. Counts describe these within-bank choices, not listening time, song quality, popularity, musical ability or a personality percentage.",
          "zh": "每题各有轮次、搭桥和安静一次，位置会变化。选中方向加一次，各项零至六次，完成总和六。次数描述题组内选择，不是听歌时长、歌曲质量、受欢迎程度、音乐能力或人格百分比。"
        },
        {
          "en": "Every direction sharing the maximum remains. Three-three-zero shows two complete portraits and two-two-two shows all three. Seven highest sets are reachable without random selection or a tie-break. Each original guide retains its summary, example, possible benefit, tradeoff and optional experiment. No psychometric reliability, validity or population norms have been established for these recreational portraits.",
          "zh": "同为最高的方向全部保留。三、三、零显示两篇完整画像，二、二、二显示三篇。七种最高集合均可出现，不随机挑选，也不破同分。每篇原指南保留概述、例子、可能用处、取舍与可选尝试。这些休闲画像尚未建立心理测量信度、效度或人群常模。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Start without a music account, audio permission or a real journey",
        "zh": "无需音乐账号、音频权限或真实出行即可开始"
      },
      "paragraphs": [
        {
          "en": "Start opens the first question directly. No music account, passenger details, location, listening history or audio permission is requested. Answers resolve in the browser. Optional saving retains this edition’s draft in the current tab for up to twenty-four hours; completion, retake or deletion clears it.",
          "zh": "开始直接打开第一题。不索取音乐账号、乘客资料、地点、听歌历史或音频权限。答案在浏览器内解析；可选保存把本版草稿留在当前标签页最长二十四小时，完成、重玩或删除会清除。"
        },
        {
          "en": "Back permits edits and retake clears the run. Without saving, refreshing can lose progress. All three public guides are free to read without a subscription or sharing a result; links contain no individual answers. Cookie-controlled usage analytics are separate from answer content. No real listening session or trip is organised through the page.",
          "zh": "上一题允许改选，重玩清空本轮。不保存时刷新可能丢失进度。三篇公开指南无需订阅或分享结果即可免费阅读，链接不含个人答案。受Cookie设置控制的使用统计与答案内容分开。本页不组织真实听歌或出行。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Will this play music or generate a playlist?",
        "zh": "会播放音乐或生成歌单吗？"
      },
      "answer": {
        "en": "No. It records six written arrangement choices and displays authored portraits; no audio player or music-service integration is present.",
        "zh": "不会。这里只记录六个文字安排选择并显示原创画像，不提供音频播放器或音乐服务集成。"
      }
    },
    {
      "question": {
        "en": "Does it rate music taste or DJ skill?",
        "zh": "会评音乐品味或DJ技术吗？"
      },
      "answer": {
        "en": "No. It does not ask for tracks, identify genres or observe mixing. The focus is sharing an imagined queue.",
        "zh": "不会。它不索取曲目、不识别流派，也不观察混音；重点是共用想象队列。"
      }
    },
    {
      "question": {
        "en": "Is quiet always the best response?",
        "zh": "安静总是最佳回应吗？"
      },
      "answer": {
        "en": "No. The original guide says a pause is a shared option to ask about, not another atmosphere to impose.",
        "zh": "不是。原指南把停顿作为需要问过的共同选项，不是另一种强加氛围。"
      }
    },
    {
      "question": {
        "en": "Can more than one portrait be highest?",
        "zh": "可以不止一种画像最高吗？"
      },
      "answer": {
        "en": "Yes. Every equally highest direction appears in full, including all three at two-two-two.",
        "zh": "可以。每个同为最高方向均全文显示，包括二、二、二时的三篇。"
      }
    },
    {
      "question": {
        "en": "Must everyone add a song?",
        "zh": "每个人必须点一首吗？"
      },
      "answer": {
        "en": "No. The original queue portrait allows passing a turn without explanation. Participation is not measured by number of requests.",
        "zh": "不用。原队列画像允许不解释地跳过，参与不以点播多少来衡量。"
      }
    },
    {
      "question": {
        "en": "Does the result guide actual driving or device use?",
        "zh": "结果会指导真实驾驶或设备操作吗？"
      },
      "answer": {
        "en": "No. The setting is fictional passenger listening; no driving decision or device control is assessed or required.",
        "zh": "不会。设定是虚构乘客聆听，不评估或要求驾驶决定及设备操作。"
      }
    }
  ],
  "references": [
    {
      "url": "https://support.apple.com/en-au/109336",
      "label": {
        "en": "Apple Support: viewing and editing a music queue (English; related product)",
        "zh": "Apple支持：查看与编辑音乐队列（英语；相关产品）"
      }
    },
    {
      "url": "https://support.spotify.com/ca-fr/article/jam/",
      "label": {
        "en": "Spotify Support: shared Jam queue and host controls (French; related product)",
        "zh": "Spotify支持：共享Jam队列与主持控制（法语；相关产品）"
      }
    }
  ]
},
  "river-crossing": {
  "label": {
    "en": "Original tabletop fiction · A reversible trial, agreed help and chosen pace",
    "zh": "原创桌面想象 · 可撤回尝试、约好帮助与自选节奏"
  },
  "instructions": {
    "en": "Imagine a river drawn on paper and travellers represented by tokens. Across six written scenes, choose how you would approach the small shared activity. You do not move pieces on screen or solve a correct route. Complete all six for three counts and every highest portrait in full.",
    "zh": "想象纸上画着河流，旅客由棋子代表。六个文字场景里，选择自己愿怎样参与小小共同活动。无需在屏幕移动棋子，也不解唯一正确路线；完成六题，查看三项次数与所有最高画像全文。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "The paper river is a setting for choices, not a crossing simulator",
        "zh": "纸河是选择的场景，不是过河模拟器"
      },
      "paragraphs": [
        {
          "en": "The scenes involve a first bridge, a line ending one square short, different playing rhythms, moving two tokens together, adding difficulty and a final picture. They compare approaches to a fictional tabletop challenge. There is no draggable map, winning route, physics model or outdoor task to complete on this page.",
          "zh": "场景涉及第一座桥、差一格的线、不同游戏节奏、双棋共移、增加难度和最后画面。它们比较参与虚构桌面挑战的方式。本页没有拖拽地图、获胜路线、物理模型或要完成的户外任务。"
        },
        {
          "en": "Testing, coordinating and pacing can all contribute to the same activity. Selecting one first highlights a relative choice here. It does not establish courage, caution, leadership or readiness for real water. The drawn river and erasable bridges are an imaginative premise, not a recommendation for any actual crossing.",
          "zh": "试行、协作与节奏可同时用于活动。先选一种，突出本次相对选择，不证明勇气、谨慎、领导力或真实涉水准备。画出的河与可擦的桥属于想象前提，不构成真实过河建议。"
        }
      ]
    },
    {
      "id": "tester",
      "title": {
        "en": "An erasable bridge: name one question before a small trial",
        "zh": "可擦纸桥：先说清小尝试要看什么"
      },
      "paragraphs": [
        {
          "en": "The tester portrait follows short demonstrations and changes that can be undone in the fictional setting. An original hobby example is using spare paper pieces to check whether two model parts meet before placing them in a finished arrangement. Keep the observation even when the first attempt is discarded.",
          "zh": "试行者画像跟随虚构场景里短演示与可撤回调整。一个原创爱好例子是先用备用纸片看看两个模型部件是否接得上，再放入成品安排。即便丢掉第一次尝试，也保留看到的情况。"
        },
        {
          "en": "Board Game Arena’s English turn-based FAQ treats pace and undo as explicit product rules, noting that undo support depends on the game.[1] This is a useful contrast: reversibility should not be assumed in every activity. Our page supports editing answers with Back and clearing them with Retake, not undoing moves in an actual online board game.",
          "zh": "Board Game Arena英语回合制FAQ把节奏和撤回作为明确产品规则，并说明撤回支持取决于具体游戏。[1]这个对照提醒：不能假定每种活动都可撤回。本页支持上一题改答案与重玩清空，不是撤销真实在线桌游的走棋。"
        }
      ]
    },
    {
      "id": "partner",
      "title": {
        "en": "Two-token coordination: make the joint step specific",
        "zh": "双棋协作：把共同一步说具体"
      },
      "paragraphs": [
        {
          "en": "The partner portrait follows agreed roles, a shared cue or a single step undertaken together. An original example is asking whether one person wants to hold a paper arch while the other places its base. The invitation needs an answer; an imagined companion is not automatically available for whatever help you prefer.",
          "zh": "伙伴画像跟随约好的角色、共同信号或一起完成的一步。一个原创例子是问对方是否愿扶住纸拱，另一人摆底座。邀请需要回应；想象同伴不表示现实中别人自动可提供任何帮助。"
        },
        {
          "en": "Helvetiq’s French Bandido page describes a cooperative card game with a shared outcome.[2] It provides a related tabletop example, not our rules or scoring authority. No cards, characters, tunnel layout or material from that game are used here, and a high partner count does not certify teamwork skill.",
          "zh": "Helvetiq法语Bandido页介绍共同结局的合作纸牌游戏。[2]它提供相关桌面例子，不是本站规则或计分权威。本页不使用该游戏的牌、人物、隧道布局或素材；伙伴次数高也不认证团队技能。"
        }
      ]
    },
    {
      "id": "pacer",
      "title": {
        "en": "A rest-stop route: choose the challenge rather than escalating automatically",
        "zh": "歇脚路线：主动选挑战，不自动加难"
      },
      "paragraphs": [
        {
          "en": "The pacer portrait follows an easy route, an agreed stopping place and room for different rhythms. An original example is asking whether a casual puzzle round should continue at its present difficulty before adding another rule. A pause belongs to the chosen activity; it need not be a mistake or failure.",
          "zh": "节奏画像跟随容易路线、约定停点与容纳不同节奏。一个原创例子是在休闲拼图一轮后，先问是否想继续当前难度，再加新规则。停顿属于自选活动，不必是失误或失败。"
        },
        {
          "en": "The original guide also keeps the possibility that the easiest route becomes uninteresting. Pacing is not an instruction to avoid every change. Neither a fast choice nor a slower one measures endurance, processing speed, risk tolerance or a fixed personal capacity.",
          "zh": "原指南也保留最容易路线渐渐无趣的可能。安排节奏不要求回避每次变化。快选择或慢选择都不测耐力、加工速度、风险承受或固定个人能力。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices produce three counts, not a puzzle score",
        "zh": "六次选择产生三项次数，不是解谜分数"
      },
      "paragraphs": [
        {
          "en": "Each scene offers tester, partner and pacer once, with changing positions. The selected direction receives one count; each ranges from zero to six and the total after six answers is six. No route is marked correct, and no speed or survival points are calculated.",
          "zh": "每个场景各有试行、伙伴与节奏一次，位置会变化。选中方向加一次，各项零至六次，六次作答总和六。没有路线被判正确，也不计算速度或生存点数。"
        },
        {
          "en": "Every direction sharing the maximum stays: three-three-zero shows two portraits and two-two-two shows three. Seven highest sets are possible without random selection or a tie-break. Every original guide retains its summary, example, possible benefit, tradeoff and optional experiment. These recreational portraits have no established psychometric reliability, validity or norms.",
          "zh": "同为最高的方向均保留：三、三、零显示两篇，二、二、二显示三篇。七种最高集合均可出现，不随机选择，也不破同分。每篇原指南保留概述、例子、可能用处、取舍与可选尝试。这些休闲画像尚未建立心理测量信度、效度或常模。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Start without equipment, another player or location details",
        "zh": "直接开始，无需器材、搭档或地点资料"
      },
      "paragraphs": [
        {
          "en": "Start opens the first question directly. The companion and tokens are fictional; no partner connection, equipment, account, name or location is needed. Answers resolve in the browser. Optional saving keeps this edition’s draft in the current tab for up to twenty-four hours; completion, retake or deletion clears it.",
          "zh": "开始直接打开第一题。同伴与棋子属于虚构，无需连线搭档、器材、账号、姓名或地点。答案在浏览器内解析；可选保存把本版草稿留在当前标签页最长二十四小时，完成、重玩或删除会清除。"
        },
        {
          "en": "Back permits edits and retake clears the current run. Without saving, refreshing can lose progress. All three public guides are freely readable without sharing a result; links contain no individual answers. Cookie-controlled usage analytics are separate from answer content. The optional examples concern harmless hobbies, not real crossing, rescue or hazard decisions.",
          "zh": "上一题允许改选，重玩清空本轮。不保存时刷新可能丢失进度。三篇公开指南无需分享结果即可免费阅读，链接不含个人答案。受Cookie设置控制的使用统计与答案内容分开。可选例子用于无害爱好，不用于真实涉水、救援或危险决策。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Will I solve a playable river-crossing puzzle?",
        "zh": "会解一个可操作的过河谜题吗？"
      },
      "answer": {
        "en": "No. Six written choices use a paper map as their setting. The page has no draggable pieces or correct route to solve.",
        "zh": "不会。六个文字选择以纸地图为场景，页面没有可拖棋子或要解出的正确路线。"
      }
    },
    {
      "question": {
        "en": "Is there a courage or risk-taking score?",
        "zh": "会给勇气或冒险分吗？"
      },
      "answer": {
        "en": "No. Counts reflect preferred responses within this fictional tabletop activity, not real-world risk or ability.",
        "zh": "不会。次数反映虚构桌面活动内的所选回应，不是现实风险或能力。"
      }
    },
    {
      "question": {
        "en": "Does the timed-round option start a timer?",
        "zh": "短计时回合选项会启动计时器吗？"
      },
      "answer": {
        "en": "No. It describes an imagined choice. There is no countdown or timed performance measurement in the quiz.",
        "zh": "不会。它描述想象选择，问卷不倒计时，也不测限时表现。"
      }
    },
    {
      "question": {
        "en": "Can two or three approaches appear together?",
        "zh": "两种或三种方式可以一起出现吗？"
      },
      "answer": {
        "en": "Yes. All directions sharing the highest count are retained in full, including all three at two-two-two.",
        "zh": "可以。所有最高方向均完整保留，包括二、二、二时的三篇。"
      }
    },
    {
      "question": {
        "en": "Do I need another player?",
        "zh": "需要另一位玩家吗？"
      },
      "answer": {
        "en": "No. The companion is part of the written premise; the page neither connects players nor assesses someone else.",
        "zh": "不需要。同伴是文字前提的一部分，页面不连接玩家，也不评估他人。"
      }
    },
    {
      "question": {
        "en": "Can these results guide an actual outdoor crossing?",
        "zh": "结果能指导真实户外过河吗？"
      },
      "answer": {
        "en": "No. No water conditions, equipment or skills are examined. The full guides concern a fictional paper activity.",
        "zh": "不能。这里不检查水况、装备或技能，完整指南讨论虚构纸面活动。"
      }
    }
  ],
  "references": [
    {
      "url": "https://en.doc.boardgamearena.com/Turn_based_FAQ",
      "label": {
        "en": "Board Game Arena: pace and game-specific undo rules (English; related platform)",
        "zh": "Board Game Arena：节奏与具体游戏撤回规则（英语；相关平台）"
      }
    },
    {
      "url": "https://helvetiq.com/ch_fr/bandido",
      "label": {
        "en": "Helvetiq: Bandido cooperative-game overview (French; related tabletop game)",
        "zh": "Helvetiq：Bandido合作游戏介绍（法语；相关桌游）"
      }
    }
  ]
},
  "reunion-style": {
  "label": {
    "en": "Original reunion scenes · A past thread, present curiosity or a fresh meeting",
    "zh": "原创重逢情境 · 旧线索、当下好奇或新见面"
  },
  "instructions": {
    "en": "Imagine an ordinary gap in a previously pleasant connection. Across six written scenes, choose the opening you would prefer today. No actual message is sent and neither person owes renewed closeness. Complete all six for three counts and every highest portrait in full.",
    "zh": "想象曾经相处愉快的联系出现一段普通间隔。六个文字场景里，选择今天较想采用的开场。不会发送真实消息，双方也不欠恢复亲近；完成六题，查看三项次数与所有最高画像全文。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "Reconnecting without deciding the whole relationship in advance",
        "zh": "重新接上，不预先决定整段关系"
      },
      "paragraphs": [
        {
          "en": "The scenes cover an opening message, noticing change, an old activity losing its appeal, a quiet moment, an uncertain next meeting and what made the reunion meaningful. They ask about a contact you may freely choose. The premise is an ordinary gap, not a request to override a refusal, repair a serious conflict or resume contact that somebody has ended.",
          "zh": "场景涉及开场消息、察觉变化、旧活动不再吸引、安静片刻、未确定的下次，以及重逢何以有意义。它们问的是可自由选择的联系。前提是普通间隔，不是要求越过拒绝、解决严重冲突，或恢复别人已结束的联络。"
        },
        {
          "en": "A shared detail, an easy current question and a short new meeting can work together. The single-choice format highlights which opening appeals first in this story. It does not tell you what the other person wants, measure relationship strength or predict whether contact will continue.",
          "zh": "共同细节、容易的近况问题与短短新见面可以组合使用。单选格式突出这段故事里首先吸引的开场，不告诉你对方想什么，不测关系强弱，也不预测联系会否继续。"
        }
      ]
    },
    {
      "id": "thread",
      "title": {
        "en": "An old thread opens a door; it does not require the old script",
        "zh": "旧线索打开门，不要求照演旧剧本"
      },
      "paragraphs": [
        {
          "en": "The Old-Thread Reconnector starts with something both people recognise. An original example is mentioning a harmless café drawing you once enjoyed, then asking what they like making now. You can acknowledge the past without asking for the old hobby, schedule or closeness to return unchanged.",
          "zh": "旧线索重连者从双方认得的东西开始。一个原创例子是提到曾一起喜欢的无害咖啡馆画作，再问对方现在喜欢做什么。承认过去，无需要求旧爱好、日程或亲近程度原样回来。"
        },
        {
          "en": "Trace’s English product page describes reminders of the day people met and shareable anniversary cards.[2] That is a related example of using a past detail, not a method this quiz implements. Our page does not collect meeting dates, connect to contacts, schedule notifications or send a card. A reminder also does not establish that another person wants a reunion.",
          "zh": "Trace英语产品页介绍相识日期提醒与可分享的纪念卡。[2]这是使用过去细节的相关例子，不是本页实现的方法。本站不收集相识日期、不连接通讯录、不安排通知，也不发卡片。提醒本身也不能证明对方想重逢。"
        }
      ]
    },
    {
      "id": "present",
      "title": {
        "en": "Present-day curiosity: an invitation rather than an interview",
        "zh": "当下好奇：一份邀请，而非一次采访"
      },
      "paragraphs": [
        {
          "en": "The Present-Day Reconnector gives the person room to decide what to share now. An original example is asking about one small interest and offering a short update of your own. A complete account of the intervening years is not the entrance fee for a conversation.",
          "zh": "当下近况重连者给对方决定此刻分享什么的空间。一个原创例子是问一项小兴趣，也说一点自己的近况。完整汇报分开几年的经历，不是开始对话的入场费。"
        },
        {
          "en": "The full guide retains a tradeoff: a succession of update questions can feel like an interview. One mutual exchange may be enough, and a brief answer is not evidence of attachment style, concealed resentment or lack of care. The portrait concerns the response selected here, not an assessment of the absent person.",
          "zh": "完整指南保留取舍：连续问近况可能像采访。一次双向交流可以已经足够，简短回答不证明依恋类型、暗藏怨意或不关心。画像讨论本次选的回应，不评估未参与的那个人。"
        }
      ]
    },
    {
      "id": "fresh",
      "title": {
        "en": "A small new meeting can be clear and easy to decline",
        "zh": "一次小见面，可以清楚，也容易拒绝"
      },
      "paragraphs": [
        {
          "en": "The Small-New-Start Reconnector allows a modest encounter to stand on its own. An original invitation could name one short public exhibition visit, with no need to recreate an old routine or promise another meeting. Its outcome can inform a later choice without deciding the relationship in advance.",
          "zh": "小小重新开始者允许适度相遇本身成立。一个原创邀请可以提出短看一次公共展览，无需复原旧日程，也不承诺再见。由这次经历帮助之后选择，不预先决定整段关系。"
        },
        {
          "en": "Liu and colleagues’ 2022 paper reports that people underestimated recipients’ appreciation in their reaching-out experiments.[1] This is group-level evidence about predictions, not a guarantee of a reply or validation of our three categories. Only the abstract and opening definition were reviewed for this context; no individual relationship or unwanted contact can be judged from that average.",
          "zh": "Liu等人2022年论文报告，在其主动联系实验中，人们低估了接收者的感谢程度。[1]这是关于预测的群体证据，不保证回复，也不验证本站三分类。本处背景核对限于摘要与开篇定义，不能据平均结果判断具体关系或不受欢迎的联系。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices retain all equally highest reunion portraits",
        "zh": "六次选择，保留全部同为最高的重逢画像"
      },
      "paragraphs": [
        {
          "en": "Every question offers thread, present and fresh once, with option positions changing. The selected direction receives one count; each ranges from zero to six and a completed total is six. The numbers are within-bank choices, not social skill, nostalgia, attachment, probabilities of reconciliation or population percentiles.",
          "zh": "每题各有旧线索、当下和新开始一次，选项位置会变化。选中方向加一次，各项零至六次，完成总和六。数字是题组内的选择，不是社交技能、怀旧、依恋、和好概率或人群百分位。"
        },
        {
          "en": "All highest directions remain: three-three-zero keeps two portraits; two-two-two keeps all three. Seven highest sets are reachable without randomness or a tie-break. Each original guide retains its full summary, example, possible benefit, tradeoff and optional experiment. These authored recreational portraits have no established psychometric reliability, validity or population norms.",
          "zh": "所有最高方向均保留：三、三、零保留两篇，二、二、二保留三篇。七种最高集合均可出现，不随机挑选，也不破同分。每篇原指南保留完整概述、例子、可能用处、取舍与可选尝试。这些原创休闲画像尚未建立心理测量信度、效度或人群常模。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Begin with fiction, without entering a real contact",
        "zh": "从虚构开始，无需输入真实联系人"
      },
      "paragraphs": [
        {
          "en": "Start opens the first question directly. No account, name, contact, relationship history or message text is requested. Answers resolve in the browser. Optional saving keeps this edition’s draft in the current tab for up to twenty-four hours; completion, retake or deletion clears it.",
          "zh": "开始直接打开第一题。不索取账号、姓名、联系人、关系历史或消息文本。答案在浏览器内解析；可选保存把本版草稿留在当前标签页最长二十四小时，完成、重玩或删除会清除。"
        },
        {
          "en": "Back permits edits and retake clears the current run. Without saving, refreshing can lose progress. All three public guides are free to read; links contain no individual answers and sharing is not required. Cookie-controlled usage analytics are separate from answer content. Reading a portrait never sends an invitation or asks another person to take part.",
          "zh": "上一题允许改选，重玩清空本轮。不保存时刷新可能丢失进度。三篇公开指南免费阅读，链接不含个人答案，也无需分享。受Cookie设置控制的使用统计与答案内容分开。阅读画像不会发出邀请或要求他人参与。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Will this send a message or invitation?",
        "zh": "会发送消息或邀请吗？"
      },
      "answer": {
        "en": "No. It is a six-scene fictional choice game; it does not access contacts, send messages or arrange a meeting.",
        "zh": "不会。这是六场景虚构选择游戏，不访问通讯录、不发消息，也不安排见面。"
      }
    },
    {
      "question": {
        "en": "Does a high score mean the other person wants contact?",
        "zh": "次数高表示对方想联系吗？"
      },
      "answer": {
        "en": "No. The other person has not answered. Your choices cannot establish their interest, consent or future response.",
        "zh": "不表示。对方未作答，你的选择不能证明对方的兴趣、意愿或之后回应。"
      }
    },
    {
      "question": {
        "en": "Must I explain the entire gap first?",
        "zh": "必须先解释完整联络空白吗？"
      },
      "answer": {
        "en": "No. The premise allows a small opening without a complete life update, while leaving both people free to choose how much to share.",
        "zh": "不必。设定允许从小开场开始而不先汇报完整人生，双方可自主决定分享多少。"
      }
    },
    {
      "question": {
        "en": "Does this identify an attachment pattern?",
        "zh": "能识别依恋模式吗？"
      },
      "answer": {
        "en": "No. The portraits count selected openings within fictional scenes, without measuring attachment or diagnosing a relationship.",
        "zh": "不能。画像只统计虚构场景所选开场，不测依恋，也不诊断关系。"
      }
    },
    {
      "question": {
        "en": "Why are two or three complete portraits possible?",
        "zh": "为什么有两篇或三篇完整画像？"
      },
      "answer": {
        "en": "Every direction sharing the maximum remains. Three-three-zero shows two; two-two-two shows three.",
        "zh": "同为最高的方向均保留。三、三、零显示两篇，二、二、二显示三篇。"
      }
    },
    {
      "question": {
        "en": "Must a pleasant reunion lead to regular contact?",
        "zh": "愉快重逢必须变成固定联系吗？"
      },
      "answer": {
        "en": "No. The original new-start guide leaves future closeness undecided. A small meeting can be meaningful on its own.",
        "zh": "不用。原新开始指南让未来亲近保持未定，一次小见面本身可以有意义。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.apa.org/pubs/journals/releases/psp-pspi0000402.pdf",
      "label": {
        "en": "Liu et al. (2022): reaching-out predictions, abstract and definition (English; limited research context)",
        "zh": "Liu等（2022）：主动联系预测，摘要与定义（英语；限定研究背景）"
      }
    },
    {
      "url": "https://tracewith.app/",
      "label": {
        "en": "Trace: creator’s friendship-anniversary reminder overview (English; related product)",
        "zh": "Trace：开发者的相识纪念提醒介绍（英语；相关产品）"
      }
    }
  ]
},
  "reading-ritual": {
  "label": {
    "en": "Original leisure-reading scenes · Continuity, connections and returning",
    "zh": "原创休闲阅读情境 · 连续、关联与回来"
  },
  "instructions": {
    "en": "Answer for reading you choose freely, including print, accessible digital text or audiobooks. In six everyday scenes, choose the arrangement that would feel inviting now. No reading passage, speed task or comprehension test is required. All highest-count portraits appear in full.",
    "zh": "请代入自己选择的休闲阅读，包括纸本、无障碍电子文本或有声书。在六个日常场景里，选眼下觉得愿意采用的安排。无需阅读指定文章、不测速度或理解力；所有最高次数画像均全文显示。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "Reading rituals: how would you choose, pause and return?",
        "zh": "阅读仪式：你会怎样选择、停下与回来？"
      },
      "paragraphs": [
        {
          "en": "The six scenes cover a free hour, an unfamiliar topic, an interruption, a book that does not hold you today, finishing a work and an inviting setup. They compare ways of arranging voluntary reading. Required study, work deadlines, literacy assessments and judgments about how many books someone ought to finish are outside this story.",
          "zh": "六个场景涉及自由的一小时、陌生话题、中途停下、今天读不进去的书、读完作品，以及吸引人的安排。它们比较自愿阅读的组织方式，不涉及必修学习、工作期限、读写能力评估，也不判断一个人应读完多少书。"
        },
        {
          "en": "The three portraits concern continuity within one work, connections between works and a familiar occasion for returning. They can coexist: you might follow one chapter, keep a related question and return at a comfortable time. The forced choice highlights relative appeal now; it does not assign a fixed learning style or rank readers.",
          "zh": "三篇画像关注一部作品内的连续感、作品之间的联系，以及容易回来的熟悉时机。它们可以共存：读下一章、留一个关联问题、在舒服时段回来。单选突出当下相对吸引点，不分配固定学习风格，也不给读者排名。"
        }
      ]
    },
    {
      "id": "immerse",
      "title": {
        "en": "One world at a time: preserve a thread without waiting for perfection",
        "zh": "一次一个世界：保留线索，不必等完美时段"
      },
      "paragraphs": [
        {
          "en": "The continuity portrait follows choices that let one voice, scene or argument develop. An original example is leaving a sentence about where a fictional character was heading, then rereading the last paragraph next time. The note is an invitation to return, not evidence that comprehension has improved.",
          "zh": "连续感画像跟随让一种声音、情节或论述展开的选择。一个原创例子是留一句虚构人物正走向哪里的提示，下次重读上一段。提示是回来的邀请，不证明理解力提高。"
        },
        {
          "en": "The original guide retains a tradeoff: waiting for a perfectly uninterrupted hour can delay starting. A short session need not reproduce the experience of a long one. Selecting continuity does not measure attention span, concentration, seriousness or a superior reading format.",
          "zh": "原指南保留一项取舍：等待完全不被打扰的一小时，可能推迟开始。短时阅读无需复制长时段的体验。选连续感不测注意广度、专注力、认真程度或更优载体。"
        }
      ]
    },
    {
      "id": "trail",
      "title": {
        "en": "A trail between books: name the connecting question",
        "zh": "书间小径：说清连接它们的问题"
      },
      "paragraphs": [
        {
          "en": "The trail portrait follows a reference, subject or contrast into another work. An original example is moving from a fictional harbour story to an atlas and then a travel account, noting the question that connects them. Different accounts can disagree; a chain of references does not verify every claim within it.",
          "zh": "小径画像顺着引用、主题或对照走向另一部作品。一个原创例子是从虚构港口故事走到地图册，再看旅行记录，记下连接它们的问题。不同记录可以不一致，引用链也不自动验证其中每个主张。"
        },
        {
          "en": "A French teaching resource from the Académie de Grenoble discusses reading journals that connect a text with other reading and forms of expression.[2] This supports a related example of reflecting on connections. Its classroom activities and educational purposes do not validate our three portraits or become an assignment for leisure readers.",
          "zh": "法国格勒诺布尔学区的教学资料讨论用阅读笔记连接文本、其他阅读与表达形式。[2]它提供了反思关联的相关例子。课堂活动与教育目的不验证本站三篇画像，也不转化成休闲读者的作业。"
        }
      ]
    },
    {
      "id": "appointment",
      "title": {
        "en": "A small appointment: a welcoming occasion without a streak",
        "zh": "小小约定：容易回来的时机，无需连续打卡"
      },
      "paragraphs": [
        {
          "en": "The appointment portrait follows a familiar place or short occasion, without a page target. An original example is making a chosen text easy to reach during a usual pause and allowing a busy day to pass without catching up. The story does not prescribe daily reading, a minimum duration or a productivity programme.",
          "zh": "约定画像跟随熟悉位置或短时机，不设页数目标。一个原创例子是在平时歇一会儿的地方容易拿到所选文本，也允许忙的一天过去而不补进度。故事不开每日阅读、最低时长或效率计划。"
        },
        {
          "en": "Silent Book Club describes bringing a chosen book in different formats, a shared reading interval and optional conversation afterwards.[1] That is a real community format, not proof that a routine is best for everyone. This page does not enrol you in a club, arrange a session, track reading or require another person.",
          "zh": "Silent Book Club介绍自选书、多种载体、共同阅读时段，以及之后可选的交谈。[1]这是真实社群形式，不证明固定安排适合每个人。本页不报名读书会、不组织场次、不追踪阅读，也不需要另一个人参加。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices retain all highest reading portraits",
        "zh": "六次选择，保留全部最高阅读画像"
      },
      "paragraphs": [
        {
          "en": "Each question offers continuity, trail and appointment once, with positions changing. One selected direction receives one count; each ranges from zero to six and the completed sum is six. The numbers describe choices within these scenes, not reading speed, comprehension, intelligence, vocabulary or how many books you have read.",
          "zh": "每题各有连续感、小径和约定一次，位置会变化。选中方向加一次，各项零至六次，完成总和六。数字描述这些场景内的选择，不是阅读速度、理解、智力、词汇量或读过的书数。"
        },
        {
          "en": "Every direction sharing the maximum stays: three-three-zero gives two complete portraits and two-two-two gives three. All seven highest sets can occur without a random tie-break. Each original guide retains its summary, example, possible benefit, tradeoff and optional experiment. These authored recreational portraits have no established psychometric reliability, validity or population norms.",
          "zh": "同为最高的方向均保留：三、三、零显示两篇完整画像，二、二、二显示三篇。七种最高集合均可出现，不随机破同分。每篇原指南保留概述、例子、可能用处、取舍与可选尝试。这些原创休闲画像尚未建立心理测量信度、效度或人群常模。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Start directly, without sharing a reading history",
        "zh": "直接开始，无需分享阅读记录"
      },
      "paragraphs": [
        {
          "en": "Start opens the first question directly. No title list, reading log, voice recording, account or real name is needed. Answers resolve in the browser. Optional saving keeps this edition’s draft in the current tab for up to twenty-four hours; completion, retake or deletion clears it.",
          "zh": "开始直接打开第一题。无需书名清单、阅读日志、录音、账号或真实姓名。答案在浏览器内解析；可选保存把本版草稿留在当前标签页最长二十四小时，完成、重玩或删除会清除。"
        },
        {
          "en": "Back permits edits, while retake clears the run. Without saving, refreshing can lose progress. All three public guides are freely readable, without sharing a result or buying a book; guide links contain no individual answers. Cookie-controlled site usage analytics are separate from answer content. The optional ideas are invitations, not reading obligations.",
          "zh": "上一题允许改选，重玩清空本轮。不保存时刷新可能丢失进度。三篇公开指南无需分享结果或买书即可免费阅读，链接不含个人答案。受Cookie设置控制的使用统计与答案内容分开。可选点子是一份邀请，不是阅读义务。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Are audiobooks and accessible digital texts included?",
        "zh": "有声书与无障碍电子文本也可以吗？"
      },
      "answer": {
        "en": "Yes. The original premise includes these formats. Choose for voluntary reading you enjoy, without treating one format as superior.",
        "zh": "可以。原设定包括这些形式；代入喜欢的自愿阅读，不把一种载体当作更优。"
      }
    },
    {
      "question": {
        "en": "Does this test reading speed or comprehension?",
        "zh": "会测阅读速度或理解力吗？"
      },
      "answer": {
        "en": "No. There is no timed text, comprehension task or reference-group comparison. Counts describe the arrangements selected.",
        "zh": "不会。没有限时文本、理解任务或参照人群比较；次数描述所选安排。"
      }
    },
    {
      "question": {
        "en": "Do I need to finish a book before following another?",
        "zh": "必须读完一本才能看另一本吗？"
      },
      "answer": {
        "en": "No. The trail portrait allows connections across works. The guide also notes that saving many titles is different from actually reading them.",
        "zh": "不用。小径画像允许作品间的联系；指南也提醒收藏很多书名与实际阅读不同。"
      }
    },
    {
      "question": {
        "en": "What happens when two portraits have the same highest count?",
        "zh": "两篇画像次数同为最高时怎样处理？"
      },
      "answer": {
        "en": "Both remain in full. All three remain at two-two-two; the system does not pick one at random.",
        "zh": "两篇均保留全文。二、二、二时三篇均保留，系统不随机选一篇。"
      }
    },
    {
      "question": {
        "en": "Does the appointment portrait require a daily streak?",
        "zh": "约定画像要求每日打卡吗？"
      },
      "answer": {
        "en": "No. It concerns a welcoming occasion, not a quota, streak or debt to make up after a missed day.",
        "zh": "不要求。它关注容易回来的时机，不是定额、连续打卡或错过一天后要补的欠账。"
      }
    },
    {
      "question": {
        "en": "Will this recommend titles or keep a reading log?",
        "zh": "会推荐书目或保存阅读日志吗？"
      },
      "answer": {
        "en": "No. All written scenes are supplied. The page counts choices and displays guides; it does not collect titles or track reading.",
        "zh": "不会。文字场景已提供；页面统计选择并显示指南，不收集书名或追踪阅读。"
      }
    }
  ],
  "references": [
    {
      "url": "https://silentbook.club/pages/about-us",
      "label": {
        "en": "Silent Book Club: chosen formats and optional shared reading (English; related community)",
        "zh": "Silent Book Club：自选载体与可选共同阅读（英语；相关社群）"
      }
    },
    {
      "url": "https://lettres-pedagogie.web.ac-grenoble.fr/2de1re/des-activites-pour-prendre-en-compte-le-sujet-lecteur-au-college-et-au-lycee",
      "label": {
        "en": "Académie de Grenoble: reading journals and links across works (French; teaching context)",
        "zh": "格勒诺布尔学区：阅读笔记与作品关联（法语；教学背景）"
      }
    }
  ]
},
  "rainy-window": {
  "label": {
    "en": "Original imagined sketch · Nearby objects, layered glass and distance",
    "zh": "原创想象速写 · 近物、叠影与远景"
  },
  "instructions": {
    "en": "Imagine the view described in each of six scenes and choose how you would frame it today. These are written choices, not a drawing canvas or image upload. No artistic experience is needed. Complete all six to see three counts and every highest picture portrait in full.",
    "zh": "想象六个文字场景，选择今天想怎样为它取景。这是文字选择，不是绘图画布或图片上传。无需绘画经验；完成六题，查看三项次数与所有最高画面画像全文。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "A rainy window with three possible focal layers",
        "zh": "一扇雨窗，三种可选的画面焦点"
      },
      "paragraphs": [
        {
          "en": "The six scenes concern a main subject, a raindrop, removing crowded details, a colour accent, a second crop and a page title. They ask what you would include or leave out of an imagined sketch. There is no correct composition to discover, no image recognition and no examination of a drawing you have made.",
          "zh": "六个场景依次涉及主要对象、雨滴、删去拥挤细节、一点颜色、第二次裁切和纸页标题。它们问你想在想象速写里保留或省去哪部分，没有唯一正确构图，不识别图像，也不检查你实际画出的作品。"
        },
        {
          "en": "A windowsill object, a reflected room and distant rooftops can share one picture. Choosing one first is a relative decision for this scene, not evidence of introversion, hidden feelings or a wish to escape. The illustration introduces the fictional setting; the written prompts supply everything needed to play.",
          "zh": "窗台物件、房间倒影与远处屋顶可以同处一幅画。先选一种，是这个场景里的相对决定，不证明内向、隐藏感受或逃离愿望。插画引入虚构环境，作答所需内容均由文字题目提供。"
        }
      ]
    },
    {
      "id": "near",
      "title": {
        "en": "Windowsill still-life: make the nearby subject deliberate",
        "zh": "窗台静物：有意选择近处对象"
      },
      "paragraphs": [
        {
          "en": "The National Gallery defines foreground as the picture space closest to the viewer and discusses how size and detail can help represent distance.[1] That is art terminology, not a prescription for our three outcomes. A nearby subject need not be more detailed, important or artistically successful than a distant one.",
          "zh": "英国国家美术馆将前景解释为画面中较靠近观者的空间，并讨论大小与细节怎样呈现远近。[1]这是美术术语，不是本站三种结果的规范。近处对象无需比远处更精细、更重要，或在艺术上更成功。"
        },
        {
          "en": "The Windowsill Still-Life follows choices that give a cup, plant or ordinary object room on the page. An original comparison is placing the same cup in a close crop and then a wider crop, keeping the cup unchanged. The comparison concerns what context appears, not whether you belong indoors or notice more than other people.",
          "zh": "窗台静物页跟随给杯子、植物或普通物件留位置的选择。一个原创对照是让同一只杯子先进入近裁画面，再进入较宽画面，杯子本身不变。比较的是哪些环境被看见，不是你是否适合待在室内，或是否比别人更敏锐。"
        }
      ]
    },
    {
      "id": "reflection",
      "title": {
        "en": "Layered glass: two visible spaces, not a hidden psychological message",
        "zh": "叠影玻璃：两个可见空间，不是隐藏心理讯息"
      },
      "paragraphs": [
        {
          "en": "The Layered-Glass Page follows the overlap of a reflected room and the scene beyond. In an original paper exercise, place one translucent shape over another and leave an uncovered corner of each. You can compare the individual shapes and the overlap without assigning a symbolic meaning to either.",
          "zh": "叠影玻璃页跟随房间倒影与外景的重叠。一个原创纸面练习是让两张半透明形状部分相叠，各留一个未覆盖的角。可以比较各自形状与重合处，无需给它们分配象征含义。"
        },
        {
          "en": "Louvre-Lens’s French discussion of landscape paintings describes framing trees, reflected water and different views of a place.[2] These are examples of discussing visible composition. They do not validate our categories or justify reading emotions from a chosen reflection. The page makes no projective interpretation of colour, glass or rain.",
          "zh": "卢浮宫朗斯分馆的法语风景画讨论涉及作为框景的树、水面反射，以及同一地点的不同视角。[2]这些是讨论可见构图的例子，不验证本站分类，也不支持从所选倒影读取情绪。本页不对颜色、玻璃或雨作心理投射解释。"
        }
      ]
    },
    {
      "id": "distance",
      "title": {
        "en": "Rooftops beyond: keep a reference while widening the frame",
        "zh": "雨外屋顶：扩大画框，也留一处参照"
      },
      "paragraphs": [
        {
          "en": "The Rooftops-Beyond Page follows an outer skyline, a distant accent or a wider crop. An original example is drawing an invented row of roofs with a small corner of a window still visible. The nearby reference and far outline can support one another; the result is not a hierarchy in which a wide view is more open-minded.",
          "zh": "雨外屋顶页跟随外部轮廓、远处色点或较宽裁切。一个原创例子是画一排虚构屋顶，同时留一点窗角。身边参照与远处线条可以互相支持；结果不建立广景等于更开放的等级。"
        },
        {
          "en": "The full guide keeps the tradeoff that removing all nearby context may make a scene less particular. Its optional second page changes only the crop, allowing a small comparison rather than demanding an improved drawing. No real window, private interior, photograph or trip is required.",
          "zh": "完整指南保留取舍：若删掉全部身边环境，场景可能不够具体。可选的第二页只改裁切，提供一次小对照，不要求画得更好。无需真实窗户、私人室内、照片或出行。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "How the six written frames produce the portraits",
        "zh": "六个文字画框怎样产生画像"
      },
      "paragraphs": [
        {
          "en": "Each question includes near, reflection and distance once, with changing option positions. The selected direction gains one count; each ranges from zero to six and the completed total is six. A count describes choices in this bank, not drawing quality, visual intelligence, attention, emotional depth or a population percentile.",
          "zh": "每题各有近物、叠影、远景一次，选项位置会变化。选中方向加一次，各项零至六次，完成总和六。次数描述本题组里的选择，不是画质、视觉智力、注意力、情感深度或人群百分位。"
        },
        {
          "en": "Every highest direction remains. Three-three-zero displays two complete portraits; two-two-two displays all three. Seven highest sets are possible, without random selection or a tie-break. All original summaries, examples, possible benefits, tradeoffs and optional experiments remain available. No psychometric reliability, validity or norming is established for these recreational portraits.",
          "zh": "每个最高方向均保留。三、三、零显示两篇完整画像，二、二、二显示三篇。七种最高集合均可出现，不随机挑选，也不破同分。全部原概述、例子、可能用处、取舍与可选尝试仍可阅读。这些休闲画像尚未建立心理测量信度、效度或常模。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Start with imagination; no camera, artwork or account is needed",
        "zh": "从想象开始，无需相机、作品或账号"
      },
      "paragraphs": [
        {
          "en": "Start opens the first question directly. No name, account, drawing, camera access or personal window view is requested. Answers resolve in the browser. Optional saving keeps this edition’s draft in the current tab for up to twenty-four hours; completion, retake or deletion clears it.",
          "zh": "开始直接打开第一题。不索取姓名、账号、绘图、相机权限或个人窗景。答案在浏览器内解析；可选保存把本版草稿留在当前标签页最长二十四小时，完成、重玩或删除会清除。"
        },
        {
          "en": "Back permits edits and retake clears the current run. Without saving, refreshing can lose progress. All three public guides are free to read, and their links contain no individual answers. Cookie-controlled usage analytics are separate from answer content. Any off-screen drawing suggestion is optional and uses a fictional or familiar, non-private subject.",
          "zh": "上一题允许改选，重玩清空本轮。不保存时刷新可能丢失进度。三篇公开指南均可免费阅读，链接不含个人答案。受Cookie设置控制的使用统计与答案内容分开。线下绘画提示均为可选，可用虚构或熟悉的非私人对象。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Will I draw on the screen or receive a generated picture?",
        "zh": "会在屏幕绘画或获得生成图片吗？"
      },
      "answer": {
        "en": "No. The interaction consists of six written framing choices. The scene illustration is decorative, and results are authored text guides.",
        "zh": "不会。交互是六次文字取景选择；场景插画为装饰，结果是原创文字指南。"
      }
    },
    {
      "question": {
        "en": "Does this measure artistic ability or visual intelligence?",
        "zh": "会测画技或视觉智力吗？"
      },
      "answer": {
        "en": "No. It does not observe a drawing, time a task or compare performance with a reference group.",
        "zh": "不会。它不观察画作、不计时任务，也不与参照人群比较表现。"
      }
    },
    {
      "question": {
        "en": "Can more than one page be highest?",
        "zh": "可以有不止一篇最高画像吗？"
      },
      "answer": {
        "en": "Yes. Every direction sharing the maximum remains, including all three when the counts are two-two-two.",
        "zh": "可以。与最高次数相同的方向均保留，包括二、二、二时的三篇。"
      }
    },
    {
      "question": {
        "en": "Must I look through an actual window?",
        "zh": "必须看真实窗外吗？"
      },
      "answer": {
        "en": "No. All scenes are imagined and fully described. No photograph or observation of somebody else’s private space is needed.",
        "zh": "不用。场景均为想象且有完整文字，不需要照片或观察他人私人空间。"
      }
    },
    {
      "question": {
        "en": "Is one layer a better composition than the others?",
        "zh": "一种层次比其他构图更好吗？"
      },
      "answer": {
        "en": "No. Near objects, reflections and distance have different possible uses and tradeoffs; the choices do not have an answer key.",
        "zh": "不是。近物、叠影和远景各有可用之处与取舍，选项不设正确键。"
      }
    },
    {
      "question": {
        "en": "Can I read the other full guides without replaying?",
        "zh": "不重玩也能读其他完整指南吗？"
      },
      "answer": {
        "en": "Yes. All three public guides are available directly, regardless of the counts in a particular run.",
        "zh": "可以。三篇公开指南均可直接阅读，不取决于某次的次数。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.nationalgallery.org.uk/paintings/glossary/foreground",
      "label": {
        "en": "National Gallery: foreground and depicted distance (English; art terminology)",
        "zh": "英国国家美术馆：前景与画面远近（英语；美术术语）"
      }
    },
    {
      "url": "https://www.louvrelens.fr/mon-louvre-lens/peintresses-au-sein-de-lexposition-paysage-fenetre-sur-la-nature/",
      "label": {
        "en": "Louvre-Lens: landscape framing and reflected scenes (French; art discussion)",
        "zh": "卢浮宫朗斯分馆：风景框景与反射画面（法语；艺术讨论）"
      }
    }
  ]
},
  "quest-reward": {
  "label": {
    "en": "Original fantasy choices · Three ways to close a tiny quest",
    "zh": "原创奇幻选择 · 小冒险的三种收尾"
  },
  "instructions": {
    "en": "Imagine the village bell is safely home and the quest is complete. Choose the reward you would prefer in each of six written scenes. All three appeals are legitimate; there is no correct answer, real prize or payment. Complete all six to read the counts and every highest portrait.",
    "zh": "想象村庄的铃已经平安找回，任务已经完成。在六个文字情境里选择较想要的奖励。三种吸引点都成立，没有正确答案、真实奖品或支付。完成六题，查看次数与所有最高画像。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "After the quest: what makes this ending feel complete?",
        "zh": "冒险之后：什么让这次结尾感到完整？"
      },
      "paragraphs": [
        {
          "en": "The bell that reminds teapots to sing has returned to its village. The six situations ask about an offered reward, remembering the adventure, an extra gift, a short ceremony, a reward’s appeal and leaving the village. The adventure itself is already complete: you do not need to fight, solve a puzzle or earn a passing score.",
          "zh": "提醒茶壶唱歌的铃已经回到村庄。六个情境依次问奖励、记住冒险、额外礼物、简短仪式、奖励吸引点，以及离村时想带什么。冒险本身已经完成，无需战斗、解谜或达到通过分数。"
        },
        {
          "en": "A new possibility, time with companions and a concrete reminder can all belong to the same ending. Single choices highlight what attracts you first in this particular story. They do not divide people into ambitious, sociable or materialistic types, or establish what somebody deserves.",
          "zh": "新的可能、与同伴共度的时间、具体纪念，都可以属于同一个结尾。单选突出这段故事里首先吸引你的部分，不把人分成有野心、爱社交或物质型，也不判定谁值得得到什么。"
        }
      ]
    },
    {
      "id": "map",
      "title": {
        "en": "A map for tomorrow: an opening that can wait",
        "zh": "明日地图：可以等待的新开端"
      },
      "paragraphs": [
        {
          "en": "The map portrait gathers choices about a new route, an unexplained landmark or a question worth returning to. An original example is finishing a handmade bookmark, appreciating that it is finished and writing down one optional pattern to try later. The next idea is an invitation, not unfinished homework.",
          "zh": "地图画像聚合新路线、尚未解释的地标，以及以后想回来的问题。一个原创例子是做完手工书签，先欣赏已经完成的部分，再记下以后可以试的一种花纹。下个点子是一份邀请，不是没做完的作业。"
        },
        {
          "en": "A Short Hike’s creator describes marked paths, optional exploration, other hikers and hidden treasures.[1] That provides a related example of an exploration game, not evidence for our reward categories. This page has no navigable mountain, collectible inventory or additional quest unlocked by a map count.",
          "zh": "A Short Hike创作者介绍了标记路线、自由探索、其他登山者和隐藏宝物。[1]它是相关探索游戏的例子，不是本站奖励分类的证据。本页没有可行走的山地、收藏背包，也不会因地图次数而解锁新任务。"
        }
      ]
    },
    {
      "id": "feast",
      "title": {
        "en": "A sunset feast: acknowledge the people without requiring a gathering",
        "zh": "落日宴席：承认共同经历，不强制再聚一次"
      },
      "paragraphs": [
        {
          "en": "The feast portrait notices the companions and shared moments around a completed activity. In an original everyday comparison, thank someone for a particular contribution and offer a brief shared pause. They may prefer to leave or celebrate separately. Choosing this portrait does not establish extraversion or require hosting a party.",
          "zh": "宴席画像关注完成活动时的同伴与共同片刻。一个原创日常对照是具体感谢某人的贡献，邀请短暂停留；对方也可以想离开或各自庆祝。选到这篇画像不证明外向，也不要求办聚会。"
        },
        {
          "en": "The French publisher description of Lil Gator Game discusses exploration, characters, small quests and objects used in a playful adventure.[2] It supports comparing how a related game presents activities and companions. Its friendship or item mechanics are not used here, and a high feast count does not earn another person’s affection.",
          "zh": "Lil Gator Game发行方法语介绍讨论探索、角色、小任务，以及用于玩耍冒险的物品。[2]它支持对照相关游戏怎样呈现活动与同伴。本站不采用它的交友或物品机制，宴席次数高也不能换取另一个人的喜欢。"
        }
      ]
    },
    {
      "id": "token",
      "title": {
        "en": "A little bell token: one reminder, not a trophy ranking",
        "zh": "小铃信物：一份提醒，而非奖杯排名"
      },
      "paragraphs": [
        {
          "en": "The token portrait gathers choices about a small object tied to a particular scene. An original example is keeping a note already received after a shared craft activity and writing down the one detail it recalls. No purchase, rare collectible or impressive display is needed for this imagined appeal.",
          "zh": "信物画像聚合与具体场景相连的小物选择。一个原创例子是留着共同手作后已经收到的便条，写下它让人想起的一个细节。这种想象吸引点无需购买、稀有收藏或显眼展示。"
        },
        {
          "en": "The original portrait also retains the cost of keeping reminders: one object cannot preserve every version of a day, and a growing collection can obscure what matters. This is a narrative tradeoff, not an assessment of memory, attachment, wealth or collecting behaviour. Read the full guide before deciding whether its optional experiment is useful.",
          "zh": "原画像也保留纪念的取舍：一件物品不能保存一天的全部版本，收藏增多还可能遮住想记的部分。这是叙事取舍，不评记忆、依恋、财富或收藏行为。可以读完完整指南，再决定其中可选尝试是否有用。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices, three counts and seven possible highest sets",
        "zh": "六次选择、三项次数与七种最高集合"
      },
      "paragraphs": [
        {
          "en": "Every question offers map, feast and token once, while their option positions vary. Each selected direction receives one count. Each count ranges from zero to six; the completed total is six. These are relative choices within this authored bank, not reward values, percentiles or percentages of a stable personality.",
          "zh": "每题各有地图、宴席和信物一次，选项位置会变化。选中方向加一次，各项零至六次，完成总和六。这是原创题组内的相对选择，不是奖励价值、人群百分位或稳定人格的百分比。"
        },
        {
          "en": "All directions sharing the maximum remain: three-three-zero shows two full portraits and two-two-two shows all three. Seven highest sets are reachable, without randomness or a tie-break. Each guide keeps its complete summary, example, possible benefit, tradeoff and optional experiment. The portraits have not established psychometric reliability, validity or population norms.",
          "zh": "同为最高的方向全部保留：三、三、零显示两篇完整画像，二、二、二显示三篇。七种最高集合均可出现，不随机选取，也不破同分。每篇保留完整概述、例子、可能用处、取舍与可选尝试。这些画像尚未建立心理测量信度、效度或人群常模。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Begin with a fictional choice; keep the real details private",
        "zh": "从虚构选择开始，无需个人经历资料"
      },
      "paragraphs": [
        {
          "en": "Start opens the first question directly. No name, contact details, purchase or account is required. The reward is fictional and cannot be redeemed. Answers resolve in the browser. Optional saving retains this edition’s draft in the current tab for up to twenty-four hours; completion, retake or deletion clears it.",
          "zh": "开始直接打开第一题。无需姓名、联系方式、购买或账号。奖励属于虚构，不能兑换。答案在浏览器内解析；可选保存把本版草稿留在当前标签页最长二十四小时，完成、重玩或删除会清除。"
        },
        {
          "en": "Back permits edits and retake clears the current run. Without saving, a refresh can lose progress. All three public guides remain freely readable, and their links contain no personal answers. Cookie-controlled usage analytics are separate from answer content. You can enjoy an ending without adopting its portrait as a description of yourself.",
          "zh": "上一题允许改选，重玩清空本轮。不保存时刷新可能丢失进度。三篇公开指南均可免费阅读，链接不含个人答案。受Cookie设置控制的使用统计与答案内容分开。喜欢一个结尾，也无需把画像当作自己的定义。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Is there a real reward or prize draw?",
        "zh": "有真实奖励或抽奖吗？"
      },
      "answer": {
        "en": "No. The map, feast and token are fictional ways of closing a story. There is no payment, redemption, prize draw or shipping.",
        "zh": "没有。地图、宴席和信物是故事收尾的虚构方式，不涉及支付、兑换、抽奖或寄送。"
      }
    },
    {
      "question": {
        "en": "Do choices open different quest routes?",
        "zh": "选择会打开不同任务路线吗？"
      },
      "answer": {
        "en": "No. This is a fixed six-question tally game, not a branching adventure. Every question contributes one count to one of three directions.",
        "zh": "不会。这是固定六题的计数游戏，不是分支冒险；每题给三个方向之一加一次。"
      }
    },
    {
      "question": {
        "en": "Does the map mean I am more ambitious?",
        "zh": "地图表示我更有野心吗？"
      },
      "answer": {
        "en": "No. It records a preference for a further possibility in this story, without measuring ambition, achievement or capability.",
        "zh": "不表示。它记录这段故事里对后续可能的偏好，不衡量野心、成就或能力。"
      }
    },
    {
      "question": {
        "en": "Can I receive two or three complete portraits?",
        "zh": "能得到两篇或三篇完整画像吗？"
      },
      "answer": {
        "en": "Yes. Every highest direction is retained. Three-three-zero gives two, and two-two-two gives three; no random tie-break is used.",
        "zh": "可以。所有最高方向均保留；三、三、零显示两篇，二、二、二显示三篇，不随机破同分。"
      }
    },
    {
      "question": {
        "en": "Does a feast require me to organise another event?",
        "zh": "宴席要求我再组织一次活动吗？"
      },
      "answer": {
        "en": "No. The original guide includes a specific acknowledgment and comfortable opting out as alternatives to a gathering.",
        "zh": "不要求。原指南也提供具体感谢和自在不参加的空间，无需一定再聚。"
      }
    },
    {
      "question": {
        "en": "Must I buy or upload a keepsake?",
        "zh": "必须购买或上传纪念物吗？"
      },
      "answer": {
        "en": "No. All prompts are supplied, no upload is requested and the optional token experiment can use an existing reminder.",
        "zh": "不用。题目已提供，不要求上传；信物的可选尝试可以使用已有纪念。"
      }
    }
  ],
  "references": [
    {
      "url": "https://ashorthike.com/",
      "label": {
        "en": "A Short Hike: creator’s exploration-game overview (English; related game)",
        "zh": "A Short Hike：创作者的探索游戏介绍（英语；相关游戏）"
      }
    },
    {
      "url": "https://store.steampowered.com/app/1586800/Lil_Gator_Game/?l=french",
      "label": {
        "en": "Lil Gator Game: publisher’s adventure overview (French; related game)",
        "zh": "Lil Gator Game：发行方的冒险介绍（法语；相关游戏）"
      }
    }
  ]
},
  "quiet-company": {
  "label": {
    "en": "Original agreed quiet time · Separate pages, one view or a small task",
    "zh": "原创自愿安静时段 · 各自纸页、同一景象或小任务"
  },
  "instructions": {
    "en": "Imagine both people have already chosen a quiet interval together. Across six scenes, select the arrangement you would prefer today. You do not need a partner to answer and no one else is assessed. Complete all six for three counts and every highest-count scene in full.",
    "zh": "想象双方已经选择一起安静待一段时间。六个场景里，选今天较喜欢的安排。无需搭档实际参加，也不评估另一个人；完成六题，查看三项次数与所有最高画面的完整说明。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "Quiet company begins with an arrangement both people want",
        "zh": "安静作伴，先从双方都愿意的安排开始"
      },
      "paragraphs": [
        {
          "en": "The scenes cover choosing a half hour, making it feel shared, one person finishing first, a short remark, the final ten minutes and a picture of the interval. They compare three forms of agreed time. They do not ask whether silence is superior to conversation or whether another person secretly wants contact.",
          "zh": "场景涉及选定半小时、怎样有共同感、一方先完成、一句短话、最后十分钟，以及留下这段时间的画面。它们比较已商量好时段的三种形式，不问安静是否优于聊天，也不猜另一个人心里是否想接触。"
        },
        {
          "en": "The premise matters more than the portrait: both people can say what they want, ask for attention or end the arrangement. Quiet company cannot be inferred from somebody saying nothing. The fictional response you select is not a reading of an actual friend, partner or family member.",
          "zh": "前提比画像更重要：双方都能表达想要什么、请求注意或结束安排。不能因为一个人没有说话，就推定愿意安静作伴。你选的虚构回应，不是对真实朋友、伴侣或家人的解读。"
        }
      ]
    },
    {
      "id": "pages",
      "title": {
        "en": "Two open pages: different interests can share one interval",
        "zh": "两页都打开：不同兴趣，也可共享一段时间"
      },
      "paragraphs": [
        {
          "en": "The Two-Open-Pages Scene keeps separate books or projects nearby. An original example is one person reading and another drawing, with a brief exchange only when wanted. Neither person has to finish at the other’s pace, and an invitation to look at a detail need not become a demand for a review.",
          "zh": "两页都打开的画面，让不同书本或作品靠近。一个原创例子是一人读书、一人画画，需要时才简短交流。双方无需同速完成，请对方看一个细节，也不必变成要求评价作品。"
        },
        {
          "en": "Silent Book Club’s English description allows people to bring their own reading and choose whether to socialize afterward.[1] Its Paris organiser’s French page also separates a quiet reading interval from optional discussion.[2] These are related activity formats, not evidence that a quiet session produces a particular level of closeness. This page does not book a session or affiliate you with a club.",
          "zh": "Silent Book Club英语介绍允许各带读物，并自行决定之后是否交流。[1]巴黎组织者的法语页面也把安静阅读与可选讨论分开。[2]这些是相关活动形式，不证明一次安静时段会产生特定亲密程度。本页不预订活动，也不让你加入该俱乐部。"
        }
      ]
    },
    {
      "id": "view",
      "title": {
        "en": "A shared window leaves room for different observations",
        "zh": "一起望窗，仍可看见不同细节"
      },
      "paragraphs": [
        {
          "en": "The Shared-Window Scene has a common point of attention rather than a required conversation. In an original imagined garden picture, one person may notice light and another a shape, with neither needing to explain the whole image. Matching observations are not a condition of having chosen the time together.",
          "zh": "一起望窗的画面，有共同注意点，不强求对话。一个原创花园画面想象里，一人可注意光，另一人注意形状，双方都无需解释整幅图。看见相同细节，不是已经选择共同时间的条件。"
        },
        {
          "en": "The original tradeoff is that a view can become uninteresting to one person first. A chance to change, leave or return to separate activities keeps the proposal open. The choices do not measure attention span, mindfulness, attachment security or either person’s feelings; a shared view does not certify an emotional bond.",
          "zh": "原取舍是，一方可能先觉得同一景象无趣。留出换景、离开或回到各自活动的机会，让提议保持可调整。选项不测注意持续、正念、依恋安全或任何一方感受；共同景象不认证情感纽带。"
        }
      ]
    },
    {
      "id": "task",
      "title": {
        "en": "One little shared piece can have a clear finish",
        "zh": "一小块共做，可以有清楚结尾"
      },
      "paragraphs": [
        {
          "en": "The Little-Shared-Piece Scene adds one manageable action, such as arranging a few paper shapes. An original example is agreeing on a small collage section and using brief cues to place it. You can decide that this piece is enough without turning the rest of the afternoon into a joint assignment.",
          "zh": "一小块共做的画面，增加一项可处理的行动，例如摆几片纸形。一个原创例子是约好小拼贴的一部分，用简短提示摆放。可以认定这一小块已够，无需把余下下午变成共同作业。"
        },
        {
          "en": "The task is optional, not a productivity target or a test of cooperation. The original guide leaves permission to stop and a bounded finish. If one person wants to keep making something and the other does not, their actual preferences guide the next arrangement; a task count supplies no answer on their behalf.",
          "zh": "任务是可选内容，不是效率目标或合作测验。原指南保留可以停下与有边界的完成。如果一方想继续，另一方不想，应以实际偏好商量下一安排；任务次数不能替任何一方回答。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices show three relative scene counts",
        "zh": "六次选择，显示三种画面的相对次数"
      },
      "paragraphs": [
        {
          "en": "Each scene offers pages, view and task once, with their positions changing. A selected option adds one to its direction. Each count is zero to six and the completed sum is six. Lower counts mean less often selected in these scenarios, not weaker connection or a lack of social ability.",
          "zh": "每题各有纸页、景象、任务一次，位置会变化。所选项给对应方向加一次，各项零至六次，完成总和六。低次数只表示本题情境里较少选择，不是联结较弱或缺乏社交能力。"
        },
        {
          "en": "All directions sharing the maximum are shown completely: three-three-zero gives two scenes and two-two-two gives three. There is no forced winner. The portraits are authored recreational possibilities without established psychometric reliability, trait validity or norms; they do not identify introversion, avoidance or a relationship type.",
          "zh": "最高次数相同的方向均完整显示：三、三、零给两幅画面，二、二、二给三幅。不强行挑一个获胜。这些是尚未建立心理测量信度、特质效度或常模的原创休闲可能性，不鉴定内向、回避或关系类型。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Read every complete scene without involving another person",
        "zh": "无需另一人参加，也能读完全部画面"
      },
      "paragraphs": [
        {
          "en": "Each original guide keeps its summary, example, benefit, tradeoff and optional experiment. All three are public and free. Start opens the first scene without another agreement screen; no partner name, relationship history, message transcript, camera or microphone is requested. No real reading or shared task is observed.",
          "zh": "每篇原指南保留概述、例子、用处、取舍与可选尝试，三篇均公开免费。开始直接进入第一场景，不增加同意屏；不索取搭档姓名、关系经历、消息记录、相机或麦克风，也不观察真实阅读或共做。"
        },
        {
          "en": "Choices resolve in the browser. Optional saving keeps this edition’s draft in the current tab for up to twenty-four hours, clearing on completion, retake or deletion. Without saving, refresh can lose progress. Back permits editing; retake clears answers. Guide links contain no personal choices, and cookie-controlled site usage analytics are separate from answer content.",
          "zh": "选择在浏览器内解析。可选保存把本版草稿留在当前标签页最长二十四小时，完成、重玩或删除会清除；不保存时刷新可能丢失进度。上一题可改选，重玩清空答案。指南链接不含个人选择，受Cookie设置控制的网站使用统计与答案内容分开。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Is quiet company the same as ignoring someone?",
        "zh": "安静作伴就是不理对方吗？"
      },
      "answer": {
        "en": "The scenes assume both people have chosen it and can ask for attention or stop. A result cannot establish what a real person wants from silence.",
        "zh": "场景前提是双方选择且能请求注意或停止。结果不能根据沉默判断真实的人想要什么。"
      }
    },
    {
      "question": {
        "en": "Does this identify an attachment or personality type?",
        "zh": "这会鉴定依恋或人格类型吗？"
      },
      "answer": {
        "en": "No. It counts responses to six fictional arrangements, not personality, social energy, avoidance or relationship quality.",
        "zh": "不会。它统计六个虚构安排中的回应，不测人格、社交能量、回避或关系质量。"
      }
    },
    {
      "question": {
        "en": "Do I need somebody else to take the quiz?",
        "zh": "需要另一个人一起答吗？"
      },
      "answer": {
        "en": "No. You answer the supplied scenarios alone. No partner answers, private messages or shared-session recording are collected.",
        "zh": "不需要。自己回答已提供场景即可，不收集搭档答案、私信或共同活动录制。"
      }
    },
    {
      "question": {
        "en": "Why can several scenes appear?",
        "zh": "为什么会出现多幅画面？"
      },
      "answer": {
        "en": "All directions tied at the highest count remain. Two-two-two shows all three in full instead of choosing one at random.",
        "zh": "同为最高次数的方向全部保留。二、二、二完整显示三篇，不随机挑一篇。"
      }
    },
    {
      "question": {
        "en": "Must the shared task be finished?",
        "zh": "共同任务一定要做完吗？"
      },
      "answer": {
        "en": "No. The original guide proposes a small finish and permission to stop. The actual people decide whether to continue; a quiz count creates no obligation.",
        "zh": "不必。原指南建议小结尾并允许停下，实际参与者决定是否继续；次数不产生义务。"
      }
    },
    {
      "question": {
        "en": "Will this connect me to a reading club?",
        "zh": "这会帮我加入静读俱乐部吗？"
      },
      "answer": {
        "en": "No. The club links provide context for activity formats. This page creates no membership, booking, meeting or contact with another person.",
        "zh": "不会。俱乐部链接只提供活动形式背景，本页不创建会员、预约、会议或与他人的联系。"
      }
    }
  ],
  "references": [
    {
      "url": "https://silentbook.club/pages/about-us",
      "label": {
        "en": "Silent Book Club: own books, quiet reading and optional social time (English)",
        "zh": "Silent Book Club：自选读物、安静阅读与自愿交流（英语）"
      }
    },
    {
      "url": "https://www.meetup.com/fr-fr/le-club-de-lecture-silencieuse-paris/",
      "label": {
        "en": "Club de Lecture Silencieuse Paris: organiser’s activity format (French)",
        "zh": "巴黎静读俱乐部：组织者的活动形式说明（法语）"
      }
    }
  ]
},
  "potluck-contribution": {
  "label": {
    "en": "Original shared-meal scenarios · Fit, handover and clear information",
    "zh": "原创共同聚餐情境 · 配合、交接与清楚信息"
  },
  "instructions": {
    "en": "Imagine bringing one contribution to a friendly shared meal whose other plans already exist. Across six written situations, choose what you would attend to first. No cooking, menu submission or dietary details are required. Complete all six for three counts and every highest portrait.",
    "zh": "想象给已有其他安排的友好聚餐带一份贡献。六个文字情境里，选择会先关注的事情。无需烹饪、提交菜单或饮食资料；完成六题，查看三项次数与所有最高画像。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "One contribution joins a table that already has a plan",
        "zh": "一份贡献，接入已有安排的餐桌"
      },
      "paragraphs": [
        {
          "en": "The six situations involve a host’s existing list, two similar dishes, preparing to arrive, a changed table, an unknown detail and a satisfying handover. The choices concern coordination around a shared meal. They do not ask you to cook, taste, price or inspect food, or compare who contributed the most.",
          "zh": "六个情境涉及主人已有清单、两道相近菜品、准备抵达、桌面变化、一项未知细节，以及顺利接收的标准。选择讨论共同聚餐周围的协调，不要求制作、品尝、定价或检查食物，也不比较谁贡献最多。"
        },
        {
          "en": "Menu fit, practical handover and clear information can work together. Choosing one first does not make the others unnecessary. A small agreed contribution can be enough; a result is not an instruction to spend more, prepare a homemade dish or take responsibility for everybody’s evening.",
          "zh": "菜单配合、实际交接和清楚信息可以一起使用。先选一种，不表示其他方面没有必要。商量好的一小份可以已经足够；结果不要求多花钱、必须亲手做菜，或对所有人的整晚负责。"
        }
      ]
    },
    {
      "id": "menu",
      "title": {
        "en": "Menu connection: ask what would fit and what you can offer",
        "zh": "菜单接续：问什么合适，也说自己能提供什么"
      },
      "paragraphs": [
        {
          "en": "The Menu-Connection Contributor starts with the plan already shared. An original example is asking whether a contrasting contribution would help when two similar items are listed, while naming something you would enjoy bringing. Similar dishes may still be wanted; avoiding duplication is a coordination question, not a rule that every item must be unique.",
          "zh": "菜单接续贡献者从已经共享的计划开始。一个原创例子是看到两份相近内容时，先问不同搭配是否有用，也说出自己愿意带什么。相近菜品仍可能被需要；是否避免重复是协调问题，不是每样都必须独一无二的规则。"
        },
        {
          "en": "SignUp.com’s English instructions separate food, supplies and setup or cleanup tasks, with quantities and timing; Kinam’s French overview describes a host’s list and guests selecting contributions.[1][2] These are examples of real coordination services. This story does not create such a list, reserve a dish, invite guests or send reminders.",
          "zh": "SignUp.com英语说明区分食物、用品、布置或收拾任务，并填写数量与时间；Kinam法语介绍由主人列清单、来客选择贡献。[1][2]这些是真实协调服务的例子。本故事不创建清单、不预留菜品、不邀请来客，也不发送提醒。"
        }
      ]
    },
    {
      "id": "handover",
      "title": {
        "en": "Easy handover: make the next small action understandable",
        "zh": "顺手交接：让下一件小事容易明白"
      },
      "paragraphs": [
        {
          "en": "The Easy-Handover Contributor thinks about receiving the item, not just transporting it. In an original imagined arrival, ask which offered space to use and whether the container returns with you. Those two answers may remove more uncertainty than preparing a complicated plan for every possible arrangement.",
          "zh": "顺手交接贡献者关心别人怎样接收，而不只是怎样带到。一个原创抵达想象里，可以问使用哪处已提供的空间，以及容器是否随自己带回。两个答案可能比为所有情况准备复杂方案更能减少眼前的不确定。"
        },
        {
          "en": "The original guide does not appoint you manager of the gathering. A bounded handover can end when the agreed next step is clear. It also does not certify food transport, storage, equipment cleanliness or suitability: no real item or conditions are examined by the choices.",
          "zh": "原指南不会任命你为整场聚会负责人。约好的下一步清楚后，一次有边界的交接就可以结束。它也不认证食物运输、储存、工具清洁或适宜性，因为选项没有检查真实物品与条件。"
        }
      ]
    },
    {
      "id": "note",
      "title": {
        "en": "A clear note includes what you cannot confirm",
        "zh": "清楚便条，也包括不能确认的部分"
      },
      "paragraphs": [
        {
          "en": "The Clear-Note Contributor makes useful information visible beside an offer. For an original non-food example, label the paper materials actually brought to a shared hobby table, distinguish what belongs to you and say if you do not know a detail. A short note supports the recipient’s choice without deciding for them.",
          "zh": "清楚便条贡献者把有用信息放在提供物旁。一个原创非食物例子是，在共同爱好桌上标清实际带来的纸材料、区分哪些属于自己，并说明不知道的细节。简短便条支持接收者选择，无需代为决定。"
        },
        {
          "en": "Accuracy is a shared premise for all three portraits. A lower note count is not dishonesty, and a high note count does not verify ingredients, allergens, cross-contact or dietary requirements. The page collects none of that information; the label in the story is not a food-safety or nutrition assessment.",
          "zh": "准确是三个画像的共同前提。便条次数较低不等于不诚实，次数高也不验证食材、过敏原、接触混杂或饮食需求。页面不收集这些信息；故事中的标签不是食品安全或营养评估。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices keep every highest contribution portrait",
        "zh": "六次选择，保留每个最高贡献画像"
      },
      "paragraphs": [
        {
          "en": "Each question offers menu, handover and note once, with option positions changing. The selected direction receives one count. Each count is zero to six and a completed sum is six. Counts are relative choices in this bank, not generosity, reliability, hospitality ability or percentages of your personality.",
          "zh": "每题各有菜单、交接、便条一次，选项位置会变化。选中方向加一次，各项零至六次，完成总和六。次数是本题组里的相对选择，不是慷慨、可靠、待客能力或人格百分比。"
        },
        {
          "en": "Three-three-zero keeps two complete portraits; two-two-two keeps all three. All seven highest sets can occur, without random selection or a tie-break. Each original guide retains its summary, example, benefit, tradeoff and optional experiment. The authored portraits have no established psychometric reliability, trait validity or population norms.",
          "zh": "三、三、零保留两篇完整画像，二、二、二保留三篇。七种最高集合均可出现，不随机挑选，也不破同分。每篇原指南保留概述、例子、用处、取舍与可选尝试。这些原创画像尚未建立心理测量信度、特质效度或人群常模。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Start with a fictional arrangement, without a real guest list",
        "zh": "从虚构安排开始，无需真实来客名单"
      },
      "paragraphs": [
        {
          "en": "Start opens the first question directly. No real name, guest contact, recipe, purchase, photograph or dietary history is needed. Choices resolve in the browser. Optional saving retains this edition’s draft in the current tab for up to twenty-four hours; completion, retake or deletion clears it.",
          "zh": "开始直接打开第一题。无需真实姓名、来客联系方式、菜谱、购买、照片或饮食史。选择在浏览器内解析。可选保存把本版草稿留在当前标签页最长二十四小时，完成、重玩或删除会清除。"
        },
        {
          "en": "Without saving, refreshing can lose progress. Back allows edits and retake clears the current run. All three public guides are readable without payment or sharing, and their links contain no individual answers. Cookie-controlled site usage analytics are separate from answer content; no real meal is arranged through this story.",
          "zh": "不保存时，刷新可能丢失进度。上一题可改选，重玩清空本轮。三篇公开指南免支付、免分享阅读，链接不含个人答案。受Cookie设置控制的使用统计与答案内容分开；本故事不安排真实聚餐。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Will this recommend a dish or plan a menu?",
        "zh": "会推荐菜品或编排菜单吗？"
      },
      "answer": {
        "en": "No. It compares six written coordination choices and displays complete contribution portraits, without generating a recipe or a real event plan.",
        "zh": "不会。这里只比较六个文字协调选择、展示完整贡献画像，不生成菜谱或真实活动计划。"
      }
    },
    {
      "question": {
        "en": "Does a note guarantee that food suits a guest?",
        "zh": "一张便条能保证食物适合来客吗？"
      },
      "answer": {
        "en": "No. Neither a note count nor any portrait verifies food, ingredients, allergens or dietary requirements. The story does not inspect real conditions.",
        "zh": "不能。便条次数或任何画像都不验证食物、食材、过敏原或饮食需求；故事不检查真实条件。"
      }
    },
    {
      "question": {
        "en": "Is this a generosity or cooking test?",
        "zh": "这是慷慨或厨艺测试吗？"
      },
      "answer": {
        "en": "No. It records relative priorities around a fictional shared contribution, without observing preparation, spending or how much anyone gives.",
        "zh": "不是。它记录虚构共同贡献里的相对侧重，不观察制作、花费或贡献多少。"
      }
    },
    {
      "question": {
        "en": "Why can two or three portraits appear?",
        "zh": "为什么有两篇或三篇画像？"
      },
      "answer": {
        "en": "Every direction sharing the maximum count remains. Three-three-zero shows two and two-two-two shows all three.",
        "zh": "同为最高次数的方向均保留。三、三、零显示两篇，二、二、二显示三篇。"
      }
    },
    {
      "question": {
        "en": "Does handover mean I must run the whole gathering?",
        "zh": "交接画像表示必须包办聚会吗？"
      },
      "answer": {
        "en": "No. The original guide concerns a manageable next step for your contribution, with a clear stopping point rather than unlimited responsibility.",
        "zh": "不是。原指南关注自己贡献可处理的下一步与清楚停止点，不要求无限负责。"
      }
    },
    {
      "question": {
        "en": "Can I participate without entering real food information?",
        "zh": "不输入真实食物资料也能玩吗？"
      },
      "answer": {
        "en": "Yes. All fictional prompts and options are supplied. No guest list, recipe, ingredient inventory or medical information is requested.",
        "zh": "可以。虚构题目与选项已经提供，不索取来客名单、菜谱、食材清单或医疗资料。"
      }
    }
  ],
  "references": [
    {
      "url": "https://support.signup.com/help/how-to-set-up-a-potluck-or-party",
      "label": {
        "en": "SignUp.com: specific contribution slots and practical coordination (English)",
        "zh": "SignUp.com：具体贡献位置与实际协调（英语）"
      }
    },
    {
      "url": "https://kinam.app/",
      "label": {
        "en": "Kinam: host lists and guest contributions (French; related service)",
        "zh": "Kinam：主人清单与来客贡献（法语；相关服务）"
      }
    }
  ]
},
  "portal-choice": {
  "label": {
    "en": "Original branching adventure · Three destinations, no personality score",
    "zh": "原创分支冒险 · 三个目的地，不计算人格分"
  },
  "instructions": {
    "en": "Open one of two impossible doorways and follow the scenes your choices reveal. Each route takes three or four decisions and reaches one complete ending. Choose the scene you want to continue, rather than an ideal answer. Back and retake let you explore another route.",
    "zh": "打开两道不可能的门之一，沿选择出现的场景前进。每条路线三至四次决定，抵达一篇完整结局。选择想继续的情节，无需寻找理想答案；上一题与重玩可探索另一条路。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "A portal on the table, with more than one way to finish",
        "zh": "桌上的传送门，不只有一种收尾"
      },
      "paragraphs": [
        {
          "en": "A steam doorway leads to lanterns, while a folded paper frame leads to a map. Later scenes offer a harbor, a gallery, a postcard desk or a station connecting the destinations. These are original written settings: you do not enter a simulated world, move an avatar or solve a hidden navigation puzzle.",
          "zh": "蒸汽门通向灯笼，折纸框通向地图。后续场景提供港口、画廊、明信片书桌，或连接目的地的车站。它们是原创文字场景，不进入模拟世界、不操控角色移动，也不解隐藏寻路谜题。"
        },
        {
          "en": "The adventure asks which scene you want to follow and where this small journey can end. A shorter route is complete in its own right. Returning, resting or leaving a creative edge open is part of the story’s subject, not evidence of courage, avoidance or any psychological condition.",
          "zh": "冒险问你想沿哪个场景走，以及这段小旅程可以在哪里结束。较短路线本身也完整。返回、休息或留下创作边缘，是故事讨论的内容，不是勇气、回避或心理状况的证据。"
        }
      ]
    },
    {
      "id": "routes",
      "title": {
        "en": "Choices change the route; they do not add up to a type",
        "zh": "选择改变路线，不累加成一种类型"
      },
      "paragraphs": [
        {
          "en": "The opening has two options. The steam path can reach the harbor or gallery scenes; the paper path can reach the gallery or postcard desk. At those scenes, one option ends the journey after three decisions and another continues to the station, where a fourth decision chooses a destination.",
          "zh": "开场有两个选项。蒸汽路线可以到港口或画廊场景，纸框路线可以到画廊或明信片书桌。在这些场景里，一项选择会在第三次决定后收尾，另一项继续去车站，由第四次决定选择目的地。"
        },
        {
          "en": "There are sixteen complete option sequences: four end after three decisions and twelve after four. Different sequences can share an ending, and choosing a different opening does not permanently exclude all other destinations. Each run returns one authored ending, without a highest-count tie or random selection.",
          "zh": "完整选项序列有十六条：四条在三次决定后结束，十二条在四次决定后结束。不同序列可以共享结局，选不同开场也不永久排除所有其他目的地。每轮返回一篇写好的结局，不产生最高次数并列，也不随机抽取。"
        }
      ]
    },
    {
      "id": "endings",
      "title": {
        "en": "Harbor, gallery and postcard: three narrative destinations",
        "zh": "港口、画廊、明信片：三处叙事目的地"
      },
      "paragraphs": [
        {
          "en": "The Lantern Harbor gives the journey a landing place; its original guide also asks whether a comfortable stop leaves room for later curiosity. The Unfinished Gallery keeps another version possible, while asking which part is ready and which is intentionally open. Neither is a grade for how adventurous or productive you are.",
          "zh": "灯笼港给旅程一个落脚处，原指南也提醒舒服的停靠是否仍给以后好奇留空间。未完成画廊保留另一版本，同时区分哪部分已经可以、哪部分有意开放。两者都不给冒险程度或产出评级。"
        },
        {
          "en": "The Postcard Home carries one chosen detail beyond the portal. The complete guide keeps the distinction between one detail and an entire experience, with sharing optional. It is a fictional ending: the page neither asks for a real address nor sends a postcard, and it does not interpret what “home” must mean for the reader.",
          "zh": "寄回家的明信片，把一个选中细节带出传送门。完整指南区分一个细节与整段经历，并保留分享自愿。它是虚构结局：页面不索取真实地址、不寄明信片，也不解释“家”对读者必须意味着什么。"
        }
      ]
    },
    {
      "id": "fiction",
      "title": {
        "en": "An intentional ending is different from an incomplete answer",
        "zh": "有意结束，区别于没有答完"
      },
      "paragraphs": [
        {
          "en": "The ink authoring tutorial distinguishes linked sections, choices and intentional endings.[1] That is a useful formal comparison for reading branching fiction, not evidence that this page uses ink or inherits its features. Here, only the supplied scene links determine the next scene or ending; unchosen scenes contribute no points.",
          "zh": "ink创作教程区分相连段落、选择与有意设置的结束。[1]这提供阅读分支故事的形式参照，不证明本页采用ink或继承它的功能。这里仅由题本中的场景连接决定下一幕或结局；未经过的场景不贡献分数。"
        },
        {
          "en": "BnF’s French overview describes maps giving shape to imagined territories and literary worlds.[2] The paper doorway uses a map in that fictional sense. Neither a map, a lantern nor a blank frame is a projective-test stimulus here. The story has no established psychometric reliability, trait validity or diagnostic interpretation.",
          "zh": "BnF法语介绍说明地图可以给想象疆域与文学世界以形状。[2]纸门中的地图采用这种虚构含义。这里的地图、灯笼或空画框都不是投射测验刺激物。故事没有已建立的心理测量信度、特质效度或诊断解释。"
        }
      ]
    },
    {
      "id": "reading",
      "title": {
        "en": "Read a whole ending, then decide whether to take another route",
        "zh": "读完整结局，再决定是否探索其他路线"
      },
      "paragraphs": [
        {
          "en": "Every ending retains the original summary, example, benefit, tradeoff and optional experiment. The everyday parallels are authored suggestions for discussion, not findings about your life. For example, deciding when a small outing feels enough is an optional idea, not an instruction to stop a commitment or avoid an important decision.",
          "zh": "每篇结局保留原概述、例子、用处、取舍与可选尝试。日常类比是原创讨论建议，不是对你生活的研究发现。例如，想想一次小外出何时已足够，是可选点子，不是停止承诺或避开重要决定的指令。"
        },
        {
          "en": "All three public guides can be read directly without changing your current route. During play, Back allows an earlier choice to be edited; changing that branch clears later choices from the abandoned route. Retake starts from the two doorways with no selected answers, so the earlier ending need not constrain the next visit.",
          "zh": "三篇公开指南可直接阅读，不改变当前路线。作答时，上一题可回到较早选择；改变分支会清除放弃路线后面的选项。重玩从两道门开始且没有选中答案，前一结局无需约束下一次到访。"
        }
      ]
    },
    {
      "id": "privacy",
      "title": {
        "en": "Begin at the doorway without a second agreement step",
        "zh": "直接从门前开始，不增加二次同意"
      },
      "paragraphs": [
        {
          "en": "Start opens the first scene directly. There is no account, personal story submission, address, photograph or real travel plan to provide. Choices resolve in the browser. Optional saving keeps this edition’s draft in the current tab for up to twenty-four hours, clearing on completion, retake or deletion.",
          "zh": "开始直接打开第一场景。无需账户、个人经历投稿、地址、照片或真实旅行计划。选择在浏览器内解析。可选保存将本版草稿留在当前标签页最长二十四小时，完成、重玩或删除会清除。"
        },
        {
          "en": "Without saving, refreshing can lose progress. Public ending links contain no individual answers. Cookie-controlled website usage analytics are separate from choice content. Complete endings require no payment, social sharing or completing a personality assessment first.",
          "zh": "不保存时，刷新可能丢失进度。公开结局链接不包含个人答案，受Cookie设置控制的网站使用统计与选择内容分开。完整结局无需支付、社交分享或先完成人格测评。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "How many choices are on one route?",
        "zh": "一条路线有几次选择？"
      },
      "answer": {
        "en": "Three or four. There are seven scene nodes in the story bank, but a run follows only the nodes on its chosen route.",
        "zh": "三至四次。故事题本有七个场景节点，一轮只经过选中路线上的节点。"
      }
    },
    {
      "question": {
        "en": "Does the opening determine my personality or lock one ending?",
        "zh": "开场会决定人格或锁住一个结局吗？"
      },
      "answer": {
        "en": "No. The opening chooses the next scene. Later choices may reach the station with all three destinations, and no personality score is calculated.",
        "zh": "不会。开场决定下一场景；后续选择可以到有三个目的地的车站，不计算人格分。"
      }
    },
    {
      "question": {
        "en": "Is finishing in three choices a failure?",
        "zh": "三次选择就结束，是失败吗？"
      },
      "answer": {
        "en": "No. Each early destination is an intentional complete ending. A longer route is another sequence, not a higher achievement.",
        "zh": "不是。每个较早目的地都是有意设置的完整结局。较长路线是另一段序列，不是更高成就。"
      }
    },
    {
      "question": {
        "en": "Can there be tied endings?",
        "zh": "结局会并列吗？"
      },
      "answer": {
        "en": "No. This story follows branch links to one ending. It does not tally answer families or break ties between scores.",
        "zh": "不会。本故事沿分支连接抵达一个结局，不累计选项类别，也不处理分数并列。"
      }
    },
    {
      "question": {
        "en": "Can I change a branch and replay?",
        "zh": "能改变分支或重玩吗？"
      },
      "answer": {
        "en": "Yes. Back permits editing. A changed branch discards later selections on the old route, and retake clears the run before starting again.",
        "zh": "可以。上一题允许改选；分支改变时，旧路线上后续选择会清除，重玩则清空本轮再开始。"
      }
    },
    {
      "question": {
        "en": "Must I share an address to reach the postcard ending?",
        "zh": "明信片结局要提供地址吗？"
      },
      "answer": {
        "en": "No. It is a fictional destination and complete written guide. No address is requested and no message or postcard is sent.",
        "zh": "不需要。这是虚构目的地和完整文字指南，不索取地址，也不发送消息或明信片。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.inklestudios.com/ink/web-tutorial/",
      "label": {
        "en": "inkle: choices, linked sections and intentional endings (English; authoring reference)",
        "zh": "inkle：选择、相连段落与有意结束（英语；创作形式参考）"
      }
    },
    {
      "url": "https://www.bnf.fr/fr/agenda/cartes-imaginaires",
      "label": {
        "en": "BnF: imaginary territories and literary maps (French; cultural context)",
        "zh": "BnF：想象疆域与文学地图（法语；文化背景）"
      }
    }
  ]
},
  "pocket-map": {
  "label": {
    "en": "Original fictional cartography · Landmarks, visits and open spaces",
    "zh": "原创虚构制图 · 地标、到访与开放空白"
  },
  "instructions": {
    "en": "Imagine a small map of an invented place. Choose what you would include, annotate or leave open across six written scenes. You do not draw or upload a map, and no location is requested. Complete all six to read three counts and every highest portrait.",
    "zh": "想象一张虚构地方的小地图。六个文字场景里，选择会保留、注释或留空的内容。无需实际绘图或上传地图，也不索取位置。完成六题后查看三项次数与所有最高画像。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "A small map can tell one particular story",
        "zh": "小地图，可以只讲一个特定故事"
      },
      "paragraphs": [
        {
          "en": "Your decisions concern a first mark, a crowded drawing, an annotation, two routes, another reader’s version and a title. They compare the place’s structure, a character’s visit and space for later invention. You select written options rather than navigate an unknown area or submit a finished drawing.",
          "zh": "六次决定涉及第一笔、太拥挤的图、一条注释、两条路、另一读者的版本与标题。比较地方结构、角色到访和后来创作的空间。你选择的是文字选项，不是在陌生地区找路，也不提交成品图。"
        },
        {
          "en": "The premise is deliberately fictional. A bridge, market or tower can be invented for the scene; it need not correspond to a real address. The result explains what your imaginary map prioritised in these choices, not what you can remember about a city or how accurately you estimate distances.",
          "zh": "前提明确是虚构的。桥、市场或塔可以为情境编造，不必对应真实地址。结果解释本次想象地图较重视什么，不推断你能记住多少城市信息，或估算距离有多准确。"
        }
      ]
    },
    {
      "id": "landmarks",
      "title": {
        "en": "Readable landmarks: show relationships before decoration",
        "zh": "地标可读：先让关系成立，再加装饰"
      },
      "paragraphs": [
        {
          "en": "The Readable-Landmark Map keeps a few reference points coherent. In an original example, an invented tower stands between a paper market and a river bend; two lines show which places connect. A reader can describe that relationship without a complete street network, a scale or a claim about travel time.",
          "zh": "地标可读的小地图保留几处连贯参照。一个原创例子是虚构塔立在纸市场与河湾之间，两条线说明地点怎样相连。读者无需完整街网、比例尺或通行时间，就能描述这个关系。"
        },
        {
          "en": "World Anvil’s English tutorial distinguishes map images, markers, labels and lines that can track character journeys.[1] These are related worldbuilding tools, not features provided here. Our six choices neither generate an interactive map nor verify geography; the original guide’s optional three-landmark sketch can be tried separately on paper.",
          "zh": "World Anvil英语教程区分地图底图、标记、文字标签，以及可表示角色旅程的线。[1]这些属于相关世界构建工具，不是本页提供的功能。六个选择既不生成交互地图，也不验证地理；原指南中可选的三地标草图，可以另外在纸上尝试。"
        }
      ]
    },
    {
      "id": "stops",
      "title": {
        "en": "Personal stops: record a visit without making it universal",
        "zh": "个人停点：记录一次到访，不把它当人人的路线"
      },
      "paragraphs": [
        {
          "en": "The Linger-Here Pocket Map marks what one fictional visitor did. A made-up bench can matter because a character paused there to finish a cloud sketch, even when it is not the setting’s largest landmark. An annotation can state the action plainly instead of calling the place everyone’s best destination.",
          "zh": "在这里多待的小地图，标的是一个虚构访客做了什么。编造的长椅可以因为角色在那里停下来画完云朵而重要，即使它不是场景中最大的地标。注释可以直写动作，不必把地点说成人人的最佳目的地。"
        },
        {
          "en": "A personal route is a narrative selection, not an assessment of autobiographical memory or an invitation to reveal private locations. Another reader may choose different stops while keeping the same imagined layout. Read the original tradeoff as a reminder to name whose visit the map records, rather than rank alternative experiences.",
          "zh": "个人路线是一种叙事选择，不是自传体记忆评估，也不邀请透露私人位置。另一读者可以保留同一虚构布局，选择不同停点。原指南中的取舍提醒的是说清记录了谁的到访，而不是给其他经历排高低。"
        }
      ]
    },
    {
      "id": "gaps",
      "title": {
        "en": "An intentional gap needs something to respond to",
        "zh": "有意留空，需要已有内容让人回应"
      },
      "paragraphs": [
        {
          "en": "The Leave-a-Square-Open Map offers a bounded contribution. In an original example, leave one plot beside a clearly drawn square and invite a next reader to add a shop, bench or a third idea. They may decline, and their addition need not match what the first author secretly hoped for.",
          "zh": "留一个空格的小地图，给出有边界的补充空间。一个原创例子是在画清的广场旁留一块地，请下一读者添小店、长椅或第三种想法。对方可以不参加，补充也不必符合首作者心里的标准答案。"
        },
        {
          "en": "Here the empty square belongs to an invented place. It is different from an unknown fact on a real map or an omitted instruction someone needs. BnF’s French exhibition overview discusses maps that give form to imaginary territories and literary worlds.[2] That cultural context supports treating the map as fiction; it does not validate a score for imagination or suggest that a real route should be left incomplete.",
          "zh": "这里的空格属于虚构地方，区别于真实地图上未知的事实，或别人实际需要却缺失的指引。BnF法语展览介绍讨论地图如何给想象疆域与文学世界以形状。[2]这个文化背景帮助把地图读作虚构，不验证想象力分数，也不建议把真实路线留成缺少指引的状态。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Count the six choices without ranking the three purposes",
        "zh": "统计六次选择，不给三种用途排等级"
      },
      "paragraphs": [
        {
          "en": "Each question offers landmarks, stops and gaps once, with different option positions. The selected direction gains one. Every count is between zero and six and the completed total is six. A low landmarks count is not poor orientation; a low gaps count is not a lack of creativity.",
          "zh": "每题各有地标、停点、空白一次，选项位置会变化。选中方向加一次，各项零至六次，完成总和六。地标次数低不表示方向感差，空白次数低也不表示缺少创造力。"
        },
        {
          "en": "Every direction sharing the maximum appears in full: three-three-zero gives two portraits, and two-two-two gives all three. All seven highest sets are possible, without random selection or forced tie-breaking. These are authored recreational descriptions without established reliability, trait validity or population norms, not percentages of spatial ability or personality.",
          "zh": "最高次数相同的方向全部完整显示：三、三、零给两篇，二、二、二给三篇。七种最高集合均可出现，不随机抽取，也不强行破同分。这些是尚未建立信度、特质效度或人群常模的原创休闲描述，不是空间能力或人格百分比。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Keep the reading complete and the imagined place private",
        "zh": "完整阅读，虚构地点也无需上传"
      },
      "paragraphs": [
        {
          "en": "Each original guide retains its summary, example, benefit, tradeoff and optional experiment. Read all three freely, including any that were not highest. Combining a clear reference point, a chosen stop and one open plot is a possible story exercise, not a new fourth result or evidence that a combination is superior.",
          "zh": "每篇原指南保留概述、例子、用处、取舍与可选尝试。三篇均可自由阅读，包括本次没有最高的画像。把清楚参照、一个停点与一块留空组合，是可选故事练习，不产生第四种结果，也不证明组合更优。"
        },
        {
          "en": "Start opens the first scene directly. There is no GPS request, address field, drawing upload or journey tracking. Answers resolve in the browser. Optional tab saving lasts up to twenty-four hours and clears on completion, retake or deletion; without saving, refresh can lose progress. Public guide links contain no answers, and cookie-controlled usage analytics are separate from answer content.",
          "zh": "开始直接打开第一场景。没有GPS请求、地址输入、绘图上传或行程追踪。答案在浏览器内解析。可选标签页保存最长二十四小时，完成、重玩或删除会清除；不保存时刷新可能丢失进度。公开指南链接不含答案，受Cookie设置控制的使用统计与答案内容分开。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Will I receive a drawn map?",
        "zh": "会得到一张画好的地图吗？"
      },
      "answer": {
        "en": "No. You choose among written scenarios and receive three counts and complete highest-count portraits. Drawing ideas in the guides are optional activities outside the page.",
        "zh": "不会。你在文字情境中选择，得到三项次数与完整最高画像；指南里的绘图点子是页面之外的可选活动。"
      }
    },
    {
      "question": {
        "en": "Does this test my sense of direction?",
        "zh": "这会测试方向感吗？"
      },
      "answer": {
        "en": "No. It does not ask you to find a route, recall real landmarks, estimate distance or use navigation. The place is invented.",
        "zh": "不会。它不要求找路、回忆真实地标、估算距离或使用导航，地点是虚构的。"
      }
    },
    {
      "question": {
        "en": "Are empty spaces signs of greater creativity?",
        "zh": "留空更多表示更有创造力吗？"
      },
      "answer": {
        "en": "No. A gap count records choices from this bank. There is no creativity grade, and a useful fictional invitation may also need clear landmarks.",
        "zh": "不是。空白次数只记录本题组的选择，不给创造力评分；有用的虚构邀请也可能需要清楚地标。"
      }
    },
    {
      "question": {
        "en": "Why can more than one map portrait appear?",
        "zh": "为什么会出现多篇地图画像？"
      },
      "answer": {
        "en": "All directions tied at the highest count remain. Two-two-two displays all three; no letter, option order or random draw decides a winner.",
        "zh": "同为最高次数的方向都会保留。二、二、二显示三篇，不按字母、选项顺序或随机抽签挑一个。"
      }
    },
    {
      "question": {
        "en": "Must I share a real place or location?",
        "zh": "必须分享真实地方或位置吗？"
      },
      "answer": {
        "en": "No. All prompts are supplied and fictional. The page asks for no location permission, street address, personal map or travel history.",
        "zh": "不需要。题目已经提供且为虚构，不索取位置权限、街道地址、个人地图或出行记录。"
      }
    },
    {
      "question": {
        "en": "Can I edit my choices and read every guide?",
        "zh": "能改选并阅读所有指南吗？"
      },
      "answer": {
        "en": "Yes. Back lets you revise an earlier scene, retake clears the current answers, and all three complete public guides are available without an account or payment.",
        "zh": "可以。上一题可返回改选，重玩会清空本轮答案；全部三篇公开指南免账户、免支付阅读。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.worldanvil.com/learn/beginner-tutorials/get-started-maps",
      "label": {
        "en": "World Anvil: map images, markers and lines (English; related creative tool)",
        "zh": "World Anvil：地图底图、标记与线（英语；相关创作工具）"
      }
    },
    {
      "url": "https://www.bnf.fr/fr/agenda/cartes-imaginaires",
      "label": {
        "en": "BnF: imaginary maps and literary worlds (French; exhibition overview)",
        "zh": "BnF：想象地图与文学世界（法语；展览介绍）"
      }
    }
  ]
},
  "playlist-maker": {
  "label": {
    "en": "Original listening scenarios · Sequence, shared space and discovery",
    "zh": "原创聆听情境 · 顺序、共同空间与新发现"
  },
  "instructions": {
    "en": "Imagine arranging music for a small gathering or some time on your own. Choose your first priority in six written scenes. No audio, music account or listening history is needed. Finish all six to read the three counts and every highest-count portrait in full.",
    "zh": "想象为小聚会或自己的一段时间安排音乐。六个文字场景中，选择会先关注的事情。无需音频、音乐账户或听歌记录；完成六题，查看三项次数与所有最高并列的完整画像。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "What does your imagined playlist need to do?",
        "zh": "这份想象歌单，要为哪段时间服务？"
      },
      "paragraphs": [
        {
          "en": "The six scenes concern an opening, two contrasting tracks, a guest’s suggestion, a quieter gathering, an unfamiliar artist and a response you would value. These decisions compare how you would shape a listening occasion. They do not ask you to identify a recording, hear a musical interval or demonstrate mixing technique.",
          "zh": "六个场景分别涉及开场、两首对比明显的曲子、来客推荐、变安静的聚会、陌生创作者，以及最在意的评价。它们比较怎样安排一次聆听，不要求辨认录音、听出音程或展示混音技术。"
        },
        {
          "en": "A sequence, a welcoming room and an unexpected find can all belong in one list. The single-choice format asks which you would attend to first when priorities compete. It supplies no actual tracks and does not infer personality from a genre, artist or streaming profile.",
          "zh": "顺序、自在的现场与意外发现，可以同时出现在一份歌单里。单选只是在需要取舍时，问你先关注什么。页面不提供实际曲目，也不根据曲风、创作者或流媒体档案推断人格。"
        }
      ]
    },
    {
      "id": "arc",
      "title": {
        "en": "The Listening Arc: make a transition worth noticing",
        "zh": "聆听弧线：让一处转折值得留意"
      },
      "paragraphs": [
        {
          "en": "This portrait puts tracks in relation to one another: what an opening prepares, where a contrast belongs and how to finish. In an original example, imagine five unnamed tracks with one change in pace; moving that change earlier can create a different shape without making either version objectively better.",
          "zh": "这个画像看曲子彼此的关系：开场准备什么、对比放在哪里、怎样收尾。一个原创例子是想象五首不具名曲目，其中有一次节奏转折；把转折提前，就会形成不同形状，不表示其中一版客观更好。"
        },
        {
          "en": "The original guide’s tradeoff matters: a planned journey can stop fitting when the occasion changes. A listener may enjoy one track without noticing the arc. The choices do not analyse tempo, key or transitions, so a high arc count is neither a DJ qualification nor evidence that an arrangement will sound seamless.",
          "zh": "原指南中的取舍很重要：场合变化后，计划好的旅程可能不再合适。听众也可能只喜欢其中一首，没有留意弧线。选择题不分析速度、调性或衔接，因此弧线次数高不是DJ资质，也不证明编排会听起来无缝。"
        }
      ]
    },
    {
      "id": "room",
      "title": {
        "en": "The Room Listener: ask what this occasion needs",
        "zh": "先听见现场的人：问问这次场合需要什么"
      },
      "paragraphs": [
        {
          "en": "This portrait attends to conversation, contributions and the purpose people actually share. For an imagined craft afternoon, you could ask whether music is wanted at all, then agree on a few optional suggestions. Choosing the room is a priority in these scenes, not a test of empathy or an obligation to satisfy every request.",
          "zh": "这个画像关注聊天、大家的推荐，以及实际共同目的。想象一次手工下午，可以先问是否想放音乐，再商量几项自愿推荐。关注现场是本题情境里的侧重，不是共情测验，也不意味着必须满足每个请求。"
        },
        {
          "en": "Real playlist products make contribution rules explicit. Spotify describes collaborators adding, removing and reordering tracks; Apple’s French instructions distinguish inviting people, editing tracks and leaving a collaboration.[1][2] Those are reference examples of product controls. This story neither creates a collaborative list nor grants anyone access to a music account.",
          "zh": "真实歌单产品会写清贡献规则。Spotify说明协作者可以添加、删除和重排曲目；Apple法语说明把邀请、编辑曲目与退出协作分开。[1][2]这些是产品操作的参考例子。本故事既不创建共同歌单，也不授予音乐账户访问权限。"
        }
      ]
    },
    {
      "id": "discovery",
      "title": {
        "en": "The Unexpected Find: an invitation can stay optional",
        "zh": "把意外发现带进来：邀请可以保持自愿"
      },
      "paragraphs": [
        {
          "en": "This portrait favours something outside the expected queue. An original example is offering one unfamiliar selection among familiar ones, with a brief reason if someone asks. Listeners may keep it, skip it or explore it later; their response need not validate the person who suggested it.",
          "zh": "这个画像偏向预期队列之外的东西。一个原创例子是在熟悉选择中加一项陌生推荐，有人问时再简短说明理由。听众可以留下、跳过或以后再探索，不必用反应来肯定推荐者本人。"
        },
        {
          "en": "Novelty is not a hierarchy of musical taste. A familiar song can suit the occasion, and a discovery can remain privately enjoyable when nobody else is interested. The count measures neither openness as a personality trait nor knowledge of obscure music; no song catalogue or listening behaviour is inspected.",
          "zh": "新鲜感不是音乐品位等级。熟悉的歌可以适合场合，没人感兴趣的新发现也仍然可以私下喜欢。次数既不测人格特质中的开放性，也不测冷门音乐知识；页面不会检查曲库或实际聆听行为。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices, three counts and seven possible highest sets",
        "zh": "六次选择、三项次数与七种最高集合"
      },
      "paragraphs": [
        {
          "en": "Each scene offers arc, room and discovery once, with their positions changing. Your selected option adds one to its direction. Each count ranges from zero to six, and the completed total is six. A lower count means less often selected within this bank, rather than a missing skill or a percentage of your character.",
          "zh": "每个场景都提供弧线、现场、发现各一次，位置会变化。所选项给对应方向加一次，各项零至六次，完成后总和六。低次数只表示本题组中相对少选，不是缺少某种技能，也不是人格所占百分比。"
        },
        {
          "en": "All directions sharing the highest count remain: three-three-zero shows two portraits, and two-two-two shows all three. There is no random winner or tie-break. Every guide keeps the original summary, example, benefit, tradeoff and optional experiment. Read these as authored recreational possibilities; reliability, trait validity and population norms have not been established.",
          "zh": "最高次数相同的方向全部保留：三、三、零显示两篇，二、二、二显示三篇。不随机抽一个，也不强行破同分。每篇指南保留原概述、例子、用处、取舍与可选尝试。请把它们读作原创休闲可能性；尚未建立信度、特质效度或人群常模。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Read every portrait without connecting a music service",
        "zh": "不连接音乐服务，也能读完所有画像"
      },
      "paragraphs": [
        {
          "en": "Start opens the first scene directly. There is no audio player, account connection, song upload or request for your listening history. Answers are resolved in the browser. Optional saving retains this edition’s draft in the current tab for up to twenty-four hours; completion, retake or deletion clears it.",
          "zh": "开始直接打开第一场景。页面没有音频播放器、账户连接、歌曲上传，也不索取听歌历史。答案在浏览器内解析。可选保存把本版草稿留在当前标签页最长二十四小时，完成、重玩或删除会清除。"
        },
        {
          "en": "Without saving, a refresh can lose progress. Public guide links contain no personal answers, and all three guides can be read without payment or sharing. Website usage analytics allowed by cookie settings are separate from answer content. If you try a guide’s optional idea, use your own suitable listening arrangement; this page does not produce or publish one.",
          "zh": "不保存时，刷新可能丢失进度。公开指南链接不含个人答案，三篇都可免支付、免分享阅读。Cookie设置允许的使用统计与答案内容分开。若想尝试指南的小点子，可以自行安排合适的聆听；本页不会生成或发布歌单。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Does this make a playlist I can play?",
        "zh": "这会生成能播放的歌单吗？"
      },
      "answer": {
        "en": "No. Six written choices lead to complete recreational portraits, not song recommendations, audio playback or a playlist export.",
        "zh": "不会。六个文字选择产生完整趣味画像，不推荐实际曲目、不播放音频，也不导出歌单。"
      }
    },
    {
      "question": {
        "en": "Do I need Spotify, Apple Music or musical training?",
        "zh": "需要音乐平台账户或音乐训练吗？"
      },
      "answer": {
        "en": "No. No music-service sign-in, subscription, audio identification or training is required. The linked product documentation is contextual reading.",
        "zh": "不需要。无需音乐服务登录、订阅、音频辨认或训练；所链接的产品说明仅作背景阅读。"
      }
    },
    {
      "question": {
        "en": "Can I get two or three results?",
        "zh": "会出现两篇或三篇结果吗？"
      },
      "answer": {
        "en": "Yes. Every direction tied at the maximum count appears in full. A completed two-two-two count displays all three guides.",
        "zh": "会。同为最高次数的方向都完整显示。完成后若为二、二、二，就显示三篇指南。"
      }
    },
    {
      "question": {
        "en": "Does choosing discovery mean I have better taste?",
        "zh": "选择发现，就表示品位更好吗？"
      },
      "answer": {
        "en": "No. It means those fictional discovery options were selected more often. The page does not rank genres, artists, listeners or musical knowledge.",
        "zh": "不是。它只表示本次较常选虚构的发现选项，不给曲风、创作者、听众或音乐知识排名。"
      }
    },
    {
      "question": {
        "en": "Is the Room Listener a measure of empathy?",
        "zh": "现场画像是在测共情吗？"
      },
      "answer": {
        "en": "No. The questions compare priorities in playlist situations. They do not observe listening to people or establish an empathy score.",
        "zh": "不是。问题比较编歌单情境中的侧重，不观察实际倾听他人，也不产生共情分数。"
      }
    },
    {
      "question": {
        "en": "Can I change an answer or read another guide?",
        "zh": "能改选或读其他指南吗？"
      },
      "answer": {
        "en": "Yes. Back lets you edit earlier choices, retake clears the current run, and all three complete public guides remain freely readable.",
        "zh": "可以。上一题可返回改选，重玩会清空本轮；三篇完整公开指南都可自由阅读。"
      }
    }
  ],
  "references": [
    {
      "url": "https://support.spotify.com/us/article/collaborative-playlists/",
      "label": {
        "en": "Spotify: collaborative playlist controls (English; related product)",
        "zh": "Spotify：协作歌单操作（英语；相关产品）"
      }
    },
    {
      "url": "https://support.apple.com/fr-be/118494",
      "label": {
        "en": "Apple Support: playlist collaboration, editing and leaving (French)",
        "zh": "Apple支持：歌单协作、编辑与退出（法语）"
      }
    }
  ]
},
  "photo-group-role": {
  "label": {
    "en": "Original photo coordination · Framing, participation and a shared moment",
    "zh": "原创合照协调 · 构图、参与与共同瞬间"
  },
  "instructions": {
    "en": "Imagine one casual photo with a willing group. Across six scenes, choose which part of the task you would attend to first. You take or upload no photograph. Finish all six for three raw counts and every highest portrait; there is no appearance or photography grade.",
    "zh": "想象与愿意的人拍一张轻松合照。六个情境里选择自己会先关注任务的哪部分。不实际拍摄或上传照片；完成六题后查看三项原始次数与所有最高画像，不评外貌或摄影水平。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "A shared photograph is a small coordination task",
        "zh": "共同照片，是一件小协调任务"
      },
      "paragraphs": [
        {
          "en": "The scenes cover proposing a photo, changing an awkward arrangement, respecting someone who stays out, one last attempt, discussing sharing and ending the task. They compare framing, participation choices and a bounded memory moment. None requires everyone to appear or the gathering to stop until a perfect photo exists.",
          "zh": "场景包括提议合影、调整别扭排列、尊重不入镜者、最后一次尝试、讨论分享，以及结束任务。比较的是构图、参与选择与有边界的记忆瞬间，不要求人人入镜，也不要求聚会停下来等一张完美照片。"
        },
        {
          "en": "The premise is a willing group, not permission inferred from a quiz result. eSafety’s guidance separates asking before taking an image from asking before sharing it.[1] That distinction applies to the scenario: an arrangement can look clear and still need the actual people’s preferences to be checked.",
          "zh": "前提是群体愿意，不是从问卷结果推定许可。eSafety资料把拍摄前询问与分享前询问分开说明。[1]这个区别对应本情境：排列看起来清楚，仍需核对实际参与者的意愿。"
        }
      ]
    },
    {
      "id": "frame",
      "title": {
        "en": "A simple frame makes the proposed picture understandable",
        "zh": "简单画框，让拟拍内容好理解"
      },
      "paragraphs": [
        {
          "en": "The Simple-Frame Coordinator asks whether willing participants and the chosen focus can be seen. An original example is suggesting one arrangement around a finished craft table, then changing one gap if someone says it does not work. A clear proposal can be discussed instead of directing every person through repeated poses.",
          "zh": "简单画框协调者关注愿意的人与选定焦点能否可见。一个原创例子是建议围着完成的手工桌站一种排列，有人觉得不合适时再改一个间距。清楚方案可以讨论，无需反复指挥每个人摆姿势。"
        },
        {
          "en": "The portrait does not test camera settings, lighting, editing or composition skill. Nor does selecting frame options imply that you may prioritise a neat picture over someone’s wish to stay out. All three portraits operate within the same voluntary premise, rather than competing levels of respect.",
          "zh": "画像不考相机设置、照明、修图或构图技能。选构图也不表示可为了整齐忽略别人不入镜的意愿。三种画像都在同一自愿前提下，不是尊重程度的高低档次。"
        }
      ]
    },
    {
      "id": "choice",
      "title": {
        "en": "Participation and sharing can be separate decisions",
        "zh": "参与拍摄与分享，可以分别决定"
      },
      "paragraphs": [
        {
          "en": "The Easy-Opt-Out Coordinator makes joining or passing ordinary options. In an original example, say there is no need to join the photo, accept a clear answer and carry on with the willing group. Repeatedly asking someone to reconsider can recreate the pressure the option was meant to remove.",
          "zh": "方便自选的协调者把参与或跳过都当普通选项。一个原创例子是说明不必加入照片，接受清楚回答，再继续拍愿意的人。反复劝对方重新考虑，可能制造原本想去掉的压力。"
        },
        {
          "en": "For sharing, discuss the actual selected image and intended audience instead of treating willingness to pose as permission for every use. CNIL’s French guidance includes the situation of agreeing to a photograph without agreeing to online publication.[2] It provides context for this distinction; this page does not issue a release, determine legal compliance or settle an individual image-rights dispute.",
          "zh": "分享时可讨论实际选中的照片与拟给谁看，不把愿意摆姿势当成任何用途的许可。CNIL法语资料列出同意拍照却未同意网上发布的情境。[2]它提供这个区别的背景；本页不出具授权、不判断法律合规，也不裁定个别肖像权争议。"
        }
      ]
    },
    {
      "id": "moment",
      "title": {
        "en": "One chosen moment need not take over the event",
        "zh": "选中一个瞬间，不必接管整场活动"
      },
      "paragraphs": [
        {
          "en": "The One-Memory Coordinator keeps something the group wants to remember, then returns to the occasion. In an original model-building example, people may choose one photo with the finished piece or decide that the shared conversation is enough. A caption can describe the activity without assigning everybody the same feelings.",
          "zh": "一个记忆瞬间协调者留下大家想记住的内容，再回到活动。一个原创拼模型例子里，大家可以选与成品拍一张，也能觉得共同聊天就已经足够。说明文字可以写活动，不必替所有人指定相同感受。"
        },
        {
          "en": "A moment count does not measure friendship quality, emotional intelligence or how meaningful an event was. Someone outside the frame can still be part of the group. The original guide leaves a no-photo ending complete, so a photograph is an option rather than proof that the occasion mattered.",
          "zh": "瞬间次数不测友谊质量、情商或活动多有意义。站在画外的人仍可以属于群体。原指南保留不拍照也完整的收尾，因此照片是一种选择，不是场合有意义的证明。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices produce three relative counts",
        "zh": "六次选择，产生三项相对次数"
      },
      "paragraphs": [
        {
          "en": "Each question offers frame, choice and moment once, in changing positions. Your selected direction receives one count. Each ranges from zero to six and a completed sum is six. Choosing one emphasis does not mean abandoning the others, and a low choice count is not evidence that you disregard consent.",
          "zh": "每题各有构图、选择、瞬间一次，位置会变化。选中方向加一次，各项零至六次，完成后总和六。选择一种侧重不表示放弃其他侧重，选择方向次数低也不是忽视同意的证据。"
        },
        {
          "en": "Three, three and zero retains two full portraits, while two for each retains all three. All seven highest sets can occur, without a random draw or tie-break. Every public guide preserves its original example, strength, tradeoff and optional experiment. Counts are not ethical ratings, appearance scores or popularity estimates.",
          "zh": "三、三、零保留两篇全文，各二次保留三篇。七种最高集合均可出现，不随机抽取或破同分。每篇公开指南保留原例子、用处、取舍与可选尝试。次数不是道德评级、外貌分或受欢迎估计。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Read the portrait without submitting a real picture",
        "zh": "不提交真实照片，也能读完整画像"
      },
      "paragraphs": [
        {
          "en": "The page uses written choices only: no camera permission, photo upload, face analysis or assessment of anyone pictured. The decorative illustration is not an example of a scored face or an arrangement you must reproduce. No photograph is created by completing the quiz.",
          "zh": "页面只使用文字选择，不请求相机权限、不上传照片、不分析人脸，也不评价入镜者。装饰插画不是评分人脸示例，也不要求照着排列。完成问卷不会生成照片。"
        },
        {
          "en": "If you try an optional idea later, keep the group’s current wishes ahead of the portrait. They can prefer a different arrangement, a smaller audience or no image. The quiz does not verify those wishes, establish psychological traits or turn a fictional answer into someone else’s agreement.",
          "zh": "之后若尝试可选点子，实际群体当下的意愿优先于画像。他们可以选别的排列、较小分享范围或不留图。问卷不核验这些意愿、不建立心理特质，也不把虚构回答变成别人的同意。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Do I need to upload a photo or enable my camera?",
        "zh": "需要上传照片或开启摄像头吗？"
      },
      "answer": {
        "en": "No. You answer six written fictional scenes. There is no image upload, face analysis, camera input or generated group photograph.",
        "zh": "不用。只需回答六个文字虚构场景，没有上传图片、人脸分析、相机输入或生成合照。"
      }
    },
    {
      "question": {
        "en": "Does choosing a frame mean putting composition before participation?",
        "zh": "选构图就表示排列优先于参与意愿吗？"
      },
      "answer": {
        "en": "No. All three portraits assume a willing group. Counts compare which part of a small task you selected, not how much you respect people or whether consent was obtained.",
        "zh": "不是。三种画像都假设群体愿意。次数比较所选小任务侧重，不评尊重程度，也不验证取得了同意。"
      }
    },
    {
      "question": {
        "en": "Does agreeing to pose settle how the photo can be shared?",
        "zh": "同意入镜就确定了照片怎样分享吗？"
      },
      "answer": {
        "en": "No. The story distinguishes participation from the sharing arrangement. Discuss the selected image and intended audience with the actual people; the quiz cannot provide their permission.",
        "zh": "没有。故事区分参与拍摄与分享安排。应与实际参与者讨论选中图像和拟给谁看，问卷不能提供他们的许可。"
      }
    },
    {
      "question": {
        "en": "Why can more than one role be highest?",
        "zh": "为什么可能有多个最高角色？"
      },
      "answer": {
        "en": "All highest ties are retained. Three, three and zero shows two complete portraits; two for each shows three. No option order or random draw selects one winner.",
        "zh": "最高并列全部保留。三、三、零显示两篇全文，各二次显示三篇，不按选项顺序或随机强选赢家。"
      }
    },
    {
      "question": {
        "en": "Is the full quiz free and can I start directly?",
        "zh": "完整问卷免费，能直接开始吗？"
      },
      "answer": {
        "en": "Yes. Start opens the first of six scenes without another agreement step, about two minutes in total. All counts and all three full public guides are free.",
        "zh": "可以。开始直接进入六个场景的第一题，没有额外同意步骤，总计约两分钟。全部次数和三篇完整公开指南免费。"
      }
    },
    {
      "question": {
        "en": "Can I change an answer or replay?",
        "zh": "能改选或重玩吗？"
      },
      "answer": {
        "en": "Use Back while answering or Retake quiz after the result. Optional progress saving stays in this tab for up to 24 hours and clears on completion or retake.",
        "zh": "作答中可用上一题，结果后可重新测试。可选进度仅在本标签页保存至多24小时，完成或重测即清除。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.esafety.gov.au/young-people/consent-sharing-photos-videos",
      "label": {
        "en": "eSafety Commissioner — asking before taking and sharing images",
        "zh": "eSafety Commissioner：拍摄与分享前的询问"
      }
    },
    {
      "url": "https://www.cnil.fr/fr/demander-le-retrait-de-votre-image-en-ligne",
      "label": {
        "en": "CNIL — image-taking and online-publication contexts (French)",
        "zh": "CNIL：拍摄与网上发布的不同情境（法语）"
      }
    }
  ]
},
  "personal-museum": {
  "label": {
    "en": "Original imaginary exhibits · A sequence, a detail or a shared moment",
    "zh": "原创想象展品 · 顺序、细节与共享片刻"
  },
  "instructions": {
    "en": "Imagine curating an ordinary fictional day. Across six choices, select what a small display would preserve. Use invented or harmless public material, not private messages or someone else’s belongings. Nothing is uploaded. Finish all six for three counts and every highest curator portrait.",
    "zh": "想象为虚构的普通一天策展。六次选择里，决定小展柜会保留什么。使用虚构或公开无害材料，不用私信或他人私人物；页面不上传素材。答完六题后查看三项次数与所有最高策展画像。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "Ordinary moments can become a subject of selection",
        "zh": "普通片刻，也可以成为选择的题材"
      },
      "paragraphs": [
        {
          "en": "The scenes ask what enters a first case, what fits a short label, how similar exhibits differ, where a visitor should begin, what remains when one exhibit leaves and what the final wall says. They compare ways to select and connect material, not how important a real life has been.",
          "zh": "场景询问第一个展柜放什么、短标签写什么、相似展品怎样区分、访客从哪里开始、撤一件后怎样连贯，以及末墙说什么。比较的是选择和连接材料的方式，不评价真实人生有多重要。"
        },
        {
          "en": "The French Musée d’Histoire de la Vie Quotidienne describes exhibits organised around domestic, working and social life.[1] That provides a real example of everyday material becoming an exhibition subject. A real history collection relies on documented objects and context; our invented day is a storytelling exercise, not a historical collection or personal archive.",
          "zh": "法国日常生活历史博物馆介绍围绕家庭、工作与社会生活组织的展览。[1]这是日常材料成为展览题材的真实例子。真实历史馆藏依赖有记录的物件和背景；本页虚构一天是故事练习，不是历史馆藏或个人档案。"
        }
      ]
    },
    {
      "id": "sequence",
      "title": {
        "en": "A sequence shows a change without recording everything",
        "zh": "顺序呈现变化，不必记录一切"
      },
      "paragraphs": [
        {
          "en": "The Small-Day Story Museum gives selected moments an order. In an original fictional example, an unopened paper packet, a first attempt and a finished fold can show one small change. A plain time cue helps a visitor follow the sequence without inventing a dramatic climax.",
          "zh": "小小一天故事馆给选定片刻安排次序。一个原创虚构例子是用未拆纸包、初次尝试、完成折叠呈现小变化。普通时间提示可以帮助访客跟随，无需编一个戏剧高潮。"
        },
        {
          "en": "Selection leaves things out. A tidy beginning and ending do not prove that a real day unfolded exactly that way or that events had one inevitable meaning. In this game, you choose an exhibit structure rather than demonstrate accurate memory or a coherent life story.",
          "zh": "选择会有所遗漏。整齐开头与结尾不证明真实一天完全如此，也不证明事件只有必然的单一含义。本游戏选择的是展览结构，不展示准确记忆或连贯人生故事的能力。"
        }
      ]
    },
    {
      "id": "detail",
      "title": {
        "en": "Describe what is visible before adding an interpretation",
        "zh": "先描述看得见的，再添解释"
      },
      "paragraphs": [
        {
          "en": "The Close-Look Museum gives a small feature room. An original exhibit might show an uneven edge on an invented ticket. “One corner is shorter” is a description; who held it and what they felt would be a separate story, not something the edge establishes.",
          "zh": "多看一眼博物馆给小特征一点空间。一个原创展品可以是虚构票根的不齐边缘。“一角比较短”是描述；谁拿过、当时什么感受，则是另一个故事，不由边缘本身证明。"
        },
        {
          "en": "MoMA’s slow-looking prompts invite attention to shapes, surfaces and details.[2] They provide a way of approaching art, not proof that this quiz measures observation. Add a simple reason for your selection if it helps, while keeping an invented interpretation distinct from an observable feature.",
          "zh": "MoMA慢看提示邀请观众留意形状、表面和细节。[2]那是接近艺术的一种方式，不证明本问卷测观察力。需要时可添一句选择理由，同时把虚构解释与可观察特征分开。"
        }
      ]
    },
    {
      "id": "connection",
      "title": {
        "en": "A shared moment can acknowledge more than one account",
        "zh": "共享片刻，也容得下不止一种说法"
      },
      "paragraphs": [
        {
          "en": "The Shared-Moment Museum keeps how contributions met. In an original fictional case, two characters propose different picnic signs and agree on a third version. A label can name both contributions without making one person the hidden hero or pretending they felt the same way.",
          "zh": "一起造片刻的博物馆保留贡献怎样相遇。一个原创虚构展柜里，两位角色提出不同野餐牌方案，最后共同选第三版。标签可以写明两份贡献，不封谁为暗中英雄，也不假装两人感受相同。"
        },
        {
          "en": "The story asks for willing participation. Someone can decline to appear, and a shared event can support several accounts. Prefer invented material here rather than treating someone’s message, photograph or personal possession as yours to display. The quiz itself collects no exhibits or personal stories.",
          "zh": "故事前提是自愿参与。有人可以不出现，同一共享事件也可有多种叙述。本页优先使用虚构材料，不把别人的消息、照片或私人物当成自己可展示的内容。问卷本身不收集展品或私人故事。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six selections, three counts and complete curator portraits",
        "zh": "六次选取、三项次数与完整策展画像"
      },
      "paragraphs": [
        {
          "en": "Every question offers sequence, detail and connection once, in changing positions. The selected direction receives one count. Each ranges from zero to six and a completed total is six. These describe choices in this bank, not memory quality, empathy, curatorial qualifications or life meaning.",
          "zh": "每题各有顺序、细节、连接一次，位置会变化。选中方向加一次，各项零至六次，完成后总和六。次数描述本题组内的选择，不是记忆质量、共情、策展资格或人生意义。"
        },
        {
          "en": "Three, three and zero retains two full portraits; two for each retains all three. All seven highest sets can occur, with no random draw or tie-break. Read the original examples, strengths, tradeoffs and optional experiments in every full public guide; no direction has higher cultural value.",
          "zh": "三、三、零保留两篇全文，各二次保留三篇。七种最高集合均可出现，不随机抽取或破同分。各篇完整公开指南保留原例子、用处、取舍与可选尝试；不同方向不排名文化价值。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "An imagined display can stay small and change its story",
        "zh": "想象展览可以很小，也可以换一种叙述"
      },
      "paragraphs": [
        {
          "en": "For an optional experiment, invent three exhibits from an uneventful afternoon. Give one a time cue, one a precise feature and one a shared contribution, then ask which connection you want a visitor to follow. Combining the portraits is allowed; there is no required collection size or museum-quality standard.",
          "zh": "若想尝试，可虚构平凡午后的三件展品，分别给时间提示、具体特征和共同贡献，再问想让访客跟随哪条联系。可以组合画像，没有规定藏品规模或博物馆品质标准。"
        },
        {
          "en": "This page is not a therapy, memory assessment or authenticated biography. A changed answer on replay may reflect another story you want to tell, not a measured change in personality. You can also read all three guides without turning your own life into material for an exhibit.",
          "zh": "本页不是治疗、记忆评估或经过认证的传记。重玩改选可能只是想换个故事讲，不是测得人格变化。也可以只读三篇指南，不把自己的生活变成展览素材。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Do I upload objects, photographs or private messages?",
        "zh": "需要上传物件、照片或私信吗？"
      },
      "answer": {
        "en": "No. The six scenes are written choices and no exhibit is uploaded. Use invented or harmless public moments in imagination, without involving someone else’s private material.",
        "zh": "不用。六个场景都是文字选择，不上传展品。想象时可用虚构或公开无害片刻，不涉及他人私密材料。"
      }
    },
    {
      "question": {
        "en": "Does the result measure memory or how meaningful my life is?",
        "zh": "结果测记忆或人生有多有意义吗？"
      },
      "answer": {
        "en": "No. It compares selection and storytelling choices in a fictional ordinary day. No recall task, life-value score or psychological scale is administered.",
        "zh": "不测。它比较虚构普通一天中的取舍与叙述，没有回忆任务、人生价值分或心理量表。"
      }
    },
    {
      "question": {
        "en": "Is a tidy sequence the complete record of a real day?",
        "zh": "顺序整齐就是真实一天的完整记录吗？"
      },
      "answer": {
        "en": "No. Selecting exhibits leaves things out. The original sequence guide explicitly distinguishes a chosen story from a complete record of a day or person.",
        "zh": "不是。选展品会有所遗漏。原顺序指南明确区分选定故事与一天或一个人的完整记录。"
      }
    },
    {
      "question": {
        "en": "Why can several portraits be highest?",
        "zh": "为什么有多篇最高画像？"
      },
      "answer": {
        "en": "All highest counts are retained. Three, three and zero shows two full portraits; two for each shows three. No option order or random draw forces one winner.",
        "zh": "最高次数全部保留。三、三、零显示两篇全文，各二次显示三篇，不按选项顺序或随机强选赢家。"
      }
    },
    {
      "question": {
        "en": "Do I need museum experience or payment?",
        "zh": "需要博物馆经验或付费吗？"
      },
      "answer": {
        "en": "No. Start opens the first of six scenes directly, about two minutes in total. All counts and all three complete public guides are free.",
        "zh": "不用。开始直接进入六个场景的第一题，总计约两分钟。全部次数与三篇完整公开指南免费。"
      }
    },
    {
      "question": {
        "en": "Can I change my choices or replay?",
        "zh": "可以改选或重玩吗？"
      },
      "answer": {
        "en": "Use Back while answering or Retake quiz after the result. Optional saving remains in this tab for up to 24 hours and clears on completion or retake.",
        "zh": "作答中可用上一题，结果后可重新测试。可选进度仅在本标签页保存至多24小时，完成或重测即清除。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.museehistoireviequotidienne.fr/presentation-du-musee/",
      "label": {
        "en": "MHVQ — everyday-life museum introduction (French)",
        "zh": "MHVQ：日常生活历史博物馆介绍（法语）"
      }
    },
    {
      "url": "https://www.moma.org/visit/itineraries/slow-looking",
      "label": {
        "en": "MoMA — Slow Looking prompts",
        "zh": "MoMA：慢看提示"
      }
    }
  ]
},
  "party-arrival": {
  "label": {
    "en": "Original arrival scenes · Conversation, activity and settling in",
    "zh": "原创入场场景 · 对话、活动与安顿"
  },
  "instructions": {
    "en": "Imagine arriving at a friendly gathering already in progress. Choose the response you would prefer today in six situations, without trying to sound more outgoing. Finish all six for three counts and every highest portrait. There is no performance or real social task.",
    "zh": "想象到达一场已经开始的友好聚会。六个情境里选今天较愿采用的回应，无需表现得更外向。答完六题后查看三项次数与所有最高画像，不需要表演或实际完成社交任务。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "An arrival can begin before you join a conversation",
        "zh": "还没加入对话，也可以算已经到场"
      },
      "paragraphs": [
        {
          "en": "The scenes move from entering a room to approaching an ongoing conversation, accepting a host’s help, missing a joke’s context, welcoming a later guest and deciding what completes an arrival. The three entry routes concern what you would do in that situation, not whether other people would like you.",
          "zh": "场景从走进房间开始，经过已有对话、主人的帮助、不知道笑话前情、迎接后来客人，以及怎样算顺利到场。三种入口关注当下愿怎样做，不预测别人会否喜欢你。"
        },
        {
          "en": "Priya Parker’s gathering resources foreground the purpose of an event and connections among participants.[1] That is a hosting perspective, not evidence that one guest entrance is best. Here the fictional gathering is welcoming; the result cannot establish that a real event is accessible or right for you.",
          "zh": "Priya Parker的聚会资源强调活动目的与参与者之间的连接。[1]这是主持聚会的视角，不证明某种来客入场最好。本故事假设聚会友好；结果不能判断真实活动是否方便参与或适合自己。"
        }
      ]
    },
    {
      "id": "conversation",
      "title": {
        "en": "One available person can provide a starting point",
        "zh": "一个方便回应的人，就能成为起点"
      },
      "paragraphs": [
        {
          "en": "The One-Conversation Arriver looks for a manageable exchange. In an original craft-evening example, ask an available person which piece they are working on, then listen rather than preparing an impressive introduction for the whole room. Availability matters as much as the question.",
          "zh": "一段对话的到场者寻找可掌握的交流。一个原创手作夜例子是问一位方便回应的人正在做哪片作品，再听回答，无需为整屋准备惊艳自我介绍。对方是否方便，和问什么同样有关。"
        },
        {
          "en": "A brief answer or a wish to return to another conversation need not be turned into a judgement of your worth. The original tradeoff also leaves room to pause or end an exchange. A high conversation count neither assigns extraversion nor requires making a lasting connection.",
          "zh": "简短回答或想回到另一段对话，不必被解释成对自身价值的判断。原取舍也容许暂停或结束交流。对话次数高不分配外向特质，也不要求结成长久联系。"
        }
      ]
    },
    {
      "id": "activity",
      "title": {
        "en": "A visible activity can supply its own context",
        "zh": "看得见的活动，自带一点共同前情"
      },
      "paragraphs": [
        {
          "en": "The Shared-Activity Arriver finds a drawing, game or small task with a clear way in. An original example is asking whether an open collage table has space for one more person and what one small round involves. Joining can be a choice without becoming a commitment to help all evening.",
          "zh": "一起做点事的到场者寻找有清楚入口的绘画、游戏或小任务。一个原创例子是问开放拼贴桌能否再来一人、一小轮要做什么。加入可以是选择，不必变成整晚帮忙的承诺。"
        },
        {
          "en": "Repair Café’s French introduction gives a real example of gathering around a shared activity, with several ways to participate.[2] It is a repair setting, not a party script or evidence for these portraits. The useful distinction is that an activity supplies something visible to discuss; it does not guarantee comfort or belonging.",
          "zh": "Repair Café法语介绍提供围绕共同活动相聚的真实例子，也描述不同参与方式。[2]那是修理情境，不是聚会脚本或画像验证。可借此理解：活动提供看得见的共同内容，但不保证自在或归属。"
        }
      ]
    },
    {
      "id": "landing",
      "title": {
        "en": "Settling in can include a later choice to join",
        "zh": "先安顿，也为稍后的参与留位置"
      },
      "paragraphs": [
        {
          "en": "The Gentle-Landing Arriver first puts things down and understands the room. In an original example, ask where to leave a coat and where to sit before choosing a conversation or a game. A small orientation is an entry step, not a failed introduction.",
          "zh": "轻轻安顿的到场者先放下东西，了解房间。一个原创例子是问外套放哪里、哪里能坐，再选对话或游戏。简单了解方位也是入场步骤，不是自我介绍失败。"
        },
        {
          "en": "The original guide notes that waiting for perfect comfort can sometimes postpone a wanted small step. That is an optional reflection, not a command to push through discomfort. A high landing count does not diagnose social anxiety or mean that you dislike people; today’s room and energy may differ from another day’s.",
          "zh": "原指南提到，等待完全舒服有时会推迟自己想迈的一小步。这是可选回看，不要求硬撑不适。安顿次数高不诊断社交焦虑，也不表示不喜欢人；今天的房间与精力可能不同于另一天。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices compare three arrival routes",
        "zh": "六次选择，比较三种入场路线"
      },
      "paragraphs": [
        {
          "en": "Each question offers conversation, activity and landing once, in changing positions. Your selection adds one to its direction. Each count is zero to six and the completed sum is six. These are relative choices in this story, not sociability scores, popularity predictions or a population ranking.",
          "zh": "每题各有对话、活动、安顿一次，位置会变化。选中方向加一次，各项零至六次，完成后总和六。这是本故事中的相对选择，不是合群分、受欢迎预测或人群排名。"
        },
        {
          "en": "Three, three and zero retains two full portraits; two for each retains all three. All seven highest sets can occur, without a random winner or tie-break. The three original guides keep their examples, strengths, tradeoffs and optional experiments. No route is ranked as the more successful arrival.",
          "zh": "三、三、零保留两篇全文，各二次保留三篇。七种最高集合均可出现，不随机选赢家或破同分。三篇原指南保留例子、用处、取舍与可选尝试，不排名哪种到场更成功。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "An invitation for a later guest can remain an invitation",
        "zh": "给后来者的邀请，也允许被拒绝"
      },
      "paragraphs": [
        {
          "en": "The fifth scene asks what you would offer another guest. An original invitation might be “there is room at this table if you want,” followed by space to choose. Someone else may prefer a different entry route from yours; your portrait cannot tell you what they need.",
          "zh": "第五个场景问会为另一位来客提供什么。一个原创邀请可以是“想来这桌的话，还有位置”，随后让对方选择。别人可能需要不同入口，自己的画像不能代答对方需要什么。"
        },
        {
          "en": "Use the page as a recreational way to name one possible next step, not a validated social assessment or treatment plan. You can combine routes, leave a conversation or choose not to take an optional idea into real life. Belonging is not earned by completing a quiz or performing an entrance.",
          "zh": "可把页面作为趣味方式，说清一个可能的下一步，不当经过验证的社交评估或治疗计划。可以组合路线、结束对话，也可以不在现实尝试可选点子。归属不靠完成问卷或表演入场来取得。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Does this tell me whether I am introverted or extraverted?",
        "zh": "能测内向或外向吗？"
      },
      "answer": {
        "en": "No. The three portraits describe entry choices in six fictional situations. There is no validated personality dimension or sociability ranking.",
        "zh": "不能。三篇画像描述六个虚构情境中的入场选择，没有经过验证的人格维度或合群排名。"
      }
    },
    {
      "question": {
        "en": "Is settling in a sign that I do not want company?",
        "zh": "先安顿就表示不想与人相处吗？"
      },
      "answer": {
        "en": "No. It is one possible interval before your next choice. The result leaves later conversation and activity open and does not diagnose anxiety.",
        "zh": "不是。它只是下一选择之前的一段可能间隔，结果让之后的对话与活动保持开放，不诊断焦虑。"
      }
    },
    {
      "question": {
        "en": "Does choosing an activity mean helping all evening?",
        "zh": "选活动就要整晚帮忙吗？"
      },
      "answer": {
        "en": "No. The original activity portrait treats an activity as an entrance, with an option to continue, talk or pause after a small round.",
        "zh": "不用。原活动画像把活动当入口，一小轮后仍可以继续、聊天或暂停。"
      }
    },
    {
      "question": {
        "en": "Why do several routes share the highest result?",
        "zh": "为什么有多个最高路线？"
      },
      "answer": {
        "en": "All directions tied for the highest count are retained: 3–3–0 shows two full portraits and 2–2–2 shows three. No random draw forces one winner.",
        "zh": "同为最高次数全部保留：3—3—0显示两篇全文，2—2—2显示三篇，不随机强选赢家。"
      }
    },
    {
      "question": {
        "en": "Do I need to attend an event or register?",
        "zh": "需要实际参加聚会或注册吗？"
      },
      "answer": {
        "en": "No. Start opens the first of six imagined scenes directly, about two minutes in total. All counts and three complete public guides are free.",
        "zh": "不用。开始直接进入六个想象场景的第一题，总计约两分钟。全部次数与三篇完整公开指南免费。"
      }
    },
    {
      "question": {
        "en": "Can I edit a choice or start over?",
        "zh": "能改选或重来吗？"
      },
      "answer": {
        "en": "Use Back during the questions or Retake quiz after the result. Optional saving stays in this tab for up to 24 hours and clears on completion or retake.",
        "zh": "作答中可用上一题，结果后可重新测试。可选进度仅在本标签页保存至多24小时，完成或重测即清除。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.priyaparker.com/gatheringandhosting",
      "label": {
        "en": "Priya Parker — gathering and hosting resource introduction",
        "zh": "Priya Parker：聚会与主持资源介绍"
      }
    },
    {
      "url": "https://www.repaircafe.org/fr/a-propos/",
      "label": {
        "en": "Repair Café — gathering around shared activity (French)",
        "zh": "Repair Café：围绕共同活动相聚（法语）"
      }
    }
  ]
},
  "paper-world": {
  "label": {
    "en": "Original imagined construction · Routes, characters and layers",
    "zh": "原创想象造景 · 路径、角色与层次"
  },
  "instructions": {
    "en": "Imagine building a world on a sheet of paper. In six situations, choose what you would give a visitor to follow, do or look through. No actual folding, cutting, drawing or craft submission is required. Finish all six for three counts and every highest portrait.",
    "zh": "想象在一张纸上造世界。六个情境里选择自己会让访客沿什么走、做什么、透过什么观看。不需要实际折叠、剪裁、绘画或提交作品。答完六题后查看三项次数与所有最高画像。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "A small world gives a visitor something to do",
        "zh": "一个小世界，给访客一点可做之事"
      },
      "paragraphs": [
        {
          "en": "The six scenes cover a first feature, a visitor’s action, a feature that needs simplifying, a surprise, a place to pause and something to show. They compare a connected route, an action for a character and a view made by layers. More pieces or a longer backstory are not automatically better answers.",
          "zh": "六个场景包括第一处纸景、访客动作、需要简化的设计、意外细节、停点与想展示的部分。比较的是相连路线、角色能做的小事，以及纸层形成的视野。纸片更多或背景故事更长，不自动成为更好答案。"
        },
        {
          "en": "Paper-themed games can use construction as an actual mechanic: Paper Trail’s official introduction describes creating routes through folding, while PlayStation’s French Tearaway Unfolded page describes actions in a paper adventure.[1][2] Our six choices instead describe a world in imagination; there is no interactive folding surface or craft-performance test.",
          "zh": "纸主题游戏可以把构造做成实际机制：Paper Trail原站介绍通过折叠造路径，PlayStation法语Tearaway Unfolded页面介绍纸世界冒险中的动作。[1][2]本页六次选择描述想象世界，不提供可操作折纸画布，也不测试手作表现。"
        }
      ]
    },
    {
      "id": "route",
      "title": {
        "en": "A route is a sequence of usable connections",
        "zh": "路径是一串可以衔接的位置"
      },
      "paragraphs": [
        {
          "en": "The Folded-Route World starts with where a visitor can go. In an original scene, imagine a doorway, a platform and a way back along another edge. Following the sequence asks whether the destinations connect in the story, rather than whether the page looks full.",
          "zh": "折出路径的世界从访客能去哪里开始。一个原创场景是想象纸门、小平台，以及沿另一条纸边返回的路。顺着次序看，问的是故事中的地点是否相接，不是画面够不够满。"
        },
        {
          "en": "A short route can give a stopping point more room than many turns would. This is a design question inside the fiction, not evidence that you can plan a building or solve spatial tasks. The page does not calculate folds, support loads or real construction feasibility.",
          "zh": "短路可能比许多转弯更能给停点留位置。这是虚构中的设计问题，不证明你能规划建筑或解空间任务。页面不计算折痕、承重或实际构造可行性。"
        }
      ]
    },
    {
      "id": "cast",
      "title": {
        "en": "One small action can make the scenery matter",
        "zh": "一个小动作，让景物产生作用"
      },
      "paragraphs": [
        {
          "en": "The Little-Action Paper Cast gives a character something possible within the scene. An original example is carrying an imaginary button to a doorway, then deciding whether it becomes a sign or a gift. The doorway and button become relevant through the choice; a complete biography is unnecessary.",
          "zh": "有小动作的纸角色，在场景里有一件可做的小事。一个原创例子是把想象纽扣带到门口，再选它变成牌子还是礼物。门和纽扣因选择产生作用，无需补完角色全传记。"
        },
        {
          "en": "If an action asks too much of the world, the source options invite making the action smaller. A character count does not measure empathy, leadership or storytelling talent. It records which purpose you selected in these scenes, while the original guide gives a benefit, a tradeoff and an optional idea to explore.",
          "zh": "动作超出世界承接范围时，原选项邀请把动作缩小。角色次数不测共情、领导力或讲故事天赋，只记录这些场景里选择的用途；原指南另提供用处、取舍与可选点子。"
        }
      ]
    },
    {
      "id": "layers",
      "title": {
        "en": "A changed view can use the same pieces",
        "zh": "同样的纸片，也能换出一个视野"
      },
      "paragraphs": [
        {
          "en": "The Changing-View Paper World compares overlap and framing. In an original example, an imagined foreground arch frames a hill, then a small shift makes it look like a doorway. Keeping the hill in the same place makes the change easier to describe without adding another object.",
          "zh": "层层换景的纸世界比较重叠与取景。一个原创例子是想象前景纸拱框住小山，稍移位置后又像门口。让山留在原处，就更容易描述变化，不必再添一个物件。"
        },
        {
          "en": "Layers need not mean complexity or a dramatic reveal. A clear resting view can be part of the design. The story asks which arrangement you would prefer, without measuring depth perception, visual intelligence or whether a real layered model would work.",
          "zh": "层次不必等于复杂或戏剧性揭示。各层不动时的清楚视野，也可以属于设计。故事问偏好哪种排列，不测深度知觉、视觉智力，也不验证真实分层模型能否运作。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six answers produce three raw counts",
        "zh": "六次作答产生三项原始次数"
      },
      "paragraphs": [
        {
          "en": "Every question offers fold, cast and layers once in varying positions. The selected direction gains one count. Each ranges from zero to six and the completed sum is six. The counts describe relative choices in this authored bank, not artistic worth, manual ability or a population ranking.",
          "zh": "每题各有路径、角色、层次一次，位置会变化。选中方向加一次，各项零至六次，完成后总和六。次数描述原创题组里的相对选择，不是艺术价值、动手能力或人群排名。"
        },
        {
          "en": "All directions tied for the highest count are displayed completely. Three, three and zero shows two portraits, and two for each shows three. All seven highest sets can occur, without a random winner or tie-break. Every original guide remains available, including lower-count directions you may want to combine.",
          "zh": "同为最高次数的方向完整显示。三、三、零显示两篇，各二次显示三篇。七种最高集合均可出现，不随机选赢家或破同分。各篇原指南始终可读，也能选用次数较低的方向与其他做法组合。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Keep the experiment small and entirely optional",
        "zh": "尝试可以很小，也完全自愿"
      },
      "paragraphs": [
        {
          "en": "You can leave the whole world imagined. If you want a paper sketch, the original route guide suggests an entrance, a pause and a return; the character guide offers an object with two uses; the layer guide compares a frame and background. These are creative prompts, not instructions that require sharp tools or a finished model.",
          "zh": "整个世界都可以只留在想象里。若想画草图，原路径指南建议入口、停点、返回；角色指南给一个物件与两种用途；层次指南比较前景框和背景。这些是创作提示，不要求尖锐工具或完成模型。"
        },
        {
          "en": "The examples are original to this page and do not reproduce another game’s puzzles, characters or artwork. Six preferences cannot establish craft expertise or the best design method for you. Read the result as a starting question about what you want a visitor to experience, then change the world if another idea suits it better.",
          "zh": "本页例子为原创，不复现其他游戏的谜题、人物或画面。六次偏好不能认证手作专长，也不能确定最适合你的设计方法。可把结果读成起始问题：希望访客经历什么？有更合适的点子时，也可以改造世界。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Can I fold or move objects on this page?",
        "zh": "能在页面折纸或移动物件吗？"
      },
      "answer": {
        "en": "No. The page presents six written imaginary construction choices. It is not a folding simulator, drawing canvas or a paper puzzle with a correct solution.",
        "zh": "不能。页面提供六个文字想象造景选择，不是折纸模拟器、绘画画布或有正确解法的纸谜题。"
      }
    },
    {
      "question": {
        "en": "Do I need paper, scissors or craft experience?",
        "zh": "需要纸、剪刀或手作经验吗？"
      },
      "answer": {
        "en": "No. You can complete all choices in imagination. No tool, photograph, model or drawing submission is required.",
        "zh": "不用。全部选择都能在想象中完成，不需要工具，也不提交照片、模型或画作。"
      }
    },
    {
      "question": {
        "en": "Does a layered world show more advanced spatial ability?",
        "zh": "层次结果代表更高级空间能力吗？"
      },
      "answer": {
        "en": "No. Layers change a view, routes connect places and characters supply actions. These are different design purposes, with no ability ranking or performance task.",
        "zh": "不代表。层次改变观看，路径连接地点，角色提供动作，三者是不同设计用途，没有能力排名或表现任务。"
      }
    },
    {
      "question": {
        "en": "Why are several results shown?",
        "zh": "为什么会显示多个结果？"
      },
      "answer": {
        "en": "Every direction tied for the highest count is retained. A 3–3–0 result shows two full portraits; 2–2–2 shows all three. Lower counts do not prohibit using another approach.",
        "zh": "同为最高次数的方向全部保留。3—3—0显示两篇全文，2—2—2显示三篇。次数较低不妨碍采用另一种做法。"
      }
    },
    {
      "question": {
        "en": "Is everything free and can I start directly?",
        "zh": "全部免费，能直接开始吗？"
      },
      "answer": {
        "en": "Yes. Start opens the first of six scenes, without another agreement step. Allow about two minutes. All counts and all three complete guides are free.",
        "zh": "可以。开始直接进入六个场景中的第一题，没有额外同意步骤，约两分钟。全部次数与三篇完整指南免费。"
      }
    },
    {
      "question": {
        "en": "Can I edit or replay my paper world?",
        "zh": "能修改选择或重玩纸世界吗？"
      },
      "answer": {
        "en": "Use Back while answering or Retake quiz after finishing. Optional saving keeps choices in this tab for up to 24 hours, then expires; completion and retake clear it.",
        "zh": "作答中可用上一题，完成后可重新测试。可选保存把选择留在本标签页至多24小时，之后失效；完成与重测即清除。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.papertrailgame.com/",
      "label": {
        "en": "Paper Trail — official folding-mechanic introduction",
        "zh": "Paper Trail：官方折叠机制介绍"
      }
    },
    {
      "url": "https://www.playstation.com/fr-fr/games/tearaway-unfolded/",
      "label": {
        "en": "PlayStation — Tearaway Unfolded paper-world adventure (French)",
        "zh": "PlayStation：Tearaway Unfolded纸世界冒险（法语）"
      }
    }
  ]
},
  "paper-creature-language": {
  "label": {
    "en": "Original wordless fantasy · Signs, movements and turns",
    "zh": "原创无言幻想 · 信号、动作与轮次"
  },
  "instructions": {
    "en": "Imagine meeting Piplet, a creature made of folded paper. Choose how you would approach six invented exchanges. You do not need to perform a gesture or decode a hidden language. Finish all six for three counts and every highest portrait.",
    "zh": "想象遇见折纸小兽纸点。在六次虚构交流中选择自己较愿采用的回应。不需要表演手势或破解隐藏语言。完成六题后查看三项次数与所有最高画像。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "A shared language begins with room to check",
        "zh": "为共同语言留出核对空间"
      },
      "paragraphs": [
        {
          "en": "Piplet folds a corner, shows similar gestures, misses an expected reply, begins a game, adds a movement and leaves you a notebook page. These are six authored situations, not live responses from an animal, a person or an AI companion. Your choices accumulate toward three portraits; they do not change Piplet’s behaviour in a simulation.",
          "zh": "纸点折起一角、展示相似手势、没接上预期回应、开启游戏、增加动作，最后留下一页笔记。这是六个原创情境，不是真动物、真人或AI伙伴的实时回应。选择累计为三篇画像，不在模拟中改变纸点行为。"
        },
        {
          "en": "Language-decoding adventures offer a different task. Rundisc’s English introduction and Focus’s French launch article describe Chants of Sennaar as a puzzle adventure involving observation and deciphering languages.[1][2] Our story contains no hidden dictionary or right translation. The comparison clarifies the task, without borrowing its characters, signs or puzzles.",
          "zh": "语言解码冒险有另一类任务。Rundisc英文介绍与Focus法语发布文章把《Chants of Sennaar》描述为包含观察和语言解码的解谜冒险。[1][2]本故事没有隐藏词典或正确译法。对照用于说明玩法，不借用其人物、符号或谜题。"
        }
      ]
    },
    {
      "id": "signal",
      "title": {
        "en": "A sign becomes shared through an agreement",
        "zh": "信号通过约定成为共同线索"
      },
      "paragraphs": [
        {
          "en": "The Shared-Sign Maker prefers a few distinct cues whose meaning can be checked. In an original paper-game example, two players agree that turning a card sideways means “pause this round.” They can ask whether the cue is usable and replace it if either person finds it awkward.",
          "zh": "共同信号制作者偏向少量明显不同、可以核对含义的线索。一个原创纸上游戏例子是两人约定横放卡片代表“本轮先暂停”。双方可以问这是否好用，任何一方觉得别扭都能换一种。"
        },
        {
          "en": "The agreement belongs to that game. It does not make the same movement universal or let you infer a real person’s intentions without asking. In the source scenes, a checked signal is one possible starting point; more signs are not automatically a better language.",
          "zh": "约定属于当次游戏，不会让同样动作成为通用含义，也不能据此不问就推断真人意图。题本里，核对信号是一种起点；符号越多并不自动构成更好的语言。"
        }
      ]
    },
    {
      "id": "mirror",
      "title": {
        "en": "Trying a form is different from claiming its meaning",
        "zh": "尝试同一形式，不等于知道它的含义"
      },
      "paragraphs": [
        {
          "en": "The Curious-Movement Partner tries a fold or drawing beside another version. An original example is copying a curved line on your own page, then comparing where each version bends. Similarity is observable; understanding, agreement and feelings still need their own evidence.",
          "zh": "好奇动作伙伴把一个折法或图形放在另一版本旁边试。一个原创例子是在自己纸上照着画弧线，再比较各自在何处转弯。相似可以观察，理解、同意和感受仍需另行核对。"
        },
        {
          "en": "Réseau Canopé’s French theatre dossier uses a partner mirror exercise when introducing reflection on stage.[3] That bounded theatrical form is not a body-language decoding method. This paper story likewise does not recommend covertly copying someone to persuade them, or treating imitation as proof of trust.",
          "zh": "Réseau Canopé的法语戏剧资料在介绍舞台镜像时使用双人镜像练习。[3]这种有范围的戏剧形式不是肢体语言解码法。本纸故事同样不建议暗中模仿别人来劝服对方，也不把模仿当信任证明。"
        }
      ]
    },
    {
      "id": "turn",
      "title": {
        "en": "A response gap need not be filled immediately",
        "zh": "回应空隙不必马上填满"
      },
      "paragraphs": [
        {
          "en": "The Room-for-a-Reply Partner gives each exchange a visible place. In an original casual drawing game, one person adds a mark, puts down the pen and waits. A turn token can show when the invitation passes, while allowing either person to pause or decline.",
          "zh": "留回应空间的伙伴给每次交换一个可见位置。一个原创休闲绘画例子是一个人添一笔，放下笔，再等一等。轮次标记可以显示邀请何时传递，同时允许任何人暂停或不参加。"
        },
        {
          "en": "Silence does not have one fixed meaning, and a rigid turn rule can interrupt an exchange that both participants want to loosen. Read this portrait as an optional game structure rather than a communication treatment, a social-skill grade or an instruction to wait a prescribed number of seconds.",
          "zh": "沉默没有固定的单一含义，双方都想放松时，僵硬轮次反而可能打断交流。可把画像读成可选游戏结构，不当沟通治疗、社交能力评级，也不规定必须等待几秒。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices and all highest portraits",
        "zh": "六次选择与所有最高画像"
      },
      "paragraphs": [
        {
          "en": "Each question offers signal, mirror and turn once, in varying positions. The selected direction receives one count. Each ranges from zero to six and the completed total is six. A count records choices in these scenes, not communication accuracy, empathy, language ability or a percentile.",
          "zh": "每题各提供信号、模仿、轮次一次，位置会变化。所选方向加一次，各项零至六次，答完总和六。次数记录这些场景中的选择，不是沟通准确率、共情、语言能力或百分位。"
        },
        {
          "en": "Three, three and zero retains two full portraits; two for each retains all three. All seven highest sets can occur, without random selection or a tie-break. Each original guide includes an example, strength, tradeoff and optional experiment. A lower count does not mean you cannot use that approach.",
          "zh": "三、三、零保留两篇全文，各二次保留三篇。七种最高集合均可出现，不随机抽取或破同分。每篇原指南包括例子、用处、取舍与可选尝试。次数低不表示不能采用该方法。"
        }
      ]
    },
    {
      "id": "scope",
      "title": {
        "en": "A fictional creature does not stand in for real people",
        "zh": "虚构纸兽不替代对真人的理解"
      },
      "paragraphs": [
        {
          "en": "Piplet’s paper gestures are invented for this story. They do not represent a real signed language, an accessibility system or animal behaviour. The game asks for written choices only, without a camera, motion recognition or a performance task.",
          "zh": "纸点的纸手势是为故事虚构的，不代表真实手语、无障碍交流系统或动物行为。游戏只要求文字选择，不使用摄像头、动作识别或表演任务。"
        },
        {
          "en": "If you try an optional doodle exchange with someone, ask whether they want to participate and how they prefer to respond. You can combine a signal, a shared form and a pause instead of performing one portrait. The story has no established psychometric validation and does not judge another person’s understanding or consent.",
          "zh": "如果想与人尝试可选涂鸦交换，可先问对方是否愿意、偏好怎样回应。可以把信号、共同形式和停顿组合起来，无需表演某一种画像。本故事没有已建立的心理测量验证，也不判断他人的理解或同意。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Is there a language puzzle with a correct solution?",
        "zh": "有需要破解的语言谜题和正确答案吗？"
      },
      "answer": {
        "en": "No. Six written scenes compare how you would approach a fictional exchange. There are no hidden glyph meanings, translation keys or language-proficiency scores.",
        "zh": "没有。六个文字场景比较你会怎样开始虚构交流，没有隐藏符号含义、翻译答案键或语言熟练分。"
      }
    },
    {
      "question": {
        "en": "Does Piplet respond to my gestures or use AI?",
        "zh": "纸点会识别我的手势，或用AI回应吗？"
      },
      "answer": {
        "en": "No. Piplet is an original fictional character in a fixed question bank. The page accepts choices, not camera input or live dialogue.",
        "zh": "不会。纸点是固定题本中的原创虚构角色。页面接收选项，不接收摄像头输入或实时对话。"
      }
    },
    {
      "question": {
        "en": "Does mirroring prove understanding or agreement?",
        "zh": "模仿就证明理解或同意吗？"
      },
      "answer": {
        "en": "No. It can be a voluntary shared form in the fiction. The original portraits leave room to check meaning and do not turn imitation or silence into evidence of another person’s feelings.",
        "zh": "不能。它可以是虚构里的自愿共同形式。原画像留出核对含义的空间，不把模仿或沉默当他人感受的证据。"
      }
    },
    {
      "question": {
        "en": "Why can I receive multiple portraits?",
        "zh": "为什么会得到多篇画像？"
      },
      "answer": {
        "en": "All directions tied for the highest count are kept. Three, three and zero shows two full portraits; two for each shows all three. No option order forces a winner.",
        "zh": "同为最高次数的方向全部保留。三、三、零显示两篇全文，各二次显示三篇，不按选项顺序强选赢家。"
      }
    },
    {
      "question": {
        "en": "Do I need materials, registration or payment?",
        "zh": "需要材料、注册或付费吗？"
      },
      "answer": {
        "en": "No. Start opens the first of six imagined scenes directly. Allow about two minutes. All counts, highest portraits and three complete public guides are free.",
        "zh": "不用。开始直接进入六个想象场景中的第一题，约两分钟。全部次数、最高画像和三篇完整公开指南免费。"
      }
    },
    {
      "question": {
        "en": "Can I change a choice or replay?",
        "zh": "能改选或重玩吗？"
      },
      "answer": {
        "en": "Use Back while answering or Retake quiz after finishing. Optional saving stays in this tab for up to 24 hours and clears on completion or retake.",
        "zh": "作答中可用上一题，完成后可重新测试。可选进度仅在本标签页保存至多24小时，完成或重测即清除。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.rundisc.io/chants-of-sennaar/",
      "label": {
        "en": "Rundisc — Chants of Sennaar gameplay introduction",
        "zh": "Rundisc：《Chants of Sennaar》玩法介绍"
      }
    },
    {
      "url": "https://www.focus-entmt.com/fr/news/chants-of-sennaar-is-out-with-an-enthralling-launch-trailer",
      "label": {
        "en": "Focus Entertainment — Chants of Sennaar launch description (French)",
        "zh": "Focus Entertainment：《Chants of Sennaar》发布介绍（法语）"
      }
    },
    {
      "url": "https://cdn.reseau-canope.fr/archivage/valid/contenus-associes-dossier-pedagogique-N-16390-26966.pdf#page=14",
      "label": {
        "en": "Réseau Canopé — Le Menteur, mirror exercise, page 14 (French)",
        "zh": "Réseau Canopé：《Le Menteur》镜像练习，第14页（法语）"
      }
    }
  ]
},
  "note-taking-doodles": {
  "label": {
    "en": "Original note-play choices · Words, shapes and connections",
    "zh": "原创笔记选择 · 文字、形状与连接"
  },
  "instructions": {
    "en": "Imagine catching a small recreational idea on paper. Choose among six written situations about making a note and returning to it. You do not submit handwriting or a drawing. Finish all six for three raw counts and every highest portrait.",
    "zh": "想象在纸上记住一个休闲小想法。六个文字情境涉及记下与回看，选择自己较愿采用的方式。不提交手写字或绘画；完成六题后查看三项次数和所有最高画像。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "A note is a route back to an idea",
        "zh": "笔记是回到想法的一条路"
      },
      "paragraphs": [
        {
          "en": "The scenes ask what you capture first, what survives limited page space, what yesterday’s note needs, how a new fragment changes it, what you show a willing friend and what would help later. The subject is the information you want to preserve, rather than the neatness or quantity of your notes.",
          "zh": "六个场景询问先记什么、空间少时留什么、昨天的笔记需要什么、新碎片怎样改变记录、向愿意的朋友展示什么，以及什么有助日后回看。主题是想保留的信息，不是笔记的整齐程度或数量。"
        },
        {
          "en": "Cornell’s Learning Strategies Center encourages trying note methods in different situations.[1] That practical advice does not turn today’s choice into a permanent learner identity. This recreational quiz does not implement the Cornell system, administer a recall task or compare learning outcomes.",
          "zh": "康奈尔大学学习策略中心建议在不同情境中尝试记录方法。[1]这种实践建议不把今天的选择变成永久学习者身份。本趣味问卷不实施康奈尔笔记法、不做回忆任务，也不比较学习效果。"
        }
      ]
    },
    {
      "id": "line",
      "title": {
        "en": "One sentence can preserve a reason or next step",
        "zh": "一句话，留下理由或下一步"
      },
      "paragraphs": [
        {
          "en": "The One-Line Return Cue keeps an intention readable. An original paper-craft example is “try the narrow strip as a handle because the wide one blocks the opening.” It records both a possibility and why it mattered, without pretending the design has been tested.",
          "zh": "一句话返回提示让意图可读。一个原创纸艺例子是：“试用窄纸条作把手，因为宽纸条挡住开口。”它同时保留可能做法与当时理由，不假装设计已经试验成功。"
        },
        {
          "en": "A short sentence may omit a spatial relationship, so a small arrow or sketch can complement it. The useful test is whether your later self can understand the note, not whether it fits a word quota. A high line count does not assess language ability or promise better recall.",
          "zh": "短句可能漏掉空间关系，可以添小箭头或草图。可观察以后自己是否读得懂，不必追求固定字数。文字方向次数高，不评语言能力，也不承诺回忆更好。"
        }
      ]
    },
    {
      "id": "sketch",
      "title": {
        "en": "A rough shape shows arrangement without judging art",
        "zh": "粗图显出排列，不评价画技"
      },
      "paragraphs": [
        {
          "en": "The Rough-Shape Return Cue holds position, overlap or movement. In an original example, two rectangles and an arrow can show how one paper flap folds over another. Add a word if the arrow could mean either a fold or a slide; the drawing does not have to look finished.",
          "zh": "粗线条返回提示保留位置、重叠或移动。一个原创例子是用两个长方形和箭头表示一片纸翼怎样翻到另一片上。如果箭头可能表示折叠或滑动，可添一个词；画面无需像完成稿。"
        },
        {
          "en": "An attractive drawing can still leave the original question unclear, while an untidy one can preserve a useful relationship. Choosing sketch options does not establish visual intelligence, drawing talent or a visual learning style. No submitted drawing or performance is evaluated here.",
          "zh": "漂亮图也可能没说清原问题，潦草图也可能保留有用关系。偏选草图不证明视觉智力、画技或视觉学习风格。这里不接收绘画作品，也不评实际表现。"
        }
      ]
    },
    {
      "id": "links",
      "title": {
        "en": "A connection needs a meaning, not just another line",
        "zh": "连接需要含义，不只是多一条线"
      },
      "paragraphs": [
        {
          "en": "The Connected-Fragments Return Cue keeps why two pieces belong together. An original example connects a story phrase to a paper shape and adds “possible shape for the scene’s doorway.” The link is a design possibility, not evidence that the two fragments share a factual cause.",
          "zh": "碎片相连的返回提示保留两部分为何放在一起。一个原创例子是把故事短句与纸形相连，写上“可用作这个场景的门形”。连线表示设计可能，不证明两个碎片有事实因果关系。"
        },
        {
          "en": "UNIGE’s French concept-map introduction distinguishes concept nodes from their relationships, which can be labelled.[2] Obsidian’s own documentation describes links between notes and files.[3] These are related ways to represent connections, not identical products or evidence that more links mean better thought. A pencil line here neither creates a digital link nor verifies its meaning.",
          "zh": "日内瓦大学的法语概念图介绍区分概念节点与可标注的关系。[2]Obsidian自身文档介绍笔记和文件之间的链接。[3]这些是相关的连接表达方式，不是相同产品，也不证明连线越多思考越好。本故事里的一条铅笔线既不创建数字链接，也不验证含义。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "How six choices produce the full result",
        "zh": "六次选择怎样产生完整结果"
      },
      "paragraphs": [
        {
          "en": "Each question offers line, sketch and links once, in changing positions. Your selected option adds one to its direction. Each count is zero to six and a finished total is six. The counts compare formats selected in these six invented scenes; they are not a memory score, intelligence estimate or percentage of learning effectiveness.",
          "zh": "每题各有文字、草图、连线一次，位置会变化。选中的方向加一次，各项零至六次，完成后总和六。次数比较六个虚构情境里所选形式，不是记忆分、智力估计或学习效率百分比。"
        },
        {
          "en": "Three, three and zero retains two full portraits, and two for each retains three. All seven highest sets are possible, with no tie-break or random draw. The three public guides retain their complete examples, strengths, tradeoffs and optional experiments; any format can be combined with another in an actual note.",
          "zh": "三、三、零保留两篇完整画像，各二次保留三篇。七种最高集合均可出现，不破同分，也不随机抽取。三篇公开指南保留全部例子、用处、取舍与可选尝试；实际笔记中可以组合不同形式。"
        }
      ]
    },
    {
      "id": "return",
      "title": {
        "en": "Try returning to one note, rather than improving a score",
        "zh": "试着回看一条笔记，不追求分数提升"
      },
      "paragraphs": [
        {
          "en": "If you want an optional experiment, record one harmless hobby idea with paper you already have, then return later and notice what you genuinely need to add. You might need a reason, an arrangement or the meaning of a link. This is an original reflection prompt, not a tested memory intervention.",
          "zh": "若想尝试，可用已有纸张记一条无害爱好想法，稍后回看，注意确实还需要补什么：理由、排列，或连线含义。这是原创回看提示，不是经过验证的记忆干预。"
        },
        {
          "en": "The page does not store a notebook, inspect private notes or recommend that one format must replace your current practice. Retaking may show a different choice for a different idea. It does not establish that your memory or personality changed; the actual usefulness of the note remains something to observe in context.",
          "zh": "本页不储存笔记本、不检查私人笔记，也不要求某种形式取代现有做法。换一个想法重玩，可能选出不同结果，不证明记忆或人格变化；笔记实际是否有用，仍需在具体情境中观察。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Do I need to draw or upload my notes?",
        "zh": "需要画画或上传笔记吗？"
      },
      "answer": {
        "en": "No. The six questions are written choices. No drawing, handwritten page, camera access or private note is submitted.",
        "zh": "不用。六题均为文字选择，不提交绘画、手写纸页或私人笔记，也不使用摄像头。"
      }
    },
    {
      "question": {
        "en": "Is this a Cornell Notes or concept-map assessment?",
        "zh": "这是康奈尔笔记法或概念图测验吗？"
      },
      "answer": {
        "en": "No. It is an original recreational comparison of a line, a rough sketch and connected fragments. Related resources explain other practices; their methods and evidence do not validate this quiz.",
        "zh": "不是。这是文字、粗图和碎片连接的原创趣味比较。相关资料介绍其他实践，其方法与证据不验证本问卷。"
      }
    },
    {
      "question": {
        "en": "Will the result tell me which format improves memory?",
        "zh": "结果能告诉我哪种形式提高记忆吗？"
      },
      "answer": {
        "en": "No. No learning outcome or delayed recall is measured. A format preference in six imagined scenes cannot establish a memory benefit or a fixed learning style.",
        "zh": "不能。这里不测学习结果或延迟回忆，六个想象场景里的形式偏好不能证明记忆收益或固定学习风格。"
      }
    },
    {
      "question": {
        "en": "Why can several formats be highest?",
        "zh": "为什么会有多个最高方向？"
      },
      "answer": {
        "en": "Every direction tied for the highest count is kept. A 3–3–0 result shows two full portraits; 2–2–2 shows all three. There is no forced winner.",
        "zh": "同为最高次数的方向全部保留。3—3—0显示两篇全文，2—2—2显示三篇，不强选赢家。"
      }
    },
    {
      "question": {
        "en": "Can I start directly and read all guides free?",
        "zh": "能直接开始并免费读全部指南吗？"
      },
      "answer": {
        "en": "Yes. Start opens the first of six scenes without another agreement step. Allow about two minutes. All counts, highest portraits and three complete public guides are free.",
        "zh": "可以。开始按钮直接进入六个场景的第一题，没有额外同意步骤。约两分钟，全部次数、最高画像与三篇完整公开指南均免费。"
      }
    },
    {
      "question": {
        "en": "Can I revise or replay?",
        "zh": "能改选或重玩吗？"
      },
      "answer": {
        "en": "Use Back while answering or Retake quiz after the result. Optional progress saving remains in this tab for up to 24 hours and clears on completion or retake.",
        "zh": "作答时可用上一题，结果后可重新测试。可选进度仅在本标签页保存至多24小时，完成或重测即清除。"
      }
    }
  ],
  "references": [
    {
      "url": "https://lsc.cornell.edu/how-to-study/taking-notes/cornell-note-taking-system/",
      "label": {
        "en": "Cornell Learning Strategies Center — note-taking approaches",
        "zh": "康奈尔学习策略中心：笔记方法"
      }
    },
    {
      "url": "https://ciel.unige.ch/2015/03/comprendre-et-degager-lessentiel-de-ses-notes-de-cours-avec-les-cartes-conceptuelles/",
      "label": {
        "en": "UNIGE CIEL — concept nodes and relationships (French)",
        "zh": "日内瓦大学CIEL：概念节点与关系（法语）"
      }
    },
    {
      "url": "https://obsidian.md/help/links",
      "label": {
        "en": "Obsidian Help — internal links",
        "zh": "Obsidian帮助：内部链接"
      }
    }
  ]
},
  "night-garden": {
  "label": {
    "en": "Six illustrated scenes · Sound imagined, not played",
    "zh": "六幅原创场景 · 声音由想象呈现"
  },
  "instructions": {
    "en": "Look at each static garden illustration or read its equivalent description, then choose which detail you would bring into focus. There is no hidden object to find, audio to identify or time limit. Finish six choices to see all three counts and every highest portrait.",
    "zh": "看每幅静态花园插画，或阅读等价画面说明，再选自己较想关注的细节。不需要找隐藏物、辨认音频，也不限时。完成六次选择后查看三项次数和所有最高画像。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "A fictional garden, with six ways to frame a moment",
        "zh": "在虚构花园里，为六个瞬间取景"
      },
      "paragraphs": [
        {
          "en": "The panels move from a gate and lantern to a breeze, a caption, two paths, close-up frames and a final notebook. Each contains alternatives for imagined sound, light relationships and small detail. The artwork supports the written scene; you are choosing a subject, not passing a visual search task.",
          "zh": "画面从门与灯笼，经过风、画面说明、两条小路、特写格子，走到最后的笔记。各题都有想象声音、光线关系和小细节的选择。插画辅助文字场景；你在选择题材，不是在完成视觉搜索任务。"
        },
        {
          "en": "The same person can choose a chime in one scene and a water bead in another. The three portraits name creative emphases inside this story, not stable attention types. No real night walk, wildlife encounter, hearing task or visual acuity test is involved.",
          "zh": "同一个人可以这题选风铃，下题选水珠。三篇画像命名的是本故事里的创作侧重，不是稳定注意力类型。不涉及真实夜游、野生动物接触、听觉任务或视力测验。"
        }
      ]
    },
    {
      "id": "sound",
      "title": {
        "en": "Drawing a sound does not require playing it",
        "zh": "画出声音，不必真的播放声音"
      },
      "paragraphs": [
        {
          "en": "The Quiet-Sound Collector follows marks suggesting chimes, taps and pauses. This page plays no audio and asks you to identify no recording. In an original example, a few separated strokes can stand for imagined taps; the spaces can remain silent instead of being filled with extra details.",
          "zh": "轻声收集者跟随暗示风铃、轻敲与停顿的线条。页面没有音频，也不要求辨认录音。一个原创例子是用几笔间隔短线表示想象的敲击；空白可以保持安静，无需添满细节。"
        },
        {
          "en": "Suffolk Artlink’s Sound Drawing activity uses marks to represent heard sounds and rhythm.[1] That is an actual listening-and-drawing activity. Our silent illustrations instead offer invented sound cues for a choice; they do not reproduce its exercise, measure hearing or establish benefits from a quiz result.",
          "zh": "Suffolk Artlink的声音绘画活动用笔触表示听到的声音与节奏。[1]那是真实的聆听绘画活动。本页无声插画提供的是虚构声音线索，不复现其练习、不测听力，也不据此证明作答结果有某种效果。"
        }
      ]
    },
    {
      "id": "light",
      "title": {
        "en": "Light and shadow connect parts of a picture",
        "zh": "用光与影连接画面"
      },
      "paragraphs": [
        {
          "en": "The Lantern-Shadow Reader attends to contrast, reflections and the path a shadow describes. In an original sketch idea, compare the same imaginary mug under two lights. The relationship between mug and shadow may change while the mug remains the same; neither drawing has to be judged better.",
          "zh": "灯影阅读者留意明暗、倒影与影子经过的位置。一个原创速写点子是把同一只想象杯子置于两种光线下：杯子未变，杯影关系可以改变，两幅画不必评谁更好。"
        },
        {
          "en": "MoMA’s slow-looking prompts invite viewers to consider shapes, details and imagined sensory aspects of artworks.[2] They offer approaches to encountering art, not a validation of our three categories. Here the changing shadow is represented by static marks, without flashing, a timed reveal or an accuracy grade.",
          "zh": "MoMA的慢看提示邀请观众留意形状、细节及作品引出的想象感官体验。[2]这些是接近艺术的方式，不验证本页三类。本页用静态线条表示影子变化，没有闪烁、限时显现或正确率评分。"
        }
      ]
    },
    {
      "id": "detail",
      "title": {
        "en": "A close detail still belongs to a wider scene",
        "zh": "贴近细节，也留下全景的位置"
      },
      "paragraphs": [
        {
          "en": "The Leaf-Edge Observer gives a curl, seed or water bead its own frame. An original example is sketching one junction on a familiar houseplant, then drawing a small outline showing where it belongs. This can be a creative choice even when you have no wish to catalogue the whole plant.",
          "zh": "叶缘细节观察者给卷边、种子或水珠独立画框。一个原创例子是画熟悉盆栽的一个叶片连接处，再加小轮廓表示它在整株的位置。不想记录整株植物，也可以选择这个创作焦点。"
        },
        {
          "en": "A close frame leaves other things outside it. Read the tradeoff as a question about composition, not proof that you miss context or notice more than other people. No botanical identification, memory score or comparison of observers is performed.",
          "zh": "特写会把一些东西留在画框外。可把取舍读成构图问题，不据此证明自己缺乏全局或比别人看得更多。这里不做植物鉴定、记忆评分或观察者比较。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices retain all highest counts",
        "zh": "六次选择，保留所有最高次数"
      },
      "paragraphs": [
        {
          "en": "Every question offers listener, shadow and detail once, with their positions changing. The selected option adds one to its direction. Each count ranges from zero to six and the finished total is six. These are counts within this bank, not sensory sensitivity, concentration ability or percentages of a population.",
          "zh": "每题各提供聆听、灯影、细节一次，位置会变化。所选项给对应方向加一次，各项零至六次，答完总和六。这是本题组内的次数，不是感官敏感度、专注能力或人群百分比。"
        },
        {
          "en": "A 3–3–0 result displays both highest portraits in full; 2–2–2 displays all three. All seven highest sets can occur. No random selection or option-order rule breaks a tie. Each full guide keeps its summary, example, strength, tradeoff and optional experiment; low counts do not mean a missing ability.",
          "zh": "3—3—0显示两篇最高画像全文；2—2—2显示三篇。七种最高集合均可出现，不随机抽取，也不按选项位置破同分。每篇指南保留概述、例子、用处、取舍与可选尝试；低次数不表示能力缺失。"
        }
      ]
    },
    {
      "id": "scope",
      "title": {
        "en": "Creative prompts and sensory research have different jobs",
        "zh": "创作提示与感官研究各有职责"
      },
      "paragraphs": [
        {
          "en": "Philharmonie de Paris’s French resource introduction discusses sound exploration in a musical-education setting involving materials, objects and instruments.[3] That setting differs from a silent fictional quiz. It does not establish our counts as a validated sensory profile or make this page a musical-training programme.",
          "zh": "巴黎爱乐的法语资源介绍讨论音乐启蒙情境中对材料、物件与乐器声音的探索。[3]那与无声虚构问卷不同，不证明本页次数是经过验证的感官档案，也不把本页变成音乐训练课程。"
        },
        {
          "en": "You can read all descriptions and choose at your own pace without headphones, a microphone, a camera or a visit outdoors. Optional creative ideas can remain entirely imagined. If you replay, read changed choices in relation to the scene; a different portrait does not establish a change in hearing, vision or personality.",
          "zh": "可以按自己的节奏读完说明并选择，不需要耳机、麦克风、摄像头或外出。可选创作点子也能完全停留在想象里。重玩时结合场景理解改选；画像不同不证明听力、视力或人格发生改变。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Does the night garden play sounds or require headphones?",
        "zh": "夜色花园会播放声音，需要耳机吗？"
      },
      "answer": {
        "en": "No. All six panels are static and silent. Lines and captions suggest imagined sounds. No recording, microphone permission or hearing identification is required.",
        "zh": "不会。六幅画面均静态无声，线条与说明暗示想象的声音，不需要录音、麦克风权限或听觉辨认。"
      }
    },
    {
      "question": {
        "en": "Can I use the written descriptions instead of the pictures?",
        "zh": "可以只读画面说明吗？"
      },
      "answer": {
        "en": "Yes. Each question illustration has a bilingual equivalent description alongside the same written options. There is no hidden visual answer to discover or score for identifying a detail.",
        "zh": "可以。每题插画都有双语等价画面说明，与文字选项一同呈现，没有隐藏视觉答案，也不按辨认细节计分。"
      }
    },
    {
      "question": {
        "en": "Does a listener result measure sensory sensitivity?",
        "zh": "轻声收集者结果能测感官敏感吗？"
      },
      "answer": {
        "en": "No. It records choices of imagined sound cues. The quiz contains no validated sensory scale, hearing examination, vision assessment or attention-performance task.",
        "zh": "不能。它记录想象声音线索的选择，不包含经过验证的感官量表、听力检查、视力评估或注意力表现任务。"
      }
    },
    {
      "question": {
        "en": "Why are two or three portraits displayed?",
        "zh": "为什么显示两篇或三篇画像？"
      },
      "answer": {
        "en": "All directions with the highest count are displayed completely. Three, three and zero retains two; two for each retains three. The page does not force one winner.",
        "zh": "同为最高次数的方向完整显示。三、三、零保留两篇，各二次保留三篇，不强选一个赢家。"
      }
    },
    {
      "question": {
        "en": "Is a real night walk or drawing skill needed?",
        "zh": "需要真实夜游或绘画技能吗？"
      },
      "answer": {
        "en": "No. You choose among six illustrated fictional situations, about two minutes in total. There is no drawing submission, wildlife activity or outdoor task. All counts and complete guides are free.",
        "zh": "不用。只需在六个插画虚构情境中选择，约两分钟。不提交绘画、不接触野生动物，也没有户外任务。全部次数与完整指南免费。"
      }
    },
    {
      "question": {
        "en": "Can I change an answer or replay?",
        "zh": "能改选或重玩吗？"
      },
      "answer": {
        "en": "Use Back during the questions or Retake quiz after the result. Start opens the first scene directly. Optional progress saving stays in this tab for up to 24 hours and clears on completion or retake.",
        "zh": "作答中可用上一题，结果后可重新测试。开始按钮直接进入第一幅场景。可选进度仅在本标签页保存至多24小时，完成或重测即清除。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.suffolkartlink.org.uk/sessions/sound-drawing/",
      "label": {
        "en": "Suffolk Artlink — Sound Drawing activity",
        "zh": "Suffolk Artlink：声音绘画活动"
      }
    },
    {
      "url": "https://www.moma.org/visit/itineraries/slow-looking",
      "label": {
        "en": "MoMA — Slow Looking prompts",
        "zh": "MoMA：慢看提示"
      }
    },
    {
      "url": "https://ressourceseveil.philharmoniedeparis.fr/etudiants-et-professionnels.aspx?_lg=fr-FR",
      "label": {
        "en": "Philharmonie de Paris — musical discovery resource introduction (French)",
        "zh": "巴黎爱乐：音乐启蒙资源介绍（法语）"
      }
    }
  ]
},
  "new-club-member": {
  "label": {
    "en": "Original first-visit choices · Three practical starting points",
    "zh": "原创初访选择 · 三种参与起点"
  },
  "instructions": {
    "en": "Imagine a welcoming hobby group. Across six scenes, choose the response you would prefer on this visit, without pretending to know an unfamiliar term or skill. Finish all six to see the three raw counts and every highest portrait. No hobby experience is needed.",
    "zh": "想象一个欢迎新手的爱好小组。六个场景里选择这次较愿采用的回应，不必装作懂陌生词或已经会某项技能。完成六题后查看三项原始次数与所有最高画像，不需要爱好经验。"
  },
  "sections": [
    {
      "id": "visit",
      "title": {
        "en": "Making a first visit understandable and participatory",
        "zh": "让第一次到访好懂，也能参与"
      },
      "paragraphs": [
        {
          "en": "The six scenes cover an unfamiliar term, a demonstration, a question you cannot yet answer, a reminder for later, a different local custom and a possible second visit. They compare ways to enter one shared activity, rather than assess whether you deserve membership.",
          "zh": "六个场景依次涉及陌生用语、分步演示、尚不会回答的问题、活动后的记录、不同小组习惯，以及再次参加。比较的是进入一次共同活动的方式，不判断是否有资格成为成员。"
        },
        {
          "en": "Urban Sketchers describes several routes into its community, including joining a chapter or drawing independently, and explicitly addresses people new to drawing on location.[1] That is a real community example of varied entry routes; it does not establish that every club has the same rules or validate this quiz.",
          "zh": "Urban Sketchers介绍加入分会或独自画画等参与路径，也回应尚未练习现场绘画的新手。[1]这是现实社群提供不同入口的例子，不证明所有小组规则相同，也不验证本问卷。"
        }
      ]
    },
    {
      "id": "glossary",
      "title": {
        "en": "A few usable words, rather than a vocabulary entrance exam",
        "zh": "先弄懂用得上的词，不把术语当入场考试"
      },
      "paragraphs": [
        {
          "en": "The plain-word toolkit turns a label into something you can ask about. In an original paper-craft example, write the group’s term beside a simple description and ask which part of the demonstration it names. Check your understanding with the person showing it rather than treating your first note as a formal definition.",
          "zh": "词表工具把标签转成可追问的内容。一个原创纸艺例子是把小组术语与简单说明并排记下，再问它指演示中的哪部分。可向示范者核对，不把第一次笔记当正式定义。"
        },
        {
          "en": "A local word may differ between groups. Keep enough context to recognize that use, then return to the activity. Collecting every unfamiliar term can crowd out the first attempt; a high glossary count does not measure vocabulary, intelligence or a fixed verbal learning style.",
          "zh": "同一个词在不同小组里可能用法不同。留下足够辨认当次用法的背景，再回到活动。收齐全部陌生词可能挤掉第一次尝试；词表次数高，不测词汇量、智力或固定语言学习风格。"
        }
      ]
    },
    {
      "id": "process",
      "title": {
        "en": "One usable sequence, with permission to ask and vary",
        "zh": "先有一段可用流程，也能停下提问与变化"
      },
      "paragraphs": [
        {
          "en": "The process toolkit gives an unfamiliar activity a next action. In an original model-making example, follow a demonstration with spare pieces, then ask which steps are required for this project and which are the demonstrator’s preference. A starting sequence need not become the only acceptable method.",
          "zh": "流程工具给陌生活动一个下一步。一个原创模型例子是用备用件跟示范做一遍，再问哪些步骤是这次项目所需，哪些是示范者的偏好。入门顺序不必变成唯一可接受的方法。"
        },
        {
          "en": "Knowing one sequence does not establish mastery, and completing this story does not assess real execution. For an actual activity, follow the organiser’s instructions and ask before using unfamiliar equipment. The fictional choices contain no technical operating or safety assessment.",
          "zh": "知道一段流程不等于已经熟练，完成故事也不检验实际操作。真实活动应遵守组织者的说明，使用陌生设备前先问清楚。虚构选项不提供技术操作或安全评估。"
        }
      ]
    },
    {
      "id": "exchange",
      "title": {
        "en": "A small contribution remains optional on both sides",
        "zh": "小贡献始终是双方自愿的"
      },
      "paragraphs": [
        {
          "en": "The exchange toolkit combines an honest beginner question with something modest you can offer. In an original example, offer to arrange shared paper and separately ask a willing member to explain a fold. Either person can decline; neither action creates an ongoing obligation.",
          "zh": "交换工具把诚实的新手提问与能提供的小事放在一起。一个原创例子是提出帮忙整理共用纸张，同时另问愿意的成员能否解释折法。双方都能拒绝，任何一项都不生成长期义务。"
        },
        {
          "en": "Repair Café’s French introduction describes visitors working alongside knowledgeable volunteers, with other ways to participate when they have nothing to repair.[2] This provides a concrete example of shared activity, not evidence that newcomers must provide labour before receiving help. Our exchange portrait likewise keeps a welcome independent of usefulness.",
          "zh": "Repair Café法语介绍描述访客与懂修理的志愿者一起动手，也介绍没有东西要修时的其他参与方式。[2]这是共同活动的具体例子，不证明新人必须先劳动才能得到帮助。本页交换画像同样不把有用当作受欢迎的条件。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six answers, three counts and every highest portrait",
        "zh": "六次作答、三项次数与全部最高画像"
      },
      "paragraphs": [
        {
          "en": "Each scene offers glossary, process and exchange in changing positions. Your selected direction receives one count. Each ranges from zero to six; the completed total is six. Counts describe choices within this authored bank, not how well you learn, your social confidence or a population percentile.",
          "zh": "每个场景都提供词表、流程和交换三种方向，位置会变化。选中的方向加一次，各项零至六次，完成后总和六。次数描述本题组内的选择，不表示学得多好、社交自信或人群百分位。"
        },
        {
          "en": "Glossary=3, process=3 and exchange=0 retains two complete portraits; two for each retains all three. All seven highest sets are possible, with no random winner or tie-break. Read the original examples, tradeoffs and optional experiments in each full guide, including lower-count directions if useful.",
          "zh": "词表3次、流程3次、交换0次，保留两篇完整画像；各2次保留三篇。七种最高集合均可出现，不随机选赢家或破同分。各篇全文包括原例子、取舍与可选尝试，有需要也可阅读次数较低的方向。"
        }
      ]
    },
    {
      "id": "next",
      "title": {
        "en": "A question for the next visit, not a membership label",
        "zh": "为下次留一个问题，不给成员贴标签"
      },
      "paragraphs": [
        {
          "en": "Choose one small question for a future hobby session: which term is unclear, where would a demonstration help, or what contribution would you freely offer? You can use more than one toolkit or change it as the activity and people change. These are original reflection prompts, not a tested learning intervention.",
          "zh": "可为下次爱好活动留一个小问题：哪个词仍不清楚，哪里需要演示，或自己愿意提供什么帮助？可以同时用多种工具，也可以随活动与伙伴变化。这些是原创回看提示，不是经过验证的学习干预。"
        },
        {
          "en": "The story does not diagnose social anxiety, identify a permanent learning style or predict whether a club will welcome you. Practical access depends on that group’s arrangements and your needs. Ask about participation directly rather than using a result to decide someone else’s competence or belonging.",
          "zh": "故事不诊断社交焦虑、不识别永久学习风格，也不预测某个小组会否欢迎你。实际参与取决于小组安排与自身需要。可直接询问参与方式，不用结果判断别人的能力或归属。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Does this quiz identify my best learning style?",
        "zh": "能测出最适合我的学习风格吗？"
      },
      "answer": {
        "en": "No. It compares three original approaches to six fictional first-visit situations. The counts do not demonstrate which method improves learning or assign a stable learner category.",
        "zh": "不能。它比较六个虚构初访场景中的三种原创做法，次数不证明哪种方法提高学习效果，也不分配稳定学习者类别。"
      }
    },
    {
      "question": {
        "en": "Must I contribute before asking for help?",
        "zh": "提问前必须先作贡献吗？"
      },
      "answer": {
        "en": "No. A contribution and a question can be offered separately. The exchange portrait is voluntary on both sides and does not make welcome or an explanation conditional on labour.",
        "zh": "不用。贡献与提问可以分别提出。交换画像强调双方自愿，不把受欢迎或获得解释与劳动绑定。"
      }
    },
    {
      "question": {
        "en": "Is there a correct answer for joining a real club?",
        "zh": "有适用于真实社团的标准答案吗？"
      },
      "answer": {
        "en": "No. Real groups differ in activity, access arrangements and local practice. The story assumes a welcoming fictional group; it cannot decide membership requirements or practical competence.",
        "zh": "没有。真实小组的活动、参与安排与习惯不同。故事假设一个欢迎新手的虚构小组，不能决定成员条件或实际熟练程度。"
      }
    },
    {
      "question": {
        "en": "Why can two or three toolkits be highest?",
        "zh": "为什么会有两套或三套最高工具？"
      },
      "answer": {
        "en": "All directions with the highest count are retained: 3–3–0 shows two full portraits and 2–2–2 shows three. A lower count means less often selected here, not an inability to use that approach.",
        "zh": "同为最高次数的方向全部保留：3—3—0显示两篇全文，2—2—2显示三篇。次数较低只是本次相对少选，不表示不能采用该方法。"
      }
    },
    {
      "question": {
        "en": "Do I need experience, registration or payment?",
        "zh": "需要经验、注册或付费吗？"
      },
      "answer": {
        "en": "No. Start opens the first of six scenes directly. Allow about two minutes. The three counts, all highest portraits and all three public guides are free to read.",
        "zh": "不用。开始按钮直接进入六个场景的第一题，约需两分钟。三项次数、全部最高画像和三篇公开指南均免费阅读。"
      }
    },
    {
      "question": {
        "en": "Can I edit a choice or start again?",
        "zh": "可以改选或重新开始吗？"
      },
      "answer": {
        "en": "Use Back during the quiz or Retake quiz after the result. Optional saving is confined to the current tab, expires after 24 hours and is cleared when you finish or retake.",
        "zh": "作答中可用上一题，结果后可重新测试。可选保存仅在当前标签页，24小时后失效，完成或重测即清除。"
      }
    }
  ],
  "references": [
    {
      "url": "https://urbansketchers.org/join-us/",
      "label": {
        "en": "Urban Sketchers — joining and beginning on-location drawing",
        "zh": "Urban Sketchers：加入社群与开始现场绘画"
      }
    },
    {
      "url": "https://www.repaircafe.org/fr/a-propos/",
      "label": {
        "en": "Repair Café — shared repair and ways to participate (French)",
        "zh": "Repair Café：共同修理与参与方式（法语）"
      }
    }
  ]
},
  "museum-visitor": {
  "label": {
    "en": "Original exhibition choices · No knowledge grade",
    "zh": "原创观展选择 · 不评知识高低"
  },
  "instructions": {
    "en": "Imagine an exhibition whose route you can choose. In six scenes, select where you would place attention, rather than the answer a knowledgeable visitor is supposed to give. Finish all six for three counts and every highest portrait. No art-history knowledge or real visit is required.",
    "zh": "想象一场可以自主选择路线的展览。在六个场景中选择自己会把注意力放在哪里，无需猜有学问的观众应当怎样回答。完成六题后查看三个计数和所有最高画像。不需要艺术史知识或实际到馆。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "One visit cannot hold every object and story",
        "zh": "一次参观装不下全部展品与故事"
      },
      "paragraphs": [
        {
          "en": "The scenes begin with one hour in an unfamiliar exhibition, then consider a detailed surface and long label, a remembered moment, a crowded room, an unfamiliar object and one final stop. They compare a close encounter, a connecting question and attention shared with a companion. They do not count how much culture you absorbed.",
          "zh": "场景从陌生展览的一小时开始，依次涉及细节与长展签、想记住的瞬间、拥挤展厅、看不懂的物件和最后一站。比较的是靠近一件、追一个关联问题，以及与同行者并排观察，不统计吸收了多少文化。"
        },
        {
          "en": "A visit can move among all three. You might look at one surface, read how it connects to another room and discuss a question afterward. Choosing one response in this quiz highlights its relative place in the imagined visit, not a permanent visitor identity or a cultural ranking.",
          "zh": "一次参观可以在三者间移动：先看表面细节，读它与另一展厅的联系，再聊一个问题。本问卷每次选一种，只凸显它在想象参观里的相对位置，不分配永久观众身份，也不排名文化品位。"
        }
      ]
    },
    {
      "id": "close",
      "title": {
        "en": "A close look: observation before a conclusion",
        "zh": "靠近一件：先观察，再解释"
      },
      "paragraphs": [
        {
          "en": "The Close Look gives an object time to disclose a detail. In an original imagined example, notice an uneven edge on a displayed bowl and write it as an observation. Whether it came from manufacture, wear or later repair needs documentation; the visible edge alone does not establish its history.",
          "zh": "靠近一件事物，给细节一点显现时间。一个原创想象例子是注意展碗上一处不平边缘，并把它记成观察。它来自制作、磨损还是后来修复，需要记录支持；看见的边缘本身不证明历史。"
        },
        {
          "en": "MoMA’s slow-looking itinerary invites attention to features such as shapes, lines and textures and offers descriptive-looking prompts.[1] That is one museum’s approach to an encounter, not proof that this quiz measures attention or that every visitor must spend a fixed time at each work. Follow the venue’s rules and your own access needs.",
          "zh": "MoMA慢看路线邀请观众注意形状、线条、肌理等特征，并提供描述性观看提示。[1]这是一个博物馆提供的接触方式，不证明本问卷测注意力，也不要求每位观众在每件作品前停固定时间。实际参观应遵守场馆规则，并照顾自身可及性需要。"
        }
      ]
    },
    {
      "id": "thread",
      "title": {
        "en": "Following connections without making one route the whole story",
        "zh": "追踪关联，不把一条路线当作全部故事"
      },
      "paragraphs": [
        {
          "en": "The Connection Follower looks for a question linking selected objects. An original example is comparing two everyday containers to ask how use changed, then checking labels for dates and provenance. A similar shape can prompt a question; it does not by itself prove a shared maker, culture or historical influence.",
          "zh": "沿着线索走的人寻找连接若干物件的问题。一个原创例子是比较两件日用容器，问用途怎样变化，再核对展签上的年代与来源。外形相近可以引出问题，本身不证明出自同一制作人、文化或历史影响。"
        },
        {
          "en": "A curator’s arrangement is an interpretation supported by selected evidence, not the only possible question. Stop at an object that resists the route and ask what context is missing. A high thread count neither certifies historical expertise nor requires finishing every gallery.",
          "zh": "策展安排是由选定证据支持的一种解释，不是唯一可以问的问题。可停在一件似乎不合路线的物品前，问还缺什么背景。关联方向次数高，不认证历史专长，也不要求看完所有展厅。"
        }
      ]
    },
    {
      "id": "together",
      "title": {
        "en": "A conversation visit can include silence and time apart",
        "zh": "共同观看，也容得下安静与分开"
      },
      "paragraphs": [
        {
          "en": "The Conversation Visit makes room for someone else’s observation. In an original example, one person notices a material while another wonders about a mark. Comparing those starting points can generate a shared question without deciding who is the more informed visitor. Separate guesses from what the collection records.",
          "zh": "把参观变成对话，是为别人的观察留位置。一个原创例子是有人注意材料，有人好奇一处痕迹。比较这两个起点，可以产生共同问题，无需判断谁是更有学问的观众。仍应把猜测与馆藏记录分开。"
        },
        {
          "en": "A companion may want silence, a different route or a rest. Agreeing to separate and meet later can belong to a shared visit rather than signal rejection. Louvre-Lens’s French introduction notes that encounters with works are personal and can differ between people and occasions.[2] It does not validate three fixed visitor types.",
          "zh": "同行者可能想安静、换路线或休息。约定分开再会合，可以属于共同参观，不必被解释成拒绝。卢浮宫朗斯的法语介绍指出，人与作品的相遇具有个人性，也会随人和时间变化。[2]它不验证三种固定观众类型。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "How the counts and highest portraits work",
        "zh": "计数与最高画像怎样产生"
      },
      "paragraphs": [
        {
          "en": "Every scene has a close, thread and together option in varying positions. The selected direction gains one count, with each between zero and six and a completed total of six. A count is relative to these six invented situations, not knowledge, visual acuity, a learning style or a population percentile.",
          "zh": "每个场景各有细看、关联、共同观看选项，位置会变化。选中方向加一次，各项零至六次，完成后总计六。这是六个虚构场景内的相对计数，不是知识、视力、学习风格或人群百分位。"
        },
        {
          "en": "Close=3, thread=3 and together=0 retains two full highest portraits. Two for each retains all three. All seven highest sets are allowed, with no random selection or tie-break. Read every guide if useful; a lower count does not mean you cannot visit that way in another setting.",
          "zh": "细看3次、关联3次、共同观看0次，保留两篇最高画像全文；各2次则保留三篇。七种最高集合均可出现，不随机抽取或破同分。有兴趣可读每篇指南；次数低不表示换个展览就不能这样参观。"
        }
      ]
    },
    {
      "id": "experiment",
      "title": {
        "en": "An optional visit question, with room to change pace",
        "zh": "一个可选的参观问题，也允许改节奏"
      },
      "paragraphs": [
        {
          "en": "For a future visit or an openly available collection image, choose one detail and one question. Read the available source information, then decide whether to follow a connection or discuss it with someone. This original exercise combines the portraits instead of asking you to perform a preferred type.",
          "zh": "未来参观或看公开馆藏图像时，可以选一个细节和一个问题，阅读现有来源说明，再决定追踪关联或与人讨论。这项原创尝试组合三种画像，不要求表演某个偏好类型。"
        },
        {
          "en": "A satisfying visit need not include every room or every label. Resting, using accessible interpretation or leaving at your chosen point does not invalidate it. This page does not book a museum, provide live exhibition information or replace a collection’s factual documentation; its full guides are recreational reflections.",
          "zh": "满意的参观不必覆盖每间展厅或每张展签。休息、使用无障碍阐释或在自选节点离开，都不会使参观失效。页面不预订博物馆、不提供实时展讯，也不替代馆藏事实记录；完整指南用于趣味回看。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Is there a correct or more cultured way to answer?",
        "zh": "有正确或更有文化的答案吗？"
      },
      "answer": {
        "en": "No. The six scenes compare attention choices, not art-history knowledge, cultural sophistication or how many galleries you can finish. None of the three portraits is ranked above another.",
        "zh": "没有。六个场景比较注意力选择，不考艺术史知识、文化品位或看完多少展厅。三篇画像没有高低排名。"
      }
    },
    {
      "question": {
        "en": "Is this a scientific visitor-identity scale?",
        "zh": "这是科学的观众身份量表吗？"
      },
      "answer": {
        "en": "No. These are three original recreational portraits from six choices. Museum interpretation resources provide practical background; they do not validate the quiz’s categories or turn the counts into psychological scores.",
        "zh": "不是。这是六次选择产生的三篇原创趣味画像。博物馆阐释资料提供实践背景，不验证问卷类别，也不把计数变成心理分数。"
      }
    },
    {
      "question": {
        "en": "Can I take it if I usually visit alone?",
        "zh": "通常一个人看展也能做吗？"
      },
      "answer": {
        "en": "Yes, if you are comfortable imagining the companion scenes. Some options explicitly concern another visitor. Read them as fictional choices rather than evidence that you should bring company or prefer solitude.",
        "zh": "可以，前提是愿意想象同行场景。部分选项明确涉及另一位观众，请按虚构选择阅读，不据此认定自己应该结伴或更喜欢独处。"
      }
    },
    {
      "question": {
        "en": "Why do I get two or three portraits?",
        "zh": "为什么得到两篇或三篇画像？"
      },
      "answer": {
        "en": "Every direction with the highest count is retained. A 3–3–0 result shows two and 2–2–2 shows three. The page does not use option order or a random draw to force one winner.",
        "zh": "同为最高次数的方向全部保留。3—3—0显示两篇，2—2—2显示三篇，不按选项顺序或随机抽取强选一个赢家。"
      }
    },
    {
      "question": {
        "en": "Do I need to book a visit, register or answer a knowledge question?",
        "zh": "需要订票、注册或回答知识题吗？"
      },
      "answer": {
        "en": "No. Start opens the first of six imagined scenes directly, about two minutes in total. All raw counts, highest portraits and three complete public guides are free.",
        "zh": "不用。点击开始直接进入六个想象场景中的第一个，总计约两分钟。全部原始计数、最高画像和三篇完整公开指南免费。"
      }
    },
    {
      "question": {
        "en": "Can I revise or replay my choices?",
        "zh": "可以改选或重玩吗？"
      },
      "answer": {
        "en": "Use Back during the scenes, or Retake quiz after finishing. Optional saving is only in the current tab, expires after 24 hours and clears on completion or retake. No record of an actual visit is needed.",
        "zh": "作答中可用上一题改选，完成后可重新测试。可选保存仅限当前标签页，24小时后失效，完成或重玩即清除，不需要真实参观记录。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.moma.org/visit/itineraries/slow-looking",
      "label": {
        "en": "MoMA — Slow Looking itinerary and observation prompts",
        "zh": "MoMA：慢看路线与观察提示"
      }
    },
    {
      "url": "https://www.louvrelens.fr/mon-louvre-lens/comment-decrypter-une-oeuvre-dart-au-musee/",
      "label": {
        "en": "Louvre-Lens — approaching an artwork (French)",
        "zh": "卢浮宫朗斯：如何接近一件艺术作品（法语）"
      }
    }
  ]
},
  "museum-of-tomorrow": {
  "label": {
    "en": "Original invented exhibits · Three complete portraits",
    "zh": "原创虚构展品 · 三篇完整画像"
  },
  "instructions": {
    "en": "Imagine writing labels for a museum of invented future objects. In six scenes, choose what you would explain first: a function, a use story or a limit. There is no writing submission or professional grade. Finish all six to see the counts and every highest portrait in full.",
    "zh": "想象为未来虚构物品写博物馆展签。在六个场景中，选择自己会先说明的功能、使用故事或限制。不需要提交作文，也没有专业评级。答完六题后查看计数和所有最高画像全文。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "What should a visitor understand before imagining the future?",
        "zh": "想象未来之前，观众应当先理解什么？"
      },
      "paragraphs": [
        {
          "en": "A pocket shade, translating teacup and invitation-remembering door are exhibits in an invented world. The scenes ask what a label should make clear, including when visitors assume the door can read minds. They also ask what to include in one extra line and how to respond when someone assumes everyone will need the invention.",
          "zh": "口袋阴凉、翻译茶杯和记得邀请的门，都属于虚构世界的展品。场景询问展签该说明什么，包括观众误以为门会读心时怎样回应，还涉及多出一行该添什么，以及有人以为人人都需要发明时怎样解释。"
        },
        {
          "en": "The three portraits emphasise an action, a situated person and a boundary. A good fictional label can combine them. Your choices decide which emphasis appears most often here; the quiz does not test a real device, forecast its market or certify museum interpretation skills.",
          "zh": "三篇画像分别侧重动作、处在具体情境中的人和边界。一张好的虚构展签可以兼有三者。选择决定的是本次哪种侧重出现较多；问卷不检验真实设备，不预测市场，也不认证博物馆阐释技能。"
        }
      ]
    },
    {
      "id": "function",
      "title": {
        "en": "Clear function: explain one action without making it universal",
        "zh": "清楚用途：说明一个动作，不把用途说成普遍需要"
      },
      "paragraphs": [
        {
          "en": "The Clear-Function Label Writer gives the visitor an understandable operation. In an original fictional example, a folding paper screen makes a shadow only over the small area beneath it. Describing how it opens and what changes is more specific than calling it a solution for every sunny day.",
          "zh": "清楚用途展签作者给观众一个可以理解的操作。一个原创虚构例子是折叠纸屏只在下方一小块区域产生影子。说明怎样展开、展开后哪里变化，比称它解决所有晴天问题更具体。"
        },
        {
          "en": "A precise operation can still be irrelevant to a person’s needs. Add a voluntary use situation rather than assuming that because an object can do something, everyone should want it. A high function count records label choices, not technical knowledge or the accuracy of a real explanation.",
          "zh": "操作准确，也可能与某个人的需要无关。可以补一个自愿使用的情境，不因物件能做一件事，就假定人人想要它。功能次数高记录展签选择，不表示技术知识或真实说明的准确程度。"
        }
      ]
    },
    {
      "id": "users",
      "title": {
        "en": "A possible user: one story is not everyone’s experience",
        "zh": "可能的使用者：一个故事不代表所有人"
      },
      "paragraphs": [
        {
          "en": "The Possible-User Story Writer begins with someone who may choose the object. An original invented example contrasts a reader seeking a short shaded pause with a person who prefers an ordinary indoor seat. Both choices can make sense; the second is not an obstacle the story must overcome.",
          "zh": "使用者故事作者从可能选择物件的人开始。一个原创虚构例子把想在阴凉下短暂停读的人，与更喜欢普通室内座位的人并列。两种选择都可以合理，后一种不是故事必须克服的阻碍。"
        },
        {
          "en": "An appealing character does not establish demand, accessibility or benefit for a whole population. Ask whose circumstances the story leaves out and what another use or refusal might reveal. The portrait does not measure empathy or replace asking actual people about a real design.",
          "zh": "吸引人的角色不证明整个人群的需求、可及性或收益。可问故事遗漏了谁的处境，另一种用法或拒绝会显示什么。画像不测共情，也不替代针对真实设计询问实际使用者。"
        }
      ]
    },
    {
      "id": "limits",
      "title": {
        "en": "A visible boundary: fiction, operation and prediction differ",
        "zh": "边界可见：虚构、运行与预测需要区分"
      },
      "paragraphs": [
        {
          "en": "The Honest-Boundary Label Writer places a consequential limit beside the promise. For the invitation door, a written entry is different from a thought never expressed. A label that states this distinction changes what a visitor can reasonably infer from the invented object.",
          "zh": "边界清楚的展签作者把会影响理解的限制放在承诺旁边。对记邀请的门来说，写入的内容与从未表达的想法不同。展签说明这个区别，会改变观众从虚构物件中能合理推断什么。"
        },
        {
          "en": "A list of every exception can obscure the main idea. Choose the limit that matters to the next step, and distinguish what is invented from what is known. The V&A’s gallery-text guide includes organising information, engaging with objects, human relevance and admitting uncertainty.[1] This is a professional writing reference, not evidence validating this quiz’s categories.",
          "zh": "列尽例外也可能盖住主旨。可以选择影响下一步的限制，并分清虚构设定与已知信息。V&A展签指南讨论组织信息、与物件互动、人的关联和承认未知。[1]这是专业写作参考，不验证本问卷分类。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "How six choices produce the portraits",
        "zh": "六次选择怎样产生画像"
      },
      "paragraphs": [
        {
          "en": "Each scene contains one function, one user and one limit option, in varying positions. The chosen direction receives one count. After six answers, each is between zero and six and the total is six. These are relative selections in a small original set, not a communication ability scale or a percentile.",
          "zh": "每个场景各有一个功能、使用者、限制方向选项，排列位置会变化。选中方向加一次。六题后各项零至六次，总和为六。这是小型原创题组里的相对选择，不是沟通能力量尺或百分位。"
        },
        {
          "en": "Function=3, user=3 and limit=0 retains two full highest portraits; 2–2–2 retains all three. All seven possible highest sets are supported without random selection. Reading a lower-count guide can still be useful, since a lower count does not show that a skill or concern is missing.",
          "zh": "功能3次、使用者3次、限制0次时，保留两篇最高画像全文；2—2—2保留三篇。七种可能的最高集合均可出现，不随机抽取。低次数指南也可能有用，因为次数低不证明缺少技能或关切。"
        }
      ]
    },
    {
      "id": "practice",
      "title": {
        "en": "An optional three-sentence label exercise",
        "zh": "一项可选的三句展签尝试"
      },
      "paragraphs": [
        {
          "en": "Invent one harmless object and write one sentence about its action, one about someone who might choose it and one about a limit. Keep each sentence within the same fictional rules. This is an original exercise drawn from the three emphases; it is not a museum’s assessed assignment.",
          "zh": "虚构一件无害物品，用一句写它的动作，一句写可能选择它的人，一句写限制。三句都保持在同一虚构规则内。这是从三种侧重提出的原创练习，不是博物馆评分作业。"
        },
        {
          "en": "Read it as a visitor who has not heard your world-building explanation. The Canadian Language Portal advises defining the reader and communication purpose and giving relevant context.[2] Use that as a writing comparison; do not turn a vivid exhibit story into a claim that a real future technology exists or must succeed.",
          "zh": "试着以没听过世界设定的观众身份读它。加拿大语言门户建议明确读者和沟通目的，并提供相关情境。[2]可把它作为写作对照，不把生动展品故事写成真实未来技术已经存在或必然成功的主张。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Are the exhibits real future products?",
        "zh": "这些展品是真实未来产品吗？"
      },
      "answer": {
        "en": "No. The shade, teacup and door are invented. Their rules belong to a fictional museum; they do not establish technical feasibility, future demand or a real product’s capabilities.",
        "zh": "不是。阴凉、茶杯和门全部虚构，规则只属于想象博物馆，不证明技术可行性、未来需求或真实产品能力。"
      }
    },
    {
      "question": {
        "en": "Is this a test of writing skill or empathy?",
        "zh": "这是写作技能或共情测试吗？"
      },
      "answer": {
        "en": "No. It compares selected responses in six scenes and does not assess a submitted label or actual readers. The portraits are recreational emphases, not validated skill or empathy measures.",
        "zh": "不是。它比较六个场景中的选择，不评提交的展签或真实读者反馈。画像是趣味侧重，不是经过验证的技能或共情测量。"
      }
    },
    {
      "question": {
        "en": "Why are limits included in an imaginative museum?",
        "zh": "想象博物馆为什么还要谈限制？"
      },
      "answer": {
        "en": "A limit makes an invented rule understandable and can prevent a promise from becoming unlimited. It can sit alongside function and a use story rather than cancelling imagination.",
        "zh": "限制让虚构规则容易理解，也能避免承诺变得无限。它可以与功能和使用故事并列，不必取消想象。"
      }
    },
    {
      "question": {
        "en": "Why can several portraits be highest?",
        "zh": "为什么会有多篇最高画像？"
      },
      "answer": {
        "en": "Equal maximum counts are all retained. For example, 3–3–0 displays two and 2–2–2 displays three. No letter order, option position or random draw breaks a tie.",
        "zh": "同为最高次数的方向全部保留。例如3—3—0显示两篇，2—2—2显示三篇。不按字母、选项位置或随机抽取破同分。"
      }
    },
    {
      "question": {
        "en": "Do I need to write a label before seeing results?",
        "zh": "查看结果前需要写一张展签吗？"
      },
      "answer": {
        "en": "No. Only the six displayed choices are needed, about two minutes. Start opens the first scene directly. All counts, highest portraits and three public guides are free.",
        "zh": "不用。只需完成显示的六次选择，约两分钟。点击开始直接进入第一场景。全部计数、最高画像和三篇公开指南免费。"
      }
    },
    {
      "question": {
        "en": "Can I edit, retake or save?",
        "zh": "可以改选、重玩或保存吗？"
      },
      "answer": {
        "en": "Back permits edits while answering, and Retake quiz starts fresh. Optional current-tab saving expires after 24 hours and clears on completion or retake; no exhibit document or personal information is required.",
        "zh": "作答中可用上一题改选，重新测试从空选择开始。可选的当前标签页保存24小时后失效，完成或重玩即清除，不需要展品文档或个人信息。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.vam.ac.uk/blog/wp-content/uploads/VA_Gallery-Text-Writing-Guidelines_online_Web.pdf",
      "label": {
        "en": "V&A — Writing Gallery Text, ten-point overview",
        "zh": "V&A：《展厅文字写作》十点概览"
      }
    },
    {
      "url": "https://nos-langues.canada.ca/fr/cles-de-la-redaction/communication-claire-survol-du-processus-et-des-techniques",
      "label": {
        "en": "Language Portal of Canada — clear communication (French)",
        "zh": "加拿大语言门户：清晰沟通（法语）"
      }
    }
  ]
},
  "mountain-cabin": {
  "label": {
    "en": "Original shared-stay scenes · Full recreational portraits",
    "zh": "原创共住情境 · 完整趣味画像"
  },
  "instructions": {
    "en": "Everyone has already arrived safely at an imaginary cabin. In six ordinary room-sharing scenes, choose what you would arrange first. There is no outdoor task or compatibility grade. Complete all six to read the three counts and every highest-count portrait in full.",
    "zh": "所有人已安全到达想象中的小屋。在六个普通共住场景里，选择自己会先安排什么。不需要完成户外任务，也没有室友匹配评分。答完六题后查看三个计数和所有最高次数画像全文。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "What makes one shared evening workable?",
        "zh": "什么让一个共住夜晚运转起来？"
      },
      "paragraphs": [
        {
          "en": "The scenes move from arrival to blocked floor space, conversation and reading, a missing mug, bedtime and a guest-book note. They compare where you would begin: shared items, a comfortable common room or personal-space agreements. The premise is a short, uneventful stay, not a test of mountain preparedness.",
          "zh": "场景从进门、行李挡路，走到聊天与阅读、找不到杯子、睡前安排和留言簿，比较你会从哪里开始：共用品、舒服的公共房间，还是个人空间约定。前提是一次平常短住，不考登山准备。"
        },
        {
          "en": "These contributions can coexist. A shared lamp can be easy to find, its position can suit the reader, and its use can be discussed with people resting nearby. A higher count highlights a relative choice in six scenes, not a job you must perform for the whole group.",
          "zh": "三种贡献可以同时存在。共用灯可以容易找到，位置可以方便读书的人，使用方式也能与附近休息的人商量。次数较高凸显六个场景里的相对选择，不是必须替整组人承担的岗位。"
        }
      ]
    },
    {
      "id": "keeper",
      "title": {
        "en": "The shelf keeper: make a shared arrangement usable by others",
        "zh": "架边照料者：让共同安排也方便别人使用"
      },
      "paragraphs": [
        {
          "en": "The Cabin-Shelf Keeper notices where everyday supplies belong. An original example is putting shared drawing materials in a visible tray and asking whether everyone can reach and return them conveniently. The arrangement works because people understand it, not because one person remembers every item.",
          "zh": "小屋架边照料者注意日常用品的归处。一个原创例子是把共用绘画材料放在可见托盘，问问大家是否都方便取用、归还。安排能运转，在于大家理解它，不在于一个人记住所有物品。"
        },
        {
          "en": "A system imposed without discussion can leave its designer doing all the maintenance. Agree who will restore a shared item and revisit a placement that is inconvenient. This portrait does not prove conscientiousness, tidiness or a duty to clean up after everyone.",
          "zh": "没有商量的系统，可能让设计它的人独自维护。可以约好共用品由谁归位，并重新讨论不方便的位置。画像不证明尽责性、整洁程度，也不赋予替所有人收拾的义务。"
        }
      ]
    },
    {
      "id": "nest",
      "title": {
        "en": "The common-room nester: comfort needs more than one viewpoint",
        "zh": "公共房安顿者：舒服需要不止一个人的视角"
      },
      "paragraphs": [
        {
          "en": "The Common-Room Nester attends to the setting of an ordinary evening: a chair in a useful place, a spare mug or a gentle close to the shared room. An original example is asking whether moving one seat would help a craft circle before adding another activity.",
          "zh": "公共房安顿者照顾普通夜晚的环境：一把摆得合用的椅子、一个备用杯，或公共房间轻轻收尾。一个原创例子是在追加活动之前，先问移一把椅子是否方便大家围坐做手工。"
        },
        {
          "en": "What one person calls cozy may be too noisy or crowded for another. Ask about a specific adjustment rather than assuming a preferred atmosphere is universal. A high nest count does not measure hospitality skill or guarantee that every guest feels welcome.",
          "zh": "一个人觉得温暖的氛围，也可能让别人觉得太吵或太挤。可以问一个具体调整，不默认自己的舒服感普遍适用。安顿方向次数高，不测待客技能，也不保证每位来客都自在。"
        }
      ]
    },
    {
      "id": "boundary",
      "title": {
        "en": "The quiet-corner negotiator: explicit, revisable expectations",
        "zh": "安静角落商量者：预期说清，也允许修改"
      },
      "paragraphs": [
        {
          "en": "The Quiet-Corner Negotiator makes personal space and shared use discussable. An original example is agreeing which table area remains shared and where a person may leave their own materials. Asking before opening someone’s bag is different from concluding that a missing shared mug must be there.",
          "zh": "安静角落商量者让个人空间与共同使用可以讨论。一个原创例子是约定桌上哪里继续共用，哪里可放个人材料。翻别人包之前询问，与断定不见的共用杯一定在里面，是不同的事。"
        },
        {
          "en": "An early agreement may need to change when people settle in. Review it with those affected instead of treating the first preference as a permanent rule. The portrait does not identify introversion, avoidance or an inability to enjoy company; quiet time and time together can both matter.",
          "zh": "安顿下来之后，最初约定可能需要改变。可与受影响的人一起回看，不把第一份偏好变成永久规则。画像不判内向、回避或不擅长相处；安静时间和共同时间都可能重要。"
        }
      ]
    },
    {
      "id": "context",
      "title": {
        "en": "Shared-living resources as a practical comparison",
        "zh": "共住资料提供的是实践对照"
      },
      "paragraphs": [
        {
          "en": "McGill’s Good Neighbour Guide lists noise, sleeping habits and shared responsibilities among topics for discussion between roommates.[1] JuridiQC’s French practical article separately discusses common storage, what stays personal and agreements about noise and shared spaces.[2] These sources help identify concrete conversation topics.",
          "zh": "麦吉尔大学《好邻居指南》把声音、睡眠习惯和共同责任列为室友可讨论的话题。[1]JuridiQC的法语实践文章另讨论共用收纳、哪些物品保持私人，以及声音和公共空间约定。[2]这些资料帮助辨认具体可谈的事项。"
        },
        {
          "en": "A long-term tenancy guide is not evidence that a short fictional quiz predicts compatibility. Only the practical discussion themes are used here; the page does not provide lease terms, legal advice, accommodation rules or wilderness instructions. Your actual stay has its own requirements and people to consult.",
          "zh": "长期租住指南不证明短篇虚构问卷能预测匹配程度。这里仅使用实践讨论主题，不提供租约条款、法律意见、住宿规定或野外操作指导。实际停留有它自己的要求和需要沟通的人。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices and seven possible highest sets",
        "zh": "六次选择与七种可能的最高集合"
      },
      "paragraphs": [
        {
          "en": "Every scene contains one keeper, one nest and one boundary option, with their positions varied. Each selected option contributes one count. After six scenes, each direction is between zero and six and their sum is six. Counts compare your choices within this set; they are not percentages of kindness, reliability or social ability.",
          "zh": "每个场景各有一个照料、安顿、边界方向选项，位置会变化。选中一项即给相应方向加一次。六题后各项零至六次，总和为六。计数比较本题组内的选择，不是善意、可靠性或社交能力百分比。"
        },
        {
          "en": "Keeper=3, nest=3 and boundary=0 shows two full highest portraits; 2–2–2 shows all three. All seven highest sets are retained without a tie-break or random selection. Read lower-count guides too, then choose one small shared arrangement to discuss rather than assigning people permanent roles.",
          "zh": "照料3次、安顿3次、边界0次时，会显示两篇最高画像全文；2—2—2显示三篇。七种最高集合均可保留，不破同分、不随机选择。也可阅读低次数指南，再选一个小共同安排来商量，不必给人分配永久角色。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Does this test whether I am ready for a mountain trip?",
        "zh": "能测试我是否准备好进山吗？"
      },
      "answer": {
        "en": "No. Everyone has already arrived safely in the fictional premise. The six scenes concern ordinary shared-room arrangements, not navigation, weather, equipment, emergency response or real accommodation safety.",
        "zh": "不能。虚构前提是所有人已安全到达。六个场景只涉及普通共享房间安排，不考导航、天气、装备、应急或真实住宿安全。"
      }
    },
    {
      "question": {
        "en": "Can it tell whether two people should live together?",
        "zh": "能判断两个人适不适合共住吗？"
      },
      "answer": {
        "en": "No. It asks about one person’s fictional choices and never compares two real residents, their circumstances or a shared agreement. Use a portrait as a discussion prompt, not a compatibility verdict.",
        "zh": "不能。它只问一个人的虚构选择，没有比较两位真实住客、现实条件或共同约定。画像可作讨论提示，不是匹配判定。"
      }
    },
    {
      "question": {
        "en": "Does a shelf-keeper result make me responsible for the group?",
        "zh": "照料者结果意味着我要负责整组人吗？"
      },
      "answer": {
        "en": "No. A higher count does not assign a duty. Shared items and maintenance can be arranged jointly, including what each person can reasonably do. The guide explicitly includes that tradeoff.",
        "zh": "不意味着。高次数不分配义务，共用品和维护可以共同安排，包括各自合理承担什么。指南明确讨论了这项取舍。"
      }
    },
    {
      "question": {
        "en": "Why can several portraits appear?",
        "zh": "为什么会出现多篇画像？"
      },
      "answer": {
        "en": "Every highest count is retained. For example, 3–3–0 shows two and 2–2–2 shows three. No option-position rule or random draw removes a tie, and a lower count does not mean a missing skill.",
        "zh": "所有最高次数都保留。例如3—3—0显示两篇，2—2—2显示三篇。不按选项位置或随机抽取消除并列，次数低也不表示缺少技能。"
      }
    },
    {
      "question": {
        "en": "Do I need to register or complete an agreement screen?",
        "zh": "要注册或先完成同意页面吗？"
      },
      "answer": {
        "en": "No. Start opens the first scene directly. The six choices take about two minutes; all counts, highest portraits and public guides are free.",
        "zh": "不用。点击开始直接打开第一场景。六次选择约两分钟，全部计数、最高画像和公开指南免费。"
      }
    },
    {
      "question": {
        "en": "Can I change a choice or save my progress?",
        "zh": "可以改选或保存进度吗？"
      },
      "answer": {
        "en": "Back allows changes while answering. Retake quiz starts fresh after a result. Saving in the current tab is optional, lasts up to 24 hours and clears on completion or retake. No real cabin or housemate details are needed.",
        "zh": "作答中可用上一题改选，结果后重新测试从空选择开始。当前标签页保存可选，最多24小时，完成或重玩即清除。不需要真实小屋或室友资料。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.mcgill.ca/students/housing/files/students.housing/good_neighbor_guide.pdf",
      "label": {
        "en": "McGill — Good Neighbour Guide, Roommates section (printed p. 21)",
        "zh": "麦吉尔大学：《好邻居指南》室友章节（印刷页21）"
      }
    },
    {
      "url": "https://www.juridiqc.gouv.qc.ca/etre-locataire/maintenir-l-equilibre-au-quotidien/colocation-conseils-pratiques-pour-vivre-en-harmonie",
      "label": {
        "en": "JuridiQC — practical shared-living discussion topics (French)",
        "zh": "JuridiQC：共住实践讨论主题（法语）"
      }
    }
  ]
},
  "moon-market": {
  "label": {
    "en": "Original branching fiction · Three complete endings",
    "zh": "原创分支故事 · 三篇完整结局"
  },
  "instructions": {
    "en": "Enter a market that uses imaginary paper tokens. Choose one option in each scene and follow a route of two to four choices. There is no purchase, correct answer or random draw. Read your complete ending, or replay to explore another keepsake.",
    "zh": "走进只使用想象纸代币的集市。每个场景选择一项，沿两至四次选择组成的路线前进。不需要购买，没有标准答案或随机抽取。可以阅读本次完整结局，也可重玩探索另一件纪念物。"
  },
  "sections": [
    {
      "id": "premise",
      "title": {
        "en": "A moonlit visit, not a shopping or personality assessment",
        "zh": "月光下的一次到访，不是购物或人格评估"
      },
      "paragraphs": [
        {
          "en": "The entrance offers a borrowed constellation map or paper seeds that unfold into a sketch. You may settle on an early discovery, continue to the last crossing or ask the lantern to show three keepsakes. What you bring home is the ending of an authored adventure, not a prediction about spending habits or life choices.",
          "zh": "入口提供借阅星座图和展开成速写的纸种子。你可以在早期发现处收尾，走向最后路口，或请灯笼展示三种纪念物。带回家的东西是一段写好的冒险的结尾，不预测消费习惯或人生选择。"
        },
        {
          "en": "All tokens, stalls and tickets are fictional. The page takes no payment and makes no real booking. Its three themes are a manageable curiosity, an idea allowed to remain unfinished and a chosen end to the evening. Each has something to offer and something it leaves unresolved.",
          "zh": "代币、摊位和车票都属于虚构。页面不收费，也不办理真实预订。三种主题是范围适当的好奇、允许未完成的想法，以及主动为夜晚收尾。每种都有可取之处，也都保留尚未解决的部分。"
        }
      ]
    },
    {
      "id": "route",
      "title": {
        "en": "Ten routes through the map stall, seeds and last crossing",
        "zh": "星图摊、纸种子与最后路口的十条路线"
      },
      "paragraphs": [
        {
          "en": "Taking the map at its first offer reaches the star-map ending after two choices. Keeping the first garden sketch also ends after two. Continuing from either stall leads to the last crossing: a return ticket ends that route after three choices, while asking the lantern adds a fourth and final choice of keepsake.",
          "zh": "在星图摊直接接受借阅，两次选择后进入星图结局；带走第一张花园速写，也在两次后结束。从任一摊位继续都会来到最后路口：选返程票，在第三次选择后结束；请灯笼再展示，则增加第四次也是最后一次纪念物选择。"
        },
        {
          "en": "There are ten complete routes: two of length two, two of length three and six of length four. Three lead to stars, three to the garden and four to the ticket. These are counts of written routes, not random probabilities, popularity or a score for how thoroughly you explored. A short route is complete.",
          "zh": "共十条完整路线：两条两步、两条三步、六条四步。其中三条到星图、三条到花园、四条到车票。这是写好的路线数，不是随机概率、受欢迎程度或探索充分性的评分。短路线同样完整。"
        }
      ]
    },
    {
      "id": "stars",
      "title": {
        "en": "The borrowed star map: one question without owning the sky",
        "zh": "借来的星图：追一个问题，不必拥有天空"
      },
      "paragraphs": [
        {
          "en": "The star map gives curiosity a limited object and a return arrangement. In an original everyday comparison, choose one question to bring to a borrowed exhibition catalogue instead of first collecting every related resource. The point is a manageable encounter, not a rule that having fewer interests is better.",
          "zh": "星图给好奇一个有限对象，也有归还安排。一个原创日常对照是带着一个问题读借来的展览目录，而不是先收齐所有相关资源。重点是一次做得来的接触，不是规定兴趣越少越好。"
        },
        {
          "en": "The map can open more routes than one evening can contain. An unanswered question can remain interesting when the loan ends. This ending does not measure intelligence, intellectual curiosity as a trait or how well you would navigate a real night sky.",
          "zh": "地图可能打开比一个夜晚装得下的更多路线。借期结束，未回答的问题仍可有趣。这个结局不测智力、作为人格特质的求知欲，也不评实际辨认夜空或导航的能力。"
        }
      ]
    },
    {
      "id": "garden",
      "title": {
        "en": "The paper garden: possibility without a promise to finish",
        "zh": "纸花园：保留可能，不立完成承诺"
      },
      "paragraphs": [
        {
          "en": "The garden keeps the first drawn line and the blank space around it. An original creative example is saving a small design sketch with a note about what attracted you, without assigning every sketch a deadline. The ending is concerned with permission to explore an idea before deciding what it should become.",
          "zh": "花园保留第一条线，也保留周围空白。一个原创创作例子是留下小设计草图，记下吸引自己的地方，不给每张草图都安排期限。结局关心的是先探索，再决定想法应当长成什么。"
        },
        {
          "en": "Open possibilities can become obligations when each is treated as a commitment. Choosing one to revisit and releasing another is compatible with this ending. It does not establish creative talent, diagnose procrastination or excuse an unfinished responsibility already agreed with someone else.",
          "zh": "每个可能都被当成承诺时，开放也会变成义务。回来照顾其中一个、放下另一个，都与这个结局相容。它不证明创作天赋，不诊断拖延，也不为已经与别人约好的责任未完成作辩护。"
        }
      ]
    },
    {
      "id": "ticket",
      "title": {
        "en": "The ticket home: a chosen ending is part of the visit",
        "zh": "回程票：主动结束，也是到访的一部分"
      },
      "paragraphs": [
        {
          "en": "The ticket returns you to the ordinary evening outside the market. It is not a lesser prize for missing the imaginative stalls. An original everyday parallel is leaving a small gallery after one satisfying visit instead of adding another event solely because it is nearby.",
          "zh": "车票把你带回集市外的普通夜晚。它不是错过幻想摊位之后的次等奖。一个原创日常类比是满意地逛完小画廊后离开，不只因为旁边还有活动，就继续加上一场。"
        },
        {
          "en": "A stopping point can be chosen or automatic. The guide invites you to notice whether you wanted to finish this particular outing, rather than praising every return as wise. It cannot measure mindfulness, emotional maturity or whether you need more novelty in life.",
          "zh": "停止点既可能是主动选择，也可能是自动动作。指南邀请你观察是否想结束这次到访，不把每一次返回都赞为明智。它不测正念、情绪成熟度，也不判断生活里是否需要更多新鲜感。"
        }
      ]
    },
    {
      "id": "reading",
      "title": {
        "en": "Read alternative endings as narrative possibilities",
        "zh": "把不同结局读作叙事可能"
      },
      "paragraphs": [
        {
          "en": "Interactive fiction can branch and later rejoin, as Inklewriter’s authoring overview explains; the francophone interactive-fiction community also describes many forms of text-led play.[1][2] These references help locate the format. They neither supply this story’s plot nor validate a psychological meaning for its keepsakes.",
          "zh": "互动小说可以分支后再汇合，Inklewriter的创作说明介绍了这种形式；法语互动小说社区也讨论多种以文字为主的玩法。[1][2]这些参考帮助定位形式，不提供本故事情节，也不验证纪念物的心理含义。"
        },
        {
          "en": "One ending follows the selected route, with no accumulated points, ties or random draw. Read all three full guides, then replay while keeping an early choice and changing a later one. Compare what each ending resolves, not which one seems to describe a better person. Examples and experiments remain optional reflections.",
          "zh": "所选路线到达一篇结局，没有累计分、并列或随机抽取。可以先读三篇完整指南，再重玩时保留前面的选择、改变后面的决定。比较各结局解决什么，无需比较哪个更像一个更好的人。例子与小尝试均为可选思考。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "How many choices will I make?",
        "zh": "需要做几次选择？"
      },
      "answer": {
        "en": "Two to four, about two minutes. Five scene nodes form ten complete routes. You see only the nodes on your route, so reaching an ending early does not mean you skipped a required question.",
        "zh": "两至四次，约两分钟。五个场景节点组成十条完整路线，你只会看到本路线经过的节点。较早结束不表示漏做必答题。"
      }
    },
    {
      "question": {
        "en": "Can the two entrances reach the same ending?",
        "zh": "两个入口可以到同一个结局吗？"
      },
      "answer": {
        "en": "Yes. Continuing from either first stall reaches the shared last crossing, and the lantern can then offer all three keepsakes. Converging branches are intentional; the first choice does not permanently assign a type.",
        "zh": "可以。从任一摊位继续都会进入共同的最后路口，灯笼还能提供三种纪念物。分支汇合是有意设计，第一步不会永久分配类型。"
      }
    },
    {
      "question": {
        "en": "Do I spend real money or receive a real object?",
        "zh": "会花真实金钱或收到真实物品吗？"
      },
      "answer": {
        "en": "No. Paper tokens, maps, seeds and tickets exist only in the story. There is no checkout, prize draw or delivery. All choices and three complete ending guides are free.",
        "zh": "不会。纸代币、地图、种子和车票仅存在于故事，没有结账、抽奖或实物投递。全部选择与三篇完整结局指南免费。"
      }
    },
    {
      "question": {
        "en": "Is the longest route the best result?",
        "zh": "最长路线是最好结果吗？"
      },
      "answer": {
        "en": "No. Length reflects how the written branches connect. The two-choice map and garden routes are complete endings, as are the longer routes. The game does not rank imagination or thoroughness.",
        "zh": "不是。长度来自写好的分支如何连接。两步星图和花园路线都是完整结局，较长路线也一样。游戏不排名想象力或认真程度。"
      }
    },
    {
      "question": {
        "en": "Can I go back and choose another keepsake?",
        "zh": "可以返回改选纪念物吗？"
      },
      "answer": {
        "en": "Before finishing, Back lets you change a choice and replaces later branch choices. After an ending, Retake quiz begins again. You can also read every public guide without altering the route you played.",
        "zh": "完成前可用上一题改选，后续分支选择会重新确定。抵达结局后可重新测试。也可直接阅读每篇公开指南，不改变已走路线。"
      }
    },
    {
      "question": {
        "en": "Is there a registration or consent step before playing?",
        "zh": "开始前要注册或再勾选同意吗？"
      },
      "answer": {
        "en": "No. Start opens the first scene directly. Saving progress in the current tab is optional; it expires after 24 hours and clears when you complete or retake the story.",
        "zh": "不用。点击开始直接打开第一场景。当前标签页保存进度为可选，24小时后失效，完成或重玩即清除。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.inklestudios.com/inklewriter/",
      "label": {
        "en": "Inklewriter — branching and rejoining interactive tales",
        "zh": "Inklewriter：互动故事的分支与汇合"
      }
    },
    {
      "url": "https://www.fiction-interactive.fr/decouvrir/",
      "label": {
        "en": "Fiction-interactive.fr — forms of interactive fiction (French)",
        "zh": "Fiction-interactive.fr：互动小说的形式（法语）"
      }
    }
  ]
},
  "message-tone": {
  "label": {
    "en": "Original everyday scenarios · No mind-reading",
    "zh": "原创日常情境 · 不推断他人心情"
  },
  "instructions": {
    "en": "Respond to six invented, mildly ambiguous messages. Choose the next step you would prefer, rather than guessing a sender’s feelings. Complete all six for three raw counts and every highest-count portrait. No real chats, screenshots or private messages are needed.",
    "zh": "回应六个虚构、轻微含糊的消息场景。选择自己较想采取的下一步，不用猜发送者的心情。完成六题后查看三个原始计数和所有最高次数画像。不需要提供真实聊天、截图或私人消息。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "What would you do before deciding what a message means?",
        "zh": "决定消息含义之前，你会先做什么？"
      },
      "paragraphs": [
        {
          "en": "A brief reply, unfamiliar punctuation or a delay can leave an ordinary exchange open to interpretation. These six scenes ask about your own response: ask for a needed detail, return to relevant context or let uncertainty remain for a while. The other person is fictional; no answer uncovers their hidden mood.",
          "zh": "简短回复、不熟悉的标点或延迟，可能让普通交流留下解释空间。六个场景询问你自己的回应：问清必要细节、回到相关情境，或让不确定暂时保留。对方是虚构人物，没有哪个答案能揭示其隐藏心情。"
        },
        {
          "en": "The scenes include a casual plan, punctuation, timing, a delayed reply, your own unclear message and what would make an exchange clearer. They concern mild everyday uncertainty. A single response can be useful in one scene and excessive in another, so none is designated a universally best communication style.",
          "zh": "场景涉及普通计划、标点、时间、延迟回复、自己写得不清楚的消息，以及怎样才算交流清楚。讨论的是日常轻微不确定。同一种回应可能在一个场景有用，在另一个场景过头，因此没有被指定为普遍最佳的沟通风格。"
        }
      ]
    },
    {
      "id": "ask",
      "title": {
        "en": "Ask for the detail that changes the next step",
        "zh": "普通问句：问会改变下一步的细节"
      },
      "paragraphs": [
        {
          "en": "The Plain-Question Clarifier makes an uncertainty answerable. In an original example, a friend replies briefly after a meeting place changes. Asking whether the north entrance still works requests a practical detail. Asking why the reply sounds cold would first assume a tone that the message has not established.",
          "zh": "普通问句澄清者让不确定变得可回答。一个原创例子是见面地点变化后，朋友简短回复。问北门是否仍然合适，是请求实际细节；问为什么语气冷淡，则先假定了消息尚未证明的语气。"
        },
        {
          "en": "Repeated requests for reassurance can turn a small plan into an examination. Before following up, identify what information is still missing and whether your next action depends on it. The ask count does not measure assertiveness, emotional intelligence or how accurately you understand a sender.",
          "zh": "反复要求确认，也可能把小计划变成一场盘问。跟进前可先辨认还缺什么信息，下一步行动是否真的依赖它。询问次数不测坚定表达、情商，或理解发送者的准确程度。"
        }
      ]
    },
    {
      "id": "context",
      "title": {
        "en": "Check the relevant exchange, not an unlimited history",
        "zh": "相关情境：核对当前交流，不翻无限历史"
      },
      "paragraphs": [
        {
          "en": "The Relevant-Context Checker reconnects a reply with the question it answered. An original example is checking the previous date agreement before treating “yes” as agreement to a different day. Known schedules may suggest possibilities, but they cannot confirm why someone has not replied.",
          "zh": "相关情境核对者把回复与它回答的问题重新连起来。一个原创例子是把“可以”理解为换一天之前，先核对前面的日期约定。已知日程可以提供可能解释，却不能确认别人为什么没回复。"
        },
        {
          "en": "Stop when the practical issue is already clear. Searching months of messages for evidence of one imagined feeling adds material without necessarily answering the current question. A context portrait is not a licence to inspect another person’s private accounts or monitor their activity.",
          "zh": "实际问题已经清楚时，可以停止核对。为某种想象感受翻数月聊天，可能只是增加材料，没有回答当前问题。情境画像不授权查看别人的私人账户或监控其活动。"
        }
      ]
    },
    {
      "id": "pause",
      "title": {
        "en": "Pause without turning uncertainty into a conclusion",
        "zh": "暂不编故事：保留未知，不替它下结论"
      },
      "paragraphs": [
        {
          "en": "The Unwritten-Story Pauser leaves an ambiguous reply unexplained when no immediate decision depends on it. An original example is putting the phone aside until an already agreed check-in time instead of drafting several accounts of what a missing full stop must mean. Not knowing is different from deciding that everything is fine.",
          "zh": "先不编故事的停顿者，在没有即时决定依赖时，让含糊回复暂时没有解释。一个原创例子是在已约定的查看时间之前放下手机，不为少了一个句号编出多套必然含义。不知道，与断定一切都没问题，是两回事。"
        },
        {
          "en": "A practical deadline changes the situation. If a booking or departure needs confirmation, state that need clearly rather than treating silence as agreement. The pause portrait does not recommend ignoring an explicit refusal, threat or urgent responsibility; those matters fall outside these mild scenes.",
          "zh": "实际截止时间会改变情况。预订或出发需要确认时，可以说清这一需要，不把沉默当成同意。停顿画像不建议忽视明确拒绝、威胁或紧急责任；这些事情超出了本题的轻微情境。"
        }
      ]
    },
    {
      "id": "evidence",
      "title": {
        "en": "Research on missing cues is background, not a test validation",
        "zh": "线索缺失研究是背景，不是本问卷的效度验证"
      },
      "paragraphs": [
        {
          "en": "Kruger and colleagues’ 2005 paper reports five email experiments concerning confidence in communicating tone; its abstract describes overestimating how effectively an intended tone is conveyed without vocal and other cues.[1] This supports caution about assuming that your own reading is shared. It does not establish what any particular short message means.",
          "zh": "Kruger等人2005年的论文报告了五项关于邮件语气沟通信心的实验，摘要指出，缺少语音等线索时，人们可能高估自己传达预期语气的效果。[1]它支持对“自己的理解也必然被对方共享”保持谨慎，不确定某条短消息具体是什么意思。"
        },
        {
          "en": "Email experiments are not validation of this six-scene quiz, present-day messaging in every language or a diagnostic rule for punctuation. A Canadian plain-language resource separately recommends defining the reader and purpose and giving relevant context.[2] Here that is a writing comparison, not evidence for a psychological score or a guaranteed outcome.",
          "zh": "邮件实验不验证本六场景问卷，不覆盖每种语言的当代聊天，也不是诊断标点含义的规则。加拿大清晰写作资料另提出明确读者与目的、提供相关情境。[2]这里把它作为写作对照，不作为心理分数或保证沟通效果的依据。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "How the three counts and ties are produced",
        "zh": "三个计数与并列怎样产生"
      },
      "paragraphs": [
        {
          "en": "Each scene has one ask, one context and one pause option. Selecting an option adds one to that direction, so each ranges from zero to six and all three sum to six after completion. Positions vary across scenes. The counts describe relative choices within this set, not accuracy, symptom severity or a ranking against other people.",
          "zh": "每个场景各有一个询问、情境、停顿方向选项，选中即给该方向加一次。各项范围零至六，完成后总和为六；选项位置随场景变化。计数描述本题组内的相对选择，不是准确率、症状严重程度或人群排名。"
        },
        {
          "en": "Ask=3, context=3 and pause=0 retains both highest portraits. Two choices for each retains all three. All seven possible highest sets are allowed; no random choice or option-order tie-break is used. Read lower-count guides too: a lower count does not establish that a response is absent from your real life.",
          "zh": "询问3次、情境3次、停顿0次时，两篇最高画像都会保留；各2次时保留三篇。七种可能的最高集合均可出现，不随机抽取，也不按选项顺序破同分。也可读低次数指南：次数低不证明现实生活里没有这种回应。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "A small, optional comparison in an ordinary exchange",
        "zh": "在普通交流里做一次可选小比较"
      },
      "paragraphs": [
        {
          "en": "Separate three things: the words actually visible, an interpretation you are adding and the detail needed for the plan. If the last detail is missing, ask; if it is in the last agreement, check; if nothing needs deciding yet, a pause may suffice. This is an original way to compare the story’s portraits, not a clinically tested protocol.",
          "zh": "可以分开三件事：实际看见的文字、自己补上的解释、计划所需的细节。最后一项缺失时可问，在上一约定里时可核对，暂时没有事要决定时可停顿。这是对照故事画像的一种原创方法，不是经过临床验证的操作方案。"
        },
        {
          "en": "The full guides retain examples, benefits, tradeoffs and optional experiments. Notice what fits and what does not in a specific exchange. No private chat is analysed or sent to a recipient by this page. Replaying explores alternative choices; it cannot reveal a relationship’s true status or change the evidence available about another person.",
          "zh": "完整指南保留例子、用处、取舍和可选尝试。可以结合一次具体交流，核对哪些符合、哪些不符合。页面不分析私人聊天，也不向收信人发送消息。重玩探索不同选择，不能揭示关系的真实状态，也不改变有关他人的现有证据。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Does a period or delayed reply prove someone is upset?",
        "zh": "句号或回复延迟证明对方不高兴吗？"
      },
      "answer": {
        "en": "No. The quiz provides no evidence about a real sender. Punctuation or timing alone does not establish the reason for a message. The scenes ask how you would respond to uncertainty, not how to decode hidden feelings.",
        "zh": "不能。本问卷没有真实发送者的证据。仅凭标点或时间不能确定消息的原因。场景问的是怎样回应不确定，不是怎样解码隐藏感受。"
      }
    },
    {
      "question": {
        "en": "Is this an anxiety, attachment or EQ assessment?",
        "zh": "这是焦虑、依恋或情商评估吗？"
      },
      "answer": {
        "en": "No. It is an original recreational comparison of six fictional choices, without diagnostic thresholds or validated anxiety, attachment or EQ scales. A portrait should not be used to label yourself or another person.",
        "zh": "不是。这是六个虚构选择的原创趣味对照，没有诊断阈值，也没有经过验证的焦虑、依恋或情商量表。不宜用画像给自己或别人判型。"
      }
    },
    {
      "question": {
        "en": "Which response is best?",
        "zh": "哪种回应最好？"
      },
      "answer": {
        "en": "There is no universal winner. Asking can request a missing fact, context may already contain it, and a pause may suit a non-urgent exchange. Each full guide explains both a possible use and a tradeoff.",
        "zh": "没有普遍赢家。询问可以请求缺少的事实，上下文可能已有答案，非紧急交流也可能适合暂时停顿。每篇完整指南都讨论可能的用处与取舍。"
      }
    },
    {
      "question": {
        "en": "Why can several portraits appear?",
        "zh": "为什么出现多篇画像？"
      },
      "answer": {
        "en": "The page retains every direction with the same highest count. For example, 3–3–0 produces two and 2–2–2 produces three. A tie is a complete result, not an error or a reason to invent a tie-break.",
        "zh": "同为最高次数的方向全部保留。例如3—3—0产生两篇，2—2—2产生三篇。并列是完整结果，不是错误，也不需要虚构破同分规则。"
      }
    },
    {
      "question": {
        "en": "Do I need to upload my conversations?",
        "zh": "需要上传聊天记录吗？"
      },
      "answer": {
        "en": "No. The quiz uses only its invented scenes and your selected options. It does not need screenshots, contacts or a real message. Start opens the first scene directly and all three complete guides are free.",
        "zh": "不用。问卷只使用虚构场景和你选中的选项，不需要截图、联系人或真实消息。点击开始直接进入第一场景，三篇完整指南均免费。"
      }
    },
    {
      "question": {
        "en": "Can I change answers or replay?",
        "zh": "可以改答案或重玩吗？"
      },
      "answer": {
        "en": "Use Back during the six scenes. After completion, Retake quiz starts again with no choices selected. Optional saving is limited to the current tab, expires after 24 hours and clears on completion or retake.",
        "zh": "六个场景作答中可用上一题改选。完成后重新测试会从未选状态开始。可选保存仅限当前标签页，24小时后失效，完成或重玩即清除。"
      }
    }
  ],
  "references": [
    {
      "url": "https://web-docs.stern.nyu.edu/pa/kruger_email_ego.pdf",
      "label": {
        "en": "Kruger et al. (2005) — Egocentrism Over E-Mail, original paper",
        "zh": "Kruger等（2005）：邮件语气沟通研究原文"
      }
    },
    {
      "url": "https://nos-langues.canada.ca/fr/cles-de-la-redaction/communication-claire-survol-du-processus-et-des-techniques",
      "label": {
        "en": "Language Portal of Canada — plain communication process and techniques (French)",
        "zh": "加拿大语言门户：清晰沟通的过程与技巧（法语）"
      }
    }
  ]
},
  "magic-shopkeeper": {
  "label": {
    "en": "Original fantasy choices · All highest portraits retained",
    "zh": "原创幻想选择 · 保留全部最高并列"
  },
  "instructions": {
    "en": "Imagine a shop of harmless invented objects. In six scenes, select the welcome or explanation you would most like to offer. There is no sales target, correct answer or practical demonstration to perform. Complete all six to see the counts and every highest-count portrait in full.",
    "zh": "想象经营一家只有无害虚构物品的小店。在六个场景里，选择自己较想提供的欢迎或说明方式。没有销售目标、标准答案，也不需要真的演示物品。完成六题后可查看计数及所有最高次数画像全文。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "A magic shop about explanation, access and discovery",
        "zh": "魔法小店：说明、接触与发现"
      },
      "paragraphs": [
        {
          "en": "The six scenes concern a yesterday jar, a sunshine umbrella, an unclear instruction card, a returned item, a display and closing time. They ask which response you prefer within an invented shop. There is no inventory to optimise, price to set or customer satisfaction score to earn.",
          "zh": "六个场景围绕昨日瓶、阳光伞、含糊的说明卡、退回的物品、陈列和打烊展开，询问在想象小店里更想采用哪种回应。这里没有需要优化的库存、待定售价或要争取的客户满意度分。"
        },
        {
          "en": "The portraits give three ways of approaching the unfamiliar: make a promise understandable, arrange temporary access or begin with a small experience. Real activities may combine all three. Choosing one in a scene does not establish that you cannot explain, lend or demonstrate in another setting.",
          "zh": "三篇画像提供了接近陌生事物的三种方式：让承诺容易理解、安排暂时接触、以小体验开场。现实活动可以兼用三者。在某个场景选一种，不证明换个情境就不会说明、借用或演示。"
        }
      ]
    },
    {
      "id": "labels",
      "title": {
        "en": "Honest labels: a useful promise with a visible limit",
        "zh": "诚实标签：有用的承诺，也有看得见的边界"
      },
      "paragraphs": [
        {
          "en": "The Keeper of Honest Labels makes an object’s scope clear before the visitor builds expectations around it. For an original everyday analogy, imagine showing a handmade card stand: it holds a light card upright on a flat desk, not a heavy book. One concrete use and one limit are more informative than an oversized promise.",
          "zh": "诚实标签的守护者先说清物品范围，再让访客建立预期。一个原创日常类比是介绍自制卡片架：它能在平整桌面撑起轻卡片，不是用来承托厚书。一项具体用途和一个边界，比过大的承诺更有信息。"
        },
        {
          "en": "The tradeoff is attention. A long explanation may obscure the simple experience someone wanted. Start with the point relevant to their question, and let them request more. A high label count does not verify accuracy, honesty as a personality trait or professional competence.",
          "zh": "取舍在于注意力。长篇解释也可能盖住对方本来想要的简单体验。可以先回答与问题有关的一点，让对方决定是否继续问。标签方向次数高，不验证说明准确性、诚实人格或专业胜任。"
        }
      ]
    },
    {
      "id": "loans",
      "title": {
        "en": "Traveling wonder: access also needs a way home",
        "zh": "流动奇迹：可以接触，也有回来的方式"
      },
      "paragraphs": [
        {
          "en": "The Traveling-Wonder Librarian imagines temporary access rather than permanent ownership. The source scenes include a return time, a supervised borrowing collection and notes from earlier borrowers. These details make the shared object’s journey concrete instead of treating generosity as an unlimited supply.",
          "zh": "流动奇迹的借阅员想象的是暂时接触，不必永久拥有。原场景涉及归还时间、有人陪同说明的借用区，以及之前借用者的小记。这些细节让共用物品的旅程具体，而不是把慷慨当作无限供应。"
        },
        {
          "en": "Real object libraries also organise access and return. Library of Things describes reservation, collection and return; La Manivelle describes a catalogue and a team handling welcome, maintenance, logistics and advice.[1][2] These are practical parallels, not evidence that this portrait measures generosity or that you should lend any particular item.",
          "zh": "现实物品图书馆也需要安排取得与归还。Library of Things介绍预约、领取和归还；La Manivelle介绍物品目录，以及负责接待、维护、物流和建议的团队。[1][2]这些是实践上的对照，不证明画像测量了慷慨程度，也不要求你借出某件东西。"
        }
      ]
    },
    {
      "id": "demonstration",
      "title": {
        "en": "A small wonder: show an example without overselling it",
        "zh": "小奇迹演示：展示例子，不把效果说大"
      },
      "paragraphs": [
        {
          "en": "The Small-Wonder Demonstrator begins with something a visitor can notice and ask about. In an original hobby example, show a single paper mechanism opening and closing before explaining the larger design. The example gives the conversation a shared reference; it does not prove the whole design will work in every condition.",
          "zh": "小奇迹的演示者先给访客一个能注意到、能提问的东西。一个原创爱好例子是先展示一个纸机关开合，再说明整体设计。例子为对话提供共同参照，不证明整套设计在所有条件下都能奏效。"
        },
        {
          "en": "A pleasing demonstration can conceal a mismatch between the visitor’s needs and the object. Invite questions, name the limits and leave room to decline. The fiction assumes harmless imaginary objects; it is not a procedure for testing an unknown real substance, device or safety-critical product.",
          "zh": "好看的演示可能掩盖物品与访客需求不符的问题。可以邀请提问、说明边界，并留出不选择的空间。故事前提是无害的想象物品，不是试验未知真实物质、设备或安全关键产品的操作流程。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six selections, three counts and every highest tie",
        "zh": "六次选择、三个计数与全部最高并列"
      },
      "paragraphs": [
        {
          "en": "Each scene offers one option for each of label, loan and wonder. Your selected option adds one to its direction. Each count ranges from zero to six and the three always sum to six after completion. Option positions vary across scenes, so selecting the first option repeatedly does not select one direction throughout.",
          "zh": "每个场景各有一个标签、借用、演示方向的选项。选中的方向加一次，每项范围为零至六，完成后总和恒为六。选项位置会随场景变化，因此一直选第一项，并不代表一直选择同一个方向。"
        },
        {
          "en": "For example, label=3, loan=3 and wonder=0 displays both highest portraits in full. Two for each displays all three. A low count is a relative result within this small set, not a missing skill. There are seven possible highest sets, not seven independently measured personality types or population percentiles.",
          "zh": "例如标签3次、借用3次、演示0次，会完整显示前两篇最高画像；各2次则显示三篇。低次数只是本小题组内相对较少的选择，不表示缺少技能。共有七种可能的最高集合，不是七种独立测得的人格类型，也不是人群百分位。"
        }
      ]
    },
    {
      "id": "comparison",
      "title": {
        "en": "Read the portraits together, then try one small comparison",
        "zh": "把画像放在一起读，再做一个小比较"
      },
      "paragraphs": [
        {
          "en": "Choose one ordinary hobby object you already understand. Describe one useful feature and a limit; consider whether a short loan would suit both people; offer a small example only if the other person wants one. This combines the portraits into a conversation rather than assigning everyone a fixed shop role.",
          "zh": "选一件自己已经了解的普通爱好物品，说清一个用途和一个边界；考虑短期借用是否适合双方；只有对方愿意时再给一个小演示。这是把画像组合成对话，不是给每个人分配固定店主岗位。"
        },
        {
          "en": "Read the full benefit and tradeoff in each guide, including portraits below your highest count. Repeat the quiz to explore another imagined shop, rather than to obtain a more desirable label. The page neither operates a real shop nor provides a business forecast, consumer-law assessment or psychological diagnosis.",
          "zh": "可以阅读每篇指南完整的用处与取舍，也包括没有获得最高次数的画像。重玩适合探索另一家想象小店，无需追求更讨喜的标签。页面不经营真实商店，不提供商业预测、消费法律评估或心理诊断。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Is this a shop simulation or a personality test?",
        "zh": "这是经营模拟还是人格测试？"
      },
      "answer": {
        "en": "It is a six-scene recreational quiz about an original imaginary shop. Unlike a management simulation, it has no money, stock or trading system. Its portraits describe choices in the story, not a validated personality trait.",
        "zh": "这是围绕原创想象小店的六场景趣味问卷。它没有经营模拟里的资金、库存或交易系统，画像描述故事选择，不是经过验证的人格特质。"
      }
    },
    {
      "question": {
        "en": "How long does it take and what is free?",
        "zh": "需要多久，哪些内容免费？"
      },
      "answer": {
        "en": "About two minutes for six choices. All questions, three raw counts, all highest portraits and the three full public guides are free. Start opens the first scene directly without another agreement step.",
        "zh": "六次选择约两分钟。全部题目、三个原始计数、所有最高画像和三篇完整公开指南免费。点击开始直接进入第一场景，不增加一次同意步骤。"
      }
    },
    {
      "question": {
        "en": "Why do I have two or three results?",
        "zh": "为什么有两个或三个结果？"
      },
      "answer": {
        "en": "Every direction sharing the maximum count is retained. For example, 3–3–0 keeps two portraits and 2–2–2 keeps all three. The page does not randomly choose one or use option order to break a tie.",
        "zh": "与最高次数相同的方向全部保留。例如3—3—0保留两篇，2—2—2保留三篇。页面不会随机抽一篇，也不按选项顺序破同分。"
      }
    },
    {
      "question": {
        "en": "Does a label result prove that my explanations are correct?",
        "zh": "标签结果能证明我的说明正确吗？"
      },
      "answer": {
        "en": "No. It records which fictional options you chose. Correct explanations require checking the real object and the information being shared; this quiz does not observe or test that work.",
        "zh": "不能。它记录你选了哪些虚构选项。真实说明是否正确，需要核查实际物品和信息；本问卷没有观察或检验这项工作。"
      }
    },
    {
      "question": {
        "en": "Do I need to buy, lend or demonstrate anything?",
        "zh": "需要购买、借出或实际演示什么吗？"
      },
      "answer": {
        "en": "No. The jar and umbrella are imaginary. Optional everyday examples are invitations to reflect, not tasks required for a result. You may decline a real loan or demonstration without contradicting a portrait.",
        "zh": "不用。瓶子和伞都属于想象。日常例子是可选的思考邀请，不是获得结果必须完成的任务。你可以拒绝真实借用或演示，无需担心与画像矛盾。"
      }
    },
    {
      "question": {
        "en": "Can I edit a choice, replay or save progress?",
        "zh": "可以改选、重玩或保存进度吗？"
      },
      "answer": {
        "en": "Use Back while answering, or Retake quiz after finishing. Progress saving in the current tab is optional, expires after 24 hours and clears on completion or retake. No shop account or payment is required.",
        "zh": "作答时可用上一题改选，完成后可重新测试。本标签页保存进度为可选功能，24小时后失效，完成或重玩即清除。不需要店铺账户或付款。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.libraryofthings.co.uk/how-borrowing-works",
      "label": {
        "en": "Library of Things — reservation, collection and return",
        "zh": "Library of Things：预约、领取与归还"
      }
    },
    {
      "url": "https://manivelle.ch/la-bibliotheque-dobjets/",
      "label": {
        "en": "La Manivelle — an object library and its practical work (French)",
        "zh": "La Manivelle：物品图书馆与实际工作（法语）"
      }
    }
  ]
},
  "lost-letter-adventure": {
  "label": {
    "en": "Original branching fiction · Three complete endings",
    "zh": "原创分支故事 · 三篇完整结局"
  },
  "instructions": {
    "en": "Take a letter through a floating post office. Choose one response at each scene; your route ends after two or three choices. No correct answer or agreement screen is required. Read the complete ending, go back before finishing, or replay to follow another route.",
    "zh": "带着一封信走进漂浮邮局，每个场景选择一种回应，两至三次选择后抵达结局。没有标准答案，也不用再勾选同意。可以阅读完整结局、在完成前返回改选，或重玩另一条路线。"
  },
  "sections": [
    {
      "id": "premise",
      "title": {
        "en": "A lost letter without a named recipient",
        "zh": "没有具名收信人的失落信件"
      },
      "paragraphs": [
        {
          "en": "The address names a place that needs these words, rather than a person. Your first decision takes the letter to a town square or a quiet station. Later decisions concern an invitation, an address check or waiting. You are choosing how this fictional delivery unfolds, not guessing a hidden correct recipient.",
          "zh": "收件地址写的是需要这些话的地方，而不是某个人。第一步将信带到小镇广场或安静车站，后续围绕邀请、地址核对和等待展开。你决定的是这次虚构投递怎样发生，不是猜出藏起来的正确收信人。"
        },
        {
          "en": "A short route is a complete route. Arriving at an ending after two decisions does not mean that you missed a required scene or performed worse. The three endings explore a dependable destination, a recipient-led invitation and a deliberate pause; none is a personality diagnosis or a moral award.",
          "zh": "较短的路线也是完整路线。两次选择就抵达结局，不表示漏做必经场景或表现较差。三篇结局分别探索可靠落点、让收信人决定的邀请、有安排的暂停；它们不提供人格诊断或道德奖励。"
        }
      ]
    },
    {
      "id": "routes",
      "title": {
        "en": "How the two starting places lead to eight routes",
        "zh": "两个起点如何通向八条路线"
      },
      "paragraphs": [
        {
          "en": "At the square, returning with possible addresses reaches the lantern ending directly. Asking for an invitation instead takes you back to the post office for a final delivery choice. At the station, sitting to listen reaches the patient-shelf ending; asking the keeper for an invitation also leads to the final post-office scene.",
          "zh": "在广场，带着可能的地址回去核对，会直接进入灯笼结局；请邮局发出邀请，则回到邮局做最后一次投递选择。在车站，坐下听广播会进入耐心书架结局；请站长放公开邀请，也会进入最后的邮局场景。"
        },
        {
          "en": "The shared final scene offers lantern delivery, an open invitation or the patient shelf. Altogether there are eight complete routes: two have two choices and six have three. Three routes end at the lantern, two at the invitation and three at the shelf. These are counts of authored paths, not outcome probabilities or visitor statistics.",
          "zh": "共同的最后场景提供灯笼投递、开放邀请、耐心书架。全故事共有八条完整路线：两条需要两次选择，六条需要三次。三条到灯笼、两条到邀请、三条到书架。这是写好的路线数量，不是结局概率或访客统计。"
        }
      ]
    },
    {
      "id": "lantern",
      "title": {
        "en": "The lantern: make the next step findable",
        "zh": "接待处的一盏灯：让下一步找得到"
      },
      "paragraphs": [
        {
          "en": "The lantern ending gives the message a checked place to land. Its emphasis is practical availability: someone can arrive and ask for the letter. It does not claim that the person is ready to read it, or that a well-organised delivery guarantees a connection.",
          "zh": "灯笼结局给信件一个核对过的落点，侧重实际可取得：后来的人能够到达并询问信件。它不代表对方已准备好阅读，也不承诺安排周全就能建立连接。"
        },
        {
          "en": "An original everyday analogy is leaving a clearly labelled meeting handout in an agreed shared place. Someone can use it without being required to thank the organiser publicly. Compare that limited usefulness with the unresolved question of whether the intended person will ever look there. The analogy explains the scene; it does not describe your enduring character.",
          "zh": "一个原创日常类比是把标注清楚的会议资料放到约定的共享位置，别人可以取用，无需公开向组织者致谢。可以同时看到它有限的用处，以及目标读者是否会去查看这一未决问题。类比帮助理解场景，不描述你的持久人格。"
        }
      ]
    },
    {
      "id": "invitation",
      "title": {
        "en": "The invitation: leave a genuine choice",
        "zh": "两边都能推开的门：保留真实选择"
      },
      "paragraphs": [
        {
          "en": "The invitation ending does not assign someone a need. The recipient may propose a meeting, reply later or leave the envelope unopened. What makes this ending distinctive is the other person’s opportunity to shape the next step, rather than the size or warmth of the sender’s gesture.",
          "zh": "邀请结局没有替别人指定需要。收信人可以提出相见安排、晚些回复，或暂不拆开信。这个结局的特点在于让对方参与决定下一步，而不是寄信人的动作有多大、多热情。"
        },
        {
          "en": "In an optional everyday comparison, ask whether a friend would like a short call and offer an easy way to decline. A refusal or no reply does not turn the invitation into a failed test. This story cannot tell you what another person feels, whether a relationship is secure or what response you are owed.",
          "zh": "一个可选的日常对照是问朋友愿不愿意简短通话，同时留出轻松拒绝的方式。拒绝或没有回复，不会把邀请变成一场失败的测试。故事无法说明别人的感受、关系是否安全，或你应当得到什么回应。"
        }
      ]
    },
    {
      "id": "shelf",
      "title": {
        "en": "The patient shelf: a pause with a return point",
        "zh": "耐心书架：有返回节点的暂停"
      },
      "paragraphs": [
        {
          "en": "The shelf ending includes a dry place, a date tag and an agreement to check the address later. Its pause is an arrangement, not simply the absence of action. Waiting preserves the letter while leaving its destination unresolved. It is not automatically wiser than sending an invitation or making a practical delivery.",
          "zh": "书架结局包含干燥的位置、日期标签和稍后核对地址的约定。这里的暂停是一项安排，不只是没有行动。等待保存了信件，也保留了目的地尚未明确的状态；它不自动比发出邀请或实际投递更明智。"
        },
        {
          "en": "For an ordinary, non-urgent matter, a useful analogy is agreeing when to return to an unfinished discussion. A return point makes the pause observable; it does not guarantee that the discussion will become easy. Do not use a fictional shelf ending to justify delaying an urgent responsibility or to label yourself avoidant.",
          "zh": "对一件普通、非紧急的事情，可以类比为约定何时回来继续未完成的讨论。返回节点让暂停可以被核对，不保证后续讨论变容易。不要用虚构书架结局为延误紧急责任辩护，也不必由此给自己贴回避标签。"
        }
      ]
    },
    {
      "id": "reading",
      "title": {
        "en": "Read a route as fiction, not as a psychological score",
        "zh": "按叙事路线阅读，不把结局当心理分数"
      },
      "paragraphs": [
        {
          "en": "Interactive fiction lets a reader’s choices alter the route through written scenes; branches can also rejoin a shared scene. Inklewriter describes both branching and linking paths together, and the francophone interactive-fiction community describes a broad family of text-led games.[1][2] These references explain the form, not the psychological validity of this story.",
          "zh": "互动小说让读者的选择改变经过哪些写好的场景，不同分支也可以汇入同一场景。Inklewriter介绍了分支及重新连接路线的形式，法语互动小说社区则把它放在以文字为主的游戏家族中讨论。[1][2]这些参考说明叙事形式，不验证本故事的心理测量效度。"
        },
        {
          "en": "Here the last selected service, or an earlier direct ending, determines the result. There is no accumulated lantern score, tie-break, random draw or comparison with a population. Reading every public ending before playing does not change this rule. Replaying can reveal an alternative narrative without proving that your personality has changed.",
          "zh": "本故事由最后选定的投递服务，或较早的直接终点，决定结局。没有灯笼累计分、破同分、随机抽取或人群比较。先读完所有公开结局也不改变规则。重玩可以看到不同叙事，不证明人格发生变化。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Replay, compare and keep the experiment optional",
        "zh": "重玩与比较，让尝试保持可选"
      },
      "paragraphs": [
        {
          "en": "For a focused replay, keep the first stop the same and change the final service. Notice what the new ending resolves and what it leaves open. For example, a checked location answers where a letter can wait, while an invitation leaves a decision with its recipient. Neither resolves every uncertainty in the other ending.",
          "zh": "想做一次聚焦重玩，可以保留第一个地点，只改变最后的服务。观察新结局解决了什么、还留下什么。例如核对过的地点回答信可以在哪里等候，邀请则把决定留给收信人；两者都无法解决另一结局里的所有不确定。"
        },
        {
          "en": "The complete guides retain a summary, an everyday example, a possible benefit, a tradeoff and an optional experiment. Their ordinary-life parallels are prompts to consider, not prescriptions. This page does not accept an address, read a real letter, contact a recipient or deliver a message.",
          "zh": "完整指南保留概述、日常例子、可能的用处、取舍和可选尝试。日常类比用于思考，不是行为处方。页面不接收地址、不读取真实信件、不联系收信人，也不代为投递消息。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "How many choices and endings are there?",
        "zh": "需要选几次，有几种结局？"
      },
      "answer": {
        "en": "A route takes two or three choices, about two minutes. Four written scene nodes form eight complete routes leading to three endings. You see only the scenes reached by your choices.",
        "zh": "每条路线需要两至三次选择，约两分钟。四个写好的场景节点组成八条完整路线，抵达三种结局。页面只展示本次选择经过的场景。"
      }
    },
    {
      "question": {
        "en": "Why can different routes reach the same ending?",
        "zh": "为什么不同路线会到同一个结局？"
      },
      "answer": {
        "en": "The square and station can both lead to the final post-office scene. The chosen service then determines the ending. The lantern and shelf also have direct routes. A shared ending is intentional narrative convergence, not evidence of identical personalities.",
        "zh": "广场和车站都可能进入最后的邮局场景，再由所选服务决定结局。灯笼和书架另有直接路线。共同结局是有意设计的叙事汇合，不证明不同玩家人格相同。"
      }
    },
    {
      "question": {
        "en": "Is there a best ending or a hidden score?",
        "zh": "有最佳结局或隐藏分数吗？"
      },
      "answer": {
        "en": "No. The three endings make different arrangements for the letter. Each has a use and a tradeoff. This version has no correctness score, personality scale or random ending.",
        "zh": "没有。三篇结局为信件作出不同安排，各有用处与取舍。本版本没有正确率分、人格量尺或随机结局。"
      }
    },
    {
      "question": {
        "en": "Can I change a choice or start again?",
        "zh": "可以改选或重新开始吗？"
      },
      "answer": {
        "en": "Before finishing, use Back to revisit a scene; a changed branch replaces the later route. After the ending, Retake quiz starts a fresh story. All three complete guides are also freely readable.",
        "zh": "完成前可用上一题返回场景；更换分支后，后续路线会重新确定。抵达结局后，重新测试会开启新故事；三篇完整指南也都可免费直接阅读。"
      }
    },
    {
      "question": {
        "en": "Do I need to register, agree again or enter a real letter?",
        "zh": "要注册、再次同意或输入真实信件吗？"
      },
      "answer": {
        "en": "No. Start opens the first scene directly. The story needs only the displayed choices, not a recipient, postal address or message. Optional progress saving in the current tab is separate from starting.",
        "zh": "不用。点击开始直接打开第一个场景。故事只需要选择显示的选项，不需要收信人、邮寄地址或信件正文。本标签页临时保存进度是独立的可选功能。"
      }
    },
    {
      "question": {
        "en": "Can the ending measure my empathy or attachment style?",
        "zh": "结局可以测量共情或依恋风格吗？"
      },
      "answer": {
        "en": "No. There is no validated empathy or attachment scale here. An ending follows a fictional route and can support a conversation about the story; it cannot diagnose a person or infer another person’s feelings.",
        "zh": "不能。这里没有经过验证的共情或依恋量表。结局来自虚构路线，可用于讨论故事，不诊断个人，也不推断他人的感受。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.inklestudios.com/inklewriter/",
      "label": {
        "en": "Inklewriter — branching stories and linked paths",
        "zh": "Inklewriter：分支故事与路线汇合"
      }
    },
    {
      "url": "https://www.fiction-interactive.fr/decouvrir/",
      "label": {
        "en": "Fiction-interactive.fr — an introduction to interactive fiction (French)",
        "zh": "Fiction-interactive.fr：互动小说形式介绍（法语）"
      }
    }
  ]
},
  "lost-key-search": {
  "label": {
    "en": "Original everyday search scenes · Complete portraits free",
    "zh": "原创日常找物情境 · 完整画像免费"
  },
  "instructions": {
    "en": "Imagine an ordinary object temporarily misplaced at home, without an emergency or security issue. Choose what you would try in six scenes. No object is hidden on the page, no search is timed, and the result is not a memory or attention score.",
    "zh": "想象家里一件普通物品暂时找不到，没有紧急情况或安全问题。六个场景里选择较想尝试的步骤。页面不藏物品、不计找寻时间，结果也不是记忆或注意力分数。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "Missing keys: compare a first approach, not a search performance",
        "zh": "钥匙暂时找不到：比较起步思路，不评找寻表现"
      },
      "paragraphs": [
        {
          "en": "The six scenes begin with an empty key tray and continue through repeated checks, a useful piece of information, a pause, an unexpected discovery and what to keep for next time. The object is ordinary and temporarily misplaced at home; the story does not handle theft, a locked-out emergency or access to someone else’s property.",
          "zh": "六个场景从空钥匙盘开始，经过反复查看、选择有用信息、暂停、意外找到，再回看下次想保留什么。物品只是普通、暂时在家里放错位置；故事不处理被盗、紧急锁在门外或进入他人财物的问题。"
        },
        {
          "en": "The portraits name three emphases: reconstruct an action sequence, cover a physical zone and ask for information outside your current loop. These approaches can be combined or revised. Selecting one option highlights what you prefer in that scene, not what you can perform accurately.",
          "zh": "画像命名三种侧重：回放动作经过、覆盖空间区域、询问当前循环以外的信息。它们可以组合或调整。单选凸显该场景里较想做什么，不证明能否准确完成。"
        }
      ]
    },
    {
      "id": "sequence",
      "title": {
        "en": "The sequence replayer: separate a confirmed event from a plausible story",
        "zh": "经过回放者：把确定事件与合理猜想分开"
      },
      "paragraphs": [
        {
          "en": "The Sequence Replayer begins with the last confirmed point and considers what happened next. An original imagined account might be: you entered with a bag, answered a message and moved to another room. Mark which steps you actually remember and which merely seem likely, rather than filling gaps to make the story smooth.",
          "zh": "经过回放者从最后一个确定时点出发，再考虑之后发生什么。一个原创想象经过是：带包进门、回消息、换房间。可分清哪一步确实记得、哪一步只是看起来可能，不为让故事流畅而补满空白。"
        },
        {
          "en": "A convincing sequence can still be wrong. If another person moved the object or an uncertain step becomes the whole explanation, replaying it may add confidence without new evidence. This portrait does not establish superior recall or identify the object’s actual location.",
          "zh": "讲得通的顺序也可能不对。若别人挪过物品，或一段不确定步骤变成全部解释，反复回放可能只增加信心，没有新证据。画像不证明回忆更好，也不指出物品真实位置。"
        }
      ]
    },
    {
      "id": "space",
      "title": {
        "en": "The zone explorer: describe what was checked, and how",
        "zh": "分区查看者：说清查了哪里，以及怎样查的"
      },
      "paragraphs": [
        {
          "en": "The Zone Explorer makes coverage visible. An original example is checking one shelf before opening a different drawer, then remembering the boundary of that check. “I searched everywhere” becomes a more specific account that can be revised or communicated to someone helping.",
          "zh": "分区查看者让覆盖情况看得见。一个原创例子是先查完一个架子，再打开另一个抽屉，并记得这次查看的边界。“到处都找过”因此变成更具体、可以修改或告诉协助者的记录。"
        },
        {
          "en": "Looking across an area is not the same as examining every object in it. An item may be outside the assumed zone, behind another object or simply overlooked. A checked label is a description of an attempt, not proof that the item cannot be there or that a person has high attention ability.",
          "zh": "扫过一片区域，不等于查看过其中每件物品。目标可能在预想范围外、被别物遮住，或只是被漏看。“已查”描述一次尝试，不证明目标不在那里，也不证明注意能力高。"
        }
      ]
    },
    {
      "id": "information",
      "title": {
        "en": "The fresh-angle finder: seek a new observation, not more guesses",
        "zh": "寻找另一种视角：要新观察，不只是更多猜测"
      },
      "paragraphs": [
        {
          "en": "The Fresh-Angle Finder asks what someone else could actually know. Instead of repeating “have you seen it?”, you might ask whether the entry table was cleared that morning. A specific answer can change a possible location; a confident guess remains a guess.",
          "zh": "寻找另一种视角的人先问，别人实际可能知道什么。与其重复“看到了吗”，可以问早晨是否整理过门口桌面。一个具体回答可能改变查看位置；很有信心的猜测仍然是猜测。"
        },
        {
          "en": "Explain what is already checked so another person need not restart the same loop. Help is voluntary, and several people repeating the same assumption do not create independent evidence. The result describes an information preference, not teamwork, empathy or problem-solving competence.",
          "zh": "说明已经查过的部分，别人就不必从同一个循环重来。帮助出于自愿，多人重复同一假设，也不会产生独立证据。结果描述信息偏好，不评团队协作、共情或解决问题的能力。"
        }
      ]
    },
    {
      "id": "evidence",
      "title": {
        "en": "Visual-search research measures a different task",
        "zh": "视觉搜索研究，测量的是另一种任务"
      },
      "paragraphs": [
        {
          "en": "Wolfe’s Guided Search 6.0 theoretical review models how attention is guided during visual search and discusses response times and errors in search experiments. Its opening examples distinguish real-world searching from controlled target-and-distractor tasks. This is background on a research field, not a validation of the three portraits here. [1]",
          "zh": "Wolfe的Guided Search 6.0理论综述讨论视觉搜索时注意怎样被引导，以及搜索实验里的反应时间和错误，开头也区分真实搜索与受控的目标、干扰物任务。这提供研究领域背景，不验证本页三篇画像。 [1]"
        },
        {
          "en": "This page shows no visual target, measures no response time and records no search accuracy. Six hypothetical decisions therefore cannot be converted into working-memory capacity, attention level, intelligence or a clinical finding. Correctly adding choice counts does not establish those interpretations.",
          "zh": "本页没有视觉目标，不测反应时间，也不记录寻找准确率。因此，六个假想决定不能换算工作记忆容量、注意力水平、智力或临床结论。把选择次数加对，不等于建立了这些解释。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six decisions and all highest-count approaches",
        "zh": "六次决定，保留全部最高次数找法"
      },
      "paragraphs": [
        {
          "en": "Every selected option adds one to sequence, space or perspective. Each appears once in every scene, so a single count is zero to six and the sum is six. The order changes across scenes; always picking the first option does not consistently select the same approach.",
          "zh": "每个所选项给经过、空间或视角中的一项加一次。各场景都各出现一次三种侧重，所以单项0至6次、总和6次。顺序会变化，一直选第一项，不始终对应同一种找法。"
        },
        {
          "en": "All highest ties are retained completely, without random selection or an alphabetical tie-break. Two-two-two yields all three portraits. A one-choice lead is not an established measurement difference, and a lower count does not show a cognitive weakness or a less successful search.",
          "zh": "所有最高并列均完整保留，不随机挑选，也不按字母破同分。二、二、二显示三篇。一项领先一次，不是已建立的测量差异；低次数也不说明认知弱点或更难找到东西。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Read the full tradeoff and keep alternatives available",
        "zh": "读完整取舍，也给其他办法留位置"
      },
      "paragraphs": [
        {
          "en": "Each original reading includes its summary, example, possible benefit, tradeoff and optional experiment. You might discuss what new information would make you switch approaches in a harmless imagined search. The aim is a concrete question, not a fixed identity such as “I always search this way.”",
          "zh": "每篇原读法包含概述、例子、可能用处、取舍与可选尝试。可以讨论，在一次无害的想象寻找里，什么新信息会让你换一种方式。重点是具体问题，不是“我永远这样找”的固定身份。"
        },
        {
          "en": "This is not a key-locating service or a connected tracker. It does not read a device location, ring an object, access a floor plan or recover a real key. Its authored scene choices have no established psychometric norms or predictive evidence about finding speed.",
          "zh": "这不是钥匙定位服务或联网追踪器，不读取设备位置、不让物品响铃、不访问户型图，也不找回真实钥匙。原创情境选择没有已建立的心理测量常模，也没有预测寻找速度的证据。"
        }
      ]
    },
    {
      "id": "privacy",
      "title": {
        "en": "A fictional search without a home map or location",
        "zh": "虚构找寻，不需要住宅地图或位置"
      },
      "paragraphs": [
        {
          "en": "Start opens the first choice directly; no real search, address, photograph or missing-object description is requested. Choices are resolved in the browser. Optional saving keeps this edition’s draft in the current tab for up to twenty-four hours, clearing on completion, retake or deletion.",
          "zh": "开始直接打开第一项选择，不要求实际寻找、地址、照片或失物说明。选择在浏览器内解析；可选保存把本版草稿留在当前标签页最长二十四小时，完成、重玩或删除会清除。"
        },
        {
          "en": "Without saving, refreshing may lose progress. Public entry and guide links do not include individual answers, and website usage analytics allowed by cookie settings remain separate from answer content. All three complete guides can be read without a result, account or sharing.",
          "zh": "不保存时刷新可能丢失进度。公开入口和指南链接不包含个人答案；Cookie设置允许的网站统计与答案内容分开。没有结果、账户或分享，也能阅读三篇完整指南。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Does this test memory or attention?",
        "zh": "这测记忆或注意力吗？"
      },
      "answer": {
        "en": "No. You choose hypothetical search steps without performing a timed or accuracy-scored task. Counts describe those choices only.",
        "zh": "不测。你只选假想步骤，没有进行计时或按准确率评分的任务，次数只描述这些选择。"
      }
    },
    {
      "question": {
        "en": "Will the result tell me where my keys are?",
        "zh": "结果会告诉我钥匙在哪吗？"
      },
      "answer": {
        "en": "No. The story receives no real location or object information and cannot find, ring or recover an item.",
        "zh": "不会。故事不接收真实位置或物品信息，不能定位、响铃或找回东西。"
      }
    },
    {
      "question": {
        "en": "Does a plausible sequence prove what happened?",
        "zh": "合理的经过就证明真实发生了吗？"
      },
      "answer": {
        "en": "No. A remembered step and an inferred step are different. The sequence portrait explicitly leaves uncertain details open.",
        "zh": "不能。记得的一步与推测的一步不同，经过画像明确把不确定细节留作未知。"
      }
    },
    {
      "question": {
        "en": "Why can multiple approaches tie?",
        "zh": "为什么几种找法并列？"
      },
      "answer": {
        "en": "Every highest raw count is kept. Three-three-zero gives two complete readings; two-two-two gives all three, with no forced winner.",
        "zh": "所有最高原始次数都会保留。三、三、零显示两篇；二、二、二显示三篇，不强行选胜出者。"
      }
    },
    {
      "question": {
        "en": "Must I upload a room photograph or home address?",
        "zh": "必须上传房间照片或住址吗？"
      },
      "answer": {
        "en": "No. Every scene is supplied as text. The page has no request for a home map, real address, image or device tracker.",
        "zh": "不需要。场景均为文字，不要求住宅地图、真实地址、图像或设备追踪器。"
      }
    },
    {
      "question": {
        "en": "Can I read all results and start again?",
        "zh": "可以读全部结果再重玩吗？"
      },
      "answer": {
        "en": "Yes. All three public guides are complete and free. Retake starts with fresh choices rather than preserving your previous answers.",
        "zh": "可以。三篇公开指南完整免费，重玩从未选择状态开始，不保留之前答案。"
      }
    }
  ],
  "references": [
    {
      "url": "https://search.bwh.harvard.edu/new/pubs/Wolfe2021_GS6.pdf",
      "label": {
        "en": "Wolfe (2021): Guided Search 6.0, theoretical review of visual search",
        "zh": "Wolfe（2021）：Guided Search 6.0视觉搜索理论综述"
      }
    }
  ]
},
  "long-distance-postcard": {
  "label": {
    "en": "Original asynchronous-contact scenes · Complete portraits free",
    "zh": "原创异步联系情境 · 完整画像免费"
  },
  "instructions": {
    "en": "Imagine one willing friend whose schedule differs from yours. Choose your preferred contact format in six scenes: an ordinary scene, an optional question or a shared marker. No real message is sent, and no reply deadline or contact quota is created.",
    "zh": "想象同一位愿意往来、日程与你不同的朋友。六个场景里选择较想采用的联系形式：普通一幕、可选问题或共同标记。页面不会发送真实消息，也不产生回复期限或联系配额。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "A postcard format for different schedules",
        "zh": "日程不同，也能留一个明信片式话头"
      },
      "paragraphs": [
        {
          "en": "The postcard here may be paper, a short message or a drawing. Six scenes consider limited space, a delayed reply, a postponed call, a personal detail, a long gap and a sustainable exchange. The reference is one willing friend, not an imagined audience whose approval you need to earn.",
          "zh": "这里的明信片可以是纸、短消息或画。六个场景涉及空间有限、回复延迟、通话改期、个人细节、较长空白，以及怎样容易维持交流。参考对象是一位愿意往来的朋友，不是需要争取认可的假想观众。"
        },
        {
          "en": "The three portraits describe a small scene, an open question and an optional common theme. They are ways to leave something available across distance, not rules for how often a friendship should communicate. The same pair may choose different formats at different times.",
          "zh": "三篇画像描述小场景、开放问题、可选共同主题。它们提供跨距离保留线索的方式，不规定友情应多久联系一次。同一对朋友在不同时候可以选不同形式。"
        }
      ]
    },
    {
      "id": "scene",
      "title": {
        "en": "The little-scene postcard: something that stands on its own",
        "zh": "小场景明信片：内容本身就可以成立"
      },
      "paragraphs": [
        {
          "en": "The Little-Scene Postcard offers one ordinary detail without requesting an equivalent update. An original imagined message could describe a crooked windowsill plant and why it caught your attention. The point is a concrete moment, not a highlight reel or proof that the sender is having a more interesting life.",
          "zh": "小场景明信片提供一个普通细节，不索取等值近况。一个原创想象消息可以写窗台歪植物，以及它为何吸引注意。重点是一刻具体经历，不是精彩生活剪辑，也不证明发信者过得更有趣。"
        },
        {
          "en": "A standalone scene can still ask for attention if many arrive together. Check whether more contact is welcome rather than using “no reply needed” as permission to send without limit. The portrait does not measure generosity or prove that silence means the message was appreciated.",
          "zh": "能独立成立的小场景，积累多了也会占用注意力。可先问更多联系是否受欢迎，而不把“不用回”当成无限发送许可。画像不测慷慨，也不证明沉默就表示对方喜欢消息。"
        }
      ]
    },
    {
      "id": "question",
      "title": {
        "en": "The open-thread postcard: one question that is allowed to wait",
        "zh": "开放话头明信片：一个可以等的问题"
      },
      "paragraphs": [
        {
          "en": "The Open-Thread Postcard gives a future exchange a possible beginning. For example, ask about one detail in a book the person has chosen to discuss. They can answer briefly, return much later or leave that topic alone. An invitation does not establish a duty to disclose private life.",
          "zh": "开放话头明信片为以后的交流留一个可能起点。例如，围绕对方主动谈过的一本书，问一个小细节。对方可以简短回答、很久后再回来，也可以不谈这个话题。邀请不产生公开私人生活的义务。"
        },
        {
          "en": "Several easy questions can become a demanding questionnaire. Keep the thread small and do not add a deadline by repeatedly checking whether it was seen. A high question count describes this option family; it is not a curiosity score or evidence of greater friendship closeness.",
          "zh": "几个简单问题，也可能叠成繁重的近况问卷。可把话头留小，不通过反复确认是否看见来追加期限。问题方向次数高，只描述这类选项，不是好奇心分数，也不证明友情更亲近。"
        }
      ]
    },
    {
      "id": "marker",
      "title": {
        "en": "The shared-marker postcard: a theme without a streak",
        "zh": "共同标记明信片：有主题，不变连续打卡"
      },
      "paragraphs": [
        {
          "en": "The Shared-Marker Postcard returns to a tiny theme both people actually chose. An original example is occasionally sketching a doorway that catches your eye. The next contribution can be different in length or arrive much later; the theme connects the pieces without making their timing identical.",
          "zh": "共同标记明信片回到双方确实选定的小主题。一个原创例子是偶尔画一个吸引注意的门口。下次贡献可长短不同，也可晚很久才出现；主题连接片段，不要求时机一致。"
        },
        {
          "en": "A common marker becomes a quota if missed turns are counted or gaps must be explained. Agree that either person may pause or stop the theme. Keeping a collection alive is not proof of care, and discontinuing one is not a measure of loyalty or attachment style.",
          "zh": "如果开始统计漏了几次、要求解释空白，共同标记就变成配额。可以约好任何一方都能暂停或结束主题。持续收集不证明关心，停止也不测忠诚或依恋风格。"
        }
      ]
    },
    {
      "id": "context",
      "title": {
        "en": "Letter services are context, not evidence about your friendship",
        "zh": "书信服务提供形式背景，不验证友情"
      },
      "paragraphs": [
        {
          "en": "Postcrossing’s own help page offers practical ideas for postcard content, including ordinary daily life and shared interests. Those are writing prompts from a postal-exchange service. They do not establish that a particular format strengthens an existing friendship or that an unreturned message reveals someone’s feelings. [1]",
          "zh": "Postcrossing的帮助页提供明信片写作点子，包括普通日常与共同兴趣。这是明信片交换服务的实用写作提示，不证明某种形式会增强既有友情，也不证明没有回复就揭示了某人的感情。 [1]"
        },
        {
          "en": "This game is not a pen-pal matching service, postal delivery tool or delayed-message app. It does not choose a stranger, collect an address, simulate delivery time or contact the friend. Its three portraits are authored descriptions with no established psychometric reliability, trait validity or norms.",
          "zh": "本小游戏不是笔友匹配、邮寄工具或延迟送信应用，不选择陌生人、不收地址、不模拟投递时间，也不联系朋友。三篇画像是原创描述，尚无已建立的心理测量信度、特质效度或常模。"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices and every highest-count portrait",
        "zh": "六次选择，保留每篇最高次数画像"
      },
      "paragraphs": [
        {
          "en": "Each chosen option adds one to scene, question or marker. Each format appears once in every scene, so each count is zero to six and the sum is six. Positions change across scenes. A first-position response therefore does not consistently select the same format.",
          "zh": "每个所选项给场景、问题或标记中的一项加一次。每个场景各出现一次三种形式，因此各项0至6次，总和6次。各场景位置会变，第一位置不始终对应同一种形式。"
        },
        {
          "en": "All highest ties are retained in full; two-two-two displays all three. The numbers are not contact frequency, the proportion of affection, compatibility or a target reply interval. A lower count means fewer selections of that format in these alternatives, not a relationship deficit.",
          "zh": "所有最高并列均完整保留，二、二、二显示三篇。数字不是联系频率、感情比例、契合度或目标回复间隔。低次数只表示在这些备选中较少选择该形式，不代表关系缺陷。"
        }
      ]
    },
    {
      "id": "readings",
      "title": {
        "en": "Complete readings, with the other person’s wishes kept separate",
        "zh": "完整读法，与对方真实意愿分开看"
      },
      "paragraphs": [
        {
          "en": "The original complete guides include a summary, example, possible benefit, tradeoff and optional experiment. Read the tradeoff alongside the appealing part. You may ask a willing friend which format they welcome, without using your own result as their answer.",
          "zh": "原完整指南包含概述、例子、可能用处、取舍与可选尝试。可把取舍和吸引人的部分一起读。如愿意，可以问朋友欢迎哪种形式，不把自己的结果当成对方的回答。"
        },
        {
          "en": "A long gap supplies no single explanation for another person’s life or feelings. This story does not tell you whether to continue a real relationship, assess its quality or prescribe a communication schedule. All three guides remain public even if you choose not to complete the quiz.",
          "zh": "长时间空白，不能提供关于对方生活或感情的唯一解释。故事不决定是否继续一段真实关系、不评价关系质量，也不制定沟通日程。不完成小游戏，也仍可读三篇公开指南。"
        }
      ]
    },
    {
      "id": "privacy",
      "title": {
        "en": "No address book, real postcard or message content required",
        "zh": "不用通讯录、真实明信片或消息内容"
      },
      "paragraphs": [
        {
          "en": "Start opens the first choice directly. All options are supplied; do not enter an address, contact name or private message. Choices are resolved in the browser. Optional tab saving lasts up to twenty-four hours and clears on completion, retake or deletion.",
          "zh": "开始直接进入第一项选择。选项均已提供，不需要地址、联系人姓名或私人消息。选择在浏览器内解析；可选标签页保存最长二十四小时，完成、重玩或删除会清除。"
        },
        {
          "en": "Without saving, refresh may lose progress. Public entry and guide links do not include your answers, and analytics permitted by cookie settings are separate from answer content. No real mail, purchase, sharing or partner participation is required for the full results.",
          "zh": "不保存时，刷新可能丢失进度。公开入口和指南链接不含个人答案；Cookie设置允许的统计与答案内容分开。完整结果不需要真实寄信、购买、分享或对方参加。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Does my result measure friendship closeness?",
        "zh": "结果能测出友情亲近吗？"
      },
      "answer": {
        "en": "No. It counts six preferred message formats. The friend does not answer, and no relationship outcome or affection level is measured.",
        "zh": "不能。这里只统计六次偏好的消息形式，朋友未参与回答，也没有测量关系结果或感情程度。"
      }
    },
    {
      "question": {
        "en": "Must a postcard be paper?",
        "zh": "明信片一定是纸质吗？"
      },
      "answer": {
        "en": "Not in these scenes. It can be paper, a brief message or a drawing; no actual card is generated or sent.",
        "zh": "本场景里不必。它可以是纸、短消息或画；页面不会生成或发送真实卡片。"
      }
    },
    {
      "question": {
        "en": "What does a delayed reply mean?",
        "zh": "回复很晚说明什么？"
      },
      "answer": {
        "en": "This game cannot tell. Different schedules are part of the fictional premise; a gap alone does not identify motives, attachment style or affection.",
        "zh": "小游戏无法判断。日程不同是虚构前提，空白本身不确定动机、依恋风格或感情。"
      }
    },
    {
      "question": {
        "en": "Is a shared marker a contact requirement?",
        "zh": "共同标记是联系要求吗？"
      },
      "answer": {
        "en": "No. It is an optional theme without a required interval or streak. Either person can pause it without treating that as a failed test.",
        "zh": "不是。它是不要求间隔或连续天数的可选主题，任何一方都能暂停，不把暂停视为测试失败。"
      }
    },
    {
      "question": {
        "en": "Why do I see more than one portrait?",
        "zh": "为什么有多篇画像？"
      },
      "answer": {
        "en": "Every format tied for the highest raw count is shown. Three-three-zero yields two and two-two-two yields all three, without choosing one at random.",
        "zh": "原始次数同为最高的各项都会显示。三、三、零显示两篇，二、二、二显示三篇，不随机选一篇。"
      }
    },
    {
      "question": {
        "en": "Does the site contact my friend?",
        "zh": "网站会联系朋友吗？"
      },
      "answer": {
        "en": "No. There is no recipient field, message composer or delivery process. All complete guides can be read without registering or sending anything.",
        "zh": "不会。没有接收者输入框、消息编辑器或投递流程，不注册、不发送也能读完所有指南。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.postcrossing.com/help/what-should-i-write-on-a-postcard",
      "label": {
        "en": "Postcrossing: practical postcard-writing prompts",
        "zh": "Postcrossing：明信片实用写作提示"
      }
    }
  ]
},
  "kitchen-improviser": {
  "label": {
    "en": "Original dinner decisions · Complete recreational portraits",
    "zh": "原创晚餐选择 · 完整趣味画像"
  },
  "instructions": {
    "en": "Imagine a simple meal using ingredients already confirmed suitable for everyone eating. Choose your preferred response in six fictional situations. There is no cooking task, recipe submission or skill grade. All highest-count portraits appear in full.",
    "zh": "想象用已经确认适合所有用餐者的食材做一顿简单饭。六个虚构情境里选择自己较想采用的回应，不需要实际烹饪、提交菜谱，也不给厨艺评级。所有最高次数画像都会完整显示。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "Kitchen improvisation: what would you change first?",
        "zh": "厨房临场发挥：你会先调整什么？"
      },
      "paragraphs": [
        {
          "en": "The meal changes in six ways: an ingredient is missing, seasonings differ, twenty minutes disappear, a variation works, several small usable ingredients remain, and you decide what would count as a satisfying evening. The scenes ask about priorities under these conditions, not whether dinner was actually prepared well.",
          "zh": "六个场景分别涉及缺一样食材、调味偏好不同、少了二十分钟、小变化奏效、几种少量可用食材，以及怎样才算满意的一餐。问题询问在这些条件下的优先选择，不评实际晚餐做得好不好。"
        },
        {
          "en": "The three portraits concern a familiar structure, a small trial and a choice-friendly table. You can combine them in practice: retain a familiar base, offer an optional variation and ask what people want. A single-choice format highlights a relative preference; it does not prohibit the other approaches.",
          "zh": "三篇画像分别讨论熟悉结构、小份试验、给用餐者留选择。现实中可以组合使用：保留熟悉底子、提供可选变化、问问大家想要什么。单选格式凸显相对偏好，不排斥其他做法。"
        }
      ]
    },
    {
      "id": "bridge",
      "title": {
        "en": "A familiar bridge: preserve a purpose, not every detail",
        "zh": "熟悉结构的搭桥者：保留目的，不必保留每个细节"
      },
      "paragraphs": [
        {
          "en": "The Familiar Bridge first asks what makes the planned meal recognizable. An original imagined example is keeping the agreed arrangement of a simple dinner while dropping a decorative extra when time is short. That is a planning choice, not an instruction that two ingredients are chemically or nutritionally interchangeable.",
          "zh": "熟悉结构的搭桥者先问，原计划里什么让这顿饭仍然成立。一个原创想象例子是时间减少时，保留大家认可的简单搭配，省去装饰性附加项。这是安排选择，不表示两种食材在化学作用或营养上可互换。"
        },
        {
          "en": "A nearby substitute may not serve the same purpose, and the group may no longer want the original meal. Ask which experience matters before preserving it. This portrait does not establish efficiency, technical knowledge or that familiar cooking is always the best response.",
          "zh": "看起来接近的替代物，未必承担同一作用；大家也可能不再想吃原计划。保留之前可先问清，哪种体验值得留住。画像不证明效率或专业知识，也不认为熟悉做法总是最佳回应。"
        }
      ]
    },
    {
      "id": "trial",
      "title": {
        "en": "A small trial: one question without taking over dinner",
        "zh": "小份试验派：只问一个问题，不接管整顿饭"
      },
      "paragraphs": [
        {
          "en": "The Small-Batch Explorer keeps novelty limited. In the story, a familiar main meal can remain available while one optional variation is considered separately. The useful question is what changed and whether anyone wants that change, rather than how adventurous the cook appears.",
          "zh": "小份试验派把新鲜感限制在小范围。故事里可以保留熟悉正餐，把一个可选变化单独考虑。重点是改了什么、有没有人想要，不是厨师显得多敢尝试。"
        },
        {
          "en": "A small portion does not establish food safety or suitability. Even a bounded comparison can add preparation, cleaning or pressure to give praise. Other diners may decline the experiment; their ordinary dinner need not become a taste panel.",
          "zh": "份量少不证明安全或适合食用。有边界的比较也可能增加准备、清洁或必须夸奖的压力。其他用餐者可以拒绝参加，不必把一顿普通饭变成品评会。"
        }
      ]
    },
    {
      "id": "table",
      "title": {
        "en": "A choice-friendly table: clear options and shared work",
        "zh": "让选择留在餐桌上：选项清楚，也分担准备"
      },
      "paragraphs": [
        {
          "en": "The Choice-Friendly Table makes agreed parts available separately. An original imagined arrangement is a familiar base with two already-approved additions, clearly described so people can decide. The purpose is an understandable choice, not an unlimited menu or a moral test about trying every dish.",
          "zh": "让选择留在餐桌上的安排，把商量好的部分分开放。一个原创想象例子是熟悉主食配两种事先认可的附加项，说明清楚，方便各自决定。目的在于选择容易理解，不是无限菜单，也不以尝遍菜肴考验态度。"
        },
        {
          "en": "Extra options can transfer invisible work to one person. Agree what can realistically be prepared and whether someone else can handle one part. Neither a high table count nor neatly separated dishes verifies that dietary restrictions or cross-contact risks have been addressed.",
          "zh": "选项增加，可能把看不见的工作转给同一个人。可商量实际准备得了什么，是否有人分担其中一部分。餐桌方向次数高或食物摆放分开，都不验证已经处理饮食限制或接触混杂风险。"
        }
      ]
    },
    {
      "id": "scope",
      "title": {
        "en": "An imagined dinner is not a recipe or dietary assessment",
        "zh": "想象晚餐，不是菜谱或饮食评估"
      },
      "paragraphs": [
        {
          "en": "The source premise already assumes suitable ingredients. The page does not determine whether a leftover is usable, identify allergens, calculate nutrients or recommend storage and cooking conditions. Do not use an answer or portrait to make those decisions; the story supplies no evidence for them.",
          "zh": "题本前提是食材已经适合用餐者。页面不判断剩余食材还能否使用、不识别过敏原、不计算营养，也不建议储存或烹饪条件。答案与画像都不提供这类决策所需证据。"
        },
        {
          "en": "Recipe-adaptation services are a different product category: Frigo Magic’s French introduction describes changing ingredients and portions in actual recipes. This story instead compares six written decisions without generating a usable recipe or checking a real pantry. Its playful portraits do not inherit another service’s functionality or evidence. [1]",
          "zh": "菜谱适配服务属于另一种产品：Frigo Magic法语介绍说明可调整实际菜谱的食材和人数。本故事比较的是六个文字决定，不生成可执行菜谱，也不检查真实储物柜。趣味画像不继承其他服务的功能或证据。 [1]"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six decisions, three raw counts and all highest ties",
        "zh": "六次决定、三项原始次数与全部最高并列"
      },
      "paragraphs": [
        {
          "en": "Every selected option adds one to bridge, test or table. Each emphasis appears once in each scene, so each ranges from zero to six and the total is six. Option positions change: the first option is not a fixed portrait key. No response is scored as correct or incorrect.",
          "zh": "所选项给搭桥、试验或餐桌中的一项加一次。每个场景都各提供一次三种侧重，因此各项0至6次、总和6次。选项位置会变化，第一项不是固定画像键；回答不按对错评分。"
        },
        {
          "en": "All portraits tied for the highest count are displayed completely. Two-two-two gives all three. Counts are not cooking proficiency percentages, percentiles, nutrition scores or evidence that one method will work faster; a lower count is a less-selected option family in this bank.",
          "zh": "最高次数相同的画像均完整显示。二、二、二会显示三篇。次数不是厨艺熟练百分比、人群百分位、营养分，也不证明某种方式更快；低次数只表示本题组里相对少选该类选项。"
        }
      ]
    },
    {
      "id": "use",
      "title": {
        "en": "Read the tradeoff before trying the optional idea",
        "zh": "读完取舍，再决定是否尝试小点子"
      },
      "paragraphs": [
        {
          "en": "Each original guide includes the complete summary, example, benefit, tradeoff and optional experiment. A useful discussion might ask what the group wanted to keep, how much preparation was available and who preferred not to participate. The diners’ actual answers take precedence over a portrait.",
          "zh": "每篇原指南保留完整概述、例子、用处、取舍与可选尝试。讨论时可以问：大家想留什么、有多少准备余地、谁不想参加。用餐者的实际回答优先于画像标签。"
        },
        {
          "en": "These are authored recreational choices without established psychometric reliability, trait validity or norms. They do not diagnose rigidity, measure creativity or rank hosts. Read all three public guides freely, including portraits that were not highest in your result.",
          "zh": "这是原创休闲选择，尚无已建立的心理测量信度、特质效度或常模，不诊断固执、不测创造力，也不给主人排名。三篇公开指南均可自由阅读，包括本次没有最高的画像。"
        }
      ]
    },
    {
      "id": "privacy",
      "title": {
        "en": "Start with a scene, without uploading a kitchen",
        "zh": "直接从场景开始，不上传厨房资料"
      },
      "paragraphs": [
        {
          "en": "Start opens the first choice without another agreement step. No photograph, ingredient inventory, dietary history or name is requested. Choices are resolved in the browser. Optional saving stores this edition’s draft in the current tab for up to twenty-four hours and clears on completion, retake or deletion.",
          "zh": "开始直接打开第一项选择，不增加同意步骤。无需照片、食材库存、饮食史或姓名。选择在浏览器内解析，可选保存把本版草稿留在当前标签页最长二十四小时，完成、重玩或删除会清除。"
        },
        {
          "en": "Without saving, refreshing can lose progress. Entry and guide links do not include individual answers; website usage analytics allowed by cookie settings are separate from answer content. No purchase, actual meal or social sharing is needed to read every result.",
          "zh": "不保存时，刷新可能丢失进度。入口和指南链接不包含个人答案；Cookie设置允许的使用统计与答案内容分开。不需要购买、实际做饭或社交分享就能读完全部结果。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Does this grade my cooking?",
        "zh": "这会给厨艺评级吗？"
      },
      "answer": {
        "en": "No. It counts preferred responses to six fictional dinner situations, without observing preparation, tasting a dish or assessing technical skill.",
        "zh": "不会。这里只统计六个虚构晚餐场景里的偏好，不观察制作、不品尝菜肴，也不评技术。"
      }
    },
    {
      "question": {
        "en": "Can I use it to check a substitute or leftover?",
        "zh": "能用它确认替代食材或剩菜吗？"
      },
      "answer": {
        "en": "No. Suitability is an assumed premise, not something this story checks. No ingredient replacement, storage, allergy or nutrition decision is validated by a result.",
        "zh": "不能。适合食用是前提，不是故事检查的结果。画像不验证替代、储存、过敏或营养决策。"
      }
    },
    {
      "question": {
        "en": "Why can more than one portrait appear?",
        "zh": "为什么有多篇画像？"
      },
      "answer": {
        "en": "Every emphasis sharing the highest count is kept. Counts of three-three-zero show two portraits, and two-two-two shows all three.",
        "zh": "同为最高的各项都会保留。三、三、零显示两篇；二、二、二显示三篇。"
      }
    },
    {
      "question": {
        "en": "Is trying a small portion always the best choice?",
        "zh": "先试小份总是最好的吗？"
      },
      "answer": {
        "en": "No. It is one authored emphasis with its own preparation costs. Nobody has to join a comparison, and a small portion is not a food-safety check.",
        "zh": "不是。这只是一个有准备成本的原创侧重。别人无需参加比较，小份也不构成食品安全检查。"
      }
    },
    {
      "question": {
        "en": "Must I enter real dietary information?",
        "zh": "必须输入真实饮食资料吗？"
      },
      "answer": {
        "en": "No. All scenes and options are supplied; the page asks for no medical, dietary or pantry information.",
        "zh": "不需要。场景与选项已经提供，页面不要求医疗、饮食或库存资料。"
      }
    },
    {
      "question": {
        "en": "Are all three guides free?",
        "zh": "三篇指南都免费吗？"
      },
      "answer": {
        "en": "Yes. Every complete public guide and all highest-count result readings are available without payment, an account or sharing.",
        "zh": "是。全部完整公开指南和最高次数结果均开放，无需支付、账户或分享。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.frigomagic.com/",
      "label": {
        "en": "Frigo Magic: actual recipe-adaptation features (French; a different product)",
        "zh": "Frigo Magic：实际菜谱适配功能介绍（法语；不同产品）"
      }
    }
  ]
},
  "island-day": {
  "label": {
    "en": "Original island fiction · Three complete ending guides free",
    "zh": "原创小岛故事 · 三篇完整结局指南免费"
  },
  "instructions": {
    "en": "Imagine a visit to Postcard Island with your return ticket already arranged. Choose one option in each scene you reach: three choices complete a route. The final link selects one keepsake ending. There are no points, correct answers, travel bookings or required writing tasks.",
    "zh": "想象带着已经安排好的返程票来到明信片岛。在经过的场景里各选一项，三次选择完成一条路线。最后的链接决定一件纪念物结局，不累计分数，不设正确答案，也不需要预订旅行或完成写作任务。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "A fictional island day, with the return already taken care of",
        "zh": "虚构小岛的一天，返程已经安排好"
      },
      "paragraphs": [
        {
          "en": "A silent bell, a blank mural panel and a ferry ledger offer three ways to leave a trace of the day. The story begins with a return ticket in hand, so you are not deciding whether to strand yourself, survive on an island or arrange transport. All places and keepers belong to an authored tale.",
          "zh": "无声的钟、壁画空格、渡船簿，提供三种留下当日痕迹的方式。故事从已有返程票开始，不要求决定是否滞留、孤岛求生或安排交通。地点与保管者均属于原创虚构短篇。"
        },
        {
          "en": "Your route ends with a card of quiet sounds, a shared-mural card or an open-ledger note. These are narrative keepsakes, not forecasts about a journey or symbols that diagnose a psychological need. Every ending can be read in full, including the ones your route did not reach.",
          "zh": "路线以安静声音卡、共同壁画卡或开放船簿便条结束。它们是叙事纪念物，不预测旅行，也不通过象征诊断心理需要。每篇结局均可完整阅读，包括本次没有走到的结局。"
        }
      ]
    },
    {
      "id": "routes",
      "title": {
        "en": "Five possible scenes, three choices on every visit",
        "zh": "五个可能场景，每次参观选择三次"
      },
      "paragraphs": [
        {
          "en": "The starting choice leads to the silent bell or the mural. Each of those scenes then leads to a postcard offer or the ferry ledger. A third choice selects the ending directly. The five scene nodes are a pool of alternatives, not five consecutive questions that everyone must answer.",
          "zh": "起点选项先通向无声的钟或壁画，两处再分别通向明信片选择或渡船簿，第三次选择直接决定结局。五个场景节点构成可选场景池，不是人人必须连续回答的五道题。"
        },
        {
          "en": "There are eight complete routes, all three choices long: two reach quiet sounds, four the mural and two the ledger. This describes the authored graph. It is not an observed distribution of visitors, a random-draw probability or evidence that one keepsake is more typical of a personality.",
          "zh": "共有八条完整路线，长度均为三次选择：两条到安静声音、四条到壁画、两条到船簿。这描述已写好的路线图，不是实测访客分布、随机抽取概率，也不证明某件纪念物更代表某类人格。"
        }
      ]
    },
    {
      "id": "bell",
      "title": {
        "en": "Quiet sounds: notice an interval without demanding a revelation",
        "zh": "安静声音：留意间隔，不要求得到启示"
      },
      "paragraphs": [
        {
          "en": "The sound card is offered after either starting place when you reach the shared postcard scene. Starting at the bell does not guarantee it. The final choice preserves small sounds noticed during the bell’s silence, rather than rewarding you for finding a way to ring it.",
          "zh": "从两个起点出发，只要走到共同的明信片场景，都有机会选声音卡。从钟开始，不保证得到它。最后的选择保留钟沉默时留意到的小声音，不奖励你找到敲响钟的方法。"
        },
        {
          "en": "An original extension might describe the pause between two busy exhibition rooms: a few footsteps and a paper bag settling. That interval need not explain your whole mood or reveal a hidden self. All sound is described in text; no hearing test, audio recording or silent environment is required.",
          "zh": "一个原创延伸可以写两间热闹展厅之间的停顿：几下脚步、纸袋落稳的声音。这段间隔不必解释全部心情或揭示隐藏自我。声音均由文字描述，不测听力、不录音，也不要求身处安静环境。"
        }
      ]
    },
    {
      "id": "mural",
      "title": {
        "en": "The shared mural: a contribution can sit beside another",
        "zh": "共同壁画：一笔贡献，可以与另一笔并存"
      },
      "paragraphs": [
        {
          "en": "The mural postcard can be selected from both final scenes. In one route you have added a shape; in another you leave the ledger open and choose the mural card. Reaching this ending therefore does not prove that you made a mark or reveal a stable preference for group participation.",
          "zh": "两个终点场景都可以选壁画卡。有的路线里你已经添过形状；另一条路线则让船簿空着，选择壁画卡。因此，这一结局不证明你实际添过一笔，也不揭示稳定的群体参与偏好。"
        },
        {
          "en": "Imagine a small tile beside several different tiles at an open craft table. The picture need not make every addition identical, and watching without adding must remain possible. The optional activity in the complete ending is an invitation, not a requirement to collaborate or a test of generosity.",
          "zh": "可想象开放手工桌上，一块小片与几块不同小片排在一起。画面不要求每次新增相同，也应允许只看不添。完整结局里的可选活动是一种邀请，不强制合作，也不测慷慨程度。"
        }
      ]
    },
    {
      "id": "ledger",
      "title": {
        "en": "The ledger note: one detail, with room left unfinished",
        "zh": "船簿便条：留一个细节，也留未完成的空间"
      },
      "paragraphs": [
        {
          "en": "The ledger ending requires reaching the ferry desk and choosing its plain-detail option. Merely asking about earlier visitors or looking at the record does not select it. The final invitation is small: preserve one imagined dated detail, leaving the next visitor’s space open.",
          "zh": "船簿结局需要走到渡船柜台，并选记录朴素细节的那一项。只是询问较早来客或看过记录，不会直接得到它。最后的邀请很小：保存一个想象中的带日期细节，把下一位来客的位置留空。"
        },
        {
          "en": "For example, a fictional note could say that a blue paper shape appeared beside a yellow line that afternoon. It does not need real visitors’ names or a complete account of the day. The page asks you to select an option, not type a private diary entry or commit to a daily recording habit.",
          "zh": "例如，一则虚构便条可以写“那天下午，黄色线条旁出现了蓝色纸片形状”。不必记录真人姓名，也不必完整交代一天。页面只让你选一个选项，不要求输入私人日记或承诺每日记录。"
        }
      ]
    },
    {
      "id": "fiction",
      "title": {
        "en": "A branching tale, separate from a travel or personality assessment",
        "zh": "分支短篇，与旅行或人格评估分开"
      },
      "paragraphs": [
        {
          "en": "Interactive-fiction authoring guides distinguish choices and the links that lead to later scenes. Inklewriter explains following an option, rewinding and joining branches; Fiction-interactive’s French introduction distinguishes hyperlink stories from parser games. These are references for narrative form, not evidence of psychological validity. [1] [2]",
          "zh": "互动小说创作指南会区分选项以及通向后续场景的链接。Inklewriter说明跟随选项、返回和汇合分支；Fiction-interactive法语入门区分超链接故事与指令解析游戏。这些是叙事形式的参考，不是心理效度证据。 [1] [2]"
        },
        {
          "en": "This island uses fixed scenes and deterministic terminal links. There is no generated itinerary, time competition, survival score or MBTI conversion. Revisiting with different choices changes which keepsake the route reaches; it does not measure development in courage, creativity or sociability.",
          "zh": "本小岛使用固定场景和确定的终点链接，没有自动生成行程、计时竞赛、求生分数或MBTI换算。换一组选择重访，会改变路线到达的纪念物，不测勇气、创造力或社交程度的发展。"
        }
      ]
    },
    {
      "id": "replay",
      "title": {
        "en": "Return, change direction, or read a different ending",
        "zh": "返回、改走另一条路，或直接读其他结局"
      },
      "paragraphs": [
        {
          "en": "Start opens the postcard’s first choice directly. Before reaching the ending, Back allows an earlier choice to be changed; later answers from the abandoned branch are removed. The new route then asks only its own scenes. Retake starts again with an unanswered first scene.",
          "zh": "开始直接打开明信片的第一项选择。到结局前，可以返回修改前面的选择；被放弃分支后面的答案会移除，新路线只询问自己的场景。重玩从尚未回答的第一个场景重新开始。"
        },
        {
          "en": "All three ending guides are free and public. Reading another guide does not add a choice, replace the completed ending or count as another visit. The original summary, example, possible benefit, tradeoff and optional experiment remain complete for each keepsake.",
          "zh": "三篇结局指南均免费公开。阅读另一篇不会新增选择、替换已经到达的结局，也不算另一次参观。每件纪念物的原始概述、例子、可能用处、取舍与可选尝试都完整保留。"
        }
      ]
    },
    {
      "id": "privacy",
      "title": {
        "en": "A fictional visit does not require real travel information",
        "zh": "虚构参观不需要真实旅行资料"
      },
      "paragraphs": [
        {
          "en": "No name, location, ticket, photograph or message to an actual visitor is requested. Choices are resolved in the browser. Optional tab saving keeps this edition’s draft for up to twenty-four hours, clearing it on completion, retake or deletion; a refresh without saving can lose progress.",
          "zh": "页面不要求姓名、位置、票据、照片，也不需要给真实来客发消息。选择在浏览器内解析。可选标签页保存把本版草稿保留最长二十四小时，完成、重玩或删除会清除；不保存时刷新可能丢失进度。"
        },
        {
          "en": "Public entry and guide links do not contain individual choices. Website usage analytics permitted by cookie settings are separate from answer content. You can keep the story private and still read all endings; there is no social-sharing unlock.",
          "zh": "公开入口与指南链接不包含个人选择。Cookie设置允许的网站使用统计，与答案内容分开。可以不分享故事而读完全部结局，没有社交分享解锁。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "How many choices complete the island story?",
        "zh": "完成小岛故事需要选择几次？"
      },
      "answer": {
        "en": "Every complete route has three choices. Five is the number of authored scene nodes in the whole pool, not the length of one visit.",
        "zh": "每条完整路线都是三次选择。五是整个场景池的节点数，不是单次参观长度。"
      }
    },
    {
      "question": {
        "en": "Does starting at the bell give the sound card?",
        "zh": "从钟开始就会得到声音卡吗？"
      },
      "answer": {
        "en": "Not necessarily. Either starting place can reach the postcard offer, where the final choice selects the sound or mural card.",
        "zh": "不一定。两个起点都可能到明信片选择场景，最后再决定声音卡或壁画卡。"
      }
    },
    {
      "question": {
        "en": "Why can different routes end at the mural?",
        "zh": "为什么不同路线都会到壁画结局？"
      },
      "answer": {
        "en": "Both final scenes offer a mural-card choice. Shared endings are intentional links in the story, not a scoring error or a tie.",
        "zh": "两个终点场景都有壁画卡选项。共同结局来自写好的链接，不是计分错误或并列。"
      }
    },
    {
      "question": {
        "en": "Is the keepsake chosen at random?",
        "zh": "纪念物是随机抽取的吗？"
      },
      "answer": {
        "en": "No. The final selected option points directly to one of three endings. There are no totals, ranking thresholds or random draws.",
        "zh": "不是。最后所选项直接指向三个结局之一，没有累计分、排名阈值或随机抽取。"
      }
    },
    {
      "question": {
        "en": "Do I have to add to the mural or write a ledger entry?",
        "zh": "必须画壁画或写船簿吗？"
      },
      "answer": {
        "en": "No. You only select supplied text options. Creative activities in the complete endings are optional and are not submitted to the site.",
        "zh": "不必。只需选择已经提供的文字选项。完整结局中的创作活动均可选，不向网站提交。"
      }
    },
    {
      "question": {
        "en": "Is this a real destination or travel recommendation?",
        "zh": "这是实际目的地或旅行推荐吗？"
      },
      "answer": {
        "en": "No. The island, keepers and keepsakes are fictional. No booking, real navigation, local safety information or travel qualification is provided.",
        "zh": "不是。小岛、保管者与纪念物均属虚构，不提供预订、实际导航、当地安全资料或旅行资格判断。"
      }
    },
    {
      "question": {
        "en": "Can I read all three complete endings without an account?",
        "zh": "没有账户也可以读三个完整结局吗？"
      },
      "answer": {
        "en": "Yes. The public guides contain the original complete readings. Registration, payment and sharing are not required.",
        "zh": "可以。公开指南保留原始完整读法，无需注册、支付或分享。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.inklestudios.com/inklewriter/getting-started/",
      "label": {
        "en": "Inklewriter: choices, rewinding and joining branches",
        "zh": "Inklewriter：选择、返回与分支汇合"
      }
    },
    {
      "url": "https://www.fiction-interactive.fr/creer/par-ou-commencer/",
      "label": {
        "en": "Fiction-interactive.fr: forms of interactive fiction (French)",
        "zh": "Fiction-interactive.fr：互动小说形式入门（法语）"
      }
    }
  ]
},
  "inside-joke": {
  "label": {
    "en": "Original group-humour scenes · All complete portraits free",
    "zh": "原创小组幽默情境 · 完整画像免费"
  },
  "instructions": {
    "en": "Imagine one casual hobby group and a harmless recurring joke. In each of six scenes, choose the response you would prefer. You are not asked to write a joke, name anyone or prove that a group likes you. Every highest-count portrait remains available in full.",
    "zh": "想象同一个轻松爱好小组和一个无害的反复笑点。六个场景里选择自己较想采用的回应，不需要现场写笑话、点名任何人或证明受欢迎。结果完整保留所有最高次数画像。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "A shared joke, with room for people who missed the beginning",
        "zh": "共同笑点，也为没听过开头的人留位置"
      },
      "paragraphs": [
        {
          "en": "The six scenes follow a recurring line, a newcomer’s question, a fourth repetition, a typo, a joke that does not land and a hoped-for group atmosphere. They explore what you would do with a reference, not whether you can produce a funny performance. Keep the same imagined hobby group in mind throughout.",
          "zh": "六个场景依次涉及一句旧笑点、新成员提问、第四次重复、一次笔误、没被接住的笑话，以及期待的小组氛围。它们探索如何处理共同指涉，不考你能否表演出笑声。作答时请始终想象同一个爱好小组。"
        },
        {
          "en": "Three authored portraits name different emphases: make a reference understandable, invent a turn in the situation, or let a callback finish. A person can use all three in one conversation. The alternatives simplify a fictional moment; they are not mutually exclusive kinds of people.",
          "zh": "三篇原创画像命名不同侧重：让指涉容易理解、为当前场景添转折、让一次回扣自然结束。同一个人在一段对话里可以都用到。选项简化了虚构瞬间，不把人分成互不相容的三类。"
        }
      ]
    },
    {
      "id": "context",
      "title": {
        "en": "A context bridge is an invitation, not an entrance exam",
        "zh": "前情搭桥是邀请，不是入场考试"
      },
      "paragraphs": [
        {
          "en": "The Context-Bridge Joker gives just enough background for a reference to make sense. For example, “umbrella committee” might refer to three people once drawing the same umbrella. That single sentence can explain the phrase without requiring a new member to know who attended every earlier gathering.",
          "zh": "前情搭桥的接梗者只补足理解指涉需要的背景。例如，“雨伞委员会”可能来自三个人曾画了同一把伞。一句话就能解释这个称呼，不要求新成员记住每次旧聚会有哪些人。"
        },
        {
          "en": "Ask whether the person wants more rather than giving a compulsory history lesson. An understandable reference still need not be funny to them. This portrait records a preference for brief context in these options; it does not certify inclusion, empathy, memory or social ability.",
          "zh": "可让对方决定是否想多听，不必强行补完整历史。理解了指涉，对方也仍可觉得不好笑。画像只记录这些选项里偏向简短补背景的选择，不认证包容、共情、记忆或社交能力。"
        }
      ]
    },
    {
      "id": "twist",
      "title": {
        "en": "A new situation can be playful without making a person the target",
        "zh": "场景可以有趣，不必把某个人变成目标"
      },
      "paragraphs": [
        {
          "en": "The Situation-Twist Joker shifts the material toward an object or a new fictional turn. A craft-box typo might become a tiny office run by paper clips. That is a different idea from repeatedly attaching the error to the person who wrote the label.",
          "zh": "场景转折的接梗者把素材移向物体或新的虚构转折。手工盒的一处笔误，可以变成由回形针经营的微型办公室。这与反复把错误安在写标签的人身上，是不同的做法。"
        },
        {
          "en": "One small turn is enough; every reply does not need to outdo the previous line. A situation-based joke can also miss the moment or feel unwelcome. The portrait does not measure creativity, comic talent or permission to joke about someone else.",
          "zh": "一个小转折就可以，每次回应都不必超过上一句。以场景为素材的笑话也可能不合时宜或不受欢迎。画像不测创造力、喜剧天赋，也不授予拿别人开玩笑的许可。"
        }
      ]
    },
    {
      "id": "light",
      "title": {
        "en": "Let a callback end without judging anyone’s sense of humour",
        "zh": "回扣可以结束，不评判谁有没有幽默感"
      },
      "paragraphs": [
        {
          "en": "The Light-Touch Callback Keeper enjoys a familiar line without turning it into the group’s whole language. A smile can be followed by asking about the craft someone is making now. Silence, an ordinary reply and a new topic can all belong to the same relaxed conversation.",
          "zh": "轻轻回扣的接梗者可以欣赏一句旧笑点，而不让它变成小组的全部语言。笑一下之后，也可问问别人现在做的手作。安静、普通回应、新话题，都可以属于同一段轻松对话。"
        },
        {
          "en": "Moving on need not mean cutting off a person who wanted to add something. Leave a pause and notice what people actually say. Choosing fewer callbacks in this bank does not establish introversion, low humour ability or a lack of affection for the group.",
          "zh": "继续往前也不等于打断别人真想分享的内容。可以留个停顿，听大家实际说什么。在题组里较少延长回扣，不证明内向、幽默能力低，或不喜欢这个小组。"
        }
      ]
    },
    {
      "id": "impact",
      "title": {
        "en": "Not landing and causing harm require different responses",
        "zh": "没接住笑点，与已经造成伤害，需要分开处理"
      },
      "paragraphs": [
        {
          "en": "These questions begin with a harmless recurring reference. If someone says a joke was embarrassing, demeaning or unwelcome, changing the subject alone does not repair its impact. Stop the unwanted targeting, listen to the concern and respond to the actual situation; nobody owes a laugh or a public explanation to remain part of a group.",
          "zh": "本题组以无害的反复指涉为前提。若有人表示笑话令人难堪、贬低或不受欢迎，仅仅换话题并不修复影响。应停止不受欢迎的针对，听清对方的顾虑，再回应具体情境；任何人都不欠小组一声笑或一段公开解释，才有资格继续参与。"
        },
        {
          "en": "The Gottman Institute’s practical article distinguishes forms of joking and warns about contemptuous mockery. It is useful background for considering context and impact, but its discussion of relationships does not validate this six-choice story or establish that any portrait improves group outcomes. [1]",
          "zh": "Gottman Institute的实用文章区分不同幽默方式，并提醒留意带轻蔑意味的嘲弄。它可作为考虑情境与影响的背景资料，但其中的关系讨论不验证这份六次选择故事，也不证明任何画像会改善群体结果。 [1]"
        }
      ]
    },
    {
      "id": "counts",
      "title": {
        "en": "Six choices: three separate counts and every highest tie",
        "zh": "六次选择：三项独立计数，完整保留最高并列"
      },
      "paragraphs": [
        {
          "en": "Every selected option adds one to context, twist or light. Each emphasis is offered once in every scene, so each count ranges from zero to six and the three counts sum to six. The order of the options changes across scenes; choosing the first option repeatedly does not select the same emphasis throughout.",
          "zh": "每个所选项给前情、转折或轻轻回扣中的一项加一次。每个场景都各提供一次三种侧重，所以单项为0至6次，三项合计6次。不同场景的选项顺序会变化；一直选第一项，并不等于一直选同一种侧重。"
        },
        {
          "en": "The result displays all highest-count portraits, with no random draw or forced tie-break. Counts of two, two and two display all three. A one-choice difference is only one choice in this bank, not an established meaningful difference in humour, kindness or belonging.",
          "zh": "结果展示所有最高次数画像，不随机抽取，也不强行破同分。三项各两次，会完整显示三篇。一项相差一次，只代表本题组里的一次选择，不是已经确立的幽默、善意或归属感差异。"
        }
      ]
    },
    {
      "id": "readings",
      "title": {
        "en": "Use the complete portraits as conversation prompts",
        "zh": "把完整画像当作可讨论的情境提示"
      },
      "paragraphs": [
        {
          "en": "Each original portrait includes its summary, example, possible benefit, tradeoff and optional experiment. Compare the example with an actual occasion if you wish, then look for a counterexample too. Someone else’s account of their experience matters more than a label assigned by the game.",
          "zh": "每篇原始画像均包含概述、例子、可能用处、取舍与可选尝试。如愿意，可把例子带回一次实际经历，也找一个不符合的反例。对方对自身体验的说明，比小游戏分配的标签更重要。"
        },
        {
          "en": "You can read all three public guides before starting, without sharing a result. There is no best portrait, pass mark, loyalty level or group-approval score. This authored set is separate from published humour-style questionnaires and does not inherit their scales or validation evidence.",
          "zh": "开始之前就可以读完三篇公开指南，不必分享结果。没有最佳画像、通过线、忠诚等级或群体认可分。本原创题组与发表的幽默风格问卷分开，不继承其量尺或验证证据。"
        }
      ]
    },
    {
      "id": "privacy",
      "title": {
        "en": "No joke submission or group-message upload",
        "zh": "不用提交笑话，也不上传群聊"
      },
      "paragraphs": [
        {
          "en": "Start opens the first choice directly. No group name, contact list, chat screenshot or original joke is requested. Choices are resolved in the browser; optional tab saving lasts up to twenty-four hours and clears on completion, retake or deletion. Without saving, refreshing may lose progress.",
          "zh": "开始直接进入第一项选择。无需小组名称、联系人列表、群聊截图或原始笑话。选择在浏览器内解析；可选标签页保存最长二十四小时，完成、重玩或删除会清除。不保存时，刷新可能丢失进度。"
        },
        {
          "en": "A copied public entry or guide link does not contain your individual answers. Analytics allowed by your cookie settings are separate from answer content. You may discuss an imagined scene without identifying any real group or person.",
          "zh": "复制的公开入口或指南链接不包含个人答案。Cookie设置允许的使用统计，与答案内容分开。你可以只讨论想象场景，不指出任何真实小组或个人。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Does this measure how funny I am?",
        "zh": "这能测出我有多幽默吗？"
      },
      "answer": {
        "en": "No. It counts six hypothetical choices about a recurring group reference. Nobody judges a performance or measures humour ability, empathy or popularity.",
        "zh": "不能。它只统计关于群体旧指涉的六次假想选择，不评表演，也不测幽默能力、共情或受欢迎程度。"
      }
    },
    {
      "question": {
        "en": "Are these the styles in the Humor Styles Questionnaire?",
        "zh": "这里的分类是发表版幽默风格问卷吗？"
      },
      "answer": {
        "en": "No. Context, twist and light are this story’s authored emphases. They are not a shortened form of a published questionnaire and have no validated conversion to one.",
        "zh": "不是。前情、转折与轻轻回扣是本故事的原创侧重，不是发表问卷的缩略版，也没有经过验证的转换关系。"
      }
    },
    {
      "question": {
        "en": "Why can two or three portraits appear?",
        "zh": "为什么出现两篇或三篇画像？"
      },
      "answer": {
        "en": "Every emphasis with the highest count is shown in full. For example, three-three-zero displays two and two-two-two displays all three; neither result is an error.",
        "zh": "次数最高的各项都会完整显示。例如三、三、零显示两篇；二、二、二显示三篇，都不是错误。"
      }
    },
    {
      "question": {
        "en": "Must I explain a joke to someone who does not laugh?",
        "zh": "别人不笑，就必须解释笑话吗？"
      },
      "answer": {
        "en": "No. The context option offers a brief explanation when wanted. Understanding a reference does not create an obligation to laugh, join in or disclose why it was unfunny.",
        "zh": "不必。补前情选项是在有需要时提供简短说明。理解指涉不产生必须笑、参与或解释为何不好笑的义务。"
      }
    },
    {
      "question": {
        "en": "What if a joke has hurt someone?",
        "zh": "如果笑话已经伤到别人呢？"
      },
      "answer": {
        "en": "The harmless premise no longer describes that situation. Stop the unwanted targeting and address the concern; a new joke or topic change is not automatically a repair.",
        "zh": "此时已经不符合题组的无害前提。应停止不受欢迎的针对，回应对方顾虑；新笑话或换话题不自动等于修复。"
      }
    },
    {
      "question": {
        "en": "Can I read all results for free?",
        "zh": "可以免费读全部结果吗？"
      },
      "answer": {
        "en": "Yes. All three public guides and every highest-count report are complete, without registration, social sharing or payment. Retaking starts with fresh choices.",
        "zh": "可以。三篇公开指南与所有最高次数报告均完整开放，无需注册、分享或支付；重玩从未选择状态开始。"
      }
    },
    {
      "question": {
        "en": "Do I need to upload a real conversation?",
        "zh": "需要上传真实对话吗？"
      },
      "answer": {
        "en": "No. All six scenes are supplied. Do not add private messages, names or screenshots; there is no input field requesting them.",
        "zh": "不需要。六个场景已提供，页面不要求输入私人消息、姓名或截图。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.gottman.com/blog/humor-build-relationships/",
      "label": {
        "en": "Gottman Institute: practical discussion of humour and relational context",
        "zh": "Gottman Institute：幽默与关系情境的实用讨论"
      }
    }
  ]
},
  "house-of-doors": {
  "label": {
    "en": "Original branching fiction · Three complete endings free",
    "zh": "原创分支故事 · 三篇完整结局免费"
  },
  "instructions": {
    "en": "Enter an imaginary exhibition house and follow the detail you want to explore. You make three or four choices along one route. Each choice opens the next scene or a complete ending; there are no points, correct doors or hidden personality categories.",
    "zh": "进入想象中的展览小屋，跟随你想探索的细节。沿一条路线选择三至四次；每次选择打开下一个场景或完整结局，不累计分数，不设正确的门，也不判隐藏人格。"
  },
  "sections": [
    {
      "id": "purpose",
      "title": {
        "en": "House of Doors: a short story you navigate",
        "zh": "门中小屋：由选择推进的短篇故事"
      },
      "paragraphs": [
        {
          "en": "A tapping paper mobile, a moving patch of light and an unfinished object offer different things to follow. The house is a fictional exhibition with a clear exit. You do not solve a locked-room puzzle, identify an intruder or prove courage; you choose which written scene to visit next.",
          "zh": "纸悬饰的轻响、移动的一片光、尚未完成的小物，提供不同的探索线索。这是一座出口清楚的虚构展览小屋。你不需要解密逃脱、辨认闯入者或证明勇气，只是在写好的场景之间选择下一步。"
        },
        {
          "en": "The route can stop in a workshop, a listening room or a window garden. Each ending includes a scene, a possible use of that stopping point, a tradeoff and a small optional writing or drawing idea. These readings extend the fiction rather than interpret your unconscious.",
          "zh": "路线可以停在工作间、聆听室或窗边花园。每篇结局包含场景、这一停点的用处、取舍，以及可选的小写作或绘画点子。读法延续虚构世界，不解释你的潜意识。"
        }
      ]
    },
    {
      "id": "routes",
      "title": {
        "en": "Three or four choices, rather than six questions in a row",
        "zh": "三至四次选择，不是连续回答六题"
      },
      "paragraphs": [
        {
          "en": "The story contains six authored scene nodes, but a single visit reaches only three or four of them. From the entry hall, the sound opens the paper-mobile scene and the light opens the stair scene. Later choices may converge on the same curtain or window; sharing a scene does not mean your earlier choice was ignored.",
          "zh": "故事共写有六个场景节点，单次参观只经过其中三至四个。入口的声音通向纸悬饰场景，光通向楼梯场景。后续路线可能汇入同一片帘或同一扇窗；经过共同场景，不表示之前的选择被忽略。"
        },
        {
          "en": "A terminal choice selects one ending directly. Across the complete authored graph there are ten reachable routes: six have three choices and four have four. Four routes end at the workshop, three at the listening room and three at the garden. These are counts of written paths, not visitor frequencies or a probability that a room fits you.",
          "zh": "终点选项直接决定一篇结局。整张已写好的路线图有十条可达路径：六条需要三次选择，四条需要四次。四条到工作间、三条到聆听室、三条到花园。这是文本路径数量，不是访客比例，也不是房间适合你的概率。"
        }
      ]
    },
    {
      "id": "workshop",
      "title": {
        "en": "The workshop: try a connection without creating an obligation",
        "zh": "工作间：试一次连接，不追加完成义务"
      },
      "paragraphs": [
        {
          "en": "A route can reach the workshop by joining two imaginary pieces at the table or by proposing a new object on a spare garden label. The same ending therefore has more than one approach. It does not establish that all your choices expressed a single maker personality.",
          "zh": "在桌边把两件想象零件接起来，或在花园空标签上提议一个新小物，都可能通向工作间。同一个结局因此可以有不同来路；它不证明每次选择都表达了同一种创作者人格。"
        },
        {
          "en": "An original extension is to imagine a paper hinge attached to an empty frame, then remove it when the experiment is over. Looking without building is also a complete visit. You need no tools or materials, and the ending does not assign creativity, practical ability or a duty to finish a project.",
          "zh": "一个原创延伸是想象纸铰接上空框，试完再拆开。只看不做，也是一趟完整参观。无需工具或材料，结局不评创造力、动手能力，也不要求完成一项工程。"
        }
      ]
    },
    {
      "id": "listening",
      "title": {
        "en": "The listening room: a pause in the fiction",
        "zh": "聆听室：故事里的一个停顿"
      },
      "paragraphs": [
        {
          "en": "You may reach the listening room by following the corridor, accepting the curtain’s invitation or pausing beside the unfinished pieces. Its small sounds are described in text. This page does not play an audio stimulus, assess hearing or decode a secret message from what you notice.",
          "zh": "沿廊道走、接受帘上的邀请，或在未完零件旁停听，都可能到聆听室。小声音由文字描述；页面不播放测听刺激，不测听力，也不从你注意到的内容里解码秘密信息。"
        },
        {
          "en": "For an optional story exercise, place a paper tapping sound, a distant step and an imagined window rustle in a different order. Describe the timing without prescribing how a reader should feel. Quiet may suit one fictional visit and not another; this is not a relaxation treatment.",
          "zh": "可选的故事练习是把纸片轻响、远处脚步、想象中的窗边窸窣声重新排序，只写时序，不规定读者应有何种感受。安静可能适合这一趟虚构参观，也可能不适合另一趟；这不是放松治疗。"
        }
      ]
    },
    {
      "id": "garden",
      "title": {
        "en": "The window garden: let the world continue after the ending",
        "zh": "窗边花园：结尾之后，世界仍可继续"
      },
      "paragraphs": [
        {
          "en": "The garden ending follows the final invitation to leave an imagined growing place. Other routes arrive at that window and choose the spare label instead, returning to the workshop. Simply seeing the garden scene therefore does not guarantee the garden ending.",
          "zh": "花园结局来自最后留下想象生长位置的选择。其他路线也会走到窗边，却可能选空标签，转而到工作间。因此，看过花园场景，不等于一定获得花园结局。"
        },
        {
          "en": "An original continuation might show a leaf shadow moving across an unused label after the visitor leaves. It can remain small and uneven. No transformation, better life stage, spiritual growth or botanical knowledge is inferred from this ending.",
          "zh": "一个原创续写可以描绘访客离开后，叶影移过尚未使用的标签。小园可以始终很小、并不整齐。结局不推断人格蜕变、更好的生命阶段、灵性成长或植物知识。"
        }
      ]
    },
    {
      "id": "mechanism",
      "title": {
        "en": "Branching fiction and the limits of psychological interpretation",
        "zh": "分支叙事与心理解释的边界"
      },
      "paragraphs": [
        {
          "en": "Interactive-fiction tools describe choices that redirect a reader and paths that can join again. Inklewriter’s official guide explains both following options and joining branches; the French-language Fiction-interactive introduction distinguishes hyperlink fiction from command-parser games. These references explain narrative form, not the validity of a psychological test. [1] [2]",
          "zh": "互动小说工具会说明选择怎样改变下一段，以及分支怎样重新汇合。Inklewriter官方指南介绍跟随选项与连接分支；法语Fiction-interactive入门区分超链接小说与指令解析游戏。这些资料解释叙事形式，不验证心理测试。 [1] [2]"
        },
        {
          "en": "This edition uses fixed authored text and deterministic links. It does not generate a room with AI, select one randomly or score symbolic door colours. A different result after retaking means you followed different links; it cannot establish a personality change or a newly discovered hidden trait.",
          "zh": "本版使用固定原创文字和确定的链接关系，不用AI临时生成房间，不随机抽取，不按门的象征颜色计分。重玩后换了结局，说明走过不同链接，不能证明人格改变或新发现隐藏特质。"
        }
      ]
    },
    {
      "id": "replay",
      "title": {
        "en": "Read every ending, or return and choose another route",
        "zh": "读完三篇结局，也可以返回选择另一条路"
      },
      "paragraphs": [
        {
          "en": "Start opens the entry-hall choice directly. Before finishing, Back lets you return to an earlier scene. Changing a branch clears answers farther down the old route, so a choice in a room you no longer visit is not carried into the new ending. No agreement screen, name, birthday or account is required.",
          "zh": "开始直接打开入口厅选项。完成前可以返回之前场景；改变分支后，旧路线后方的选择会清除，不把本次已经不会参观的房间选择带入新结局。无需再次同意、填写名字、生日或账户。"
        },
        {
          "en": "All three public ending guides are available from this page without completing a visit. Opening a guide does not submit a route or change the ending you already reached. Retake starts with an empty entry-hall choice; neither discovering all rooms nor choosing a particular one is a success condition.",
          "zh": "三篇公开结局指南都可以从本页直接阅读，不必先完成参观。打开指南不会提交路线或改掉已经到达的结局。重玩从尚未选择的入口厅开始；发现所有房间或选到某一间，都不是通关标准。"
        }
      ]
    },
    {
      "id": "privacy",
      "title": {
        "en": "Optional tab saving and a private fictional route",
        "zh": "可选标签页保存与私人虚构路线"
      },
      "paragraphs": [
        {
          "en": "Choices are resolved in the browser. Optional saving stores this edition’s progress in the current tab for up to twenty-four hours; completion, retake or clearing removes that draft. Without saving, a refresh can lose the route. No location, recording, photograph or real floor plan is needed.",
          "zh": "选择在浏览器内解析。可选保存把本版进度留在当前标签页，最长二十四小时；完成、重玩或清除会删除草稿。不保存时，刷新可能丢失路线。无需位置、录音、照片或真实户型图。"
        },
        {
          "en": "The route is not included in the public guide URL or a copied story entry link. Site usage analytics, when permitted by your cookie settings, are separate from the story answers. You can discuss a fictional scene without revealing which route you took.",
          "zh": "路线不写进公开指南网址或复制的故事入口链接。网站在Cookie设置允许时记录的使用统计，与故事答案分开。你可以只讨论一个虚构场景，不透露自己的路线。"
        }
      ]
    }
  ],
  "faq": [
    {
      "question": {
        "en": "Is House of Doors a personality test?",
        "zh": "门中小屋是人格测试吗？"
      },
      "answer": {
        "en": "It is an original branching story. Choices follow fixed links to a room ending; they do not measure a latent trait, supply a diagnosis or support a projective interpretation.",
        "zh": "这是原创分支故事。选择沿固定链接通向一个房间结局，不测潜在特质，不作诊断，也不支持投射式心理解释。"
      }
    },
    {
      "question": {
        "en": "Why do I answer fewer than six scenes?",
        "zh": "为什么没有回答六个场景？"
      },
      "answer": {
        "en": "Six is the size of the scene pool. Each complete route visits three or four scenes, and reaching a terminal choice ends the visit without asking unrelated branches.",
        "zh": "六是整个场景池的大小。每条完整路线参观三至四个场景，到终点选项就结束，不再询问未经过的分支。"
      }
    },
    {
      "question": {
        "en": "How is the room chosen?",
        "zh": "房间结局怎样决定？"
      },
      "answer": {
        "en": "The last option on your route points directly to workshop, listening or garden. There is no point total, highest score, tie-breaking rule or random draw for this story.",
        "zh": "路线最后一个选项直接指向工作间、聆听室或花园。本故事没有累计点数、最高分、破同分规则或随机抽签。"
      }
    },
    {
      "question": {
        "en": "Can different routes reach the same room?",
        "zh": "不同路线可以到同一个房间吗？"
      },
      "answer": {
        "en": "Yes. Branches can rejoin, and different terminal choices can name the same ending. The ten written routes are not ten distinct psychological types.",
        "zh": "可以。分支可以汇合，不同终点选项也可以指向同一结局。十条已写路径不代表十种心理类型。"
      }
    },
    {
      "question": {
        "en": "Does changing an earlier choice retain the old route?",
        "zh": "修改前面的选择，会保留旧路线吗？"
      },
      "answer": {
        "en": "Changing a branch removes later answers from the previous route. You then follow the new scene sequence; an abandoned room cannot determine its ending.",
        "zh": "修改分支会移除旧路线后面的答案，然后按新场景顺序继续；已经放弃的房间不能决定新结局。"
      }
    },
    {
      "question": {
        "en": "Must I listen to audio or draw anything?",
        "zh": "必须听音频或绘画吗？"
      },
      "answer": {
        "en": "No. Every required choice is textual. Drawing and writing ideas belong to optional ending activities; they are not uploaded or needed to complete the story.",
        "zh": "不需要。所有必要选择都由文字呈现。绘画与写作点子只是结局中的可选活动，不上传，也不影响完成故事。"
      }
    },
    {
      "question": {
        "en": "Are the three endings free and complete?",
        "zh": "三个结局都免费且完整吗？"
      },
      "answer": {
        "en": "Yes. Each has its original summary, example, benefit, tradeoff and optional experiment, plus a public guide. No purchase, registration or social sharing unlock is required.",
        "zh": "是。每篇保留原始概述、例子、用处、取舍与可选尝试，并有公开指南。不需要购买、注册或分享解锁。"
      }
    },
    {
      "question": {
        "en": "What does getting another room on a retake mean?",
        "zh": "重玩得到另一个房间说明什么？"
      },
      "answer": {
        "en": "It means the new choices reached a different terminal link. The story has no longitudinal measurement model, so the change does not quantify personality development or emotional recovery.",
        "zh": "说明新选择走到了不同终点链接。故事没有纵向测量模型，因此变化不量化人格发展或情绪恢复。"
      }
    }
  ],
  "references": [
    {
      "url": "https://www.inklestudios.com/inklewriter/getting-started/",
      "label": {
        "en": "Inklewriter: following choices, rewinding and joining paths",
        "zh": "Inklewriter：跟随选择、返回与连接分支"
      }
    },
    {
      "url": "https://www.fiction-interactive.fr/creer/par-ou-commencer/",
      "label": {
        "en": "Fiction-interactive.fr: hyperlink and parser fiction (French)",
        "zh": "Fiction-interactive.fr：超链接与指令解析小说（法语）"
      }
    }
  ]
},
  "group-project-finale": {
    "label": {
      "en": "Original shared-project scenes · All three portraits free",
      "zh": "原创共同作品情境 · 三篇完整画像免费"
    },
    "instructions": {
      "en": "Imagine a voluntary paper-model project that is ready to finish. Choose what you would prioritize in each of six scenes. No project-management knowledge is tested; the result retains every highest count.",
      "zh": "想象一个自愿合作、已经可以完成的纸模型项目。六个场景里选自己较想优先处理的一项，不考项目管理知识；结果保留全部最高并列。"
    },
    "sections": [
      {
        "id": "purpose",
        "title": {
          "en": "A shared hobby project needs an ending, not another assignment",
          "zh": "共同小作品的结尾，不自动变成下一项任务"
        },
        "paragraphs": [
          {
            "en": "The six scenes follow a finished paper model: acknowledging contributions, deciding what can be shown, noticing supporting work, dealing with leftover materials, receiving a new idea and choosing a satisfying finish. The makers joined for enjoyment and are not being graded.",
            "zh": "六个场景围绕已经做好的纸模型展开：说明贡献、决定展示什么、注意支持工作、处理剩余材料、面对新点子、选择满足的结尾。参与者为乐趣合作，不接受表现评分。"
          },
          {
            "en": "The three portraits describe different closing priorities: accurate credit, a usable final version and an optional shared moment. They are authored ways to discuss this little collaboration. A practical handover can coexist with thanks and a quiet finish; the game asks which you choose among its alternatives.",
            "zh": "三篇画像描述不同收尾重点：准确致意、可用最终版本、自愿共同瞬间。这些是讨论本次小合作的原创角度。实际交接可以与感谢、安静结束并存；小游戏只问给定选项里你较想选什么。"
          }
        ]
      },
      {
        "id": "credit",
        "title": {
          "en": "Specific thanks: describe the work someone actually did",
          "zh": "具体致意：说清对方实际做过的工作"
        },
        "paragraphs": [
          {
            "en": "The Specific-Thanks Keeper notices work that could disappear from the final account. An original example is naming who tried the folding pattern and who arranged the shared paper, rather than thanking only the person who placed the last piece. Accurate thanks do not require pretending everyone made an identical contribution.",
            "zh": "具体致谢保留者留意最终叙述里容易消失的工作。一个原创例子是说明谁试了折叠方式、谁备好共用纸张，不只感谢放上最后一片的人。准确感谢不要求假装每人贡献完全相同。"
          },
          {
            "en": "Ask how the makers want to be named before sharing a photo or credit note. A person may prefer private thanks or no name. The portrait does not establish fairness, leadership ability or who deserves the most recognition; actual contributions and sharing preferences need a conversation.",
            "zh": "分享照片或贡献便条前，问作者希望怎样被提到。有人可能偏好私下感谢或不署名。画像不裁定公平、领导能力或谁最值得认可；实际贡献与分享偏好需要双方核对。"
          }
        ]
      },
      {
        "id": "handover",
        "title": {
          "en": "A final version: leave a useful place to return to",
          "zh": "最终版本：留下以后能找到的状态"
        },
        "paragraphs": [
          {
            "en": "The Final-Version Keeper makes the ending easy to find. You might identify one agreed photo, say where the original model will stay and return borrowed supplies. The useful detail is which version the group chose to keep, rather than a large archive of every draft.",
            "zh": "最终版本保留者让结尾方便寻找。可以标出一张大家认可的照片，说明原模型放哪，归还借来的用品。关键是小组决定保留哪个版本，不是给所有草稿建巨大档案。"
          },
          {
            "en": "A new idea can have a separate note without becoming a new commitment. Check ownership before discarding materials or deleting a draft. This portrait concerns the chosen final state in these scenes, not a general measure of organization, reliability or professional project competence.",
            "zh": "新点子可另记一笔，不必变成新承诺。丢材料或删草稿前先问清所有者。这篇画像只谈场景里选择的最终状态，不测一般组织能力、可靠性或专业项目胜任力。"
          }
        ]
      },
      {
        "id": "moment",
        "title": {
          "en": "A chosen finish: let completing be enough",
          "zh": "主动收尾：让完成本身已经足够"
        },
        "paragraphs": [
          {
            "en": "The Chosen-Finish Companion gives willing makers a moment to enjoy what exists. For example, invite a brief shared look, allow people to say one thing if they want, then let them leave. A finish can be quiet; it does not require a public event or a celebration everyone must attend.",
            "zh": "主动收尾的伙伴给愿意的作者一点欣赏现有作品的时间。例如邀请一起看一眼，让人自愿说一件事，再允许离开。结尾可以很安静，不必办公开活动或人人必须参加的庆祝。"
          },
          {
            "en": "A shared moment does not return borrowed scissors or decide where the model goes. Those practical steps can accompany it. A high count here does not prove emotional intelligence or team cohesion, and a low count does not mean you fail to appreciate other people.",
            "zh": "共同瞬间不能代替归还剪刀或决定模型归处，这些实际步骤也可一起做。这里次数高不证明情商或团队凝聚力，次数低也不意味着不欣赏别人。"
          }
        ]
      },
      {
        "id": "context",
        "title": {
          "en": "Professional closure guidance is context, not this game’s authority",
          "zh": "专业收尾指南提供背景，不是本小游戏的计分依据"
        },
        "paragraphs": [
          {
            "en": "Asana’s project-closure guide discusses documenting results, handing work over and keeping files accessible. That is useful background for the distinction between a finished object and a usable handover. Its formal project processes are not requirements for a voluntary hobby group. [1]",
            "zh": "Asana项目收尾指南讨论记录成果、交接工作、方便查找文件。这有助于区分“做出成品”和“留下可用交接”；其中正式项目流程不是自愿爱好小组必须执行的步骤。[1]"
          },
          {
            "en": "Atlassian distinguishes a team retrospective from a learning that can help other teams. For this story, an optional note might simply say what the makers would want to remember. Neither provider validates these three portraits, and no published project-management assessment is administered here. [2]",
            "zh": "Atlassian区分团队回顾与可帮助其他团队的经验记录。在本故事里，可选的一笔记录只是作者希望记住什么。两家提供者均未验证这三篇画像；这里也没有施测发表过的项目管理量表。[2]"
          }
        ]
      },
      {
        "id": "counts",
        "title": {
          "en": "Six choices, three counts and every highest tie",
          "zh": "六次选择、三项次数与全部最高并列"
        },
        "paragraphs": [
          {
            "en": "Every selected option adds one to its named portrait. All six answers are needed for a completed result. Each count ranges from 0 to 6, and their sum is 6. The numbers summarize choices within these supplied scenes, not percentages of a trait or positions in a population.",
            "zh": "每个所选项给其对应画像加一次，六题全答后才形成完整结果。每项0至6，三项总和6；数字概括给定场景中的选择，不是特质占比或人群位置。"
          },
          {
            "en": "Every portrait sharing the highest count remains in the result. A 4–1–1 example has one leader, 3–3–0 has two and 2–2–2 has all three. There are seven possible highest sets. The display order does not break a tie, and a one-point difference is not an established meaningful personal difference.",
            "zh": "最高次数相同的画像全部保留。4—1—1示例有一项最高，3—3—0有两项，2—2—2三项全并列，共七种最高集合。展示顺序不打破并列，相差一次也不是已经验证的个人显著差异。"
          }
        ]
      },
      {
        "id": "reading",
        "title": {
          "en": "Read the example and tradeoff beside the portrait",
          "zh": "把画像与例子、取舍一起阅读"
        },
        "paragraphs": [
          {
            "en": "All three public guides remain open before and after answering. Each has its complete summary, everyday example, possible benefit, tradeoff and optional small experiment. A tie shows the full text of every highest portrait, rather than choosing just one or hiding the rest.",
            "zh": "三篇公开指南在作答前后都能读到完整概述、日常例子、可能用处、取舍与可选小尝试。并列会展示每篇最高画像的全文，不只挑一篇，也不把其余藏起来。"
          },
          {
            "en": "These are original scene-based explanations, without established reliability, population norms or cross-language measurement equivalence. Read a useful idea against an actual situation and a counterexample. A different answer later can reflect a different imagined situation; it is not evidence that a stable personality type has changed.",
            "zh": "这些是基于场景的原创解释，未建立信度、人群常模或双语测量等值性。把有用的想法放回具体情境，也找一个不符合的例子。以后选得不同可能是想象情境不同，不证明固定人格类型发生改变。"
          }
        ]
      },
      {
        "id": "privacy",
        "title": {
          "en": "Direct start, optional tab saving and a fresh attempt",
          "zh": "直接开始、自愿标签页保存与重新作答"
        },
        "paragraphs": [
          {
            "en": "Start opens the first scene, with no agreement checkbox, registration or prior assessment. Back lets you revisit a scene before finishing. Saving is an optional tab-only draft, not a condition for seeing complete results; saved drafts expire after 24 hours and clear on completion or retake.",
            "zh": "开始会直接打开第一个场景，无需勾选同意、注册或先做其他测评。完成前可以返回修改场景；保存只是本标签页自愿草稿，不是查看全文的条件，24小时失效，完成或重测时清除。"
          },
          {
            "en": "Choices are resolved in the browser, separately from the six main assessments. Sharing copies a public result name and guide link rather than the six answers. You can read, retake or leave without following an optional recommendation. No recipient, host, traveler or group member needs to supply personal information.",
            "zh": "选择在浏览器内按本故事规则计算，与六大测评独立。分享复制公开结果名称与指南链接，不复制六道答案。可以阅读、重测或离开，无需继续推荐内容；不要求收件人、主人、同行者或小组成员提供私人资料。"
          }
        ]
      }
    ],
    "faq": [
      {
        "question": {
          "en": "Is this a project-management knowledge exam?",
          "zh": "这是项目管理知识考试吗？"
        },
        "answer": {
          "en": "No. Every option is a possible response to a fictional hobby scene. No answer is marked correct, and the counts are not a certificate or a performance appraisal.",
          "zh": "不是。每项都是虚构爱好场景的一种回应，没有正确答案，次数不是证书或表现评价。"
        }
      },
      {
        "question": {
          "en": "Must every contribution receive the same credit?",
          "zh": "每个人都必须得到相同的贡献说明吗？"
        },
        "answer": {
          "en": "The credit portrait favors describing actual work accurately. It does not prescribe equal roles or rank participants. Ask how the people involved want their work described.",
          "zh": "具体致意画像重视准确描述实际工作，不规定相同分工，也不排列参与者高低。请问有关的人希望怎样说明。"
        }
      },
      {
        "question": {
          "en": "Does finishing commit us to the next idea?",
          "zh": "完成是否意味着必须接着做新点子？"
        },
        "answer": {
          "en": "No. In these scenes a new idea can remain separately optional. The group’s real commitments must be agreed by the people who would undertake them.",
          "zh": "不意味着。场景中新点子可独立保持可选；真实承诺要由实际承担的人共同约定。"
        }
      },
      {
        "question": {
          "en": "May I upload a real group photo or list of contributors?",
          "zh": "需要上传小组照片或贡献名单吗？"
        },
        "answer": {
          "en": "No. Answer the supplied choices without entering names, images or private project files. The optional example can remain an imagined paper model.",
          "zh": "不需要。只选现有选项，不输入姓名、图片或私人项目文件；可选例子也可以一直用想象纸模型。"
        }
      },
      {
        "question": {
          "en": "How are ties handled?",
          "zh": "并列怎样处理？"
        },
        "answer": {
          "en": "All portraits with the highest raw count are retained in full. No random draw or option-position rule selects one winner.",
          "zh": "所有同为最高次数的画像都完整保留，不随机抽取，也不按选项位置挑一个赢家。"
        }
      },
      {
        "question": {
          "en": "Is every portrait and its complete guide free?",
          "zh": "每种画像及完整指南都免费吗？"
        },
        "answer": {
          "en": "Yes. All three public guides and all highest portraits in your result are available without signup, payment or another test.",
          "zh": "是。三篇公开指南与结果中所有最高画像都可直接完整阅读，不需注册、付费或另做测试。"
        }
      },
      {
        "question": {
          "en": "What does a lower count mean?",
          "zh": "次数较低意味着什么？"
        },
        "answer": {
          "en": "You chose that response less often among these six sets of alternatives. It is not a missing ability, a defect or evidence about another person.",
          "zh": "只表示本组六次选项比较里较少选该方向，不是能力缺失、缺点或关于另一个人的证据。"
        }
      },
      {
        "question": {
          "en": "Can I change an answer or start over?",
          "zh": "可以改答案或重新开始吗？"
        },
        "answer": {
          "en": "Use Back before completion to revisit a scene. Retake starts a fresh six-choice attempt and clears the old draft; it does not merge attempts.",
          "zh": "完成前用上一题回看场景；重测会开始新的六次选择并清除旧草稿，不合并多次作答。"
        }
      }
    ],
    "references": [
      {
        "url": "https://asana.com/resources/project-closure",
        "label": {
          "en": "Asana: project closure and practical handover",
          "zh": "Asana：项目收尾与实际交接背景"
        }
      },
      {
        "url": "https://support.atlassian.com/platform-experiences/docs/record-and-share-your-project-learnings/",
        "label": {
          "en": "Atlassian: recording learnings and distinguishing a retrospective",
          "zh": "Atlassian：经验记录与团队回顾的区别"
        }
      }
    ]
  },
  "group-trip-seatmate": {
    "label": {
      "en": "Original neighboring-seat scenes · All three portraits free",
      "zh": "原创邻座情境 · 三篇完整画像免费"
    },
    "instructions": {
      "en": "Imagine a comfortable, ordinary shared journey. Choose what you would prefer in six neighboring-seat situations. Conversation, quiet company and practical agreements are all available; no real journey or partner’s answers are needed.",
      "zh": "想象一段普通、舒适的共同旅程。六个邻座场景里选自己的偏好；聊天、安静作伴、实际约定都可选，无需真实出行或伴侣答卷。"
    },
    "sections": [
      {
        "id": "purpose",
        "title": {
          "en": "Travel companions: one shared stretch, several ways to be together",
          "zh": "同行邻座：同一段路上的几种相处方式"
        },
        "paragraphs": [
          {
            "en": "This six-choice story stays close to a neighboring seat: greeting, an uneventful stretch, an interruption while reading, a shared table, a question about silence and a comfortable ending. It does not ask you to select a destination, book a holiday or judge a real stranger.",
            "zh": "六次选择始终围绕邻座：打招呼、平静路段、阅读时被搭话、共用小桌、被问安静是否不好、舒服的结尾。不需要选目的地、订假期或评价真实陌生人。"
          },
          {
            "en": "The portraits concern light conversation, parallel activity and clear shared-space arrangements. You can enjoy all three. A choice in one short scene does not identify a universal travel personality or establish which person you should take on a trip.",
            "zh": "画像讨论轻松交谈、各做各事、说明共用空间安排。三种都可以喜欢；短场景里的选择不鉴定普遍旅行人格，也不能决定你应带谁出游。"
          }
        ]
      },
      {
        "id": "talk",
        "title": {
          "en": "Conversation with an easy pause",
          "zh": "能轻松开始，也能自在暂停的聊天"
        },
        "paragraphs": [
          {
            "en": "The Easy-Conversation Seatmate offers a small opening and checks whether it is welcome. An original example is asking about a book the companion has chosen to mention, then returning to your own page at a natural pause. Keeping a conversation possible is different from keeping every minute filled.",
            "zh": "轻松交流的邻座开一个小话题，也留意对方是否愿意。一个原创例子是问对方主动提到的书，再在自然停顿处回到自己书页。让交流有可能，不等于填满每一分钟。"
          },
          {
            "en": "A short answer is enough reason to leave room, without diagnosing why the other person is quiet. A high talk count does not measure popularity, extraversion or skill at making friends. It records that you selected these conversational responses among the offered alternatives.",
            "zh": "简短回应已足以让人留些空间，不必诊断对方为何安静。聊天次数高不测受欢迎程度、外向性或交友能力，只记录本组选项中较常选这些对话回应。"
          }
        ]
      },
      {
        "id": "parallel",
        "title": {
          "en": "Parallel activity: presence without a continuous exchange",
          "zh": "并行活动：在一起，也可以不持续交换话语"
        },
        "paragraphs": [
          {
            "en": "The Parallel-Page Seatmate keeps company through nearby independent activity. Two willing travelers might read different books and occasionally share a sentence. Either can ask for a quiet stretch without treating the other person as absent.",
            "zh": "并行书页的邻座通过靠近的独立活动作伴。两位愿意的同行者可读不同的书，偶尔分享一句；任何一方都可提出安静一段时间，不把另一人视为缺席。"
          },
          {
            "en": "Silence can mean many things, so an ordinary statement of preference is more useful than an inference about friendship. This portrait does not establish loneliness, avoidance or incompatibility. The question is what arrangement both people can willingly use now.",
            "zh": "安静可能有很多原因，一句普通偏好说明比猜友谊状态更有用。这篇画像不判定孤独、回避或不合适，只问此刻双方都愿意采用什么安排。"
          }
        ]
      },
      {
        "id": "practical",
        "title": {
          "en": "Shared space: resolve the actual small constraint",
          "zh": "共用空间：处理真正碍事的那件小事"
        },
        "paragraphs": [
          {
            "en": "The Clear-Space Seatmate notices a practical obstacle before adding another activity. An original example is agreeing on one turn with a small table so a book and a map need not compete for it at once. An arrangement can be simple and temporary.",
            "zh": "共用空间说得清的邻座先注意实际障碍，不急着再添活动。一个原创例子是给小桌约一个轮次，让书和地图不用同时争位置。安排可以简单，也只适用这一小段。"
          },
          {
            "en": "You are not appointed manager of the group. Ask what actually needs changing instead of organizing every bag and every minute. The count is not a logistics score, a safety qualification or evidence that you should carry the group’s practical work.",
            "zh": "你没有因此被任命为全团管理者。问什么确实需要调整，不必管理每个包、每一分钟。次数不是后勤能力分、安全资格，也不意味着应该承担全组实际工作。"
          }
        ]
      },
      {
        "id": "context",
        "title": {
          "en": "Real travel guidance and this fictional choice game",
          "zh": "真实出行资料与本虚构选择小游戏"
        },
        "paragraphs": [
          {
            "en": "National Rail describes quiet coaches as shared spaces with specific expectations about calls, devices and conversation. It also notes that operators may differ. That supports taking the actual setting into account; it does not validate a seatmate type or make silence a personality diagnosis. [1]",
            "zh": "英国National Rail介绍安静车厢对通话、设备与交谈的特定期待，也提醒不同运营者可能有不同规则。这支持先看实际环境，不验证邻座类型，也不把安静变成人格诊断。[1]"
          },
          {
            "en": "TGV INOUI’s French on-board page likewise discusses respecting quiet and using headphones. Our scenes ask about a willing social arrangement, not transport compliance. During real travel, follow the operator’s current instructions rather than a result portrait. [2]",
            "zh": "TGV INOUI法语乘车页同样讨论尊重安静和使用耳机。本场景问自愿相处安排，不是交通规则测试。真实出行请遵循运营者当时的说明，不按画像替代规则。[2]"
          }
        ]
      },
      {
        "id": "counts",
        "title": {
          "en": "Six choices, three counts and every highest tie",
          "zh": "六次选择、三项次数与全部最高并列"
        },
        "paragraphs": [
          {
            "en": "Every selected option adds one to its named portrait. All six answers are needed for a completed result. Each count ranges from 0 to 6, and their sum is 6. The numbers summarize choices within these supplied scenes, not percentages of a trait or positions in a population.",
            "zh": "每个所选项给其对应画像加一次，六题全答后才形成完整结果。每项0至6，三项总和6；数字概括给定场景中的选择，不是特质占比或人群位置。"
          },
          {
            "en": "Every portrait sharing the highest count remains in the result. A 4–1–1 example has one leader, 3–3–0 has two and 2–2–2 has all three. There are seven possible highest sets. The display order does not break a tie, and a one-point difference is not an established meaningful personal difference.",
            "zh": "最高次数相同的画像全部保留。4—1—1示例有一项最高，3—3—0有两项，2—2—2三项全并列，共七种最高集合。展示顺序不打破并列，相差一次也不是已经验证的个人显著差异。"
          }
        ]
      },
      {
        "id": "reading",
        "title": {
          "en": "Read the example and tradeoff beside the portrait",
          "zh": "把画像与例子、取舍一起阅读"
        },
        "paragraphs": [
          {
            "en": "All three public guides remain open before and after answering. Each has its complete summary, everyday example, possible benefit, tradeoff and optional small experiment. A tie shows the full text of every highest portrait, rather than choosing just one or hiding the rest.",
            "zh": "三篇公开指南在作答前后都能读到完整概述、日常例子、可能用处、取舍与可选小尝试。并列会展示每篇最高画像的全文，不只挑一篇，也不把其余藏起来。"
          },
          {
            "en": "These are original scene-based explanations, without established reliability, population norms or cross-language measurement equivalence. Read a useful idea against an actual situation and a counterexample. A different answer later can reflect a different imagined situation; it is not evidence that a stable personality type has changed.",
            "zh": "这些是基于场景的原创解释，未建立信度、人群常模或双语测量等值性。把有用的想法放回具体情境，也找一个不符合的例子。以后选得不同可能是想象情境不同，不证明固定人格类型发生改变。"
          }
        ]
      },
      {
        "id": "privacy",
        "title": {
          "en": "Direct start, optional tab saving and a fresh attempt",
          "zh": "直接开始、自愿标签页保存与重新作答"
        },
        "paragraphs": [
          {
            "en": "Start opens the first scene, with no agreement checkbox, registration or prior assessment. Back lets you revisit a scene before finishing. Saving is an optional tab-only draft, not a condition for seeing complete results; saved drafts expire after 24 hours and clear on completion or retake.",
            "zh": "开始会直接打开第一个场景，无需勾选同意、注册或先做其他测评。完成前可以返回修改场景；保存只是本标签页自愿草稿，不是查看全文的条件，24小时失效，完成或重测时清除。"
          },
          {
            "en": "Choices are resolved in the browser, separately from the six main assessments. Sharing copies a public result name and guide link rather than the six answers. You can read, retake or leave without following an optional recommendation. No recipient, host, traveler or group member needs to supply personal information.",
            "zh": "选择在浏览器内按本故事规则计算，与六大测评独立。分享复制公开结果名称与指南链接，不复制六道答案。可以阅读、重测或离开，无需继续推荐内容；不要求收件人、主人、同行者或小组成员提供私人资料。"
          }
        ]
      }
    ],
    "faq": [
      {
        "question": {
          "en": "Does this compare two people’s compatibility?",
          "zh": "这会比较两个人的旅行适配度吗？"
        },
        "answer": {
          "en": "No. Only your six selections are scored. There is no second person’s record, matching percentage or recommendation about whom to travel with.",
          "zh": "不会。只计算本人的六次选择，没有另一人的记录、配对百分比或该与谁出游的建议。"
        }
      },
      {
        "question": {
          "en": "Does preferring quiet mean I dislike the companion?",
          "zh": "喜欢安静是否意味着不喜欢同行者？"
        },
        "answer": {
          "en": "The game cannot infer that. Parallel company is one available form of shared time. Ask about the real person’s preference rather than treating a result as their motive.",
          "zh": "本小游戏不能这样推断。并行作伴是共度时间的一种形式；请问真实对方的偏好，不把结果当作别人的动机。"
        }
      },
      {
        "question": {
          "en": "Do I need to book or take a trip?",
          "zh": "需要订票或实际出行吗？"
        },
        "answer": {
          "en": "No. The neighboring-seat situations are fictional and need no booking, itinerary, location or personal travel data.",
          "zh": "不需要。邻座情境虚构，无需订票、行程、位置或私人旅行资料。"
        }
      },
      {
        "question": {
          "en": "Can I use the portrait instead of a carriage rule?",
          "zh": "画像能代替车厢规则吗？"
        },
        "answer": {
          "en": "No. The practical references concern real operators’ settings. The portrait is a conversation prompt; current signs and operator instructions govern a real journey.",
          "zh": "不能。实用参考讨论真实运营环境，画像只是交流话题；真实旅程以当时标示和运营者指引为准。"
        }
      },
      {
        "question": {
          "en": "How are ties handled?",
          "zh": "并列怎样处理？"
        },
        "answer": {
          "en": "All portraits with the highest raw count are retained in full. No random draw or option-position rule selects one winner.",
          "zh": "所有同为最高次数的画像都完整保留，不随机抽取，也不按选项位置挑一个赢家。"
        }
      },
      {
        "question": {
          "en": "Is every portrait and its complete guide free?",
          "zh": "每种画像及完整指南都免费吗？"
        },
        "answer": {
          "en": "Yes. All three public guides and all highest portraits in your result are available without signup, payment or another test.",
          "zh": "是。三篇公开指南与结果中所有最高画像都可直接完整阅读，不需注册、付费或另做测试。"
        }
      },
      {
        "question": {
          "en": "What does a lower count mean?",
          "zh": "次数较低意味着什么？"
        },
        "answer": {
          "en": "You chose that response less often among these six sets of alternatives. It is not a missing ability, a defect or evidence about another person.",
          "zh": "只表示本组六次选项比较里较少选该方向，不是能力缺失、缺点或关于另一个人的证据。"
        }
      },
      {
        "question": {
          "en": "Can I change an answer or start over?",
          "zh": "可以改答案或重新开始吗？"
        },
        "answer": {
          "en": "Use Back before completion to revisit a scene. Retake starts a fresh six-choice attempt and clears the old draft; it does not merge attempts.",
          "zh": "完成前用上一题回看场景；重测会开始新的六次选择并清除旧草稿，不合并多次作答。"
        }
      }
    ],
    "references": [
      {
        "url": "https://www.nationalrail.co.uk/on-the-train/quiet-coaches/",
        "label": {
          "en": "National Rail: quiet coaches and operator-specific expectations",
          "zh": "National Rail：安静车厢与运营者各自规则"
        }
      },
      {
        "url": "https://www.tgvinoui.sncf/voyager/informations-pratiques/bord-de-tgv-inoui",
        "label": {
          "en": "TGV INOUI: French on-board comfort information",
          "zh": "TGV INOUI：法语车上舒适与安静说明"
        }
      }
    ]
  },
  "hosting-a-guest": {
    "label": {
      "en": "Original overnight-visit scenes · All three portraits free",
      "zh": "原创过夜来访情境 · 三篇完整画像免费"
    },
    "instructions": {
      "en": "Imagine an overnight visit that both people want and have agreed to. In six scenes choose a short note, a shared introduction or responding as questions arise. The game does not assess your home or require hosting anyone.",
      "zh": "想象一次双方愿意、已经同意的过夜来访。六个场景里比较短便条、一起介绍、出现问题时回应；小游戏不评价住房，也不要求实际留宿任何人。"
    },
    "sections": [
      {
        "id": "purpose",
        "title": {
          "en": "Welcoming a guest: make an unfamiliar space easier to understand",
          "zh": "欢迎来客：让陌生空间更容易了解"
        },
        "paragraphs": [
          {
            "en": "The six scenes begin with arrival and move through limited time, independent settling, a different house routine, a repeated question and a comfortable shared understanding. The stay is already welcome and agreed. The topic is how information is offered, not whether someone must offer accommodation.",
            "zh": "六个场景从到达开始，随后涉及时间有限、独立安顿、不同居家习惯、重复问题、舒服的共同理解。来访已经受欢迎并获同意；主题是怎样提供信息，不是任何人是否必须提供住宿。"
          },
          {
            "en": "The three portraits organize an introduction through a written note, a short walkthrough or questions as needs arise. Each has a useful role and a tradeoff. None ranks generosity, home quality, income, cultural hospitality or how much labor a host owes a visitor.",
            "zh": "三篇画像分别借文字便条、简短走看、随需询问来组织介绍。每种都有用处和取舍，不排列慷慨、住房品质、收入、文化待客程度，也不规定主人应为来客付出多少劳动。"
          }
        ]
      },
      {
        "id": "note",
        "title": {
          "en": "A small note: information the guest can revisit",
          "zh": "小便条：来客可以自行回看的信息"
        },
        "paragraphs": [
          {
            "en": "The Little-House-Note Host leaves a few facts in an easy-to-find place. An original example is a card explaining the agreed shared shelf and the morning time both people chose. The note gives a reference without asking the guest to memorize a long introduction.",
            "zh": "小便条迎客者把少量事实留在容易找到的地方。一个原创例子是用卡片说明已约共用的架子，以及双方选好的次晨时间。便条提供参照，不要求来客记下一长段介绍。"
          },
          {
            "en": "Only include details relevant to that stay. A long rule sheet can obscure the practical answer, and a note does not establish permission to use private belongings. Keep access details and personal information within the actual agreed audience rather than posting them in a public quiz result.",
            "zh": "只写与这次短住有关的细节。长篇规则会埋住实际答案，便条也不自动授权使用私人物品。门禁细节和个人信息应留在双方约定的实际接收范围，不放进公开小游戏结果。"
          }
        ]
      },
      {
        "id": "tour",
        "title": {
          "en": "A short walkthrough: connect a name with an actual place",
          "zh": "简短走看：让名称连到实际位置"
        },
        "paragraphs": [
          {
            "en": "The One-Little-Tour Host shows the few places that matter first. You might point out an agreed bag space and the common cups, then let the guest settle. Ask what they want explained before turning an arrival into a tour of every object.",
            "zh": "一起走一圈的迎客者先指出少数重要位置。可以说明已约放包的地方和共用杯子，再让来客安顿；先问想了解什么，不把到达变成所有物件的导览。"
          },
          {
            "en": "A tired guest may need a pause or another explanation later. A physical walkthrough is not always useful or accessible to everyone; words or a small written description can be alternatives. The portrait does not require guided attention throughout the stay.",
            "zh": "疲累的来客可能需要先停一停，或稍后再听一次。实际走看并不总对每个人有用或方便，可改用口头或简短文字说明。画像不要求短住期间一直陪同讲解。"
          }
        ]
      },
      {
        "id": "ask",
        "title": {
          "en": "Responding as needed: make questions ordinary and availability clear",
          "zh": "随需回应：让提问自然，也说明何时方便"
        },
        "paragraphs": [
          {
            "en": "The Ask-as-Needed Host starts with essentials and leaves room for new questions. For example, say which common items are available and when you will next be free to explain another detail. That is more specific than promising to be available every moment.",
            "zh": "需要时再问的迎客者先交代必要项，给新问题留空间。例如说明哪些共用品可用、下一次何时方便解释其他细节，比承诺每时每刻可用更具体。"
          },
          {
            "en": "A repeated question may show that the first explanation was hard to find or picture. You can change the format rather than treating it as a test of politeness or memory. Real needs and boundaries belong to both people, not to a result’s claim that one style is best.",
            "zh": "重复提问可能说明前一种解释难找或难想象。可以换一种说明方式，不把它变成礼貌或记忆考试。真实需要与边界属于双方，不由结果判定某一种方式最好。"
          }
        ]
      },
      {
        "id": "context",
        "title": {
          "en": "Guest guides and etiquette are contextual advice",
          "zh": "来客指南与礼仪提供情境参考"
        },
        "paragraphs": [
          {
            "en": "Airbnb’s house-manual article recommends concise, usable instructions and information guests can return to. Its product serves booked accommodation, whereas this story imagines a private, mutually agreed visit. We use the information-format distinction, not its commercial review or hosting-performance claims. [1]",
            "zh": "Airbnb居家说明文章建议简洁可用的指引，以及来客可回看的信息。其产品服务预订住宿，本故事则想象双方同意的私人来访；这里只参考信息形式区别，不采用商业评价或经营表现主张。[1]"
          },
          {
            "en": "Emily Post’s guest advice discusses asking before using the host’s equipment. That offers an etiquette example of checking permission; its particular customs are not universal rules for every household. Neither source validates these portraits or proves that a note, tour or responsive answer will suit every visitor. [2]",
            "zh": "Emily Post来客建议谈到使用主人设备前应先询问，可作为核对许可的礼仪例子；其具体习俗不是所有家庭的普遍规则。两份来源都不验证画像，也不证明便条、走看或按需回应适合所有来客。[2]"
          }
        ]
      },
      {
        "id": "counts",
        "title": {
          "en": "Six choices, three counts and every highest tie",
          "zh": "六次选择、三项次数与全部最高并列"
        },
        "paragraphs": [
          {
            "en": "Every selected option adds one to its named portrait. All six answers are needed for a completed result. Each count ranges from 0 to 6, and their sum is 6. The numbers summarize choices within these supplied scenes, not percentages of a trait or positions in a population.",
            "zh": "每个所选项给其对应画像加一次，六题全答后才形成完整结果。每项0至6，三项总和6；数字概括给定场景中的选择，不是特质占比或人群位置。"
          },
          {
            "en": "Every portrait sharing the highest count remains in the result. A 4–1–1 example has one leader, 3–3–0 has two and 2–2–2 has all three. There are seven possible highest sets. The display order does not break a tie, and a one-point difference is not an established meaningful personal difference.",
            "zh": "最高次数相同的画像全部保留。4—1—1示例有一项最高，3—3—0有两项，2—2—2三项全并列，共七种最高集合。展示顺序不打破并列，相差一次也不是已经验证的个人显著差异。"
          }
        ]
      },
      {
        "id": "reading",
        "title": {
          "en": "Read the example and tradeoff beside the portrait",
          "zh": "把画像与例子、取舍一起阅读"
        },
        "paragraphs": [
          {
            "en": "All three public guides remain open before and after answering. Each has its complete summary, everyday example, possible benefit, tradeoff and optional small experiment. A tie shows the full text of every highest portrait, rather than choosing just one or hiding the rest.",
            "zh": "三篇公开指南在作答前后都能读到完整概述、日常例子、可能用处、取舍与可选小尝试。并列会展示每篇最高画像的全文，不只挑一篇，也不把其余藏起来。"
          },
          {
            "en": "These are original scene-based explanations, without established reliability, population norms or cross-language measurement equivalence. Read a useful idea against an actual situation and a counterexample. A different answer later can reflect a different imagined situation; it is not evidence that a stable personality type has changed.",
            "zh": "这些是基于场景的原创解释，未建立信度、人群常模或双语测量等值性。把有用的想法放回具体情境，也找一个不符合的例子。以后选得不同可能是想象情境不同，不证明固定人格类型发生改变。"
          }
        ]
      },
      {
        "id": "privacy",
        "title": {
          "en": "Direct start, optional tab saving and a fresh attempt",
          "zh": "直接开始、自愿标签页保存与重新作答"
        },
        "paragraphs": [
          {
            "en": "Start opens the first scene, with no agreement checkbox, registration or prior assessment. Back lets you revisit a scene before finishing. Saving is an optional tab-only draft, not a condition for seeing complete results; saved drafts expire after 24 hours and clear on completion or retake.",
            "zh": "开始会直接打开第一个场景，无需勾选同意、注册或先做其他测评。完成前可以返回修改场景；保存只是本标签页自愿草稿，不是查看全文的条件，24小时失效，完成或重测时清除。"
          },
          {
            "en": "Choices are resolved in the browser, separately from the six main assessments. Sharing copies a public result name and guide link rather than the six answers. You can read, retake or leave without following an optional recommendation. No recipient, host, traveler or group member needs to supply personal information.",
            "zh": "选择在浏览器内按本故事规则计算，与六大测评独立。分享复制公开结果名称与指南链接，不复制六道答案。可以阅读、重测或离开，无需继续推荐内容；不要求收件人、主人、同行者或小组成员提供私人资料。"
          }
        ]
      }
    ],
    "faq": [
      {
        "question": {
          "en": "Does this grade my home or hospitality?",
          "zh": "这会评价住房或待客水平吗？"
        },
        "answer": {
          "en": "No. The choices concern how you explain a familiar place to an imagined willing guest. There is no home inspection, spending expectation or hospitality score.",
          "zh": "不会。选择只涉及怎样向想象中愿意来访的人介绍熟悉空间，没有住房检查、消费期待或待客分数。"
        }
      },
      {
        "question": {
          "en": "Must a host be available all the time?",
          "zh": "主人必须一直随时待命吗？"
        },
        "answer": {
          "en": "No. The responsive portrait includes making availability clear. A useful question arrangement can respect both people’s independent time.",
          "zh": "不需要。按需回应画像包含说清方便回应的时间；有用的询问安排可以尊重双方的独立时间。"
        }
      },
      {
        "question": {
          "en": "Should I put real access details into the quiz?",
          "zh": "需要在小游戏里填写真实门禁信息吗？"
        },
        "answer": {
          "en": "No. Choose the supplied options only. Do not enter an address, door code, private Wi-Fi password, guest identity or photograph.",
          "zh": "不需要。只选已有选项，不输入住址、门锁密码、私人Wi-Fi密码、来客身份或照片。"
        }
      },
      {
        "question": {
          "en": "Do I need an overnight visitor to answer?",
          "zh": "必须真的有人留宿才能答题吗？"
        },
        "answer": {
          "en": "No. The visit is fictional. The story neither asks you to invite someone nor decides whether a particular real visit should happen.",
          "zh": "不需要。来访是虚构情境，不要求邀请任何人，也不裁定某一次真实来访是否应该发生。"
        }
      },
      {
        "question": {
          "en": "How are ties handled?",
          "zh": "并列怎样处理？"
        },
        "answer": {
          "en": "All portraits with the highest raw count are retained in full. No random draw or option-position rule selects one winner.",
          "zh": "所有同为最高次数的画像都完整保留，不随机抽取，也不按选项位置挑一个赢家。"
        }
      },
      {
        "question": {
          "en": "Is every portrait and its complete guide free?",
          "zh": "每种画像及完整指南都免费吗？"
        },
        "answer": {
          "en": "Yes. All three public guides and all highest portraits in your result are available without signup, payment or another test.",
          "zh": "是。三篇公开指南与结果中所有最高画像都可直接完整阅读，不需注册、付费或另做测试。"
        }
      },
      {
        "question": {
          "en": "What does a lower count mean?",
          "zh": "次数较低意味着什么？"
        },
        "answer": {
          "en": "You chose that response less often among these six sets of alternatives. It is not a missing ability, a defect or evidence about another person.",
          "zh": "只表示本组六次选项比较里较少选该方向，不是能力缺失、缺点或关于另一个人的证据。"
        }
      },
      {
        "question": {
          "en": "Can I change an answer or start over?",
          "zh": "可以改答案或重新开始吗？"
        },
        "answer": {
          "en": "Use Back before completion to revisit a scene. Retake starts a fresh six-choice attempt and clears the old draft; it does not merge attempts.",
          "zh": "完成前用上一题回看场景；重测会开始新的六次选择并清除旧草稿，不合并多次作答。"
        }
      }
    ],
    "references": [
      {
        "url": "https://www.airbnb.com/resources/hosting-homes/a/write-a-house-manual-to-share-info-about-your-space-22",
        "label": {
          "en": "Airbnb: concise house-manual information",
          "zh": "Airbnb：简明居家说明的信息形式"
        }
      },
      {
        "url": "https://emilypost.com/advice/the-golden-rules-for-houseguests",
        "label": {
          "en": "Emily Post: guest etiquette and permission to use belongings",
          "zh": "Emily Post：来客礼仪与物品使用许可"
        }
      }
    ]
  }
};
