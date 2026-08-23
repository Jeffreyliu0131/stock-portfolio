---
artifact: adr
version: "2.0"
created: 2026-07-29
updated: 2026-08-03
status: amended-by-adr-020
---

# ADR-003：使用 Alpaca 延迟 SIP 行情

## Status

Amended by ADR-020

**Selected:** 2026-07-29  
**Reaffirmed:** 2026-07-30

## Context

`[用户确认 2026-07-30]` 股票行情提供方已经选定为 Alpaca，产品接受 `delayed_sip` 的延迟数据。

`[约束推导]` 该数据只用于持仓估值，不作为交易执行价格。

`[外部事实 2026-07-29]` Alpaca 官方把 `delayed_sip` 描述为 15 分钟延迟的 SIP feed。`[实现事实 2026-07-30]` 生产标的解析已经证明服务端凭据可用；真实行情的 schema、时间合理性、限额和持续可靠性按 ADR-016 的市场时段继续验证。

## Decision

- 股票行情使用 Alpaca `delayed_sip`；
- `[约束推导]` 接入通过服务端 provider adapter，密钥不得进入客户端；
- `[约束推导]` 每笔行情保留 `provider`、`feed`、`priceType`、`sourceEventAt` 和 `fetchedAt`；
- `[约束推导]` UI 明确标为延迟行情，不使用“实时”；
- `[约束推导]` 缺失、异常或失败时不得以 `0` 代替价格；
- `[约束推导]` 使用上一有效价时保留原时间并显示缓存或陈旧状态；
- 具体新鲜度阈值由领域规则管理；盘前、常规盘、盘后、隔夜和刷新策略由 ADR-016 扩展。

## Consequences

- 全市场延迟口径适合组合估值，但与实时交易页面会存在时间差。
- 服务端运行边界和凭据 smoke test 已通过；ADR-016 定义的各市场时段报价 smoke 仍是行情验收门禁。
- 如果权限或许可不满足，需要新增 ADR 更换 provider；不能静默改变 feed 口径。

## References

- Alpaca 股票数据：<https://docs.alpaca.markets/us/docs/real-time-stock-pricing-data>
- Alpaca Snapshot API：<https://docs.alpaca.markets/us/reference/stocksnapshots-1>
- 领域行情规则：`../02-DOMAIN-AND-CALCULATIONS.md`

外部事实最后核验：2026-07-29。

## Extended by

ADR-016 在不改变 provider、安全边界和延迟披露的前提下，增加 `overnight` feed 与连续市场时段估值。

## Amended by

ADR-020 于 2026-07-31 修订首页可见表达：上一有效价、事件时间和陈旧状态继续在领域与缓存层保留，但首页不逐行展示这些诊断字段；从未取得有效价格时仍明确缺价，请求故障可使用紧凑的页面级提示。provider、延迟、禁止伪造时间和禁止回退为 `0` 的决定不变。
