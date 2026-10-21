"use client";

import Link from "next/link";
import Script from "next/script";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  ChevronRight,
  Compass,
  FileText,
  HelpCircle,
  House,
  LayoutGrid,
  LogOut,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { getOrCreateAnonId } from "@/lib/anon";
import { ApiError } from "@/lib/api-client";
import { getMyAttempts, type MeAttemptItem } from "@/lib/api/v0_3";
import { ensureFmTokenReady } from "@/lib/auth/authRetry";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import {
  acceptAccountSession,
  confirmAccountEmail,
  downloadAccountPdf,
  getAccount,
  getAccountOrders,
  getLoginChallenge,
  googleLogin,
  logoutAccount,
  requestAccountRecovery,
  requestEmailLogin,
  requestGoogleAccountLink,
  updateAccount,
  type Account,
  type AccountOrder,
  type AccountMembership,
  type AccountSession,
  type LoginChallenge,
} from "@/lib/account/api";
import { clearAccountSession } from "@/lib/account/storage";
import styles from "./AccountCenter.module.css";

export const ACCOUNT_TESTS = [
  {
    code: "MBTI",
    zh: "MBTI 人格",
    en: "MBTI personality",
    slug: "mbti-personality-test-16-personality-types",
    topicZh: "偏好与日常选择",
    topicEn: "Preferences and everyday choices",
  },
  {
    code: "BIG5_OCEAN",
    zh: "大五人格",
    en: "Big Five",
    slug: "big-five-personality-test-ocean-model",
    topicZh: "五个连续人格维度",
    topicEn: "Five continuous personality dimensions",
  },
  {
    code: "ENNEAGRAM",
    zh: "九型人格",
    en: "Enneagram",
    slug: "enneagram-personality-test-nine-types",
    topicZh: "动机与行为模式",
    topicEn: "Motivations and patterns",
  },
  {
    code: "RIASEC",
    zh: "职业兴趣",
    en: "Career interests",
    slug: "holland-career-interest-test-riasec",
    topicZh: "兴趣与真实工作任务",
    topicEn: "Interests and real work tasks",
  },
  {
    code: "IQ",
    zh: "智商测试",
    en: "IQ assessment",
    slug: "iq-test-intelligence-quotient-assessment",
    topicZh: "矩阵推理表现",
    topicEn: "Matrix reasoning performance",
  },
  {
    code: "EQ_60",
    zh: "情商测试",
    en: "Emotional intelligence",
    slug: "eq-test-emotional-intelligence-assessment",
    topicZh: "情绪能力自评",
    topicEn: "Emotional skills self-report",
  },
] as const;
const sections = [
  "overview",
  "assessments",
  "reports",
  "career",
  "settings",
] as const;
type Section = (typeof sections)[number];
export function accountScale(code?: string) {
  return code?.startsWith("IQ_") ? "IQ" : code;
}
export function completedTests(items: MeAttemptItem[]) {
  return new Set(
    items
      .filter(
        (item) =>
          item.has_result === true ||
          (item.has_result === undefined && Boolean(item.type_code)),
      )
      .map((item) => accountScale(item.scale_code)),
  );
}
function hasSavedResult(item: MeAttemptItem) {
  return (
    item.has_result === true ||
    (item.has_result === undefined && Boolean(item.type_code))
  );
}
function resultHref(item: MeAttemptItem, locale: Locale) {
  return item.access_summary?.actions?.page_href ===
    `/result/${item.attempt_id}`
    ? localizedPath(`/result/${encodeURIComponent(item.attempt_id)}`, locale)
    : null;
}
function reportLabel(item: MeAttemptItem, zh: boolean) {
  const summary = item.access_summary;
  if (!summary) return zh ? "查看结果状态" : "Check result status";
  if (["deleted", "expired"].includes(summary.access_state ?? ""))
    return zh ? "暂不可用" : "Unavailable";
  if (["pending", "restoring"].includes(summary.report_state ?? ""))
    return zh ? "报告生成中" : "Report processing";
  if (summary.access_state === "locked")
    return zh ? "未解锁 · 可预览" : "Locked · preview available";
  if (summary.report_state === "unavailable")
    return zh ? "暂不可用" : "Unavailable";
  return summary.access_state === "ready"
    ? zh
      ? "可阅读"
      : "Ready to read"
    : zh
      ? "预览可用"
      : "Preview available";
}
function message(error: unknown, zh: boolean) {
  if (error instanceof ApiError && error.status === 401)
    return zh
      ? "登录已过期，请重新登录。"
      : "Your session expired. Please sign in again.";
  if (error instanceof ApiError && error.status === 409)
    return zh
      ? "该身份或结果已属于其他账号，未进行关联。"
      : "This identity or result belongs to another account. Nothing was linked.";
  return zh
    ? "暂时无法完成操作，请重试；也可以通过邮箱找回结果。"
    : "Unable to complete this action. Try again or recover your results by email.";
}

type GoogleApi = {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        nonce: string;
        auto_select: boolean;
        callback: (result: { credential: string }) => void;
      }) => void;
      renderButton: (
        element: HTMLElement,
        options: {
          type: string;
          theme: string;
          size: string;
          text: string;
          width: number;
          locale: string;
        },
      ) => void;
      disableAutoSelect: () => void;
    };
  };
};
declare global {
  interface Window {
    google?: GoogleApi;
  }
}

function GoogleLogin({
  locale,
  onSession,
  allowEmail = true,
}: {
  locale: Locale;
  onSession: (session: AccountSession) => Promise<void>;
  allowEmail?: boolean;
}) {
  const zh = locale === "zh";
  const [challenge, setChallenge] = useState<LoginChallenge | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [ticket, setTicket] = useState("");
  const [sent, setSent] = useState(false);
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [emailCaptured, setEmailCaptured] = useState(false);
  const target = useRef<HTMLDivElement>(null);
  const refresh = useCallback(async () => {
    setError("");
    try {
      setChallenge(await getLoginChallenge());
    } catch (e) {
      setError(message(e, zh));
    }
  }, [zh]);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  useEffect(() => {
    if (
      !ready ||
      !challenge?.client_id ||
      !challenge.nonce ||
      !challenge.challenge_id ||
      !window.google ||
      !target.current
    )
      return;
    const element = target.current;
    const challengeId = challenge.challenge_id;
    window.google.accounts.id.initialize({
      client_id: challenge.client_id,
      nonce: challenge.nonce,
      auto_select: false,
      callback: async ({ credential }) => {
        setBusy(true);
        setError("");
        try {
          const result = await googleLogin(credential, challengeId, locale);
          if (result.status === "verification_required")
            setTicket(result.verification_ticket ?? "");
          else await onSession(result);
        } catch (e) {
          setError(message(e, zh));
          void refresh();
        } finally {
          setBusy(false);
        }
      },
    });
    window.google.accounts.id.renderButton(element, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      width: 280,
      locale: zh ? "zh_CN" : "en",
    });
    return () => {
      element.innerHTML = "";
    };
  }, [ready, challenge, locale, onSession, refresh, zh]);
  if (!allowEmail && !challenge?.configured) return null;
  return (
    <div className={styles.login}>
      <ShieldCheck size={22} aria-hidden="true" />
      <h2>
        {allowEmail
          ? zh ? "登录，保存你的探索" : "Keep your results together"
          : zh ? "连接 Google 账号" : "Connect Google"}
      </h2>
      <p>
        {zh
          ? "登录后，在不同设备继续查看结果与已购报告。"
          : "Sign in to return to your results and purchased reports across devices."}
      </p>
      {allowEmail && (
        <form className={styles.emailLogin} onSubmit={async (event) => {
          event.preventDefault();
          setBusy(true);
          setError("");
          try {
            const delivery = await requestEmailLogin(email.trim(), locale);
            setEmailCaptured(delivery.verification_email_captured === true);
            setEmailSent(true);
          } catch (e) {
            setError(e instanceof ApiError && e.status === 429
              ? (zh ? "请求过于频繁，请稍后再试。" : "Too many requests. Please try again later.")
              : (zh ? "登录邮件暂时无法发送，请稍后重试。" : "Sign-in email could not be sent. Please try again later."));
          } finally {
            setBusy(false);
          }
        }}>
          <label>
            {zh ? "邮箱" : "Email"}
            <input type="email" autoComplete="email" required maxLength={254}
              value={email} onChange={(event) => {
                setEmail(event.target.value);
                setEmailSent(false);
                setEmailCaptured(false);
              }} />
          </label>
          <button type="submit" className={styles.primary} disabled={busy}>
            {busy
              ? (zh ? "请稍候…" : "Please wait…")
              : emailSent
                ? (emailCaptured ? (zh ? "重新生成测试邮件" : "Regenerate test email") : (zh ? "重新发送登录邮件" : "Resend sign-in email"))
                : (zh ? "用邮箱登录 / 注册" : "Continue with email")}
          </button>
          <p>{zh
            ? "无需密码。首次验证邮箱后创建账号，登录链接15分钟内有效。"
            : "No password needed. Verify a new email to create an account. Sign-in links expire in 15 minutes."}</p>
          {emailSent && <p role="status">{emailCaptured
            ? (zh ? "测试环境：验证邮件已记录，未实际投递。请使用测试邮件中的链接验收。" : "Test environment: the email was captured, not delivered. Use the captured verification link to test sign-in.")
            : (zh ? "登录邮件已发送。请在收件箱或垃圾邮件中查收，打开链接后确认登录。" : "Check your inbox or spam folder. Open the email link and confirm to sign in.")}</p>}
        </form>
      )}
      {allowEmail && challenge?.configured && (
        <p className={styles.loginDivider}>
          {zh ? "或使用 Google 继续" : "Or continue with Google"}
        </p>
      )}
      {challenge?.configured ? (
        <>
          <Script
            src={`https://accounts.google.com/gsi/client?hl=${zh ? "zh-CN" : "en"}`}
            strategy="afterInteractive"
            onReady={() => setReady(true)}
            onError={() =>
              setError(
                zh
                  ? "Google 暂时无法加载。你可以使用邮箱登录。"
                  : "Google could not load. You can sign in with email.",
              )
            }
          />
          <div ref={target} aria-busy={busy} />
          {!ready && !error && (
            <span role="status">
              {zh ? "正在加载 Google 登录…" : "Loading Google sign-in…"}
            </span>
          )}
        </>
      ) : null}
      {ticket && (
        <div className={styles.notice}>
          <p>
            {zh
              ? "已有账号使用此邮箱，请先验证邮箱再关联 Google。"
              : "An account already uses this email. Verify ownership before linking Google."}
          </p>
          <button
            type="button"
            disabled={sent || busy}
            onClick={async () => {
              setBusy(true);
              try {
                await requestGoogleAccountLink(ticket, locale);
                setSent(true);
              } catch (e) {
                setError(message(e, zh));
              } finally {
                setBusy(false);
              }
            }}
          >
            {sent
              ? zh
                ? "验证邮件已发送"
                : "Verification email sent"
              : zh
                ? "发送关联验证邮件"
                : "Send verification email"}
          </button>
        </div>
      )}
      {error && <p role="alert">{error}</p>}
      <div className={styles.loginLinks}>
        <Link href={localizedPath("/results/lookup", locale)}>
          {zh ? "用邮箱找回结果" : "Recover results by email"}{" "}
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
        {challenge?.configured && <button
          type="button"
          className={styles.textButton}
          disabled={busy}
          onClick={() => {
            setReady(Boolean(window.google));
            void refresh();
          }}
        >
          {zh ? "重新加载登录" : "Reload sign-in"}
        </button>}
      </div>
    </div>
  );
}

function CompletionMap({
  completed,
  zh,
}: {
  completed: Set<string | undefined>;
  zh: boolean;
}) {
  const count = ACCOUNT_TESTS.filter((test) => completed.has(test.code)).length;
  return (
    <div className={styles.map}>
      <svg
        viewBox="0 0 400 400"
        role="img"
        aria-label={
          zh
            ? `六项测评中已完成${count}项；颜色只表示完成状态`
            : `${count} of six assessments completed; color indicates completion only`
        }
      >
        <circle
          cx="200"
          cy="200"
          r="160"
          fill="none"
          stroke="#e6eaf0"
          strokeWidth="1"
        />
        <circle
          cx="200"
          cy="200"
          r="148"
          fill="none"
          stroke="#e6eaf0"
          strokeWidth="1"
          strokeDasharray="2 8"
        />
        {ACCOUNT_TESTS.map((test, i) => {
          const a = ((i * 60 - 118) * Math.PI) / 180,
            b = ((i * 60 - 62) * Math.PI) / 180;
          const point = (r: number, angle: number) =>
            `${(200 + r * Math.cos(angle)).toFixed(3)},${(200 + r * Math.sin(angle)).toFixed(3)}`;
          return (
            <path
              key={test.code}
              d={`M ${point(85, a)} L ${point(132, a)} A 132 132 0 0 1 ${point(132, b)} L ${point(85, b)} A 85 85 0 0 0 ${point(85, a)} Z`}
              fill={completed.has(test.code) ? "#2165d6" : "#e9edf3"}
            />
          );
        })}
        <circle cx="200" cy="200" r="69" fill="white" stroke="#e4e9f0" />
        <text
          x="200"
          y="206"
          textAnchor="middle"
          fontSize="43"
          fontWeight="650"
          fill="#182536"
        >
          {count}
          <tspan fontSize="20" fill="#768396">
            {" "}
            / 6
          </tspan>
        </text>
        <text x="200" y="233" textAnchor="middle" fontSize="12" fill="#768396">
          {zh ? "已完成测评" : "COMPLETED"}
        </text>
        {ACCOUNT_TESTS.map((test, i) => {
          const angle = ((i * 60 - 90) * Math.PI) / 180;
          return (
            <text
              key={test.code}
              x={(200 + 177 * Math.cos(angle)).toFixed(3)}
              y={(204 + 177 * Math.sin(angle)).toFixed(3)}
              textAnchor="middle"
              fontSize="12"
              fill="#556579"
            >
              {test.code === "BIG5_OCEAN"
                ? "Big Five"
                : test.code === "EQ_60"
                  ? "EQ"
                  : test.code === "ENNEAGRAM"
                    ? zh
                      ? "九型"
                      : "Ennea"
                    : test.code}
            </text>
          );
        })}
      </svg>
      <p>
        {zh
          ? "记录完成进度，各项测评独立解读。"
          : "A record of completion. Each assessment is interpreted separately."}
      </p>
    </div>
  );
}

export default function AccountCenter({ locale }: { locale: Locale }) {
  const zh = locale === "zh",
    router = useRouter(),
    search = useSearchParams();
  const rawSection = search.get("section") ?? "overview";
  const section: Section = sections.includes(rawSection as Section)
    ? (rawSection as Section)
    : "overview";
  const view = section === "career" ? "career" : "self";
  const [account, setAccount] = useState<Account | null>(null);
  const [items, setItems] = useState<MeAttemptItem[]>([]);
  const [membership, setMembership] = useState<AccountMembership | null>(null);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [orderPage, setOrderPage] = useState(1),
    [orderLast, setOrderLast] = useState(1);
  const [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  const [preview, setPreview] = useState(false),
    [filter, setFilter] = useState(search.get("scale") ?? "all");
  const queryScale = search.get("scale") ?? "all";
  useEffect(() => {
    setFilter(queryScale);
  }, [queryScale]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [verification, setVerification] = useState("");
  const [preferredLocale, setPreferredLocale] = useState<Locale>(locale);
  const [name, setName] = useState(""),
    [email, setEmail] = useState(""),
    [busy, setBusy] = useState(false);
  const titles = zh
    ? ["仪表板", "测评中心", "结果与报告", "职业探索", "账号设置"]
    : [
        "Overview",
        "Assessment center",
        "Results & reports",
        "Career exploration",
        "Account settings",
      ];
  const icons = [House, LayoutGrid, FileText, Compass, Settings];
  const path = (p: string) => localizedPath(p, locale);
  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      await ensureFmTokenReady({ locale, anonId: getOrCreateAnonId() });
      const result = await getAccount();
      setAccount(result.account);
      setPreview(result.preview);
      setName(result.account?.name ?? "");
      setPreferredLocale(result.account?.locale ?? locale);
      // Fetch all pages so the six-assessment completion total does not depend on list pagination.
      const history: MeAttemptItem[] = [];
      let page = 1,
        last = 1;
      do {
        const response = await getMyAttempts({
          page,
          pageSize: 50,
          locale,
          cache: "no-store",
        });
        history.push(...(response.items ?? []));
        last = Number(response.meta?.last_page ?? 1);
        page++;
      } while (page <= last);
      setItems(
        history.filter((item) =>
          ACCOUNT_TESTS.some(
            (test) => test.code === accountScale(item.scale_code),
          ),
        ),
      );
    } catch (e) {
      setItems([]);
      setError(message(e, zh));
      if (e instanceof ApiError && e.status === 401) {
        clearAccountSession();
        setAccount(null);
      }
    } finally {
      setLoading(false);
    }
  }, [locale, zh]);
  useEffect(() => {
    void load();
  }, [load]);
  useEffect(() => {
    const readVerification = () => {
      const params = new URLSearchParams(window.location.hash.slice(1));
      const token = params.get("verify");
      if (!token) return;
      setVerification(token);
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    };
    readVerification();
    const changed = (event: StorageEvent) => {
      if (event.key === "fm_account_session_v1") {
        setItems([]);
        setOrders([]);
        void load();
      }
    };
    window.addEventListener("storage", changed);
    window.addEventListener("hashchange", readVerification);
    return () => {
      window.removeEventListener("storage", changed);
      window.removeEventListener("hashchange", readVerification);
    };
  }, [load]);
  useEffect(() => {
    if (section !== "settings" || !account) return;
    let current = true;
    setOrdersLoading(true);
    setOrders([]);
    getAccountOrders(orderPage)
      .then((r) => {
        if (current) {
          setOrders(r.items);
          setMembership(r.membership ?? null);
          setOrderLast(r.meta.last_page);
        }
      })
      .catch((e) => {
        if (current) setError(message(e, zh));
      })
      .finally(() => {
        if (current) setOrdersLoading(false);
      });
    return () => {
      current = false;
    };
  }, [section, account, orderPage, zh]);
  const onSession = useCallback(
    async (session: AccountSession) => {
      try {
        await acceptAccountSession(session);
      } catch (e) {
        setNotice(
          zh
            ? "登录成功，部分旧结果尚未关联。请在账号设置中验证原邮箱恢复。"
            : "Signed in. Some older results still need ownership verification in settings.",
        );
        if (!session.fm_token) throw e;
      }
      await load();
    },
    [load, zh],
  );
  const go = (next: Section) => {
    router.replace(path(`/account?section=${next}`), { scroll: false });
    setError("");
    setNotice("");
  };
  const tabKey = (
    event: KeyboardEvent<HTMLButtonElement>,
    next: "self" | "career",
  ) => {
    if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) {
      event.preventDefault();
      const target =
        event.key === "Home" ? "self" : event.key === "End" ? "career" : next;
      go(target === "self" ? "overview" : "career");
      document.getElementById(`${target}-tab`)?.focus();
    }
  };
  const completed = completedTests(items);
  const completedCount = ACCOUNT_TESTS.filter((test) =>
    completed.has(test.code),
  ).length;
  const savedResults = items.filter(hasSavedResult);
  const latest = savedResults.find((item) => resultHref(item, locale));
  const nextTest = ACCOUNT_TESTS.find((test) => !completed.has(test.code));
  const rowHref = (item: MeAttemptItem) => resultHref(item, locale);
  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await updateAccount(name, preferredLocale);
      setAccount(r.account);
      if (preferredLocale !== locale)
        router.replace(
          localizedPath("/account?section=settings", preferredLocale),
        );
      setNotice(zh ? "资料已保存。" : "Profile saved.");
    } catch (e) {
      setError(message(e, zh));
    } finally {
      setBusy(false);
    }
  }
  const submittedReports = items.filter(
    (item) =>
      hasSavedResult(item) || (item.is_submitted ?? Boolean(item.submitted_at)),
  );
  const reportRows =
    filter === "all"
      ? submittedReports
      : submittedReports.filter(
          (item) => accountScale(item.scale_code) === filter,
        );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Link href={path("/")} className={styles.brand}>
          {zh ? "费马测试" : "FermatMind"}
        </Link>
        <span className={styles.headerCaption}>
          {zh ? "我的账户" : "MY ACCOUNT"}
        </span>
        <div className={styles.headerRight}>
          <Link
            href={localizedPath(
              `/account?section=${section}`,
              zh ? "en" : "zh",
            )}
            lang={zh ? "en" : "zh"}
          >
            {zh ? "EN" : "简中"}
          </Link>
          <span
            className={styles.avatar}
            aria-label={account?.name ?? (zh ? "访客" : "Guest")}
          >
            {account?.name?.slice(0, 1) ?? "F"}
          </span>
        </div>
      </header>
      <div className={styles.workspace}>
        <aside className={styles.sidebar}>
          <p className={styles.navLabel}>
            {zh ? "个人空间" : "PERSONAL SPACE"}
          </p>
          <nav aria-label={zh ? "账号导航" : "Account navigation"}>
            {sections.map((key, i) => {
              const Icon = icons[i];
              return (
                <button
                  type="button"
                  key={key}
                  aria-current={section === key ? "page" : undefined}
                  onClick={() => go(key)}
                >
                  <Icon size={18} aria-hidden="true" />
                  {titles[i]}
                </button>
              );
            })}
            <Link href={path("/support")}>
              <HelpCircle size={18} aria-hidden="true" />
              {zh ? "帮助" : "Help"}
            </Link>
          </nav>
          <div className={styles.sidebarFoot}>
            <ShieldCheck size={17} aria-hidden="true" />
            <span>
              {zh ? "你的结果，私密保存" : "Your results stay private"}
            </span>
          </div>
        </aside>
        <main className={styles.main} id="account-main" aria-busy={loading}>
          <div className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>{zh ? "我的账户" : "MY ACCOUNT"}</p>
              <h1>{titles[sections.indexOf(section)]}</h1>
            </div>
            {account && (
              <p className={styles.welcome}>
                {zh ? `你好，${account.name}` : `Welcome, ${account.name}`}
              </p>
            )}
          </div>
          {preview && (
            <p className={styles.preview}>
              {zh
                ? "本地验收环境 · DEMO 演示资产 · 与生产数据隔离"
                : "Local acceptance environment · DEMO assets · isolated from production"}
            </p>
          )}
          {error && (
            <div role="alert" className={styles.error}>
              {error}{" "}
              <button type="button" onClick={() => void load()}>
                {zh ? "重试" : "Retry"}
              </button>
            </div>
          )}
          {notice && (
            <p role="status" className={styles.notice}>
              {notice}
            </p>
          )}
          {verification && (
            <div className={styles.verify}>
              <h2>
                {zh ? "确认登录或关联账号" : "Confirm sign-in or account link"}
              </h2>
              <p>
                {zh
                  ? "仅在你本人请求此邮件时继续。验证后可登录账号，或完成你请求的结果与权益关联。"
                  : "Continue only if you requested this email. Confirm to sign in or complete your requested result and purchase recovery."}
              </p>
              <button
                type="button"
                className={styles.primary}
                disabled={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    const r = await confirmAccountEmail(verification);
                    if (r.fm_token) await onSession(r);
                    else await load();
                    setVerification("");
                    setNotice(r.fm_token
                      ? (zh ? "登录成功。" : "Signed in.")
                      : (zh ? "关联已完成。" : "Link completed."));
                  } catch (e) {
                    setError(message(e, zh));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {zh ? "确认并继续" : "Confirm and continue"}
              </button>
            </div>
          )}
          {(section === "overview" || section === "career") && (
            <>
              <div className={styles.viewBar}>
                <p>
                  {zh ? "从结果出发，选择下一步" : "Start with your results"}
                </p>
                <div
                  role="tablist"
                  aria-label={zh ? "仪表板视图" : "Dashboard view"}
                >
                  <button
                    id="self-tab"
                    role="tab"
                    aria-controls="self-panel"
                    aria-selected={view === "self"}
                    tabIndex={view === "self" ? 0 : -1}
                    onKeyDown={(event) => tabKey(event, "career")}
                    onClick={() => go("overview")}
                  >
                    {zh ? "认识自己" : "Know yourself"}
                    <small>
                      {zh
                        ? "人格 · 兴趣 · 能力"
                        : "Personality · interests · skills"}
                    </small>
                  </button>
                  <button
                    id="career-tab"
                    role="tab"
                    aria-controls="career-panel"
                    aria-selected={view === "career"}
                    tabIndex={view === "career" ? 0 : -1}
                    onKeyDown={(event) => tabKey(event, "self")}
                    onClick={() => go("career")}
                  >
                    {zh ? "职业探索" : "Explore careers"}
                    <small>
                      {zh ? "方向 · 任务 · 路径" : "Directions · tasks · paths"}
                    </small>
                  </button>
                </div>
              </div>
              {view === "self" ? (
                <section
                  id="self-panel"
                  role="tabpanel"
                  aria-labelledby="self-tab"
                  className={styles.overview}
                >
                  <CompletionMap completed={completed} zh={zh} />
                  <div className={styles.overviewRight}>
                    <p className={styles.eyebrow}>
                      {zh ? "你的测评进度" : "YOUR ASSESSMENTS"}
                    </p>
                    <h2>
                      {zh
                        ? `已完成 ${completedCount} 项测评`
                        : `${completedCount} assessments completed`}
                    </h2>
                    <p className={styles.muted}>
                      {zh
                        ? "查看已保存的结果，或继续一项新的测评。"
                        : "Return to a saved result or explore another assessment."}
                    </p>
                    {!account ? (
                      <GoogleLogin locale={locale} onSession={onSession} />
                    ) : (
                      <div className={styles.next}>
                        <span>{zh ? "下一步" : "NEXT STEP"}</span>
                        <h3>
                          {nextTest
                            ? zh
                              ? `下一项：${nextTest.zh}`
                              : `Next: ${nextTest.en}`
                            : zh
                              ? "查看最近保存的结果"
                              : "Read your latest saved result"}
                        </h3>
                        <Link
                          className={styles.primary}
                          href={
                            nextTest
                              ? path(`/tests/${nextTest.slug}`)
                              : latest
                                ? rowHref(latest)!
                                : path("/account?section=reports")
                          }
                        >
                          {nextTest
                            ? zh
                              ? "开始测评"
                              : "Start assessment"
                            : zh
                              ? "查看结果"
                              : "Open result"}
                          <ArrowRight size={16} aria-hidden="true" />
                        </Link>
                      </div>
                    )}
                    <div className={styles.progressList}>
                      {ACCOUNT_TESTS.map((test) => (
                        <Link
                          key={test.code}
                          href={path(
                            completed.has(test.code)
                              ? `/account?section=reports&scale=${test.code}`
                              : `/tests/${test.slug}`,
                          )}
                        >
                          <span
                            className={
                              completed.has(test.code)
                                ? styles.completeDot
                                : styles.emptyDot
                            }
                          >
                            {completed.has(test.code) && (
                              <Check size={11} aria-hidden="true" />
                            )}
                          </span>
                          <strong>{zh ? test.zh : test.en}</strong>
                          <span>
                            {completed.has(test.code)
                              ? zh
                                ? "已完成"
                                : "Completed"
                              : zh
                                ? "待探索"
                                : "Explore"}
                          </span>
                          <ChevronRight size={15} aria-hidden="true" />
                        </Link>
                      ))}
                    </div>
                    <Link
                      className={styles.textButton}
                      href={path("/account?section=career")}
                    >
                      {zh
                        ? "用测评结果探索职业"
                        : "Use your results to explore careers"}
                      <ArrowRight size={15} aria-hidden="true" />
                    </Link>
                  </div>
                </section>
              ) : (
                <CareerPanel
                  locale={locale}
                  items={items}
                  loading={loading}
                  failed={Boolean(error)}
                  tabbed
                />
              )}
              {section === "overview" && (
                <section className={styles.recent}>
                  <div className={styles.sectionHeading}>
                    <h2>{zh ? "最近的结果" : "Recent results"}</h2>
                    <button
                      type="button"
                      className={styles.textButton}
                      onClick={() => go("reports")}
                    >
                      {zh ? "全部报告" : "All reports"}
                      <ArrowRight size={15} />
                    </button>
                  </div>
                  {loading ? (
                    <p role="status">
                      {zh ? "正在读取结果…" : "Loading results…"}
                    </p>
                  ) : savedResults.length ? (
                    renderReports(savedResults.slice(0, 3))
                  ) : (
                    <p className={styles.muted}>
                      {zh
                        ? "当前身份下还没有已保存的结果。完成一项测评，或通过原邮箱找回。"
                        : "No saved results for this identity yet. Complete an assessment or recover results by email."}
                    </p>
                  )}
                </section>
              )}
            </>
          )}
          {section === "assessments" && (
            <section aria-label={zh ? "选择测评" : "Choose an assessment"}>
              <div className={styles.reportToolbar}>
                <p>
                  {zh
                    ? "选择想了解的方面。已有结果可以直接阅读，重测会保留原记录。"
                    : "Choose what to explore. Read saved results or take a new assessment without replacing earlier records."}
                </p>
                <Link
                  className={styles.textButton}
                  href={path("/account?section=reports")}
                >
                  {zh ? "查看全部结果" : "View all results"}
                  <ArrowRight size={15} />
                </Link>
              </div>
              <div className={styles.testGrid}>
                {ACCOUNT_TESTS.map((test, i) => {
                  const saved = savedResults.find(
                    (item) => accountScale(item.scale_code) === test.code,
                  );
                  return (
                    <article className={styles.testItem} key={test.code}>
                      <span className={styles.testNumber}>0{i + 1}</span>
                      <div>
                        <h2>{zh ? test.zh : test.en}</h2>
                        <p>{zh ? test.topicZh : test.topicEn}</p>
                        <span>
                          {loading
                            ? zh
                              ? "正在读取记录…"
                              : "Loading history…"
                            : error
                              ? zh
                                ? "记录暂不可用"
                                : "History unavailable"
                              : saved
                                ? zh
                                  ? "已有结果"
                                  : "Result saved"
                                : zh
                                  ? "尚无结果"
                                  : "No saved result"}
                        </span>
                        <div className={styles.testActions}>
                          {saved && (
                            <Link
                              className={styles.textButton}
                              href={path(
                                `/account?section=reports&scale=${test.code}`,
                              )}
                            >
                              {zh ? "查看已有结果" : "View saved results"}
                              <ArrowRight size={15} />
                            </Link>
                          )}
                          <Link
                            className={
                              saved ? styles.retake : styles.textButton
                            }
                            href={path(`/tests/${test.slug}`)}
                          >
                            {saved
                              ? zh
                                ? "重新测评"
                                : "Take again"
                              : zh
                                ? "开始测评"
                                : "Start assessment"}
                            {!saved && <ArrowRight size={15} />}
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
          {section === "reports" && (
            <section className={styles.reports}>
              <div className={styles.reportToolbar}>
                <p>
                  {zh
                    ? "查看已提交测评的结果、报告和可用 PDF；每次记录分别保存。"
                    : "Read submitted results, reports and available PDFs. Each attempt is kept separately."}
                </p>
                <label>
                  {zh ? "筛选测评" : "Filter assessment"}
                  <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">
                      {zh ? "全部测评" : "All assessments"}
                    </option>
                    {ACCOUNT_TESTS.map((test) => (
                      <option value={test.code} key={test.code}>
                        {zh ? test.zh : test.en}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              {loading ? (
                <p role="status">{zh ? "正在读取报告…" : "Loading reports…"}</p>
              ) : reportRows.length ? (
                renderReports(reportRows)
              ) : (
                <div className={styles.empty}>
                  <FileText size={32} aria-hidden="true" />
                  <h2>{zh ? "这里还没有报告" : "No reports here yet"}</h2>
                  <p>
                    {zh
                      ? "使用原邮箱找回旧结果，或开始一项新的测评。"
                      : "Recover earlier results by email, or start an assessment."}
                  </p>
                  <div className={styles.testActions}>
                    <Link
                      className={styles.primary}
                      href={path("/account?section=assessments")}
                    >
                      {zh ? "选择一项测评" : "Choose an assessment"}
                    </Link>
                    <Link
                      className={styles.textButton}
                      href={path("/results/lookup")}
                    >
                      {zh ? "找回旧结果" : "Recover earlier results"}
                    </Link>
                  </div>
                </div>
              )}
            </section>
          )}
          {section === "settings" && (
            <div className={styles.settings}>
              {account ? (
                <>
                  <section>
                    <h2>{zh ? "个人资料" : "Profile"}</h2>
                    <form onSubmit={saveProfile}>
                      <label>
                        {zh ? "姓名" : "Name"}
                        <input
                          value={name}
                          required
                          maxLength={100}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </label>
                      <label>
                        {zh ? "语言" : "Language"}
                        <select
                          value={preferredLocale}
                          onChange={(e) =>
                            setPreferredLocale(e.target.value as Locale)
                          }
                        >
                          <option value="zh">简体中文</option>
                          <option value="en">English</option>
                        </select>
                      </label>
                      <p className={styles.muted}>{account.email}</p>
                      <p className={styles.connected}>
                        <ShieldCheck size={17} />
                        {account.google_connected
                          ? zh
                            ? "Google 已连接"
                            : "Google connected"
                          : zh
                            ? "Google 尚未连接"
                            : "Google not connected"}
                      </p>
                      <button
                        className={styles.primary}
                        type="submit"
                        disabled={busy}
                      >
                        {zh ? "保存资料" : "Save profile"}
                      </button>
                    </form>
                    {!account.google_connected && (
                      <GoogleLogin locale={locale} onSession={onSession} allowEmail={false} />
                    )}
                  </section>
                  <section>
                    <h2>
                      {zh
                        ? "关联旧结果与已购权益"
                        : "Recover earlier results and purchases"}
                    </h2>
                    <p className={styles.muted}>
                      {zh
                        ? "输入保存结果或购买报告时使用的邮箱，验证后关联到当前账号。"
                        : "Enter the email used to save results or buy reports. Verify ownership to link them to this account."}
                    </p>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setBusy(true);
                        try {
                          await requestAccountRecovery(email, locale);
                          setNotice(
                            zh
                              ? "验证邮件已发送，请在15分钟内打开并确认关联。"
                              : "Verification email sent. Open it and confirm within 15 minutes.",
                          );
                        } catch (err) {
                          setError(message(err, zh));
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      <label>
                        {zh ? "原邮箱" : "Original email"}
                        <input
                          type="email"
                          autoComplete="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </label>
                      <button type="submit" disabled={busy}>
                        {zh ? "发送验证邮件" : "Send verification email"}
                      </button>
                    </form>
                  </section>
                  <section>
                    <h2>{zh ? "订单与权益" : "Orders and access"}</h2>
                    {membership && !ordersLoading && (
                      <p className={styles.muted}>
                        {zh ? "会员状态：" : "Membership: "}
                        {membership.active
                          ? membership.plan_id === "lifetime"
                            ? zh
                              ? "永久卡"
                              : "Lifetime"
                            : zh
                              ? "年卡"
                              : "Annual"
                          : zh
                            ? "未开通"
                            : "Not active"}
                        {membership.active && membership.expires_at
                          ? ` · ${zh ? "有效期至" : "Expires"} ${membership.expires_at.slice(0, 10)}`
                          : ""}
                      </p>
                    )}
                    {ordersLoading ? (
                      <p role="status">
                        {zh ? "正在读取订单…" : "Loading orders…"}
                      </p>
                    ) : orders.length ? (
                      <>
                        {orders.map((order) => (
                          <div className={styles.order} key={order.order_no}>
                            <div>
                              <strong>{order.order_no}</strong>
                              <small>
                                {order.created_at.slice(0, 10)} ·{" "}
                                {order.currency}{" "}
                                {(order.amount_cents / 100).toFixed(2)}
                              </small>
                            </div>
                            <span>
                              {order.payment_state === "refunded"
                                ? zh
                                  ? "已退款"
                                  : "Refunded"
                                : order.payment_state === "paid"
                                  ? zh
                                    ? "已支付"
                                    : "Paid"
                                  : zh
                                    ? ({
                                        failed: "支付失败",
                                        canceled: "已取消",
                                        expired: "已失效",
                                      }[order.payment_state] ?? "待完成")
                                    : ({
                                        failed: "Payment failed",
                                        canceled: "Canceled",
                                        expired: "Expired",
                                      }[order.payment_state] ?? "Pending")}
                            </span>
                            <small>
                              {zh
                                ? ({
                                    granted: "已授权",
                                    revoked: "已撤销授权",
                                    grant_failed: "授权失败",
                                  }[order.grant_state] ?? "等待授权")
                                : ({
                                    granted: "Access granted",
                                    revoked: "Access revoked",
                                    grant_failed: "Access failed",
                                  }[order.grant_state] ?? "Awaiting access")}
                            </small>
                            <Link
                              href={path(
                                `/orders/${encodeURIComponent(order.order_no)}`,
                              )}
                            >
                              {zh ? "查看订单" : "View order"}
                              <ChevronRight size={14} />
                            </Link>
                          </div>
                        ))}
                        <div className={styles.pagination}>
                          <button
                            disabled={orderPage <= 1}
                            onClick={() => setOrderPage((v) => v - 1)}
                          >
                            {zh ? "上一页" : "Previous"}
                          </button>
                          <span>
                            {orderPage} / {orderLast}
                          </span>
                          <button
                            disabled={orderPage >= orderLast}
                            onClick={() => setOrderPage((v) => v + 1)}
                          >
                            {zh ? "下一页" : "Next"}
                          </button>
                        </div>
                      </>
                    ) : (
                      <p className={styles.muted}>
                        {zh
                          ? "当前账号暂无已关联订单。可验证购买邮箱恢复原订单与权益。"
                          : "No linked orders yet. Verify your purchase email to recover them."}
                      </p>
                    )}
                    <Link href={path("/orders/lookup")}>
                      {zh ? "找回订单" : "Recover an order"}
                      <ArrowRight size={14} />
                    </Link>
                  </section>
                  <section>
                    <h2>{zh ? "数据与隐私" : "Data and privacy"}</h2>
                    <p className={styles.muted}>
                      {zh
                        ? "如需数据副本或删除账号，请通过现有帮助渠道提交请求。"
                        : "Use our support channel to request a data copy or account deletion."}
                    </p>
                    <div className={styles.settingLinks}>
                      <Link href={path("/privacy")}>
                        {zh ? "隐私政策" : "Privacy policy"}
                      </Link>
                      <Link href={path("/support")}>
                        {zh ? "数据请求与帮助" : "Data requests and help"}
                      </Link>
                    </div>
                    <button
                      type="button"
                      className={styles.signout}
                      disabled={busy}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await logoutAccount();
                          clearAccountSession();
                          window.google?.accounts.id.disableAutoSelect();
                          window.location.assign(path("/account"));
                        } catch (e) {
                          setError(message(e, zh));
                          setBusy(false);
                        }
                      }}
                    >
                      <LogOut size={16} />
                      {zh ? "退出登录" : "Sign out"}
                    </button>
                  </section>
                </>
              ) : (
                <GoogleLogin locale={locale} onSession={onSession} />
              )}
            </div>
          )}
          <footer className={styles.footer}>
            <span>© {new Date().getFullYear()} FermatMind</span>
            <Link href={path("/privacy")}>{zh ? "隐私" : "Privacy"}</Link>
            <Link href={path("/support")}>{zh ? "帮助" : "Help"}</Link>
          </footer>
        </main>
      </div>
      <nav
        className={styles.mobileNav}
        aria-label={zh ? "账号底部导航" : "Account bottom navigation"}
      >
        {sections.map((key, i) => {
          const Icon = icons[i];
          return (
            <button
              key={key}
              type="button"
              aria-current={section === key ? "page" : undefined}
              onClick={() => go(key)}
            >
              <Icon size={19} />
              <span>
                {zh
                  ? ["总览", "做测评", "看结果", "职业", "我的"][i]
                  : ["Home", "Tests", "Reports", "Career", "Account"][i]}
              </span>
            </button>
          );
        })}
      </nav>
    </div>
  );

  function renderReports(rows: MeAttemptItem[]) {
    return (
      <div className={styles.reportList}>
        {rows.map((item) => {
          const test = ACCOUNT_TESTS.find(
              (test) => test.code === accountScale(item.scale_code),
            ),
            href = rowHref(item),
            pdf = item.access_summary?.actions?.pdf_href;
          const form =
            item.mbti_form_v1 ??
            item.big5_form_v1 ??
            item.enneagram_form_v1 ??
            item.riasec_form_v1;
          return (
            <article key={item.attempt_id} className={styles.reportRow}>
              <span className={styles.reportIcon}>
                <FileText size={20} />
              </span>
              <div className={styles.reportInfo}>
                <h3>
                  {test ? (zh ? test.zh : test.en) : item.scale_code}
                  {item.type_code && <span>{item.type_code}</span>}
                </h3>
                <p>
                  {item.submitted_at &&
                  !Number.isNaN(Date.parse(item.submitted_at))
                    ? new Intl.DateTimeFormat(zh ? "zh-CN" : "en", {
                        dateStyle: "medium",
                      }).format(new Date(item.submitted_at))
                    : zh
                      ? "日期未返回"
                      : "Date unavailable"}
                  {form?.question_count || item.question_count
                    ? ` · ${form?.question_count || item.question_count} ${zh ? "题" : "questions"}`
                    : ""}
                  {item.scale_version ? ` · ${item.scale_version}` : ""}
                </p>
              </div>
              <span className={styles.reportStatus}>
                {reportLabel(item, zh)}
              </span>
              <div className={styles.reportActions}>
                {pdf && (
                  <button
                    type="button"
                    disabled={busy}
                    aria-label={zh ? "下载 PDF" : "Download PDF"}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        await downloadAccountPdf(item.attempt_id, pdf);
                      } catch (e) {
                        setError(message(e, zh));
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    <ArrowDownToLine size={16} />
                    PDF
                  </button>
                )}
                {href ? (
                  <Link href={href}>
                    {zh ? "查看结果" : "Open result"}
                    <ArrowRight size={15} />
                  </Link>
                ) : (
                  <span className={styles.muted}>
                    {zh ? "暂不可用" : "Unavailable"}
                  </span>
                )}
              </div>
            </article>
          );
        })}
      </div>
    );
  }
}

function CareerPanel({
  locale,
  items,
  loading,
  failed,
  tabbed = false,
}: {
  locale: Locale;
  items: MeAttemptItem[];
  loading: boolean;
  failed: boolean;
  tabbed?: boolean;
}) {
  const zh = locale === "zh";
  const path = (value: string) => localizedPath(value, locale);
  const saved = items.filter(hasSavedResult);
  const interest = saved.find(
    (item) => accountScale(item.scale_code) === "RIASEC",
  );
  const personality = saved.find(
    (item) => accountScale(item.scale_code) === "MBTI",
  );
  const interestHref = interest ? resultHref(interest, locale) : null;
  const sourceRows = [interest, personality].filter(
    (item): item is MeAttemptItem => Boolean(item),
  );
  const steps = [
    {
      href:
        interestHref ??
        path(
          interest
            ? "/account?section=reports&scale=RIASEC"
            : "/tests/holland-career-interest-test-riasec",
        ),
      title: zh ? "读懂职业兴趣" : "Understand your interests",
      copy: interest
        ? zh
          ? "从已保存的职业兴趣结果中，找出愿意尝试的任务与环境。"
          : "Use your saved interest result to identify tasks and environments to try."
        : zh
          ? "先完成职业兴趣测评，获得六类工作兴趣的线索。"
          : "Start with a career interest assessment to explore six kinds of work interests.",
      action: interestHref
        ? zh
          ? "阅读兴趣结果"
          : "Read interest result"
        : interest
          ? zh
            ? "查看兴趣报告状态"
            : "Check interest report status"
          : zh
            ? "开始职业兴趣测评"
            : "Start interest assessment",
    },
    {
      href: path("/career"),
      title: zh ? "比较真实工作" : "Compare real occupations",
      copy: zh
        ? "带着结果里的线索，比较工作任务、环境和入门要求。"
        : "Compare work tasks, environments and entry requirements against your result signals.",
      action: zh ? "浏览职业库" : "Browse occupations",
    },
    {
      href: path("/career/guides"),
      title: zh ? "用实践验证方向" : "Test a direction in practice",
      copy: zh
        ? "选择一个候选方向，通过小任务、访谈或项目检验想法。"
        : "Choose a possible direction and test it through a small task, interview or project.",
      action: zh ? "查看职业指南" : "Open career guides",
    },
  ];
  return (
    <section
      id="career-panel"
      role={tabbed ? "tabpanel" : undefined}
      aria-labelledby={tabbed ? "career-tab" : undefined}
      className={styles.career}
    >
      <p className={styles.eyebrow}>
        {zh ? "从结果到行动" : "FROM RESULTS TO ACTION"}
      </p>
      <h2>
        {zh
          ? "先了解兴趣，再探索真实工作"
          : "Start with interests. Explore real work."}
      </h2>
      <p className={styles.muted}>
        {zh
          ? "测评提供探索线索。用工作任务与现实条件，判断一个方向是否值得继续。"
          : "Assessments offer signals. Use real tasks and practical constraints to decide which direction to explore."}
      </p>
      <div className={styles.careerSources}>
        <h3>{zh ? "你的探索起点" : "Your starting point"}</h3>
        {loading ? (
          <p role="status">
            {zh ? "正在读取已保存的结果…" : "Loading saved results…"}
          </p>
        ) : failed ? (
          <p role="status">
            {zh
              ? "结果暂未读取成功，请先使用上方重试。"
              : "Results could not be loaded. Use Retry above."}
          </p>
        ) : sourceRows.length ? (
          sourceRows.map((item) => {
            const href = resultHref(item, locale);
            return (
              <div key={item.attempt_id} className={styles.careerSource}>
                <div>
                  <span>
                    {item.scale_code === "RIASEC"
                      ? zh
                        ? "职业兴趣"
                        : "Career interests"
                      : zh
                        ? "MBTI 人格"
                        : "MBTI personality"}
                  </span>
                  <strong>
                    {item.type_code || (zh ? "已保存结果" : "Saved result")}
                  </strong>
                  <small>{reportLabel(item, zh)}</small>
                </div>
                {href && (
                  <Link className={styles.textButton} href={href}>
                    {zh ? "阅读结果" : "Read result"}
                    <ArrowRight size={15} />
                  </Link>
                )}
              </div>
            );
          })
        ) : (
          <p>
            {zh
              ? "还没有职业兴趣或 MBTI 结果。可以先做测评，也可以直接浏览职业库。"
              : "No career interest or MBTI results yet. Start an assessment or browse occupations directly."}
          </p>
        )}
        {!loading && !failed && interest && (
          <p className={styles.muted}>
            {zh
              ? "这些是已保存的独立测评结果；职业方向还需要结合能力、经历和现实条件。"
              : "These are separate saved assessments. Career decisions also depend on skills, experience and practical constraints."}
          </p>
        )}
      </div>
      {!loading && !failed && (
        <div className={styles.careerGrid}>
          {steps.map((step, index) => (
            <Link href={step.href} key={step.title}>
              <span className={styles.stepNumber}>0{index + 1}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
              <span className={styles.stepAction}>
                {step.action}
                <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      )}
      <Link
        className={styles.textButton}
        href={path("/career/recommendations")}
      >
        {zh
          ? "了解兴趣、人格与职业线索如何结合"
          : "How interests and personality inform career exploration"}
        <ArrowRight size={15} />
      </Link>
    </section>
  );
}
