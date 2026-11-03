import type { Questionnaire, QuestionnaireSection } from "@/lib/questionnaires/types";

/** Bespoke consumer-security practice supplement; source-bound bank and guides stay intact. */
export const cybersecurityLandingSections: QuestionnaireSection[] = [
  {
    "id": "cyber-purpose",
    "title": {
      "zh": "网络安全意识测试练什么？五类日常知识决定",
      "en": "What does this cyber security awareness test practise? Five everyday knowledge decisions"
    },
    "paragraphs": [
      {
        "zh": "本卷把安全知识放进可判断的选择：快递短信、银行通知、意外发票、礼品卡请求、账户凭据、旧电脑移交和疑似事件报告。五个主题各四题，每题四项行动且只有一个有依据的答案。它核对你如何理解这些条件，不要求操作真实账户、打开附件或提供个人资料。",
        "en": "This bank places security knowledge in choices about delivery texts, bank notices, unexpected invoices, gift-card requests, credentials, computer handover and suspected-event reporting. Five topics contain four items each, with four actions and one supported key per item. It checks your understanding of the stated conditions without asking you to operate real accounts, open attachments or provide personal information."
      },
      {
        "zh": "知识练习、实际安全设置检查和组织应急处置是不同任务。答对一道MFA题不表示账户已经启用MFA；知道备份有用不表示某份文件确实能够恢复。这里没有漏洞扫描、模拟钓鱼邮件投送、渗透测试或专业认证，也不会凭分数宣布某个人或设备“安全”。",
        "en": "Knowledge practice, checking actual settings and organisational incident handling are different tasks. A correct MFA answer does not enable MFA, and knowing backups matter establishes no file’s recoverability. This page performs no vulnerability scan, simulated phishing delivery or penetration test and grants no professional certification or score-based verdict that a person or device is safe."
      }
    ]
  },
  {
    "id": "cyber-phishing",
    "title": {
      "zh": "钓鱼核实：把验证渠道与可疑消息分开",
      "en": "Phishing verification: separate the checking channel from the suspicious message"
    },
    "paragraphs": [
      {
        "zh": "消息有熟悉标志、运单号或同事显示名，不能单凭这些认定发送者身份；催促也不应代替核实。FTC建议通过已知真实的电话或网站联系相关机构，而不是使用消息新给出的信息。[1] 本卷因此比较已知官方应用、银行卡原有电话或原本可信的同事联系方式，与沿可疑消息继续交互的做法。",
        "en": "A familiar logo, tracking number or colleague display name does not by itself establish a sender’s identity, and urgency should not replace verification. FTC guidance recommends contacting the organisation through a number or website known to be real, rather than new details in the message.[1] The bank therefore contrasts known apps, the number on a bank card and established colleague contacts with continuing through the suspicious message."
      },
      {
        "zh": "例如，旧联系人突然要求更改一笔付款安排，重新让同一封邮件确认，并没有建立独立依据。也不必先打开附件看是否真实。另一方面，陌生措辞或拼写错误只是需要核实的线索，不是判断所有攻击的必要条件；本练习没有要求“有错字才是钓鱼”或“没有错字就可信”。",
        "en": "For example, asking the same unexpected email to confirm a changed payment request creates no independent basis. Opening an attachment first is not necessary to verify it either. Unusual wording and spelling errors can prompt checking, but are not necessary features of every attack. This practice does not equate phishing with misspellings or treat fluent wording as trustworthiness."
      }
    ]
  },
  {
    "id": "cyber-accounts",
    "title": {
      "zh": "账户保护：不同密码、认证因素与验证码",
      "en": "Account protection: unique passwords, authentication factors and verification codes"
    },
    "paragraphs": [
      {
        "zh": "不同账户复用密码，会让一处泄露影响其他账户；可信密码管理器可帮助生成与保存不同凭据。[2][3] MFA中的“因素”指类别，不能只数输入框：密码属于知道的信息，已登记安全密钥属于持有的物件；重复密码或再问一个知识问题，不等于这两个类别的组合。",
        "en": "Password reuse can connect one breach to other accounts, and a reputable password manager can help generate and store distinct credentials.[2][3] An authentication factor is a category, not merely another input box: a password is knowledge and a registered security key is possession. Repeating a password or adding another knowledge question does not combine those two categories."
      },
      {
        "zh": "一次性验证码也可能被人诱骗索取；它会过期，不表示现在可以交给意外来电者。FTC提醒不要向并非自己先联系的人提供验证码，并说明短信认证存在被接管号码等风险。[2] 因此，本卷不把“开了MFA”解释成绝不会被盗。具体启用、找回和保护管理器的方法，应看实际服务提供方说明。",
        "en": "A one-time code can be solicited through deception; expiry does not make it safe to hand over to an unexpected caller. FTC guidance cautions against giving a code to someone you did not contact first and describes risks such as takeover of a number used for text-message authentication.[2] This bank therefore makes no claim that MFA prevents every takeover. Follow the actual provider’s instructions for setup, recovery and protecting a password-manager account."
      }
    ]
  },
  {
    "id": "cyber-devices",
    "title": {
      "zh": "设备维护：更新、独立备份和资料清除各做什么",
      "en": "Device care: updates, independent backups and data removal have different jobs"
    },
    "paragraphs": [
      {
        "zh": "正规更新可以修补软件弱点，强密码不能代替补丁；网页突然声称中毒，也不能证明其下载工具可信。[1][3] 这两种提示要分开：使用设备或软件本身可信的更新机制，与按陌生弹窗安装程序，并不是同一种行动。出现异常也不足以诊断某种具体恶意软件。",
        "en": "Legitimate updates can patch software weaknesses; a strong password cannot replace a patch, and a sudden webpage infection warning does not make its download trustworthy.[1][3] Distinguish the device or software’s trusted update mechanism from installing an unknown popup’s program. An unusual symptom alone does not diagnose a particular kind of malware."
      },
      {
        "zh": "备份要保留另一份所需资料，并检查能否读取；同一电脑上的快捷方式不能应对整台电脑丢失。送出旧电脑前，先保存仍需文件，再按相应制造商说明清除资料。[4] 备份、删除快捷方式、退出一个应用和清除整台设备不是同义词；本页不替任何型号执行清除，也不保证所有备份都能恢复。",
        "en": "A backup needs another copy of the required data and a check that it can be read; a shortcut on the same computer does not address loss of that computer. Before disposing of an old machine, retain needed files and follow the manufacturer’s removal instructions.[4] Backing up, deleting a shortcut, signing out of an app and clearing a device are different operations. This page clears no device and guarantees no backup’s recoverability."
      }
    ]
  },
  {
    "id": "cyber-sharing",
    "title": {
      "zh": "信息分享：以授权范围和题面规则判断",
      "en": "Information sharing: check authorised recipients and explicit scenario rules"
    },
    "paragraphs": [
      {
        "zh": "本卷工资文件题明确规定只有获授权收件人可访问，因此要比较实际权限，而不是文件名是否写着“私密”。支持表单题明确排除密码与验证码，反馈应描述错误与时间，省去凭据及无关敏感内容。这些是题内虚构制度，不能据此声称所有公司、学校或平台采用同一流程。",
        "en": "The payroll-file item explicitly restricts access to authorised recipients, so compare permissions rather than whether the filename says “private”. The support-form item explicitly excludes passwords and verification codes: describe the error and time without credentials or irrelevant sensitive material. These are fictional policies within the questions, not claims that every company, school or platform uses the same procedure."
      },
      {
        "zh": "公开可选字段题比较的是披露多少：不需要填写的公开私人细节可以不填。找回问题若答案已在公开资料中，就可能被不认识你的人查到。 披露目的、实际受众、访问权限和恢复方式应分别核对；把资料写全、改成大写或稍后再删，并不自动解决保密问题。",
        "en": "The optional public-field item compares disclosure: unnecessary personal details need not be supplied. A recovery answer already on a public profile may be discoverable by someone who does not know you. Check purpose, audience, permissions and recovery arrangements separately. Filling every field, changing letter case or deleting later does not automatically resolve confidentiality."
      }
    ]
  },
  {
    "id": "cyber-response",
    "title": {
      "zh": "事件响应：报告、凭据处理与设备核查分别推进",
      "en": "Incident response: distinguish reporting, credentials and device checks"
    },
    "paragraphs": [
      {
        "zh": "在可疑页面输入过密码，即使真实账户仍能登录，也不能据此认为凭据没有暴露。按真实服务的安全与恢复说明处理，并留意其他复用账户。[5] 若怀疑下载了有害软件，FTC建议更新可信安全软件、扫描并处理发现的问题。[1] 一次扫描或关闭附件，都不能为所有情境提供安全保证。",
        "en": "Entering a password into a suspicious page can expose it even if the real account still accepts your login. Follow the actual service’s security and recovery instructions and consider accounts reusing the credential.[5] For a suspected harmful download, FTC guidance recommends updating trusted security software, scanning and addressing detected problems.[1] Neither one scan nor closing an attachment guarantees safety in every situation."
      },
      {
        "zh": "本卷工作账户题给出立即向既定联系人报告、但不发送密码的明确规则。报告疑似情况不需要先把所有细节证明完；同时，报告本身不会重置密码、撤销会话或收回已发出的资料。真实事件应按所属组织与服务方既定流程处理，本页不提供替代响应程序，也不要求把事故资料或秘密发到测验中。",
        "en": "The work-account item explicitly requires reporting through an established contact without passwords. Reporting a suspicion need not wait for proof of every detail, while a report itself neither resets credentials, revokes sessions nor retrieves disclosed data. Follow established organisational and service-provider procedures for an actual event. This page supplies no replacement incident procedure and requests no incident records or secrets."
      }
    ]
  },
  {
    "id": "cyber-score",
    "title": {
      "zh": "20题怎样计分？五项小计、全部答案和复习指南",
      "en": "How are twenty items scored? Five subtotals, every answer and all revision guides"
    },
    "paragraphs": [
      {
        "zh": "每题答对记1，答错记0；五项各0—4题，总计0—20题，没有权重、反向、速度奖励或部分分。按钓鱼、账户、设备、分享、响应顺序，2、4、0、1、3合计10／20。3／4只表示该组四题答对三题，不是安全等级、漏洞数量、通过概率或人群百分位。",
        "en": "A correct selection counts one and an incorrect selection zero. Each of five subtotals ranges from zero to four and the total from zero to twenty, without weighting, reversal, speed bonus or partial credit. In phishing, accounts, devices, sharing and response order, 2, 4, 0, 1, 3 sum to 10/20. Three of four means three correct in that group, not a security level, vulnerability count, pass probability or percentile."
      },
      {
        "zh": "完成20题后，每题显示你的选择、正确答案与解析，五份各五节的复习指南全部开放，共25节，不按最高分或是否满分限制阅读。若两组同分，不需要加赛或分型；知识题本不使用角色测试的“最高并列结果”规则。尚未答完时不把缺答算错或填入默认答案。",
        "en": "After all twenty items, each shows your choice, key and explanation. All five five-section revision guides remain open—twenty-five sections—regardless of the highest subtotal or a perfect score. Equal subtotals require no runoff or type assignment; this knowledge bank does not use a character quiz’s highest-tie rule. Missing responses are not marked wrong or filled with defaults."
      }
    ]
  },
  {
    "id": "cyber-review-sources",
    "title": {
      "zh": "怎样复习？从答案依据到真实使用条件",
      "en": "How should you review? From an answer’s basis to real conditions"
    },
    "paragraphs": [
      {
        "zh": "可以选一道错题，分别指出消息声称什么、可信渠道来自哪里、哪些条件是题目给定的，再写一个条件改变后需要重新判断的例子。比如文件收件人从获授权人员改为公开链接，判断依据应是权限变化。复习强调读懂理由，不是记住选项字母；重做同一题库提高可能只是记忆或熟悉，并未证明防骗效果提高。",
        "en": "For an error, identify what the message claims, where the trusted channel comes from and which conditions the item supplies; then change a condition and reconsider. If a file moves from authorised recipients to a public link, permissions change the judgement. Review the reason rather than the option letter. A higher retake score may reflect memory or familiarity and does not establish improved resistance to scams."
      },
      {
        "zh": "五条FTC资料支持有限的消费者安全原则，不为本题本背书；团队规则和选项由费马独立编写。答案一致性核查不同于建立测量效度，本卷尚无信度、常模、招聘通过线或中英文测量等价证据。FTC面向美国的报送渠道也不是全球通用渠道，真实支持与报告应核对当地及相关机构的正式说明。",
        "en": "Five FTC references support limited consumer-security principles, not endorsement of this bank. FermatMind independently authored the options and fictional policies. Checking answer consistency differs from establishing measurement validity; form-specific reliability, norms, hiring cutoffs and English–Chinese measurement equivalence are unestablished. US reporting destinations in FTC material are not worldwide channels; use official local and affected-provider instructions."
      },
      {
        "zh": "约7分钟为阅读估计，没有倒计时。20题、全部解析与五份指南免费，点击开始直接作答，不输入真实密码或验证码。答案在浏览器计分；只有主动保存才建立本标签页24小时草稿，完成、清除或重测即删除。分享公开测试链接，不包含答卷或答对数；本页不会连接账户检查当前设置。",
        "en": "About seven minutes is a reading estimate without a countdown. Twenty items, explanations and five guides are free, and Start opens questions directly without real passwords or codes. Answers are scored in the browser; explicit saving creates a twenty-four-hour tab draft, cleared on completion, clearing or retake. Sharing includes a public test link, not answers or counts. No account is connected to inspect current settings."
      }
    ]
  }
];

export const cybersecurityLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "题目是网络安全知识题，还是扫描我的设备？",
      "en": "Are these knowledge questions or a scan of my device?"
    },
    "answer": {
      "zh": "是20道知识情境题，只核对给定条件下的行动选择，不扫描设备、不连接账户，也不要求输入真实凭据。",
      "en": "These are twenty knowledge scenarios checking choices under stated conditions, without device scans, account connections or real credentials."
    }
  },
  {
    "question": {
      "zh": "独立核实为什么不能只回复同一封邮件？",
      "en": "Why is replying to the same email not independent verification?"
    },
    "answer": {
      "zh": "回复仍依赖原消息的联系路径；本卷要求使用原本已知可信的应用、网站、电话或联系人渠道核对请求。",
      "en": "A reply still relies on the original message’s contact route. This bank instead uses an independently trusted app, site, number or established contact to check the request."
    }
  },
  {
    "question": {
      "zh": "密码加另一个找回问题就算两个认证因素吗？",
      "en": "Do a password and another recovery question make two factors?"
    },
    "answer": {
      "zh": "不能仅按问题数量计算。两者都属于知道的信息；本卷的两类组合例子是密码加已登记安全密钥。",
      "en": "Counting questions is insufficient. Both are knowledge factors; this bank’s two-category example is a password plus a registered security key."
    }
  },
  {
    "question": {
      "zh": "验证码会过期，为什么仍不能告诉意外来电者？",
      "en": "Why not give an unexpected caller a code that will expire?"
    },
    "answer": {
      "zh": "有效期内它仍可能用于账户核验。不要因对方自称客服或反诈人员就提供，应通过自己的可信渠道联系服务方。",
      "en": "While valid, it may still authorise access. A claim to be support or fraud prevention does not establish trust; contact the service through your own trusted route."
    }
  },
  {
    "question": {
      "zh": "文件叫“私密”就满足授权分享要求吗？",
      "en": "Does naming a file “private” meet an authorised-sharing rule?"
    },
    "answer": {
      "zh": "不满足。题目比较实际可访问的收件人和权限，文件名不能代替访问控制。",
      "en": "No. The item concerns who can actually access it and their permissions; a filename does not provide access control."
    }
  },
  {
    "question": {
      "zh": "五项2、4、0、1、3会得到什么结果？",
      "en": "What result follows subtotals of 2, 4, 0, 1 and 3?"
    },
    "answer": {
      "zh": "总计10／20，保留五项答对数、全部20题的选择与解析，以及五份各五节指南，不生成安全等级。",
      "en": "The total is 10/20, retaining all five subtotals, selections and explanations for twenty items and five five-section guides, without a security grade."
    }
  },
  {
    "question": {
      "zh": "需要在7分钟内完成，或者达到某个通过分数吗？",
      "en": "Must I finish in seven minutes or reach a pass mark?"
    },
    "answer": {
      "zh": "不需要。预计用时不是限制，本卷没有计时、招聘通过线或认证分数。",
      "en": "No. The estimate is not a limit. This bank has no timer, hiring cutoff or certification score."
    }
  },
  {
    "question": {
      "zh": "这份测试覆盖专业渗透测试、所有攻击和安全标准吗？",
      "en": "Does this cover penetration testing, every attack or every security standard?"
    },
    "answer": {
      "zh": "没有。范围是五类日常知识选择，不提供实操攻防、全面风险评估或标准合规审查。",
      "en": "No. Its scope is five groups of everyday knowledge choices, not practical offensive/defensive work, comprehensive risk assessment or a compliance review."
    }
  },
  {
    "question": {
      "zh": "点击开始后还要同意、填邮箱或付费吗？",
      "en": "Must I agree again, enter an email or pay after starting?"
    },
    "answer": {
      "zh": "不需要。开始直接进入20题，完整答案与指南免费，无需额外同意、邮箱、注册或前置测评。",
      "en": "No. Start opens twenty questions directly. All answers and guides are free without another agreement, email, signup or prerequisite assessment."
    }
  }
];
