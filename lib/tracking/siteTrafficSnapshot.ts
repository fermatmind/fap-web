import { open, stat } from "node:fs/promises";
import { isIP } from "node:net";
import { createInterface } from "node:readline";

const LOG_PATH = "/opt/fermatmind/openresty/logs/access.log";
const MAX_BYTES = 256 * 1024 * 1024;
const MAX_IPS = 250_000;
const SHANGHAI_OFFSET_MS = 8 * 60 * 60 * 1000;
const LOG_LINE = /^(\S+) \S+ \S+ \[(\d{2})\/([A-Za-z]{3})\/(\d{4}):(\d{2}:\d{2}:\d{2}) ([+-]\d{4})\] "(\S+) ([^ "\s]+) [^"]+" (\d{3}) \d+ "[^"]*" "([^"]*)"/;
const PRIVATE_SEGMENT = /\/(?:api|account|admin|cms-preview|email|history|internal|ops|orders?|pay|payment|reports?|results?|share)(?:\/|$)/i;
const AUTOMATED_AGENT = /bot\b|crawler|spider|headless|lighthouse|slurp|facebookexternalhit|preview|pingdom/i;

export function isPublicPageRequest(target: string, agent: string): boolean {
  const [path, query] = target.split("?", 2);
  return (path === "/" || /^\/(?:zh|en|zh-TW)(?:\/|$)/.test(path))
    && !PRIVATE_SEGMENT.test(path)
    && !/\.[a-z0-9]{1,8}$/i.test(path)
    && !/%(?:2f|5c|2e)/i.test(path)
    && !/(?:^|&)(?:_rsc|__nextDataReq)=/.test(query ?? "")
    && agent.startsWith("Mozilla/")
    && !AUTOMATED_AGENT.test(agent);
}

type SiteTraffic = {
  date: string;
  through: number;
  pageRequests: number;
  uniqueIps: number;
};

let pending: Promise<SiteTraffic> | undefined;
let cached: SiteTraffic | undefined;

export function readTodaySiteTraffic(): Promise<SiteTraffic> {
  const now = Date.now();
  const date = new Date(now + SHANGHAI_OFFSET_MS).toISOString().slice(0, 10);
  if (cached?.date === date && now - cached.through * 1000 < 60_000) return Promise.resolve(cached);
  pending ??= readSiteTraffic(LOG_PATH, now)
    .then((snapshot) => (cached = snapshot))
    .finally(() => { pending = undefined; });
  return pending;
}

export async function readSiteTraffic(logPath: string, now: number): Promise<SiteTraffic> {
  const through = Math.floor(now / 1000);
  const date = new Date(now + SHANGHAI_OFFSET_MS).toISOString().slice(0, 10);
  const start = Date.parse(`${date}T00:00:00+08:00`);
  const ips = new Set<string>();
  const identity: Array<{ path: string; dev: number; ino: number }> = [];
  const signal = AbortSignal.timeout(10_000);
  let covered = false;
  let bytes = 0;
  let pageRequests = 0;

  for (const path of [logPath, `${logPath}.1`, `${logPath}.2`]) {
    const file = await open(path, "r");
    try {
      const { size, dev, ino } = await file.stat();
      identity.push({ path, dev, ino });
      bytes += size;
      if (bytes > MAX_BYTES || signal.aborted) throw new Error("Traffic scan exceeded its budget");
      if (size === 0) continue;
      const input = file.createReadStream({ end: size - 1, autoClose: false, signal });
      try {
        const lines = createInterface({ input, crlfDelay: Infinity });
        for await (const line of lines) {
          const match = LOG_LINE.exec(line);
          if (!match) continue;
          const [, address, day, month, year, time, offset, method, target, status, agent] = match;
          const occurred = Date.parse(`${day} ${month} ${year} ${time} GMT${offset}`);
          if (occurred <= start) covered = true;
          if (!(occurred >= start && occurred <= through * 1000)) continue;
          if (method !== "GET" || (status !== "200" && status !== "304") || !isPublicPageRequest(target, agent)) continue;
          pageRequests++;
          const ip = address.toLowerCase().replace(/^::ffff:(?=\d+\.)/, "");
          if (isIP(ip)) ips.add(ip);
          if (ips.size > MAX_IPS) throw new Error("Traffic IP count exceeded its budget");
        }
      } finally {
        input.destroy();
      }
    } finally {
      await file.close();
    }
    if (covered) break;
  }

  if (!covered) throw new Error("Traffic logs do not cover the start of the day");
  for (const observed of identity) {
    const current = await stat(observed.path);
    if (current.dev !== observed.dev || current.ino !== observed.ino) throw new Error("Traffic log rotated during scan");
  }

  return { date, through, pageRequests, uniqueIps: ips.size };
}
