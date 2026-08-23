---
artifact: adr
version: "1.0"
created: 2026-08-20
status: accepted
---

# ADR-046：Sites 使用 Vercel 作为固定 provider 代理

## Status

Accepted

**Date:** 2026-08-20

**Decider:** 产品所有者

## Context

ADR-045 已把登录、页面和账号 current 迁入 OpenAI Sites 与 D1。Production smoke 证明当前 Sites Worker 无法直接取得 Alpaca、ECB 或 DeepSeek 响应：ECB 不需要密钥仍失败；一把在本机对 DeepSeek `/models` 返回 200 的有效密钥，在 Sites 中仍返回 provider unavailable。Vercel Sensitive 环境变量创建后又不可读取，不能把现有 Alpaca 值解密迁出。

产品所有者确认：为了保留行情、汇率和 AI，继续使用现有 Vercel 作为后端 provider 代理。

## Decision

1. Sites 继续是唯一产品前端、ChatGPT 登录边界和账号 D1 current 真值。Vercel 不保存 Sites 账号 current，不接收 D1 revision、表单草稿、历史库或 JSON 文件。
2. Vercel 只保留五个既有 provider 能力：标的解析、当前行情、日内条形、USD/CNY 和 AI 组合咨询。Alpaca/DeepSeek secrets 继续只存在 Vercel Sensitive 环境变量；ECB 继续无密钥降级。
3. 浏览器只有在精确 origin `https://portfolio.example.com` 时，才把上述五类请求发送到固定 `https://provider.example.com`。localhost 与 Vercel legacy 页面继续使用同源相对路径。
4. Vercel CORS 只允许该 Sites origin，不使用 `*`，不允许 cookie 或 Authorization credentials。JSON POST 预检只允许 `Content-Type`；响应暴露的额外 header 只有 `Retry-After`，并固定 `Vary: Origin`。
5. Sites CSP 的 `connect-src` 只在 `'self'` 外增加上述单一 Vercel origin。脚本、图片、frame 和其他连接来源不扩大。
6. 标的、行情和条形请求只发送受支持的 instrument；不发送数量、成本或现金。USD/CNY 不发送资产。AI 路径继续按 ADR-042 发送用户主动触发的 current-only 完整快照到 Vercel，再由 Vercel 调用 DeepSeek；请求/响应体不得写日志。
7. Vercel 继续执行原有来源、实际字节、精确字段、标的数量、限流、固定上游 origin、重定向、超时和响应大小约束。跨站 Origin 不是认证；它只限定浏览器调用面。
8. Vercel provider 故障不得修改 Sites D1。页面保留数量与成本并使用既有上一有效行情缓存；缺价、汇率不可用与 AI 错误继续安全降级。
9. 若以后 Sites 提供并配置可用的 private HTTP tunnel 或公网 provider egress，可以新增 ADR 取代本代理；当前不同时维护第二套 provider secret。

## Consequences

### Positive

- 保留已经生产验证的 Alpaca、ECB 与 DeepSeek 能力，不需要重新创建或暴露 provider key。
- 账号 current 与 provider 运行边界分离；Vercel 故障不能写坏 D1。
- 固定 origin、无 credentials CORS 和 CSP allowlist 把跨域面限制在一个明确站点。

### Negative

- 产品形成 Sites（UI/登录/D1）与 Vercel（provider）的双运行时，发布和故障诊断需要同时验证。
- AI 完整 current 快照仍会经过 Vercel 服务端；这与旧 Production 相同，但不是完全 Sites-only。
- Vercel legacy 地址继续存在，不能在 provider proxy 迁走前直接下线。

### Neutral

- 当前行情仍是约 15 分钟延迟，不因代理架构变成实时行情。
- 本决定不改变持仓计算、双券商账本、JSON、AI 输出安全或历史收益范围。

## Verification

- GitHub Security gate 对 Vercel provider commit 成功；本地 Next.js Webpack build、75 文件/563 测试和生产依赖审计通过。
- Sites 发布候选的 typecheck、78 文件/574 测试、领域构建与 Vinext 生产构建通过；Vite config 已移除 `global_fetch_strictly_public`。
- Vercel Production 对 Sites origin 的 OPTIONS 返回 204 和精确 CORS；攻击者 origin 继续被拒绝。
- AAPL 标的、`delayed_sip` 当前行情、SIP 15Min 条形与 ECB `REFERENCE` 均返回 200。
- 合成 schema v3 AI 初始体检返回 200、`deepseek-v4-flash`、2 条分类、6 个维度与 `no-store`。

## References

- `ADR-014-VERCEL-GITHUB-DEPLOYMENT.md`
- `ADR-042-SEPARATE-PORTFOLIO-ANALYSIS-AND-AI-CHAT.md`
- `ADR-043-PUBLIC-DEPLOYMENT-SECURITY-HARDENING.md`
- `ADR-045-SITES-AUTHENTICATED-CLOUD-PORTFOLIO.md`
- `../04-TECHNICAL-SPEC.md`
- `../09-PRODUCTION-OPERATIONS.md`
