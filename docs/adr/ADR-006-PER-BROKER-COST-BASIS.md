---
artifact: adr
version: "2.0"
created: 2026-07-29
updated: 2026-07-30
status: superseded
---

# ADR-006：按券商分别计算成本的历史提案

## Status

Superseded by ADR-007，且其券商维度最终由 ADR-010 明确废弃。

## Historical context

旧方案试图为不同券商分别配置成本规则。它依赖券商身份、地区、批次和税务口径，复杂度远超总仓位查看需求，也与 2026-07-30 确认的“无需管理券商、统一公式合并”冲突。

## Current consequence

- 不实现 `CostBasisPolicy`、券商算法或券商拆分；
- 不用本文件推断卖出公式；
- 当前代码中的券商类型属于待清理实现债务；
- 如以后需要逐笔卖出或税务口径，必须重新确认范围并新增 ADR。

## References

- 当前统一组合：`ADR-010-UNIFIED-PORTFOLIO.md`
- 待确认问题：`../08-OPEN-QUESTIONS.md`
