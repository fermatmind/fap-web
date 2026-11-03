import type { Copy, FunFaq } from "@/lib/entertainment/types";
export const birdwatchingSections: {id:string;title:Copy;paragraphs:Copy[]}[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Birdwatching companion quiz: how would you share a sighting?",
      "zh": "观鸟同行方式测试：怎样分享一次发现？"
    },
    "paragraphs": [
      {
        "en": "A fictional club is watching illustrated birds through a viewing window. Six choices explore three ways to participate: giving a sighting time, keeping a useful record and helping another observer find the view. The same short event can invite all three contributions.",
        "zh": "虚构小组透过观察窗看插画里的鸟。六次选择探索三种参与方式：给现身留时间、保留有用记录，以及帮另一位观察者找到视野。同一次短暂发现，可以包含三种贡献。"
      },
      {
        "en": "This is a text-choice story, not a test of spotting speed, birdsong recognition or species identification. You need no birding experience, binoculars, location access or uploaded photograph. Choose what you would like to do in each scene; there are no correct answers.",
        "zh": "这是文字选择故事，不考发现速度、鸟鸣辨认或物种鉴定。无需观鸟经历、望远镜、位置权限或上传照片。每个场景选自己更想做的一项，没有标准答案。"
      }
    ]
  },
  {
    "id": "waiting",
    "title": {
      "en": "Patient-window companion: time for a view, with a stopping point",
      "zh": "慢看窗边同行者：给观看留时间，也保留停止点"
    },
    "paragraphs": [
      {
        "en": "Waiting choices concern staying with a comfortable view, watching an unhurried moment and sharing another quiet look. They do not require waiting indefinitely or keeping everybody at one window. The relevant preference is the pace you choose within this imagined outing.",
        "zh": "等待选项涉及在舒适视野停留、不急着移开，以及陪伴再安静看一会儿，不要求无限等待或让所有人留在同一窗口。这里关注想象外出中选择的节奏。"
      },
      {
        "en": "You might agree to watch one more illustrated panel, then ask whether the group would like to move on. A high count does not establish patience in every setting, better concentration or greater tolerance of discomfort. A person can enjoy a pause and still need a break.",
        "zh": "例如，可以约定再看一幅插画，然后问大家是否想继续走。次数较高，不证明任何场景都耐心、专注更好或更能忍受不适。喜欢停留，也可以需要休息。"
      }
    ]
  },
  {
    "id": "recording",
    "title": {
      "en": "Field-note companion: retain what was actually noticed",
      "zh": "随手记录同行者：保留确实注意到的内容"
    },
    "paragraphs": [
      {
        "en": "Recording choices concern time, the viewing location, a branch sketch and details you could make out. A modest note can separate “seen clearly”, “uncertain” and “not observed”. An imagined bird’s identity should not become a confident factual label merely because a record looks neat.",
        "zh": "记录选项涉及时间、观察位置、树枝速写与确实看清的细节。适度笔记可区分“看清了”“未确定”与“没观察到”。不能因为记录整齐，就把想象中鸟的身份写成确定事实。"
      },
      {
        "en": "For example, note a branch beside the window and a brief movement, leaving the species undecided. Recording can interrupt watching, so a short note may be enough. The count does not verify memory accuracy, data quality, scientific training or a complete field checklist.",
        "zh": "例如，记下窗旁树枝与一次短暂移动，同时保留物种未确定。记录会中断观看，短短一笔可能已够。次数不验证记忆准确率、数据质量、科学训练或野外清单完整性。"
      }
    ]
  },
  {
    "id": "sharing",
    "title": {
      "en": "Shared-view companion: an invitation rather than a permanent duty",
      "zh": "共享视野同行者：提供邀请，而非永久负责"
    },
    "paragraphs": [
      {
        "en": "Shared-view choices concern checking access to the window, using a nearby landmark and making a position change without blocking others. They ask how you might make a sighting easier to join, not whether you can identify the bird for everyone.",
        "zh": "共享视野选项涉及确认能否看见窗口、用附近地标定位，以及换位时不挡住其他人，询问怎样让别人更容易加入，不要求替所有人认出鸟种。"
      },
      {
        "en": "A concrete cue might be “the forked branch beside the pale trunk”. Ask whether more help is wanted, then allow the person to explore independently. A higher count neither appoints a group leader nor makes you responsible for every participant’s enjoyment.",
        "zh": "具体提示可以是“浅色树干旁分叉的那根枝”。再问是否需要更多帮助，也允许对方独立探索。次数较高，既不任命组长，也不让你负责每位参与者是否愉快。"
      }
    ]
  },
  {
    "id": "scoring",
    "title": {
      "en": "Six one-point choices and all highest-count portraits",
      "zh": "六次单点计数与全部最高画像"
    },
    "paragraphs": [
      {
        "en": "Every question offers one choice for each of the three portraits. A selected option adds one point to its corresponding portrait; the three totals sum to six, with each ranging from zero to six. All six answers are required before a personal result is generated.",
        "zh": "每题为三种画像各提供一个选项。选中某项，给对应画像加1次；三项合计6次，每项0至6次。六题全部作答后才生成个人结果。"
      },
      {
        "en": "The largest total leads, and all equally highest totals remain. Waiting 3, recording 3, sharing 0 displays the first two; 2–2–2 displays all three. The waiter, recorder, guide order arranges tied explanations only. It does not remove a tie or rank the first displayed portrait above the others.",
        "zh": "次数最高者显示为结果，同为最高则全部保留。等待3、记录3、共享0显示前两种；2—2—2显示三种。等待、记录、共享顺序只安排并列说明，不淘汰同分，也不让先显示的画像高一等。"
      }
    ]
  },
  {
    "id": "combined",
    "title": {
      "en": "Compare contributions within the same short event",
      "zh": "在同一个短暂事件里比较贡献"
    },
    "paragraphs": [
      {
        "en": "A waiting-and-recording tie can suggest watching for a moment before making one short note. A recording-and-sharing tie can suggest a simple branch sketch that helps somebody locate the view. These are possible uses of two perspectives, not additional calculated subtypes.",
        "zh": "等待与记录并列时，可以先看一会儿，再记一条短笔记；记录与共享并列时，可以用简单树枝速写帮助定位。这些是两个视角的可选用法，不另计算亚型。"
      },
      {
        "en": "A low count does not mean a contribution is missing from your life. With only one response per scene, choosing one useful option necessarily leaves two unchosen. All three public guides remain readable, whether or not they lead an attempt.",
        "zh": "次数较低，不表示生活中缺少这类贡献。每个场景只选一项，选了一个有用选项，另两个自然没有被选。全部三篇公开指南都可阅读，不以本次是否最高为条件。"
      }
    ]
  },
  {
    "id": "records",
    "title": {
      "en": "A playful note is not a citizen-science submission",
      "zh": "趣味记录不等于公民科学报送"
    },
    "paragraphs": [
      {
        "en": "Real observation platforms specify what counts as a record. eBird’s guidance concerns in-person observations of living wild birds and distinguishes these from captive, dead or remotely viewed birds. The illustrated club in this game does not provide an eligible real-world sighting. [1]",
        "zh": "真实观察平台会说明什么可以作为记录。eBird的指引针对现场观察到的活体野生鸟类，并区分圈养、死亡或远程观看的鸟。本游戏插画小组不提供合格的真实野外目击。[1]"
      },
      {
        "en": "For an actual outing, keep the observation and the confidence of identification separate, and follow the receiving project’s current instructions. This quiz neither uploads a checklist nor checks locations, species or counts. A high recording total is not a data-quality credential.",
        "zh": "真实外出时，应区分观察内容与鉴定把握，并按接收项目的现行说明记录。本测试不上传清单，不核查位置、鸟种或数量。记录次数高不是数据质量凭证。"
      }
    ]
  },
  {
    "id": "community",
    "title": {
      "en": "Respect birds, fellow observers and different ways to participate",
      "zh": "尊重鸟类、同行者及不同参与方式"
    },
    "paragraphs": [
      {
        "en": "The American Birding Association’s code asks birders to minimise disturbance and respect other people’s interests, rights and skill levels, including helping beginners. This is relevant background for a shared outing, not validation of the game’s three portraits. [2]",
        "zh": "美国观鸟协会的准则要求尽量减少扰动，尊重他人的兴趣、权利与技能水平，包括帮助新手。这是共同外出的相关背景，不验证游戏中的三种画像。[2]"
      },
      {
        "en": "The fictional window asks for no approaching, handling, feeding or sound playback. A companion may prefer another viewing position, a shorter stop or no assistance. Treat such preferences as something to ask about, rather than inferring them from a result label.",
        "zh": "虚构观察窗不要求靠近、触碰、喂食或播放声音。同行者可能想换位置、缩短停留或不需要帮助，应直接询问，不凭结果标签推断。"
      }
    ]
  },
  {
    "id": "evidence",
    "title": {
      "en": "An original story framework, not a measured birding skill",
      "zh": "原创故事框架，不是测得的观鸟技能"
    },
    "paragraphs": [
      {
        "en": "The six prompts and three portraits are original entertainment content. Reproducible point counting means the same complete answers produce the same outcome. It does not establish a stable personality dimension, reliability, validity, norms or skill prediction; no such psychometric evidence is supplied for this game.",
        "zh": "六道提示与三种画像是原创娱乐内容。计数可复现，表示完整答案相同就得到相同结果，不等于建立稳定人格维度、信度、效度、常模或技能预测。本游戏不提供这些心理测量证据。"
      },
      {
        "en": "Bird-identification quizzes have answers that can be checked against photographs, sounds or species information. This page asks which social contribution you would choose, without testing those performances. Its counts cannot be converted into bird-identification accuracy, MBTI, EQ, professional suitability or a diagnosis.",
        "zh": "鸟类鉴定问答可对照照片、声音或物种资料核对答案。本页询问更想选择哪种共同参与方式，没有测试那些表现。因此次数不能换算识鸟准确率、MBTI、EQ、职业适配或诊断。"
      }
    ]
  },
  {
    "id": "practice",
    "title": {
      "en": "Try one optional contribution and keep sharing under your control",
      "zh": "自选一个小贡献，自主决定怎样分享"
    },
    "paragraphs": [
      {
        "en": "In an ordinary shared activity, you can choose one modest action: allow a short pause, note three plain details or offer one orientation cue. Ask whether it helps, and stop when appropriate. These examples illustrate the portraits rather than promise improved concentration, empathy or wellbeing.",
        "zh": "在普通共同活动中，可以自选一个小行动：留短暂停顿、记三个朴素细节，或给一个定位提示。问是否有帮助，并在合适时停止。例子用于说明画像，不承诺提升专注、共情或身心状态。"
      },
      {
        "en": "Start opens question one directly. Optional progress saving stays in this tab for up to twenty-four hours and clears on completion, retake or exit-and-clear. Copying shares leading portrait names and public links, excluding the six answers and counts. You may finish here without taking another test.",
        "zh": "点击开始直接进入第一题。可自愿在本标签页保存进度，最多二十四小时，完成、重测或退出清除即删除。复制分享最高画像名称与公开链接，不含六条回答与次数。无需再做另一测试，可以在此结束。"
      }
    ]
  }
];
export const birdwatchingFaq: FunFaq[] = [
  {
    "question": {
      "en": "Do I need birding experience or to identify a species?",
      "zh": "需要观鸟经验或认出鸟种吗？"
    },
    "answer": {
      "en": "No. The questions describe a fictional club and illustrated birds. You choose how to participate; no photograph, birdsong, species name or field report is graded.",
      "zh": "不需要。题目描述虚构小组与插画鸟类，你选择怎样参与，不对照片、鸟鸣、物种名称或野外报告评分。"
    }
  },
  {
    "question": {
      "en": "How long does it take, and what is free?",
      "zh": "需要多久，哪些内容免费？"
    },
    "answer": {
      "en": "Six three-option questions take about two minutes, without a time limit. All choices, totals, highest ties and three full public guides are free, with no registration or prerequisite test.",
      "zh": "六道三选一约两分钟，不限时。全部题目、次数、最高并列及三篇公开全文免费，无需注册或前置测试。"
    }
  },
  {
    "question": {
      "en": "Why can several companion portraits appear?",
      "zh": "为什么会出现多种同行画像？"
    },
    "answer": {
      "en": "Each choice gives one point to one portrait. All portraits tied at the highest total appear. A 3–3–0 result retains two; a 2–2–2 result retains all three. Display order never breaks the tie.",
      "zh": "每次选择给一种画像加1次，所有最高同分均显示。3—3—0保留两种，2—2—2保留三种。显示顺序不破同分。"
    }
  },
  {
    "question": {
      "en": "Does a low recording count mean my memory is poor?",
      "zh": "记录次数低表示记忆不好吗？"
    },
    "answer": {
      "en": "No. The game asks which offered action you prefer in six scenes. It does not test recall or verify the accuracy and completeness of a real record.",
      "zh": "不是。游戏询问六个场景里更想选哪个给定行动，没有测试回忆，也不核实真实记录的准确性和完整性。"
    }
  },
  {
    "question": {
      "en": "Must a patient-window result mean waiting longer is better?",
      "zh": "慢看画像是否意味着等得越久越好？"
    },
    "answer": {
      "en": "No. The portrait includes choosing a comfortable pause and a stopping point. Your preferred pace need not be another person’s; nobody needs to remain in an activity to justify a result.",
      "zh": "不是。画像包含舒适停留与停止点。你的节奏未必适合他人，任何人都不必为了证明结果而留在活动里。"
    }
  },
  {
    "question": {
      "en": "Does shared-view appoint me as the group leader?",
      "zh": "共享视野画像是在任命我当组长吗？"
    },
    "answer": {
      "en": "No. It describes optional orientation and access cues. Ask whether help is wanted; you can return to your own watching without being responsible for everyone’s experience.",
      "zh": "不是。它描述可自选的定位与参与提示。先问是否需要帮助，也可以回到自己的观看，不必负责每个人的体验。"
    }
  },
  {
    "question": {
      "en": "Can these illustrated scenes be reported to eBird?",
      "zh": "可以把这些插画场景报送到eBird吗？"
    },
    "answer": {
      "en": "No. They are fictional, not in-person observations of living wild birds. This page does not submit data to eBird or another scientific project. Follow the actual project’s instructions for a real observation.",
      "zh": "不能。这些是虚构场景，不是现场观察活体野生鸟类。本页不向eBird或其他科学项目报送资料。真实观察应遵循对应项目说明。"
    }
  },
  {
    "question": {
      "en": "Is this the Dove–Owl–Peacock–Eagle personality test?",
      "zh": "这是鸽子、猫头鹰、孔雀、老鹰四鸟人格测试吗？"
    },
    "answer": {
      "en": "No. The three results describe participation in a fictional birdwatching outing. They are not bird-species personality labels or a DISC/DOPE scale, and their counts cannot be converted into those results.",
      "zh": "不是。三种结果描述虚构观鸟外出中的参与方式，不把人分配为鸟种，也不是DISC或DOPE量表，次数不能换算那些结果。"
    }
  },
  {
    "question": {
      "en": "Can I change answers and get a different result?",
      "zh": "可以改答并得到不同结果吗？"
    },
    "answer": {
      "en": "Yes. Use Back during the attempt or Retake after completion. Counts follow the selected options, so changed choices can change the leading portraits. That alone does not show a lasting personality change.",
      "zh": "可以。作答中用上一题，完成后用重新测试。次数跟随所选选项，选择变化可能改变最高画像，单凭这些不能说明人格长期改变。"
    }
  },
  {
    "question": {
      "en": "What is saved or included when I copy a result?",
      "zh": "保存或复制结果会包含什么？"
    },
    "answer": {
      "en": "Saving is optional in this tab, expires after twenty-four hours and clears on completion, retake or exit-and-clear. Copied result text includes leading portrait names and public links, not individual answers or counts.",
      "zh": "保存是本标签页的自愿选择，二十四小时后失效，完成、重测或退出清除即删除。复制结果含最高画像名称与公开链接，不含各题答案或次数。"
    }
  },
  {
    "question": {
      "en": "Must I agree, save progress or take MBTI before starting?",
      "zh": "开始前必须同意、保存或先做MBTI吗？"
    },
    "answer": {
      "en": "No. Start takes you directly to question one. Optional saving is not a gate. The full result appears after the six choices, and continuing to another test is your choice.",
      "zh": "不用。点击开始直接进入第一题，自愿保存不是门槛。六次选择后显示完整结果，是否继续其他测试由你决定。"
    }
  }
];
