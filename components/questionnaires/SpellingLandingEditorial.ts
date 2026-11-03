import type { Questionnaire } from "@/lib/questionnaires/types";

export const spellingLandingSections: Questionnaire["guide"] = [
  {
    "id": "spelling-recognition",
    "title": {
      "zh": "英语拼写测试练什么？识别、语境与书写的区别",
      "en": "What does this Spelling Test practise? Recognition, context and writing"
    },
    "paragraphs": [
      {
        "zh": "本页给出24个英文句子，每题从四种形式中选择一个正确拼写。它要求识别所见字形，并理解足够的句意来确定目标词；听到词后独立拼写、默写整句和自由写作，是另外的任务。选对一个词能说明本题判断正确，不能单独说明听写、词汇量、语法或文章组织达到某个水平。",
        "en": "This page presents twenty-four English sentences, each with four written alternatives and one correct spelling. You recognise a displayed form and use enough context to identify the intended word. Spelling independently from sound, reproducing a sentence and composing prose are different tasks. A correct choice establishes success on that item, not a level of dictation, vocabulary, grammar or composition."
      },
      {
        "zh": "四组各六题，分别聚焦双写辅音、元音选择、字母顺序和词尾变化。这些是本卷安排复习内容的主题，不是经过因素分析建立的四种独立能力。一个词可能同时包含多种拼写特点：例如occurring既有原词的cc，也有加-ing时出现的rr；分组帮助定位复习，不把词的其他特点排除在外。",
        "en": "Six items each focus on doubled consonants, vowel choices, letter order and word endings. These organise revision rather than establish four independent abilities through factor analysis. A word can illustrate several features: occurring retains the base word’s cc and has rr in its -ing form. A section helps locate revision without excluding other spelling features."
      }
    ]
  },
  {
    "id": "spelling-consonants",
    "title": {
      "zh": "双写辅音：找准哪一个字母、哪一个位置",
      "en": "Doubled consonants: identify the letter and its location"
    },
    "paragraphs": [
      {
        "zh": "双写不能只记“这个词有重复字母”。broccoli是cc而不是ll；dilemma是mm；possess前后两处都是ss；interrupt是rr；aggressive同时有gg和ss。复习时把所选形式与正确词逐位对齐，记录少了、加了或换了哪一处，再完整写出整个词，避免修正一个位置后漏看另一个位置。",
        "en": "Remembering that a word contains a repeated letter is insufficient. Broccoli has cc rather than ll; dilemma has mm; possess has two separate ss pairs; interrupt has rr; aggressive has both gg and ss. Align your choice with the correct word, locate each omission, addition or substitution, then write the whole form so that correcting one position does not conceal another."
      },
      {
        "zh": "occurring需要把基本形式occur与变化形式区分开。词典列出的occurred和occurring都双写r，原词则只有一个r；cc在这些形式中保留。[5] 本题可据此复核，但不能推出所有词加-ing都双写末尾辅音。先确认词条和词形，再判断规则的适用条件，不能把一个词的例子推广成全部英语拼写规则。",
        "en": "Distinguish occurring from its base occur. The dictionary lists occurred and occurring with doubled r, whereas the base has one r; cc remains in these forms.[5] This checks the particular item, not a rule that every -ing form doubles its final consonant. Establish the headword and inflected form before deciding which spelling conditions apply."
      }
    ]
  },
  {
    "id": "spelling-vowels",
    "title": {
      "zh": "元音选择：核对字母串，不把读音当作唯一答案",
      "en": "Vowel choices: check the written sequence, not sound alone"
    },
    "paragraphs": [
      {
        "zh": "这一组使用deliberate、cemetery、desperate、fluorescent、abundance和convenient。可在草稿上只标出发生分歧的字母，再还原整词。例如cemetery的三个元音位置都是e；convenient要保留-enient的顺序。句子帮助确认词义，但读懂词义并不自动解决每个元音字母，仍须检查完整拼写。",
        "en": "This group uses deliberate, cemetery, desperate, fluorescent, abundance and convenient. Mark the differing letters separately, then restore the whole word. Cemetery has e in all three vowel positions; convenient retains the sequence -enient. Context identifies the intended meaning but does not automatically settle each vowel letter, so check the complete written form."
      },
      {
        "zh": "fluorescent先写fluo-，再写-rescent；把uo误换成ou，即使看起来熟悉，也改变了词典列出的字形。[10] 将错因记成“uo顺序”或“末段-escent”比只写“单词不会”更具体。这样的记录是可选复习办法，不是关于某种学习风格、听觉能力或记忆缺陷的诊断。",
        "en": "Fluorescent begins fluo- and continues -rescent; replacing uo with ou changes the dictionary form even if the result looks familiar.[10] Recording an error as uo order or the ending -escent is more specific than saying the whole word is unknown. This is an optional revision record, not a diagnosis of learning style, hearing or memory impairment."
      }
    ]
  },
  {
    "id": "spelling-order",
    "title": {
      "zh": "字母顺序：ie、ei与不能省略的字母",
      "en": "Letter order: ie, ei and letters that must remain"
    },
    "paragraphs": [
      {
        "zh": "freight、leisure、receipt使用ei，shield与fierce使用ie；ancient的顺序是a-n-c-i-e-n-t。逐词比较比套用一个未经检查的口诀更可靠：这六词本身就不能全部用同一个ie或ei顺序填写。题目要求的是完整目标词，字母齐全而位置交换，仍不是该题的正确拼写。",
        "en": "Freight, leisure and receipt use ei; shield and fierce use ie; ancient is a-n-c-i-e-n-t. Check each word rather than apply an unchecked mnemonic: these six targets cannot all take the same ie or ei sequence. The task requires the complete target form. Having all the letters in a different order does not satisfy the item."
      },
      {
        "zh": "receipt的词典形式既保留ei，也保留p；看到或听到熟悉的词，仍要检查书写中的每个字母。[15] 复习时可把错选记为“交换顺序”“漏字母”或“替换字母”，再用正确词写一个自己理解的短句。识别正确选项和遮住答案后自行写对，应分别记录，不能把前者直接当作后者已经掌握。",
        "en": "The dictionary form receipt retains both ei and p, so familiarity with the spoken or written word still requires checking every letter.[15] Record a reversal, omission or substitution and use the correct word in a short sentence you understand. Keep recognising an alternative separate from producing the word with the answer hidden; success at the former does not establish the latter."
      }
    ]
  },
  {
    "id": "spelling-endings",
    "title": {
      "zh": "词尾变化：保留e、省略e与y变i分别核对",
      "en": "Word endings: distinguish retained e, omitted e and y changing to i"
    },
    "paragraphs": [
      {
        "zh": "本组的happiness与loneliness可分别对照happy和lonely，观察y变i后加-ness，同时保留词的其余部分。只盯最后四个字母容易漏掉happiness中的pp，或loneliness前面的e。题目按整个词判断，每题只有对或错，不为“词尾选对但其他字母错了”另给部分分数。",
        "en": "Compare happiness with happy and loneliness with lonely to observe y changing to i before -ness while the rest of the word is retained. Looking only at the last four letters can miss pp in happiness or the earlier e in loneliness. Each item judges the whole word as correct or incorrect, without partial credit for an accurate ending elsewhere in a misspelled form."
      },
      {
        "zh": "argument不保留argue末尾的e；noticeable保留notice的e，achievable则不保留achieve末尾的e，且仍保留ie；sincerely保留sincere的e。[20][21][22][23] 因此不能使用“加后缀一律去e”的笼统说法。遇到新词时应核对该词及派生形式，而不是只凭本卷几个词推断全部后缀规则。",
        "en": "Argument omits the final e of argue. Noticeable retains the e of notice; achievable omits the final e of achieve but retains ie; sincerely retains the e of sincere.[20][21][22][23] These examples rule out a blanket instruction to remove e before every suffix. Check a new word and its derived form rather than infer all suffix rules from this small bank."
      }
    ]
  },
  {
    "id": "spelling-counts",
    "title": {
      "zh": "怎样计分？24题总数与四项正确数",
      "en": "How is it scored? Twenty-four items and four section counts"
    },
    "paragraphs": [
      {
        "zh": "每个有效选择与答案键一致记1，否则记0；四组各0—6，合计0—24。不计时、不加权、不倒扣，也没有部分分。若四组分别答对1、2、3、4题，总数是10/24；应同时查看四项记录及具体错题，不能把不同组的差值直接解释成能力差值，因为四组未进行难度等值校准。",
        "en": "A valid choice matching the key earns one, otherwise zero. Four groups each range from zero to six and sum to zero through twenty-four, without timing, weighting, penalties or partial credit. Counts of 1, 2, 3, 4 total ten of twenty-four. Read the counts alongside particular errors; unequal section counts do not establish ability differences because the groups are not difficulty-equated."
      },
      {
        "zh": "缺答与答错分开处理：24题均有有效选择后才生成完整结果。无论0题、部分答对或24题全对，都可查看24道题的所选、正确形式及解析，并阅读全部四份指南，共20个指南小节。正确数描述本次固定题目的表现，不换算CEFR、学校年级、招聘通过线或人群百分位。",
        "en": "Missing answers are distinct from incorrect answers: all twenty-four items require valid choices before a full result is generated. Zero, partial and perfect completed attempts all retain twenty-four choices, keys and explanations plus four full guides comprising twenty guide sections. Counts describe this fixed bank, without conversion to CEFR, school grade, hiring thresholds or population percentiles."
      }
    ]
  },
  {
    "id": "spelling-revision",
    "title": {
      "zh": "从错题到复习：核对、回忆与新语境",
      "en": "From errors to revision: compare, recall and use a new context"
    },
    "paragraphs": [
      {
        "zh": "可以选一个需要复习的词，先核对词典形式，再遮住答案写一次，最后逐字比较；同时记录是双写、元音、顺序还是词尾出了差异。再写一个新的短句，确认自己理解该词的用法。若需要查词典或拼写检查工具，可以使用，但应把“有辅助完成”与“独立回忆”分开记录。",
        "en": "Choose a word to review, check its dictionary form, hide it, write it once and compare letter by letter. Record the differing consonant, vowel, order or ending, then write a fresh sentence to check your intended use. Dictionaries and spelling tools may help, but record assisted completion separately from independent recall."
      },
      {
        "zh": "重做同一组题时，看过答案、选项熟悉程度、语言界面和中断都可能影响正确数。一次提高可能包含对原题的记忆，不足以证明自由写作或总体英语能力提高。可另用未看过的句子或独立书写观察迁移；本产品没有提供这种迁移的实测效果、重测信度或学习成效保证。",
        "en": "Prior answer exposure, familiar alternatives, interface language and interruptions can affect a retake. An increased count can include memory for the original items rather than improved composition or overall English. Fresh sentences or independent writing can provide additional observations of transfer; this product supplies no measured transfer effect, retest reliability or guaranteed learning outcome."
      }
    ]
  },
  {
    "id": "spelling-evidence",
    "title": {
      "zh": "中英文、词典依据与使用条件",
      "en": "English–Chinese presentation, dictionary evidence and conditions"
    },
    "paragraphs": [
      {
        "zh": "中文版本翻译说明、解析和复习指南，英文题句与四个拼写选项保持不变。它不是中文正字法测试；英文语境理解仍参与作答。两种界面内容完整对应，并不意味着已经证明不同语言读者的分数等价。原有词典链接用于核对词形，不代表词典出版方验证、认证或推荐了本站24题。",
        "en": "The Chinese version translates instructions, explanations and revision guides while retaining English sentences and all four alternatives. It tests no Chinese orthography, and understanding English context remains involved. Complete bilingual coverage does not establish equivalent scores across reader groups. Dictionary links check word forms; they imply no publisher validation, certification or endorsement of this bank."
      },
      {
        "zh": "点击开始直接进入题目，无需另行同意、邮箱、账号或付费。约8分钟是估计用时，不设倒计时；想记录无辅助识别时，可提交后再看答案和查词。答案在浏览器计算；主动保存的标签页草稿24小时失效，完成、重测或退出清除后删除。分享仅包含公开测试链接，不包含答卷或正确数。",
        "en": "Start opens the questions directly without another agreement, email, account or payment. Eight minutes is an estimate, not a countdown. For an unaided recognition record, consult answers and dictionaries after submitting. Scoring runs in the browser; optional tab drafts expire after twenty-four hours and clear on completion, retake or exit-and-clear. Sharing contains the public test link, not answers or counts."
      }
    ]
  }
];

export const spellingLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "拼写识别与听写有什么区别？",
      "en": "How does spelling recognition differ from dictation?"
    },
    "answer": {
      "zh": "本页从四个已显示形式中选择正确词；听写需要根据声音自行写出词。两种任务的线索不同，本页正确数不能代替听写结果。",
      "en": "This task selects among four displayed forms. Dictation requires producing a word from sound. The available cues differ, so these counts cannot replace a dictation result."
    }
  },
  {
    "question": {
      "zh": "为什么occur与occurring的r数量不同？",
      "en": "Why do occur and occurring have different numbers of r?"
    },
    "answer": {
      "zh": "occur末尾一个r，词典列出的occurring与occurred都双写r；cc保留。应核对具体词形，不能推出所有-ing形式都双写。",
      "en": "Occur ends in one r; the listed forms occurring and occurred double r while retaining cc. Check the particular form rather than generalise to all -ing words."
    }
  },
  {
    "question": {
      "zh": "fluorescent先写uo还是ou？",
      "en": "Does fluorescent begin with uo or ou?"
    },
    "answer": {
      "zh": "写fluo-，即u在o之前，后面是-rescent。核对整词，不只凭熟悉的发音或一个相似选项判断。",
      "en": "It begins fluo-, with u before o, followed by -rescent. Check the complete form rather than rely only on familiar sound or a similar alternative."
    }
  },
  {
    "question": {
      "zh": "能用一个ie或ei口诀做完这组题吗？",
      "en": "Can a single ie or ei mnemonic solve this group?"
    },
    "answer": {
      "zh": "不能。本组freight、leisure、receipt用ei，shield、fierce用ie；还须保留receipt的p并核对ancient完整顺序。",
      "en": "No. Freight, leisure and receipt use ei, while shield and fierce use ie. Retain p in receipt and check the full sequence in ancient too."
    }
  },
  {
    "question": {
      "zh": "加后缀是否都要删掉末尾e？",
      "en": "Should every suffix remove a final e?"
    },
    "answer": {
      "zh": "不是。本卷noticeable与sincerely保留基本词末尾e，argument与achievable不保留。逐词核对，也检查其余字母。",
      "en": "No. Noticeable and sincerely retain their bases’ final e; argument and achievable omit it. Check each word and its remaining letters."
    }
  },
  {
    "question": {
      "zh": "四项1、2、3、4怎样合计？",
      "en": "How do counts of 1, 2, 3, 4 add up?"
    },
    "answer": {
      "zh": "合计10/24，四项仍各自显示正确数/6。分项未等难度校准，不据差值给能力排名。",
      "en": "They total ten of twenty-four; each section retains its count out of six. Unequated section difficulty prevents interpreting the differences as an ability ranking."
    }
  },
  {
    "question": {
      "zh": "全部答错也能看完整解析吗？",
      "en": "Are full explanations available with zero correct?"
    },
    "answer": {
      "zh": "可以。24题均作答后，0题到24题全对均显示全部答案与解析、四份完整指南和20个指南小节。",
      "en": "Yes. Every completed attempt, from zero through twenty-four correct, shows all keys and explanations plus four full guides with twenty guide sections."
    }
  },
  {
    "question": {
      "zh": "重做提高了，能证明写作提高吗？",
      "en": "Does a higher retake count prove better writing?"
    },
    "answer": {
      "zh": "不能仅凭该数判断。熟悉原题或记住答案也会提高正确数；独立书写与新语境需要另作观察。",
      "en": "The count alone cannot establish that. Familiarity and answer recall can raise it; independent writing and fresh contexts require separate observation."
    }
  },
  {
    "question": {
      "zh": "点击开始后还要确认同意吗？",
      "en": "Is another agreement required after Start?"
    },
    "answer": {
      "zh": "不需要。点击开始直接作答，全部题解和指南免费，无需额外同意、邮箱、注册或付款。",
      "en": "No. Start opens the questions directly. All explanations and guides are free without another agreement, email, registration or payment."
    }
  }
];
