import type { Questionnaire } from "@/lib/questionnaires/types";

export const animeStoryRolesLandingSections: Questionnaire["guide"] = [
  {
    "id": "anime-story-scope",
    "title": {
      "zh": "动漫角色原型是什么？先区分故事功能与人格特质",
      "en": "What is an anime story archetype? Narrative function and personality traits"
    },
    "paragraphs": [
      {
        "zh": "文学分析可以分别讨论人物的重要程度、在故事中的作用、具体特征和发展变化。BCcampus的文学教材把这些问题分开，也说明一部作品可以拥有多位主要人物。[1] 本测验借用“人物怎样参与场景”这个阅读角度，自行创作六种角色，不把它们称为动漫的完整分类或经过验证的人格维度。",
        "en": "Literary analysis can distinguish a character’s importance, role, particular characteristics and development. The BCcampus literature chapter separates these questions and allows for several main characters.[1] This quiz uses participation in a scene as a reading angle and creates six roles of its own. They are neither a complete classification of anime nor validated personality dimensions."
      },
      {
        "zh": "本版的浮空花园与种灯节全部虚构。18道题比较约好第一步、友好比较、连接路线、应请求示范、改用道具和更新约定六种回应。结果不从某部作品的人物库选出你的“分身”，也不按喜欢的剧集、外貌、生日或性别匹配。喜欢一个故事功能，可以只是今天想写或想读的场面。",
        "en": "The floating garden and seed-lantern festival are wholly invented. Eighteen items compare an agreed first step, friendly comparison, connected routes, a requested example, a changed prop use and an updated agreement. Results do not select your twin from a licensed cast or match by favourite series, appearance, birthday or gender. Enjoying a story function can simply mean wanting to write or read that scene today."
      }
    ]
  },
  {
    "id": "anime-story-begin-contrast",
    "title": {
      "zh": "启程主角与友好挑战者：让场景开始，或让另一种可能出现",
      "en": "The Lead and Challenger: begin a scene or make an alternative visible"
    },
    "paragraphs": [
      {
        "zh": "启程主角让一个已经商量好的小行动发生，友好挑战者则增加可以比较的版本。前者回答“现在怎样开始”，后者回答“如果换一种做法会怎样”。两者不是领导者与反对者的固定分工，更不是勇气、野心或服从程度的高低。第一步也可以由安静的人物完成，提出替代也可以不带竞争。",
        "en": "The Lead makes a small agreed action happen; the Challenger adds a version people can compare. One asks how to begin now, the other what a different approach would change. These are not fixed leader–opponent assignments or levels of courage, ambition or compliance. A quiet character can make the first move, and an alternative need not create a competition."
      },
      {
        "zh": "另写一幕：花园里有一座尚未命名的纸桥。人物可以先按共同选择摆好第一块纸板，也可以画两个桥名，让同伴看看每个名字会引出怎样的下一幕。先摆纸板之后仍能比较名字；比较之后也能保留两个版本。这个新例子帮助辨认两种叙事贡献，不要求把任何创作者分成主角或配角。",
        "en": "Try a new scene with an unnamed paper bridge. A character can place its first agreed paper plank, or draw two names for others to consider how each would shape the next panel. The group can compare names after laying the plank, or keep both versions after comparing. This new example distinguishes narrative contributions without assigning any creator a lead or supporting status."
      }
    ]
  },
  {
    "id": "anime-story-map-example",
    "title": {
      "zh": "绘路者与引路导师：画出连接，或展示一个能被修改的步骤",
      "en": "The Pathfinder and Guide: connect places or offer an adjustable example"
    },
    "paragraphs": [
      {
        "zh": "绘路者帮助读者知道人物在哪里、地点怎样相连；引路导师帮助一个愿意学习的人物理解眼前步骤。地图属于场景的空间组织，示范属于人物间的信息交流。某个人可以先画路线，再应请求示范读图，也可以只选其中一部分。绘路者不是算无遗策的智者，引路导师也不需要年长、受过苦或承担所有人的问题。",
        "en": "The Pathfinder helps a reader locate characters and understand connections; the Guide helps a willing character understand a current step. A map organises the scene’s spaces, while a demonstration exchanges information between characters. Someone can draw a route and then demonstrate its use, or choose just one contribution. Pathfinder does not mean infallible strategist, and Guide does not require age, hardship or responsibility for everyone’s problems."
      },
      {
        "zh": "另设三个虚构地点：回声台、纸船池和种子亭。一张图可以标明人物从哪里到哪里；一个示例可以展示如何用同色标记读出回程。请读者分别回答“路线是否看得懂”和“这个示例是否有帮助”。这样获得的是对作品可读性的反馈，不是对绘图智力、教学资格或现实决策能力的评定。",
        "en": "Add three invented places: Echo Terrace, Paper-Boat Pool and Seed Pavilion. A map can mark the journey between them; an example can demonstrate how matching colours show a return route. Ask separately whether the route is readable and whether the example helps. That gives feedback on the work’s readability rather than assessing spatial intelligence, teaching qualifications or real-world decision-making ability."
      }
    ]
  },
  {
    "id": "anime-story-prop-promise",
    "title": {
      "zh": "即兴巧匠与约定守护者：改变道具用途，或说明共同约定",
      "en": "The Improviser and Keeper: change a prop’s use or clarify an agreement"
    },
    "paragraphs": [
      {
        "zh": "即兴巧匠为熟悉物件增加一个有趣用途，约定守护者确认这种变化怎样与已有安排衔接。一个侧重新可能，另一个侧重约定仍然清楚。新点子可以暂时不采用，旧约定也可以重新商量；两者都为人物保留选择，不把惊喜变成捉弄，不把守约变成无限照顾义务。",
        "en": "The Improviser adds a playful use to a familiar object; the Keeper checks how the change fits an existing arrangement. One opens a possibility and the other keeps an agreement understandable. A new idea can wait, and an old agreement can be renegotiated. Both leave characters choices rather than turning surprise into a prank or a promise into unlimited care."
      },
      {
        "zh": "另写一枚纸风铃：原先挂在会合处，后来有人想让它成为下一幕的移动路标。巧匠可以提出新的用法，守护者可以问原先约好看风铃会合的人怎样收到更新。人物最后也可另做一个路标。这里的取舍是道具连续性与信息衔接，不证明谁更聪明、更可靠或更值得信任。",
        "en": "Write a new paper wind chime that first hangs at a meeting place, then becomes a proposed moving marker. The Improviser can suggest that use; the Keeper can ask how characters expecting the old meeting signal will hear the update. The cast can instead make another marker. This trade-off concerns prop continuity and information, not who is cleverer, more reliable or more trustworthy."
      }
    ]
  },
  {
    "id": "anime-story-counts",
    "title": {
      "zh": "18道题怎样生成六项计数与全部并列？",
      "en": "How do eighteen items produce six counts and every highest tie?"
    },
    "paragraphs": [
      {
        "zh": "每题选中的选项只给明确对应的一种角色加1次，六项合计固定为18。每种角色出现12次，在A、B、C、D四个位置各出现3次；另外6道题没有提供这个角色。当题没出现，不等于你拒绝了它。单项范围是0—12，3/12表示12次出现中选了3次，不表示与角色相似25%、超过25%的人或拥有25%的某种能力。",
        "en": "Each selected option adds one count to its explicitly mapped role, giving eighteen counts in total. Each role appears twelve times, three times in each A–D position, and is absent from six items. Absence is not rejection. A role can receive zero to twelve counts; 3/12 means three selections in twelve appearances, not 25% character similarity, a population percentile or an amount of ability."
      },
      {
        "zh": "例如18题全选A，六项各3次，六份完整指南一起显示，共42节。另一组回答可得到5、5、2、2、2、2，前两项并列，各有完整七节；12、2、2、2、0、0则只产生一项最高。并列不用字母、题序或最后一次选择打破；相差1次也没有经过验证的心理差异含义。可以对照公开指南阅读相近角色，但系统不会把不同计数自动合并。",
        "en": "For example, choosing A on all eighteen items gives three counts to each role and all six complete guides, totalling forty-two sections. A different answer set can give 5, 5, 2, 2, 2, 2, with two complete seven-section guides; 12, 2, 2, 2, 0, 0 has one highest role. Letters, item order and the final choice do not break ties. A one-count gap has no established psychological meaning. Public guides allow comparison of close readings without silently merging unequal counts."
      }
    ]
  },
  {
    "id": "anime-story-ensemble",
    "title": {
      "zh": "怎样把多个结果用到同一段原创分镜？",
      "en": "How can several results contribute to one original storyboard?"
    },
    "paragraphs": [
      {
        "zh": "另设一个六格短篇：人物准备一张节日邀请卡。第一格先摆好空白卡，第二格比较两种邀请语，第三格标明到场路线，第四格示范如何折卡，第五格把余纸改成书签，第六格说明会合计划怎样修改。这六种贡献可以由同一人物依次完成，也可分给多位人物，不需要每种角色都出现，更不需要按测试结果分配真人职责。",
        "en": "Imagine a new six-panel invitation-card story. One panel places a blank card, another compares two invitations, a third marks the route, a fourth demonstrates a fold, a fifth turns leftover paper into a bookmark, and a sixth updates the meeting plan. One character can make all six contributions, or several can share them. A scene need not contain every role, and results need not assign duties to real people."
      },
      {
        "zh": "选择其中一到两种贡献，先写三格，再请愿意的读者指出哪一格清楚、哪一格跳得太快。只改一处后重读，也可以结束练习。反馈针对这段作品，不为计数寻找“证据”来定义作者；你完全可以喜欢某份结果，却选择写另一种角色。这样的使用方式把结果变成可讨论的创作材料。",
        "en": "Choose one or two contributions, write three panels, and ask a willing reader which panel is clear and which jumps too quickly. Revise one part and reread, or finish the exercise. Feedback concerns this piece of work rather than finding evidence that defines its author. You can enjoy one guide and write another role. The result becomes material for discussing a creative choice."
      }
    ]
  },
  {
    "id": "anime-story-evidence",
    "title": {
      "zh": "文学来源、确定性计数与心理测量证据各回答什么？",
      "en": "What do literary sources, deterministic counts and measurement evidence establish?"
    },
    "paragraphs": [
      {
        "zh": "文学教材解释怎样分析作品中的人物。例如“主角”涉及故事关注谁，“对立人物”涉及与谁发生冲突；教材也说明对立不自动等于邪恶。[1] 本版友好挑战者并非反派分类，启程主角也仅指愿意开始小行动的原创角度。术语听起来熟悉，并不能证明这六种角色覆盖全部动漫或对应六种现实人格。",
        "en": "The literature chapter explains how characters can be analysed: protagonist concerns narrative focus, while antagonist concerns opposition, which need not imply evil.[1] This edition’s Challenger is not a villain category, and Lead is an original lens on beginning a small action. Familiar terms do not establish that these six roles cover all anime or correspond to six real personalities."
      },
      {
        "zh": "可复算的计数说明相同答案怎样得到相同结果；它不能代替目标人群的信度、效度或跨语言等价研究。本版尚未完成这些心理测量验证。没有根据18次虚构选择推断MBTI、大五、智商、临床状态、关系质量或领导能力的依据；人物读法的价值在于具体、可质疑和有上下文，而不是把比喻写成科学诊断。",
        "en": "Reproducible scoring establishes how identical answers produce identical counts. It does not replace reliability, validity or cross-language equivalence studies in a target population; this edition has not completed those studies. Eighteen fictional choices do not justify inferring MBTI, Big Five, intelligence, clinical conditions, relationship quality or leadership ability. A reading can be concrete, contestable and contextual without turning a metaphor into a diagnosis."
      }
    ]
  },
  {
    "id": "anime-story-revisit",
    "title": {
      "zh": "重测、中英文阅读与选择隐私",
      "en": "Retakes, bilingual reading and private choices"
    },
    "paragraphs": [
      {
        "zh": "重测时可以记录当时想写的故事类型、是否独立作答、使用语言和变化的选项。换一个设定后选择不同，可能反映新的创作兴趣、题意理解或选择波动；单凭角色名变了无法认定人格发生改变。中英文使用同一组角色身份、映射和报告链接，文字对应并不等于已经证明两种语言测量等价。",
        "en": "For a retake, note the kind of story you wanted to write, whether you answered independently, the language and the changed options. Different choices may reflect a new creative interest, interpretation or ordinary variation. A changed role name alone cannot establish personality change. English and Chinese use the same role identities, mappings and report links; corresponding prose does not establish measurement equivalence."
      },
      {
        "zh": "点击开始即可进入题目，无需额外同意、注册、邮箱或先完成MBTI。作答在浏览器内计数；可选标签页草稿24小时后失效，完成、重测或退出清除后删除。分享仅包含公开名称和链接，不含私人答案或计数。可以自己阅读，也可以邀请朋友各自选择愿意讨论的创作点，不把分享结果作为忠诚、聪明或人际价值的判断。",
        "en": "Start opens the questions directly, without another agreement, signup, email or prior MBTI result. Choices are counted in the browser. Optional tab drafts expire after twenty-four hours and clear on completion, retake or exit-and-clear. Sharing contains public names and a link, not private answers or counts. Read alone or invite friends to discuss creative choices they wish to share, without using results to judge loyalty, intelligence or interpersonal worth."
      }
    ]
  }
];

export const animeStoryRolesLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "这项动漫角色测试比较什么？",
      "en": "What does this anime story-role quiz compare?"
    },
    "answer": {
      "zh": "它用18道原创四选一，比较启程、友好比较、绘路、应请求示范、道具即兴和更新约定六种叙事贡献。设定为虚构浮空花园种灯节，结果是本版原创角色，不是具体动漫人物匹配。",
      "en": "Eighteen original four-choice items compare beginnings, friendly alternatives, routes, requested examples, prop improvisation and updated agreements in an invented floating-garden festival. Results are this edition’s original roles, not matches to named anime characters."
    }
  },
  {
    "question": {
      "zh": "启程主角一定是现实中的领导者吗？",
      "en": "Does the Lead mean a real-life leader?"
    },
    "answer": {
      "zh": "不是。本版启程指愿意先做一个商量好的小行动，之后仍把选择留给别人。它不评价领导能力、勇气、地位或谁应得到更多关注；其他角色也能推动同一场景。",
      "en": "No. Lead means preferring one small agreed first action while leaving later choices open. It does not assess leadership, courage, status or entitlement to attention. Other roles can move the same scene forward."
    }
  },
  {
    "question": {
      "zh": "绘路者与引路导师怎样区分？",
      "en": "How do Pathfinder and Guide differ?"
    },
    "answer": {
      "zh": "绘路者让地点和路线的连接好读；引路导师向愿意学习的人物展示一个可修改的步骤。一张地图与一个读图示例可以相互配合，不构成智力或教学能力排名。",
      "en": "Pathfinder makes connections between places readable; Guide offers a willing character an adjustable example. A map and an example of reading it can work together without ranking intelligence or teaching competence."
    }
  },
  {
    "question": {
      "zh": "友好挑战者、巧匠和守护者会冲突吗？",
      "en": "Must Challenger, Improviser and Keeper conflict?"
    },
    "answer": {
      "zh": "不一定。比较替代、改变道具用途、说明共同约定可以在同一短篇共存。大家可以保留两个版本、暂缓新点子或更新旧约；角色不是固定人际阵营，也不要求证明谁对谁错。",
      "en": "No. Comparing an alternative, changing a prop and clarifying an agreement can coexist. Creators can keep both versions, defer an idea or update an old arrangement. Roles do not create fixed interpersonal camps or require a winner."
    }
  },
  {
    "question": {
      "zh": "为什么六项次数不能相互独立解释？",
      "en": "Why are the six counts not independent trait scores?"
    },
    "answer": {
      "zh": "每题只能给一个角色加1次，所以六项合计固定为18。更多选择一个角度，会减少其他角度可获得的次数；每种角色出现12次、另有6次缺席。计数适合在本题组内阅读，不是独立人格强度或人群常模。",
      "en": "Each item awards one count, so the six counts must total eighteen. Selecting one lens leaves fewer counts for others. Every role appears twelve times and is absent six times. Counts describe this bank rather than independent trait strength or population norms."
    }
  },
  {
    "question": {
      "zh": "并列时会少给一份报告吗？",
      "en": "Will a tie hide any complete guide?"
    },
    "answer": {
      "zh": "不会。所有最高计数对应的完整指南一起展示，每份七节。六项各3次会显示六份共42节；两个最高各5次则显示两份共14节。没有随机抽取或按最后一次选择破同分。",
      "en": "No. Every highest role receives all seven guide sections. Six counts of three show six guides and forty-two sections; two highest counts of five show two guides and fourteen sections. There is no random selection or last-answer tie-break."
    }
  },
  {
    "question": {
      "zh": "3/12可以说成25%相似吗？",
      "en": "Does 3/12 mean a 25% character match?"
    },
    "answer": {
      "zh": "不能。它只表示某角色在12次出现中被选中3次。本站没有把这个比值校准为人物相似度、准确率、群体比例或能力百分位；其他网站的匹配算法也不能直接套用。",
      "en": "No. It records three selections in twelve appearances. This ratio has not been calibrated as character similarity, accuracy, population frequency or ability percentile. Another site’s matching algorithm cannot supply that interpretation."
    }
  },
  {
    "question": {
      "zh": "做完后怎样尝试一段自己的故事？",
      "en": "How can I use the result in my own story?"
    },
    "answer": {
      "zh": "选择一个有兴趣的贡献，写三格原创分镜，请愿意的读者指出哪里清楚、哪里跳得太快，再修改一处。反馈只针对作品；不必按照最高角色写作，也不按结果安排朋友的职责。",
      "en": "Choose a contribution, write three original panels, ask a willing reader where the sequence is clear or too abrupt, and revise one part. Feedback concerns the work. You need not write the highest role or assign duties to friends from results."
    }
  },
  {
    "question": {
      "zh": "计数规则透明就说明测试科学有效吗？",
      "en": "Does transparent scoring establish scientific validity?"
    },
    "answer": {
      "zh": "透明规则让人核对答案怎样变成计数，文学资料帮助理解故事术语；两者都不替代本题本的心理测量研究。本版是原创娱乐与创作探索，尚无信度、效度或跨语言等价验证。[1]",
      "en": "Transparent rules let readers check how answers become counts, while literary sources explain narrative terms. Neither replaces measurement research on this bank. This original entertainment and creative-exploration edition has no established reliability, validity or cross-language equivalence.[1]"
    }
  }
];
