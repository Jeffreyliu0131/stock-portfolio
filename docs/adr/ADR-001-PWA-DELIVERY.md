---
artifact: adr
version: "2.0"
created: 2026-07-29
updated: 2026-07-30
status: accepted
---

# ADR-001：使用 PWA 交付 iPhone 体验

## Status

Accepted

**Confirmed:** 2026-07-30

## Context

`[用户确认 2026-07-30]` 产品面向 iPhone；作出本决策时，PWA UI 是下一实现重点。

`[约束推导]` 核心能力是持仓录入、组合计算和带时间戳的网络行情；当前不需要 App Store 分发或原生交易能力。

Apple 官方支持将网站添加到 iPhone 主屏幕并作为 Web App 打开。

## Decision

P0 以响应式 PWA 交付：

- 支持 Safari 访问和添加到主屏幕；
- 提供 manifest、图标、standalone 显示与安全区适配；
- 先完成移动端首页、统一录入和持仓查看；
- 不构建原生 iOS 包，也不依赖 App Store 或 TestFlight。

离线写入、云同步、Web Push 和后台刷新不属于本 ADR 的决定；它们只有在用户另行确认后才能扩大范围。

## Consequences

- 一套 Web 代码可以覆盖 iPhone 和桌面浏览器。
- 必须在真实 Safari 和 iPhone 上验证安装、启动和安全区；若首版选择持久化，再验证对应存储行为。
- iOS 会限制后台页面执行，产品不能承诺持续后台刷新。
- 生产部署已由 ADR-014 选择 Vercel 与 GitHub `main` 自动发布。

## References

- Apple 添加到主屏幕：<https://support.apple.com/guide/iphone/iphea86e5236/ios>
- 产品需求：`../01-PRD.md`
- 体验规格：`../03-UX-SPEC.md`

外部事实最后核验：2026-07-29。
