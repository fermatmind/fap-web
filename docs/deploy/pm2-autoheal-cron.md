# PM2 Autoheal + WeCom Alert Setup

## Purpose
Run a one-minute health probe for `fap-web`, auto-restart the PM2 app when checks fail, and send alerts to WeCom.

## Prerequisites
1. PM2 app name is `fap-web`.
2. Deploy directory is `/opt/apps/fap-web`.
3. WeCom bot webhook is available.

## 1) One-time PM2 reboot bootstrap
```bash
pm2 startup systemd -u ubuntu --hp /home/ubuntu
pm2 save
```

## 2) Manual dry run
```bash
cd /opt/apps/fap-web
bash scripts/healthcheck_web.sh
WECOM_BOT_WEBHOOK="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=<your-key>" \
bash scripts/autoheal_pm2.sh
```

## 3) Cron schedule (every minute)
```bash
crontab -e
```

Add:

```bash
* * * * * cd /opt/apps/fap-web && WECOM_BOT_WEBHOOK="https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=<your-key>" AUTOHEAL_COOLDOWN_SEC=600 bash scripts/autoheal_pm2.sh >> /var/log/fap-web-autoheal.log 2>&1
```

## 4) Verify installation
1. `crontab -l` contains the autoheal entry.
2. `/var/log/fap-web-autoheal.log` has periodic output.
3. Simulate process loss: `pm2 delete fap-web`.
4. Verify within ~1 minute:
   - `pm2 status` shows `fap-web` as `online`.
   - WeCom receives failure + recovery alerts.

## 5) Environment variables
- `WECOM_BOT_WEBHOOK`: WeCom webhook URL.
- `HEALTHCHECK_LOCAL_URLS`: Comma-separated local URLs.
- `HEALTHCHECK_PUBLIC_URLS`: Comma-separated public URLs.
- `AUTOHEAL_COOLDOWN_SEC`: Restart cooldown window in seconds (default `600`).
- `APP_NAME`: PM2 app name (default `fap-web`).
- `APP_DIR`: app directory (default `/opt/apps/fap-web`).
