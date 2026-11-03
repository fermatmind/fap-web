import type { Questionnaire } from "@/lib/questionnaires/types";

export const spanishProficiencyLandingSections: Questionnaire["guide"] = [
  {
    "id": "written-spanish-scope",
    "title": {
      "zh": "西班牙语水平测试练什么？四类书面语言任务",
      "en": "What does this Spanish Proficiency Test practise? Four written task groups"
    },
    "paragraphs": [
      {
        "zh": "本版24道原创单选题分为语法与书写形式、语境中的词义、阅读与文本依据、书面消息与任务四组，每组六题。它分别要求核对词形、选择合适义项、保留短文条件和准确转达任务。四项正确数让你定位具体复习材料，全部题目所选、正确答案、解析和四份完整指南都免费可读。",
        "en": "The twenty-four original single-choice items comprise four groups of six: grammar and written forms, words in context, reading and text evidence, and written messages and tasks. They ask you to check a form, select a contextual sense, preserve a passage’s conditions and convey a task accurately. Four correct counts identify material to review. Every selected answer, key, explanation and all four complete guides are free."
      },
      {
        "zh": "作答是从给定选项中识别答案，而不是当场生成完整西语表达。中英文界面只切换说明和解析，西语句子、短文、选项与答案保持一致。初学者可以逐题了解原因，已有学习经验的读者可以检查容易忽略的条件；题组不提供听力、口语或自由写作成绩，也没有给各组设及格线。",
        "en": "The task is recognising an answer among alternatives rather than generating complete Spanish independently. English and Chinese change the directions and explanations while keeping Spanish sentences, passages, options and keys identical. Beginners can examine individual explanations; experienced learners can check overlooked conditions. The bank provides no listening, speaking or free-writing mark and sets no group pass thresholds."
      }
    ]
  },
  {
    "id": "written-spanish-grammar",
    "title": {
      "zh": "语法复习：主语、名词一致与区别词义的重音符号",
      "en": "Grammar review: subjects, nominal agreement and distinguishing written accents"
    },
    "paragraphs": [
      {
        "zh": "先核题目明确指定的人称、数、时态和语式，再看词尾。preparar的直陈式现在时中，yo对应preparo，nosotros对应preparamos；estar的位置表达也须与主语配合，例如ustedes están。[1][2] 名词短语还要分别核对限定词、名词和形容词。RAE–ASALE区分名词性别与数的一致，以及主语与动词的人称、数一致，不能只凭最后一个字母猜答案。[10]",
        "en": "Check the specified person, number, tense and mood before choosing an ending. In the present indicative of preparar, yo takes preparo and nosotros takes preparamos; a location statement with estar also agrees with its subject, as in ustedes están.[1][2] Check the determiner, noun and adjective separately. RAE–ASALE distinguishes nominal gender-and-number agreement from subject–verb person-and-number agreement; the final letter alone is insufficient.[10]"
      },
      {
        "zh": "另写两组小例子：La carpeta roja与Las carpetas rojas，Tú ordenas tu mesa。第一组在变复数时同时改变冠词、名词和形容词；第二组的tú是人称代词，tu是物主限定词。[3][10][11] 这些例子说明本页选定的结构，并不主张所有形容词都按同一种词尾变化，也不要求所有地区采用同一套称呼方式。练习时可先只改变一个特征，再核对受影响的词。",
        "en": "Try two new examples: La carpeta roja / Las carpetas rojas, and Tú ordenas tu mesa. The plural example changes article, noun and adjective; the other distinguishes the personal pronoun tú from possessive tu.[3][10][11] These illustrate selected constructions, not a claim that all adjectives change alike or all regions use identical forms of address. Change one feature first, then check the affected words."
      }
    ]
  },
  {
    "id": "written-spanish-vocabulary",
    "title": {
      "zh": "语境词义：有效、可选、附带、先后与替换",
      "en": "Contextual meanings: current effect, choice, attachment, sequence and replacement"
    },
    "paragraphs": [
      {
        "zh": "词义要与句中对象和上下文一起读。vigente描述仍在施行或使用，opcional把是否采用留作选择，adjunto表示与另一事物相连或随附。[5][6][7] 另设一段活动通知：报名规则仍有效、附加参观可选、路线图随邮件附上。它同时包含三种不同关系，不能把“可选”读成取消，也不能由“附带”推断收件人已经打开文件。",
        "en": "Read a sense together with its object and context. Vigente concerns continuing effect or use, opcional leaves a choice, and adjunto concerns something joined or accompanying.[5][6][7] Imagine a new event notice: a registration rule remains in force, an extra visit is optional, and a route map accompanies the email. These are three distinct relationships. Optional does not mean cancelled, and attached does not establish that a recipient opened a file."
      },
      {
        "zh": "previo把一件事放在另一件事之前；agotar可以谈供应耗尽，也有使人极度疲倦的不同用法；sustituir表达以另一人或物取代原来的对象。[4][8][9] 例如“先检查再展示”“某种纸张用完”“换上新标签”涉及顺序、数量状态与替换三个问题。复习时写一条新的西语句子，再说明哪个词改变了实际含义；不要只记住四个选项里看起来最熟悉的一个。",
        "en": "Previo places something before another event; agotar can concern depleted supply or, in a different use, extreme fatigue; sustituir expresses replacement by another person or thing.[4][8][9] A prior display check, paper running out and a replacement label concern sequence, supply and substitution. For review, write a fresh Spanish sentence and explain which word changes the practical meaning rather than memorising the most familiar alternative."
      }
    ]
  },
  {
    "id": "written-spanish-reading",
    "title": {
      "zh": "阅读依据：所述事实、合理推论与尚未知的信息",
      "en": "Reading evidence: stated facts, supported conclusions and unresolved information"
    },
    "paragraphs": [
      {
        "zh": "阅读题要求保留文本实际给出的范围。另设短文：La visita empieza a las nueve en el patio. El aviso no indica cuándo termina. 它提供开始时间和地点，却没有结束时间；不能因为平时参观一小时，就补出十点结束。可把每个判断标为文本直接说明、与文本矛盾或仍未知，再定位支持它的词句。这里判断的是这段材料，不是现实场所的开放规则。",
        "en": "Preserve the passage’s actual scope. Consider a new text: La visita empieza a las nueve en el patio. El aviso no indica cuándo termina. It provides a start and location, not an ending. A familiar one-hour visit cannot supply a ten-o’clock finish. Classify a claim as stated, contradicted or unresolved, then locate its support. The task concerns this passage rather than a real venue’s opening policy."
      },
      {
        "zh": "代词指向要结合性别、数和动作对象；步骤顺序要保留每一条先后关系；总结要同时保留主旨和限制。另写一段两人觉得新标签更清楚、却未测寻找时间的记录，恰当总结应保留这两个事实。不能推出所有人找得更快，也不能反过来断言新标签一定没有帮助。明确不知道什么，是精确阅读的一部分。",
        "en": "Resolve a pronoun using gender, number and the action’s object; preserve every dependency in a sequence and both the main point and qualifications in a summary. Imagine two readers finding new labels clearer, with search time unmeasured. A summary should retain both facts. It establishes neither faster searching for everyone nor that the labels cannot help. Naming an unknown is part of precise reading."
      }
    ]
  },
  {
    "id": "written-spanish-messages",
    "title": {
      "zh": "任务消息：语法正确，还要保留对象、条件和状态",
      "en": "Task messages: grammatical wording must also preserve the brief"
    },
    "paragraphs": [
      {
        "zh": "消息题的不同选项都可能读得懂，关键在于是否完成指定任务。另设请求：需要展台平面图第3版，截止周一上午9点。检查消息时分别圈出文件对象、版本、时间和动作；把第3版写成第2版，或把“发送”写成“删除”，都改变了请求，即使句子礼貌且语法通顺。",
        "en": "Several message alternatives may be understandable; the question is whether they fulfil the specified task. Imagine a new request for version 3 of a display plan by Monday at 09:00. Check object, version, time and action separately. Version 2 or deleting rather than sending changes the brief even in a courteous grammatical sentence."
      },
      {
        "zh": "再设一个条件：有确认便按约定发送，没有确认便保留草稿并问下一步。清楚的转述要同时保留两条分支，不能只记“今天发送”。日期不明确时，问具体日期；两个数字不一致时，先保留它们各自的出处再求核对。练习可以私下写一份虚构消息，不需要发送，也不把本题的写法规定成所有西语社群唯一的礼貌标准。",
        "en": "Now add a condition: send after confirmation; otherwise retain the draft and ask what comes next. A faithful summary retains both branches rather than remembering only “send today.” Ask for an exact date when ambiguous, and preserve each source when numbers conflict. Practise with a fictional private draft, without sending it or treating one task response as the universal politeness standard for Spanish-speaking communities."
      }
    ]
  },
  {
    "id": "written-spanish-counts",
    "title": {
      "zh": "怎样阅读四项正确数？同样13/24也可能需要不同复习",
      "en": "How should four correct counts be read? The same 13/24 can suggest different review"
    },
    "paragraphs": [
      {
        "zh": "每题与答案一致记1题，其余记0题；四组六题合计0—24，不加权、不扣分，也不按速度加分。缺答时不生成结果，不把缺答静默记错。3/6只表示这组六个指定任务中有三个答案一致，不是西语能力百分位或掌握了一半语法。总分概括本轮选择，具体复习仍要回到每道题的条件与解析。",
        "en": "Each matching key earns one correct count; other selections earn zero. Four groups of six total zero to twenty-four, without weighting, penalties or speed bonuses. Missing choices withhold results rather than silently counting as errors. A count of 3/6 means three matching answers on those tasks, not a proficiency percentile or mastery of half of Spanish grammar. Review depends on each item’s conditions and explanation."
      },
      {
        "zh": "例如四组分别为2、6、0、5，合计13；另一份6、1、6、0也合计13，却涉及不同错题。前者可先复盘阅读依据，后者可先核对词义与消息条件；这只是按本次错题选择起点，不为学习者划固定弱项。零分、部分答对和全对都显示24题所选、正确答案、解析，以及四份共20节完整指南，不需达标才能解锁。",
        "en": "For example, 2, 6, 0, 5 and 6, 1, 6, 0 both total thirteen but involve different errors. One may begin with reading evidence, the other with contextual meanings and message conditions. These are starting points from this attempt, not fixed learner weaknesses. Zero, partial and perfect counts all show twenty-four selected answers, keys and explanations plus four complete guides totalling twenty sections, without an unlock threshold."
      }
    ]
  },
  {
    "id": "written-spanish-framework",
    "title": {
      "zh": "语言知识核对、CEFR框架与本题本的证据范围",
      "en": "Language references, the CEFR framework and evidence for this bank"
    },
    "paragraphs": [
      {
        "zh": "RAE–ASALE词典、语法和拼写资料帮助核对具体形式与义项，原创短文则给出阅读和消息题需要的事实。它们支持逐题解释，不能自动证明这24题能测量总体语言水平。欧洲委员会将CEFR组织为A1—C2六级，并以能做什么的描述说明不同能力；它还区分总体尺度、自评概览和口语表现等用途。[12]",
        "en": "RAE–ASALE dictionary, grammar and orthography sources support selected forms and senses, while original passages supply facts for reading and message tasks. They support item explanations rather than establishing overall-proficiency measurement by this bank. The Council of Europe organises the CEFR into six A1–C2 levels using can-do descriptors, with distinct global-scale, self-assessment and spoken-performance uses.[12]"
      },
      {
        "zh": "本版没有将正确数与CEFR等级连接的校准研究，也没有DELE、SIELE分数转换、常模或招聘阈值。只选答案没有观察你的听说或独立写作表现；字典来源可信、算法可复算，也不能补出这些证据。若需要正式等级或课程分班，应另核目标机构实际使用的任务和评价方法，不能把这里的13/24直接填写成某个等级。",
        "en": "This bank has no calibration linking its counts to CEFR levels, DELE or SIELE conversions, norms or hiring thresholds. Selecting alternatives does not observe listening, speaking or independent writing. Reliable reference sources and reproducible scoring cannot supply that evidence. For a formal level or course placement, check the target institution’s tasks and assessment method separately rather than converting 13/24 into a level."
      }
    ]
  },
  {
    "id": "written-spanish-practice",
    "title": {
      "zh": "复习、辅助工具与重测：怎样留下有用的学习记录",
      "en": "Review, aids and retakes: keeping a useful practice record"
    },
    "paragraphs": [
      {
        "zh": "先从一条错题中提取一个具体问题：主语配合、词义、指代、先后还是消息中的数字？合上选项，换一个对象自己造句，或从新短文找同类信息，然后查参考资料核对。先前答对也可以是猜中，因此可试着解释理由。这个过程是可选复习建议，不承诺固定提分速度；看过原答案后，同题提高可能来自记忆。",
        "en": "Extract one specific issue from an error: subject agreement, meaning, reference, sequence or a number in a message. Close the alternatives, change the object in a sentence, or locate similar information in a fresh text, then consult a reference. A correct answer can also be a guess, so try explaining it. This is optional review, without a promised improvement rate; gains on previously reviewed items may reflect memory."
      },
      {
        "zh": "需要无辅助练习时，可以完成后再查词典或翻译；使用工具也可学习，但应记录辅助条件。开始按钮直接进入题目，无需额外同意、账号、邮箱或前置测试。答案在浏览器计算，可选草稿24小时后失效，完成、退出清除或重测会删除；公开分享只含测试链接。中英文内容对应并不等于已经验证两种界面的测量等价。",
        "en": "For unaided practice, consult dictionaries or translation afterwards. Assisted study can still be useful if you record the conditions. Start opens questions directly without another agreement, account, email or prior test. Answers are scored in the browser; optional drafts expire after twenty-four hours and clear on completion, exit-and-clear or retake. Public sharing contains only the test link. Corresponding English and Chinese content does not establish measurement equivalence."
      }
    ]
  }
];

export const spanishProficiencyLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "怎样区分词尾错误与主语配合错误？",
      "en": "How can an ending error be distinguished from subject agreement?"
    },
    "answer": {
      "zh": "先找到题目指定的主语、人称、数、时态和语式，再核动词表；不要只凭词尾是否熟悉。名词短语则另核冠词与形容词的性别、数一致。两类关系可分别练习。[1][2][10]",
      "en": "Identify the specified subject, person, number, tense and mood before checking a verb table. For noun phrases, separately check article and adjective gender-and-number agreement. These relationships can be practised separately.[1][2][10]"
    }
  },
  {
    "question": {
      "zh": "tú和tu为什么不能随意互换？",
      "en": "Why are tú and tu not interchangeable?"
    },
    "answer": {
      "zh": "本页所用的tú是人称代词，tu是物主限定词，重音符号区分语法身份。可用Tú ordenas tu mesa核对两个位置；不是把重音符号当作可有可无的装饰。[11]",
      "en": "In these constructions, tú is a personal pronoun and tu a possessive determiner. The written accent distinguishes their grammatical roles, as in Tú ordenas tu mesa, rather than serving as optional decoration.[11]"
    }
  },
  {
    "question": {
      "zh": "认出一个词的一个义项，是否表示完全掌握它？",
      "en": "Does recognising one sense mean knowing a whole word?"
    },
    "answer": {
      "zh": "不表示。题中上下文选择了相关义项；例如agotar可以描述供应耗尽，也可描述极度疲倦。一次正确选择不测所有义项、搭配、听辨或主动运用。[9]",
      "en": "No. Context selects the relevant sense: agotar can concern depleted supply or extreme fatigue. One correct selection does not assess every sense, collocation, listening use or productive command.[9]"
    }
  },
  {
    "question": {
      "zh": "阅读时信息没给全，应该猜最常见的情况吗？",
      "en": "Should I guess the usual situation when a passage omits information?"
    },
    "answer": {
      "zh": "应保留未知。开始时间不能单独推出时长，少数人的清楚度反馈不能推出所有人更快。先定位文本支持、矛盾或未说明的部分，再决定哪个选项忠实于材料。",
      "en": "Keep the unknown. A start does not determine duration, and a few clarity opinions do not establish faster performance for everyone. Locate what is supported, contradicted or unstated before choosing a faithful alternative."
    }
  },
  {
    "question": {
      "zh": "消息语法都正确时，怎样选出符合任务的一项？",
      "en": "How do I choose when several messages are grammatical?"
    },
    "answer": {
      "zh": "逐项核对对象、版本、数字、时间、状态和条件。一个礼貌句子仍可能改错版本或删除等待条件；本题选择的是符合给定任务的表达，而不是最正式或最长的句子。",
      "en": "Check object, version, numbers, time, status and conditions. A polite sentence can change a version or omit a waiting condition. The task selects fidelity to the brief rather than the most formal or longest sentence."
    }
  },
  {
    "question": {
      "zh": "同样13/24，复习方向会一样吗？",
      "en": "Does the same 13/24 imply the same review needs?"
    },
    "answer": {
      "zh": "不一定。2、6、0、5与6、1、6、0都合计13，错题却不同。应看各组六题及每题解析，选择一项新材料练习；不把总分当成固定语言类型或等级。",
      "en": "Not necessarily. Both 2, 6, 0, 5 and 6, 1, 6, 0 total thirteen but involve different errors. Inspect the six-item groups and explanations before choosing fresh practice, without assigning a language type or level."
    }
  },
  {
    "question": {
      "zh": "看过解析后重测提高，能证明西语水平提高吗？",
      "en": "Does a higher retake count prove improved Spanish proficiency?"
    },
    "answer": {
      "zh": "不能仅凭这点判断。重测仍用相同24题，记忆、辅助工具和对题意的熟悉都可影响正确数。可换新句子、短文或自行写消息检查迁移；本题本没有等值平行版本。",
      "en": "Not by itself. Retakes use the same twenty-four items, so memory, aids and familiarity may affect counts. Try a new sentence, passage or independently written message to examine transfer; this bank has no equated parallel form."
    }
  },
  {
    "question": {
      "zh": "参考CEFR是否就可以给A1—C2等级？",
      "en": "Does citing the CEFR justify an A1–C2 result?"
    },
    "answer": {
      "zh": "不能。CEFR说明能力描述和等级框架；把某份题本的正确数连接到等级还需要对应证据。本版只提供书面练习正确数与完整复习内容，不据框架名称制造等级。[12]",
      "en": "No. The CEFR describes abilities and a level framework; connecting a bank’s correct counts to levels requires evidence for that link. This edition provides written-practice counts and full review material, without manufacturing levels from the framework’s name.[12]"
    }
  }
];
