---
artifact: adr
version: "1.2"
created: 2026-07-29
updated: 2026-07-30
status: superseded
---

# ADR-007：只维护当前开放持仓均价

## Status

Superseded by ADR-010

## 原决定

本 ADR 曾决定：

- 按 `user + broker + instrument` 维护数量、剩余成本和平均成本；
- 两个券商先分别计算，再汇总数量和成本；
- 部分卖出保持各券商卖出前的平均成本；
- 不计算已实现盈亏、税务成本或卖出批次。

## 被取代原因

产品所有者于 2026-07-30 明确取消券商产品与计算维度。原决定的分组键、每券商计算和再聚合顺序已经失效。

下列纯数学关系仍成立，但现在由领域规则和 ADR-010 管理：

```text
averageCost =
  totalOpenCost / totalQuantity
  （仅当 totalQuantity > 0）
```

同一标的的数量和成本必须分别求和后再计算平均成本。

## 未迁移的决定

本 ADR 的 SELL 公式没有自动迁移到统一持仓模型。

产品所有者已确认 P0 采用当前持仓快照批次，不提供 SELL。因此：

- 不得继续把该 SELL 公式标为已确认；
- 不得因为现有代码已实现该公式就视为产品决定；
- P0 不需要 SELL 成本公式；
- 以后若加入逐笔交易，必须重新确认并新增 ADR。

## 替代决定

- `ADR-010-UNIFIED-PORTFOLIO.md`
- `ADR-011-CURRENT-POSITION-SNAPSHOT-BATCH.md`
- `../02-DOMAIN-AND-CALCULATIONS.md`
- `../08-OPEN-QUESTIONS.md`
