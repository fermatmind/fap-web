#!/usr/bin/env bash
set -euo pipefail

: "${RUNNER_TEMP:?}"
version="2.4.0"
archive_sha256="85edf66b2fb7238f5c7e25cab820cf29312319fe4935b7c86a6b8485eb434f3c"
root="$RUNNER_TEMP/ossutil-${version}"
archive="$root/ossutil.zip"
binary="$root/bin/ossutil"
mkdir -p "$root/bin"

curl -fsSL --retry 3 --retry-all-errors \
  "https://gosspublic.alicdn.com/ossutil/v2/${version}/ossutil-${version}-linux-amd64.zip" -o "$archive"
printf '%s  %s\n' "$archive_sha256" "$archive" | sha256sum -c -
rm -rf -- "$root/extracted"
mkdir -p "$root/extracted"
if command -v unzip >/dev/null 2>&1; then
  unzip -q "$archive" -d "$root/extracted"
elif command -v python3 >/dev/null 2>&1; then
  python3 -m zipfile -e "$archive" "$root/extracted"
elif command -v bsdtar >/dev/null 2>&1; then
  bsdtar -xf "$archive" -C "$root/extracted"
else
  echo "missing zip extractor: install unzip, python3, or bsdtar" >&2
  exit 2
fi
install -m 0755 "$root/extracted/ossutil-${version}-linux-amd64/ossutil" "$binary"
"$binary" version

if [[ -n "${GITHUB_PATH:-}" ]]; then
  printf '%s\n' "$(dirname "$binary")" >> "$GITHUB_PATH"
else
  printf '%s\n' "$binary"
fi
