---
artifact: adr
version: "1.0"
created: 2026-08-15
status: amended
---

# ADR-041：使用完整当前快照提供 DeepSeek 组合咨询与行业暴露分析

## Status

Amended by ADR-042

Further amended by ADR-044：current-only 现金上下文升级为 schema/prompt v3 的组合总现金、IBKR/moomoo settled/pending 分项与可选 IBKR 利息；身份排除、安全输出和本机 Decimal 规则不变。

**Date:** 2026-08-15

**Decider:** 产品所有者

`[2026-08-15]` ADR-042 已修订本 ADR 的入口、可见披露、同意步骤、同弹层对话和重新体检决定；本 ADR 的完整 current-only 数据边界、行业分类、本机证据、安全输出、服务端密钥与无持久化原则继续有效。

## Context

ADR-039 只允许把股票代码、比例、方向和覆盖状态交给 DeepSeek，并把输出固定为一次性的三项观察。该方案降低了数据发送范围，但无法回答数量、成本、金额、浮盈亏和现金相关的追问，也无法形成多轮对话。真实组合中的高精度派生比例还可能超过旧 contract 对小数位数的固定上限，导致请求在调用 provider 前被拒绝。

产品所有者明确要求：在 PWA 内提供可持续追问的对话框，让模型拥有当前完整持仓上下文；现有组合分析同时增加行业、资产角色、集中度和类似机构组合体检的分析层。产品所有者已接受数量、成本、价格、市值、盈亏、现金金额和 NAV 进入 DeepSeek 数据边界。

机构分析框架覆盖的维度远多于当前数据。GICS 可用于统一行业语言；Barra 类风险模型还需要历史收益、基准、因子和协方差数据；Morningstar 风格分析需要基本面与市值数据。当前 App 只有 current-only 持仓、延迟行情、前收盘价和现金，因此必须区分“当前快照可支持的分析”与“缺少数据时不能声称已经计算的指标”。

`[外部事实 2026-08-15]` DeepSeek Chat Completions 是无状态接口，多轮调用需要调用方再次提交历史消息；官方上下文缓存会尽力复用相同前缀，但不是持久会话或可靠存储。

## Decision

- “组合分析”顶部升级为“AI 组合咨询”。打开详情本身不发送资料；用户阅读完整发送边界并点按“同意并开始组合咨询”后，先生成一次组合体检，之后可在同一弹层连续提问。
- AI 请求使用 current-only USD 快照。会发送：
  - 组合总资产、股票市值与成本、浮动盈亏与收益率、现金与 NAV、集中度、今日贡献和数据覆盖；
  - 每只持仓的代码、完整名称、上市市场、数量、均价、剩余成本、估值价、市值、浮动盈亏/收益率、仓位、排名、今日变化、行情状态与来源时间；
  - IBKR 现金方案、现金本金、NAV 来源和当前利息估算；
  - 当前弹层内最近的有限轮次对话和本次问题。
- 不发送姓名、邮箱、账号、设备标识、IndexedDB revision/savedAt、历史库、草稿、JSON 备份、剪贴板内容或其他页面数据。请求体和模型原始响应不得进入日志、分析事件或错误回报。
- 模型对每只股票生成 `AI_INFERRED` 分类：资产角色、GICS 对齐行业、主题标签、置信度和简短依据。该分类不是 MSCI 官方证券分类，也不是实时证券主数据；界面必须显示“AI 推断”。
- 行业与资产角色占比由浏览器把经过校验的分类映射回当前 `assetWeight` 后，使用 Decimal 未舍入真值确定性汇总。模型不得直接提供或重算行业占比；缺价持仓继续保持部分口径，不能用成本或零补入。
- 初始组合体检固定覆盖六个可审计维度：资产与现金配置、单一/头部集中度、行业与主题暴露、持仓工具与潜在重叠、累计/今日贡献、数据边界。叙述必须引用当前请求中可验证的 evidence ref，界面再用本机真值渲染金额和比例。
- 当前不具备历史波动率、Beta、相关性矩阵、正式因子暴露、估值、基本面、ETF 穿透持仓、基准归因或新闻归因的真源。模型必须把这些项目标为当前不可计算，不能用训练记忆伪装成实时或机构级结果。ETF 只能识别工具角色和可能的语义重叠，不能声称已完成底层持仓穿透。
- 对话属于组合决策支持，可解释结构、暴露、权衡、情景与需要补充的信息；继续禁止目标价、收益保证、行情预测和直接买卖/加减仓指令。用户询问交易动作时，回答应转为条件、约束和待验证问题。
- 模型正文不承载数字。金额、比例、覆盖数与排名通过已校验 evidence ref 由浏览器按当前 USD/CNY 展示模式重绘；这样保留灵活问答，同时避免模型生成与本机 Decimal 真值冲突的数值。
- DeepSeek API 无状态。浏览器只在当前 React 弹层保存已完成的有限对话，最多提交最近 6 轮。一次会话固定使用用户点按开始时的快照；父页自动行情刷新不会在会话中悄悄替换数字或快照前缀。用户点按“重新体检”时，才使用当时最新快照开始新会话；关闭弹层或页面刷新后清除。服务端每次重发稳定的系统说明和该会话固定快照，再附有限历史与新问题；相同前缀可利用 provider 的尽力缓存，但不能依赖缓存保存会话。
- 共用 contract 升级到 schema v2，使用语义十进制校验，不再用固定“小数点后最多 80 位”判断派生比例。单个十进制字符串、持仓数、对话轮次、请求/响应体仍有硬上限；任何额外字段、非法值、未知持仓/行业/角色引用、重复分类、截断 JSON、越界文本或危险输出整份拒绝。
- 首个模型候选未通过 JSON 或组合事实 contract 时，服务端允许在同一个 25 秒总超时内向同一 provider 发起最多一次完整重做；重做继续使用稳定快照前缀，候选正文不记录、不回传浏览器，也不局部修补。只有完整通过同一 contract 的候选才能返回；第二个候选仍不合规时整次失败。
- 同源路由继续使用 `no-store`、固定 DeepSeek HTTPS origin、拒绝重定向、服务端 Sensitive key、超时、尽力限流和 `PORTFOLIO_AI_ENABLED=false` 止血开关。无登录的 serverless 限流不构成费用硬上限，生产仍需 provider 余额/预算控制。
- AI 失败不影响确定性组合结构、今日贡献、持仓录入、行情、复制或本机数据；请求与回答均不得写入 IndexedDB、`localStorage`、导出或任何持仓真值。

## Consequences

### Positive

- 用户可以围绕真实数量、成本、现金和盈亏连续追问，不再受一次性固定模板限制。
- 行业与资产角色由模型完成语义识别，比例继续由本机真值计算，能同时获得解释能力与可审计数值。
- “机构式”分析被拆成当前可支持的快照维度和明确缺失的高级风险维度，避免展示伪精确的 Beta、相关性或估值。

### Negative

- 完整持仓和现金数据会经本站 Vercel 服务端发送给 DeepSeek，隐私边界显著大于 ADR-039；用户必须在首次调用前看到并确认。
- 无状态多轮需要重复发送快照和有限历史，增加 token、延迟和费用；长对话会被截断到最近轮次。
- 行业和工具角色依赖模型推断，可能分类错误；置信度与“AI 推断”标签不能被隐藏。

### Neutral

- IndexedDB current-only 真值、ADR-032 的结构/贡献公式、Alpaca 行情、USD/CNY 派生和两个复制目标均不改变。
- 当前仍不接登录、云会话、向量库、外部研究数据库或自动交易。

## Alternatives Considered

### 继续使用最小比例事实的一次性解读

隐私边界较小，但不能回答用户明确要求的成本、金额、现金和连续追问，也无法支持行业暴露的确定性回算，因此被取代。

### 直接把复制文本作为自由 Prompt 发送

实现较快，但字段缺少严格 schema、难以验证模型引用，也无法把分类安全映射回本机权重；不采用。

### 一次发送后在服务端保存会话

可以减少浏览器每次组装历史，但需要账户、数据库、保留策略和跨设备身份，这些都未获授权；当前使用短期浏览器内存。

### 直接引入机构风险模型

真实因子风险需要历史序列、基准、因子暴露和协方差等数据。当前资料不足，先交付诚实的 current-snapshot 分析；若以后加入数据源，另行确认费用、许可和口径。

## Verification

- contract 测试覆盖完整快照白名单、语义十进制、高精度小权重、金额/NAV、100 只上限、历史轮次/长度、额外字段和模式约束。
- provider 测试覆盖稳定快照前缀、真实多轮 messages、JSON Object、固定 V4 Flash、总超时、限流、空/截断/危险输出、一次完整候选重做与双重失败，以及每只持仓恰好一条分类。
- 本机聚合测试覆盖行业/角色权重、现金排除、缺价部分口径、未知/重复分类拒绝和 Decimal 未舍入汇总。
- 组件测试覆盖首次零请求、完整发送披露、同意、初始体检、行业标注、提问/连续追问、换行输入、有限历史、失败重试、父页自动刷新不打断已开始会话、重新体检使用最新快照、关闭清除、CNY 本机数字和无障碍焦点。
- `[实现事实 2026-08-15]` 最终提交 `7df9400` 已进入 GitHub `main` 与 Vercel Production；64 文件/518 测试及两项构建、合成初始/后续 provider schema v2 smoke、分类锁定、安全响应头和 390 px UI 通过。真实 iPhone、200% 文字与 VoiceOver 仍待设备验收；真实持仓请求体或回答不得进入自动化证据。

## Supersedes

本 ADR 取代 ADR-039 的最小事实包、一次性输出和“金额不得发送”决定。ADR-039 关于用户主动触发、服务端密钥、固定 provider、`no-store`、失败降级和不持久化的安全原则继续由本 ADR 承接。ADR-032 的确定性结构与今日贡献公式不变。

## References

- MSCI GICS：<https://www.msci.com/indexes/index-resources/gics>
- MSCI Barra Equity Factor Models：<https://www.msci.com/data-and-analytics/factor-investing/equity-factor-models>
- Morningstar Equity Style Box Methodology：<https://advisor.morningstar.com/Enterprise/VTC/MorningstarEquityStyleBoxMethodology.pdf>
- FINRA Concentration Risk：<https://www.finra.org/investors/insights/concentration-risk>
- DeepSeek Multi-round Conversation：<https://api-docs.deepseek.com/guides/multi_round_chat>
- DeepSeek Context Caching：<https://api-docs.deepseek.com/guides/kv_cache>
- DeepSeek JSON Output：<https://api-docs.deepseek.com/guides/json_mode/>
- `ADR-032-PORTFOLIO-STRUCTURE-AND-ABSOLUTE-DAILY-CONTRIBUTION.md`
- `ADR-039-EVIDENCE-BOUND-DEEPSEEK-PORTFOLIO-INTERPRETATION.md`
- `ADR-042-SEPARATE-PORTFOLIO-ANALYSIS-AND-AI-CHAT.md`
- `../01-PRD.md`
- `../04-TECHNICAL-SPEC.md`
