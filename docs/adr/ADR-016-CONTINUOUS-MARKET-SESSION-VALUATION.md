---
artifact: adr
version: "1.0"
created: 2026-07-30
updated: 2026-08-03
status: amended-by-adr-020
---

# ADR-016：按美股 24/5 市场时段连续估值

## Status

Amended by ADR-020

**Date:** 2026-07-30

**Decider:** 产品所有者

## Context

首个生产实现只在美东常规交易时段请求 `delayed_sip`。用户在盘前首次录入持仓时没有任何浏览器缓存价，因此市值、浮动盈亏和持仓收益率都无法计算。

`[用户确认 2026-07-30]` App 应全天显示可用估值，并跟随盘前、常规盘、盘后和 24/5 隔夜市场；约 15 分钟延迟可以接受。

`[外部事实 2026-07-30]` Alpaca Stock Snapshot 支持 `delayed_sip` 与 `overnight`；其中 `overnight` 最新成交约延迟 15 分钟，并属于从 BOATS 派生、经买卖价范围调整的指示性成交。`[账户事实 2026-07-30]` 当前 Alpaca Dashboard 显示 Basic 为 Current Plan；`feed=overnight` 的实际账户权限仍以生产隔夜时段 smoke 为最终证据。

## Decision

- 美东盘前 04:00–09:30、常规盘和盘后至 20:00 使用 `feed=delayed_sip`；
- 美东 20:00–04:00 的有效 24/5 隔夜时段使用 `feed=overnight`；
- `overnight` 成交使用独立 `INDICATIVE_TRADE` 价格类型，不伪装成 SIP 成交；
- 服务端用 Alpaca 市场日历识别节假日和提前收盘；日历暂时不可用时按 `America/New_York` 标准 24/5 时段继续刷新；
- 隔夜标的暂时没有成交或隔夜 feed 不可用时，回退到最近的 `delayed_sip` 成交或浏览器中的上一有效价；
- 周末、节假日和其他休市时仍请求最近的 `delayed_sip` Snapshot，使新设备也能得到最后市场价；该价格标为休市最终价并保留原事件时间；
- 页面显示盘前、常规盘、盘后、隔夜或休市，并始终标明约 15 分钟延迟；隔夜来源明确标为指示性成交；
- App 可见时每 60 秒刷新一次，从后台恢复时补刷；iOS 暂停页面或 App 被关闭时不承诺后台刷新；
- 价格只影响估值，不修改持仓数量或成本。

## Consequences

- 用户首次在非正常交易时段打开 App，也能在 provider 有最后成交时看到市值、浮动盈亏和收益率。
- 美股连续交易是 24/5，不是周末也持续变化的 24/7；休市时数字保持最近有效价。
- 扩展时段和隔夜成交量可能较低，同一价格可能长时间不变化；UI 必须通过市场时段、来源和事件时间表达这一点。
- 每次刷新通常包含一次市场日历请求和一次 Snapshot 请求；隔夜无成交时最多增加一次 `delayed_sip` 回退请求。
- ADR-003 的 Alpaca provider、安全边界、延迟披露和错误降级规则继续有效；本 ADR 关闭 OQ-006。

## References

- Alpaca 24/5 Trading：<https://docs.alpaca.markets/us/docs/245-trading-for-trading-api>
- Alpaca Stock Snapshots：<https://docs.alpaca.markets/us/reference/stocksnapshots-1>
- Alpaca Historical Stock Data feeds：<https://docs.alpaca.markets/us/docs/historical-stock-data-1>
- 领域行情规则：`../02-DOMAIN-AND-CALCULATIONS.md`

外部事实最后核验：2026-07-30。

## Amended by

ADR-020 于 2026-07-31 删除首页逐行的市场时段、事件时间、老化、上一有效价和隔夜提醒。市场时段选择、`delayed_sip` / `overnight`、`INDICATIVE_TRADE`、真实元数据、刷新与安全回退规则继续有效，并保留在数据层。

## Extended by

ADR-027 于 2026-08-03 让夜盘正常刷新同时取得 `overnight` 估值价和 `delayed_sip` latest daily bar 常规收盘参考，用于动态计算全股票仓今日盈亏。
