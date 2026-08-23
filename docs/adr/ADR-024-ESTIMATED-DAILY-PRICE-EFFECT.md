---
artifact: adr
version: "1.2"
created: 2026-08-02
updated: 2026-08-03
status: amended-by-adr-025-and-adr-027
---

# ADR-024：首页显示今日价格变化影响估算

## Status

Amended by ADR-025 and ADR-027

**Date:** 2026-08-02

**Decider:** 产品所有者

## Amendment 2026-08-02

ADR-025 保留本 ADR 的所有领域公式、完整性、现金排除、CNY 金额派生和估算语义，但取代界面展示决定：取消总资产数字下方的独立今日变化条及持仓表“持仓 / 今日”切换，改为在总资产 3 × 2 指标矩阵中用“今日涨幅”替换“定价覆盖”，同格显示组合涨跌幅和今日变化估算金额。

## Amendment 2026-08-03

ADR-027 继续保留本 ADR 的领域公式、完整性、现金排除、CNY 派生和估算边界；现行界面名称为“今日盈亏”，整个股票仓的估算金额为主值、今日涨跌幅为副值。ADR-027 同时扩展夜盘取值：`overnight` 作为估值价，`delayed_sip` latest daily bar 作为最近常规收盘参考。

## Context

产品所有者希望首页像券商账户页一样，直接回答“今天价格变化让当前组合变化了多少钱”，并能查看每只股票的今日变化金额与涨跌幅。

P0 只保存当前持仓快照，不记录逐笔交易、当日净入金、买卖时间或已实现盈亏。因此产品可以根据当前数量和前一常规收盘价估算价格变化影响，但不能据此还原包含当日交易现金流的真实盈亏。

现有股票行情 contract 已保留估值价，并可在来源可靠时保留 `previousRegularClose`。现金本金没有股票价格变化，不进入该指标。

## Decision

- 首页总资产摘要在有股票时直接显示“今日变化”估算金额，不要求用户先进入详情或切换列表。
- 持仓表第四列默认继续显示累计浮动盈亏与持仓收益率；工具栏提供“持仓 / 今日”切换。“今日”模式显示逐股今日变化金额与涨跌幅，切换不改变排序、数量、成本、估值价或任何持仓真值。
- 单只股票以当前未舍入数量 `Q`、估值价 `P` 和前一常规收盘价 `C` 计算：

```text
estimatedDailyPriceEffect = Q × (P - C)
estimatedDailyChangeRate = (P - C) / C
```

- 组合今日变化金额为全部股票 `estimatedDailyPriceEffect` 之和。组合今日变化率的分母为全部股票按前收估算的市值：

```text
portfolioEstimatedDailyPriceEffect = Σ[Q × (P - C)]
portfolioEstimatedDailyChangeRate =
  portfolioEstimatedDailyPriceEffect / Σ(Q × C)
```

- `C` 必须是大于零且可可靠识别的前一常规收盘价。任一股票缺少有效估值价或 `previousRegularClose` 时，该行今日变化保持未知，组合结果也保持未知；不得以 `0`、当前估值价或其他猜测值补齐。
- IBKR USD 现金本金和利息估算都不参与今日变化。现金行在“今日”模式明确显示“现金无价格变化”。
- USD 是计算真值。人民币金额从未舍入 USD 今日变化乘以当前有效 USD/CNY 汇率派生；今日涨跌幅不换算，CNY 结果不写回领域或持仓存储。
- 正值使用红色、负值使用绿色，并始终保留正负号和“估算”语义。页面说明：今日变化按当前股数相对前一常规收盘价估算；若当日持仓数量发生变化，不等于真实交易盈亏。
- 本决定不新增 IndexedDB 字段、行情 provider、交易流水、卖出成本、已实现盈亏或云端存储。

## Consequences

### Positive

- 用户在第一屏即可看到最接近券商账户页的当日金额变化，同时保留逐股核对入口。
- 计算复用现有未舍入数量、估值价和前收数据，不建立第二套持仓或成本真值。
- 完整性规则使缺失前收不会被静默当作零，也不会生成看似完整但低估的组合结果。

### Trade-offs

- 当日发生加仓、减仓、转入或转出时，当前数量会被应用于整段价格变化，因此数值可能明显不同于券商按实际交易时间计算的当日盈亏。
- 某一股票缺少可靠前收时，组合总值会显示未知，即使其他股票可以计算。
- 当前首页不展示逐股前收时间和行情时段；这些元数据继续保留在数据层，诊断需要使用专门证据。

## Amends

- 本 ADR 修订 ADR-020 的固定第四列定义：四列表结构保持不变，第四列默认仍是“盈亏/收益率”，但允许切换为“今日变化/涨跌幅”。
- ADR-016 的市场时段、行情选择和安全降级规则保持不变；本 ADR 只消费其可用估值价和前一常规收盘价。
- ADR-008 与 ADR-022 的 USD 真值和 CNY 派生规则继续适用于今日变化金额。
- ADR-023 的现金本金与利息估算保持不变；现金只从今日价格变化指标中排除。

## Verification

`[实现事实 2026-08-02]` 领域、USD/CNY ViewModel、总览和“持仓 / 今日”切换已经实现；35 个测试文件中的 299 项测试、TypeScript、领域构建和 Next.js 生产构建完整门禁通过。合成股票/现金的最终生产构建在 390 px 与 320 px/200% 根字号下无页面横向溢出，切换目标至少 44 CSS px。真实市场时段、生产发布和 iPhone 尚未验证。

发布前必须证明：

- 逐股与组合金额、涨跌幅使用未舍入十进制值，覆盖正、负、零、碎股和高精度价格；
- 缺少估值价、缺少前收、前收非正数和部分缺失组合都保持未知，不产生伪零值；
- 现金排除、CNY 派生和“持仓 / 今日”切换不改写持仓、行情缓存、备份或复制真值；
- 320–430 CSS px、200% 文字、键盘和 VoiceOver 下，切换、表头与正负金额可读且不造成关键横向溢出；
- 真实 iPhone 上使用实际延迟行情核对组合与逐股显示，并确认当日数量变化提示可见。

## References

- Alpaca Stock Snapshot：<https://docs.alpaca.markets/us/reference/stocksnapshotsingle>
- `ADR-008-USD-CNY-DERIVED-DISPLAY.md`
- `ADR-016-CONTINUOUS-MARKET-SESSION-VALUATION.md`
- `ADR-020-FUTU-STYLE-PORTFOLIO-HOME.md`
- `ADR-023-IBKR-USD-CASH-ASSET.md`
- `../02-DOMAIN-AND-CALCULATIONS.md`
- `../05-ACCEPTANCE-CRITERIA.md`
