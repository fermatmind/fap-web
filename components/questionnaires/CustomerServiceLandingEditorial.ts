import type { Questionnaire } from "@/lib/questionnaires/types";

export const customerServiceLandingSections: Questionnaire["guide"] = [
  {
    "id": "service-knowledge-scope",
    "title": {
      "zh": "客户服务情景测试练什么？从诉求到跟进的四组判断",
      "en": "What does this Customer Service Test practise? Four stages from request to follow-through"
    },
    "paragraphs": [
      {
        "zh": "24道原创单选分别练习倾听澄清、规则处理、清楚表达、记录跟进，每组六题。每题明确事实或虚构流程，从四种回应中选出有依据的一项。这里的“情景”指阅读后判断，不是录音通话、实时聊天、打字速度或真实工单操作；也不是回答“我通常多有耐心”的人格自评。",
        "en": "Twenty-four original multiple-choice items cover Listening and Clarifying, Rules and Resolution, Clear Service Messages, and Records and Follow-through, with six items each. Each supplies facts or a fictional process for selecting one supported response from four. Scenarios here are reading-and-decision tasks, not recorded calls, live chat, typing tests or real ticket operations. They are not personality statements about how patient you usually are."
      },
      {
        "zh": "一份请求往往同时包含发生的事、希望的结果、可用处理及尚未确认的信息。可以按这四个问题读题：客户实际说了什么？缺哪项事实？给定规则允许谁做什么？下一步应留下什么承诺或记录？不要只挑最客气的一句，也不要用自己熟悉的店规覆盖题设。",
        "en": "A request can contain an event, a desired outcome, available remedies and unresolved information. Read with four questions: What did the customer actually say? Which relevant fact is missing? Who may do what under the stated rule? What commitment or record should follow? The most polite-sounding sentence is not necessarily supported, and a familiar shop policy cannot replace the scenario’s rule."
      }
    ]
  },
  {
    "id": "service-clarify-request",
    "title": {
      "zh": "倾听与澄清：核对事件、目标与真实的信息缺口",
      "en": "Listening and clarification: check the event, goal and actual information gap"
    },
    "paragraphs": [
      {
        "zh": "Public Service Ombudsman在公共机构投诉处理原则中强调听取诉求、必要时澄清、适合的沟通方式与进度告知。[1] 这些是其公共服务语境中的指导，不是本站测量效度或某家商店的退款规则。题目将它们转成可检查的阅读问题：哪些事实已知，哪些仍需询问？",
        "en": "The Public Service Ombudsman’s public-body guidance addresses understanding a complaint, appropriate communication and progress information.[1] These principles belong to that public-service context; they establish neither this quiz’s validity nor a shop’s refund policy. The items turn the distinction into inspectable reading questions: what is already known, and what still needs asking?"
      },
      {
        "zh": "新例：客户说纸质入场券显示东门，但活动通知写西门，希望确认入口。可以先核“票面与通知的入口不同，您想确认应从哪边进入”，再查活动记录。不要自行补成客户要退票。已有编号且题设无再次验证要求时，使用现有信息；确有验证前提时，再按对应流程处理。",
        "en": "Fresh example: a paper admission ticket says East Gate, while an event notice says West Gate; the customer wants the entrance confirmed. Check the discrepancy and requested clarification, then consult the event record. Do not invent a refund request. Use an existing identifier when the scenario requires no repeat verification; follow an actual verification prerequisite when one is explicitly supplied."
      }
    ]
  },
  {
    "id": "service-conditions-authority",
    "title": {
      "zh": "规则与处理：把事实、资格、权限和执行分开",
      "en": "Rules and resolution: separate facts, eligibility, authority and execution"
    },
    "paragraphs": [
      {
        "zh": "新虚构规则：完整未使用的材料包在领取后8天内、凭证已核时可更换。第6天且其余条件满足，可以判断符合该规则；若是否使用未知，先补此事实，而不是自动批准或拒绝。条件之间通常是“同时满足”，不能只看期限。所有期限与金额都属于练习设定，不在这里解释现实消费权利。",
        "en": "Fresh fictional rule: an intact unused materials pack may be exchanged within eight days of collection with a verified receipt. Day six with the other conditions met supports eligibility. If use is unknown, establish that fact rather than automatically approving or refusing. Required conditions must hold together, not just the deadline. These periods and amounts are practice stipulations, not interpretations of real consumer rights."
      },
      {
        "zh": "再加一个独立条件：处理者最多批准18单位，所需处理为26单位，指定负责人有权批准。相差8单位要求走给定权限路径，不能拆单掩盖上限；若原授权已经覆盖动作，也不应额外加一次批准。符合资格、获批、已执行和款项到账是不同状态，记录及对外说明都应对应实际证据。",
        "en": "Add a separate condition: a handler may approve eighteen units, a remedy requires twenty-six and a named owner may approve it. The eight-unit excess calls for that specified authority route, not concealed split claims. Conversely, do not add approval when valid authorization already covers the action. Eligibility, approval, execution and receipt of funds are different states requiring their respective evidence."
      }
    ]
  },
  {
    "id": "service-supported-updates",
    "title": {
      "zh": "进度与承诺：未知结果也可以有清楚的下一步",
      "en": "Progress and commitments: unknown outcomes can still have a clear next step"
    },
    "paragraphs": [
      {
        "zh": "新例：技术团队未确认修复时间，但处理者能在周四10:30前检查并更新。可明确说“修复时间未定，我会在周四10:30前说明最新状态”；不能改成“周四10:30前一定修好”。即使没有新结论，更新也应说明仍在查什么、由谁继续负责，而不是用沉默暗示成功。",
        "en": "Fresh example: engineering has no confirmed fix time, but a handler can check and update by Thursday 10:30. State the unknown fix time and that update commitment; do not turn it into a guaranteed Thursday 10:30 repair. Even without a new conclusion, explain what remains under investigation and who owns the next step rather than letting silence imply success."
      },
      {
        "zh": "承诺应具体到可支持的动作：准备发送、已发送、已收到与问题已恢复不能互换。客户想要一个结果，与处理者当前能保证的动作也不同。可以承认困扰、说明已知事实和下一联系时间；无需假装掌握原因，或为显得积极而作出超过证据的保证。",
        "en": "Attach a commitment to an action you can support: preparing to send, sent, received and service restored are not interchangeable. A customer’s desired outcome also differs from what the handler can currently commit to. Acknowledge the difficulty, communicate known facts and identify the next contact without pretending to know a cause or promising beyond the evidence."
      }
    ]
  },
  {
    "id": "service-usable-messages",
    "title": {
      "zh": "清楚表达与可及沟通：让读者知道具体怎样做",
      "en": "Clear and accessible messages: let the reader identify the actual action"
    },
    "paragraphs": [
      {
        "zh": "先用给定的控件名称和顺序说明，再检查是否可执行。新虚构界面要求“活动→选择场次→重新发送确认函”，就保留这三个动作，不用“执行凭证恢复协议”替代。客户说第一步看到的名称不同，应核对实际页面，不坚持对方重复一个不存在的控件。说明清楚不等于删掉关键条件。",
        "en": "Use the supplied control names and sequence, then check whether the instructions are actionable. A fictional interface requiring Events, select a session, and Resend confirmation needs those steps, not “execute credential recovery protocol.” If the first control has another name on the customer’s screen, check the actual page rather than repeatedly directing them to a nonexistent control. Clarity does not mean dropping essential conditions."
      },
      {
        "zh": "渠道也要看实际需求及服务可用性：已说明无法语音，而本问题支持文字时，继续文字即可，不把电话当配合度测试。NSW Ombudsman的投诉流程指导建议询问沟通偏好并考虑合适支持。[3] 本页据给定条件练动作选择，不从文字简短或渠道偏好推测诊断、态度或人格。",
        "en": "Channel choice depends on stated needs and available service. If voice is unavailable to the customer and written support covers the issue, continue in writing rather than testing willingness through a call. NSW Ombudsman’s complaint-process guidance recommends asking about communication preferences and considering suitable support.[3] Here, choices follow supplied conditions; brevity and channel preference diagnose neither attitude nor personality."
      }
    ]
  },
  {
    "id": "service-records-continuity",
    "title": {
      "zh": "记录与跟进：保留来源、差异、责任和可核结果",
      "en": "Records and follow-through: preserve sources, discrepancies, ownership and outcomes"
    },
    "paragraphs": [
      {
        "zh": "Public Service Ombudsman的记录原则强调可用记录、所考虑证据及决定理由。[2] 新例：客户称等待18分钟，已核日志显示15分钟，应标注两个来源及3分钟待核差异，不删掉其中一个，也不据差异给人贴不诚实标签。后续纠正应说明核实了什么，依题设保留必要变更记录。",
        "en": "The Public Service Ombudsman’s record guidance addresses usable records, evidence considered and decision reasons.[2] Fresh example: a customer reports an eighteen-minute wait while a checked log shows fifteen. Attribute both and leave the three-minute difference open, without deleting either or declaring dishonesty. A later correction should identify what was verified and preserve the change record required by the scenario."
      },
      {
        "zh": "交接可以逐项写：问题与来源、已做动作、仍待确认的事、下一负责人、联系承诺。多个相似报告可关联共同调查，但重复不证明根因相同；个案仍要接续。若给定关单条件要求核实恢复，发送建议只是已沟通，不是已恢复；若实际规则不同，就按自己的规则重新判断，而不是套用万能关单期限。",
        "en": "A handover can list the issue and source, completed actions, outstanding checks, next owner and contact commitment. Similar reports can support a shared investigation without proving a common cause; individual cases still need continuity. If the stated closure rule requires verified recovery, sending advice establishes communication, not recovery. A different actual rule needs its own interpretation rather than a universal closure deadline."
      }
    ]
  },
  {
    "id": "service-counts-measurement",
    "title": {
      "zh": "怎样计分？四项正确数、完整复习与测量证据",
      "en": "How is it scored? Four correct counts, full review and measurement evidence"
    },
    "paragraphs": [
      {
        "zh": "每题匹配答案记1，其他有效选择记0；四组各0至6，总计0至24，完成全部有效选择后显示。新例3、5、2、4合计14／24；另一组4、4、3、3也为14，错误分布却不同。分组用于定位复习内容，题数一致不证明难度相同。原始正确数不产生主导型、百分位、职业等级或录用线。",
        "en": "A keyed choice earns one and another valid choice zero. Four groups range from zero to six, totalling zero to twenty-four after all valid answers. Fresh example:3, 5, 2 and 4 total 14/24, as do 4, 4, 3 and 3, despite different error patterns. Groups locate revision topics; equal lengths do not establish equal difficulty. Raw counts produce no dominant type, percentile, professional tier or hiring threshold."
      },
      {
        "zh": "客服测试并非一种统一工具。英国Civil Service的正式测试含不同题型、计时部分及申请人参照分数，其说明只适用于该工具。[4] 本页没有对应常模、信效度或中英文测量等值研究，不能套用外部产品的预测结论。固定答案可核对，但这与证明能预测现场服务表现是不同任务。",
        "en": "Customer-service tests are not one uniform instrument. The UK Civil Service describes different task types, a timed component and applicant-referenced scores for its own test.[4] This bank has no corresponding norms, reliability, validity or English–Chinese equivalence research, so external predictive claims do not transfer. Checking fixed answers and establishing prediction of live service performance are different tasks."
      }
    ]
  },
  {
    "id": "service-full-revision",
    "title": {
      "zh": "从选对答案到解释理由：四份全文怎样使用？",
      "en": "From choosing an answer to explaining why: using the four full guides"
    },
    "paragraphs": [
      {
        "zh": "完整作答无论零分、部分还是全对，都能看24道题的所选、答案与解析，以及四份各七节的完整指南。先找一题，写出决定答案的事实、规则与未确定事项，再解释其余选项为什么越过证据。可改一个条件重新推理，例如把材料包改成已使用，或把所需金额改为授权内；新例只是复习，不加入本次计分。",
        "en": "Every complete attempt, from zero to perfect, receives the chosen answers, keys and explanations for all twenty-four items and four complete seven-section guides. Select one item, identify its decisive fact, rule and uncertainty, then explain why alternatives exceed the evidence. Change one condition and reason again, such as a used pack or an amount within authority. These fresh examples support revision without adding to the attempt’s count."
      },
      {
        "zh": "开始直接进入题目，无需注册、邮箱、付款或先同意保存。答案只在浏览器计分；主动保存才保留本标签页24小时内进度，完成、清除或重测会删除。分享只复制公开链接。读过答案后重测提高可能来自记忆；要继续练，可用自己写的虚构案例说明理由，无需上传客户记录或操作真实账户。",
        "en": "Start opens questions directly without registration, email, payment or agreement to save. Answers are scored in the browser. Optional saving retains progress in this tab for up to twenty-four hours; completion, clearing or retaking removes it. Sharing copies a public link only. Higher retake counts after reading keys can reflect memory. Continue by explaining a fictional case you write yourself, without customer records or real account operations."
      }
    ]
  }
];

export const customerServiceLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "这里是情境判断、人格自评还是现场模拟？",
      "en": "Is this situational judgement, personality self-report or a live simulation?"
    },
    "answer": {
      "zh": "这是按明确事实与虚构规则选一个正确答案的情境知识练习。它不让你给行动分级、不评人格同意度，也不采集真实通话或工单表现。",
      "en": "It is scenario-based knowledge practice with one keyed answer under stated facts and fictional rules. It uses neither action-effectiveness ratings nor personality agreement scales and captures no live call or ticket performance."
    }
  },
  {
    "question": {
      "zh": "为什么不能只选听起来最友好的回应？",
      "en": "Why not simply choose the friendliest-sounding reply?"
    },
    "answer": {
      "zh": "回应还须符合事实、权限及下一步。温和地保证未知送达日期，仍缺依据；清楚说明未知和下次更新，比编造安慰更符合本题要求。",
      "en": "A reply must also fit the facts, authority and next step. A gentle promise of an unknown delivery date remains unsupported. State the uncertainty and next update rather than inventing reassurance."
    }
  },
  {
    "question": {
      "zh": "什么时候应直接处理，什么时候需要升级？",
      "en": "When should I act directly and when should I escalate?"
    },
    "answer": {
      "zh": "看题设已有授权及明确上限。有效授权覆盖就处理；超过限额且指定其他有权角色时，带必要记录转交。不要求把每个日常动作反复送审。",
      "en": "Follow the stated authorization and limit. Act within valid authority; route necessary records to the designated authorized role when the limit is exceeded. Routine authorized work needs no repeated approval."
    }
  },
  {
    "question": {
      "zh": "收到投诉就应确认客户的所有结论吗？",
      "en": "Does acknowledging a complaint confirm every allegation?"
    },
    "answer": {
      "zh": "不。收悉确认信息已到达，核查才支持事实结论。可以尊重地核对诉求，同时保留原因、责任或处理结果待查。",
      "en": "No. Acknowledgment establishes receipt; investigation supports factual conclusions. Respectfully check the request while leaving causes, responsibility or remedies open where evidence is missing."
    }
  },
  {
    "question": {
      "zh": "我已发送修复建议，就能把问题列为已解决吗？",
      "en": "Does sending repair advice establish resolution?"
    },
    "answer": {
      "zh": "本题若明确要求恢复确认，建议已发出与问题已解决是不同状态，仍需记录确认及后续跟进。真实关单要求须看相应流程，不从本例推通用期限。",
      "en": "If the item requires confirmation of recovery, sent advice and a resolved issue differ. Record the pending confirmation and follow-up. Actual closure conditions depend on the relevant process, not a universal deadline inferred here."
    }
  },
  {
    "question": {
      "zh": "四项都是六题，能据最高项认定最擅长的客服能力吗？",
      "en": "Do equal six-item sections identify my strongest service skill?"
    },
    "answer": {
      "zh": "不能。题数相同不保证难度与测量尺度相同。正确数帮助找出需要复习的具体判断，不证明真实沟通、共情、效率或职业胜任程度。",
      "en": "No. Equal length establishes neither equal difficulty nor a shared measurement scale. Counts locate particular decisions for revision without proving real communication, empathy, efficiency or job competence."
    }
  },
  {
    "question": {
      "zh": "怎样在不提供客户隐私的情况下继续练习？",
      "en": "How can I continue practising without providing customer information?"
    },
    "answer": {
      "zh": "自写不计分虚构案例：一个诉求、两项已知事实、一条明确规则、一个未知事项及后续负责人。写回应后核是否暗加承诺或遗漏条件，不上传真实消息、密码、订单或工单。",
      "en": "Write an unscored fictional case with a request, two known facts, an explicit rule, an uncertainty and a next owner. Check the reply for invented commitments or missing conditions. Upload no real messages, passwords, orders or tickets."
    }
  }
];

export const customerServiceLandingReferences: NonNullable<Questionnaire["references"]> = [
  {
    "title": {
      "zh": "UK Civil Service：正式客服测试的题型与分数说明",
      "en": "UK Civil Service: task formats and scoring for its Customer Service Skills Test"
    },
    "url": "https://www.gov.uk/guidance/preparing-for-the-customer-service-skills-test"
  }
];
