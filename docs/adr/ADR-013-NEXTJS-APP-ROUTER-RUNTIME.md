---
artifact: adr
version: "1.0"
created: 2026-07-30
status: accepted
---

# ADR-013：P0 使用 Next.js App Router 与 React

## Status

Accepted

**Date:** 2026-07-30
**Decider:** 产品所有者

## Context

P0 同时需要 iPhone 优先页面、PWA manifest 和保护 Alpaca 密钥的服务端行情边界。作出本决定时，仓库只有 TypeScript 领域与应用层模块，没有可运行的 Web 页面。

技术选型需要保持领域计算与 UI 解耦，并避免把 provider 密钥带入浏览器。

## Decision

- P0 Web runtime 使用 Next.js App Router、React 和 TypeScript。
- 首页使用 `/`，统一持仓快照录入使用独立页面；具体路由名由实现保持清晰稳定。
- 浏览器只调用本产品的服务端行情路由；Alpaca adapter 和密钥留在 server-only 边界。
- manifest 由 Next.js 应用提供，页面适配 iPhone 安全区域和 standalone 模式。
- 领域计算、十进制真值和 repository contract 不依赖 React 或 Next.js。
- P0 不引入 Service Worker、完整离线应用壳或离线编辑承诺。

本决定本身不选择生产托管平台；随后 ADR-014 已选择 Vercel。Supabase、认证和云数据库仍未进入 P0。

## Consequences

### Positive

- 页面、PWA manifest 与服务端行情边界可以在一个 TypeScript runtime 中实现；
- server-only 模块边界可以保护 Alpaca 凭据；
- 领域层保持可独立测试。

### Negative

- 需要增加 Web 构建、组件、路由和浏览器 E2E 测试；
- 客户端与服务端模块必须明确分界，避免密钥或 Node-only 代码进入 bundle；
- Service Worker 与完整离线能力需要以后单独设计更新和缓存策略。

## References

- `ADR-001-PWA-DELIVERY.md`
- `ADR-003-DELAYED-SIP-MARKET-DATA.md`
- `ADR-014-VERCEL-GITHUB-DEPLOYMENT.md`
- `../03-UX-SPEC.md`
- `../04-TECHNICAL-SPEC.md`
