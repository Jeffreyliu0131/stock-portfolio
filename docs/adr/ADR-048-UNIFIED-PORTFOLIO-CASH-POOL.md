---
artifact: adr
version: "1.0"
created: 2026-08-22
status: accepted
---

# ADR-048：所有股票买卖统一联动组合现金池

## Status

Accepted

**Date:** 2026-08-22

**Decider:** 产品所有者

## Context

ADR-044 已让 BUY/SELL 同时修改股票与现金，但产品界面仍把 IBKR 与 moomoo 现金显示成两条，并在交易预览中只显示所选券商现金。领域测试又主要使用 BOXX，容易形成“BOXX/SGOV 才像现金等价物，因此只有它们卖出才进现金”或“买卖只能动对应券商现金”的错误理解。

产品所有者本次明确确认：BOXX、SGOV 和其他受支持股票完全使用同一套交易现金规则；卖出任何股票都把净卖出款加入现金，买入任何股票都从现金扣除成交额与手续费。虽然股票仍可能来自 IBKR 或 moomoo，但现金在产品中按一个组合现金池理解和展示。

## Decision

1. 不设置 BOXX、SGOV 或任何其他 symbol 特例。所有受支持股票/ETF 的 BUY/SELL 进入同一领域函数与同一现金公式。
2. 用户可见且参与总资产、交易预览、复制与组合分析的现金真值是：

   ```text
   portfolioCash = Σ(settledBalance_broker + pendingBalance_broker)
   ```

   首页只显示一条“组合现金”，不把 IBKR 与 moomoo 描述成两个可分别花用的现金池。
3. 买入任意股票：

   ```text
   cashDelta = -(quantity × unitPrice + fee)
   portfolioCashAfter = portfolioCashBefore + cashDelta
   ```

4. 卖出任意股票：

   ```text
   cashDelta = quantity × unitPrice - fee
   portfolioCashAfter = portfolioCashBefore + cashDelta
   ```

5. `broker` 继续用于验证从哪一边增加/扣减股票数量，以及计算该来源的剩余成本；用户不再额外选择现金账户。已结算/待结算状态继续记录，二者都进入组合现金总额。
6. 为避免破坏已经存在的 D1 current、IndexedDB v4 与 JSON v3，底层 `cashAccounts[IBKR|MOOMOO]` 继续保留为兼容和结算/利息来源明细。交易可以在内部把现金变化记到交易来源分量，但产品数学与预览只认合计；不执行数据迁移、覆盖或历史重写。
7. 股票、剩余成本、现金变化与事件仍在同一个 current compare-and-swap 中提交。无效输入、超卖、重复 event id、revision 冲突或写入失败时全部零变化。
8. IBKR 利息仍只按正的 IBKR 已结算 USD 估算；组合现金池合计不能被描述为全部享受 IBKR 利率。该限制不影响买卖现金联动。
9. 本决定不启用券商 API、税务批次、已实现盈亏、历史收益或自动交易。

## Consequences

### Positive

- 用户只需理解“卖出进现金、买入扣现金”，不会再把 BOXX/SGOV 当成例外。
- 交易页预览与首页总资产使用同一个现金数，跨券商买卖后仍能直接核对资产守恒。
- 保留既有存储和备份 contract，不需要对当前账号做不可逆迁移。

### Negative

- 底层仍保留券商现金分量，因此调试资料可能看到比用户界面更细的来源数据。
- 组合现金合计不能直接用于 IBKR 利息估算；利息仍依赖内部 IBKR 已结算分量。

### Neutral

- 股票来源仍按券商维护，以便防止从错误券商超卖并保持该来源移动平均剩余成本。
- 负组合现金仍表示融资负债，不因统一展示而归零或阻止交易。

## Amends

- 修订 ADR-044 的用户可见现金拆分：股票来源仍分券商，现金改为统一组合池。
- 不改变 ADR-045 的 Sites D1 current 真值和 compare-and-swap 边界。

## References

- `../01-PRD.md`
- `../02-DOMAIN-AND-CALCULATIONS.md`
- `../05-ACCEPTANCE-CRITERIA.md`
- `../08-OPEN-QUESTIONS.md`
- `ADR-044-UNIFIED-VIEW-BROKER-AWARE-TRADE-BOOK.md`
- `ADR-045-SITES-AUTHENTICATED-CLOUD-PORTFOLIO.md`
