---
artifact: adr
version: "2.0"
created: 2026-07-29
updated: 2026-07-30
status: superseded
---

# ADR-005：移动加权平均卖出成本提案

## Status

Superseded by ADR-006；当前不得用于实现。

## Historical context

旧方案曾建议在逐笔账本中用移动加权平均减少卖出后的剩余成本。该提案后来进入按来源分别计算的 ADR-006，又被 ADR-007 取代。

2026-07-30 的方向同步确认：产品不保留券商维度，P0 采用当前持仓快照批次，不维护逐笔交易或 SELL。因此，本文件只保留取舍历史，不证明用户接受过该算法；以后加入交易时必须重新决定卖出成本。

## Historical formula

```text
averageCostBefore = openCostBefore / quantityBefore
allocatedCost = sellQuantity × averageCostBefore
openCostAfter = openCostBefore - allocatedCost
```

## Current consequence

不得从此公式生成新验收标准或业务代码。后续若确认逐笔卖出，需要根据开放问题的答案新增 ADR。

## References

- 当前统一组合：`ADR-010-UNIFIED-PORTFOLIO.md`
- 待确认问题：`../08-OPEN-QUESTIONS.md`
