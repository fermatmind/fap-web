import type { Questionnaire } from "@/lib/questionnaires/types";

export const computerLiteracyLandingSections: Questionnaire["guide"] = [
  {
    "id": "computer-task-scope",
    "title": {
      "zh": "计算机素养练什么？四类任务与可核对的操作结果",
      "en": "What does computer literacy practice cover? Four tasks and checkable outcomes"
    },
    "paragraphs": [
      {
        "zh": "本页的24题把日常电脑知识放进具体任务：找对文件、区分复制与移动、判断浏览器保存了什么、核对邮件对象，以及理解表格和文档的基础结构。题目不是询问“你有多熟练”，而是要求选择符合题设的一个答案；“知道这个功能”和“已经在软件中完成”应分别观察。",
        "en": "The twenty-four items place everyday computer knowledge in tasks: locating the right file, distinguishing copy from move, identifying what a browser retains, checking message recipients and understanding basic spreadsheet and document structure. Rather than rating your own proficiency, choose the one answer supported by the task. Recognising a feature and completing an operation in software are separate observations."
      },
      {
        "zh": "这四组是本题组的内容划分，不是计算机素养的全部领域。硬件装配、网络排障、编程、演示文稿、辅助技术和复杂协作流程没有在此完整施测。可以用具体错题决定下一步练什么；若需要在某种软件中完成任务，仍应在该软件及相应版本里实际检查。",
        "en": "These groups organise this bank, not the whole field of computer literacy. Hardware assembly, network troubleshooting, programming, presentations, assistive technology and complex collaboration are not comprehensively assessed. Use particular errors to choose what to practise next; a task required in a particular application still needs checking in that application and version."
      }
    ]
  },
  {
    "id": "computer-file-identity",
    "title": {
      "zh": "文件管理：路径、格式与版本分别核对",
      "en": "File management: check location, format and version separately"
    },
    "paragraphs": [
      {
        "zh": "新例中，Practice/Review/brief-v5.docx与Practice/Archive/brief-v5.docx文件名相同，但位置不同。任务指定Review时，应同时核文件夹、版本和扩展名，再决定复制还是移动。按修改时间排序只提供时间顺序；一个文件改得更晚，并不能由此确认它已经审阅、获批或内容更准确。文件资源管理器支持按名称或修改日期等字段排序和限定位置搜索。[3]",
        "en": "In a fresh example, Practice/Review/brief-v5.docx and Practice/Archive/brief-v5.docx share a filename but have different locations. A request for Review requires checking folder, version and extension before choosing copy or move. Modification-time order does not itself establish review, approval or accuracy. File Explorer supports fields such as name or modification date and location-scoped search.[3]"
      },
      {
        "zh": "扩展名提示应用和文件格式，不能代替检查内容。把图像名称的.png改为.pdf，不会将底层图像转换成PDF；Microsoft也明确区分改名与格式转换。[2] 可先用无风险样本完成真正导出，再检查产物是否能打开、内容是否完整。文件名出现final或日期较新，也不应成为绕过任务要求的理由。",
        "en": "Extensions suggest applications and formats rather than verify contents. Renaming an image from .png to .pdf does not convert its underlying format; Microsoft explicitly distinguishes renaming from conversion.[2] With a disposable sample, use a real export operation and inspect whether the output opens and contains what was intended. Neither final in a name nor a recent date replaces the task’s requirements."
      }
    ]
  },
  {
    "id": "computer-browser-state",
    "title": {
      "zh": "浏览器：网页、地址、下载记录和文件不是同一份东西",
      "en": "Browsers: pages, addresses, download records and files are different objects"
    },
    "paragraphs": [
      {
        "zh": "Windows桌面Chrome的Ctrl+F查当前页文字，不是搜索整个互联网。[4] 书签保存返回某个地址的入口；另开标签便于保留原页作比较。[5] 这些动作都没有建立页面永久可用、内容可信或离线副本。可用一个公开样本页练“页内定位—另页比较—返回地址”，再分别说明每一步保留了什么。",
        "en": "In desktop Chrome on Windows, Ctrl+F finds text on the current page rather than searching the whole web.[4] A bookmark provides a return route to an address; another tab helps keep the first page available for comparison.[5] Neither action establishes permanent availability, trustworthy content or an offline copy. On a public sample page, practise finding text, comparing another page and returning to an address, identifying what each step retains."
      },
      {
        "zh": "Chrome下载列表中的条目与磁盘文件是不同对象：从历史移除条目，文件仍可留在电脑；在文件夹中显示可帮助定位实际保存处，下载路径也可配置。[6] 无痕会话结束后，下载文件和书签仍可保留，网站与网络管理方也未因此失去观察活动的可能。[7] 复盘时先说清要管理的是哪一种记录，再选对应动作。",
        "en": "A Chrome download-history entry differs from the stored file: removing the entry can leave the file on the computer. Show in folder locates its saved destination, which is configurable.[6] Downloaded files and bookmarks can remain after an Incognito session, and sites or network operators may still observe activity.[7] Identify which record you intend to manage before choosing an action."
      }
    ]
  },
  {
    "id": "computer-email-outcomes",
    "title": {
      "zh": "邮件：收件范围、附件与消息状态分开检查",
      "en": "Email: check recipients, attachments and message state separately"
    },
    "paragraphs": [
      {
        "zh": "设另一封虚构邮件由Mika发出，To为你和Ren、Cc为Sol，无密送且未改名单；按题定通常全部回复行为，回复对象是Mika、Ren与Sol。真正发送前仍要看待发字段和附件，别把“全部”理解为整本通讯录。密送只隐藏本封其他收件人所见的密送姓名，不等于防转发、文件加密或发送授权。[8]",
        "en": "Suppose another fictional message is from Mika, addressed to you and Ren with Sol in Cc, no Bcc and no recipient edits. Under the stipulated usual reply-all rule, it addresses Mika, Ren and Sol. Inspect outgoing fields and attachments before real sending; all does not mean the entire address book. Bcc hides those names from other recipients of that message, not forwarding, encryption or authorisation.[8]"
      },
      {
        "zh": "Outlook.com回复默认不包含原附件，转发则默认带原消息和附件，发送前可以编辑或移除。[8] 因此“原信有附件”和“本次待发有附件”需要分别核对。题中的草稿标签按明示虚构规则判断；现实邮箱还可能有延迟发送等状态，不能仅把某个文件夹标签当成已送达、已读或已同意的证据。",
        "en": "Outlook.com replies omit original attachments by default; forwarding includes the original message and attachments, which can be edited or removed before sending.[8] An original attachment and an outgoing attachment therefore require separate checks. The bank’s draft-label task follows its explicit fictional rule. Real mail systems can have scheduled-send states, so a folder label alone does not prove delivery, reading or agreement."
      }
    ]
  },
  {
    "id": "computer-office-values",
    "title": {
      "zh": "电子表格：数值、显示格式和公式引用",
      "en": "Spreadsheets: values, display formats and formula references"
    },
    "paragraphs": [
      {
        "zh": "用新数据核对：若B2、B3、B4分别存数值6、9、5，=SUM(B2:B4)合计20；区间两端都包含。[9] 若D7为=C7*$J$2，向下复制到D8后应为=C8*$J$2：相对行随复制位置改变，绝对行列保持固定。[10] 先检查引用对象再看结果，避免把公式外观相似误当成引用正确；移动、插行和复制是不同操作。",
        "en": "For a fresh check, numeric B2, B3 and B4 values of 6, 9 and 5 give 20 with =SUM(B2:B4), including both endpoints.[9] Copying D7’s =C7*$J$2 down to D8 gives =C8*$J$2: the relative row adjusts while the absolute row and column stay fixed.[10] Inspect referenced cells before trusting the result; similar-looking formulas can refer to different inputs. Moving, inserting and copying are different operations."
      },
      {
        "zh": "另将已经存入的数值0.35设置为百分比并保留零位小数，显示35%，底层值仍为0.35。[12] 这不同于先设百分比格式再输入数字，也不能由显示整齐推断计算正确。复习时分别记录输入值、公式和显示格式，再用一个可手算的小例子检验；这只是所给条件下的计算，不是现场工作簿审计。",
        "en": "Formatting the already stored numeric value 0.35 as a percentage with zero decimal places displays 35%, while retaining 0.35 as its value.[12] This differs from entering a number into a preformatted percentage cell, and a neat display does not establish correct calculation. Record value, formula and display format separately and check a small hand-calculable example. That checks the stated conditions rather than auditing a live workbook."
      }
    ]
  },
  {
    "id": "computer-office-structure",
    "title": {
      "zh": "文档与数据结构：标题、筛选和整行排序",
      "en": "Document and data structure: headings, filters and complete-row sorting"
    },
    "paragraphs": [
      {
        "zh": "Word标题样式为文本提供结构，可支持目录、重组和统一格式；仅把字放大或加粗，未必得到同样的标题角色。[11] 本题选择标题2，是为相应小节赋予二级结构，并非保证整篇文档已经无障碍。实际练习可先写逻辑层级，再检查导航和目录，最后调整视觉样式。",
        "en": "Word heading styles provide structure supporting contents, reorganisation and consistent formatting; enlarging or bolding text alone need not provide the same role.[11] Choosing Heading 2 assigns a second-level section rather than establishing complete document accessibility. In practice, set out the logical hierarchy, inspect navigation and contents, then adjust its visual style."
      },
      {
        "zh": "另设完整记录(M,数量4)、(N,数量9)、(P,数量2)，按数量升序整行排序得到P–2、M–4、N–9，标识始终与自己的值绑定。普通自动筛选则把不合条件的整行隐藏，而非删除。[13][14] 排序改变顺序，筛选改变可见范围；核对时既要检查显示了谁，也要确认记录关系没有被只排一列破坏。",
        "en": "With new complete records (M, quantity4), (N, quantity9) and (P, quantity2), ascending whole-row sorting gives P–2, M–4, N–9, preserving each identifier’s value. Ordinary AutoFilter hides entire rows failing its condition rather than deleting them.[13][14] Sorting changes order; filtering changes visibility. Check both which rows are displayed and whether sorting only a column has broken record relationships."
      }
    ]
  },
  {
    "id": "computer-count-meaning",
    "title": {
      "zh": "24题怎样计分？看分项，也看具体错误",
      "en": "How are the twenty-four items scored? Sections and specific errors"
    },
    "paragraphs": [
      {
        "zh": "每题与答案一致记1题，否则记0题；四组各六题，总正确数为0至24。新算例：文件5/6、浏览器2/6、邮件4/6、Office3/6，合计14/24。另一份回答可能同为14/24却把错题集中在别组，因此总数不能替代逐题解析，也不自动定义一个固定的“电脑水平”。",
        "en": "Each answer matching its key counts one, otherwise zero; four six-item groups total zero to twenty-four. A fresh example of files5/6, browser2/6, email4/6 and Office3/6 totals14/24. Another attempt can reach fourteen with errors elsewhere, so the total cannot replace item review or define a fixed computer-proficiency level."
      },
      {
        "zh": "全部题目完成后才生成结果，缺答不被默认为错误；不限时，也不按速度奖励。零分、部分正确和全对均能阅读同样24题答案解析及四份完整指南。正确数是这次固定题组的观察，不是人群百分位或招聘线；若看过答案、使用工具或由他人帮助，解释时应保留这些作答条件。",
        "en": "Results require all items; missing answers are not silently marked wrong. There is no timer or speed reward. Zero, partial and perfect counts open the same twenty-four explanations and four full guides. Counts describe this attempt on a fixed bank, not population percentiles or hiring cutoffs. Retain whether you had seen keys, used tools or received help when interpreting them."
      }
    ]
  },
  {
    "id": "computer-review-evidence",
    "title": {
      "zh": "从识别到操作：用新任务验证理解",
      "en": "From recognition to operation: check understanding on a fresh task"
    },
    "paragraphs": [
      {
        "zh": "复习可按“目标—动作—结果—核对”记录：目标是保留原件时，动作选复制，随后查两处文件；目标是邮件带指定版本附件时，查看待发附件；目标是排序不破坏记录时，对照每个ID原来的值。用自有可丢弃样本和不发送的虚构草稿即可，不需要把真实文档或邮箱交给本站。",
        "en": "Review through goal, action, outcome and check: to retain an original, copy and inspect both locations; to include a specified attachment version, inspect the outgoing attachments; to preserve records when sorting, compare every identifier with its original value. Use disposable samples and unsent fictional drafts, without giving this site real documents or mailbox access."
      },
      {
        "zh": "当前产品帮助支持的是具体软件行为，不会自动验证本题组的测量质量。若要把分数用于人员比较或预测，需要相应版本、人群和用途的信度、效度及公平性证据。本页提供可核对题设、答案、解释和学习路径；它们帮助你找出待练任务，尚不能证明培训增益、跨语言等价或真实工作表现。",
        "en": "Current product help supports specific software behaviour rather than automatically validating this bank’s measurement quality. Comparing people or making predictions requires reliability, validity and fairness evidence for the version, population and use. This page supplies inspectable tasks, answers, explanations and review paths to identify further practice; these do not establish training gains, cross-language equivalence or real work performance."
      }
    ]
  }
];

export const computerLiteracyLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "开始测试需要先同意或注册吗？",
      "en": "Must I agree or register before starting?"
    },
    "answer": {
      "zh": "不需要。开始直接进入题目，匿名统计和草稿保存均为可选；不要求账户、邮箱、付款或先做别的测试。",
      "en": "No. Start opens the questions directly. Anonymous activity counting and draft saving are optional, without an account, email, payment or prior test."
    }
  },
  {
    "question": {
      "zh": "改文件扩展名为什么没有转换格式？",
      "en": "Why does renaming an extension not convert a format?"
    },
    "answer": {
      "zh": "改名只改变名称，不把文件内容重写成目标格式。需要转换时应使用相应导出或转换工具，再检查实际产物。[2]",
      "en": "Renaming changes the name without rewriting the contents into the target format. Use a suitable export or conversion operation, then inspect its actual output.[2]"
    }
  },
  {
    "question": {
      "zh": "修改日期最新的文件一定是正式版本吗？",
      "en": "Is the most recently modified file necessarily the approved version?"
    },
    "answer": {
      "zh": "不一定。修改日期说明时间顺序；正式版本还需按任务要求核目录、版本和批准记录，不能仅凭排序下结论。",
      "en": "No. Modification date orders timestamps. Check the location, version and approval record required by the task rather than inferring approval from sorting."
    }
  },
  {
    "question": {
      "zh": "书签为什么不等于离线保存？",
      "en": "Why is a bookmark different from an offline copy?"
    },
    "answer": {
      "zh": "书签帮助返回网址；原站可变化或不可用。若要离线阅读，需另行保存并在所需条件下核对保存内容。[5]",
      "en": "A bookmark returns to an address, whose site can change or become unavailable. Save separately for offline use and check what was retained under the intended conditions.[5]"
    }
  },
  {
    "question": {
      "zh": "删除Chrome下载历史后，文件还在吗？",
      "en": "Can a file remain after its Chrome download-history entry is removed?"
    },
    "answer": {
      "zh": "可以。移除下载历史条目不删除电脑上的文件；若要定位实际文件，可使用在文件夹中显示并检查保存位置。[6]",
      "en": "Yes. Removing the download-history entry does not delete the file on the computer. Show in folder and inspect its saved location to find the actual file.[6]"
    }
  },
  {
    "question": {
      "zh": "复制公式时，美元符号锁定什么？",
      "en": "What do dollar signs lock when copying a formula?"
    },
    "answer": {
      "zh": "$J$2锁定列J与行2；C7等未锁引用会随复制位置调整。这里判断的是复制，不能把同一结论无条件套到移动或插行。[10]",
      "en": "$J$2 fixes columnJ and row2; an unfixed reference such as C7 adjusts with the copy location. This concerns copying, not an unconditional rule for moving or inserting rows.[10]"
    }
  },
  {
    "question": {
      "zh": "筛选和排序为什么需要分别检查？",
      "en": "Why check filtering and sorting separately?"
    },
    "answer": {
      "zh": "筛选隐藏不合条件的记录，排序改变顺序；整行排序还要保持标识与数值绑定。看不到某行不证明已删除，数值已升序也不证明关联仍正确。[13][14]",
      "en": "Filtering hides rows failing conditions; sorting changes order. Whole-row sorting must preserve identifiers with their values. A missing visible row does not prove deletion, and sorted values alone do not establish intact relationships.[13][14]"
    }
  },
  {
    "question": {
      "zh": "同为14/24，为什么复习重点可以不同？",
      "en": "Why can two attempts scoring 14/24 need different review?"
    },
    "answer": {
      "zh": "总数相同不代表错题相同。应看四组正确数及逐题原因，再用新的文件、消息或表格样本练相关步骤，避免只记答案位置。",
      "en": "Equal totals can contain different wrong answers. Review the four section counts and item reasons, then practise the relevant steps with fresh files, messages or tables rather than memorising answer positions."
    }
  }
];
