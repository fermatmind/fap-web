# Web / API 职责边界（FermatMind）

## fap-web（Web）
负责所有“可收录/可展示”的页面与 SEO 基建：
- 路由与页面：/test/*、白皮书、帮助中心、隐私页等
- SSR/SSG：输出可抓取的 HTML（View Source 可见）
- SEO：meta、canonical、robots、OG/Twitter、结构化数据、sitemap、A/B
- 内容展示：把内容渲染成页面（可从本地文件、CMS、或后端读取，但渲染在 Web）

不负责：
- 出题、提交、评分、报告生成、事件入库、内容包解析、分享 click 归因

## fap-api（API）
负责所有“测评业务能力”与数据服务：
- 题目与作答：题目下发、提交、attempt/result 生成
- 评分与报告：评分幂等、报告 JSON、内容包解析、版本控制
- 事件：曝光/点击/查看等事件写入、分享链路归因
- 对外提供稳定 API（Web/MiniApp/APP 都是调用方）

不负责：
- SEO 页面、SSR/SSG、站点地图、落地页展示与静态内容运营
