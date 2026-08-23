---
artifact: adr
version: "1.0"
created: 2026-08-15
status: accepted
---

# ADR-042：组合分析与 AI 对话使用两个独立入口和会话

## Status

Accepted

Amended by ADR-044：两入口、触发和会话生命周期不变；完整快照的现金 contract 升级为双券商 schema/prompt v3。

**Date:** 2026-08-15

**Decider:** 产品所有者

## Context

ADR-041 把初始组合体检、发送边界说明、同意动作和后续对话放在同一个详情层。当前 Production 的实际表现暴露了两个问题：对话必须等完整逐只分类和六维体检成功后才出现，任何初始输出不合规或 provider 超时都会同时阻断对话；首页入口和弹层包含大量说明、示例、建议问题与重启动作，产品噪音过高。

产品所有者明确要求把“组合分析”和“AI 对话”拆成两个入口、两个弹层。对话应像独立 AI 一样打开即可输入并持续交流；打开对话不能自动发送，只有用户点按“发送”才调用。运行界面不再展示“会发送/不会发送”、隐私政策、同意按钮、示例问题、建议问题、字数计数、固定快照说明或“重新开始/重新体检”等前置说明。

数据边界、安全校验、服务端密钥和 current-only 原则没有被放宽。此次修订改变触发方式、界面结构和会话依赖关系。

## Decision

- 首页在总览与持仓表之间显示两个并列、低噪音入口：“组合分析”和“AI 对话”。两者不放入“更多操作”，也不合并成一张说明卡。
- “组合分析”打开独立详情层。用户点按该入口就是本次体检的明确触发动作；详情挂载后直接请求初始体检，同时始终保留下方确定性结构与今日贡献。AI 失败只显示紧凑错误和“重试”，不显示持仓未修改、发送边界、对话框或重启动作。
- “AI 对话”打开独立对话层。打开、聚焦输入框、输入或修改草稿都不产生网络请求；只有点按“发送”或在非输入法组字状态按 Enter 才提交。Shift+Enter 保留换行。
- 对话首次发送时从当时的 `PortfolioCopySource` 与 `PortfolioInsights` 生成完整 current-only USD 快照，并固定为该对话层生命周期内的上下文。后续轮次继续使用同一快照，只附最近六轮已成功完成的 user/assistant 历史与新问题。关闭弹层或刷新页面后清除；重新打开后由下一次发送建立新快照。
- 对话不依赖初始组合体检、逐只行业分类或组合分析弹层成功。schema v2 增加 `CHAT` 模式：`priorClassifications=null`，`classifications=[]`，`brief=null`，`answer` 必须存在且 `suggestedQuestions=[]`。CHAT 只允许引用基础 `portfolio.*` 与当前 `position.*` evidence，不接受行业/角色引用。
- 组合体检继续使用 `INITIAL_ANALYSIS` 和逐只 `AI_INFERRED` 分类；行业/角色权重仍由本机未舍入 Decimal 真值汇总。旧 `FOLLOW_UP` contract 暂时保留兼容，但当前 UI 不再从组合分析发起该模式。
- provider 首次温度统一为零。固定使用 DeepSeek Beta strict function calling 和强制命名函数；INITIAL_ANALYSIS 的参数 schema 动态列出全部持仓 key 与六个维度，模型不承载 positionId/symbol/basis，服务端按请求重新附着身份和顺序。体检 `questions` 固定为空；CHAT 只填写回答和基础 evidence，兼容 FOLLOW_UP 的既有分类由服务端原样保留。CHAT 使用较小的输出上限和独立十八秒总超时；初始体检保留二十五秒总超时。首个候选不合规时不把原始候选回送模型，仍最多完整重做一次，并使用模式专属修复约束。
- 运行界面删除发送/不发送说明、DeepSeek 品牌与隐私链接、示例占位、建议问题、字数计数、同意按钮、固定快照说明、模型元信息和重新体检入口。必要的数据边界继续保存在产品与技术真源中，不在主操作路径重复展示。
- AI 调用仍可包含 ADR-041 已确认的 current-only USD 持仓、现金/NAV、估值、盈亏、行情元数据与有限对话；仍不得包含身份、账号、设备、存储内部、历史库、草稿、备份或剪贴板。请求体、原始响应与会话不得进入持久存储、日志、分析事件或错误回报。
- 模型正文继续禁止数字、伪造外部归因、高级风险指标、目标价、收益保证、预测和直接交易指令；可见数字继续由本机 evidence 真值渲染。持仓、现金、行情、汇率和 IndexedDB 零写入。

## Consequences

### Positive

- 对话不再被高成本的逐只分类和六维体检门控，首次问题使用更小的响应 contract，减少等待和随机不合规失败。
- 用户可以清楚区分“看一份组合体检”和“直接问 AI”，两个弹层各自只有一个主要任务。
- 打开对话保持零请求；会话上下文与固定快照语义仍可审计且不持久化。

### Negative

- 主界面不再逐次展示第三方发送边界，用户需要依赖产品既有认知与持久文档了解完整数据范围。
- 组合分析入口会在打开后立即触发 AI 体检；用户若只想看确定性结构，也会产生一次可选 AI 调用。
- CHAT 不生成行业分类，因此独立对话不能引用 `sector.*` 或 `role.*` 的本机聚合证据；行业/角色详表仍属于组合分析。

### Neutral

- schema 和 prompt 版本保持 v2，以避免已缓存 PWA 客户端与同一生产路由之间产生不必要的版本断层；新增模式由新客户端使用。
- ADR-041 的完整 current-only 数据边界、安全输出规则、行业推断、本机数字、无持久化和失败不改资产继续有效。

## Verification

- 组件测试验证主页存在两个入口，分别打开名为“组合分析”和“AI 对话”的独立 dialog，任一时刻不会把对话嵌入组合分析。
- 对话测试验证打开零请求、无披露/示例/建议/重启文案、首次发送完整上下文、后续发送固定快照与最近历史、失败保留草稿、Escape/焦点管理和关闭清除。
- contract/provider 测试验证 CHAT 的空分类、空建议、基础 evidence 白名单、较小 token 上限、零温度、真实多轮 messages、模式专属修复与非法输出拒绝。
- 组合分析测试验证挂载即请求、完整上下文、行业/角色本机汇总、CNY evidence、紧凑失败重试和后台 props 刷新不替换已开始快照。
- `[实现事实 2026-08-15，Production]` ADR-042 UI 提交 `c5c7040` 与 strict function calling 修复 `3b29842` 已推送 `main` 并进入稳定 Production。首页静态 bundle 包含两个 dialog 且无旧同意/披露文案；修复后的完整 `npm run check` 通过 65 个测试文件、525 项测试和两项构建。两轮独立的十只合成 Production smoke 均完成初始体检、聊天首轮和带上下文第二轮：初始体检分别约 12.2 秒与 11.1 秒，均返回十条分类和六个维度；聊天首轮约 5.3 秒与 5.0 秒，后续约 5.0 秒与 3.8 秒；共六次请求全部返回 200、`no-store`，未保存模型正文或请求体。真实 iPhone仍待验证。

## Amends

本 ADR 修订 ADR-041 中“完整披露后同意”“初始体检与多轮对话位于同一弹层”“对话依赖锁定分类”“重新体检开始新会话”的产品与 UI 决定。ADR-041 的完整数据边界、分类/证据安全、服务端密钥、`no-store`、限流、无持久化和资产零修改原则继续有效。

## References

- `ADR-041-FULL-CONTEXT-DEEPSEEK-PORTFOLIO-CONSULTATION.md`
- `../01-PRD.md`
- `../03-UX-SPEC.md`
- `../04-TECHNICAL-SPEC.md`
- `../06-TEST-STRATEGY.md`
- DeepSeek Tool Calls / Strict Mode：<https://api-docs.deepseek.com/guides/tool_calls>
- DeepSeek JSON Output：<https://api-docs.deepseek.com/guides/json_mode>
