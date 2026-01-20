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

## 本地运行/生产部署(示例)

本节为示例配置，不会直接改动生产环境。生产部署前请根据环境调整路径与域名。

本地运行：

```bash
pnpm install
pnpm dev
```

生产部署(示例)：

1) 反向代理：参考 `docs/deploy/nginx-www-api-proxy.conf`，将 `server_name`、证书与 listen 端口按实际情况配置。
2) 守护进程：参考 `docs/deploy/systemd-fap-web.service`，修改 `WorkingDirectory` 与 pnpm 路径后放到 `/etc/systemd/system/fap-web.service`。
3) 构建与启动：先执行 `pnpm install` 和 `pnpm build`，再由 systemd 启动 `pnpm start -- -p 3000`。

最小验收命令：

```bash
pnpm install
pnpm build
pnpm start
curl -i https://www.example.com/api/v0.2/your-endpoint  # 占位示例，请替换为实际可用接口
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
