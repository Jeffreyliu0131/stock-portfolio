---
artifact: adr
version: "2.0"
created: 2026-07-29
updated: 2026-08-02
status: accepted
---

# ADR-008：USD 真值与 CNY 派生显示

## Status

Accepted

**Date:** 2026-08-02

**Decider:** 产品所有者

## Context

美股数量、成本、行情和估值以 USD 表达。产品所有者需要在首页通过一个模式按钮切换为人民币，快速查看当前持仓按近期汇率折算后的大致金额；汇率不要求逐秒实时，现有股票数据服务能提供时优先复用。

`[外部事实 2026-08-02]` Alpaca 官方最新外汇汇率接口支持按 `currency_pairs=USDCNY` 请求汇率，结果包含 bid、midpoint、ask 和事件时间。现有服务端 Alpaca 凭据因此可以同时用于本功能，无需新增客户端密钥或第三方 provider。

## Decision

- USD 继续作为账本、成本、行情和估值真值；
- 首页账户身份区提供 USD / 人民币分段切换，默认显示 USD；
- 人民币模式使用同一笔有效汇率折算总市值、总剩余成本、浮动盈亏、单只市值、估值价、均价、单只浮动盈亏和底部组合摘要；股数与收益率不变；
- CNY 只作当前汇率下的估算显示，不建立第二套成本，不计算汇兑盈亏；录入编辑和复制资料继续使用 USD；
- CNY 金额从未舍入 USD 金额派生：

```text
cnyDisplayAmount =
  unroundedUsdAmount × usdCnyRate
```

- 汇率固定为 Alpaca `USDCNY` 的 midpoint `mp`，必须带方向、provider、rate type、来源时间和抓取时间；
- 浏览器前台最多每 15 分钟主动刷新一次；最后有效汇率可在本机缓存并在 7 天内降级使用，界面必须保留并显示其真实来源时间；
- 汇率从未取得、已超过 7 天或结构无效时继续显示 USD，并禁用人民币模式；股票行情、录入和本地持仓不受影响；
- 禁止以 `0` 代替缺失汇率；
- CNY 舍入结果不得写回 USD 真值；
- 服务端复用现有 Alpaca 环境变量并代理汇率请求；任何凭据不得进入浏览器、仓库、日志或错误响应。

## Consequences

- 增加一个独立汇率 adapter、同源 API、浏览器上一有效汇率缓存和故障状态；不改变 IndexedDB 持仓 schema。
- 每个活跃客户端最多约每 15 分钟增加一次 Alpaca 汇率请求；实际可用性和限额仍受 Alpaca 账户与服务状态影响。
- 7 天内的缓存允许近似查看人民币价值，但可能与当下可成交汇率有差异；界面通过“估算”、来源时间和缓存状态表达这一点。
- 统一持仓的数量、USD 成本、股票行情选择、收益率和复制资料计算都不改变。
- 生产发布后仍需使用真实服务器凭据完成一次汇率 API smoke，证明具体 Alpaca 账户对该端点有访问权限。

## References

- `../08-OPEN-QUESTIONS.md`
- `../02-DOMAIN-AND-CALCULATIONS.md`
- Alpaca Latest Rates：<https://docs.alpaca.markets/us/reference/latestrates-1>
- Alpaca 官方 Postman 示例：<https://www.postman.com/alpacamarkets/alpaca-public-workspace/request/ilnr3x3/latest-rates-for-currency-pairs>

## Amended by

ADR-022 保留本 ADR 的 USD 真值、CNY 派生、缓存和安全边界，但把“固定使用 Alpaca”修订为“Alpaca 优先、欧洲央行日参考交叉汇率降级”。
