---
artifact: adr
version: "1.0"
created: 2026-07-30
status: superseded
---

# ADR-014：使用 Vercel 托管并从 GitHub main 自动部署

## Status

Superseded by ADR-045 for UI, login and account current. ADR-046 reuses Vercel/GitHub `main` only for the fixed provider backend and legacy JSON export origin.

**Date:** 2026-07-30

**Decider:** 产品所有者

## Context

PWA 需要公开 HTTPS 地址和 Next.js 服务端运行边界，以便 iPhone 访问并保护 Alpaca 凭据。P0 的持仓真值已经由 ADR-012 确认为浏览器 IndexedDB；部署 Web 应用不要求增加云数据库、登录或跨设备同步。

首个生产版本曾从本地工作区手动部署到 Vercel，GitHub 当时不能重建线上源码，也不能在推送后自动更新。产品所有者随后明确要求把代码、文档和部署链路一次性收口。

## Decision

- 生产托管平台使用 Vercel，项目名为 `stock-portfolio-calculator`。
- 稳定生产地址为 <https://provider.example.com/>。
- 代码真源为 GitHub 仓库 `owner/stock-portfolio-calculator`。
- Vercel Production 环境跟踪 `main`；推送 `main` 触发 Production 部署，其他未分配分支进入 Preview。
- 发布只包含已经提交并推送的 Git 内容；本地未提交文件不得作为可重建生产版本。
- `ALPACA_API_KEY_ID` 与 `ALPACA_API_SECRET_KEY` 只保存为 Vercel Sensitive 环境变量，作用于 Production 和 Preview；值不得进入 Git、客户端 bundle、日志、截图或文档。
- `.vercel/` 与 `.env*` 保持忽略；仓库只保留空值模板 `.env.example`。
- 不创建 Vercel Storage、Supabase、Postgres 或其他云数据库。持仓、草稿和上一有效行情缓存继续按 ADR-012 保存在当前浏览器来源的 IndexedDB。
- 发布检查、生产 smoke test、回滚和数据边界以 `../09-PRODUCTION-OPERATIONS.md` 为运行真源。

## Consequences

### Positive

- GitHub 可以重建当前生产源码，`main` 成为可审计的发布入口。
- Vercel 自动构建 Next.js 页面和服务端路由，无需把 Alpaca 凭据交给浏览器。
- Preview 与 Production 使用相同的服务器配置边界，同时保持独立部署。

### Negative

- 推送 `main` 会产生生产外部状态，提交前必须通过测试、构建、依赖审计和密钥检查。
- Preview、Production、自定义域名和 localhost 是不同浏览器来源，IndexedDB 数据互不共享。
- 清除网站数据、换机或更换生产域名可能导致本地持仓无法恢复；当前没有云备份。
- Vercel 托管成功不等于真实 iPhone、VoiceOver、完整市场时段行情或离线能力已经验收。

## Relationship to earlier ADRs

- 本 ADR 完成 ADR-004 中“Web/PWA 与服务端行情代理托管方式”的选型。
- ADR-004 关于认证、云数据库、云恢复和跨设备同步的部分继续保持 Proposed。
- ADR-012 的 IndexedDB 本地真值不变。
- ADR-013 的 Next.js App Router 运行时不变。

## Verification

`[实现事实 2026-07-30]`

- Vercel Git 设置显示已连接 `owner/stock-portfolio-calculator`。
- Production 环境 Branch Tracking 为 `main`。
- 生产主域名为 `provider.example.com`。
- 两个 Alpaca 变量均显示为 Sensitive，作用于 Production 和 Preview。
- GitHub `main` 已包含完整 Next.js 应用、测试和当前规格。
- commit `2ae2eda` 已由 Git push 自动创建 Production deployment，并达到 Ready。
