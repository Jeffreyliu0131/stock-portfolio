---
artifact: adr
version: "1.0"
created: 2026-08-28
status: accepted
---

# ADR-050：以 AAPL/MSFT 薄片建立可审计的巴菲特研究流水线

## Status

Accepted

**Date:** 2026-08-28

**Decider:** 产品所有者

## Context

ADR-049 将通用对话升级为非冒充的价值投资框架顾问，但它仍只读取 current-only 组合快照，没有联网检索、SEC/公司 IR 一手来源、claim-level provenance 或真实检索 eval。单纯增加 Web Search 会扩大未验证信息，不能证明系统能力。

## Decision

- 新增独立“巴菲特研究系统”，首版只支持 AAPL 与 MSFT。原组合体检与框架对话不被取代。
- 研究请求只发送发行人代码与用户问题；不发送持仓数量、成本、价格、现金、账号、历史库或备份。
- SEC submissions/XBRL 是定期报告和数字的 canonical source。OpenAI Responses `web_search` 只能检索 SEC 与发行人官方域名，负责发现当前官方资料，不替代确定性事实。
- Prompt 拆成有工具的官方网页研究与无工具的 Evidence Ledger 综合。最终综合不能继续联网或使用模型记忆补事实。
- 每条事实、推断和 lens finding 必须引用当前 Evidence Ledger 中存在的 id。精确数字由界面从定期报告事实/派生指标渲染，不进入模型自然语言。
- `operating cash flow - total capital expenditures` 只标为 free-cash-flow proxy。维持性资本支出与增量营运资本未拆分时，所有者收益必须为 `ASSUMPTION_REQUIRED`。
- DeepSeek v4 顾问继续作为无检索基线。首版不在同一次研究中混用 OpenAI 与 DeepSeek。
- 公开仓库只保留 placeholder、synthetic fixtures 和 replay eval。未实行真实 provider 调用时，不得声称 live retrieval/citation quality。

## Consequences

### Positive

- 用户可见完整链路：一手来源、指标、假设缺口、框架判断、反证、未知与 Research Trace。
- 搜索和最终结论被分离，网页 prompt injection 不能直接改变最终系统指令。
- 研究请求不携带组合隐私事实。

### Negative

- 同一次研究包含 Web Search 与结构化综合两次模型调用，费用和延迟高于现有对话。
- SEC XBRL 标签存在公司差异；首版只对两家发行人作精确支持。
- 合成 replay 通过不等于真实搜索质量。

## Verification

- contract 测试覆盖受支持 issuer、额外字段、未知 evidence、生成数字、交易指令、冒充与重复 lens。
- SEC adapter 测试覆盖 User-Agent、两类端点、filing URL、XBRL 事实与结构不足时失败。
- OpenAI replay 测试覆盖官方域名、`store:false`、无组合字段、完整 source list、无工具最终综合与严格 schema。
- 独立 eval 命令和 UI 测试覆盖指标、来源、未知、反证和 trace。

## Amends

本 ADR 扩展 ADR-049，但不取代其非冒充、证据缺口、不提供交易指令和无资产写入边界。
