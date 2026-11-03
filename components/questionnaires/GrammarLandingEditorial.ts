import type { Questionnaire } from "@/lib/questionnaires/types";

export const grammarLandingSections: Questionnaire["guide"] = [
  {
    "id": "grammar-editorial-scope",
    "title": {
      "zh": "英语语法测试练什么？形式、句法关系与改写条件",
      "en": "What does this English Grammar Test practise? Forms, syntax and editing goals"
    },
    "paragraphs": [
      {
        "zh": "本版包含24道原创四选一，动词形式与时间、一致与指代、冠词与功能词、标点与所有关系各六题。练习对象是读懂题目所指定的标准书面结构并选择相应形式。动词题会说明是否采用完成形式、主动或被动；改写题会固定句子数量、连接方式或拥有者数量，让答案能够按明确任务核查。",
        "en": "This edition has twenty-four original four-choice items, six each on verb forms and time, agreement and reference, articles and function words, and punctuation and possession. It practises recognising a specified standard written construction. Verb items identify the requested perfect or voice construction; editing items fix sentence boundaries, connectors or owner count so the key can be checked against an explicit task."
      },
      {
        "zh": "完整结果同时保留你的选择、正确答案、逐题理由与四份公开复习指南，不按正确数锁住解析。语法专项关注句内结构；它与本站英语水平练习中的词义、阅读和任务消息范围不同，也不把识别答案自动当成独立写作或完整语言能力。可以先完成再复习，也可以先读指南再练，记录两种不同条件即可。",
        "en": "Every result retains your choices, keys, worked reasons and four public revision guides, without locking explanations behind a correct-count threshold. This grammar-only set differs from the vocabulary, reading and functional-message scope of our separate English proficiency practice. Recognising an answer does not establish independent writing or overall language ability. You may practise before or after reading the guides; record those as different conditions."
      }
    ]
  },
  {
    "id": "grammar-editorial-verb",
    "title": {
      "zh": "动词形式怎样复习？分清助动词、分词与时间视角",
      "en": "How should you review verb forms? Auxiliaries, participles and time perspective"
    },
    "paragraphs": [
      {
        "zh": "先把动词链分段，而不是只看句尾的时间词。一般过去时的did not后接动词原形；完成形式含have的相应形式与过去分词，过去完成时用had，将来完成形式用will have。被动结构则包含be与过去分词，改变句子怎样呈现动作的承受者。[1][3][4][5][10] 一个-ed词尾可能参与不同结构，不能仅凭词尾决定时态或语态。",
        "en": "Separate the verb chain before relying on a time word. Past-simple did not takes a base verb. Perfect forms contain a form of have and a past participle: had for past perfect and will have for future perfect. A passive construction contains be and a past participle and presents the receiver of an action differently.[1][3][4][5][10] The same -ed ending can occur in different structures, so the ending alone cannot identify tense or voice."
      },
      {
        "zh": "看三个新例句：The designer did not decorate the box；The designer had decorated the box before the display opened；By Saturday, the designer will have decorated the box。分别标出否定助动词、过去参照点和未来期限，再比较The box was decorated by the designer。这些句子说明不同任务怎样改变形式，不主张“看到before一定用过去完成时”；真实语境还要考虑说话者想表达的时间关系。",
        "en": "Consider three fresh examples: The designer did not decorate the box; The designer had decorated the box before the display opened; By Saturday, the designer will have decorated the box. Mark the negative auxiliary, past reference point and future deadline, then compare The box was decorated by the designer. These examples connect forms to stated purposes; they do not mean before always requires past perfect. Actual usage also depends on the intended time relationship."
      }
    ]
  },
  {
    "id": "grammar-editorial-agreement",
    "title": {
      "zh": "主谓一致与代词：先找中心词，再找句法位置",
      "en": "Agreement and pronouns: find the head and the sentence role"
    },
    "paragraphs": [
      {
        "zh": "主语中的修饰短语可能把另一个名词放在动词附近，但一致关系仍要核对主语。两个不同人物由and连接、each作中心词，以及主语与动词之间的插入短语，是本组六题里的不同检查点。[12] 代词还要分别核对替代对象和句法位置：主语用的形式与介词后宾语形式不同，不能只按“说的是谁”来选。[6]",
        "en": "A modifying phrase may place another noun near the verb, but agreement still depends on the subject. Two distinct people joined by and, each as the head, and intervening phrases are separate checks in this group.[12] Pronouns require both a referent and a sentence role: a subject form differs from an object form after a preposition. Identifying whom the pronoun refers to is only part of the task.[6]"
      },
      {
        "zh": "新例句A bundle of yellow ribbons lies beside the folders中，中心词是bundle；改成The yellow ribbons lie beside the folders，才由ribbons控制一致。再写Lena and I placed the labels; the organiser thanked us，对照主语与宾语形式。人物的补充信息从句还要看逗号与从句内部位置；本版练习的非限定性主语从句用who，不能把它推广为所有人物关系从句都排除that。[7]",
        "en": "In the new sentence A bundle of yellow ribbons lies beside the folders, bundle is the head. In The yellow ribbons lie beside the folders, ribbons controls agreement. Next compare subject and object forms in Lena and I placed the labels; the organiser thanked us. An added-information clause about a person also requires attention to commas and the role inside the clause. This bank’s non-defining subject clause takes who; that does not exclude that from every relative clause about a person.[7]"
      }
    ]
  },
  {
    "id": "grammar-editorial-small-words",
    "title": {
      "zh": "冠词与时间介词：看紧接的发音与具体时间表达",
      "en": "Articles and time prepositions: the following sound and the time expression"
    },
    "paragraphs": [
      {
        "zh": "A和an的选择看紧接冠词的发音，不只看字母，也不跳过形容词直接看名词。[8] 例如新短语an honest request与a helpful request，两个名词相同，形容词的起始发音改变选择。先确认题目要求不定冠词，再处理发音；不要在已固定首次提到的任务里自行补出“双方已经知道对象”的背景来改用the。",
        "en": "A versus an depends on the sound immediately after the article, rather than just a written letter or a noun beyond an adjective.[8] Compare the new phrases an honest request and a helpful request: the noun stays the same while the adjective’s initial sound changes the article. First establish that the task requests an indefinite article, then inspect the sound instead of inventing shared prior knowledge to justify the."
      },
      {
        "zh": "时间表达可先圈出单位：新例句The workshop begins at 09:45 on Thursday in November，把钟点、星期与月份分开看。[9] 这只是本版所练结构；next Thursday等表达不直接套用同一介词。Can后的形式题则检查其后动词是否保留原形。复习时一次只改变一个条件，例如把月份换成确切日期，说明为什么需要重新检查，而不是背一个万能介词。",
        "en": "Circle the time unit in a new example: The workshop begins at 09:45 on Thursday in November. Clock time, named day and month call for different checks.[9] These are the constructions selected here; expressions such as next Thursday do not simply take the same preposition. The can item checks the following base verb. Change one condition at a time, such as replacing a month with a particular date, and explain why the choice needs checking again."
      }
    ]
  },
  {
    "id": "grammar-editorial-editing",
    "title": {
      "zh": "标点与所有关系：先确定改写目标，再检查符号",
      "en": "Punctuation and possession: establish the editing goal before the mark"
    },
    "paragraphs": [
      {
        "zh": "两个独立分句可以根据写作目的采用不同连接。本版有一题明确要求“不加连词、仍为一个句子”，因此用分号；另一题保留however，并练习其前分号、其后逗号的组合。[13] 新例句The sketch was complete; however, the caption needed revision可改写成两句话，但那是另一个编辑目标。不能把“另一种改法也合法”和“满足本题要求”混为一谈。",
        "en": "Two independent clauses can be joined differently for different purposes. One item explicitly requests one sentence without a conjunction, so it uses a semicolon. Another retains however and practises a semicolon before it and a comma after it.[13] The new example The sketch was complete; however, the caption needed revision can become two sentences, but that serves a different editing goal. A legitimate alternative edit need not meet this task’s constraint."
      },
      {
        "zh": "所属表达先看拥有者，再看物件。新对照the dancer’s costume与the dancers’ costume分别指一位、几位舞者，而服装都可为一件；规则性复数已以s结尾时，所属撇号放在其后。[14] Its则已表达所属，不再加撇号；it’s需要能展开为it is或it has。检查缩约时先展开再读整句，检查所有格时先把拥有者数量写清。",
        "en": "For possession, inspect owners before objects. The new contrast the dancer’s costume versus the dancers’ costume changes one dancer to several while allowing one costume in either case. A regular plural already ending in s takes its possessive apostrophe afterwards.[14] Its already expresses possession; it’s must expand to it is or it has. Expand a contraction and reread the sentence; state owner count before checking a possessive."
      }
    ]
  },
  {
    "id": "grammar-editorial-counts",
    "title": {
      "zh": "正确数怎样计算？相同总数也可能需要不同复习",
      "en": "How are correct counts calculated? The same total can call for different revision"
    },
    "paragraphs": [
      {
        "zh": "24题都作出有效选择后，每个与答案一致的选择记1题，其他记0题；四组各0—6题，合计0—24题。不按用时加分，不给高级题额外权重，也不把缺答自动填入。结果中的3/6只指该组的六个选定任务，不能解释成“掌握了一半英语语法”。所有24条答案解析与四份五节指南在零题答对时也完整可读。",
        "en": "After all twenty-four valid choices, each keyed answer adds one correct item and every other choice adds zero. Four groups range from zero to six and total zero to twenty-four. There is no speed bonus, extra weighting or filled-in missing answer. A displayed 3/6 refers to six selected tasks, not mastery of half of English grammar. All twenty-four worked answers and four five-section guides remain available even at zero correct."
      },
      {
        "zh": "例如四组为2、6、0、5时，总数是13/24。可以优先复习第三组实际漏看的冠词、时间介词或情态形式，再细看第一组的助动词；这不是认定第三组总体能力最差。另一组4、3、3、3也合计13/24，却对应不同错误。总数相同，不应获得同一种能力标签；复习选择要回到每道题的具体理由。",
        "en": "For example, group counts of 2, 6, 0, 5 total 13/24. Start by reviewing the particular article, time-preposition or modal-form choices missed in the third group, then inspect auxiliaries in the first; this does not establish the weakest overall ability. Counts of 4, 3, 3, 3 also total 13/24 but involve different errors. Equal totals need not imply the same label or revision task: return to each worked reason."
      }
    ]
  },
  {
    "id": "grammar-editorial-practice",
    "title": {
      "zh": "从选对到会用：一条规则、一处改动、一段新表达",
      "en": "From recognition to use: one rule, one change and a fresh message"
    },
    "paragraphs": [
      {
        "zh": "复习一题时，先写清“题目要求什么—我选了什么—漏看了哪个条件”，再用自己的词解释答案。然后自写一个同类新句，只改变一个特征，例如主语单复数、主动被动或拥有者人数。写完后查对应参考，再说明哪些词必须随之改变。这个流程是可选复习建议，没有在本页测得的提高率或保证效果。",
        "en": "For one missed item, record the requested construction, your choice and the condition you missed. Explain the key in your own words, then write a fresh related sentence changing one feature, such as subject number, voice or owner count. Check the relevant reference afterwards and explain which words must change with it. This is an optional revision routine, not a measured improvement rate or guaranteed effect."
      },
      {
        "zh": "再把新句放进两到三句的虚构活动消息，看看指代是否清楚、时间是否连贯、句界是否符合你想表达的关系。这里没有自动给自由写作评分；可以请愿意的读者或老师针对这几个具体问题反馈。看过答案后重做固定24题可能记得选项，因此可把重测当作复习记录，另用新内容观察能否迁移。",
        "en": "Place the new sentence in a short fictional activity message and inspect reference, time relationships and sentence boundaries. This page does not automatically grade that writing. A willing reader or teacher can respond to those specific questions. Repeating the fixed twenty-four items after reading keys may involve option memory, so treat a retake as a revision record and use new material to explore transfer."
      }
    ]
  },
  {
    "id": "grammar-editorial-evidence",
    "title": {
      "zh": "语法参考、计分与语言等级：三类证据分别核对",
      "en": "Grammar references, scoring and language levels require different evidence"
    },
    "paragraphs": [
      {
        "zh": "British Council与Purdue OWL的参考说明支持选定结构怎样使用；它们不因此认可费马题本或提供本版常模。计分测试可以核对答案、分组和完整解析是否一致，但不会证明题目难度已经校准。本版没有建立CEFR映射、雅思托福换算、招聘线或校对资格；语法识别也不替代听力、口语与即时写作证据。",
        "en": "British Council and Purdue OWL references explain selected constructions; they do not endorse this bank or provide its norms. Scoring checks can verify keys, groups and explanation delivery without establishing calibrated difficulty. This edition has no established CEFR mapping, IELTS or TOEFL conversion, hiring cutoff or proofreading qualification. Grammar recognition also cannot replace listening, speaking or spontaneous-writing evidence."
      },
      {
        "zh": "中英文界面保留相同英文题句、选项、正确答案与四份指南，说明和解析提供两种语言。读者可能借助不同语言理解任务，因此内容一致不等于已证明测量等价。开始直接进入题目，不需额外同意、账号、邮箱或付款；答案在浏览器计数，可选草稿24小时失效并在完成、重测或退出清除后删除。分享仅含公开测试链接，不含私人答案与正确数。",
        "en": "Both interfaces retain the same English stimuli, options, keys and four guides, with bilingual instructions and explanations. Language may affect how a reader understands a task, so content parity does not establish measurement equivalence. Start opens questions directly without another agreement, account, email or payment. Browser-scored answers have optional twenty-four-hour tab drafts cleared on completion, retake or exit-and-clear. Sharing includes a public test link, not private answers or correct counts."
      }
    ]
  }
];

export const grammarLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "每一组具体复习哪些规则？",
      "en": "Which rules does each group review?"
    },
    "answer": {
      "zh": "动词组练否定、进行、完成与被动形式；一致指代组练中心词、并列人物、each、主宾格与人物补充从句；功能词组练a/an、时间介词与can后原形；改写组练分号、however、拥有者数量、its与it’s。四组各六题，不覆盖全部英语语法。",
      "en": "The verb group covers negative, continuous, perfect and passive forms. Agreement/reference covers heads, paired people, each, subject/object forms and an added-information clause. Function words cover a/an, time prepositions and the base form after can. Editing covers semicolons, however, owner count, its and it’s. Six items per group do not cover all grammar."
    }
  },
  {
    "question": {
      "zh": "为什么不能只凭时间词选时态？",
      "en": "Why not select a tense from a time word alone?"
    },
    "answer": {
      "zh": "相同时间表达可能搭配不同含义和结构。本题明确要求某种形式，作答还需核对助动词、主语一致和分词；真实表达则要先确定时间关系与意图，不能把关键词当成唯一规则。[1][3][4][10]",
      "en": "A time expression can occur with different meanings and constructions. These tasks specify a form and still require checks of auxiliaries, agreement and participles. In actual use, establish the time relationship and intended meaning rather than treating one keyword as the only rule.[1][3][4][10]"
    }
  },
  {
    "question": {
      "zh": "主语旁边有复数名词，一定用复数动词吗？",
      "en": "Does a nearby plural noun require a plural verb?"
    },
    "answer": {
      "zh": "不一定。主语与动词之间的修饰短语不自动改变主语数量。本版要求找出中心词；例如a bundle of ribbons中的中心词是bundle。要按结构核对，不能仅选离动词最近的名词。[12]",
      "en": "No. An intervening modifying phrase does not automatically change subject number. Find the head: bundle in a bundle of ribbons. Inspect the structure rather than simply choosing the noun nearest the verb.[12]"
    }
  },
  {
    "question": {
      "zh": "冠词题看字母还是发音？",
      "en": "Do article choices depend on letters or sounds?"
    },
    "answer": {
      "zh": "在本题指定的不定冠词结构中，看紧接冠词的发音；即使名词前有形容词，也从这个形容词的起始音判断。An honest request与a helpful request说明相同名词前仍可不同。[8]",
      "en": "In the indefinite constructions requested here, inspect the sound immediately after the article, including a preceding adjective. An honest request and a helpful request show why the same noun can take different articles.[8]"
    }
  },
  {
    "question": {
      "zh": "为什么一个合法句子也可能不符合改写题？",
      "en": "Why might a legitimate sentence fail an editing task?"
    },
    "answer": {
      "zh": "题目可能要求保留一个句子、不加连词或固定拥有者数量。句号可以形成另一种合法表达，却改变了句子数量；改用其他连接也可能改变任务。先满足明示目标，再比较其他合法改写。[13][14]",
      "en": "A task may require one sentence, no conjunction or a fixed number of owners. A full stop can produce another legitimate expression while changing sentence count; another connector can also change the task. Meet the explicit goal before comparing alternative edits.[13][14]"
    }
  },
  {
    "question": {
      "zh": "零题答对或全部答对，能看到的内容不同吗？",
      "en": "Do zero and perfect counts unlock different content?"
    },
    "answer": {
      "zh": "内容相同。0/24、部分答对和24/24都提供每题所选、答案、理由以及四份完整五节指南，共20节。没有用分数、邮箱、账户或付款锁住复习内容。",
      "en": "No. Zero, partial and perfect counts all show every selected option, key and reason, plus four complete five-section guides: twenty sections. Correct counts, email, accounts and payment do not lock revision content."
    }
  },
  {
    "question": {
      "zh": "13/24可以说明什么？",
      "en": "What can 13/24 tell me?"
    },
    "answer": {
      "zh": "它记录在本题组及当次条件下有13题与答案一致。例如2、6、0、5与4、3、3、3都合计13题，但具体错误不同。应据逐题解析选择复习，不据总数判定CEFR、写作等级或人群位置。",
      "en": "It records thirteen keyed choices in this bank under that attempt’s conditions. For example, 2, 6, 0, 5 and 4, 3, 3, 3 both total thirteen but involve different errors. Choose revision from worked answers rather than inferring CEFR, a writing grade or population position."
    }
  },
  {
    "question": {
      "zh": "怎样减少重测只是记住答案的影响？",
      "en": "How can I distinguish revision from remembering keys?"
    },
    "answer": {
      "zh": "记录是否已经看过题目、是否查工具以及作答语言。复习后换一个新句，说明同一规则怎样应用，再把它放进短消息里核指代和时间。重测使用同一固定题本，不是平行版本，也没有自动消除记忆影响。",
      "en": "Record prior exposure, aids and interface language. After revision, write a new sentence using the rule and place it in a short message to inspect reference and time. Retakes use the same fixed bank, not a parallel form, and do not automatically remove memory effects."
    }
  }
];
