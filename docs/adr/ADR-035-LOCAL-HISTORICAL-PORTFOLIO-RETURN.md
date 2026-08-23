---
artifact: adr
version: "1.0"
created: 2026-08-11
status: superseded
---

# ADR-035：本机历史账本与现金流调整组合收益

## Status

Superseded by ADR-037

**Date:** 2026-08-11

**Decider:** 产品所有者

**Superseded:** 2026-08-12。历史解析与独立数据安全边界可保留，但首页、`/history`、Controller 查询和自动 NAV 写入已经退出运行路径。

## Context

产品所有者要求首页提供与 Robinhood 使用方式一致的整个组合收益走势，并确认以后愿意在 PWA 记录每笔买入、卖出、入金和出金。现有 current-only 股票/现金库无法证明长期账户收益；IBKR 与 moomoo 的历史又分散在交易确认、Activity/Monthly Statement 和多个月结单中，且包含多币种、期权、费用、税费、股息与外部现金流。

Robinhood 官方说明其图表排除外部入出金的直接影响，并受 Modified Dietz 方法影响。因此长期线必须由真实 NAV 锚点与已分类的外部现金流计算，不能把当前股数回套历史价格，也不能把入金误报为收益。

## Decision

- 首页提供 `1D / 1W / 1M / 3M / 1Y / ALL`。`1D` 继续使用 ADR-034 的真实 SIP 15 分钟当前持仓估算；其余范围只读取本机历史库的真实 NAV 锚点和外部现金流。
- 新建独立 IndexedDB `stock-portfolio-calculator-history`。它不升级、不覆盖也不清空 current-only `stock-portfolio-calculator-ledger` v3；历史导入不会修改首页当前股票或现金。
- 浏览器本机读取直接粘贴文字、IBKR CSV/文本层 PDF 与 moomoo 文本层月结单。用户已提供且可安全规范化的月度 NAV 可以通过一次性本机预览链接交付，不要求用户重新复制或制作文件。原始文件、原始文本、姓名和完整账户号不持久化或发送到服务端；只保存 SHA-256 资料指纹、不可逆来源范围指纹、规范化事件、NAV 锚点、导入诊断和构建结果。
- 一次性链接只把最小化月结单文字放入 URL fragment；浏览器进入 `/history` 后立即从地址栏清除并复用普通文本解析器。载荷不得进入 Vercel 请求、日志或持久化，且仍须经过预览、阻断检查和用户确认，不能自动写入。
- 导入分为“本机解析 → 严格预览 → 用户确认 → 单事务写入”。相同文件指纹是无写入的重复导入；来源、事件身份或区间冲突会阻止整批写入。扫描件、缺页、无法识别的版式、未知现金分类和不平衡区间不得猜测。
- 规范化历史事件至少区分 `NAV_SNAPSHOT`、`EXTERNAL_FLOW`、`TRADE` 与 `POSITION_SNAPSHOT`。股票与期权分别建模；订单汇总行、交易所拆分行和控制合计不得重复生成交易。
- 外部入金为正现金流，外部出金为负现金流。买卖结算、换汇、内部转账、股息、利息、税费、佣金、融资利息和期权结算属于组合内部表现或资产转换，不从收益中剔除；无法确定的现金项目阻止相关区间成为完整收益。
- 每个相邻 NAV 区间使用 Modified Dietz：

```text
R = (EV - BV - ΣCF_i) / (BV + Σ(w_i × CF_i))
w_i = 区间内该现金流发生后剩余时间 / 区间总时间
```

  区间收益按 `Π(1 + R) - 1` 链接；收益金额使用范围起点 NAV 乘以链式收益率表达。所有金额和比例使用十进制真值，展示层才转换为图表坐标。
- 完整收益只绘制同一组合口径、来源覆盖完整且至少两个 NAV 点的区间。同一已知部分来源集合可以形成明确标记的 `PARTIAL` 线段；来源集合改变、来源未知或部分账户接到完整组合时断线。无足够 NAV、未知外部现金流或分母不合法时显示 `UNAVAILABLE`，不补零、不插值、不用持仓成本代替 NAV。
- PWA 提供未来 `BUY / SELL / DEPOSIT / WITHDRAWAL` 记录入口，并只在本次行情刷新成功且当前组合全部股票完成定价时写入本机组合 NAV 观察点；行情失败时展示的上一有效价不冒充当天 NAV。交易用于审计和后续重建，只有入金/出金进入 Modified Dietz 现金流；该入口不自动改写 current-only 持仓，现有录入/修改路径仍是当前持仓真值。
- 历史期权通过券商 NAV 锚点进入整体收益；若以后用 Alpaca 历史期权行情补充估值，必须单独标明 indicative/OPRA feed 与覆盖限制。缺少可靠期权估值时以真实券商 NAV 为准，不把期权当股票数量处理。
- USD 是历史收益真值。CNY 金额只按当前有效 USD/CNY 汇率派生显示并明确为当前汇率折算；历史收益率不变，不生成汇兑收益。

## Consequences

- 用户可通过一次性本机链接直接预览已整理资料，也可粘贴文字或一次选择多份月结单后在手机本地预览和导入，并逐步形成有来源边界的长期组合回报线。
- 只有交易确认而没有 NAV 的资料可以形成审计事件，但不能单独生成长期收益；月度 NAV 只能形成月度真实锚点，不能伪装为每日曲线。
- 导入另一来源后，只有各来源在同一日期覆盖完整的组合点才能合并；缺少一侧账户 NAV 时结果会显示部分或不可用。
- current-only JSON v2 的导出/恢复格式不变；历史备份与跨设备恢复仍是独立后续决定。

## Verification

- 领域测试覆盖无现金流、期中入/出金、多区间链式收益、零/负分母、精度和缺口断线。
- 存储测试覆盖独立数据库、原子写入、重复文件 no-op、冲突回滚，以及 current v3 零改动。
- 解析测试只使用合成脱敏样本，覆盖 IBKR sectioned CSV、执行/汇总去重、期权身份、moomoo 月结 NAV 连续性、多币种折算和未知版式阻断。
- 组件测试覆盖六档周期、加载/可用/部分/不可用、键盘与触摸探查、320/390/430 px 和文字放大。

## Amends

- 修订 ADR-011：current-only 持仓快照继续作为首页当前持仓真值；新增历史账本只服务长期收益、导入和未来事件记录，不取代 current v3。
- 扩展 ADR-012：新增完全独立的历史 IndexedDB，仍无登录、云同步或券商连接。
- 修订 ADR-034：其 `1D` 算法继续有效；“不提供长期范围”的限制在真实历史库可用后由本 ADR 取代。

## References

- Robinhood 图表使用说明：<https://robinhood.com/us/en/support/articles/using-the-charts/>
- Alpaca 历史期权数据：<https://docs.alpaca.markets/us/docs/historical-option-data>
- Alpaca Historical Option Bars：<https://docs.alpaca.markets/us/reference/optionbars>
- `ADR-011-CURRENT-POSITION-SNAPSHOT-BATCH.md`
- `ADR-012-INDEXEDDB-LOCAL-P0.md`
- `ADR-034-ROBINHOOD-INSPIRED-INTRADAY-PORTFOLIO-TREND.md`
- `../02-DOMAIN-AND-CALCULATIONS.md`
