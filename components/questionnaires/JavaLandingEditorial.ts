import type { Questionnaire } from "@/lib/questionnaires/types";

export const javaLandingSections: Questionnaire["guide"] = [
  {
    "id": "java-reading-scope",
    "title": {
      "zh": "Java测试练什么？先明确版本、任务与输出",
      "en": "What does this Java Test practise? Version, task and output first"
    },
    "paragraphs": [
      {
        "zh": "每题提供独立的完整Main.java程序，四个选项只有一个与该程序的规定结果一致。先看声明类型、初始数据及要打印的位置，再判断程序能否通过编译；能编译时，才按语句顺序追踪状态。不要在心里修正代码，也不要用“我平时会怎样写”替代题目给定条件。",
        "en": "Each item supplies an independent, complete Main.java program and four outcomes, with one key. Identify declared types, initial data and print locations, then decide whether compilation succeeds. Trace statements only for a program that compiles. Do not silently repair the source or substitute the way you usually write a program for its stated conditions."
      },
      {
        "zh": "本版是固定读码知识练习，不在网页运行访问者提交的Java。它适合学过基本语法后复习具体规则，也可帮助准备讨论自己的推理过程。题组没有覆盖Spring、数据库接入、并发设计、项目构建或完整单元测试；想检验这些任务，需要另做相应项目或操作，不能从24次选择直接推出。",
        "en": "This fixed bank practises code-reading knowledge without running visitor-submitted Java. Use it after learning basic syntax to revisit rules or prepare to explain a trace. It does not cover Spring, database integration, concurrency design, project builds or full unit testing. Those tasks require their own work samples rather than an inference from twenty-four choices."
      }
    ]
  },
  {
    "id": "java-expression-stages",
    "title": {
      "zh": "值与表达式：类型、运算结构与求值顺序",
      "en": "Values and expressions: types, structure and evaluation order"
    },
    "paragraphs": [
      {
        "zh": "新例：int a=22,b=6时，a/b得3、a%b得4；(int)-4.8得-4，有限且在范围内的浮点转int向零截取，并非向下取整。[1][3] 若m=8，\"K\"+m+2是K82，\"K\"+(m+2)才是K10。把每一步的类型与结果写出，能分清数值加法和拼接；本页这些新例不计入24题。",
        "en": "Fresh examples with int a=22,b=6 give quotient 3 and remainder 4. Casting -4.8 to int gives -4: finite, in-range conversion truncates toward zero rather than flooring.[1][3] With m=8, \"K\"+m+2 yields K82, while \"K\"+(m+2) yields K10. Write each intermediate type and result to separate addition from concatenation. These examples add no scored items."
      },
      {
        "zh": "本组六题还分别追踪后自增、String引用与内容比较、短路条件中的副作用。[1] 复习时应指出自己混淆的是“表达式给出的值”“变量随后储存的值”，还是“该操作数根本没有执行”。这些问题不同，只记住最终字符串不足以解释为什么另一个选项错了。",
        "en": "The six items also trace postfix increment, String identity versus content and a short-circuited side effect.[1] Ask whether your uncertainty concerns the value yielded, the later stored value or an operand that never ran. Those are different questions; remembering the final string alone does not explain a rejected alternative."
      }
    ]
  },
  {
    "id": "java-control-trace",
    "title": {
      "zh": "分支与循环：记录访问、跳过、更新及退出",
      "en": "Branches and loops: record visits, skips, updates and exits"
    },
    "paragraphs": [
      {
        "zh": "新例让i从2到6，sum从0开始，每轮在累加前检查i==4。若执行continue，实际累加2、3、5、6，得16；若换成break，则只累加2和3，得5。[2] 用“本轮i／是否累加／更新后sum”三列记录，别把跳过本轮与结束整个循环合并成同一种动作。",
        "en": "In a fresh trace, i visits two through six and sum starts at zero. A check for i==4 precedes addition. Continue adds two, three, five and six, totaling sixteen; replacing it with break leaves five.[2] Record the current i, whether addition runs and the updated sum. Skipping a turn and ending a loop are different events."
      },
      {
        "zh": "本题组还包括先判断的while、逗号合并标签的箭头switch，以及用下标更新数组。比较循环时保留条件与更新的位置；比较switch时先辨实际语法，不把冒号分支的贯穿规则套在箭头分支上。[2] 数组题则逐项记访问下标和对应元素，最后再核打印格式。",
        "en": "The bank also covers a pre-tested while loop, an arrow switch with grouped labels and indexed array updates. Keep conditions and updates in place, and identify switch syntax before applying a fall-through rule.[2] For the array item, trace each visited index and element, then check the printed format."
      }
    ]
  },
  {
    "id": "java-method-relationships",
    "title": {
      "zh": "方法与对象：复制的值、声明类型与实际对象",
      "en": "Methods and objects: copied values, declared types and actual objects"
    },
    "paragraphs": [
      {
        "zh": "新助手revise(int[] a)先执行a[0]=14，再执行a=new int[]{99}；调用方把含3的数组marks传入，随后读取marks[0]仍得14。第一次修改同一个数组，第二次只改形参指向。Java按值传递，数组实参复制的是引用值；画“调用方变量—数组—形参”三个对象，可避免把重绑形参当成替换调用方变量。[1]",
        "en": "A fresh revise(int[] a) first sets a[0]=14, then assigns a=new int[]{99}. Passing a caller’s marks array containing 3 leaves marks[0] as 14. Mutation reaches the shared array; reassignment changes only the parameter. Java copies argument values, including reference values.[1] Draw caller variable, array and parameter separately."
      },
      {
        "zh": "重载选择与实例方法覆盖是两个阶段。本版分别用声明类型与子类实现来出题，复习时先问“选哪一个签名”，再问“这个实例运行哪个实现”。另两题核构造器字段与lambda捕获；被捕获局部变量不满足final或有效final条件时，是编译问题，不应先猜输出。[1]",
        "en": "Overload selection and instance-method overriding are different stages: first identify the selected signature, then the implementation invoked on the instance. Other items distinguish a constructor’s field from its parameter and check lambda capture. A captured local failing the final/effectively-final requirement presents a compilation question, before any output prediction.[1]"
      }
    ]
  },
  {
    "id": "java-collection-contracts",
    "title": {
      "zh": "集合操作：下标、元素、唯一性与映射分别判断",
      "en": "Collections: distinguish index, element, uniqueness and mapping"
    },
    "paragraphs": [
      {
        "zh": "新列表为[2,7,2]，以int实参执行remove(2)按下标删第三项，余[2,7]；重新建立同样的列表后，remove(Integer.valueOf(2))按对象删首个相等元素，余[7,2]。[5] 方法同名不保证语义相同，应同时核实参类型、选中的方法和集合是否支持修改；List.of得到的列表不支持这些修改。[5]",
        "en": "For a fresh list [2,7,2], remove(2) selects indexed removal and leaves [2,7]. On a separate identical list, remove(Integer.valueOf(2)) removes the first equal element and leaves [7,2].[5] Check argument type, selected operation and whether modification is supported. Lists produced by List.of do not support these mutations.[5]"
      },
      {
        "zh": "Set核相等元素的唯一性，Map核每个键当前关联的值。[6][7] 新HashMap先put(\"ticket\",9)，再put(\"ticket\",14)，映射数为1，查该键得14；两次put并不自动生成两项。题本只要求集合大小或指定键值，不需要假定HashSet或HashMap的遍历顺序。[7]",
        "en": "A Set concerns equal-element uniqueness; a Map associates a current value with a key.[6][7] A fresh HashMap receiving put(\"ticket\",9) then put(\"ticket\",14) has one mapping whose value is 14. Two put calls need not mean two mappings. The bank asks for a size or a specified value, without assuming HashSet or HashMap iteration order.[7]"
      }
    ]
  },
  {
    "id": "java-failure-stages",
    "title": {
      "zh": "编译失败与异常处理：先分阶段，再追踪打印",
      "en": "Compilation failure and exceptions: identify the stage before tracing output"
    },
    "paragraphs": [
      {
        "zh": "Integer.parseInt(\"8r\")不能解析为十进制int。[8] 新例在catch(NumberFormatException e)里打印invalid，在正常完成的finally里打印:end，最终文本为invalid:end。[2] 这属于已经编译、运行中抛出并处理的异常；异常发生后，不会返回原先失败的调用继续取得一个数。",
        "en": "Integer.parseInt(\"8r\") cannot parse a decimal int.[8] In a fresh program, a matching catch prints invalid and a normally completing finally prints :end, yielding invalid:end.[2] That is a runtime exception handled after successful compilation; execution does not resume the failed call to obtain a number."
      },
      {
        "zh": "若同一个try先写catch(RuntimeException e)，后写catch(NumberFormatException e)，后者已被前者覆盖，编译就会拒绝。[4] 本题组另有lambda局部捕获导致的预期编译失败。选“编译失败”时要能指出受限位置；选打印结果时要能解释程序为何已经通过该阶段，而不是把所有错误都叫“运行报错”。",
        "en": "Putting catch(RuntimeException e) before catch(NumberFormatException e) for the same try rejects the covered later handler at compile time.[4] The bank also includes an expected lambda-capture compilation failure. Identify the restricted location when selecting that outcome, and explain why compilation succeeds before choosing printed text."
      }
    ]
  },
  {
    "id": "java-counts-learning",
    "title": {
      "zh": "24题成绩怎样读？四项正确数与逐题复习",
      "en": "How should you read the result? Four counts and item-by-item revision"
    },
    "paragraphs": [
      {
        "zh": "每题匹配答案记1，其余有效选择记0，无部分分、扣分或速度奖励；四项分别0—6，总数0—24。新算例：值与表达式2/6、控制流5/6、方法对象4/6、集合失败3/6，合计14/24。另一份6、2、1、5也合计14，复习重点却不同。先看分项和每题解析，而不是只比较总数。",
        "en": "A matching key counts one and another valid choice zero, without partial credit, penalties or speed bonuses. Four counts range from zero to six and total zero to twenty-four. Fresh counts 2, 5, 4, 3 total14/24; 6, 2, 1, 5 also total fourteen but point to different review. Read section counts and item explanations rather than comparing totals alone."
      },
      {
        "zh": "可任选一道错题，也可选一道答对但说不清理由的题，写下最先不同的状态或规则。随后在自己的可丢弃程序里只改一个条件，先预测再核验。网页不要求运行这段额外程序，也不把它加入成绩。重测重复同一24题，学过答案后提高可能来自记忆，尚不能证明新场景中的迁移。",
        "en": "Choose a missed item or a correct choice whose reasoning you cannot explain. Write the first differing state or rule, then optionally change one condition in a disposable local program, predicting before checking. The website neither requires nor scores that extra program. Retakes repeat the same twenty-four tasks; improvement after studying keys can reflect memory rather than transfer."
      }
    ]
  },
  {
    "id": "java-evidence-access",
    "title": {
      "zh": "核验依据与使用方式：完整解析、免费进入与双语范围",
      "en": "Evidence and access: full review, free entry and bilingual scope"
    },
    "paragraphs": [
      {
        "zh": "24段原创代码用Temurin JDK 25.0.2、不启预览特性核验：22段输出与答案一致，两段按预期无法编译。Oracle规范与API支持相关语言规则，不能据此推导本题本已完成能力分档、人群常模或岗位预测验证。两语保留同一代码、选项和计分，但并未建立不同语言使用者之间的成绩可比性。",
        "en": "The twenty-four original programs were checked with Temurin JDK 25.0.2 without preview features: twenty-two produce their keyed output and two fail compilation as expected. Oracle specifications and APIs support language rules, not calibrated ability bands, population norms or job predictions for this bank. Both interfaces retain identical code, options and scoring without established cross-language score comparability."
      },
      {
        "zh": "点击开始直接进入题目，不需先同意统计、注册、填邮箱或做其他测试。不限时；全部24题有效选择后，零分、部分正确或全对都可看全部代码、所选、答案、解析及四份七节全文。可选草稿仅在主动保存后留本标签页最多24小时，完成、清除或重测即删除；分享只含公开测试链接，不含答案与正确数。",
        "en": "Start opens the questions directly without mandatory analytics agreement, signup, email or a prior test. There is no timer. After twenty-four valid choices, zero, partial and perfect counts all receive every program, selection, key, explanation and all four seven-section guides. An actively enabled tab draft lasts up to twenty-four hours, clearing on completion, clearing or retaking. Sharing includes only the public test link, without answers or counts."
      }
    ]
  }
];

export const javaLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "这是Java语法知识题，还是在线写代码考试？",
      "en": "Is this Java knowledge practice or a live coding exam?"
    },
    "answer": {
      "zh": "这是阅读24段给定程序并选择结果的练习。本站不要求你写、编译或提交代码，也不观察项目开发过程；结果只统计这些题目与答案的匹配。",
      "en": "It is practice reading twenty-four supplied programs and choosing outcomes. You do not write, compile or submit code here, and project work is not observed. Counts describe these keyed choices."
    }
  },
  {
    "question": {
      "zh": "开始练习前需要先同意统计或建立账户吗？",
      "en": "Must I agree to analytics or create an account first?"
    },
    "answer": {
      "zh": "不需要。点击开始直接出现题目，可选使用统计与可选草稿都不构成入口条件，完整解析也不需邮箱或付款。",
      "en": "No. Start opens the questions directly. Optional usage counting and drafts are not entry conditions, and complete explanations require no email or payment."
    }
  },
  {
    "question": {
      "zh": "本题组四部分各练哪些区别？",
      "en": "What distinctions do the four groups practise?"
    },
    "answer": {
      "zh": "依次为表达式中的类型与求值、分支循环的控制流、方法调用与对象状态、集合操作与失败阶段。每组六题，具体程序及逐题理由在完成后全部可读。",
      "en": "They cover expression types and evaluation, control flow, calls and object state, and collection operations and failure stages. Each has six tasks, with all programs and item explanations visible after completion."
    }
  },
  {
    "question": {
      "zh": "为什么编译失败也可能是正确选择？",
      "en": "Why can compilation failure be the keyed outcome?"
    },
    "answer": {
      "zh": "部分程序有意违反语言约束，题目要求识别该结果。应先判断编译是否成立，再预测运行打印，不能把代码默改后作答。",
      "en": "Some programs deliberately violate a language constraint. Identify whether compilation succeeds before predicting printed output, without silently repairing the source."
    }
  },
  {
    "question": {
      "zh": "集合题需要猜HashSet或HashMap的输出顺序吗？",
      "en": "Must I guess HashSet or HashMap output order?"
    },
    "answer": {
      "zh": "不需要。题本用大小或指定键查值等确定操作，不以未规定的遍历顺序决定答案。",
      "en": "No. The bank uses deterministic operations such as size or lookup by a specified key, without making an unspecified traversal order determine a key."
    }
  },
  {
    "question": {
      "zh": "全部选同一个字母可以代表一个Java等级吗？",
      "en": "Does choosing the same letter throughout indicate a Java level?"
    },
    "answer": {
      "zh": "不能。本版答案位置各出现六次，固定选同一字母会匹配六题；它是选项排列与选择形成的正确数，不是熟练程度、人群排名或考试资格。",
      "en": "No. Each keyed position occurs six times, so a constant letter matches six tasks. That follows option arrangement and choices rather than proficiency, population rank or qualification."
    }
  },
  {
    "question": {
      "zh": "阅读完解析后，怎样检查是否理解而不是记住答案？",
      "en": "How can I explore understanding after reading the answers?"
    },
    "answer": {
      "zh": "试着解释最先发生变化的类型、状态或控制流，再在可丢弃的新程序中只改一个条件，预测后核验。新例帮助复习，但本页没有测量迁移效果或保证提高。",
      "en": "Explain the first relevant type, state or control-flow change, then optionally alter one condition in a disposable fresh program and check your prediction. This supports revision without measuring transfer or guaranteeing improvement."
    }
  },
  {
    "question": {
      "zh": "中文界面的Java代码会被翻译或改变吗？",
      "en": "Does the Chinese interface translate or change Java code?"
    },
    "answer": {
      "zh": "不会。完整英文代码与输出值两语相同，题干说明、解析和指南提供中英文。相同代码让题目保持一致，不等于已验证跨语言人群成绩可比。",
      "en": "No. Complete English programs and output values are identical in both interfaces; surrounding instructions, explanations and guides are bilingual. Identical code preserves the task without establishing cross-language population comparability."
    }
  }
];
