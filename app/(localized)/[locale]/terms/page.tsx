import type { Metadata } from "next";
import { Container } from "@/components/layout/Container";
import { getDictSync, resolveLocale } from "@/lib/i18n/getDict";
import { buildPageMetadata } from "@/lib/seo/metadata";

type TermsSection = {
  id: string;
  title: string;
  paragraphs: string[];
  listItems?: string[];
};

type TermsCopy = {
  legalKicker: string;
  subtitle: string;
  labels: {
    entityName: string;
    effectiveDate: string;
    lastUpdated: string;
    contact: string;
    contents: string;
  };
  entityValue: string;
  sections: TermsSection[];
};

const EFFECTIVE_DATE_EN = "February 15, 2026";
const EFFECTIVE_DATE_ZH = "2026年2月15日";
const LAST_UPDATED_EN = "February 15, 2026";
const LAST_UPDATED_ZH = "2026年2月15日";
const SUPPORT_EMAIL = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || "support@fermatmind.com";

const TERMS_COPY: Record<"en" | "zh", TermsCopy> = {
  zh: {
    legalKicker: "法律信息",
    subtitle: "请在使用服务前完整阅读本条款。继续使用即表示你同意受本条款约束。",
    labels: {
      entityName: "主体名称",
      effectiveDate: "生效日期",
      lastUpdated: "最近更新",
      contact: "联系邮箱",
      contents: "目录",
    },
    entityValue: "费马测试 FermatMind",
    sections: [
      {
        id: "important-arbitration-notice",
        title: "0. 重要提示：仲裁条款与集体诉讼放弃",
        paragraphs: [
          "在法律允许范围内，你与费马测试 FermatMind 因使用服务产生或与服务相关的争议，应先协商，协商未果后提交仲裁解决。法律允许的小额程序或临时救济除外。",
          "若你不同意本节，请不要使用本服务。",
        ],
        listItems: [
          "你同意放弃由法官或陪审团审理争议的权利。",
          "你同意不以集体诉讼、集体仲裁或代表诉讼方式提出或参与争议。",
          "如出现大规模仲裁，争议可按本条款约定的分批处理机制推进。",
        ],
      },
      {
        id: "scope-and-agreement",
        title: "1. 条款适用范围与协议构成",
        paragraphs: [
          "本条款适用于你访问和使用 FermatMind 网站、移动端页面、应用、插件、小组件、工具、题库、报告、内容、企业版系统及其他相关服务，以上统称服务。",
          "本条款与隐私政策，以及你在使用特定功能时同意的补充规则，共同构成你与我们之间具有法律约束力的协议。",
          "你访问、浏览、注册、购买、使用或以任何方式与服务交互，即表示你已阅读、理解并同意受本协议约束。若你不同意，请立即停止使用服务。",
        ],
      },
      {
        id: "no-medical-care",
        title: "2. 服务性质：非医疗、非治疗、非诊断",
        paragraphs: [
          "FermatMind 提供面向个人与企业团队的心理测评与解释性报告服务，包含人格与偏好测评、职业与学习偏好工具、关系沟通与心理健康科普内容，以及相关报告与建议模块。",
          "我们不是医疗机构，不提供医学诊断、精神科诊疗、心理治疗或处方建议。",
          "服务内容仅用于教育、信息、自我理解与自我筛查参考，不构成医疗意见或治疗方案。",
          "使用服务不会建立医患关系或治疗关系，你与我们的沟通不适用医患保密特权。",
          "若你出现持续性强烈痛苦、明显功能受损，或存在自伤自杀想法，请立即寻求线下专业帮助或联系当地紧急救援服务。",
        ],
      },
      {
        id: "eligibility-and-minors",
        title: "3. 使用资格与未成年人",
        paragraphs: [
          "你应具有订立本协议的法律能力。",
          "若你未满 18 周岁，应在监护人同意与指导下使用服务，并由监护人代表你同意本条款。",
          "若你未满 14 周岁，或你所在法域对儿童年龄阈值更高，请不要自行注册或提交个人信息。如确需使用，应由监护人按隐私政策完成同意与操作。",
          "我们可能对部分测评或功能设置年龄门槛或地区限制。",
        ],
      },
      {
        id: "results-boundary",
        title: "4. 服务内容与结果边界",
        paragraphs: [
          "测评结果与报告依赖你的自评输入、情境状态与理解偏差，可能随时间或情绪变化而波动。",
          "报告可能包含算法或模型自动生成的解释与建议，不保证在任何特定场景下必然准确、完整或适用于你。",
          "你不应将任何测评结果或报告作为重大决定的唯一依据。",
          "企业版与团队版使用者不得将测评作为单一筛选、淘汰或惩戒工具，应遵守公平、非歧视与合规原则。",
        ],
      },
      {
        id: "accounts-and-security",
        title: "5. 账户注册、登录与安全",
        paragraphs: [
          "部分功能需要注册账户。你应提供真实、准确、可联系的信息，并及时更新。",
          "你应妥善保管账号与密码，并对账号下发生的全部行为承担责任。",
          "如你怀疑账号被盗用或存在未授权访问，请立即联系 support@fermatmind.com 并尽快修改密码。",
          "我们有权基于合理判断，对存在安全风险、违法风险或违反本条款的账号采取限制、冻结或终止措施。",
        ],
      },
      {
        id: "billing-renewal-refund",
        title: "6. 订阅、付费报告与企业版：付款、自动续费与退款",
        paragraphs: [
          "我们可能同时提供免费与付费功能，包括一次性报告解锁、订阅服务、企业版方案与增值模块。具体价格、权益、有效期与交付方式以购买页面展示为准。",
          "你同意通过我们支持的支付方式完成付款，并授权我们或支付服务商按订单金额扣款。部分支付方式可能产生预授权或临时冻结资金。",
          "若你购买订阅服务，你授权我们在订阅周期届满时自动续费扣款。你可在周期结束前按页面指引取消续费。取消后已生效周期通常不退费，法律另有强制规定的除外。",
          "数字内容一旦完成报告解锁、内容交付或订阅权益开通，通常不支持无理由退款。若因我们原因导致核心权益无法交付且无法在合理时间修复，或出现重复扣款与明显计费错误，我们会按适用法律与订单规则提供补救、退款或部分退款。",
          "企业版可能涉及管理员、成员管理与团队数据汇总。购买方与管理员应确保其对成员使用服务具有合法授权，并遵守劳动用工、个人信息保护与反歧视等适用法律法规。",
        ],
      },
      {
        id: "user-content",
        title: "7. 用户内容与社区规则",
        paragraphs: [
          "你在服务中发布、上传、提交或展示的文字、图片、音视频、评论、反馈与资料，统称用户内容。",
          "你声明并保证你拥有发布用户内容的权利或已取得必要授权，且用户内容不侵犯第三方知识产权、隐私权、名誉权或其他合法权益。",
          "你不得发布违法、暴力、仇恨、骚扰、欺诈、色情、恶意软件或垃圾营销内容，也不得冒充他人或误导他人。",
          "为提供服务所必需，你授予我们在全球范围内、免费、可再许可和可转授权的使用许可，用于存储、复制、展示、传播及技术处理你的用户内容。",
          "你删除内容或注销账户后，该许可不会当然立即终止，因为技术备份、缓存或法律合规可能要求合理保留期。",
          "我们没有义务预先审核所有用户内容，但有权基于合理判断进行删除、屏蔽、限制展示或下架，并可对重复违规用户采取限制、封禁或终止服务。",
        ],
      },
      {
        id: "acceptable-use",
        title: "8. 允许使用与禁止行为",
        paragraphs: [
          "在你遵守本条款的前提下，我们授予你一项有限、非独占、不可转让、可撤销的许可，用于访问与使用服务。",
          "你不得实施或协助他人实施以下行为：",
        ],
        listItems: [
          "使用爬虫、抓取、批量采集或镜像方式获取题库、报告结构、页面内容、用户数据或商业信息。",
          "逆向工程、反编译、破解、绕过安全机制，或试图获取源代码与算法模型细节。",
          "删除、篡改或遮挡版权、商标、水印或权限控制信息。",
          "未经授权将服务用于商业转售、代测、批量出报告、镜像站搭建或竞品复刻。",
          "上传病毒、木马、恶意脚本，或实施破坏服务稳定性与安全性的行为。",
          "发布违法、侵权、侮辱诽谤、仇恨、骚扰、暴力、色情、欺诈或垃圾信息。",
          "冒充他人、伪造身份或虚构关联关系误导他人。",
        ],
      },
      {
        id: "intellectual-property",
        title: "9. 知识产权",
        paragraphs: [
          "服务及其全部内容与功能，包括题目、报告结构、文本、图形、界面设计、商标标识、软件代码、数据库与模型，均由我们或许可方合法拥有并受法律保护。除本条款明确授权外，你不获得任何权利转让。",
          "你可在我们允许的功能范围内保存或下载你的报告用于个人使用，或企业内部使用。未经书面许可，不得将报告用于商业分发、公开售卖、再许可或制作衍生产品。",
        ],
      },
      {
        id: "copyright-complaints",
        title: "10. 版权投诉与侵权处理",
        paragraphs: [
          "我们尊重知识产权，也要求用户同样遵守。若你认为服务中存在侵犯你著作权或其他权利的内容，请发送邮件至 support@fermatmind.com 并提供以下信息：",
        ],
        listItems: [
          "权利证明与联系方式。",
          "你主张侵权内容的链接或位置。",
          "你善意相信该使用未经授权的声明。",
          "你保证通知内容真实准确的声明。",
        ],
      },
      {
        id: "privacy-and-data",
        title: "11. 隐私与数据",
        paragraphs: [
          "个人信息的收集、使用、存储与披露规则以隐私政策为准。你使用服务即表示你同意我们按隐私政策处理你的信息。",
          "我们可能使用 Cookie 或类似技术以提供和改进服务。",
        ],
      },
      {
        id: "third-party-services",
        title: "12. 第三方服务与外部链接",
        paragraphs: [
          "服务可能包含第三方服务或外部链接，例如支付、统计、客服或外链内容。",
          "第三方服务由其各自运营并适用其自身条款与政策。你使用第三方服务的风险与责任由你自行承担，我们不对第三方服务的可用性、准确性或安全性作保证。",
        ],
      },
      {
        id: "as-is-disclaimer",
        title: "13. 免责声明：按现状提供",
        paragraphs: [
          "在法律允许的最大范围内，服务按现状和可用性提供。我们不保证服务不中断、无错误或完全安全。",
          "我们不保证内容始终准确、完整、及时或适用于你的特定目的，也不保证测评结果必然可重复或可预测现实表现。",
        ],
      },
      {
        id: "limitation-of-liability",
        title: "14. 责任限制",
        paragraphs: [
          "在法律允许的最大范围内，我们不对任何间接损失承担责任，包括利润损失、数据丢失、商誉损害与替代服务成本。",
          "若我们对你承担责任，在任何情况下我们的累计责任以争议事件发生前 12 个月内你为相关服务实际支付的费用总额为上限。若你未付费，则以法律允许的最低限度承担。",
          "部分司法辖区不允许排除或限制某些责任，上述限制可能对你不完全适用。",
        ],
      },
      {
        id: "indemnification",
        title: "15. 赔偿责任",
        paragraphs: [
          "若因你违反本条款、违法使用服务、侵犯第三方权利，或你账号下的行为导致我们或关联方遭受索赔、损失或处罚，你同意对我们进行合理赔偿并承担必要费用，包括合理律师费。",
        ],
      },
      {
        id: "termination",
        title: "16. 终止、暂停与后果",
        paragraphs: [
          "你可随时停止使用服务。如需注销账户，可按页面指引操作或邮件联系 support@fermatmind.com。",
          "若你违反本条款或存在合理风险，我们可限制或终止向你提供服务。",
          "终止后，你对服务的访问权限可能立即停止。你应自行备份依法可导出的信息。个人信息处理规则以隐私政策为准。",
        ],
      },
      {
        id: "changes-to-terms",
        title: "17. 条款变更",
        paragraphs: [
          "我们可能因产品更新、法律合规或安全原因修改本条款。",
          "我们会在页面更新最近更新日期。重大变更可能通过站内提示或邮件通知。变更生效后你继续使用服务，即视为接受更新后的条款。",
        ],
      },
      {
        id: "dispute-resolution",
        title: "18. 争议解决：先协商、后仲裁",
        paragraphs: [
          "你对服务存在争议或投诉时，请先通过 support@fermatmind.com 联系我们并提供必要信息，我们将尽合理努力协商解决。",
          "协商未果且法律允许时，争议应通过具有约束力的双边仲裁解决，而非诉诸法院。法律允许的小额程序或临时救济除外。",
          "仲裁机构及其规则将在争议进入仲裁程序时通过书面通知明确。你可在法律允许范围内提出合理异议。仲裁地为我们运营主体登记地，或法律强制要求的地点。",
          "仲裁应以个人名义进行。除法律禁止外，你同意不以集体、联合、代表或类似方式提出争议。",
          "若在短期内出现 75 件或以上高度相似的仲裁请求，争议可按每批 25 件分批推进，以提高效率。该安排不当然构成集体仲裁。",
        ],
      },
      {
        id: "miscellaneous",
        title: "19. 其他",
        paragraphs: [
          "若本条款部分条款无效，不影响其余条款效力。",
          "本条款与隐私政策构成你与我们就服务事项达成的完整协议。",
          "我们未行使某项权利，不构成对该权利的放弃。",
          "如需联系我们，请发送邮件至 support@fermatmind.com。",
        ],
      },
    ],
  },
  en: {
    legalKicker: "Legal",
    subtitle: "Please read these Terms carefully before using the Services.",
    labels: {
      entityName: "Entity Name",
      effectiveDate: "Effective Date",
      lastUpdated: "Last Updated",
      contact: "Contact",
      contents: "Contents",
    },
    entityValue: "FermatMind",
    sections: [
      {
        id: "important-arbitration-notice",
        title: "0. Important Notice: Arbitration and Class Action Waiver",
        paragraphs: [
          "To the extent permitted by applicable law, disputes arising out of or relating to your use of the Services must be resolved through informal resolution first, then binding arbitration. Small claims procedures and injunctive relief remain available where required by law.",
          "If you do not agree to this section, do not use the Services.",
        ],
        listItems: [
          "You waive the right to have disputes decided by a judge or jury in court.",
          "You waive the right to bring or participate in class actions, class arbitration, or representative proceedings.",
          "If mass arbitration occurs, batching may apply as described in these Terms.",
        ],
      },
      {
        id: "scope-and-agreement",
        title: "1. Scope and Agreement Structure",
        paragraphs: [
          "These Terms govern your access to and use of FermatMind websites, mobile pages, applications, plugins, widgets, tools, item banks, reports, enterprise systems, and related services, collectively referred to as the Services.",
          "These Terms, together with our Privacy Policy and any additional terms shown for specific features, form a legally binding agreement between you and FermatMind.",
          "By accessing, browsing, registering, purchasing, or using the Services, you confirm that you have read, understood, and agreed to this Agreement. If you do not agree, stop using the Services.",
        ],
      },
      {
        id: "no-medical-care",
        title: "2. No Medical Care, No Therapy, No Diagnosis",
        paragraphs: [
          "FermatMind provides assessment tools and interpretive reports for self-understanding, career and learning preferences, relationship communication, and mental health literacy for both individuals and teams.",
          "We are not a medical provider and we do not provide medical, psychiatric, psychotherapy, or prescription services.",
          "The Services are for educational and informational purposes only and are not a substitute for professional diagnosis or treatment.",
          "Use of the Services does not create a doctor-patient or therapist-patient relationship, and communications are not covered by medical privilege.",
          "If you are in crisis, experiencing severe distress, major functional impairment, or self-harm or suicidal thoughts, seek immediate professional support or contact local emergency services.",
        ],
      },
      {
        id: "eligibility-and-minors",
        title: "3. Eligibility and Minors",
        paragraphs: [
          "You must have legal capacity to enter into this Agreement.",
          "If you are under 18, you may use the Services only with parent or guardian consent and supervision.",
          "If you are under 14, or if a higher child age threshold applies in your jurisdiction, do not register or submit personal data unless a guardian completes consent and operation under our Privacy Policy.",
          "We may restrict certain features by age or territory.",
        ],
      },
      {
        id: "results-boundary",
        title: "4. Results and Practical Boundaries",
        paragraphs: [
          "Results and reports depend on self-reported input and context, and may vary over time.",
          "Reports may include model-generated explanations and recommendations and may not be accurate, complete, or fit for every situation.",
          "Do not use any report as the sole basis for major medical, legal, investment, employment, or termination decisions.",
          "Enterprise users must follow fairness, non discrimination, and compliance obligations, and must not use assessments as the only basis for adverse employment action.",
        ],
      },
      {
        id: "accounts-and-security",
        title: "5. Accounts and Security",
        paragraphs: [
          "Some features require an account. You must provide accurate contactable information and keep it updated.",
          "You are responsible for all activity under your account and must protect your credentials.",
          "If you suspect unauthorized access, contact support@fermatmind.com immediately and reset your password.",
          "We may suspend, restrict, or terminate accounts that violate these Terms or create security or legal risk.",
        ],
      },
      {
        id: "billing-renewal-refund",
        title: "6. Paid Reports, Subscriptions, and Enterprise Plans",
        paragraphs: [
          "We may offer free and paid features, including one-time report unlocks, subscriptions, enterprise plans, and add-ons. Pricing, entitlements, validity periods, and delivery methods are shown at checkout.",
          "You authorize FermatMind or our payment provider to charge your selected payment method for your order amount. Some payment methods may involve pre-authorization or temporary holds.",
          "If you purchase a subscription, you authorize automatic renewal billing at the end of each billing cycle unless you cancel renewal before the next renewal date.",
          "Because digital content is delivered immediately, purchases are generally non-refundable after report unlock, content delivery, or subscription activation, except where required by law or where there is material service failure, duplicate charges, or billing error.",
          "Enterprise plans may include admin controls, member management, and aggregated insights. Purchasers and admins must ensure lawful authorization and comply with labor, privacy, and anti-discrimination laws.",
        ],
      },
      {
        id: "user-content",
        title: "7. User Content and Community Rules",
        paragraphs: [
          "User Content includes any text, images, audio, video, comments, feedback, and materials that you post, upload, submit, or display through the Services.",
          "You represent that you own or are authorized to submit your User Content and that it does not violate laws or third party rights.",
          "You must not submit unlawful, hateful, abusive, defamatory, obscene, fraudulent, malicious, or spam content, and you must not impersonate or mislead others.",
          "You grant FermatMind a worldwide, royalty-free, sublicensable, transferable license to host, store, reproduce, display, distribute, and technically process User Content as necessary to operate the Services.",
          "Deletion of User Content or account closure may not remove all copies immediately because backups, caching, and legal retention requirements may apply.",
          "We may remove, restrict, or disable content or accounts when we reasonably believe there is a violation or risk.",
        ],
      },
      {
        id: "acceptable-use",
        title: "8. Acceptable Use",
        paragraphs: [
          "Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, revocable license to use the Services.",
          "You may not do the following, and you may not help others do the following:",
        ],
        listItems: [
          "Scrape, crawl, harvest, mirror, or bulk extract item banks, report structures, content, user data, or business information.",
          "Reverse engineer, decompile, bypass security controls, or attempt to discover source code or model details.",
          "Remove or alter proprietary notices, watermarks, trademarks, or access controls.",
          "Resell, broker, mass generate reports, mirror, or clone the Services without written permission.",
          "Upload malware or interfere with reliability, security, or normal operation of the Services.",
          "Post unlawful, infringing, abusive, hateful, violent, pornographic, deceptive, or spam content.",
          "Impersonate others or misrepresent affiliation.",
        ],
      },
      {
        id: "intellectual-property",
        title: "9. Intellectual Property",
        paragraphs: [
          "The Services and all related content and functionality, including item banks, report structures, text, graphics, interface design, trademarks, software, code, datasets, and models, are owned by FermatMind or its licensors and protected by law.",
          "Except for the license expressly granted in these Terms, no ownership or additional rights are transferred to you.",
          "You may download your own report for personal use, or internal enterprise use where enabled. Commercial distribution, resale, sublicensing, and derivative products require written permission.",
        ],
      },
      {
        id: "copyright-complaints",
        title: "10. Copyright Complaints",
        paragraphs: [
          "If you believe content on the Services infringes your copyright or other rights, send notice to support@fermatmind.com with the following information:",
        ],
        listItems: [
          "Proof of ownership or authority and your contact information.",
          "The allegedly infringing URL or content location.",
          "A good faith statement that the use is unauthorized.",
          "A statement that your notice is accurate.",
        ],
      },
      {
        id: "privacy-and-data",
        title: "11. Privacy",
        paragraphs: [
          "Our Privacy Policy explains how we collect, use, store, and disclose personal data. By using the Services, you consent to processing under the Privacy Policy.",
          "We may use cookies and similar technologies to provide and improve the Services.",
        ],
      },
      {
        id: "third-party-services",
        title: "12. Third Party Services",
        paragraphs: [
          "The Services may link to or integrate with third party services such as payment, analytics, support tools, and external content.",
          "Third parties operate under their own terms and policies. We are not responsible for third party availability, accuracy, or security.",
        ],
      },
      {
        id: "as-is-disclaimer",
        title: "13. Disclaimers",
        paragraphs: [
          "To the maximum extent permitted by law, the Services are provided as is and as available.",
          "We do not warrant uninterrupted, error-free, secure operation, or that content is always accurate, complete, timely, or suitable for your needs.",
        ],
      },
      {
        id: "limitation-of-liability",
        title: "14. Limitation of Liability",
        paragraphs: [
          "To the maximum extent permitted by law, we are not liable for indirect, incidental, consequential, special, or punitive damages, or for losses of profits, goodwill, or data.",
          "If liability is established, our total liability is limited to the amount you paid for relevant Services in the 12 months before the event giving rise to the claim. If you paid nothing, liability is limited to the minimum extent required by law.",
          "Some jurisdictions do not allow certain limitations, so parts of this section may not apply to you.",
        ],
      },
      {
        id: "indemnification",
        title: "15. Indemnification",
        paragraphs: [
          "You agree to indemnify and hold harmless FermatMind and its affiliates, officers, employees, and agents from claims, losses, liabilities, and reasonable legal fees arising from your breach of these Terms, unlawful use, or infringement of third party rights.",
        ],
      },
      {
        id: "termination",
        title: "16. Termination",
        paragraphs: [
          "You may stop using the Services at any time. To delete an account, use the available in-product steps or email support@fermatmind.com.",
          "We may suspend or terminate access if you violate these Terms or create risk.",
          "After termination, access may end immediately. Data handling remains subject to our Privacy Policy.",
        ],
      },
      {
        id: "changes-to-terms",
        title: "17. Changes to These Terms",
        paragraphs: [
          "We may update these Terms for product, security, compliance, or legal reasons.",
          "We will update the Last Updated date and may provide additional notice for material changes. Continued use after changes take effect constitutes acceptance.",
        ],
      },
      {
        id: "dispute-resolution",
        title: "18. Dispute Resolution: Informal Resolution First, Then Arbitration",
        paragraphs: [
          "Before initiating arbitration, contact support@fermatmind.com and provide the information needed for informal resolution.",
          "If informal resolution fails and to the extent permitted by law, disputes will be resolved by binding bilateral arbitration, not court litigation, except for small claims or injunctive relief where allowed.",
          "The arbitration provider and rules will be specified in written notice when arbitration begins. You may raise reasonable objections where permitted by law. The seat of arbitration will be our registered place of business or another location required by mandatory law.",
          "Arbitration proceeds on an individual basis only unless prohibited by law.",
          "If 75 or more substantially similar arbitration demands are filed within a close period, claims may be administered in batches of 25 for efficiency. This does not create class arbitration.",
        ],
      },
      {
        id: "miscellaneous",
        title: "19. Miscellaneous",
        paragraphs: [
          "If any provision is held invalid, the remaining provisions remain in effect.",
          "These Terms and the Privacy Policy form the entire agreement regarding the Services.",
          "Failure to enforce a right does not waive that right.",
          "Contact us at support@fermatmind.com.",
        ],
      },
    ],
  },
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const isZh = locale === "zh";
  const copy = isZh ? TERMS_COPY.zh : TERMS_COPY.en;

  return buildPageMetadata({
    locale,
    pathname: isZh ? "/zh/terms" : "/en/terms",
    title: isZh ? "服务条款" : "Terms of Service",
    description: copy.subtitle,
    alternatesByLocale: {
      en: "/en/terms",
      zh: "/zh/terms",
      xDefault: "/",
    },
  });
}

export default async function TermsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeParam } = await params;
  const locale = resolveLocale(localeParam);
  const dict = getDictSync(locale);
  const isZh = locale === "zh";
  const copy = isZh ? TERMS_COPY.zh : TERMS_COPY.en;
  const effectiveDate = isZh ? EFFECTIVE_DATE_ZH : EFFECTIVE_DATE_EN;
  const lastUpdated = isZh ? LAST_UPDATED_ZH : LAST_UPDATED_EN;

  return (
    <Container as="main" className="max-w-6xl space-y-6 py-10" data-testid="terms-main">
      <section className="relative overflow-hidden rounded-3xl border border-[var(--fm-border-strong)] bg-[linear-gradient(135deg,var(--fm-trust-blue)_0%,#13498a_48%,var(--fm-teal)_100%)] p-6 text-white shadow-[var(--fm-shadow-md)] md:p-8">
        <div className="relative z-10 space-y-3">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[#d9e8ff]">{copy.legalKicker}</p>
          <h1 className="m-0 font-serif text-3xl font-semibold md:text-4xl">{dict.legal.terms_title}</h1>
          <p className="m-0 max-w-3xl text-sm text-[#e5f2ff] md:text-base">{copy.subtitle}</p>
        </div>
        <div className="relative z-10 mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-white/25 bg-white/10 p-3">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[#d8e9ff]">{copy.labels.entityName}</p>
            <p className="m-0 mt-1 text-sm font-semibold text-white">{copy.entityValue}</p>
          </div>
          <div className="rounded-xl border border-white/25 bg-white/10 p-3">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[#d8e9ff]">{copy.labels.effectiveDate}</p>
            <p className="m-0 mt-1 text-sm font-semibold text-white">{effectiveDate}</p>
          </div>
          <div className="rounded-xl border border-white/25 bg-white/10 p-3">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[#d8e9ff]">{copy.labels.lastUpdated}</p>
            <p className="m-0 mt-1 text-sm font-semibold text-white">{lastUpdated}</p>
          </div>
          <div className="rounded-xl border border-white/25 bg-white/10 p-3">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[#d8e9ff]">{copy.labels.contact}</p>
            <a className="mt-1 inline-flex text-sm font-semibold text-white underline-offset-2 hover:underline" href={`mailto:${SUPPORT_EMAIL}`}>
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[15rem_minmax(0,1fr)]">
        <aside className="h-fit rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4 shadow-[var(--fm-shadow-sm)] lg:sticky lg:top-24">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">{copy.labels.contents}</p>
          <nav className="mt-3 space-y-1" aria-label={copy.labels.contents}>
            {copy.sections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="block rounded-lg px-2 py-2 text-sm font-medium text-[var(--fm-text-muted)] hover:bg-[var(--fm-surface-muted)] hover:text-[var(--fm-text)]">
                {section.title}
              </a>
            ))}
          </nav>
        </aside>

        <article className="space-y-4" data-testid="terms-article">
          {copy.sections.map((section) => (
            <section key={section.id} id={section.id} className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)]">
              <h2 className="m-0 font-serif text-2xl font-semibold text-[var(--fm-text)]">{section.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-[var(--fm-text-muted)] md:text-[15px]">
                {section.paragraphs.map((paragraph, index) => (
                  <p key={`${section.id}-p-${index}`} className="m-0">{paragraph}</p>
                ))}
                {section.listItems?.length ? (
                  <ul className="m-0 list-disc space-y-2 pl-5">
                    {section.listItems.map((item, index) => (
                      <li key={`${section.id}-li-${index}`}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </section>
          ))}
        </article>
      </div>
    </Container>
  );
}
