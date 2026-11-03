import type { Questionnaire } from "@/lib/questionnaires/types";

export const wordSkillsLandingSections: Questionnaire["guide"] = [
  {
    "id": "word-context",
    "title": {
      "zh": "Word技能测试练什么？从文档目标选择操作",
      "en": "What does this Word Skills Test practise? Choose an operation for the document goal"
    },
    "paragraphs": [
      {
        "zh": "本页是Windows桌面版Microsoft 365 Word的25道原创知识情境题。五组各五题分别覆盖段落与格式、样式与结构、分节与表格、域与邮件合并、审阅与模板。题目会限定光标位置、所选对象或文档状态，再问哪项操作符合要求；无需在浏览器中编辑或上传Word文件。",
        "en": "This page provides twenty-five original knowledge scenarios for Word for Microsoft 365 desktop on Windows. Five groups of five cover paragraphs and formatting, styles and structure, sections and tables, fields and mail merge, and review and templates. Items specify a cursor location, selected object or document state before asking which operation fits. No Word document is edited or uploaded in the browser."
      },
      {
        "zh": "菜单位置或快捷键要连着操作对象理解：同一个文档可以含正文、表格、文本框、页眉及不同的节。官方帮助明确说明Windows导航窗格有位置范围，不能把相同标题外观当作处处相同行为。[3] Mac、网页和移动版也不自动适用本题Windows规则。",
        "en": "Read menu commands and shortcuts together with their target. A document may contain body text, tables, text boxes, headers and multiple sections. Microsoft specifies location limits for the Windows Navigation pane; identical-looking titles need not behave identically everywhere.[3] Do not automatically apply these Windows scenarios to Mac, web or mobile editions."
      }
    ]
  },
  {
    "id": "word-paragraphs",
    "title": {
      "zh": "段落与格式：诊断空白，再选择正确关系",
      "en": "Paragraphs and formatting: inspect spacing before choosing a relationship"
    },
    "paragraphs": [
      {
        "zh": "段后间距、空段落和手动分页不是同一个对象。遇到异常空白，可先显示编辑标记，辨认段落、制表符及断开位置，再处理。分页选项里，与下段同页描述相邻段落关系；段中不分页描述一个段落内部各行的关系。[1] 选择前先说清“哪些文字需要保持在一起”。",
        "en": "Paragraph spacing, empty paragraphs and manual page breaks are different objects. Inspect formatting marks to locate paragraphs, tabs and breaks before changing unexpected gaps. Keep with next relates adjacent paragraphs, while Keep lines together concerns lines within one paragraph.[1] First identify which text needs to remain together."
      },
      {
        "zh": "独立新练习：自写“设备借还说明”及两段正文，在标题接近页底时预测它与第一段应怎样分页。若要求标题跟随下一段，检查标题上的与下段同页；若要求多行说明不被拆散，检查那段本身的段中不分页。再增加正文观察变化，不把一次静态排版当作所有页面条件下的保证。",
        "en": "Fresh optional exercise: write an Equipment Loan notice with a heading and two paragraphs. Near a page boundary, predict how the heading and first paragraph should stay together. Inspect Keep with next on the heading for that relationship; inspect Keep lines together on a multiline paragraph to keep its own lines together. Add more text and observe, rather than treating a static layout as a guarantee under every page constraint."
      }
    ]
  },
  {
    "id": "word-styles",
    "title": {
      "zh": "样式、导航与目录：把外观变成可维护的结构",
      "en": "Styles, navigation and contents: make structure maintainable"
    },
    "paragraphs": [
      {
        "zh": "样式统一一组格式，修改样式与局部改变一个字符的字体不同；实际结果仍要检查直接格式覆盖。[2] 标题样式还承担结构角色：自动目录依据文档标题建立，Windows导航窗格显示正文标题，却不显示表格、文本框及页眉页脚里的标题。[3][4] 标题是否可导航，不能只看字号或加粗。",
        "en": "Styles collect formatting choices; changing a style differs from changing one character locally, and direct overrides still need inspection.[2] Heading styles also carry structure. Automatic contents use document headings, while the Windows Navigation pane excludes headings in tables, text boxes, headers and footers.[3][4] Font size or bold alone does not determine navigability."
      },
      {
        "zh": "独立新练习：在短手册中建立两个一级标题和三个二级标题，正文外再放一个文本框标题。先列出预期导航条目，再核实际窗格。新增正文二级标题后，要让目录加入新条目，应更新整个目录。章节编号使用关联内置标题样式的多级列表，手打“1.1”只创建文字。[5]",
        "en": "Fresh optional exercise: create two first-level headings and three second-level headings in a short handbook, plus a title in a text box. Predict the Navigation entries before checking them. After adding a body subheading, update the entire contents table to include the new entry. Use a multilevel list linked to built-in heading styles for chapter numbering; typing 1.1 creates text alone.[5]"
      }
    ]
  },
  {
    "id": "word-sections",
    "title": {
      "zh": "分节、页码与页眉：分别检查作用范围",
      "en": "Sections, page numbers and headers: inspect each scope separately"
    },
    "paragraphs": [
      {
        "zh": "文档中可有不同节；题本会先提供已存在的节边界，再问页面方向或页码的作用范围。页码起始值、页眉文字、页脚以及链接到前一节是不同控制点。若只想改变第2节普通页眉，应在实际编辑的那个页眉中处理链接，而不是认为断开页脚会同时断开页眉。",
        "en": "Sections can have different settings. The bank supplies existing section boundaries before asking about orientation or numbering scope. Numbering starts, header text, footers and Link to Previous are separate controls. For a distinct regular header in Section 2, address the actual header being edited rather than assuming that unlinking its footer also unlinks it."
      },
      {
        "zh": "独立新练习：制作“正文”与“附录”两个已有节的练习副本。预先写下目标：正文纵向、附录横向；附录页码从1开始，普通页眉写“资料表”。分别检查方向的应用范围、页码起点和该页眉的链接，最后检查边界两侧。网站只说明此练法，没有实际运行文档或替你确认其输出。",
        "en": "Fresh optional exercise: use an original practice copy with existing Body and Appendix sections. State the targets first: portrait body, landscape appendix, appendix numbering starting at one and a regular header reading Data Tables. Check orientation scope, numbering start and that header link separately, then inspect both sides of the boundary. The website describes this exercise without running a document or confirming its output."
      }
    ]
  },
  {
    "id": "word-tables",
    "title": {
      "zh": "跨页表格：重复表头与整行同页分别设置",
      "en": "Multipage tables: separate repeated headers from row splitting"
    },
    "paragraphs": [
      {
        "zh": "重复标题行的选择必须包含表格第一行，重复效果在打印布局或打印时查看；它适用于自动分页，表内手动分页不按这一机制重复表头。[6] 允许跨页断行则控制一行内容能否在分页处断开，是另一个属性。[7] 不能用重复表头代替正文行的断行设置。",
        "en": "A repeated-header selection must include the first table row. Inspect repeats in Print Layout or printing; the mechanism applies to automatic page breaks, not a manual break inserted inside the table.[6] Allow row to break across pages separately controls splitting a row at pagination.[7] Header repetition does not replace the body-row setting."
      },
      {
        "zh": "独立新练习：建一个首行为“物品、数量、备注”的表格，用虚构行使它自然跨页。先预测表头会在哪里出现；再选一条本身能放进一页的正文行，分别观察允许与不允许断行。行高超过一页是不同约束，不能用本练习的短行条件作普遍承诺。重复处的表头应回到首处修改。[6]",
        "en": "Fresh optional exercise: make an Item, Quantity, Notes table with invented rows extending naturally across pages. Predict where headers should recur. Then compare splitting enabled and disabled for a body row small enough to fit on one page. A row taller than a page introduces another constraint; the short-row condition is not a universal promise. Edit repeated headers at their first occurrence.[6]"
      }
    ]
  },
  {
    "id": "word-merge",
    "title": {
      "zh": "域与邮件合并：追踪源、字段、记录和预览",
      "en": "Fields and mail merge: trace sources, fields, records and previews"
    },
    "paragraphs": [
      {
        "zh": "简单Excel合并源以命名列提供字段，同一收件人的值在同一数据行。Word中的合并域应从连接的数据源插入，手打类似«City»的普通文字不等于创建了合并域。纳入复选框控制本次参与记录，清除它与永久删除源行不同。[8] 本页不需要连接名单或发送信函。",
        "en": "A simple Excel merge source uses named columns for fields and a data row for each recipient. Insert a connected merge field rather than typing ordinary text resembling «City». Recipient inclusion controls the current selection; clearing it differs from deleting a source row.[8] No mailing list connection or letter sending is needed here."
      },
      {
        "zh": "独立新练习：使用GivenName、Room两列和四名虚构收件人，插入真实域后预览不同长度的值，再排除其中一人。源中仍保留四行，当前选择只有三人；用上一条和下一条记录核对，不只看第一封。[9] 所选未锁定正文域的更新与显示域代码也不同，不能把Alt+F9显示切换当作F9更新。",
        "en": "Fresh optional exercise: use GivenName and Room columns for four fictional recipients. Insert actual fields, preview values of different lengths and exclude one recipient. Four source rows remain while three recipients are selected. Use Previous and Next Record to check beyond the first letter.[9] Updating a selected unlocked body field also differs from showing its code: Alt+F9 display toggling is not an F9 update."
      }
    ]
  },
  {
    "id": "word-review",
    "title": {
      "zh": "审阅与模板：区分隐藏、停止记录与作出决定",
      "en": "Review and templates: distinguish hiding, stopping recording and deciding"
    },
    "paragraphs": [
      {
        "zh": "无标记改变修订显示，关闭修订停止记录后续改动；二者都不自动接受或拒绝已有改动。删除修订被拒绝时恢复原文字，被接受时保留删除结果。[10] 多名审阅者副本可用合并归并，但归并后仍须检查并处理建议。[11] 外观像定稿不证明审阅已完成。",
        "en": "No Markup changes visibility and turning tracking off stops recording later edits. Neither automatically accepts or rejects existing changes. Rejecting a tracked deletion restores text; accepting it keeps the removal.[10] Combine consolidates reviewer copies, after which suggestions still need review.[11] A final-looking display does not establish completed review."
      },
      {
        "zh": "独立新练习：在原创新通知里跟踪删除一句“周三交回”，先预测拒绝与接受的两种结果，再在不同副本核对。若另存可复用、无宏模板，区分.dotx与启用宏的.dotm；模板是新文档起点，不自动更新所有旧文件或保证格式永不改变。[12] 这只是可选本地练法，不把点击答案称作实操。",
        "en": "Fresh optional exercise: track deletion of Return on Wednesday in an original notice. Predict acceptance and rejection outcomes before checking separate copies. For a reusable macro-free template, distinguish .dotx from macro-enabled .dotm. A template is a starting point, not an automatic update of all existing documents or a guarantee against formatting changes.[12] This optional local activity is separate from selecting online answers."
      }
    ]
  },
  {
    "id": "word-results",
    "title": {
      "zh": "25题结果怎样读？五组正确数与五份完整指南",
      "en": "How should I read twenty-five results? Five counts and five complete guides"
    },
    "paragraphs": [
      {
        "zh": "每个匹配答案记1，其他有效选择记0；五组各0–5，总数0–25。所有题有效作答后才显示完整结果，没有计时、速度奖励或部分分。零分、部分答对和全对均能查看25题所选、答案与解析，以及五篇各七节、共35节完整指南；指南在作答前也可公开阅读。",
        "en": "Each keyed response scores one and another valid response zero: five counts from zero to five and a total from zero to twenty-five. Complete all valid responses for results, without a timer, speed bonus or partial credit. Zero, partial and perfect attempts all open twenty-five selections, keys and explanations plus five full seven-section guides totaling thirty-five sections. Public guides are readable beforehand."
      },
      {
        "zh": "某组3/5只表示这五道题答对三道，不是熟练度60%或超过60%的人。相同总数可能遗漏不同条件，阅读、术语熟悉度和查资料也可能影响表现。复习时指出具体误差：对象选错、作用范围扩大、外观与结构混淆，还是把预览当作完成。",
        "en": "Three of five describes three correct responses here, not sixty-percent proficiency or a population rank. Equal totals may conceal different missed conditions, and reading, terminology or references may affect performance. Identify the actual mismatch: wrong object, broader scope, appearance confused with structure or preview mistaken for completion."
      }
    ]
  },
  {
    "id": "word-transfer",
    "title": {
      "zh": "怎样继续练习？用新文档检验操作与结果",
      "en": "How can I continue practising? Check actions and outcomes in a new document"
    },
    "paragraphs": [
      {
        "zh": "可以把一次错题转成小任务，先写预期效果，再在自己的虚构副本中执行并检查结果。例如改标题文字后核目录条目，或排除一条虚构收件人后核选择范围。不要直接改重要原件来验证猜测，也不需要向本站上传材料。知识题选择与实际制作文件提供的是不同证据。",
        "en": "Turn a missed item into a small task: predict the effect, perform it in an original fictional copy and inspect the result. Rename a heading and check its contents entry, or exclude a fictional recipient and check the selection. Avoid testing guesses on an important original; no upload is needed. Knowledge choices and producing an actual file provide different evidence."
      },
      {
        "zh": "微软帮助支持具体命令与条件，不构成对本站题本的背书或效度验证。本固定题组不提供MOS、Tosa或招聘考试的分数换算，也不认定专业资格。看过解析后重测同题可能含记忆影响；可换文字、位置或记录检查是否理解关系，中英文亦无经验证的分数等值。",
        "en": "Microsoft documentation supports particular commands and conditions, not endorsement or measurement validation of this bank. This fixed set does not convert to MOS, Tosa or hiring scores or establish a qualification. Familiar retakes may involve memory. Vary text, location or records to examine understanding; English and Chinese scores have no validated equating."
      }
    ]
  }
];

export const wordSkillsLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "标题加粗放大后，为什么未出现在导航窗格？",
      "en": "Why might a large bold title be absent from Navigation?"
    },
    "answer": {
      "zh": "先核是否应用标题样式，再核位置。Windows导航窗格不列出表格、文本框、页眉和页脚里的标题；外观醒目不能代替这些条件。[3]",
      "en": "Check the applied heading style and location. Windows Navigation excludes headings in tables, text boxes, headers and footers; visual prominence does not replace these conditions.[3]"
    }
  },
  {
    "question": {
      "zh": "自动目录新增标题后，只更新页码够吗？",
      "en": "Are page-number updates enough after adding a heading?"
    },
    "answer": {
      "zh": "若需要加入新条目，应更新整个目录，再核标题与页码。只更新页码用于已有条目的页码变化，不能替代新条目更新。",
      "en": "Update the entire table to add the new entry and inspect its text and page number. Updating page numbers alone addresses existing entries rather than adding headings."
    }
  },
  {
    "question": {
      "zh": "重复标题行为什么在手动分页处没有重复？",
      "en": "Why might a header not repeat after a manual break?"
    },
    "answer": {
      "zh": "官方规则区分自动跨页与表内手动分页。还要核表头选择包含第一行，并在打印布局或打印中查看效果。[6]",
      "en": "The documented mechanism distinguishes automatic page breaks from a manual break inside the table. Also check that the selection includes the first row and inspect Print Layout or printing.[6]"
    }
  },
  {
    "question": {
      "zh": "断开页脚链接，会同时断开页眉吗？",
      "en": "Does unlinking a footer also unlink the header?"
    },
    "answer": {
      "zh": "页眉与页脚分别链接。应进入实际需要独立的页眉或页脚检查；首页及奇偶页变体还可能进一步区分对象。",
      "en": "Headers and footers link separately. Inspect the actual header or footer that should be independent; first-page and odd/even variants may introduce further distinctions."
    }
  },
  {
    "question": {
      "zh": "手打«City»能作为邮件合并域吗？",
      "en": "Does typing «City» create a merge field?"
    },
    "answer": {
      "zh": "普通文字可以外观相似，但没有创建关联字段。应连接数据源并插入实际合并域，再用多条虚构记录预览。[8][9]",
      "en": "A typed lookalike is ordinary text, not a connected field. Insert the actual field from the source and preview several fictional records.[8][9]"
    }
  },
  {
    "question": {
      "zh": "无标记与关闭修订，哪一个会接受已有改动？",
      "en": "Does No Markup or turning tracking off accept existing changes?"
    },
    "answer": {
      "zh": "两者都不会自动接受。前者改变显示，后者停止记录后续改动；已有修订仍需明确接受或拒绝。[10]",
      "en": "Neither automatically accepts them. One changes display, the other stops recording later changes; existing revisions still need acceptance or rejection.[10]"
    }
  },
  {
    "question": {
      "zh": "可以把25题分数换成MOS或Tosa成绩吗？",
      "en": "Can the count convert to MOS or Tosa results?"
    },
    "answer": {
      "zh": "不能。题型、范围、版本条件、监考和评分不同，本题也没有对应链接或等值研究。应按目标考试自身要求准备。",
      "en": "No. Formats, scope, version conditions, supervision and scoring differ, without a linking or equating study for this bank. Prepare using the target examination requirements."
    }
  },
  {
    "question": {
      "zh": "看过解析后全对，是否证明能独立完成真实文档？",
      "en": "Does a perfect familiar retake prove independent document performance?"
    },
    "answer": {
      "zh": "不能仅凭同题正确数判断。可换一份虚构文档，先预测再执行与核查；实际操作结果和本页知识选择应分别看待。",
      "en": "A familiar-bank count alone cannot establish that. Use a fresh fictional document to predict, act and inspect. Actual document output and online knowledge choices are different evidence."
    }
  }
];
