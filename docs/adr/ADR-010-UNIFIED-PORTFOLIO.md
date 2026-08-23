---
artifact: adr
version: "1.2"
created: 2026-07-30
updated: 2026-08-02
status: accepted
---

# ADR-010：使用无券商维度的统一持仓模型

## Status

Accepted

Amended by ADR-044：首页与对外组合仍按 `instrument` 统一合并；启用双券商账本后，底层为卖出数量、剩余成本和现金归属保留 IBKR/moomoo 子持仓。

**Date:** 2026-07-30  
**Decider:** 产品所有者

## Context

旧规格把两家券商建模为两个手工标签，先分别计算，再跨券商合并。该模型带来了券商管理页面、券商字段、每券商账本和额外的计算层。

产品所有者明确表示：

- 不用管理券商；
- 数据统一录入；
- 两家券商的数据作为一次数学合并处理；
- 需要直观看到总仓位；
- 作出本决策时 PWA UI 尚未完成，应围绕这个核心目标设计。

## Decision

### 产品与 UI

- P0 不提供券商创建、编辑、选择、筛选或详情页面。
- 录入表单不要求券商。
- 首页直接展示组合总仓位和同一标的的合并持仓。
- 券商名称不属于产品数据。

### 领域分组

当前统一组合内，持仓按以下键计算：

```text
instrumentKey
```

用户或设备命名空间如未来存在，只负责隔离不同数据集，不参与单个组合内的成本计算。不得使用：

```text
brokerAccountId + instrumentKey
```

### 合并公式

同一标的存在多项有效输入时：

```text
totalQuantity =
  Σ inputQuantity

totalOpenCost =
  Σ inputOpenCost

averageCost =
  totalOpenCost / totalQuantity
  （仅当 totalQuantity > 0）
```

必须先求总数量和总成本，再计算平均成本。不得直接平均多个平均成本。

### 后续决定

本 ADR 在接受时没有决定：

- 只维护当前持仓还是逐笔维护买卖；
- BUY、SELL 或校准记录的数据结构；
- 部分卖出如何减少剩余成本；
- 已实现盈亏、税务成本或卖出批次；
- CNY 是否进入 P0；
- 数据保存在本地、云端还是两者都有。

其中 P0 持仓维护方式随后由 ADR-011 确认为当前持仓快照批次；P0 本地存储由 ADR-012 确认；CNY 派生显示随后由 ADR-008 于 2026-08-02 确认进入 P0，但它不改变本 ADR 的 USD 持仓真值和统一合并公式。SELL、已实现盈亏和税务批次仍未进入 P0，不能把旧 ADR-007 的每券商 SELL 公式迁移为全局 SELL 公式。

## Consequences

### Positive

- UI 直接对应用户要看的统一总仓位；
- 用户不需要维护与计算无关的券商标签；
- 同一标的只有一个数量、总成本、平均成本和估值结果；
- 数据模型和查询键更小。

### Negative

- 产品不能展示或恢复某个持仓来自哪家券商；
- 现有包含 `brokerAccountId` 的实验代码、测试和文档需要迁移。

## Supersedes

ADR-010 取代 ADR-002 和 ADR-007 的券商模型；ADR-011 进一步取代 ADR-002 的逐笔账本方向。两份旧 ADR 仅保留历史背景，其中的 SELL 公式不会自动迁移。

## References

- `../02-DOMAIN-AND-CALCULATIONS.md`
- `../08-OPEN-QUESTIONS.md`
- `ADR-011-CURRENT-POSITION-SNAPSHOT-BATCH.md`
- `ADR-008-USD-CNY-DERIVED-DISPLAY.md`
