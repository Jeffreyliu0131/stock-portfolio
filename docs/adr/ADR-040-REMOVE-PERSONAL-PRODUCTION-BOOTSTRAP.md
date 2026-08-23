---
artifact: adr
version: "1.0"
created: 2026-08-15
status: accepted
---

# ADR-040：移除个人 Production 固定启动数据

## Status

Accepted

**Date:** 2026-08-15

**Decider:** 产品所有者

## Context

ADR-036 为单人零操作效果把固定聚合股票与现金放入公开客户端，并在 Production 首次加载空 current 时自动恢复。产品所有者在检查跨设备现象后重新评估了这个边界，认为公开 bundle 可检索固定资产数值的风险不再可接受，并明确要求移除 Production bootstrap。

IndexedDB 仍是每个浏览器来源的 current 真值。移除自动启动路径不需要、也不应该清理已有资产或独立历史数据库。

## Decision

- 删除包含固定股票数量、成本和 IBKR USD 现金的客户端载荷模块，以及对应的载荷真值测试。
- `PortfolioController` 启动只读取现有股票和现金 current；不再检查或写入个人 bootstrap 标记，不再调用 `restoreCurrentBackup()` 自动创建资产。
- 全新 Production 浏览器来源在 current 股票与现金均为空时显示真实空组合。用户可以手工录入，或使用 ADR-031 定义的 JSON v2 严格预览、二次确认和空组合单事务恢复。
- 已有浏览器来源中的股票 current/previous、现金 current/previous、草稿、行情/汇率缓存、独立历史数据库和旧 bootstrap 标记全部保留原样。本次变更不执行删除、迁移、schema 升级或补写。
- 本决定不增加登录、云数据库、云同步或跨设备恢复。不得为了重现零操作效果再次把个人资产放入公开客户端。

## Consequences

### Positive

- 新客户端 bundle 不再包含可用于还原个人组合的固定数值。
- 首页启动行为与 ADR-012 的每来源 IndexedDB 真值一致，新来源不再因应用代码获得个人持仓。
- 已有 iPhone、Mac 或其他来源的本机资产不因移除功能丢失。

### Negative

- 全新浏览器、新域名或清除网站数据后不会自动出现个人组合；用户需手工录入或使用自行保存的 JSON v2 副本。
- 已经发布的旧客户端产物和 Git 历史不会因新提交自动消失；需继续保持仓库私有性、凭据安全和发布产物访问边界。

### Neutral

- 旧 bootstrap 标记可以留在已有来源的 `localStorage`；新代码不再读取它，它也不是资产真值。
- JSON v2 空组合恢复、持仓计算、行情、汇率、现金利息和 DeepSeek 边界都不变。

## Verification

- production-like Controller 在全新来源中发布空组合，`restoreCurrentBackup()` 零调用且 `localStorage` 零写入。
- 固定载荷模块、Controller import/调用和载荷真值测试不存在。
- 对运行源码与 Next.js 客户端构建产物扫描旧标记、载荷识别字段和固定资产数值，结果为空。
- 已有 current 的浏览器回归继续只读原资产；代码 diff 不包含 IndexedDB schema、迁移或清理逻辑变更。
- 发布后用隔离的全新 Production 来源验证空组合，再用预置合成 current 的来源验证数据不变。

`[实现事实 2026-08-15]` 功能提交 `058d3f8` 已进入 GitHub `main` 与 Vercel Production。本地完整门禁通过 59 个测试文件、490 项测试、TypeScript、领域构建和 Next.js 生产构建，生产依赖审计为 0；运行源码、本地产物与生产 17 个首页静态 chunk 的旧标记、识别符及固定载荷数值扫描为空。隔离新来源首次/重复加载保持零股票、零现金、零旧标记和零历史库；遗留标记保留但不触发恢复；合成既有股票/现金 current 刷新前后逐字段不变且不新写标记。首页、历史重定向、manifest、公开标的/行情/汇率和控制台 smoke 通过；真实 iPhone 仍待验收。

## Supersedes and amends

- 取代 ADR-036 的全部运行决定。
- 修订 ADR-037 中“个人 Production 启动迁移只恢复 current”的部分；历史功能停用和既有历史数据保留继续有效。
- ADR-031 的用户主动 JSON v2 空组合恢复继续有效。
