import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function ConsentGate({
  locale,
  text,
  version,
  checkboxLabel,
  checked,
  starting,
  error,
  unavailable = false,
  onCheckedChange,
  onStart,
}: {
  locale: "en" | "zh";
  text: string;
  version?: string;
  checkboxLabel?: string;
  checked: boolean;
  starting?: boolean;
  error?: string | null;
  unavailable?: boolean;
  onCheckedChange: (next: boolean) => void;
  onStart: () => void;
}) {
  const isZh = locale === "zh";
  const unavailableMessage = isZh
    ? "必需的知情说明暂不可用，当前无法开始测评。请刷新页面后重试。"
    : "Required consent content is unavailable, so this assessment cannot start. Refresh the page to try again.";

  return (
    <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="m-0 text-lg font-semibold text-slate-900">{isZh ? "开始前请确认" : "Before you start"}</h2>

      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        <p className="m-0 whitespace-pre-wrap">
          {text || (unavailable ? unavailableMessage : (isZh ? "请先阅读并同意知情同意说明。" : "Please review and accept informed consent."))}
        </p>
      </div>

      {version ? (
        <p className="m-0 text-xs text-slate-500">
          {isZh ? "版本" : "Version"}: {version}
        </p>
      ) : null}

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" disabled={unavailable} checked={checked} onChange={(event) => onCheckedChange(event.target.checked)} />
        {checkboxLabel ?? (isZh ? "我已阅读并同意上述内容" : "I have read and agree to the statement above")}
      </label>

      {error ? <Alert>{error}</Alert> : null}
      {unavailable && text ? <Alert>{unavailableMessage}</Alert> : null}

      <Button type="button" disabled={unavailable || !checked || starting} onClick={onStart}>
        {starting ? (isZh ? "正在开始..." : "Starting...") : isZh ? "同意并开始" : "Agree and start"}
      </Button>
    </div>
  );
}
