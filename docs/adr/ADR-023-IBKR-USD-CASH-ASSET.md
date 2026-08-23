---
artifact: adr
version: "1.0"
created: 2026-08-02
status: accepted
---

# ADR-023：把 IBKR USD 现金作为本机资产记录

## Status

Accepted

Amended by ADR-044：旧 v3 单条 IBKR 现金继续原样保留；v4 分别保存 IBKR 与 moomoo 的已结算/待结算现金，IBKR 利息只基于正已结算 IBKR USD。

**Date:** 2026-08-02

**Decider:** 产品所有者

## Context

产品所有者在 IBKR 留有一部分 USD 现金，希望把现金和股票放在同一首页查看总资产，并按 IBKR 公布的现金利率估算利息。现有手机数据以 IndexedDB 股票快照为本地真值；新增现金能力必须保留这些股票数据。

股票仍按 ADR-010 使用无券商维度的统一持仓模型。这里的 IBKR 只用于确定一条现金资产的利率规则，不引入券商账户选择、股票券商拆分、登录、授权或自动同步。

`[外部事实 2026-08-02]` Interactive Brokers 官方现金利率页对直接客户的正结算 USD 现金公布：IBKR Pro 档位年利率为 `3.13%`，IBKR Lite 为 `2.13%`；首 USD 10,000 不计息；账户 NAV 达到 USD 100,000 时使用完整档位利率，低于门槛时按 NAV 比例调整。利息按日计提并按月入账，公布利率可以变化。

## Decision

- 当前组合最多保存一条固定键 `IBKR:USD` 的现金记录。用户手工录入现金余额、IBKR Pro/Lite，以及可选的 IBKR 账户 NAV。
- 未填写 NAV 时暂用现金余额作为 NAV，并同时保存 `navSource=CASH_BALANCE_FALLBACK` 与 `netAssetValue=balance`。来源标为 fallback 时两值必须严格相等；页面、备份和复制文本必须明确披露该假设，不得用本 App 的股票总资产冒充 IBKR NAV。
- 现金与利息计算全部使用未舍入十进制字符串。以现金余额 `B`、IBKR NAV `N`、免息额 `F=10000`、完整利率 NAV 门槛 `T=100000`、所选档位年利率 `R` 表示：

```text
interestBearingBalance = max(B - F, 0)
navRateMultiplier = min(N / T, 1)
navAdjustedAnnualRate = R × navRateMultiplier
estimatedAnnualInterest = interestBearingBalance × navAdjustedAnnualRate
estimatedMonthlyInterest = estimatedAnnualInterest / 12
blendedAnnualRate = estimatedAnnualInterest / B
```

- 股票与现金的一级总资产为“已定价股票市值之和 + 现金本金”。未取得价格的股票不按 `0` 计入；尚未入账的估算利息不计入现金余额、总资产、浮动盈亏或收益率分子。
- 现金使用独立 `CashRepository`。IndexedDB schema 从 v2 升级为 v3 时只新增 `cash_accounts_v3`，不删除、重建或改写 `position_batches_v2`、股票草稿、行情缓存或 legacy backup。
- 现金保存采用 current/previous 与 revision 冲突保护；删除需要二次确认，只删除现金记录，不影响任何股票记录。
- JSON 备份升级为 v2，在 `snapshots[]` 之外增加当前 `cash`；导出仍为只读、本地生成和无上传。空组合恢复由 ADR-031 单独约束，必须重验 `CASH_BALANCE_FALLBACK` 等式。人民币模式只从 USD 现金真值派生展示值，不建立第二套现金本金。
- “全部资产”复制包含现金事实与利息估算；前 5/前 10 和单只股票范围仍按股票未舍入市值排序，单只股票权重的分母包含现金本金。
- 利率 contract 固定携带官方来源链接和核验日期。页面必须使用“估算”，不得把公布利率称为实时、固定或保证收益；利率变化需要重新核验并更新 contract 与测试。

## Consequences

### Positive

- 首页可以用一个总值回答当前已计价股票与 IBKR 现金合计资产，同时保留股票与现金各自的计算语义。
- v2 到 v3 是追加式升级，已有手机股票快照无需迁移或重写，降低本地唯一副本受损风险。
- Pro/Lite、免息额和 NAV 调整被显式建模，避免把最高档利率直接乘以全部现金而高估收益。

### Negative

- App 不连接 IBKR，用户输入余额、计划与 NAV 可能滞后或有误；估算不能替代 IBKR 实际对账单。
- 利率是核验日快照，不会自动从官网同步；IBKR 调整利率后，在代码更新前估算会使用旧档位。
- 当前只有一条 IBKR USD 现金，不支持其他币种、其他券商、多 IBKR 账户或现金流水。

## Constraints

- 真实现金余额、NAV、账户登录、对账单、凭据和导出的真实 JSON 不得进入仓库、测试、日志、截图或构建产物。
- 现金读写失败不得清空、隐藏或阻断可读的股票持仓；股票读写也不得改写现金。
- 任何自动读取 IBKR 账户、其他现金 provider、多账户、实际入账利息或历史现金流水都需要新的产品决定和安全评审。
- 生产发布继续服从 ADR-014；本 ADR 不授权提交、推送、部署、创建 IBKR 连接或导入真实资产。

## Verification

发布前必须证明：

- 现金领域覆盖低于/等于/高于免息额、Pro/Lite、NAV 低于/等于/高于门槛和高精度金额；
- schema v2 的已有股票数据升级到 v3 后逐字段不变，新增、修改或删除现金都不影响股票、草稿或行情缓存；
- 现金单独存在时不请求股票行情，股票与现金共同存在时总资产、CNY、JSON v2 和复制文本口径一致；
- 现金表单保存失败保留输入，删除需要二次确认，revision 冲突不覆盖更新后的记录；
- 真实 iPhone 上从已有生产股票数据升级、录入现金、刷新、修改、备份、复制和删除后，原股票数据保持不变。

`[实现事实 2026-08-02]` 本地 TypeScript、35 个测试文件中的 298 项测试、领域构建和 Next.js 生产构建通过。自动化已覆盖利息公式、独立现金 revision、表单保存/二次删除、现金单独与股票合并视图、CNY、JSON v2、全部资产复制，以及 v2→v3 后股票 current、草稿与 legacy backup 保持不变。生产发布与真实 iPhone 升级仍未验证。

## References

- Interactive Brokers 官方现金利率：<https://www.interactivebrokers.com/en/accounts/fees/pricing-interest-rates.php>
- `ADR-010-UNIFIED-PORTFOLIO.md`
- `ADR-012-INDEXEDDB-LOCAL-P0.md`
- `ADR-018-MANUAL-CURRENT-POSITION-JSON-EXPORT.md`
- `ADR-021-LOCAL-PORTFOLIO-TEXT-COPY.md`
- `../02-DOMAIN-AND-CALCULATIONS.md`
- `../05-ACCEPTANCE-CRITERIA.md`
