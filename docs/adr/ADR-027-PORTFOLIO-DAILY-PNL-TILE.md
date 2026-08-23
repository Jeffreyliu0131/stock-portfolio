---
artifact: adr
version: "1.1"
created: 2026-08-03
updated: 2026-08-03
status: amended-by-adr-028
---

# ADR-027：全股票仓今日盈亏动态展示

## Status

Amended by ADR-028

**Date:** 2026-08-03

**Decider:** 产品所有者

## Amendment 2026-08-03

ADR-028 不改变本 ADR 的组合“今日盈亏”指标、公式、夜盘参考或现金排除；它在持仓表新增第五列，直接展示每只股票的今日涨幅与小字今日盈亏金额，同时保留第四列累计盈亏/收益率。

## Context

夜盘 `overnight` 价格已会刷新市值和累计持仓收益率，但原实现不从夜盘行情中伪造常规收盘参考，导致组合“今日涨幅”在夜盘显示不可计算。

`[2026-08-03 产品所有者确认]` 首页需要像券商账户页一样，让整个股票仓的今日盈亏随可用行情持续变化；指标名称改为“今日盈亏”，IBKR USD 现金和利息估算都不参与计算。

P0 只有当前持仓快照，没有当日逐笔买卖、成交时间、已实现盈亏或现金流记录。因此该指标可以按当前股数估算价格变化影响，无法等同于券商基于真实账户流水的当日盈亏。

## Decision

- 总资产 3 × 2 指标矩阵使用“今日盈亏”。主值显示带正负号的整个股票组合今日盈亏估算金额，副值显示组合今日涨跌幅并保留“估算”。
- 单只和组合数学继续使用 ADR-024 的未舍入真值：`Q × (P - C)` 及其按前收市值加权的组合涨跌幅。
- `P` 按市场时段取 Alpaca 当前有效估值价：盘前、常规盘和盘后使用 `delayed_sip`，夜盘使用 `overnight` 指示价。
- 夜盘额外请求同一批标的的 `delayed_sip` Snapshot，只使用其 latest daily bar 作为最近已完成常规交易时段的收盘参考 `C`。`overnight` feed 自身的 daily bar 不得伪装成常规收盘。
- 夜盘暂无指示成交时，同一笔 `delayed_sip` Snapshot 继续作为估值价回退。
- IBKR USD 现金本金、未入账利息估算和 NAV 都不进入今日盈亏分子或涨跌幅分母。只有现金时显示不可计算，并说明现金不参与。
- 任一股票缺少有效估值价或可靠常规收盘参考时，整个组合金额和涨跌幅都保持未知，不以部分结果或 `0` 补齐。
- 页面可见时每 60 秒刷新行情，从后台恢复时补刷。界面不使用“实时”：`delayed_sip` 和夜盘成交约延迟 15 分钟，夜盘价仍是指示价。
- USD 是金额真值；人民币模式只折算今日盈亏金额，涨跌幅保持不变。

## Consequences

- 夜盘取得有效指示价和常规收盘参考后，整仓今日盈亏金额会随每次行情刷新变化。
- 夜盘正常刷新固定增加一次 `delayed_sip` Snapshot 批量请求，同时承担最近常规收盘参考和无夜盘成交时的估值回退。
- 当日加仓、减仓或手工修改数量时，当前数量会被应用到整段价格变化，因此金额可能与券商账户的当日盈亏不同。
- 指标继续是组合级完整结果；单只缺失参考会让整仓显示未知，但不影响已有市值和累计浮动盈亏。

## Amends

- 修订 ADR-025 的指标名称和主副值顺序：“今日涨幅”改为“今日盈亏”，金额成为主值，涨跌幅成为副值。
- 扩展 ADR-016 的夜盘行情路由：夜盘正常请求同时取得 `overnight` 估值价和 `delayed_sip` 常规收盘参考。
- ADR-024 的公式、完整性、现金排除、CNY 派生和估算边界继续有效。

## Verification

发布前必须证明：

- 盘前、常规盘、盘后和夜盘都使用正确的最近常规收盘参考；
- 夜盘有指示价、夜盘无成交回退、`delayed_sip` 参考失败和浏览器上一有效价场景都不伪造收盘价或 `0`；
- 加入、修改或删除 IBKR USD 现金不改变同一笔股票今日盈亏和涨跌幅；
- USD/CNY、正负零值、缺失参考、320–430 CSS px、200% 文字和 VoiceOver 均符合展示及估算披露。

## References

- Alpaca Stock Snapshots：<https://docs.alpaca.markets/us/reference/stocksnapshots-1>
- Alpaca 24/5 Trading：<https://docs.alpaca.markets/us/docs/245-trading-for-trading-api>
- Alpaca-py Snapshot model：<https://alpaca.markets/sdks/python/api_reference/data/models.html#alpaca.data.models.snapshots.Snapshot>
- `ADR-016-CONTINUOUS-MARKET-SESSION-VALUATION.md`
- `ADR-024-ESTIMATED-DAILY-PRICE-EFFECT.md`
- `ADR-025-DAILY-RATE-SUMMARY-TILE.md`

外部事实最后核验：2026-08-03。
