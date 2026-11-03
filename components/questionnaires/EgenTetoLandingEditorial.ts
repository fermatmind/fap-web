import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Original first-move supplement; source-bound items and nine-section guides stay intact. */
export const egenTetoLandingSections: QuestionnaireSection[] = [
  {
    "id": "egen-scope",
    "title": {
      "zh": "Egen与Teto在本版是什么意思？从“先做什么”开始",
      "en": "What do Egen and Teto mean in this edition? Start with what comes first"
    },
    "paragraphs": [
      {
        "zh": "Egen在这里指先接住感受，Teto指先明确行动。18道情境比较的是给定两项里更想优先采用哪一步：作品还没完成、相册选不出开头、散步走错路、朋友担心点心做不好。题目不问身体、性别或真实聊天记录，也不把任何一侧作为更好的回答。",
        "en": "Egen here means acknowledging a feeling first; Teto means clarifying an action first. Eighteen situations compare which offered move you would prioritise: an unfinished creation, an album opening, a wrong turn or worries about homemade snacks. Items ask for no bodily information, gender or actual chat records, and neither side is the better answer."
      },
      {
        "zh": "开场顺序不同，不代表关心与解决问题互相排斥。先确认期待，可以接着试修改；先看替代地点，也可以回应失落。本版是独立编写的趣味反思问卷，只有两项计数和三份结果指南，不把名称扩展成四种性别标签、性格成分或人际身份。",
        "en": "Different openings do not make care and problem-solving opposites. Acknowledging a hope can lead to an edit; offering a venue can include acknowledging disappointment. This independently authored playful reflection has two counts and three result guides, not four gender-coded labels, personality ingredients or interpersonal identities."
      }
    ]
  },
  {
    "id": "egen-response",
    "title": {
      "zh": "先接住感受：确认听到了什么，再核对需要",
      "en": "Feelings first: acknowledge what you heard, then check the need"
    },
    "paragraphs": [
      {
        "zh": "听朋友的小曲时，Egen选项先描述哪个片段带来画面；做纪念相册时，先请每个人说想保留的回忆。它们给期待或体验一个表达入口，不要求你认同作品的每个决定，也不等于准确读懂对方内心。可以说清自己听到什么，再让对方补充或更正。",
        "en": "For a friend’s tune, the Egen option describes a moment that evoked an image; for a memory album, it invites memories worth keeping. These offer room to express an experience or hope without requiring agreement with every creative decision or accurate mind-reading. Say what you heard and allow correction."
      },
      {
        "zh": "另设一位朋友只想知道影片能否按时提交：反复安慰可能没有回应他的问题。可以问“你想先聊期待的效果，还是先核一下交付安排？”也能说自己只有十分钟。先回应感受不要求无限倾听、替人承担情绪，或把对方没有说出的感受当作事实。",
        "en": "Suppose a friend only wants to know whether a video can be submitted on time: repeated reassurance may miss the request. Ask whether to discuss the intended effect or check delivery arrangements. You can also state that you have ten minutes. Acknowledgement requires neither unlimited listening, carrying someone’s emotions nor treating an unspoken feeling as fact."
      }
    ]
  },
  {
    "id": "teto-action",
    "title": {
      "zh": "先明确行动：给一个可以修改或拒绝的小提案",
      "en": "Action first: offer a small step that can be revised or declined"
    },
    "paragraphs": [
      {
        "zh": "群头像候选越来越多时，Teto选项先缩小候选并安排投票；视频开头不满意时，先剪一个短版本比较。共同点是把下一步变得具体，结果仍待讨论。你提出步骤，并不意味着对方已同意目标、范围或时间，更不证明方案一定有效。",
        "en": "When group-avatar suggestions proliferate, Teto narrows candidates for a vote; when a video opening feels wrong, it makes a shorter copy for comparison. Both make a next step concrete while leaving the outcome discussable. Offering a step establishes neither agreement on the goal, scope or timing nor the plan’s effectiveness."
      },
      {
        "zh": "比如有人展示珍藏明信片，立刻开始整理可能跳过了他想讲的故事。可以先问“你想给我讲其中一张，还是一起找个展示办法？”行动也可以是提出澄清问题、约定暂停或决定不改。Teto次数不评价速度、领导力、执行能力，也不给强迫同意加分。",
        "en": "If someone shows treasured postcards, immediate sorting may skip the story they wanted to tell. Ask whether they want to describe one card or find a display arrangement together. An action can be a clarifying question, a pause or a decision not to change anything. Teto counts assess no speed, leadership or execution, and award no credit for forcing agreement."
      }
    ]
  },
  {
    "id": "egen-context",
    "title": {
      "zh": "同一次野餐与同一本相册，可以采用不同顺序",
      "en": "A picnic and an album can invite different sequences"
    },
    "paragraphs": [
      {
        "zh": "野餐取消时，先回应失望再找有顶棚的地点，与先找地点再表达仍想见面，都可能是一段完整回应。若人已经淋雨，先避雨也很合理。本题的短情境不能囊括时间紧迫程度、熟悉程度或实际请求；请把自己补充的条件保留在解释里。",
        "en": "For a disrupted picnic, acknowledging disappointment then finding shelter and finding shelter then expressing a wish to meet can both be complete responses. If people are already getting wet, shelter can come first. Short items cannot include every detail of urgency, familiarity or the actual request; retain your qualifications when interpreting choices."
      },
      {
        "zh": "相册项目也可能先收集回忆，再约定三张开头照片；也可能先定三张，发现缺少重要故事后重新讨论。选项只记录第一步，不记录后来有没有倾听、修改和协商。较低次数不表示你不会或不愿采用那种回应，同分也不证明你总能恰当切换。",
        "en": "An album can begin by gathering memories and then agreeing on three opening photos, or by selecting three and revisiting a missing story. The choice records the first move, not later listening, revision or negotiation. A lower count establishes no inability or unwillingness to use the other response, and equal counts prove no consistently appropriate switching."
      }
    ]
  },
  {
    "id": "egen-counts",
    "title": {
      "zh": "18题怎样计分？9比9、10比8与极端次数",
      "en": "How are eighteen pairs scored? Nine each, ten versus eight and endpoints"
    },
    "paragraphs": [
      {
        "zh": "每题两方向各出现一次，分别在A、B位置各9次。选中一项加1，完成后两个次数相加为18，每项范围0—18，没有反向、加权、正确答案或常模分数。19种计数组合都能形成：Egen从0到18，Teto就是18减去Egen。位置均衡不等于题目没有偏差。",
        "en": "Both directions appear once per item and nine times in each A–B position. A choice adds one; completed counts sum to eighteen, with each ranging from zero to eighteen. There are no reversals, weights, correct answers or normative scores. Nineteen count pairs are possible: Egen zero through eighteen, with Teto equal to eighteen minus Egen. Position balance does not establish unbiased items."
      },
      {
        "zh": "全选A或全选B都会9比9，显示专门九节并列指南。10比8显示较高侧九节；改一题就变9比9，因此不是已验证的心理分界。18比0也只表示本题组每次先选同一方向，不代表现实中从不用另一种回应。三份全文随时可读，不需要额外测试来解锁“真正类型”。",
        "en": "All A or all B yields nine each and a dedicated nine-section tie guide. Ten versus eight selects nine sections for the higher side; one switched answer creates a tie, so the boundary has no validated psychological meaning. Eighteen versus zero concerns this bank, not never using another response in life. All three guides remain public without another test to unlock a true type."
      }
    ]
  },
  {
    "id": "egen-study",
    "title": {
      "zh": "情绪支持与实际帮助：研究能说明什么？",
      "en": "Emotional support and practical help: what can research establish?"
    },
    "paragraphs": [
      {
        "zh": "Morelli等2015年的日记研究区分情绪支持与工具性支持，并考察它们与提供支持者幸福感的关联。[2] 这可以帮助理解“理解感受”和“提供实际帮助”是可分别讨论的互动内容；它没有检验本版Egen-Teto题目、9比9分界、哪一步应永远先做，或两种固定人格。",
        "en": "Morelli and colleagues’ 2015 diary study distinguished emotional and instrumental support and examined associations with providers’ well-being.[2] It offers background for discussing emotional understanding and practical help separately. It did not test these Egen-Teto items, a nine-each boundary, a universally preferred sequence or two fixed personalities."
      },
      {
        "zh": "研究中分别观察两种支持，不意味着本问卷能分别测出两项独立能力：本题每选一侧，另一侧就少一次机会，两个次数相互依赖。它也没观察被帮助者是否觉得有用。本版尚未建立信度、效度、常模或中英文测量等价性，不能用外部论文替代这些证据。",
        "en": "Observing two forms of support separately does not mean this quiz measures two independent abilities. Choosing one side uses an opportunity unavailable to the other, making the counts dependent. The quiz also observes no recipient’s assessment of helpfulness. Reliability, validity, norms and English–Chinese measurement equivalence remain unestablished; an external paper cannot replace those forms of evidence."
      }
    ]
  },
  {
    "id": "egen-practice",
    "title": {
      "zh": "把结果用在一句可核对的话里",
      "en": "Use the result in one checkable exchange"
    },
    "paragraphs": [
      {
        "zh": "回看一题较有印象的选择，分别找一个符合的生活例子和一个反例。比如你通常先提方案，但上一次朋友只想分享做作品的乐趣。若愿意，下次普通谈话中可问“你想我先听听，还是一起找个下一步？”对方也可以两样都想要，或暂时不谈。",
        "en": "Choose one memorable item and find both a fitting example and a counterexample. You may usually propose solutions, while a friend recently only wanted to share the pleasure of creating something. If useful in an ordinary conversation, ask whether they want listening or a next step together. They may want both or prefer not to discuss it."
      },
      {
        "zh": "之后只核对这一次：你是否听清请求、是否允许对方更正、提案是否留出拒绝空间。无需记录私人对话或替别人判断Egen/Teto。重测时先比较改变的具体选项与情境；字母位置、当天想起的经历和措辞理解都可能影响结果，不能只看标签宣布人格改变。",
        "en": "Afterwards, check that exchange: whether you understood the request, allowed correction and left room to decline. Record no private dialogue or assign another person an Egen/Teto label. On retake, compare changed options and contexts; position, recalled experiences and interpretation may affect answers. A label alone establishes no personality change."
      }
    ]
  },
  {
    "id": "egen-access",
    "title": {
      "zh": "三份完整指南、双语阅读与作答隐私",
      "en": "Three complete guides, bilingual reading and answer privacy"
    },
    "paragraphs": [
      {
        "zh": "Egen、Teto与并列各有九节完整指南，分别说明例子、适用情境、取舍、比较、小尝试与计数。中英文对应同一18题和计分规则；双语文本齐全不证明不同语言作答的人得到可直接比较的分数。它适合作为自愿讨论开场顺序的趣味材料，不评情商、内外向、性别、身体或伴侣适配。",
        "en": "Egen, Teto and the tie each have nine full sections covering examples, contexts, trade-offs, comparisons, a small experiment and counts. English and Chinese use the same eighteen items and scoring rule; complete bilingual text does not prove comparable scores across languages. This is optional playful material for discussing openings, not a measure of emotional intelligence, introversion, gender, bodies or partner compatibility."
      },
      {
        "zh": "开始直接进入题目，无需额外同意或提供性别、邮箱和账号。答案在浏览器计分；主动保存才建立24小时标签页草稿，完成、重测或退出清除即删除。可选分享只带公开名称和指南链接，不带答案或计数。只读公开全文、不接受比喻或结束探索，都不会缺少一层付费解读。",
        "en": "Start opens questions directly without another agreement, gender, email or account. Answers are scored in the browser; explicit saving creates a twenty-four-hour tab draft cleared on completion, retake or exit-and-clear. Optional sharing includes a public name and guide link, not answers or counts. Reading only, rejecting the metaphor or stopping leaves no paid interpretation layer missing."
      }
    ]
  }
];

export const egenTetoLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "为什么先听和先做不等于两种互斥人格？",
      "en": "Why are listening first and acting first not exclusive personalities?"
    },
    "answer": {
      "zh": "题目只选第一步。同一个人可以先回应感受再列方案，也可以先安排再听反馈，题目没有记录后续完整互动。",
      "en": "Items select a first move. One person can acknowledge a feeling then plan, or arrange something then hear feedback. Later interaction is not recorded."
    }
  },
  {
    "question": {
      "zh": "Egen次数高说明我共情更准确吗？",
      "en": "Does a higher Egen count prove more accurate empathy?"
    },
    "answer": {
      "zh": "不能。选择愿意先回应感受，与实际理解是否准确是不同问题；对方是否觉得被理解，也需要由真实反馈核对。",
      "en": "No. Preferring acknowledgement differs from understanding accurately. Whether someone felt understood requires their actual feedback."
    }
  },
  {
    "question": {
      "zh": "Teto次数高说明方案更有效吗？",
      "en": "Does a higher Teto count prove more effective solutions?"
    },
    "answer": {
      "zh": "不能。计数没有观察方案是否被接受、是否可行或最后效果。提出澄清问题、允许拒绝和重新安排也可以是具体行动。",
      "en": "No. Counts observe neither acceptance, feasibility nor outcomes. Clarifying, allowing refusal and renegotiating can also be concrete actions."
    }
  },
  {
    "question": {
      "zh": "9比9是否比10比8更理想？",
      "en": "Is nine each more desirable than ten versus eight?"
    },
    "answer": {
      "zh": "不是。它是次数相等，不是健康、成熟或适应力评分。10比8改一题即并列，两种结果都有九节全文。",
      "en": "No. Equal counts do not score health, maturity or adaptability. Switching one answer ties ten versus eight; both outcomes have nine full sections."
    }
  },
  {
    "question": {
      "zh": "18比0是不是现实中只用一种回应？",
      "en": "Does eighteen versus zero mean using only one response in life?"
    },
    "answer": {
      "zh": "不是。它只说明本题组18次选择，不记录后续步骤，也不能概括没有出现的情境。",
      "en": "No. It concerns eighteen offered choices, without recording later moves or unrepresented situations."
    }
  },
  {
    "question": {
      "zh": "支持行为研究能证明这份题本科学有效吗？",
      "en": "Does support research validate this questionnaire?"
    },
    "answer": {
      "zh": "不能。外部研究可以帮助区分互动内容，但没有检验本题、映射或分界；本站仍缺少对应信度、效度与跨语言等价证据。",
      "en": "No. Research can distinguish interaction content without testing these items, mappings or boundaries. Corresponding reliability, validity and language-equivalence evidence remains absent."
    }
  },
  {
    "question": {
      "zh": "开始后还需要同意、选性别或填邮箱吗？",
      "en": "Must I agree again, select gender or enter an email after starting?"
    },
    "answer": {
      "zh": "不需要。点击开始直接进入18题，三份完整指南免费，不需额外同意、性别选择、邮箱、账号或前置测试。",
      "en": "No. Start directly opens eighteen items. All three full guides are free without another agreement, gender selection, email, account or prerequisite test."
    }
  }
];
