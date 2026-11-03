import type { Questionnaire } from "@/lib/questionnaires/types";

export const englishProficiencyLandingSections: Questionnaire["guide"] = [
  {
    "id": "english-scope",
    "title": {
      "zh": "英语水平测试练什么？从形式识别到信息传达",
      "en": "What does this English Proficiency Test practise? From form to meaning"
    },
    "paragraphs": [
      {
        "zh": "本版把书面英语分成四类可核对任务：六题语法句式、六题语境词义、六题短文证据和六题实际消息。语法看形式是否满足题定结构，词汇看义项是否适合上下文，阅读看结论是否有原文支持，消息看对象、版本、数字和条件有没有被准确保留。四类各有不同的错因，值得分开复习。",
        "en": "This edition separates written English into four checkable tasks: six grammar items, six contextual vocabulary items, six passage-evidence items and six practical messages. Grammar checks the requested construction; vocabulary checks a meaning in context; reading checks textual support; messages check whether objects, versions, numbers and conditions survive accurately. Each can reveal a different reason to revise."
      },
      {
        "zh": "题目中的博物馆、工作室和文件交接都是原创虚构语境。你不需要了解真实机构的政策。英文句子、短文和选项在两种界面中保持相同，中文界面提供中文任务说明与解析。完成后，先找出具体漏看的词或条件，再看对应完整指南，比只记住总正确数更便于决定下一步练习。",
        "en": "Museums, studios and handovers are original fictional contexts, requiring no knowledge of a real organisation’s policy. English sentences, passages and alternatives remain the same in both interfaces; Chinese adds translated instructions and explanations. After finishing, identify the missed word or condition and consult its full guide to choose a next task rather than retain only the total."
      }
    ]
  },
  {
    "id": "english-grammar",
    "title": {
      "zh": "语法复习：先辨句子结构，再检查动词形式",
      "en": "Grammar review: identify the construction before the verb form"
    },
    "paragraphs": [
      {
        "zh": "本组涉及一般现在时、过去时疑问句、复数be、非限定性关系从句和两种动词搭配。British Council分别说明了过去时疑问句中的did与动词原形、be的主语搭配、补充信息关系从句，以及enjoy和want后的形式。[2][3][4][5] 规则解释所选结构；题目的阅读标签并不把读者划入某个水平。",
        "en": "This group covers the present simple, past questions, plural be, non-defining relatives and two verb patterns. British Council explains did with a base verb, subject agreement for be, supplementary relative clauses and the patterns following enjoy and want.[2][3][4][5] These rules explain selected constructions; a resource’s teaching label does not classify the reader’s level."
      },
      {
        "zh": "另设例子：The two lanterns are ready；若改成一盏，应相应改为The lantern is ready。再比较Did Mira label the jar yesterday?和Mira labelled the jar yesterday：疑问句中的过去时由did承担。复习时每次只改主语、时间或句型的一处，再说清为什么另一处必须跟着变。新例子不属于计分题，也不要求照抄出版方例句。",
        "en": "Try fresh examples: The two lanterns are ready becomes The lantern is ready when there is one. Compare Did Mira label the jar yesterday? with Mira labelled the jar yesterday: did carries the past marking in that question. Change one subject, time or construction at a time, then explain the linked change. These unscored examples are independently written, not copied publisher exercises."
      }
    ]
  },
  {
    "id": "english-vocabulary",
    "title": {
      "zh": "词汇复习：同一情境里的六种意义差别",
      "en": "Vocabulary review: distinguish meanings within a situation"
    },
    "paragraphs": [
      {
        "zh": "六个目标词是postpone、accurate、tentative、concise、reluctant和feasible。Merriam-Webster的相应词条支持延后、准确、未定、简洁、不情愿与可实行等本题选定义项。[6][7][8][9][10][11] 读题时还要保留时间、态度和条件：后来答应不抹去起初的不情愿；可以实施也不是已经成功。",
        "en": "The targets are postpone, accurate, tentative, concise, reluctant and feasible. The corresponding Merriam-Webster entries support the selected senses of delay, accuracy, provisional status, brevity, unwillingness and practicability.[6][7][8][9][10][11] Keep time, attitude and conditions visible: later agreement does not erase earlier unwillingness, and being possible to carry out does not mean already successful."
      },
      {
        "zh": "另设一个社区读书会，时间暂写为周日14:00，场地尚待确认。tentative保留可调整的状态；postpone则需要实际改到较晚时间。若通知删掉重复句仍保留地点与条件，可以更concise；删掉地点只会让信息不完整。先写出意义差别，再查词典义项和搭配，比把每个词固定成一个中文标签更细致。",
        "en": "Imagine a reading group provisionally scheduled for Sunday at 14:00 while its room awaits confirmation. Tentative preserves possible revision; postpone requires moving it later. Removing repetition while retaining the place and condition can make a notice more concise; deleting the place makes it incomplete. State the contrast, then check senses and patterns rather than assign each word one permanent translated label."
      }
    ]
  },
  {
    "id": "english-reading",
    "title": {
      "zh": "阅读复习：有依据、被否定与尚未知要分开",
      "en": "Reading review: supported, contradicted and unanswered claims"
    },
    "paragraphs": [
      {
        "zh": "六篇短文分别要求核对时间条件、代词所指、主要目的、步骤顺序、因果限制和缺失信息。有效答案需要满足提问方式：“没有提供什么”不能按“提供了什么”来答，“先后步骤”必须同时保留全部依赖。某个数字或熟悉词在原文出现，并不保证包含它的选项就是答案。",
        "en": "The six passages ask about time conditions, reference, main purpose, sequence, causal limits and missing information. An answer must address the question: an unanswered-detail task differs from a supplied-fact task, and an order must preserve every dependency. A number or familiar word appearing in the text does not make every option containing it correct."
      },
      {
        "zh": "另设一则观鸟活动通知，只写集合地点、开始时间和预约截止，没有说明望远镜是否提供。可确认已写出的三项信息，器材问题仍未知；不能补成“免费提供”或“必须自带”。再设两处展台同周客流上升，而其中一处换了海报：这条记录本身仍不足以把增长全部归因于海报，也不能据此断言海报无效。",
        "en": "A fresh birdwatching notice gives a meeting point, start time and booking deadline but says nothing about binoculars. Those three logistics are known; equipment provision remains unanswered, not automatically included or necessarily self-supplied. Likewise, if two stands gain visitors in the same week and one changes a poster, the record alone neither assigns all growth to the poster nor proves it ineffective."
      }
    ]
  },
  {
    "id": "english-messages",
    "title": {
      "zh": "实际消息复习：语法通顺之后，还要逐项核事实",
      "en": "Practical messages: check the facts as well as the grammar"
    },
    "paragraphs": [
      {
        "zh": "消息题检查新版文件与截止日期、next Friday的具体日期、稿件及缺失照片、登记数字、未确认到货和批准分支。不同选项可以同样客气、同样通顺，却改了关键事实。核对顺序可以是：需要什么、哪个版本、什么时候、目前知道什么，以及什么条件满足后才行动。",
        "en": "Message items cover a revised file and deadline, the date intended by next Friday, a draft and missing photograph, register figures, unconfirmed delivery and approval branches. Alternatives can be equally courteous and grammatical while changing a key fact. Check what is needed, which version, when, what is known and which condition permits action."
      },
      {
        "zh": "另设“若周二10:00前确认场地，就发新版路线；否则先保留旧稿并询问新安排”。写回复时要保留两个分支：按时确认才发新版，未确认则保留并询问。不要把“尚未确认”写成“取消”。练习可在纸上完成，不需要发真实邮件；之后再请读者复述消息，检查自己的表达是否让条件变得清楚。",
        "en": "Try a new brief: if the venue is confirmed by Tuesday at 10:00, send the revised route; otherwise retain the old draft and ask about arrangements. Preserve both branches, and do not turn missing confirmation into cancellation. Practise on paper without sending real email, then optionally ask a reader to restate the message to check whether its condition is clear."
      }
    ]
  },
  {
    "id": "english-counts",
    "title": {
      "zh": "正确数怎样读？同一总数可以对应不同复习重点",
      "en": "How should correct counts be read? One total, different review needs"
    },
    "paragraphs": [
      {
        "zh": "24题全部作答后，答案匹配记1，不匹配记0，四组各0—6，总计0—24，没有速度奖励或难度权重。举例，四组分别2、6、0、5，合计13/24；它与6、0、5、2同为13/24，却需要看不同的题解。组间一题差只表示本组六次选择中多匹配一道，不自动建立四种能力之间的排序。",
        "en": "After all twenty-four responses, a matching answer adds one and a mismatch adds zero. Each group ranges from zero to six and the total from zero to twenty-four, without speed bonuses or difficulty weights. Counts of 2, 6, 0, 5 total 13/24, as do 6, 0, 5, 2, but point to different explanations. One extra matching item does not automatically rank four underlying abilities."
      },
      {
        "zh": "0/24、13/24和24/24都能看到每题所选、正确答案、逐项解析以及四份完整指南，共20个指南小节。全对可以继续尝试没有选项的新语境；答错则先核是否漏看任务、误认词义、跳过条件或尚未掌握形式。同一题重做会增加熟悉度，不能把记住答案造成的提高直接当成总体水平增长。",
        "en": "At 0/24, 13/24 and24/24, every selected response, answer and explanation remains available, together with four complete guides containing twenty sections. A perfect result can lead to fresh tasks without options; a mismatch invites checking the instruction, meaning, condition or form. Repeating a known item increases familiarity, so remembering its answer cannot directly establish growth in overall proficiency."
      }
    ]
  },
  {
    "id": "english-framework",
    "title": {
      "zh": "CEFR是什么？框架、等级测试与本页练习的关系",
      "en": "What is CEFR? A framework, a level assessment and this practice"
    },
    "paragraphs": [
      {
        "zh": "欧洲委员会用A1—C2六个等级及“能做什么”的描述组织语言能力。[12] 这些描述不是任意题库都可套用的百分比表。把一个答对数解释为某等级，需要针对具体题目、目标人群、实施条件和解释用途提供相应依据；仅给题目贴上初级、中级标签，并不能完成这种关联。",
        "en": "The Council of Europe organises proficiency through six levels, A1–C2, and can-do descriptors.[12] These are not a percentage lookup for any question bank. Interpreting a count as a level needs evidence for the particular items, target population, administration and intended use; attaching elementary or intermediate labels does not establish that relationship."
      },
      {
        "zh": "本页的证据分三层：语法与词典资料支持选定语言事实，短文原句支持题定答案，程序按明示规则加总正确数。三层都可核对，但它们本身不构成总体语言水平效度研究。本题组没有听说或自由写作评分，也没有CEFR校准研究；若需要学校或机构认可的证明，应先确认接收方要求的考试、技能范围与成绩有效条件。",
        "en": "Evidence here has three layers: grammar and dictionary references support selected language facts, supplied passages support their keys, and software totals matches under explicit rules. Each is checkable, but together they do not constitute a validation study of overall proficiency. There is no listening, speaking or free-writing mark or CEFR calibration. For formal evidence, first check the receiving institution’s required exam, skills and validity conditions."
      }
    ]
  },
  {
    "id": "english-practice",
    "title": {
      "zh": "完成以后怎样练？从看懂解析到独立表达",
      "en": "What comes next? From understanding an explanation to independent use"
    },
    "paragraphs": [
      {
        "zh": "可以选一道错题或一处不确定的正确答案，依次做三件事：遮住解析，说明决定答案的词与规则；自己换一个人物、时间或条件写新句；再用可靠资料核对。阅读题则把“主张—原文依据—未知项”写成三列。目标是弄清新语境里是否还能使用同一原理，而不是反复点同一个答案。",
        "en": "Choose a mismatch or an uncertain correct response. Hide the explanation and identify the decisive words or rule; write a new sentence changing a person, time or condition; then check a reliable reference. For reading, separate a claim, its supporting words and unresolved details. The aim is to see whether the principle works in a fresh context rather than repeatedly select a familiar answer."
      },
      {
        "zh": "也可从选择题延伸到一段短通知：写清对象、地点、时间与例外，再请愿意协助的人复述其意思。记录使用了词典、翻译或他人帮助，比较时保留这些条件。中文解析帮助理解任务，英文界面则把说明也变成英文；两者是阅读支持的不同选择，尚没有证据证明两个界面的分数在测量上等价。",
        "en": "Extend a selected-response task into a short notice with an object, place, time and exception, then optionally ask someone to restate its meaning. Record dictionaries, translation or assistance when comparing attempts. Chinese explanations support understanding the task, whereas English also keeps the instructions in English. Those are different reading supports; measurement equivalence between their scores has not been established."
      }
    ]
  }
];

export const englishProficiencyLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "做题前需要背语法术语吗？",
      "en": "Must I memorise grammar terminology first?"
    },
    "answer": {
      "zh": "不需要。题目会说明所要求的句型或任务。可以先看主语、时间和要表达的意思，再选形式。解析中的术语帮助定位具体规则，不能代替读懂整句。",
      "en": "No. Items state the requested construction or task. Identify the subject, time and intended meaning before choosing the form. Terms in explanations help locate a rule, without replacing the whole sentence."
    }
  },
  {
    "question": {
      "zh": "单词认识，为什么仍可能选错？",
      "en": "Why can a familiar word still lead to a mismatch?"
    },
    "answer": {
      "zh": "因为题目匹配的是当前语境中的意义。时间、否定、态度和条件都可能区分相近选项。熟悉词形并不保证已掌握每个义项；用解析说明本题为什么需要这个词。",
      "en": "The task concerns meaning in the supplied context. Time, negation, attitude and conditions distinguish nearby alternatives. Recognising a word’s form does not establish every sense; use the explanation to identify why this context needs it."
    }
  },
  {
    "question": {
      "zh": "阅读题能按日常常识补充信息吗？",
      "en": "Should I fill gaps in a passage with everyday assumptions?"
    },
    "answer": {
      "zh": "按题目给出的短文核对。题目问缺失信息时，未写出的价格、材料或承诺仍是未知。现实经验可以帮助理解词句，但不能补成题定事实。",
      "en": "Use the supplied passage. An unstated price, material or promise remains unknown when the task asks for missing information. Experience can help interpret language, not add facts to the text."
    }
  },
  {
    "question": {
      "zh": "为什么消息题的几个选项都很客气？",
      "en": "Why can several message alternatives sound equally polite?"
    },
    "answer": {
      "zh": "本组核对的是规定的信息有没有被保留。回复即使很客气，也可能写错房间、版本、日期或批准条件。先核事实，再考虑措辞是否适合受众。",
      "en": "These items check whether specified information survives. A courteous reply can still change a room, version, date or approval condition. Verify meaning first, then consider wording for the audience."
    }
  },
  {
    "question": {
      "zh": "13/24可以换算成雅思或大学英语等级吗？",
      "en": "Can 13/24 be converted to IELTS or a college English grade?"
    },
    "answer": {
      "zh": "不能。它只表示本题组13个选择与答案匹配。没有支持考试换算的对应研究；四组正确数和具体错题更适合用来选本页复习主题。",
      "en": "No. It records thirteen matching answers in this bank. There is no linking study supporting an exam conversion. The four section counts and specific mismatches can help select a review topic here."
    }
  },
  {
    "question": {
      "zh": "四组里最高的一组就是我的英语优势吗？",
      "en": "Does my highest section establish my strongest English skill?"
    },
    "answer": {
      "zh": "只能说本次在该组所列六题中答对较多。四组题型和内容不同，每组只有六题，尚无同尺度难度校准。应结合具体任务与新语境中的表现再理解。",
      "en": "It means more matches on those six selected items in this attempt. Groups differ in content and task type and have no common difficulty calibration. Consider the actual tasks and performance in fresh contexts."
    }
  },
  {
    "question": {
      "zh": "不会的题可以直接跳过吗？",
      "en": "Can I skip an item I cannot answer?"
    },
    "answer": {
      "zh": "本版需要每题作出一个有效选择后再生成结果，没有“不知道”计分选项。可以先选最有依据的一项，并在复习时标记不确定；所选正确不一定代表已经掌握。",
      "en": "This edition requires one valid choice on every item before producing a result and has no scored I-don’t-know option. Choose the best-supported response and note uncertainty when reviewing; a matching choice need not mean mastery."
    }
  },
  {
    "question": {
      "zh": "一次复习应该从哪里开始？",
      "en": "Where should one review session begin?"
    },
    "answer": {
      "zh": "选一个具体问题即可，例如did后是否保留原形、tentative是否仍可调整，或回复是否保留截止。先解释原题，再造一个新例子并核对。这里提供练习方法，不承诺固定学习时长或提高幅度。",
      "en": "Choose one precise question:the verb after did, whether tentative allows revision, or whether a reply preserves its deadline. Explain the original, create a fresh example and check it. This is a practice suggestion, without a promised time or improvement rate."
    }
  }
];
