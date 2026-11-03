import type { Questionnaire } from "@/lib/questionnaires/types";

export const germanLandingSections: Questionnaire["guide"] = [
  {
    "id": "german-written-scope",
    "title": {
      "zh": "德语水平测试练什么？28道书面语法与短文题",
      "en": "What does this German Test practise? Twenty-eight written grammar and reading tasks"
    },
    "paragraphs": [
      {
        "zh": "本页有冠词与格、动词形式、句子结构、短文阅读四组，各七道原创单选。题目按标准书面德语及明确语境设定一个答案；阅读题使用七段虚构通知或消息。英中文界面共享德语材料，切换的是操作说明、解析与指南，不把德文选项译成提示答案。",
        "en": "This page has seven original multiple-choice items each on Articles and Cases, Verb Forms, Sentence Structure, and Short German Texts. One answer follows from the stated standard written German construction or context. Reading items use seven fictional notices or messages. Both interfaces share the German material; English and Chinese provide instructions, explanations and guides without translating the options into answer hints."
      },
      {
        "zh": "适合用来回看“为什么是这个形式、这条信息支持哪个结论”。题目已给的性、数、称呼或语域也是解题依据。例如尊称Sie与非正式du要求不同形式，正式书面从句也不能忽略语域。这里没有音频、录音、即时会话或独立作文，因此这些表现需要其他实际任务才能观察。",
        "en": "Use it to examine why a form fits or which statement a text supports. Supplied gender, number, address and register are evidence too: formal Sie and informal du require different forms, and a formal written clause must retain its register. There is no audio, recording, live conversation or independent composition; those performances require other actual tasks."
      }
    ]
  },
  {
    "id": "german-case-triggers",
    "title": {
      "zh": "冠词与格：把性、数、句中功能与介词一起核对",
      "en": "Articles and cases: check gender, number, grammatical function and preposition"
    },
    "paragraphs": [
      {
        "zh": "IDS grammis说明定冠词随性、数、格变化。[1] 新例Der Gast wartet与Ich begrüße den Gast中，Gast同为阳性单数，但主语与直接宾语要求的形式不同。Der不是所有地方都等于“阳性主语”：同形也可出现在其他性、数、格组合。先明确本题名词短语的功能，再选冠词，不凭某个形式眼熟作答。",
        "en": "IDS grammis describes definite-article inflection by gender, number and case.[1] In fresh examples Der Gast wartet and Ich begrüße den Gast, the noun remains masculine singular while subject and direct-object functions require different forms. A written form has no single permanent case meaning outside its phrase. Identify the phrase’s function before choosing an article rather than relying on familiarity."
      },
      {
        "zh": "介词也提供格位线索：本页涉及mit加第三格、für加第四格。[4][5] 对照mit dem Gast与für den Gast，两者都指人，格仍不同。空间in的地点和目标用法要分别看；in der Halle说明所在，in die Halle可说明进入目标。不能把“人用第三格”或“有动作就第四格”当通用规则，动词支配的固定介词还需核具体结构。[6]",
        "en": "Prepositions supply case information: the uses here include mit with dative and für with accusative.[4][5] Compare mit dem Gast with für den Gast: both concern a person but take different cases. Spatial in can describe location, in der Halle, or a destination, in die Halle. Neither “people take dative” nor “movement takes accusative” is a general rule; verb-selected prepositions need construction-specific checking.[6]"
      }
    ]
  },
  {
    "id": "german-finite-forms",
    "title": {
      "zh": "动词形式：主谓一致、尊称与完成时分开判断",
      "en": "Verb forms: distinguish agreement, formal address and perfect constructions"
    },
    "paragraphs": [
      {
        "zh": "先找限定动词及其主语。规则例ich suche、du suchst、wir suchen以不同词尾配人称和数；强变化不能仅照搬规则词尾，lesen的du、er形式为liest。[2][9] 尊称Sie即使称一人，也用相应复数动词形式，不能把人数直接当语法一致条件。[8] 时间短语说明何时发生，不替代主语。",
        "en": "First identify the finite verb and its subject. Regular examples ich suche, du suchst and wir suchen match person and number with different endings; strong forms need more than an ending shortcut, as lesen gives du liest and er liest.[2][9] Formal Sie uses the corresponding plural verb agreement even for one addressee.[8] A time phrase supplies timing rather than replacing the subject."
      },
      {
        "zh": "完成时再核助动词与分词：Wir haben den Zettel gelesen中haben为限定形式，gelesen为分词。旅行义Wir sind nach Erfurt gefahren用sein；驾驶车辆的及物结构Sie hat den Bus gefahren可用haben。[10] 这些是不同构式，不能背成fahren永远配一个助动词。复习时把主语、限定形式、非限定成分及语境各标出来。",
        "en": "For the perfect, inspect the auxiliary and participle: in Wir haben den Zettel gelesen, haben is finite and gelesen is the participle. A journey, Wir sind nach Erfurt gefahren, takes sein; transitive driving, Sie hat den Bus gefahren, can take haben.[10] These constructions differ, so fahren does not always take one auxiliary. Label the subject, finite form, non-finite part and context when revising."
      }
    ]
  },
  {
    "id": "german-clause-frames",
    "title": {
      "zh": "句子结构：第二成分位置、句框与书面语域",
      "en": "Sentence structure: second constituent position, verbal frames and register"
    },
    "paragraphs": [
      {
        "zh": "动词第二位看成分，不只是数单词。新例Am frühen Nachmittag lesen wir中，Am frühen Nachmittag虽有三个词，却可占一个前场位置，限定动词lesen随后；一般疑问则可为Lesen wir heute?。[3] 可分动词还要保留对应部分，如Ich stehe früh auf，不能只看stehe就忽略auf。[11]",
        "en": "Verb-second concerns constituents rather than simply counting words. In a fresh example Am frühen Nachmittag lesen wir, the three-word phrase occupies one front-field position before finite lesen; a yes/no question can instead be Lesen wir heute?.[3] Keep the corresponding parts of separable verbs, as in Ich stehe früh auf, rather than noticing stehe and losing auf.[11]"
      },
      {
        "zh": "本题指定的简单正式weil、dass从句，以限定动词收尾，如weil sie Zeit hat、dass wir heute lesen。IDS也记录口语中weil后动词第二位的用法；这说明应保留题设语域，不能把某种口语形式概括为“德语绝不存在”。[7] 本页练有限句型，不把它推广为所有复杂动词组合都遵循一个无例外口诀。",
        "en": "The simple formal weil- and dass-clauses requested here close with the finite verb, as in weil sie Zeit hat and dass wir heute lesen. IDS also documents spoken weil with verb-second order, so retain the specified register rather than declaring that a spoken form never exists.[7] These limited patterns are not an exceptionless rule for every complex verb combination."
      }
    ]
  },
  {
    "id": "german-reading-evidence",
    "title": {
      "zh": "短文阅读：把事件、时间、否定与条件对应起来",
      "en": "Short-text reading: link events, times, negation and conditions"
    },
    "paragraphs": [
      {
        "zh": "不要把所有数字当同一种信息。新虚构通知：Einlass ab 16 Uhr. Der Vortrag beginnt um 16:40 Uhr. 入场与讲座开始相隔40分钟，但问开始应答16:40。若更新说Der Termin bleibt am Montag, aber jetzt in Raum 7，则星期保留、房间改变；房号不是开始时刻。应找支持答案的那句，而非凭现实日程猜。",
        "en": "Do not treat every number as the same information. Fresh fictional notice: Einlass ab 16 Uhr. Der Vortrag beginnt um 16:40 Uhr. Entry and the talk start differ by forty minutes; a question about the start needs 16:40. An update saying Der Termin bleibt am Montag, aber jetzt in Raum 7 keeps the day and changes the room. A room number is not a starting time. Locate the supporting sentence rather than guessing from real schedules."
      },
      {
        "zh": "否定词kein与限定词nur会改变范围。Nur für Mitarbeitende限制的是告示指出的入口或房间，不自动表示整栋建筑禁止访客。条件计划也要保留分支：Wenn die Bahn ausfällt, nehmen wir den Bus. Sonst fahren wir mit der Bahn. 公交属于列车取消的分支，不是每天的固定安排。例子皆为虚构，不查实时交通。",
        "en": "Negating kein and limiting nur change scope. Nur für Mitarbeitende restricts the named entrance or room without automatically barring visitors from an entire building. Preserve conditional branches too: Wenn die Bahn ausfällt, nehmen wir den Bus. Sonst fahren wir mit der Bahn. The bus belongs to the cancellation branch, not every day’s plan. These fictional examples check no live transport information."
      }
    ]
  },
  {
    "id": "german-count-cefr",
    "title": {
      "zh": "正确数怎样产生？为何不直接换算A1至C2？",
      "en": "How are counts produced, and why not convert them directly to A1–C2?"
    },
    "paragraphs": [
      {
        "zh": "每题匹配答案记1，其他有效选择记0。四项各0至7，总计0至28，无负分、部分分或速度权重；完成28个有效选择后显示。新例4、6、3、5共18／28；另一组5、5、4、4也为18，但复习重点不同。四组题数一致不代表难度相同，更不产生“最强语言技能”排名。",
        "en": "A keyed answer earns one and another valid choice zero. Four sections each range from zero to seven, totalling zero to twenty-eight, without penalties, partial credit or speed weighting, after all twenty-eight valid choices. Fresh example: 4, 6, 3 and 5 total 18/28, as do 5, 5, 4 and 4, despite different revision needs. Equal section lengths establish neither equal difficulty nor a strongest-language-skill ranking."
      },
      {
        "zh": "Council of Europe提供将考试与CEFR建立联系的程序指导，并说明其自身不为具体考试的关联质量做验证。[12] 因此等级标签需要对应考试自己的支持材料，不能只把某个答对比例命名为B1。本题本没有经验校准、常模或语言等值研究，也未测完整听说读写，故只给本次正确数和复习内容。",
        "en": "The Council of Europe provides procedures for relating examinations to the CEFR and explains that it does not itself validate the quality of a particular examination’s link.[12] A level claim therefore needs support for that examination, not merely a percentage renamed B1. This bank has no empirical calibration, norms or language-equivalence study and samples no complete listening-speaking-reading-writing assessment. It reports counts and revision material only."
      }
    ]
  },
  {
    "id": "german-revision-method",
    "title": {
      "zh": "四份完整指南怎样使用？从辨认形式到解释新例",
      "en": "How should you use the four full guides? From recognition to explaining a new example"
    },
    "paragraphs": [
      {
        "zh": "零分、部分答对与全对，均提供28题的题干、所选、正确答案与解析，后接四份各七节的完整指南。可先把错误分为：未读题设、性数格触发、动词形式、句框位置、原文信息配错。分类只是复习记录，不是新增分数或诊断。每次挑一个错误，写出支持答案的明确条件。",
        "en": "Zero, partial and perfect attempts all receive twenty-eight prompts, selected answers, keys and explanations, followed by four complete seven-section guides. For revision, distinguish missed instructions, gender-number-case triggers, verb forms, clause positions and misassigned textual details. This is an error note, not an additional score or diagnosis. Choose one mistake and write down the condition supporting its answer."
      },
      {
        "zh": "再只改一个条件核对后果：把ich改成wir，或将地点Wo?改成目标Wohin?；阅读时改入场时间但保留开始时间。这样能检查自己解释的是结构还是记住选项。新句先查具体词形与语境，不凭熟悉感造出不存在的规则。写出新例可提供额外观察，但一次练习仍不足以证明稳定学习效果。",
        "en": "Then change one condition: replace ich with wir, change location Wo? to destination Wohin?, or alter entry time while preserving the start time. Check whether your explanation tracks the structure rather than a remembered option. Verify a new form and its context instead of inventing a rule from familiarity. A fresh example offers another observation, but one exercise alone establishes no stable learning effect."
      }
    ]
  },
  {
    "id": "german-entry-locale",
    "title": {
      "zh": "作答、界面语言与保存：同一德文题本，双语解读",
      "en": "Answering, interface language and saving: one German bank, bilingual explanations"
    },
    "paragraphs": [
      {
        "zh": "开始按钮直接进入28题，无需账户、邮箱、付款或先同意保存。约14分钟只是用时估计，无倒计时；允许查资料，结果就应按查资料的练习条件解释。公开指南也可先读。若需正式分班或证书，应核相应机构的实际要求，本页不冒充其他机构考试。",
        "en": "Start opens the twenty-eight items directly without an account, email, payment or agreement to save. Roughly fourteen minutes is an estimate, not a countdown. References are permitted, and results should be interpreted under those practice conditions. Public guides are readable beforehand. For placement or certification, check the institution’s actual requirements; this page represents no other institution’s examination."
      },
      {
        "zh": "切换英中文说明不会改变德文题目和选项；解析中的德语例句也保留原样。答案在浏览器计分，仅主动保存才留下本标签页24小时内进度，完成、清除或重测会删除；分享只复制公开链接。重测仍是同一套题，读过解析后提高可能包含记忆，不能单凭分数变化宣称德语等级提升。",
        "en": "Switching the explanatory interface leaves the German questions and options unchanged, with German examples retained in the explanations too. Answers are scored in the browser. Only optional saving retains progress in this tab for up to twenty-four hours; completion, clearing or retaking removes it. Sharing copies a public link. Retakes repeat the same bank, so improved recall after explanations does not alone establish a higher proficiency level."
      }
    ]
  }
];

export const germanLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "为什么有时der、有时den、dem？",
      "en": "Why do der, den and dem differ across sentences?"
    },
    "answer": {
      "zh": "先核名词性、数及所需格，而非给每个字串固定中文意思。主语、宾语及介词支配可改变格位；同一冠词形式也可能对应多个组合。[1]",
      "en": "Check gender, number and required case rather than assigning each string one permanent meaning. Subject, object and preposition government can change case, and one written form may serve several combinations.[1]"
    }
  },
  {
    "question": {
      "zh": "表示动作就一定用第四格吗？",
      "en": "Does movement always require accusative?"
    },
    "answer": {
      "zh": "不。空间介词的地点与目标须按具体结构区分；在大厅里走动仍可表示位于大厅，进入大厅则可表示目标。动词固定支配介词也不能套通用动作口诀。[6]",
      "en": "No. Distinguish location and destination in the relevant spatial construction. Moving around inside a hall can still describe location; entering it describes a destination. Verb-selected prepositions also need their own construction information.[6]"
    }
  },
  {
    "question": {
      "zh": "为什么动词第二位不一定是第二个单词？",
      "en": "Why is verb-second not always the second written word?"
    },
    "answer": {
      "zh": "第二位指成分位置。一个由多个词组成的时间短语可以占前场，限定动词随后；不能单凭书写单词数量判错。[3]",
      "en": "It refers to constituent position. A multiword time phrase can occupy the front field before the finite verb. Word count alone cannot decide the construction.[3]"
    }
  },
  {
    "question": {
      "zh": "看到口语weil加动词第二位，就代表答案不唯一吗？",
      "en": "Does spoken weil with verb-second make the quiz ambiguous?"
    },
    "answer": {
      "zh": "题目明确要求正式书面结构，就按该条件选择。口语变体确实存在，[7] 但不因此抹去已给语域；也不应把本题规则推成所有口语都不得如此。",
      "en": "The item explicitly requests a formal written construction. Spoken alternatives exist,[7] but do not remove that stated register or justify condemning every spoken use by the quiz’s narrower rule."
    }
  },
  {
    "question": {
      "zh": "fahren的完成时永远用sein吗？",
      "en": "Does the perfect of fahren always use sein?"
    },
    "answer": {
      "zh": "不是。题目旅行义用sein，而及物驾驶车辆等结构可用haben。应连同具体义项与结构查证，不只背一个助动词。[10]",
      "en": "No. The journey sense in the item uses sein, while constructions such as transitive vehicle driving can use haben. Check the meaning and construction rather than memorizing one auxiliary.[10]"
    }
  },
  {
    "question": {
      "zh": "两个人都答对18题，可以说德语能力相同吗？",
      "en": "Do two counts of eighteen establish equal German ability?"
    },
    "answer": {
      "zh": "不能。同总数可能有不同错误分布，也不包含未测听说及独立写作。此题本未建立等级校准，不能据总数认定语言能力等同。",
      "en": "No. Equal totals can conceal different errors and omit listening, speaking and independent writing. This bank has no proficiency-level calibration, so matching totals do not establish equal language ability."
    }
  },
  {
    "question": {
      "zh": "是否需要先做MBTI，或上传作文、录音？",
      "en": "Do I need MBTI first, or a writing or audio upload?"
    },
    "answer": {
      "zh": "不需要。直接开始，按题设完成28道单选即可。题目不索取作文、录音、证书或个人文件；四份完整指南和全部解析免费。",
      "en": "No. Start directly and complete twenty-eight choices under their stated conditions. No composition, recording, certificate or personal file is requested. Every explanation and all four full guides are free."
    }
  }
];

export const germanLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "zh": "Council of Europe：考试与CEFR关联的程序和责任",
      "en": "Council of Europe: procedures and responsibility for linking examinations to the CEFR"
    },
    "url": "https://www.coe.int/en/web/common-european-framework-reference-languages/relating-examinations-to-the-cefr"
  }
];
