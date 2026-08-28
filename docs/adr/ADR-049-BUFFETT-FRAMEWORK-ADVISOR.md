---
artifact: adr
version: "1.0"
created: 2026-08-28
status: accepted
---

# ADR-049：将通用 AI 对话升级为巴菲特公开原则驱动的价值投资顾问

## Status

Accepted

Extended by ADR-050: the snapshot-only advisor remains available; a separate AAPL/MSFT official-source research pipeline adds SEC, Web Search, Evidence Ledger, deterministic calculations, and replay evals.

**Date:** 2026-08-28

**Decider:** 产品所有者

## Context

现有产品已经具备完整 current-only 组合快照、DeepSeek 服务端代理、强制严格函数输出、证据引用、多轮固定快照、数字本机重绘、密钥隔离和不持久化等 AI 系统能力。但 GitHub 简介只用“evidence-bound AI”概括，运行中的“AI 对话”也只是通用组合分析员，没有稳定、可检查的投资判断框架。

产品所有者明确要求：为了申请材料和产品能力展示，继续迭代这一部分，把它做成能直接提问的“巴菲特”式咨询系统，同时确保公开仓库不泄露 API key 或任何个人隐私。

直接让模型“扮演巴菲特”会制造本人身份、官方背书和伪造具体观点的风险。另一个根本限制是：当前快照只有持仓、成本、估值、盈亏、现金和行情元数据，没有一手财报、管理层、资本配置、所有者收益或内在价值证据。如果不显式设置证据门槛，“巴菲特风格”只会变成语气包装。

## Decision

- 用户可见产品名为“巴菲特框架顾问”。它是基于巴菲特公开价值投资原则的方法论模拟，不是 Warren Buffett 本人、发言人、伯克希尔·哈撒韦或关联服务。系统 prompt 与 UI 必须同时保留这一边界，不得生成“巴菲特会说/会做”类归因。
- 新增九个机器稳定 framework lens：`CIRCLE_OF_COMPETENCE`、`DURABLE_BUSINESS`、`MANAGEMENT_CAPITAL_ALLOCATION`、`OWNER_EARNINGS`、`FINANCIAL_STRENGTH`、`INTRINSIC_VALUE_MARGIN_OF_SAFETY`、`OPPORTUNITY_COST`、`TEMPERAMENT`、`EVIDENCE_GAP`。CHAT/FOLLOW_UP 每次回答必须选择一到三个，服务端 contract 严格检查合法值、数量和去重，界面显示中文标签。
- 框架只组织判断，不创造事实。涉及护城河、管理层、资本配置、所有者收益、负债、内在价值或安全边际，但当前请求没有对应一手证据时，回答必须明确停在证据不足，选择 `EVIDENCE_GAP`，并指出下一步要核验的公司文件或计算。本轮不新增外部基本面 API、网络搜索、RAG 或模型记忆回填。
- 对话入口仍保持打开零请求、输入框自动聚焦和发送才调用，不增加同意按钮或前置流程。但因为产品所有者本轮重新强调隐私，空态必须紧凑披露：发送后会将当前代码、数量、成本、估值、盈亏、现金和行情元数据经服务端交给模型；不发送身份、券商账号、设备、历史库或备份；关闭后清除会话。
- 共享 contract 升级为 schema v4，prompt version 为 `portfolio-value-advisor-v4`。旧 schema 响应不得被新客户端接受。原有严格字段、Decimal、evidence allowlist、生成数字/外部归因/交易指令拒绝、模式专属超时、一次完整重做和 `no-store` 边界不变。
- 公开快照新增 `.env.example` 占位符、更严格 `.gitignore` 和 `npm run public:check`。该门禁检查可发布文件中的常见凭据、客户端密钥前缀、环境文件、私钥、数据库、HAR/日志、组合备份和券商导出；CI 继续扫描 Git 历史。
- 本轮仍不生成直接买卖/加减仓指令、目标价、收益保证或涨跌预测，也不把“巴菲特”名字作为准确性或投资责任替代品。

## Consequences

### Positive

- 对话从通用 persona 变成可检查的判断系统：每个回答都显示它使用的框架视角与本机证据。
- “证据缺口”成为一等输出，避免把语言模型的公司常识伪装成当前基本面研究。
- GitHub 说明能展示真实的 AI 系统设计、产品取舍和安全边界，不再只是一句“接入 AI”。
- 直接提问和完整隐私披露同时成立，不需要用户通过额外确认页才开始。

### Negative

- 框架 lens 是系统约束，不能证明模型真正具有巴菲特的判断质量。还需要独立人类评审和坏案例 eval。
- 没有基本面 source layer 时，很多公司级问题必须拒绝给出结论；这是真实边界，也会让某些用户觉得回答不够“聪明”。
- 空态隐私文案比 ADR-042 的纯空消息区更长，需要在真实 iPhone 和文字放大下再验收。

## Verification

- 单元测试锁定 lens enum/标签完整性、非冒充边界和证据缺口政策。
- contract 测试覆盖空、未知、重复和超数量 framework lenses 整份拒绝。
- provider 测试验证强制函数包含 lens schema，system prompt 包含非本人、所有者收益和一手证据边界。
- 组件测试覆盖入口名、打开零请求、直接输入、方法论/隐私披露、lens 标签、本机证据和关闭清除。
- `npm run public:check`、完整自动化测试、TypeScript、领域构建、Next.js 生产构建和 Git 历史凭据扫描必须通过后才可发布。

## Amends

本 ADR 修订 ADR-042 的“AI 对话”名称、通用分析员 persona、schema/prompt v3 和“空态无任何说明”决定。ADR-042 的独立入口、打开零请求、发送才调用、固定首次快照、有限历史和关闭清除继续有效。ADR-041/044 的 current-only 完整数据 contract 和现金结构继续有效。

## References

- Berkshire Hathaway annual letters: <https://www.berkshirehathaway.com/letters/letters.html>
- Berkshire Hathaway Owner's Manual: <https://www.berkshirehathaway.com/owners.html>
- [ADR-041](ADR-041-FULL-CONTEXT-DEEPSEEK-PORTFOLIO-CONSULTATION.md)
- [ADR-042](ADR-042-SEPARATE-PORTFOLIO-ANALYSIS-AND-AI-CHAT.md)
- [SECURITY.md](../../SECURITY.md)
