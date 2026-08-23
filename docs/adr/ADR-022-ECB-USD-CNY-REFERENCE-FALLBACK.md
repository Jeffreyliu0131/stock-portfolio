---
artifact: adr
version: "1.0"
created: 2026-08-02
status: accepted
---

# ADR-022：USD/CNY 使用 Alpaca 优先与 ECB 日参考价降级

## Status

Accepted

**Date:** 2026-08-02

**Decider:** 产品所有者

## Context

人民币模式原先只调用需要服务端凭据的 Alpaca `USDCNY` 端点。本地或预览环境没有 Alpaca 凭据时，路由直接返回 503，导致人民币按钮持续禁用。产品所有者要求修复该状态；此前已经确认股票 API 能提供时优先复用，不能提供时可使用近期参考汇率形成大致人民币感觉。

`[外部事实 2026-08-02]` 欧洲央行 Data API 支持按 `EXR/D.USD+CNY.EUR.SP00.A` 一次取得同一参考日的 USD/EUR 与 CNY/EUR 每日参考价，支持 `lastNObservations=1`、`format=csvdata` 与 `detail=dataonly`。两条序列都是每 1 EUR 对应的货币单位，因此 USD/CNY 日参考交叉汇率为：

```text
usdCnyReferenceRate = cnyPerEur / usdPerEur
```

## Decision

- `/api/fx/usd-cny` 在 Alpaca 两项服务端凭据齐全时，先请求 Alpaca `USDCNY` midpoint；成功结果继续使用 `provider=alpaca`、`rateType=MIDPOINT`。
- Alpaca 凭据缺失、被拒绝、限流、超时、服务故障或响应无效时，服务端自动请求欧洲央行官方 Data API；该请求不需要 API key。
- ECB 的 USD/EUR 与 CNY/EUR 必须来自同一 `referenceDate`，数值先作为十进制字符串解析，再用任意精度十进制除法得到 USD/CNY，并在汇率 contract 边界规范为最多 8 位小数。
- ECB 结果使用 `provider=ecb`、`rateType=REFERENCE`，保留 `referenceDate`、官方 HTTP `Last-Modified` 作为 `sourceEventAt`，并记录 `fetchedAt`。
- 页面必须把 ECB 结果写为“欧洲央行日参考汇率”，同时显示参考日和官方更新时间；不得称为实时汇率或中间价。
- 两个在线来源均失败时，才使用 7 天内上一有效汇率；若缓存也不可用，人民币按钮保持禁用并继续显示 USD。任何路径都不得回退为 `0`。
- 该降级链路不新增密钥、账号、数据库、持仓上传或 IndexedDB 写入，也不改变 USD 真值、排序、收益率、备份或复制资料。

## Consequences

- 没有 Alpaca 凭据的本地和预览环境也能在 ECB 服务可用时启用人民币模式。
- Alpaca 可用时仍提供更接近当前的中间价；ECB 是每日参考值，周末和节假日会沿用最近参考日，页面必须保留日期差异。
- 汇率路由增加第二个外部依赖；只有两个来源和合格缓存同时不可用时，用户才看到 USD 降级提示。
- ECB CSV schema、同日要求、HTTP 错误、超时、缺失时间、精确交叉计算和客户端 provider/rate type 配对需要自动化测试。

## References

- ECB Data API：<https://data.ecb.europa.eu/help/api/data>
- ECB Data API 示例：<https://data.ecb.europa.eu/help/api/data-examples>
- `ADR-008-USD-CNY-DERIVED-DISPLAY.md`
- `../02-DOMAIN-AND-CALCULATIONS.md`
