---
artifact: adr
version: "1.0"
created: 2026-08-22
status: accepted
---

# ADR-047：受保护 Sites 使用公开只读的 PWA 安装图标

## Status

Accepted

**Date:** 2026-08-22

**Decider:** 产品所有者

## Context

Sites Production 继续按 ADR-045 只允许所有者登录。2026-08-22 的实际 iPhone 复验表明：即使用户重新打开 Sites 并再次“添加到主屏幕”，系统仍未取得 App 图标。生产 HTTP 证据显示，同源 manifest 与 `/icons/*` 在没有 Sites 登录令牌时返回 `401`；安装流程对图标发起的独立读取因此不能稳定依赖受保护的 Sites 静态路径。

图标不包含持仓、身份、账号、行情、请求体或 secret。现有固定 Vercel origin 已公开提供 legacy 页面与静态资源，且不拥有 Sites D1 current。WebKit 明确说明 `apple-touch-icon` 优先于 manifest 图标；Web App Manifest 规范允许图标来自 `img-src` 允许的独立 origin。

## Decision

1. `https://portfolio.example.com` 继续是唯一产品入口、manifest owner、`start_url`、App identity、ChatGPT 登录边界和 D1 current 真值；访问范围仍是 owner-only。
2. 仅 PWA 安装图标作为公开只读静态资产，固定由 `https://provider.example.com/icons/` 提供。图标文件使用版本化名称，不含用户数据或可执行内容。
3. Sites HTML 的 favicon、`apple-touch-icon` 与同源 manifest 的 `icons[].src` 都使用上述固定 Vercel origin 的绝对 HTTPS URL。iOS 以 `apple-touch-icon` 为优先安装图标；manifest 的 `id`、`start_url` 与 `scope` 仍保持 Sites 同源。
4. Sites CSP 的 `img-src` 只新增该固定 Vercel origin；`connect-src`、五个 provider API 的精确 Sites CORS、无 credentials 和请求安全规则不变。
5. Vercel `/icons/:path*` 只返回版本化 PNG，并允许跨源图片读取：`Cross-Origin-Resource-Policy: cross-origin`、`Access-Control-Allow-Origin: *` 与长期 immutable cache。`*` 只适用于无敏感数据的静态图标，不适用于 `/api/*`，也不允许 cookie、Authorization 或写入。
6. 普通页面和功能更新继续通过同一个 Sites URL 自动加载，不要求用户重新添加主屏幕。以后若更换图标，必须使用新文件名并重新做安装资产 smoke；操作系统何时替换已经安装的安全敏感图标仍由用户代理决定，不能由网页强制。

## Consequences

### Positive

- Safari 的安装图标读取不再依赖 Sites 登录 cookie 或独立系统请求是否携带身份。
- 产品页面、D1、API 与真实资产仍全部保持 owner-only；公开面只增加固定 PNG。
- 同一 Sites 链接、App identity 和账号数据不变，普通发布不需要重新安装。

### Negative

- PWA 安装依赖两个 origin：Sites 提供受保护页面与 manifest，Vercel 提供公开图标。
- 已经以缺失图标安装的旧 Web App 是否自动换图仍取决于 iOS；本修复能保证后续安装读取到图标，但不能从网页侧强制刷新 SpringBoard 缓存。

## Verification

- Vercel 匿名 `GET/HEAD /icons/<versioned-name>.png` 返回 `200 image/png`、跨源只读 header 与 immutable cache。
- Sites 登录态 HTML 的 `apple-touch-icon` 指向固定 Vercel URL；同源 manifest 保持 `id=/`、`start_url=/`、`display=standalone`，图标 URL 全部指向同一固定 Vercel origin。
- Sites CSP 只在 `img-src` 与既有 `connect-src` 中出现该 Vercel origin；脚本、frame、font、worker 和其他来源不扩大。
- 五个 provider API 继续拒绝 `Access-Control-Allow-Origin: *`，攻击者 origin 仍在上游调用前被拒绝。
- 图标发布与安装验证不读取、写入或导出 D1 current。

## Amends

- 修订 ADR-001 的图标交付实现，不改变 PWA 形态。
- 修订 ADR-046 第 2、5 项：Vercel 在五个 provider 能力和 legacy 来源之外增加公开静态 PWA 图标；`img-src` 对固定 Vercel origin 增加窄范围例外，其他资源类型仍不扩大。

## References

- WebKit Safari 15.4 Web App 图标：<https://webkit.org/blog/12445/new-webkit-features-in-safari-15-4/>
- Web App Manifest CSP：<https://www.w3.org/TR/appmanifest/#content-security-policy>
- `ADR-001-PWA-DELIVERY.md`
- `ADR-045-SITES-AUTHENTICATED-CLOUD-PORTFOLIO.md`
- `ADR-046-SITES-VERCEL-PROVIDER-PROXY.md`
