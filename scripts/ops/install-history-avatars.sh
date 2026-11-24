#!/usr/bin/env bash
set -euo pipefail
export LC_ALL=C

source_dir="${1:?usage: install-history-avatars.sh <asset-source> <asset-root>}"
asset_root="${2:?missing asset root}"
mkdir -p "$asset_root/releases"
candidate="$(mktemp -d "$asset_root/releases/.candidate.XXXXXX")"
pointer="${candidate}.link"
trap 'rm -rf -- "$candidate"; rm -f -- "$pointer"' EXIT

shopt -s nullglob
files=("$source_dir"/*.jpg)
(( ${#files[@]} > 0 )) || { echo 'No history avatars found' >&2; exit 1; }
images="$candidate/images/global-history"
mkdir -p "$images"
for file in "${files[@]}"; do
  name="${file##*/}"
  [[ -f "$file" && ! -L "$file" && "$name" =~ ^[a-z0-9][a-z0-9-]*\.jpg$ ]] || exit 1
  install -m 0644 "$file" "$images/$name"
done
version="$(cd "$images" && LC_ALL=C sha256sum -- *.jpg | sha256sum | cut -d' ' -f1)"
if [[ -f "$asset_root/current/VERSION" ]] && [[ "$(cat "$asset_root/current/VERSION")" == "$version" ]]; then
  printf '%s\n' "$version"
  exit 0
fi
printf '%s\n' "$version" > "$candidate/VERSION"
mkdir "$images/$version"
for file in "$images"/*.jpg; do
  ln "$file" "$images/$version/"
done

# Prior content-addressed URLs remain valid after the next release.
if [[ -d "$asset_root/current/images/global-history" ]]; then
  for old in "$asset_root/current/images/global-history"/*/; do
    old_version="${old%/}"
    old_version="${old_version##*/}"
    [[ "$old_version" =~ ^[a-f0-9]{64}$ && "$old_version" != "$version" ]] || continue
    cp -al -- "$old" "$images/$old_version"
  done
fi
chmod -R a+rX "$candidate"
chmod 0755 "$candidate"
ln -s -- "releases/${candidate##*/}" "$pointer"
mv -Tf -- "$pointer" "$asset_root/current"
trap - EXIT
printf '%s\n' "$version"
