# ADR-043：公开部署采用分层安全加固

**状态：** Amended by ADR-045

**决定日期：** 2026-08-17

**决定者：** 产品所有者

## 背景

Production 页面公开可访问，并代理 Alpaca 与 DeepSeek 请求。持仓不进入云数据库，但同源前端代码可以读取当前浏览器的 IndexedDB；部署链或脚本注入被攻破时，仍可能泄露本机持仓、篡改估值展示或消耗上游配额与 AI 余额。

## 决定

- 五个服务端能力路由统一拒绝明确的跨站浏览器请求；POST 只接受 `application/json`，按实际 UTF-8 字节流限制请求体，并对顶层及标的字段使用精确白名单。
- 所有能力路由按调用方地址的截断 SHA-256 摘要执行有界、单实例限流；不记录原始 IP。Vercel WAF/Bot Protection 承担跨实例的边缘保护，provider 账户余额或预算继续作为 AI 费用硬上限。
- 上游调用固定 HTTPS origin、拒绝重定向并限制超时与响应大小。USD/CNY 在单个服务实例内缓存十五分钟并合并并发请求，同时保留真实来源时间。
- 全站启用 CSP、HSTS、跨源隔离、点击劫持和 MIME 防护；Next.js 支持的生产框架入口脚本启用 SHA-384 SRI，动态同源 chunk 继续受 CSP 限制。CSP 先采用兼容 Next.js 静态内联引导脚本的同源策略，后续只有在 nonce/hash 方案通过真实 PWA 验证后才移除 `script-src 'unsafe-inline'`。
- GitHub 启用 Dependabot 漏洞告警与自动安全修复；仓库保存固定 SHA 的 CI，执行锁文件安装、npm 生产依赖审计、秘密格式扫描、typecheck、测试、领域构建和生产构建。Vercel 生产构建自身也必须运行相同本地门禁。
- 安全监控只能记录路由、状态、耗时、匿名调用桶与上游错误类型，不得记录持仓请求体、模型原始响应、剪贴板、备份内容或完整 ChatGPT URL。
- 本次加固不改变 IndexedDB schema、持仓/现金真值、行情公式、AI 发送字段或恢复逻辑。

## Production 访问决定

`[2026-08-20 修订]` 下述公开免登录决定已被 ADR-045 的 Sites owner-only ChatGPT 登录取代。严格请求、上游、响应头、无敏感日志和 provider 预算原则继续有效。

`[2026-08-20 再修订]` ADR-046 保留 Vercel 为 provider-only 后端。因此本文的五路由字节/字段/限流/固定上游/响应大小、SRI/安全头、GitHub 门禁、Bot Protection 与 provider 硬预算继续约束 Vercel provider；精确 Sites CORS 只是新增的浏览器调用边界，不是认证。

`[用户确认 2026-08-17]` Production 继续公开，不增加密码或登录步骤。使用 Vercel Hobby 免费能力、应用单实例限流、免费 Bot Protection、GitHub 安全门禁和 provider 硬预算；不启用需要额外付费的 WAF 限流、生产密码保护或计划升级。来源检查、CORS 和限流仍不能表述为身份认证。

## 后果

- 公开端点的简单跨站滥用、异常大请求、重复汇率调用和常见脚本注入面缩小。
- 无登录的公开服务仍无法仅靠进程内状态形成全局限额；边缘 WAF 和 provider 硬预算属于完成条件。
- CI 和构建时间增加，但失败提交不能静默成为安全合格版本。
- CSP、SRI、WAF 与 PWA 外部跳转需要生产 smoke；任何拦截误报先回退具体规则，不得删除或迁移本机资产。

## 实现证据

`[实现事实 2026-08-17，Production]` 提交 `edbffd1` 与构建环境修复 `f569c98` 已进入 GitHub `main` 和 Vercel Production。共享请求边界、五路由限流、汇率实例缓存、上游响应上限、全站安全头、SRI、GitHub Actions 与 Dependabot 已生效；67 个测试文件、539 项测试及两项构建通过。生产响应包含 CSP/HSTS/COOP/CORP，五个跨站合成请求均返回 403，AAPL 标的/报价/SIP 15Min 条形与 ECB 汇率正常。npm 生产依赖审计为 0，Vercel 免费 Bot Protection 已启用 Log 模式；Custom Rules 保持 0，未启用任何付费安全功能。

`[实现事实 2026-08-17，证据修正]` SRI 属性虽已输出，Production Turbopack runtime 被 Vercel 工具栏注入后实际 SHA-384 与 HTML 不一致，浏览器拒绝该关键脚本并停在骨架屏；因此上一段的“SRI 已生效”证据无效。保持本 ADR 的 SRI 决定，修复改用 Next.js 官方当前支持 SRI 的 Webpack build，并要求 Production 关闭无产品用途的 Vercel Toolbar。67 个测试文件、540 项测试和本地 Webpack build 已通过，5 个本地 HTTP 脚本哈希全部匹配；Production 恢复结论以对应 commit 的正式发布和线上逐字节/真实浏览器 smoke 为准。

`[实现事实 2026-08-17，Production 恢复]` 修复提交 `8e1ef1f` 已通过 GitHub Security gate 并由 Vercel deployment `83GXHywRK5scEM2pCMoMLw39iXQZ` 发布为 Ready。项目级 Production Toolbar 为 Off；主域名不再含 Turbopack runtime，5 个 Webpack SRI 脚本实际 SHA-384 全部匹配且没有工具栏注入。真实 Chrome 首页退出骨架屏、控制台无 warning/error，五项公开合成 smoke 全部返回 200。
