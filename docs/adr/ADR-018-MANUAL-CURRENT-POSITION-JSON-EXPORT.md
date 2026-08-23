---
artifact: adr
version: "1.0"
created: 2026-07-30
updated: 2026-08-09
status: amended-by-adr-023-extended-by-adr-031
---

# ADR-018：手动导出当前持仓 JSON 副本

## Status

Amended by ADR-023; Extended by ADR-031

**Date:** 2026-07-30
**Decider:** 产品所有者

## Amendment 2026-08-02

ADR-023 保留本 ADR 的只读、本地生成、无上传和 current-only 边界，并把 JSON 契约从 v1 升为 v2：顶层在 `snapshots[]` 之外增加可选的当前 `cash` 快照。2026-08-02 当时的范围尚未包含导入动作，这项边界后来由 ADR-031 扩展。股票仍只从 `position_batches_v2` 读取 current；现金从独立 `cash_accounts_v3` 只读。现金功能本身需要 IndexedDB v3 追加 store，但导出动作仍不提升 schema、不执行任何写操作。

## Extension 2026-08-09

ADR-031 保留本 ADR 的导出 contract、只读生成、current-only 文件和无上传边界，并增加受控的 App 内恢复：只接受 JSON v2，只恢复到股票与现金都为空的组合，不合并或覆盖。源 revision 只校验；恢复创建新的本地 current，统一 `revision=1`、`nextRevision=2`、`previous=null`。这项扩展不改变导出文件仍保留来源 revision 与 `savedAt` 的事实。

## Context

持仓真值按 ADR-012 保存在当前浏览器来源的 IndexedDB。Vercel 托管应用代码和服务端行情代理，但没有持仓数据库、上传接口或账户体系，因此不能直接查看或备份手机中的 IndexedDB。

产品所有者希望在继续修改产品前，先能把当前手机里已经保存的持仓复制成 JSON 文件，避免清除网站数据、设备故障或后续错误修改造成唯一副本丢失。该需求在本 ADR 做出时是用户主动触发的本地文件导出，不要求云同步，当时尚未确认 App 内恢复；2026-08-09 的恢复扩展以 ADR-031 为准。

## Decision

- 首页提供“备份”操作，可访问名称为“导出 JSON 备份”。
- 导出只调用 `PositionRepository.listSnapshots()`，读取每个标的当前活动 `PositionSnapshot`。
- IndexedDB adapter 使用 `position_batches_v2` 上的单个 `readonly` transaction。导出不调用任何持仓、草稿、撤销或删除写操作，也不提升 IndexedDB schema 版本。
- JSON 顶层契约为：

```text
format
formatVersion
exportedAt
snapshots[]
```

- `snapshots` 保留 current snapshot 的 `revision`、`savedAt` 和完整 `batch`；`batch` 保留标的、可选显示名称及全部原始输入。
- 数量、成本和其他十进制真值继续使用字符串；不得转换为 JSON number 或展示舍入值。
- 快照按规范标的稳定排序。同一标的出现两个 current snapshot 时拒绝生成文件。
- 文件不包含 `previous`、持仓草稿、录入页草稿、上一有效行情缓存、legacy 券商备份、outbox 或同步游标。
- 浏览器支持文件分享时，优先通过 Web Share 交付 `application/json` 文件；不支持文件分享或发生非取消型分享失败时，回退为本地 Blob 下载。用户主动关闭分享面板时不再触发下载。
- 导出没有服务端上传路径，文件内容不发送到 Vercel。用户在系统分享面板中选择“存储到文件”、iCloud Drive 或其他目标属于用户主动管理文件，不构成产品提供的云备份或同步。
- App 只按 ADR-031 严格解析该 JSON 并执行空组合 current-only 恢复；仍不执行已有组合合并/覆盖、无人值守自动恢复、定时备份、云备份或跨设备恢复。

## Consequences

### Positive

- 用户可以在当前浏览器数据仍可读取时保存一份独立、可读、版本化的当前持仓副本。
- 导出复用已验证的 current snapshot contract，不把展示缓存、行情状态或历史实现变成第二套持仓真值。
- 只读事务、无 schema 变化和无上传边界降低了为了备份而损坏当前数据或扩大隐私面的风险。

### Negative

- 文件包含私人持仓数量和成本，离开 App 后由用户负责保存、访问控制和删除。
- 分享或下载动作完成不证明用户已经把文件保存到持久位置，界面必须要求用户自行确认。
- 只有 ADR-031 定义的 JSON v2 空组合恢复属于 App 内路径；文件存在不代表可以合并、覆盖、恢复历史或跨设备持续同步。
- 只导出当前活动快照，不能用来恢复上一版本、未保存草稿、行情缓存或旧券商账本。

## Constraints

- 用户导出的真实 JSON 不得进入 Git、测试 fixture、构建产物、日志、截图、工单或聊天记录。
- 导出成功、用户取消、分享失败或生成失败都不得修改任何 IndexedDB 记录。
- 任何超出 ADR-031 的未来导入都必须在实施前决定格式迁移、已有组合合并/覆盖、冲突处理与恢复验收。
- 任何未来自动备份、云端持仓或跨设备恢复都必须重新确认认证、隐私、托管、成本和同步边界，并新增或取代相应 ADR。
- 生产发布继续服从 ADR-014；本 ADR 不授权创建云资源、部署、提交或上传真实数据。

## Relationship to earlier ADRs

- 本 ADR 扩展 ADR-012 的本地数据风险缓解方式，不改变 IndexedDB 当前真值，也不取代 ADR-012。
- ADR-014 的 Vercel 无持仓数据库边界保持不变。
- ADR-004 关于认证、云数据、云恢复和跨设备同步的部分继续保持 Proposed。
- ADR-009 继续保持 Superseded；其中历史“本地 + 云端复制”方向没有恢复。

## Verification

`[实现事实 2026-07-30]`

- 已增加版本化 JSON 生成和稳定文件名实现；
- 已增加十进制字符串、稳定排序、重复 current snapshot 拒绝、空组合和 current-only 读取自动化测试；
- 已增加 Web Share 文件优先、用户取消和 Blob 下载回退自动化测试；
- 已增加首页备份按钮、生成中状态、重复点击保护与隐私说明自动化测试；
- TypeScript typecheck、领域构建、Next.js 生产构建和 27 个测试文件中的 233 项自动化测试通过；
- Chrome 合成数据验证了 320/390 px、200% 根字号、下载 JSON v1 及导出前后 `position_batches_v2` 原始记录一致；
- Production deployment 和真实 iPhone 的系统分享、文件保存与下载回退尚未验证。

## References

- `ADR-004-CLOUD-APPLICATION-STACK.md`
- `ADR-009-LOCAL-FIRST-CLOUD-REPLICATED-LEDGER.md`
- `ADR-012-INDEXEDDB-LOCAL-P0.md`
- `ADR-014-VERCEL-GITHUB-DEPLOYMENT.md`
- `ADR-031-SAFE-EMPTY-PORTFOLIO-JSON-RESTORE.md`
- `../01-PRD.md`
- `../04-TECHNICAL-SPEC.md`
- `../05-ACCEPTANCE-CRITERIA.md`
- `../08-OPEN-QUESTIONS.md`
