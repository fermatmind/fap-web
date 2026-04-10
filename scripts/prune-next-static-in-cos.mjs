import fs from "node:fs";
import path from "node:path";
import COS from "cos-nodejs-sdk-v5";

const projectRoot = process.cwd();
const sourceRoot = path.join(projectRoot, ".next/static");

if (process.env.COS_UPLOAD_ENABLED !== "true" || process.env.COS_PRUNE_ENABLED !== "true") {
  console.log("[cos-prune] Skip prune: COS upload/prune is not enabled.");
  process.exit(0);
}

const requiredEnv = ["COS_SECRET_ID", "COS_SECRET_KEY", "COS_REGION", "COS_BUCKET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`[cos-prune] Missing required env vars: ${missingEnv.join(", ")}`);
  process.exit(1);
}

if (!fs.existsSync(sourceRoot) || !fs.statSync(sourceRoot).isDirectory()) {
  console.error(`[cos-prune] Missing source directory: ${sourceRoot}`);
  process.exit(1);
}

const pruneMinAgeDaysRaw = process.env.COS_PRUNE_MIN_AGE_DAYS || "3";
const pruneMinAgeDays = Number.parseInt(pruneMinAgeDaysRaw, 10);
if (!Number.isFinite(pruneMinAgeDays) || pruneMinAgeDays < 1) {
  console.error(`[cos-prune] Invalid COS_PRUNE_MIN_AGE_DAYS: ${pruneMinAgeDaysRaw}`);
  process.exit(1);
}

const dryRun = process.env.COS_PRUNE_DRY_RUN === "true";
const pathPrefix = (process.env.COS_PATH_PREFIX || "").replace(/^\/+|\/+$/g, "");
const cosPrefix = pathPrefix ? `${pathPrefix}/_next/static` : "_next/static";
const cosPrefixWithSlash = `${cosPrefix}/`;
const pruneCutoffMs = Date.now() - pruneMinAgeDays * 24 * 60 * 60 * 1000;

function collectFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectFiles(entryPath));
      continue;
    }
    if (entry.isFile()) files.push(entryPath);
  }

  return files;
}

function toCosKey(filePath) {
  const relative = path.relative(sourceRoot, filePath).split(path.sep).join("/");
  return `${cosPrefix}/${relative}`;
}

function createCosClient() {
  return new COS({
    SecretId: process.env.COS_SECRET_ID,
    SecretKey: process.env.COS_SECRET_KEY,
  });
}

function getCurrentKeys() {
  return new Set(collectFiles(sourceRoot).map((filePath) => toCosKey(filePath)));
}

async function listAllObjects(cos) {
  const objects = [];
  let marker;

  while (true) {
    const result = await new Promise((resolve, reject) => {
      cos.getBucket(
        {
          Bucket: process.env.COS_BUCKET,
          Region: process.env.COS_REGION,
          Prefix: cosPrefixWithSlash,
          Marker: marker,
          MaxKeys: 1000,
        },
        (err, data) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(data);
        }
      );
    });

    const contents = Array.isArray(result.Contents) ? result.Contents : [];
    objects.push(...contents);

    if (result.IsTruncated !== "true" || !result.NextMarker) {
      break;
    }

    marker = result.NextMarker;
  }

  return objects;
}

function getStaleObjects(objects, currentKeys) {
  return objects.filter((object) => {
    if (!object?.Key || !object.Key.startsWith(cosPrefixWithSlash)) {
      return false;
    }
    if (currentKeys.has(object.Key)) {
      return false;
    }

    const lastModifiedMs = Date.parse(object.LastModified || "");
    if (Number.isNaN(lastModifiedMs)) {
      return false;
    }

    return lastModifiedMs < pruneCutoffMs;
  });
}

async function deleteObjects(cos, objects) {
  const batchSize = 1000;
  let deleted = 0;

  for (let index = 0; index < objects.length; index += batchSize) {
    const batch = objects.slice(index, index + batchSize);
    await new Promise((resolve, reject) => {
      cos.deleteMultipleObject(
        {
          Bucket: process.env.COS_BUCKET,
          Region: process.env.COS_REGION,
          Objects: batch.map((object) => ({ Key: object.Key })),
          Quiet: false,
        },
        (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        }
      );
    });
    deleted += batch.length;
    console.log(`[cos-prune] Deleted ${deleted}/${objects.length} stale objects.`);
  }
}

async function run() {
  const currentKeys = getCurrentKeys();
  if (currentKeys.size === 0) {
    console.log("[cos-prune] No current .next/static files found, skip prune.");
    return;
  }

  const cos = createCosClient();
  const remoteObjects = await listAllObjects(cos);
  const staleObjects = getStaleObjects(remoteObjects, currentKeys);

  console.log(
    `[cos-prune] Remote objects under ${cosPrefixWithSlash}: ${remoteObjects.length}; current build files: ${currentKeys.size}; stale objects older than ${pruneMinAgeDays}d: ${staleObjects.length}.`
  );

  if (staleObjects.length === 0) {
    console.log("[cos-prune] Nothing to delete.");
    return;
  }

  const sample = staleObjects.slice(0, 10).map((object) => object.Key);
  console.log(`[cos-prune] Sample stale keys: ${sample.join(", ")}`);

  if (dryRun) {
    console.log("[cos-prune] Dry run enabled, skip deletion.");
    return;
  }

  await deleteObjects(cos, staleObjects);
  console.log(`[cos-prune] Completed. Deleted ${staleObjects.length} stale objects.`);
}

run().catch((error) => {
  console.error("[cos-prune] Prune failed.", error);
  process.exit(1);
});
