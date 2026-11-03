import type { Questionnaire } from "@/lib/questionnaires/types";

/** Entry-only editorial; source-bound scripts, keys and full reports remain intact. */
export const pythonLandingSections: Questionnaire["guide"] = [
  {
    "id": "python-task-map",
    "title": {
      "zh": "Python测试练什么？四类核心代码阅读",
      "en": "What does this Python Test practise? Four core code-reading groups"
    },
    "paragraphs": [
      {
        "zh": "24道原创选择题分为值与文本、循环与函数、集合与别名、错误与对象四组，每组六题。你需要判断给定脚本打印什么，或是否在执行前解析失败；完成后可免费查看四组正确数、全部代码、所选、答案、解析与四篇完整复习指南。约10分钟为阅读估计，没有倒计时。",
        "en": "Twenty-four original multiple-choice questions form four groups of six: values and text, loops and functions, collections and aliases, and errors and objects. Predict a supplied script’s printed text or a pre-execution parse failure. Completion opens four section counts, every program, your selections, keys, explanations and four complete guides, free. Ten minutes is a reading estimate, without a countdown."
      },
      {
        "zh": "本版通过具体输入下的语义与执行路径复习Python，不要求提交代码、上传文件或安装解释器。题目不含NumPy、Pandas、机器学习、Web框架或真实数据处理；理解一段短程序，与独立编写、测试及维护应用是不同任务。希望复习基础的读者可先独立预测，再按完整解析定位需要重看的规则。",
        "en": "Revise Python semantics and execution paths for explicit inputs, without submitting code, uploading files or installing an interpreter. There are no NumPy, Pandas, machine-learning, web-framework or live-data tasks. Interpreting short programs differs from independently writing, testing and maintaining an application. Predict first, then use worked explanations to identify rules for revision."
      }
    ]
  },
  {
    "id": "python-script-context",
    "title": {
      "zh": "先固定脚本条件：版本、缩进与准确输出",
      "en": "Fix the script conditions: version, indentation and exact output"
    },
    "paragraphs": [
      {
        "zh": "每段作为CPython 3.14.5下的独立.py脚本阅读，题间不共享变量、对象或函数。缩进、冒号和参数列表属于程序本身，不能在心里先补齐再预测。交互解释器可能显示表达式值，本题的独立脚本则只按实际print等语句输出；布尔值拼写与分隔符也要逐项核对。",
        "en": "Read each program as an independent .py script under CPython 3.14.5. Variables, objects and functions do not carry between items. Indentation, colons and parameter lists are part of the code, not details to repair before predicting. An interactive interpreter can display expression values; these scripts print only through their actual output statements. Check Boolean spelling and separators as well."
      },
      {
        "zh": "本轮按该精确解释器重跑全部24段：22段输出匹配答案，两段按预期无法通过解析。可复算支持这些给定程序的答案，不等于核过所有解释器、库或最新语言特性。参考链接使用Python 3.14文档，其在线维护版本可能继续更新；复习仍以题中明确的脚本环境为准。",
        "en": "All 24 original programs were rerun in that exact interpreter: 22 matched their keyed output and two failed parsing as intended. Reproducibility supports these particular outcomes, not every interpreter, library or latest feature. References point to the maintained Python 3.14 documentation, whose online patch version can advance; keep this bank’s declared script environment explicit."
      }
    ]
  },
  {
    "id": "python-numeric-boundaries",
    "title": {
      "zh": "值与文本：负数整除、切片与真值分别判断",
      "en": "Values and text: distinguish negative floor division, slices and truth tests"
    },
    "paragraphs": [
      {
        "zh": "整数//向负无穷取整，不是朝零截断，且商余关系可用x=(x//y)*y+x%y复核。[1] 新例-23除以6，向下取整商为-4、余数为1，因为-23=(-4)*6+1。乘方、加法和括号又是另一组规则；应先写操作符与分组，再算值，不照搬其他语言的整数除法习惯。",
        "en": "Integer // floors rather than truncates toward zero; verify the quotient and remainder with x=(x//y)*y+x%y.[1] Fresh -23 divided by six has floor quotient -4 and remainder one, since -23=(-4)*6+1. Exponentiation, addition and parentheses raise separate grouping questions. State the operator and grouping before importing an integer-division habit from another language."
      },
      {
        "zh": "新例\"planet\"[1:5:2]取索引1、3，得到ln；\" blue / green \".split(\"/\")[1].strip()则先取第二段，再去两端空白，得到green。文本\"False\"非空，其bool为True，空字符串才为False。位置、文本内容、是否为空是不同信息，不能因文字看起来是否定就当作布尔False。",
        "en": "Fresh \"planet\"[1:5:2] selects indices one and three, yielding ln. A separate \" blue / green \".split(\"/\")[1].strip() selects the second field before trimming it to green. The nonempty string \"False\" tests true, while the empty string tests false. Text meaning, position and emptiness are different properties."
      }
    ]
  },
  {
    "id": "python-loop-defaults",
    "title": {
      "zh": "循环与函数：分开迭代、定义、调用和返回",
      "en": "Loops and functions: separate iteration, definition, calls and returns"
    },
    "paragraphs": [
      {
        "zh": "先列range真正产生的值，再检查哪轮到达累加器。新例range(1,10,3)给1、4、7，若n为4时continue，则只累加1与7得8。continue跳过当前轮余下步骤，break才结束循环；终点10不加入。[2] 对函数调用也应先算实际返回值，再算调用处外层表达式，return不等于print。",
        "en": "List the values a range produces before tracing updates. Fresh range(1,10,3) yields one, four and seven; continuing when n is four leaves a sum of eight. continue skips the rest of that iteration, while break ends the loop; ten is excluded.[2] Similarly, compute a function’s returned value before the caller’s surrounding expression. Returning is not printing."
      },
      {
        "zh": "默认值表达式在执行函数定义时求值，不是每次无参调用时重算。[2] 新例seed=6时定义shift(n=seed)返回n*2，再令seed=20，shift()得到12，而shift(seed)得到40。分别标定义事件、后续重绑定和显式传参；若默认值是可变对象，还需追踪对象是否被多次调用共享。",
        "en": "Default expressions are evaluated when the function definition executes, not recalculated on each omitted argument.[2] Fresh shift(n=seed) returns n*2 and is defined while seed is six. After seed becomes twenty, shift() yields twelve and shift(seed) yields forty. Mark definition, rebinding and explicit argument separately. A mutable default also requires tracking shared object state."
      }
    ]
  },
  {
    "id": "python-alias-copy",
    "title": {
      "zh": "集合与别名：区分名称、外层与共享内层",
      "en": "Collections and aliases: distinguish names, outer containers and shared contents"
    },
    "paragraphs": [
      {
        "zh": "赋值可让两个名称指向同一列表；list.copy则建立新的浅层列表。[3] 新例source=[[5]]，other=source.copy()后执行other.append([9])，仅other外层长度变2，source仍长1；随后other[0].append(8)，source内层末值也为8。外层独立与内层共享可以同时成立，不能把浅复制读成“所有修改都共享”或“全部递归独立”。",
        "en": "Assignment can give one list two names, whereas list.copy creates a shallow outer list.[3] Fresh source=[[5]] and other=source.copy(), followed by other.append([9]), leave outer lengths one and two. After other[0].append(8), source’s inner last value is also eight. Outer independence and nested sharing can coexist; neither all changes shared nor recursive independence follows."
      },
      {
        "zh": "追踪时分别画外层列表与实际内层对象，只把共享对象画一次。is核对象身份，不能用相同打印值替代；两个独立实例可能有相等的数值属性，仍不是同一个实例。题本只涉及所示普通对象和属性，不把这几道题扩展为任意自定义相等方法、描述符或所有复制策略的结论。",
        "en": "Draw outer lists separately and a shared nested object only once. is checks identity, which matching printed values do not establish. Separate instances can contain equal numeric attributes without being the same instance. These items concern their supplied ordinary objects and attributes, not every custom equality method, descriptor or copying strategy."
      }
    ]
  },
  {
    "id": "python-lookup-comprehension",
    "title": {
      "zh": "字典与推导式：返回值、状态和筛选边界分列",
      "en": "Dictionaries and comprehensions: separate returned values, state and boundaries"
    },
    "paragraphs": [
      {
        "zh": "新例d={\"sun\":2}，d.get(\"moon\",9)返回9而不插入，条目数仍1；再令d[\"sun\"]=7，当前值变7，条目数仍1。按已有键更新、缺失键get与缺失键下标访问，是不同操作。集合则只计保留的不同成员，本版只问长度，不要求猜集合显示或迭代顺序。",
        "en": "Fresh d={\"sun\":2} returns nine from d.get(\"moon\",9) while retaining one entry. Assigning d[\"sun\"]=7 changes the value, not the entry count. Updating a key, get with a fallback and missing-key subscription are different operations. Set questions count distinct retained members, without requiring a guessed display or iteration order."
      },
      {
        "zh": "推导式要按顺序写迭代值、过滤条件与变换结果。[3] 新例对range(2,8)只保留n%2为真的数，再各加10，按逗号连接为13,15,17；它不是把2至8全部加10，也不额外带列表方括号。核最终文本前，先看join的输入是否已转字符串，以及print是否明确指定分隔符。",
        "en": "For a comprehension, trace iteration values, predicate and result expression.[3] Fresh range(2,8), filtered to values with n%2 true and then increased by ten, joins as 13,15,17. It neither includes every endpoint nor prints list brackets. Before predicting text, inspect string conversion for join and any explicit print separator."
      }
    ]
  },
  {
    "id": "python-error-paths",
    "title": {
      "zh": "语法与异常：先判发生阶段，再走匹配分支",
      "en": "Syntax and exceptions: identify the phase before following a handler"
    },
    "paragraphs": [
      {
        "zh": "有效脚本运行时仍可能抛异常；语法失败则会阻止该独立脚本开始执行。[4] 新例把int(\"sprout\")放进try，匹配ValueError后记recover，finally记finish，输出recover:finish。处理器是否到达取决于实际异常类和继承关系，不由错误消息看起来像什么决定；finally也不限于发生错误才运行。",
        "en": "Valid code can raise during execution, while a script’s parse failure prevents execution from beginning.[4] A fresh try calls int(\"sprout\"), records recover in a ValueError handler and finish in finally, printing recover:finish. Handler matching depends on exception classes and inheritance, not diagnostic wording. finally is not restricted to error cases."
      },
      {
        "zh": "读题可按“整段能解析吗→执行到哪步→抛了什么→哪个处理器匹配→清理后打印什么”列轨迹。不要暗修缺冒号或参数顺序，也不要把函数返回None当成语法失败的输出。题目给定的明确异常分支，不足以证明能处理真实服务中的所有异常或建立完整错误策略。",
        "en": "Trace parsing, executed step, raised value, matching handler, cleanup and final output. Do not repair a missing colon or invalid parameter order, and do not invent a None return for an unparsed function. These explicit paths do not establish a complete exception policy or handling of every production failure."
      }
    ]
  },
  {
    "id": "python-context-generators",
    "title": {
      "zh": "with与生成器：清理的前提和迭代实际消费的值",
      "en": "with and generators: entry conditions and the values iteration consumes"
    },
    "paragraphs": [
      {
        "zh": "with须先成功执行__enter__，再执行主体与退出逻辑；若__enter__本身抛错，不能直接套用退出保证。[5] 新例Door在进入时先记setup再抛RuntimeError，外层捕获记caught，即使__exit__中写了cleanup，轨迹仍只有setup:caught，没有body或cleanup。应把“进入成功”和“进入失败”作为两条路径分别预测。",
        "en": "with must successfully enter before its body and exit path; an exception from __enter__ is outside that exit guarantee.[5] A fresh Door records setup and raises RuntimeError during entry, then an outer handler records caught. Even with cleanup in __exit__, the trace is setup:caught, without body or cleanup. Predict successful and failed entry as separate paths."
      },
      {
        "zh": "生成器的yield与return也有不同作用。[1] 新例先yield 3、再yield 8、最后return 40；list消费得到[3,8]，sum在新建的另一生成器上得到11，而非51。生成器返回值不是本次普通迭代又产出一个元素。阅读实例或生成器时，每次创建、每次消费与对象身份均应单独记录。",
        "en": "Generator yield and return also serve different roles.[1] A fresh generator yields three and eight, then returns forty. list collects [3,8], and sum over a newly created generator gives eleven, not fifty-one. A return value is not another yielded element in ordinary iteration. Record each creation, consumption and identity separately."
      }
    ]
  },
  {
    "id": "python-score-review",
    "title": {
      "zh": "正确数怎样解读？逐题复盘与新代码迁移",
      "en": "Reading correct counts: item review and unfamiliar-code practice"
    },
    "paragraphs": [
      {
        "zh": "每个匹配答案计1，其他有效选择计0，四组各0–6合成0–24，没有倒扣、速度奖励或部分分。新算例[4,2,5,3]与[2,5,3,4]均为14，但复习位置不同。完成后全部24条解析与四篇各七节指南都开放；总数不能独立辨别语言阅读、边界、别名或异常路径中的哪一步出错。",
        "en": "Each keyed answer earns one, another valid choice zero. Four 0–6 counts sum to 0–24 without penalties, speed bonuses or partial credit. Fresh vectors [4,2,5,3] and [2,5,3,4] both total fourteen but locate different revision items. Completion opens all 24 explanations and four seven-section guides. Totals alone do not diagnose reading, boundary, alias or exception-path mistakes."
      },
      {
        "zh": "先写预测，再读解析，找到最早偏离的一步，最后只改变一个条件重写小程序。文档和解释器运行可核代码结果。[1][2][3][4][5] 但本题本尚无开发者常模、招聘效标或跨语言等值研究，不派初中高档位、百分位、岗位推荐或证书。固定题重测可反映记忆；想看是否能迁移，应换未见代码并记录查阅资料的条件。",
        "en": "Predict, read the explanation, locate the first divergence and rewrite a small program changing one condition. Documentation and interpreter execution support outcome checks.[1][2][3][4][5] This bank has no developer norms, hiring-criterion study or established cross-language equivalence. It assigns no proficiency tier, percentile, job recommendation or certificate. Use unfamiliar code and record reference use when investigating transfer beyond a memorized bank."
      }
    ]
  }
];

export const pythonLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "这是Python知识选择题还是现场编程测试？",
      "en": "Is this a Python multiple-choice quiz or live coding test?"
    },
    "answer": {
      "zh": "这是固定的24题读代码预测练习，不需提交程序或上传文件。正确数记录对给定结果的选择，与独立实现功能、通过测试用例或维护项目不同。",
      "en": "This is a fixed 24-item read-and-predict practice. You submit no program or file. Selecting a supplied outcome differs from independently implementing a feature, passing execution tests or maintaining a project."
    }
  },
  {
    "question": {
      "zh": "负数//为什么可能和其他语言的整数除法不同？",
      "en": "Why can negative // differ from integer division in another language?"
    },
    "answer": {
      "zh": "本版整数//向负无穷取整，不朝零截断。以-23和6为例，商-4、余1，满足-23=(-4)*6+1。先核所用语言与操作符，再比较结果。[1]",
      "en": "Integer // floors rather than truncates toward zero. For -23 and six, quotient -4 and remainder one satisfy -23=(-4)*6+1. Check the language and operator before comparing outcomes.[1]"
    }
  },
  {
    "question": {
      "zh": "函数默认值是否每次调用都重新求值？",
      "en": "Are function defaults reevaluated on every call?"
    },
    "answer": {
      "zh": "不是。默认表达式在执行定义时求值，后续名称重绑定不会替换已保存的默认值；可变默认对象还可能在调用之间共享。须分别看定义、实参和对象修改。[2]",
      "en": "No. Default expressions are evaluated when the definition executes. Later rebinding does not replace a saved default, and a mutable default object can be shared across calls. Trace definition, arguments and mutations separately.[2]"
    }
  },
  {
    "question": {
      "zh": "copy建立新列表，为什么内层数据还能一起改变？",
      "en": "Why can nested data change after copying a list?"
    },
    "answer": {
      "zh": "list.copy是浅复制：外层新建，元素仍引用原对象。改共享内层可双方可见；只给新外层追加元素则不等于给原外层追加。先确定修改的是哪一层。[3]",
      "en": "list.copy is shallow: the new outer list initially refers to the same element objects. Shared nested mutations can appear on both sides; appending to the new outer list does not append to the original outer list.[3]"
    }
  },
  {
    "question": {
      "zh": "字典get提供默认值会自动增加这个键吗？",
      "en": "Does dict.get with a default insert the missing key?"
    },
    "answer": {
      "zh": "在题本普通字典中不会。get返回默认值但不插入；已有键赋值是更新，缺失键下标访问则会抛KeyError。别把不同方法的行为合并。",
      "en": "For the ordinary dictionaries here, no. get returns the fallback without insertion. Existing-key assignment updates, while missing-key subscription raises KeyError. Keep those operations distinct."
    }
  },
  {
    "question": {
      "zh": "with是否总会调用__exit__？",
      "en": "Does with always invoke __exit__?"
    },
    "answer": {
      "zh": "不能脱离条件。__enter__成功返回后才有相应退出保证；进入自身抛错时，主体和该退出调用不会照常执行。具体是否压制主体异常，还取决于__exit__的返回值。[5]",
      "en": "Not without conditions. The exit guarantee follows a successful __enter__. If entry itself raises, the body and that normal exit call do not occur. Suppression of a body exception also depends on the exit return value.[5]"
    }
  },
  {
    "question": {
      "zh": "生成器return后面的数字会被sum加进去吗？",
      "en": "Does sum include the number after a generator return?"
    },
    "answer": {
      "zh": "不会把它当作另一次yield。本版普通迭代只消费实际产出的值，return结束生成器，返回值有不同角色。还要区分新建生成器和重复消费同一对象。[1]",
      "en": "Not as another yield. Ordinary iteration consumes yielded values; return ends the generator and has a different role. Also distinguish creating a fresh generator from consuming the same object again.[1]"
    }
  },
  {
    "question": {
      "zh": "中英文使用同一代码，是否表示分数完全等值？",
      "en": "Does identical code establish equivalent EN/ZH scores?"
    },
    "answer": {
      "zh": "不建立测量等值。代码、答案和结构保持相同，说明理解、阅读条件和原题接触仍可能影响作答。记录语言、是否查资料以及是否重测，再解释自己的练习结果。",
      "en": "No. Code, keys and structure match, while interpretation, reading conditions and prior exposure can affect responses. Record language, reference use and retakes when interpreting your own practice."
    }
  }
];
