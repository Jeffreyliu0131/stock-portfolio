---
artifact: adr
version: "1.0"
created: 2026-07-30
status: superseded
---

# ADR-012：P0 使用 IndexedDB 本地保存

## Status

Superseded by ADR-045 for Sites Production. This ADR remains the legacy Vercel origin data-protection record.

用户可见历史恢复入口与删除行为由 ADR-017 修订：首页不展示历史恢复，删除经第二次确认后移除目标标的当前/上一版本和该标的草稿。

**Date:** 2026-07-30
**Decider:** 产品所有者

## Context

P0 需要在刷新和重新打开后恢复当前持仓快照，但不需要登录、云同步或跨设备。仓库已有 IndexedDB adapter，可作为本地原型的存储基础；现有 outbox 和同步端口不代表云能力进入产品范围。

快照替换是覆盖性操作，因此本地保存必须同时满足原子性与恢复要求。

## Decision

- P0 各标的当前持仓快照和恢复版本保存在浏览器 IndexedDB。
- P0 不提供登录、云同步、跨设备同步或云端备份。
- 保存某标的新批次时，先完整写入新版本，再原子切换该标的活动版本；失败不得留下半成功状态，也不得影响其他标的。
- 每个标的上一成功版本必须保持可恢复，不能在替换时同步销毁。
- 现有同步端口可以保留为未接入实现资产，但 P0 页面和数据写入不得依赖云端。
- IndexedDB schema 变化必须提供确定性迁移或明确恢复路径，不能静默丢弃已有数据。

本决定只约束 P0 本地数据真值。生产托管随后由 ADR-014 选择 Vercel，但没有增加云数据库、同步或备份；导入真实持仓仍由用户自行决定并承担本地数据风险。

## Consequences

### Positive

- 无需账户体系即可完成本地闭环；
- 刷新和重启后可以恢复持仓；
- 复用现有本地 adapter，减少首个可操作切片的外部依赖。

### Negative

- 卸载、清除网站数据或设备丢失可能造成数据不可恢复；
- P0 不支持换机或多设备；
- Safari 的 schema 升级、容量和数据清理行为仍需真实设备验证。
- Preview、Production、localhost 和未来自定义域名是不同来源，IndexedDB 数据互不共享。

## Supersedes

本 ADR 取代 ADR-009 在 P0 中的“本地 + 云端复制”方向。以后若加入登录或云同步，需要新的产品决定和 ADR。

## References

- `ADR-009-LOCAL-FIRST-CLOUD-REPLICATED-LEDGER.md`
- `ADR-011-CURRENT-POSITION-SNAPSHOT-BATCH.md`
- `../04-TECHNICAL-SPEC.md`
- `../06-TEST-STRATEGY.md`
