---
artifact: adr
version: "2.0"
created: 2026-07-29
updated: 2026-07-30
status: superseded
---

# ADR-004：未来托管与云数据方案

## Status

Superseded by ADR-045

**Reconfirmation required:** 2026-07-30

## Context

统一组合 PWA 需要一个服务端边界来保护 Alpaca 密钥，但这不自动要求云数据库、账户体系或跨设备同步。

旧方案曾把 Next.js、Vercel、Supabase、认证、RLS 和云端账本绑成一条路线。产品所有者已经单独确认 Next.js App Router + React 作为 P0 Web runtime，见 ADR-013，并由 ADR-014 确认 Vercel 生产托管。认证、云数据库、云恢复和跨设备同步仍未确认，也没有对应外部资源。

## Proposal

Web/PWA 与服务端行情代理托管已由 ADR-014 完成。若用户以后确认需要登录或云恢复，再分别评估：

- 是否保存持仓到云端；
- 身份认证、用户隔离、备份与恢复；
- 本地数据和云端数据的同步及冲突规则；
- 成本、配额、隐私和迁移路径。

Supabase 或其他云数据库只有在云数据进入范围后再评估。Vercel 部署本身不构成云数据库选择。

## Constraints

- 创建账号、云资源、付费服务或部署都需要用户另行授权；
- Alpaca secret 只能存在于服务端；
- 任何云模型都只能在统一组合之外增加所有者隔离；组合内部仍只按 `instrument` 聚合，不得重新引入券商维度；
- 在云方向未确认前，本地 USD PWA UI 仍可继续实现。

## Decision needed

见 `../08-OPEN-QUESTIONS.md` 中关于云同步、认证和恢复的问题。回答之前，本 ADR 的云数据部分不构成实现要求。
