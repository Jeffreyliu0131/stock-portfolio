---
artifact: adr
version: "1.0"
created: 2026-08-13
status: accepted
---

# ADR-039：使用证据约束的 DeepSeek 解读当前组合

## Status

Accepted

**Date:** 2026-08-13

**Decider:** 产品所有者

## Context

现有“组合分析”已经用确定性公式给出结构、Top 1/3/5、现金权重、今日净额、绝对贡献和数据覆盖。它能准确展示事实，但不会主动筛选当前最值得注意的结构、解释结论受哪些缺口限制，也不会提出帮助用户澄清持有意图的问题。

产品所有者确认在 App 内接入 DeepSeek API，并要求把 P0 AI 能力直接做进组合分析。该能力仍不能把语言模型变成计算真源、行情源、新闻解释器或投顾；资产数据的隐私边界、API 费用和公开服务滥用也必须有明确约束。

`[外部事实 2026-08-13]` DeepSeek 官方 API 提供 `deepseek-v4-flash`，Chat Completions 支持关闭思考模式及 JSON Object 输出。JSON 模式仍可能返回空内容，因此客户端不能把“请求成功”直接视为可信结果。

## Decision

- “更多操作”的“组合分析”保留原确定性结构与今日贡献，并在同一详情层顶部增加可选的“AI 解读当前组合”。只有用户阅读发送/不发送边界并点按“同意并生成 AI 解读”后才发起请求；打开详情本身不调用 AI。
- P0 输出固定为四类：当前组合结构观察、今日绝对贡献驱动、数据完整性与缺口、两个中立决策澄清问题。今日驱动只解释哪些标的贡献了已计算变化，不解释股票为什么涨跌。
- 浏览器从与确定性详情相同的内存 `PortfolioInsights` 生成最小事实包。发送字段只包括股票代码、仓位和集中度十进制比例、今日贡献方向和绝对贡献比例、定价/今日覆盖数量与完整性状态、schema/生成时间；明确排除股数、成本、价格、市值、今日金额、现金金额、NAV、公司名称、姓名、账户号、IndexedDB revision 与复制文本。
- 精确金额只存在于浏览器本机的证据映射。模型正文不得出现数字、百分号或货币金额；界面根据模型返回的 `evidenceRefs` 重新渲染本机证据标签，因此展示数字仍来自确定性计算和当前 USD/CNY 模式。
- 服务端固定调用官方 `https://api.deepseek.com/chat/completions`，模型为 `deepseek-v4-flash`，使用关闭思考模式的 JSON Object 输出。请求拒绝重定向，15 秒超时，API key 只从服务端 `DEEPSEEK_API_KEY` 读取；`PORTFOLIO_AI_ENABLED=false` 可立即停止上游调用。
- 同源路由使用精确字段白名单、64 KiB 请求上限、最多 220 条证据、`no-store`、安全错误和每实例每调用方每分钟 6 次的尽力限流。64 KiB 可容纳 100 只持仓在 80 位十进制精度下的最小事实包。公开无登录部署无法仅靠应用层限流形成绝对费用上限，DeepSeek 账户余额或提供方预算控制仍是生产硬边界。
- 上游输出必须严格包含一个 headline、三个类别不重复的 observations 和两个 questions。每项观察只能引用同类别的已发送证据；未知/重复/跨类别证据、额外字段、数字、外部新闻/财报/宏观归因、预测、风险评级、买卖或调仓措辞均整份拒绝。
- AI 响应只保存在当前 React 弹层内存，关闭详情或组合事实变化后清除；不写 IndexedDB、`localStorage`、行情/汇率缓存、日志、分析事件、导出或复制资料。调用失败、超时、限流、未配置或输出不合格时，原确定性组合分析继续可用且持仓零改动。
- 首次调用界面链接 DeepSeek 隐私政策，并明确派生事实会经本站 Vercel 服务端交给 DeepSeek。用户没有点击时，组合资料不会进入该数据边界。

## Consequences

### Positive

- 语言模型负责排序、概括和提问，十进制计算、覆盖状态及所有显示数字仍由可测试代码负责。
- 发送面显著小于完整持仓快照；模型即使虚构数字或建议，也不会通过输出校验进入界面。
- AI 故障不会阻断现有组合分析、行情、录入或本地数据。

### Negative

- 股票代码、比例、方向和覆盖状态仍会进入 DeepSeek 外部处理边界；这不是完全本地功能。
- 严格拒绝策略会把部分可读但不合规的模型回答整体丢弃，偶尔需要重新生成。
- 无登录的公开 Vercel 路由只能做尽力限流；生产必须使用受控余额，并监控异常调用与费用。

### Neutral

- ADR-032 的结构和绝对贡献公式不变；AI 不新增行情、不修改分母或完整性规则。
- ADR-038 的普通复制与 ChatGPT 交付继续独立存在；DeepSeek 内嵌解读不读取或复用完整复制文本。

## Alternatives Considered

### 把完整持仓文本直接发给模型

上下文更丰富，但会发送数量、成本、价格、市值、现金和 NAV，扩大隐私边界，也更容易让模型重新计算并产生与本机真值冲突的数字，因此拒绝。

### 让模型直接输出金额、比例和交易动作

视觉上更像完整报告，但数字无法保证与十进制真值、缺失口径和当前币种一致，交易动作也超出产品范围，因此拒绝。

### 只保留复制到外部 AI

隐私与费用边界更简单，但不能在当前组合分析里形成证据绑定、故障降级和一致展示，不能满足本次确认的内嵌体验。

## Verification

- contract 测试覆盖精确字段、比例/覆盖边界、证据身份和集合一致性，以及金额/未知字段拒绝。
- provider 测试覆盖固定官方端点、V4 Flash、关闭思考、JSON Object、拒绝重定向、超时、限流、空/截断/非法输出和安全错误。
- 组件测试覆盖无自动调用、明确同意、发送/不发送披露、加载/成功/失败、证据本机重绘、重新生成、焦点陷阱和确定性分析保留。
- 构建产物与提交内容扫描不得包含 `DEEPSEEK_API_KEY` 值。生产 smoke 只用合成事实，验证未配置、成功、限流/故障和 `no-store`；不得把真实请求体或完整模型响应写入证据。
- 真实 iPhone Safari 与主屏幕 PWA 验证 320–430 CSS px、200% 文字、VoiceOver、减少动效、关闭/重开清除结果和 USD/CNY 本机证据显示。

## Amends

本 ADR 修订 ADR-032 中“本需求不新增分析服务”的范围判断，并关闭 OQ-015 中“服务端 AI 分析仍需重新确认”的分支。ADR-032 的确定性数学和 ADR-038 的两个复制目标继续有效。

## References

- DeepSeek JSON Output：<https://api-docs.deepseek.com/guides/json_mode/>
- DeepSeek Thinking Mode：<https://api-docs.deepseek.com/guides/thinking_mode/>
- DeepSeek Chat Completions：<https://api-docs.deepseek.com/api/create-chat-completion/>
- DeepSeek 更新记录：<https://api-docs.deepseek.com/updates/>
- DeepSeek 隐私政策：<https://cdn.deepseek.com/policies/zh-CN/deepseek-privacy-policy.html>
- `ADR-032-PORTFOLIO-STRUCTURE-AND-ABSOLUTE-DAILY-CONTRIBUTION.md`
- `ADR-038-PORTFOLIO-COPY-DESTINATIONS.md`
- `../01-PRD.md`
- `../04-TECHNICAL-SPEC.md`
