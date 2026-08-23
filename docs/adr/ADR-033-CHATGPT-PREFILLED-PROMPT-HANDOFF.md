---
artifact: adr
version: "1.0"
created: 2026-08-09
status: amended-by-adr-038
---

# ADR-033：复制后打开 ChatGPT 待发送 Prompt

## Status

Amended by ADR-038

**Date:** 2026-08-09

**Decider:** 产品所有者

## Context

ADR-021 最初把复制边界限定为系统剪贴板，由用户自行切换到任意目标粘贴；ADR-026 随后把文本压缩为适合 AI 判断的组合摘要与紧凑持仓表。产品所有者现已明确修订这一交付方式：现有前 5、前 10、全部和单只入口在用户完成最终选择后，都应直接打开 iPhone 上的 ChatGPT，并把刚生成的同一文本放入输入框等待发送。

这项体验仍要保留用户最后确认：PWA 不能替用户发送 Prompt，也不需要 OpenAI API、API key 或把回答带回产品。系统剪贴板仍有必要，因为 iOS 是否由 ChatGPT App 接管、网页是否正确预填以及长 URL 是否完整，取决于 App、OS、登录状态和 ChatGPT 外部行为。

`[外部事实 2026-08-09]` OpenAI 当前发布的 `chatgpt.com` Apple App Site Association 把根路径且 `prompt` 参数非空的 URL 列为 ChatGPT iOS App 的 Universal Link 匹配项，因此本产品可以使用官方 HTTPS origin 请求 App 接管。该配置不等于对预填结果、待发送状态和可接受长度的长期产品 API 承诺；这些外部行为仍必须在真实 iPhone 上验证。

## Decision

- 前 5、前 10、全部和单只四类最终选择都使用同一条交付路径，不保留任何“只复制、不跳转”的范围。
- 系统从当前页面内存数据生成一次低噪音 USD 事实文本；该字符串同时传给系统剪贴板和 ChatGPT URL，不重新读取 IndexedDB，也不为两个目标分别生成内容。
- 浏览器在同一用户动作、第一次异步等待前先调用剪贴板写入，再同步导航到：

  ```text
  https://chatgpt.com/?prompt=<encodeURIComponent(同一文本)>
  ```

- 使用 OpenAI 官方 HTTPS origin，不使用未公开的 `com.openai.chat://` 自定义 scheme。iOS 接管 Universal Link 时进入 ChatGPT App；未接管时允许回落到 ChatGPT 网页，不通过定时器猜测 App 是否打开，也不循环跳转。
- ChatGPT 中的内容必须保持待发送，由用户核对后手动发送。PWA 不自动点击发送、不调用 OpenAI API、不持有 ChatGPT access token、不轮询或接收回答，也不把回答写回 PWA。
- 剪贴板不可用或被拒绝时仍尝试 ChatGPT 导航，并保留同一文本的只读手工复制路径。ChatGPT 未预填、截断或路由失败时，剪贴板或只读文本是手工粘贴回退；界面不得误报已经发送。
- 自动复制成功只通过短暂、自动消失且不参与布局的状态 Toast 反馈，不在总仓位总览下方写入持续页面提示；页面隐藏期间暂停关闭计时，使用户返回 PWA 后仍有机会看到结果。手工回退继续由复制弹层承载。
- 复制文本不经过本产品或 Vercel 服务端，但导航会把编码后的 Prompt 交给 `chatgpt.com`。完整 URL 属于新的外部数据边界，不得进入本站日志、分析事件、错误回报、持久化缓存、截图或测试证据。
- 真实 iPhone Safari 与主屏幕 PWA 必须覆盖 App 接管、网页回落、未安装/未登录、中文换行、短文本、实际规模长文本、截断识别和手工回退。验证只使用合成资产。

## Consequences

### Positive

- 用户从任一现有复制入口完成选择后，可以直接在 ChatGPT 输入框核对资料，省去切换 App 和首次粘贴。
- Prompt 仍由用户手动发送，避免在用户看到完整资料前发起模型请求。
- 不增加 OpenAI API 账单、密钥、服务端代理、回调或回答存储；用户继续使用自己的 ChatGPT 会话环境。
- 剪贴板和手工文本保留，使外部路由或预填失败时仍能完成任务。

### Negative

- 持仓文字会进入 ChatGPT URL 参数，扩大了相对于纯剪贴板的隐私暴露面；浏览器历史、系统诊断或第三方工具若记录完整 URL，可能泄露资产资料。
- `?prompt=`、App 接管和 URL 长度依赖 OpenAI 与 iOS 的外部行为，未来可能变化；网页回落不等于失败，也不能保证一定打开原生 App。
- 较长的“全部资产”文本经百分号编码后会显著增长；只有真实设备验证可以确定目标版本下是否完整预填。

### Neutral

- 该决定只改变文本交付方式，不改变复制范围、排序、字段、USD 真值、现金口径、IndexedDB 或行情计算。
- “打开 ChatGPT”不等于调用 OpenAI API，也不使 ChatGPT 回答成为 PWA 数据；用户手动发送后的处理、额度与数据控制属于 ChatGPT 账户边界。

## Alternatives Considered

### 继续只复制到剪贴板

隐私面最小且不依赖外部路由，但仍要求用户切换 App、建立对话并粘贴，已不满足产品所有者确认的一步到达待发送 Prompt。

### 使用 `com.openai.chat://` 自定义 scheme

该 scheme 只见于非官方用法，未作为稳定公开接口记录。选择官方 HTTPS origin 可以保留网页回落，并避免把 P0 绑定到未公开 scheme。

### 调用 OpenAI API 并在 PWA 内展示回答

可以完全控制请求和返回，但会新增独立计费、API key、服务端代理、数据留存、安全和投资建议边界，也无法实现“在 ChatGPT App 中等待用户发送”的目标。

### 调用系统分享面板或 iOS 快捷指令

分享面板需要额外选择目标；快捷指令需要用户预先安装和维护。两者均增加步骤，不作为本次默认路径。

## Verification

- 单元测试固定剪贴板调用发生在同步导航之前，导航不等待剪贴板 Promise；剪贴板成功、缺失和拒绝都只导航一次。
- URL 测试固定官方 HTTPS origin，并验证中文、换行和保留字符经编码后可完整还原。
- 组件测试覆盖前 5、前 10、全部和单只入口、待发送文案、重复操作保护和手工回退。
- 真实 iPhone 分别记录 Safari 与主屏幕 PWA、iOS/ChatGPT 版本、App 接管或网页回落、登录状态、Prompt 完整性、是否保持待发送，以及失败后的手工粘贴结果。
- 自动化通过只能证明本产品构造和触发路径，不能证明 ChatGPT App 的外部接管或预填稳定性。

`[实现事实 2026-08-09]` 模块、所有复制入口和短暂成功 Toast 已接入；完整 `npm run check` 通过 42 个测试文件中的 388 项测试、TypeScript、领域构建和 Next.js 生产构建。真实 iPhone 外部行为验收尚未完成。

## Amends

本 ADR 修订 ADR-021 的“不跳转第三方 App、由用户自行切换粘贴”决定，并修订 ADR-026 对交付边界的延续说明。ADR-021 与 ADR-026 中的范围、排序、单只组合背景、低噪音字段、事实文本、缺价语义、剪贴板副本、手工回退、不写持仓和不预设 AI 问题继续有效。

## Amended by

ADR-038 恢复独立的“仅复制持仓资料”目标。本文关于 ChatGPT HTTPS、待发送 Prompt、剪贴板复用、外部数据边界和设备验证的决定继续约束“复制并打开 ChatGPT”入口；“所有范围都必须跳转、不保留普通复制”的决定不再有效。

## References

- `ADR-021-LOCAL-PORTFOLIO-TEXT-COPY.md`
- `ADR-026-AI-FOCUSED-PORTFOLIO-COPY.md`
- `../01-PRD.md`
- `../03-UX-SPEC.md`
- `../05-ACCEPTANCE-CRITERIA.md`
- OpenAI `chatgpt.com` Apple App Site Association: <https://chatgpt.com/.well-known/apple-app-site-association>
- Apple, Supporting Universal Links in Your App: <https://developer.apple.com/documentation/xcode/supporting-universal-links-in-your-app>

外部行为最后核验：2026-08-09。
