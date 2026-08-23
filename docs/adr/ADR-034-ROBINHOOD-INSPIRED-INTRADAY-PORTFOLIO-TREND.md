---
artifact: adr
version: "1.0"
created: 2026-08-09
status: accepted
---

# ADR-034：Robinhood 式高级首页与真实当日持仓估算线

## Status

Accepted

**Date:** 2026-08-09

**Decider:** 产品所有者

## Context

产品所有者确认首页可进行较大视觉升级，参考 Robinhood 高级资产页的黑色连续英雄区、总资产大数字和收益曲线层级，同时保留本产品已确认的总资产、2 × 2 指标、五列持仓表、红涨绿跌、USD / 人民币和底部单一录入入口。

本决定作出时只保存当前持仓快照，没有逐笔交易、历史持仓或资金流。因此当时只能用当前数量与真实日内价格点估算当日价格影响。长期历史能力后来由 ADR-035 在独立历史库中补齐。

## Decision

- 首页使用连续纯黑英雄区，总资产为唯一一级数字，下方依次是当日价格影响、真实当日估算线、“今日”范围标记和 2 × 2 核心指标。该层级参考 Robinhood，不复制其品牌、文案、托管或自动投资语义。
- 当日线的市场输入来自 Alpaca Historical Stock Bars：`feed=sip`、`timeframe=15Min`、`adjustment=split`、`currency=USD`。服务端查询结束时间不得晚于服务端当前时间减 15 分钟，并在合约中保留延迟策略、可用截止时间、feed、周期和复权方式。
- 新路由 `POST /api/intraday-bars` 只接受受支持的 `instruments` 和可选 `asOf`。股数、成本、现金、持仓权重和组合计算不得进入请求或 Alpaca；它们继续只在浏览器本机组合领域中派生。
- 对每个已取得的日内时点 `t`，使用当前未舍入股数 `Q_i`、该点或该点之前最后有效 15 分钟收盘价 `P_i(t)` 和最近常规收盘价 `C_i` 计算：

```text
estimatedDailyPriceEffect(t) = Σ[Q_i × (P_i(t) - C_i)]
estimatedDailyChangeRate(t) =
  estimatedDailyPriceEffect(t) / Σ(Q_i × C_i)
estimatedAsset(t) = cashBalance + Σ[Q_i × P_i(t)]
```

- 现金本金进入每个点的 `estimatedAsset`，但不进入今日价格影响或涨跌幅分子/分母。这与现有“今日盈亏”领域口径一致。
- USD 继续是计算真值。人民币模式只将各点未舍入 USD 金额乘以同一笔有效 USD/CNY 汇率后展示；百分比不变，不建立人民币历史真值。
- 任一持仓缺少最近常规收盘价，缺少/失败的标的 series，或不足以绘制可读连续线的时点时，显示明确的暂无走势状态，不用零、成本、直线、随机数或插值伪造曲线。纯现金组合同样不绘制股票走势。
- 本 ADR 的算法范围只负责“今日走势”。ADR-037 已将它确认为首页唯一趋势；页面不再提供长期周期或历史入口。
- `overnight` 现价若未实际接入当日线，不得从 SIP 曲线插值到当前价。以后接入时，只能把具有真实时间和完整标的覆盖的当前指示价表达为独立点，不与 SIP 历史连线。
- 趋势是可替换的只读派生结果，不持久化到 IndexedDB，不修改当前持仓、现金、行情缓存、汇率缓存、备份、恢复或复制真值。

## Consequences

### Positive

- 首屏更快回答“总资产多少、今天变化如何、变化过程是什么”，与持仓表保持同一数据语义。
- 市场数据与私密持仓数据在服务端边界隔离；Alpaca 只看到标的请求。
- 只显示真实可支撑的当日线，避免把当前快照伪装为长期账户回报。

### Trade-offs

- 当日发生加仓、减仓或手工修改时，整条线都使用当前数量，因此是价格影响估算，不是券商基于成交和现金流的真实当日业绩。
- Historical SIP 条形与当前 `delayed_sip` / `overnight` 快照的可用时段不完全相同；因此当前只能诚实展示可获取的 SIP 日内段，夜盘点不可伪连线。
- 无前收、低流动性、非交易窗口或请求失败时可能只显示暂无走势，但不影响已保存持仓和现有估值。

## Amends

- 修订 ADR-020 与 ADR-030 的首页视觉层级：深色总资产区扩展为连续纯黑英雄区，已确认的信息字段、五列表和操作语义不变。
- 扩展 ADR-024 与 ADR-027：从单个当前时点扩展为同一口径的当日时间序列，现金排除、完整性、CNY 派生和“估算”语义继续有效。
- ADR-003 与 ADR-016 的当前估值 feed 选择不变；本 ADR 只新增独立的当日 Historical Bars 读取边界。
- `[2026-08-11]` 长期范围限制由 ADR-035 修订；本 ADR 的 `1D` 计算、缺值和隐私边界继续有效。
- `[2026-08-12]` ADR-037 取代长期范围运行路径；本 ADR 的今日计算、缺值和隐私边界成为首页唯一趋势口径。

## Verification

- 自动化覆盖服务端请求白名单、15 分钟 cutoff、`feed=sip`、`15Min`、`split`、分页、错误映射和浏览器响应校验。
- 领域测试覆盖多标的错位时间点、当前数量、现金加入资产但排除今日涨跌幅、缺前收、缺 series、纯现金和隔夜独立点。
- 组件验证覆盖加载、可用、缺失、现金专属状态、币种派生、指针探查、键盘操作、减少动效和首页层级。
- 在 320、390 和 430 CSS px 检查总资产、曲线、2 × 2 指标、持仓表和底部按钮；在目标 iPhone Safari 与主屏幕模式重复用真实延迟行情验证。

`[实现事实 2026-08-09]` 本地工作区已增加趋势领域派生、Historical Bars 服务端 adapter/API/浏览器 client、首页趋势图与 Robinhood-inspired 视觉层级；趋势未写入 IndexedDB，路由不接收股数或现金。完整 `npm run check` 通过 47 个测试文件、416 项测试、TypeScript、领域构建和 Next.js 生产构建；320/390/430 px 无页面级横向溢出，390 同视口参考并排视觉 QA Passed，键盘和焦点主路已验证，控制台无 error/warning。尚未发布，200% 文字、真实 iPhone 与真实市场时段尚未验收。

## References

- Alpaca Historical Stock Bars：<https://docs.alpaca.markets/us/v1.4.2/reference/stockbars>
- Alpaca Market Data FAQ：<https://docs.alpaca.markets/us/docs/market-data-faq>
- Robinhood 图表使用说明：<https://robinhood.com/us/en/support/articles/using-the-charts/>
- `ADR-020-FUTU-STYLE-PORTFOLIO-HOME.md`
- `ADR-024-ESTIMATED-DAILY-PRICE-EFFECT.md`
- `ADR-027-PORTFOLIO-DAILY-PNL-TILE.md`
- `ADR-030-FIRST-PRINCIPLES-PORTFOLIO-HOME.md`
- `../02-DOMAIN-AND-CALCULATIONS.md`
- `../03-UX-SPEC.md`
- `../04-TECHNICAL-SPEC.md`
