---
artifact: adr
version: "1.2"
created: 2026-07-29
updated: 2026-07-30
status: superseded
---

# ADR-002：使用可审计手工账本作为持仓真源

## Status

Superseded by ADR-010 and ADR-011

## 原决定

本 ADR 曾把产品定义为：

- 按券商建立期初持仓；
- 之后逐笔记录买入、卖出和修正；
- 每个券商独立计算，再跨券商合并；
- 通过校准检查点与券商当前值对齐。

## 被取代原因

产品所有者于 2026-07-30 明确：

- 产品和 UI 不需要管理券商；
- 用户统一录入；
- 同一股票统一计算；
- 主要目标是直观看合并后的总仓位。

因此，本 ADR 中的券商实体、券商计算分组和跨券商折叠均不再成立。

产品所有者随后确认 P0 按标的维护当前持仓快照批次，不采用逐笔买卖；保存意图已由 ADR-015 进一步区分为“普通录入叠加、完整编辑替换”，两者都保留恢复路径。部分卖出和已实现盈亏不进入 P0。现有账本代码只能视为实验实现，不能反向证明产品决定。

## 替代决定

无券商维度的统一持仓模型见：

- `ADR-010-UNIFIED-PORTFOLIO.md`
- `ADR-011-CURRENT-POSITION-SNAPSHOT-BATCH.md`
- `../02-DOMAIN-AND-CALCULATIONS.md`
- `../08-OPEN-QUESTIONS.md`
