This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## 生产部署（PR0）

本项目生产部署以 `/Users/rainie/Desktop/GitHub/fap-web/deploy/*` 为准。
`/Users/rainie/Desktop/GitHub/fap-web/docs/deploy/*` 保留为历史示例参考。

构建与启动（standalone）：

```bash
npm run build
node .next/standalone/server.js
```

如需守护进程，使用 systemd：

```bash
sudo cp /Users/rainie/Desktop/GitHub/fap-web/deploy/systemd/fap-web.service /etc/systemd/system/fap-web.service
sudo systemctl daemon-reload
sudo systemctl enable --now fap-web
```

Nginx 反代配置与重载：

```bash
sudo cp /Users/rainie/Desktop/GitHub/fap-web/deploy/nginx/fap-web.conf /etc/nginx/conf.d/fap-web.conf
sudo nginx -t && sudo systemctl reload nginx
```

本机验收：

```bash
npm run build
node .next/standalone/server.js & sleep 2
curl -I http://127.0.0.1:3000/ | head -n 1
curl -H "Accept: application/json" http://127.0.0.1:3000/api/v0.3/scales | head -c 200; echo
pkill -f ".next/standalone/server.js" || true
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
