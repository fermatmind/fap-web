import type { Questionnaire } from "@/lib/questionnaires/types";

export const typingLandingSections: Questionnaire["guide"] = [
  {
    "id": "typing-task",
    "title": {
      "zh": "打字速度测试测什么？限定条件下的抄录表现",
      "en": "What does a typing speed test measure? Copying under specified conditions"
    },
    "paragraphs": [
      {
        "zh": "本页是一分钟抄录练习：在固定60秒内，把所见原文输入文本框，结束后核对最终输出及同位置匹配。英文与中文各有一段原创虚构材料，包含连续句子及标点；英文还包含大小写和数字。题材、长度、熟悉程度与改错规则共同构成本次任务条件。",
        "en": "This is a one-minute copy task: enter the displayed passage for sixty seconds, then review final output and position matches. Original fictional English and Chinese passages contain connected sentences and punctuation; the English also includes capitals and numbers. Material, length, familiarity and correction rules all form part of the task."
      },
      {
        "zh": "它观察的是抄录，不等于自由写作、听写、阅读理解或工作效率。界面语言与原文模式独立：英文界面也能练中文，中文界面也能练英文。比较自身练习时，先确认是哪段原文和哪种输入方式，再看速度与准确率。",
        "en": "Copying differs from composing, dictation, reading comprehension and work productivity. Interface language and passage mode are separate: either interface can use either passage. Identify the material and input method before comparing speed and accuracy between your attempts."
      }
    ]
  },
  {
    "id": "typing-speed-units",
    "title": {
      "zh": "WPM与CPM：单位相同的名称，仍需核对定义",
      "en": "WPM and CPM: check definitions as well as unit names"
    },
    "paragraphs": [
      {
        "zh": "WPM意为每分钟词数；在本站英文模式中，一个单位固定折算5个最终字符，包含字母、数字、空格与标点，不按词典单词计。五字符惯例也见于Typing.com的公式说明，但该网站对准确率和舍入另有定义。[1] 相同WPM名称并不保证所有网站计算完全一致。",
        "en": "WPM means words per minute; this English mode uses five final characters per unit, including letters, digits, spaces and punctuation rather than dictionary words. Typing.com also describes a five-character convention, with its own accuracy and rounding definitions.[1] The same WPM label does not establish identical calculations across sites."
      },
      {
        "zh": "本页同时显示英文总WPM与同位置正确WPM，分别用最终字符数、匹配字符数除以5。中文模式直接报告最终CPM和同位置正确CPM，不另折算英文WPM。因为固定满一分钟，这里的每分钟数就是本轮字符计数；少于60秒不会提前生成速度结果。",
        "en": "English displays both gross and position-correct WPM, dividing final characters and matching characters respectively by five. Chinese instead reports final and position-correct CPM without an English-WPM conversion. Over the fixed full minute, per-minute character figures equal the round counts; an unfinished minute produces no early speed result."
      }
    ]
  },
  {
    "id": "typing-position-example",
    "title": {
      "zh": "准确率算例：输出量、匹配量与错位分开看",
      "en": "Worked accuracy: separate output, matches and shifted alignment"
    },
    "paragraphs": [
      {
        "zh": "例如最终输入180字符，其中171个与原文同位置相同：英文为36总WPM、34.2同位置正确WPM，准确率171÷180×100=95%；中文则为180 CPM、171同位置正确CPM和95%。这组虚构数字只展示单位，不能拿来设平均值或达标线。",
        "en": "For 180 final characters with 171 positional matches, English gives 36 gross WPM, 34.2 position-correct WPM and 95% accuracy. Chinese gives 180 final CPM, 171 position-correct CPM and the same 95%. These fictional figures illustrate units, not averages or passing marks."
      },
      {
        "zh": "短例原文“red pen”，输入“redpen”，前3个位置匹配，后3处因漏空格而错位：准确率3÷6=50%。这不等于发生了3次独立手误。本站没有以编辑距离寻找最佳对齐，也不把未输入的原文余量算错；因此必须按明确的“最终文本逐位置准确率”来理解。",
        "en": "For source “red pen” and input “redpen”, three positions match and three shift after the omitted space: 3/6 gives 50%. That does not establish three independent slips. This edition does not find an optimal edit-distance alignment or count the untyped source remainder as wrong. Read the metric specifically as final-text positional accuracy."
      }
    ]
  },
  {
    "id": "typing-correction-evidence",
    "title": {
      "zh": "改错与错误研究：最终文本看不见全部输入过程",
      "en": "Corrections and error research: final text does not reveal the whole process"
    },
    "paragraphs": [
      {
        "zh": "输入研究会区分呈现原文、输入事件流和最终转录文本。Soukoreff与MacKenzie讨论已修正及未修正错误，并指出简单逐位置比较会受到插入、漏字后的错位影响。[5] 本页没有实施其统一错误率模型；引用用于说明计量区别，不能把本站不匹配字符数改称研究模型中的总错误率。",
        "en": "Text-entry research distinguishes presented text, the input stream and final transcribed text. Soukoreff and MacKenzie discuss corrected and uncorrected errors and the alignment problem in simple character comparisons.[5] This page does not implement their unified error metric. The reference clarifies measurement differences; positional mismatches here must not be relabelled as that model’s total error rate."
      },
      {
        "zh": "在本轮中可退格、选中和替换，删去的字符不累计到最终输出，改好的错误不再留在最终不匹配数内，但改错占用的时间仍计入60秒。例如先输入22字符，删掉2个再结束，最终计20个；不能从最终100%准确率推断过程中从未出错。",
        "en": "Backspace, selection and replacement are allowed. Deleted characters do not accumulate as final output, and repaired errors leave no final mismatch, although correction time still uses the same sixty seconds. Entering twenty-two characters and deleting two leaves twenty. A final 100% accuracy therefore does not establish an error-free process."
      }
    ]
  },
  {
    "id": "typing-chinese-ime",
    "title": {
      "zh": "中文输入法与字符：提交、标点和屏幕折行",
      "en": "Chinese input: committed text, punctuation and visual wrapping"
    },
    "paragraphs": [
      {
        "zh": "中文CPM计已经提交的文字，不把拼音按键、候选列表或尚未结束的组字串计成汉字。浏览器组字结束事件可能表示完成或取消，本站以截止前保留的已提交文本计算。[3] 例如先有18个已提交字，结束时仍在选新词，则只计这18个；及时提交后才计输出的实际字符。",
        "en": "Chinese CPM counts committed text, not pinyin key presses, candidate lists or unfinished composition. A browser composition-end event can signal completion or cancellation; this task counts the committed buffer retained before the deadline.[3] If eighteen characters are committed while a new word is still composing at the boundary, only those eighteen count. Timely commitment adds the actual resulting characters."
      },
      {
        "zh": "字符经过规范归一，并以字素分段；这比数编码单元更贴近可见字符，但不是对语言能力的测量。[2] “春天。”共3字符，中文句号换成ASCII点仍可能不匹配；全角半角不会全部互换。屏幕自动折行也不是原文换行，不需要额外输入回车。",
        "en": "Characters undergo canonical normalization and grapheme segmentation rather than code-unit counting; this is not a language-proficiency measure.[2] “春天。” has three characters. Replacing its punctuation with an ASCII full stop can mismatch; fullwidth and ASCII forms are not universally interchangeable. Visual line wrapping is not a source newline to reproduce."
      }
    ]
  },
  {
    "id": "typing-minute",
    "title": {
      "zh": "一分钟怎样计时？开始、截止与中断",
      "en": "How the minute is timed: start, deadline and interruption"
    },
    "paragraphs": [
      {
        "zh": "按“开始60秒练习”立即计时，聚焦、读取原文与改错都在同一分钟内，不从首次输入重新起算。页面采用单调计时并核对明显时钟偏差；浏览器计时与系统休眠可能有差异。[4] 转后台会取消并清空本轮，不把暂停期间从分母中悄悄扣除。",
        "en": "The start button begins the minute immediately, including focusing, reading and corrections; the first character does not restart the clock. The page uses monotonic timing and checks substantial clock divergence; browser timing can differ around system sleep.[4] Backgrounding cancels and clears the attempt rather than silently removing a pause from the denominator."
      },
      {
        "zh": "开始前可以看原文。若提前抄完整段，可以修正并等到一分钟结束；有限原文会限制可输出字符。刷新、取消及换模式清空输入，未完成的轮次没有速度结果。请把这些条件与“首键开始”“整段完成即结束”或可续时的工具区分后再比较。",
        "en": "You may inspect the passage before starting. If you finish it early, correct it and wait for the minute; the finite source limits available output. Refresh, cancellation and changing modes clear input. Incomplete rounds have no speed result. Compare these rules with tools that start at the first key, stop after a passage or allow resumption."
      }
    ]
  },
  {
    "id": "typing-practice",
    "title": {
      "zh": "怎样比较几次练习？先保持条件一致",
      "en": "Comparing practice attempts: establish consistent conditions first"
    },
    "paragraphs": [
      {
        "zh": "记录同一种原文模式、设备、键盘布局、输入法与改错策略，再一起观察输出和准确率。手机触屏与实体键盘、常用词列表与带标点段落，会形成不同任务。固定材料重做提高可能包含熟悉效应，不能仅凭最好一次就推断一般能力增长。",
        "en": "Record passage mode, device, keyboard layout, input method and correction policy, then consider output alongside accuracy. Touchscreens versus physical keyboards and common-word lists versus punctuated passages create different tasks. Improvement on repeated fixed material can include familiarity; a best attempt alone does not establish general skill growth."
      },
      {
        "zh": "可以挑一个具体问题慢练：英文空格、大小写或数字，中文选词或标点；另用一句新编短句核对。之后再做计时练习，观察是否仍出现同类错位。本页未建立训练方案的效果、持续工作表现或人群常模，不用“全球平均”“专业档”等名称替代相应样本与验证。",
        "en": "Choose a specific issue for slower practice: English spaces, capitals or numbers, or Chinese candidate selection or punctuation. Check it with a fresh short sentence before another timed round and look for recurring alignment errors. This page has not established training efficacy, sustained-work performance or population norms; labels such as global average or professional would require their own evidence."
      }
    ]
  },
  {
    "id": "typing-results-access",
    "title": {
      "zh": "两份完整指南与隐私：成绩不决定阅读权限",
      "en": "Two complete guides and privacy: no score-gated reading"
    },
    "paragraphs": [
      {
        "zh": "英文、中文各有7节完整指南，共14节，涵盖单位、算例、改错、组字、计时与下一步练习。开始前或任何结果后都可阅读，包括零输入轮次：0 CPM并不产生可适用的准确率，不把空文本写成100%准确。无需邮箱、账户、付款或再次同意才查看。",
        "en": "Each language guide has seven complete sections, fourteen in total, covering units, examples, corrections, composition, timing and next practice. Both are readable before starting and after any result, including an empty round: zero CPM has no applicable accuracy percentage. Access needs no email, account, payment or additional consent click."
      },
      {
        "zh": "抄录文本只留本页内存，不保存草稿；结束或取消清除原始输入，结果只在当前页面显示。分享只复制公开练习标题和入口，不含成绩或输入。公开指南不是你的私人结果。阻止粘贴、拖放也不等于身份核验或监考，本站不颁发招聘资格或证书。",
        "en": "Copied text stays in page memory without drafts. Completion or cancellation clears raw input; aggregates remain only on the current page. Sharing copies the public practice title and entry link without input or results. A public guide is not a private score. Paste/drop blocking supplies neither identity verification nor proctoring, and this page issues no employment qualification or certificate."
      }
    ]
  }
];

export const typingLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "英文WPM是在数实际单词吗？",
      "en": "Does English WPM count actual words?"
    },
    "answer": {
      "zh": "不是。本页按5个最终字符折1个单位，空格、标点、数字也计入。不同词长不会直接改变单位大小；但文本难度仍会影响抄录表现。",
      "en": "No. Five final characters form one unit, including spaces, punctuation and digits. Actual word length does not set the unit, although text difficulty can affect performance."
    }
  },
  {
    "question": {
      "zh": "同位置正确WPM就是所有网站的净WPM吗？",
      "en": "Is position-correct WPM the same as every site’s net WPM?"
    },
    "answer": {
      "zh": "不是。本站只用同位置匹配字符数除以5，其他工具可能按错词、每分钟错误或输入事件罚分。需要核对公式、改错规则与计时范围，不能只比名称。",
      "en": "No. This page divides positional matches by five. Other tools may use incorrect words, errors per minute or input-event penalties. Check formulas, corrections and timing rather than labels alone."
    }
  },
  {
    "question": {
      "zh": "100%准确率说明从来没按错键吗？",
      "en": "Does 100% accuracy prove I never pressed a wrong key?"
    },
    "answer": {
      "zh": "不说明。这里看最终已提交文本，改掉的错误不留在最终不匹配数中，时间成本仍在。它不是逐按键准确率。",
      "en": "No. The final committed text is scored. Repaired errors leave no final mismatch, although correcting them consumes time. This is not keystroke accuracy."
    }
  },
  {
    "question": {
      "zh": "为什么中文CPM不能直接除以5与英文比较？",
      "en": "Why not divide Chinese CPM by five to compare with English?"
    },
    "answer": {
      "zh": "本页没有建立跨语言等价。中文涉及输入法转换，英文为不同材料及单位；数学换算不会消除任务、文本与输入方式差异。",
      "en": "Cross-language equivalence has not been established. Chinese involves input-method conversion and different material. Arithmetic conversion cannot remove task, text and input-method differences."
    }
  },
  {
    "question": {
      "zh": "开始后等几秒才打字，会重新计时吗？",
      "en": "Does waiting before typing restart the minute?"
    },
    "answer": {
      "zh": "不会。从按开始到截止共60秒，等待、阅读和改错都包含。需要准备时可先看原文，准备好再开始；取消的轮次不出速度结果。",
      "en": "No. The start button begins all sixty seconds, including waiting, reading and corrections. Inspect the source before starting if needed. Cancelled rounds produce no speed result."
    }
  },
  {
    "question": {
      "zh": "标点看起来一样，为什么仍可能不同？",
      "en": "Why can similar-looking punctuation mismatch?"
    },
    "answer": {
      "zh": "中文句号、ASCII点、不同引号或全角符号并不全是同一字符。按原文复制；规范归一不会把所有形似字符合并。",
      "en": "Chinese and ASCII full stops, quotation styles and fullwidth symbols are not all the same character. Copy the source: canonical normalization does not merge every look-alike."
    }
  },
  {
    "question": {
      "zh": "录完整段可以马上结束吗？",
      "en": "Can I finish immediately after copying the whole passage?"
    },
    "answer": {
      "zh": "本轮仍等满60秒，可在剩余时间检查并修正。原文有限，抄完后输出受长度上限影响；这与按完成时间折算的工具不同。",
      "en": "The round still lasts sixty seconds; use remaining time to check or correct. The finite passage limits output after completion. This differs from tools that calculate speed from passage-completion time."
    }
  },
  {
    "question": {
      "zh": "结果能用于招聘或证明中文、英文水平吗？",
      "en": "Can the result certify employment or language proficiency?"
    },
    "answer": {
      "zh": "不能据本页建立这些结论。它只报告指定材料与条件下一分钟抄录，未包含岗位内容验证、身份核验、长期表现或语言水平测量。",
      "en": "This page establishes neither. It reports a one-minute copying sample without role-specific validation, identity verification, sustained performance or language-proficiency assessment."
    }
  }
];

export const typingLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "zh": "Soukoreff与MacKenzie（2003）：文本输入错误的计量方法",
      "en": "Soukoreff & MacKenzie (2003): metrics for text-entry errors"
    },
    "url": "https://www.yorku.ca/mack/chi03.html"
  }
];
