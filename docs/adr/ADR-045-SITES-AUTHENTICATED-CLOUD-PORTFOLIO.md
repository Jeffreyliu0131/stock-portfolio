---
artifact: adr
version: "1.0"
created: 2026-08-20
status: accepted
---

# ADR-045：使用 OpenAI Sites 登录与账号云端持仓真值

## Status

Accepted

**Date:** 2026-08-20

**Decider:** 产品所有者

## Context

现有 Production 以 Vercel 托管，股票、现金和双券商 current 只存在于各浏览器来源的 IndexedDB。这个边界无法让同一用户在 iPhone、Mac 或其他设备上看到同一组合，也无法用账号身份隔离云端资产。

产品所有者在本次对话中明确要求：改用 OpenAI Sites 部署；必须登录后才能进入；账号数据打通，同一账号在不同设备上看到同一份资产；由 Codex 完成构建、控制和部署。

OpenAI 官方资料在 2026-08-20 说明 Sites 支持受限访问、ChatGPT 登录身份和 D1 持久数据。Sites 仍处于 public beta，部署、D1 和日志在发布初期不提供 data residency，因此该限制必须保留为已知约束：<https://learn.chatgpt.com/docs/sites>。

## Decision

1. 新 Production 使用 OpenAI Sites。访问策略固定为 owner-only 私有访问；未登录访客不能进入。以后扩大访问人群必须由产品所有者另行确认。
2. 身份优先使用 Sites 转发的 `oai-authenticated-user-id`。若当前私有访问路径只转发已认证邮箱，服务端将规范化邮箱做 SHA-256，生成 `email-sha256:<digest>` 作为稳定伪名键；原邮箱不写 D1。身份键只用于同一 Site 内的所有者隔离；组合聚合键仍是 `instrument`，券商规则仍服从 ADR-044。
3. Sites D1 绑定名为 `DB`。`user_portfolios` 以稳定用户 ID 为主键，保存一份严格版本化 current state：旧 v2 股票/现金 current，或已启用的 v4 双券商 current/previous/events。D1 是 Sites 版本的资产真值。
4. 所有资产读取和写入都经过同源 `/api/portfolio`。服务端再次验证身份、请求字节、精确字段、领域十进制、标的、revision 和事件幂等；D1 `state_version` 使用 compare-and-swap。任一 stale revision、并发冲突、校验或写入失败都零变化，不允许最后写入静默覆盖另一设备。
5. 现有领域公式、双券商移动平均成本、现金联动、JSON v2/v3 contract、行情只改变估值、AI 安全输出和 current-only 边界不因托管变化而改变。
6. IndexedDB 不再是 Sites 版本的资产真值。它只保留设备本地草稿、上一有效行情、USD/CNY 缓存和提示时间；这些辅助状态不要求跨设备同步。
7. 旧 Vercel 来源和其中已有 IndexedDB 数据不删除、不迁移、不改写。浏览器同源隔离意味着新的 Sites origin 不能读取旧 Vercel origin 的 IndexedDB；因此唯一授权迁移路径是：先在旧版导出 JSON v2 或 v3，在 Sites 登录后严格预览并二次确认，只恢复到完全空的账号组合。禁止自动上传、猜测账号归属、合并或覆盖。
8. JSON 导出继续生成用户可带走的只读副本。恢复确认后，规范化 current 会写入当前登录账号的 D1；原始文件不持久化，previous、草稿、行情/汇率缓存、旧历史库和同步内部状态不进入云端。
9. Web runtime 使用现有 App Router 页面，经 Vinext、Vite、`@openai/sites-vite-plugin` 和 Cloudflare Worker-compatible ESM 构建。Sites 源仓库与版本部署是 UI、登录和 D1 的发布入口；provider 运行与发布按 ADR-046 另行约束。
10. D1 不保存 provider key、原始邮箱、设备标识、原始 JSON 文件、剪贴板或 AI 原始请求/响应。Alpaca 与 DeepSeek 凭据保留在 Vercel Sensitive 环境变量，Sites 不再配置第二份 provider secret；详见 ADR-046。
11. Vercel 保留为固定 provider-only 后端，同时作为旧 origin JSON 导出来源；它不获得 Sites 账号 current 写入。在 provider 迁出前不能下线该地址。

## Consequences

### Positive

- 同一 ChatGPT 账号在不同设备读取同一组合；资产不会再因浏览器来源变化而天然分裂。
- owner-only Sites 访问和服务端用户 ID 分区同时提供访问控制与数据所有者隔离。
- D1 单行状态加双重 revision 保护，保留 ADR-044 股票/现金同成败，并避免多设备静默覆盖。
- 旧本机数据保持原样，迁移必须经过用户可核对的 JSON 路径。

### Negative

- Sites public beta、配额和无 data residency 是新的平台约束。
- 旧 Vercel origin 的资产不能自动出现在 Sites；用户必须先导出再导入。
- 网络不可用时可以保留已加载页面和本机辅助缓存，但不能承诺离线修改账号 current。
- Sites 与 Vercel 的运行和构建差异扩大了部署测试面。

### Neutral

- 本产品仍只记录、估值和分析持仓，不下单、不连接券商、不处理付款卡，也不提供税务或投资结论。
- 历史收益、券商 API、自动交易和完整离线仍未启用。

## Supersedes and Amends

- 取代 ADR-012 的“IndexedDB 是 P0 唯一资产真值”和“无登录/云同步”结论；ADR-012 继续作为旧 Vercel 来源的数据保护记录。
- 取代 ADR-014 的现行产品页面、登录与 current 托管入口；ADR-046 后 Vercel 保留为 provider-only 后端与 legacy JSON 来源。
- 取代 ADR-043 的“Production 继续公开且不登录”访问决定；其中请求边界、上游安全、无敏感日志和供应链纵深原则继续有效。
- 接受并具体化 ADR-004 曾提出但未确认的认证、云持久化和跨设备方向。
- 修订 ADR-031：恢复目标改为完全空的账号 current，确认后写 D1；严格 v2 语义不变。
- 修订 ADR-044：v4 book 的活动真值从本机 IndexedDB 改为当前登录账号 D1；交易数学和原子性不变。
- ADR-046 修订本文第 9–11 项的 provider 部分：Sites 不直连 Alpaca、ECB 或 DeepSeek，也不保存它们的 secret。

## References

- `../01-PRD.md`
- `../02-DOMAIN-AND-CALCULATIONS.md`
- `../04-TECHNICAL-SPEC.md`
- `../08-OPEN-QUESTIONS.md`
- `ADR-012-INDEXEDDB-LOCAL-P0.md`
- `ADR-014-VERCEL-GITHUB-DEPLOYMENT.md`
- `ADR-031-SAFE-EMPTY-PORTFOLIO-JSON-RESTORE.md`
- `ADR-043-PUBLIC-DEPLOYMENT-SECURITY-HARDENING.md`
- `ADR-044-UNIFIED-VIEW-BROKER-AWARE-TRADE-BOOK.md`
