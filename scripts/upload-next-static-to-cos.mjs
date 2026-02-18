import fs from "node:fs";
import path from "node:path";
import COS from "cos-nodejs-sdk-v5";
import mime from "mime-types";

const projectRoot = process.cwd();
const sourceRoot = path.join(projectRoot, ".next/static");

if (process.env.COS_UPLOAD_ENABLED !== "true") {
  console.log("[cos-upload] Skip upload: COS_UPLOAD_ENABLED is not true.");
  process.exit(0);
}

const requiredEnv = ["COS_SECRET_ID", "COS_SECRET_KEY", "COS_REGION", "COS_BUCKET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`[cos-upload] Missing required env vars: ${missingEnv.join(", ")}`);
  process.exit(1);
}

if (!fs.existsSync(sourceRoot) || !fs.statSync(sourceRoot).isDirectory()) {
  console.error(`[cos-upload] Missing source directory: ${sourceRoot}`);
  process.exit(1);
}

const pathPrefix = (process.env.COS_PATH_PREFIX || "").replace(/^\/+|\/+$/g, "");
const cosPrefix = pathPrefix ? `${pathPrefix}/_next/static` : "_next/static";

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

async function putObject(cos, filePath) {
  const key = toCosKey(filePath);
  const contentType = mime.lookup(filePath) || "application/octet-stream";

  await new Promise((resolve, reject) => {
    cos.putObject(
      {
        Bucket: process.env.COS_BUCKET,
        Region: process.env.COS_REGION,
        Key: key,
        Body: fs.createReadStream(filePath),
        ContentType: contentType,
        CacheControl: "public, max-age=31536000, immutable",
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

  console.log(`[cos-upload] Uploaded ${key}`);
}

async function run() {
  const files = collectFiles(sourceRoot);
  if (files.length === 0) {
    console.log("[cos-upload] No files found under .next/static.");
    return;
  }

  const cos = new COS({
    SecretId: process.env.COS_SECRET_ID,
    SecretKey: process.env.COS_SECRET_KEY,
  });

  const concurrency = 8;
  let index = 0;

  async function worker() {
    while (index < files.length) {
      const current = files[index];
      index += 1;
      await putObject(cos, current);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, files.length) }, () => worker()));
  console.log(`[cos-upload] Completed. Uploaded ${files.length} files.`);
}

run().catch((error) => {
  console.error("[cos-upload] Upload failed.", error);
  process.exit(1);
});
