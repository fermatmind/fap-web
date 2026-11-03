import type { Copy, FunFaq } from "@/lib/entertainment/types";
export const browserTabsSections: {id:string;title:Copy;paragraphs:Copy[]}[] = [
  {
    "id": "purpose",
    "title": {
      "en": "Browser-tab style quiz: what does an open page keep for you?",
      "zh": "休闲浏览标签页测试：开着的页面为你留着什么？"
    },
    "paragraphs": [
      {
        "en": "An open hobby page can hold a question, a possible small activity or an interest to revisit another day. Six fictional browsing scenes explore which of these functions you would choose. You do not submit a URL, install an extension or give access to your real tabs.",
        "zh": "一页开着的爱好资料，可能留着一个问题、一次小活动，或改天想回看的兴趣。六个虚构浏览场景探索你会选择哪种用途。无需提交网址、安装扩展或授权读取真实标签页。"
      },
      {
        "en": "Answer for casual interests, rather than urgent work, a financial decision or a page with unsaved changes. Those situations have different requirements. The three portraits describe your selections in this short story, without judging how many pages you should keep open.",
        "zh": "请以休闲兴趣作答，不以紧急工作、财务决策或尚未保存改动的页面为参照，那些情况有不同要求。三种画像描述短故事中的选择，不规定你应该开着多少页。"
      }
    ]
  },
  {
    "id": "question",
    "title": {
      "en": "Keep the question that made the page worth opening",
      "zh": "留住让页面值得打开的那个问题"
    },
    "paragraphs": [
      {
        "en": "Question choices preserve the reason for opening a page: what you wanted to understand, which detail remains unresolved and what would count as enough for now. A short note can connect the reference to its purpose without requiring an exhaustive collection.",
        "zh": "问题选项保留打开页面的理由：想弄明白什么、哪个细节尚未解决，以及目前怎样算够了。短短一笔可以连接资料与用途，不要求收集穷尽所有参考。"
      },
      {
        "en": "For example, “Which fold makes this paper corner stand up?” is more specific than “craft links”. It may help you decide whether to revisit a diagram or stop searching. This is an optional prompt, not proof of strong research ability, memory or critical thinking.",
        "zh": "例如，“哪种折法能让这个纸角立住？”比“手工链接”更具体，可帮助决定回看图解还是停止查找。这是可选提示，不证明研究能力、记忆或批判性思维较强。"
      }
    ]
  },
  {
    "id": "action",
    "title": {
      "en": "One small try can remain small",
      "zh": "一次小试，可以就保持很小"
    },
    "paragraphs": [
      {
        "en": "Action choices connect an interesting idea to one wanted, reversible hobby trial with something already available. Trying one paper fold need not become a new project, a purchase or a promise to complete every tutorial. Decide separately whether a next step would still be enjoyable.",
        "zh": "小试选项把有趣想法接到一次真想做、可撤回、用已有材料即可尝试的爱好活动。试一折纸不必变成新项目、购物或完成全部教程的承诺。下一步是否仍有趣，可以另行决定。"
      },
      {
        "en": "You can return to a relevant explanation before trying. Acting quickly is not inherently better than reading, and a page can be worth enjoying without producing anything. A high action count does not measure productivity, initiative at work or successful task completion.",
        "zh": "尝试前可以回到相关说明。迅速动手并不天然优于阅读，网页也可以只供欣赏而无需产出。小试次数高，不测生产效率、工作主动性或任务完成能力。"
      }
    ]
  },
  {
    "id": "shelf",
    "title": {
      "en": "An interest shelf is a place to revisit, not a compulsory queue",
      "zh": "兴趣架是回看的位置，不是必须清完的队列"
    },
    "paragraphs": [
      {
        "en": "Shelf choices keep a modest group of interests somewhere you can return to or ignore. A plain title such as “exhibitions I might browse” can name a collection without assigning dates or turning every item into a task. Keeping an interest is different from committing to it.",
        "zh": "兴趣架选项把少量兴趣放在可回看、也可暂不理会的位置。例如“有空想翻的展览”，可以命名集合，而不逐项分配日期或任务。保留兴趣与作出承诺是两件事。"
      },
      {
        "en": "If the collection no longer invites a pleasant return, you may remove an item or keep only a small part. Neither saving nor removing proves that the original curiosity was worthwhile or wasted. The portrait does not prescribe a maximum collection size or a daily clearing routine.",
        "zh": "集合不再让人想愉快回看时，可以移走一项，或只留少量内容。保存或移除都不能证明原来的好奇有价值或被浪费。画像不规定集合上限，也不安排每日清空任务。"
      }
    ]
  },
  {
    "id": "scoring",
    "title": {
      "en": "Six selections, three raw totals and all highest ties",
      "zh": "六次选择、三项原始次数与全部最高并列"
    },
    "paragraphs": [
      {
        "en": "Each question offers one question-related, one action-related and one shelf-related option. Selecting an option adds one point to its portrait. Complete all six to generate a personal result: each total ranges from zero to six and the three totals sum to six. No browsing behaviour is used in this calculation.",
        "zh": "每题为问题、小试与兴趣架各提供一个选项。选中某项，对应画像加1次。六题全部完成才生成个人结果：每项0至6次，三项合计6次。实际浏览行为不参与计算。"
      },
      {
        "en": "All portraits with the largest total appear. Question 3, action 3, shelf 0 retains two; 2–2–2 retains all three. Question, action, shelf is a display order, not a tie-breaker. A one-point lead is one more offered choice here, not a calibrated difference in attention or organisation.",
        "zh": "所有最高次数的画像均显示。问题3、小试3、兴趣架0保留两种；2—2—2保留三种。问题、小试、兴趣架只是显示顺序，不破同分。领先1次表示本题组多选1次，不是校准过的注意力或条理差异。"
      }
    ]
  },
  {
    "id": "combinations",
    "title": {
      "en": "Combine functions without assigning yourself a permanent type",
      "zh": "可以搭配用途，不必认领永久类型"
    },
    "paragraphs": [
      {
        "en": "Question and action can combine as noting one uncertainty and then trying a small example. Question and shelf can combine as keeping a reason beside a saved reference. Action and shelf can combine as recording a trial and leaving other variations for another day. These illustrate possible uses rather than extra scored dimensions.",
        "zh": "问题与小试可以搭配为记一个疑问，再试一个小例子；问题与兴趣架可以搭配为在已存参考旁保留理由；小试与兴趣架可以搭配为记录尝试，把其他变化留待以后。这些说明可能用途，没有新增计分维度。"
      },
      {
        "en": "A three-way tie leaves all three portraits visible. A zero does not show that you never use that function: each scene required just one of several offered actions. Different choices on a retest may reflect a different imagined interest, mood or response; this game cannot separate those effects from stable change.",
        "zh": "三项并列保留全部画像。0次不表示从未使用该用途，因为每个场景只让你在给定动作中选一个。重测选择变化可能来自想象的兴趣、心情或作答不同，本游戏无法把这些因素与稳定变化区分。"
      }
    ]
  },
  {
    "id": "research",
    "title": {
      "en": "What tab-use research studied, and what it did not establish here",
      "zh": "标签页研究考察了什么，没有替本页证明什么"
    },
    "paragraphs": [
      {
        "en": "Chang and colleagues’ CHI 2021 paper examined competing pressures to keep and close tabs. The authors interviewed ten information workers, revisiting their open tabs four times over two weeks, and then surveyed 103 participants. The study concerns browser use and interface costs, not these three fictional portraits. [1]",
        "zh": "Chang等人的CHI 2021论文考察了保留与关闭标签页的相互牵制。作者访谈十位信息工作者，两周内四次查看其开着的页面，之后调查103位参与者。研究关注浏览使用与界面成本，不是本页三种虚构画像。[1]"
      },
      {
        "en": "Reasons to keep a page can include a reminder or the effort of finding it again. Those findings help frame a question about a page’s function, but they do not supply a universal “too many tabs” threshold, validate this six-question tally or establish an individual’s discipline. This quiz supplies no reliability, validity or population norms.",
        "zh": "保留页面的理由可以包括提醒用途或再次寻找的成本。这些发现有助于提出页面用途的问题，但不提供通用的“开太多”界线，不验证本站六题计数，也不判定个人自律。本测试不提供信度、效度或人群常模。"
      }
    ]
  },
  {
    "id": "tools",
    "title": {
      "en": "A stored link, a tab group and a saved page are different things",
      "zh": "存链接、分组与保存页面，是不同事情"
    },
    "paragraphs": [
      {
        "en": "Browser tools can group, name, close or reopen pages, but their storage and sync rules differ. Chrome’s Android guidance distinguishes closing a saved group from deleting it; Firefox’s French help states that its tab groups are local rather than synced through Firefox Sync. Consult the current instructions for your browser before changing real tabs. [2] [3]",
        "zh": "浏览器工具可以分组、命名、关闭或重新打开页面，但保存与同步规则不同。Chrome的Android指引区分关闭已存分组与删除分组；Firefox法文帮助说明其标签页分组留在本地，不经Firefox Sync同步。修改真实页面前，应查看所用浏览器的现行说明。[2] [3]"
      },
      {
        "en": "A saved URL is a route back, not necessarily an offline copy, a preserved login state or a backup of an unfinished form. Naming a collection may preserve context without preserving its contents. This page does not manage your browser or require you to close, synchronise or share any actual pages.",
        "zh": "存下网址是返回路径，不一定是离线副本、登录状态或未完成表单的备份。给集合命名可以保留语境，却不一定保存页面内容。本页不管理浏览器，也不要求关闭、同步或分享任何真实页面。"
      }
    ]
  },
  {
    "id": "context",
    "title": {
      "en": "Leisure browsing does not have to become performance",
      "zh": "休闲浏览不必变成绩效"
    },
    "paragraphs": [
      {
        "en": "A page opened for pleasure can remain pleasurable without yielding a decision, a finished craft or a useful note. If one question has been answered, you can stop; if a detour is enjoyable, you can leave room for it. These are options for this casual setting, not a productivity programme.",
        "zh": "为乐趣打开的页面，可以不产生决定、手工作品或有用笔记，仍然值得欣赏。一个问题已得到回答，可以停；岔路有趣，也可以留空间。这些是休闲情境里的选择，不是效率训练计划。"
      },
      {
        "en": "After reading a portrait, compare it with one recent casual interest and look for an exception. A browser’s tab count cannot be inferred from the result, and the result cannot explain why another person keeps their pages open. Ask about their purpose instead of assigning them your portrait.",
        "zh": "读完画像，可以对照最近一项休闲兴趣，并找一个不符合的例子。不能从结果推断真实标签页数量，也不能用结果解释别人为何开着页面。可以问其用途，而非替对方分配画像。"
      }
    ]
  },
  {
    "id": "practice",
    "title": {
      "en": "Try one optional note while keeping your real browsing private",
      "zh": "自选一个小记录，保留真实浏览隐私"
    },
    "paragraphs": [
      {
        "en": "Choose a harmless imagined or ordinary hobby interest. Write one question, try one reversible step or make a tiny optional list. Keep whichever helps you revisit the interest and discard what does not. No extension, tab import, browsing-history scan or public collection is needed.",
        "zh": "选一个无害的想象或普通爱好兴趣，写一个问题、试一步可撤回动作，或做极小的可选清单。保留有助于回看的部分，不合适的可以放下。无需扩展、导入标签页、扫描历史或公开集合。"
      },
      {
        "en": "Start opens question one directly. Optional quiz progress stays in this tab for up to twenty-four hours and clears on completion, retake or exit-and-clear; it does not save your browsing session. Copying shares leading portrait names and public guide links, excluding answers and counts. Another assessment is never required.",
        "zh": "开始直接进入第一题。可选测验进度在本标签页最多保留二十四小时，完成、重测或退出清除即删除，不会保存浏览会话。复制分享最高画像名称与公开指南链接，不含答案与次数，也不要求再做另一测评。"
      }
    ]
  }
];
export const browserTabsFaq: FunFaq[] = [
  {
    "question": {
      "en": "Does this page read my tabs or browsing history?",
      "zh": "本页会读取标签页或浏览历史吗？"
    },
    "answer": {
      "en": "No. You choose responses to six fictional scenes. There is no tab import, URL submission, extension installation or browsing-history access.",
      "zh": "不会。你只对六个虚构场景作答，没有导入标签页、提交网址、安装扩展或访问浏览历史。"
    }
  },
  {
    "question": {
      "en": "How long does it take, and what is free?",
      "zh": "需要多久，哪些内容免费？"
    },
    "answer": {
      "en": "Six three-option questions take about two minutes, without a time limit. All questions, counts, highest ties and three full public portraits are free and require no registration.",
      "zh": "六道三选一约两分钟，不限时。全部题目、次数、最高并列与三篇公开全文免费，无需注册。"
    }
  },
  {
    "question": {
      "en": "Why can I receive several portraits?",
      "zh": "为什么会得到多种画像？"
    },
    "answer": {
      "en": "Each selected option adds one point to one portrait. Every highest total remains: 3–3–0 keeps two and 2–2–2 keeps three. Display order never breaks the tie.",
      "zh": "每个选中项给一种画像加1次，所有最高次数均保留：3—3—0保留两种，2—2—2保留三种，显示顺序不破同分。"
    }
  },
  {
    "question": {
      "en": "Does the action portrait mean reading must produce something?",
      "zh": "小试画像表示阅读必须产出吗？"
    },
    "answer": {
      "en": "No. It describes choosing a small wanted trial in these scenes. Reading, watching or browsing for enjoyment can be enough without producing an object or completing a task.",
      "zh": "不是。它描述在这些场景里选择一次真想做的小试。为享受而阅读、观看或浏览，本身就可以足够，不要求做出物件或完成任务。"
    }
  },
  {
    "question": {
      "en": "Is an interest shelf an unfinished to-do list?",
      "zh": "兴趣架是未完成任务清单吗？"
    },
    "answer": {
      "en": "Not in this story. It is an optional place to revisit. You may ignore or remove an item without treating it as missed homework.",
      "zh": "在本故事中不是。它是可选的回看位置，可以暂不理会或移除一项，不必视为漏做的作业。"
    }
  },
  {
    "question": {
      "en": "Does a zero question count mean I am not curious?",
      "zh": "问题0次表示没有好奇心吗？"
    },
    "answer": {
      "en": "No. Each question requires one offered choice, even when several would matter. The count records relative selections here, not the amount of curiosity you have.",
      "zh": "不表示。即使现实中几项都重要，每题仍只能选一个给定项。次数记录本题组的相对选择，不测好奇心多少。"
    }
  },
  {
    "question": {
      "en": "How many open tabs is too many?",
      "zh": "开多少标签页算太多？"
    },
    "answer": {
      "en": "This quiz sets no threshold and does not count your tabs. The practical issue depends on what the pages are doing, the task, device and your ability to find what you need.",
      "zh": "本测试不设界线，也不统计页面。实际是否不便，与页面用途、任务、设备及能否找到所需内容有关。"
    }
  },
  {
    "question": {
      "en": "Is this a validated attention or productivity assessment?",
      "zh": "这是经过验证的注意力或效率测评吗？"
    },
    "answer": {
      "en": "No. It is an original entertainment tally, without supplied psychometric validation or norms. Research on browser interfaces does not validate these six story choices.",
      "zh": "不是。这是未提供心理测量验证或常模的原创娱乐计数，浏览器界面研究不能验证这六个故事选择。"
    }
  },
  {
    "question": {
      "en": "Will the quiz close or save real pages for me?",
      "zh": "测验会替我关闭或保存真实页面吗？"
    },
    "answer": {
      "en": "No. It neither changes browser tabs nor saves their contents. Optional quiz progress stores only this quiz draft, not links, unsaved forms or your browser session.",
      "zh": "不会。本页不改动浏览器标签页，也不保存其内容。可选测验进度只保存本题草稿，不保存链接、未完成表单或浏览会话。"
    }
  },
  {
    "question": {
      "en": "Must I agree, register or do another test before starting?",
      "zh": "开始前要同意、注册或做其他测试吗？"
    },
    "answer": {
      "en": "No. Start opens the first question directly. Saving is optional, and you can finish all six questions and read the full result without another assessment.",
      "zh": "不需要。开始直接进入第一题，保存自愿；不做其他测评，也可以完成六题并阅读完整结果。"
    }
  },
  {
    "question": {
      "en": "What is saved, and what does copying share?",
      "zh": "保存什么，复制分享包含什么？"
    },
    "answer": {
      "en": "An optional draft in this tab expires after twenty-four hours and clears on completion, retake or exit-and-clear. Copying contains leading portrait names and public links, not answers or counts.",
      "zh": "自愿保存的本标签页草稿二十四小时后失效，完成、重测或退出清除即删除。复制含最高画像名称与公开链接，不含答案或次数。"
    }
  }
];
