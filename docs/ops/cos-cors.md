# COS Font CORS Configuration

## Goal
Enable cross-origin font loading for Next.js font assets served from COS/CDN so browsers no longer block `woff2` requests.

## Scope
- Bucket / host: `fermatmind-1316873116.cos.ap-shanghai.myqcloud.com`
- Resource path: `/_next/static/media/*.woff2`

## Required CORS Rules
- `AllowedOrigin`: `https://www.fermatmind.com`
- `AllowedMethod`: `GET,HEAD`
- `AllowedHeader`: `*`
- `ExposeHeader`: `Access-Control-Allow-Origin`

## Verification
1. Open `https://www.fermatmind.com` take pages in browser.
2. Confirm Console no longer shows font CORS blocked errors for `/_next/static/media/*.woff2`.
3. In Network panel, check font responses include:
   - `Access-Control-Allow-Origin: https://www.fermatmind.com`
