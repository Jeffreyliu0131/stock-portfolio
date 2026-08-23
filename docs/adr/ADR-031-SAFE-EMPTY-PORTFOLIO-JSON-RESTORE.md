---
artifact: adr
version: "1.0"
created: 2026-08-09
status: amended
---

# ADR-031：只允许把 current-only JSON v2 原子恢复到空组合

## Status

Amended by ADR-045: strict v2 semantics remain, but Sites restores to an empty account D1 current rather than IndexedDB.

**Date:** 2026-08-09

**Decider:** 产品所有者

## Context

股票与 IBKR USD 现金只保存在当前浏览器 IndexedDB。手动 JSON v2 导出已经能把 current 股票快照与 current 现金快照交给用户保管，但只有导出、没有受控恢复时，副本不能解决误删浏览器数据或换到一个空安装后的自助恢复需求。

恢复会直接写入本地唯一真值。若允许把文件合并到现有组合、覆盖同名标的、分别写股票与现金，或把缓存和内部历史一并导入，用户很难在写入前判断结果，也可能得到股票成功而现金失败的半恢复状态。因此首个恢复能力需要缩小到可证明安全的边界。

## Decision

- 恢复来源只接受本产品当前 `format` 与 `formatVersion=2` 的 JSON，且只读取导出文件中的 current 股票快照和 current IBKR USD 现金快照。旧版本、未知格式、字段缺失或多余、无效十进制、时间或 revision 一律拒绝。每个标的必须通过 P0 的 USD 美国上市股票/ETF 校验；同一规范标的重复，或同一规范 symbol 同时落在多个受支持市场，都视为有歧义并拒绝整份文件。
- 生成 JSON v2 时执行与恢复相同的受支持标的、规范重复与同 symbol 多市场校验；当前本机数据若不满足恢复契约，则停止生成并明确报错，不能把不可恢复的文件报告为成功副本。
- 选中文件后先在本机完成严格解析和预览，展示导出时间、股票/输入数量、股票数量与剩余成本、现金余额与 NAV 等会改变恢复判断的信息；用户完成第二次明确确认前不得写入。
- 恢复目标必须是完全空组合：`position_batches_v2` 和 `cash_accounts_v3` 同时为空。任一 store 已有记录时整次拒绝；不提供合并、覆盖、按标的选择或“以备份为准”。
- 空目标检查和股票、现金写入必须位于同一个 IndexedDB `readwrite` 事务内。事务开始后再次检查两个 store；任何校验、竞争或写入失败都中止事务，最终写入数必须为零。两个并发恢复最多一个成功。
- 源文件中的 revision 只用于验证备份结构合法，不继承为本地并发版本。每个恢复后的股票与现金都创建新的本地 current，固定 `revision=1`、`nextRevision=2`、`previous=null`；后续本地修改从 revision 2 继续。源 `savedAt` 与原始 current 内容继续保留，不能把来源设备的 revision 当作本设备历史。
- `CASH_BALANCE_FALLBACK` 只在 `netAssetValue = balance` 时合法；来源标为 fallback 却携带不同 NAV 的文件整份拒绝。
- 不恢复股票或现金 previous、录入草稿、行情缓存、汇率缓存、legacy 券商备份、outbox、同步游标或其他内部状态。恢复不上传文件、不调用 Vercel 持仓接口，也不引入登录、云备份或跨设备同步。
- 持久存储状态、最近生成 JSON 时间和最近成功恢复时间只作为设备风险提示。状态区分 `persistent`、`best-effort`、`unsupported` 与 `unknown`；`persisted()` 或 `persist()` 抛错、属性读取异常或返回无法确认的结果时必须显示 `unknown`，不能称为“已拒绝”或“未授予”。生成时间不能证明用户已经把文件保存到 App 外，浏览器授予持久存储也不能替代外部副本。

## Consequences

### Positive

- 用户可以在一个空安装中恢复当前股票与现金，同时避免已有组合被静默改变。
- 股票和现金共享事务，失败时不会出现半恢复；事务内空目标复查也覆盖多标签页或并发操作竞争。
- 严格格式和 current-only 边界让预览、验收与未来格式迁移保持可审计。

### Negative

- 已有任何股票或现金时都不能恢复；用户必须自行决定保留当前数据还是在其他空环境恢复。
- JSON v1、手工编辑文件和未来未知版本不会被自动兼容，需要单独的迁移决定。
- 当前能力不能恢复历史版本、草稿、行情或设备间持续同步。
- 来源 revision 不被保留为本地 revision；跨设备版本序列在恢复点重新从 1 开始。

### Neutral

- IndexedDB 仍是当前浏览器的本地真值；JSON 是用户自行保管的副本，恢复成功不会改变云端或其他设备。
- 本决定不改变持仓聚合、成本、行情、汇率或现金利息公式。

## Alternatives Considered

- **把备份合并到现有组合：** 拒绝。相同标的如何合并 revision、输入和现金记录没有无歧义规则，并会把恢复变成新的持仓修改语义。
- **允许整组合覆盖：** 拒绝。覆盖会删除当前唯一真值，需要独立的可恢复删除与冲突设计。
- **股票和现金分别恢复：** 拒绝。任何一侧失败都会产生用户无法从原文件推断的半恢复状态。
- **同时导入 previous、草稿和缓存：** 拒绝。这些不是用户确认的当前资产真值，缓存还可能把旧行情伪装成恢复后的新数据。
- **自动备份或云同步：** 延后。需要账户、隐私、留存、冲突、费用和跨设备恢复的独立决定。

## References

- `ADR-012-INDEXEDDB-LOCAL-P0.md`
- `ADR-018-MANUAL-CURRENT-POSITION-JSON-EXPORT.md`
- `ADR-023-IBKR-USD-CASH-ASSET.md`
- `../01-PRD.md`
- `../02-DOMAIN-AND-CALCULATIONS.md`
- `../05-ACCEPTANCE-CRITERIA.md`
