import type { Questionnaire } from "@/lib/questionnaires/types";

/** Entry-only editorial; source-bound programs, keys and full reports remain intact. */
export const javaScriptLandingSections: Questionnaire["guide"] = [
  {
    "id": "javascript-task-map",
    "title": {
      "zh": "JavaScript测试练什么？四组代码阅读任务",
      "en": "What does this JavaScript Test practise? Four code-reading groups"
    },
    "paragraphs": [
      {
        "zh": "24道原创选择题覆盖值与运算符、绑定与函数、数组与对象、Promise与错误，每组六题。你需要读取完整片段，预测打印文本或执行前的语法失败；完成后免费查看四组正确数、全部代码、所选、答案、解析与四篇完整复习指南。约10分钟为阅读估计，本版不计时。",
        "en": "Twenty-four original multiple-choice questions cover values and operators, bindings and functions, arrays and objects, and Promises and errors, with six items per group. Read each complete snippet and predict printed text or a pre-execution syntax failure. Completion opens four section counts, every program, your selections, keys, explanations and four full revision guides, free. Ten minutes is an estimate, without a timer."
      },
      {
        "zh": "练习要求读懂给定代码的语义，而非在网站提交程序或完成项目。它适合复习转换、作用域、数据变化和异步控制流这些具体规则；没有DOM、网络请求、数据库或框架题。JavaScript语言规则与宿主接口需要分别看，不能用这24题代表完整前端、Node服务端或软件工程能力。[4]",
        "en": "The task is to interpret supplied code, rather than submit a program or build a project. Revise specific conversion, scope, data-change and asynchronous-control rules. There are no DOM, network, database or framework tasks. Language semantics and host APIs require separate attention; these 24 questions do not cover complete front-end, Node back-end or software-engineering work.[4]"
      }
    ]
  },
  {
    "id": "javascript-environment",
    "title": {
      "zh": "先固定环境：Node 24.19.0与独立ES模块",
      "en": "Fix the environment first: Node 24.19.0 and independent ES modules"
    },
    "paragraphs": [
      {
        "zh": "每段代码按Node 24.19.0中的独立.mjs文件阅读，ES模块采用严格模式。Node以.mjs等明确标记识别ES模块。[4] 每题重新开始，不能把上一题的变量、对象或队列带到下一题；也不要把浏览器控制台、普通script或CommonJS中的默认行为代入本题。",
        "en": "Read each snippet as its own .mjs file under Node 24.19.0, with ES-module strict mode. Node recognizes explicit ES-module markers including .mjs.[4] Start each question afresh: variables, objects and queued work do not carry between items. Do not silently substitute a browser console, a classic script or CommonJS."
      },
      {
        "zh": "本轮已在该精确Node版本复跑全部24段：22段按答案打印，两段按预期未过语法检查。核查解析与输出能支持这些片段的答案，不意味着覆盖所有引擎或最新JavaScript特性。复习时可先写预测，再在自己的临时.mjs中核对；网站本身不执行访问者提供的代码。",
        "en": "All 24 snippets were rerun for this editorial in that exact Node version: 22 printed their keyed output and two failed syntax checking as expected. These checks support those outcomes, not every engine or the latest language features. Predict first, then optionally check a disposable local .mjs file. This site does not execute visitor-supplied code."
      }
    ]
  },
  {
    "id": "javascript-types",
    "title": {
      "zh": "值与运算符：类型转换要按实际操作追踪",
      "en": "Values and operators: trace conversion for the actual operation"
    },
    "paragraphs": [
      {
        "zh": "加号在基本值中遇字符串时可拼接，减法则走数值运算路径，不能套“一律当数字”或“一律拼接”。[1] 独立新例分别算\"8\" + 3与\"8\" - 3，结果为文本83与数值5；用冒号连接打印为83:5。先标两侧类型，再辨操作符、转换和结果类型，最后才看控制台外观。",
        "en": "For primitive operands, addition can concatenate when a string is present; subtraction follows numeric conversion.[1] A fresh comparison of \"8\" + 3 with \"8\" - 3 gives the string 83 and number 5, printed together as 83:5. Identify operand types, operator, conversion and result type before relying on the appearance of console text."
      },
      {
        "zh": "空值与假值也要分开。新例用空字符串分别计算\"\" ?? \"alt\"和\"\" || \"alt\"，以竖线连接得到|alt：前者保留空字符串，后者选后备值。严格相等、Number转换和Number.isNaN则各回答不同问题；遇到NaN，先看它从哪步产生，不能把转换失败一概当作抛出异常。",
        "en": "Separate nullish values from falsy ones. Fresh expressions \"\" ?? \"alt\" and \"\" || \"alt\", joined with a vertical bar, print |alt: one preserves the empty string while the other selects the fallback. Strict equality, Number conversion and Number.isNaN perform different operations. Trace where NaN arose rather than treating every unsuccessful numeric conversion as a thrown exception."
      }
    ]
  },
  {
    "id": "javascript-bindings",
    "title": {
      "zh": "绑定与闭包：区分创建次数、访问关系与修改",
      "en": "Bindings and closures: distinguish creation, access and mutation"
    },
    "paragraphs": [
      {
        "zh": "const限制重赋绑定，不会把它指向的普通对象自动冻结；块中同名let可建立另一条绑定。读函数时还要区分创建闭包与调用闭包。新例make每次新建n=10，并返回每次令n加3的函数；a=make()、b=make()后依次调用a、b、a，输出13:13:16。a与b来自两次创建，a自己的两次调用共享其绑定。",
        "en": "A const binding cannot be reassigned, but its ordinary object is not automatically frozen. A block-local let can introduce a separate binding with the same name. Distinguish creating a closure from invoking it: a fresh make function creates n=10 and returns a function adding three. After a=make() and b=make(), calls a, b, a yield 13:13:16. Separate creations have separate counters; repeated calls to a share its counter."
      },
      {
        "zh": "复习时画“名称→对象”与“函数→可访问绑定”的简图，不把它当引擎物理内存图。再单独记录默认形参初始化：undefined与null、零、空字符串不是相同输入。遇到重复声明或普通const缺初始化器，应先判断模块能否开始执行，不急着计算后面的console.log。",
        "en": "Sketch names pointing to objects and functions retaining access to bindings, without claiming a physical memory layout. Record parameter initialization separately: undefined is a different input from null, zero or an empty string. For duplicate declarations or an ordinary const without initialization, first decide whether module execution can begin."
      }
    ]
  },
  {
    "id": "javascript-array-pipeline",
    "title": {
      "zh": "数组变换：回调、边界和初始值逐步核对",
      "en": "Array transformations: inspect callbacks, boundaries and initial values"
    },
    "paragraphs": [
      {
        "zh": "map与filter建立新数组，但回调仍可能产生副作用；方法名称不能替代阅读回调。[2] 新例[4,0,9]先filter(n=>n>=4)，再map(n=>n*2)，结果为[8,18]，源数组长度仍为3。若只把>=改成>，4就被排除；解释答案时须指出实际边界，而非只说“筛选大数”。",
        "en": "map and filter construct new arrays, while callbacks can still cause side effects.[2] A fresh [4,0,9] filtered by n>=4 and mapped by n*2 produces [8,18], with source length still three. Changing >= to > excludes four. Name the actual boundary rather than merely saying that large numbers are selected."
      },
      {
        "zh": "reduce还需把显式初值算进去。[2] 新例[4,9].reduce((sum,n)=>sum+n,10)从10开始，得到23；它不是只把数组元素加成13。逐步列输入、回调返回值、累加器和输出，再分别检查源是否被当前回调改变。题本中的纯数值回调，不证明所有对象数组或稀疏数组都按同一细节处理。",
        "en": "Include an explicit reduce initial value.[2] Fresh code [4,9].reduce((sum,n)=>sum+n,10) starts at ten and yields 23, not the elements’ sum of 13. Trace inputs, callback results, accumulator and output, then separately inspect source mutation. These numeric examples do not cover all details of object-valued or sparse arrays."
      }
    ]
  },
  {
    "id": "javascript-object-identity",
    "title": {
      "zh": "对象与原型：外层复制、共享嵌套与属性自有",
      "en": "Objects and prototypes: outer copies, nested sharing and ownership"
    },
    "paragraphs": [
      {
        "zh": "新例a={cfg:{ok:false}}，b={...a}后令b.cfg.ok=true，a.cfg.ok也为true，但a===b为false。外层身份不同，cfg仍指向同一个嵌套对象。若在另一个新例中令a的ok初始为true，使用c={...a,cfg:{...a.cfg}}再把c.cfg.ok改false，便得到a为true、c为false；这只是额外复制了该层，不是通用深复制。",
        "en": "Fresh a={cfg:{ok:false}} and b={...a}, followed by b.cfg.ok=true, leave a.cfg.ok true while a===b is false. The outer objects differ but share cfg. In a separate example with a initially true, c={...a,cfg:{...a.cfg}} allows c.cfg.ok=false while a remains true. This copies that extra layer, not an arbitrary deep structure."
      },
      {
        "zh": "属性读取得到值，不代表属性属于当前对象；原型链查找与Object.hasOwn是两个检查。Set大小也不是输入数组长度，重复字符串只保留一个相等值。复盘时把“外层是否相同”“哪层仍共享”“从哪里读到”“是否自有”分别回答，避免把这些问题缩成一个“是否复制成功”。",
        "en": "Finding a property value does not establish ownership: prototype-chain lookup and Object.hasOwn answer different questions. A Set’s size likewise differs from input length when equal strings repeat. Review outer identity, shared layers, lookup location and ownership separately instead of reducing them to whether a copy “worked.”"
      }
    ]
  },
  {
    "id": "javascript-promise-trace",
    "title": {
      "zh": "Promise：追踪同步步骤、返回值与输入顺序",
      "en": "Promises: trace synchronous steps, returned values and input order"
    },
    "paragraphs": [
      {
        "zh": "先完成当前同步步骤，再沿题定Promise链跟踪每个反应。新例先注册Promise.resolve(6)的then，回调把12加入log并返回7，下个then打印log与值；注册后同步把sync加入log，最终打印sync,12:7。数组顺序、返回值和下游收到的值是三个需要分别核对的记录，不要都写成“异步晚点执行”。",
        "en": "Trace current synchronous work before the supplied Promise chain. A fresh Promise.resolve(6) reaction pushes 12 into log and returns seven; the next reaction prints the log and value. A synchronous push of sync after registration produces sync,12:7. Track array contents, returned value and downstream input separately, rather than replacing the trace with “async runs later.”"
      },
      {
        "zh": "Promise.all按输入位置收集履行值，而非按完成先后排序。[3] 新例first尚待手动resolve，second已履行，Promise.all([first,second])创建后再使first履行为first，得到first:second。catch正常返回值可使下游履行，抛错则走拒绝路径；本版没有网络、定时器混排或取消机制题，不能由这些片段推断所有宿主回调顺序。",
        "en": "Promise.all collects fulfillment values by input position rather than completion order.[3] In a fresh example first is manually resolved after second has fulfilled; Promise.all([first,second]) still yields first:second. A normal catch return can fulfill the downstream promise, whereas throwing follows rejection. These snippets do not test networking, mixed timers or cancellation, and do not settle every host callback order."
      }
    ]
  },
  {
    "id": "javascript-error-phases",
    "title": {
      "zh": "错误类型与发生阶段：名称相同不代表路径相同",
      "en": "Error names and phases: a shared name does not imply the same path"
    },
    "paragraphs": [
      {
        "zh": "模块自身语法检查失败时，其console.log不会开始执行；有效模块在运行时仍可抛出错误。新例在try中调用JSON.parse解析文本{\"ok\":}，JSON不完整，catch可打印caught:SyntaxError。这里JavaScript片段已成功开始执行，不能因为名称是SyntaxError就选成“模块执行前语法错误”。",
        "en": "A module that fails its own syntax check does not begin executing its console.log statements. A valid module can still throw at runtime. Fresh JSON.parse input {\"ok\":} inside try is invalid JSON and can be caught as caught:SyntaxError. JavaScript execution has already begun; that error name alone does not establish a module parse failure."
      },
      {
        "zh": "冻结属性赋值还依赖严格模式。按本版ES模块条件，给不可写属性赋值会抛TypeError，原属性不会因此改成新数值。复习时按“能解析吗→执行到哪步→抛了什么→谁捕获→最终打印什么”核对；不要依赖完整英文报错句，因为不同引擎或版本可能有不同措辞。",
        "en": "Assigning a non-writable frozen property also depends on strictness. Under this bank’s ES-module conditions it throws TypeError and leaves the property unchanged. Review parsing, executed step, thrown value, handler and final output in sequence. Do not rely on full diagnostic wording, which can vary by engine or version."
      }
    ]
  },
  {
    "id": "javascript-score-evidence",
    "title": {
      "zh": "怎样使用正确数？从逐题证据到下一次练习",
      "en": "Using correct counts: from item evidence to the next exercise"
    },
    "paragraphs": [
      {
        "zh": "每题答对1、其他有效选择0，四组各0–6，总0–24，没有速度或部分分。新算例[3,5,2,4]与[5,2,4,3]均为14，却对应不同复习位置。任何结果都保留24条解析与四篇各七节完整指南；正确数本身不能诊断是类型、阅读、回调还是记忆造成错误。",
        "en": "Each keyed answer earns one, another valid choice zero: four 0–6 counts sum to 0–24, without speed or partial credit. Fresh vectors [3,5,2,4] and [5,2,4,3] both total 14 but point to different items for review. Every result preserves 24 explanations and four seven-section guides. Counts alone cannot diagnose whether an error involved types, reading, callbacks or memory."
      },
      {
        "zh": "先独立预测，再读解析并找出最早分歧的一步，最后只改变一个条件重写小片段。代码语义有规范与运行结果可核对，[1][2][3][4] 但本题本尚无开发者常模、招聘效标或中英文等值研究，不输出初中高等级、百分位、岗位推荐或证书。固定题组重测也可能受记忆影响，理解迁移宜用未见过的代码检验。",
        "en": "Predict independently, locate the first divergence from the explanation, then rewrite a small snippet changing one condition. Specifications and execution support checks of code semantics,[1][2][3][4] while this bank has no developer norms, hiring-criterion study or established cross-language equivalence. It assigns no proficiency tier, percentile, job recommendation or certificate. Use unfamiliar code to investigate transfer after studying a fixed bank."
      }
    ]
  }
];

export const javaScriptLandingFaq: Questionnaire["faq"] = [
  {
    "question": {
      "zh": "这是JavaScript代码阅读测试，还是在线编程考试？",
      "en": "Is this code reading or an online programming examination?"
    },
    "answer": {
      "zh": "这是24题代码阅读选择练习，不要求写代码、上传项目或运行访问者脚本。它记录对给定输出与语法结果的判断，和独立完成应用功能属于不同任务。",
      "en": "It is a 24-item code-reading practice. You do not submit code, upload a project or run visitor scripts. Recognizing a supplied outcome is a different task from independently implementing an application."
    }
  },
  {
    "question": {
      "zh": "为什么要明确.mjs和Node版本？",
      "en": "Why specify .mjs and a Node version?"
    },
    "answer": {
      "zh": "模块标记、严格模式和宿主影响解释条件。.mjs明确按ES模块读取，所有题独立按Node 24.19.0核验；不要把浏览器控制台或CommonJS当成题中环境。[4]",
      "en": "Module markers, strictness and the host define interpretation conditions. Each independent .mjs snippet was checked under Node 24.19.0. Do not substitute a browser console or CommonJS.[4]"
    }
  },
  {
    "question": {
      "zh": "JavaScript与Java测试可以互相换算吗？",
      "en": "Can JavaScript and Java test counts be converted?"
    },
    "answer": {
      "zh": "不能。名称相近但语言、题目与规则不同，本页不是Java测验，也未与其他语言或平台建立分数等值关系。",
      "en": "No. The languages, items and rules differ despite the similar names. This is not a Java quiz, and its counts have not been equated with other languages or platforms."
    }
  },
  {
    "question": {
      "zh": "const是不是表示整个对象不可修改？",
      "en": "Does const make an entire object immutable?"
    },
    "answer": {
      "zh": "不是。const限制绑定重赋，普通对象的属性仍可按自身规则修改；Object.freeze又是另一操作，且只冻结该对象本层。读题时分别追踪绑定、对象和嵌套对象。",
      "en": "No. const prevents binding reassignment; an ordinary object’s properties remain subject to their own rules. Object.freeze is a separate, shallow operation. Track the binding, object and nested objects separately."
    }
  },
  {
    "question": {
      "zh": "map创建新数组，是否意味着回调没有副作用？",
      "en": "Does map creating a new array mean its callback has no side effects?"
    },
    "answer": {
      "zh": "不意味着。map本身创建结果数组，回调仍可以修改对象或其他状态。本站题的结论依赖给定回调，不能把它推广到任意map代码。[2]",
      "en": "No. map constructs a result array, but a callback can mutate objects or other state. This bank’s answer depends on its particular callback, not a guarantee about arbitrary map code.[2]"
    }
  },
  {
    "question": {
      "zh": "Promise.all的结果按谁先完成排序吗？",
      "en": "Does Promise.all order results by completion time?"
    },
    "answer": {
      "zh": "不是。成功履行时，结果数组对应输入位置。先后完成影响等待过程，不会把这些位置重新排序；拒绝也不自动说明其他任务已取消。[3]",
      "en": "No. On fulfillment the result array follows input positions. Completion timing affects waiting rather than reordering those positions; rejection does not automatically cancel other work.[3]"
    }
  },
  {
    "question": {
      "zh": "SyntaxError是否总意味着JavaScript未开始执行？",
      "en": "Does SyntaxError always mean JavaScript never started?"
    },
    "answer": {
      "zh": "不是。模块自身语法失败在执行前；有效程序运行时调用JSON.parse也可能抛SyntaxError，并可被外层try/catch捕获。先判断发生阶段，再判断输出。",
      "en": "No. A module’s syntax failure precedes execution, while valid code can call JSON.parse at runtime and catch a SyntaxError. Identify the phase before predicting output."
    }
  },
  {
    "question": {
      "zh": "英文代码相同，中英文正确数就完全等值吗？",
      "en": "Does identical English code establish equivalent EN/ZH scores?"
    },
    "answer": {
      "zh": "不建立等值。两语保持同一代码、答案键和报告结构，说明理解与阅读条件仍可能影响作答。记录语言、查阅资料及是否见过题目，再解释自己的练习记录。",
      "en": "No. The code, keys and report structure match, while interpretation and reading conditions can affect answers. Record language, reference use and prior exposure when reviewing your own attempts."
    }
  }
];
