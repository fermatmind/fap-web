import { constants, closeSync, fstatSync, lstatSync, openSync, readFileSync } from "node:fs";
import path from "node:path";

export type TrackingRuntime = {
  token?: string;
  origin?: string;
  revision?: string;
};

function exists(file: string): boolean {
  try { lstatSync(file); return true; } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return false;
    throw new Error("TRACKING_RUNTIME_REJECTED");
  }
}

function read(file: string, privateFile: boolean, limit: number): string {
  const descriptor = openSync(file, constants.O_RDONLY | constants.O_NOFOLLOW);
  try {
    const stat = fstatSync(descriptor);
    if (!stat.isFile() || stat.uid !== process.getuid?.() || stat.size > limit
      || (stat.mode & (privateFile ? 0o077 : 0o022)) !== 0) {
      throw new Error("TRACKING_RUNTIME_REJECTED");
    }
    return readFileSync(descriptor, "utf8");
  } finally { closeSync(descriptor); }
}

// Next's standalone server changes cwd to its own immutable release. Both the
// existing systemd ExecStart and PM2 therefore read the same release authority.
// Deployed releases never fall back to a prior process's token environment.
export function resolveTrackingRuntime(
  directory = process.cwd(),
  environment: NodeJS.ProcessEnv = process.env
): TrackingRuntime {
  const file = path.join(directory, ".tracking-runtime.json");
  const marker = path.join(directory, ".tracking-runtime-managed.json");
  const revisionFile = path.join(directory, "REVISION");
  const hasFile = exists(file), hasMarker = exists(marker), hasRevision = exists(revisionFile);
  if (!hasFile && !hasMarker && !hasRevision) {
    return { token: environment.TRACK_INGEST_TOKEN, origin: environment.TRACK_INGEST_API_ORIGIN };
  }
  try {
    const revision = read(revisionFile, false, 128).trim();
    if (!/^[0-9a-f]{40}$/.test(revision)) throw new Error("TRACKING_RUNTIME_REJECTED");
    if (!hasFile && !hasMarker) return { revision };
    if (!hasFile || !hasMarker) throw new Error("TRACKING_RUNTIME_REJECTED");
    const rootStat = lstatSync(directory);
    if (!rootStat.isDirectory() || rootStat.isSymbolicLink() || rootStat.uid !== process.getuid?.()
      || (rootStat.mode & 0o022) !== 0) throw new Error("TRACKING_RUNTIME_REJECTED");
    const values = JSON.parse(read(file, true, 16384));
    const authority = JSON.parse(read(marker, false, 512));
    if (!values || typeof values !== "object" || Array.isArray(values)
      || Object.keys(values).sort().join(",") !== "TRACK_INGEST_API_ORIGIN,TRACK_INGEST_TOKEN"
      || typeof values.TRACK_INGEST_TOKEN !== "string" || values.TRACK_INGEST_TOKEN.length < 32
      || values.TRACK_INGEST_TOKEN.length > 8192 || !/^[A-Za-z0-9_-]+$/.test(values.TRACK_INGEST_TOKEN)
      || !["https://api.fermatmind.com", "https://staging-api.fermatmind.com"].includes(values.TRACK_INGEST_API_ORIGIN)
      || !authority || typeof authority !== "object" || Array.isArray(authority)
      || Object.keys(authority).sort().join(",") !== "origin,revision,schema"
      || authority.schema !== "fermatmind.tracking-runtime.v1" || authority.revision !== revision
      || authority.origin !== values.TRACK_INGEST_API_ORIGIN) throw new Error("TRACKING_RUNTIME_REJECTED");
    return { token: values.TRACK_INGEST_TOKEN, origin: values.TRACK_INGEST_API_ORIGIN, revision };
  } catch { throw new Error("TRACKING_RUNTIME_REJECTED"); }
}
