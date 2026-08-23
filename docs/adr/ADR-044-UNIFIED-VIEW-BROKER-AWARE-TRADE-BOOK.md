---
artifact: adr
version: "1.0"
created: 2026-08-20
status: amended
---

# ADR-044：统一展示下使用双券商交易与现金账本

## Status

Amended by ADR-045 and ADR-048: Sites persists the active book in account D1; stock provenance remains broker-aware while user-visible cash is one portfolio pool.

**Date:** 2026-08-20

**Decider:** 产品所有者

## Context

当前产品把股票 current 快照和一条手工 IBKR USD 现金记录分开维护。“加仓”只增加股票数量与成本，不扣现金；产品没有 SELL，因此用户在 IBKR 或 moomoo 买卖后，统一持仓、现金和总资产无法保持一致。用户实际同时在 IBKR 与 moomoo 持仓，并会不定期在任一券商买卖。同一股票仍应在首页合并，但卖出数量、剩余成本和资金去向都必须知道交易发生在哪个券商。

旧聚合 current 没有券商来源，不能安全自动拆分；旧 SELL 实验代码又带有已失效的券商账户模型，不能直接接入。历史收益、对账单导入和券商 API 同步仍不属于当前产品。

## Decision

我们将采用“前台统一、后台分券商”的本机双券商账本：

1. 首页继续按 `instrument` 合并 IBKR 与 moomoo 股票，同一标的只显示一行；券商只在校准、买入、卖出和现金行出现，不增加自由创建或管理券商账户。
2. 新账本固定支持 `IBKR` 与 `MOOMOO` 两个来源。每个来源分别保存每只股票的当前数量与剩余总成本，以及 USD 已结算现金和待结算净额。
3. 启用前必须经过本机校准预览和明确确认。校准以两家券商当前数量、剩余总成本和现金建立新基线；既有 `position_batches_v2` 与 `cash_accounts_v3` 原样保留，不自动迁移、删除或改写。
4. 新账本使用 IndexedDB schema v4 的独立 `broker_portfolio_v4` store，保存 current、previous、revision 和有限语义的本机事件。首页只在存在已确认 v4 current 时切换到新投影。
5. 买入、卖出与所选券商现金在同一次 v4 current 写入中生效；任何校验、revision 冲突或持久化失败都零变化。重复 event id 拒绝。
6. 买入使该券商数量增加、剩余成本增加 `quantity × unitPrice + fee`，对应已结算或待结算现金减少同额。
7. 卖出不得超过所选券商数量。部分卖出按该券商卖出前移动平均成本等比例扣减剩余成本；全卖后只移除该券商子持仓。现金增加 `quantity × unitPrice - fee`。另一家券商不变，合并行在仍有任一来源持仓时保留。
8. 已结算与待结算现金都进入账面总资产；IBKR 利息估算只使用正的 IBKR 已结算现金。moomoo 现金、待结算款和负现金不套用 IBKR 利率。负现金作为融资负债保留，不回退为零；当前不估算借款利息。
9. 校准可重复执行，作为遗漏交易、入出金、股息、利息、券商间转账或成本口径差异的当前值恢复路径。它不会生成长期收益。
10. 双券商账本导出严格 JSON v3，包含 current book 与本机事件；旧 current 继续使用 JSON v2。两种格式都只允许恢复到所有 current store 为空的来源，不合并、不覆盖，恢复后的本地 revision 从 1 开始。
11. 本决定不启用长期收益、历史图、对账单导入、券商 API、税务批次、FIFO、指定批次或税务已实现盈亏。移动平均只服务当前组合估值；券商剩余成本不一致时由用户校准当前值。

## Consequences

### Positive

- 用户录一笔买卖即可同时更新正确券商的股票与现金，不再依赖手工心算。
- 首页仍保持统一组合，不因底层资金来源重新分裂同一股票。
- 超卖、重复提交、并发覆盖和股票/现金半写入有明确拒绝边界。
- 旧设备唯一 current 不参与自动迁移，校准错误不会破坏旧 v3 数据。

### Negative

- 每笔交易必须多选择一次券商和现金结算状态。
- 首次启用需要按两家券商当前页面完成一次校准。
- 移动平均可能与券商税务批次不同；产品不能把估算称为税务已实现盈亏。
- v4 current 与 JSON v3 增加了新的数据契约和恢复测试面。

### Neutral

- 交易事件只驱动 current 维护与审计，不重新启用 ADR-035 的长期收益运行路径。
- IBKR 现金利率仍使用 ADR-023 的公开规则，但适用余额缩小为正已结算 IBKR USD。

## Alternatives Considered

### 所有交易都联动唯一 IBKR 现金

拒绝。用户也会在 moomoo 买卖，这会把资金记到错误券商。

### 只在聚合持仓上减数量

拒绝。系统无法验证所选券商是否有足够股票，也无法正确维护该券商的剩余成本和现金。

### 立即接入券商 API 或导入全部历史

拒绝。它引入凭据、外部权限、历史缺口、税务批次和迁移风险；当前问题可以用本机基线与向前交易记录解决。

## References

- `../01-PRD.md`
- `../02-DOMAIN-AND-CALCULATIONS.md`
- `../08-OPEN-QUESTIONS.md`
- `ADR-010-UNIFIED-PORTFOLIO.md`
- `ADR-011-CURRENT-POSITION-SNAPSHOT-BATCH.md`
- `ADR-017-HOME-POSITION-ACTIONS.md`
- `ADR-023-IBKR-USD-CASH-ASSET.md`
- `ADR-037-SINGLE-INTRADAY-TREND.md`
