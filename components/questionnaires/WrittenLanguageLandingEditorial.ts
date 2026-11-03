import type { Questionnaire } from "@/lib/questionnaires/types";
export const writtenLanguageSections: Questionnaire["guide"] = [
  {
    "id": "purpose",
    "title": {
      "en": "Reading and writing in everyday situations: what this reflection records",
      "zh": "日常阅读与书写：本回顾记录什么"
    },
    "paragraphs": [
      {
        "en": "These 20 original observations invite adults to recall the past four weeks in the languages and settings they actually used. Four groups of five descriptions concern following written text, putting words on a page, unfamiliar words and written sequences, and ways of accessing text. The groups organise recollection; they are overlapping editorial topics rather than established independent psychological dimensions.",
        "zh": "20条原创观察邀请成年人回顾过去四周，在实际所用语言和场景中的经历。四组各五条，分别涉及跟随书面内容、将想法写成文字、陌生词语与书面顺序，以及接触文字的方式。这些分组用于整理回忆，是可能重叠的编辑主题，而非已确立的独立心理维度。"
      },
      {
        "en": "The result retains the category chosen for each description and six category counts within each topic. It does not mark a reading passage or writing sample, compare you with a reference group, assign a dyslexia type or select a highest topic. All four complete readings remain public before any answers and are identical for every reader.",
        "zh": "记录保留每条描述所选类别，以及各主题内部六类计数。不批阅阅读材料或写作样本、不与参照人群比较、不分配阅读障碍类型，也不选出最高主题。四篇完整读法在作答前就公开，所有读者看到相同内容。"
      }
    ]
  },
  {
    "id": "reading-writing",
    "title": {
      "en": "Following a text and preparing your own words are different activities",
      "zh": "跟随文字与写出想法是不同活动"
    },
    "paragraphs": [
      {
        "en": "The reading topic concerns finding your place, rereading, working out a notice, connecting parts of a paragraph and needing a break. Remembering one of these experiences does not establish slow decoding, poor comprehension or a visual-processing problem. The page cannot see whether a sentence was ambiguous, the layout difficult or the information unfamiliar; those remain open context questions.",
        "zh": "阅读主题涉及寻找读到的位置、重读、理解通知、联系段落前后与需要休息。记得这类经历，不足以确立解码缓慢、理解薄弱或视觉加工问题。页面看不到句子是否有歧义、排版是否难用或信息是否陌生；这些仍是需要了解的背景问题。"
      },
      {
        "en": "The writing topic concerns uncertainty over a written form, revising an unintended word or character, an idea being easier to say than write, sentence rearrangement and checking a term. Revising can be part of ordinary composition. The form collects no handwriting, spelling accuracy, grammar mark or comparison of spoken and written performance, and cannot identify dysgraphia or explain a remembered difficulty.",
        "zh": "书写主题涉及不确定写法、修改非本意的词或字、想法说起来比写下来顺手、调整句子与核对术语。修改可以是普通成文过程的一部分。本页不收集笔迹、拼写准确率、语法成绩，也不比较说与写的实际表现，不能识别书写障碍或解释记得的困难。"
      }
    ]
  },
  {
    "id": "words-context",
    "title": {
      "en": "Unfamiliar terms and instructions do not isolate a cognitive process",
      "zh": "陌生术语与指示不能单独测出某种认知过程"
    },
    "paragraphs": [
      {
        "en": "Knowing what a spoken term means, recognising its written form and knowing how to pronounce it are distinguishable questions. These observations do not test any of them. An unfamiliar name, a technical abbreviation and a word in a less familiar language can interrupt reading for different reasons; choosing a frequency label does not identify which reason applies.",
        "zh": "知道口头术语的意思、认出书面形式和知道怎样读，是可以区分的问题，但本观察不测试其中任何一项。陌生名称、专业缩写与不太熟悉语言中的词，可能因不同原因打断阅读；选择频率标签不能认定具体原因。"
      },
      {
        "en": "Looking back at a short sequence or being unsure of the next instruction does not isolate working-memory capacity. Instructions, time available, interruptions and access to a reference can differ. A recalled copying-order change is not an administered sequencing task. These descriptions cannot be added to another executive-function form or converted into a memory score.",
        "zh": "回看简短顺序或不确定下一项指示，不能单独测出工作记忆容量。指示本身、可用时间、打断和能否查阅参照都可能不同。回忆抄写顺序改变，不等于接受一次顺序任务测验。这些描述不能加入另一份执行功能题本，也不能换算成记忆分数。"
      }
    ]
  },
  {
    "id": "access",
    "title": {
      "en": "Audio, dictation and writing aids are access choices",
      "zh": "音频、语音输入与书写辅助是接触信息的选择"
    },
    "paragraphs": [
      {
        "en": "The access topic records audio or spoken explanations, speech input or help recording ideas, writing suggestions, smaller sections and changes to format or timing. Using any of these does not demonstrate failure, dependence or compensation for a hidden condition. Not using them cannot establish that they were available, unnecessary or deliberately declined.",
        "zh": "接触信息主题记录音频或口头说明、语音输入或请人协助记录、书写提示、拆分信息，以及调整形式或时间。使用这些方式不证明失败、依赖或对隐藏状况的补偿；没有使用，也不能证明它们可获得、无必要或是主动拒绝。"
      },
      {
        "en": "Keep useful aids while recalling an activity. There is no requirement to turn off suggestions, read aloud, copy unfamiliar text, buy software or demonstrate unaided performance. If useful, ask whether a particular document can be clearer or available in another form. This is an optional practical question, not a prescribed intervention or a promise that one format will always work best.",
        "zh": "回忆活动时可以保留有用辅助，不要求关闭提示、朗读、抄写陌生文字、购买软件或展示无辅助表现。若有用，可以询问某份文档能否更清楚，或是否提供另一形式。这是可选的实际问题，不是规定干预，也不保证某种形式永远最适合。"
      }
    ]
  },
  {
    "id": "counts",
    "title": {
      "en": "Five descriptions, six labels and no literacy score",
      "zh": "五条描述、六个标签，不生成读写分数"
    },
    "paragraphs": [
      {
        "en": "The labels are did not notice, rarely, sometimes, often, very often and unscored. If five descriptions receive did not notice, sometimes, sometimes, often and unscored, the six counts are 1, 0, 2, 1, 0 and 1. They add to five descriptions, not five mistakes, tasks or minutes. Category IDs are not points to add or average.",
        "zh": "标签为没有注意到、很少、有时、较常、经常和未计分。如果五条描述依次选择没有注意到、有时、有时、较常、未计分，六类计数就是1、0、2、1、0、1，合计五条描述，不是五个错误、五项任务或五分钟。类别标识不是可相加或平均的点数。"
      },
      {
        "en": "No relevant experience, unclear recall and a withheld answer stay unscored rather than becoming did not notice. An entirely unscored topic provides no personal finding; all 20 may be unscored and every full guide remains available. No total, mean, highest topic, severity band, percentage, diagnostic probability or comparison with other readers is calculated.",
        "zh": "没有相关经历、回想不清和保留回答都保留为未计分，不变成没有注意到。整个主题未计分时，不提供个人发现；20条全部未计分也仍可读全部指南。不计算总分、均值、最高主题、严重程度分档、百分比、诊断概率或与其他读者的比较。"
      }
    ]
  },
  {
    "id": "language",
    "title": {
      "en": "Writing systems, opportunity and change over time",
      "zh": "文字系统、接触机会与不同时期的变化"
    },
    "paragraphs": [
      {
        "en": "Recall the language, material and tools used in the actual situation, without uploading a document or identifying another person. An English spelling pattern and a Chinese character are not interchangeable tasks. These bilingual descriptions have no established measurement equivalence or cross-language norms; an identical label in two languages is not evidence of equal proficiency or difficulty.",
        "zh": "可回想实际场景里所用语言、材料与工具，不必上传文档或透露他人身份。英文拼写模式与汉字不是可互换任务。本双语描述尚未建立测量等值或跨语言常模；两种语言里标签相同，不证明熟练度或困难程度相同。"
      },
      {
        "en": "Four weeks is a recall window, not a required period of difficulty or a delay before asking for support. A later record can differ because of material, opportunity, tools, recall or interpretation. Without standardised tasks and validated change criteria, differences cannot quantify improvement, deterioration, treatment response or changes in reading, writing or memory ability.",
        "zh": "四周是回忆窗口，不是困难必须持续的时间，也不是咨询支持前的等待期。以后的记录可能因材料、接触机会、工具、回忆或理解而变化。没有标准化任务和经过验证的变化标准，差异不能量化改善、恶化、治疗反应，或阅读、书写、记忆能力的变化。"
      }
    ]
  },
  {
    "id": "assessment",
    "title": {
      "en": "Daily reflection and a dyslexia assessment answer different questions",
      "zh": "日常回顾与阅读障碍评估回答不同问题"
    },
    "paragraphs": [
      {
        "en": "NHS adult information and the British Dyslexia Association describe concerns about reading and writing as matters that can be explored through an appropriately qualified assessment. A checklist cannot itself confirm a diagnosis. Their background information does not make this original 20-description record a screener or provide its items, scoring key, validation or endorsement. Assessment routes depend on the relevant setting. [1][2]",
        "zh": "NHS成年人资料和英国阅读障碍协会介绍，阅读与书写方面的担忧可以通过合适专业人员的评估进一步了解，清单本身不能确认诊断。这些背景信息不使本原创20条记录成为筛查工具，也没有提供本页题目、计分键、验证或背书。评估途径取决于相关场景。[1][2]"
      },
      {
        "en": "The present bank has no established diagnostic validity, norms or English–Chinese measurement equivalence. It cannot confirm or exclude dyslexia, identify a cause, infer intelligence or effort, or decide access to study, work, adjustments or funding. Reading aloud, spelling, cognitive tasks and a developmental history are not collected here; no claim of completing such an assessment is made.",
        "zh": "本题组尚未建立诊断有效性、常模或中英文测量等值。它不能确认或排除阅读障碍、找出原因、推断智力或努力，也不能决定学习、就业、调整或资助资格。本页不收集朗读、拼写、认知任务表现和发展史，不声称已完成此类评估。"
      }
    ]
  },
  {
    "id": "practical-use",
    "title": {
      "en": "A practical question can be useful without a score",
      "zh": "不需要分数，也能提出有用的实际问题"
    },
    "paragraphs": [
      {
        "en": "You may describe one concern in ordinary language: for example, needing to look back at the steps in a work instruction and wanting them to remain visible. That account leaves the cause open and avoids claiming a general inability. A qualified support or assessment professional can explain what information would be relevant; you do not need to reach a count, finish the form or produce childhood proof before asking.",
        "zh": "可以用日常语言描述一个担忧，例如处理工作指示时需要回看步骤，希望它们保持可见。这种表述保留原因，也不宣称普遍做不到。合适的支持或评估专业人员可以说明哪些资料有用；提问前不必达到计数、完成表单或先提供童年证明。"
      },
      {
        "en": "Selections remain only in the current page’s memory and are cleared by exit, retake, reload or leaving. Copying shares the public title and entry, without answers or counts. You can read, withhold or stop freely. The record does not alter existing care, require employer disclosure or determine the urgency of a new or changing health concern; keep appropriate support independent of the page.",
        "zh": "选择仅保留在当前页面内存，退出、重做、刷新或离页会清除。复制只分享公开标题与入口，不包含回答或计数。可以自由阅读、保留回答或停止。记录不改变已有照护、不要求向雇主披露，也不决定新出现或变化健康担忧的紧急程度；合适的支持应独立于页面。"
      }
    ]
  }
];
export const writtenLanguageFaq: Questionnaire["faq"] = [
  {
    "question": {
      "en": "Does rereading a paragraph establish dyslexia?",
      "zh": "重读段落能确立阅读障碍吗？"
    },
    "answer": {
      "en": "No. This record recalls an experience without observing the passage, decoding, comprehension or context. A label cannot identify the cause or confirm or exclude dyslexia. A concern can still be worth discussing independently of the record.",
      "zh": "不能。本记录回忆经历，不观察原文、解码、理解过程或背景。标签不能找原因，也不能确认或排除阅读障碍。即使不使用记录，担忧仍可以值得讨论。"
    }
  },
  {
    "question": {
      "en": "Does revising a sentence mean my writing is impaired?",
      "zh": "修改句子代表书写受损吗？"
    },
    "answer": {
      "en": "No. Revision can occur during ordinary writing. The page collects no sample, writing mark or examiner observation and cannot distinguish editing, unfamiliar vocabulary or other explanations for that particular experience.",
      "zh": "不代表。普通写作也会修改。页面不收集样本、文字成绩或评估者观察，不能区分某次经历中的编辑、陌生词语或其他解释。"
    }
  },
  {
    "question": {
      "en": "How do five labels turn into the six counts?",
      "zh": "五条选择怎样变成六类计数？"
    },
    "answer": {
      "en": "For did not notice, sometimes, sometimes, often and unscored, the counts in label order are 1, 0, 2, 1, 0, 1. Each number counts descriptions assigned that label. It does not count errors, pages or minutes, and there is no arithmetic literacy score.",
      "zh": "选择没有注意到、有时、有时、较常、未计分时，按标签顺序计数为1、0、2、1、0、1。每个数字统计选该标签的描述条数，不统计错误、页数或分钟，也不生成算术意义的读写分数。"
    }
  },
  {
    "question": {
      "en": "Is an unscored answer the same as no difficulty?",
      "zh": "未计分等于没有困难吗？"
    },
    "answer": {
      "en": "No. It can mean no relevant experience, unclear recall or withholding. It stays separate from did not notice. All five descriptions in a topic, or the entire form, may remain unscored without closing any of the complete public guides.",
      "zh": "不等于。它可以表示没有相关经历、回想不清或保留回答，与没有注意到分开。一个主题五条或整份记录都可未计分，完整公开指南仍可阅读。"
    }
  },
  {
    "question": {
      "en": "Do audio and speech input identify a learning style?",
      "zh": "音频与语音输入能识别学习风格吗？"
    },
    "answer": {
      "en": "No. They record ways of accessing information, not a preferred teaching prescription, hidden disability or degree of independence. Their use can depend on availability and the task. Keep useful aids; no unaided comparison is required.",
      "zh": "不能。它们记录接触信息的方式，不是规定教学方法、隐藏障碍或独立程度。使用可能取决于可用条件和任务。可以保留有用辅助，不要求作无辅助对照。"
    }
  },
  {
    "question": {
      "en": "Can I compare the four topics or combine them with a memory test?",
      "zh": "能比较四个主题，或与记忆测试合并吗？"
    },
    "answer": {
      "en": "No. Topics are overlapping editorial groups of different descriptions. Counts do not rank difficulty and cannot be added to an executive-function form or converted into a working-memory, phonological or language-proficiency score.",
      "zh": "不能。主题是由不同描述组成、可能重叠的编辑分组。计数不排列困难程度，也不能加入执行功能题本，或换算成工作记忆、语音加工或语言熟练度分数。"
    }
  },
  {
    "question": {
      "en": "What can I mention if I ask about support?",
      "zh": "咨询支持时可以提及什么？"
    },
    "answer": {
      "en": "If you wish, describe a particular activity, the language used, what was hard to follow and a practical information need. You choose what to share. No private writing, employer identity, high count or completed questionnaire is required before asking about available support or assessment.",
      "zh": "愿意时，可描述具体活动、所用语言、哪里难以跟上，以及实际信息需求。分享什么由自己决定。询问可用支持或评估前，不要求私人文字、雇主身份、高计数或完成问卷。"
    }
  },
  {
    "question": {
      "en": "Does a changed record show that my reading ability improved?",
      "zh": "记录变化能说明阅读能力改善吗？"
    },
    "answer": {
      "en": "No. Tasks, tools, opportunity, recollection and interpretation can change. The record has no standardised performance comparison or validated change threshold. It is not a way to monitor treatment, establish recovery or decide that support should stop.",
      "zh": "不能。任务、工具、接触机会、回忆和理解都可能改变。记录没有标准化表现对照或验证过的变化阈值，不用于监测治疗、确立恢复或决定停止支持。"
    }
  }
];
