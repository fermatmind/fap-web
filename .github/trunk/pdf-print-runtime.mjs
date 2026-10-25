import { closeSync, constants, fsyncSync, lstatSync, openSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const KEY = 'GOTENBERG_RESULT_PRINT_TOKEN_SECRET';
export function validate(secret) {
  if (typeof secret !== 'string' || secret.length !== 64 || !/^[0-9a-f]{64}$/.test(secret)) throw new Error('PDF_PRINT_RUNTIME_KEY_INVALID');
  return `${KEY}=${secret}\n`;
}
export function readConfig(file) {
  const stat = lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink() || (stat.mode & 0o077) !== 0 || stat.uid !== process.getuid() || stat.size > 128) throw new Error('PDF_PRINT_RUNTIME_FILE_UNSAFE');
  const content = readFileSync(file, 'utf8');
  const match = content.match(/^GOTENBERG_RESULT_PRINT_TOKEN_SECRET=([0-9a-f]{64})\n$/);
  if (!match || content !== validate(match[1])) throw new Error('PDF_PRINT_RUNTIME_FILE_INVALID');
  return content;
}
export function writeConfig(file, content) {
  try {
    lstatSync(file);
    if (readConfig(file) !== content) throw new Error('PDF_PRINT_RUNTIME_IMMUTABLE_CONFLICT');
    return;
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const fd = openSync(file, constants.O_WRONLY | constants.O_CREAT | constants.O_EXCL | constants.O_NOFOLLOW, 0o600);
  try { writeFileSync(fd, content); fsyncSync(fd); } finally { closeSync(fd); }
  if (readConfig(file) !== content) throw new Error('PDF_PRINT_RUNTIME_READBACK_FAILED');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const [operation, source, destination] = process.argv.slice(2);
    if (operation === 'from-env') writeConfig(source, validate(process.env[KEY]));
    else if (operation === 'install') writeConfig(destination, readConfig(source));
    else throw new Error('PDF_PRINT_RUNTIME_OPERATION_INVALID');
    console.log('pdf_print_runtime=configured');
  } catch (error) {
    const code = /^PDF_PRINT_RUNTIME_[A-Z_]+$/.test(error.message) ? error.message : 'PDF_PRINT_RUNTIME_FAILED';
    console.error(code); process.exitCode = 1;
  }
}
