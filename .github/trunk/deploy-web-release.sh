#!/usr/bin/env bash
set -euo pipefail

for name in DEPLOY_HOST DEPLOY_USER DEPLOY_PORT APP_DIR APP_NAME APP_PORT PUBLIC_BASE_URL DEPLOY_SHA \
  RELEASE_ARCHIVE RELEASE_ARCHIVE_SHA256 RELEASE_MANIFEST_DIGEST ARTIFACT_DIGEST; do
  [[ -n "${!name:-}" ]] || { echo "missing $name" >&2; exit 2; }
done
[[ "$DEPLOY_SHA" =~ ^[0-9a-f]{40}$ ]]
[[ "$DEPLOY_PORT" =~ ^[0-9]+$ ]]
[[ "$APP_PORT" =~ ^[0-9]+$ ]]
[[ "$APP_DIR" =~ ^/[A-Za-z0-9._/-]+$ && "$APP_DIR" != *..* ]]
[[ "$APP_NAME" =~ ^[A-Za-z0-9._-]+$ ]]
[[ "$PUBLIC_BASE_URL" =~ ^https://[A-Za-z0-9.-]+(:[0-9]+)?$ ]]
[[ "$RELEASE_ARCHIVE_SHA256" =~ ^[0-9a-f]{64}$ ]]
[[ "$RELEASE_MANIFEST_DIGEST" =~ ^sha256:[0-9a-f]{64}$ ]]
[[ "$ARTIFACT_DIGEST" =~ ^sha256:[0-9a-f]{64}$ ]]

control="${APP_DIR%/}/.deploy-incoming/${GITHUB_RUN_ID}-${GITHUB_RUN_ATTEMPT}-${DEPLOY_SHA:0:12}"
remote_archive="$control/fap-web-${DEPLOY_SHA}.tar.gz"
ssh_args=(-o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=10 -p "$DEPLOY_PORT")

ssh "${ssh_args[@]}" "$DEPLOY_USER@$DEPLOY_HOST" "mkdir -p '$control' && chmod 700 '$control'"
scp -o BatchMode=yes -o StrictHostKeyChecking=yes -o ConnectTimeout=10 -P "$DEPLOY_PORT" \
  "$RELEASE_ARCHIVE" scripts/install_standalone_release.sh scripts/deploy_web_pm2.sh \
  scripts/rolling_reload_pm2.sh ecosystem.config.cjs "$DEPLOY_USER@$DEPLOY_HOST:$control/"

ssh "${ssh_args[@]}" "$DEPLOY_USER@$DEPLOY_HOST" \
  "chmod 700 '$control/'*.sh && install -m 0644 '$control/ecosystem.config.cjs' '$APP_DIR/ecosystem.config.cjs' && \
   APP_DIR='$APP_DIR' APP_USER='$DEPLOY_USER' APP_NAME='$APP_NAME' APP_PORT='$APP_PORT' \
   APP_MANAGER='${APP_MANAGER:-pm2}' SYSTEMD_SERVICE='${SYSTEMD_SERVICE:-fap-web.service}' \
   PUBLIC_BASE_URL='$PUBLIC_BASE_URL' DEPLOY_SHA='$DEPLOY_SHA' ARTIFACT_DIGEST='$ARTIFACT_DIGEST' \
   ARCHIVE_SHA256='$RELEASE_ARCHIVE_SHA256' RELEASE_MANIFEST_DIGEST='$RELEASE_MANIFEST_DIGEST' \
   RELEASE_ARCHIVE='$remote_archive' DEPLOY_SCRIPT='$control/deploy_web_pm2.sh' \
   ROLLING_RELOAD_SCRIPT='$control/rolling_reload_pm2.sh' RUN_SITEMAP_HEALTH='${RUN_SITEMAP_HEALTH:-1}' \
   REQUIRE_THIRD_PARTY_ANALYTICS_BOOTSTRAP='${REQUIRE_THIRD_PARTY_ANALYTICS_BOOTSTRAP:-1}' \
   CORE_PUBLIC_PATH='${CORE_PUBLIC_PATH:-/zh/personality/intj-a}' bash '$control/install_standalone_release.sh'"
